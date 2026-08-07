import type { NavKey } from '@/application';

/**
 * Bốn icon của thanh điều hướng dưới — gói WBS 2.1.2, vẽ lại theo bản thiết kế ở đợt 8.
 *
 * Vẽ tay bằng SVG thay vì thêm thư viện icon: bốn hình đơn giản không đáng đánh đổi
 * dung lượng gói (NFR-PER-04). Dùng `currentColor` nên đổi màu theo trạng thái của link.
 *
 * Mục đang chọn dùng icon **đặc**, mục còn lại dùng icon nét. Khác biệt hình khối này là
 * dấu hiệu không phụ thuộc màu của NFR-USA-06 — nó thay cho vạch chỉ báo mà bản thiết kế
 * không vẽ.
 *
 * Luôn aria-hidden — icon chỉ là phần nhìn, nhãn chữ mới là thứ trình đọc màn hình đọc.
 */

/** Hình nét, dùng khi mục KHÔNG được chọn. */
const OUTLINE: Readonly<Record<NavKey, string>> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  formulas: 'M4 5h6v6H4V5ZM14 5h6v6h-6V5ZM4 13h6v6H4v-6ZM14 13h6v6h-6v-6Z',
  portfolio: 'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
};

/** Hình đặc, dùng cho mục đang chọn. */
const SOLID: Readonly<Record<NavKey, string>> = {
  home: 'M12 2.6 21.5 10.6V21a1 1 0 0 1-1 1h-5v-6h-7v6h-5a1 1 0 0 1-1-1V10.6L12 2.6Z',
  formulas: 'M3.5 4.5h7v7h-7v-7ZM13.5 4.5h7v7h-7v-7ZM3.5 12.5h7v7h-7v-7ZM13.5 12.5h7v7h-7v-7Z',
  portfolio: 'M3 7a2 2 0 0 1 2-2h4l2.2 2.6H19a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z',
  settings: 'M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z',
};

/** Vành răng của icon Cài đặt — vẽ riêng vì cả hai trạng thái đều dùng nét. */
const GEAR_RING =
  'M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.3-1.9-3.3-2.1.8a7.6 7.6 0 0 0-2.6-1.5L14.3 3H9.7l-.3 2.2a7.6 7.6 0 0 0-2.6 1.5l-2.1-.8-1.9 3.3 1.8 1.3a7.6 7.6 0 0 0 0 3l-1.8 1.3 1.9 3.3 2.1-.8a7.6 7.6 0 0 0 2.6 1.5l.3 2.2h4.6l.3-2.2a7.6 7.6 0 0 0 2.6-1.5l2.1.8 1.9-3.3-1.8-1.3Z';

export function TabIcon({ route, active = false }: { route: NavKey; active?: boolean }) {
  const isSolid = active;

  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={isSolid ? SOLID[route] : OUTLINE[route]}
        fill={isSolid ? 'currentColor' : 'none'}
        stroke={isSolid ? 'none' : 'currentColor'}
      />
      {route === 'settings' && <path d={GEAR_RING} />}
    </svg>
  );
}
