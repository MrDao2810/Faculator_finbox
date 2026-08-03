import type { ReactNode } from 'react';

import styles from './Table.module.css';

export interface TableProps {
  /** Câu mô tả bảng — bắt buộc, để trình đọc màn hình biết đang đọc bảng gì. */
  caption: string;
  /** Ẩn caption khỏi mắt khi thẻ bao ngoài đã có tiêu đề. */
  hideCaption?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Primitive khung bảng — gói WBS 1.2.1.
 *
 * Chỉ là cái vỏ: vùng cuộn ngang riêng (NFR-USA-02), caption, và kiểu chữ số đều.
 * Bảng sửa inline của WF-05 và lịch trả nợ của WF-14 dựng tiếp trên khung này.
 *
 * Cột số thì đặt className="numeric" cho <th>/<td> để căn phải.
 */
export function Table({ caption, hideCaption = false, children, className }: TableProps) {
  const classes = [styles.table, className].filter(Boolean).join(' ');

  return (
    // tabIndex để vùng cuộn lăn được bằng bàn phím — yêu cầu của audit tiếp cận 7.1.3.
    <div className={styles.scroller} tabIndex={0} role="group" aria-label={caption}>
      <table className={classes}>
        <caption className={hideCaption ? 'visually-hidden' : undefined}>{caption}</caption>
        {children}
      </table>
    </div>
  );
}
