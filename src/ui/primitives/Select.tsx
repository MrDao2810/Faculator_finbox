'use client';

import { useId, type ReactNode, type SelectHTMLAttributes } from 'react';

import styles from './Select.module.css';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label: string;
  /** Dòng gợi ý dưới ô. */
  hint?: string;
  /** Ẩn nhãn khỏi mắt nhưng vẫn để trình đọc màn hình đọc được. */
  hideLabel?: boolean;
  children: ReactNode;
}

/**
 * Primitive danh sách chọn — gói WBS 2.3.3.
 *
 * Dùng `<select>` gốc của hệ điều hành chứ không tự dựng dropdown: trên điện thoại nó mở
 * bánh xe chọn quen thuộc, bàn phím và trình đọc màn hình xử đúng sẵn, và không tốn thêm
 * dung lượng gói (NFR-PER-04). Cái primitive này thêm vào là phần nhãn, gợi ý và kiểu dáng
 * thống nhất với Input — trước đây mỗi chỗ dùng lại tự viết một kiểu.
 */
export function Select({
  label,
  hint,
  hideLabel = false,
  className,
  id,
  children,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const hintId = `${selectId}-hint`;

  const classes = [styles.field, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <label className={hideLabel ? 'visually-hidden' : styles.label} htmlFor={selectId}>
        {label}
      </label>

      <select
        id={selectId}
        className={styles.select}
        aria-describedby={hint === undefined ? undefined : hintId}
        {...rest}
      >
        {children}
      </select>

      {hint !== undefined && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
