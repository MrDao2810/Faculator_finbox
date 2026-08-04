/**
 * Tầng APPLICATION — bản đồ đường dẫn (gói WBS 1.4.1).
 *
 * WF-18 chốt luồng: bốn mục ở thanh nav dưới, mỗi công thức một URL riêng.
 * Đây là nguồn duy nhất của đường dẫn — thanh nav, sitemap và mọi link đều đọc từ đây,
 * để đổi slug là sửa một chỗ.
 *
 * Slug tiếng Việt vì đường dẫn là phần Google đọc (FR-25). Đuôi '/' là bắt buộc:
 * next.config.mjs đặt `trailingSlash: true` cho hợp static hosting.
 */

import type { MessageKey } from './i18n';

export const ROUTES = {
  home: '/',
  formulas: '/cong-thuc/',
  portfolio: '/danh-muc/',
  settings: '/cai-dat/',
} as const;

export type RouteKey = keyof typeof ROUTES;

/** Đường dẫn tới một công thức, ví dụ '/cong-thuc/wacc/'. */
export function formulaPath(id: string): string {
  return `${ROUTES.formulas}${id}/`;
}

export interface NavItem {
  key: RouteKey;
  href: string;
  labelKey: MessageKey;
}

/** Bốn mục của thanh điều hướng dưới, đúng thứ tự WF-18. */
export const NAV_ITEMS: ReadonlyArray<NavItem> = [
  { key: 'home', href: ROUTES.home, labelKey: 'nav.home' },
  { key: 'formulas', href: ROUTES.formulas, labelKey: 'nav.formulas' },
  { key: 'portfolio', href: ROUTES.portfolio, labelKey: 'nav.portfolio' },
  { key: 'settings', href: ROUTES.settings, labelKey: 'nav.settings' },
];

/**
 * Mục nào đang được chọn ứng với đường dẫn hiện tại.
 * Trang chủ phải khớp tuyệt đối, các mục khác khớp cả trang con
 * (ví dụ '/cong-thuc/wacc/' vẫn sáng mục Công thức).
 */
export function activeRouteKey(pathname: string): RouteKey | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (path === ROUTES.home) return 'home';

  for (const item of NAV_ITEMS) {
    if (item.key === 'home') continue;
    if (path === item.href || path.startsWith(item.href)) return item.key;
  }

  return null;
}
