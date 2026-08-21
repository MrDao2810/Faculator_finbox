/**
 * Tầng DOMAIN — nhóm rủi ro, phần SỤT GIẢM & TỔN THẤT (pha 3 của nhóm 'risk').
 *
 * Bốn công thức ở đây đều đọc CHUỖI GIÁ chứ không chỉ vài ô nhập: mức sụt giảm sâu nhất, mức
 * sụt giảm đang chịu so với đỉnh gần nhất, VaR lịch sử và CVaR (expected shortfall). Chúng lấy
 * chuỗi qua `requireCloses()` của `series-utils.ts` — thiếu phiên thì ra cảnh báo MISSING_SERIES
 * chứ không bao giờ tự chế một chuỗi mặc định (FR-06, FR-12).
 *
 * QUY ƯỚC DẤU của cả file: mọi kết quả là SỐ DƯƠNG NGHĨA LÀ MẤT. Sụt giảm 25 nghĩa là rơi 25%
 * khỏi đỉnh; VaR 2,5 nghĩa là lỗ 2,5% trong phiên tệ. Đây là chỗ người đọc hay hiểu ngược dấu
 * nên mục `howToRead` của từng công thức nhắc lại.
 *
 * Phân vị của VaR/CVaR tính bằng NỘI SUY TUYẾN TÍNH giữa hai quan sát liền kề (cùng cách
 * PERCENTILE.INC của Excel), không làm tròn về một quan sát có sẵn — nêu rõ trong mô tả biến
 * độ tin cậy để người rà soát đối chiếu được.
 *
 * Số kỳ vọng trong `tests[]` được tính bằng script Node độc lập, viết lại công thức từ định
 * nghĩa gốc chứ không gọi chính các hàm dưới đây; chuỗi kiểm cố ý dùng giá tròn để đối chiếu
 * tay được.
 */

import { fail, ok } from '../calc-output';
import type { CalcContext, FormulaModule } from '../calc/types';
import type { CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless } from '../warnings';
import type { FormulaSource } from '../registry/types';
import { maxDrawdown, mean, requireCloses, simpleReturns } from './series-utils';
import { SOURCE_CFA, sliderVar } from './shared';

/*
 * ── Nguồn tham khảo ────────────────────────────────────────────────────────────────────
 */

/** Sách chuẩn của mảng VaR — phần trình bày phương pháp mô phỏng lịch sử. */
const SOURCE_JORION: FormulaSource = {
  label: {
    vi: 'Philippe Jorion — Value at Risk: The New Benchmark for Managing Financial Risk, ấn bản 3 (McGraw-Hill, 2006), phần phương pháp mô phỏng lịch sử',
    en: 'Philippe Jorion — Value at Risk: The New Benchmark for Managing Financial Risk, 3rd edition (McGraw-Hill, 2006), the historical simulation method section',
  },
};

/** Sách đo lường hiệu quả danh mục — phần các thước đo rủi ro sụt giảm. */
const SOURCE_BACON: FormulaSource = {
  label: {
    vi: 'Carl R. Bacon — Practical Portfolio Performance Measurement and Attribution, ấn bản 2 (Wiley, 2008), phần thước đo rủi ro sụt giảm',
    en: 'Carl R. Bacon — Practical Portfolio Performance Measurement and Attribution, 2nd edition (Wiley, 2008), the drawdown risk measures section',
  },
};

/*
 * ── Ngưỡng số phiên tối thiểu ──────────────────────────────────────────────────────────
 *
 * Sụt giảm chỉ cần đủ dài để có ít nhất một nhịp lên xuống — 30 phiên là khoảng một tháng
 * rưỡi giao dịch. VaR/CVaR là ước lượng PHÂN VỊ nên cần mẫu dày hơn hẳn: với 60 phiên, phân vị
 * 5% mới rơi vào quan sát thứ ba tính từ đáy, dưới mức đó thì một phiên xấu duy nhất quyết định
 * cả kết quả (Jorion, phần mô phỏng lịch sử).
 */
const MIN_DRAWDOWN_BARS = 30;
const MIN_VAR_BARS = 60;

/*
 * ── Tiện ích dùng chung trong file ─────────────────────────────────────────────────────
 */

/** Cắt lấy `lookback` phiên CUỐI, không bao giờ ngắn hơn `min` phiên bắt buộc của công thức. */
function windowOf(closes: ReadonlyArray<number>, lookback: number, min: number): number[] {
  const size = Math.max(min, Math.round(lookback));
  return closes.slice(-size);
}

/**
 * Phân vị mức `p` của một chuỗi ĐÃ SẮP TĂNG DẦN, nội suy tuyến tính giữa hai quan sát liền kề.
 * Vị trí h = (n − 1) × p; phần lẻ của h là trọng số của quan sát đứng sau.
 * Chuỗi rỗng trả NaN — `ok()` đổi thành fail, không có con số bịa nào lọt ra.
 */
function percentileLinear(sorted: ReadonlyArray<number>, p: number): number {
  if (sorted.length === 0) return Number.NaN;
  const ratio = Math.min(Math.max(p, 0), 1);
  const h = (sorted.length - 1) * ratio;
  const lower = Math.floor(h);
  const upper = Math.min(lower + 1, sorted.length - 1);
  const a = sorted[lower];
  const b = sorted[upper];
  if (a === undefined || b === undefined) return Number.NaN;
  return a + (h - lower) * (b - a);
}

/** Giá trị lựa chọn lạ rơi về 95% — cùng cách xử lý với `methodOf` bên personal.ts. */
function confidenceOf(raw: number): number {
  return raw === 99 ? 99 : 95;
}

interface LossTail {
  /** Chuỗi lợi suất phiên của cửa sổ đang xét. */
  returns: number[];
  /** Ngưỡng VaR dưới dạng lợi suất ÂM, ví dụ −0,01 là mốc lỗ 1%. */
  threshold: number;
}

/**
 * Phần việc chung của VaR và CVaR: lấy chuỗi, đổi ra lợi suất, tìm ngưỡng phân vị.
 *
 * Trả `CalcWarning` trong hai tình huống, nơi gọi kiểm bằng `'code' in`:
 *   · chưa đủ phiên → MISSING_SERIES (qua `requireCloses`);
 *   · ngưỡng phân vị không âm → MEANINGLESS. Đây chính là ca chuỗi phẳng hoặc chuỗi chỉ đi
 *     lên: nhóm phiên tệ nhất vẫn không lỗ, nên "mức lỗ" không tồn tại. Trả 0 ở đây là đúng
 *     thứ FR-06 cấm — người đọc sẽ hiểu thành "danh mục không có rủi ro".
 */
function lossTailOf(
  ctx: CalcContext,
  lookback: number,
  confidence: number,
): LossTail | CalcWarning {
  const closes = requireCloses(ctx, MIN_VAR_BARS);
  if (!Array.isArray(closes)) return closes;

  const returns = simpleReturns(windowOf(closes, lookback, MIN_VAR_BARS));
  const sorted = [...returns].sort((a, b) => a - b);
  const threshold = percentileLinear(sorted, 1 - confidence / 100);

  if (!Number.isFinite(threshold)) {
    return meaningless(
      {
        vi: 'Chuỗi giá hiện tại không đủ lợi suất phiên để dựng phân vị.',
        en: 'The current price series does not have enough session returns to build a percentile.',
      },
      {
        vi: 'Nạp thêm phiên giá rồi tính lại.',
        en: 'Load more price sessions and recalculate.',
      },
    );
  }
  if (threshold >= 0) {
    return meaningless(
      {
        vi: `Trong cửa sổ đang xét, ngay cả nhóm phiên tệ nhất ở mức tin cậy ${confidence}% vẫn không lỗ, nên không có mức lỗ để đo.`,
        en: `In the window being examined, even the worst sessions at the ${confidence}% confidence level still show no loss, so there is no loss to measure.`,
      },
      {
        vi: 'Chọn cửa sổ dài hơn hoặc chuỗi có phiên giảm, vì mẫu chỉ toàn phiên tăng thì mọi thước đo tổn thất đều rỗng nghĩa.',
        en: 'Pick a longer window or a series that includes down sessions — a sample made up entirely of up sessions makes every loss measure meaningless.',
      },
    );
  }

  return { returns, threshold };
}

/*
 * ── Chuỗi giá dùng cho ví dụ và ca kiểm ────────────────────────────────────────────────
 *
 * Cố ý ngắn và toàn số tròn để rà soát tay được, theo luật "số kiểm lấy từ nguồn độc lập".
 */

/** 35 phiên: leo từ 100 lên đỉnh 120, rơi về đáy 90, hồi lại 108. */
const CHUOI_DINH_120_DAY_90: ReadonlyArray<number> = [
  100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 118, 116, 114, 112, 110, 108, 106, 104,
  102, 100, 98, 96, 94, 92, 90, 92, 94, 96, 98, 100, 102, 104, 106, 108,
];

/** 31 phiên: cùng nhịp trên nhưng dừng lại đúng lúc còn nằm ở đáy 90. */
const CHUOI_DANG_O_DAY: ReadonlyArray<number> = [
  100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 118, 116, 114, 112, 110, 108, 106, 104,
  102, 100, 98, 96, 94, 92, 90, 90, 90, 90, 90, 90,
];

/** 30 phiên chỉ đi lên, mỗi phiên +1 đồng — không phiên nào rơi khỏi đỉnh. */
const CHUOI_TANG_DEU_30: ReadonlyArray<number> = [
  100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
  119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129,
];

/** 20 phiên — cố tình ngắn hơn ngưỡng 30 của nhóm sụt giảm. */
const CHUOI_THIEU_PHIEN_20: ReadonlyArray<number> = [
  100, 102, 104, 106, 108, 110, 112, 114, 116, 118, 120, 118, 116, 114, 112, 110, 108, 106, 104,
  102,
];

/**
 * 61 phiên cho VaR/CVaR — 60 lợi suất, dựng để phân vị rơi vào chỗ đếm tay được:
 * 26 nhịp 100 ↔ 101 (lợi suất −0,990099%), rồi bốn phiên giảm mạnh −10%, −5%, −1%, −1%.
 * Bốn lợi suất tệ nhất theo thứ tự: −10%, −5%, −1%, −1%.
 */
const CHUOI_VAR_MAU: ReadonlyArray<number> = [
  100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100,
  101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101,
  100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 101, 100, 90, 100, 95, 100, 99,
  100, 99, 100,
];

/** 61 phiên chỉ đi lên — mẫu không có phiên lỗ nào, dùng cho ca MEANINGLESS. */
const CHUOI_TANG_DEU_61: ReadonlyArray<number> = Array.from({ length: 61 }, (_, i) => 100 + i);

/** 40 phiên — cố tình ngắn hơn ngưỡng 60 của VaR/CVaR. */
const CHUOI_THIEU_PHIEN_40: ReadonlyArray<number> = Array.from(
  { length: 40 },
  (_, i) => 100 + (i % 5),
);

/*
 * ── Khuôn biến dùng lại ────────────────────────────────────────────────────────────────
 */

/** Cửa sổ quan sát của hai công thức sụt giảm. */
function drawdownLookback(): VariableSpec {
  return sliderVar(
    'lookback',
    { vi: 'Số phiên gần nhất đưa vào tính', en: 'Number of recent sessions to include' },
    'phiên',
    250,
    30,
    500,
    10,
    {
      description: {
        vi: 'Chuỗi dài hơn thì chỉ lấy phần cuối. Tối thiểu 30 phiên, tức khoảng một tháng rưỡi giao dịch — ngắn hơn thì chưa đủ một nhịp lên xuống để nói về sụt giảm.',
        en: 'A longer series only uses its most recent portion. Minimum 30 sessions, roughly a month and a half of trading — anything shorter is not enough for a full up-down swing to talk about drawdown.',
      },
    },
  );
}

/** Cửa sổ quan sát của VaR/CVaR — dày hơn vì đây là ước lượng phân vị. */
function varLookback(): VariableSpec {
  return sliderVar(
    'lookback',
    { vi: 'Số phiên gần nhất đưa vào tính', en: 'Number of recent sessions to include' },
    'phiên',
    250,
    60,
    750,
    10,
    {
      description: {
        vi: 'Tối thiểu 60 phiên: dưới mức đó phân vị 5% chỉ dựa vào một hai phiên xấu, con số nhảy loạn mỗi khi thêm bớt một phiên.',
        en: 'Minimum 60 sessions: below that, the 5% percentile rests on just one or two bad sessions, and the number swings wildly with every session added or removed.',
      },
    },
  );
}

/** Độ tin cậy 95% hay 99% — hai mức chuẩn của mảng quản trị rủi ro. */
function confidenceVar(): VariableSpec {
  return {
    key: 'confidence',
    label: { vi: 'Độ tin cậy', en: 'Confidence level' },
    unit: '%',
    type: 'select',
    defaultValue: 95,
    level: 'basic',
    description: {
      vi: 'Phân vị lấy ở mức (100% − độ tin cậy) của chuỗi lợi suất, nội suy tuyến tính giữa hai quan sát liền kề. Chọn 99% thì con số khắt khe hơn hẳn 95%.',
      en: 'The percentile is taken at (100% − confidence level) of the returns series, linearly interpolated between two adjacent observations. Choosing 99% gives a noticeably stricter figure than 95%.',
    },
    options: [
      { value: 95, label: { vi: '95%', en: '95%' } },
      { value: 99, label: { vi: '99%', en: '99%' } },
    ],
  } satisfies VariableSpec;
}

/*
 * ── 1. Mức sụt giảm sâu nhất ───────────────────────────────────────────────────────────
 */

export const SUT_GIAM_SAU_NHAT: FormulaModule = {
  spec: {
    id: 'sut-giam-sau-nhat',
    categoryId: 'risk',
    name: { vi: 'Mức sụt giảm sâu nhất', en: 'Maximum drawdown' },
    description: {
      vi: 'Khoảng rơi lớn nhất từ một đỉnh xuống đáy sau đó, đo trong cả cửa sổ quan sát.',
      en: 'The largest drop from a peak to a subsequent trough, measured across the whole observation window.',
    },
    latex: 'MDD = \\max_{t} \\frac{\\max_{s \\le t} P_s - P_t}{\\max_{s \\le t} P_s}',
    expression: {
      vi: 'Sụt giảm sâu nhất = lớn nhất của (Đỉnh cao nhất tính tới phiên đó − Giá phiên đó) ÷ Đỉnh cao nhất tính tới phiên đó × 100',
      en: 'Maximum drawdown = largest of (highest peak up to that session − price at that session) ÷ highest peak up to that session × 100',
    },
    chartType: 'underwater',
    level: 'basic',
    tags: ['sut giam', 'max drawdown', 'mdd', 'rui ro', 'dinh day'],
    resultUnit: '%',
    variables: [drawdownLookback()],
    explanation: {
      meaning: {
        vi: 'Nếu mua đúng đỉnh xấu nhất và bán đúng đáy sau đó thì mất bao nhiêu phần trăm — thước đo nỗi đau lớn nhất mà chuỗi giá này từng bắt người nắm giữ chịu.',
        en: 'How much you would lose if you bought at the worst possible peak and sold at the trough that followed — a measure of the deepest pain this price series has ever put a holder through.',
      },
      whenToUse: {
        vi: 'Khi chọn giữa hai cổ phiếu hay hai danh mục có lợi suất na ná nhau: cái nào sụt giảm sâu hơn là cái khó ngồi yên hơn.',
        en: 'When choosing between two stocks or portfolios with similar returns: whichever has the deeper drawdown is the harder one to sit through.',
      },
      howToRead: {
        vi: 'Kết quả là số dương và nghĩa là MẤT: 25 nghĩa là từng rơi 25% khỏi đỉnh. Rơi 25% phải lãi lại 33% mới hoà vốn, nên con số này tăng nhanh hơn cảm giác.',
        en: 'The result is a positive number and it means LOSS: 25 means it once fell 25% from its peak. A 25% drop needs a 33% gain to break even, so this figure compounds faster than intuition suggests.',
      },
      commonMistakes: {
        vi: 'Đo trên cửa sổ quá ngắn rồi kết luận cổ phiếu ít rủi ro — chưa gặp phiên xấu không có nghĩa là không có. Sụt giảm sâu nhất luôn phụ thuộc độ dài chuỗi, so hai mã thì phải so trên cùng một cửa sổ.',
        en: 'Measuring over too short a window and concluding a stock is low-risk — not having hit a bad stretch yet does not mean one cannot happen. Maximum drawdown always depends on the length of the series, so comparing two tickers requires using the same window for both.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi leo lên 120 rồi rơi về 90',
        en: 'A series that climbs to 120 then falls to 90',
      },
      inputs: { lookback: 250 },
      series: CHUOI_DINH_120_DAY_90,
      expected: 25,
      note: {
        vi: 'Đỉnh 120, đáy 90 — rơi 30 đồng trên nền 120 là 25%.',
        en: 'Peak of 120, trough of 90 — a drop of 30 on a base of 120 is 25%.',
      },
    },
    tests: [
      {
        name: 'đỉnh 120 đáy 90 thì sụt giảm sâu nhất 25%',
        inputs: { lookback: 250 },
        series: CHUOI_DINH_120_DAY_90,
        expected: 25,
      },
      {
        name: 'chuỗi chỉ đi lên thì chưa từng rơi khỏi đỉnh',
        inputs: { lookback: 250 },
        series: CHUOI_TANG_DEU_30,
        expected: 0,
      },
      {
        name: 'chuỗi dừng ở đáy 90 vẫn tính đúng khoảng rơi',
        inputs: { lookback: 250 },
        series: CHUOI_DANG_O_DAY,
        expected: 25,
      },
      {
        name: 'chưa đủ 30 phiên thì không đo được',
        inputs: { lookback: 250 },
        series: CHUOI_THIEU_PHIEN_20,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_BACON, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const closes = requireCloses(ctx, MIN_DRAWDOWN_BARS);
    if (!Array.isArray(closes)) return fail('%', closes);

    const window = windowOf(closes, v('lookback'), MIN_DRAWDOWN_BARS);
    return ok(maxDrawdown(window) * 100, '%', { extras: { barsUsed: window.length } });
  },
};

/*
 * ── 2. Mức sụt giảm hiện tại so với đỉnh gần nhất ──────────────────────────────────────
 */

export const SUT_GIAM_HIEN_TAI: FormulaModule = {
  spec: {
    id: 'sut-giam-hien-tai',
    categoryId: 'risk',
    name: { vi: 'Mức sụt giảm hiện tại', en: 'Current drawdown from peak' },
    description: {
      vi: 'Giá phiên gần nhất đang thấp hơn đỉnh cao nhất trong cửa sổ bao nhiêu phần trăm.',
      en: 'How many percent the most recent session price sits below the highest peak in the window.',
    },
    latex: 'DD_{t} = \\frac{P_{max} - P_{t}}{P_{max}}',
    expression: {
      vi: 'Sụt giảm hiện tại = (Đỉnh cao nhất trong cửa sổ − Giá phiên gần nhất) ÷ Đỉnh cao nhất trong cửa sổ × 100',
      en: 'Current drawdown = (highest peak in the window − most recent session price) ÷ highest peak in the window × 100',
    },
    chartType: 'underwater',
    level: 'basic',
    tags: ['sut giam hien tai', 'current drawdown', 'duoi dinh', 'underwater', 've dinh'],
    resultUnit: '%',
    variables: [drawdownLookback()],
    explanation: {
      meaning: {
        vi: 'Khoảng cách còn lại để giá quay về đỉnh cũ — phần "chìm dưới mặt nước" mà người đang nắm giữ chịu ngay lúc này.',
        en: 'The remaining distance for price to return to its old peak — the "underwater" portion a current holder is sitting through right now.',
      },
      whenToUse: {
        vi: 'Khi cân nhắc mua thêm hay cắt lỗ: biết mình đang cách đỉnh bao xa rõ ràng hơn là nhìn giá trần trụi.',
        en: 'When weighing whether to buy more or cut losses: knowing exactly how far you are from the peak is clearer than looking at the raw price alone.',
      },
      howToRead: {
        vi: 'Số dương nghĩa là đang thấp hơn đỉnh: 10 nghĩa là còn kém đỉnh 10%. Bằng 0 nghĩa là giá vừa lập đỉnh mới của cửa sổ. Muốn về lại đỉnh thì cần lãi 100 ÷ (100 − kết quả) − 1, tức đang chìm 20% phải lãi 25%.',
        en: 'A positive number means it is below the peak: 10 means it is still 10% short of the peak. Zero means the price has just set a new peak within the window. Getting back to the peak requires a gain of 100 ÷ (100 − result) − 1 — being 20% underwater needs a 25% gain to recover.',
      },
      commonMistakes: {
        vi: 'Nhầm sang mức sụt giảm sâu nhất: chỉ số này đo đúng khoảng cách tới đỉnh HIỆN TẠI, giá hồi lên là nó giảm ngay, còn sụt giảm sâu nhất thì đã ghi vào lịch sử và không bao giờ giảm.',
        en: 'Confusing it with maximum drawdown: this indicator measures the distance to the CURRENT peak, so it shrinks the moment price recovers, whereas maximum drawdown is already locked into history and never decreases.',
      },
    },
    example: {
      title: {
        vi: 'Đỉnh 120, giá phiên gần nhất 108',
        en: 'Peak of 120, most recent session price 108',
      },
      inputs: { lookback: 250 },
      series: CHUOI_DINH_120_DAY_90,
      expected: 10,
      note: {
        vi: 'Đã hồi từ đáy 90 lên 108 nhưng vẫn còn kém đỉnh 120 đúng 10%.',
        en: 'It has recovered from a trough of 90 to 108 but is still exactly 10% below the peak of 120.',
      },
    },
    tests: [
      {
        name: 'giá 108 so với đỉnh 120 là còn chìm 10%',
        inputs: { lookback: 250 },
        series: CHUOI_DINH_120_DAY_90,
        expected: 10,
      },
      {
        name: 'chuỗi dừng ngay ở đáy thì chìm đúng bằng khoảng rơi sâu nhất',
        inputs: { lookback: 250 },
        series: CHUOI_DANG_O_DAY,
        expected: 25,
      },
      {
        name: 'phiên gần nhất là đỉnh mới thì không chìm chút nào',
        inputs: { lookback: 250 },
        series: CHUOI_TANG_DEU_30,
        expected: 0,
      },
      {
        name: 'chưa đủ 30 phiên thì không đo được',
        inputs: { lookback: 250 },
        series: CHUOI_THIEU_PHIEN_20,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_BACON, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const closes = requireCloses(ctx, MIN_DRAWDOWN_BARS);
    if (!Array.isArray(closes)) return fail('%', closes);

    const window = windowOf(closes, v('lookback'), MIN_DRAWDOWN_BARS);
    const peak = window.reduce((best, close) => Math.max(best, close), Number.NEGATIVE_INFINITY);
    const last = window[window.length - 1];

    // `usableCloses()` đã lọc bỏ giá 0 và giá âm nên hai nhánh dưới gần như không chạm tới —
    // vẫn giữ để không có đường nào rơi vào phép chia cho 0 (FR-06).
    if (last === undefined || !Number.isFinite(peak) || peak <= 0) {
      return fail(
        '%',
        divideByZero(
          { vi: 'mức sụt giảm hiện tại', en: 'current drawdown' },
          { vi: 'Đỉnh cao nhất trong cửa sổ', en: 'highest peak in the window' },
          {
            vi: 'Kiểm tra lại chuỗi giá: phải có ít nhất một phiên giá dương.',
            en: 'Check the price series: there must be at least one session with a positive price.',
          },
        ),
      );
    }

    return ok(((peak - last) / peak) * 100, '%', { extras: { peak, lastClose: last } });
  },
};

/*
 * ── 3. VaR lịch sử theo phân vị ────────────────────────────────────────────────────────
 */

export const VAR_LICH_SU: FormulaModule = {
  spec: {
    id: 'var-lich-su',
    categoryId: 'risk',
    name: { vi: 'VaR lịch sử theo phân vị', en: 'Historical Value at Risk' },
    description: {
      vi: 'Mức lỗ một phiên mà chỉ một tỷ lệ nhỏ số phiên trong quá khứ từng vượt qua, đọc thẳng từ phân vị chuỗi lợi suất.',
      en: 'The single-session loss level that only a small share of past sessions have ever exceeded, read directly off a percentile of the returns series.',
    },
    latex: 'VaR_{\\alpha} = -Q_{1-\\alpha}(r)',
    expression: {
      vi: 'VaR = − Phân vị mức (100% − Độ tin cậy) của chuỗi lợi suất phiên × 100, nội suy tuyến tính giữa hai quan sát liền kề',
      en: 'VaR = − percentile at level (100% − confidence) of the session returns series × 100, linearly interpolated between two adjacent observations',
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['var', 'value at risk', 'gia tri chiu rui ro', 'phan vi', 'mo phong lich su'],
    resultUnit: '%',
    variables: [confidenceVar(), varLookback()],
    explanation: {
      meaning: {
        vi: 'Ngưỡng lỗ của một phiên xấu: với độ tin cậy 95%, chỉ 5% số phiên trong cửa sổ quan sát lỗ nặng hơn con số này.',
        en: 'The loss threshold of a bad session: at 95% confidence, only 5% of sessions in the observation window lose more than this figure.',
      },
      whenToUse: {
        vi: 'Khi định hạn mức rủi ro cho một vị thế hoặc cả tài khoản — biết mức lỗ ngày điển hình của một phiên xấu rồi mới đặt cỡ lệnh.',
        en: 'When setting a risk limit for a position or an entire account — know the typical loss of a bad session before sizing an order.',
      },
      howToRead: {
        vi: 'Kết quả là SỐ DƯƠNG và nghĩa là MẤT: 2,5 nghĩa là lỗ 2,5% trong phiên tệ. Đây là chỗ hay hiểu ngược dấu — con số càng lớn thì rủi ro càng cao, chứ không phải càng tốt. VaR nói NGƯỠNG chứ không nói lỗ tối đa: 5% số phiên còn lại có thể lỗ nặng hơn nhiều, phần đó phải xem tiếp bằng CVaR.',
        en: 'The result is a POSITIVE number and it means LOSS: 2.5 means a 2.5% loss in a bad session. This is where the sign is often misread — a larger number means higher risk, not something better. VaR states a THRESHOLD, not the maximum possible loss: the remaining 5% of sessions could lose much more, and that part needs CVaR to see.',
      },
      commonMistakes: {
        vi: 'Coi VaR là mức lỗ tối đa và bỏ qua phần đuôi phía sau nó. Hai sai lầm khác cũng phổ biến: nhân thẳng VaR ngày với số ngày để ra VaR tuần (phải nhân với căn bậc hai của số ngày nếu chấp nhận giả định lợi suất độc lập), và dùng cửa sổ toàn thị trường tăng rồi tưởng rủi ro thấp.',
        en: 'Treating VaR as the maximum possible loss and ignoring the tail beyond it. Two other common mistakes: multiplying daily VaR straight by the number of days to get weekly VaR (it should be scaled by the square root of the number of days under an independent-returns assumption), and using a window from an all-rising market and mistaking that for low risk.',
      },
    },
    example: {
      title: {
        vi: 'Độ tin cậy 95% trên chuỗi 61 phiên mẫu',
        en: '95% confidence on a 61-session sample series',
      },
      inputs: { confidence: 95, lookback: 250 },
      series: CHUOI_VAR_MAU,
      expected: 1,
      note: {
        vi: 'Phân vị 5% của 60 lợi suất rơi giữa hai phiên −1%, nên ngưỡng lỗ là 1%.',
        en: 'The 5% percentile of 60 returns falls between two −1% sessions, so the loss threshold is 1%.',
      },
    },
    tests: [
      {
        name: 'độ tin cậy 95% cho ngưỡng lỗ 1%',
        inputs: { confidence: 95, lookback: 250 },
        series: CHUOI_VAR_MAU,
        expected: 1,
      },
      {
        name: 'độ tin cậy 99% khắt khe hơn, ngưỡng lỗ 7,05%',
        inputs: { confidence: 99, lookback: 250 },
        series: CHUOI_VAR_MAU,
        expected: 7.05,
      },
      {
        name: 'chuỗi chỉ đi lên thì không có mức lỗ để đo',
        inputs: { confidence: 95, lookback: 250 },
        series: CHUOI_TANG_DEU_61,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chưa đủ 60 phiên thì không dựng được phân vị',
        inputs: { confidence: 95, lookback: 250 },
        series: CHUOI_THIEU_PHIEN_40,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_JORION, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const confidence = confidenceOf(v('confidence'));
    const tail = lossTailOf(ctx, v('lookback'), confidence);
    if ('code' in tail) return fail('%', tail);

    return ok(-tail.threshold * 100, '%', { extras: { observations: tail.returns.length } });
  },
};

/*
 * ── 4. CVaR — tổn thất kỳ vọng phần đuôi ───────────────────────────────────────────────
 */

export const CVAR_LICH_SU: FormulaModule = {
  spec: {
    id: 'cvar-lich-su',
    categoryId: 'risk',
    name: { vi: 'CVaR — tổn thất kỳ vọng phần đuôi', en: 'Conditional VaR (expected shortfall)' },
    description: {
      vi: 'Mức lỗ trung bình của riêng những phiên tệ hơn ngưỡng VaR — trả lời câu "nếu ngày xấu thật sự xảy ra thì mất bao nhiêu".',
      en: 'The average loss of just the sessions worse than the VaR threshold — answering "if the bad day actually happens, how much do I lose".',
    },
    latex: 'CVaR_{\\alpha} = -E\\left[r \\mid r \\le Q_{1-\\alpha}(r)\\right]',
    expression: {
      vi: 'CVaR = − Trung bình các lợi suất phiên không cao hơn ngưỡng VaR × 100',
      en: 'CVaR = − average of the session returns no higher than the VaR threshold × 100',
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['cvar', 'expected shortfall', 'ton that ky vong', 'duoi phan phoi', 'es'],
    resultUnit: '%',
    variables: [confidenceVar(), varLookback()],
    explanation: {
      meaning: {
        vi: 'Trung bình của phần đuôi trái: gom đúng những phiên lỗ nặng hơn ngưỡng VaR rồi lấy bình quân, nên nó đo độ sâu của kịch bản xấu chứ không chỉ đo mốc bắt đầu xấu.',
        en: 'The average of the left tail: it gathers exactly the sessions that lost more than the VaR threshold and averages them, so it measures how deep a bad scenario runs rather than just where "bad" starts.',
      },
      whenToUse: {
        vi: 'Khi so hai danh mục có VaR ngang nhau: cái nào đuôi dày hơn thì CVaR cao hơn, và đó mới là cái gây cháy tài khoản.',
        en: 'When comparing two portfolios with similar VaR: whichever has the fatter tail has the higher CVaR, and that is the one that actually blows up an account.',
      },
      howToRead: {
        vi: 'Cùng quy ước với VaR — số dương nghĩa là mất. CVaR luôn lớn hơn hoặc bằng VaR cùng độ tin cậy; khoảng cách giữa hai con số chính là độ dày của đuôi. VaR 1% mà CVaR 4,25% nghĩa là khi phiên xấu xảy ra thật thì mức lỗ điển hình gấp hơn bốn lần ngưỡng.',
        en: 'Same sign convention as VaR — a positive number means loss. CVaR is always greater than or equal to VaR at the same confidence level; the gap between the two is exactly how fat the tail is. A VaR of 1% with a CVaR of 4.25% means that when a bad session actually hits, the typical loss runs over four times the threshold.',
      },
      commonMistakes: {
        vi: 'Dừng lại ở VaR rồi quên phần đuôi. Sai lầm thứ hai là tính CVaR trên cửa sổ quá ngắn: ở mức 99% với 60 phiên, phần đuôi chỉ còn một quan sát nên con số phụ thuộc hoàn toàn vào đúng phiên đó.',
        en: 'Stopping at VaR and forgetting the tail beyond it. The second mistake is computing CVaR on too short a window: at 99% confidence with only 60 sessions, the tail contains just one observation, so the figure depends entirely on that single session.',
      },
    },
    example: {
      title: {
        vi: 'Độ tin cậy 95% trên chuỗi 61 phiên mẫu',
        en: '95% confidence on a 61-session sample series',
      },
      inputs: { confidence: 95, lookback: 250 },
      series: CHUOI_VAR_MAU,
      expected: 4.25,
      note: {
        vi: 'Bốn phiên tệ nhất là −10%, −5%, −1% và −1%; trung bình đúng 4,25%.',
        en: 'The four worst sessions are −10%, −5%, −1%, and −1%; their average is exactly 4.25%.',
      },
    },
    tests: [
      {
        name: 'độ tin cậy 95% cho tổn thất đuôi 4,25%',
        inputs: { confidence: 95, lookback: 250 },
        series: CHUOI_VAR_MAU,
        expected: 4.25,
      },
      {
        name: 'độ tin cậy 99% chỉ còn phiên tệ nhất, tổn thất 10%',
        inputs: { confidence: 99, lookback: 250 },
        series: CHUOI_VAR_MAU,
        expected: 10,
      },
      {
        name: 'chuỗi chỉ đi lên thì không có phiên nào tệ hơn ngưỡng để lấy trung bình',
        inputs: { confidence: 95, lookback: 250 },
        series: CHUOI_TANG_DEU_61,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chưa đủ 60 phiên thì không dựng được phân vị',
        inputs: { confidence: 95, lookback: 250 },
        series: CHUOI_THIEU_PHIEN_40,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_JORION, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const confidence = confidenceOf(v('confidence'));
    const tail = lossTailOf(ctx, v('lookback'), confidence);
    if ('code' in tail) return fail('%', tail);

    // Ngưỡng nội suy luôn nằm không thấp hơn lợi suất nhỏ nhất, nên nhóm này chắc chắn có ít
    // nhất một phần tử — `mean()` không rơi vào NaN. Vẫn để `ok()` làm lưới cuối.
    const worst = tail.returns.filter((r) => r <= tail.threshold);
    return ok(-mean(worst) * 100, '%', { extras: { tailCount: worst.length } });
  },
};

/** Bốn công thức sụt giảm & tổn thất của nhóm 'risk'. */
export const RISK_DRAWDOWN_FORMULAS: ReadonlyArray<FormulaModule> = [
  SUT_GIAM_SAU_NHAT,
  SUT_GIAM_HIEN_TAI,
  VAR_LICH_SU,
  CVAR_LICH_SU,
];
