/**
 * Tầng DOMAIN — nhóm ô LẶP: công thức có số ô nhập do người dùng thêm bớt (13/10/2026).
 *
 * Khai báo nằm ở `FormulaSpec.repeat` (xem `RepeatGroup`); file này là phần máy: từ một bộ số liệu,
 * dựng ra danh sách ô mà màn phải bày và `runFormula()` phải đòi.
 *
 * ── Một nguồn sự thật: con số ở biến đếm ─────────────────────────────────────────────────────
 *
 * Số nhóm đang dùng là giá trị của biến `repeat.countKey` trong chính bộ số liệu. Không có trạng
 * thái thứ hai nào ở màn. Mọi nơi cần danh sách ô (khối Số liệu, biểu đồ, Bảng biến, link chia sẻ,
 * file xuất) đều gọi `resolveRepeatSpec()` với bộ số đang có, nên chúng không thể lệch nhau.
 *
 * ── Nhóm khai sẵn giữ nguyên, nhóm thêm sinh từ mẫu ──────────────────────────────────────────
 *
 * `resolveRepeatSpec()` trả đúng spec gốc khi số nhóm bằng số nhóm khai sẵn: 109 công thức không
 * khai `repeat` và hai công thức kia lúc mở ra đều đi đường ấy, không dựng thêm object nào. Bản
 * dựng cho mỗi số nhóm khác được giữ lại trong `WeakMap`, nên cùng một số nhóm luôn ra cùng một
 * object. Điều đó là bắt buộc chứ không phải tối ưu: spec đi vào `useMemo` và `memo(FormulaChart)`
 * ở màn chi tiết, một object mới mỗi lượt dựng là vẽ lại cả biểu đồ sau mỗi phím gõ.
 */

import type { Bilingual, VariableSpec } from '../types';
import type { FormulaSpec, RepeatGroup } from './types';

/** Chỗ đứng của số thứ tự nhóm trong nhãn mẫu: 'Tiền mua đợt {n}'. */
export const REPEAT_INDEX = '{n}';

/** Thay `{n}` trong một cặp chữ song ngữ bằng số thứ tự nhóm. */
export function fillRepeat(text: Bilingual, n: number): Bilingual {
  const so = String(n);
  return {
    vi: text.vi.split(REPEAT_INDEX).join(so),
    en: text.en.split(REPEAT_INDEX).join(so),
  };
}

/** Khoá của một ô trong nhóm thứ `n`: tiền tố `'amount'`, nhóm 4 thành `'amount4'`. */
export function repeatKey(prefix: string, n: number): string {
  return `${prefix}${String(n)}`;
}

/**
 * Số thứ tự nhóm trong một khoá, khi khoá ấy đúng là `prefix` cộng một số: `('amount', 'amount4')`
 * ra 4. `null` khi không khớp. Số thứ tự không nhận số 0 đứng đầu (`amount04`), để một ô chỉ có đúng
 * một cách viết khoá.
 *
 * Tách riêng vì khung "?" của bài hướng dẫn chỉ có tiền tố trong tay (khối chữ mẫu), không có cả
 * `RepeatGroup`.
 */
export function repeatIndexIn(prefix: string, key: string): number | null {
  if (!key.startsWith(prefix)) return null;
  const duoi = key.slice(prefix.length);
  return /^[1-9]\d*$/.test(duoi) ? Number(duoi) : null;
}

/**
 * Ô mang khoá `key` thuộc nhóm lặp nào — tiền tố của mẫu và số thứ tự nhóm.
 * `null` khi khoá không phải ô của nhóm lặp.
 */
export function repeatSlotOf(
  repeat: RepeatGroup,
  key: string,
): { prefix: string; n: number } | null {
  for (const field of repeat.fields) {
    const n = repeatIndexIn(field.key, key);
    if (n !== null) return { prefix: field.key, n };
  }
  return null;
}

/** Spec gốc của một bản đã dựng lại — để mọi phép hỏi đều đi từ khai báo, không từ bản dựng. */
const GOC = new WeakMap<FormulaSpec, FormulaSpec>();

/** Các bản đã dựng của một spec gốc, theo số nhóm. */
const DA_DUNG = new WeakMap<FormulaSpec, Map<number, FormulaSpec>>();

function gocCua(spec: FormulaSpec): FormulaSpec {
  return GOC.get(spec) ?? spec;
}

/** Số nhóm khai sẵn trong `variables` của spec gốc — số nhóm màn mở ra. */
function soNhomKhaiSan(goc: FormulaSpec, repeat: RepeatGroup): number {
  let lon = 0;
  for (const bien of goc.variables) {
    const o = repeatSlotOf(repeat, bien.key);
    if (o !== null && o.n > lon) lon = o.n;
  }
  return lon;
}

export interface RepeatLimits {
  /** Ít nhất phải còn chừng này nhóm — `min` của biến đếm. */
  min: number;
  /** Nhiều nhất chừng này nhóm — `max` của biến đếm. */
  max: number;
  /** Số nhóm khai sẵn trong `variables`, tức số nhóm màn mở ra. */
  declared: number;
}

/** Miền của số nhóm; `null` khi công thức không khai nhóm lặp. */
export function repeatLimits(spec: FormulaSpec): RepeatLimits | null {
  const goc = gocCua(spec);
  const { repeat } = goc;
  if (repeat === undefined) return null;

  const dem = goc.variables.find((bien) => bien.key === repeat.countKey);
  const declared = soNhomKhaiSan(goc, repeat);
  return { min: dem?.min ?? 1, max: dem?.max ?? declared, declared };
}

/**
 * Kẹp một con số thô về số nhóm hợp lệ: làm tròn rồi giữ trong `[min, max]`.
 *
 * `calc` của công thức có nhóm lặp gọi ĐÚNG hàm này với giá trị biến đếm, để vòng lặp của nó đi
 * qua đúng những nhóm mà `runFormula()` đã kiểm là có số. Hai nơi tự làm tròn theo hai cách là một
 * nhóm được đòi mà không được tính, hoặc ngược lại.
 */
export function clampRepeatCount(raw: number, min: number, max: number): number {
  if (!Number.isFinite(raw)) return min;
  return Math.min(max, Math.max(min, Math.round(raw)));
}

/**
 * Số nhóm đang dùng theo bộ số liệu. Công thức không khai nhóm lặp trả 0.
 *
 * Biến đếm vắng mặt hoặc không hữu hạn thì lấy số nhóm khai sẵn: `runFormula()` đằng nào cũng báo
 * thiếu chính biến ấy, còn màn thì vẫn phải bày được một bộ ô để người dùng gõ.
 */
export function repeatCount(spec: FormulaSpec, inputs: Readonly<Record<string, number>>): number {
  const goc = gocCua(spec);
  const limits = repeatLimits(goc);
  if (limits === null || goc.repeat === undefined) return 0;

  const tho = inputs[goc.repeat.countKey];
  if (tho === undefined || !Number.isFinite(tho)) return limits.declared;
  return clampRepeatCount(tho, limits.min, limits.max);
}

/** Một ô của nhóm thứ `n`, sinh từ mẫu. */
function oTuMau(mau: VariableSpec, n: number): VariableSpec {
  return {
    ...mau,
    key: repeatKey(mau.key, n),
    label: fillRepeat(mau.label, n),
    ...(mau.description === undefined ? {} : { description: fillRepeat(mau.description, n) }),
  };
}

function dungLai(goc: FormulaSpec, repeat: RepeatGroup, soNhom: number): FormulaSpec {
  const khaiSan = new Map(goc.variables.map((bien) => [bien.key, bien]));

  const nhom: VariableSpec[] = [];
  for (let n = 1; n <= soNhom; n += 1) {
    for (const mau of repeat.fields) {
      // Nhóm khai sẵn giữ bản viết tay (mô tả riêng của từng đợt); nhóm thêm thì sinh từ mẫu.
      nhom.push(khaiSan.get(repeatKey(mau.key, n)) ?? oTuMau(mau, n));
    }
  }

  // Các nhóm đứng đúng chỗ nhóm khai sẵn đầu tiên đang đứng; ô khác giữ nguyên thứ tự.
  const variables: VariableSpec[] = [];
  let daChen = false;
  for (const bien of goc.variables) {
    if (repeatSlotOf(repeat, bien.key) === null) {
      variables.push(bien);
      continue;
    }
    if (!daChen) {
      variables.push(...nhom);
      daChen = true;
    }
  }
  if (!daChen) variables.push(...nhom);

  return { ...goc, variables };
}

/**
 * Spec với đúng những ô mà bộ số liệu này đang dùng.
 *
 * Trả chính spec gốc khi công thức không khai nhóm lặp, hoặc khi số nhóm bằng số nhóm khai sẵn.
 * Nhận cả một bản đã dựng lại làm đầu vào: phép dựng luôn đi từ spec gốc, nên gọi chồng lên nhau
 * bao nhiêu lần cũng ra cùng một kết quả.
 */
export function resolveRepeatSpec(
  spec: FormulaSpec,
  inputs: Readonly<Record<string, number>>,
): FormulaSpec {
  const goc = gocCua(spec);
  const { repeat } = goc;
  if (repeat === undefined) return goc;

  const limits = repeatLimits(goc);
  if (limits === null) return goc;

  const soNhom = repeatCount(goc, inputs);
  if (soNhom === limits.declared) return goc;

  let theoSo = DA_DUNG.get(goc);
  if (theoSo === undefined) {
    theoSo = new Map();
    DA_DUNG.set(goc, theoSo);
  }

  let ban = theoSo.get(soNhom);
  if (ban === undefined) {
    ban = dungLai(goc, repeat, soNhom);
    theoSo.set(soNhom, ban);
    GOC.set(ban, goc);
  }
  return ban;
}

/**
 * Mọi khoá mà một bộ số liệu của công thức này ĐƯỢC PHÉP mang: ô khai sẵn cộng ô của mọi nhóm tới
 * trần. Validator dùng để nhận một ca kiểm thử có bốn đợt mua mà không coi `amount4` là khoá lạ.
 */
export function repeatAllowedKeys(spec: FormulaSpec): ReadonlyArray<string> {
  const goc = gocCua(spec);
  const limits = repeatLimits(goc);
  if (limits === null || goc.repeat === undefined) return [];

  const khoa: string[] = [];
  for (let n = 1; n <= limits.max; n += 1) {
    for (const mau of goc.repeat.fields) khoa.push(repeatKey(mau.key, n));
  }
  return khoa;
}

/** Thứ màn cần để dựng hai nút Thêm / Bỏ. `null` khi công thức không khai nhóm lặp. */
export interface RepeatControls {
  /** Số nhóm đang dùng. */
  count: number;
  /** Còn thêm được nhóm nữa hay đã chạm trần. */
  canAdd: boolean;
  /** Còn bỏ được nhóm cuối hay đã ở mức tối thiểu. */
  canRemove: boolean;
  /** Trần số nhóm, để màn nói ra khi nút Thêm bị khoá. */
  max: number;
  addLabel: Bilingual;
  /** Nhãn nút bỏ, đã điền số thứ tự của nhóm sẽ bỏ: 'Bỏ đợt 4'. */
  removeLabel: Bilingual;
}

export function repeatControls(
  spec: FormulaSpec,
  inputs: Readonly<Record<string, number>>,
): RepeatControls | null {
  const goc = gocCua(spec);
  const limits = repeatLimits(goc);
  if (limits === null || goc.repeat === undefined) return null;

  const count = repeatCount(goc, inputs);
  return {
    count,
    canAdd: count < limits.max,
    canRemove: count > limits.min,
    max: limits.max,
    addLabel: goc.repeat.addLabel,
    removeLabel: fillRepeat(goc.repeat.removeLabel, count),
  };
}

/**
 * Bộ số liệu sau khi THÊM một nhóm; `null` khi đã chạm trần hoặc công thức không có nhóm lặp.
 *
 * Ô của nhóm mới mang `defaultValue` của mẫu và GHI ĐÈ con số cũ nếu khoá ấy còn sót lại trong bộ
 * số (một bản nháp cũ, một bộ mặc định trộn bên dưới): nhóm vừa thêm phải mở ra đúng một trạng thái,
 * không phải trạng thái của lần nó từng tồn tại.
 */
export function addRepeatGroup(
  spec: FormulaSpec,
  inputs: Readonly<Record<string, number>>,
): Record<string, number> | null {
  const goc = gocCua(spec);
  const limits = repeatLimits(goc);
  if (limits === null || goc.repeat === undefined) return null;

  const count = repeatCount(goc, inputs);
  if (count >= limits.max) return null;

  const next: Record<string, number> = { ...inputs, [goc.repeat.countKey]: count + 1 };
  for (const mau of goc.repeat.fields) next[repeatKey(mau.key, count + 1)] = mau.defaultValue;
  return next;
}

/**
 * Bộ số liệu sau khi BỎ nhóm cuối; `null` khi đã ở mức tối thiểu hoặc công thức không có nhóm lặp.
 *
 * Xoá hẳn khoá của nhóm vừa bỏ chứ không để lại: bộ số này còn đi vào bản nháp, phép tính đã lưu và
 * file xuất, và một con số của nhóm không còn trên màn không có việc gì ở những nơi ấy.
 */
export function removeRepeatGroup(
  spec: FormulaSpec,
  inputs: Readonly<Record<string, number>>,
): Record<string, number> | null {
  const goc = gocCua(spec);
  const limits = repeatLimits(goc);
  if (limits === null || goc.repeat === undefined) return null;

  const count = repeatCount(goc, inputs);
  if (count <= limits.min) return null;

  const next: Record<string, number> = { ...inputs, [goc.repeat.countKey]: count - 1 };
  for (const mau of goc.repeat.fields) delete next[repeatKey(mau.key, count)];
  return next;
}
