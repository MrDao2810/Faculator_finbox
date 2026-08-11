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
import type { CalcOutput, CalcWarning, VariableSpec } from '../types';
import { divideByZero, meaningless, missingSeries } from '../warnings';
import { mean, requireBars, requireCloses, sampleStdDev } from './series-utils';
import { SOURCE_CFA, sliderVar } from './shared';

/*
 * ── Nguồn tham khảo của cả nhóm (FR-04) ────────────────────────────────────────────────
 */

const SOURCE_BOLLINGER: FormulaSource = {
  label:
    'John Bollinger — Bollinger on Bollinger Bands (McGraw-Hill, 2001), phần II: Dải Bollinger',
};

const SOURCE_WILDER: FormulaSource = {
  label:
    'J. Welles Wilder Jr. — New Concepts in Technical Trading Systems (Trend Research, 1978), phần Average True Range',
};

const SOURCE_MURPHY: FormulaSource = {
  label:
    'John J. Murphy — Technical Analysis of the Financial Markets (New York Institute of Finance, 1999)',
};

const SOURCE_HULL: FormulaSource = {
  label:
    'John C. Hull — Options, Futures, and Other Derivatives (Pearson), mục "Estimating volatility from historical data"',
};

const SOURCE_JOHNSON: FormulaSource = {
  label:
    'Barry Johnson — Algorithmic Trading & DMA: An Introduction to Direct Access Trading Strategies (4Myeloma Press, 2010), phần chuẩn so sánh VWAP',
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

const WHAT_OHLC = 'phiên có đủ giá cao, thấp và đóng cửa';
const WHAT_VOLUME = 'phiên có đủ giá đóng cửa và khối lượng';

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
function periodTooShort(unit: string, least: number, why: string): CalcOutput {
  return fail(
    unit,
    meaningless(
      `${why} nên chu kỳ phải từ ${least} phiên trở lên.`,
      `Nhập chu kỳ ít nhất ${least}.`,
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
  'Chu kỳ dải Bollinger',
  'phiên',
  20,
  5,
  60,
  1,
  {
    description:
      'Số phiên tính đường giữa và độ lệch chuẩn. Bollinger dùng 20 phiên; chuỗi giá phải có ít nhất bấy nhiêu phiên mới tính được.',
  },
);

const BOLLINGER_K: VariableSpec = sliderVar(
  'k',
  'Hệ số nhân độ lệch chuẩn',
  'lần',
  2,
  0.5,
  4,
  0.5,
  {
    description:
      'Bollinger dùng 2. Độ lệch chuẩn ở đây là độ lệch chuẩn MẪU (chia cho n−1); bảng giá nào chia cho n sẽ ra dải hẹp hơn một chút.',
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
 * ── Chuỗi dùng cho ví dụ và ca kiểm ────────────────────────────────────────────────────
 *
 * Giữ ở đây chứ không rải vào từng ca: mười phiên số tròn dưới đây cộng trừ tay được, nên
 * người rà soát đối chiếu được kết quả mà không phải chạy chương trình.
 */

/** Mười phiên số tròn: trung bình 104,6 · độ lệch chuẩn mẫu 3,2042. */
const CLOSES_KIEM = [100, 102, 101, 103, 105, 104, 106, 108, 107, 110] as const;

/** Chuỗi cụt để kiểm nhánh thiếu phiên. */
const CLOSES_NGAN = [100, 102, 101, 105, 104] as const;

/** Chuỗi phẳng lì — độ lệch chuẩn bằng 0, dải co lại thành một đường. */
const CLOSES_PHANG = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100] as const;

/** Mười phiên giá thật của một cổ phiếu tầm 26–27 nghìn đồng, dùng cho ví dụ trên màn. */
const CLOSES_VI_DU = [
  26_000, 26_200, 26_100, 26_400, 26_600, 26_500, 26_800, 27_000, 26_900, 27_200,
] as const;

/** Như trên, thêm một phiên để công thức độ biến động có đủ 10 lợi suất. */
const CLOSES_VI_DU_11 = [...CLOSES_VI_DU, 27_100] as const;

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

/** Sáu phiên giá thật của một cổ phiếu tầm 26–27 nghìn đồng, dùng cho ví dụ trên màn. */
const BARS_VI_DU: ReadonlyArray<SeriesRow> = [
  bar('02/06', 26_100, 26_300, 25_900, 26_200, 1_200_000),
  bar('03/06', 26_200, 26_600, 26_150, 26_550, 1_500_000),
  bar('04/06', 26_500, 26_700, 26_300, 26_400, 1_100_000),
  bar('05/06', 26_400, 26_500, 26_000, 26_050, 1_800_000),
  bar('06/06', 26_050, 26_400, 25_850, 26_350, 1_400_000),
  bar('09/06', 26_400, 26_900, 26_300, 26_800, 2_600_000),
];

/*
 * ── 1. Dải Bollinger trên ──────────────────────────────────────────────────────────────
 */

export const DAI_BOLLINGER_TREN: FormulaModule = {
  spec: {
    id: 'dai-bollinger-tren',
    categoryId: 'technical',
    name: { vi: 'Dải Bollinger trên', en: 'Upper Bollinger band' },
    description: 'Mức giá nằm trên đường trung bình đúng k lần độ lệch chuẩn của chính chuỗi giá.',
    latex: 'BB_{tren} = SMA_{n} + k \\cdot \\sigma_{n}',
    expression: 'Dải trên = Trung bình n phiên + Hệ số k × Độ lệch chuẩn mẫu của n phiên đó',
    chartType: 'candlestick',
    level: 'basic',
    tags: ['bollinger', 'dai tren', 'upper band', 'bien dong', 'ky thuat'],
    resultUnit: '₫',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning:
        'Ranh giới trên của vùng giá "bình thường": dải tự nở ra khi thị trường động và tự co lại khi thị trường lặng, vì bề rộng của nó chính là độ lệch chuẩn của giá.',
      whenToUse:
        'Khi muốn biết giá hiện tại đã cao tới đâu so với chính nó vài tuần gần đây, thay vì so với một mốc cố định.',
      howToRead:
        'Giá chạm hoặc vượt dải trên nghĩa là đang ở mép trên vùng dao động quen thuộc — trong xu hướng tăng mạnh, giá có thể bám dải trên rất lâu.',
      commonMistakes:
        'Coi chạm dải trên là tín hiệu bán. Bollinger nói rõ dải chỉ mô tả vùng giá, không phải lệnh mua bán. Ngoài ra độ lệch chuẩn ở đây chia cho n−1, một số bảng giá chia cho n nên dải của họ hẹp hơn chút ít.',
    },
    example: {
      title: 'Mười phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, chu kỳ 10, k = 2',
      inputs: { period: 10, k: 2 },
      series: CLOSES_VI_DU,
      expected: 27_375.81,
      note: 'Đường giữa là 26.570 ₫, độ lệch chuẩn mẫu 402,91 ₫ nên dải trên cách đường giữa hơn 800 ₫. Ví dụ rút gọn còn 10 phiên cho dễ đối chiếu; mặc định trên màn là 20 phiên.',
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
      return periodTooShort(unit, 2, 'Một phiên thì không có độ phân tán nào để đo');
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
    description: 'Mức giá nằm dưới đường trung bình đúng k lần độ lệch chuẩn của chính chuỗi giá.',
    latex: 'BB_{duoi} = SMA_{n} - k \\cdot \\sigma_{n}',
    expression: 'Dải dưới = Trung bình n phiên − Hệ số k × Độ lệch chuẩn mẫu của n phiên đó',
    chartType: 'candlestick',
    level: 'basic',
    tags: ['bollinger', 'dai duoi', 'lower band', 'bien dong', 'ky thuat'],
    resultUnit: '₫',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning:
        'Ranh giới dưới của vùng giá "bình thường", đối xứng với dải trên qua đường trung bình n phiên.',
      whenToUse:
        'Khi tìm mốc tham chiếu cho vùng giá thấp bất thường so với chính cổ phiếu đó trong vài tuần gần đây.',
      howToRead:
        'Giá thủng dải dưới nghĩa là đang ở mép dưới vùng dao động quen thuộc; trong xu hướng giảm, giá có thể bám dải dưới suốt nhiều phiên chứ không bật lên ngay.',
      commonMistakes:
        'Mua chỉ vì giá chạm dải dưới. Dải mô tả độ phân tán của giá, không nói gì về việc doanh nghiệp đang tốt hay xấu — chạm dải dưới trong xu hướng giảm là chuyện bình thường.',
    },
    example: {
      title: 'Mười phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, chu kỳ 10, k = 2',
      inputs: { period: 10, k: 2 },
      series: CLOSES_VI_DU,
      expected: 25_764.19,
      note: 'Giá đóng cửa mới nhất 27.200 ₫ đang nằm gần dải trên, cách dải dưới gần 1.400 ₫.',
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
      return periodTooShort(unit, 2, 'Một phiên thì không có độ phân tán nào để đo');
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
    description: 'Khoảng cách giữa hai dải, quy ra phần trăm của đường giữa để so được các mã.',
    latex: 'BW = \\frac{BB_{tren} - BB_{duoi}}{SMA_{n}} \\times 100',
    expression: 'Độ rộng dải = (Dải trên − Dải dưới) ÷ Đường giữa × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bollinger', 'do rong dai', 'bandwidth', 'that nut', 'squeeze', 'bien dong'],
    resultUnit: '%',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning:
        'Một con số cho biết dải đang nở hay đang bóp: chia cho đường giữa nên cổ phiếu 10 nghìn và cổ phiếu 200 nghìn so với nhau được.',
      whenToUse:
        'Khi rà tìm những mã đang "thắt nút" — biến động co lại rất hẹp, thường đi trước một nhịp giá mạnh mà không nói trước hướng nào.',
      howToRead:
        'Con số càng nhỏ thì giá càng lặng. So với chính mã đó vài tháng trước mới có nghĩa; không có ngưỡng chung cho mọi cổ phiếu.',
      commonMistakes:
        'Đoán hướng từ độ rộng. Dải bóp chỉ nói biến động đang thấp, hoàn toàn không nói giá sắp lên hay xuống. Cũng đừng so độ rộng của hai mã có chu kỳ tính khác nhau.',
    },
    example: {
      title: 'Mười phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, chu kỳ 10, k = 2',
      inputs: { period: 10, k: 2 },
      series: CLOSES_VI_DU,
      expected: 6.07,
      note: 'Hai dải cách nhau khoảng 1.612 ₫, bằng 6,07% của đường giữa 26.570 ₫.',
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
      return periodTooShort(unit, 2, 'Một phiên thì không có độ phân tán nào để đo');
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
    description:
      'Biên độ một phiên thường đi được bao nhiêu đồng, đã tính cả khoảng nhảy giá so với phiên trước.',
    latex:
      'TR_t = \\max(H_t - L_t,\\ |H_t - C_{t-1}|,\\ |L_t - C_{t-1}|), \\quad ATR_t = \\frac{(n-1) ATR_{t-1} + TR_t}{n}',
    expression:
      'Dao động thực = số lớn nhất trong (Cao − Thấp), (Cao − Đóng cửa phiên trước), (Đóng cửa phiên trước − Thấp); ATR = trung bình làm mượt Wilder của dao động thực',
    chartType: 'candlestick',
    level: 'basic',
    tags: ['atr', 'dao dong thuc', 'true range', 'wilder', 'bien do', 'cat lo'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', 'Chu kỳ ATR', 'phiên', 14, 5, 50, 1, {
        description:
          'Wilder dùng 14 phiên. Chuỗi phải có ít nhất chu kỳ + 1 phiên, vì phiên đầu tiên chưa có giá đóng cửa hôm trước để tính dao động thực.',
      }),
    ],
    explanation: {
      meaning:
        'Thước đo biên độ một phiên tính bằng đồng, cộng cả phần giá nhảy qua đêm — nên nó phản ánh rủi ro thật hơn là lấy giá cao trừ giá thấp.',
      whenToUse:
        'Khi đặt khoảng cắt lỗ hoặc tính cỡ lệnh: cắt lỗ hẹp hơn một ATR gần như chắc chắn bị quét bởi dao động thường ngày.',
      howToRead:
        'ATR là số tiền, không phải phần trăm và không có hướng — ATR cao chỉ nghĩa là biên độ rộng, không nói giá đang lên hay xuống.',
      commonMistakes:
        'So ATR giữa hai mã có thị giá khác xa nhau: 500 ₫ trên cổ phiếu 26.000 ₫ khác hẳn 500 ₫ trên cổ phiếu 200.000 ₫. Muốn so thì chia ATR cho giá.',
    },
    example: {
      title: 'Sáu phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, chu kỳ 5',
      inputs: { period: 5 },
      bars: BARS_VI_DU,
      expected: 500,
      note: 'Mỗi phiên cổ phiếu này đi trung bình 500 ₫ biên độ thật. Ví dụ rút gọn còn 5 phiên cho dễ tính tay; mặc định trên màn là 14 phiên theo Wilder.',
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
      return periodTooShort(unit, 1, 'ATR là trung bình của ít nhất một dao động thực');
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
    description: 'Giá đóng cửa đang nằm ở đâu giữa hai dải: 0% là dải dưới, 100% là dải trên.',
    latex: '\\%B = \\frac{C - BB_{duoi}}{BB_{tren} - BB_{duoi}} \\times 100',
    expression: '%B = (Giá đóng cửa − Dải dưới) ÷ (Dải trên − Dải dưới) × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bollinger', 'phan tram b', 'percent b', 'vi tri gia', 'ky thuat'],
    resultUnit: '%',
    variables: [BOLLINGER_PERIOD, BOLLINGER_K],
    explanation: {
      meaning:
        'Quy vị trí của giá trong dải về một thang chung: 0% là đúng dải dưới, 50% là đường giữa, 100% là đúng dải trên.',
      whenToUse:
        'Khi cần so vị trí giá giữa nhiều mã có thị giá khác nhau, hoặc khi lọc cổ phiếu theo mức "cao trong dải" mà không phải nhìn từng biểu đồ.',
      howToRead:
        'Trên 100% nghĩa là giá đã vượt hẳn dải trên, dưới 0% là đã thủng dải dưới — hai trạng thái này hoàn toàn xảy ra được, không phải lỗi.',
      commonMistakes:
        'Đọc %B như một chỉ báo quá mua quá bán kiểu RSI. Nó chỉ nói vị trí tương đối trong dải; giá trong xu hướng mạnh có thể ở trên 100% nhiều phiên liền.',
    },
    example: {
      title: 'Mười phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, chu kỳ 10, k = 2',
      inputs: { period: 10, k: 2 },
      series: CLOSES_VI_DU,
      expected: 89.09,
      note: 'Giá đóng cửa 27.200 ₫ nằm ở 89% chiều rộng dải, tức sát mép trên nhưng chưa vượt.',
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
      return periodTooShort(unit, 2, 'Một phiên thì không có độ phân tán nào để đo');
    }

    const k = v('k');
    if (k <= 0) {
      return fail(
        unit,
        meaningless(
          'Hệ số nhân bằng 0 hoặc âm làm hai dải trùng vào đường giữa, không còn khoảng nào để xác định vị trí giá.',
          'Nhập hệ số nhân lớn hơn 0; Bollinger dùng 2.',
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
          '%B',
          'bề rộng dải',
          'Chuỗi giá đang phẳng lì nên hai dải trùng nhau — nạp chuỗi có dao động thật.',
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
    description:
      'Giá đóng cửa đang ở đâu trong khoảng cao nhất – thấp nhất của n phiên gần nhất, tính theo phần trăm.',
    latex: '\\%K = \\frac{C - L_{n}}{H_{n} - L_{n}} \\times 100',
    expression:
      '%K = (Giá đóng cửa − Giá thấp nhất n phiên) ÷ (Giá cao nhất n phiên − Giá thấp nhất n phiên) × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['stochastic', 'phan tram k', 'dao dong', 'qua mua', 'qua ban', 'ky thuat'],
    resultUnit: '%',
    variables: [
      sliderVar('period', 'Chu kỳ stochastic', 'phiên', 14, 5, 50, 1, {
        description:
          'Số phiên lấy đỉnh và đáy để so. Thông lệ là 14 phiên; chuỗi phải có ít nhất bấy nhiêu phiên đủ giá cao – thấp – đóng cửa.',
      }),
    ],
    explanation: {
      meaning:
        'Ý tưởng gốc: khi thị trường mạnh, giá đóng cửa có xu hướng nằm gần đỉnh của biên độ gần đây; khi yếu thì nằm gần đáy.',
      whenToUse:
        'Khi thị trường đi ngang trong một biên độ và cần biết giá đang ở mép trên hay mép dưới của biên độ đó.',
      howToRead:
        'Trên 80% là đóng cửa sát đỉnh của n phiên, dưới 20% là sát đáy. Đây là hai mốc quy ước phổ biến chứ không phải ngưỡng mua bán.',
      commonMistakes:
        'Bán ngay khi %K trên 80 trong một xu hướng tăng mạnh — chỉ báo này có thể nằm trên 80 rất lâu. Nó chỉ dùng tốt khi giá dao động trong biên độ.',
    },
    example: {
      title: 'Sáu phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, chu kỳ 5',
      inputs: { period: 5 },
      bars: BARS_VI_DU,
      expected: 90.48,
      note: 'Năm phiên gần nhất dao động 25.850–26.900 ₫, đóng cửa 26.800 ₫ tức gần sát đỉnh.',
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
      return periodTooShort(unit, 1, 'Phải có ít nhất một phiên để lấy đỉnh và đáy');
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
          '%K',
          'biên độ n phiên',
          'Giá cao nhất đang bằng giá thấp nhất — chuỗi toàn phiên kịch trần hoặc kịch sàn, chọn chu kỳ dài hơn.',
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
    description:
      'Giá trung bình của n phiên gần nhất, nhưng phiên khớp nhiều cổ phiếu được tính nặng hơn.',
    latex: 'VWAP = \\frac{\\sum C_i V_i}{\\sum V_i}',
    expression: 'VWAP = Tổng (Giá đóng cửa × Khối lượng) ÷ Tổng Khối lượng',
    chartType: 'candlestick',
    level: 'basic',
    tags: ['vwap', 'gia binh quan', 'khoi luong', 'volume weighted', 'ky thuat'],
    resultUnit: '₫',
    variables: [
      sliderVar('period', 'Số phiên gộp', 'phiên', 20, 5, 120, 1, {
        description:
          'Số phiên gần nhất đưa vào bình quân. Mỗi phiên phải có đủ giá đóng cửa và khối lượng.',
      }),
    ],
    explanation: {
      meaning:
        'Mức giá mà phần lớn cổ phiếu thực sự đổi chủ trong kỳ — sát với giá vốn bình quân của thị trường hơn là trung bình cộng thông thường.',
      whenToUse:
        'Khi đánh giá một lần mua bán lớn đã khớp tốt hay xấu so với mặt bằng, hoặc khi tìm vùng giá được nhiều người mua nhất trong kỳ.',
      howToRead:
        'Giá hiện tại trên VWAP nghĩa là phần đông người mua trong kỳ đang có lãi; dưới VWAP thì ngược lại.',
      commonMistakes:
        'Nhầm với VWAP trong phiên của bảng giá: bản trong phiên tính theo từng lệnh khớp và giá điển hình (cao + thấp + đóng) chia 3, còn công thức này gộp theo PHIÊN và dùng giá đóng cửa, nên hai con số không trùng nhau.',
    },
    example: {
      title: 'Năm phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng',
      inputs: { period: 5 },
      bars: BARS_VI_DU,
      expected: 26_467.26,
      note: 'Phiên khớp 2,6 triệu cổ phiếu ở 26.800 ₫ kéo bình quân lên, dù có phiên đóng cửa chỉ 26.050 ₫.',
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
      return periodTooShort(unit, 1, 'Bình quân cần ít nhất một phiên');
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
          'VWAP',
          'tổng khối lượng',
          'Các phiên đang chọn đều có khối lượng bằng 0 — kiểm tra lại cột khối lượng của bảng dữ liệu.',
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
    description:
      'Độ lệch chuẩn của lợi suất log hằng phiên, quy về mức tương đương cả năm bằng căn bậc hai số phiên.',
    latex:
      '\\sigma_{nam} = \\sigma\\left(\\ln \\frac{P_t}{P_{t-1}}\\right) \\times \\sqrt{N} \\times 100',
    expression:
      'Độ biến động năm = Độ lệch chuẩn mẫu của lợi suất log mỗi phiên × căn bậc hai của Số phiên một năm × 100',
    chartType: 'histogram',
    level: 'advanced',
    tags: ['do bien dong', 'volatility', 'nam hoa', 'loi suat log', 'rui ro', 'ky thuat'],
    resultUnit: '%/năm',
    variables: [
      sliderVar('sample', 'Số phiên giá lấy mẫu', 'phiên', 60, 10, 250, 1, {
        description:
          'N phiên giá cho N−1 lợi suất. Giáo trình khuyên lấy ít nhất 60 phiên; dưới 20 phiên con số nhảy rất mạnh theo vài phiên cá biệt.',
      }),
      sliderVar('tradingDays', 'Số phiên giao dịch một năm', 'phiên', 252, 200, 366, 1, {
        description:
          'Thông lệ quốc tế là 252 phiên. HOSE thường có khoảng 248–250 phiên mỗi năm sau khi trừ nghỉ lễ.',
      }),
    ],
    explanation: {
      meaning:
        'Một con số duy nhất cho biết giá cổ phiếu dao động mạnh cỡ nào, quy về thang năm để so được với lãi suất và với các mã khác.',
      whenToUse:
        'Khi cần định lượng rủi ro biến động của một mã trước khi vào lệnh, hoặc khi cần tham số độ biến động cho các mô hình định giá quyền chọn.',
      howToRead:
        '40%/năm nghĩa là trong khoảng hai phần ba số năm, lợi suất một năm nằm trong khoảng cộng trừ 40% quanh mức trung bình — nếu lợi suất phân phối chuẩn, giả định vốn dĩ chỉ đúng gần đúng.',
      commonMistakes:
        'Quy năm bằng cách nhân với số phiên thay vì nhân với CĂN BẬC HAI của số phiên. Và đây là biến động ĐÃ XẢY RA, không phải dự báo cho kỳ tới.',
    },
    example: {
      title: 'Mười một phiên gần nhất của cổ phiếu tầm 26–27 nghìn đồng, lấy mẫu 10 phiên',
      inputs: { sample: 10, tradingDays: 252 },
      series: CLOSES_VI_DU_11,
      expected: 11.53,
      note: 'Mỗi phiên chỉ nhúc nhích vài phần nghìn, nhưng nhân với căn của 252 phiên thì thành hơn 11%/năm. Ví dụ rút gọn còn 10 phiên cho dễ đối chiếu; mặc định trên màn là 60 phiên.',
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
      return periodTooShort(unit, 3, 'Độ lệch chuẩn mẫu cần ít nhất hai lợi suất');
    }

    const days = v('tradingDays');
    if (days <= 0) {
      return fail(
        unit,
        meaningless(
          'Số phiên giao dịch một năm phải lớn hơn 0 thì mới quy được độ biến động về thang năm.',
          'Nhập 252 theo thông lệ quốc tế, hoặc 250 cho lịch giao dịch trong nước.',
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
    description:
      'Khối lượng phiên gần nhất gấp bao nhiêu lần khối lượng trung bình n phiên liền trước.',
    latex: 'RVOL = \\frac{V_t}{\\frac{1}{n}\\sum_{i=1}^{n} V_{t-i}}',
    expression:
      'Tỷ lệ khối lượng = Khối lượng phiên gần nhất ÷ Trung bình khối lượng n phiên liền trước',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['khoi luong', 'volume', 'thanh khoan', 'relative volume', 'dot bien', 'ky thuat'],
    resultUnit: 'lần',
    variables: [
      sliderVar('period', 'Số phiên lấy trung bình', 'phiên', 20, 5, 120, 1, {
        description:
          'Số phiên LIỀN TRƯỚC phiên gần nhất dùng làm mốc so sánh. Chuỗi phải có ít nhất số phiên đó cộng thêm phiên gần nhất.',
      }),
    ],
    explanation: {
      meaning:
        'Đo mức bất thường của thanh khoản: phiên gần nhất đang giao dịch sôi động hay ảm đạm so với mặt bằng chính nó vài tuần qua.',
      whenToUse:
        'Khi cần xác nhận một phiên phá vỡ vùng giá — cùng một mức tăng giá, phiên có khối lượng gấp mấy lần bình thường đáng tin hơn phiên khối lượng lèo tèo.',
      howToRead:
        'Bằng 1 lần là đúng mức trung bình, 2 lần là gấp đôi. Chỉ số này không có hướng: khối lượng đột biến đi kèm giá giảm mạnh lại là dấu hiệu bán tháo.',
      commonMistakes:
        'Tính trung bình có gộp cả phiên gần nhất — làm vậy thì chính phiên đột biến kéo mốc so sánh lên và tỷ lệ bị nén lại. Ở đây mốc chỉ gồm các phiên LIỀN TRƯỚC.',
    },
    example: {
      title: 'Phiên gần nhất so với trung bình 5 phiên liền trước',
      inputs: { period: 5 },
      bars: BARS_VI_DU,
      expected: 1.86,
      note: 'Phiên gần nhất khớp 2,6 triệu cổ phiếu, gần gấp đôi mức trung bình 1,4 triệu của năm phiên trước đó.',
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
      return periodTooShort(unit, 1, 'Mốc so sánh cần ít nhất một phiên');
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
          'tỷ lệ khối lượng',
          'khối lượng trung bình',
          'Các phiên làm mốc đều có khối lượng bằng 0 — kiểm tra lại cột khối lượng của bảng dữ liệu.',
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
