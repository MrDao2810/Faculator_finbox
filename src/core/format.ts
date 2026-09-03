/**
 * Tầng DOMAIN — định dạng và đọc số theo quy ước Việt Nam (gói WBS 2.3, 2.4).
 *
 * CON-05: nghìn ngăn bằng dấu chấm, thập phân bằng dấu phẩy — `92.000`, `14,3`.
 * Cả bộ nhập liệu (2.3) lẫn khối kết quả (2.4) đều đi qua đây, để 111 công thức hiện số
 * cùng một kiểu và đội nội dung sửa được ở một chỗ.
 *
 * Locale khoá cứng 'vi-VN' chứ không lấy locale hệ thống: tầng Domain phải cho ra cùng
 * một kết quả với cùng một đầu vào (NFR-REL-03), và bản build là HTML tĩnh nên chuỗi sinh
 * lúc build phải khớp chuỗi sinh lúc chạy, nếu không sẽ lệch hydration.
 */

import type { Bilingual, CalcOutput } from './types';

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
 * Bộ định dạng đã dựng, tra theo cặp (số lẻ tối thiểu, số lẻ tối đa).
 *
 * `new Intl.NumberFormat()` không rẻ — nó phải tra dữ liệu locale ICU mỗi lần gọi. Đo trên bản
 * build: mở MỘT màn chi tiết dựng **273 bộ** mà chỉ có **3 cặp tham số khác nhau**, tốn 40 ms ở
 * lượt đầu (lúc dữ liệu locale còn nguội). Con số ấy lặp lại theo TỪNG PHÍM gõ, vì mỗi phím là
 * một lượt dựng lại cả màn.
 *
 * Nhớ lại được vì hàm này thuần: cùng cặp tham số thì cùng một bộ định dạng, và `Intl.NumberFormat`
 * không mang trạng thái giữa các lần `.format()`. Số khoá bị chặn bởi mã nguồn chứ không bởi
 * người dùng — tham số đến từ `VariableSpec.decimals` và các chỗ gọi cố định, nên bảng tra không
 * phình theo thao tác.
 */
const FORMATTERS = new Map<string, Intl.NumberFormat>();

function formatterFor(minDecimals: number, maxDecimals: number): Intl.NumberFormat {
  const key = `${String(minDecimals)}:${String(maxDecimals)}`;
  const cached = FORMATTERS.get(key);
  if (cached !== undefined) return cached;

  const formatter = new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
  FORMATTERS.set(key, formatter);
  return formatter;
}

/**
 * Định dạng một số theo quy ước Việt Nam.
 * Giá trị không hữu hạn trả về NO_VALUE chứ không bao giờ ra chuỗi 'NaN' hay 'Infinity' (FR-06).
 */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  if (!Number.isFinite(value)) return NO_VALUE;

  const { minDecimals = 0, maxDecimals = 2, signed = false } = options;

  const text = formatterFor(minDecimals, Math.max(minDecimals, maxDecimals)).format(value);

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

/**
 * Ngày ISO 'YYYY-MM-DD' thành 'DD/MM/YYYY'. Chuỗi không đúng dạng thì trả nguyên xi.
 *
 * KHÔNG đi qua `new Date()`: chuỗi ISO đã đúng thứ tự sẵn nên cắt chuỗi là đủ, và không có múi
 * giờ nào xen vào được — `new Date('2025-12-31').getDate()` trên máy ở múi giờ âm ra ngày 30.
 * Cùng lý do bản build là HTML tĩnh: chuỗi sinh lúc build phải khớp chuỗi sinh lúc chạy.
 */
export function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split('-');
  if (year === undefined || month === undefined || day === undefined) return iso;
  return `${day}/${month}/${year}`;
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

/**
 * Số thành chuỗi để ĐẶT VÀO ô nhập — không phải để đọc, nên không có dấu ngăn nghìn.
 *
 * Bắt buộc phải là vòng ngược của `parseViNumber()`, và `String(value)` thì không:
 * `String(100.449)` ra '100.449', chuỗi ấy khớp `isThousandGrouped()` nên đọc ngược lại thành
 * **100.449** — giá 100,449 nghìn ₫ hoá thành hơn một trăm nghìn chỉ vì người dùng chạm vào ô rồi
 * bấm ra chỗ khác. Đó là lỗi đã thấy trên màn WF-05. Ở đây dấu thập phân luôn là dấu **phẩy**, nên
 * `parseViNumber()` đi nhánh có phẩy và không còn chỗ nào để nhầm.
 *
 * Kèm theo là khử nhiễu dấu phẩy động: `String(100.45 - 0.001 + 0.001)` ra '100.44999999999997',
 * cũng đã thấy nguyên văn trong ô nhập của bảng dữ liệu. `toPrecision(12)` cắt đúng phần nhiễu mà
 * không đụng tới chữ số có nghĩa của mọi con số sản phẩm dùng (giá, khối lượng, tỷ lệ).
 *
 * Giá trị không hữu hạn trả chuỗi rỗng — ô trống, không bao giờ là 'NaN' (FR-06).
 */
export function rawViNumber(value: number): string {
  if (!Number.isFinite(value)) return '';

  const text = String(Number(value.toPrecision(12)));
  // Số quá lớn/quá nhỏ ra dạng mũ ('1e+21'); giữ nguyên vì đổi dấu ở đó là làm hỏng chuỗi.
  return text.includes('e') ? text : text.replace('.', ',');
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

/*
 * ── Rút gọn số lớn cho nhãn trên hình ──────────────────────────────────────────────────
 */

/**
 * Bậc rút gọn TỰ ĐỘNG, dùng cho chữ vẽ trên biểu đồ.
 *
 * KHÁC `UNIT_SCALES` ngay trên, và khác có chủ đích — đừng gộp hai bảng làm một:
 *
 *   - `UNIT_SCALES` là **ba nút WF-16 người dùng tự bấm**, áp cho ô nhập liệu và bảng lịch trả nợ.
 *     Nó khoá cứng vào tiền (nhãn đã gồm sẵn `₫`), là một `Preferences` được lưu lại, và có một dây
 *     neo i18n bám vào từng nhãn (`i18n.test.ts`). Mọc thêm một nấc ở đó là mọc thêm một nút trên
 *     wireframe.
 *   - Bảng dưới đây là một phép **rút gọn hiển thị**, không ai bấm: nó ghép TIỀN TỐ vào bất kỳ đơn
 *     vị nào (`'triệu' + 'sản phẩm'`, `'nghìn' + 'tỷ ₫'`), nên nhãn không dính vào tiền; và nó có
 *     thêm nấc 'nghìn' mà WF-16 không có.
 *
 * Bậc cuối `factor: 1` là "không chia" — có mặt trong bảng để nơi chọn bậc chỉ có một vòng lặp, thay
 * vì một vòng lặp cộng một nhánh mặc định.
 */
export const COMPACT_PREFIXES = [
  { factor: 1, prefix: { vi: '', en: '' } },
  { factor: 1_000, prefix: { vi: 'nghìn', en: 'thousand' } },
  { factor: 1_000_000, prefix: { vi: 'triệu', en: 'million' } },
  { factor: 1_000_000_000, prefix: { vi: 'tỷ', en: 'billion' } },
] as const;

export type CompactPrefix = (typeof COMPACT_PREFIXES)[number];

/** Những từ chỉ bậc mà một đơn vị có thể MANG SẴN — `'tỷ ₫'`, `'triệu CP'`. */
const SCALE_WORDS: ReadonlyArray<string> = COMPACT_PREFIXES.map((item) => item.prefix.vi).filter(
  (word) => word !== '',
);

/**
 * Ghép tiền tố bậc vào đơn vị: `'nghìn' + 'tỷ ₫'` ra `'nghìn tỷ ₫'`.
 *
 * @returns `null` khi phép ghép không ra một đơn vị có thật — nơi gọi phải BỎ bậc ấy đi, chứ không
 * nhận về một chuỗi vô nghĩa rồi dán lên tiêu đề trục.
 *
 * Cần cửa chặn này vì đơn vị trong dự án không phải lúc nào cũng trần: bốn công thức khai
 * `resultUnit: 'tỷ ₫'`, và biến `shares` khai `'triệu CP'`. Ghép mù lên chúng cho ra `'tỷ tỷ ₫'` —
 * đo được, không phải giả định.
 *
 * Luật: đơn vị đã mang sẵn bậc thì chỉ nhận thêm `'nghìn'`, và chỉ khi bậc sẵn có là `'tỷ'`. Đó là
 * hợp từ DUY NHẤT có thật trong tiếng Việt ở nhóm này — 'nghìn tỷ' là cách báo chí tài chính viết
 * mức 10^12, còn 'triệu tỷ', 'tỷ tỷ', 'nghìn triệu' thì không ai dùng.
 *
 * Vế `en` ghép tiền tố tiếng Anh vào ĐƠN VỊ GỐC chưa dịch (`'thousand tỷ ₫'`), đúng giới hạn đã ghi
 * ở đầu `chart/build.ts`: số và đơn vị chưa nằm trong đợt dịch.
 *
 * Tiền tố rỗng (bậc `factor: 1`) trả nguyên đơn vị, kể cả khi đơn vị cũng rỗng — không để lại khoảng
 * trắng thừa ở đầu chuỗi, thứ sẽ lọt thẳng vào tiêu đề trục thành `' (…)'`.
 */
export function withScalePrefix(unit: string, prefix: Bilingual): Bilingual | null {
  if (prefix.vi === '') return { vi: unit, en: unit };
  if (unit === '') return { vi: prefix.vi, en: prefix.en };

  const head = unit.split(' ')[0] ?? '';
  if (SCALE_WORDS.includes(head) && !(head === 'tỷ' && prefix.vi === 'nghìn')) return null;

  return { vi: `${prefix.vi} ${unit}`, en: `${prefix.en} ${unit}` };
}
