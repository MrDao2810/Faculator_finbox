/**
 * Tầng DOMAIN — nhóm rủi ro, phần ĐO BIẾN ĐỘNG (một phần gói WBS 5.2).
 *
 * Sáu công thức ở đây đều đọc CHUỖI GIÁ nhiều phiên qua `ctx.series` chứ không chỉ vài ô nhập
 * (FR-12). Chúng không tự chạm vào `ctx.series`: mọi lối vào đi qua `requireCloses()` của
 * `series-utils.ts`, nên thiếu dữ liệu thì ra đúng một cảnh báo MISSING_SERIES chung giọng với
 * các nhóm khác, tuyệt đối không có chuyện tính bừa trên ba phiên rồi trả ra một con số.
 *
 * Quy ước chiều chuỗi: phiên CŨ trước, phiên MỚI CUỐI — giống bảng WF-05.
 *
 * Số phiên tối thiểu: nhóm độ lệch chuẩn cần ít nhất 30 phiên, và dưới 60 phiên thì ước lượng
 * còn yếu (Bodie, Kane & Marcus, chương 5). Hai công thức đếm/đo biên độ nhẹ hơn nên chỉ cần
 * 10 phiên. Ngưỡng nằm ở hằng số dưới đây chứ không rải trong từng thân hàm.
 *
 * Con số trong `tests[]` được tính bằng một script Node độc lập, viết lại công thức từ định
 * nghĩa giáo trình chứ không gọi file này — đúng luật "số kiểm lấy từ nguồn độc lập" của
 * README thư viện công thức.
 */

import { fail, ok } from '../calc-output';
import type { CalcContext, FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import type { Bilingual, CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless } from '../warnings';
import { FPT_57_PHIEN } from './market-series-2026';
import { mean, requireCloses, sampleStdDev, simpleReturns } from './series-utils';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/** Nguồn dùng chung của cả nhóm — chương về rủi ro và lợi suất lịch sử. */
const SOURCE_INVESTMENTS: FormulaSource = {
  label: {
    vi: 'Bodie, Kane & Marcus — Investments, ấn bản 12 (McGraw-Hill), chương 5: Risk, Return, and the Historical Record',
    en: 'Bodie, Kane & Marcus — Investments, 12th edition (McGraw-Hill), chapter 5: Risk, Return, and the Historical Record',
  },
};

/** Dưới 30 phiên thì độ lệch chuẩn lợi suất chỉ là con số cho có, không nói được gì. */
const MIN_SESSIONS_STDDEV = 30;

/** Đo biên độ và đếm chuỗi giảm nhẹ hơn: 10 phiên là đủ để có một kỳ quan sát. */
const MIN_SESSIONS_COUNT = 10;

/**
 * Cửa sổ giá đóng cửa dùng để tính: `sessions` phiên GẦN NHẤT.
 *
 * `minimum` là sàn cứng — thanh trượt đã chặn ở giao diện, nhưng `runFormula()` không kẹp giá
 * trị nên thân hàm vẫn phải tự giữ sàn, nếu không một cửa sổ 3 phiên sẽ lọt qua và cho ra một
 * độ lệch chuẩn vô nghĩa.
 *
 * @returns mảng giá nếu đủ phiên, hoặc `CalcWarning` MISSING_SERIES — nơi gọi kiểm bằng
 * `Array.isArray()`.
 */
function windowCloses(ctx: CalcContext, sessions: number, minimum: number): number[] | CalcWarning {
  const window = Math.max(minimum, Math.round(sessions));
  const closes = requireCloses(ctx, window);
  return Array.isArray(closes) ? closes.slice(-window) : closes;
}

/** Ô chọn độ dài cửa sổ cho nhóm độ lệch chuẩn. */
function stdDevWindowVar(): VariableSpec {
  return sliderVar(
    'sessions',
    { vi: 'Số phiên lấy để tính', en: 'Number of sessions used' },
    'phiên',
    60,
    MIN_SESSIONS_STDDEV,
    500,
    1,
    {
      level: 'advanced',
      description: {
        vi: 'Lấy bao nhiêu phiên gần nhất trong chuỗi giá. Tối thiểu 30 phiên; dưới 60 phiên thì ước lượng còn yếu vì mẫu quá mỏng.',
        en: 'How many of the most recent sessions to take from the price series. Minimum 30 sessions; below 60 sessions the estimate is still weak because the sample is too thin.',
      },
    },
  );
}

/** Ô chọn độ dài cửa sổ cho hai công thức đếm — ngưỡng nhẹ hơn nhóm độ lệch chuẩn. */
function countWindowVar(description: Bilingual): VariableSpec {
  return sliderVar(
    'sessions',
    { vi: 'Số phiên trong kỳ', en: 'Number of sessions in the period' },
    'phiên',
    60,
    MIN_SESSIONS_COUNT,
    500,
    1,
    { description },
  );
}

/*
 * ── Chuỗi giá dùng cho ca kiểm thử ─────────────────────────────────────────────────────
 *
 * Cố ý là chuỗi số nguyên có quy luật rõ, không phải chuỗi thật lấy từ bảng giá: người rà
 * soát dựng lại được bằng vài dòng script rồi đối chiếu, đó là điều kiện để ca kiểm thử có
 * giá trị. Mỗi ca tự khai chuỗi của nó ở trường `series`.
 */

/** 31 phiên, mỗi hai phiên tăng 2 rồi giảm 1 — một chuỗi tăng có rung lắc nhẹ. */
const CHUOI_TANG_ZIGZAG: ReadonlyArray<number> = [
  100, 102, 101, 103, 102, 104, 103, 105, 104, 106, 105, 107, 106, 108, 107, 109, 108, 110, 109,
  111, 110, 112, 111, 113, 112, 114, 113, 115, 114, 116, 115,
];

/** Cùng dáng chuỗi trên nhưng biên độ gấp đôi: tăng 4 rồi giảm 2. */
const CHUOI_ZIGZAG_MANH: ReadonlyArray<number> = [
  100, 104, 102, 106, 104, 108, 106, 110, 108, 112, 110, 114, 112, 116, 114, 118, 116, 120, 118,
  122, 120, 124, 122, 126, 124, 128, 126, 130, 128, 132, 130,
];

/** 31 phiên đứng im ở 100 — mọi lợi suất bằng 0, dùng cho các ca biên. */
const CHUOI_DUNG_IM: ReadonlyArray<number> = Array.from({ length: 31 }, () => 100);

/** 31 phiên đi xuống: mỗi hai phiên giảm 2 rồi tăng 1. Lợi suất bình quân âm. */
const CHUOI_GIAM_ZIGZAG: ReadonlyArray<number> = [
  130, 128, 129, 127, 128, 126, 127, 125, 126, 124, 125, 123, 124, 122, 123, 121, 122, 120, 121,
  119, 120, 118, 119, 117, 118, 116, 117, 115, 116, 114, 115,
];

/** 12 phiên có một đoạn giảm bốn phiên liên tiếp: 103 → 101 → 99 → 98. */
const CHUOI_12_PHIEN: ReadonlyArray<number> = [
  100, 104, 103, 101, 99, 98, 102, 105, 103, 100, 97, 101,
];

/** 6 phiên đầu của chuỗi trên — cố tình quá ngắn, dùng cho ca thiếu phiên. */
const CHUOI_QUA_NGAN: ReadonlyArray<number> = [100, 104, 103, 101, 99, 98];

/*
 * ── 1. Độ lệch chuẩn lợi suất theo phiên ───────────────────────────────────────────────
 */

export const DO_LECH_CHUAN_LOI_SUAT_PHIEN: FormulaModule = {
  spec: {
    id: 'do-lech-chuan-loi-suat-phien',
    categoryId: 'risk',
    name: { vi: 'Độ lệch chuẩn lợi suất theo phiên', en: 'Daily return standard deviation' },
    description: {
      vi: 'Mức dao động bình quân của lợi suất mỗi phiên quanh lợi suất trung bình.',
      en: "The average deviation of each session's return around the mean return.",
    },
    latex: 's = \\sqrt{\\frac{\\sum_{t=1}^{n}(r_t - \\bar{r})^2}{n - 1}}',
    expression: {
      vi: 'Độ lệch chuẩn phiên = căn bậc hai của [Tổng bình phương (Lợi suất từng phiên − Lợi suất bình quân) ÷ (Số lợi suất − 1)]',
      en: "Session standard deviation = square root of [Sum of squares (each session's return − average return) ÷ (number of returns − 1)]",
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['do lech chuan', 'bien dong', 'volatility', 'standard deviation', 'rui ro'],
    resultUnit: '%/phiên',
    variables: [stdDevWindowVar()],
    explanation: {
      meaning: {
        vi: 'Thước đo cơ bản nhất của rủi ro: lợi suất mỗi phiên thường lệch khỏi mức trung bình bao nhiêu phần trăm.',
        en: "The most basic measure of risk: how many percentage points each session's return typically deviates from the average.",
      },
      whenToUse: {
        vi: 'Khi cần một con số duy nhất để so mức dao động của hai cổ phiếu trong cùng một kỳ, hoặc khi cần mẫu số cho tỷ số Sharpe và số liệu đầu vào để quy độ biến động về năm.',
        en: 'When you need a single number to compare the volatility of two stocks over the same period, or when you need the denominator of the Sharpe ratio and the input for annualizing volatility.',
      },
      howToRead: {
        vi: 'Số càng lớn thì giá càng nhảy mạnh giữa các phiên. Với chuỗi lợi suất phân phối chuẩn, khoảng hai phần ba số phiên nằm trong khoảng một lần độ lệch chuẩn quanh mức trung bình.',
        en: 'The larger the number, the more sharply the price swings between sessions. For a normally distributed return series, about two-thirds of sessions fall within one standard deviation of the mean.',
      },
      commonMistakes: {
        vi: 'Tính trên vài chục phiên rồi coi là mức biến động ổn định của cổ phiếu — mẫu càng mỏng, con số càng nhảy theo kỳ chọn. Một lỗi khác là đem so thẳng độ lệch chuẩn theo phiên với con số theo năm của báo cáo quỹ.',
        en: "Computing it over a few dozen sessions and treating it as the stock's stable volatility level — the thinner the sample, the more the number jumps around depending on the period chosen. Another mistake is comparing the per-session standard deviation directly against the annualized figure in a fund report.",
      },
    },
    example: {
      title: {
        vi: 'Mức dao động mỗi phiên của FPT, 55 phiên gần nhất tính tới 15/09/2026',
        en: 'FPT’s per-session swing over the 55 most recent sessions through 2026-09-15',
      },
      inputs: { sessions: 55 },
      series: FPT_57_PHIEN,
      expected: 1.925,
      note: {
        vi: 'Theo quy tắc kinh nghiệm, khoảng 68% số phiên có lợi suất nằm trong ±1 độ lệch chuẩn quanh mức bình quân. Đây cũng là con số gốc mà độ biến động năm hoá và các tỷ số đo hiệu quả đều dựng lên từ đó.',
        en: 'As a rule of thumb, about 68% of sessions have a return within ±1 standard deviation of the average. It is also the base figure that annualized volatility and the performance ratios are all built on.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT), chuỗi 57 phiên 24/06–15/09/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) closing prices, a 57-session series from 2026-06-24 to 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'chuỗi tăng có rung lắc: 1,4159%/phiên',
        inputs: { sessions: 30 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 1.4159,
      },
      {
        name: 'biên độ gấp đôi thì độ lệch chuẩn cũng gần gấp đôi',
        inputs: { sessions: 30 },
        series: CHUOI_ZIGZAG_MANH,
        expected: 2.6516,
      },
      {
        name: 'giá đứng im suốt kỳ thì độ lệch chuẩn bằng 0',
        inputs: { sessions: 30 },
        series: CHUOI_DUNG_IM,
        expected: 0,
      },
      {
        name: 'chuỗi mới 12 phiên thì chưa tính được',
        inputs: { sessions: 30 },
        series: CHUOI_12_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v, ctx) => {
    const unit = '%/phiên';
    const closes = windowCloses(ctx, v('sessions'), MIN_SESSIONS_STDDEV);
    if (!Array.isArray(closes)) return fail(unit, closes);

    return ok(sampleStdDev(simpleReturns(closes)) * 100, unit);
  },
};

/*
 * ── 2. Độ biến động năm hoá ────────────────────────────────────────────────────────────
 */

export const DO_BIEN_DONG_NAM_HOA: FormulaModule = {
  spec: {
    id: 'do-bien-dong-nam-hoa',
    categoryId: 'risk',
    name: { vi: 'Độ biến động năm hoá', en: 'Annualized volatility' },
    description: {
      vi: 'Quy độ lệch chuẩn lợi suất theo phiên về mức tương đương cả năm.',
      en: 'Converts the per-session return standard deviation into its yearly equivalent.',
    },
    latex: '\\sigma_{nam} = s_{phien} \\times \\sqrt{D}',
    expression: {
      vi: 'Độ biến động năm = Độ lệch chuẩn lợi suất phiên × căn bậc hai của Số phiên giao dịch trong một năm',
      en: 'Annualized volatility = per-session return standard deviation × square root of the number of trading sessions in a year',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['bien dong nam', 'annualized volatility', 'sigma', 'do lech chuan nam', 'rui ro'],
    resultUnit: '%/năm',
    variables: [
      stdDevWindowVar(),
      numberVar(
        'tradingDays',
        { vi: 'Số phiên giao dịch trong một năm', en: 'Trading sessions per year' },
        'phiên',
        250,
        {
          min: 1,
          max: 366,
          level: 'advanced',
          description: {
            vi: 'Thị trường Việt Nam giao dịch khoảng 250 phiên mỗi năm.',
            en: 'The Vietnamese market trades roughly 250 sessions per year.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Cùng một mức rủi ro nhưng đo bằng đơn vị năm, để so được với lãi suất, với biến động của chỉ số hay của một quỹ.',
        en: 'The same level of risk, but measured in yearly terms, so it can be compared against interest rates or the volatility of an index or a fund.',
      },
      whenToUse: {
        vi: 'Khi báo cáo mức rủi ro của danh mục, hoặc khi cần đầu vào cho công thức định giá quyền chọn và VaR theo năm.',
        en: "When reporting a portfolio's risk level, or when you need an input for option pricing formulas and annual VaR.",
      },
      howToRead: {
        vi: 'Đọc là mức dao động của cả một năm: 22%/năm nghĩa là trong một năm bình thường, giá có thể lệch khoảng 22% so với mức trung bình, lên hoặc xuống. Số càng lớn thì đường giá càng gập ghềnh; muốn biết mức đó là cao hay thấp thì so với một mã cùng ngành trong cùng kỳ, hoặc với con số biến động mà báo cáo quỹ công bố, vì tất cả đều đã quy về cùng đơn vị năm.',
        en: "Read it as a full year's swing: 22%/year means that in a normal year the price can drift about 22% away from its average, up or down. The larger the number, the bumpier the price line; to judge whether that level is high or low, compare it with a peer ticker over the same period, or with the volatility figure a fund report publishes, since all of them are already stated per year.",
      },
      commonMistakes: {
        vi: 'Nhân độ lệch chuẩn phiên với 250 thay vì với căn bậc hai của 250. Sai lầm thứ hai là dùng 365 ngày lịch trong khi chuỗi giá chỉ có ngày giao dịch.',
        en: 'Multiplying the per-session standard deviation by 250 instead of by the square root of 250. A second mistake is using 365 calendar days when the price series only contains trading days.',
      },
    },
    example: {
      title: {
        vi: 'Quy dao động của FPT về thước đo năm, 55 phiên gần nhất tính tới 15/09/2026',
        en: 'FPT’s swing annualized, from the 55 most recent sessions through 2026-09-15',
      },
      inputs: { sessions: 55, tradingDays: 250 },
      series: FPT_57_PHIEN,
      expected: 30.4376,
      note: {
        vi: 'Phép quy năm nhân độ lệch chuẩn phiên với căn bậc hai của số phiên trong năm chứ không nhân thẳng, vì phương sai mới là thứ cộng dồn theo thời gian. Có thước đo năm rồi mới đặt cạnh được lãi suất tiết kiệm hay lợi suất trái phiếu.',
        en: 'Annualizing multiplies the per-session standard deviation by the square root of the number of sessions in a year rather than by that number itself, because it is variance that accumulates over time. Only on a yearly scale can it sit beside a savings rate or a bond yield.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT), chuỗi 57 phiên 24/06–15/09/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) closing prices, a 57-session series from 2026-06-24 to 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'chuỗi tăng có rung lắc, 250 phiên/năm: 22,387%/năm',
        inputs: { sessions: 30, tradingDays: 250 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 22.387,
      },
      {
        name: 'biên độ gấp đôi thì độ biến động năm cũng gần gấp đôi',
        inputs: { sessions: 30, tradingDays: 250 },
        series: CHUOI_ZIGZAG_MANH,
        expected: 41.9251,
      },
      {
        name: 'số phiên trong năm bằng 0 thì không quy năm được',
        inputs: { sessions: 30, tradingDays: 0 },
        series: CHUOI_TANG_ZIGZAG,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi mới 12 phiên thì chưa tính được',
        inputs: { sessions: 30, tradingDays: 250 },
        series: CHUOI_12_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v, ctx) => {
    const unit = '%/năm';
    const days = Math.round(v('tradingDays'));
    if (days <= 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Số phiên giao dịch trong một năm phải lớn hơn 0 thì mới quy độ biến động về mức cả năm được.',
            en: 'The number of trading sessions per year must be greater than 0 to annualize the volatility.',
          },
          {
            vi: 'Nhập khoảng 250 phiên — số phiên giao dịch thường thấy của một năm trên HOSE.',
            en: 'Enter about 250 sessions — the typical number of trading sessions in a year on HOSE.',
          },
        ),
      );
    }

    const closes = windowCloses(ctx, v('sessions'), MIN_SESSIONS_STDDEV);
    if (!Array.isArray(closes)) return fail(unit, closes);

    return ok(sampleStdDev(simpleReturns(closes)) * Math.sqrt(days) * 100, unit);
  },
};

/*
 * ── 3. Độ lệch chuẩn bán phần (downside deviation) ─────────────────────────────────────
 */

export const DO_LECH_CHUAN_BAN_PHAN: FormulaModule = {
  spec: {
    id: 'do-lech-chuan-ban-phan',
    categoryId: 'risk',
    name: { vi: 'Độ lệch chuẩn bán phần', en: 'Downside deviation' },
    description: {
      vi: 'Chỉ đo phần dao động nằm DƯỚI một ngưỡng lợi suất, bỏ qua các phiên tăng.',
      en: 'Measures only the volatility falling BELOW a return threshold, ignoring up sessions.',
    },
    latex: 'DD = \\sqrt{\\frac{\\sum_{r_t < B}(r_t - B)^2}{n - 1}}',
    expression: {
      vi: 'Độ lệch chuẩn bán phần = căn bậc hai của [Tổng bình phương (Lợi suất − Ngưỡng) của riêng các phiên dưới ngưỡng ÷ (Số lợi suất − 1)]',
      en: 'Downside deviation = square root of [Sum of squares (return − threshold) for sessions below the threshold only ÷ (number of returns − 1)]',
    },
    chartType: 'histogram',
    level: 'advanced',
    tags: ['downside deviation', 'do lech chuan ban phan', 'rui ro giam', 'sortino', 'nguong'],
    resultUnit: '%/phiên',
    variables: [
      stdDevWindowVar(),
      numberVar(
        'threshold',
        { vi: 'Ngưỡng lợi suất mỗi phiên', en: 'Per-session return threshold' },
        '%',
        0,
        {
          min: -5,
          max: 5,
          level: 'advanced',
          description: {
            vi: 'Mức lợi suất coi là chấp nhận được. Để 0 nghĩa là chỉ tính các phiên giảm giá.',
            en: 'The return level considered acceptable. Leaving it at 0 means only losing sessions are counted.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Phần rủi ro mà nhà đầu tư thực sự ngại: mức dao động của riêng những phiên rơi xuống dưới ngưỡng đặt ra.',
        en: 'The part of risk investors actually dread: the volatility of only those sessions that fall below the chosen threshold.',
      },
      whenToUse: {
        vi: 'Khi so hai danh mục có cùng độ lệch chuẩn nhưng một bên hay rơi sâu hơn, hoặc khi cần mẫu số cho tỷ số Sortino.',
        en: 'When comparing two portfolios with the same standard deviation where one tends to fall deeper, or when you need the denominator for the Sortino ratio.',
      },
      howToRead: {
        vi: 'Với ngưỡng mặc định 0% (chỉ tính phiên giảm giá), thường nhỏ hơn hoặc bằng độ lệch chuẩn đầy đủ vì đã bỏ hết phần tăng giá. Nâng ngưỡng lên cao thì số này tăng theo và có thể VƯỢT QUA độ lệch chuẩn đầy đủ — mẫu số đo khoảng cách tới ngưỡng, không phải tới lợi suất trung bình. Bằng 0 nghĩa là trong kỳ không phiên nào rơi xuống dưới ngưỡng, đó là kết quả thật chứ không phải thiếu dữ liệu.',
        en: 'With the default 0% threshold (only losing sessions counted), the figure is usually smaller than or equal to the full standard deviation because all the up sessions are excluded. Raising the threshold pushes this number up, and it can EXCEED the full standard deviation — the denominator measures distance to the threshold, not to the average return. A value of 0 means no session in the period fell below the threshold, a genuine result rather than missing data.',
      },
      commonMistakes: {
        vi: 'Chia cho số phiên nằm dưới ngưỡng thay vì cho tổng số phiên quan sát — làm thế thì danh mục càng ít phiên xấu lại càng bị chấm rủi ro cao. Lỗi thứ hai là quên đặt ngưỡng theo cùng đơn vị kỳ với chuỗi lợi suất.',
        en: 'Dividing by the number of sessions below the threshold instead of the total number of observed sessions — doing so scores a portfolio with fewer bad sessions as riskier. A second mistake is forgetting to set the threshold in the same period unit as the return series.',
      },
    },
    example: {
      title: {
        vi: 'Phần dao động về phía lỗ của FPT, ngưỡng 0% mỗi phiên, 55 phiên tính tới 15/09/2026',
        en: 'FPT’s downside-only swing, threshold 0% per session, 55 sessions through 2026-09-15',
      },
      inputs: { sessions: 55, threshold: 0 },
      series: FPT_57_PHIEN,
      expected: 1.1989,
      note: {
        vi: 'Chỉ những phiên có lợi suất dưới ngưỡng mới được đưa vào, nên kết quả luôn nhỏ hơn độ lệch chuẩn đầy đủ; hai con số càng sát nhau thì rủi ro càng dồn về chiều giảm. Đây cũng là mẫu số của tỷ số Sortino.',
        en: 'Only sessions with a return below the threshold are counted, so the result is always smaller than the full standard deviation; the closer the two figures sit, the more the risk leans to the downside. It is also the denominator of the Sortino ratio.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT), chuỗi 57 phiên 24/06–15/09/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) closing prices, a 57-session series from 2026-06-24 to 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'ngưỡng 0%: chỉ các phiên giảm được tính, ra 0,6731%',
        inputs: { sessions: 30, threshold: 0 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 0.6731,
      },
      {
        name: 'nâng ngưỡng lên 1%/phiên thì nhiều phiên rơi xuống dưới, số tăng lên 1,4047%',
        inputs: { sessions: 30, threshold: 1 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 1.4047,
      },
      {
        name: 'giá đứng im và ngưỡng 0% thì không có phần rơi nào',
        inputs: { sessions: 30, threshold: 0 },
        series: CHUOI_DUNG_IM,
        expected: 0,
      },
      {
        name: 'chuỗi mới 12 phiên thì chưa tính được',
        inputs: { sessions: 30, threshold: 0 },
        series: CHUOI_12_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v, ctx) => {
    const unit = '%/phiên';
    const closes = windowCloses(ctx, v('sessions'), MIN_SESSIONS_STDDEV);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const threshold = v('threshold') / 100;
    const returns = simpleReturns(closes);

    // Mẫu số là TỔNG số quan sát trừ 1, không phải số phiên nằm dưới ngưỡng — đúng định nghĩa
    // target downside deviation của CFA. Kết quả 0 ở đây là kết quả thật: không phiên nào rơi
    // xuống dưới ngưỡng, chứ không phải lỗi bị che.
    const sumSquared = returns.reduce(
      (sum, r) => (r < threshold ? sum + (r - threshold) ** 2 : sum),
      0,
    );

    return ok(Math.sqrt(sumSquared / (returns.length - 1)) * 100, unit);
  },
};

/*
 * ── 4. Hệ số biến thiên ────────────────────────────────────────────────────────────────
 */

export const HE_SO_BIEN_THIEN: FormulaModule = {
  spec: {
    id: 'he-so-bien-thien',
    categoryId: 'risk',
    name: { vi: 'Hệ số biến thiên', en: 'Coefficient of variation' },
    description: {
      vi: 'Bao nhiêu đơn vị rủi ro phải chịu cho mỗi đơn vị lợi suất bình quân.',
      en: 'How many units of risk are borne for each unit of average return.',
    },
    latex: 'CV = \\frac{s}{\\bar{r}}',
    expression: {
      vi: 'Hệ số biến thiên = Độ lệch chuẩn lợi suất ÷ Lợi suất bình quân',
      en: 'Coefficient of variation = return standard deviation ÷ average return',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['he so bien thien', 'coefficient of variation', 'cv', 'rui ro tren loi suat'],
    resultUnit: 'lần',
    variables: [stdDevWindowVar()],
    explanation: {
      meaning: {
        vi: 'Đưa rủi ro và lợi suất về cùng một tỷ lệ, nhờ đó so được hai cổ phiếu có mặt bằng lợi suất khác hẳn nhau.',
        en: 'Puts risk and return on the same scale, making it possible to compare two stocks with very different return levels.',
      },
      whenToUse: {
        vi: 'Khi chọn giữa hai cơ hội mà một bên vừa lãi cao hơn vừa dao động mạnh hơn, nên không nhìn riêng chỉ số nào mà quyết được.',
        en: 'When choosing between two opportunities where one has both a higher return and stronger volatility, so neither metric alone can decide it.',
      },
      howToRead: {
        vi: '3,3 lần nghĩa là mỗi 1% lợi suất bình quân một phiên phải đổi bằng 3,3% dao động. Số càng NHỎ càng tốt, nhưng nó chỉ có nghĩa khi đem so: đo hai mã trên cùng một kỳ, mã nào hệ số thấp hơn thì mỗi phần lãi kèm ít dao động hơn.',
        en: 'A value of 3.3 means every 1% of average per-session return is paid for with 3.3% of volatility. The SMALLER the better, but the number only means something in comparison: measure two tickers over the same period, and the one with the lower coefficient carries less volatility per unit of return.',
      },
      commonMistakes: {
        vi: 'Dùng khi lợi suất bình quân âm — lúc đó tỷ số ra số âm và xếp hạng ngược hoàn toàn, nên công thức này chỉ dùng cho kỳ có lợi suất bình quân dương.',
        en: 'Using it when the average return is negative — the ratio then comes out negative and the ranking flips entirely, so this formula should only be used for periods with a positive average return.',
      },
    },
    example: {
      title: {
        vi: 'Rủi ro trên mỗi đơn vị lợi nhuận của FPT, 55 phiên gần nhất tính tới 15/09/2026',
        en: 'FPT’s risk per unit of return over the 55 most recent sessions through 2026-09-15',
      },
      inputs: { sessions: 55 },
      series: FPT_57_PHIEN,
      expected: 28.6953,
      note: {
        vi: 'Kết quả không mang đơn vị nên so được giữa những cổ phiếu có mức giá và biên độ khác hẳn nhau — càng thấp thì mỗi phần lợi suất càng phải chịu ít dao động. Lợi suất bình quân của kỳ càng sát 0 thì mẫu số càng mỏng và con số càng nhảy.',
        en: 'The result carries no unit, so it compares stocks whose prices and ranges are nothing alike — the lower it is, the less volatility each unit of return has to carry. The closer the period’s average return sits to 0, the thinner the denominator and the jumpier the figure.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT), chuỗi 57 phiên 24/06–15/09/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) closing prices, a 57-session series from 2026-06-24 to 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'chuỗi tăng có rung lắc: 3,3382 lần',
        inputs: { sessions: 30 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 3.3382,
      },
      {
        name: 'giá đứng im thì lợi suất bình quân bằng 0, mẫu số bằng 0',
        inputs: { sessions: 30 },
        series: CHUOI_DUNG_IM,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'kỳ có lợi suất bình quân âm thì hệ số không còn ý nghĩa',
        inputs: { sessions: 30 },
        series: CHUOI_GIAM_ZIGZAG,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi mới 12 phiên thì chưa tính được',
        inputs: { sessions: 30 },
        series: CHUOI_12_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v, ctx) => {
    const unit = 'lần';
    const closes = windowCloses(ctx, v('sessions'), MIN_SESSIONS_STDDEV);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const returns = simpleReturns(closes);
    const average = mean(returns);

    if (average === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'hệ số biến thiên', en: 'coefficient of variation' },
          { vi: 'Lợi suất bình quân mỗi phiên', en: 'Average return per session' },
          {
            vi: 'Chọn kỳ có giá thay đổi, hoặc dùng Độ lệch chuẩn lợi suất theo phiên để đo riêng mức dao động.',
            en: 'Choose a period where the price changes, or use the Daily return standard deviation to measure volatility on its own.',
          },
        ),
      );
    }
    if (average < 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Lợi suất bình quân trong kỳ đang âm nên hệ số biến thiên ra số âm, không dùng để xếp hạng rủi ro được.',
            en: 'The average return in this period is negative, so the coefficient of variation comes out negative and cannot be used to rank risk.',
          },
          {
            vi: 'Chọn kỳ có lợi suất bình quân dương, hoặc dùng Độ lệch chuẩn lợi suất theo phiên.',
            en: 'Choose a period with a positive average return, or use the Daily return standard deviation instead.',
          },
        ),
      );
    }

    return ok(sampleStdDev(returns) / average, unit);
  },
};

/*
 * ── 5. Biên độ dao động lớn nhất trong kỳ ──────────────────────────────────────────────
 */

export const BIEN_DO_DAO_DONG_LON_NHAT: FormulaModule = {
  spec: {
    id: 'bien-do-dao-dong-lon-nhat',
    categoryId: 'risk',
    name: { vi: 'Biên độ dao động lớn nhất trong kỳ', en: 'Peak-to-trough price range' },
    description: {
      vi: 'Giá đóng cửa cao nhất trong kỳ cao hơn giá đóng cửa thấp nhất bao nhiêu phần trăm.',
      en: 'How many percent the highest closing price in the period is above the lowest closing price.',
    },
    latex: 'A = \\frac{P_{max} - P_{min}}{P_{min}} \\times 100',
    expression: {
      vi: 'Biên độ dao động = (Giá đóng cửa cao nhất − Giá đóng cửa thấp nhất) ÷ Giá đóng cửa thấp nhất × 100',
      en: 'Price range = (highest closing price − lowest closing price) ÷ lowest closing price × 100',
    },
    chartType: 'candlestick',
    level: 'basic',
    tags: ['bien do dao dong', 'dinh day', 'price range', 'cao nhat thap nhat', 'vung gia'],
    resultUnit: '%',
    variables: [
      countWindowVar({
        vi: 'Lấy bao nhiêu phiên gần nhất để tìm đỉnh và đáy. Tối thiểu 10 phiên.',
        en: 'How many of the most recent sessions to scan for the peak and trough. Minimum 10 sessions.',
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Khoảng cách giữa đỉnh và đáy giá đóng cửa trong kỳ — bề rộng của vùng giá mà cổ phiếu đã đi qua.',
        en: 'The distance between the peak and trough closing prices in the period — the width of the price zone the stock has traveled through.',
      },
      whenToUse: {
        vi: 'Khi ước lượng nhanh mức dao động của một mã trước khi đặt cắt lỗ hoặc chốt lời, và khi so vùng giá giữa các kỳ.',
        en: "When quickly estimating a stock's volatility before setting a stop-loss or take-profit order, and when comparing price zones across periods.",
      },
      howToRead: {
        vi: 'Tính theo đáy làm gốc, nên đọc là "từ đáy lên đỉnh tăng bao nhiêu phần trăm": 8,25% nghĩa là đỉnh cao hơn đáy 8,25%. Muốn biết rộng hay hẹp thì so với chính mã đó ở một kỳ trước dài bằng đúng kỳ này, hoặc với một mã cùng ngành trong cùng kỳ — biên độ càng rộng thì vào lệnh lệch vùng càng chênh nhiều.',
        en: 'It is computed with the trough as the base, so read it as "how many percent from trough to peak": 8.25% means the peak sits 8.25% above the trough. To judge whether that is wide or narrow, compare it with the same ticker over an equally long earlier period, or with a peer ticker over the same period — the wider the range, the more it costs to enter at the wrong zone.',
      },
      commonMistakes: {
        vi: 'Nhầm với mức sụt giảm sâu nhất từ đỉnh: biên độ không quan tâm đỉnh và đáy cái nào tới trước, còn drawdown thì bắt buộc đáy phải nằm SAU đỉnh.',
        en: 'Confusing it with maximum drawdown: the price range does not care which of the peak or trough came first, whereas drawdown requires the trough to occur AFTER the peak.',
      },
    },
    example: {
      title: {
        vi: 'Khoảng cách từ đáy lên đỉnh của FPT trong 55 phiên tính tới 15/09/2026',
        en: 'FPT’s trough-to-peak distance across the 55 sessions through 2026-09-15',
      },
      inputs: { sessions: 55 },
      series: FPT_57_PHIEN,
      expected: 19.7749,
      note: {
        vi: 'Biên độ giữa đỉnh và đáy dễ hình dung hơn độ lệch chuẩn nên hợp để đặt kỳ vọng về mức dao động phải ngồi qua. Bù lại nó chỉ đọc hai điểm cực trị, nên một phiên bất thường cũng đủ kéo con số đi.',
        en: 'A trough-to-peak range is easier to picture than a standard deviation, which makes it good for setting expectations about the swings one has to sit through. In exchange it reads only two extreme points, so a single unusual session is enough to move it.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT), chuỗi 57 phiên 24/06–15/09/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) closing prices, a 57-session series from 2026-06-24 to 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'chuỗi 12 phiên, đáy 97 đỉnh 105: 8,2474%',
        inputs: { sessions: 12 },
        series: CHUOI_12_PHIEN,
        expected: 8.2474,
      },
      {
        name: 'chuỗi tăng có rung lắc, 30 phiên gần nhất đáy 101 đỉnh 116: 14,8515%',
        inputs: { sessions: 30 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 14.8515,
      },
      {
        name: 'giá đứng im suốt kỳ thì biên độ bằng 0',
        inputs: { sessions: 30 },
        series: CHUOI_DUNG_IM,
        expected: 0,
      },
      {
        name: 'chuỗi mới 6 phiên thì chưa đủ một kỳ quan sát',
        inputs: { sessions: 12 },
        series: CHUOI_QUA_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v, ctx) => {
    const unit = '%';
    const closes = windowCloses(ctx, v('sessions'), MIN_SESSIONS_COUNT);
    if (!Array.isArray(closes)) return fail(unit, closes);

    // Không dùng Math.max(...closes): cửa sổ có thể tới vài trăm phiên, trải mảng ra tham số
    // là chỗ dễ tràn ngăn xếp. `requireCloses` đã bảo đảm mọi giá đều DƯƠNG nên đáy không thể
    // bằng 0, tức không có nhánh chia cho 0 ở đây.
    const highest = closes.reduce((best, close) => (close > best ? close : best), closes[0] ?? 0);
    const lowest = closes.reduce((best, close) => (close < best ? close : best), closes[0] ?? 0);

    return ok(((highest - lowest) / lowest) * 100, unit);
  },
};

/*
 * ── 6. Số phiên giảm liên tiếp dài nhất ────────────────────────────────────────────────
 */

export const CHUOI_PHIEN_GIAM_DAI_NHAT: FormulaModule = {
  spec: {
    id: 'chuoi-phien-giam-dai-nhat',
    categoryId: 'risk',
    name: { vi: 'Chuỗi phiên giảm dài nhất', en: 'Longest losing streak' },
    description: {
      vi: 'Trong kỳ, cổ phiếu đã có lần giảm liên tiếp nhiều nhất bao nhiêu phiên.',
      en: 'In the period, the longest run of consecutive declining sessions the stock has had.',
    },
    latex: 'L = \\max\\{k : r_{t+1} < 0, \\ldots, r_{t+k} < 0\\}',
    expression: {
      vi: 'Chuỗi giảm dài nhất = Số phiên giảm giá liên tiếp nhiều nhất trong kỳ',
      en: 'Longest losing streak = the greatest number of consecutive declining sessions in the period',
    },
    chartType: 'underwater',
    level: 'basic',
    tags: ['chuoi giam', 'losing streak', 'phien giam lien tiep', 'ky luat', 'tam ly'],
    resultUnit: 'phiên',
    variables: [
      countWindowVar({
        vi: 'Lấy bao nhiêu phiên gần nhất để đếm chuỗi giảm. Tối thiểu 10 phiên.',
        en: 'How many of the most recent sessions to scan for losing streaks. Minimum 10 sessions.',
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Đợt giảm liền mạch dài nhất trong kỳ, đếm theo số phiên có giá đóng cửa thấp hơn phiên liền trước.',
        en: 'The longest unbroken decline in the period, counted as the number of sessions whose closing price is lower than the one right before it.',
      },
      whenToUse: {
        vi: 'Khi chuẩn bị tâm lý và kế hoạch cho một chuỗi thua: biết mã này từng giảm liền năm phiên thì không hoảng ở phiên thứ ba.',
        en: 'When preparing mentally and planning for a losing streak: knowing this stock has fallen for five straight sessions before means not panicking on the third one.',
      },
      howToRead: {
        vi: 'Đơn vị là phiên, không phải phần trăm — chuỗi dài chưa chắc mất nhiều tiền nếu mỗi phiên chỉ giảm nhẹ. Kết quả 0 nghĩa là trong kỳ không phiên nào giảm.',
        en: 'The unit is sessions, not percent — a long streak does not necessarily mean heavy losses if each session only dips slightly. A result of 0 means no session declined during the period.',
      },
      commonMistakes: {
        vi: 'Coi đây là thước đo mức lỗ. Muốn biết mất bao nhiêu thì xem mức sụt giảm sâu nhất từ đỉnh; chuỗi phiên giảm chỉ đo độ dai của đợt giảm.',
        en: 'Treating this as a measure of loss size. To know how much was lost, look at maximum drawdown instead; the losing streak only measures how persistent the decline was.',
      },
    },
    example: {
      title: {
        vi: 'Chuỗi phiên đỏ liên tiếp dài nhất của FPT trong 55 phiên tính tới 15/09/2026',
        en: 'FPT’s longest run of consecutive down sessions in the 55 sessions through 2026-09-15',
      },
      inputs: { sessions: 55 },
      series: FPT_57_PHIEN,
      expected: 4,
      note: {
        vi: 'Con số này đo sức chịu đựng chứ không đo tiền: biết trước rằng mấy phiên đỏ nối nhau là chuyện thường gặp thì đỡ hoảng khi gặp thật. Trong kỳ có hai đoạn dài bằng nhau, một ở giữa tháng 7 và một ở giữa tháng 8/2026.',
        en: 'This one measures endurance rather than money: knowing in advance that a few red sessions in a row is an ordinary occurrence makes it less alarming when it happens. The period holds two runs of equal length, one in mid-July and one in mid-August 2026.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT), chuỗi 57 phiên 24/06–15/09/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) closing prices, a 57-session series from 2026-06-24 to 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'chuỗi 12 phiên có đoạn giảm bốn phiên liền',
        inputs: { sessions: 12 },
        series: CHUOI_12_PHIEN,
        expected: 4,
      },
      {
        name: 'chuỗi zigzag tăng hai giảm một thì chuỗi giảm dài nhất là 1 phiên',
        inputs: { sessions: 30 },
        series: CHUOI_TANG_ZIGZAG,
        expected: 1,
      },
      {
        name: 'giá đứng im thì không phiên nào giảm',
        inputs: { sessions: 30 },
        series: CHUOI_DUNG_IM,
        expected: 0,
      },
      {
        name: 'chuỗi mới 6 phiên thì chưa đủ một kỳ quan sát',
        inputs: { sessions: 12 },
        series: CHUOI_QUA_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_CFA, SOURCE_INVESTMENTS],
  },
  calc: (v, ctx) => {
    const unit = 'phiên';
    const closes = windowCloses(ctx, v('sessions'), MIN_SESSIONS_COUNT);
    if (!Array.isArray(closes)) return fail(unit, closes);

    // Kết quả 0 là kết quả thật — kỳ không có phiên giảm nào — chứ không phải số 0 thay cho lỗi:
    // trường hợp thiếu dữ liệu đã bị `windowCloses` chặn ở trên.
    let longest = 0;
    let current = 0;
    for (const r of simpleReturns(closes)) {
      if (r < 0) {
        current += 1;
        if (current > longest) longest = current;
      } else {
        current = 0;
      }
    }

    return ok(longest, unit);
  },
};

/** Sáu công thức đo biến động của nhóm 'risk'. */
export const RISK_VOLATILITY_FORMULAS: ReadonlyArray<FormulaModule> = [
  DO_LECH_CHUAN_LOI_SUAT_PHIEN,
  DO_BIEN_DONG_NAM_HOA,
  DO_LECH_CHUAN_BAN_PHAN,
  HE_SO_BIEN_THIEN,
  BIEN_DO_DAO_DONG_LON_NHAT,
  CHUOI_PHIEN_GIAM_DAI_NHAT,
];
