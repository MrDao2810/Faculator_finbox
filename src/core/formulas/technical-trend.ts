/**
 * Tầng DOMAIN — nhóm Phân tích kỹ thuật, nửa XU HƯỚNG & ĐỘNG LƯỢNG (nhánh 5).
 *
 * Chín công thức đọc chuỗi giá đóng cửa từ `ctx.series` (FR-12): hai đường trung bình động,
 * bộ MACD, RSI của Wilder, ba thước đo động lượng và hai thước đo vị thế của giá so với
 * đường trung bình. Nửa còn lại của nhóm (dải Bollinger, ATR, ADX, các dao động kênh giá)
 * nằm ở file khác.
 *
 * Ba nếp chung của cả file:
 *
 *   1. KHÔNG đọc `ctx.series` thô. Mọi công thức lấy chuỗi qua `requireCloses()` của
 *      `series-utils.ts` — thiếu phiên thì ra `MISSING_SERIES` chứ không tự chế chuỗi mặc
 *      định, cũng không trả 0 (FR-06).
 *   2. Chuỗi xếp phiên CŨ trước, phiên MỚI CUỐI. Mọi kết quả là giá trị chỉ báo tại phiên
 *      cuối cùng của chuỗi.
 *   3. Chu kỳ là BIẾN chứ không viết cứng, nên số phiên tối thiểu phải suy ra từ chu kỳ người
 *      dùng chọn. Mỗi biến chu kỳ đều nêu rõ yêu cầu đó trong `description`.
 *
 * Con số trong `tests[]` được tính bằng một script Node độc lập, viết lại công thức từ định
 * nghĩa gốc chứ không gọi vào chính file này — đúng luật "số kiểm lấy từ nguồn độc lập" của
 * README thư viện công thức. Chuỗi kiểm đều ngắn và theo quy luật đơn giản để đối chiếu lại được.
 */

import { fail, ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import type { Bilingual, CalcOutput } from '../types';
import { meaningless } from '../warnings';
import { lastEma, lastSma, mean, requireCloses } from './series-utils';
import { sliderVar } from './shared';

/*
 * ── Nguồn tham khảo ────────────────────────────────────────────────────────────────────
 */

const SOURCE_MURPHY: FormulaSource = {
  label: {
    vi: 'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999), chương về Moving Averages',
    en: 'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999), Moving Averages chapter',
  },
};

const SOURCE_MURPHY_OSC: FormulaSource = {
  label: {
    vi: 'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999), chương về Oscillators and Contrary Opinion',
    en: 'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999), Oscillators and Contrary Opinion chapter',
  },
};

const SOURCE_WILDER: FormulaSource = {
  label: {
    vi: 'J. Welles Wilder — New Concepts in Technical Trading Systems (Trend Research, 1978), phần Relative Strength Index',
    en: 'J. Welles Wilder — New Concepts in Technical Trading Systems (Trend Research, 1978), Relative Strength Index section',
  },
};

/*
 * ── Chuỗi giá dùng cho ví dụ và ca kiểm ────────────────────────────────────────────────
 *
 * Cố ý NGẮN và theo quy luật rõ ràng để người rà soát tính tay lại được. Đơn vị ₫/CP.
 */

/** 20 phiên đi lên theo nhịp hai bước tiến một bước lùi, biên độ tròn 100 ₫. */
const GIA_20_PHIEN: ReadonlyArray<number> = [
  25_000, 25_200, 25_400, 25_100, 25_300, 25_600, 25_800, 25_500, 25_700, 26_000, 26_200, 25_900,
  26_100, 26_400, 26_600, 26_300, 26_500, 26_800, 27_000, 26_700,
];

/** 15 phiên đầu của chuỗi trên — vừa đủ 14 lợi suất cho RSI 14 phiên. */
const GIA_15_PHIEN: ReadonlyArray<number> = GIA_20_PHIEN.slice(0, 15);

/** 15 phiên tăng đều 100 ₫: không có phiên giảm nào, RSI chạm trần 100. */
const GIA_15_PHIEN_TANG: ReadonlyArray<number> = [
  25_000, 25_100, 25_200, 25_300, 25_400, 25_500, 25_600, 25_700, 25_800, 25_900, 26_000, 26_100,
  26_200, 26_300, 26_400,
];

/** Chính chuỗi trên đảo ngược: 15 phiên giảm đều, RSI chạm đáy 0. */
const GIA_15_PHIEN_GIAM: ReadonlyArray<number> = [...GIA_15_PHIEN_TANG].reverse();

/** 15 phiên giá y hệt nhau — không tăng cũng không giảm, RSI không xác định. */
const GIA_15_PHIEN_DUNG_YEN: ReadonlyArray<number> = Array.from({ length: 15 }, () => 25_000);

/** 40 phiên: 20 phiên tăng đều 200 ₫ rồi 20 phiên giảm đều 150 ₫ — một lần đảo chiều gọn. */
const GIA_40_PHIEN: ReadonlyArray<number> = [
  24_000, 24_200, 24_400, 24_600, 24_800, 25_000, 25_200, 25_400, 25_600, 25_800, 26_000, 26_200,
  26_400, 26_600, 26_800, 27_000, 27_200, 27_400, 27_600, 27_800, 27_650, 27_500, 27_350, 27_200,
  27_050, 26_900, 26_750, 26_600, 26_450, 26_300, 26_150, 26_000, 25_850, 25_700, 25_550, 25_400,
  25_250, 25_100, 24_950, 24_800,
];

/** 8 phiên — luôn thiếu so với mọi chu kỳ mặc định, dùng cho ca MISSING_SERIES. */
const GIA_8_PHIEN: ReadonlyArray<number> = [
  25_000, 25_200, 25_400, 25_100, 25_300, 25_600, 25_800, 25_500,
];

/*
 * ── Tiện ích riêng của nhóm ────────────────────────────────────────────────────────────
 */

/** Nhãn biến dùng lại nhiều lần trong các thông điệp lỗi dưới đây. */
const NHAN_SO_PHIEN: Bilingual = { vi: 'Số phiên', en: 'Number of periods' };
const NHAN_CHU_KY_EMA_NHANH: Bilingual = { vi: 'Chu kỳ EMA nhanh', en: 'Fast EMA period' };
const NHAN_CHU_KY_EMA_CHAM: Bilingual = { vi: 'Chu kỳ EMA chậm', en: 'Slow EMA period' };
const NHAN_CHU_KY_TIN_HIEU: Bilingual = {
  vi: 'Chu kỳ đường tín hiệu',
  en: 'Signal line period',
};
const NHAN_SO_PHIEN_NHIN_LAI: Bilingual = { vi: 'Số phiên nhìn lại', en: 'Lookback periods' };
const NHAN_CHU_KY_TRUNG_BINH: Bilingual = {
  vi: 'Số phiên của đường trung bình',
  en: 'Moving average period',
};
const NHAN_CHU_KY_NGAN: Bilingual = { vi: 'Chu kỳ đường ngắn', en: 'Short period' };
const NHAN_CHU_KY_DAI: Bilingual = { vi: 'Chu kỳ đường dài', en: 'Long period' };

/**
 * Chu kỳ không phải số phiên nguyên dương.
 *
 * Thanh trượt đã chặn từ giao diện, nhưng công thức không được tin vào đó: URL chia sẻ hay
 * bộ số dán từ ngoài đều có thể mang chu kỳ 0. Chu kỳ 0 phiên thì trung bình động lấy trên
 * tập rỗng — vô nghĩa chứ không phải bằng 0.
 */
function chuKyKhongHopLe(unit: string, label: Bilingual): CalcOutput {
  return fail(
    unit,
    meaningless(
      {
        vi: `${label.vi} phải là một số phiên nguyên dương thì mới có chỉ báo để tính.`,
        en: `${label.en} must be a positive whole number of periods for the indicator to be calculated.`,
      },
      {
        vi: `Nhập ${label.vi} từ 1 phiên trở lên.`,
        en: `Enter ${label.en} of 1 period or more.`,
      },
    ),
  );
}

/** Chu kỳ nhanh không nhỏ hơn chu kỳ chậm — bộ MACD mất hết ý nghĩa. */
function chuKyNguoc(unit: string, ngan: Bilingual, dai: Bilingual): CalcOutput {
  return fail(
    unit,
    meaningless(
      {
        vi: `${ngan.vi} đang bằng hoặc dài hơn ${dai.vi}, nên hiệu hai đường không còn nói lên chiều của xu hướng.`,
        en: `${ngan.en} is currently equal to or longer than ${dai.en}, so the difference between the two lines no longer reflects the trend direction.`,
      },
      {
        vi: `Đặt ${ngan.vi} nhỏ hơn ${dai.vi}, ví dụ 12 và 26 phiên.`,
        en: `Set ${ngan.en} shorter than ${dai.en}, for example 12 and 26 periods.`,
      },
    ),
  );
}

/**
 * Chuỗi EMA tại TỪNG phiên, phần tử đầu ứng với phiên thứ `period` (mồi bằng trung bình đơn
 * của `period` phiên đầu, hệ số k = 2/(period+1) — cùng cách tính với `lastEma`).
 *
 * `series-utils` chỉ có `lastEma`, tức một con số ở phiên cuối. Đường tín hiệu MACD lại là
 * EMA của cả một CHUỖI giá trị MACD, nên phần này viết tại chỗ chứ không có sẵn để dùng lại.
 */
function emaSeries(closes: ReadonlyArray<number>, period: number): number[] {
  const k = 2 / (period + 1);
  let ema = mean(closes.slice(0, period));
  const out: number[] = [ema];

  for (let i = period; i < closes.length; i += 1) {
    const close = closes[i];
    if (close !== undefined) {
      ema = close * k + ema * (1 - k);
      out.push(ema);
    }
  }

  return out;
}

/**
 * Chuỗi giá trị MACD = EMA nhanh − EMA chậm, tính từ phiên thứ `slow` trở đi.
 *
 * Hai chuỗi EMA bắt đầu ở hai phiên khác nhau (`fast` và `slow`), nên phải dóng lại theo
 * phiên trước khi trừ — lệch một ô là cả đường MACD sai.
 */
function macdSeries(closes: ReadonlyArray<number>, fast: number, slow: number): number[] {
  const fastLine = emaSeries(closes, fast);
  const slowLine = emaSeries(closes, slow);
  const offset = slow - fast;
  const out: number[] = [];

  for (let i = 0; i < slowLine.length; i += 1) {
    const nhanh = fastLine[i + offset];
    const cham = slowLine[i];
    if (nhanh !== undefined && cham !== undefined) out.push(nhanh - cham);
  }

  return out;
}

/** Hai trung bình làm mượt kiểu Wilder — nguyên liệu duy nhất của RSI. */
interface TrungBinhWilder {
  avgGain: number;
  avgLoss: number;
}

/**
 * Trung bình tăng / giảm theo đúng cách làm mượt của Wilder (1978):
 * `period` lợi suất đầu lấy trung bình ĐƠN để khởi tạo, các phiên sau làm mượt bằng
 * `(trung bình cũ × (period − 1) + giá trị mới) ÷ period`.
 *
 * Không phải EMA hệ số 2/(n+1) — nhầm hai thứ này là chỗ RSI hay lệch so với bảng giá.
 */
function wilderAverages(closes: ReadonlyArray<number>, period: number): TrungBinhWilder {
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < closes.length; i += 1) {
    const truoc = closes[i - 1];
    const nay = closes[i];
    if (truoc === undefined || nay === undefined) continue;
    const chenh = nay - truoc;
    gains.push(chenh > 0 ? chenh : 0);
    losses.push(chenh < 0 ? -chenh : 0);
  }

  let avgGain = mean(gains.slice(0, period));
  let avgLoss = mean(losses.slice(0, period));

  for (let i = period; i < gains.length; i += 1) {
    const gain = gains[i];
    const loss = losses[i];
    if (gain === undefined || loss === undefined) continue;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  return { avgGain, avgLoss };
}

/** Giá đóng cửa của phiên gần nhất trong chuỗi đã lọc. */
function giaPhienCuoi(closes: ReadonlyArray<number>): number {
  return closes[closes.length - 1] ?? Number.NaN;
}

/*
 * ── 1. Trung bình động đơn giản (SMA) ──────────────────────────────────────────────────
 */

export const SMA_N_PHIEN: FormulaModule = {
  spec: {
    id: 'sma-n-phien',
    categoryId: 'technical',
    name: { vi: 'Trung bình động đơn giản (SMA)', en: 'Simple moving average' },
    description: {
      vi: 'Giá đóng cửa bình quân của N phiên gần nhất — đường xu hướng cơ bản nhất.',
      en: 'The average closing price over the most recent N periods — the most basic trend line.',
    },
    latex: 'SMA_{n} = \\frac{1}{n}\\sum_{i=0}^{n-1} P_{t-i}',
    expression: {
      vi: 'SMA = Tổng giá đóng cửa của N phiên gần nhất ÷ N',
      en: 'SMA = Sum of closing prices over the most recent N periods ÷ N',
    },
    chartType: 'candlestick',
    level: 'basic',
    tags: ['sma', 'trung binh dong', 'moving average', 'ma20', 'ma50', 'duong xu huong'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', NHAN_SO_PHIEN, 'phiên', 20, 2, 200, 1, {
        description: {
          vi: 'Chuỗi giá phải có ít nhất đúng bằng số phiên này. Mốc phổ thông: 20 phiên cho xu hướng ngắn hạn, 50 và 200 phiên cho trung và dài hạn.',
          en: 'The price series must have at least this many periods. Common benchmarks: 20 periods for a short-term trend, 50 and 200 periods for medium- and long-term.',
        },
      }),
    ],
    /*
     * Vẽ kèm đường giá đóng cửa trên trục thời gian: cả `meaning` lẫn `howToRead` ở dưới đều nói
     * về tương quan giá–SMA (giá nằm trên/dưới đường, giá cắt đường), nên một mình đường SMA là
     * hình không cho thấy điều chính nó đang dạy. `periodKey` để legend ghi 'SMA 20 phiên' theo
     * đúng số phiên đang nhập.
     */
    priceOverlay: {
      shortName: { vi: 'SMA', en: 'SMA' },
      periodKey: 'period',
    },
    explanation: {
      meaning: {
        vi: 'Mức giá bình quân mà thị trường đã trả trong N phiên vừa qua, làm phẳng các phiên nhiễu để lộ ra chiều đi của giá.',
        en: 'The average price the market has paid over the last N periods, smoothing out noisy sessions to reveal the direction of price.',
      },
      whenToUse: {
        vi: 'Khi cần một mốc tham chiếu đơn giản cho xu hướng, hoặc làm đường hỗ trợ / kháng cự động cho điểm mua bán.',
        en: 'When you need a simple reference point for the trend, or a dynamic support/resistance line for entry and exit points.',
      },
      howToRead: {
        vi: 'Giá nằm trên đường và đường đang dốc lên là xu hướng tăng; giá cắt xuống dưới đường là tín hiệu suy yếu. Chu kỳ càng dài đường càng mượt nhưng càng chậm.',
        en: 'Price sitting above the line while the line slopes upward signals an uptrend; price crossing below the line signals weakening. The longer the period, the smoother the line but the slower it reacts.',
      },
      commonMistakes: {
        vi: 'Dùng chu kỳ dài cho giao dịch ngắn hạn rồi trách đường báo trễ. SMA luôn nhìn về quá khứ — nó xác nhận xu hướng chứ không dự báo.',
        en: 'Using a long period for short-term trading and then blaming the line for lagging. SMA always looks backward — it confirms a trend rather than predicting one.',
      },
    },
    example: {
      title: {
        vi: 'SMA 20 phiên trên chuỗi 20 phiên gần nhất',
        en: '20-period SMA over the most recent 20 periods',
      },
      inputs: { period: 20 },
      series: GIA_20_PHIEN,
      expected: 25_955,
      note: {
        vi: 'Giá phiên cuối 26.700 ₫ đang cao hơn đường bình quân, tức xu hướng ngắn hạn còn nghiêng lên.',
        en: 'The last closing price of 26,700 VND is above the moving average, meaning the short-term trend still leans upward.',
      },
    },
    tests: [
      {
        name: 'SMA 5 phiên bằng bình quân 5 giá cuối',
        inputs: { period: 5 },
        series: GIA_20_PHIEN,
        expected: 26_660,
      },
      {
        name: 'SMA 20 phiên bằng bình quân cả chuỗi',
        inputs: { period: 20 },
        series: GIA_20_PHIEN,
        expected: 25_955,
      },
      {
        name: 'chu kỳ 0 phiên thì không có trung bình nào',
        inputs: { period: 0 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ cho SMA 20',
        inputs: { period: 20 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const period = Math.round(v('period'));
    if (period < 1) return chuKyKhongHopLe('₫', NHAN_SO_PHIEN);

    const closes = requireCloses(ctx, period);
    if (!Array.isArray(closes)) return fail('₫', closes);

    return ok(lastSma(closes, period), '₫');
  },
};

/*
 * ── 2. Trung bình động luỹ thừa (EMA) ──────────────────────────────────────────────────
 */

export const EMA_N_PHIEN: FormulaModule = {
  spec: {
    id: 'ema-n-phien',
    categoryId: 'technical',
    name: { vi: 'Trung bình động luỹ thừa (EMA)', en: 'Exponential moving average' },
    description: {
      vi: 'Trung bình động đặt trọng số nặng hơn cho các phiên gần đây nên bám giá nhanh hơn SMA.',
      en: 'A moving average that weights recent periods more heavily, so it tracks price faster than SMA.',
    },
    latex: 'EMA_t = P_t \\cdot k + EMA_{t-1} \\cdot (1 - k), \\quad k = \\frac{2}{n+1}',
    expression: {
      vi: 'EMA phiên này = Giá đóng cửa × Hệ số k + EMA phiên trước × (1 − k), với k = 2 ÷ (Số phiên + 1)',
      en: "This period's EMA = Closing price × Factor k + Previous period's EMA × (1 − k), where k = 2 ÷ (Number of periods + 1)",
    },
    chartType: 'candlestick',
    level: 'basic',
    tags: ['ema', 'trung binh luy thua', 'exponential moving average', 'ema12', 'ema26'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', NHAN_SO_PHIEN, 'phiên', 12, 2, 200, 1, {
        description: {
          vi: 'Chuỗi giá cần ít nhất đúng bằng số phiên này để mồi đường bằng trung bình đơn. Nạp được gấp ba lần chu kỳ thì phần mồi gần như hết ảnh hưởng.',
          en: 'The price series needs at least this many periods to seed the line with a simple average. Once about three times the period has been fed in, the seed effect has nearly worn off.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Cũng là giá bình quân nhưng phiên càng mới càng nặng ký, nên đường phản ứng sớm hơn khi giá đổi chiều.',
        en: 'Also an average price, but the more recent a period is, the more weight it carries, so the line reacts sooner when price changes direction.',
      },
      whenToUse: {
        vi: 'Khi giao dịch theo xu hướng ngắn hạn và độ trễ của SMA là quá lớn; EMA 12 và 26 phiên còn là nguyên liệu của MACD.',
        en: "When trading short-term trends and SMA's lag is too large; the 12- and 26-period EMAs are also the building blocks of MACD.",
      },
      howToRead: {
        vi: 'Đọc giống SMA nhưng nhạy hơn: EMA bám sát giá hơn, đổi lại báo nhiễu nhiều hơn ở thị trường đi ngang.',
        en: 'Read the same way as SMA but more sensitive: EMA tracks price more closely, at the cost of noisier signals in a sideways market.',
      },
      commonMistakes: {
        vi: 'Đọc EMA tính trên chuỗi quá ngắn: khi chuỗi vừa đúng bằng chu kỳ, EMA rơi về đúng SMA vì mới chỉ có phần mồi, chưa có phiên nào được làm mượt.',
        en: 'Reading an EMA computed on a series that is too short: when the series length exactly equals the period, the EMA falls back to the SMA because it only has the seed value — no period has been smoothed yet.',
      },
    },
    example: {
      title: {
        vi: 'EMA 12 phiên trên chuỗi 40 phiên có một lần đảo chiều',
        en: '12-period EMA over a 40-period series with one reversal',
      },
      inputs: { period: 12 },
      series: GIA_40_PHIEN,
      expected: 25_556.86,
      note: {
        vi: 'Giá phiên cuối 24.800 ₫ đã nằm dưới EMA — đường vẫn còn nợ một quãng của nhịp tăng trước đó.',
        en: 'The last closing price of 24,800 VND is now below the EMA — the line still owes a portion of the earlier upswing.',
      },
    },
    tests: [
      {
        name: 'EMA 5 phiên trên chuỗi 20 phiên',
        inputs: { period: 5 },
        series: GIA_20_PHIEN,
        expected: 26_678.5705,
      },
      {
        name: 'EMA 12 phiên trên chuỗi 20 phiên',
        inputs: { period: 12 },
        series: GIA_20_PHIEN,
        expected: 26_347.5928,
      },
      {
        name: 'chuỗi vừa đúng bằng chu kỳ thì EMA trùng SMA vì mới chỉ có phần mồi',
        inputs: { period: 20 },
        series: GIA_20_PHIEN,
        expected: 25_955,
      },
      {
        name: 'chu kỳ 0 phiên thì không có đường nào',
        inputs: { period: 0 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ mồi cho EMA 12',
        inputs: { period: 12 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const period = Math.round(v('period'));
    if (period < 1) return chuKyKhongHopLe('₫', NHAN_SO_PHIEN);

    const closes = requireCloses(ctx, period);
    if (!Array.isArray(closes)) return fail('₫', closes);

    return ok(lastEma(closes, period), '₫');
  },
};

/*
 * ── 3. Đường MACD ──────────────────────────────────────────────────────────────────────
 */

export const MACD_DUONG_CHINH: FormulaModule = {
  spec: {
    id: 'macd-duong-chinh',
    categoryId: 'technical',
    name: { vi: 'Đường MACD', en: 'MACD line' },
    description: {
      vi: 'Hiệu giữa EMA nhanh và EMA chậm — đo xem xu hướng ngắn hạn đang kéo giá đi đâu.',
      en: 'The difference between the fast EMA and the slow EMA — measures where the short-term trend is pulling price.',
    },
    latex: 'MACD = EMA_{12} - EMA_{26}',
    expression: {
      vi: 'MACD = EMA chu kỳ nhanh − EMA chu kỳ chậm',
      en: 'MACD = Fast-period EMA − Slow-period EMA',
    },
    chartType: 'candlestick',
    level: 'advanced',
    tags: ['macd', 'ema12 ema26', 'phan ky hoi tu', 'dong luong', 'xu huong'],
    resultUnit: '₫',
    variables: [
      sliderVar('fastPeriod', NHAN_CHU_KY_EMA_NHANH, 'phiên', 12, 2, 100, 1, {
        description: {
          vi: 'Đường bám giá. Bộ tham số kinh điển của Appel là 12 phiên.',
          en: "The price-tracking line. Appel's classic parameter set uses 12 periods.",
        },
      }),
      sliderVar('slowPeriod', NHAN_CHU_KY_EMA_CHAM, 'phiên', 26, 3, 200, 1, {
        description: {
          vi: 'Đường nền, phải dài hơn chu kỳ nhanh. Chuỗi giá cần ít nhất đúng bằng số phiên này — 26 phiên với bộ mặc định.',
          en: 'The baseline, must be longer than the fast period. The price series needs at least this many periods — 26 periods with the default set.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Khoảng cách giữa hai đường trung bình: dương nghĩa là đường nhanh đang ở trên đường chậm, tức đà tăng đang thắng thế.',
        en: 'The gap between the two moving averages: a positive value means the fast line is above the slow line, i.e. upward momentum is dominant.',
      },
      whenToUse: {
        vi: 'Khi cần một thước đo xu hướng đã lọc bớt nhiễu, hoặc khi tìm điểm đảo chiều bằng lúc MACD cắt qua mốc 0.',
        en: 'When you need a trend measure with some noise filtered out, or when looking for a reversal point where MACD crosses the zero line.',
      },
      howToRead: {
        vi: 'Cắt lên trên 0 là đà chuyển sang tăng, cắt xuống dưới 0 là chuyển sang giảm. Giá trị tính bằng ₫ nên chỉ so được với chính cổ phiếu đó, không so ngang giữa hai mã khác thị giá.',
        en: 'Crossing above 0 signals momentum turning upward, crossing below 0 signals it turning downward. The value is denominated in VND, so it can only be compared within the same stock, not across stocks with different prices.',
      },
      commonMistakes: {
        vi: 'So MACD của cổ phiếu 25.000 ₫ với cổ phiếu 200.000 ₫ rồi kết luận mã nào mạnh hơn — đơn vị là đồng nên độ lớn phụ thuộc thị giá.',
        en: 'Comparing the MACD of a 25,000 VND stock with a 200,000 VND stock and concluding which one is stronger — since the unit is VND, its magnitude depends on the share price.',
      },
    },
    example: {
      title: {
        vi: 'MACD 12/26 sau một nhịp đảo chiều 40 phiên',
        en: '12/26 MACD after a 40-period reversal',
      },
      inputs: { fastPeriod: 12, slowPeriod: 26 },
      series: GIA_40_PHIEN,
      expected: -247.35,
      note: {
        vi: 'MACD đã xuống dưới 0: đường nhanh cắt xuống dưới đường chậm sau khi giá quay đầu ở phiên 20.',
        en: 'MACD has dropped below 0: the fast line crossed below the slow line after price turned around at period 20.',
      },
    },
    tests: [
      {
        name: 'bộ 12/26 kinh điển trên chuỗi 40 phiên đảo chiều',
        inputs: { fastPeriod: 12, slowPeriod: 26 },
        series: GIA_40_PHIEN,
        expected: -247.3478,
      },
      {
        name: 'bộ 3/6 rút gọn trên chuỗi 20 phiên còn dương',
        inputs: { fastPeriod: 3, slowPeriod: 6 },
        series: GIA_20_PHIEN,
        expected: 119.6227,
      },
      {
        name: 'chu kỳ nhanh dài hơn chu kỳ chậm là đặt ngược',
        inputs: { fastPeriod: 26, slowPeriod: 12 },
        series: GIA_40_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 20 phiên không đủ cho EMA chậm 26 phiên',
        inputs: { fastPeriod: 12, slowPeriod: 26 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY_OSC],
  },
  calc: (v, ctx) => {
    const fast = Math.round(v('fastPeriod'));
    const slow = Math.round(v('slowPeriod'));

    if (fast < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_EMA_NHANH);
    if (slow < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_EMA_CHAM);
    if (fast >= slow) return chuKyNguoc('₫', NHAN_CHU_KY_EMA_NHANH, NHAN_CHU_KY_EMA_CHAM);

    const closes = requireCloses(ctx, slow);
    if (!Array.isArray(closes)) return fail('₫', closes);

    const emaFast = lastEma(closes, fast);
    const emaSlow = lastEma(closes, slow);

    return ok(emaFast - emaSlow, '₫', { extras: { emaFast, emaSlow } });
  },
};

/*
 * ── 4. Đường tín hiệu MACD ─────────────────────────────────────────────────────────────
 */

export const MACD_DUONG_TIN_HIEU: FormulaModule = {
  spec: {
    id: 'macd-duong-tin-hieu',
    categoryId: 'technical',
    name: { vi: 'Đường tín hiệu MACD', en: 'MACD signal line' },
    description: {
      vi: 'EMA 9 phiên của chính đường MACD — mốc so sánh để bắt điểm cắt mua bán.',
      en: 'A 9-period EMA of the MACD line itself — the reference used to catch buy/sell crossover points.',
    },
    latex: 'Signal = EMA_{9}(MACD)',
    expression: {
      vi: 'Đường tín hiệu = EMA chu kỳ tín hiệu tính trên chuỗi giá trị MACD',
      en: 'Signal line = EMA of the signal period computed on the series of MACD values',
    },
    chartType: 'candlestick',
    level: 'advanced',
    tags: ['macd signal', 'duong tin hieu', 'ema9', 'giao cat macd', 'histogram'],
    resultUnit: '₫',
    variables: [
      sliderVar('fastPeriod', NHAN_CHU_KY_EMA_NHANH, 'phiên', 12, 2, 100, 1, {
        description: {
          vi: 'Chu kỳ đường nhanh của MACD, mặc định 12 phiên.',
          en: 'The fast-line period of the MACD, defaulting to 12 periods.',
        },
      }),
      sliderVar('slowPeriod', NHAN_CHU_KY_EMA_CHAM, 'phiên', 26, 3, 200, 1, {
        description: {
          vi: 'Chu kỳ đường chậm của MACD, phải dài hơn chu kỳ nhanh.',
          en: 'The slow-line period of the MACD, must be longer than the fast period.',
        },
      }),
      sliderVar('signalPeriod', NHAN_CHU_KY_TIN_HIEU, 'phiên', 9, 2, 100, 1, {
        description: {
          vi: 'EMA lấy trên chính chuỗi MACD. Chuỗi giá cần ít nhất Chu kỳ chậm + Chu kỳ tín hiệu − 1 phiên, tức 34 phiên với bộ mặc định 12/26/9.',
          en: 'The EMA taken on the MACD series itself. The price series needs at least Slow period + Signal period − 1 periods, i.e. 34 periods with the default 12/26/9 set.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Bản làm mượt của đường MACD. Vì làm mượt nên nó luôn đi sau, và chỗ hai đường cắt nhau chính là lúc đà vừa đổi nhịp.',
        en: 'A smoothed version of the MACD line. Because it is smoothed it always lags, and the point where the two lines cross is exactly when momentum has just shifted.',
      },
      whenToUse: {
        vi: 'Khi cần một mốc cụ thể để đọc đà giá thay vì chỉ nhìn xu hướng: theo quy ước MACD của Gerald Appel, MACD cắt lên trên đường tín hiệu là đà chuyển sang tăng, cắt xuống là đà chuyển sang giảm.',
        en: 'When you need a concrete marker for reading momentum rather than just the trend: by Gerald Appel’s MACD convention, the MACD crossing above the signal line means momentum has turned upward, crossing below means it has turned downward.',
      },
      howToRead: {
        vi: 'Khoảng cách MACD trừ đường tín hiệu chính là cột histogram quen thuộc, trả kèm trong phần kết quả phụ. Histogram âm và đang doãng ra nghĩa là đà giảm còn mạnh lên.',
        en: 'The gap MACD minus the signal line is the familiar histogram bar, returned alongside in the extra results. A histogram that is negative and widening means downward momentum is still strengthening.',
      },
      commonMistakes: {
        vi: 'Ngạc nhiên khi đường tín hiệu còn dương trong lúc MACD đã âm — đó đúng là bản chất của một đường trung bình chạy sau, không phải lỗi tính toán.',
        en: 'Being surprised that the signal line is still positive while MACD has already turned negative — that is exactly the nature of a lagging average, not a calculation error.',
      },
    },
    example: {
      title: {
        vi: 'Đường tín hiệu 12/26/9 sau nhịp đảo chiều 40 phiên',
        en: '12/26/9 signal line after a 40-period reversal',
      },
      inputs: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
      series: GIA_40_PHIEN,
      expected: 25.07,
      note: {
        vi: 'MACD đã xuống −247 ₫ nhưng đường tín hiệu còn dương vì vẫn mang theo phần đà tăng trước đó — histogram âm sâu, tức tín hiệu bán đã hình thành.',
        en: 'MACD has dropped to −247 VND but the signal line is still positive because it is still carrying part of the earlier upward momentum — the histogram is deeply negative, meaning a sell signal has formed.',
      },
    },
    tests: [
      {
        name: 'bộ 12/26/9 trên chuỗi 40 phiên',
        inputs: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        series: GIA_40_PHIEN,
        expected: 25.0651,
      },
      {
        name: 'bộ 3/6/3 rút gọn trên chuỗi 20 phiên',
        inputs: { fastPeriod: 3, slowPeriod: 6, signalPeriod: 3 },
        series: GIA_20_PHIEN,
        expected: 146.4859,
      },
      {
        name: 'chu kỳ nhanh dài hơn chu kỳ chậm là đặt ngược',
        inputs: { fastPeriod: 26, slowPeriod: 12, signalPeriod: 9 },
        series: GIA_40_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 20 phiên chưa đủ 34 phiên cho bộ mặc định',
        inputs: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY_OSC],
  },
  calc: (v, ctx) => {
    const fast = Math.round(v('fastPeriod'));
    const slow = Math.round(v('slowPeriod'));
    const signal = Math.round(v('signalPeriod'));

    if (fast < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_EMA_NHANH);
    if (slow < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_EMA_CHAM);
    if (signal < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_TIN_HIEU);
    if (fast >= slow) return chuKyNguoc('₫', NHAN_CHU_KY_EMA_NHANH, NHAN_CHU_KY_EMA_CHAM);

    // Cần đủ phiên để có `signal` giá trị MACD: chuỗi MACD chỉ bắt đầu từ phiên thứ `slow`.
    const closes = requireCloses(ctx, slow + signal - 1);
    if (!Array.isArray(closes)) return fail('₫', closes);

    const macdLine = macdSeries(closes, fast, slow);
    const signalValue = lastEma(macdLine, signal);
    const macdValue = macdLine[macdLine.length - 1] ?? Number.NaN;

    return ok(signalValue, '₫', {
      extras: { macd: macdValue, histogram: macdValue - signalValue },
    });
  },
};

/*
 * ── 5. RSI 14 phiên theo Wilder ────────────────────────────────────────────────────────
 */

export const RSI_WILDER: FormulaModule = {
  spec: {
    id: 'rsi-wilder',
    categoryId: 'technical',
    name: { vi: 'RSI 14 phiên (Wilder)', en: 'Relative strength index (Wilder)' },
    description: {
      vi: 'Chỉ số sức mạnh tương đối 0–100, đo tỷ lệ giữa đà tăng và đà giảm gần đây.',
      en: 'A 0–100 relative strength index that measures the ratio between recent upward and downward momentum.',
    },
    latex:
      'RSI = 100 - \\frac{100}{1 + RS}, \\quad RS = \\frac{\\overline{Gain}}{\\overline{Loss}}',
    expression: {
      vi: 'RSI = 100 − 100 ÷ (1 + Trung bình tăng ÷ Trung bình giảm), hai trung bình làm mượt theo Wilder',
      en: 'RSI = 100 − 100 ÷ (1 + Average gain ÷ Average loss), both averages smoothed the Wilder way',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['rsi', 'suc manh tuong doi', 'wilder', 'qua mua qua ban', 'dao dong'],
    resultUnit: 'điểm',
    /*
     * Hai ngưỡng của Wilder, đúng hai con số mà `explanation.howToRead` ngay dưới đang nói bằng
     * chữ. Trước khi có khai báo này, đoạn ấy nói "trên 70 là quá mua, dưới 30 là quá bán" ngay
     * dưới một biểu đồ không vẽ 70 và 30 — người đọc phải tự ước lượng hai độ cao đó trên trục.
     *
     * Không thêm mốc 50 ("cân bằng") dù câu chữ có nhắc: ba đường kẻ ngang trên một hình 320×200
     * là hình trông như giấy kẻ ô, và 50 không phải ranh giới ai dùng để ra quyết định — nó chỉ là
     * điểm giữa thang.
     */
    referenceLines: [
      { value: 30, label: { vi: 'Quá bán', en: 'Oversold' } },
      { value: 70, label: { vi: 'Quá mua', en: 'Overbought' } },
    ],
    variables: [
      sliderVar('period', NHAN_SO_PHIEN, 'phiên', 14, 2, 100, 1, {
        description: {
          vi: 'Wilder dùng 14 phiên. Chuỗi giá phải có ít nhất số phiên này cộng thêm 1 để đủ lợi suất — 15 giá cho RSI 14.',
          en: 'Wilder used 14 periods. The price series must have at least this many periods plus 1 to have enough returns — 15 prices for a 14-period RSI.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Trong N phiên gần nhất, phần tăng chiếm bao nhiêu so với tổng biến động — quy về thang 0 tới 100.',
        en: 'Over the most recent N periods, how much of the total movement was upward — rescaled to a 0-to-100 range.',
      },
      whenToUse: {
        vi: 'Khi muốn biết một nhịp tăng hay giảm đã đi quá đà chưa, hoặc khi tìm phân kỳ giữa giá và động lượng.',
        en: 'When you want to know whether an up- or down-move has gone too far, or when looking for divergence between price and momentum.',
      },
      howToRead: {
        vi: 'Trên 70 là vùng quá mua, dưới 30 là vùng quá bán, quanh 50 là cân bằng. Không phiên nào giảm thì RSI chạm đúng trần 100, đó là giá trị thật chứ không phải lỗi.',
        en: 'Above 70 is the overbought zone, below 30 is the oversold zone, and around 50 is balance. If no period declined, RSI hits the ceiling of exactly 100 — that is a genuine value, not an error.',
      },
      commonMistakes: {
        vi: 'Bán ngay khi RSI vượt 70: trong một xu hướng tăng mạnh, RSI có thể nằm lì trên 70 hàng chục phiên. Sai thứ hai là làm mượt bằng EMA hệ số 2/(n+1) thay vì cách làm mượt của Wilder, khiến số lệch hẳn so với bảng giá.',
        en: "Selling as soon as RSI crosses above 70: in a strong uptrend, RSI can stay above 70 for dozens of periods. The second mistake is smoothing with the EMA factor 2/(n+1) instead of Wilder's smoothing method, which makes the figure diverge noticeably from the price chart.",
      },
    },
    example: {
      title: {
        vi: 'RSI 14 phiên trên chuỗi 20 phiên đi lên có nhịp chỉnh',
        en: '14-period RSI over a 20-period rising series with a pullback',
      },
      inputs: { period: 14 },
      series: GIA_20_PHIEN,
      expected: 67.07,
      note: {
        vi: 'Ở mức 67 điểm, đà tăng còn chiếm ưu thế nhưng đã tiến sát vùng quá mua 70.',
        en: 'At 67 points, upward momentum still dominates but has moved close to the overbought zone of 70.',
      },
    },
    tests: [
      {
        name: 'chuỗi 15 giá cho đúng 14 lợi suất, chưa có bước làm mượt nào',
        inputs: { period: 14 },
        series: GIA_15_PHIEN,
        expected: 73.5294,
      },
      {
        name: 'chuỗi 20 phiên có 5 bước làm mượt Wilder',
        inputs: { period: 14 },
        series: GIA_20_PHIEN,
        expected: 67.0666,
      },
      {
        name: 'mọi phiên đều tăng thì RSI chạm trần 100, không phải chia cho 0',
        inputs: { period: 14 },
        series: GIA_15_PHIEN_TANG,
        expected: 100,
      },
      {
        name: 'mọi phiên đều giảm thì RSI chạm đáy 0',
        inputs: { period: 14 },
        series: GIA_15_PHIEN_GIAM,
        expected: 0,
      },
      {
        name: 'giá đứng yên suốt kỳ thì không có sức mạnh nào để đo',
        inputs: { period: 14 },
        series: GIA_15_PHIEN_DUNG_YEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ 15 giá cho RSI 14',
        inputs: { period: 14 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_WILDER, SOURCE_MURPHY_OSC],
  },
  calc: (v, ctx) => {
    const unit = 'điểm';
    const period = Math.round(v('period'));
    if (period < 1) return chuKyKhongHopLe(unit, NHAN_SO_PHIEN);

    // N phiên RSI cần N lợi suất, tức N+1 giá đóng cửa.
    const closes = requireCloses(ctx, period + 1);
    if (!Array.isArray(closes)) return fail(unit, closes);

    const { avgGain, avgLoss } = wilderAverages(closes, period);

    if (avgGain === 0 && avgLoss === 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Giá đóng cửa không đổi suốt cả kỳ nên không có đà tăng hay đà giảm nào để so sánh.',
            en: 'The closing price stayed unchanged throughout the period, so there is no upward or downward momentum to compare.',
          },
          {
            vi: 'Chọn chuỗi giá có biến động, hoặc kéo dài số phiên để bao được nhịp giá gần nhất.',
            en: 'Choose a price series with some movement, or extend the number of periods to capture the most recent price swing.',
          },
        ),
      );
    }

    // Không phiên nào giảm: RS tiến ra vô cực, RSI đúng bằng trần 100 — đây là giá trị hợp lệ
    // chứ không phải phép chia cho 0, nên trả ok() chứ không fail().
    if (avgLoss === 0) return ok(100, unit, { extras: { avgGain, avgLoss } });

    const rs = avgGain / avgLoss;
    return ok(100 - 100 / (1 + rs), unit, { extras: { avgGain, avgLoss, rs } });
  },
};

/*
 * ── 6. Tốc độ thay đổi giá (ROC) ───────────────────────────────────────────────────────
 */

export const ROC_TOC_DO_THAY_DOI: FormulaModule = {
  spec: {
    id: 'roc-toc-do-thay-doi',
    categoryId: 'technical',
    name: { vi: 'Tốc độ thay đổi giá (ROC)', en: 'Rate of change' },
    description: {
      vi: 'Giá hôm nay cao hơn hay thấp hơn giá của N phiên trước bao nhiêu phần trăm.',
      en: "How many percent today's price is above or below the price from N periods ago.",
    },
    latex: 'ROC = \\left(\\frac{P_t}{P_{t-n}} - 1\\right) \\times 100',
    expression: {
      vi: 'ROC = (Giá phiên cuối ÷ Giá của N phiên trước − 1) × 100',
      en: 'ROC = (Last closing price ÷ Price from N periods ago − 1) × 100',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roc', 'toc do thay doi', 'rate of change', 'dong luong', 'phan tram'],
    resultUnit: '%',
    variables: [
      sliderVar('period', NHAN_SO_PHIEN_NHIN_LAI, 'phiên', 12, 1, 250, 1, {
        description: {
          vi: 'So giá phiên cuối với giá của bấy nhiêu phiên trước. Chuỗi giá cần ít nhất số phiên này cộng 1.',
          en: 'Compares the last closing price with the price that many periods earlier. The price series needs at least this many periods plus 1.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Động lượng đo bằng phần trăm: giá đã chạy nhanh tới mức nào trong cửa sổ N phiên vừa qua.',
        en: 'Momentum measured in percent: how fast price has moved within the last N-period window.',
      },
      whenToUse: {
        vi: 'Khi cần so sức bật của nhiều cổ phiếu khác thị giá với nhau, hoặc xếp hạng sức mạnh tương đối trong danh mục.',
        en: 'When you need to compare the bounce strength of several stocks with different prices, or rank relative strength within a portfolio.',
      },
      howToRead: {
        vi: 'Dương là giá cao hơn N phiên trước, âm là thấp hơn. Vì tính bằng phần trăm nên so ngang giữa các mã được, khác với động lượng tính bằng đồng.',
        en: 'Positive means price is higher than N periods ago, negative means lower. Because it is expressed as a percentage it can be compared across different stocks, unlike momentum measured in VND.',
      },
      commonMistakes: {
        vi: 'Chọn cửa sổ N trùng đúng một nhịp sóng của cổ phiếu, khiến ROC luôn quanh 0 dù giá vẫn đang chạy — đổi vài chu kỳ để đối chiếu trước khi kết luận.',
        en: "Choosing a window N that happens to match one full wave of the stock's cycle, which keeps ROC hovering around 0 even though price is still moving — try a few different periods before drawing a conclusion.",
      },
    },
    example: {
      title: {
        vi: 'ROC 12 phiên trên chuỗi 20 phiên',
        en: '12-period ROC over a 20-period series',
      },
      inputs: { period: 12 },
      series: GIA_20_PHIEN,
      expected: 4.71,
      note: {
        vi: 'Giá 26.700 ₫ so với 25.500 ₫ của 12 phiên trước — nhanh hơn hẳn mặt bằng đi ngang.',
        en: 'Price of 26,700 VND compared with 25,500 VND 12 periods ago — noticeably faster than a sideways baseline.',
      },
    },
    tests: [
      {
        name: 'ROC 12 phiên trên chuỗi đi lên',
        inputs: { period: 12 },
        series: GIA_20_PHIEN,
        expected: 4.7059,
      },
      {
        name: 'cửa sổ ngắn 5 phiên bắt đúng nhịp chỉnh nên gần 0',
        inputs: { period: 5 },
        series: GIA_20_PHIEN,
        expected: 0.3759,
      },
      {
        name: 'chuỗi đã đảo chiều thì ROC âm',
        inputs: { period: 10 },
        series: GIA_40_PHIEN,
        expected: -5.7034,
      },
      {
        name: 'chu kỳ 0 phiên thì không có mốc để so',
        inputs: { period: 0 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ nhìn lại 12 phiên',
        inputs: { period: 12 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY_OSC],
  },
  calc: (v, ctx) => {
    const period = Math.round(v('period'));
    if (period < 1) return chuKyKhongHopLe('%', NHAN_SO_PHIEN_NHIN_LAI);

    const closes = requireCloses(ctx, period + 1);
    if (!Array.isArray(closes)) return fail('%', closes);

    const giaNay = giaPhienCuoi(closes);
    // `usableCloses` đã bỏ mọi giá không dương, nên mẫu số ở đây luôn lớn hơn 0.
    const giaTruoc = closes[closes.length - 1 - period] ?? Number.NaN;

    return ok((giaNay / giaTruoc - 1) * 100, '%', { extras: { giaNay, giaTruoc } });
  },
};

/*
 * ── 7. Động lượng (Momentum) ───────────────────────────────────────────────────────────
 */

export const DONG_LUONG_MOMENTUM: FormulaModule = {
  spec: {
    id: 'dong-luong-momentum',
    categoryId: 'technical',
    name: { vi: 'Động lượng (Momentum)', en: 'Momentum' },
    description: {
      vi: 'Chênh lệch tuyệt đối giữa giá phiên cuối và giá của N phiên trước, tính bằng đồng.',
      en: 'The absolute difference between the last closing price and the price from N periods ago, denominated in VND.',
    },
    latex: 'M = P_t - P_{t-n}',
    expression: {
      vi: 'Động lượng = Giá phiên cuối − Giá của N phiên trước',
      en: 'Momentum = Last closing price − Price from N periods ago',
    },
    chartType: 'candlestick',
    level: 'basic',
    tags: ['momentum', 'dong luong', 'chenh lech gia', 'da tang', 'da giam'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', NHAN_SO_PHIEN_NHIN_LAI, 'phiên', 10, 1, 250, 1, {
        description: {
          vi: 'Khoảng cách tới phiên đem ra so sánh. Chuỗi giá cần ít nhất số phiên này cộng 1.',
          en: 'The distance to the period being compared against. The price series needs at least this many periods plus 1.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Giá đã đi được bao nhiêu đồng trong N phiên — bản gốc, thô nhất của mọi chỉ báo động lượng.',
        en: 'How many VND price has moved over N periods — the original, rawest form of every momentum indicator.',
      },
      whenToUse: {
        vi: 'Khi theo dõi một mã quen và muốn cảm nhận biên độ bằng chính đơn vị tiền, thay vì quy ra phần trăm.',
        en: 'When tracking a familiar stock and wanting to gauge the swing in actual currency terms rather than as a percentage.',
      },
      howToRead: {
        vi: 'Dấu cho biết chiều, độ lớn cho biết sức. Động lượng thu hẹp dần trong khi giá vẫn tạo đỉnh mới là dấu hiệu xu hướng đang đuối.',
        en: 'The sign tells you direction, the magnitude tells you strength. Momentum shrinking while price keeps making new highs is a sign the trend is losing steam.',
      },
      commonMistakes: {
        vi: 'Đem động lượng của hai mã khác thị giá ra so: 1.000 ₫ trên cổ phiếu 25.000 ₫ mạnh hơn hẳn 1.000 ₫ trên cổ phiếu 200.000 ₫. Muốn so ngang thì dùng ROC.',
        en: 'Comparing momentum between two stocks with different share prices: 1,000 VND on a 25,000 VND stock is far stronger than 1,000 VND on a 200,000 VND stock. Use ROC for an apples-to-apples comparison.',
      },
    },
    example: {
      title: {
        vi: 'Động lượng 10 phiên trên chuỗi 20 phiên',
        en: '10-period momentum over a 20-period series',
      },
      inputs: { period: 10 },
      series: GIA_20_PHIEN,
      expected: 700,
      note: {
        vi: 'Giá cao hơn mốc 10 phiên trước 700 ₫, tương đương khoảng 2,7% thị giá.',
        en: 'Price is 700 VND higher than the mark from 10 periods ago, roughly 2.7% of the share price.',
      },
    },
    tests: [
      {
        name: 'nhìn lại 10 phiên trên chuỗi đi lên',
        inputs: { period: 10 },
        series: GIA_20_PHIEN,
        expected: 700,
      },
      {
        name: 'nhìn lại 5 phiên rơi đúng nhịp chỉnh nên gần như đứng yên',
        inputs: { period: 5 },
        series: GIA_20_PHIEN,
        expected: 100,
      },
      {
        name: 'chuỗi đã đảo chiều thì động lượng âm',
        inputs: { period: 10 },
        series: GIA_40_PHIEN,
        expected: -1_500,
      },
      {
        name: 'chu kỳ 0 phiên thì không có mốc để trừ',
        inputs: { period: 0 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ nhìn lại 10 phiên',
        inputs: { period: 10 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY_OSC],
  },
  calc: (v, ctx) => {
    const period = Math.round(v('period'));
    if (period < 1) return chuKyKhongHopLe('₫', NHAN_SO_PHIEN_NHIN_LAI);

    const closes = requireCloses(ctx, period + 1);
    if (!Array.isArray(closes)) return fail('₫', closes);

    const giaNay = giaPhienCuoi(closes);
    const giaTruoc = closes[closes.length - 1 - period] ?? Number.NaN;

    return ok(giaNay - giaTruoc, '₫', { extras: { giaNay, giaTruoc } });
  },
};

/*
 * ── 8. Khoảng cách giá so với SMA ──────────────────────────────────────────────────────
 */

export const KHOANG_CACH_GIA_SO_SMA: FormulaModule = {
  spec: {
    id: 'khoang-cach-gia-so-sma',
    categoryId: 'technical',
    name: { vi: 'Khoảng cách giá so với SMA', en: 'Price distance from SMA' },
    description: {
      vi: 'Giá phiên cuối đang cao hơn hay thấp hơn đường trung bình động bao nhiêu phần trăm.',
      en: 'How many percent the last closing price is above or below the moving average.',
    },
    latex: 'D = \\left(\\frac{P_t}{SMA_n} - 1\\right) \\times 100',
    expression: {
      vi: 'Khoảng cách = (Giá phiên cuối ÷ SMA N phiên − 1) × 100',
      en: 'Distance = (Last closing price ÷ N-period SMA − 1) × 100',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['khoang cach sma', 'do lech gia', 'price deviation', 'ma20', 'qua xa duong trung binh'],
    resultUnit: '%',
    variables: [
      sliderVar('period', NHAN_CHU_KY_TRUNG_BINH, 'phiên', 20, 2, 200, 1, {
        description: {
          vi: 'Chu kỳ của SMA đem ra so. Chuỗi giá phải có ít nhất đúng bằng số phiên này. Mốc quen dùng là 20 và 50 phiên.',
          en: 'The period of the SMA being compared against. The price series must have at least this many periods. Common benchmarks are 20 and 50 periods.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Giá đang đứng cách đường trung bình bao xa, quy ra phần trăm nên so được giữa các cổ phiếu khác thị giá.',
        en: 'How far price currently stands from the moving average, expressed as a percentage so it can be compared across stocks with different prices.',
      },
      whenToUse: {
        vi: 'Khi cân nhắc mua đuổi: giá vừa chạy quá xa khỏi đường trung bình thường có nhịp co về, và ngược lại.',
        en: 'When considering chasing a move: price that has run too far from the moving average often pulls back, and vice versa.',
      },
      howToRead: {
        vi: 'Dương là giá nằm trên đường, âm là nằm dưới. Càng xa 0 thì càng căng, nhưng ngưỡng bao nhiêu là căng thì tuỳ độ biến động từng mã — phải đối chiếu với chính lịch sử của mã đó.',
        en: "Positive means price is above the line, negative means below. The farther from 0, the more stretched — but how much counts as stretched depends on each stock's volatility, so it has to be checked against that stock's own history.",
      },
      commonMistakes: {
        vi: 'Áp một ngưỡng cố định kiểu “trên 10% là quá xa” cho mọi cổ phiếu. Mã biến động mạnh thường xuyên lệch 15–20% mà chưa có gì bất thường.',
        en: 'Applying a fixed threshold like "above 10% is too far" to every stock. A highly volatile stock can routinely swing 15–20% away without anything being unusual.',
      },
    },
    example: {
      title: {
        vi: 'Giá phiên cuối so với SMA 20 phiên',
        en: 'Last closing price compared with the 20-period SMA',
      },
      inputs: { period: 20 },
      series: GIA_20_PHIEN,
      expected: 2.87,
      note: {
        vi: 'Giá 26.700 ₫ đứng trên đường 25.955 ₫ — cao hơn gần 3%, chưa phải mức căng.',
        en: 'Price of 26,700 VND sits above the 25,955 VND line — about 3% higher, not yet a stretched level.',
      },
    },
    tests: [
      {
        name: 'giá đứng trên SMA 20 gần 3%',
        inputs: { period: 20 },
        series: GIA_20_PHIEN,
        expected: 2.8704,
      },
      {
        name: 'so với SMA 5 thì gần như dính đường',
        inputs: { period: 5 },
        series: GIA_20_PHIEN,
        expected: 0.15,
      },
      {
        name: 'chuỗi đã đảo chiều thì giá tụt xuống dưới đường',
        inputs: { period: 20 },
        series: GIA_40_PHIEN,
        expected: -5.4337,
      },
      {
        name: 'chu kỳ 0 phiên thì không có đường nào để so',
        inputs: { period: 0 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ cho SMA 20',
        inputs: { period: 20 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const period = Math.round(v('period'));
    if (period < 1) return chuKyKhongHopLe('%', NHAN_CHU_KY_TRUNG_BINH);

    const closes = requireCloses(ctx, period);
    if (!Array.isArray(closes)) return fail('%', closes);

    // `usableCloses` chỉ giữ giá dương nên trung bình của chúng luôn lớn hơn 0.
    const sma = lastSma(closes, period);
    const giaNay = giaPhienCuoi(closes);

    return ok((giaNay / sma - 1) * 100, '%', { extras: { sma, giaNay } });
  },
};

/*
 * ── 9. Giao cắt hai đường trung bình ───────────────────────────────────────────────────
 */

export const GIAO_CAT_HAI_DUONG_MA: FormulaModule = {
  spec: {
    id: 'giao-cat-hai-duong-ma',
    categoryId: 'technical',
    name: { vi: 'Giao cắt hai đường trung bình', en: 'Moving average crossover' },
    description: {
      vi: 'Chênh lệch giữa SMA ngắn hạn và SMA dài hạn — dấu của nó cho biết cắt lên hay cắt xuống.',
      en: 'The difference between the short-term SMA and the long-term SMA — its sign tells you whether a crossover occurred upward or downward.',
    },
    latex: 'C = SMA_{ngan} - SMA_{dai}',
    expression: {
      vi: 'Chênh lệch = SMA chu kỳ ngắn − SMA chu kỳ dài',
      en: 'Difference = Short-period SMA − Long-period SMA',
    },
    chartType: 'candlestick',
    level: 'basic',
    tags: ['giao cat ma', 'golden cross', 'death cross', 'ma50 ma200', 'cat len cat xuong'],
    resultUnit: '₫',
    variables: [
      sliderVar('shortPeriod', NHAN_CHU_KY_NGAN, 'phiên', 10, 2, 100, 1, {
        description: {
          vi: 'Đường bám giá. Cặp quen dùng: 10 và 20 phiên cho ngắn hạn, 50 và 200 cho dài hạn.',
          en: 'The price-tracking line. Common pairs: 10 and 20 periods for short-term, 50 and 200 for long-term.',
        },
      }),
      sliderVar('longPeriod', NHAN_CHU_KY_DAI, 'phiên', 20, 3, 250, 1, {
        description: {
          vi: 'Đường nền, phải dài hơn đường ngắn. Chuỗi giá phải có ít nhất đúng bằng số phiên này.',
          en: 'The baseline, must be longer than the short line. The price series must have at least this many periods.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Hiệu hai đường trung bình. Dấu dương nghĩa là đường ngắn đang ở trên — cắt lên đã xảy ra; dấu âm là đường ngắn đã cắt xuống.',
        en: 'The difference between the two moving averages. A positive sign means the short line is above — an upward crossover has occurred; a negative sign means the short line has crossed below.',
      },
      whenToUse: {
        vi: 'Khi cần một quy tắc vào lệnh cơ học, không phụ thuộc cảm nhận: mua khi hiệu đổi từ âm sang dương, bán khi ngược lại.',
        en: "When you need a mechanical entry rule that doesn't depend on gut feel: buy when the difference flips from negative to positive, sell when it flips the other way.",
      },
      howToRead: {
        vi: 'Hai đường SMA thành phần trả kèm trong kết quả phụ. Hiệu gần 0 nghĩa là hai đường đang chồng nhau, tức thị trường đi ngang và tín hiệu cắt dễ đảo qua đảo lại.',
        en: 'Both component SMAs are returned in the extra results. A difference near 0 means the two lines are overlapping, i.e. the market is sideways and the crossover signal can easily flip back and forth.',
      },
      commonMistakes: {
        vi: 'Giao dịch mọi lần cắt trong thị trường đi ngang: cặp đường sẽ cắt qua cắt lại liên tục và phí giao dịch ăn hết phần lãi. Sai thứ hai là quên rằng tín hiệu chỉ chốt khi phiên đã đóng cửa.',
        en: 'Trading every crossover in a sideways market: the pair of lines will cross back and forth repeatedly and transaction fees eat up all the profit. The second mistake is forgetting that the signal is only confirmed once the period has closed.',
      },
    },
    example: {
      title: {
        vi: 'Cặp SMA 10 và 20 phiên sau nhịp đảo chiều 40 phiên',
        en: 'The 10- and 20-period SMA pair after a 40-period reversal',
      },
      inputs: { shortPeriod: 10, longPeriod: 20 },
      series: GIA_40_PHIEN,
      expected: -750,
      note: {
        vi: 'Đường 10 phiên (25.475 ₫) đã nằm dưới đường 20 phiên (26.225 ₫) — một lần cắt xuống hoàn chỉnh.',
        en: 'The 10-period line (25,475 VND) is now below the 20-period line (26,225 VND) — a complete downward crossover.',
      },
    },
    tests: [
      {
        name: 'đường 5 phiên đang ở trên đường 20 phiên',
        inputs: { shortPeriod: 5, longPeriod: 20 },
        series: GIA_20_PHIEN,
        expected: 705,
      },
      {
        name: 'cặp 10 và 20 phiên vẫn dương trên chuỗi đi lên',
        inputs: { shortPeriod: 10, longPeriod: 20 },
        series: GIA_20_PHIEN,
        expected: 495,
      },
      {
        name: 'chuỗi đã đảo chiều thì hiệu chuyển sang âm',
        inputs: { shortPeriod: 10, longPeriod: 20 },
        series: GIA_40_PHIEN,
        expected: -750,
      },
      {
        name: 'đường ngắn đặt dài hơn đường dài là đặt ngược',
        inputs: { shortPeriod: 20, longPeriod: 10 },
        series: GIA_20_PHIEN,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chuỗi 8 phiên không đủ cho đường dài 20 phiên',
        inputs: { shortPeriod: 10, longPeriod: 20 },
        series: GIA_8_PHIEN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const short = Math.round(v('shortPeriod'));
    const long = Math.round(v('longPeriod'));

    if (short < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_NGAN);
    if (long < 1) return chuKyKhongHopLe('₫', NHAN_CHU_KY_DAI);
    if (short >= long) return chuKyNguoc('₫', NHAN_CHU_KY_NGAN, NHAN_CHU_KY_DAI);

    const closes = requireCloses(ctx, long);
    if (!Array.isArray(closes)) return fail('₫', closes);

    const smaShort = lastSma(closes, short);
    const smaLong = lastSma(closes, long);

    return ok(smaShort - smaLong, '₫', { extras: { smaShort, smaLong } });
  },
};

/** Chín công thức xu hướng & động lượng — nửa đầu nhóm 'technical' theo SRS 3.8. */
export const TECHNICAL_TREND_FORMULAS: ReadonlyArray<FormulaModule> = [
  SMA_N_PHIEN,
  EMA_N_PHIEN,
  MACD_DUONG_CHINH,
  MACD_DUONG_TIN_HIEU,
  RSI_WILDER,
  ROC_TOC_DO_THAY_DOI,
  DONG_LUONG_MOMENTUM,
  KHOANG_CACH_GIA_SO_SMA,
  GIAO_CAT_HAI_DUONG_MA,
];
