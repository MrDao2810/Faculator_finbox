'use client';

import { useState } from 'react';

import { commitValue, formatNumber, resolveInputState, t } from '@/application';
import type { InputState, Level, VariableSpec } from '@/application';
import { Input, type InputTone } from '@/ui/primitives';

export interface NumberInputProps {
  spec: VariableSpec;
  /** Giá trị hiện tại. Component không tự giữ state — màn hình mới là nơi giữ. */
  value: number;
  /** Gọi khi giá trị đã CHỐT (rời ô hoặc Enter), đã kẹp về miền hợp lệ. */
  onChange: (value: number) => void;
  /** Chế độ hiển thị hiện tại — quyết định ô có bị khoá không (FR-09). */
  mode?: Level;
  /** Tên công thức thượng nguồn nếu ô đang nhận giá trị tự động, ví dụ 'CAPM'. */
  derivedFrom?: string;
  /** Ẩn nhãn khi ô nằm trong bảng đã có tiêu đề cột. */
  hideLabel?: boolean;
  className?: string;
}

/** Ánh xạ trạng thái WF-16 sang sắc thái sẵn có của primitive Input. */
const TONE_BY_STATE: Readonly<Record<InputState, InputTone>> = {
  default: 'default',
  // 'editing' không cần tone riêng: primitive đã vẽ vòng focus bằng :focus-within.
  editing: 'default',
  derived: 'derived',
  outOfRange: 'invalid',
  locked: 'locked',
};

/**
 * Ô số — gói WBS 2.3.1.
 *
 * WF-16 chốt đúng năm trạng thái; bảng chuyển trạng thái nằm ở `resolveInputState()` tầng
 * Domain nên test được bằng Node, ở đây chỉ là phần vẽ.
 *
 * Ba điều dễ làm sai, đã xử ở đây:
 *
 * 1. **Không kẹp giá trị trong lúc gõ.** Người dùng gõ '−4' thì ô hiện '−4' kèm '! min 0',
 *    chứ không tự nhảy về 0 ngay giữa chừng — sửa giá trị dưới tay người đang gõ là cách
 *    nhanh nhất làm họ mất phương hướng. Kẹp chỉ xảy ra lúc chốt, qua `commitValue()`.
 * 2. **Ô giữ chuỗi thô khi đang gõ, giữ chuỗi đã định dạng khi rời ra.** Nếu định dạng ngay
 *    từng phím thì gõ '92000' sẽ bị chèn dấu chấm giữa chừng và con trỏ nhảy lung tung.
 * 3. **Dòng phụ đi qua `hint`/`error` của primitive** chứ không tự vẽ thẻ riêng — nhờ vậy nó
 *    được nối sẵn vào `aria-describedby`, và lỗi miền có `role="alert"`. Tự vẽ song song thì
 *    trình đọc màn hình sẽ không đọc được dòng đó.
 *
 * Không cần CSS Module: mọi khác biệt về hình đã nằm ở bốn sắc thái của primitive
 * (viền đứt cho ô nhận tự động, nền chìm cho ô khoá, viền đỏ cho ngoài miền).
 */
export function NumberInput({
  spec,
  value,
  onChange,
  mode = 'advanced',
  derivedFrom,
  hideLabel = false,
  className,
}: NumberInputProps) {
  const [focused, setFocused] = useState(false);
  /** Chuỗi thô trong lúc gõ. `null` nghĩa là đang hiện bản đã định dạng của `value`. */
  const [draft, setDraft] = useState<string | null>(null);

  const raw = draft ?? formatNumber(value, { maxDecimals: 4 });
  const { state, note } = resolveInputState({ raw, spec, focused, derivedFrom, mode });

  const locked = state === 'locked';

  // Ngoài miền là lỗi thật sự nên đi đường `error` (có role="alert"); các dòng phụ khác
  // chỉ là thông tin nên đi đường `hint`.
  const error = state === 'outOfRange' ? note : undefined;
  const hint = state === 'outOfRange' ? spec.description : (note ?? spec.description);

  return (
    <Input
      className={className}
      label={spec.label}
      hideLabel={hideLabel}
      unit={spec.unit}
      tone={TONE_BY_STATE[state]}
      hint={hint}
      error={error}
      // Bàn phím số trên điện thoại — WF-03 ghi 'bàn phím số · HW-02'.
      inputMode="decimal"
      // Không dùng type="number": nó chặn dấu phẩy thập phân kiểu Việt Nam, và nút tăng/giảm
      // mặc định của trình duyệt không đủ vùng chạm 44px.
      type="text"
      autoComplete="off"
      value={raw}
      readOnly={locked}
      aria-readonly={locked || undefined}
      title={locked ? t('input.lockedHint') : undefined}
      onFocus={() => {
        setFocused(true);
        // Vào ô thì bỏ dấu ngăn nghìn cho dễ sửa: '92.000' thành '92000'.
        setDraft(String(value));
      }}
      onChange={(event) => {
        setDraft(event.target.value);
      }}
      onBlur={() => {
        setFocused(false);
        setDraft(null);
        onChange(commitValue(raw, spec));
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        event.currentTarget.blur();
      }}
    />
  );
}
