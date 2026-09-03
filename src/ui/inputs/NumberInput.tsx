'use client';

import { useState } from 'react';

import {
  commitValue,
  formatNumber,
  parseViNumber,
  rawViNumber,
  resolveInputState,
} from '@/application';
import type { InputState, Level, VariableSpec } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Input, type InputTone } from '@/ui/primitives';

export interface NumberInputProps {
  spec: VariableSpec;
  /** Giá trị hiện tại. Component không tự giữ state — màn hình mới là nơi giữ. */
  value: number;
  /**
   * Gọi mỗi khi giá trị đọc được từ ô thay đổi.
   *
   * Hai thời điểm, và chúng khác nhau ở chỗ có KẸP hay không:
   *
   * - **Từng phím gõ**, với giá trị thô chưa kẹp — để khối Kết quả đổi theo ngay trong lúc gõ.
   *   Gõ dở thành chuỗi chưa ra số (`''`, `'-'`, `'1,'`) thì KHÔNG gọi: giữ nguyên giá trị cũ còn
   *   hơn đẩy `null` hay `NaN` lên (FR-06).
   * - **Lúc chốt** (rời ô hoặc Enter), với giá trị đã kẹp về miền hợp lệ qua `commitValue()`.
   */
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
 *
 *    Lưu ý điều này KHÔNG có nghĩa là giữ giá trị lại không cho ra ngoài. Bản đầu chỉ gọi
 *    `onChange` lúc rời ô, nên gõ xong cả một con số mà khối Kết quả vẫn đứng im cho tới khi
 *    người dùng bấm ra chỗ khác — trông y như màn bị treo. Nay mỗi phím gõ đều đẩy giá trị thô
 *    lên, còn việc kẹp thì vẫn để dành cho lúc chốt. Hai chuyện khác nhau: một đằng là ĐỔI thứ
 *    người dùng đang gõ, một đằng là cho phần còn lại của màn biết họ đang gõ gì.
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
  const t = useT();
  const pick = usePick();

  const raw = draft ?? formatNumber(value, { maxDecimals: 4 });
  const { state, note } = resolveInputState({ raw, spec, focused, derivedFrom, mode });

  const locked = state === 'locked';
  const description = spec.description === undefined ? undefined : pick(spec.description);

  // Ngoài miền là lỗi thật sự nên đi đường `error` (có role="alert"); các dòng phụ khác
  // chỉ là thông tin nên đi đường `hint`.
  const error = state === 'outOfRange' ? note : undefined;
  const hint = state === 'outOfRange' ? description : (note ?? description);

  return (
    <Input
      className={className}
      label={pick(spec.label)}
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
        /* Vào ô thì bỏ dấu ngăn nghìn cho dễ sửa: '92.000' thành '92000'. Qua `rawViNumber()`
           chứ không `String()`: `String(100.449)` ra '100.449', mà chuỗi ấy đọc ngược lại thành
           100449 — chạm vào ô rồi bấm ra chỗ khác là giá nhân lên nghìn lần. */
        setDraft(rawViNumber(value));
      }}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);

        /*
         * Đẩy lên NGAY, không đợi rời ô — đây là thứ làm khối Kết quả sống theo tay gõ.
         *
         * `null` là chuỗi chưa ra số: ô vừa bị xoá trắng, mới gõ mỗi dấu trừ, hay đang dở
         * '1,'. Những lúc ấy giữ nguyên giá trị cũ, vì đẩy lên `null` thì phải quy nó thành 0
         * hoặc NaN — cả hai đều là thứ FR-06 cấm. Rời ô thì `commitValue()` lo nốt: trống
         * thì về `defaultValue` của chính biến đó.
         */
        const parsed = parseViNumber(next);
        if (parsed !== null) onChange(parsed);
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
