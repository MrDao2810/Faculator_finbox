'use client';

import type { SweepOption } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
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
  /**
   * Gốc để ghép `id` của ô chọn — bắt buộc, xem docblock của `ChartBody`.
   *
   * `Select` mặc định tự sinh `id` bằng `useId()`, mà cả cây biểu đồ nằm sau ranh giới
   * `next/dynamic` nên chuỗi ấy lệch nhau giữa máy chủ và máy khách. Truyền `id` tường minh là
   * cách tắt nhánh đó mà không phải sửa primitive dùng chung.
   */
  idBase: string;
}

export function SweepPicker({ options, value, onChange, idBase }: SweepPickerProps) {
  const t = useT();
  const pick = usePick();

  // Một biến thì không có gì để đổi — bày ra một ô chọn chỉ có một dòng là bày ra thứ vô dụng.
  if (options.length < 2) return null;

  return (
    <Select
      className={styles.picker}
      id={`${idBase}-sweep`}
      label={t('chart.sweepLabel')}
      value={value}
      onChange={(event) => {
        onChange(event.target.value);
      }}
    >
      {options.map((option) => (
        <option key={option.key} value={option.key}>
          {pick(option.label)}
        </option>
      ))}
    </Select>
  );
}
