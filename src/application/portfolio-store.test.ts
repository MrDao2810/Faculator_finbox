import { describe, expect, it } from 'vitest';

import type { Holding } from '@/core/portfolio';

import {
  MAX_HOLDINGS,
  addHolding,
  parseHoldings,
  removeHolding,
  serializeHoldings,
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
