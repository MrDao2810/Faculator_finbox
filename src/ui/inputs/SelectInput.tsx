'use client';

import type { ReactNode } from 'react';

import { isLockedForMode } from '@/application';
import type { Level, VariableSpec } from '@/application';
import { usePick } from '@/application/preferences-context';
import { Select } from '@/ui/primitives';

export interface SelectInputProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  hideLabel?: boolean;
  /**
   * Ô bị khoá vì một lý do NGOÀI chế độ hiển thị, kèm dòng phụ nói lý do ('AAA không có').
   *
   * Cộng vào `isLockedForMode()` chứ không thay nó: hai lý do khoá độc lập nhau, và một biến
   * nâng cao đang ở chế độ Cơ bản thì vẫn phải khoá dù mã có cấp được số hay không.
   */
  lockedNote?: string;
  /** Bản "ô nhỏ" của khối gộp — chỉ có hiệu lực từ 1280px, xem `InputProps.compact`. */
  compact?: boolean;
  /** Con dấu nguồn của giá trị, chỉ hiện ở ô nhỏ — xem `InputProps.sourceMark`. */
  sourceMark?: ReactNode;

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
  lockedNote,
  hideLabel = false,
  compact = false,
  sourceMark,
  className,
}: SelectInputProps) {
  const pick = usePick();
  const options = spec.options ?? [];

  return (
    <Select
      className={className}
      label={pick(spec.label)}
      hideLabel={hideLabel}
      compact={compact}
      sourceMark={sourceMark}
      // `spec.description` không hiện ở đây — bảng biến cùng màn đã in đúng câu ấy; xem docblock
      // trong `NumberInput.tsx`.
      value={String(value)}
      disabled={
        isLockedForMode(spec, mode) || (lockedNote !== undefined && lockedNote.trim() !== '')
      }
      onChange={(event) => {
        const next = Number(event.target.value);
        // Giá trị luôn đến từ chính danh sách options nên chắc chắn là số hữu hạn;
        // vẫn kiểm một lần để một <option> khai sai không đẩy NaN vào công thức (FR-06).
        if (Number.isFinite(next)) onChange(next);
      }}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {pick(option.label)}
        </option>
      ))}
    </Select>
  );
}
