'use client';

import type { Level, VariableSpec } from '@/application';

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
