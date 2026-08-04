'use client';

import { t } from '@/application';
import { useOnlineStatus } from '@/application/use-online-status';

import styles from './OfflineBanner.module.css';

/**
 * Banner "Hoạt động ngoại tuyến" — gói WBS 2.1.1.
 *
 * Mất mạng không phải lỗi: sản phẩm chạy offline đầy đủ chức năng tính toán (FR-23, COM-02).
 * Banner chỉ để người dùng hiểu vì sao dữ liệu mẫu chưa nạp được.
 *
 * role="status" + aria-live="polite" để trình đọc màn hình đọc khi trạng thái đổi,
 * nhưng không cắt ngang thao tác đang làm.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div className={styles.banner} role="status" aria-live="polite">
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
        <path d="M3 3l18 18" />
        <path d="M5 12.5a10 10 0 0 1 4-2.4" />
        <path d="M15 10.1a10 10 0 0 1 4 2.4" />
        <path d="M9 16.2a5 5 0 0 1 6 0" />
        <path d="M12 20v.01" />
      </svg>
      <p className={styles.detail}>
        <span className={styles.title}>{t('offline.title')}. </span>
        {t('offline.detail')}
      </p>
    </div>
  );
}
