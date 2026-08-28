import type { ReactNode } from 'react';

import styles from './Badge.module.css';

/**
 * `basic` / `advanced` — cấp độ của một công thức hay một ô nhập.
 * `code` — mã chứng khoán đứng đầu một dòng danh sách.
 */
export type BadgeTone = 'basic' | 'advanced' | 'code';

export interface BadgeProps {
  tone: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * Primitive huy hiệu — gom bảy bản chép của đợt rà soát phân cấp thị giác.
 *
 * Trước đợt này `.badge` được khai lại trong bảy CSS Module riêng, và bốn bản của CÙNG một huy
 * hiệu "nâng cao" render ra bốn kiểu (chi tiết ở `Badge.module.css`). Bản rà soát thiết kế báo
 * "Search, Tab, Input, Button, Warning… hiện đang lặp lại nhưng chưa đồng nhất giữa các màn" —
 * đây là một trong những chỗ lặp đó, và là chỗ đo được rõ nhất.
 *
 * Không có `'use client'` và không gọi hook nào: `FormulaCard` dùng huy hiệu này và nó được
 * dựng từ CẢ hai phía — `FormulaBrowser` phía máy khách lẫn `StaticFormulaList` phía máy chủ.
 * Một hook ở đây sẽ làm hỏng lượt dựng phía máy chủ.
 *
 * Chữ bên trong do nơi gọi truyền vào, nên nó vẫn đi qua `useT()`/`<T>` của chính nơi gọi —
 * primitive này không tự đọc từ điển.
 */
export function Badge({ tone, children, className }: BadgeProps) {
  const classes = [styles.badge, styles[tone], className].filter(Boolean).join(' ');

  return <span className={classes}>{children}</span>;
}
