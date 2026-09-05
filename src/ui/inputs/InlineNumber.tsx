'use client';

import { useState } from 'react';

import {
  commitValue,
  formatNumber,
  parseViNumber,
  rawViNumber,
  resolveInputState,
  unitLabel,
} from '@/application';
import type { VariableSpec } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

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
 *   5. **Ngoài miền thì NÓI RA trước khi kẹp.** Trước đây ô này âm thầm kẹp trong `commit()`: gõ
 *      −4 vào biến `min: 0` thì rời ô là con số nhảy về 0, không một chữ giải thích, trong khi
 *      `NumberInput` cùng ca ấy hiện '! min 0'. Cùng một luật miền mà hai ô cư xử khác nhau là
 *      chính chỗ người dùng kết luận "máy tính sai". Nay cả hai đọc chung `resolveInputState()`
 *      của Domain; khác biệt còn lại chỉ là chỗ đặt lời cảnh báo — `NumberInput` có dòng `error`
 *      của primitive, ô này nằm lẫn trong dòng chữ nên chỉ có viền, dấu `!` và câu cho trình đọc
 *      màn hình. Kẹp vẫn xảy ra đúng một chỗ, lúc chốt (quy tắc 1).
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
  const pick = usePick();
  /* Đơn vị Domain là chuỗi tiếng Việt trần — dịch một lần, dùng cho cả hai nhánh dựng bên dưới. */
  const donVi = pick(unitLabel(spec.unit));

  const raw = draft ?? formatNumber(value, { maxDecimals: 4 });
  /*
   * `focused: false` và `mode: 'advanced'` là cố ý: ô này không vẽ trạng thái 'editing' (không có
   * viền thường trực để đổi) và việc khoá theo chế độ đã do prop `readOnly` của nơi gọi quyết —
   * truyền `mode` thật vào sẽ sinh ra một đường khoá thứ hai, lệch với đường thứ nhất.
   */
  const { state, note } = resolveInputState({ raw, spec, focused: false, mode: 'advanced' });
  const outOfRange = editable && !readOnly && state === 'outOfRange';

  const classes = [
    styles.box,
    readOnly ? styles.locked : undefined,
    outOfRange ? styles.invalid : undefined,
    className,
  ]
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
        {showUnit && donVi !== '' && <span className={styles.unit}>{donVi}</span>}
      </span>
    );
  }

  return (
    <span className={classes}>
      {outOfRange && (
        /* Dấu chữ đứng cạnh viền đỏ — NFR-USA-06 cấm truyền đạt bằng riêng màu sắc. Ký tự thuần
           nên không qua i18n, cùng loại với '!' của cờ báo lỗi ở bảng dữ liệu WF-05. */
        <span className={styles.flag} aria-hidden="true">
          !
        </span>
      )}
      <input
        id={id}
        className={styles.input}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        // Dự phòng cho lúc CSS chưa tải; bề rộng thật do `.input` quyết.
        size={14}
        value={raw}
        readOnly={readOnly}
        aria-readonly={readOnly || undefined}
        aria-invalid={outOfRange || undefined}
        aria-label={ariaLabel}
        aria-describedby={describedBy}
        title={readOnly ? t('input.lockedHint') : outOfRange ? note : undefined}
        onFocus={() => {
          /* Vào ô thì bỏ dấu ngăn nghìn cho dễ sửa: '10.000.000' thành '10000000'. Qua
             `rawViNumber()` chứ không `String()` — lý do ghi ở `NumberInput` và ở chính hàm ấy:
             `String(100.449)` đọc ngược lại thành 100449. */
          setDraft(rawViNumber(value));
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
      {showUnit && donVi !== '' && <span className={styles.unit}>{donVi}</span>}
      {outOfRange && note !== undefined && (
        /* Cùng vai `alert` mà `NumberInput` dùng cho dòng lỗi miền của nó — ô này không có chỗ
           bày một dòng chữ nên câu ấy chỉ dành cho trình đọc màn hình. */
        <span className="visually-hidden" role="alert">
          {note}
        </span>
      )}
    </span>
  );
}
