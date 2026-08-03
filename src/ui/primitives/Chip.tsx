'use client';

import type { ButtonHTMLAttributes } from 'react';

import styles from './Chip.module.css';

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  /** Số đếm hiện sau nhãn, ví dụ chip nhóm ở WF-02. */
  count?: number;
  selected?: boolean;
}

/**
 * Primitive chip — gói WBS 1.2.1.
 *
 * Luôn là <button> để bàn phím và trình đọc màn hình dùng được;
 * trạng thái đang chọn báo bằng aria-pressed chứ không chỉ bằng màu (NFR-USA-06).
 */
export function Chip({ label, count, selected = false, className, ...rest }: ChipProps) {
  const classes = [styles.chip, selected ? styles.selected : undefined, className]
    .filter(Boolean)
    .join(' ');

  return (
    <button type="button" className={classes} aria-pressed={selected} {...rest}>
      <span>{label}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </button>
  );
}
