import { describe, expect, it } from 'vitest';

import type { Holding } from '@/core/portfolio';

import {
  MAX_HOLDINGS,
  addHolding,
  parseHoldings,
  removeHolding,
  serializeHoldings,
  updateHolding,
} from './portfolio-store';

function holding(patch: Partial<Holding> = {}): Holding {
  return {
    code: 'FPT',
    quantity: 500,
    costPrice: 78_000,
    buyDate: '2025-01-02',
    beta: 1.1,
    ...patch,
  };
}

describe('parseHoldings — đọc từ máy người dùng, không tin gì cả', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const list = [holding()];
    expect(parseHoldings(serializeHoldings(list))).toEqual(list);
  });

  it('không có gì thì trả danh sách rỗng', () => {
    expect(parseHoldings(null)).toEqual([]);
    expect(parseHoldings('   ')).toEqual([]);
  });

  it('JSON hỏng hoặc không phải mảng thì trả rỗng chứ không ném lỗi', () => {
    expect(() => parseHoldings('{hong')).not.toThrow();
    expect(parseHoldings('{hong')).toEqual([]);
    expect(parseHoldings('{"code":"FPT"}')).toEqual([]);
  });

  it('BỎ HẲN mã thiếu số lượng hay giá vốn, không điền 0 vào chỗ trống', () => {
    const raw = JSON.stringify([
      { code: 'FPT', quantity: 500, costPrice: 78000 },
      { code: 'HPG', costPrice: 25000 },
      { code: 'VNM', quantity: 0, costPrice: 90000 },
      { code: '', quantity: 100, costPrice: 1000 },
    ]);

    expect(parseHoldings(raw).map((h) => h.code)).toEqual(['FPT']);
  });

  it('mã được viết hoa và cắt ngắn', () => {
    expect(parseHoldings('[{"code":" fpt ","quantity":1,"costPrice":1}]')[0]?.code).toBe('FPT');
  });

  it('beta lạ thành null chứ không thành 0 — 0 nghĩa là không biến động theo thị trường', () => {
    const parsed = parseHoldings('[{"code":"FPT","quantity":1,"costPrice":1,"beta":"cao"}]');
    expect(parsed[0]?.beta).toBeNull();
  });

  it('cắt ở trần số mã', () => {
    const many = Array.from({ length: MAX_HOLDINGS + 10 }, (_, i) => ({
      code: `M${i}`,
      quantity: 1,
      costPrice: 1,
    }));
    expect(parseHoldings(JSON.stringify(many))).toHaveLength(MAX_HOLDINGS);
  });
});

describe('addHolding', () => {
  it('thêm mã mới vào cuối', () => {
    expect(addHolding([holding()], holding({ code: 'HPG' })).map((h) => h.code)).toEqual([
      'FPT',
      'HPG',
    ]);
  });

  it('mua thêm cùng mã thì cộng dồn và tính lại giá vốn bình quân', () => {
    // 500 CP giá 78.000 + 500 CP giá 82.000 → 1.000 CP giá vốn 80.000.
    const list = addHolding(
      [holding({ quantity: 500, costPrice: 78_000 })],
      holding({ quantity: 500, costPrice: 82_000, buyDate: '2025-06-01' }),
    );

    expect(list).toHaveLength(1);
    expect(list[0]?.quantity).toBe(1_000);
    expect(list[0]?.costPrice).toBe(80_000);
  });

  it('giữ ngày mua sớm nhất — đó mới là lúc khoản đầu tư bắt đầu', () => {
    const list = addHolding(
      [holding({ buyDate: '2025-01-02' })],
      holding({ buyDate: '2025-06-01' }),
    );
    expect(list[0]?.buyDate).toBe('2025-01-02');
  });

  it('bỏ qua mã rỗng hoặc số lượng không dương', () => {
    const list = [holding()];
    expect(addHolding(list, holding({ code: '  ' }))).toEqual(list);
    expect(addHolding(list, holding({ code: 'HPG', quantity: 0 }))).toEqual(list);
    expect(addHolding(list, holding({ code: 'HPG', costPrice: -1 }))).toEqual(list);
  });

  it('không sửa mảng gốc', () => {
    const list = [holding()];
    addHolding(list, holding({ code: 'HPG' }));
    removeHolding(list, 'FPT');
    expect(list).toHaveLength(1);
  });

  it('dừng ở trần số mã', () => {
    const full = Array.from({ length: MAX_HOLDINGS }, (_, i) => holding({ code: `M${i}` }));
    expect(addHolding(full, holding({ code: 'MOI' }))).toHaveLength(MAX_HOLDINGS);
  });
});

describe('updateHolding', () => {
  /*
   * Ca quan trọng nhất của cả nhóm này.
   *
   * `addHolding()` cố ý CỘNG DỒN — "thêm FPT lần nữa" nghĩa là mua thêm. Nếu việc sửa cũng đi
   * qua hàm ấy thì sửa 500 CP thành 300 CP sẽ ra 800 CP: đúng cái lỗi mà thao tác sửa sinh ra
   * để chữa. Ai gộp hai hàm lại sau này sẽ làm ca này đỏ.
   */
  it('THAY THẾ số lượng chứ không cộng dồn như addHolding', () => {
    const list = [holding({ quantity: 500 })];

    const sua = updateHolding(list, 'FPT', { ...holding(), quantity: 300 });
    expect(sua[0]?.quantity).toBe(300);

    // Đối chứng: cùng đầu vào, `addHolding` ra 800 — hai hàm phục vụ hai ý định khác nhau.
    expect(addHolding(list, holding({ quantity: 300 }))[0]?.quantity).toBe(800);
  });

  it('ghi đè cả giá vốn, ngày mua và beta — kể cả xoá beta về null', () => {
    const list = [holding({ costPrice: 78_000, buyDate: '2025-01-02', beta: 1.1 })];

    const sua = updateHolding(list, 'FPT', {
      ...holding(),
      costPrice: 60_000,
      buyDate: '2024-06-30',
      beta: null,
    });

    expect(sua[0]?.costPrice).toBe(60_000);
    expect(sua[0]?.buyDate).toBe('2024-06-30');
    expect(sua[0]?.beta).toBeNull();
  });

  it('không đụng tới các mã khác', () => {
    const list = [holding(), holding({ code: 'HPG', quantity: 1_000 })];

    const sua = updateHolding(list, 'FPT', { ...holding(), quantity: 1 });
    expect(sua[1]?.quantity).toBe(1_000);
  });

  it('mã không có trong danh mục thì KHÔNG tự thêm mới', () => {
    const sua = updateHolding([holding()], 'VNM', { ...holding(), quantity: 999 });

    expect(sua).toHaveLength(1);
    expect(sua[0]?.code).toBe('FPT');
  });

  it('số lượng hoặc giá vốn không dương thì từ chối, giữ nguyên bản cũ', () => {
    const list = [holding({ quantity: 500 })];

    expect(updateHolding(list, 'FPT', { ...holding(), quantity: 0 })[0]?.quantity).toBe(500);
    expect(updateHolding(list, 'FPT', { ...holding(), costPrice: -1 })[0]?.quantity).toBe(500);
  });

  it('không sửa mảng gốc', () => {
    const list = [holding({ quantity: 500 })];
    updateHolding(list, 'FPT', { ...holding(), quantity: 1 });
    expect(list[0]?.quantity).toBe(500);
  });
});

describe('tên doanh nghiệp đi kèm mã', () => {
  it('đọc và ghi lại được qua localStorage', () => {
    const list = parseHoldings(serializeHoldings([holding({ name: 'FPT Corp' })]));
    expect(list[0]?.name).toBe('FPT Corp');
  });

  /*
   * Danh mục lưu từ trước gói này không có trường `name`. Nó phải VẮNG hẳn chứ không thành chuỗi
   * rỗng — màn dùng `holding.name !== undefined` để quyết định có vẽ dòng tên hay không, và một
   * chuỗi rỗng sẽ vẽ ra một khoảng trắng vô nghĩa cạnh mã.
   */
  it('bản lưu cũ không có tên thì bỏ hẳn trường, không thành chuỗi rỗng', () => {
    const list = parseHoldings(
      JSON.stringify([{ code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '' }]),
    );

    expect(list[0]?.name).toBeUndefined();
  });

  it('thêm lại cùng mã kèm tên thì điền tên vào bản cũ chưa có', () => {
    const cu = [holding()];
    const moi = addHolding(cu, holding({ name: 'FPT Corp' }));

    expect(moi[0]?.name).toBe('FPT Corp');
  });
});

describe('removeHolding', () => {
  it('bỏ đúng mã, không phân biệt hoa thường', () => {
    expect(removeHolding([holding(), holding({ code: 'HPG' })], 'fpt').map((h) => h.code)).toEqual([
      'HPG',
    ]);
  });

  it('mã không có thì giữ nguyên', () => {
    expect(removeHolding([holding()], 'VNM')).toHaveLength(1);
  });
});
