'use client';

import { t } from '@/application';
import { usePreferences } from '@/application/preferences-context';

import styles from './LangSwitch.module.css';

/**
 * Nút chuyển ngôn ngữ — gói WBS 2.1.1.
 *
 * FR-21 (VI/EN) xếp ở v1.0 và gói dịch là 3.6.3, nên nút EN đang khoá. Để sẵn ở đây
 * chứ không giấu đi, vì wireframe có nút này và bật lên sau chỉ là bỏ thuộc tính disabled.
 */
export function LangSwitch() {
  const { locale, setLocale } = usePreferences();

  return (
    <div className={styles.group} role="group" aria-label={t('lang.label')}>
      <button
        type="button"
        className={locale === 'vi' ? `${styles.option} ${styles.selected}` : styles.option}
        aria-pressed={locale === 'vi'}
        onClick={() => {
          setLocale('vi');
        }}
      >
        {t('lang.vi')}
      </button>

      <button
        type="button"
        className={styles.option}
        disabled
        aria-pressed={false}
        title={t('lang.enComingSoon')}
      >
        {t('lang.en')}
        <span className="visually-hidden"> — {t('lang.enComingSoon')}</span>
      </button>
    </div>
  );
}
