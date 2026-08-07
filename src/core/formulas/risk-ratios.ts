/**
 * Tầng DOMAIN — nhóm rủi ro & danh mục, phần TỶ SỐ HIỆU QUẢ ĐIỀU CHỈNH RỦI RO (gói WBS 5.1.4).
 *
 * Sáu tỷ số trả lời cùng một câu hỏi theo sáu cách: một đơn vị rủi ro gánh chịu đổi lại được
 * bao nhiêu phần lợi suất. Khác nhau ở chỗ mỗi cái đo "rủi ro" bằng một thước riêng —
 * độ lệch chuẩn (Sharpe), phần giảm (Sortino), beta (Treynor), sai số theo dõi (thông tin),
 * mức sụt giảm sâu nhất (Calmar), hay cỡ lãi so với cỡ lỗ (thắng/thua).
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
import type { CalcWarning } from '../types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { maxDrawdown, mean, requireCloses, sampleStdDev, simpleReturns } from './series-utils';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/*
 * ── Nguồn tham khảo ────────────────────────────────────────────────────────────────────
 */

const SOURCE_SHARPE: FormulaSource = {
  label:
    'William F. Sharpe — "The Sharpe Ratio", The Journal of Portfolio Management, tập 21 số 1 (mùa thu 1994), trang 49–58',
};

const SOURCE_SORTINO: FormulaSource = {
  label:
    'Frank A. Sortino & Lee N. Price — "Performance Measurement in a Downside Risk Framework", The Journal of Investing, tập 3 số 3 (mùa thu 1994), trang 59–64',
};

const SOURCE_TREYNOR: FormulaSource = {
  label:
    'Jack L. Treynor — "How to Rate Management of Investment Funds", Harvard Business Review, tập 43 số 1 (1965), trang 63–75',
};

const SOURCE_GRINOLD_KAHN: FormulaSource = {
  label:
    'Richard C. Grinold & Ronald N. Kahn — Active Portfolio Management, ấn bản 2 (McGraw-Hill, 1999), chương 5: Residual Risk and Return — The Information Ratio',
};

const SOURCE_CALMAR: FormulaSource = {
  label: 'Terry W. Young — "Calmar Ratio: A Smoother Tool", tạp chí Futures, tháng 10/1991',
};

const SOURCE_KAUFMAN: FormulaSource = {
  label:
    'Perry J. Kaufman — Trading Systems and Methods, ấn bản 6 (Wiley, 2020), phần đo hiệu quả hệ thống giao dịch',
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

/** Lãi suất phi rủi ro — biến nhập tay, không lấy từ biểu phí thị trường. */
const RISK_FREE_VAR = sliderVar('riskFree', 'Lãi suất phi rủi ro / năm', '%', 4.5, 0, 15, 0.1, {
  description:
    'Mức sinh lời coi như chắc chắn, thường lấy lợi suất trái phiếu chính phủ kỳ hạn 1 năm.',
});

/** Số phiên quy năm — 250 là số phiên giao dịch một năm của HOSE, tuần là 52, tháng là 12. */
const SESSIONS_VAR = sliderVar(
  'sessionsPerYear',
  'Số phiên trong một năm',
  'phiên',
  250,
  12,
  365,
  1,
  {
    description: `Chuỗi theo ngày giao dịch thì để 250, theo tuần để 52, theo tháng để 12. ${SESSIONS_NOTE}`,
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
    'kết quả quy năm',
    'Số phiên trong một năm',
    'Nhập ít nhất 1 phiên mỗi năm — chuỗi theo ngày thường là 250.',
  );
}

/** Cảnh báo dùng chung khi chuỗi giá đứng yên nên độ lệch chuẩn bằng 0. */
function flatSeriesWarning(what: string): CalcWarning {
  return divideByZero(
    what,
    'Độ lệch chuẩn lợi suất',
    'Chuỗi giá đang đứng yên nên không có biến động để chia — nạp chuỗi giá có thay đổi giữa các phiên.',
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

/*
 * ── 1. Tỷ số Sharpe ────────────────────────────────────────────────────────────────────
 */

export const TY_SO_SHARPE: FormulaModule = {
  spec: {
    id: 'ty-so-sharpe',
    categoryId: 'risk',
    name: { vi: 'Tỷ số Sharpe', en: 'Sharpe ratio' },
    description:
      'Mỗi đơn vị biến động phải chịu đổi lại được bao nhiêu phần lợi suất vượt trên lãi suất phi rủi ro.',
    latex: 'S = \\frac{\\bar{r}_p - r_f}{\\sigma_p} \\times \\sqrt{m}',
    expression:
      'Tỷ số Sharpe = (Lợi suất bình quân một phiên − Lãi suất phi rủi ro một phiên) ÷ Độ lệch chuẩn lợi suất phiên × căn bậc hai của Số phiên trong một năm',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['sharpe', 'ty so sharpe', 'rui ro dieu chinh', 'risk adjusted', 'do bien dong'],
    resultUnit: 'lần',
    variables: [RISK_FREE_VAR, SESSIONS_VAR],
    explanation: {
      meaning:
        'Lãi nhiều mà đường giá gập ghềnh thì chưa chắc hơn lãi ít mà êm. Sharpe đặt phần lãi vượt trên lãi suất phi rủi ro lên bàn cân với độ lệch chuẩn của lợi suất từng phiên.',
      whenToUse:
        'Khi so hai danh mục hay hai quỹ có mức lãi khác nhau và mức biến động cũng khác nhau, trên cùng một khoảng thời gian.',
      howToRead:
        'Dưới 1 là bình thường, quanh 1 là khá, trên 2 là rất tốt nhưng phải nghi ngờ mẫu quá ngắn. Số âm nghĩa là danh mục còn thua gửi tiết kiệm mà vẫn phải chịu biến động.',
      commonMistakes:
        'So Sharpe của hai kỳ dài ngắn khác nhau, hoặc quên rằng độ lệch chuẩn phạt cả những phiên TĂNG mạnh — danh mục lãi đột biến vài phiên có thể bị Sharpe chấm điểm thấp oan.',
    },
    example: {
      title: 'Chuỗi 61 phiên mẫu, lãi suất phi rủi ro 4,5%/năm',
      inputs: { riskFree: 4.5, sessionsPerYear: 250 },
      series: ZIGZAG_CLOSES,
      expected: 1.02,
      note: 'Chuỗi lên 10% sau 60 phiên nhưng dao động khá mạnh, nên Sharpe chỉ quanh mức 1 lần.',
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
    if (deviation === 0) return fail(unit, flatSeriesWarning('tỷ số Sharpe'));

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
    description:
      'Như Sharpe nhưng mẫu số chỉ đếm phần biến động ĐI XUỐNG — phần rủi ro mà nhà đầu tư thật sự sợ.',
    latex:
      'Sortino = \\frac{\\bar{r}_p - r_f}{\\sigma_d} \\times \\sqrt{m}, \\quad \\sigma_d = \\sqrt{\\frac{1}{n} \\sum_{t=1}^{n} \\min(0, r_t - r_f)^2}',
    expression:
      'Tỷ số Sortino = (Lợi suất bình quân một phiên − Ngưỡng phi rủi ro một phiên) ÷ Độ lệch chuẩn phần giảm × căn bậc hai của Số phiên trong một năm',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['sortino', 'ty so sortino', 'downside risk', 'rui ro giam gia', 'do lech phan giam'],
    resultUnit: 'lần',
    variables: [RISK_FREE_VAR, SESSIONS_VAR],
    explanation: {
      meaning:
        'Sharpe phạt cả những phiên tăng vọt vì chúng cũng làm độ lệch chuẩn phình ra. Sortino chỉ đo phần lợi suất rơi dưới ngưỡng chấp nhận được, nên đúng với cảm nhận rủi ro của người bỏ tiền.',
      whenToUse:
        'Khi danh mục có vài phiên lãi đột biến, hoặc khi so các chiến lược mà mức lỗ mới là thứ đáng quan tâm — quỹ mở, chiến lược quyền chọn, danh mục hưu trí.',
      howToRead:
        'Luôn cao hơn Sharpe của cùng chuỗi nếu các phiên tăng mạnh hơn các phiên giảm. Đọc theo cùng thang với Sharpe: quanh 1 là khá, trên 2 là tốt.',
      commonMistakes:
        'So thẳng Sortino với Sharpe rồi kết luận danh mục "tốt hơn" — hai thước đo có mẫu số khác nhau. Ngoài ra mẫu số chia cho TỔNG số phiên, nên chuỗi hầu như không có phiên giảm sẽ cho ra con số rất lớn, cần cảnh giác.',
    },
    example: {
      title: 'Chuỗi 61 phiên mẫu, ngưỡng là lãi suất phi rủi ro 4,5%/năm',
      inputs: { riskFree: 4.5, sessionsPerYear: 250 },
      series: ZIGZAG_CLOSES,
      expected: 1.58,
      note: 'Cao hơn Sharpe 1,02 của cùng chuỗi vì các phiên tăng mạnh hơn các phiên giảm.',
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
          'tỷ số Sortino',
          'Độ lệch chuẩn phần giảm',
          'Chuỗi này không có phiên nào rơi dưới ngưỡng phi rủi ro nên không có rủi ro giảm giá để chia — dùng tỷ số Sharpe hoặc kéo dài chuỗi giá.',
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
    description:
      'Phần lợi suất vượt lãi suất phi rủi ro tính trên mỗi đơn vị beta — rủi ro không thể phân tán bằng cách đa dạng hoá.',
    latex: 'T = \\frac{(\\bar{r}_p - r_f) \\times m}{\\beta_p}',
    expression:
      'Tỷ số Treynor = (Lợi suất bình quân một phiên − Lãi suất phi rủi ro một phiên) × Số phiên trong một năm ÷ Hệ số beta',
    chartType: 'scatter',
    level: 'advanced',
    tags: ['treynor', 'ty so treynor', 'beta', 'rui ro he thong', 'risk adjusted'],
    resultUnit: '%/năm',
    variables: [
      RISK_FREE_VAR,
      SESSIONS_VAR,
      numberVar('beta', 'Hệ số beta của danh mục', 'lần', 1.2, {
        min: -5,
        max: 5,
        description:
          'Nhập tay: lấy từ công thức Beta, từ bảng dữ liệu của công ty chứng khoán, hoặc từ báo cáo quỹ. Beta 1 nghĩa là biến động ngang thị trường.',
      }),
    ],
    explanation: {
      meaning:
        'Sharpe chia cho TOÀN BỘ biến động, Treynor chỉ chia cho phần biến động đi cùng thị trường. Ai đã nắm một danh mục đa dạng thì phần riêng lẻ coi như đã triệt tiêu, chỉ còn beta là đáng tính tiền.',
      whenToUse:
        'Khi đánh giá một quỹ hay một danh mục con NẰM TRONG một danh mục lớn đã đa dạng hoá, hoặc khi xếp hạng nhiều quỹ cùng đo theo VN-Index.',
      howToRead:
        'Đọc như một mức lãi vượt chuẩn quy năm cho mỗi 1 đơn vị beta. Con số càng cao càng tốt; so sánh chỉ có nghĩa giữa các danh mục cùng đo theo một chỉ số tham chiếu.',
      commonMistakes:
        'Dùng Treynor cho một danh mục chỉ có vài mã: khi chưa đa dạng hoá thì rủi ro riêng lẻ còn rất lớn mà beta không hề đo tới, nên tỷ số vẽ ra bức tranh quá đẹp.',
    },
    example: {
      title: 'Chuỗi 61 phiên mẫu, beta 1,2 và lãi suất phi rủi ro 4,5%/năm',
      inputs: { riskFree: 4.5, sessionsPerYear: 250, beta: 1.2 },
      series: ZIGZAG_CLOSES,
      expected: 37.28,
      note: 'Lợi suất vượt chuẩn quy năm khoảng 44,7%; chia cho beta 1,2 còn 37,3% cho mỗi đơn vị beta.',
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
          'tỷ số Treynor',
          'Hệ số beta',
          'Beta bằng 0 nghĩa là danh mục không hề đi theo thị trường — dùng tỷ số Sharpe thay thế.',
        ),
      );
    }
    if (beta < 0) {
      return fail(
        unit,
        meaningless(
          'Beta âm làm tỷ số Treynor đảo dấu: danh mục lãi vẫn cho ra con số âm, và danh mục lỗ lại cho ra con số dương.',
          'Nhập beta dương, hoặc dùng tỷ số Sharpe cho danh mục đi ngược thị trường.',
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
    description:
      'Phần lợi suất thắng được chuẩn so sánh, tính trên mỗi đơn vị rủi ro phải chấp nhận để đi lệch khỏi chuẩn.',
    latex: 'IR = \\frac{\\bar{r}_p - \\bar{r}_b}{\\sigma_{p-b}} \\times \\sqrt{m}',
    expression:
      'Tỷ số thông tin = (Lợi suất bình quân một phiên − Lợi suất chuẩn một phiên) ÷ Độ lệch chuẩn phần chênh lệch × căn bậc hai của Số phiên trong một năm',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['information ratio', 'ty so thong tin', 'vuot chuan', 'benchmark', 'sai so theo doi'],
    resultUnit: 'lần',
    variables: [
      numberVar('benchmarkReturn', 'Lợi suất chuẩn so sánh / năm', '%', 12, {
        min: -100,
        max: 200,
        description:
          'Mức tăng cả năm của chuẩn dùng để so, ví dụ VN-Index. Nhập một con số duy nhất chứ không phải cả chuỗi.',
      }),
      SESSIONS_VAR,
    ],
    explanation: {
      meaning:
        'Thắng chuẩn 5 điểm phần trăm bằng cách bám sát chuẩn khác hẳn thắng 5 điểm bằng cách đánh cược lệch hẳn khỏi chuẩn. Tỷ số thông tin chia phần thắng đó cho mức độ đi lệch.',
      whenToUse:
        'Khi chấm điểm một quỹ chủ động hay chính danh mục của mình so với VN-Index, và muốn biết phần thắng có xứng với rủi ro đi lệch hay không.',
      howToRead:
        'Từ 0,5 trở lên đã là quản lý chủ động tốt theo thang của Grinold & Kahn; trên 1 là hiếm. Số âm nghĩa là đi lệch khỏi chuẩn mà vẫn thua chuẩn.',
      commonMistakes:
        'Đọc tỷ số thông tin như Sharpe. Sharpe so với lãi suất phi rủi ro, tỷ số thông tin so với chuẩn thị trường — một danh mục có thể tốt theo thước này và tệ theo thước kia.',
    },
    note: 'Bản rút gọn: chuẩn so sánh nhập bằng MỘT con số %/năm thay vì cả chuỗi, nên sai số theo dõi ở mẫu số chính là độ lệch chuẩn lợi suất của danh mục. Muốn sai số theo dõi đúng nghĩa thì cần chuỗi giá của chuẩn để trừ theo từng phiên — phần đó chờ gói nhập hai chuỗi.',
    example: {
      title: 'Chuỗi 61 phiên mẫu so với chuẩn tăng 12%/năm',
      inputs: { benchmarkReturn: 12, sessionsPerYear: 250 },
      series: ZIGZAG_CLOSES,
      expected: 0.86,
      note: 'Danh mục thắng chuẩn nhưng phải chịu biến động khá lớn, nên tỷ số dừng dưới mức 1.',
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
    if (deviation === 0) return fail(unit, flatSeriesWarning('tỷ số thông tin'));

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
    description:
      'Lợi suất năm hoá chia cho mức sụt giảm sâu nhất — đo phần lãi đổi lại bằng cú đau lớn nhất đã phải chịu.',
    latex: 'Calmar = \\frac{r_{nam}}{MDD}',
    expression: 'Tỷ số Calmar = Lợi suất năm hoá ÷ Mức sụt giảm sâu nhất từ đỉnh',
    chartType: 'underwater',
    level: 'advanced',
    tags: ['calmar', 'ty so calmar', 'max drawdown', 'sut giam sau nhat', 'mdd'],
    resultUnit: 'lần',
    variables: [SESSIONS_VAR],
    explanation: {
      meaning:
        'Độ lệch chuẩn đo mức gập ghềnh trung bình, còn mức sụt giảm sâu nhất đo đúng cái làm người ta bán tháo. Calmar hỏi: mỗi 1% sụt giảm sâu nhất đã phải chịu đổi lại được bao nhiêu phần lợi suất năm.',
      whenToUse:
        'Khi đánh giá một chiến lược hay một quỹ mà điều kiện chịu đựng của người bỏ tiền là có hạn — thường dùng cho quỹ phòng hộ và hệ thống giao dịch.',
      howToRead:
        'Trên 1 nghĩa là lãi một năm đã lớn hơn cú sụt sâu nhất. Nguyên bản Calmar tính trên 36 tháng; cửa sổ chỉ 60 phiên thì phép quy năm phóng đại tử số nên con số dễ đẹp quá mức.',
      commonMistakes:
        'Chạy Calmar trên một chuỗi ngắn toàn phiên tăng: mẫu số gần bằng 0 làm tỷ số vọt lên vài chục lần, trong khi thực chất chỉ là chuỗi chưa gặp nhịp điều chỉnh nào.',
    },
    example: {
      title: 'Chuỗi 61 phiên hình chữ V: lên 120, rơi về 90, hồi lên 110',
      inputs: { sessionsPerYear: 250 },
      series: DIP_CLOSES,
      expected: 1.95,
      note: 'Sụt giảm sâu nhất 25% từ đỉnh 120 xuống đáy 90; lợi suất năm hoá 48,8% chia cho 25% được 1,95 lần.',
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
          'tỷ số Calmar',
          'Mức sụt giảm sâu nhất',
          'Chuỗi này chưa có phiên nào thấp hơn đỉnh trước đó — kéo dài chuỗi giá qua một nhịp điều chỉnh, hoặc dùng tỷ số Sharpe.',
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
    description:
      'Trung bình mức tăng của các phiên tăng so với trung bình mức giảm của các phiên giảm.',
    latex: 'W/L = \\frac{\\overline{r^{+}}}{\\left| \\overline{r^{-}} \\right|}',
    expression:
      'Tỷ số thắng/thua = Trung bình mức tăng của các phiên tăng ÷ Trung bình mức giảm của các phiên giảm',
    chartType: 'histogram',
    level: 'basic',
    tags: ['thang thua', 'win loss', 'payoff ratio', 'phien tang phien giam', 'bien do'],
    resultUnit: 'lần',
    variables: [
      sliderVar('threshold', 'Ngưỡng bỏ qua phiên đi ngang', '%', 0, 0, 3, 0.1, {
        description: `Phiên biến động trong khoảng cộng trừ ngưỡng này bị coi là đi ngang và không được tính vào cả hai vế. Để 0 nghĩa là tính hết. ${SESSIONS_NOTE}`,
      }),
    ],
    explanation: {
      meaning:
        'Đo độ "lệch vai" của chuỗi giá: khi tăng thì tăng bao nhiêu, khi giảm thì giảm bao nhiêu. Trên 1 nghĩa là các nhịp tăng có biên độ lớn hơn các nhịp giảm.',
      whenToUse:
        'Khi soi tính cách của một cổ phiếu trước khi vào lệnh, hoặc khi kiểm lại một chiến lược: cỡ lãi trung bình có bù nổi cỡ lỗ trung bình không.',
      howToRead:
        'Đây là tỷ số về BIÊN ĐỘ, không phải về tần suất. Tỷ số 1,2 mà chỉ 30% số phiên tăng thì tổng cuộc vẫn lỗ — phải đọc kèm số phiên tăng và số phiên giảm.',
      commonMistakes:
        'Coi tỷ số trên 1 là chắc chắn có lãi. Cần nhân với tỷ lệ thắng mới ra kỳ vọng: tỷ lệ thắng 30% và tỷ số thắng/thua 1,2 vẫn là một chiến lược thua.',
    },
    example: {
      title: 'Chuỗi 61 phiên mẫu, tính hết mọi phiên tăng và giảm',
      inputs: { threshold: 0 },
      series: ZIGZAG_CLOSES,
      expected: 1.16,
      note: '30 phiên tăng trung bình 2,87% so với 30 phiên giảm trung bình 2,47%.',
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
          'tỷ số thắng/thua',
          'Trung bình mức giảm của các phiên giảm',
          'Chuỗi này không có phiên giảm nào vượt ngưỡng — hạ ngưỡng bỏ qua phiên đi ngang, hoặc kéo dài chuỗi giá.',
        ),
      );
    }
    if (gains.length === 0) {
      return fail(
        unit,
        meaningless(
          'Chuỗi này không có phiên tăng nào vượt ngưỡng nên không có vế thắng để đem so.',
          'Hạ ngưỡng bỏ qua phiên đi ngang, hoặc chọn giai đoạn có cả nhịp tăng.',
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
  TY_SO_SHARPE,
  TY_SO_SORTINO,
  TY_SO_TREYNOR,
  TY_SO_THONG_TIN,
  TY_SO_CALMAR,
  TY_SO_THANG_THUA,
];
