import type { ReactNode } from 'react';

import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  title: string;
  /** Một hoặc hai dòng giải thích. Dòng đầu nên nói rõ phạm vi sản phẩm. */
  lines: ReadonlyArray<string>;
  /** Nút gợi ý lối ra, ví dụ “Xoá bộ lọc”. */
  action?: ReactNode;
}

/**
 * Trạng thái rỗng — gói WBS 2.2.
 *
 * WF-09 trạng thái B chốt: khi không có kết quả thì phải nói rõ PHẠM VI SẢN PHẨM
 * (không có tiền mã hoá) và chỉ ra lối đi tiếp, chứ không để một màn trắng.
 */
export function EmptyState({ title, lines, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <svg
        className={styles.icon}
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
        <path d="M8.5 11h5" />
      </svg>

      <div className={styles.title}>{title}</div>
      {lines.map((line) => (
        <p key={line} className={styles.line}>
          {line}
        </p>
      ))}
      {action}
    </div>
  );
}
