'use client';

import { useId, type InputHTMLAttributes } from 'react';

import styles from './Input.module.css';

/**
 * Sắc thái của ô nhập.
 * `derived` = đang nhận giá trị tự động từ công thức khác, `locked` = bị khoá ở chế độ Cơ bản.
 * Bộ năm trạng thái đầy đủ của WF-16 do gói 2.3.1 dựng trên nền primitive này.
 */
export type InputTone = 'default' | 'invalid' | 'derived' | 'locked';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  /** Đơn vị hiện bên phải ô, ví dụ '₫', '%', 'lần'. */
  unit?: string;
  /** Dòng gợi ý dưới ô, ví dụ 'Tối thiểu 0 ₫'. */
  hint?: string;
  /** Câu lỗi. Có câu này thì ô tự chuyển sắc thái invalid và báo cho trình đọc màn hình. */
  error?: string;
  tone?: InputTone;
  /** Ẩn nhãn khỏi mắt nhưng vẫn để trình đọc màn hình đọc được. */
  hideLabel?: boolean;
}

/**
 * Primitive ô nhập — gói WBS 1.2.1.
 *
 * Nhãn luôn tồn tại và luôn gắn với ô bằng htmlFor/id — không dùng placeholder thay nhãn.
 * Trạng thái phân biệt bằng viền và chữ, không chỉ bằng màu (NFR-USA-06).
 */
export function Input({
  label,
  unit,
  hint,
  error,
  tone = 'default',
  hideLabel = false,
  className,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const effectiveTone: InputTone = error !== undefined ? 'invalid' : tone;

  const describedBy = [
    hint !== undefined ? hintId : undefined,
    error !== undefined ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperClasses = [styles.field, styles[`tone-${effectiveTone}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={wrapperClasses}>
      <label className={hideLabel ? 'visually-hidden' : styles.label} htmlFor={inputId}>
        {label}
      </label>

      <div className={styles.control}>
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error !== undefined || undefined}
          aria-describedby={describedBy === '' ? undefined : describedBy}
          {...rest}
        />
        {unit !== undefined && (
          <span className={styles.unit} aria-hidden="true">
            {unit}
          </span>
        )}
      </div>

      {hint !== undefined && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error !== undefined && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
