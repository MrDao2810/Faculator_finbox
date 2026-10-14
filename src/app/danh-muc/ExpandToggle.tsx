'use client';

import type { MouseEvent } from 'react';

import styles from './ExpandToggle.module.css';

export interface ExpandToggleProps {
  open: boolean;
  /**
   * id (một hoặc nhiều, cách nhau bằng dấu cách) của phần mở/đóng — `aria-controls`. Bỏ trống khi phần
   * ấy chưa nằm trong DOM (dòng chi tiết chỉ dựng lúc mở): trỏ vào một id không tồn tại thì trình đọc
   * màn hình lặng lẽ bỏ qua, không báo lỗi gì.
   */
  controls?: string;
  /** Tên đọc cho trình đọc màn hình: "Chi tiết", "Chi tiết FPT". Trạng thái nằm ở `aria-expanded`. */
  label: string;
  onToggle: () => void;
}

/**
 * Nút mũi tên mở/đóng của màn Danh mục ở khổ điện thoại (bản vẽ 14/10/2026) — cuối hàng thu gọn của
 * thẻ tóm tắt và cuối mỗi dòng của hai bảng. Một component cho cả ba chỗ để ba mũi tên cùng cỡ, cùng
 * màu, cùng cách xoay; chép ba bản là ba chỗ lệch nhau ở lần chỉnh sau.
 *
 * Chỉ hiện DƯỚI 1024px (`ExpandToggle.module.css`): từ 1024px thẻ tóm tắt mở sẵn và bảng đủ cột, không
 * có gì để mở. Ẩn bằng `display: none` nên ở khổ PC nó ra khỏi cây truy cập luôn.
 *
 * Chặn sự kiện nổi lên: nút nằm TRONG dòng bảng, mà cả dòng cũng mở/đóng khi bấm — không chặn thì một
 * cú bấm vào mũi tên mở rồi đóng lại ngay.
 */
export function ExpandToggle({ open, controls, label, onToggle }: ExpandToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={label}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}
