import { NO_VALUE, WARNING_LABELS, t } from '@/application';
import type { CalcWarning } from '@/application';

import styles from './ErrorState.module.css';

export interface ErrorStateProps {
  warning: CalcWarning;
  /** Đơn vị của đại lượng đang tính — vẫn hiện để người dùng biết đang đọc cái gì. */
  unit?: string;
  /** Nút gợi ý lối ra, ví dụ “Gợi ý chuyển sang P/B”. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * Trạng thái lỗi đặt ở đúng chỗ đáng ra là kết quả — gói WBS 2.4.2.
 *
 * WF-15 chốt khuôn hiển thị: giá trị hiện `— , —`, dưới là câu nêu nguyên nhân, dòng cuối là
 * gợi ý sửa sau mũi tên ↳. Sáu mã lỗi chuẩn đều đi qua đây, câu chữ lấy từ chính `CalcWarning`
 * do tầng Domain dựng — component không tự chế lời (NFR-USA-04).
 *
 * Quy tắc nguyên văn của WF-15: "tuyệt đối không hiện NaN, Infinity, hay 0 thay cho lỗi".
 * Ở đây `— , —` là hằng số `NO_VALUE`, dùng chung với `formatCalcOutput()`.
 */
export function ErrorState({ warning, unit, action, className }: ErrorStateProps) {
  const classes = [styles.block, className].filter(Boolean).join(' ');

  return (
    <div className={classes} role="alert">
      <div className={styles.head}>
        <span className={styles.value}>{NO_VALUE}</span>
        {unit !== undefined && unit.trim() !== '' && <span className={styles.unit}>{unit}</span>}
        <span className={styles.chip}>{WARNING_LABELS[warning.code]}</span>
      </div>

      <p className={styles.message}>{warning.message}</p>

      {warning.fix !== undefined && (
        <p className={styles.fix}>
          <span aria-hidden="true">{t('result.fixPrefix')} </span>
          {warning.fix}
        </p>
      )}

      {action}
    </div>
  );
}
