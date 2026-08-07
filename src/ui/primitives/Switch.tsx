'use client';

import { useId } from 'react';

import { t } from '@/application';

import styles from './Switch.module.css';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  /** Dòng phụ dưới nhãn, ví dụ giải thích tuỳ chọn làm gì. */
  hint?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * Công tắc bật/tắt cho một giá trị boolean thường — gói WBS 2.5.3.
 *
 * Khác `inputs/Toggle`: cái kia gắn chặt vào `VariableSpec` của một biến công thức (có ô khoá
 * theo chế độ, có dòng ghi nguồn hằng số CON-10). Cái này chỉ nhận `boolean` nên dùng được ở
 * sheet xuất file và màn cài đặt — hai chỗ không có `VariableSpec` nào để bám vào. Hình dáng
 * rãnh và nút giữ đúng của `Toggle` để cả app chỉ có một kiểu công tắc.
 *
 * `role="switch"` để trình đọc màn hình đọc là công tắc chứ không phải hộp kiểm, và chữ
 * "Bật"/"Tắt" luôn hiện nên trạng thái không phụ thuộc màu (NFR-USA-06).
 */
export function Switch({
  checked,
  onChange,
  label,
  hint,
  disabled = false,
  className,
}: SwitchProps) {
  const labelId = useId();
  const hintId = `${labelId}-hint`;

  const classes = [styles.row, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className={styles.text}>
        <span className={styles.label} id={labelId}>
          {label}
        </span>
        {hint !== undefined && (
          <span className={styles.hint} id={hintId}>
            {hint}
          </span>
        )}
      </span>

      <button
        type="button"
        role="switch"
        className={checked ? `${styles.switch} ${styles.on}` : styles.switch}
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={hint === undefined ? undefined : hintId}
        disabled={disabled}
        onClick={() => {
          onChange(!checked);
        }}
      >
        <span className={styles.state}>{t(checked ? 'switch.on' : 'switch.off')}</span>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.knob} />
        </span>
      </button>
    </div>
  );
}
