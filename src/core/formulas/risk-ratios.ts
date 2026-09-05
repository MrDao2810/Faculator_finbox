/**
 * Tầng DOMAIN — nhóm rủi ro & danh mục, phần TỶ SỐ HIỆU QUẢ ĐIỀU CHỈNH RỦI RO (gói WBS 5.1.4).
 *
 * Sáu tỷ số trả lời cùng một câu hỏi theo sáu cách: một đơn vị rủi ro gánh chịu đổi lại được
 * bao nhiêu phần lợi suất. Khác nhau ở chỗ mỗi cái đo "rủi ro" bằng một thước riêng —
 * độ lệch chuẩn (Sharpe), phần giảm (Sortino), beta (Treynor), sai số theo dõi (thông tin),
 * mức sụt giảm sâu nhất (Calmar), hay cỡ lãi so với cỡ lỗ (thắng/thua).
 *
 * Cộng thêm Beta — không phải một tỷ số mà là chính thước đo Treynor đem chia, nhưng đặt cùng
 * file vì cùng ngưỡng 60 phiên tối thiểu và cùng nhóm 'risk'. Từng kẹt vì hồi quy cần HAI
 * chuỗi giá cùng lúc (cổ phiếu và VN-Index) mà bộ mẫu trước đây không có chỉ số nào — xem
 * docblock ngay trên `BETA` bên dưới.
 *
 * Cả sáu đọc chuỗi giá qua `requireCloses()` của `series-utils.ts`, tối thiểu 60 phiên: dưới
 * mức đó độ lệch chuẩn mẫu nhảy loạn theo vài phiên cá biệt và mọi tỷ số ở đây mất ý nghĩa
 * thống kê. Thiếu phiên thì `MISSING_SERIES`, tuyệt đối không tính bừa trên mẫu nhỏ (FR-06).
 *
 * Quy ước chung của cả file:
 *   · chuỗi giá xếp phiên CŨ trước, phiên MỚI CUỐI;
 *   · lãi suất phi rủi ro và lợi suất chuẩn nhập theo %/NĂM, quy về một phiên bằng LÃI KÉP —
 *     `(1 + r)^(1/m) − 1` chứ không chia thẳng cho số phiên, cùng nếp với công thức EAR;
 *   · tỷ số tính trên lợi suất phiên rồi nhân căn bậc hai của số phiên trong năm để quy năm.
 *
 * Con số trong `tests[]` được tính bằng script Node độc lập, viết lại định nghĩa gốc chứ không
 * gọi file này. Chuỗi giá kiểm thử dựng bằng quy tắc một dòng (xem ngay dưới) nên người rà soát
 * đọc là dựng lại được, thay vì phải tin 61 con số dán sẵn.
 */

import { fail, ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { Bilingual, CalcWarning } from '../types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import {
  maxDrawdown,
  mean,
  requireCloses,
  requireMarketCloses,
  sampleStdDev,
  simpleReturns,
} from './series-utils';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/*
 * ── Nguồn tham khảo ────────────────────────────────────────────────────────────────────
 */

const SOURCE_SHARPE: FormulaSource = {
  label: {
    vi: 'William F. Sharpe — "The Sharpe Ratio", The Journal of Portfolio Management, tập 21 số 1 (mùa thu 1994), trang 49–58',
    en: 'William F. Sharpe — "The Sharpe Ratio", The Journal of Portfolio Management, vol. 21 no. 1 (Fall 1994), pp. 49–58',
  },
};

const SOURCE_SORTINO: FormulaSource = {
  label: {
    vi: 'Frank A. Sortino & Lee N. Price — "Performance Measurement in a Downside Risk Framework", The Journal of Investing, tập 3 số 3 (mùa thu 1994), trang 59–64',
    en: 'Frank A. Sortino & Lee N. Price — "Performance Measurement in a Downside Risk Framework", The Journal of Investing, vol. 3 no. 3 (Fall 1994), pp. 59–64',
  },
};

const SOURCE_TREYNOR: FormulaSource = {
  label: {
    vi: 'Jack L. Treynor — "How to Rate Management of Investment Funds", Harvard Business Review, tập 43 số 1 (1965), trang 63–75',
    en: 'Jack L. Treynor — "How to Rate Management of Investment Funds", Harvard Business Review, vol. 43 no. 1 (1965), pp. 63–75',
  },
};

const SOURCE_SHARPE_CAPM: FormulaSource = {
  label: {
    vi: 'William F. Sharpe — "Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk", The Journal of Finance, tập 19 số 3 (1964), trang 425–442',
    en: 'William F. Sharpe — "Capital Asset Prices: A Theory of Market Equilibrium under Conditions of Risk", The Journal of Finance, vol. 19 no. 3 (1964), pp. 425–442',
  },
};

const SOURCE_GRINOLD_KAHN: FormulaSource = {
  label: {
    vi: 'Richard C. Grinold & Ronald N. Kahn — Active Portfolio Management, ấn bản 2 (McGraw-Hill, 1999), chương 5: Residual Risk and Return — The Information Ratio',
    en: 'Richard C. Grinold & Ronald N. Kahn — Active Portfolio Management, 2nd edition (McGraw-Hill, 1999), chapter 5: Residual Risk and Return — The Information Ratio',
  },
};

const SOURCE_CALMAR: FormulaSource = {
  label: {
    vi: 'Terry W. Young — "Calmar Ratio: A Smoother Tool", tạp chí Futures, tháng 10/1991',
    en: 'Terry W. Young — "Calmar Ratio: A Smoother Tool", Futures magazine, October 1991',
  },
};

const SOURCE_KAUFMAN: FormulaSource = {
  label: {
    vi: 'Perry J. Kaufman — Trading Systems and Methods, ấn bản 6 (Wiley, 2020), phần đo hiệu quả hệ thống giao dịch',
    en: 'Perry J. Kaufman — Trading Systems and Methods, 6th edition (Wiley, 2020), section on trading system performance measurement',
  },
};

/*
 * ── Nền chung ──────────────────────────────────────────────────────────────────────────
 */

/**
 * Số phiên giá tối thiểu cho mọi tỷ số trong file.
 *
 * 60 là mức quen dùng của giáo trình đầu tư cho một cửa sổ ước lượng ngắn (khoảng một quý
 * giao dịch). Ít hơn thì một phiên bất thường đủ sức lật ngược dấu của cả tỷ số.
 */
const MIN_SESSIONS = 60;

/** Câu mô tả dùng lại ở ô "Số phiên trong một năm" và ô ngưỡng của tỷ số thắng/thua. */
const SESSIONS_NOTE = `Cần ít nhất ${MIN_SESSIONS} phiên giá thì tỷ số mới có ý nghĩa thống kê.`;
/** Bản tiếng Anh của `SESSIONS_NOTE`, dùng cho các trường `en`. */
const SESSIONS_NOTE_EN = `At least ${MIN_SESSIONS} price sessions are needed for the ratio to be statistically meaningful.`;

/** Lãi suất phi rủi ro — biến nhập tay, không lấy từ biểu phí thị trường. */
const RISK_FREE_VAR = sliderVar(
  'riskFree',
  { vi: 'Lãi suất phi rủi ro / năm', en: 'Risk-free rate / year' },
  '%',
  4.5,
  0,
  15,
  0.1,
  {
    description: {
      vi: 'Mức sinh lời coi như chắc chắn, thường lấy lợi suất trái phiếu chính phủ kỳ hạn 1 năm.',
      en: 'The return treated as essentially certain, usually the yield on a 1-year government bond.',
    },
  },
);

/** Số phiên quy năm — 250 là số phiên giao dịch một năm của HOSE, tuần là 52, tháng là 12. */
const SESSIONS_VAR = sliderVar(
  'sessionsPerYear',
  { vi: 'Số phiên trong một năm', en: 'Sessions per year' },
  'phiên',
  250,
  12,
  365,
  1,
  {
    description: {
      vi: `Chuỗi theo ngày giao dịch thì để 250, theo tuần để 52, theo tháng để 12. ${SESSIONS_NOTE}`,
      en: `Use 250 for a daily-trading series, 52 for weekly, 12 for monthly. ${SESSIONS_NOTE_EN}`,
    },
  },
);

/** Đổi lãi suất %/năm về lợi suất MỘT PHIÊN theo lãi kép. */
function perSessionRate(annualPercent: number, sessionsPerYear: number): number {
  return Math.pow(1 + annualPercent / 100, 1 / sessionsPerYear) - 1;
}

/**
 * Số phiên trong một năm phải dương thì phép quy năm mới có nghĩa.
 * @returns cảnh báo nếu không dùng được, `null` nếu hợp lệ.
 */
function invalidSessionsPerYear(sessionsPerYear: number): CalcWarning | null {
  if (sessionsPerYear > 0) return null;
  return divideByZero(
    { vi: 'kết quả quy năm', en: 'the annualized result' },
    { vi: 'Số phiên trong một năm', en: 'sessions per year' },
    {
      vi: 'Nhập ít nhất 1 phiên mỗi năm — chuỗi theo ngày thường là 250.',
      en: 'Enter at least 1 session per year — a daily series is usually 250.',
    },
  );
}

/** Cảnh báo dùng chung khi chuỗi giá đứng yên nên độ lệch chuẩn bằng 0. */
function flatSeriesWarning(what: Bilingual): CalcWarning {
  return divideByZero(
    what,
    { vi: 'Độ lệch chuẩn lợi suất', en: 'standard deviation of returns' },
    {
      vi: 'Chuỗi giá đang đứng yên nên không có biến động để chia — nạp chuỗi giá có thay đổi giữa các phiên.',
      en: 'The price series is flat, so there is no volatility to divide by — load a price series that changes between sessions.',
    },
  );
}

/**
 * Độ lệch chuẩn PHẦN GIẢM (downside deviation) quanh một ngưỡng.
 *
 * Chia cho TỔNG số phiên chứ không chỉ số phiên dưới ngưỡng — đúng quy ước Sortino & Price
 * (1994): một danh mục hiếm khi thua lỗ phải được thưởng vì điều đó, chia cho số phiên lỗ thì
 * càng ít lỗ mẫu số càng dễ phình lên.
 */
function downsideDeviation(returns: ReadonlyArray<number>, target: number): number {
  if (returns.length === 0) return Number.NaN;
  const squared = returns.reduce((sum, r) => sum + Math.min(0, r - target) ** 2, 0);
  return Math.sqrt(squared / returns.length);
}

/*
 * ── Chuỗi giá dùng cho ca kiểm thử ─────────────────────────────────────────────────────
 *
 * Dựng bằng quy tắc chứ không dán số: mỗi chuỗi mô tả được bằng một câu, ai cũng dựng lại và
 * đối chiếu được. Tất cả đều 61 phiên giá — vừa đủ 60 lợi suất, tức đúng ngưỡng tối thiểu.
 */

/** Chu kỳ 6 phiên lặp lại của chuỗi zigzag: +3, −2, +2, −3, +4, −3 (ròng +1 mỗi chu kỳ). */
const CYCLE_STEPS: ReadonlyArray<number> = [3, -2, 2, -3, 4, -3];

/** Chuỗi zigzag: bắt đầu 100, lặp `CYCLE_STEPS`, sau 60 phiên lên 110. */
function cycleCloses(sessions: number, start = 100): number[] {
  const closes = [start];
  let price = start;
  for (let i = 0; i < sessions; i += 1) {
    price += CYCLE_STEPS[i % CYCLE_STEPS.length] ?? 0;
    closes.push(price);
  }
  return closes;
}

/** Chuỗi ghép từ các đoạn thẳng: mỗi đoạn là [số phiên, mức đổi giá mỗi phiên]. */
function rampCloses(start: number, segments: ReadonlyArray<readonly [number, number]>): number[] {
  const closes = [start];
  let price = start;
  for (const [sessions, step] of segments) {
    for (let i = 0; i < sessions; i += 1) {
      price += step;
      closes.push(price);
    }
  }
  return closes;
}

/** 61 phiên zigzag quanh xu hướng tăng nhẹ: 100 → 110, biến động khoảng 2,8% mỗi phiên. */
const ZIGZAG_CLOSES: ReadonlyArray<number> = cycleCloses(60);

/** 61 phiên hình chữ V: tăng đều 100 → 120, rơi đều về 90, rồi hồi 2 đơn vị mỗi phiên lên 110. */
const DIP_CLOSES: ReadonlyArray<number> = rampCloses(100, [
  [20, 1],
  [30, -1],
  [10, 2],
]);

/** 61 phiên đứng yên ở 100 — độ lệch chuẩn đúng bằng 0. */
const FLAT_CLOSES: ReadonlyArray<number> = Array.from({ length: 61 }, () => 100);

/** 61 phiên tăng đều mỗi phiên 1 đơn vị: 100 → 160, không phiên nào giảm. */
const RISING_CLOSES: ReadonlyArray<number> = Array.from({ length: 61 }, (_, i) => 100 + i);

/** 61 phiên giảm đều mỗi phiên 1 đơn vị: 160 → 100, không phiên nào tăng. */
const FALLING_CLOSES: ReadonlyArray<number> = Array.from({ length: 61 }, (_, i) => 160 - i);

/** 30 phiên zigzag — cố ý ngắn hơn ngưỡng 60 để kiểm ca thiếu dữ liệu chuỗi. */
const SHORT_CLOSES: ReadonlyArray<number> = cycleCloses(29);

/**
 * Chuỗi VN-Index dùng riêng cho ca kiểm Beta — cùng nhịp zigzag nhưng khởi đầu ở 1.000 điểm
 * cho giống thang đo của một chỉ số thật. Chỉ là hình thức: beta tính trên LỢI SUẤT chứ không
 * trên mức giá, nên khởi đầu ở 100 hay 1.000 không đổi kết quả.
 */
const MARKET_CLOSES: ReadonlyArray<number> = cycleCloses(60, 1_000);

/**
 * Dựng một chuỗi giá NGƯỢC từ lợi suất của `marketCloses` nhân hệ số `factor` — cho ra beta
 * ĐÚNG bằng `factor`, không phải xấp xỉ: về đại số, Cov(k·R_m, R_m) / Var(R_m) = k với MỌI
 * chuỗi R_m có phương sai khác 0, không phụ thuộc hình dạng của nó. Nhờ vậy ca kiểm không
 * phải tin một con số dán sẵn — ai đọc hàm này cũng suy ra được kết quả.
 */
function betaScaledCloses(
  marketCloses: ReadonlyArray<number>,
  factor: number,
  start = 100,
): number[] {
  const closes = [start];
  let price = start;
  for (const r of simpleReturns(marketCloses)) {
    price *= 1 + r * factor;
    closes.push(price);
  }
  return closes;
}

/** Cổ phiếu biến động đúng 1,5 lần VN-Index mỗi phiên — beta lý thuyết bằng 1,5. */
const STOCK_BETA_1_5: ReadonlyArray<number> = betaScaledCloses(MARKET_CLOSES, 1.5);

/** Cổ phiếu đi NGƯỢC thị trường, biên độ bằng nửa — beta lý thuyết bằng −0,5. */
const STOCK_BETA_NEG_0_5: ReadonlyArray<number> = betaScaledCloses(MARKET_CLOSES, -0.5);

/*
 * ── 0. Beta ────────────────────────────────────────────────────────────────────────────
 *
 * Không phải một TỶ SỐ như sáu công thức còn lại của file — Beta là chính THƯỚC ĐO rủi ro mà
 * tỷ số Treynor ở mục 3 đem chia cho lợi suất. Đặt trong file này vì cùng ngưỡng tối thiểu
 * 60 phiên và cùng nhóm 'risk', không phải vì cùng loại hình.
 *
 * Từng kẹt vì thiếu dữ liệu: hồi quy cần HAI chuỗi cùng lúc (cổ phiếu và VN-Index), mà
 * `src/data/samples.ts` trước đây chỉ có bốn mã, không mã nào là chỉ số. Gói này thêm
 * `ctx.marketSeries` (xem docblock ở `calc/types.ts`) và một chuỗi VN-Index bản thảo — xem
 * `DataProvider.vnIndex()`. Bộ mẫu bản thảo hiện tại là bốn chuỗi PRNG ĐỘC LẬP không có nhân
 * tố thị trường chung, nên beta tính từ chúng sẽ ra một số GẦN 0 — đúng về mặt toán học, chỉ
 * không minh hoạ được một cổ phiếu thật biến động ra sao. Đó là hạn chế đã biết của bộ số
 * liệu bản thảo, không phải lỗi của công thức; `spec.tests` dưới đây dùng chuỗi dựng riêng
 * để minh hoạ đúng ý nghĩa của beta > 1, beta < 1 và beta âm.
 */

export const BETA: FormulaModule = {
  spec: {
    id: 'beta',
    categoryId: 'risk',
    name: { vi: 'Beta — hệ số rủi ro hệ thống', en: 'Beta coefficient' },
    description: {
      vi: 'Mức một cổ phiếu biến động mạnh hay yếu hơn thị trường chung, đo bằng VN-Index.',
      en: 'How much more or less a stock swings than the broader market, measured against the VN-Index.',
    },
    latex: '\\beta_i = \\frac{\\text{Cov}(R_i, R_m)}{\\text{Var}(R_m)}',
    expression: {
      vi: 'Beta = Hiệp phương sai(lợi suất cổ phiếu, lợi suất VN-Index) ÷ Phương sai(lợi suất VN-Index)',
      en: 'Beta = Covariance(stock return, VN-Index return) ÷ Variance(VN-Index return)',
    },
    chartType: 'scatter',
    level: 'advanced',
    tags: ['beta', 'he so beta', 'rui ro he thong', 'capm', 'systematic risk', 'hoi quy'],
    resultUnit: 'lần',
    variables: [
      sliderVar(
        'sessions',
        { vi: 'Số phiên lấy để hồi quy', en: 'Sessions used for the regression' },
        'phiên',
        60,
        MIN_SESSIONS,
        500,
        1,
        {
          description: {
            vi: `Lấy bao nhiêu phiên gần nhất của CẢ HAI chuỗi giá — cổ phiếu và VN-Index — để hồi quy. ${SESSIONS_NOTE}`,
            en: `How many of the most recent sessions of BOTH price series — the stock and the VN-Index — to use for the regression. ${SESSIONS_NOTE_EN}`,
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Beta 1,5 nghĩa là VN-Index tăng hay giảm 1% thì cổ phiếu này thường tăng hay giảm khoảng 1,5% — hệ số góc của đường hồi quy lợi suất cổ phiếu theo lợi suất thị trường.',
        en: "A beta of 1.5 means that when the VN-Index rises or falls 1%, this stock typically rises or falls about 1.5% — the slope of the regression line of the stock's return against the market return.",
      },
      whenToUse: {
        vi: 'Khi ước lượng chi phí vốn chủ theo CAPM, xếp mức nhạy cảm của một cổ phiếu với thị trường chung, hoặc làm mẫu số cho tỷ số Treynor.',
        en: 'When estimating cost of equity under CAPM, ranking how sensitive a stock is to the broader market, or as the denominator of the Treynor ratio.',
      },
      howToRead: {
        vi: 'Beta trên 1 là biến động mạnh hơn thị trường, giữa 0 và 1 là yếu hơn. Beta âm — cổ phiếu đi NGƯỢC thị trường — hiếm nhưng có thật, thường gặp ở vàng hoặc một số ngành phòng thủ.',
        en: 'A beta above 1 means the stock swings more than the market, between 0 and 1 means it swings less. A negative beta — the stock moves OPPOSITE the market — is rare but real, often seen in gold or some defensive sectors.',
      },
      commonMistakes: {
        vi: 'Lấy beta của vài chục phiên gần nhất rồi coi là con số cố định lâu dài — beta đổi theo thời gian, nhất là sau các sự kiện lớn của doanh nghiệp như tăng vốn hay đổi ngành nghề kinh doanh chính.',
        en: 'Computing beta from a few dozen recent sessions and treating it as a fixed, permanent number — beta drifts over time, especially after major corporate events such as a capital raise or a change in core business.',
      },
    },
    example: {
      title: {
        vi: 'Cổ phiếu biến động gấp rưỡi VN-Index trong 61 phiên mẫu',
        en: 'A stock swinging 1.5 times the VN-Index over a 61-session sample',
      },
      inputs: { sessions: 60 },
      series: STOCK_BETA_1_5,
      marketSeries: MARKET_CLOSES,
      expected: 1.5,
      note: {
        vi: 'VN-Index tăng 1% thì cổ phiếu này thường tăng khoảng 1,5% — biến động mạnh hơn thị trường.',
        en: 'When the VN-Index rises 1%, this stock typically rises about 1.5% — more volatile than the market.',
      },
    },
    tests: [
      {
        name: 'cổ phiếu biến động gấp rưỡi thị trường — beta 1,5',
        inputs: { sessions: 60 },
        series: STOCK_BETA_1_5,
        marketSeries: MARKET_CLOSES,
        expected: 1.5,
      },
      {
        name: 'cổ phiếu đúng bằng thị trường — beta 1',
        inputs: { sessions: 60 },
        series: MARKET_CLOSES,
        marketSeries: MARKET_CLOSES,
        expected: 1,
      },
      {
        name: 'cổ phiếu đi ngược thị trường, biên độ nửa — beta −0,5',
        inputs: { sessions: 60 },
        series: STOCK_BETA_NEG_0_5,
        marketSeries: MARKET_CLOSES,
        expected: -0.5,
      },
      {
        name: 'VN-Index đứng yên thì phương sai bằng 0, không chia được',
        inputs: { sessions: 60 },
        series: STOCK_BETA_1_5,
        marketSeries: FLAT_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'cổ phiếu mới 30 phiên thì chưa đủ dữ liệu để hồi quy',
        inputs: { sessions: 60 },
        series: SHORT_CLOSES,
        marketSeries: MARKET_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
      {
        name: 'chưa nạp chuỗi VN-Index thì chưa hồi quy được, dù cổ phiếu đủ phiên',
        inputs: { sessions: 60 },
        series: STOCK_BETA_1_5,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_SHARPE_CAPM, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';
    const sessions = Math.max(MIN_SESSIONS, Math.round(v('sessions')));

    const stockCloses = requireCloses(ctx, sessions);
    if (!Array.isArray(stockCloses)) return fail(unit, stockCloses);

    const marketCloses = requireMarketCloses(ctx, sessions);
    if (!Array.isArray(marketCloses)) return fail(unit, marketCloses);

    const stockReturns = simpleReturns(stockCloses.slice(-sessions));
    const marketReturns = simpleReturns(marketCloses.slice(-sessions));

    const avgStock = mean(stockReturns);
    const avgMarket = mean(marketReturns);

    let covariance = 0;
    let varianceMarket = 0;
    for (let i = 0; i < marketReturns.length; i += 1) {
      const dm = (marketReturns[i] ?? 0) - avgMarket;
      const di = (stockReturns[i] ?? 0) - avgStock;
      covariance += dm * di;
      varianceMarket += dm * dm;
    }

    if (varianceMarket === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'Beta', en: 'Beta' },
          { vi: 'Phương sai lợi suất VN-Index', en: 'variance of VN-Index returns' },
          {
            vi: 'VN-Index đứng yên suốt cửa sổ này nên không có biến động để so — chọn cửa sổ dài hơn.',
            en: 'The VN-Index was flat over this window, so there is no volatility to compare against — choose a longer window.',
          },
        ),
      );
    }

    return ok(covariance / varianceMarket, unit);
  },
};

/*
 * ── 1. Tỷ số Sharpe ────────────────────────────────────────────────────────────────────
 */

export const TY_SO_SHARPE: FormulaModule = {
  spec: {
    id: 'ty-so-sharpe',
    categoryId: 'risk',
    name: { vi: 'Tỷ số Sharpe', en: 'Sharpe ratio' },
    description: {
      vi: 'Mỗi đơn vị biến động phải chịu đổi lại được bao nhiêu phần lợi suất vượt trên lãi suất phi rủi ro.',
      en: 'How much excess return over the risk-free rate is earned for each unit of volatility endured.',
    },
    latex: 'S = \\frac{\\bar{r}_p - r_f}{\\sigma_p} \\times \\sqrt{m}',
    expression: {
      vi: 'Tỷ số Sharpe = (Lợi suất bình quân một phiên − Lãi suất phi rủi ro một phiên) ÷ Độ lệch chuẩn lợi suất phiên × căn bậc hai của Số phiên trong một năm',
      en: 'Sharpe ratio = (Average per-session return − Per-session risk-free rate) ÷ Standard deviation of per-session returns × square root of Sessions per year',
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['sharpe', 'ty so sharpe', 'rui ro dieu chinh', 'risk adjusted', 'do bien dong'],
    resultUnit: 'lần',
    variables: [RISK_FREE_VAR, SESSIONS_VAR],
    explanation: {
      meaning: {
        vi: 'Lãi nhiều mà đường giá gập ghềnh thì chưa chắc hơn lãi ít mà êm. Sharpe đặt phần lãi vượt trên lãi suất phi rủi ro lên bàn cân với độ lệch chuẩn của lợi suất từng phiên.',
        en: 'A high return on a bumpy price line is not necessarily better than a lower, smoother one. Sharpe weighs the return earned above the risk-free rate against the standard deviation of session-by-session returns.',
      },
      whenToUse: {
        vi: 'Khi so hai danh mục hay hai quỹ có mức lãi khác nhau và mức biến động cũng khác nhau, trên cùng một khoảng thời gian.',
        en: 'When comparing two portfolios or funds with different returns and different volatility over the same period.',
      },
      howToRead: {
        vi: 'Dưới 1 là bình thường, quanh 1 là khá, trên 2 là rất tốt nhưng phải nghi ngờ mẫu quá ngắn. Số âm nghĩa là danh mục còn thua gửi tiết kiệm mà vẫn phải chịu biến động.',
        en: 'Below 1 is ordinary, around 1 is decent, above 2 is very good but should raise suspicion of too short a sample. A negative value means the portfolio underperformed a savings deposit while still bearing volatility.',
      },
      commonMistakes: {
        vi: 'So Sharpe của hai kỳ dài ngắn khác nhau, hoặc quên rằng độ lệch chuẩn phạt cả những phiên TĂNG mạnh — danh mục lãi đột biến vài phiên có thể bị Sharpe chấm điểm thấp oan.',
        en: 'Comparing Sharpe ratios computed over periods of different lengths, or forgetting that standard deviation penalizes strongly RISING sessions too — a portfolio with a few outsized gains can be unfairly marked down by Sharpe.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi 61 phiên mẫu, lãi suất phi rủi ro 4,5%/năm',
        en: 'A 61-session sample series, risk-free rate 4.5%/year',
      },
      inputs: { riskFree: 4.5, sessionsPerYear: 250 },
      series: ZIGZAG_CLOSES,
      expected: 1.02,
      note: {
        vi: 'Chuỗi lên 10% sau 60 phiên nhưng dao động khá mạnh, nên Sharpe chỉ quanh mức 1 lần.',
        en: 'The series rose 10% over 60 sessions but swung quite a bit, so Sharpe lands only around 1.',
      },
    },
    tests: [
      {
        name: 'chuỗi zigzag 60 phiên, phi rủi ro 4,5%/năm ra 1,0217 lần',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 1.0217,
      },
      {
        name: 'bỏ lãi suất phi rủi ro thì tỷ số cao hơn',
        inputs: { riskFree: 0, sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 1.1222,
      },
      {
        name: 'coi chuỗi là dữ liệu tuần (52 kỳ/năm) thì quy năm nhẹ hơn hẳn',
        inputs: { riskFree: 4.5, sessionsPerYear: 52 },
        series: ZIGZAG_CLOSES,
        expected: 0.2913,
      },
      {
        name: 'chuỗi giá đứng yên thì độ lệch chuẩn bằng 0',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: FLAT_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'mới 30 phiên thì chưa đủ dữ liệu chuỗi',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: SHORT_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
      {
        name: 'số phiên trong năm bằng 0 thì không quy năm được',
        inputs: { riskFree: 4.5, sessionsPerYear: 0 },
        series: ZIGZAG_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_SHARPE, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';

    const closes = requireCloses(ctx, MIN_SESSIONS);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const sessions = v('sessionsPerYear');
    const badSessions = invalidSessionsPerYear(sessions);
    if (badSessions !== null) return fail(unit, badSessions);

    const returns = simpleReturns(closes);
    const deviation = sampleStdDev(returns);
    if (deviation === 0)
      return fail(unit, flatSeriesWarning({ vi: 'tỷ số Sharpe', en: 'the Sharpe ratio' }));

    const excess = mean(returns) - perSessionRate(v('riskFree'), sessions);
    return ok((excess / deviation) * Math.sqrt(sessions), unit, {
      extras: {
        meanReturn: mean(returns) * 100,
        volatility: deviation * Math.sqrt(sessions) * 100,
      },
    });
  },
};

/*
 * ── 2. Tỷ số Sortino ───────────────────────────────────────────────────────────────────
 */

export const TY_SO_SORTINO: FormulaModule = {
  spec: {
    id: 'ty-so-sortino',
    categoryId: 'risk',
    name: { vi: 'Tỷ số Sortino', en: 'Sortino ratio' },
    description: {
      vi: 'Như Sharpe nhưng mẫu số chỉ đếm phần biến động ĐI XUỐNG — phần rủi ro mà nhà đầu tư thật sự sợ.',
      en: 'Like Sharpe, but the denominator counts only DOWNSIDE volatility — the kind of risk investors actually fear.',
    },
    latex:
      'Sortino = \\frac{\\bar{r}_p - r_f}{\\sigma_d} \\times \\sqrt{m}, \\quad \\sigma_d = \\sqrt{\\frac{1}{n} \\sum_{t=1}^{n} \\min(0, r_t - r_f)^2}',
    expression: {
      vi: 'Tỷ số Sortino = (Lợi suất bình quân một phiên − Ngưỡng phi rủi ro một phiên) ÷ Độ lệch chuẩn phần giảm × căn bậc hai của Số phiên trong một năm',
      en: 'Sortino ratio = (Average per-session return − Per-session risk-free threshold) ÷ Downside deviation × square root of Sessions per year',
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['sortino', 'ty so sortino', 'downside risk', 'rui ro giam gia', 'do lech phan giam'],
    resultUnit: 'lần',
    variables: [RISK_FREE_VAR, SESSIONS_VAR],
    explanation: {
      meaning: {
        vi: 'Sharpe phạt cả những phiên tăng vọt vì chúng cũng làm độ lệch chuẩn phình ra. Sortino chỉ đo phần lợi suất rơi dưới ngưỡng chấp nhận được, nên đúng với cảm nhận rủi ro của người bỏ tiền.',
        en: 'Sharpe penalizes even sharply rising sessions, since they also inflate the standard deviation. Sortino measures only the return that falls below an acceptable threshold, matching how investors actually perceive risk.',
      },
      whenToUse: {
        vi: 'Khi danh mục có vài phiên lãi đột biến, hoặc khi so các chiến lược mà mức lỗ mới là thứ đáng quan tâm — quỹ mở, chiến lược quyền chọn, danh mục hưu trí.',
        en: 'When a portfolio has a handful of outsized gaining sessions, or when comparing strategies where losses are what matters — open-end funds, options strategies, retirement portfolios.',
      },
      howToRead: {
        vi: 'Luôn cao hơn Sharpe của cùng chuỗi nếu các phiên tăng mạnh hơn các phiên giảm. Đọc theo cùng thang với Sharpe: quanh 1 là khá, trên 2 là tốt.',
        en: 'Always higher than the Sharpe ratio for the same series if gaining sessions are larger than losing ones. Read on the same scale as Sharpe: around 1 is decent, above 2 is good.',
      },
      commonMistakes: {
        vi: 'So thẳng Sortino với Sharpe rồi kết luận danh mục "tốt hơn" — hai thước đo có mẫu số khác nhau. Ngoài ra mẫu số chia cho TỔNG số phiên, nên chuỗi hầu như không có phiên giảm sẽ cho ra con số rất lớn, cần cảnh giác.',
        en: 'Comparing Sortino directly against Sharpe and concluding the portfolio is "better" — the two measures use different denominators. Also, the denominator divides by the TOTAL number of sessions, so a series with almost no losing sessions produces a suspiciously huge number.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi 61 phiên mẫu, ngưỡng là lãi suất phi rủi ro 4,5%/năm',
        en: 'A 61-session sample series, threshold set to the 4.5%/year risk-free rate',
      },
      inputs: { riskFree: 4.5, sessionsPerYear: 250 },
      series: ZIGZAG_CLOSES,
      expected: 1.58,
      note: {
        vi: 'Cao hơn Sharpe 1,02 của cùng chuỗi vì các phiên tăng mạnh hơn các phiên giảm.',
        en: "Higher than the same series' Sharpe ratio of 1.02, because gaining sessions outweigh losing ones.",
      },
    },
    tests: [
      {
        name: 'chuỗi zigzag 60 phiên ra 1,5819 lần, cao hơn Sharpe cùng chuỗi',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 1.5819,
      },
      {
        name: 'chuỗi hình chữ V ra 3,4014 lần',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: DIP_CLOSES,
        expected: 3.4014,
      },
      {
        name: 'chuỗi đứng yên thì mọi phiên đều dưới ngưỡng, tỷ số âm',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: FLAT_CLOSES,
        expected: -15.8114,
      },
      {
        name: 'chuỗi tăng đều không có phiên nào dưới ngưỡng nên mẫu số bằng 0',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: RISING_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'mới 30 phiên thì chưa đủ dữ liệu chuỗi',
        inputs: { riskFree: 4.5, sessionsPerYear: 250 },
        series: SHORT_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_SORTINO, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';

    const closes = requireCloses(ctx, MIN_SESSIONS);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const sessions = v('sessionsPerYear');
    const badSessions = invalidSessionsPerYear(sessions);
    if (badSessions !== null) return fail(unit, badSessions);

    const returns = simpleReturns(closes);
    const target = perSessionRate(v('riskFree'), sessions);
    const deviation = downsideDeviation(returns, target);

    if (deviation === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'tỷ số Sortino', en: 'the Sortino ratio' },
          { vi: 'Độ lệch chuẩn phần giảm', en: 'downside deviation' },
          {
            vi: 'Chuỗi này không có phiên nào rơi dưới ngưỡng phi rủi ro nên không có rủi ro giảm giá để chia — dùng tỷ số Sharpe hoặc kéo dài chuỗi giá.',
            en: 'This series has no session falling below the risk-free threshold, so there is no downside risk to divide by — use the Sharpe ratio instead, or extend the price series.',
          },
        ),
      );
    }

    return ok(((mean(returns) - target) / deviation) * Math.sqrt(sessions), unit, {
      extras: {
        meanReturn: mean(returns) * 100,
        downsideDeviation: deviation * Math.sqrt(sessions) * 100,
      },
    });
  },
};

/*
 * ── 3. Tỷ số Treynor ───────────────────────────────────────────────────────────────────
 */

export const TY_SO_TREYNOR: FormulaModule = {
  spec: {
    id: 'ty-so-treynor',
    categoryId: 'risk',
    name: { vi: 'Tỷ số Treynor', en: 'Treynor ratio' },
    description: {
      vi: 'Phần lợi suất vượt lãi suất phi rủi ro tính trên mỗi đơn vị beta — rủi ro không thể phân tán bằng cách đa dạng hoá.',
      en: 'The excess return over the risk-free rate earned per unit of beta — the risk that diversification cannot remove.',
    },
    latex: 'T = \\frac{(\\bar{r}_p - r_f) \\times m}{\\beta_p}',
    expression: {
      vi: 'Tỷ số Treynor = (Lợi suất bình quân một phiên − Lãi suất phi rủi ro một phiên) × Số phiên trong một năm ÷ Hệ số beta',
      en: 'Treynor ratio = (Average per-session return − Per-session risk-free rate) × Sessions per year ÷ Beta coefficient',
    },
    chartType: 'scatter',
    level: 'advanced',
    tags: ['treynor', 'ty so treynor', 'beta', 'rui ro he thong', 'risk adjusted'],
    resultUnit: '%/năm',
    variables: [
      RISK_FREE_VAR,
      SESSIONS_VAR,
      numberVar(
        'beta',
        { vi: 'Hệ số beta của danh mục', en: 'Portfolio beta coefficient' },
        'lần',
        1.2,
        {
          min: -5,
          max: 5,
          // Trước gói này câu mô tả cố ý KHÔNG nhắc "công thức Beta" vì thư viện chưa có — nay
          // đã đăng ký (`BETA` phía trên), nên nêu lại làm một nguồn thật.
          description: {
            vi: 'Nhập tay: tính bằng công thức Beta của thư viện này (dán chuỗi giá cổ phiếu), lấy từ bảng dữ liệu công ty chứng khoán, báo cáo quỹ, hoặc trang thống kê của sở giao dịch. Beta 1 nghĩa là biến động ngang thị trường.',
            en: "Enter manually: compute it with this library's Beta formula (paste the stock price series), or take it from a brokerage data table, a fund report, or an exchange statistics page. A beta of 1 means volatility in line with the market.",
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Sharpe chia cho TOÀN BỘ biến động, Treynor chỉ chia cho phần biến động đi cùng thị trường. Ai đã nắm một danh mục đa dạng thì phần riêng lẻ coi như đã triệt tiêu, chỉ còn beta là đáng tính tiền.',
        en: 'Sharpe divides by TOTAL volatility, Treynor divides only by the volatility that moves with the market. Anyone holding a diversified portfolio has already eliminated the idiosyncratic part, so only beta is worth pricing.',
      },
      whenToUse: {
        vi: 'Khi đánh giá một quỹ hay một danh mục con NẰM TRONG một danh mục lớn đã đa dạng hoá, hoặc khi xếp hạng nhiều quỹ cùng đo theo VN-Index.',
        en: 'When evaluating a fund or a sub-portfolio that sits INSIDE a larger, already diversified portfolio, or when ranking several funds measured against the same VN-Index.',
      },
      howToRead: {
        vi: 'Đọc như một mức lãi vượt chuẩn quy năm cho mỗi 1 đơn vị beta. Con số càng cao càng tốt; so sánh chỉ có nghĩa giữa các danh mục cùng đo theo một chỉ số tham chiếu.',
        en: 'Read it as an annualized excess return per 1 unit of beta. The higher the better; comparisons are only meaningful between portfolios measured against the same benchmark index.',
      },
      commonMistakes: {
        vi: 'Dùng Treynor cho một danh mục chỉ có vài mã: khi chưa đa dạng hoá thì rủi ro riêng lẻ còn rất lớn mà beta không hề đo tới, nên tỷ số vẽ ra bức tranh quá đẹp.',
        en: 'Using Treynor for a portfolio holding only a handful of stocks: without diversification, idiosyncratic risk is still large and beta does not capture it at all, so the ratio paints too flattering a picture.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi 61 phiên mẫu, beta 1,2 và lãi suất phi rủi ro 4,5%/năm',
        en: 'A 61-session sample series, beta 1.2 and risk-free rate 4.5%/year',
      },
      inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: 1.2 },
      series: ZIGZAG_CLOSES,
      expected: 37.28,
      note: {
        vi: 'Lợi suất vượt chuẩn quy năm khoảng 44,7%; chia cho beta 1,2 còn 37,3% cho mỗi đơn vị beta.',
        en: 'Annualized excess return is about 44.7%; divided by beta 1.2, that is 37.3% per unit of beta.',
      },
    },
    tests: [
      {
        name: 'beta 1,2 ra 37,2819%/năm cho mỗi đơn vị beta',
        inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: 1.2 },
        series: ZIGZAG_CLOSES,
        expected: 37.2819,
      },
      {
        name: 'beta bằng 1 thì tỷ số đúng bằng lợi suất vượt chuẩn quy năm',
        inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: 1 },
        series: ZIGZAG_CLOSES,
        expected: 44.7383,
      },
      {
        name: 'beta bằng 0 thì không có rủi ro hệ thống để chia',
        inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: 0 },
        series: ZIGZAG_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'beta âm làm tỷ số không còn diễn giải được',
        inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: -0.5 },
        series: ZIGZAG_CLOSES,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'mới 30 phiên thì chưa đủ dữ liệu chuỗi',
        inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: 1.2 },
        series: SHORT_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_TREYNOR, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = '%/năm';

    const closes = requireCloses(ctx, MIN_SESSIONS);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const sessions = v('sessionsPerYear');
    const badSessions = invalidSessionsPerYear(sessions);
    if (badSessions !== null) return fail(unit, badSessions);

    const beta = v('beta');
    if (beta === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'tỷ số Treynor', en: 'the Treynor ratio' },
          { vi: 'Hệ số beta', en: 'beta coefficient' },
          {
            vi: 'Beta bằng 0 nghĩa là danh mục không hề đi theo thị trường — dùng tỷ số Sharpe thay thế.',
            en: 'A beta of 0 means the portfolio does not move with the market at all — use the Sharpe ratio instead.',
          },
        ),
      );
    }
    if (beta < 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Beta âm làm tỷ số Treynor đảo dấu: danh mục lãi vẫn cho ra con số âm, và danh mục lỗ lại cho ra con số dương.',
            en: 'A negative beta flips the sign of the Treynor ratio: a gaining portfolio still produces a negative number, and a losing portfolio produces a positive one.',
          },
          {
            vi: 'Nhập beta dương, hoặc dùng tỷ số Sharpe cho danh mục đi ngược thị trường.',
            en: 'Enter a positive beta, or use the Sharpe ratio for a portfolio that moves opposite the market.',
          },
        ),
      );
    }

    const returns = simpleReturns(closes);
    const excess = mean(returns) - perSessionRate(v('riskFree'), sessions);
    return ok(((excess * sessions) / beta) * 100, unit, {
      extras: { excessReturn: excess * sessions * 100 },
    });
  },
};

/*
 * ── 4. Tỷ số thông tin ─────────────────────────────────────────────────────────────────
 */

export const TY_SO_THONG_TIN: FormulaModule = {
  spec: {
    id: 'ty-so-thong-tin',
    categoryId: 'risk',
    name: { vi: 'Tỷ số thông tin', en: 'Information ratio' },
    description: {
      vi: 'Phần lợi suất thắng được chuẩn so sánh, tính trên mỗi đơn vị rủi ro phải chấp nhận để đi lệch khỏi chuẩn.',
      en: 'The return earned above a benchmark, per unit of risk taken on by deviating from that benchmark.',
    },
    latex: 'IR = \\frac{\\bar{r}_p - \\bar{r}_b}{\\sigma_{p-b}} \\times \\sqrt{m}',
    expression: {
      vi: 'Tỷ số thông tin = (Lợi suất bình quân một phiên − Lợi suất chuẩn một phiên) ÷ Độ lệch chuẩn phần chênh lệch × căn bậc hai của Số phiên trong một năm',
      en: 'Information ratio = (Average per-session return − Per-session benchmark return) ÷ Standard deviation of the difference × square root of Sessions per year',
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['information ratio', 'ty so thong tin', 'vuot chuan', 'benchmark', 'sai so theo doi'],
    resultUnit: 'lần',
    variables: [
      numberVar(
        'benchmarkReturn',
        { vi: 'Lợi suất chuẩn so sánh / năm', en: 'Benchmark return / year' },
        '%',
        12,
        {
          min: -100,
          max: 200,
          description: {
            vi: 'Mức tăng cả năm của chuẩn dùng để so, ví dụ VN-Index. Nhập một con số duy nhất chứ không phải cả chuỗi.',
            en: 'The full-year gain of the benchmark used for comparison, such as the VN-Index. Enter a single number, not a whole series.',
          },
        },
      ),
      SESSIONS_VAR,
    ],
    explanation: {
      meaning: {
        vi: 'Thắng chuẩn 5 điểm phần trăm bằng cách bám sát chuẩn khác hẳn thắng 5 điểm bằng cách đánh cược lệch hẳn khỏi chuẩn. Tỷ số thông tin chia phần thắng đó cho mức độ đi lệch.',
        en: 'Beating the benchmark by 5 percentage points while tracking it closely is very different from beating it by 5 points through a bold bet away from it. The information ratio divides that outperformance by the degree of deviation.',
      },
      whenToUse: {
        vi: 'Khi chấm điểm một quỹ chủ động hay chính danh mục của mình so với VN-Index, và muốn biết phần thắng có xứng với rủi ro đi lệch hay không.',
        en: 'When scoring an actively managed fund or your own portfolio against the VN-Index, and wanting to know whether the outperformance is worth the risk taken by deviating.',
      },
      howToRead: {
        vi: 'Từ 0,5 trở lên đã là quản lý chủ động tốt theo thang của Grinold & Kahn; trên 1 là hiếm. Số âm nghĩa là đi lệch khỏi chuẩn mà vẫn thua chuẩn.',
        en: 'From 0.5 upward already counts as good active management on the Grinold & Kahn scale; above 1 is rare. A negative value means deviating from the benchmark while still underperforming it.',
      },
      commonMistakes: {
        vi: 'Đọc tỷ số thông tin như Sharpe. Sharpe so với lãi suất phi rủi ro, tỷ số thông tin so với chuẩn thị trường — một danh mục có thể tốt theo thước này và tệ theo thước kia.',
        en: 'Reading the information ratio the same way as Sharpe. Sharpe compares against the risk-free rate, the information ratio against a market benchmark — a portfolio can look good by one measure and poor by the other.',
      },
    },
    note: {
      vi: 'Bản rút gọn: chuẩn so sánh nhập bằng MỘT con số %/năm thay vì cả chuỗi, nên sai số theo dõi ở mẫu số chính là độ lệch chuẩn lợi suất của danh mục. Muốn sai số theo dõi đúng nghĩa thì cần chuỗi giá của chuẩn để trừ theo từng phiên — phần đó chờ gói nhập hai chuỗi.',
      en: "Simplified version: the benchmark is entered as a SINGLE %/year figure rather than a full series, so the tracking error in the denominator is simply the standard deviation of the portfolio's own returns. A true tracking error needs the benchmark's own price series to subtract session by session — that awaits the two-series input package.",
    },
    example: {
      title: {
        vi: 'Chuỗi 61 phiên mẫu so với chuẩn tăng 12%/năm',
        en: 'A 61-session sample series against a benchmark rising 12%/year',
      },
      inputs: { benchmarkReturn: 12, sessionsPerYear: 250 },
      series: ZIGZAG_CLOSES,
      expected: 0.86,
      note: {
        vi: 'Danh mục thắng chuẩn nhưng phải chịu biến động khá lớn, nên tỷ số dừng dưới mức 1.',
        en: 'The portfolio beat the benchmark but had to bear fairly large volatility, so the ratio stays below 1.',
      },
    },
    tests: [
      {
        name: 'chuẩn 12%/năm cho tỷ số 0,8634 lần',
        inputs: { benchmarkReturn: 12, sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 0.8634,
      },
      {
        name: 'chuẩn 0%/năm thì tỷ số trùng Sharpe khi bỏ lãi suất phi rủi ro',
        inputs: { benchmarkReturn: 0, sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 1.1222,
      },
      {
        name: 'chuẩn tăng 60%/năm thì phần thắng gần như biến mất',
        inputs: { benchmarkReturn: 60, sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 0.0479,
      },
      {
        name: 'chuỗi giá đứng yên thì mẫu số bằng 0',
        inputs: { benchmarkReturn: 12, sessionsPerYear: 250 },
        series: FLAT_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'mới 30 phiên thì chưa đủ dữ liệu chuỗi',
        inputs: { benchmarkReturn: 12, sessionsPerYear: 250 },
        series: SHORT_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_GRINOLD_KAHN, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';

    const closes = requireCloses(ctx, MIN_SESSIONS);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const sessions = v('sessionsPerYear');
    const badSessions = invalidSessionsPerYear(sessions);
    if (badSessions !== null) return fail(unit, badSessions);

    const returns = simpleReturns(closes);
    // Chuẩn là một con số vô hướng nên trừ đi cùng một lượng ở mọi phiên: độ lệch chuẩn của
    // phần chênh lệch bằng đúng độ lệch chuẩn lợi suất danh mục (xem `note` của spec).
    const deviation = sampleStdDev(returns);
    if (deviation === 0)
      return fail(unit, flatSeriesWarning({ vi: 'tỷ số thông tin', en: 'the information ratio' }));

    const active = mean(returns) - perSessionRate(v('benchmarkReturn'), sessions);
    return ok((active / deviation) * Math.sqrt(sessions), unit, {
      extras: {
        activeReturn: active * sessions * 100,
        trackingError: deviation * Math.sqrt(sessions) * 100,
      },
    });
  },
};

/*
 * ── 5. Tỷ số Calmar ────────────────────────────────────────────────────────────────────
 */

export const TY_SO_CALMAR: FormulaModule = {
  spec: {
    id: 'ty-so-calmar',
    categoryId: 'risk',
    name: { vi: 'Tỷ số Calmar', en: 'Calmar ratio' },
    description: {
      vi: 'Lợi suất năm hoá chia cho mức sụt giảm sâu nhất — đo phần lãi đổi lại bằng cú đau lớn nhất đã phải chịu.',
      en: 'Annualized return divided by the maximum drawdown — the return earned in exchange for the biggest pain endured.',
    },
    latex: 'Calmar = \\frac{r_{nam}}{MDD}',
    expression: {
      vi: 'Tỷ số Calmar = Lợi suất năm hoá ÷ Mức sụt giảm sâu nhất từ đỉnh',
      en: 'Calmar ratio = Annualized return ÷ Maximum drawdown from peak',
    },
    chartType: 'underwater',
    level: 'advanced',
    tags: ['calmar', 'ty so calmar', 'max drawdown', 'sut giam sau nhat', 'mdd'],
    resultUnit: 'lần',
    variables: [SESSIONS_VAR],
    explanation: {
      meaning: {
        vi: 'Độ lệch chuẩn đo mức gập ghềnh trung bình, còn mức sụt giảm sâu nhất đo đúng cái làm người ta bán tháo. Calmar hỏi: mỗi 1% sụt giảm sâu nhất đã phải chịu đổi lại được bao nhiêu phần lợi suất năm.',
        en: 'Standard deviation measures average bumpiness, while maximum drawdown captures exactly what triggers panic selling. Calmar asks: for each 1% of maximum drawdown endured, how much annual return was earned in return.',
      },
      whenToUse: {
        vi: 'Khi đánh giá một chiến lược hay một quỹ mà điều kiện chịu đựng của người bỏ tiền là có hạn — thường dùng cho quỹ phòng hộ và hệ thống giao dịch.',
        en: "When evaluating a strategy or fund where the investor's tolerance for pain is limited — commonly used for hedge funds and trading systems.",
      },
      howToRead: {
        vi: 'Trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất. Nguyên bản Calmar tính trên 36 tháng; cửa sổ chỉ 60 phiên thì phép quy năm phóng đại tử số nên con số dễ đẹp quá mức.',
        en: 'Above 1 means the annual gain already exceeds the deepest drawdown. The original Calmar is computed over 36 months; with a window of only 60 sessions, annualizing inflates the numerator, so the figure can look deceptively good.',
      },
      commonMistakes: {
        vi: 'Chạy Calmar trên một chuỗi ngắn, ít nhịp điều chỉnh: mức sụt giảm sâu nhất nhỏ làm tỷ số bị thổi phồng lên hàng chục lần dù lợi suất năm hoá chẳng có gì đặc biệt. Chuỗi tăng đều tuyệt đối, chưa từng sụt giảm, thì mẫu số đúng bằng 0 và công thức báo lỗi rõ ràng — không âm thầm trả về một con số sai.',
        en: 'Running Calmar on a short series with few corrections: a small maximum drawdown inflates the ratio by tens of times even though the annualized return is nothing special. A series that rises perfectly steadily, never drawing down, makes the denominator exactly zero, and the formula reports an error clearly rather than silently returning a wrong number.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi 61 phiên hình chữ V: lên 120, rơi về 90, hồi lên 110',
        en: 'A V-shaped 61-session series: rising to 120, falling to 90, recovering to 110',
      },
      inputs: { sessionsPerYear: 250 },
      series: DIP_CLOSES,
      expected: 1.95,
      note: {
        vi: 'Sụt giảm sâu nhất 25% từ đỉnh 120 xuống đáy 90; lợi suất năm hoá 48,8% chia cho 25% được 1,95 lần.',
        en: 'Maximum drawdown of 25% from the peak of 120 to the trough of 90; an annualized return of 48.8% divided by 25% gives 1.95.',
      },
    },
    tests: [
      {
        name: 'chuỗi hình chữ V ra 1,9502 lần',
        inputs: { sessionsPerYear: 250 },
        series: DIP_CLOSES,
        expected: 1.9502,
      },
      {
        name: 'chuỗi zigzag ít sụt giảm cho con số phóng đại 16,74 lần',
        inputs: { sessionsPerYear: 250 },
        series: ZIGZAG_CLOSES,
        expected: 16.739,
      },
      {
        name: 'chuỗi giảm đều cho tỷ số âm',
        inputs: { sessionsPerYear: 250 },
        series: FALLING_CLOSES,
        expected: -2.2904,
      },
      {
        name: 'chuỗi tăng đều chưa từng sụt giảm nên mẫu số bằng 0',
        inputs: { sessionsPerYear: 250 },
        series: RISING_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'mới 30 phiên thì chưa đủ dữ liệu chuỗi',
        inputs: { sessionsPerYear: 250 },
        series: SHORT_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CALMAR, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';

    const closes = requireCloses(ctx, MIN_SESSIONS);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const sessions = v('sessionsPerYear');
    const badSessions = invalidSessionsPerYear(sessions);
    if (badSessions !== null) return fail(unit, badSessions);

    const drawdown = maxDrawdown(closes);
    if (drawdown === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'tỷ số Calmar', en: 'the Calmar ratio' },
          { vi: 'Mức sụt giảm sâu nhất', en: 'maximum drawdown' },
          {
            vi: 'Chuỗi này chưa có phiên nào thấp hơn đỉnh trước đó — kéo dài chuỗi giá qua một nhịp điều chỉnh, hoặc dùng tỷ số Sharpe.',
            en: 'This series has no session lower than its previous peak — extend the price series through a correction, or use the Sharpe ratio instead.',
          },
        ),
      );
    }

    // Giá đầu và giá cuối luôn dương vì `requireCloses` đã loại phiên giá 0 hoặc âm.
    const first = closes[0] ?? Number.NaN;
    const last = closes[closes.length - 1] ?? Number.NaN;
    const elapsed = closes.length - 1;
    const annualised = Math.pow(last / first, sessions / elapsed) - 1;

    return ok(annualised / drawdown, unit, {
      extras: { annualisedReturn: annualised * 100, maxDrawdown: drawdown * 100 },
    });
  },
};

/*
 * ── 6. Tỷ số thắng/thua ────────────────────────────────────────────────────────────────
 */

export const TY_SO_THANG_THUA: FormulaModule = {
  spec: {
    id: 'ty-so-thang-thua',
    categoryId: 'risk',
    name: { vi: 'Tỷ số thắng/thua', en: 'Win/loss (payoff) ratio' },
    description: {
      vi: 'Trung bình mức tăng của các phiên tăng so với trung bình mức giảm của các phiên giảm.',
      en: 'The average gain of rising sessions compared with the average loss of falling sessions.',
    },
    latex: 'W/L = \\frac{\\overline{r^{+}}}{\\left| \\overline{r^{-}} \\right|}',
    expression: {
      vi: 'Tỷ số thắng/thua = Trung bình mức tăng của các phiên tăng ÷ Trung bình mức giảm của các phiên giảm',
      en: 'Win/loss ratio = Average gain of rising sessions ÷ Average loss of falling sessions',
    },
    chartType: 'histogram',
    level: 'basic',
    tags: ['thang thua', 'win loss', 'payoff ratio', 'phien tang phien giam', 'bien do'],
    resultUnit: 'lần',
    variables: [
      sliderVar(
        'threshold',
        { vi: 'Ngưỡng bỏ qua phiên đi ngang', en: 'Threshold to ignore flat sessions' },
        '%',
        0,
        0,
        3,
        0.1,
        {
          description: {
            vi: `Phiên biến động trong khoảng cộng trừ ngưỡng này bị coi là đi ngang và không được tính vào cả hai vế. Để 0 nghĩa là tính hết. ${SESSIONS_NOTE}`,
            en: `A session that moves within plus or minus this threshold is treated as flat and excluded from both sides. Leave it at 0 to count every session. ${SESSIONS_NOTE_EN}`,
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Đo độ "lệch vai" của chuỗi giá: khi tăng thì tăng bao nhiêu, khi giảm thì giảm bao nhiêu. Trên 1 nghĩa là các nhịp tăng có biên độ lớn hơn các nhịp giảm.',
        en: 'Measures the "lopsidedness" of a price series: how much it rises when it rises, and how much it falls when it falls. Above 1 means rising moves are larger in magnitude than falling ones.',
      },
      whenToUse: {
        vi: 'Khi soi tính cách của một cổ phiếu trước khi vào lệnh, hoặc khi kiểm lại một chiến lược: cỡ lãi trung bình có bù nổi cỡ lỗ trung bình không.',
        en: "When sizing up a stock's personality before placing an order, or when reviewing a strategy: does the average gain size offset the average loss size.",
      },
      howToRead: {
        vi: 'Đây là tỷ số về BIÊN ĐỘ, không phải về tần suất. Tỷ số 1,2 mà chỉ 30% số phiên tăng thì tổng cuộc vẫn lỗ — phải đọc kèm số phiên tăng và số phiên giảm.',
        en: 'This is a ratio of MAGNITUDE, not frequency. A ratio of 1.2 with only 30% of sessions rising still nets out to a loss overall — always read it alongside the counts of gaining and losing sessions.',
      },
      commonMistakes: {
        vi: 'Coi tỷ số trên 1 là chắc chắn có lãi. Cần nhân với tỷ lệ thắng mới ra kỳ vọng: tỷ lệ thắng 30% và tỷ số thắng/thua 1,2 vẫn là một chiến lược thua.',
        en: 'Assuming a ratio above 1 guarantees a profit. It must be multiplied by the win rate to get expectancy: a 30% win rate with a 1.2 win/loss ratio is still a losing strategy.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi 61 phiên mẫu, tính hết mọi phiên tăng và giảm',
        en: 'A 61-session sample series, counting every rising and falling session',
      },
      inputs: { threshold: 0 },
      series: ZIGZAG_CLOSES,
      expected: 1.16,
      note: {
        vi: '30 phiên tăng trung bình 2,87% so với 30 phiên giảm trung bình 2,47%.',
        en: '30 rising sessions averaging 2.87% against 30 falling sessions averaging 2.47%.',
      },
    },
    tests: [
      {
        name: 'chuỗi zigzag tính hết mọi phiên ra 1,1589 lần',
        inputs: { threshold: 0 },
        series: ZIGZAG_CLOSES,
        expected: 1.1589,
      },
      {
        name: 'bỏ qua các phiên nhỏ hơn 2% thì tỷ số nhích lên 1,2058',
        inputs: { threshold: 2 },
        series: ZIGZAG_CLOSES,
        expected: 1.2058,
      },
      {
        name: 'ngưỡng 3% lọc sạch phiên giảm nên mẫu số bằng 0',
        inputs: { threshold: 3 },
        series: ZIGZAG_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'chuỗi giá đứng yên thì không có phiên giảm nào để chia',
        inputs: { threshold: 0 },
        series: FLAT_CLOSES,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'chuỗi giảm đều không có phiên tăng nào nên tỷ số vô nghĩa',
        inputs: { threshold: 0 },
        series: FALLING_CLOSES,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'mới 30 phiên thì chưa đủ dữ liệu chuỗi',
        inputs: { threshold: 0 },
        series: SHORT_CLOSES,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_KAUFMAN, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';

    const closes = requireCloses(ctx, MIN_SESSIONS);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const threshold = Math.abs(v('threshold')) / 100;
    const returns = simpleReturns(closes);
    const gains = returns.filter((r) => r > threshold);
    const losses = returns.filter((r) => r < -threshold);

    if (losses.length === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'tỷ số thắng/thua', en: 'the win/loss ratio' },
          { vi: 'Trung bình mức giảm của các phiên giảm', en: 'average loss of falling sessions' },
          {
            vi: 'Chuỗi này không có phiên giảm nào vượt ngưỡng — hạ ngưỡng bỏ qua phiên đi ngang, hoặc kéo dài chuỗi giá.',
            en: 'This series has no falling session past the threshold — lower the flat-session threshold, or extend the price series.',
          },
        ),
      );
    }
    if (gains.length === 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Chuỗi này không có phiên tăng nào vượt ngưỡng nên không có vế thắng để đem so.',
            en: 'This series has no rising session past the threshold, so there is no winning side to compare against.',
          },
          {
            vi: 'Hạ ngưỡng bỏ qua phiên đi ngang, hoặc chọn giai đoạn có cả nhịp tăng.',
            en: 'Lower the flat-session threshold, or choose a period that includes an uptrend.',
          },
        ),
      );
    }

    return ok(mean(gains) / Math.abs(mean(losses)), unit, {
      extras: {
        gainCount: gains.length,
        lossCount: losses.length,
        averageGain: mean(gains) * 100,
        averageLoss: mean(losses) * 100,
      },
    });
  },
};

/** Sáu tỷ số hiệu quả điều chỉnh rủi ro, bổ sung cho nhóm 'risk'. */
export const RISK_RATIO_FORMULAS: ReadonlyArray<FormulaModule> = [
  BETA,
  TY_SO_SHARPE,
  TY_SO_SORTINO,
  TY_SO_TREYNOR,
  TY_SO_THONG_TIN,
  TY_SO_CALMAR,
  TY_SO_THANG_THUA,
];
