/**
 * Tầng DOMAIN — bảng chuyển trạng thái của ô số (gói WBS 2.3.1).
 *
 * WF-16 chốt đúng NĂM trạng thái, kèm dữ liệu mẫu:
 *   1. mặc định                      92.000 ₫
 *   2. đang nhập (focus)             92.000│ ₫
 *   3. tự động từ công thức khác     14,3      ↳ CAPM
 *   4. ngoài miền hợp lệ             −4        ! min 0
 *   5. khoá (chế độ Cơ bản ẩn)       4,0       nâng cao
 *
 * Tách hẳn khỏi JSX vì đây là phần dễ sai nhất của gói: năm trạng thái nhưng có nhiều cặp
 * chồng nhau (đang gõ mà lọt ra ngoài miền, biến nâng cao mà lại nhận giá trị tự động…).
 * Ở đây là hàm thuần nên test được đủ tổ hợp bằng Node.
 */

import { clampToSpec } from './calc-output';
import { formatNumber, parseViNumber } from './format';
import type { Level, VariableSpec } from './types';

export type InputState =
  | 'default' // 1 — có giá trị, không thao tác gì
  | 'editing' // 2 — đang có con trỏ trong ô
  | 'derived' // 3 — nhận giá trị từ công thức khác (FR-15)
  | 'outOfRange' // 4 — nằm ngoài min/max của VariableSpec
  | 'locked'; // 5 — biến nâng cao trong khi đang ở chế độ Cơ bản (FR-09)

/**
 * Thứ tự ưu tiên khi nhiều trạng thái cùng đúng.
 *
 * ĐÂY LÀ TÀI LIỆU, không phải cấu hình: hành vi thật nằm ở chuỗi `if` trong
 * `resolveInputState()`, đổi mảng này không đổi gì cả. Giữ nó vì thứ tự ưu tiên là phần dễ
 * đọc sót nhất của gói, và mỗi cặp tranh chấp đều có một ca test riêng canh.
 *
 * · `locked` đứng đầu: ô đã khoá thì không gõ được, mọi trạng thái thao tác đều vô nghĩa.
 * · `outOfRange` đứng trên `editing`: đang gõ mà lọt ra ngoài miền thì vẫn phải thấy
 *   '! min 0' ngay, không đợi rời ô mới báo.
 * · `outOfRange` đứng trên `derived`: giá trị tự động mà sai miền là dấu hiệu công thức
 *   thượng nguồn có vấn đề — báo miền cụ thể hữu ích hơn là chỉ ghi nguồn.
 */
export const STATE_PRIORITY: ReadonlyArray<InputState> = [
  'locked',
  'outOfRange',
  'derived',
  'editing',
  'default',
];

export interface InputStateArgs {
  /** Chuỗi thô đang nằm trong ô, đúng thứ người dùng gõ. */
  raw: string;
  spec: VariableSpec;
  /** Con trỏ có đang ở trong ô không. */
  focused: boolean;
  /** Tên công thức thượng nguồn đang cấp giá trị, ví dụ 'CAPM'. Không có thì ô là nhập tay. */
  derivedFrom?: string;
  /** Chế độ hiển thị hiện tại (FR-09). */
  mode: Level;
}

export interface InputStateResult {
  state: InputState;
  /**
   * Dòng phụ hiện dưới ô, đã là tiếng Việt và đã định dạng số:
   * '↳ CAPM' · '! min 0' · 'nâng cao'. Trạng thái không cần dòng phụ thì undefined.
   */
  note?: string;
  /** Giá trị đọc được từ `raw`. null nghĩa là chưa nhập hoặc gõ dở — không phải số 0. */
  value: number | null;
}

/** Biến nâng cao trong chế độ Cơ bản thì bị khoá, không phải bị ẩn hẳn (WF-16 trạng thái 5). */
export function isLockedForMode(spec: VariableSpec, mode: Level): boolean {
  return mode === 'basic' && spec.level === 'advanced';
}

/**
 * Giá trị có nằm ngoài miền hợp lệ không.
 * Chưa nhập (null) thì KHÔNG tính là ngoài miền — đó là trạng thái "chưa nhập đủ", việc của
 * INCOMPLETE_INPUT, không phải của ô này.
 */
export function isOutOfRange(value: number | null, spec: VariableSpec): boolean {
  if (value === null) return false;
  if (spec.min !== undefined && value < spec.min) return true;
  if (spec.max !== undefined && value > spec.max) return true;
  return false;
}

/** Dòng nhắc miền, đúng khuôn '! min 0' của WF-16. */
export function outOfRangeNote(value: number, spec: VariableSpec): string | undefined {
  if (spec.min !== undefined && value < spec.min) return `! min ${formatNumber(spec.min)}`;
  if (spec.max !== undefined && value > spec.max) return `! max ${formatNumber(spec.max)}`;
  return undefined;
}

/**
 * Trạng thái hiện tại của một ô số.
 *
 * Không kẹp giá trị: WF-16 hiện '−4' kèm '! min 0', tức là giữ nguyên thứ người dùng gõ rồi
 * báo, chứ không âm thầm sửa thành 0. Việc kẹp là của `clampToSpec()` và chỉ chạy lúc commit
 * (rời ô hoặc Enter) — xem `commitValue()` bên dưới.
 */
export function resolveInputState(args: InputStateArgs): InputStateResult {
  const { raw, spec, focused, derivedFrom, mode } = args;
  const value = parseViNumber(raw);

  if (isLockedForMode(spec, mode)) {
    return { state: 'locked', note: 'nâng cao', value };
  }

  if (value !== null && isOutOfRange(value, spec)) {
    return { state: 'outOfRange', note: outOfRangeNote(value, spec), value };
  }

  if (derivedFrom !== undefined && derivedFrom.trim() !== '') {
    return { state: 'derived', note: `↳ ${derivedFrom}`, value };
  }

  if (focused) return { state: 'editing', value };

  return { state: 'default', value };
}

/**
 * Giá trị chốt khi người dùng rời ô hoặc bấm Enter.
 *
 * Đây là chỗ DUY NHẤT được kẹp về miền hợp lệ. Chưa nhập gì thì rơi về `defaultValue` của
 * chính biến đó — cùng cách xử của `clampToSpec()`, để không ô nào kết thúc ở trạng thái
 * trống hay NaN (FR-06, LDR-01).
 */
export function commitValue(raw: string, spec: VariableSpec): number {
  const value = parseViNumber(raw);
  if (value === null) return spec.defaultValue;
  return clampToSpec(value, spec);
}
