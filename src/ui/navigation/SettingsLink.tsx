'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ROUTES, isSettingsPath } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './SettingsLink.module.css';

/*
 * Hình bánh răng dời nguyên từ `TabIcon` (icon của tab Cài đặt cũ) để người dùng nhận ra đúng hình
 * họ quen. Vành răng luôn vẽ nét; chỉ LÕI đổi trạng thái, nét khi thường và đặc khi đang ở màn Cài
 * đặt — hai lõi chung tâm (12, 12) để icon không "nhảy" khi đổi trạng thái, luật chung tâm của
 * `TabIcon`.
 */
const GEAR_RING =
  'M19.4 13.5a7.6 7.6 0 0 0 0-3l1.8-1.3-1.9-3.3-2.1.8a7.6 7.6 0 0 0-2.6-1.5L14.3 3H9.7l-.3 2.2a7.6 7.6 0 0 0-2.6 1.5l-2.1-.8-1.9 3.3 1.8 1.3a7.6 7.6 0 0 0 0 3l-1.8 1.3 1.9 3.3 2.1-.8a7.6 7.6 0 0 0 2.6 1.5l.3 2.2h4.6l.3-2.2a7.6 7.6 0 0 0 2.6-1.5l2.1.8 1.9-3.3-1.8-1.3Z';
const GEAR_CORE_OUTLINE = 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z';
const GEAR_CORE_SOLID = 'M12 15.6a3.6 3.6 0 1 0 0-7.2 3.6 3.6 0 0 0 0 7.2Z';

/**
 * Icon bánh răng trên thanh trên — lối vào màn Cài đặt từ 28/10/2026.
 *
 * Chủ dự án: _"thay đổi bây giờ không cần phải có Cài đặt ở trên mainlayout mà chỉ cần icon setting
 * ở bên trái cùng hàng với icon theme sáng tối"_, và chốt cho cả PC lẫn điện thoại: mục "Cài đặt" rời
 * cả thanh nav PC lẫn thanh tab dưới (`NAV_ITEMS`), icon này đứng ngay bên trái `ThemeSwitch` ở mọi
 * khổ. Ở `/danh-muc/` dưới 1024px nó ẩn cùng Sáng/Tối và VI — nó là con TRỰC TIẾP của `.controls`, nên
 * luật nhường chỗ `.controlsScreen > :not(.screenActions)` tự phủ nó, không cần dòng CSS nào thêm.
 *
 * ── Một LINK, không phải nút bấm-là-đổi ──────────────────────────────────────────────────────
 *
 * Cùng khung với hai nút anh em (`SettingsLink.module.css` chép đúng khung của `ThemeSwitch`,
 * `header-buttons-css.test.ts` gác ba bản chép), nhưng khác vai: hai nút kia là công tắc nên
 * `aria-label` nói hành động sẽ xảy ra, còn đây là đường tới một màn nên tên của nó là tên ĐÍCH —
 * "Cài đặt", đúng `nav.settings` mà mục nav cũ dùng. `title` cho người dùng chuột một dòng gợi ý, vì
 * icon không mang chữ.
 *
 * ── Trạng thái "đang ở đây" ────────────────────────────────────────────────────────────────
 *
 * Ở '/cai-dat/' link mang `aria-current="page"`, và CSS đọc chính thuộc tính ấy để vẽ hai dấu hiệu
 * ngoài màu (NFR-USA-06): viền dày lên 2px (cùng lối "đang chọn" của `Chip`), và lõi bánh răng chuyển
 * từ nét sang đặc (cùng lối "nét → đặc" của `TabIcon` ở thanh tab dưới). Không có nó thì ở PC màn Cài
 * đặt không còn gì nói "đang ở đâu": không mục nav nào gạch chân, và `<h1>` tên màn ẩn từ 1024px (xem
 * `HeaderIdentity`).
 *
 * Đọc đường dẫn bằng `usePathname()`, giá trị ấy đã có lúc dựng HTML tĩnh, nên trang tĩnh của
 * '/cai-dat/' mang sẵn trạng thái — không lệch hydration, không nháy. Chỉ `usePathname()`:
 * `useSearchParams()` ở layout gốc thổi bay HTML tĩnh của mọi trang (xem `HeaderIdentity`).
 *
 * Nằm trong `<header>` (vùng banner), NGOÀI vùng "Điều hướng chính": người dùng trình đọc màn hình đi
 * theo vùng sẽ không gặp Cài đặt trong danh sách nav nữa, mà gặp nó ở thanh trên, trước nút Sáng/Tối.
 * Chấp nhận được cho một lối vào màn phụ.
 */
export function SettingsLink() {
  const t = useT();
  const active = isSettingsPath(usePathname());
  const label = t('nav.settings');

  return (
    <Link
      href={ROUTES.settings}
      className={styles.button}
      aria-label={label}
      title={label}
      aria-current={active ? 'page' : undefined}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={GEAR_RING} />
        <path
          d={active ? GEAR_CORE_SOLID : GEAR_CORE_OUTLINE}
          fill={active ? 'currentColor' : 'none'}
          stroke={active ? 'none' : 'currentColor'}
        />
      </svg>
    </Link>
  );
}
