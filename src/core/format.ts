/**
 * Tầng DOMAIN — định dạng và đọc số theo quy ước Việt Nam (gói WBS 2.3, 2.4).
 *
 * CON-05: nghìn ngăn bằng dấu chấm, thập phân bằng dấu phẩy — `92.000`, `14,3`.
 * Cả bộ nhập liệu (2.3) lẫn khối kết quả (2.4) đều đi qua đây, để 107 công thức hiện số
 * cùng một kiểu và đội nội dung sửa được ở một chỗ.
 *
 * Locale khoá cứng 'vi-VN' chứ không lấy locale hệ thống: tầng Domain phải cho ra cùng
 * một kết quả với cùng một đầu vào (NFR-REL-03), và bản build là HTML tĩnh nên chuỗi sinh
 * lúc build phải khớp chuỗi sinh lúc chạy, nếu không sẽ lệch hydration.
 */

import type { CalcOutput } from './types';

/**
 * Chuỗi hiện ở chỗ đáng ra là kết quả khi không tính được (WF-15).
 * KHÔNG phải '0', không phải chuỗi rỗng — đó chính là bất biến FR-06 ở lớp hiển thị.
 */
export const NO_VALUE = '— , —';

const LOCALE = 'vi-VN';

export interface FormatNumberOptions {
  /** Số chữ số thập phân tối thiểu. Mặc định 0. */
  minDecimals?: number;
  /** Số chữ số thập phân tối đa. Mặc định 2 — đủ cho 15,21 lần và 0,15 %. */
  maxDecimals?: number;
  /** Ép dấu + cho số dương, ví dụ '+5,01' của ROI ròng ở WF-08. */
  signed?: boolean;
}

/**
 * Định dạng một số theo quy ước Việt Nam.
 * Giá trị không hữu hạn trả về NO_VALUE chứ không bao giờ ra chuỗi 'NaN' hay 'Infinity' (FR-06).
 */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  if (!Number.isFinite(value)) return NO_VALUE;

  const { minDecimals = 0, maxDecimals = 2, signed = false } = options;

  const text = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: Math.max(minDecimals, maxDecimals),
  }).format(value);

  // Chỉ thêm dấu + cho số dương; số 0 và số âm giữ nguyên (Intl đã có sẵn dấu trừ).
  return signed && value > 0 ? `+${text}` : text;
}

/**
 * Ghép số với đơn vị, cách nhau một khoảng trắng: '92.000 ₫', '15,2 lần'.
 * Đơn vị rỗng thì trả riêng phần số, không để lại khoảng trắng thừa.
 */
export function formatValueWithUnit(
  value: number,
  unit: string,
  options?: FormatNumberOptions,
): string {
  const number = formatNumber(value, options);
  return unit.trim() === '' ? number : `${number} ${unit}`;
}

/**
 * Chuỗi hiển thị của một CalcOutput.
 * Không tính được thì ra NO_VALUE kèm đơn vị — người dùng vẫn biết đang đọc đại lượng gì,
 * mà không bao giờ thấy NaN, Infinity hay 0 thay cho lỗi (FR-06).
 */
export function formatCalcOutput(out: CalcOutput, options?: FormatNumberOptions): string {
  if (out.value === null) {
    return out.unit.trim() === '' ? NO_VALUE : `${NO_VALUE} ${out.unit}`;
  }
  return formatValueWithUnit(out.value, out.unit, options);
}

/*
 * ── Đọc ngược thứ người dùng gõ ────────────────────────────────────────────────────────
 */

/** Ký tự trừ mà bàn phím và wireframe hay dùng thay cho '-' thường. */
const MINUS_SIGNS = /[−–—]/g;

/**
 * Đọc chuỗi người dùng gõ thành số.
 *
 * Chấp nhận cả hai lối viết vì người dùng gõ lẫn lộn: '92.000' và '92000' đều ra 92000,
 * '14,3' và '14.3' đều ra 14,3. Quy tắc phân biệt: dấu chấm chỉ được coi là dấu thập phân
 * khi trong chuỗi không có dấu phẩy nào — có phẩy thì phẩy mới là dấu thập phân, còn chấm
 * là dấu ngăn nghìn.
 *
 * TUYỆT ĐỐI không trả NaN: chuỗi rỗng, toàn khoảng trắng, hay rác đều trả null, để nơi gọi
 * buộc phải xử lý trường hợp "chưa có số" thay vì lỡ tay đưa NaN vào công thức (FR-06).
 */
export function parseViNumber(text: string): number | null {
  const raw = text.replace(MINUS_SIGNS, '-').trim();
  if (raw === '') return null;

  // Người dùng đang gõ dở: '-' hay '92,' chưa phải số hoàn chỉnh.
  if (/^-?$/.test(raw)) return null;

  const hasComma = raw.includes(',');
  const normalized = hasComma
    ? raw.replace(/\./g, '').replace(',', '.')
    : // Không có phẩy: dấu chấm là ngăn nghìn nếu đứng theo đúng nhóm ba chữ số ('92.000'),
      // ngược lại coi là dấu thập phân ('14.3') — người quen bàn phím số hay gõ kiểu này.
      isThousandGrouped(raw)
      ? raw.replace(/\./g, '')
      : raw;

  if (!/^-?\d*\.?\d*$/.test(normalized)) return null;

  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

/** '92.000' và '1.234.567' là ngăn nghìn; '14.3' và '1.2345' thì không. */
function isThousandGrouped(text: string): boolean {
  return /^-?\d{1,3}(\.\d{3})+$/.test(text);
}

/*
 * ── Đổi đơn vị tiền — UnitSwitcher của gói 2.3.3 ───────────────────────────────────────
 */

/** Bậc đơn vị tiền theo quy ước Việt Nam (CON-05). Thứ tự đúng thứ tự nút trên WF-16. */
export const UNIT_SCALES = [
  { id: 'billion', label: 'tỷ ₫', factor: 1_000_000_000 },
  { id: 'million', label: 'triệu ₫', factor: 1_000_000 },
  { id: 'dong', label: '₫', factor: 1 },
] as const;

export type UnitScaleId = (typeof UNIT_SCALES)[number]['id'];

/** Tra một bậc đơn vị theo id. Id lạ thì trả về bậc '₫' chứ không ném lỗi. */
export function findUnitScale(id: string): (typeof UNIT_SCALES)[number] {
  // Bậc cuối là '₫', luôn tồn tại — nhưng noUncheckedIndexedAccess nên vẫn phải kiểm.
  const fallback = UNIT_SCALES[UNIT_SCALES.length - 1] ?? UNIT_SCALES[0];
  if (fallback === undefined) throw new Error('UNIT_SCALES không được rỗng.');
  return UNIT_SCALES.find((scale) => scale.id === id) ?? fallback;
}

/**
 * Quy một số tiền (đơn vị ₫) về bậc đã chọn: 92_000_000_000 ở bậc 'billion' ra 92.
 * Chỉ đổi con số, không kèm nhãn — nhãn lấy từ `findUnitScale(id).label`.
 */
export function scaleToUnit(valueInDong: number, id: UnitScaleId): number {
  if (!Number.isFinite(valueInDong)) return Number.NaN;
  return valueInDong / findUnitScale(id).factor;
}

/** Chiều ngược lại: người dùng gõ 92 ở bậc 'tỷ ₫' thì công thức nhận 92_000_000_000. */
export function scaleToDong(value: number, id: UnitScaleId): number {
  if (!Number.isFinite(value)) return Number.NaN;
  return value * findUnitScale(id).factor;
}
