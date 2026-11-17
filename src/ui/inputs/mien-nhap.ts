import { formatNumber, isOutOfRange } from '@/application';
import type { VariableSpec } from '@/application';

/**
 * Luật miền của ô số trong lúc gõ — dùng chung cho `NumberInput` và `InlineNumber` (16/11/2026).
 *
 * Chủ dự án chụp `lai-kep`: gõ "-10000000" vào "Số tiền gốc (P)" (min 0) thì dưới ô ghi "! min 0"
 * (_"không hiểu nói gì ?"_) còn khối Kết quả vẫn in -22.196.402,35 ₫. Hai ô cũ đẩy giá trị THÔ lên
 * theo từng phím, kể cả khi ngoài miền, và chỉ kẹp lúc rời ô. Chủ dự án chọn: ô không nhận số âm
 * thì CHẶN hẳn dấu trừ và nói "Số liệu không được âm."; còn lại (vượt max, dưới một min dương) thì
 * ô vẫn hiện thứ đang gõ nhưng con số ấy KHÔNG đi lên màn cho tới khi rời ô, lúc `commitValue()` kẹp.
 */

/** Bốn kiểu dấu trừ `keepViNumberChars()` cho lọt vào ô. */
const DAU_TRU = /[-−–—]/;

/** Ô có `min ≥ 0` thì không có lý do gì để gõ dấu trừ — chặn ngay ở phím. */
export function khongNhanSoAm(spec: VariableSpec): boolean {
  return spec.min !== undefined && spec.min >= 0;
}

/** Chuỗi có dấu trừ nào không. */
export function coDauTru(text: string): boolean {
  return DAU_TRU.test(text);
}

/** Giá trị đọc được có được phép đi lên màn ngay trong lúc gõ không. */
export function dayLenDuoc(value: number, spec: VariableSpec): boolean {
  return !isOutOfRange(value, spec);
}

/**
 * Tên ô trong câu báo: NHÃN của ô, bỏ ký hiệu trong ngoặc ở cuối (16/11/2026). "Số tiền vay (P)"
 * thành "Số tiền vay", "Lãi suất / năm (r)" thành "Lãi suất / năm".
 *
 * Hai lượt cùng ngày. Lượt đầu gọi tên theo ĐƠN VỊ ("Số tiền", "Số phiên"…) theo câu chủ dự án
 * _"thông báo về tiền thì phải ghi là 'Số tiền nhỏ nhất phải là ....'"_; xem màn thật, chủ dự án
 * chốt _"Số tiền vay lớn hơn 0"_, tức đúng tên của chính ô. Bỏ ký hiệu vì "(P)" giữa câu đọc như một
 * phép tính. Nhãn rỗng (không nên có) thì rơi về "Số liệu".
 */
export function tenTrongCau(nhan: string, t: DichFn): string {
  const ten = nhan.replace(/\s*\([^()]*\)\s*$/, '').trim();
  return ten === '' ? t('input.name.value') : ten;
}

type DichFn = (
  key:
    | 'input.errNegative'
    | 'input.errPositive'
    | 'input.errMin'
    | 'input.errMax'
    | 'input.errInteger'
    | 'input.name.value',
) => string;

/** Tên ô đã dịch (nhãn trên màn) và đơn vị đã dịch in sau con số ("1 ₫"). */
export interface NhanCau {
  ten: string;
  donVi: string;
}

/** Điền tên ô (`{ten}`) và con số kèm đơn vị (`{n}`) vào một câu báo. */
function dien(mau: string, t: DichFn, nhan: NhanCau, so?: number): string {
  const n =
    so === undefined
      ? ''
      : nhan.donVi === ''
        ? formatNumber(so)
        : `${formatNumber(so)} ${nhan.donVi}`;
  return mau.replace('{ten}', tenTrongCau(nhan.ten, t)).replace('{n}', n);
}

/**
 * Câu của ô vừa chặn một dấu trừ (`NumberInput`). Ô phải lớn hơn 0 thì nói đúng điều kiện ấy
 * ("Số tiền vay lớn hơn 0."), ô chỉ cần không âm thì "… không được âm.".
 */
export function cauSoAm(spec: VariableSpec, t: DichFn, nhan: NhanCau): string {
  return dien(t(spec.positive === true ? 'input.errPositive' : 'input.errNegative'), t, nhan);
}

/**
 * Câu báo lỗi miền cho một giá trị, hoặc `undefined` khi giá trị nằm trong miền.
 *
 * Dưới một min là 0 thì nói "không được âm" — câu đúng cả khi số âm tới từ một mã nạp vào chứ
 * không phải từ phím. Ô `positive` mà ≤ 0 thì "lớn hơn 0".
 */
export function cauLoiMien(
  value: number | null,
  spec: VariableSpec,
  t: DichFn,
  nhan: NhanCau,
): string | undefined {
  if (value === null) return undefined;
  if (spec.positive === true && value <= 0) return dien(t('input.errPositive'), t, nhan);
  if (spec.min !== undefined && value < spec.min) {
    if (spec.min === 0) return dien(t('input.errNegative'), t, nhan);
    return dien(t('input.errMin'), t, nhan, spec.min);
  }
  if (spec.max !== undefined && value > spec.max) {
    return dien(t('input.errMax'), t, nhan, spec.max);
  }
  // Ô đếm (số phiên, số kỳ…) — 16/11/2026, xem `VariableSpec.integer`.
  if (spec.integer === true && !Number.isInteger(value)) {
    return dien(t('input.errInteger'), t, nhan);
  }
  return undefined;
}
