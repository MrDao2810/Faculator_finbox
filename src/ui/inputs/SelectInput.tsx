'use client';

import { isLockedForMode } from '@/application';
import type { Level, VariableSpec } from '@/application';
import { Select } from '@/ui/primitives';

export interface SelectInputProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  hideLabel?: boolean;
  className?: string;
}

/**
 * Danh sách chọn sinh từ VariableSpec — gói WBS 2.3.3.
 *
 * Bọc primitive `Select`, thêm phần đọc `options` từ metadata (FR-05) và đổi chuỗi của
 * `<option>` về số — mọi biến đi vào công thức đều là số, kể cả biến kiểu chọn (LDR-02).
 */
export function SelectInput({
  spec,
  value,
  onChange,
  mode = 'advanced',
  hideLabel = false,
  className,
}: SelectInputProps) {
  const options = spec.options ?? [];

  return (
    <Select
      className={className}
      label={spec.label}
      hideLabel={hideLabel}
      hint={spec.description}
      value={String(value)}
      disabled={isLockedForMode(spec, mode)}
      onChange={(event) => {
        const next = Number(event.target.value);
        // Giá trị luôn đến từ chính danh sách options nên chắc chắn là số hữu hạn;
        // vẫn kiểm một lần để một <option> khai sai không đẩy NaN vào công thức (FR-06).
        if (Number.isFinite(next)) onChange(next);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}
