'use client';

import type { DangVe, MessageKey } from '@/application';
import { useT } from '@/application/preferences-context';
import { Select } from '@/ui/primitives';

import styles from './chart.module.css';

/**
 * Ô chọn "Loại biểu đồ" — DẠNG VẼ của hình đang xem (21/10/2026).
 *
 * Thay cho hai nút Đường / Cột. Chủ dự án muốn nhiều dạng vẽ hơn hai và chọn một ô chọn khi được hỏi
 * (_"chuyển thành select để chọn xem loại biểu đồ"_): hàng nút chữ năm nút tràn khổ 360px, còn ô
 * chọn thì cùng một bề ngang dù hình mời hai dạng hay năm.
 *
 * Danh sách đến từ `dangVeCuaHinh()` bên Domain, không dựng ở đây: chỉ chỗ ấy nhìn thấy cả mô hình
 * (một chuỗi hay nhiều, trục rời rạc hay liên tục, kết quả có đổi dấu không). Ô chọn chỉ in.
 *
 * Dùng `Select` primitive với đúng lớp `.picker` của ô "Xem theo" bên cạnh, nên hai ô cao bằng
 * nhau, cùng bo góc, cùng cỡ nhãn ở mọi khổ mà không file nào phải chép số của file nào. `id` nhận từ
 * `idBase`, không để `Select` tự sinh bằng `useId()` — cả cây biểu đồ nằm sau `next/dynamic`.
 */

/** Nhãn của từng dạng. */
const NHAN: Readonly<Record<DangVe, MessageKey>> = {
  line: 'chart.kindLine',
  candle: 'chart.kindCandle',
  bar: 'chart.kindBar',
  dots: 'chart.kindDots',
  step: 'chart.kindStep',
  signArea: 'chart.kindSignArea',
  waterfall: 'chart.kindWaterfall',
  donut: 'chart.kindDonut',
};

export interface ChartKindSelectProps {
  /** Các dạng hình đang mời, phần tử đầu là dạng mặc định. */
  options: ReadonlyArray<DangVe>;
  /** Dạng đang vẽ thật sự (đã lọc qua `options`). */
  value: DangVe;
  onChange: (dang: DangVe) => void;
  /** Gốc để ghép `id` — bắt buộc, cùng lý do với `SweepPicker`. */
  idBase: string;
}

export function ChartKindSelect({ options, value, onChange, idBase }: ChartKindSelectProps) {
  const t = useT();

  // Một dạng thì không có gì để đổi.
  if (options.length < 2) return null;

  return (
    <Select
      className={`${String(styles.picker)} ${String(styles.kindPicker)}`}
      id={`${idBase}-kind`}
      label={t('chart.kindLabel')}
      value={value}
      onChange={(event) => {
        const chon = options.find((dang) => dang === event.target.value);
        if (chon !== undefined) onChange(chon);
      }}
    >
      {options.map((dang) => (
        <option key={dang} value={dang}>
          {t(NHAN[dang])}
        </option>
      ))}
    </Select>
  );
}
