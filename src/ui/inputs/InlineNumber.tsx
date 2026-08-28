'use client';

import { useState } from 'react';

import { commitValue, formatNumber, parseViNumber } from '@/application';
import type { VariableSpec } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './InlineNumber.module.css';

export interface InlineNumberProps {
  spec: VariableSpec;
  value: number;
  /** Gọi khi giá trị đã CHỐT (rời ô hoặc Enter), đã kẹp về miền hợp lệ. */
  onChange: (value: number) => void;
  readOnly?: boolean;
  /**
   * Cho gõ thẳng vào con số hay không.
   *
   * Khác hẳn `readOnly`, dù nghe giống: `readOnly` là "ô này KHOÁ vì đang ở chế độ Cơ bản" — nó tô
   * chữ mờ đi và mách "chuyển sang Nâng cao để sửa". `editable={false}` thì ngược lại, con số hiện
   * y nguyên như cũ, chỉ là không còn là ô nhập nữa; nơi gọi có điều khiển khác cho việc đổi giá trị.
   */
  editable?: boolean;
  /** Có hiện đơn vị bên phải con số hay không. */
  showUnit?: boolean;
  id?: string;
  /** Dùng khi ô không có `<label>` riêng trỏ vào — ví dụ khi nhãn nằm ở cột bảng. */
  ariaLabel?: string;
  describedBy?: string;
  className?: string;
}

/**
 * Ô gõ số gọn, không nhãn — dùng ở những chỗ nhãn đã nằm sẵn bên cạnh.
 *
 * Tồn tại để **một chỗ duy nhất** cầm quy tắc "gõ số" của dự án, thay vì mỗi component tự chép lại.
 * Hiện có ba nơi cần đúng hành vi này: `SliderInput` (con số cạnh nhãn), `ExampleBlock` (dòng số
 * của ví dụ), và `NumberInput` — cái cuối vẫn giữ bản riêng vì nó phải vẽ đủ năm trạng thái WF-16
 * qua primitive `Input`, còn hai chỗ kia chỉ cần con số.
 *
 * Năm quy tắc, giống hệt `NumberInput` để hai ô không cư xử khác nhau:
 *
 *   0. **Đẩy giá trị lên ngay từng phím gõ**, chuỗi chưa ra số thì bỏ qua lượt đó. Trước đây cả
 *      hai ô chỉ báo lên lúc rời ô, nên gõ xong mà khối Kết quả vẫn đứng im — xem `NumberInput`.
 *   1. **Không kẹp trong lúc gõ.** Gõ '−4' thì ô hiện '−4'; kẹp chỉ xảy ra lúc chốt.
 *   2. **Giữ chuỗi thô khi đang gõ, chuỗi đã định dạng khi rời ra** — nếu định dạng từng phím thì
 *      gõ '92000' bị chèn dấu chấm giữa chừng và con trỏ nhảy.
 *   3. **KHÔNG bám lưới `step`.** Bước là độ phân giải của ngón tay khi kéo, không phải luật của
 *      con số. Miền `[min, max]` mới là luật, và `commitValue()` giữ nó.
 *   4. `type="text"` chứ không `type="number"`: `number` chặn dấu phẩy thập phân kiểu Việt Nam.
 */
export function InlineNumber({
  spec,
  value,
  onChange,
  readOnly = false,
  editable = true,
  showUnit = true,
  id,
  ariaLabel,
  describedBy,
  className,
}: InlineNumberProps) {
  /** Chuỗi thô trong lúc gõ. `null` nghĩa là đang hiện bản đã định dạng của `value`. */
  const [draft, setDraft] = useState<string | null>(null);
  const t = useT();

  const classes = [styles.box, readOnly ? styles.locked : undefined, className]
    .filter(Boolean)
    .join(' ');

  function commit(): void {
    if (draft === null) return;
    const next = commitValue(draft, spec);
    setDraft(null);
    if (next !== value) onChange(next);
  }

  /*
   * Bản CHỈ ĐỌC: một `<span>` trơn, không phải `<input readonly>` và cũng không phải `<output>`.
   *
   * Vấn đề mà nhánh này sinh ra để giải là con số trông như chữ nhưng lại gõ được — không có dấu
   * hiệu nào nói ra điều đó (viền chỉ hiện khi có tiêu điểm, theo đúng chủ đích ghi ở
   * `InlineNumber.module.css`). Một `<input readonly>` vẫn nhận tiêu điểm và vẫn đổi con trỏ chuột
   * thành dấu nhập chữ, tức vẫn mời gọi đúng cú bấm vừa bị gỡ bỏ.
   *
   * `<output>` là lựa chọn đầu tiên và nó SAI, theo hai đường: thẻ ấy mang role ngầm `status`, nên
   * (1) nó biến một con số đọc thầm thành live region — trình đọc màn hình xướng lại giá trị mỗi
   * lần người dùng kéo thanh trượt, chồng lên chính lời xướng của thanh trượt; và (2) nó chiếm mất
   * vai `status` của khối "chờ chuỗi giá" ở màn chi tiết, chỗ mà `findByRole('status')` đang trỏ
   * vào — một ca kiểm bắt được ngay.
   *
   * Không cần vai trò trợ năng nào: giá trị đã nằm trong chính thanh trượt cạnh đó, và thanh trượt
   * mới là thứ trình đọc màn hình xướng ra khi người dùng chạm tới.
   *
   * Giữ nguyên `.box` và `.input`, nên bề rộng ghim 14ch, canh phải và `tabular-nums` không đổi —
   * bật tắt nhánh này không xê dịch một pixel nào của bố cục.
   */
  if (!editable) {
    return (
      <span className={classes}>
        <span id={id} className={styles.input}>
          {formatNumber(value, { maxDecimals: 4 })}
        </span>
        {showUnit && spec.unit !== '' && <span className={styles.unit}>{spec.unit}</span>}
      </span>
    );
  }

  return (
    <span className={classes}>
      <input
        id={id}
        className={styles.input}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        // Dự phòng cho lúc CSS chưa tải; bề rộng thật do `.input` quyết.
        size={14}
        value={draft ?? formatNumber(value, { maxDecimals: 4 })}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        title={readOnly ? t('input.lockedHint') : undefined}
        onFocus={() => {
          // Vào ô thì bỏ dấu ngăn nghìn cho dễ sửa: '10.000.000' thành '10000000'.
          setDraft(String(value));
        }}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);

          // Quy tắc 0 — xem docblock. Chuỗi chưa ra số (`''`, `'-'`, `'1,'`) thì giữ nguyên giá
          // trị cũ chứ không đẩy `null` lên, vì nơi nhận chỉ biết nhận số (FR-06).
          const parsed = parseViNumber(next);
          if (parsed !== null && parsed !== value) onChange(parsed);
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key !== 'Enter') return;
          event.preventDefault();
          event.currentTarget.blur();
        }}
      />
      {showUnit && spec.unit !== '' && <span className={styles.unit}>{spec.unit}</span>}
    </span>
  );
}
