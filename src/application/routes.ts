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
import { listParamsToQuery, type ListParams } from './url-state';

export const ROUTES = {
  home: '/',
  formulas: '/cong-thuc/',
  /**
   * Màn tìm kiếm WF-09. KHÔNG có trong `NAV_ITEMS` và KHÔNG có trong `sitemap.xml`:
   * đây là giao diện nhập truy vấn chứ không phải nội dung, và để Google lập chỉ mục nó
   * thì trùng nội dung với `/cong-thuc/` (FR-25). Trang tự đặt `robots: noindex`.
   */
  search: '/tim-kiem/',
  /**
   * Bảng dữ liệu WF-05. Cũng KHÔNG có trong `NAV_ITEMS` và KHÔNG vào `sitemap.xml`: đây là
   * chỗ nhập liệu của người dùng, không phải nội dung để Google lập chỉ mục (FR-25).
   * WF-18 xếp nó trong chặng "Tính toán" nên nó sáng mục Công thức, giống màn tìm kiếm.
   */
  data: '/du-lieu/',
  portfolio: '/danh-muc/',
  settings: '/cai-dat/',
} as const;

export type RouteKey = keyof typeof ROUTES;

/**
 * Bốn mục có mặt ở thanh nav dưới.
 * `search` và `data` là route thật nhưng không phải mục điều hướng — tách kiểu ra để component
 * thanh nav không phải bịa một icon cho chúng.
 */
export type NavKey = Exclude<RouteKey, 'search' | 'data'>;

/** Đường dẫn tới một công thức, ví dụ '/cong-thuc/wacc/'. */
export function formulaPath(id: string): string {
  return `${ROUTES.formulas}${id}/`;
}

/**
 * Đường dẫn tới màn danh sách ĐÃ LỌC SẴN, ví dụ '/cong-thuc/?q=roi&category=returns'.
 *
 * Một chỗ duy nhất dựng loại link này — lưới nhóm ở trang chủ và hàng "Xem tất cả" của ô tìm
 * đều gọi vào đây. Ghép chuỗi tay ở từng nơi thì tên tham số dễ lệch với `parseListParams()`
 * mà không ai biết, và link mở ra một danh sách chưa lọc gì; đợt 7 đã dính đúng lỗi đó.
 *
 * Tham số mặc định được `listParamsToQuery()` lược bỏ, nên `DEFAULT_LIST_PARAMS` cho ra
 * '/cong-thuc/' trơn chứ không phải '/cong-thuc/?segment=all&sort=featured'.
 */
export function formulaListPath(params: ListParams): string {
  return `${ROUTES.formulas}${listParamsToQuery(params)}`;
}

export interface NavItem {
  key: NavKey;
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
 * Thanh trên có bày cụm nút Cơ bản / Nâng cao ở đường dẫn này không.
 *
 * CHỈ màn danh sách công thức. Đây là số đo chứ không phải sở thích: đo trên Chrome ở khổ
 * 420×900, bấm đổi chế độ rồi so DOM từng ký tự, thì trang chủ lúc nhàn không đổi MỘT ký tự
 * nào; và trong 111 trang chi tiết chỉ 17 trang đổi gì đó (10 trang có biến `level: 'advanced'`
 * cộng 7 trang `chainFor()` xếp vào chuỗi phụ thuộc) — 94 trang còn lại bấm không thấy gì.
 *
 * Một nút bày thường trực ở thanh thương hiệu mà phần lớn lần bấm không trả lời gì sẽ dạy người
 * dùng đúng một điều, và điều đó sai: "nút này hỏng". Họ thôi bấm, và mất luôn 32 công thức mức
 * nâng cao mà họ không hề biết là có.
 *
 * Ở '/cong-thuc/' thì ngược hẳn: bấm xong con số ngay phía trên đổi từ 79 sang 111, cách chỗ
 * ngón tay vừa chạm chưa tới một dòng. Nguyên nhân dính liền kết quả nên nút tự giải thích, không
 * cần thêm câu thông báo nào.
 *
 * Những màn khác VẪN đổi theo chế độ — chỉ là không còn nút ở thanh trên. Lối vào của chúng là
 * `HiddenByLevelNote`: dòng "N thứ đang ẩn · Bật chế độ Nâng cao" đặt ngay cạnh chỗ bị thiếu và
 * chỉ hiện khi thật sự có thứ bị giấu. Đường về chế độ Cơ bản ở những màn ấy là hàng "Chế độ
 * hiển thị" trong màn Cài đặt.
 *
 * Khớp TUYỆT ĐỐI, cố ý không khớp trang con: '/cong-thuc/wacc/' là màn chi tiết chứ không phải
 * màn danh sách, và nó nằm trong nhóm 94 trang nói trên.
 */
export function showsModeToggle(pathname: string): boolean {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return path === ROUTES.formulas;
}

/**
 * Mục nào đang được chọn ứng với đường dẫn hiện tại.
 * Trang chủ phải khớp tuyệt đối, các mục khác khớp cả trang con
 * (ví dụ '/cong-thuc/wacc/' vẫn sáng mục Công thức).
 */
export function activeRouteKey(pathname: string): NavKey | null {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;

  if (path === ROUTES.home) return 'home';

  // Màn tìm kiếm WF-09 và bảng dữ liệu WF-05 không có mục riêng ở thanh nav. WF-18 xếp cả hai
  // trong luồng công thức, nên chúng sáng mục Công thức — tắt hết mọi mục sẽ khiến người dùng
  // tưởng bị lạc.
  if (path.startsWith(ROUTES.search) || path.startsWith(ROUTES.data)) return 'formulas';

  for (const item of NAV_ITEMS) {
    if (item.key === 'home') continue;
    if (path === item.href || path.startsWith(item.href)) return item.key;
  }

  return null;
}
