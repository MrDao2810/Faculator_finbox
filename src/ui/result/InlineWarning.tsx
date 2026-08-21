'use client';

import { WARNING_LABELS } from '@/application';
import type { CalcWarning } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import styles from './InlineWarning.module.css';

export interface InlineWarningProps {
  warning: CalcWarning;
  className?: string;
}

/**
 * Cảnh báo gọn đặt cạnh ô nhập — gói WBS 2.4.2.
 *
 * Bản rút gọn của ErrorState, dùng khi lỗi thuộc về MỘT ô chứ không phải cả phép tính —
 * ví dụ ô WACC đang kế thừa lỗi từ Beta ở thượng nguồn (FR-15).
 *
 * Dấu hiệu là biểu tượng + nhãn chữ + viền, không phải chỉ màu (NFR-USA-06).
 * Cần 'use client' vì chữ lấy qua hook `useT()` theo locale, dù component không bắt sự kiện.
 */
export function InlineWarning({ warning, className }: InlineWarningProps) {
  const t = useT();
  const pick = usePick();
  const classes = [styles.warning, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="status">
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
        <path d="M12 3 2 20h20L12 3z" />
        <path d="M12 10v4" />
        <path d="M12 17v.01" />
      </svg>

      <div className={styles.body}>
        <span className={styles.label}>{pick(WARNING_LABELS[warning.code])}</span>
        <span className={styles.message}>{pick(warning.message)}</span>
        {warning.fix !== undefined && (
          <span className={styles.fix}>
            {t('result.fixPrefix')} {pick(warning.fix)}
          </span>
        )}
      </div>
    </div>
  );
}
