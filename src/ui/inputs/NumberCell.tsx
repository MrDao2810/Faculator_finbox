'use client';

import { useState } from 'react';

import { parseViNumber, rawViNumber } from '@/application';

export interface NumberCellProps {
  /** Giá trị hiện tại. `null` là ô CHƯA điền — khác hẳn số 0 (NFR-REL-01). */
  value: number | null;
  /** Gọi từng phím gõ. `null` nghĩa là ô đang trống hoặc chuỗi chưa ra số. */
  onChange: (value: number | null) => void;
  ariaLabel: string;
  /** Chữ mờ khi ô trống — bảng WF-05 dùng '—' để ô trống không đọc ra là ô khoá. */
  placeholder?: string;
  className?: string;
}

/**
 * Một ô SỐ trong bảng — WF-05 (chuỗi giá) và bảng dòng tiền của XIRR.
 *
 * Khác `NumberInput`/`InlineNumber` ở chỗ nó **không có `VariableSpec`**: một ô của bảng không
 * thuộc biến nào trong Registry, nên không có miền hợp lệ để kẹp và không có nhãn để vẽ. Cái nó
 * mang sang từ hai ô kia là đúng một thứ, và cũng là lý do component này tồn tại: **giữ chuỗi thô
 * trong lúc gõ**.
 *
 * Hai lỗi mà cả hai bảng cùng mắc trước khi có nó, đều vì chúng nối thẳng
 * `value={String(số)}` với `onChange={parseViNumber(raw)}`:
 *
 * 1. **Không gõ được số thập phân.** Gõ '100,' thì `parseViNumber` trả 100, state thành 100, ô vẽ
 *    lại thành '100' — dấu phẩy bị nuốt ngay khi vừa gõ, không bao giờ tới được phần thập phân.
 *    Giữ draft thì chuỗi người dùng gõ nằm nguyên đó cho tới lúc họ rời ô.
 * 2. **Sửa một ô làm giá nhân lên nghìn lần.** `String(100.449)` ra '100.449', đọc ngược lại
 *    thành 100449 vì trông y hệt chuỗi ngăn nghìn. `rawViNumber()` viết dấu thập phân bằng dấu
 *    phẩy nên vòng đi vòng về khép kín — xem docblock của chính hàm ấy.
 *
 * Không kẹp gì cả, kể cả lúc rời ô: giá âm hay giá cao thấp hơn giá thấp là việc của
 * `checkSeries()` — nó tô vàng cả dòng và nói ra lỗi, đúng chỗ mà một ràng buộc GIỮA các ô phải
 * nằm. Kẹp lặng lẽ ở đây sẽ sửa số của người dùng mà không ai giải thích được vì sao.
 */
export function NumberCell({
  value,
  onChange,
  ariaLabel,
  placeholder,
  className,
}: NumberCellProps) {
  /** Chuỗi thô trong lúc gõ. `null` nghĩa là đang hiện bản dựng lại từ `value`. */
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <input
      className={className}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={draft ?? (value === null ? '' : rawViNumber(value))}
      onChange={(event) => {
        const raw = event.target.value;
        setDraft(raw);
        onChange(parseViNumber(raw));
      }}
      onBlur={() => {
        setDraft(null);
      }}
    />
  );
}
