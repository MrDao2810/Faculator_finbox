'use client';

import Link from 'next/link';

import { NAV_ITEMS } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './BottomTabBar.module.css';
import { TabIcon } from './TabIcon';
import { useActiveNavKey } from './useActiveNavKey';

/**
 * Thanh điều hướng dưới — gói WBS 2.1.2.
 *
 * Bốn mục Công thức · Danh mục · Cài đặt · Giới thiệu. Mục "Trang chủ" từng đứng đầu; nó rời thanh
 * ngày 15/09/2026 khi trang chủ gộp vào màn Công thức — xem `NAV_ITEMS`.
 *
 * Dùng <Link> chứ không phải router.push: bản build là HTML tĩnh, thẻ <a> thật thì
 * điều hướng được cả khi JavaScript chưa tải xong.
 *
 * Nhãn lấy `shortLabelKey` TRƯỚC: thanh này chia đều bề ngang nên nó là chỗ chật nhất của sản
 * phẩm, và một nhãn dài xuống dòng sẽ đội cả thanh lên trên mọi màn. Lý do đầy đủ kèm số đo nằm
 * ở `NavItem.shortLabelKey` trong `routes.ts`.
 */
export function BottomTabBar() {
  const active = useActiveNavKey();
  const t = useT();

  return (
    <nav className={styles.bar} aria-label={t('nav.primary')}>
      <ul className={styles.list}>
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.key} className={styles.item}>
              <Link
                href={item.href}
                className={isActive ? `${styles.link} ${styles.active}` : styles.link}
                aria-current={isActive ? 'page' : undefined}
              >
                <TabIcon route={item.key} active={isActive} />
                <span className={styles.label}>{t(item.shortLabelKey ?? item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
