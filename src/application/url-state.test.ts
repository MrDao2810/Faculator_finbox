import { describe, expect, it } from 'vitest';

import { CATEGORIES } from '@/core/registry';

import {
  CLEARED_SELECT_FILTERS,
  DEFAULT_LIST_PARAMS,
  MAX_QUERY_LENGTH,
  hasSelectFilters,
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

  it('đọc được cả sáu cách sắp xếp', () => {
    for (const sort of ['featured', 'az', 'za', 'recent', 'used', 'basic'] as const) {
      expect(parseListParams(new URLSearchParams(`sort=${sort}`)).sort, sort).toBe(sort);
    }
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

  it('cách sắp xếp mới cũng đi vòng được — link chia sẻ mang đúng tên cách sắp', () => {
    for (const sort of ['recent', 'used', 'basic'] as const) {
      const state = { ...DEFAULT_LIST_PARAMS, sort };
      expect(listParamsToQuery(state), sort).toBe(`?sort=${sort}`);
      expect(parseListParams(serializeListParams(state)), sort).toEqual(state);
    }
  });
});

describe('isDefaultListParams()', () => {
  it('phân biệt được trạng thái sạch và trạng thái đang lọc', () => {
    expect(isDefaultListParams(DEFAULT_LIST_PARAMS)).toBe(true);
    expect(isDefaultListParams({ ...DEFAULT_LIST_PARAMS, q: '   ' })).toBe(true);
    expect(isDefaultListParams({ ...DEFAULT_LIST_PARAMS, categoryId: 'risk' })).toBe(false);
  });
});

/*
 * Lỗi thật đã gặp: ô nhóm ở trang chủ ghép tay chuỗi `?nhom=<id>`, trong khi bộ đọc URL
 * dùng tham số `category`. Link vẫn mở được trang nhưng KHÔNG lọc gì, và không test nào bắt
 * được vì hai bên nằm ở hai file khác nhau. Ca dưới đây khoá lại vòng tròn đó.
 */
describe('link lọc nhóm luôn đọc lại được', () => {
  it('mọi nhóm: dựng URL rồi đọc lại ra đúng nhóm đó', () => {
    for (const category of CATEGORIES) {
      const query = listParamsToQuery({ ...DEFAULT_LIST_PARAMS, categoryId: category.id });
      const parsed = parseListParams(new URLSearchParams(query));

      expect(parsed.categoryId, category.id).toBe(category.id);
    }
  });

  it('chuỗi truy vấn có dấu ? ở đầu để ghép thẳng sau đường dẫn', () => {
    const query = listParamsToQuery({ ...DEFAULT_LIST_PARAMS, categoryId: 'loans' });
    expect(query.startsWith('?')).toBe(true);
  });
});

/*
 * Nút "Xoá bộ lọc" dưới hai ô chọn chỉ được đụng ĐÚNG hai ô ấy.
 *
 * Lỗi thật đã gặp: nút gọi `reset()` — thứ xoá sạch truy vấn — nên bấm vào là thanh tab mảng bên
 * trên nhảy về "Tất cả" và chuỗi tìm cũng bay mất. Người dùng chọn "Cá nhân" rồi bấm xoá nhóm thì
 * mất luôn mảng.
 *
 * Ca kiểm gác CẶP `CLEARED_SELECT_FILTERS` + `hasSelectFilters()`, và gác cả tính khớp nhau của
 * chúng: hai bên lệch nhau thì nút hiện lên trong khi bấm vào không đổi gì — hỏng im lặng, không
 * ném lỗi, không ai thấy.
 */
describe('nút "Xoá bộ lọc" chỉ phụ trách hai ô chọn', () => {
  it('patch xoá KHÔNG mang mảng và chuỗi tìm — hai thứ ấy không phải việc của nó', () => {
    expect(Object.keys(CLEARED_SELECT_FILTERS).sort()).toEqual(['categoryId', 'sort']);
  });

  it('trộn patch vào trạng thái đang lọc thì mảng và chuỗi tìm còn nguyên', () => {
    const dangLoc = {
      q: 'wacc',
      segment: 'personal',
      categoryId: 'loans',
      sort: 'az',
    } as const;

    expect({ ...dangLoc, ...CLEARED_SELECT_FILTERS }).toEqual({
      q: 'wacc',
      segment: 'personal',
      categoryId: DEFAULT_LIST_PARAMS.categoryId,
      sort: DEFAULT_LIST_PARAMS.sort,
    });
  });

  it('hiện nút khi một trong hai ô đang lọc', () => {
    expect(hasSelectFilters({ ...DEFAULT_LIST_PARAMS, categoryId: 'risk' })).toBe(true);
    expect(hasSelectFilters({ ...DEFAULT_LIST_PARAMS, sort: 'az' })).toBe(true);
  });

  /*
   * Đây là vế khiến `isFiltering` cũ dùng sai chỗ: mảng và chuỗi tìm làm `isDefaultListParams()`
   * thành false, nhưng chúng KHÔNG phải thứ nút này xoá được — nút hiện lên là bày ra một nút bấm
   * vào không đổi gì.
   */
  it('KHÔNG hiện nút khi chỉ có mảng hoặc chuỗi tìm đang lọc', () => {
    const chiCoMang = { ...DEFAULT_LIST_PARAMS, segment: 'personal' } as const;
    const chiCoChuoiTim = { ...DEFAULT_LIST_PARAMS, q: 'wacc' };

    expect(isDefaultListParams(chiCoMang)).toBe(false);
    expect(hasSelectFilters(chiCoMang)).toBe(false);

    expect(isDefaultListParams(chiCoChuoiTim)).toBe(false);
    expect(hasSelectFilters(chiCoChuoiTim)).toBe(false);
  });

  it('sau khi xoá thì nút tự tắt — patch và điều kiện hiện nút khớp nhau', () => {
    const sauKhiXoa = {
      ...DEFAULT_LIST_PARAMS,
      segment: 'stock' as const,
      ...CLEARED_SELECT_FILTERS,
    };
    expect(hasSelectFilters(sauKhiXoa)).toBe(false);
  });
});
