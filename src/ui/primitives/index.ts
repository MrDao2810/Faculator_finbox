/**
 * Primitive của hệ thiết kế — gói WBS 1.2.1.
 *
 * Component ghép (AppHeader, NumberInput, LinkedInput, ResultBlock…) thuộc nhánh 2
 * và phải dựng trên các primitive này, không tự viết lại nút và ô nhập.
 */

export { Button } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './Button';

export { Input } from './Input';
export type { InputProps, InputTone } from './Input';

export { Select } from './Select';
export type { SelectProps } from './Select';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Chip } from './Chip';
export type { ChipProps } from './Chip';

export { Table } from './Table';
export type { TableProps } from './Table';
