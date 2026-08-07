import { describe, expect, it } from 'vitest';

import { NAV_ITEMS, ROUTES, activeRouteKey, formulaListPath, formulaPath } from './routes';
import { DEFAULT_LIST_PARAMS, parseListParams } from './url-state';

describe('bản đồ đường dẫn (WF-18)', () => {
  it('thanh nav dưới có đúng bốn mục', () => {
    expect(NAV_ITEMS).toHaveLength(4);
    expect(NAV_ITEMS.map((i) => i.key)).toEqual(['home', 'formulas', 'portfolio', 'settings']);
  });

  it('mọi đường dẫn kết thúc bằng "/" cho hợp trailingSlash', () => {
    for (const href of Object.values(ROUTES)) {
      expect(href.endsWith('/')).toBe(true);
    }
    expect(formulaPath('wacc')).toBe('/cong-thuc/wacc/');
  });
});

describe('activeRouteKey()', () => {
  it('trang chủ chỉ sáng khi ở đúng trang chủ', () => {
    expect(activeRouteKey('/')).toBe('home');
    expect(activeRouteKey('/cong-thuc/')).not.toBe('home');
  });

  it('trang con vẫn sáng mục cha', () => {
    expect(activeRouteKey('/cong-thuc/wacc/')).toBe('formulas');
    expect(activeRouteKey('/cai-dat/')).toBe('settings');
  });

  it('chấp nhận đường dẫn thiếu dấu "/" ở cuối', () => {
    expect(activeRouteKey('/danh-muc')).toBe('portfolio');
  });

  it('màn tìm kiếm sáng mục Công thức, không để trống cả thanh nav', () => {
    expect(activeRouteKey(ROUTES.search)).toBe('formulas');
  });

  it('bảng dữ liệu WF-05 cũng sáng mục Công thức', () => {
    expect(activeRouteKey(ROUTES.data)).toBe('formulas');
    expect(activeRouteKey('/du-lieu')).toBe('formulas');
  });

  it('đường dẫn lạ thì không mục nào sáng', () => {
    expect(activeRouteKey('/khong-co-trang-nay/')).toBeNull();
  });
});

describe('formulaListPath() — một chỗ duy nhất dựng link tới danh sách đã lọc', () => {
  it('tham số mặc định cho ra đường dẫn trơn, không kèm đuôi thừa', () => {
    expect(formulaListPath(DEFAULT_LIST_PARAMS)).toBe('/cong-thuc/');
  });

  it('có từ khoá và nhóm thì cả hai lên đường dẫn', () => {
    const path = formulaListPath({ ...DEFAULT_LIST_PARAMS, q: 'roi', categoryId: 'returns' });

    expect(path.startsWith('/cong-thuc/?')).toBe(true);
    expect(path).toContain('roi');
    expect(path).toContain('returns');
  });

  /*
   * Ca chặn đúng lỗi thật của đợt 7: ghép chuỗi tay thì tên tham số ở nơi DỰNG và nơi ĐỌC lệch
   * nhau mà lint lẫn typecheck đều không thấy. Đi trọn một vòng dựng → đọc lại mới bắt được.
   */
  it('đọc ngược đường dẫn phải ra lại đúng tham số ban đầu', () => {
    for (const params of [
      DEFAULT_LIST_PARAMS,
      { ...DEFAULT_LIST_PARAMS, q: 'gia hoa von' },
      { ...DEFAULT_LIST_PARAMS, categoryId: 'fees-tax', segment: 'stock' as const },
      { ...DEFAULT_LIST_PARAMS, q: 'p/e', sort: 'az' as const },
    ]) {
      const query = formulaListPath(params).slice('/cong-thuc/'.length);
      expect(parseListParams(new URLSearchParams(query)), JSON.stringify(params)).toEqual(params);
    }
  });
});

describe('màn nhập liệu nằm ngoài điều hướng và ngoài sitemap (FR-25)', () => {
  it('không có mục nav nào trỏ tới /tim-kiem/ hay /du-lieu/', () => {
    expect(NAV_ITEMS.some((i) => i.href === ROUTES.search)).toBe(false);
    expect(NAV_ITEMS.some((i) => i.href === ROUTES.data)).toBe(false);
  });
});
