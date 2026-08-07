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
  label:
    'Philippe Jorion — Value at Risk: The New Benchmark for Managing Financial Risk, ấn bản 3 (McGraw-Hill, 2006), phần phương pháp mô phỏng lịch sử',
};

/** Sách đo lường hiệu quả danh mục — phần các thước đo rủi ro sụt giảm. */
const SOURCE_BACON: FormulaSource = {
  label:
    'Carl R. Bacon — Practical Portfolio Performance Measurement and Attribution, ấn bản 2 (Wiley, 2008), phần thước đo rủi ro sụt giảm',
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
      'Chuỗi giá hiện tại không đủ lợi suất phiên để dựng phân vị.',
      'Nạp thêm phiên giá rồi tính lại.',
    );
  }
  if (threshold >= 0) {
    return meaningless(
      `Trong cửa sổ đang xét, ngay cả nhóm phiên tệ nhất ở mức tin cậy ${confidence}% vẫn không lỗ, nên không có mức lỗ để đo.`,
      'Chọn cửa sổ dài hơn hoặc chuỗi có phiên giảm, vì mẫu chỉ toàn phiên tăng thì mọi thước đo tổn thất đều rỗng nghĩa.',
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
  return sliderVar('lookback', 'Số phiên gần nhất đưa vào tính', 'phiên', 250, 30, 500, 10, {
    description:
      'Chuỗi dài hơn thì chỉ lấy phần cuối. Tối thiểu 30 phiên, tức khoảng một tháng rưỡi giao dịch — ngắn hơn thì chưa đủ một nhịp lên xuống để nói về sụt giảm.',
  });
}

/** Cửa sổ quan sát của VaR/CVaR — dày hơn vì đây là ước lượng phân vị. */
function varLookback(): VariableSpec {
  return sliderVar('lookback', 'Số phiên gần nhất đưa vào tính', 'phiên', 250, 60, 750, 10, {
    description:
      'Tối thiểu 60 phiên: dưới mức đó phân vị 5% chỉ dựa vào một hai phiên xấu, con số nhảy loạn mỗi khi thêm bớt một phiên.',
  });
}

/** Độ tin cậy 95% hay 99% — hai mức chuẩn của mảng quản trị rủi ro. */
function confidenceVar(): VariableSpec {
  return {
    key: 'confidence',
    label: 'Độ tin cậy',
    unit: '%',
    type: 'select',
    defaultValue: 95,
    level: 'basic',
    description:
      'Phân vị lấy ở mức (100% − độ tin cậy) của chuỗi lợi suất, nội suy tuyến tính giữa hai quan sát liền kề. Chọn 99% thì con số khắt khe hơn hẳn 95%.',
    options: [
      { value: 95, label: '95%' },
      { value: 99, label: '99%' },
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
    description: 'Khoảng rơi lớn nhất từ một đỉnh xuống đáy sau đó, đo trong cả cửa sổ quan sát.',
    latex: 'MDD = \\max_{t} \\frac{\\max_{s \\le t} P_s - P_t}{\\max_{s \\le t} P_s}',
    expression:
      'Sụt giảm sâu nhất = lớn nhất của (Đỉnh cao nhất tính tới phiên đó − Giá phiên đó) ÷ Đỉnh cao nhất tính tới phiên đó × 100',
    chartType: 'underwater',
    level: 'basic',
    tags: ['sut giam', 'max drawdown', 'mdd', 'rui ro', 'dinh day'],
    resultUnit: '%',
    variables: [drawdownLookback()],
    explanation: {
      meaning:
        'Nếu mua đúng đỉnh xấu nhất và bán đúng đáy sau đó thì mất bao nhiêu phần trăm — thước đo nỗi đau lớn nhất mà chuỗi giá này từng bắt người nắm giữ chịu.',
      whenToUse:
        'Khi chọn giữa hai cổ phiếu hay hai danh mục có lợi suất na ná nhau: cái nào sụt giảm sâu hơn là cái khó ngồi yên hơn.',
      howToRead:
        'Kết quả là số dương và nghĩa là MẤT: 25 nghĩa là từng rơi 25% khỏi đỉnh. Rơi 25% phải lãi lại 33% mới hoà vốn, nên con số này tăng nhanh hơn cảm giác.',
      commonMistakes:
        'Đo trên cửa sổ quá ngắn rồi kết luận cổ phiếu ít rủi ro — chưa gặp phiên xấu không có nghĩa là không có. Sụt giảm sâu nhất luôn phụ thuộc độ dài chuỗi, so hai mã thì phải so trên cùng một cửa sổ.',
    },
    example: {
      title: 'Chuỗi leo lên 120 rồi rơi về 90',
      inputs: { lookback: 250 },
      series: CHUOI_DINH_120_DAY_90,
      expected: 25,
      note: 'Đỉnh 120, đáy 90 — rơi 30 đồng trên nền 120 là 25%.',
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
    description: 'Giá phiên gần nhất đang thấp hơn đỉnh cao nhất trong cửa sổ bao nhiêu phần trăm.',
    latex: 'DD_{t} = \\frac{P_{max} - P_{t}}{P_{max}}',
    expression:
      'Sụt giảm hiện tại = (Đỉnh cao nhất trong cửa sổ − Giá phiên gần nhất) ÷ Đỉnh cao nhất trong cửa sổ × 100',
    chartType: 'underwater',
    level: 'basic',
    tags: ['sut giam hien tai', 'current drawdown', 'duoi dinh', 'underwater', 've dinh'],
    resultUnit: '%',
    variables: [drawdownLookback()],
    explanation: {
      meaning:
        'Khoảng cách còn lại để giá quay về đỉnh cũ — phần "chìm dưới mặt nước" mà người đang nắm giữ chịu ngay lúc này.',
      whenToUse:
        'Khi cân nhắc mua thêm hay cắt lỗ: biết mình đang cách đỉnh bao xa rõ ràng hơn là nhìn giá trần trụi.',
      howToRead:
        'Số dương nghĩa là đang thấp hơn đỉnh: 10 nghĩa là còn kém đỉnh 10%. Bằng 0 nghĩa là giá vừa lập đỉnh mới của cửa sổ. Muốn về lại đỉnh thì cần lãi 100 ÷ (100 − kết quả) − 1, tức đang chìm 20% phải lãi 25%.',
      commonMistakes:
        'Nhầm sang mức sụt giảm sâu nhất: chỉ số này đo đúng khoảng cách tới đỉnh HIỆN TẠI, giá hồi lên là nó giảm ngay, còn sụt giảm sâu nhất thì đã ghi vào lịch sử và không bao giờ giảm.',
    },
    example: {
      title: 'Đỉnh 120, giá phiên gần nhất 108',
      inputs: { lookback: 250 },
      series: CHUOI_DINH_120_DAY_90,
      expected: 10,
      note: 'Đã hồi từ đáy 90 lên 108 nhưng vẫn còn kém đỉnh 120 đúng 10%.',
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
          'mức sụt giảm hiện tại',
          'Đỉnh cao nhất trong cửa sổ',
          'Kiểm tra lại chuỗi giá: phải có ít nhất một phiên giá dương.',
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
    description:
      'Mức lỗ một phiên mà chỉ một tỷ lệ nhỏ số phiên trong quá khứ từng vượt qua, đọc thẳng từ phân vị chuỗi lợi suất.',
    latex: 'VaR_{\\alpha} = -Q_{1-\\alpha}(r)',
    expression:
      'VaR = − Phân vị mức (100% − Độ tin cậy) của chuỗi lợi suất phiên × 100, nội suy tuyến tính giữa hai quan sát liền kề',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['var', 'value at risk', 'gia tri chiu rui ro', 'phan vi', 'mo phong lich su'],
    resultUnit: '%',
    variables: [confidenceVar(), varLookback()],
    explanation: {
      meaning:
        'Ngưỡng lỗ của một phiên xấu: với độ tin cậy 95%, chỉ 5% số phiên trong cửa sổ quan sát lỗ nặng hơn con số này.',
      whenToUse:
        'Khi định hạn mức rủi ro cho một vị thế hoặc cả tài khoản — biết mức lỗ ngày điển hình của một phiên xấu rồi mới đặt cỡ lệnh.',
      howToRead:
        'Kết quả là SỐ DƯƠNG và nghĩa là MẤT: 2,5 nghĩa là lỗ 2,5% trong phiên tệ. Đây là chỗ hay hiểu ngược dấu — con số càng lớn thì rủi ro càng cao, chứ không phải càng tốt. VaR nói NGƯỠNG chứ không nói lỗ tối đa: 5% số phiên còn lại có thể lỗ nặng hơn nhiều, phần đó phải xem tiếp bằng CVaR.',
      commonMistakes:
        'Coi VaR là mức lỗ tối đa và bỏ qua phần đuôi phía sau nó. Hai sai lầm khác cũng phổ biến: nhân thẳng VaR ngày với số ngày để ra VaR tuần (phải nhân với căn bậc hai của số ngày nếu chấp nhận giả định lợi suất độc lập), và dùng cửa sổ toàn thị trường tăng rồi tưởng rủi ro thấp.',
    },
    example: {
      title: 'Độ tin cậy 95% trên chuỗi 61 phiên mẫu',
      inputs: { confidence: 95, lookback: 250 },
      series: CHUOI_VAR_MAU,
      expected: 1,
      note: 'Phân vị 5% của 60 lợi suất rơi giữa hai phiên −1%, nên ngưỡng lỗ là 1%.',
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
    description:
      'Mức lỗ trung bình của riêng những phiên tệ hơn ngưỡng VaR — trả lời câu "nếu ngày xấu thật sự xảy ra thì mất bao nhiêu".',
    latex: 'CVaR_{\\alpha} = -E\\left[r \\mid r \\le Q_{1-\\alpha}(r)\\right]',
    expression: 'CVaR = − Trung bình các lợi suất phiên không cao hơn ngưỡng VaR × 100',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['cvar', 'expected shortfall', 'ton that ky vong', 'duoi phan phoi', 'es'],
    resultUnit: '%',
    variables: [confidenceVar(), varLookback()],
    explanation: {
      meaning:
        'Trung bình của phần đuôi trái: gom đúng những phiên lỗ nặng hơn ngưỡng VaR rồi lấy bình quân, nên nó đo độ sâu của kịch bản xấu chứ không chỉ đo mốc bắt đầu xấu.',
      whenToUse:
        'Khi so hai danh mục có VaR ngang nhau: cái nào đuôi dày hơn thì CVaR cao hơn, và đó mới là cái gây cháy tài khoản.',
      howToRead:
        'Cùng quy ước với VaR — số dương nghĩa là mất. CVaR luôn lớn hơn hoặc bằng VaR cùng độ tin cậy; khoảng cách giữa hai con số chính là độ dày của đuôi. VaR 1% mà CVaR 4,25% nghĩa là khi phiên xấu xảy ra thật thì mức lỗ điển hình gấp hơn bốn lần ngưỡng.',
      commonMistakes:
        'Dừng lại ở VaR rồi quên phần đuôi. Sai lầm thứ hai là tính CVaR trên cửa sổ quá ngắn: ở mức 99% với 60 phiên, phần đuôi chỉ còn một quan sát nên con số phụ thuộc hoàn toàn vào đúng phiên đó.',
    },
    example: {
      title: 'Độ tin cậy 95% trên chuỗi 61 phiên mẫu',
      inputs: { confidence: 95, lookback: 250 },
      series: CHUOI_VAR_MAU,
      expected: 4.25,
      note: 'Bốn phiên tệ nhất là −10%, −5%, −1% và −1%; trung bình đúng 4,25%.',
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
