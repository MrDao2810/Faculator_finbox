/**
 * Bộ điều khiển nhập liệu — gói WBS 2.3.
 *
 * Mọi điều khiển ở đây sinh hoàn toàn từ `VariableSpec` (FR-05, LDR-01): nhãn, đơn vị, miền
 * hợp lệ, bước nhảy và danh sách lựa chọn đều đọc từ metadata, không viết cứng. Thêm một
 * biến mới vào Registry là có ngay ô nhập đúng kiểu, không phải sửa component nào.
 *
 * Tất cả đều là controlled component thuần: nhận `value` + `onChange`, không tự giữ state.
 * Chỗ giữ state là màn hình — cùng khuôn với SearchBox và CategoryFilter của gói 2.2.
 */

export { NumberInput } from './NumberInput';
export type { NumberInputProps } from './NumberInput';

export { InlineNumber } from './InlineNumber';
export type { InlineNumberProps } from './InlineNumber';

export { NumberCell } from './NumberCell';
export type { NumberCellProps } from './NumberCell';

export { SliderInput } from './SliderInput';
export type { SliderInputProps } from './SliderInput';

export { ButtonGroup } from './ButtonGroup';
export type { ButtonGroupProps } from './ButtonGroup';

export { RadioGroup } from './RadioGroup';
export type { RadioGroupProps } from './RadioGroup';

export { SelectInput } from './SelectInput';
export type { SelectInputProps } from './SelectInput';

export { Toggle } from './Toggle';
export type { ToggleProps } from './Toggle';

export { UnitSwitcher } from './UnitSwitcher';
export type { UnitSwitcherProps } from './UnitSwitcher';

export { LinkedInput } from './LinkedInput';
export type { LinkedInputProps } from './LinkedInput';

/* Bộ điều phối theo `spec.type` — dùng ở màn chi tiết WF-03 (gói 3.2.1). */
export { VariableField, isWideControl } from './VariableField';
export type { VariableFieldProps } from './VariableField';
