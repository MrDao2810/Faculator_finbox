import type { RouteKey } from '@/application';

/**
 * Bốn icon của thanh điều hướng dưới — gói WBS 2.1.2.
 *
 * Vẽ tay bằng SVG thay vì thêm thư viện icon: bốn hình đơn giản không đáng đánh đổi
 * dung lượng gói (NFR-PER-04). Dùng `currentColor` nên đổi màu theo trạng thái của link.
 *
 * Luôn aria-hidden — icon chỉ là phần nhìn, nhãn chữ mới là thứ trình đọc màn hình đọc.
 */

const PATHS: Readonly<Record<RouteKey, string>> = {
  home: 'M3 10.5 12 3l9 7.5M5.5 9.5V20h13V9.5',
  formulas: 'M4 6h16M4 12h16M4 18h10',
  portfolio: 'M5 20V10M12 20V4M19 20v-7',
  settings: 'M4 8h9M17 8h3M4 16h3M11 16h9',
};

const DOTS: Partial<Record<RouteKey, ReadonlyArray<{ cx: number; cy: number }>>> = {
  settings: [
    { cx: 15, cy: 8 },
    { cx: 9, cy: 16 },
  ],
};

export function TabIcon({ route }: { route: RouteKey }) {
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
      <path d={PATHS[route]} />
      {(DOTS[route] ?? []).map((dot) => (
        <circle key={`${dot.cx}-${dot.cy}`} cx={dot.cx} cy={dot.cy} r="2" />
      ))}
    </svg>
  );
}
