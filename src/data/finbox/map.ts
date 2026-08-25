/**
 * Tầng DATA — đọc phản hồi thô của Finbox_v2 thành kiểu của dự án. **Thuần, không fetch.**
 *
 * Tách khỏi `client.ts` để kiểm được bằng Node trên phản hồi thật đã lưu (`map.test.ts`), thay
 * vì phải có mạng mới biết phép đổi đơn vị đúng hay sai.
 *
 * ── Ba luật số học chép từ `scripts/gen-live-fundamentals.mjs`, kèm lý do ────────────────────
 *
 * 1. **Nhân 1000.** `eps_pha_loang`, `gia_tri_so_sach`, `ct_ct_tm_{năm}` đều tính bằng *nghìn ₫*,
 *    còn `Fundamentals` tính bằng ₫. Sai một lần nhân là sai đúng một nghìn lần — loại lỗi không
 *    ai thấy ngay trên màn.
 * 2. **`netIncome` là TTM, không phải `ln_y{năm}`.** Đo được với MWG: `ln_y2026 = 6017` chỉ là
 *    luỹ kế từ đầu năm (2026 chưa hết), trong khi `eps_pha_loang` là EPS 12 tháng gần nhất. Hai
 *    khái niệm khác kỳ, đem tính ROE ra sai gần 2/3. Đúng phép: cộng 4 quý gần nhất.
 * 3. **`ct_ct_tm_` là nghìn ₫, KHÔNG phải tỷ lệ trên mệnh giá.** Thoạt nhìn VCB `0.45` rất giống
 *    45%, nhưng VNM `4.35` → 4.350 ₫/CP mới khớp mức cổ tức VNM thật trả.
 *
 * Vì sao vẫn còn hai bản (file này và script `.mjs`): script chạy bằng Node trần nên không import
 * được TypeScript. Chống trôi bằng `map.test.ts` — nó chạy file này trên phản hồi thật của FPT và
 * MWG rồi so với đúng con số mà script đã sinh ra trong `live-fundamentals.generated.ts`.
 *
 * ── Vì sao hỏng thì trả `null` chứ không ném ────────────────────────────────────────────────
 *
 * Script ném là đúng: nó chạy lúc build, dừng lại còn hơn ghi số sai vào repo. Ở đây thì đang có
 * một người đang nhìn màn hình, và FR-06 nói rõ phải hiện "—" kèm lý do. Một bản báo cáo lệch của
 * MỘT mã không được phép làm hỏng cả màn Danh mục.
 */

import type { Fundamentals } from '../types';
import type { TickerRef, TickerSnapshot } from './types';

/** Một tỷ — đổi ₫ sang tỷ ₫ cho các khoản mục toàn doanh nghiệp. */
const BILLION = 1_000_000_000;

/** Đơn vị của API là nghìn ₫; `Fundamentals` và `Quote` dùng ₫. */
const THOUSAND = 1000;

/** Ngưỡng đối chiếu, cùng con số script dùng. Lệch hơn thế thì không tin bản ghi nữa. */
const TOLERANCE = 0.01;

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function text(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Đọc một field số, chấp nhận CẢ HAI hình dạng phản hồi.
 *
 * `POST /v1/getTickerDetail` gói các chuỗi theo kỳ vào một object con `dynamic`, còn
 * `POST /data/symbols` trải phẳng chúng ngay trên bản ghi (đã đo: `typeof record.dynamic` là
 * `undefined` ở endpoint thứ hai). Một hàm đọc phục vụ cả hai thì phần còn lại của file không
 * phải biết phản hồi đến từ endpoint nào.
 */
function periodicNumber(record: Record<string, unknown>, key: string): number | null {
  const flat = num(record[key]);
  if (flat !== null) return flat;

  const nested = asRecord(record.dynamic);
  return nested === null ? null : num(nested[key]);
}

/** Mọi khoá theo kỳ, gộp từ cả hai hình dạng — dùng để dò năm/quý có mặt. */
function periodicKeys(record: Record<string, unknown>): string[] {
  const nested = asRecord(record.dynamic);
  return nested === null ? Object.keys(record) : [...Object.keys(record), ...Object.keys(nested)];
}

/**
 * Năm gần nhất có giá trị KHÁC 0 của một tiền tố kiểu `ct_ct_tm_`.
 *
 * Bỏ qua năm giá trị 0 vì đó gần như chắc chắn là "chưa có số" chứ không phải cổ tức thật bằng 0
 * — đã gặp `ln_y2024 = 0` cùng dạng lúc khảo sát.
 */
function latestNonZero(record: Record<string, unknown>, prefix: string): number | null {
  const re = new RegExp(`^${prefix}(\\d{4})$`);
  const years = periodicKeys(record)
    .map((key) => re.exec(key))
    .filter((match): match is RegExpExecArray => match !== null)
    .map((match) => Number(match[1]))
    .sort((a, b) => b - a);

  for (const year of years) {
    const value = periodicNumber(record, `${prefix}${year}`);
    if (value !== null && value !== 0) return value;
  }
  return null;
}

/** Lợi nhuận ròng 12 tháng gần nhất — cộng 4 quý gần nhất của `ln_q{quý}/{năm}`, đơn vị tỷ ₫. */
function trailingTwelveMonths(record: Record<string, unknown>): number | null {
  const re = /^ln_q(\d)\/(\d{4})$/;
  const quarters = periodicKeys(record)
    .map((key) => {
      const match = re.exec(key);
      if (match === null) return null;
      const value = periodicNumber(record, key);
      if (value === null) return null;
      return { rank: Number(match[2]) * 4 + Number(match[1]), value };
    })
    .filter((entry): entry is { rank: number; value: number } => entry !== null)
    // Cùng một quý có thể xuất hiện ở cả bản phẳng lẫn `dynamic`; giữ một bản, nếu không TTM
    // sẽ cộng đôi và ra gấp đôi lợi nhuận thật.
    .filter((entry, index, all) => all.findIndex((other) => other.rank === entry.rank) === index)
    .sort((a, b) => b.rank - a.rank);

  if (quarters.length < 4) return null;
  return quarters.slice(0, 4).reduce((sum, entry) => sum + entry.value, 0);
}

/** Trong ngưỡng hay không. Không có số để so (API thiếu field) thì coi như đạt, giống script. */
function withinTolerance(computed: number, expected: number | null): boolean {
  if (expected === null || expected === 0) return true;
  return Math.abs(computed - expected) / Math.abs(expected) <= TOLERANCE;
}

/**
 * Số liệu cơ bản của một bản ghi, hoặc `null` nếu thiếu field bắt buộc / không qua đối chiếu.
 *
 * Ba phép đối chiếu bắt ba loại lỗi khác nhau, nên giữ đủ cả ba: P/E và P/B bắt lỗi đơn vị (nhân
 * hụt hoặc nhân thừa 1000), còn TTM → EPS bắt lỗi lệch kỳ báo cáo mà hai phép kia không thấy vì
 * chúng đọc field khác.
 */
export function toFundamentals(record: Record<string, unknown>): Fundamentals | null {
  const epsRaw = num(record.eps_pha_loang);
  const bookRaw = num(record.gia_tri_so_sach);
  const shares = num(record.slcp);
  const priceRaw = num(record.priceFlat);
  const bctc = text(record.bctc);

  if (epsRaw === null || bookRaw === null || shares === null || shares <= 0 || bctc === null) {
    return null;
  }

  // Đối chiếu bằng CHÍNH đơn vị API trả (chưa nhân 1000) — cùng thang thì mới so được.
  if (epsRaw !== 0 && priceRaw !== null && !withinTolerance(priceRaw / epsRaw, num(record.pe))) {
    return null;
  }
  if (bookRaw !== 0 && priceRaw !== null && !withinTolerance(priceRaw / bookRaw, num(record.pb))) {
    return null;
  }

  const netIncomeTtm = trailingTwelveMonths(record);
  if (netIncomeTtm === null) return null;

  const eps = round(epsRaw * THOUSAND, 0);
  const bookValuePerShare = round(bookRaw * THOUSAND, 0);

  // TTM phải sinh lại đúng EPS đang công bố — cả hai đều là khái niệm "12 tháng gần nhất".
  if (!withinTolerance((netIncomeTtm * BILLION) / shares, eps === 0 ? null : eps)) return null;

  const dividendRaw = latestNonZero(record, 'ct_ct_tm_');

  return {
    eps,
    bookValuePerShare,
    sharesOutstanding: shares,
    dividendPerShare: dividendRaw === null ? 0 : round(dividendRaw * THOUSAND, 0),
    netIncome: round(netIncomeTtm, 1),
    // Suy ra như `wholeCompany()` trong `samples.ts` — API không có vốn chủ sở hữu tuyệt đối.
    equity: round((bookValuePerShare * shares) / BILLION, 1),
    period: bctc.startsWith('BCTC') ? bctc : `BCTC ${bctc}`,
  };
}

/** Một bản ghi của `POST /data/symbols` thành ảnh chụp, hoặc `null` khi thiếu cả mã. */
export function toSnapshot(value: unknown): TickerSnapshot | null {
  const record = asRecord(value);
  if (record === null) return null;

  const code = text(record.ticker) ?? text(record.symbol);
  if (code === null) return null;

  const priceRaw = num(record.priceFlat);

  return {
    code: code.toUpperCase(),
    name: text(record.company) ?? code.toUpperCase(),
    priceVnd: priceRaw === null || priceRaw <= 0 ? null : round(priceRaw * THOUSAND, 0),
    floor: text(record.floor),
    industry: text(record.industry),
    fundamentals: toFundamentals(record),
  };
}

/** Thân phản hồi của `POST /data/symbols` → bảng tra theo mã. Bản ghi hỏng bị bỏ, không ném. */
export function parseSnapshots(body: unknown): Map<string, TickerSnapshot> {
  const record = asRecord(body);
  const list = record === null ? null : record.symbols;
  const rows = Array.isArray(list) ? list : Array.isArray(body) ? body : [];

  const out = new Map<string, TickerSnapshot>();
  for (const row of rows) {
    const snapshot = toSnapshot(row);
    if (snapshot !== null) out.set(snapshot.code, snapshot);
  }
  return out;
}

/**
 * Thân phản hồi của `GET /bp/codes` → danh sách mã giao dịch được.
 *
 * **Luật lọc là `code !== name`.** Danh sách trộn ba loại: mã cổ phiếu (`{code:'FPT',
 * name:'FPT Corp'}`), chỉ số (`{code:'VNINDEX', name:'VNINDEX'}`) và tên ngành
 * (`{code:'Bánh kẹo', name:'Bánh kẹo'}`) — hai loại sau luôn có `code` bằng đúng `name`.
 *
 * Vì sao KHÔNG lọc bằng "ba ký tự viết hoa": `HNX` lọt qua luật đó (đo được: 1.626 mục khớp, có
 * cả HNX), còn chứng chỉ quỹ mã dài như `E1VFVN30`, `FUCTVGF3` thì bị loại oan. Luật `code !==
 * name` cho đúng 1.649 mã và 80 mục bị loại, không sót không thừa.
 */
export function parseTickerList(body: unknown): TickerRef[] {
  if (!Array.isArray(body)) return [];

  const out: TickerRef[] = [];
  const seen = new Set<string>();

  for (const row of body) {
    const record = asRecord(row);
    if (record === null) continue;

    const code = text(record.code);
    const name = text(record.name);
    if (code === null || name === null || code === name) continue;

    const upper = code.toUpperCase();
    if (seen.has(upper)) continue;
    seen.add(upper);
    out.push({ code: upper, name });
  }

  return out;
}
