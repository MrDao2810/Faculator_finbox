import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LIST_PARAMS,
  MAX_QUERY_LENGTH,
  isDefaultListParams,
  listParamsToQuery,
  parseListParams,
  serializeListParams,
} from './url-state';

describe('parseListParams()', () => {
  it('URL trống thì mọi thứ ở mặc định', () => {
    expect(parseListParams(new URLSearchParams())).toEqual(DEFAULT_LIST_PARAMS);
    expect(parseListParams(null)).toEqual(DEFAULT_LIST_PARAMS);
  });

  it('đọc đủ bốn tham số', () => {
    const params = new URLSearchParams('q=wacc&segment=stock&category=valuation&sort=az');
    expect(parseListParams(params)).toEqual({
      q: 'wacc',
      segment: 'stock',
      categoryId: 'valuation',
      sort: 'az',
    });
  });

  it('giữ nguyên khoảng trắng người dùng gõ — trim ở đây sẽ nuốt dấu cách khi đang gõ', () => {
    expect(parseListParams(new URLSearchParams('q=dinh+')).q).toBe('dinh ');
    expect(parseListParams(new URLSearchParams('q=  p%2Fe  ')).q).toBe('  p/e  ');
  });

  it('chặn chuỗi tìm kiếm quá dài', () => {
    const params = new URLSearchParams();
    params.set('q', 'a'.repeat(500));
    expect(parseListParams(params).q).toHaveLength(MAX_QUERY_LENGTH);
  });

  it('mảng lạ thì rơi về Tất cả', () => {
    expect(parseListParams(new URLSearchParams('segment=crypto')).segment).toBe('all');
  });

  it('nhóm không có trong danh mục thì bỏ, không làm hỏng màn', () => {
    expect(parseListParams(new URLSearchParams('category=khong-co')).categoryId).toBeNull();
  });

  it('cách sắp xếp lạ thì rơi về mặc định', () => {
    expect(parseListParams(new URLSearchParams('sort=random')).sort).toBe('featured');
  });
});

describe('serializeListParams()', () => {
  it('bỏ hẳn giá trị mặc định để link chia sẻ ngắn', () => {
    expect(serializeListParams(DEFAULT_LIST_PARAMS).toString()).toBe('');
    expect(listParamsToQuery(DEFAULT_LIST_PARAMS)).toBe('');
  });

  it('chỉ ghi phần khác mặc định', () => {
    const query = listParamsToQuery({ ...DEFAULT_LIST_PARAMS, q: 'beta', sort: 'az' });
    expect(query).toContain('q=beta');
    expect(query).toContain('sort=az');
    expect(query).not.toContain('segment');
    expect(query).not.toContain('category');
  });

  it('chuỗi chỉ toàn khoảng trắng thì coi như chưa tìm gì', () => {
    expect(listParamsToQuery({ ...DEFAULT_LIST_PARAMS, q: '   ' })).toBe('');
  });

  it('giữ được dấu cách cuối — ca người dùng đang gõ dở từ thứ hai', () => {
    const state = { ...DEFAULT_LIST_PARAMS, q: 'dinh ' };
    expect(parseListParams(serializeListParams(state)).q).toBe('dinh ');
  });

  it('đi vòng parse → serialize → parse giữ nguyên trạng thái', () => {
    const state = {
      q: 'giá hoà vốn',
      segment: 'personal',
      categoryId: 'loans',
      sort: 'za',
    } as const;
    expect(parseListParams(serializeListParams(state))).toEqual(state);
  });
});

describe('isDefaultListParams()', () => {
  it('phân biệt được trạng thái sạch và trạng thái đang lọc', () => {
    expect(isDefaultListParams(DEFAULT_LIST_PARAMS)).toBe(true);
    expect(isDefaultListParams({ ...DEFAULT_LIST_PARAMS, q: '   ' })).toBe(true);
    expect(isDefaultListParams({ ...DEFAULT_LIST_PARAMS, categoryId: 'risk' })).toBe(false);
  });
});
