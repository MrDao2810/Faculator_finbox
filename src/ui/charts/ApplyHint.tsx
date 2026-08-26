'use client';

import { useT } from '@/application/preferences-context';

import styles from './chart.module.css';

/**
 * Dòng gợi ý về lối "bấm vào biểu đồ để áp dụng giá trị" — hai trạng thái, hai câu.
 *
 * ── Vì sao có component này ──────────────────────────────────────────────────────────────────
 *
 * Trước đợt này chỉ có MỘT câu, và nó chỉ hiện ở trạng thái PHỦ ĐỊNH: "trục đang là thời gian nên
 * bấm không ghi được gì — đổi sang một biến số...". Người dùng làm đúng theo lời khuyên đó, đổi
 * trục, rồi câu ấy biến mất và không còn dấu hiệu nào cho biết giờ bấm được. Tức lối tương tác duy
 * nhất của biểu đồ tự giấu mình đi đúng vào lúc nó bắt đầu hoạt động.
 *
 * Nay `ChartBody` tính ra một trong ba trạng thái rồi truyền xuống, còn chỗ chọn câu, chọn màu và
 * chọn icon nằm trọn ở đây — vì cùng dòng ấy dựng ở HAI nơi (dưới hình trên trang và trong màn
 * phóng to), và hai bản nói khác nhau thì người dùng đọc ra hai sự thật khác nhau về cùng một hình.
 *
 * ── Ba điều phải giữ ─────────────────────────────────────────────────────────────────────────
 *
 * 1. **Không bọc trong `@media (hover: hover)`.** Đây là dòng CHỮ, không phải hiệu ứng rê chuột:
 *    máy cảm ứng không có hover nhưng vẫn chạm được, nên nó là nơi DUY NHẤT người dùng điện thoại
 *    biết tới tính năng này. Con trỏ và vạch dò mới là phần chỉ có ở máy có chuột.
 * 2. **Icon là SVG thuần, không `<title>`, không ký tự.** Ca kiểm dò dòng này bằng `getByText` với
 *    nguyên văn chuỗi i18n; một chữ nào lọt vào là chuỗi không còn khớp.
 * 3. **`role="status"` chỉ cho trạng thái `switch`.** Nó là câu trả lời cho một cú bấm vừa không
 *    làm gì, nên cần đọc lên. Câu `ready` thì ngược lại — nó có mặt sẵn từ lúc đổi trục, đọc lên
 *    mỗi lần dựng lại là ồn.
 */

export type ApplyHintState = 'ready' | 'switch';

export interface ApplyHintProps {
  state: ApplyHintState;
}

/** Con trỏ hình bàn tay đang trỏ — cùng hình mà `cursor: pointer` vẽ ra ở vùng vẽ. */
const CURSOR_PATH =
  'M9 11.5V5a1.5 1.5 0 0 1 3 0v6M12 11V9.5a1.5 1.5 0 0 1 3 0V11M15 11v-.5a1.5 1.5 0 0 1 3 0V15a5 5 0 0 1-5 5h-1.2a4 4 0 0 1-3.1-1.5L6 15.2a1.5 1.5 0 0 1 2.3-1.9l.7.8';

export function ApplyHint({ state }: ApplyHintProps) {
  const t = useT();

  if (state === 'switch') {
    return (
      <p className={styles.applyHint} role="status">
        {t('chart.applyHintTimeAxis')}
      </p>
    );
  }

  return (
    <p className={`${styles.applyHint} ${styles.applyHintReady}`}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d={CURSOR_PATH} />
      </svg>
      {t('chart.applyHintReady')}
    </p>
  );
}
