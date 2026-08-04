import Link from 'next/link';

import { ROUTES, t } from '@/application';

import styles from './AppHeader.module.css';
import { LangSwitch } from './LangSwitch';
import { ModeToggle } from './ModeToggle';

/**
 * Thanh trên — gói WBS 2.1.1.
 *
 * Logo, nút chuyển chế độ Cơ bản / Nâng cao, nút ngôn ngữ.
 * Dính trên khi cuộn để hai nút này luôn với tới được trên điện thoại.
 *
 * Banner ngoại tuyến không nằm trong này mà nằm ngay dưới, ở AppShell — vì nó chỉ hiện
 * khi mất mạng và không được đẩy chiều cao thanh trên thay đổi.
 */
export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={ROUTES.home} className={styles.brand}>
          <span className={styles.name}>
            <span className={styles.nameFull}>{t('app.name')}</span>
            <span className={styles.nameShort}>Finbox</span>
          </span>
        </Link>

        <div className={styles.controls}>
          <ModeToggle />
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
