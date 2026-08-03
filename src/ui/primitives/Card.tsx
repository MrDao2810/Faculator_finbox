import type { ReactNode } from 'react';

import styles from './Card.module.css';

export interface CardProps {
  /** Dòng chữ nhỏ in hoa phía trên tiêu đề, ví dụ 'KẾT QUẢ'. */
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** Bỏ đệm trong khi cần dán sát mép, ví dụ nhét một bảng vào thẻ. */
  padded?: boolean;
  className?: string;
}

/**
 * Primitive thẻ — gói WBS 1.2.1.
 * Không có 'use client': thẻ chỉ hiển thị, không bắt sự kiện.
 */
export function Card({ eyebrow, title, subtitle, children, padded = true, className }: CardProps) {
  const classes = [styles.card, padded ? styles.padded : undefined, className]
    .filter(Boolean)
    .join(' ');

  const hasHeader = eyebrow !== undefined || title !== undefined || subtitle !== undefined;

  return (
    <section className={classes}>
      {hasHeader && (
        <header className={styles.header}>
          {eyebrow !== undefined && <span className={styles.eyebrow}>{eyebrow}</span>}
          {title !== undefined && <h2 className={styles.title}>{title}</h2>}
          {subtitle !== undefined && <p className={styles.subtitle}>{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
