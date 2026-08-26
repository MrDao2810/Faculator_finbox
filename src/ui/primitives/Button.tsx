'use client';

import type { ButtonHTMLAttributes, Ref } from 'react';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /**
   * Tham chiếu tới thẻ `<button>` thật.
   *
   * `ButtonHTMLAttributes` KHÔNG mang sẵn `ref` (nó nằm ở `ClassAttributes`), nên phải khai tay.
   * Không cần `forwardRef`: từ React 19 `ref` là prop thường của function component, và nó đi
   * theo `...rest` xuống thẻ `<button>` bên dưới.
   *
   * Thêm ở đợt 13 cho thanh Hoàn tác của màn Cài đặt — chỗ duy nhất trong repo cần đưa tiêu điểm
   * tới một nút bằng mã, vì nút vừa bấm bị vô hiệu hoá ngay trong cùng nhịp dựng lại.
   */
  ref?: Ref<HTMLButtonElement>;
}

/**
 * Primitive nút — gói WBS 1.2.1.
 *
 * Mặc định `type="button"` để nút đặt trong form không vô tình submit.
 * Vùng chạm ≥ 44px và vòng focus lấy từ globals.css (NFR-USA-01, NFR-USA-06).
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[variant],
    size === 'sm' ? styles.sm : undefined,
    fullWidth ? styles.fullWidth : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classes} {...rest} />;
}
