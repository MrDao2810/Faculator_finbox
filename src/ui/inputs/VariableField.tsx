'use client';

import type { ControlType, Level, VariableSpec } from '@/application';

import { ButtonGroup } from './ButtonGroup';
import { NumberInput } from './NumberInput';
import { RadioGroup } from './RadioGroup';
import { SelectInput } from './SelectInput';
import { SliderInput } from './SliderInput';
import { Toggle } from './Toggle';

export interface VariableFieldProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  /** Dòng phụ ghi nguồn hằng số, chỉ dùng cho toggle liên quan thuế/phí (CON-10). */
  sourceNote?: string;
  className?: string;
}

/**
 * Điều khiển KHÔNG xếp hai cột được ở khổ 360px — phải chiếm trọn một hàng của lưới ô nhập.
 *
 * Ô số và danh sách chọn vừa nửa bề ngang; thanh trượt, nhóm nút và công tắc thì không — chúng
 * cần cả chiều ngang cho nhãn, giá trị và hai mốc min/max. Bản thiết kế hi-fi vẽ đúng vậy: WF-08
 * bốn ô số thành lưới 2×2, WF-14 ba thanh trượt xếp dọc.
 *
 * Ở đây chứ không ở từng màn: danh sách này từng nằm riêng trong `FormulaDetail.tsx`, và khối
 * chuỗi WF-04 dựng sau đã bỏ sót nó — hậu quả là năm thanh trượt của chuỗi WACC rơi vào ô lưới
 * 143px, nhãn vỡ thành sáu dòng một chữ và ô giá trị 14ch lọt hẳn ra ngoài khung, kéo cả trang
 * tràn ngang ở 360px. Một danh sách dùng chung thì màn mới không lệch được nữa.
 */
export function isWideControl(type: ControlType): boolean {
  return type === 'slider' || type === 'buttonGroup' || type === 'radio' || type === 'toggle';
}

/**
 * Chọn đúng điều khiển nhập liệu cho một biến — FR-05, LDR-01.
 *
 * Đây là chỗ biến lời hứa "giao diện sinh hoàn toàn từ VariableSpec" thành sự thật ở cấp màn
 * hình: màn chi tiết chỉ việc duyệt `variablesForLevel()` rồi dựng component này cho từng biến,
 * không màn nào phải biết biến nào dùng ô số và biến nào dùng thanh trượt.
 *
 * Thêm một `ControlType` mới vào Domain thì TypeScript bắt phải xử lý ở đây — `switch` này
 * vét cạn union, thiếu nhánh là hỏng lúc typecheck chứ không âm thầm ra ô trống.
 */
export function VariableField({
  spec,
  value,
  onChange,
  mode,
  sourceNote,
  className,
}: VariableFieldProps) {
  const shared = { spec, value, onChange, mode, className };

  switch (spec.type) {
    case 'slider':
      return <SliderInput {...shared} />;
    case 'buttonGroup':
      return <ButtonGroup {...shared} />;
    case 'radio':
      return <RadioGroup {...shared} />;
    case 'select':
      return <SelectInput {...shared} />;
    case 'toggle':
      return <Toggle {...shared} sourceNote={sourceNote} />;
    case 'number':
      return <NumberInput {...shared} />;
  }
}
