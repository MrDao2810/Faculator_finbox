import { describe, expect, it } from 'vitest';

import {
  MAX_RECENT_SEARCHES,
  addRecentSearch,
  parseRecentSearches,
  removeRecentSearch,
  serializeRecentSearches,
} from './recent-searches';

describe('parseRecentSearches() — chịu được mọi thứ trong localStorage', () => {
  it('đọc được danh sách bình thường', () => {
    expect(parseRecentSearches('["XIRR","WACC","P/E"]')).toEqual(['XIRR', 'WACC', 'P/E']);
  });

  it('chưa có gì thì trả mảng rỗng', () => {
    expect(parseRecentSearches(null)).toEqual([]);
    expect(parseRecentSearches(undefined)).toEqual([]);
    expect(parseRecentSearches('')).toEqual([]);
    expect(parseRecentSearches('   ')).toEqual([]);
  });

  it('JSON hỏng thì trả rỗng chứ không ném lỗi', () => {
    expect(parseRecentSearches('{"khong-dong-ngoac')).toEqual([]);
  });

  it('không phải mảng thì bỏ qua', () => {
    expect(parseRecentSearches('{"a":1}')).toEqual([]);
    expect(parseRecentSearches('"chuoi don"')).toEqual([]);
    expect(parseRecentSearches('42')).toEqual([]);
  });

  it('bỏ phần tử không phải chuỗi, giữ phần còn lại', () => {
    expect(parseRecentSearches('["XIRR",42,null,{"a":1},"WACC"]')).toEqual(['XIRR', 'WACC']);
  });

  it('bỏ chuỗi rỗng và cắt khoảng trắng thừa', () => {
    expect(parseRecentSearches('["  XIRR  ","","   "]')).toEqual(['XIRR']);
  });

  it('bỏ chuỗi dài bất thường — có thể là cả đoạn dán nhầm', () => {
    expect(parseRecentSearches(JSON.stringify([`${'x'.repeat(200)}`, 'WACC']))).toEqual(['WACC']);
  });

  it('bản cũ ghi trùng thì vẫn lọc trùng lúc đọc', () => {
    expect(parseRecentSearches('["P/E","p/e","PE"]')).toEqual(['P/E', 'PE']);
  });

  it('không bao giờ trả quá số mục tối đa', () => {
    const many = JSON.stringify(Array.from({ length: 50 }, (_, i) => `tu-khoa-${i}`));
    expect(parseRecentSearches(many)).toHaveLength(MAX_RECENT_SEARCHES);
  });
});

describe('addRecentSearch()', () => {
  it('thêm vào đầu danh sách', () => {
    expect(addRecentSearch(['WACC'], 'XIRR')).toEqual(['XIRR', 'WACC']);
  });

  it('gõ lại từ cũ thì đẩy lên đầu, không tạo mục thứ hai', () => {
    expect(addRecentSearch(['WACC', 'XIRR', 'P/E'], 'XIRR')).toEqual(['XIRR', 'WACC', 'P/E']);
  });

  it('so trùng bỏ qua hoa thường — “P/E” và “p/e” là cùng một lần tìm', () => {
    expect(addRecentSearch(['P/E'], 'p/e')).toEqual(['p/e']);
  });

  it('cắt khoảng trắng thừa trước khi lưu', () => {
    expect(addRecentSearch([], '  dinh gia  ')).toEqual(['dinh gia']);
  });

  it('chuỗi rỗng không làm gì cả', () => {
    expect(addRecentSearch(['WACC'], '')).toEqual(['WACC']);
    expect(addRecentSearch(['WACC'], '   ')).toEqual(['WACC']);
  });

  it('chuỗi dài bất thường bị bỏ qua', () => {
    expect(addRecentSearch(['WACC'], 'x'.repeat(200))).toEqual(['WACC']);
  });

  it('cắt bớt khi vượt số mục tối đa, bỏ mục cũ nhất', () => {
    const full = Array.from({ length: MAX_RECENT_SEARCHES }, (_, i) => `cu-${i}`);
    const next = addRecentSearch(full, 'moi');

    expect(next).toHaveLength(MAX_RECENT_SEARCHES);
    expect(next[0]).toBe('moi');
    expect(next).not.toContain(`cu-${MAX_RECENT_SEARCHES - 1}`);
  });

  it('không sửa mảng đầu vào', () => {
    const original = ['WACC'];
    addRecentSearch(original, 'XIRR');
    expect(original).toEqual(['WACC']);
  });
});

describe('removeRecentSearch()', () => {
  it('bỏ đúng mục, không đụng mục khác', () => {
    expect(removeRecentSearch(['XIRR', 'WACC'], 'XIRR')).toEqual(['WACC']);
  });

  it('bỏ qua hoa thường', () => {
    expect(removeRecentSearch(['P/E'], 'p/e')).toEqual([]);
  });

  it('không có thì giữ nguyên', () => {
    expect(removeRecentSearch(['WACC'], 'khong-co')).toEqual(['WACC']);
  });
});

describe('đi vòng qua localStorage rồi đọc lại', () => {
  it('ghi rồi đọc ra đúng như cũ', () => {
    const list = ['XIRR', 'dinh gia', 'P/E'];
    expect(parseRecentSearches(serializeRecentSearches(list))).toEqual(list);
  });

  it('ghi không bao giờ vượt số mục tối đa', () => {
    const many = Array.from({ length: 50 }, (_, i) => `tu-khoa-${i}`);
    expect(parseRecentSearches(serializeRecentSearches(many))).toHaveLength(MAX_RECENT_SEARCHES);
  });
});
