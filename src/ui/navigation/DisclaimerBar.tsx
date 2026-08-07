import { t } from '@/application';

import styles from './DisclaimerBar.module.css';

export interface DisclaimerBarProps {
  /**
   * `footer` — dải chữ nhỏ ở chân trang, do AppShell dựng cho mọi màn.
   * `notice` — ô vàng nổi bật đặt ngay đầu màn có kết quả tính.
   */
  variant?: 'footer' | 'notice';
}

/**
 * Dải miễn trừ trách nhiệm — gói WBS 2.1.3.
 *
 * FR-24 · UI-04: phải có mặt ở MỌI màn. Bản `footer` đặt cố định trong AppShell nên không màn
 * nào quên được, và không có nút đóng. Từ đợt 8 nó nằm ở chân trang theo yêu cầu của chủ dự án.
 *
 * Bản `notice` có từ đợt 10, dùng cho màn chi tiết công thức: chân trang là chỗ tốt cho một
 * lời nhắc thường trực, nhưng ở màn ĐANG BÀY RA MỘT CON SỐ TIỀN thì câu miễn trừ phải nằm
 * cạnh con số ấy chứ không phải cách đó hai màn hình cuộn. Bản thiết kế hi-fi vẽ đúng như vậy.
 *
 * Dấu hiệu là biểu tượng + chữ, không phải chỉ màu (NFR-USA-06).
 */
export function DisclaimerBar({ variant = 'footer' }: DisclaimerBarProps = {}) {
  return (
    <div className={variant === 'notice' ? styles.notice : styles.bar} role="note">
      <svg
        className={styles.icon}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5" />
        <path d="M12 16.5v.01" />
      </svg>
      <p className={styles.text}>{t('disclaimer.text')}</p>
    </div>
  );
}
