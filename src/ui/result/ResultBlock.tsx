'use client';

import type { ReactNode } from 'react';

import { formatNumber, isCalculated } from '@/application';
import type { CalcOutput } from '@/application';
import { useT } from '@/application/preferences-context';

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
 * Không tính được thì KHÔNG tự vẽ lấy: giao cho ErrorState, để khuôn `— , —` + nguyên nhân +
 * gợi ý sửa của WF-15 chỉ có một chỗ định nghĩa. Bất biến FR-06 nhờ vậy không phụ thuộc việc
 * người viết màn có nhớ kiểm `value === null` hay không.
 *
 * `aria-live="polite"` để trình đọc màn hình đọc lại con số sau mỗi lần đổi đầu vào, nhưng
 * không cắt ngang thao tác đang làm — cùng cách với dòng đếm kết quả ở màn danh sách.
 */
export function ResultBlock({ output, interpretation, action, className }: ResultBlockProps) {
  const t = useT();
  if (!isCalculated(output)) {
    const warning = output.warning;
    // fail() luôn kèm warning, nhưng CalcOutput dựng tay có thể thiếu — vẫn phải không vỡ.
    if (warning === undefined) {
      return (
        <div className={[styles.block, className].filter(Boolean).join(' ')} role="alert">
          <span className={styles.value}>{t('result.unavailable')}</span>
        </div>
      );
    }
    return (
      <ErrorState warning={warning} unit={output.unit} action={action} className={className} />
    );
  }

  const classes = [styles.block, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className={styles.eyebrow}>{t('result.eyebrow')}</span>

      <p className={styles.figure} aria-live="polite">
        <span className={styles.value}>{formatNumber(output.value)}</span>
        {output.unit.trim() !== '' && <span className={styles.unit}> {output.unit}</span>}
      </p>

      {interpretation !== undefined && <p className={styles.interpretation}>{interpretation}</p>}

      {action}

      {/*
        Nhãn 'cập nhật tức thì' (FR-05) nay ở góc dưới phải, không còn đứng cùng hàng với chữ
        KẾT QUẢ — bản thiết kế đợt 12. Nó là ghi chú về CÁCH con số vận hành, nên đứng sau con
        số đọc thuận hơn là đứng trước.
      */}
      <span className={styles.live}>{t('result.live')}</span>
    </div>
  );
}
