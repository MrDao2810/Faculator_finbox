'use client';

import type { ReactNode } from 'react';

import { formatNumber, isCalculated, unitLabel } from '@/application';
import type { CalcOutput } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import { ErrorState } from './ErrorState';
import styles from './ResultBlock.module.css';

export interface ResultBlockProps {
  output: CalcOutput;
  /** Câu diễn giải kết quả, ví dụ 'Cao hơn trung bình ngành (12,4)…' — khối 4 của WF-03. */
  interpretation?: string;
  /** Nút gợi ý lối ra khi lỗi, ví dụ “Gợi ý chuyển sang P/B”. */
  action?: ReactNode;
  className?: string;
}

/**
 * Khối kết quả — gói WBS 2.4.1.
 *
 * WF-03 khối 4: số lớn + đơn vị + một câu diễn giải, kèm nhãn 'cập nhật tức thì' (FR-05).
 *
 * Không tính được thì KHÔNG tự vẽ lấy: giao cho ErrorState, để khuôn `_ _` + nguyên nhân +
 * gợi ý sửa của WF-15 chỉ có một chỗ định nghĩa. Bất biến FR-06 nhờ vậy không phụ thuộc việc
 * người viết màn có nhớ kiểm `value === null` hay không.
 *
 * `aria-live="polite"` để trình đọc màn hình đọc lại con số sau mỗi lần đổi đầu vào, nhưng
 * không cắt ngang thao tác đang làm — cùng cách với dòng đếm kết quả ở màn danh sách.
 */
export function ResultBlock({ output, interpretation, action, className }: ResultBlockProps) {
  const t = useT();
  const pick = usePick();
  /* Đơn vị Domain là chuỗi tiếng Việt trần; dịch MỘT lần rồi dùng cho cả hai nhánh dưới. */
  const donVi = pick(unitLabel(output.unit));

  if (!isCalculated(output)) {
    const warning = output.warning;
    // fail() luôn kèm warning, nhưng CalcOutput dựng tay có thể thiếu — vẫn phải không vỡ.
    if (warning === undefined) {
      return (
        <div
          className={[styles.block, styles.blockPlain, className].filter(Boolean).join(' ')}
          role="alert"
        >
          <span className={styles.value}>{t('result.unavailable')}</span>
        </div>
      );
    }
    return <ErrorState warning={warning} unit={donVi} action={action} className={className} />;
  }

  const classes = [styles.block, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {/*
        Dòng nhãn nay chỉ còn chữ KẾT QUẢ.

        Nhãn FR-05 'cập nhật tức thì' từng đứng cùng hàng ở đây (và trước nữa là ở góc dưới phải
        thẻ) — chủ dự án chốt bỏ 14/09/2026, cùng mục #34 của bảng feedback. FR-05 vẫn giữ bằng
        CHỨC NĂNG: gõ tới đâu con số đổi tới đó, người dùng thấy ngay ở lần gõ đầu. Xem `vi.ts`.

        Một `<span>` trơn, không lồng thêm: ba ca kiểm ở `FormulaDetail.test.tsx` dò đúng chuỗi
        'KẾT QUẢ' bằng `getByText`, vốn khớp TRỌN nội dung một thẻ — nên thẻ này phải chứa đúng
        chừng ấy chữ, không kèm gì khác.
      */}
      <span className={styles.eyebrow}>{t('result.eyebrow')}</span>

      <p className={styles.figure} aria-live="polite">
        <span className={styles.value}>{formatNumber(output.value)}</span>
        {donVi.trim() !== '' && <span className={styles.unit}> {donVi}</span>}
      </p>

      {interpretation !== undefined && <p className={styles.interpretation}>{interpretation}</p>}

      {action}
    </div>
  );
}
