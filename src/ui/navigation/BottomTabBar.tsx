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
 * Bốn mục Trang chủ · Công thức · Danh mục · Cài đặt, đúng bản đồ luồng WF-18.
 *
 * Dùng <Link> chứ không phải router.push: bản build là HTML tĩnh, thẻ <a> thật thì
 * điều hướng được cả khi JavaScript chưa tải xong.
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
                <span className={styles.label}>{t(item.labelKey)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
