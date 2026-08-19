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
import type { CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless } from '../warnings';
import { mean, requireCloses, sampleStdDev, simpleReturns } from './series-utils';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/** Nguồn dùng chung của cả nhóm — chương về rủi ro và lợi suất lịch sử. */
const SOURCE_INVESTMENTS: FormulaSource = {
  label:
    'Bodie, Kane & Marcus — Investments, ấn bản 12 (McGraw-Hill), chương 5: Risk, Return, and the Historical Record',
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
  return sliderVar('sessions', 'Số phiên lấy để tính', 'phiên', 60, MIN_SESSIONS_STDDEV, 500, 1, {
    level: 'advanced',
    description:
      'Lấy bao nhiêu phiên gần nhất trong chuỗi giá. Tối thiểu 30 phiên; dưới 60 phiên thì ước lượng còn yếu vì mẫu quá mỏng.',
  });
}

/** Ô chọn độ dài cửa sổ cho hai công thức đếm — ngưỡng nhẹ hơn nhóm độ lệch chuẩn. */
function countWindowVar(description: string): VariableSpec {
  return sliderVar('sessions', 'Số phiên trong kỳ', 'phiên', 60, MIN_SESSIONS_COUNT, 500, 1, {
    description,
  });
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
    description: 'Mức dao động bình quân của lợi suất mỗi phiên quanh lợi suất trung bình.',
    latex: 's = \\sqrt{\\frac{\\sum_{t=1}^{n}(r_t - \\bar{r})^2}{n - 1}}',
    expression:
      'Độ lệch chuẩn phiên = căn bậc hai của [Tổng bình phương (Lợi suất từng phiên − Lợi suất bình quân) ÷ (Số lợi suất − 1)]',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['do lech chuan', 'bien dong', 'volatility', 'standard deviation', 'rui ro'],
    resultUnit: '%/phiên',
    variables: [stdDevWindowVar()],
    explanation: {
      meaning:
        'Thước đo cơ bản nhất của rủi ro: lợi suất mỗi phiên thường lệch khỏi mức trung bình bao nhiêu phần trăm.',
      whenToUse:
        'Khi cần một con số duy nhất để so mức dao động của hai cổ phiếu, hoặc làm đầu vào cho Sharpe và VaR.',
      howToRead:
        'Số càng lớn thì giá càng nhảy mạnh giữa các phiên. Với chuỗi lợi suất phân phối chuẩn, khoảng hai phần ba số phiên nằm trong khoảng một lần độ lệch chuẩn quanh mức trung bình.',
      commonMistakes:
        'Tính trên vài chục phiên rồi coi là mức biến động ổn định của cổ phiếu — mẫu càng mỏng, con số càng nhảy theo kỳ chọn. Một lỗi khác là đem so thẳng độ lệch chuẩn theo phiên với con số theo năm của báo cáo quỹ.',
    },
    example: {
      title: '30 phiên gần nhất của một chuỗi tăng có rung lắc nhẹ',
      inputs: { sessions: 30 },
      series: CHUOI_TANG_ZIGZAG,
      expected: 1.4159,
      note: 'Khoảng 1,4%/phiên — mức thường thấy của một cổ phiếu vốn hoá lớn trên HOSE.',
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
    description: 'Quy độ lệch chuẩn lợi suất theo phiên về mức tương đương cả năm.',
    latex: '\\sigma_{nam} = s_{phien} \\times \\sqrt{D}',
    expression:
      'Độ biến động năm = Độ lệch chuẩn lợi suất phiên × căn bậc hai của Số phiên giao dịch trong một năm',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['bien dong nam', 'annualized volatility', 'sigma', 'do lech chuan nam', 'rui ro'],
    resultUnit: '%/năm',
    variables: [
      stdDevWindowVar(),
      numberVar('tradingDays', 'Số phiên giao dịch trong một năm', 'phiên', 250, {
        min: 1,
        max: 366,
        level: 'advanced',
        description: 'Thị trường Việt Nam giao dịch khoảng 250 phiên mỗi năm.',
      }),
    ],
    explanation: {
      meaning:
        'Cùng một mức rủi ro nhưng đo bằng đơn vị năm, để so được với lãi suất, với biến động của chỉ số hay của một quỹ.',
      whenToUse:
        'Khi báo cáo mức rủi ro của danh mục, hoặc khi cần đầu vào cho công thức định giá quyền chọn và VaR theo năm.',
      howToRead:
        'Nhân với căn bậc hai của số phiên chứ không nhân thẳng số phiên: rủi ro cộng dồn theo căn thời gian, nên 1,4%/phiên thành khoảng 22%/năm chứ không phải 350%.',
      commonMistakes:
        'Nhân độ lệch chuẩn phiên với 250 thay vì với căn bậc hai của 250. Sai lầm thứ hai là dùng 365 ngày lịch trong khi chuỗi giá chỉ có ngày giao dịch.',
    },
    example: {
      title: '30 phiên gần nhất, quy về năm 250 phiên giao dịch',
      inputs: { sessions: 30, tradingDays: 250 },
      series: CHUOI_TANG_ZIGZAG,
      expected: 22.387,
      note: '1,4159%/phiên nhân căn bậc hai của 250 ra khoảng 22,4%/năm.',
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
          'Số phiên giao dịch trong một năm phải lớn hơn 0 thì mới quy độ biến động về mức cả năm được.',
          'Nhập khoảng 250 phiên — số phiên giao dịch thường thấy của một năm trên HOSE.',
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
    description: 'Chỉ đo phần dao động nằm DƯỚI một ngưỡng lợi suất, bỏ qua các phiên tăng.',
    latex: 'DD = \\sqrt{\\frac{\\sum_{r_t < B}(r_t - B)^2}{n - 1}}',
    expression:
      'Độ lệch chuẩn bán phần = căn bậc hai của [Tổng bình phương (Lợi suất − Ngưỡng) của riêng các phiên dưới ngưỡng ÷ (Số lợi suất − 1)]',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['downside deviation', 'do lech chuan ban phan', 'rui ro giam', 'sortino', 'nguong'],
    resultUnit: '%/phiên',
    variables: [
      stdDevWindowVar(),
      numberVar('threshold', 'Ngưỡng lợi suất mỗi phiên', '%', 0, {
        min: -5,
        max: 5,
        level: 'advanced',
        description:
          'Mức lợi suất coi là chấp nhận được. Để 0 nghĩa là chỉ tính các phiên giảm giá.',
      }),
    ],
    explanation: {
      meaning:
        'Phần rủi ro mà nhà đầu tư thực sự ngại: mức dao động của riêng những phiên rơi xuống dưới ngưỡng đặt ra.',
      whenToUse:
        'Khi so hai danh mục có cùng độ lệch chuẩn nhưng một bên hay rơi sâu hơn, hoặc khi cần mẫu số cho tỷ số Sortino.',
      howToRead:
        'Với ngưỡng mặc định 0% (chỉ tính phiên giảm giá), thường nhỏ hơn hoặc bằng độ lệch chuẩn đầy đủ vì đã bỏ hết phần tăng giá. Nâng ngưỡng lên cao thì số này tăng theo và có thể VƯỢT QUA độ lệch chuẩn đầy đủ — mẫu số đo khoảng cách tới ngưỡng, không phải tới lợi suất trung bình. Bằng 0 nghĩa là trong kỳ không phiên nào rơi xuống dưới ngưỡng, đó là kết quả thật chứ không phải thiếu dữ liệu.',
      commonMistakes:
        'Chia cho số phiên nằm dưới ngưỡng thay vì cho tổng số phiên quan sát — làm thế thì danh mục càng ít phiên xấu lại càng bị chấm rủi ro cao. Lỗi thứ hai là quên đặt ngưỡng theo cùng đơn vị kỳ với chuỗi lợi suất.',
    },
    example: {
      title: '30 phiên gần nhất, ngưỡng 0% mỗi phiên',
      inputs: { sessions: 30, threshold: 0 },
      series: CHUOI_TANG_ZIGZAG,
      expected: 0.6731,
      note: 'Nhỏ hơn hẳn độ lệch chuẩn đầy đủ 1,4159% vì chuỗi này tăng là chính.',
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
    description: 'Bao nhiêu đơn vị rủi ro phải chịu cho mỗi đơn vị lợi suất bình quân.',
    latex: 'CV = \\frac{s}{\\bar{r}}',
    expression: 'Hệ số biến thiên = Độ lệch chuẩn lợi suất ÷ Lợi suất bình quân',
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['he so bien thien', 'coefficient of variation', 'cv', 'rui ro tren loi suat'],
    resultUnit: 'lần',
    variables: [stdDevWindowVar()],
    explanation: {
      meaning:
        'Đưa rủi ro và lợi suất về cùng một tỷ lệ, nhờ đó so được hai cổ phiếu có mặt bằng lợi suất khác hẳn nhau.',
      whenToUse:
        'Khi chọn giữa hai cơ hội mà một bên vừa lãi cao hơn vừa dao động mạnh hơn, nên không nhìn riêng chỉ số nào mà quyết được.',
      howToRead:
        'Số càng NHỎ càng tốt: mỗi phần lợi suất kiếm được phải trả bằng ít rủi ro hơn. Đây là tỷ số thuần, không có đơn vị.',
      commonMistakes:
        'Dùng khi lợi suất bình quân âm — lúc đó tỷ số ra số âm và xếp hạng ngược hoàn toàn, nên công thức này chỉ dùng cho kỳ có lợi suất bình quân dương.',
    },
    example: {
      title: '30 phiên gần nhất của một chuỗi tăng có rung lắc nhẹ',
      inputs: { sessions: 30 },
      series: CHUOI_TANG_ZIGZAG,
      expected: 3.3382,
      note: 'Lợi suất bình quân 0,4241%/phiên, độ lệch chuẩn 1,4159%/phiên — mỗi phần lợi suất kèm hơn ba phần dao động.',
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
          'hệ số biến thiên',
          'Lợi suất bình quân mỗi phiên',
          'Chọn kỳ có giá thay đổi, hoặc dùng Độ lệch chuẩn lợi suất theo phiên để đo riêng mức dao động.',
        ),
      );
    }
    if (average < 0) {
      return fail(
        unit,
        meaningless(
          'Lợi suất bình quân trong kỳ đang âm nên hệ số biến thiên ra số âm, không dùng để xếp hạng rủi ro được.',
          'Chọn kỳ có lợi suất bình quân dương, hoặc dùng Độ lệch chuẩn lợi suất theo phiên.',
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
    description:
      'Giá đóng cửa cao nhất trong kỳ cao hơn giá đóng cửa thấp nhất bao nhiêu phần trăm.',
    latex: 'A = \\frac{P_{max} - P_{min}}{P_{min}} \\times 100',
    expression:
      'Biên độ dao động = (Giá đóng cửa cao nhất − Giá đóng cửa thấp nhất) ÷ Giá đóng cửa thấp nhất × 100',
    chartType: 'candlestick',
    level: 'basic',
    tags: ['bien do dao dong', 'dinh day', 'price range', 'cao nhat thap nhat', 'vung gia'],
    resultUnit: '%',
    variables: [
      countWindowVar('Lấy bao nhiêu phiên gần nhất để tìm đỉnh và đáy. Tối thiểu 10 phiên.'),
    ],
    explanation: {
      meaning:
        'Khoảng cách giữa đỉnh và đáy giá đóng cửa trong kỳ — bề rộng của vùng giá mà cổ phiếu đã đi qua.',
      whenToUse:
        'Khi ước lượng nhanh mức dao động của một mã trước khi đặt cắt lỗ hoặc chốt lời, và khi so vùng giá giữa các kỳ.',
      howToRead:
        'Tính theo đáy làm gốc, nên đọc là "từ đáy lên đỉnh tăng bao nhiêu phần trăm". Biên độ rộng nghĩa là vào lệnh sai vùng thì chênh lệch rất lớn.',
      commonMistakes:
        'Nhầm với mức sụt giảm sâu nhất từ đỉnh: biên độ không quan tâm đỉnh và đáy cái nào tới trước, còn drawdown thì bắt buộc đáy phải nằm SAU đỉnh.',
    },
    example: {
      title: '12 phiên gần nhất, đáy 97 và đỉnh 105',
      inputs: { sessions: 12 },
      series: CHUOI_12_PHIEN,
      expected: 8.2474,
      note: 'Chênh 8 đơn vị giá trên nền đáy 97 nên biên độ là 8,25%.',
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
    description: 'Trong kỳ, cổ phiếu đã có lần giảm liên tiếp nhiều nhất bao nhiêu phiên.',
    latex: 'L = \\max\\{k : r_{t+1} < 0, \\ldots, r_{t+k} < 0\\}',
    expression: 'Chuỗi giảm dài nhất = Số phiên giảm giá liên tiếp nhiều nhất trong kỳ',
    chartType: 'underwater',
    level: 'basic',
    tags: ['chuoi giam', 'losing streak', 'phien giam lien tiep', 'ky luat', 'tam ly'],
    resultUnit: 'phiên',
    variables: [
      countWindowVar('Lấy bao nhiêu phiên gần nhất để đếm chuỗi giảm. Tối thiểu 10 phiên.'),
    ],
    explanation: {
      meaning:
        'Đợt giảm liền mạch dài nhất trong kỳ, đếm theo số phiên có giá đóng cửa thấp hơn phiên liền trước.',
      whenToUse:
        'Khi chuẩn bị tâm lý và kế hoạch cho một chuỗi thua: biết mã này từng giảm liền năm phiên thì không hoảng ở phiên thứ ba.',
      howToRead:
        'Đơn vị là phiên, không phải phần trăm — chuỗi dài chưa chắc mất nhiều tiền nếu mỗi phiên chỉ giảm nhẹ. Kết quả 0 nghĩa là trong kỳ không phiên nào giảm.',
      commonMistakes:
        'Coi đây là thước đo mức lỗ. Muốn biết mất bao nhiêu thì xem mức sụt giảm sâu nhất từ đỉnh; chuỗi phiên giảm chỉ đo độ dai của đợt giảm.',
    },
    example: {
      title: '12 phiên gần nhất, có đoạn giảm bốn phiên liền',
      inputs: { sessions: 12 },
      series: CHUOI_12_PHIEN,
      expected: 4,
      note: 'Đoạn 104 → 103 → 101 → 99 → 98 là bốn phiên giảm liên tiếp.',
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
