'use client';

import { t } from '@/application';
import type { SweepOption } from '@/application';
import { Select } from '@/ui/primitives';

import styles from './chart.module.css';

/**
 * Ô chọn biến đưa lên trục X.
 *
 * Đây là chỗ biểu đồ thôi làm hình minh hoạ và thành công cụ hỏi "nếu… thì sao": P/E theo giá là
 * một câu chuyện, P/E theo EPS là câu chuyện khác, và người dùng đổi được giữa hai câu ấy mà không
 * ai phải khai trước cái nào đáng xem hơn.
 *
 * Dùng `Select` primitive nên được luôn nhãn, tiêu điểm bàn phím và vùng chạm 44px của WF-16 —
 * không tự dựng dropdown.
 */

export interface SweepPickerProps {
  options: ReadonlyArray<SweepOption>;
  value: string;
  onChange: (key: string) => void;
}

export function SweepPicker({ options, value, onChange }: SweepPickerProps) {
  // Một biến thì không có gì để đổi — bày ra một ô chọn chỉ có một dòng là bày ra thứ vô dụng.
  if (options.length < 2) return null;

  return (
    <Select
      className={styles.picker}
      label={t('chart.sweepLabel')}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    >
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
