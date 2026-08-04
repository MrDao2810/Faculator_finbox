import { describe, expect, it } from 'vitest';

import { NAV_ITEMS, ROUTES, activeRouteKey, formulaPath } from './routes';

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

  it('đường dẫn lạ thì không mục nào sáng', () => {
    expect(activeRouteKey('/khong-co-trang-nay/')).toBeNull();
  });
});
