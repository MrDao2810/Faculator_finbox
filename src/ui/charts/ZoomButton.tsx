'use client';

import { useT } from '@/application/preferences-context';

import styles from './chart.module.css';

/**
 * Nút phóng to biểu đồ, đứng cạnh ô chọn trục X.
 *
 * Có CHỮ chứ không chỉ có biểu tượng: bốn mũi tên toả ra bốn góc là quy ước quen với người dùng
 * thành thạo, nhưng đối tượng chính của sản phẩm là người mới (F0), và một biểu tượng không chú thích
 * là thứ họ đoán chứ không đọc. Biểu tượng vẫn còn để mắt bám nhanh, `aria-hidden` để trình đọc màn
 * hình không đọc hai lần.
 *
 * Không dùng `Button` primitive: nút này phải cao ĐÚNG bằng ô `<select>` bên cạnh để hai thứ thẳng
 * hàng, mà `Button` mang chiều cao riêng theo `size`. Vùng chạm 44px vẫn giữ (NFR-USA-01).
 */

export interface ZoomButtonProps {
  onClick: () => void;
}

export function ZoomButton({ onClick }: ZoomButtonProps) {
  const t = useT();

  return (
    <button type="button" className={styles.zoom} onClick={onClick}>
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Bốn mũi tên toả ra bốn góc — quy ước "mở rộng" của mọi trình phát video. */}
        <path d="M9 3H3v6M15 3h6v6M9 21H3v-6M15 21h6v-6" />
      </svg>
      {t('chart.zoom')}
    </button>
  );
}
