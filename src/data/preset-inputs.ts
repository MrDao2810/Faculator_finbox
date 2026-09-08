/**
 * Tầng DATA — đổi một bộ số liệu mẫu thành giá trị cho các ô nhập (FR-10).
 *
 * Trước đợt này bảng ánh xạ nằm ngay trong `FormulaDetail.tsx`, tức tầng PRESENTATION quyết định
 * "trường `sharesOutstanding` của báo cáo đi vào ô nào, theo đơn vị nào". Đó là kiến thức tài chính
 * chứ không phải việc của một component, và hệ quả đo được: bảng cũ bỏ sót số cổ phiếu, nên nạp FPT
 * cho công thức vốn hoá ra **giá FPT × số cổ phiếu mặc định 118 triệu** — sai gần 12 lần mà trên màn
 * không có gì nói là đã sai. Đưa xuống đây thì kiểm được bằng Node cho cả 111 công thức một lượt.
 *
 * FR-10 hứa "nạp xong vẫn sửa được từng ô", nên hàm này chỉ TRẢ VỀ giá trị; không khoá, không lưu.
 */

import type { CalcInputs } from '@/core/calc';
import type { FormulaSpec } from '@/core/registry';

import type { DailyBar, Fundamentals, Preset } from './types';

/**
 * Hai chân giá của một khoản đầu tư, và vì sao chúng lấy hai phiên khác nhau.
 *
 * Chân *giá vào* lấy phiên ĐẦU chuỗi, chân *giá hiện tại* lấy phiên CUỐI. Nếu cả hai cùng lấy phiên
 * cuối thì mọi công thức lãi lỗ nạp mẫu xong đều ra đúng 0% — mua và bán cùng một giá — tức bộ mẫu
 * bày ra một ca vô nghĩa. Lấy hai đầu chuỗi thì nạp mẫu thành một tình huống thật đọc được ngay:
 * "mua đầu kỳ, bán phiên gần nhất".
 *
 * Đây cũng đúng cách chia chân giá mà biểu đồ trục thời gian dùng (`src/core/chart/history.ts`),
 * nên hai chỗ không thể nói hai chuyện khác nhau về cùng một bộ số liệu.
 */
const ENTRY_LEG = ['buyPrice', 'startPrice', 'entryPrice'] as const;
const CURRENT_LEG = ['price', 'endPrice', 'sellPrice'] as const;

/** Một tỷ — đổi tỷ ₫ sang ₫ khi chia cho số cổ phiếu. */
const BILLION = 1_000_000_000;
/** Một triệu — đổi CP sang triệu CP. */
const MILLION = 1_000_000;

/**
 * Một giá trị bộ mẫu điền được, kèm ĐƠN VỊ mà con số ấy mang nghĩa.
 *
 * Có trường `units` vì Registry dùng **cùng một tên khoá cho hai đại lượng khác nhau**, và khớp
 * theo tên thôi thì đổ nhầm số mà không gì bắt được — xem docblock của `presetInputs()`.
 */
interface PresetValue {
  value: number;
  /**
   * Đơn vị mà ô nhận PHẢI khai. Ô khai đơn vị khác thì bỏ qua: cùng con số, khác nghĩa.
   *
   * Là một MẢNG chứ không phải một chuỗi vì Registry có hai cách viết cho cùng một đại lượng —
   * `dividendPerShare` viết `'₫'` ở `ty-le-chi-tra-co-tuc` và `'₫/CP'` ở ba công thức khác. Cả hai
   * đều là "tiền mặt trên mỗi cổ phiếu, tính bằng đồng"; đó là khác biệt cách viết, không phải hai
   * đại lượng.
   */
  units: ReadonlyArray<string>;
  /**
   * Giá trị này KHÔNG phải số thật của mã — nó do bộ mẫu tự dựng.
   *
   * Chỉ đúng một nhóm rơi vào đây: chân giá VÀO của bộ mẫu bản thảo. `makeBars()` neo chuỗi giá ở
   * phiên **cuối** (xem `samples.ts`), nên `bars[last].close` là thị giá thật còn 247 phiên trước
   * là PRNG. Ô "Giá mua" nhận `bars[0].close` — với VIC là 318.750 ₫ trong khi thị giá thật là
   * 243.500 ₫, tức một mức giá VIC chưa từng có.
   *
   * Số ấy vẫn ĐIỀN vào ô (bộ mẫu bày ra tình huống "mua đầu kỳ, bán phiên gần nhất" cho người đọc
   * hình dung), nhưng màn không được gắn nhãn "dữ liệu của VIC" lên nó — làm vậy là khẳng định một sự
   * kiện thị trường không có thật, đúng loại sai FR-06 sinh ra để chặn, chỉ khác là nằm ở nhãn chứ
   * không ở số. `presetRealKeys()` là thứ tách hai loại ra.
   */
  synthetic?: boolean;
}

/**
 * Mọi giá trị bộ mẫu suy ra được, theo khoá ô nhập.
 *
 * **Đơn vị là phần dễ sai nhất của cả file**, nên nói rõ từng dòng. Registry có HAI khoá cho số cổ
 * phiếu với hai đơn vị khác nhau: `sharesOutstanding` tính bằng **CP** (nhóm Chỉ số doanh nghiệp) và
 * `shares` tính bằng **triệu CP** (nhóm Định giá). Gán cùng một con số vào cả hai là sai một triệu
 * lần ở một trong hai chỗ. `preset-inputs.test.ts` khoá đơn vị của cả hai khoá lại, nên nếu sau này
 * ai đổi đơn vị trong spec thì test đỏ chứ không phải người dùng nhận số sai.
 */
function candidates(
  fundamentals: Fundamentals,
  bars: ReadonlyArray<DailyBar>,
  isDraft: boolean,
): Record<string, PresetValue> {
  const first = bars[0];
  const last = bars[bars.length - 1];

  /*
   * Chuỗi CHỈ CÓ MỘT PHIÊN thì bỏ hẳn chân giá vào, không điền bằng chính phiên ấy.
   *
   * Đây là ca của preset dựng lúc chạy từ API Finbox: nó chỉ có thị giá hôm nay, không có lịch
   * sử. Điền cả hai chân bằng cùng một giá thì mọi công thức lãi/lỗ ra đúng 0% — "mua và bán
   * cùng một giá" — tức bày ra một tình huống vô nghĩa mà trông như đã nạp xong, đúng cái bẫy
   * docblock ở đầu file này cảnh báo. Để trống thì `runFormula()` báo INCOMPLETE_INPUT và người
   * dùng biết còn phải gõ giá vốn của chính họ vào (FR-06).
   */
  const entryClose = bars.length >= 2 ? first?.close : undefined;

  /** Tiền mặt trên mỗi cổ phiếu — hai cách viết cùng nghĩa, xem `PresetValue.units`. */
  const PER_SHARE_CASH = ['₫', '₫/CP'];

  /*
   * Doanh thu trên mỗi cổ phiếu, đơn vị ₫ — SUY RA tại đây chứ không lưu trong `Fundamentals`.
   *
   * Cùng lý do `shares` được chia từ `sharesOutstanding` ngay dòng dưới: nó là phép đổi đơn vị của
   * một con số đã có, và lưu thêm một bản trong file sinh chỉ tạo cơ hội cho hai bản lệch nhau.
   * `revenue` tính bằng tỷ ₫ nên phải nhân một tỷ trước khi chia số cổ phiếu.
   */
  const salesPerShare =
    fundamentals.revenue === undefined
      ? undefined
      : (fundamentals.revenue * BILLION) / fundamentals.sharesOutstanding;

  const values: Record<string, PresetValue | undefined> = {
    /*
     * ── Chuỗi giá ────────────────────────────────────────────────────────────
     *
     * Chân giá VÀO của bộ mẫu bản thảo mang cờ `synthetic`: nó là `bars[0].close`, tức một phiên
     * PRNG, chứ không phải giá mã ấy từng có. Chân giá HIỆN TẠI thì luôn thật — `makeBars()` neo
     * đúng phiên cuối vào thị giá thật. Xem `PresetValue.synthetic`.
     */
    ...Object.fromEntries(ENTRY_LEG.map((key) => [key, dong(entryClose, ['₫'], isDraft)])),
    ...Object.fromEntries(CURRENT_LEG.map((key) => [key, dong(last?.close, ['₫'])])),

    // ── Số trên mỗi cổ phiếu, đơn vị ₫ ───────────────────────────────────────
    eps: dong(fundamentals.eps, ['₫']),
    bookValuePerShare: dong(fundamentals.bookValuePerShare, ['₫']),
    // Cùng một đại lượng, hai tên trong Registry: `pb` gọi `bookValuePerShare`, `so-graham` gọi
    // `bvps`. Alias ở đây, y hệt cặp `dividend`/`dividendPerShare` ngay dưới.
    bvps: dong(fundamentals.bookValuePerShare, ['₫']),
    dividendPerShare: dong(fundamentals.dividendPerShare, PER_SHARE_CASH),
    dividend: dong(fundamentals.dividendPerShare, PER_SHARE_CASH),
    salesPerShare: dong(salesPerShare, ['₫']),

    // ── Khoản mục toàn doanh nghiệp, đơn vị tỷ ₫ ──────────────────────────────
    netIncome: dong(fundamentals.netIncome, ['tỷ ₫']),
    equity: dong(fundamentals.equity, ['tỷ ₫']),
    revenue: dong(fundamentals.revenue, ['tỷ ₫']),
    totalAssets: dong(fundamentals.totalAssets, ['tỷ ₫']),
    /*
     * CHỈ `totalLiabilities`, KHÔNG có `totalDebt`.
     *
     * `ev` cũng có khoá `totalDebt` cùng đơn vị tỷ ₫, nhưng nhãn của nó là "Nợ vay" — chỉ nợ vay có
     * lãi, hẹp hơn hẳn tổng nợ phải trả. Đổ tổng nợ vào đó thì giá trị doanh nghiệp thổi phồng
     * đúng bằng phần nợ chiếm dụng, và cửa đơn vị không cứu được vì hai nghĩa cùng đơn vị. Ô ấy để
     * người dùng tự nhập.
     */
    totalLiabilities: dong(fundamentals.totalLiabilities, ['tỷ ₫']),
    marketCap: dong(fundamentals.marketCap, ['tỷ ₫']),

    // ── Bội số, đơn vị lần ───────────────────────────────────────────────────
    pe: dong(fundamentals.pe, ['lần']),

    // ── Số cổ phiếu: hai khoá, hai đơn vị ────────────────────────────────────
    sharesOutstanding: dong(fundamentals.sharesOutstanding, ['CP']),
    shares: dong(fundamentals.sharesOutstanding / MILLION, ['triệu CP']),
  };

  const clean: Record<string, PresetValue> = {};
  for (const [key, entry] of Object.entries(values)) {
    if (entry !== undefined && Number.isFinite(entry.value)) clean[key] = entry;
  }
  return clean;
}

/** Gói một giá trị kèm đơn vị; `undefined` vào thì `undefined` ra, để `candidates()` lọc một lượt. */
function dong(
  value: number | undefined,
  units: ReadonlyArray<string>,
  synthetic = false,
): PresetValue | undefined {
  return value === undefined ? undefined : { value, units, ...(synthetic ? { synthetic } : {}) };
}

/**
 * Giá trị bộ mẫu điền được cho MỘT công thức.
 *
 * Chỉ trả về khoá mà công thức thật sự có, nên nơi gọi trộn thẳng vào state ô nhập được mà không sợ
 * đặt giá trị cho một biến không tồn tại. Công thức không liên quan tới mã nào — lãi kép, CAGR,
 * lãi lỗ phái sinh — trả về object rỗng, và đó là câu trả lời đúng chứ không phải thiếu sót: đầu
 * vào của chúng là tiền và giả định của chính người dùng, không mã nào có thay họ được.
 *
 * ── Vì sao khớp tên khoá thôi thì CHƯA đủ ────────────────────────────────────────────────────
 *
 * Registry dùng cùng một tên khoá cho hai đại lượng khác nhau, và trước đợt này màn đổ nhầm số
 * mà không cảnh báo nào bắt được: `equity` nghĩa là "vốn chủ sở hữu doanh nghiệp, tỷ ₫" ở `bvps`/
 * `roe`/`wacc`, nhưng ở `don-bay-hieu-dung` nó là "Vốn thực có trong tài khoản, ₫". Nạp FPT vào
 * công thức đòn bẩy điền 39.851,2 vào một ô tính bằng đồng — **sai một tỷ lần**, mà 39.851,2 vẫn
 * nằm gọn trong miền hợp lệ `0…100 tỷ` nên `clampToSpec()` không kêu, `ok()` không kêu, và người
 * dùng nhận một con số đòn bẩy trông hoàn toàn bình thường. Đúng loại sai mà FR-06 sinh ra để
 * chặn, và đúng loại sai mà docblock đầu file này đã kể một lần rồi (vốn hoá FPT sai 12 lần).
 *
 * Cửa đơn vị là **luật**, không phải danh sách loại trừ theo `id`: thêm một công thức mới dùng lại
 * khoá `equity` với đơn vị ₫ thì nó tự động không được điền, không cần ai nhớ cập nhật gì.
 *
 * Cửa này KHÔNG bắt được ca hai nghĩa **cùng đơn vị** — `price` là thị giá cổ phiếu ở bảy công
 * thức và là "Giá bán một sản phẩm" ở `diem-hoa-von`, cả hai đều `'₫'`. Ca đó phải tách bằng tên
 * khoá riêng, và `preset-inputs.test.ts` ghim từng cặp `id · khoá` để không ai thêm được một ca
 * thứ hai mà không nhìn vào nghĩa.
 */
export function presetInputs(preset: Preset, spec: FormulaSpec): CalcInputs {
  const filled: Record<string, number> = {};
  for (const [key, candidate] of matched(preset, spec)) filled[key] = candidate.value;
  return filled;
}

/**
 * Khoá mà giá trị điền được là **số THẬT của mã** — tập con của `presetInputs()`.
 *
 * Khác biệt duy nhất là chân giá VÀO của bộ mẫu bản thảo: nó vẫn được `presetInputs()` điền vào ô
 * (để bộ mẫu bày ra tình huống "mua đầu kỳ, bán phiên gần nhất"), nhưng KHÔNG có mặt ở đây, vì
 * `bars[0].close` là một phiên PRNG chứ không phải giá mã ấy từng có — xem `PresetValue.synthetic`.
 *
 * Đây là thứ giao diện phải dùng để gắn nhãn "↳ <mã>". Dùng nhầm `presetInputs()` thì màn khẳng
 * định "VIC từng có giá 318.750 ₫" trong khi thị giá thật là 243.500 — một sự kiện thị trường
 * không tồn tại. Bảy công thức đi qua chân giá vào, nên đây không phải ca hiếm.
 */
export function presetRealKeys(preset: Preset, spec: FormulaSpec): ReadonlySet<string> {
  const real = new Set<string>();
  for (const [key, candidate] of matched(preset, spec)) {
    if (candidate.synthetic !== true) real.add(key);
  }
  return real;
}

/** Các cặp `khoá → giá trị` mà công thức này nhận được, sau cửa đơn vị. */
function matched(preset: Preset, spec: FormulaSpec): Array<[string, PresetValue]> {
  const all = candidates(preset.fundamentals, preset.bars, preset.isDraft);
  const out: Array<[string, PresetValue]> = [];

  for (const variable of spec.variables) {
    const candidate = all[variable.key];
    if (candidate === undefined) continue;
    if (!candidate.units.includes(variable.unit)) continue;
    out.push([variable.key, candidate]);
  }

  return out;
}

/** Mọi khoá mà bộ mẫu điền được — cho test và cho phần đếm phủ. */
export function presetFillableKeys(preset: Preset): ReadonlyArray<string> {
  return Object.keys(candidates(preset.fundamentals, preset.bars, preset.isDraft)).sort();
}

/** Đơn vị mà bộ mẫu khai cho một khoá — cho ca kiểm "không có đơn vị chết". */
export function presetFillableUnits(preset: Preset): ReadonlyArray<string> {
  const units = new Set<string>();
  for (const entry of Object.values(candidates(preset.fundamentals, preset.bars, preset.isDraft))) {
    for (const unit of entry.units) units.add(unit);
  }
  return [...units].sort();
}
