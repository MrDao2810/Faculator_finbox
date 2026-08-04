import { t } from '@/application';

import styles from './DisclaimerBar.module.css';

/**
 * Dải miễn trừ trách nhiệm — gói WBS 2.1.3.
 *
 * FR-24 · UI-04: phải hiện trong tầm nhìn đầu tiên của MỌI màn có kết quả.
 * Đặt cố định trong AppShell nên không màn nào quên được. Không có nút đóng.
 *
 * Dấu hiệu là biểu tượng + chữ, không phải chỉ màu (NFR-USA-06).
 */
export function DisclaimerBar() {
  return (
    <div className={styles.bar} role="note">
      <svg
        className={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16.5v.01" />
      </svg>
      <p className={styles.text}>{t('disclaimer.text')}</p>
    </div>
  );
}
