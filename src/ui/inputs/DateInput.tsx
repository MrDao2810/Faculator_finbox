'use client';

import { useRef, type ChangeEvent, type FocusEvent } from 'react';

import {
  dateTextOf,
  isIsoDay,
  keepSeriesDateChars,
  settledDateValue,
  typedDateValue,
} from '@/application';
import { useT } from '@/application/preferences-context';
import { Input } from '@/ui/primitives';

import styles from './DateInput.module.css';
import { filterTypedValue, guardFilteredDelete, resetFilteredDelete } from './filtered-change';

/**
 * Ô NGÀY của sản phẩm — một ô chữ in 'DD/MM/YYYY', thay cho `<input type="date">`.
 *
 * ── Vì sao không dùng ô ngày của trình duyệt (13/10/2026) ───────────────────────────────────────
 *
 * Chủ dự án chụp màn Danh mục: cột "Ngày mua" in `03/10/2026`, bấm vào để sửa thì ô trong hộp
 * thoại in `10/03/2026`. Ô `type="date"` do trình duyệt vẽ theo NGÔN NGỮ CỦA TRÌNH DUYỆT (Chrome
 * tiếng Anh: tháng/ngày/năm), còn mọi chỗ khác của sản phẩm in ngày/tháng/năm bằng
 * `formatIsoDate()`. Không thuộc tính nào ép được ô ấy đổi thứ tự (`lang` cũng không), nên hai
 * chỗ chỉ nói cùng một lối khi sản phẩm tự vẽ ô. Cửa gác thứ hai ở `numeric-gate.test.ts` chặn
 * `type="date"` xuất hiện ở bất kỳ file nào khác file này.
 *
 * ── Giá trị ─────────────────────────────────────────────────────────────────────────────────────
 *
 * `value` là ISO 'YYYY-MM-DD' khi ô đang giữ một ngày có thật, và là chính chuỗi đang gõ dở khi
 * chưa (xem `date-text.ts`). Component không giữ state: nơi gọi cất đúng thứ `onChange` đưa lên và
 * tự soi bằng `isIsoDay()`/`parseDateText()` lúc cần một ngày.
 *
 * Ba luật gõ, cùng nếp với ô Ngày của bảng WF-05 để hai chỗ nhập ngày không hành xử hai kiểu:
 *
 *   1. Bàn phím SỐ, và chữ cái rụng ngay ở `onChange` (`keepSeriesDateChars` cùng phần bù phím xoá
 *      `guardFilteredDelete`; `numeric-gate.test.ts` ghim file này).
 *   2. Không chèn dấu '/' giữa lúc gõ: chèn là con trỏ nhảy. Ô chỉ nhận ra một ngày khi chữ đã đúng
 *      y dạng 'DD/MM/YYYY' (`typedDateValue`).
 *   3. Rời ô mới chuẩn hoá: '3/10/2026', '03-10-2026', '2026-10-03' và '03102026' (bàn phím số của
 *      điện thoại không có phím '/') đều về '03/10/2026' (`settledDateValue`).
 *
 * ── Nút lịch ────────────────────────────────────────────────────────────────────────────────────
 *
 * Ô `type="date"` cũ cho bấm chọn ngày trên lịch, và bỏ ô ấy không được làm mất việc đó. Nút lịch
 * gọi `showPicker()` trên một `<input type="date">` TÀNG HÌNH: bảng lịch của trình duyệt vẫn mở ra,
 * chỉ có dòng chữ theo thứ tự của trình duyệt là không còn hiện. Ô tàng hình nằm ngoài thứ tự Tab
 * và ngoài cây trợ năng (người dùng bàn phím gõ thẳng vào ô chữ), và phủ đúng lên nút để bảng lịch
 * neo vào chỗ vừa bấm.
 */

/** Chữ mờ của ô trống. Ký hiệu dạng ngày, không phải câu chữ, nên không qua i18n — như '_ _'. */
const DATE_PLACEHOLDER = 'dd/mm/yyyy';

/** Ba hàm xử lý chung của ô chữ; thuộc tính thì viết thẳng ở từng nơi dựng để cửa gác soi được. */
function xuLyO(value: string, onChange: (next: string) => void) {
  return {
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      onChange(typedDateValue(filterTypedValue(event, keepSeriesDateChars)));
    },
    onBlur: (event: FocusEvent<HTMLInputElement>) => {
      resetFilteredDelete(event.currentTarget);
      const settled = settledDateValue(value);
      if (settled !== value) onChange(settled);
    },
  };
}

interface CalendarButtonProps {
  value: string;
  onPick: (next: string) => void;
  /** Tên đầy đủ cho trình đọc màn hình, có cả ô nó thuộc về. `title` thì chỉ mang tên ngắn. */
  label: string;
}

function CalendarButton({ value, onPick, label }: CalendarButtonProps) {
  const t = useT();
  const nativeRef = useRef<HTMLInputElement>(null);

  return (
    <span className={styles.calendar}>
      <button
        type="button"
        className={styles.calendarButton}
        aria-label={label}
        title={t('date.openCalendar')}
        onClick={() => {
          try {
            nativeRef.current?.showPicker();
          } catch {
            // Trình duyệt không có `showPicker()` hoặc từ chối mở: ô chữ vẫn gõ được như thường.
          }
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
          <path
            d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <input
        ref={nativeRef}
        className={styles.calendarNative}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        value={isIsoDay(value) ? value : ''}
        onChange={(event) => {
          onPick(event.target.value);
        }}
      />
    </span>
  );
}

export interface DateFieldProps {
  label: string;
  /** ISO 'YYYY-MM-DD' khi là một ngày có thật; chuỗi đang gõ dở khi chưa; rỗng khi ô trống. */
  value: string;
  onChange: (next: string) => void;
  error?: string;
}

/** Ô ngày của một FORM: nhãn, khung và dòng lỗi của primitive `Input`, thêm nút lịch trong khung. */
export function DateField({ label, value, onChange, error }: DateFieldProps) {
  const t = useT();
  const xuLy = xuLyO(value, onChange);

  return (
    <Input
      label={label}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      placeholder={DATE_PLACEHOLDER}
      value={dateTextOf(value)}
      error={error}
      onChange={xuLy.onChange}
      onKeyDown={guardFilteredDelete}
      onBlur={xuLy.onBlur}
      trailing={
        <CalendarButton
          value={value}
          onPick={onChange}
          label={`${label} · ${t('date.openCalendar')}`}
        />
      }
    />
  );
}

export interface DateCellProps {
  /** Cùng nghĩa với `DateFieldProps.value`. */
  value: string;
  onChange: (next: string) => void;
  ariaLabel: string;
  /** Lớp của ô chữ, do bảng chứa nó cấp — ô phải trông như các ô khác trong cùng bảng. */
  className?: string;
}

/** Ô ngày của một BẢNG: không nhãn nhìn thấy, không khung riêng — bảng dòng tiền của XIRR. */
export function DateCell({ value, onChange, ariaLabel, className }: DateCellProps) {
  const t = useT();
  const xuLy = xuLyO(value, onChange);

  return (
    <span className={styles.cell}>
      <input
        className={className}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        aria-label={ariaLabel}
        placeholder={DATE_PLACEHOLDER}
        value={dateTextOf(value)}
        onChange={xuLy.onChange}
        onKeyDown={guardFilteredDelete}
        onBlur={xuLy.onBlur}
      />
      <CalendarButton
        value={value}
        onPick={onChange}
        label={`${ariaLabel} · ${t('date.openCalendar')}`}
      />
    </span>
  );
}
