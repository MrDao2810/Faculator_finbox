'use client';

import { useT } from '@/application/preferences-context';

import styles from './ChartKindToggle.module.css';

/**
 * Chọn lối vẽ chuỗi chính: ĐƯỜNG hay CỘT.
 *
 * Cùng một bộ số liệu, hai cách đọc. Đường nói về ĐỘ DỐC — "tăng nhanh dần", thứ mà lãi kép cần.
 * Cột nói về ĐỘ LỚN từng mức và cho phép đếm — "mức này gấp rưỡi mức kia". Không cái nào thay được
 * cái kia, nên để người đọc chọn thay vì khai sẵn hộ họ.
 *
 * Điều kiện để nút này XUẤT HIỆN nằm ở `ChartBody`, không ở đây, vì chỉ nơi ấy nhìn thấy cả model:
 * biểu đồ phải có đúng MỘT chuỗi (cột chồng lên đường phụ thì không đọc được), và phải là
 * `kind: 'line'` (thác nước vốn đã là cột, với ý nghĩa khác hẳn).
 *
 * `aria-pressed` chứ không phải radio, đúng khuôn `ButtonGroup` và `ModeToggle`: đây là nhóm nút
 * thao tác tức thì, đổi một cái là hình vẽ lại ngay, không phải trường chờ submit.
 */

export type ChartKind = 'line' | 'bar';

export interface ChartKindToggleProps {
  value: ChartKind;
  onChange: (kind: ChartKind) => void;
  /**
   * Gốc để ghép `id` của nhãn nhóm — bắt buộc, cùng lý do với `SweepPicker`.
   *
   * Ô chọn này cũng được dựng LẠI trong màn phóng to, nên hai bản cùng nằm trong DOM. Một `id`
   * trùng là `aria-labelledby` của bản phóng to trỏ về nhãn của bản trên trang.
   */
  idBase: string;
}

export function ChartKindToggle({ value, onChange, idBase }: ChartKindToggleProps) {
  const t = useT();
  const labelId = `${idBase}-kind-label`;

  const options: ReadonlyArray<{ kind: ChartKind; label: string }> = [
    { kind: 'line', label: t('chart.kindLine') },
    { kind: 'bar', label: t('chart.kindBar') },
  ];

  return (
    <div className={styles.kind}>
      <span className={styles.kindLabel} id={labelId}>
        {t('chart.kindLabel')}
      </span>
      <div className={styles.kindGroup} role="group" aria-labelledby={labelId}>
        {options.map((option) => {
          const selected = option.kind === value;
          return (
            <button
              key={option.kind}
              type="button"
              className={
                selected
                  ? `${String(styles.kindOption)} ${String(styles.kindSelected)}`
                  : styles.kindOption
              }
              aria-pressed={selected}
              onClick={() => {
                onChange(option.kind);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
