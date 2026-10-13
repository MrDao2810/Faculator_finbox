import { describe, expect, it } from 'vitest';

import {
  importCodes,
  parsePendingCodes,
  reconcilePending,
  removePendingCode,
  serializePendingCodes,
  splitCodeList,
} from './portfolio-pending-store';
import { MAX_HOLDINGS } from './portfolio-store';

/** `n` mã khác nhau, đúng hình dạng: 'M0', 'M1', … */
function codes(n: number, prefix = 'M'): string[] {
  return Array.from({ length: n }, (_, index) => `${prefix}${String(index)}`);
}

describe('parsePendingCodes — đọc từ máy người dùng, không tin gì cả', () => {
  it('đọc lại đúng thứ đã ghi, giữ thứ tự đã nhập', () => {
    const list = ['HPG', 'FPT', 'MWG'];
    expect(parsePendingCodes(serializePendingCodes(list))).toEqual(list);
  });

  it('không có gì thì trả danh sách rỗng', () => {
    expect(parsePendingCodes(null)).toEqual([]);
    expect(parsePendingCodes(undefined)).toEqual([]);
    expect(parsePendingCodes('   ')).toEqual([]);
  });

  it('JSON hỏng hoặc không phải mảng thì trả rỗng chứ không ném lỗi', () => {
    expect(() => parsePendingCodes('{hong')).not.toThrow();
    expect(parsePendingCodes('{hong')).toEqual([]);
    expect(parsePendingCodes('{"code":"FPT"}')).toEqual([]);
    expect(parsePendingCodes('"FPT"')).toEqual([]);
  });

  it('bỏ mục không phải chuỗi, mục sai hình dạng và mục trùng', () => {
    const raw = JSON.stringify(['fpt', 42, null, { code: 'HPG' }, 'FPT', ' mwg ', 'A-B', '']);
    expect(parsePendingCodes(raw)).toEqual(['FPT', 'MWG']);
  });

  it('mã quá 12 ký tự bị BỎ, không cắt cho vừa thành một mã khác', () => {
    expect(parsePendingCodes(JSON.stringify(['ABCDEFGHIJKLMNOP', 'FPT']))).toEqual(['FPT']);
  });

  it('không đọc quá trần của bảng', () => {
    const raw = JSON.stringify(codes(MAX_HOLDINGS + 10));
    expect(parsePendingCodes(raw)).toHaveLength(MAX_HOLDINGS);
  });
});

describe('splitCodeList — tách chuỗi danh sách mã', () => {
  it('nhận dấu phẩy, chấm phẩy, khoảng trắng và xuống dòng', () => {
    expect(splitCodeList('FPT,HPG; MWG\nVNM\tACB')).toEqual(['FPT', 'HPG', 'MWG', 'VNM', 'ACB']);
  });

  it('chuỗi rỗng hay toàn dấu ngăn thì không ra phần nào', () => {
    expect(splitCodeList('')).toEqual([]);
    expect(splitCodeList(' , ;; ')).toEqual([]);
  });
});

describe('importCodes — cửa duy nhất nhận mã từ ngoài', () => {
  it('thêm mã mới vào cuối kho, viết hoa, theo thứ tự nhận', () => {
    const result = importCodes(['VNM'], new Set(), ['fpt', ' hpg ']);

    expect(result.pending).toEqual(['VNM', 'FPT', 'HPG']);
    expect(result.added).toEqual(['FPT', 'HPG']);
    expect(result.overflow).toEqual([]);
  });

  it('bỏ mã đang nắm giữ: mã đã ở trong bảng thì không thêm lần nữa', () => {
    const result = importCodes([], new Set(['FPT']), ['FPT', 'HPG']);

    expect(result.pending).toEqual(['HPG']);
    expect(result.added).toEqual(['HPG']);
  });

  it('nhập lại cùng một danh sách không sinh dòng đôi', () => {
    const first = importCodes([], new Set(), ['FPT', 'HPG']);
    const second = importCodes(first.pending, new Set(), ['FPT', 'HPG', 'FPT']);

    expect(second.pending).toEqual(['FPT', 'HPG']);
    expect(second.added).toEqual([]);
  });

  it('mã lặp ngay trong một lượt chỉ vào một lần', () => {
    expect(importCodes([], new Set(), ['FPT', 'fpt', 'FPT']).pending).toEqual(['FPT']);
  });

  it('bỏ thứ không phải một mã, không cắt cho vừa', () => {
    const result = importCodes([], new Set(), ['', 'A B', 'FP-T', 'ABCDEFGHIJKLMNOP', 'HPG']);

    expect(result.pending).toEqual(['HPG']);
    expect(result.overflow).toEqual([]);
  });

  it('trần tính CHUNG hai kho, và phần tràn trả về theo tên', () => {
    const held = new Set(codes(MAX_HOLDINGS - 3, 'H'));
    const result = importCodes(['P0'], held, ['A', 'B', 'C', 'D']);

    // 47 đang giữ + 1 đang chờ = 48, còn đúng hai chỗ.
    expect(result.added).toEqual(['A', 'B']);
    expect(result.overflow).toEqual(['C', 'D']);
    expect(held.size + result.pending.length).toBe(MAX_HOLDINGS);
  });

  it('bảng đã đầy thì không mã nào vào, và mã tràn không bị kể hai lần', () => {
    const held = new Set(codes(MAX_HOLDINGS, 'H'));
    const result = importCodes([], held, ['FPT', 'FPT', 'HPG']);

    expect(result.pending).toEqual([]);
    expect(result.overflow).toEqual(['FPT', 'HPG']);
  });

  it('không sửa mảng đầu vào', () => {
    const pending = ['VNM'];
    importCodes(pending, new Set(), ['FPT']);

    expect(pending).toEqual(['VNM']);
  });
});

describe('reconcilePending — khớp kho chờ với danh mục lúc nạp', () => {
  it('mã đã thành nắm giữ thì không còn chờ', () => {
    expect(reconcilePending(['FPT', 'HPG'], new Set(['FPT']))).toEqual(['HPG']);
  });

  it('tổng hai kho không vượt trần của bảng', () => {
    const held = new Set(codes(MAX_HOLDINGS - 2, 'H'));
    expect(reconcilePending(['A', 'B', 'C'], held)).toEqual(['A', 'B']);
  });

  it('danh mục đã đầy thì kho chờ về rỗng', () => {
    const held = new Set(codes(MAX_HOLDINGS, 'H'));
    expect(reconcilePending(['A'], held)).toEqual([]);
  });
});

describe('removePendingCode', () => {
  it('gỡ đúng mã, không phân biệt hoa thường, không động tới mã khác', () => {
    expect(removePendingCode(['FPT', 'HPG'], ' fpt ')).toEqual(['HPG']);
  });

  it('mã không có trong kho thì trả bản sao nguyên vẹn', () => {
    const list = ['FPT'];
    const next = removePendingCode(list, 'HPG');

    expect(next).toEqual(['FPT']);
    expect(next).not.toBe(list);
  });
});
