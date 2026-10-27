'use client';

import { NO_VALUE } from '@/application';
import type { CalcWarning } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

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
 * WF-15 chốt khuôn hiển thị: giá trị hiện `_ _`, dưới là câu nêu nguyên nhân, dòng cuối là
 * gợi ý sửa sau mũi tên ↳. Sáu mã lỗi chuẩn đều đi qua đây, câu chữ lấy từ chính `CalcWarning`
 * do tầng Domain dựng — component không tự chế lời (NFR-USA-04).
 *
 * Quy tắc nguyên văn của WF-15: "tuyệt đối không hiện NaN, Infinity, hay 0 thay cho lỗi".
 * Ở đây `_ _` là hằng số `NO_VALUE`, dùng chung với `formatCalcOutput()` — bản vẽ ghi `— , —`, và
 * chuỗi ấy đã đổi thành hai gạch dưới; lý do đầy đủ ở docblock của `NO_VALUE` trong `format.ts`.
 */
export function ErrorState({ warning, unit, action, className }: ErrorStateProps) {
  const t = useT();
  const pick = usePick();
  const classes = [styles.block, className].filter(Boolean).join(' ');

  /*
   * Không còn nhãn mã lỗi ("Không có ý nghĩa", "Chia cho 0"…) ở góc thẻ — chủ dự án chụp thẻ lỗi của
   * XIRR, 20/10/2026: _"xóa đoạn cảnh báo 'Không có ý nghĩa' đi"_. Câu nguyên nhân ngay dưới đã nói
   * bằng lời thường điều nhãn ấy gọi bằng tên kỹ thuật, nên nhãn chỉ là một lần nói thứ hai. Dấu hiệu
   * không dựa vào màu (NFR-USA-06) vẫn đủ: viền đứt, chỗ trống `_ _`, và chính câu nguyên nhân.
   *
   * Mã vẫn nằm trên thẻ ở `data-ma-loi`, không hiện ra mắt: ca kiểm cần biết thẻ đang báo mã nào
   * (chờ chuỗi giá hay lỗi thật), và trước đây chúng đọc nó qua chữ của nhãn.
   *
   * Câu nguyên nhân, dòng ↳ và nút lối ra chung một khối `.cause`, đứng CÙNG HÀNG với `_ _` và dạt mép
   * phải khi đủ chỗ (27/10/2026, chủ dự án chỉ mũi tên trên thẻ của XIRR). Gói chung để dòng ↳ đi theo
   * câu nó sửa, không bị bỏ lại ở mép trái hàng dưới. Bố cục ở `ErrorState.module.css`.
   */
  return (
    <div className={classes} role="alert" data-ma-loi={warning.code}>
      <div className={styles.head}>
        <span className={styles.value}>{NO_VALUE}</span>
        {unit !== undefined && unit.trim() !== '' && <span className={styles.unit}>{unit}</span>}
      </div>

      <div className={styles.cause}>
        <p className={styles.message}>{pick(warning.message)}</p>

        {warning.fix !== undefined && (
          <p className={styles.fix}>
            <span aria-hidden="true">{t('result.fixPrefix')} </span>
            {pick(warning.fix)}
          </p>
        )}

        {action}
      </div>
    </div>
  );
}
