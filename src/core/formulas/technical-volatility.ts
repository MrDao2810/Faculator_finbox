/**
 * Tầng DOMAIN — nhóm Phân tích kỹ thuật, nửa BIẾN ĐỘNG & KHỐI LƯỢNG (gói WBS 5.x).
 *
 * Chín công thức đọc thẳng chuỗi giá (FR-12): ba dải Bollinger cùng %B, ATR theo Wilder,
 * stochastic %K, VWAP, độ biến động lịch sử năm hoá và tỷ lệ khối lượng.
 *
 * Ba điều đáng nhớ khi đọc file này:
 *
 *   1. KHÔNG công thức nào đọc `ctx.series` thô. Tất cả đi qua `requireCloses` / `requireBars`
 *      của `series-utils.ts` (hoặc hai lớp bọc `requireOhlc` / `requireVolumeBars` ngay dưới),
 *      nên thiếu phiên thì ra MISSING_SERIES chứ không ra một con số dựng từ chuỗi cụt.
 *   2. Độ lệch chuẩn dùng cho Bollinger là độ lệch chuẩn MẪU (chia n−1) — quy ước thống kê
 *      của `sampleStdDev`. Nhiều bảng giá chia n, nên dải của họ hẹp hơn của ta một chút;
 *      chỗ nào người rà soát dễ vấp là chỗ đó, đã ghi rõ trong mô tả biến và sai lầm thường gặp.
 *   3. Chuỗi xếp phiên CŨ trước, phiên MỚI CUỐI — cùng chiều bảng WF-05.
 *
 * Số trong `tests[]` tính bằng script Node độc lập (viết lại từ định nghĩa gốc, không import
 * file này) rồi mới chép vào, đúng luật của README thư viện công thức. Chuỗi kiểm cố ý ngắn và
 * số tròn để người rà soát tính tay đối chiếu được.
 */

import { fail, ok } from '../calc-output';
import type { CalcContext, FormulaModule } from '../calc/types';
import type { SeriesRow } from '../price-series';
import type { FormulaSource } from '../registry/types';
import type { Bilingual, CalcOutput, CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless, missingSeries } from '../warnings';
import { FPT_57_BARS, FPT_57_PHIEN } from './market-series-2026';
import { mean, requireBars, requireCloses, sampleStdDev } from './series-utils';
import { SOURCE_CFA, sliderVar } from './shared';

/*
 * ── Nguồn tham khảo của cả nhóm (FR-04) ────────────────────────────────────────────────
 */

const SOURCE_BOLLINGER: FormulaSource = {
  label: {
    vi: 'John Bollinger — Bollinger on Bollinger Bands (McGraw-Hill, 2001), phần II: Dải Bollinger',
    en: 'John Bollinger — Bollinger on Bollinger Bands (McGraw-Hill, 2001), Part II: The Bollinger Bands',
  },
};

const SOURCE_WILDER: FormulaSource = {
  label: {
    vi: 'J. Welles Wilder Jr. — New Concepts in Technical Trading Systems (Trend Research, 1978), phần Average True Range',
    en: 'J. Welles Wilder Jr. — New Concepts in Technical Trading Systems (Trend Research, 1978), the Average True Range section',
  },
};

const SOURCE_MURPHY: FormulaSource = {
  label: {
    vi: 'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999)',
    en: 'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999)',
  },
};

const SOURCE_HULL: FormulaSource = {
  label: {
    vi: 'John C. Hull — Options, Futures, and Other Derivatives (Pearson), mục "Estimating volatility from historical data"',
    en: 'John C. Hull — Options, Futures, and Other Derivatives (Pearson), the "Estimating volatility from historical data" section',
  },
};

const SOURCE_JOHNSON: FormulaSource = {
  label: {
    vi: 'Barry Johnson — Algorithmic Trading & DMA: An Introduction to Direct Access Trading Strategies (4Myeloma Press, 2010), phần chuẩn so sánh VWAP',
    en: 'Barry Johnson — Algorithmic Trading & DMA: An Introduction to Direct Access Trading Strategies (4Myeloma Press, 2010), the VWAP benchmark section',
  },
};

/*
 * ── Hai lớp bọc quanh requireBars ──────────────────────────────────────────────────────
 *
 * `requireBars` chỉ bảo đảm phiên có giá đóng cửa dương, nhưng ATR và stochastic còn cần giá
 * cao–thấp, VWAP còn cần khối lượng. Lọc thêm ở đây thay vì trong từng thân hàm, để cả bốn
 * công thức đếm phiên DÙNG ĐƯỢC theo cùng một cách và báo thiếu bằng cùng một câu.
 */

/** Một phiên có đủ cao – thấp – đóng cửa. */
interface OhlcBar {
  high: number;
  low: number;
  close: number;
}

/** Một phiên có đủ đóng cửa – khối lượng. */
interface VolumeBar {
  close: number;
  volume: number;
}

function isUsableNumber(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

const WHAT_OHLC: Bilingual = {
  vi: 'phiên có đủ giá cao, thấp và đóng cửa',
  en: 'sessions with high, low and close prices',
};
const WHAT_VOLUME: Bilingual = {
  vi: 'phiên có đủ giá đóng cửa và khối lượng',
  en: 'sessions with close price and volume',
};

/**
 * Đòi tối thiểu `min` phiên có đủ giá cao – thấp – đóng cửa.
 *
 * Phiên có giá cao nhỏ hơn giá thấp bị loại hẳn: đó là dòng mâu thuẫn, tính dao động thực
 * trên nó sẽ ra số âm hoặc số vô lý mà không ai nhìn ra. Cùng cách nghĩ với `closesOf()`
 * bên `price-series.ts` — thà bỏ dòng hỏng còn hơn tính trên dữ liệu tự mâu thuẫn.
 */
function requireOhlc(ctx: CalcContext, min: number): OhlcBar[] | CalcWarning {
  const bars = requireBars(ctx, min, WHAT_OHLC);
  if (!Array.isArray(bars)) return bars;

  const usable: OhlcBar[] = [];
  for (const bar of bars) {
    const { high, low, close } = bar;
    if (!isUsableNumber(high) || !isUsableNumber(low) || !isUsableNumber(close)) continue;
    if (high < low) continue;
    usable.push({ high, low, close });
  }

  return usable.length >= min ? usable : missingSeries(min, usable.length, WHAT_OHLC);
}

/** Như `requireOhlc` nhưng cho công thức cần khối lượng. Khối lượng âm là dòng hỏng, loại. */
function requireVolumeBars(ctx: CalcContext, min: number): VolumeBar[] | CalcWarning {
  const bars = requireBars(ctx, min, WHAT_VOLUME);
  if (!Array.isArray(bars)) return bars;

  const usable: VolumeBar[] = [];
  for (const bar of bars) {
    const { close, volume } = bar;
    if (!isUsableNumber(close) || !isUsableNumber(volume) || volume < 0) continue;
    usable.push({ close, volume });
  }

  return usable.length >= min ? usable : missingSeries(min, usable.length, WHAT_VOLUME);
}

/** Chu kỳ người dùng nhập luôn quy về số nguyên — nửa phiên thì không có nghĩa gì. */
function periodOf(raw: number): number {
  return Math.round(raw);
}

/** Cảnh báo dùng chung khi chu kỳ nhập quá ngắn để phép tính còn nghĩa. */
function periodTooShort(unit: string, least: number, why: Bilingual): CalcOutput {
  return fail(
    unit,
    meaningless(
      {
        vi: `${why.vi} nên chu kỳ phải từ ${least} phiên trở lên.`,
        en: `${why.en}, so the period must be at least ${least} sessions.`,
      },
      {
        vi: `Nhập chu kỳ ít nhất ${least}.`,
        en: `Enter a period of at least ${least}.`,
      },
    ),
  );
}

/*
 * ── Biến dùng chung của bốn công thức Bollinger ────────────────────────────────────────
 *
 * Bốn công thức chia nhau đúng hai ô nhập này. Khai một lần rồi dùng lại, để đổi mặc định
 * hay đổi lời mô tả thì cả bốn màn đổi theo — `VariableSpec` chỉ được đọc, không ai sửa nó.
 */

const BOLLINGER_PERIOD: VariableSpec = sliderVar(
  'period',
  { vi: 'Chu kỳ dải Bollinger', en: 'Bollinger band period' },
  'phiên',
  20,
  5,
  60,
  1,
  {
    description: {
      vi: 'Số phiên tính đường giữa và độ lệch chuẩn. Bollinger dùng 20 phiên; chuỗi giá phải có ít nhất bấy nhiêu phiên mới tính được.',
      en: 'Number of sessions used for the middle line and standard deviation. Bollinger uses 20 sessions; the price series must have at least that many sessions to compute it.',
    },
  },
);

const BOLLINGER_K: VariableSpec = sliderVar(
  'k',
  { vi: 'Hệ số nhân độ lệch chuẩn', en: 'Standard deviation multiplier' },
  'lần',
  2,
  0.5,
  4,
  0.5,
  {
    description: {
      vi: 'Bollinger dùng 2. Độ lệch chuẩn ở đây là độ lệch chuẩn MẪU (chia cho n−1); bảng giá nào chia cho n sẽ ra dải hẹp hơn một chút.',
      en: 'Bollinger uses 2. The standard deviation here is the SAMPLE standard deviation (divided by n−1); a price table that divides by n instead will produce a slightly narrower band.',
    },
  },
);

/** Cả bốn công thức Bollinger cùng cần ba con số này, tính đúng một lần cho khỏi lệch nhau. */
interface BollingerParts {
  middle: number;
  deviation: number;
  last: number;
}

function bollingerParts(ctx: CalcContext, period: number, k: number): BollingerParts | CalcWarning {
  const closes = requireCloses(ctx, period);
  if (!Array.isArray(closes)) return closes;

  const window = closes.slice(-period);
  const last = window[window.length - 1];
  if (last === undefined) return missingSeries(period, window.length);

  return { middle: mean(window), deviation: k * sampleStdDev(window), last };
}

/*
 * ── Chuỗi dùng cho ca kiểm ─────────────────────────────────────────────────────────────
 *
 * Giữ ở đây chứ không rải vào từng ca: mười phiên số tròn dưới đây cộng trừ tay được, nên
 * người rà soát đối chiếu được kết quả mà không phải chạy chương trình. Chín `example` thì
 * dùng chuỗi giá THẬT của FPT trong `market-series-2026.ts` chứ không dùng chuỗi ở đây.
 */

/** Mười phiên số tròn: trung bình 104,6 · độ lệch chuẩn mẫu 3,2042. */
const CLOSES_KIEM = [100, 102, 101, 103, 105, 104, 106, 108, 107, 110] as const;

/** Chuỗi cụt để kiểm nhánh thiếu phiên. */
const CLOSES_NGAN = [100, 102, 101, 105, 104] as const;

/** Chuỗi phẳng lì — độ lệch chuẩn bằng 0, dải co lại thành một đường. */
const CLOSES_PHANG = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100] as const;

/** Chuỗi kiểm của độ biến động: mười một phiên. */
const CLOSES_KIEM_11 = [...CLOSES_KIEM, 109] as const;

function bar(
  date: string,
  open: number,
  high: number,
  low: number,
  close: number,
  volume: number,
): SeriesRow {
  return { date, open, high, low, close, volume };
}

/** Sáu phiên OHLCV số tròn — dao động thực lần lượt là 6, 5, 5, 6, 5. */
const BARS_KIEM: ReadonlyArray<SeriesRow> = [
  bar('01/06', 101, 105, 100, 102, 1_000_000),
  bar('02/06', 102, 107, 101, 106, 1_200_000),
  bar('03/06', 106, 109, 104, 105, 800_000),
  bar('04/06', 105, 108, 103, 107, 1_000_000),
  bar('05/06', 107, 112, 106, 111, 1_000_000),
  bar('08/06', 111, 113, 108, 110, 2_000_000),
];

/** Ba phiên đầu của chuỗi trên — dùng cho ca thiếu phiên. */
const BARS_NGAN: ReadonlyArray<SeriesRow> = BARS_KIEM.slice(0, 3);

/** Năm phiên kịch trần: cao = thấp = đóng cửa, biên độ bằng 0. */
const BARS_KICH_TRAN: ReadonlyArray<SeriesRow> = [
  bar('01/06', 100, 100, 100, 100, 500_000),
  bar('02/06', 100, 100, 100, 100, 500_000),
  bar('03/06', 100, 100, 100, 100, 500_000),
  bar('04/06', 100, 100, 100, 100, 500_000),
  bar('05/06', 100, 100, 100, 100, 500_000),
];

/** Sáu phiên bị dán thiếu cột khối lượng nên điền 0 — mọi tổng khối lượng đều bằng 0. */
const BARS_KHONG_KHOI_LUONG: ReadonlyArray<SeriesRow> = BARS_KIEM.map((row) => ({
  ...row,
  volume: 0,
}));

/*
 * ── 1. Dải Bollinger trên ──────────────────────────────────────────────────────────────
 */

export const DAI_BOLLINGER_TREN: FormulaModule = {
  spec: {
    id: 'dai-bollinger-tren',
    categoryId: 'technical',
    name: { vi: 'Dải Bollinger trên', en: 'Upper Bollinger band' },
    description: {
      vi: 'Mức giá nằm trên đường trung bình đúng k lần độ lệch chuẩn của chính chuỗi giá.',
      en: 'The price level sitting above the moving average by exactly k times the standard deviation of the price series itself.',
    },
    latex: 'BB_{tren} = SMA_{n} + k \\cdot \\sigma_{n}',
    expression: {
      vi: 'Dải trên = Trung bình n phiên + Hệ số k × Độ lệch chuẩn mẫu của n phiên đó',
      en: 'Upper band = n-session average + Multiplier k × Sample standard deviation of those n sessions',
    },
    symbols: [
      {
        latex: 'BB_{tren}',
        meaning: {
          vi: 'dải Bollinger trên, ₫',
          en: 'upper Bollinger band, in VND',
        },
      },
      {
        latex: 'SMA_{n}',
        meaning: {
          vi: 'trung bình cộng giá đóng cửa n phiên gần nhất, là đường giữa, ₫',
          en: 'simple average of the last n closes, the middle line, in VND',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'chu kỳ dải Bollinger, Bollinger dùng 20 phiên',
          en: 'Bollinger band period, Bollinger uses 20 sessions',
        },
      },
      {
        latex: 'k',
        meaning: {
          vi: 'hệ số nhân độ lệch chuẩn, Bollinger dùng hệ số 2',
          en: 'standard deviation multiplier, Bollinger uses 2',
        },
      },
      {
        latex: '\\sigma_{n}',
        meaning: {
          vi: 'độ lệch chuẩn mẫu của giá đóng cửa n phiên đó, ₫',
          en: 'sample standard deviation of those n closes, in VND',
        },
      },
    ],
    chartType: 'candlestick',
    level: 'basic',
    tags: ['bollinger', 'dai tren', 'upper band', 'bien dong', 'ky thuat'],
    resultUnit: '₫',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning: {
        vi: 'Ranh giới trên của vùng giá "bình thường": dải tự nở ra khi thị trường động và tự co lại khi thị trường lặng, vì khoảng cách từ đường giữa lên tới nó đúng bằng k lần độ lệch chuẩn của giá.',
        en: 'The upper boundary of the "normal" price zone: the band widens on its own when the market is volatile and narrows when it is quiet, because its distance from the middle line is exactly k times the standard deviation of price.',
      },
      whenToUse: {
        vi: 'Khi muốn biết giá hiện tại đã cao tới đâu so với chính nó vài tuần gần đây, thay vì so với một mốc cố định.',
        en: 'When you want to know how high the current price is relative to itself over the past few weeks, rather than against a fixed benchmark.',
      },
      howToRead: {
        vi: 'Giá chạm hoặc vượt dải trên nghĩa là đang ở mép trên vùng dao động quen thuộc — trong xu hướng tăng mạnh, giá có thể bám dải trên rất lâu.',
        en: 'Price touching or breaking above the upper band means it is at the edge of its usual trading range — in a strong uptrend, price can hug the upper band for a long time.',
      },
      commonMistakes: {
        vi: 'Coi chạm dải trên là tín hiệu bán. Bollinger nói rõ dải chỉ mô tả vùng giá, không phải lệnh mua bán. Ngoài ra độ lệch chuẩn ở đây chia cho n−1, một số bảng giá chia cho n nên dải của họ hẹp hơn chút ít.',
        en: 'Treating a touch of the upper band as a sell signal. Bollinger himself made clear the band only describes a price zone, not a buy or sell order. Also, the standard deviation here divides by n−1; some price tables divide by n instead, so their bands come out slightly narrower.',
      },
    },
    example: {
      title: {
        vi: 'Dải trên của FPT trên chuỗi 57 phiên 24/06–15/09/2026, chu kỳ 20 phiên, k = 2',
        en: 'FPT upper band over the 57 sessions from 2026-06-24 to 2026-09-15, period 20, k = 2',
      },
      inputs: { period: 20, k: 2 },
      series: FPT_57_PHIEN,
      expected: 74_988,
      note: {
        vi: 'Dải trên bằng trung bình 20 phiên cộng hai lần độ lệch chuẩn, nên theo phân phối chuẩn chỉ chừng 5% số phiên ra được ngoài hai dải — chạm mép trên là chuyện hiếm. Nhưng trong xu hướng tăng mạnh, giá có thể bám dải trên nhiều phiên liền: dải Bollinger đo biến động chứ không dự báo hướng.',
        en: 'The upper band is the 20-session average plus twice the standard deviation, so under a normal distribution only about 5% of sessions land outside the two bands — touching the upper edge is rare. In a strong uptrend, though, price can hug the upper band for many sessions in a row: Bollinger bands measure volatility, they do not forecast direction.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'mười phiên số tròn, chu kỳ 10 và k = 2',
        inputs: { period: 10, k: 2 },
        series: CLOSES_KIEM,
        expected: 111.0083,
      },
      {
        name: 'hạ k xuống 1 thì dải trên tụt lại gần đường giữa',
        inputs: { period: 10, k: 1 },
        series: CLOSES_KIEM,
        expected: 107.8042,
      },
      {
        name: 'chu kỳ 5 chỉ lấy năm phiên cuối nên dải trên khác hẳn',
        inputs: { period: 5, k: 2 },
        series: CLOSES_KIEM,
        expected: 111.4721,
      },
      {
        name: 'chuỗi phẳng thì dải co lại đúng bằng đường giữa',
        inputs: { period: 10, k: 2 },
        series: CLOSES_PHANG,
        expected: 100,
      },
      {
        name: 'chỉ có 5 phiên mà đòi chu kỳ 10 thì thiếu chuỗi',
        inputs: { period: 10, k: 2 },
        series: CLOSES_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_BOLLINGER, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '₫';
    const period = periodOf(v('period'));
    if (period < 2) {
      return periodTooShort(unit, 2, {
        vi: 'Một phiên thì không có độ phân tán nào để đo',
        en: 'A single session has no dispersion to measure',
      });
    }

    const parts = bollingerParts(ctx, period, v('k'));
    if (!('middle' in parts)) return fail(unit, parts);

    return ok(parts.middle + parts.deviation, unit, { extras: { duongGiua: parts.middle } });
  },
};

/*
 * ── 2. Dải Bollinger dưới ──────────────────────────────────────────────────────────────
 */

export const DAI_BOLLINGER_DUOI: FormulaModule = {
  spec: {
    id: 'dai-bollinger-duoi',
    categoryId: 'technical',
    name: { vi: 'Dải Bollinger dưới', en: 'Lower Bollinger band' },
    description: {
      vi: 'Mức giá nằm dưới đường trung bình đúng k lần độ lệch chuẩn của chính chuỗi giá.',
      en: 'The price level sitting below the moving average by exactly k times the standard deviation of the price series itself.',
    },
    latex: 'BB_{duoi} = SMA_{n} - k \\cdot \\sigma_{n}',
    expression: {
      vi: 'Dải dưới = Trung bình n phiên − Hệ số k × Độ lệch chuẩn mẫu của n phiên đó',
      en: 'Lower band = n-session average − Multiplier k × Sample standard deviation of those n sessions',
    },
    symbols: [
      {
        latex: 'BB_{duoi}',
        meaning: {
          vi: 'dải Bollinger dưới, ₫',
          en: 'lower Bollinger band, in VND',
        },
      },
      {
        latex: 'SMA_{n}',
        meaning: {
          vi: 'trung bình cộng giá đóng cửa n phiên gần nhất, là đường giữa, ₫',
          en: 'simple average of the last n closes, the middle line, in VND',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'chu kỳ dải Bollinger, Bollinger dùng 20 phiên',
          en: 'Bollinger band period, Bollinger uses 20 sessions',
        },
      },
      {
        latex: 'k',
        meaning: {
          vi: 'hệ số nhân độ lệch chuẩn, Bollinger dùng hệ số 2',
          en: 'standard deviation multiplier, Bollinger uses 2',
        },
      },
      {
        latex: '\\sigma_{n}',
        meaning: {
          vi: 'độ lệch chuẩn mẫu của giá đóng cửa n phiên đó, ₫',
          en: 'sample standard deviation of those n closes, in VND',
        },
      },
    ],
    chartType: 'candlestick',
    level: 'basic',
    tags: ['bollinger', 'dai duoi', 'lower band', 'bien dong', 'ky thuat'],
    resultUnit: '₫',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning: {
        vi: 'Ranh giới dưới của vùng giá "bình thường", đối xứng với dải trên qua đường trung bình n phiên.',
        en: 'The lower boundary of the "normal" price zone, mirroring the upper band around the n-session moving average.',
      },
      whenToUse: {
        vi: 'Khi tìm mốc tham chiếu cho vùng giá thấp bất thường so với chính cổ phiếu đó trong vài tuần gần đây.',
        en: 'When looking for a reference point for an unusually low price zone relative to that same stock over the past few weeks.',
      },
      howToRead: {
        vi: 'Giá thủng dải dưới nghĩa là đang ở mép dưới vùng dao động quen thuộc; trong xu hướng giảm, giá có thể bám dải dưới suốt nhiều phiên chứ không bật lên ngay.',
        en: 'Price breaking below the lower band means it is at the edge of its usual trading range; in a downtrend, price can hug the lower band for many sessions instead of bouncing back right away.',
      },
      commonMistakes: {
        vi: 'Mua chỉ vì giá chạm dải dưới. Dải mô tả độ phân tán của giá, không nói gì về việc doanh nghiệp đang tốt hay xấu — chạm dải dưới trong xu hướng giảm là chuyện bình thường.',
        en: 'Buying just because price touched the lower band. The band describes price dispersion, not whether the business is doing well or poorly — touching the lower band during a downtrend is entirely normal.',
      },
    },
    example: {
      title: {
        vi: 'Dải dưới của FPT trên chuỗi 57 phiên 24/06–15/09/2026, chu kỳ 20 phiên, k = 2',
        en: 'FPT lower band over the 57 sessions from 2026-06-24 to 2026-09-15, period 20, k = 2',
      },
      inputs: { period: 20, k: 2 },
      series: FPT_57_PHIEN,
      expected: 68_132,
      note: {
        vi: 'Dải dưới đối xứng với dải trên qua đường giữa, nên nó chỉ nói giá đang ở mép dưới vùng dao động quen thuộc. Ngay trong chuỗi này có hai phiên cuối tháng 7 thủng dải dưới rồi giá hồi lên trong tháng 8, nhưng thủng dải xong rơi tiếp cũng là chuyện thường khi tin xấu là thật — Bollinger không phân biệt được hai tình huống đó.',
        en: 'The lower band mirrors the upper one around the middle line, so it only says price is at the bottom edge of its usual trading range. This very series has two late-July sessions that broke below it before price recovered in August, yet breaking below and continuing to fall is just as common when the bad news is real — Bollinger bands cannot tell the two cases apart.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'mười phiên số tròn, chu kỳ 10 và k = 2',
        inputs: { period: 10, k: 2 },
        series: CLOSES_KIEM,
        expected: 98.1917,
      },
      {
        name: 'hạ k xuống 1 thì dải dưới nhích lên gần đường giữa',
        inputs: { period: 10, k: 1 },
        series: CLOSES_KIEM,
        expected: 101.3958,
      },
      {
        name: 'chu kỳ 5 chỉ lấy năm phiên cuối',
        inputs: { period: 5, k: 2 },
        series: CLOSES_KIEM,
        expected: 102.5279,
      },
      {
        name: 'chỉ có 5 phiên mà đòi chu kỳ 10 thì thiếu chuỗi',
        inputs: { period: 10, k: 2 },
        series: CLOSES_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_BOLLINGER, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '₫';
    const period = periodOf(v('period'));
    if (period < 2) {
      return periodTooShort(unit, 2, {
        vi: 'Một phiên thì không có độ phân tán nào để đo',
        en: 'A single session has no dispersion to measure',
      });
    }

    const parts = bollingerParts(ctx, period, v('k'));
    if (!('middle' in parts)) return fail(unit, parts);

    return ok(parts.middle - parts.deviation, unit, { extras: { duongGiua: parts.middle } });
  },
};

/*
 * ── 3. Độ rộng dải Bollinger ───────────────────────────────────────────────────────────
 */

export const DO_RONG_DAI_BOLLINGER: FormulaModule = {
  spec: {
    id: 'do-rong-dai-bollinger',
    categoryId: 'technical',
    name: { vi: 'Độ rộng dải Bollinger', en: 'Bollinger bandwidth' },
    description: {
      vi: 'Khoảng cách giữa hai dải, quy ra phần trăm của đường giữa để so được các mã.',
      en: 'The gap between the two bands, expressed as a percentage of the middle line so different stocks can be compared.',
    },
    latex: 'BW = \\frac{BB_{tren}(k) - BB_{duoi}(k)}{SMA_{n}} \\times 100',
    expression: {
      vi: 'Độ rộng dải = (Dải trên − Dải dưới) ÷ Đường giữa × 100',
      en: 'Bandwidth = (Upper band − Lower band) ÷ Middle line × 100',
    },
    symbols: [
      {
        latex: 'BW',
        meaning: {
          vi: 'độ rộng dải Bollinger, % của đường giữa',
          en: 'Bollinger bandwidth, as % of the middle line',
        },
      },
      {
        latex: 'BB_{tren}',
        meaning: {
          vi: 'dải trên: đường giữa cộng hệ số nhân × độ lệch chuẩn của chu kỳ, ₫',
          en: 'upper band: middle line plus multiplier × standard deviation of the period, in VND',
        },
      },
      {
        latex: 'BB_{duoi}',
        meaning: {
          vi: 'dải dưới: đường giữa trừ hệ số nhân × độ lệch chuẩn của chu kỳ, ₫',
          en: 'lower band: middle line minus multiplier × standard deviation of the period, in VND',
        },
      },
      {
        latex: 'SMA_{n}',
        meaning: {
          vi: 'đường giữa, tức trung bình cộng giá đóng cửa n phiên gần nhất, ₫',
          en: 'middle line, the simple average of the last n closes, in VND',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'chu kỳ dải Bollinger, phiên (ô Chu kỳ dải Bollinger)',
          en: 'Bollinger band period, in sessions (Bollinger band period field)',
        },
      },
      {
        latex: 'k',
        meaning: {
          vi: 'hệ số nhân độ lệch chuẩn, Bollinger dùng hệ số 2 (ô Hệ số nhân độ lệch chuẩn)',
          en: 'standard deviation multiplier, Bollinger uses 2 (Standard deviation multiplier field)',
        },
      },
      {
        latex: '100',
        meaning: {
          vi: 'đổi ra phần trăm',
          en: 'converts to percent',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bollinger', 'do rong dai', 'bandwidth', 'that nut', 'squeeze', 'bien dong'],
    resultUnit: '%',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning: {
        vi: 'Một con số cho biết dải đang nở hay đang bóp: chia cho đường giữa nên cổ phiếu 10 nghìn và cổ phiếu 200 nghìn so với nhau được.',
        en: 'A single number showing whether the band is expanding or squeezing: dividing by the middle line makes a 10,000 VND stock comparable with a 200,000 VND one.',
      },
      whenToUse: {
        vi: 'Khi rà tìm những mã đang "thắt nút" — biến động co lại rất hẹp, thường đi trước một nhịp giá mạnh mà không nói trước hướng nào.',
        en: 'When screening for stocks that are "squeezing" — volatility contracted very tight, which often precedes a strong price move without indicating which direction.',
      },
      howToRead: {
        vi: 'Con số càng nhỏ thì giá càng lặng. So với chính mã đó vài tháng trước mới có nghĩa; không có ngưỡng chung cho mọi cổ phiếu.',
        en: 'The smaller the number, the quieter the price. It is only meaningful compared with that same stock a few months earlier; there is no universal threshold for every stock.',
      },
      commonMistakes: {
        vi: 'Đoán hướng từ độ rộng. Dải bóp chỉ nói biến động đang thấp, hoàn toàn không nói giá sắp lên hay xuống. Cũng đừng so độ rộng của hai mã có chu kỳ tính khác nhau.',
        en: 'Guessing direction from the bandwidth. A squeeze only says volatility is low — it says nothing about whether price is about to rise or fall. Also avoid comparing the bandwidth of two stocks computed with different periods.',
      },
    },
    example: {
      title: {
        vi: 'Độ rộng dải của FPT trên chuỗi 57 phiên 24/06–15/09/2026, chu kỳ 20 phiên, k = 2',
        en: 'FPT bandwidth over the 57 sessions from 2026-06-24 to 2026-09-15, period 20, k = 2',
      },
      inputs: { period: 20, k: 2 },
      series: FPT_57_PHIEN,
      expected: 9.5816,
      note: {
        vi: 'Chia cho đường giữa nên con số này so được qua thời gian và so được giữa các mã có thị giá khác nhau. Giai đoạn dải co hẹp — cái mà Bollinger gọi là "thắt nút" — thường đi trước một nhịp giá mạnh, nhưng nó chỉ trả lời "khi nào" chứ không trả lời "chiều nào", nên phải đọc kèm một chỉ báo xu hướng.',
        en: 'Dividing by the middle line makes this number comparable across time and across stocks at different price levels. A stretch of narrowing bands — what Bollinger calls a "squeeze" — often precedes a strong price move, but it only answers "when", never "which way", so it has to be read alongside a trend indicator.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'mười phiên số tròn, chu kỳ 10 và k = 2',
        inputs: { period: 10, k: 2 },
        series: CLOSES_KIEM,
        expected: 12.253,
      },
      {
        name: 'hạ k xuống 1 thì độ rộng giảm đúng một nửa',
        inputs: { period: 10, k: 1 },
        series: CLOSES_KIEM,
        expected: 6.1265,
      },
      {
        name: 'chuỗi phẳng lì thì độ rộng đúng bằng 0 — đây là số thật, không phải lỗi',
        inputs: { period: 10, k: 2 },
        series: CLOSES_PHANG,
        expected: 0,
      },
      {
        name: 'chỉ có 5 phiên mà đòi chu kỳ 10 thì thiếu chuỗi',
        inputs: { period: 10, k: 2 },
        series: CLOSES_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_BOLLINGER, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '%';
    const period = periodOf(v('period'));
    if (period < 2) {
      return periodTooShort(unit, 2, {
        vi: 'Một phiên thì không có độ phân tán nào để đo',
        en: 'A single session has no dispersion to measure',
      });
    }

    const parts = bollingerParts(ctx, period, v('k'));
    if (!('middle' in parts)) return fail(unit, parts);

    // Đường giữa luôn dương vì `usableCloses` đã loại mọi giá ≤ 0, nên phép chia này an toàn;
    // dù có lọt thì `ok()` vẫn chặn giá trị không hữu hạn trước khi ra tới màn.
    return ok(((2 * parts.deviation) / parts.middle) * 100, unit);
  },
};

/*
 * ── 4. ATR — dao động thực trung bình ──────────────────────────────────────────────────
 */

export const ATR_DAO_DONG_THUC: FormulaModule = {
  spec: {
    id: 'atr-dao-dong-thuc',
    categoryId: 'technical',
    name: { vi: 'ATR — dao động thực trung bình', en: 'Average true range (Wilder)' },
    description: {
      vi: 'Biên độ một phiên thường đi được bao nhiêu đồng, đã tính cả khoảng nhảy giá so với phiên trước.',
      en: 'How many VND a session typically moves, including any price gap versus the previous session.',
    },
    latex:
      'TR_t = \\max(H_t - L_t,\\ |H_t - C_{t-1}|,\\ |L_t - C_{t-1}|), \\quad ATR_t = \\frac{(n-1) ATR_{t-1} + TR_t}{n}',
    /*
     * Hai vế của hình thành hai DÒNG (luật 6, 18/09/2026), và vế sau được VIẾT LẠI: bản cũ
     * "ATR = trung bình làm mượt Wilder của dao động thực" kể ý chứ không đọc ra phép tính trong
     * hình. Nay đọc đúng `((n − 1) × ATR trước + TR) ÷ n`, cũng đúng cách `calc` làm mượt. Gọi `n`
     * là "Chu kỳ ATR" cho trùng từng chữ với nhãn ô nhập và dòng bảng ký hiệu.
     */
    expression: {
      vi: 'Dao động thực phiên này = số lớn nhất trong (Cao − Thấp), (Cao − Đóng cửa phiên trước), (Đóng cửa phiên trước − Thấp)\nATR phiên này = ((Chu kỳ ATR − 1) × ATR phiên trước + Dao động thực phiên này) ÷ Chu kỳ ATR',
      en: "This session's true range = the largest of (High − Low), (High − Previous close), (Previous close − Low)\nThis session's ATR = ((ATR period − 1) × Previous ATR + This session's true range) ÷ ATR period",
    },
    symbols: [
      {
        latex: 'ATR_t',
        meaning: {
          vi: 'ATR tại phiên t, tức dao động thực trung bình, ₫',
          en: 'ATR at session t, the average true range, in VND',
        },
      },
      {
        latex: 'TR_t',
        meaning: {
          vi: 'dao động thực của phiên t, lấy số lớn nhất trong ba khoảng cách, ₫',
          en: 'true range of session t, the largest of three gaps, in VND',
        },
      },
      {
        latex: 'H_t',
        meaning: {
          vi: 'giá cao nhất trong phiên t, ₫',
          en: 'high of session t, in VND',
        },
      },
      {
        latex: 'L_t',
        meaning: {
          vi: 'giá thấp nhất trong phiên t, ₫',
          en: 'low of session t, in VND',
        },
      },
      {
        latex: 'C_{t-1}',
        meaning: {
          vi: 'giá đóng cửa phiên liền trước, ₫',
          en: 'close of the previous session, in VND',
        },
      },
      {
        latex: 't',
        meaning: {
          vi: 'phiên đang xét',
          en: 'the session in view',
        },
      },
      {
        latex: 'ATR_{t-1}',
        meaning: {
          vi: 'ATR của phiên liền trước, riêng phiên đầu lấy trung bình n dao động thực đầu tiên',
          en: 'ATR of the previous session, seeded by averaging the first n true ranges',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'chu kỳ ATR, Wilder dùng 14 phiên',
          en: 'ATR period, Wilder uses 14 sessions',
        },
      },
      {
        latex: 'n-1',
        meaning: {
          vi: 'trọng số Wilder: giữ n − 1 phần ATR cũ, thêm 1 phần dao động mới',
          en: 'Wilder weighting: keep n − 1 parts of the old ATR, add 1 part of the new range',
        },
      },
    ],
    chartType: 'candlestick',
    level: 'basic',
    tags: ['atr', 'dao dong thuc', 'true range', 'wilder', 'bien do', 'cat lo'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', { vi: 'Chu kỳ ATR', en: 'ATR period' }, 'phiên', 14, 5, 50, 1, {
        description: {
          vi: 'Wilder dùng 14 phiên. Chuỗi phải có ít nhất chu kỳ + 1 phiên, vì phiên đầu tiên chưa có giá đóng cửa hôm trước để tính dao động thực.',
          en: 'Wilder uses 14 sessions. The series must have at least period + 1 sessions, since the first session has no prior close from which to compute a true range.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Thước đo biên độ một phiên tính bằng đồng, cộng cả phần giá nhảy qua đêm — nên nó phản ánh rủi ro thật hơn là lấy giá cao trừ giá thấp.',
        en: "A measure of a session's range in VND that also includes overnight price gaps — so it reflects real risk better than simply taking high minus low.",
      },
      whenToUse: {
        vi: 'Khi đặt khoảng cắt lỗ hoặc tính cỡ lệnh: cắt lỗ hẹp hơn một ATR gần như chắc chắn bị quét bởi dao động thường ngày.',
        en: 'When setting a stop-loss distance or sizing a position: a stop tighter than one ATR is almost certain to get swept out by ordinary daily noise.',
      },
      howToRead: {
        vi: 'ATR là số tiền của một phiên, không phải phần trăm và không có hướng — ATR cao chỉ nói biên độ rộng, không nói giá lên hay xuống. Muốn biết rộng tới đâu thì đem so với thị giá: ATR 500 ₫ trên cổ phiếu 26.800 ₫ là gần 1,9% thị giá mỗi phiên.',
        en: 'ATR is a per-session amount in VND, not a percentage, and it has no direction — a high ATR only means a wide range, not that price is rising or falling. To see how wide, compare it with the market price: an ATR of 500 VND on a 26,800 VND stock is close to 1.9% of the price per session.',
      },
      commonMistakes: {
        vi: 'So ATR giữa hai mã có thị giá khác xa nhau: 500 ₫ trên cổ phiếu 26.000 ₫ khác hẳn 500 ₫ trên cổ phiếu 200.000 ₫. Muốn so thì chia ATR cho giá.',
        en: 'Comparing ATR across two stocks with very different prices: 500 VND on a 26,000 VND stock is nothing like 500 VND on a 200,000 VND stock. To compare, divide ATR by price.',
      },
    },
    example: {
      title: {
        vi: 'ATR của FPT trên chuỗi 57 phiên 24/06–15/09/2026, chu kỳ 14 phiên theo Wilder',
        en: 'FPT ATR over the 57 sessions from 2026-06-24 to 2026-09-15, Wilder period 14',
      },
      inputs: { period: 14 },
      bars: FPT_57_BARS,
      expected: 1_498,
      note: {
        vi: 'Dao động thực lấy số lớn nhất trong ba khoảng nên tính được cả phần giá nhảy qua đêm mà biên độ trong phiên bỏ sót. Ứng dụng quen thuộc nhất là đặt cắt lỗ cách giá vào lệnh chừng 1,5–2 lần ATR, để nhiễu thường ngày không quét mất lệnh dừng.',
        en: 'The true range takes the largest of three gaps, so it captures the overnight jump that an intraday high-minus-low misses. Its most common use is placing a stop roughly 1.5–2 ATR away from the entry price, so ordinary daily noise does not sweep the stop out.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'sáu phiên số tròn, chu kỳ 5 — trung bình của 6, 5, 5, 6, 5',
        inputs: { period: 5 },
        bars: BARS_KIEM,
        expected: 5.4,
      },
      {
        name: 'chu kỳ 3 thì mồi bằng ba dao động đầu rồi làm mượt Wilder hai lần',
        inputs: { period: 3 },
        bars: BARS_KIEM,
        expected: 5.3704,
      },
      {
        name: 'ba phiên mà đòi chu kỳ 5 thì thiếu chuỗi',
        inputs: { period: 5 },
        bars: BARS_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
      {
        name: 'chưa nạp bảng phiên nào thì báo thiếu chứ không trả 0',
        inputs: { period: 14 },
        bars: [],
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_WILDER, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '₫';
    const period = periodOf(v('period'));
    if (period < 1) {
      return periodTooShort(unit, 1, {
        vi: 'ATR là trung bình của ít nhất một dao động thực',
        en: 'ATR is the average of at least one true range',
      });
    }

    // Cần chu kỳ + 1 phiên: N phiên chỉ cho N−1 dao động thực vì phiên đầu chưa có giá đóng
    // cửa hôm trước để so.
    const bars = requireOhlc(ctx, period + 1);
    if (!Array.isArray(bars)) return fail(unit, bars);

    const trueRanges: number[] = [];
    for (let i = 1; i < bars.length; i += 1) {
      const current = bars[i];
      const previous = bars[i - 1];
      if (current === undefined || previous === undefined) continue;
      trueRanges.push(
        Math.max(
          current.high - current.low,
          Math.abs(current.high - previous.close),
          Math.abs(current.low - previous.close),
        ),
      );
    }

    if (trueRanges.length < period) {
      return fail(unit, missingSeries(period + 1, trueRanges.length + 1, WHAT_OHLC));
    }

    // Wilder: mồi bằng trung bình cộng của `period` dao động đầu, rồi làm mượt dần về sau.
    let atr = mean(trueRanges.slice(0, period));
    for (let i = period; i < trueRanges.length; i += 1) {
      const tr = trueRanges[i];
      if (tr !== undefined) atr = (atr * (period - 1) + tr) / period;
    }

    return ok(atr, unit);
  },
};

/*
 * ── 5. %B — vị trí giá trong dải Bollinger ─────────────────────────────────────────────
 */

export const PHAN_TRAM_B_BOLLINGER: FormulaModule = {
  spec: {
    id: 'phan-tram-b-bollinger',
    categoryId: 'technical',
    name: { vi: '%B — vị trí giá trong dải Bollinger', en: 'Bollinger %B' },
    description: {
      vi: 'Giá đóng cửa đang nằm ở đâu giữa hai dải: 0% là dải dưới, 100% là dải trên.',
      en: 'Where the closing price sits between the two bands: 0% is the lower band, 100% is the upper band.',
    },
    latex: '\\%B = \\frac{C - BB_{duoi}(n,k)}{BB_{tren}(n,k) - BB_{duoi}(n,k)} \\times 100',
    expression: {
      vi: '%B = (Giá đóng cửa − Dải dưới) ÷ (Dải trên − Dải dưới) × 100',
      en: '%B = (Closing price − Lower band) ÷ (Upper band − Lower band) × 100',
    },
    symbols: [
      {
        latex: '\\%B',
        meaning: {
          vi: 'vị trí giá trong dải Bollinger, 0% là dải dưới, 100% là dải trên',
          en: 'price position within the Bollinger bands, 0% at the lower band, 100% at the upper',
        },
      },
      {
        latex: 'C',
        meaning: {
          vi: 'giá đóng cửa phiên gần nhất, ₫',
          en: 'latest closing price, in VND',
        },
      },
      {
        latex: 'BB_{duoi}',
        meaning: {
          vi: 'dải dưới: đường giữa trừ hệ số nhân × độ lệch chuẩn của chu kỳ, ₫',
          en: 'lower band: middle line minus multiplier × standard deviation of the period, in VND',
        },
      },
      {
        latex: 'BB_{tren}',
        meaning: {
          vi: 'dải trên: đường giữa cộng hệ số nhân × độ lệch chuẩn của chu kỳ, ₫',
          en: 'upper band: middle line plus multiplier × standard deviation of the period, in VND',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'chu kỳ dải Bollinger, phiên (ô Chu kỳ dải Bollinger)',
          en: 'Bollinger band period, in sessions (Bollinger band period field)',
        },
      },
      {
        latex: 'k',
        meaning: {
          vi: 'hệ số nhân độ lệch chuẩn, Bollinger dùng hệ số 2 (ô Hệ số nhân độ lệch chuẩn)',
          en: 'standard deviation multiplier, Bollinger uses 2 (Standard deviation multiplier field)',
        },
      },
      {
        latex: '100',
        meaning: {
          vi: 'đổi ra phần trăm',
          en: 'converts to percent',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bollinger', 'phan tram b', 'percent b', 'vi tri gia', 'ky thuat'],
    resultUnit: '%',
    /*
     * 0% và 100% ở đây KHÔNG phải hai đầu thang mà là hai dải Bollinger thật — chính là thứ chỉ
     * báo này đo. Giá ra ngoài dải cho %B âm hoặc trên 100, nên hai mốc này là ranh giới đọc kết
     * quả chứ không phải viền hình: `buildChartModel()` tự bỏ mốc nào nằm ngoài miền Y, nên khi
     * đường quét không chạm tới chúng thì hình vẫn sạch như cũ.
     */
    referenceLines: [
      { value: 0, label: { vi: 'Dải dưới', en: 'Lower band' } },
      { value: 100, label: { vi: 'Dải trên', en: 'Upper band' } },
    ],
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning: {
        vi: 'Quy vị trí của giá trong dải về một thang chung: 0% là đúng dải dưới, 50% là đường giữa, 100% là đúng dải trên.',
        en: "Converts the price's position within the band to a common scale: 0% is exactly the lower band, 50% is the middle line, 100% is exactly the upper band.",
      },
      whenToUse: {
        vi: 'Khi cần so vị trí giá giữa nhiều mã có thị giá khác nhau, hoặc khi lọc cổ phiếu theo mức "cao trong dải" mà không phải nhìn từng biểu đồ.',
        en: 'When comparing price position across stocks with different price levels, or when screening for stocks that are "high in the band" without inspecting each chart individually.',
      },
      howToRead: {
        vi: 'Trên 100% nghĩa là giá đã vượt hẳn dải trên, dưới 0% là đã thủng dải dưới — hai trạng thái này hoàn toàn xảy ra được, không phải lỗi.',
        en: 'Above 100% means price has broken clearly above the upper band; below 0% means it has broken below the lower band — both are entirely possible states, not errors.',
      },
      commonMistakes: {
        vi: 'Đọc %B như một chỉ báo quá mua quá bán kiểu RSI. Nó chỉ nói vị trí tương đối trong dải; giá trong xu hướng mạnh có thể ở trên 100% nhiều phiên liền.',
        en: 'Reading %B as an overbought/oversold indicator like RSI. It only states relative position within the band; price in a strong trend can stay above 100% for many sessions in a row.',
      },
    },
    example: {
      title: {
        vi: '%B của FPT trên chuỗi 57 phiên 24/06–15/09/2026, chu kỳ 20 phiên, k = 2',
        en: 'FPT %B over the 57 sessions from 2026-06-24 to 2026-09-15, period 20, k = 2',
      },
      inputs: { period: 20, k: 2 },
      series: FPT_57_PHIEN,
      expected: 66.6263,
      note: {
        vi: '%B quy vị trí giá về một thang chung: 0 là chạm dải dưới, 50 là đúng đường giữa, 100 là chạm dải trên, còn ra ngoài khoảng đó nghĩa là giá đã ra khỏi dải. Nhờ chuẩn hoá mà so được FPT với một mã giá 15.000 ₫ — điều không làm được khi nhìn ba đường Bollinger thô.',
        en: '%B maps price position onto a common scale: 0 is the lower band, 50 is exactly the middle line, 100 is the upper band, and anything outside that range means price has left the band. That normalization is what lets FPT be compared with a 15,000 VND stock — something the three raw Bollinger lines cannot do.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'mười phiên số tròn, chu kỳ 10 và k = 2',
        inputs: { period: 10, k: 2 },
        series: CLOSES_KIEM,
        expected: 92.1327,
      },
      {
        name: 'k = 1 làm dải hẹp lại nên giá vượt hẳn 100%',
        inputs: { period: 10, k: 1 },
        series: CLOSES_KIEM,
        expected: 134.2654,
      },
      {
        name: 'chuỗi phẳng thì hai dải trùng nhau, không có bề rộng để chia',
        inputs: { period: 10, k: 2 },
        series: CLOSES_PHANG,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'chỉ có 5 phiên mà đòi chu kỳ 10 thì thiếu chuỗi',
        inputs: { period: 10, k: 2 },
        series: CLOSES_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_BOLLINGER, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '%';
    const period = periodOf(v('period'));
    if (period < 2) {
      return periodTooShort(unit, 2, {
        vi: 'Một phiên thì không có độ phân tán nào để đo',
        en: 'A single session has no dispersion to measure',
      });
    }

    const k = v('k');
    if (k <= 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Hệ số nhân bằng 0 hoặc âm làm hai dải trùng vào đường giữa, không còn khoảng nào để xác định vị trí giá.',
            en: 'A multiplier of zero or negative collapses both bands onto the middle line, leaving no range in which to locate the price.',
          },
          {
            vi: 'Nhập hệ số nhân lớn hơn 0; Bollinger dùng 2.',
            en: 'Enter a multiplier greater than 0; Bollinger uses 2.',
          },
        ),
      );
    }

    const parts = bollingerParts(ctx, period, k);
    if (!('middle' in parts)) return fail(unit, parts);

    const width = 2 * parts.deviation;
    if (width === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: '%B', en: '%B' },
          { vi: 'bề rộng dải', en: 'band width' },
          {
            vi: 'Chuỗi giá đang phẳng lì nên hai dải trùng nhau — nạp chuỗi có dao động thật.',
            en: 'The price series is flat, so the two bands coincide — load a series with actual price movement.',
          },
        ),
      );
    }

    return ok(((parts.last - (parts.middle - parts.deviation)) / width) * 100, unit);
  },
};

/*
 * ── 6. Stochastic %K ───────────────────────────────────────────────────────────────────
 */

export const STOCHASTIC_K: FormulaModule = {
  spec: {
    id: 'stochastic-k',
    categoryId: 'technical',
    name: { vi: 'Stochastic %K', en: 'Stochastic oscillator %K' },
    description: {
      vi: 'Giá đóng cửa đang ở đâu trong khoảng cao nhất – thấp nhất của n phiên gần nhất, tính theo phần trăm.',
      en: 'Where the closing price sits within the highest–lowest range of the last n sessions, expressed as a percentage.',
    },
    latex: '\\%K = \\frac{C - L_{n}}{H_{n} - L_{n}} \\times 100',
    expression: {
      vi: '%K = (Giá đóng cửa − Giá thấp nhất n phiên) ÷ (Giá cao nhất n phiên − Giá thấp nhất n phiên) × 100',
      en: '%K = (Closing price − n-session lowest price) ÷ (n-session highest price − n-session lowest price) × 100',
    },
    symbols: [
      {
        latex: '\\%K',
        meaning: {
          vi: 'stochastic %K, tức vị trí giá đóng cửa trong biên độ n phiên, %',
          en: 'stochastic %K, where the close sits within the n-session range, in %',
        },
      },
      {
        latex: 'C',
        meaning: {
          vi: 'giá đóng cửa phiên gần nhất, ₫',
          en: 'latest closing price, in VND',
        },
      },
      {
        latex: 'L_{n}',
        meaning: {
          vi: 'giá thấp nhất trong n phiên gần nhất, ₫',
          en: 'lowest low of the last n sessions, in VND',
        },
      },
      {
        latex: 'H_{n}',
        meaning: {
          vi: 'giá cao nhất trong n phiên gần nhất, ₫',
          en: 'highest high of the last n sessions, in VND',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'chu kỳ stochastic, thông lệ 14 phiên',
          en: 'stochastic period, 14 sessions by convention',
        },
      },
      {
        latex: '100',
        meaning: {
          vi: 'đổi ra phần trăm',
          en: 'converts to percent',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['stochastic', 'phan tram k', 'dao dong', 'qua mua', 'qua ban', 'ky thuat'],
    resultUnit: '%',
    /*
     * Cùng lý do mốc 30/70 của RSI: mục "Cách đọc kết quả" ngay dưới hình đang dạy "trên 80% là
     * đóng cửa sát đỉnh, dưới 20% là sát đáy", mà hình không kẻ hai độ cao ấy thì người đọc phải
     * tự ước lượng trên trục. Hai chỉ báo cùng nhóm, cùng thang 0–100, không có cớ gì hành xử
     * khác nhau. Không thêm mốc 50 — cùng lý lẽ đã ghi ở `rsi-wilder`.
     */
    referenceLines: [
      { value: 20, label: { vi: 'Sát đáy', en: 'Near the low' } },
      { value: 80, label: { vi: 'Sát đỉnh', en: 'Near the high' } },
    ],
    variables: [
      sliderVar(
        'period',
        { vi: 'Chu kỳ stochastic', en: 'Stochastic period' },
        'phiên',
        14,
        5,
        50,
        1,
        {
          description: {
            vi: 'Số phiên lấy đỉnh và đáy để so. Thông lệ là 14 phiên; chuỗi phải có ít nhất bấy nhiêu phiên đủ giá cao – thấp – đóng cửa.',
            en: 'The number of sessions used to take the high and low for comparison. The convention is 14 sessions; the series must have at least that many sessions with high, low and close prices.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Cho biết giá đóng cửa đang nằm ở đâu trong khoảng cao nhất – thấp nhất của n phiên gần nhất, quy về thang 0–100%. Ý tưởng gốc: thị trường mạnh thì giá đóng cửa nằm gần đỉnh của biên độ, yếu thì nằm gần đáy.',
        en: 'Shows where the closing price sits within the highest–lowest range of the last n sessions, on a 0–100% scale. The original idea: when the market is strong the close sits near the top of that range; when weak, near the bottom.',
      },
      whenToUse: {
        vi: 'Khi thị trường đi ngang trong một biên độ và cần biết giá đang ở mép trên hay mép dưới của biên độ đó.',
        en: 'When the market is trading sideways within a range and you need to know whether price is near the top or bottom of that range.',
      },
      howToRead: {
        vi: 'Trên 80% là đóng cửa sát đỉnh của n phiên, dưới 20% là sát đáy. Đây là hai mốc quy ước phổ biến chứ không phải ngưỡng mua bán.',
        en: 'Above 80% means the close is near the n-session high; below 20% means it is near the low. These are common conventional markers, not buy/sell thresholds.',
      },
      commonMistakes: {
        vi: 'Bán ngay khi %K trên 80 trong một xu hướng tăng mạnh — chỉ báo này có thể nằm trên 80 rất lâu. Nó chỉ dùng tốt khi giá dao động trong biên độ.',
        en: 'Selling immediately when %K is above 80 during a strong uptrend — this indicator can stay above 80 for a long time. It works best when price is range-bound.',
      },
    },
    example: {
      title: {
        vi: 'Stochastic %K của FPT trên chuỗi 57 phiên 24/06–15/09/2026, chu kỳ 14 phiên',
        en: 'FPT stochastic %K over the 57 sessions from 2026-06-24 to 2026-09-15, period 14',
      },
      inputs: { period: 14 },
      series: FPT_57_PHIEN,
      bars: FPT_57_BARS,
      expected: 48.7805,
      note: {
        vi: 'Mười bốn phiên gần nhất của FPT dao động trong khoảng 70.700–74.800 ₫ và giá đóng cửa rơi vào quãng giữa, tức chưa sát đỉnh cũng chưa sát đáy của biên độ. Chỉ báo này lấy cả giá cao nhất và thấp nhất trong phiên chứ không chỉ giá đóng cửa như RSI, nên phản ứng nhanh hơn.',
        en: "FPT's last fourteen sessions ranged between 70,700 and 74,800 VND and the close lands in the middle of that band — neither near the high nor near the low. Unlike RSI, this indicator uses the intraday high and low as well as the close, so it reacts faster.",
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'năm phiên cuối: đáy 101, đỉnh 113, đóng cửa 110',
        inputs: { period: 5 },
        bars: BARS_KIEM,
        expected: 75,
      },
      {
        name: 'lấy cả sáu phiên thì đáy tụt về 100 nên %K nhích lên',
        inputs: { period: 6 },
        bars: BARS_KIEM,
        expected: 76.9231,
      },
      {
        name: 'năm phiên kịch trần, cao bằng thấp nên không có biên độ để chia',
        inputs: { period: 5 },
        bars: BARS_KICH_TRAN,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'ba phiên mà đòi chu kỳ 5 thì thiếu chuỗi',
        inputs: { period: 5 },
        bars: BARS_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = '%';
    const period = periodOf(v('period'));
    if (period < 1) {
      return periodTooShort(unit, 1, {
        vi: 'Phải có ít nhất một phiên để lấy đỉnh và đáy',
        en: 'At least one session is needed to take the high and low',
      });
    }

    const bars = requireOhlc(ctx, period);
    if (!Array.isArray(bars)) return fail(unit, bars);

    const window = bars.slice(-period);
    const last = window[window.length - 1];
    if (last === undefined) return fail(unit, missingSeries(period, window.length, WHAT_OHLC));

    const highest = Math.max(...window.map((row) => row.high));
    const lowest = Math.min(...window.map((row) => row.low));
    const range = highest - lowest;

    if (range === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: '%K', en: '%K' },
          { vi: 'biên độ n phiên', en: 'n-session range' },
          {
            vi: 'Giá cao nhất đang bằng giá thấp nhất — chuỗi toàn phiên kịch trần hoặc kịch sàn, chọn chu kỳ dài hơn.',
            en: 'The highest price equals the lowest price — the series consists entirely of limit-up or limit-down sessions; choose a longer period.',
          },
        ),
      );
    }

    return ok(((last.close - lowest) / range) * 100, unit);
  },
};

/*
 * ── 7. VWAP — giá bình quân theo khối lượng ────────────────────────────────────────────
 */

export const VWAP: FormulaModule = {
  spec: {
    id: 'vwap',
    categoryId: 'technical',
    name: { vi: 'VWAP — giá bình quân theo khối lượng', en: 'Volume weighted average price' },
    description: {
      vi: 'Giá trung bình của n phiên gần nhất, nhưng phiên khớp nhiều cổ phiếu được tính nặng hơn.',
      en: 'The average price over the last n sessions, but sessions with heavier matched volume are weighted more.',
    },
    latex: 'VWAP = \\frac{\\sum_{i=1}^{n} C_i V_i}{\\sum_{i=1}^{n} V_i}',
    expression: {
      vi: 'VWAP = Tổng (Giá đóng cửa × Khối lượng) ÷ Tổng Khối lượng',
      en: 'VWAP = Sum of (Closing price × Volume) ÷ Total volume',
    },
    symbols: [
      {
        latex: 'VWAP',
        meaning: {
          vi: 'giá bình quân theo khối lượng của các phiên gộp, ₫',
          en: 'volume-weighted average price over the pooled sessions, in VND',
        },
      },
      {
        latex: 'C_i',
        meaning: {
          vi: 'giá đóng cửa phiên i, ₫',
          en: 'closing price of session i, in VND',
        },
      },
      {
        latex: 'V_i',
        meaning: {
          vi: 'khối lượng khớp của phiên i, cổ phiếu',
          en: 'matched volume of session i, in shares',
        },
      },
      {
        latex: 'i',
        meaning: {
          vi: 'phiên đang xét, chạy qua số phiên gộp gần nhất',
          en: 'the session in view, running over the pooled sessions',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số phiên gộp gần nhất, phiên (ô Số phiên gộp)',
          en: 'number of most recent pooled sessions (Sessions to pool field)',
        },
      },
    ],
    chartType: 'candlestick',
    level: 'basic',
    tags: ['vwap', 'gia binh quan', 'khoi luong', 'volume weighted', 'ky thuat'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', { vi: 'Số phiên gộp', en: 'Sessions to pool' }, 'phiên', 20, 5, 120, 1, {
        description: {
          vi: 'Số phiên gần nhất đưa vào bình quân. Mỗi phiên phải có đủ giá đóng cửa và khối lượng.',
          en: 'The number of most recent sessions included in the average. Each session must have both a closing price and volume.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Giá vốn bình quân của cả kỳ: mỗi phiên góp vào theo đúng số cổ phiếu đã khớp, nên phiên giao dịch sôi động kéo con số về phía giá của nó mạnh hơn hẳn phiên ế.',
        en: 'The average cost basis for the whole period: every session contributes in proportion to the shares it actually matched, so a heavily traded session pulls the number toward its own price far more than a quiet one does.',
      },
      whenToUse: {
        vi: 'Khi đánh giá một lần mua bán lớn đã khớp tốt hay xấu so với mặt bằng của kỳ, hoặc khi cần một mốc giá có tính tới khối lượng thay vì trung bình cộng các phiên.',
        en: 'When judging whether a large trade executed well or poorly against the overall level of the period, or when you need a price benchmark that takes volume into account instead of a plain average of sessions.',
      },
      howToRead: {
        vi: 'Giá hiện tại trên VWAP nghĩa là người mua BÌNH QUÂN của kỳ đang lãi, dưới VWAP thì đang lỗ. Chỉ là bình quân thôi: một phiên khối lượng lớn kéo VWAP về phía giá của nó, nên phần đông người mua vẫn có thể đang lỗ dù giá nằm trên VWAP.',
        en: 'Price above VWAP means the AVERAGE buyer of the period is in profit; below it, at a loss. On average only: one heavy-volume session pulls VWAP toward its own price, so most buyers can still be under water even when price sits above VWAP.',
      },
      commonMistakes: {
        vi: 'Nhầm với VWAP trong phiên của bảng giá: bản trong phiên tính theo từng lệnh khớp và giá điển hình (cao + thấp + đóng) chia 3, còn công thức này gộp theo PHIÊN và dùng giá đóng cửa, nên hai con số không trùng nhau.',
        en: 'Confusing this with the intraday VWAP shown on trading boards: the intraday version is computed trade-by-trade using the typical price (high + low + close) ÷ 3, whereas this formula pools by SESSION and uses the closing price — so the two numbers will not match.',
      },
    },
    example: {
      title: {
        vi: 'VWAP của FPT trên chuỗi 57 phiên 24/06–15/09/2026, gộp 20 phiên gần nhất',
        en: 'FPT VWAP over the 57 sessions from 2026-06-24 to 2026-09-15, pooling the last 20 sessions',
      },
      inputs: { period: 20 },
      bars: FPT_57_BARS,
      expected: 71_726,
      note: {
        vi: 'Mỗi phiên góp vào theo đúng số cổ phiếu đã khớp, nên phiên sôi động kéo bình quân về phía giá của nó: hai mươi phiên này có trung bình cộng giá đóng cửa 71.560 ₫, còn VWAP nhỉnh hơn vì phiên khối lượng nặng nhất trong kỳ lại là phiên giá cao. Các quỹ lớn dùng VWAP làm chuẩn đánh giá chất lượng khớp lệnh.',
        en: 'Every session contributes in proportion to the shares it matched, so an active session pulls the average toward its own price: the plain average of these twenty closes is 71,560 VND, while VWAP comes out higher because the heaviest-volume session of the period was also a high-priced one. Large funds use VWAP as the benchmark for execution quality.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'năm phiên cuối, tổng khối lượng 6 triệu cổ phiếu',
        inputs: { period: 5 },
        bars: BARS_KIEM,
        expected: 108.2,
      },
      {
        name: 'gộp cả sáu phiên thì bình quân tụt xuống',
        inputs: { period: 6 },
        bars: BARS_KIEM,
        expected: 107.3143,
      },
      {
        name: 'chuỗi dán thiếu cột khối lượng nên tổng khối lượng bằng 0',
        inputs: { period: 5 },
        bars: BARS_KHONG_KHOI_LUONG,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'ba phiên mà đòi gộp 5 phiên thì thiếu chuỗi',
        inputs: { period: 5 },
        bars: BARS_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_JOHNSON, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '₫';
    const period = periodOf(v('period'));
    if (period < 1) {
      return periodTooShort(unit, 1, {
        vi: 'Bình quân cần ít nhất một phiên',
        en: 'An average needs at least one session',
      });
    }

    const bars = requireVolumeBars(ctx, period);
    if (!Array.isArray(bars)) return fail(unit, bars);

    const window = bars.slice(-period);
    let turnover = 0;
    let volume = 0;
    for (const row of window) {
      turnover += row.close * row.volume;
      volume += row.volume;
    }

    if (volume === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'VWAP', en: 'VWAP' },
          { vi: 'tổng khối lượng', en: 'total volume' },
          {
            vi: 'Các phiên đang chọn đều có khối lượng bằng 0 — kiểm tra lại cột khối lượng của bảng dữ liệu.',
            en: 'The selected sessions all have zero volume — check the volume column of the data table.',
          },
        ),
      );
    }

    return ok(turnover / volume, unit, { extras: { tongKhoiLuong: volume } });
  },
};

/*
 * ── 8. Độ biến động lịch sử năm hoá ────────────────────────────────────────────────────
 */

export const DO_BIEN_DONG_LICH_SU: FormulaModule = {
  spec: {
    id: 'do-bien-dong-lich-su',
    categoryId: 'technical',
    name: { vi: 'Độ biến động lịch sử năm hoá', en: 'Annualized historical volatility' },
    description: {
      vi: 'Độ lệch chuẩn của lợi suất log hằng phiên, quy về mức tương đương cả năm bằng căn bậc hai số phiên.',
      en: 'The standard deviation of daily log returns, scaled to an annual-equivalent level using the square root of the number of sessions.',
    },
    latex:
      '\\sigma_{nam} = \\sigma_{n}\\left(\\ln \\frac{P_t}{P_{t-1}}\\right) \\times \\sqrt{N} \\times 100',
    expression: {
      vi: 'Độ biến động năm = Độ lệch chuẩn mẫu của lợi suất log mỗi phiên × căn bậc hai của Số phiên một năm × 100',
      en: 'Annual volatility = Sample standard deviation of per-session log returns × square root of Sessions per year × 100',
    },
    symbols: [
      {
        latex: '\\sigma_{nam}',
        meaning: {
          vi: 'độ biến động lịch sử năm hoá, %/năm',
          en: 'annualized historical volatility, in %/year',
        },
      },
      {
        latex: '\\sigma',
        meaning: {
          vi: 'độ lệch chuẩn mẫu của dãy lợi suất log trong ngoặc',
          en: 'sample standard deviation of the log returns in the brackets',
        },
      },
      {
        latex: '\\ln \\frac{P_t}{P_{t-1}}',
        meaning: {
          vi: 'lợi suất log của phiên t, tức logarit tự nhiên của tỷ số hai giá đóng cửa liên tiếp',
          en: 'log return of session t, the natural log of the ratio of two consecutive closes',
        },
      },
      {
        latex: 'P_t',
        meaning: {
          vi: 'giá đóng cửa phiên t, ₫',
          en: 'closing price of session t, in VND',
        },
      },
      {
        latex: 'P_{t-1}',
        meaning: {
          vi: 'giá đóng cửa phiên liền trước, ₫',
          en: 'closing price of the previous session, in VND',
        },
      },
      {
        latex: 't',
        meaning: {
          vi: 'phiên đang xét, chạy qua số phiên giá lấy mẫu',
          en: 'the session in view, running over the sampled sessions',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số phiên giá lấy mẫu (ô Số phiên giá lấy mẫu)',
          en: 'number of sampled sessions (Sample sessions field)',
        },
      },
      {
        latex: 'N',
        meaning: {
          vi: 'số phiên giao dịch một năm, thông lệ 252',
          en: 'trading sessions per year, 252 by convention',
        },
      },
      {
        latex: '\\sqrt{N}',
        meaning: {
          vi: 'căn bậc hai của số phiên một năm, nhân với căn chứ không nhân thẳng số phiên',
          en: 'square root of the sessions per year, so scale by the root, not the count',
        },
      },
      {
        latex: '100',
        meaning: {
          vi: 'đổi ra phần trăm',
          en: 'converts to percent',
        },
      },
    ],
    chartType: 'histogram',
    level: 'advanced',
    tags: ['do bien dong', 'volatility', 'nam hoa', 'loi suat log', 'rui ro', 'ky thuat'],
    resultUnit: '%/năm',
    variables: [
      sliderVar(
        'sample',
        { vi: 'Số phiên giá lấy mẫu', en: 'Sample sessions' },
        'phiên',
        60,
        10,
        250,
        1,
        {
          description: {
            vi: 'N phiên giá cho N−1 lợi suất. Giáo trình khuyên lấy ít nhất 60 phiên; dưới 20 phiên con số nhảy rất mạnh theo vài phiên cá biệt.',
            en: 'N price sessions yield N−1 returns. Textbooks recommend at least 60 sessions; below 20 sessions the number swings wildly based on a handful of outlier sessions.',
          },
        },
      ),
      sliderVar(
        'tradingDays',
        { vi: 'Số phiên giao dịch một năm', en: 'Trading sessions per year' },
        'phiên',
        252,
        200,
        366,
        1,
        {
          description: {
            vi: 'Thông lệ quốc tế là 252 phiên. HOSE thường có khoảng 248–250 phiên mỗi năm sau khi trừ nghỉ lễ.',
            en: 'The international convention is 252 sessions. HOSE typically has around 248–250 sessions per year after excluding holidays.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Một con số duy nhất cho biết giá cổ phiếu dao động mạnh cỡ nào, quy về thang năm để so được với lãi suất và với các mã khác.',
        en: "A single number showing how strongly a stock's price fluctuates, scaled to an annual basis so it can be compared with interest rates and with other stocks.",
      },
      whenToUse: {
        vi: 'Khi cần định lượng rủi ro biến động của một mã trước khi vào lệnh, hoặc khi cần tham số độ biến động cho các mô hình định giá quyền chọn.',
        en: "When you need to quantify a stock's volatility risk before placing an order, or when you need a volatility parameter for option pricing models.",
      },
      howToRead: {
        vi: '40%/năm nghĩa là trong khoảng hai phần ba số năm, lợi suất một năm nằm trong khoảng cộng trừ 40% quanh mức trung bình — nếu lợi suất phân phối chuẩn, giả định vốn dĩ chỉ đúng gần đúng.',
        en: '40%/year means that in roughly two-thirds of years, the one-year return falls within plus or minus 40% of the average — assuming returns are normally distributed, an assumption that only holds approximately.',
      },
      commonMistakes: {
        vi: 'Quy năm bằng cách nhân với số phiên thay vì nhân với CĂN BẬC HAI của số phiên. Và đây là biến động ĐÃ XẢY RA, không phải dự báo cho kỳ tới.',
        en: 'Annualizing by multiplying by the number of sessions instead of by the SQUARE ROOT of the number of sessions. Also, this is volatility that HAS ALREADY HAPPENED, not a forecast for the coming period.',
      },
    },
    example: {
      title: {
        vi: 'Độ biến động năm hoá của FPT, lấy mẫu 55 phiên cuối trong chuỗi 24/06–15/09/2026',
        en: 'FPT annualized volatility, sampled over the last 55 of the sessions from 2026-06-24 to 2026-09-15',
      },
      inputs: { sample: 55, tradingDays: 252 },
      series: FPT_57_PHIEN,
      expected: 30.3652,
      note: {
        vi: 'Chỉ báo này dùng quy ước 252 phiên một năm theo thông lệ quốc tế, khác nhóm rủi ro vốn dùng 250 phiên: chênh lệch nhỏ, nhưng nếu hai màn hình không thống nhất thì cùng một mã sẽ hiện ra hai con số. Đây cũng là tham số bắt buộc của Black-Scholes khi định giá chứng quyền có bảo đảm.',
        en: 'This indicator follows the international convention of 252 sessions per year, unlike the risk group which uses 250: the gap is small, but if two screens disagree the same stock will show two different numbers. It is also the mandatory volatility input to Black-Scholes when pricing covered warrants.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'mười phiên cuối của chuỗi số tròn, quy năm theo 252 phiên',
        inputs: { sample: 10, tradingDays: 252 },
        series: CLOSES_KIEM_11,
        expected: 25.7211,
      },
      {
        name: 'đổi sang 250 phiên một năm thì con số nhích xuống chút ít',
        inputs: { sample: 10, tradingDays: 250 },
        series: CLOSES_KIEM_11,
        expected: 25.6188,
      },
      {
        name: 'số phiên một năm bằng 0 thì không quy năm được, không được trả 0',
        inputs: { sample: 10, tradingDays: 0 },
        series: CLOSES_KIEM_11,
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'chỉ có 5 phiên mà đòi lấy mẫu 10 thì thiếu chuỗi',
        inputs: { sample: 10, tradingDays: 252 },
        series: CLOSES_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_HULL, SOURCE_MURPHY],
  },
  calc: (v, ctx) => {
    const unit = '%/năm';
    const sample = periodOf(v('sample'));
    if (sample < 3) {
      return periodTooShort(unit, 3, {
        vi: 'Độ lệch chuẩn mẫu cần ít nhất hai lợi suất',
        en: 'The sample standard deviation needs at least two returns',
      });
    }

    const days = v('tradingDays');
    if (days <= 0) {
      return fail(
        unit,
        meaningless(
          {
            vi: 'Số phiên giao dịch một năm phải lớn hơn 0 thì mới quy được độ biến động về thang năm.',
            en: 'The number of trading sessions per year must be greater than 0 to scale volatility to an annual basis.',
          },
          {
            vi: 'Nhập 252 theo thông lệ quốc tế, hoặc 250 cho lịch giao dịch trong nước.',
            en: 'Enter 252 per international convention, or 250 for the domestic trading calendar.',
          },
        ),
      );
    }

    const closes = requireCloses(ctx, sample);
    if (!Array.isArray(closes)) return fail(unit, closes);

    // Lợi suất log chứ không phải lợi suất đơn: nó cộng dồn được qua các phiên, nên nhân với
    // căn bậc hai của số phiên mới đúng nghĩa quy năm. `series-utils` chưa có nên viết tại chỗ.
    const window = closes.slice(-sample);
    const logReturns: number[] = [];
    for (let i = 1; i < window.length; i += 1) {
      const previous = window[i - 1];
      const current = window[i];
      if (previous !== undefined && current !== undefined && previous > 0 && current > 0) {
        logReturns.push(Math.log(current / previous));
      }
    }

    return ok(sampleStdDev(logReturns) * Math.sqrt(days) * 100, unit);
  },
};

/*
 * ── 9. Tỷ lệ khối lượng so với trung bình n phiên ──────────────────────────────────────
 */

export const TY_LE_KHOI_LUONG: FormulaModule = {
  spec: {
    id: 'ty-le-khoi-luong',
    categoryId: 'technical',
    name: { vi: 'Tỷ lệ khối lượng so với trung bình', en: 'Relative volume' },
    description: {
      vi: 'Khối lượng phiên gần nhất gấp bao nhiêu lần khối lượng trung bình n phiên liền trước.',
      en: "How many times the most recent session's volume is relative to the average volume of the preceding n sessions.",
    },
    latex: 'RVOL = \\frac{V_t}{\\frac{1}{n}\\sum_{i=1}^{n} V_{t-i}}',
    expression: {
      vi: 'Tỷ lệ khối lượng = Khối lượng phiên gần nhất ÷ Trung bình khối lượng n phiên liền trước',
      en: "Volume ratio = Most recent session's volume ÷ Average volume of the preceding n sessions",
    },
    symbols: [
      {
        latex: 'RVOL',
        meaning: {
          vi: 'tỷ lệ khối lượng so với trung bình, lần',
          en: 'relative volume, in times',
        },
      },
      {
        latex: 'V_t',
        meaning: {
          vi: 'khối lượng khớp của phiên gần nhất, cổ phiếu',
          en: 'matched volume of the most recent session, in shares',
        },
      },
      {
        latex: 't',
        meaning: {
          vi: 'phiên gần nhất, là phiên đem ra so',
          en: 'the most recent session, the one being compared',
        },
      },
      {
        latex: '\\frac{1}{n}\\sum_{i=1}^{n} V_{t-i}',
        meaning: {
          vi: 'trung bình cộng khối lượng của n phiên liền trước, không gộp phiên gần nhất',
          en: 'average volume of the n preceding sessions, the most recent one excluded',
        },
      },
      {
        latex: 'V_{t-i}',
        meaning: {
          vi: 'khối lượng của phiên thứ i trước phiên gần nhất, cổ phiếu',
          en: 'volume of the i-th session before the most recent one, in shares',
        },
      },
      {
        latex: 'i',
        meaning: {
          vi: 'số phiên đếm lùi từ phiên gần nhất, chạy từ 1 tới n',
          en: 'sessions counted back from the latest, running 1 to n',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số phiên lấy trung bình, chỉ gồm các phiên liền trước',
          en: 'sessions to average, only the preceding ones',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['khoi luong', 'volume', 'thanh khoan', 'relative volume', 'dot bien', 'ky thuat'],
    resultUnit: 'lần',
    variables: [
      sliderVar(
        'period',
        { vi: 'Số phiên lấy trung bình', en: 'Sessions to average' },
        'phiên',
        20,
        5,
        120,
        1,
        {
          description: {
            vi: 'Số phiên LIỀN TRƯỚC phiên gần nhất dùng làm mốc so sánh. Chuỗi phải có ít nhất số phiên đó cộng thêm phiên gần nhất.',
            en: 'The number of sessions IMMEDIATELY BEFORE the most recent one, used as the comparison baseline. The series must have at least that many sessions plus the most recent one.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Đo mức bất thường của thanh khoản: phiên gần nhất đang giao dịch sôi động hay ảm đạm so với mặt bằng chính nó vài tuần qua.',
        en: 'Measures how unusual liquidity is: whether the most recent session is trading actively or quietly compared with its own level over the past few weeks.',
      },
      whenToUse: {
        vi: 'Khi cần xác nhận một phiên phá vỡ vùng giá — cùng một mức tăng giá, phiên có khối lượng gấp mấy lần bình thường đáng tin hơn phiên khối lượng lèo tèo.',
        en: 'When confirming a breakout session — for the same price gain, a session with volume several times the norm is more credible than one with thin volume.',
      },
      howToRead: {
        vi: 'Bằng 1 lần là đúng mức trung bình, 2 lần là gấp đôi. Chỉ số này không có hướng: khối lượng đột biến đi kèm giá giảm mạnh lại là dấu hiệu bán tháo.',
        en: 'A value of 1x is exactly the average, 2x is double. This indicator has no direction: a volume spike accompanied by a sharp price drop is actually a sign of a sell-off.',
      },
      commonMistakes: {
        vi: 'Tính trung bình có gộp cả phiên gần nhất — làm vậy thì chính phiên đột biến kéo mốc so sánh lên và tỷ lệ bị nén lại. Ở đây mốc chỉ gồm các phiên LIỀN TRƯỚC.',
        en: 'Including the most recent session in the average — doing so lets the very spike being measured pull up its own baseline, compressing the ratio. Here the baseline consists only of the PRECEDING sessions.',
      },
    },
    example: {
      title: {
        vi: 'Phiên 15/09/2026 của FPT so với trung bình 20 phiên liền trước, trong chuỗi từ 24/06/2026',
        en: "FPT's 2026-09-15 session against the average of the preceding 20, within the series starting 2026-06-24",
      },
      inputs: { period: 20 },
      bars: FPT_57_BARS,
      expected: 0.55,
      note: {
        vi: 'Phiên gần nhất chỉ khớp chừng một nửa mức bình quân của hai mươi phiên liền trước, tức thanh khoản đang mỏng đi; phải từ khoảng 1,5 lần trở lên mới được coi là đột biến. Tỷ lệ này không có hướng: trong chính chuỗi FPT, phiên 15/07 khối lượng 21,5 triệu đi kèm giá giảm 5% còn phiên 03/08 khối lượng 19,5 triệu đi kèm giá tăng gần 7%.',
        en: 'The latest session matched only about half the average of the preceding twenty, meaning liquidity is thinning; roughly 1.5x and above is what counts as a spike. The ratio has no direction: within this same FPT series, 15 July matched 21.5 million shares while price fell 5%, and 3 August matched 19.5 million while price rose nearly 7%.',
      },
      source: {
        vi: 'investing.com — dữ liệu lịch sử FPT, 57 phiên 24/06–15/09/2026, truy cập 15/09/2026.',
        en: 'investing.com — FPT historical data, 57 sessions from 2026-06-24 to 2026-09-15, accessed 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'phiên cuối 2 triệu so với trung bình 1 triệu của 5 phiên trước',
        inputs: { period: 5 },
        bars: BARS_KIEM,
        expected: 2,
      },
      {
        name: 'lấy mốc 3 phiên liền trước thì trung bình khác đi',
        inputs: { period: 3 },
        bars: BARS_KIEM,
        expected: 2.1429,
      },
      {
        name: 'các phiên trước đều khối lượng 0 nên không có mốc để chia',
        inputs: { period: 5 },
        bars: BARS_KHONG_KHOI_LUONG,
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'ba phiên mà đòi mốc 5 phiên thì thiếu chuỗi',
        inputs: { period: 5 },
        bars: BARS_NGAN,
        expected: null,
        expectedWarning: 'MISSING_SERIES',
      },
    ],
    source: [SOURCE_MURPHY, SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = 'lần';
    const period = periodOf(v('period'));
    if (period < 1) {
      return periodTooShort(unit, 1, {
        vi: 'Mốc so sánh cần ít nhất một phiên',
        en: 'The comparison baseline needs at least one session',
      });
    }

    // Cần n phiên làm mốc CỘNG phiên gần nhất đem so.
    const bars = requireVolumeBars(ctx, period + 1);
    if (!Array.isArray(bars)) return fail(unit, bars);

    const last = bars[bars.length - 1];
    if (last === undefined) return fail(unit, missingSeries(period + 1, 0, WHAT_VOLUME));

    const previous = bars.slice(-(period + 1), -1).map((row) => row.volume);
    const average = mean(previous);

    if (average === 0) {
      return fail(
        unit,
        divideByZero(
          { vi: 'tỷ lệ khối lượng', en: 'volume ratio' },
          { vi: 'khối lượng trung bình', en: 'average volume' },
          {
            vi: 'Các phiên làm mốc đều có khối lượng bằng 0 — kiểm tra lại cột khối lượng của bảng dữ liệu.',
            en: 'All baseline sessions have zero volume — check the volume column of the data table.',
          },
        ),
      );
    }

    return ok(last.volume / average, unit, { extras: { khoiLuongTrungBinh: average } });
  },
};

/** Chín công thức biến động & khối lượng của nhóm 'technical'. */
export const TECHNICAL_VOLATILITY_FORMULAS: ReadonlyArray<FormulaModule> = [
  DAI_BOLLINGER_TREN,
  DAI_BOLLINGER_DUOI,
  DO_RONG_DAI_BOLLINGER,
  ATR_DAO_DONG_THUC,
  PHAN_TRAM_B_BOLLINGER,
  STOCHASTIC_K,
  VWAP,
  DO_BIEN_DONG_LICH_SU,
  TY_LE_KHOI_LUONG,
];
