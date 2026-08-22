'use client';

import Link from 'next/link';

import { NAV_ITEMS } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './HeaderNav.module.css';
import { useActiveNavKey } from './useActiveNavKey';

/**
 * Nav ngang trong thanh trên — chỉ hiện ở màn PC (≥1024px, xem `HeaderNav.module.css`).
 *
 * Cùng bốn mục và cùng nguồn `NAV_ITEMS` với `BottomTabBar`, nhưng KHÔNG dùng `TabIcon`: icon
 * dọc (icon trên, chữ dưới) hợp bố cục thanh dưới di động, còn ở đây là một hàng ngang cao
 * `--header-height` (56px) — icon 22px cạnh chữ chỉ chật thêm mà không thêm nghĩa, bốn nhãn
 * tiếng Việt ngắn đã tự đủ rõ, đúng quy ước menu ngang desktop thông thường.
 *
 * Mục đang chọn vẫn giữ ≥2 dấu hiệu ngoài màu (NFR-USA-06): đậm chữ + gạch chân accent, thay
 * cho cặp "đậm chữ + icon đặc" mà `BottomTabBar` dùng.
 */
export function HeaderNav() {
  const active = useActiveNavKey();
  const t = useT();

  return (
    <nav className={styles.nav} aria-label={t('nav.primary')}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                aria-current={isActive ? 'page' : undefined}
              >
                {t(item.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
