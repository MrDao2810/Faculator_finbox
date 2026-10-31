/**
 * Tầng DOMAIN — hai hình THEO CHUỖI GIÁ của ô "Xem theo" (21/10/2026, đợt C của việc thêm dạng vẽ).
 *
 *   - **Phân phối lợi suất** (`HistogramChart`): lợi suất từng phiên chia khoảng, đếm số phiên mỗi
 *     khoảng. Cho 12 công thức đọc PHÂN PHỐI ấy ra một con số: VaR, CVaR, các độ lệch chuẩn, hệ số
 *     biến thiên, Sharpe, Sortino, Treynor, tỷ số thông tin, thắng/thua, và (26/10/2026) độ biến
 *     động lịch sử — công thức duy nhất chia LỢI SUẤT LOG (`SeriesViewSpec.logReturns`).
 *   - **Đường sụt giảm** (`LineChart` với `sweepKey = DRAWDOWN_KEY`): mức sụt so với đỉnh đã qua, ở
 *     từng phiên. Cho 4 công thức đọc đường ấy: sụt giảm sâu nhất, sụt giảm hiện tại, chuỗi phiên
 *     giảm dài nhất, Calmar.
 *
 * Cả hai chỉ có khi chuỗi đã nạp đủ phiên, và vẽ ĐÚNG cửa sổ phiên mà `calc` dùng — khai ở
 * `spec.seriesView`, gác bằng `series-view.test.ts`. Hình quét độ nhạy của những công thức này
 * ("VaR theo Số phiên nhìn lại") vẫn còn nguyên; đây là mục thêm, không phải mục thay.
 *
 * Khung "?" (hướng dẫn) IM LẶNG với hai mục này — chủ dự án chốt "hướng dẫn sử dụng thì chưa cần" —
 * thay vì rơi về chữ của một hình khác; xem `HinhDangXem.hinhChuoi`.
 */

import type { CalcContext, CalcInputs } from '../calc/types';
import type { Bilingual, CalcOutput } from '../types';
import { formatNumber, formatValueWithUnit } from '../format';
import {
  logReturns,
  mean,
  simpleReturns,
  usableCloses,
  usableMarketCloses,
} from '../formulas/series-utils';
import type { SeriesViewSpec } from '../registry/types';

import { COMPONENTS_KEY, formatSessionDate } from './history';
import { decimalsOf, extentOf, niceAxis, niceStep } from './scale';
import { condensePoints } from './table';
import type {
  ChartAxis,
  ChartPoint,
  ChartTable,
  HistogramBin,
  HistogramChart,
  HistogramMarker,
  LineChart,
  ScatterChart,
  ScatterFit,
  ScatterPoint,
  SweepOption,
} from './types';

/** Khoá các mục trong ô "Xem theo" — hai gạch dưới đầu, cùng nếp `HISTORY_KEY`. */
export const DISTRIBUTION_KEY = '__distribution';
export const DRAWDOWN_KEY = '__drawdown';
export const SCATTER_KEY = '__scatter';

export const DISTRIBUTION_LABEL: Bilingual = {
  vi: 'Phân phối lợi suất',
  en: 'Return distribution',
};
export const DRAWDOWN_LABEL: Bilingual = { vi: 'Đường sụt giảm', en: 'Drawdown curve' };
export const SCATTER_LABEL: Bilingual = { vi: 'Phân tán lợi suất', en: 'Return scatter' };

/**
 * Khoá có phải một trong các mục CHỈ CÓ khi đã nạp chuỗi giá không — ba hình của file này, và (từ
 * 26/10/2026) các đường thành phần của `history.ts`. Khung "?" im với cả bốn: chưa có chữ hướng dẫn.
 */
export function laHinhChuoiGia(khoa: string | null | undefined): boolean {
  return (
    khoa === DISTRIBUTION_KEY ||
    khoa === DRAWDOWN_KEY ||
    khoa === SCATTER_KEY ||
    khoa === COMPONENTS_KEY
  );
}

/** Khoá và nhãn của mục mà công thức khai. */
export function seriesViewOption(view: SeriesViewSpec): SweepOption {
  if (view.kind === 'scatter') return { key: SCATTER_KEY, label: SCATTER_LABEL };
  return view.kind === 'distribution'
    ? { key: DISTRIBUTION_KEY, label: DISTRIBUTION_LABEL }
    : { key: DRAWDOWN_KEY, label: DRAWDOWN_LABEL };
}

/** Cửa sổ phiên đã chọn: giá đóng cửa và ngày (nếu chuỗi có ngày) của đúng những phiên `calc` đọc. */
export interface CuaSoPhien {
  closes: ReadonlyArray<number>;
  /** Ngày của từng phiên, hoặc `null` khi chuỗi không đi kèm ngày (dán một cột, ca kiểm). */
  dates: ReadonlyArray<string> | null;
  /**
   * Chỉ hình phân tán: giá VN-Index của CÙNG số phiên cuối, ghép với `closes` theo vị trí từ cuối —
   * đúng cách `beta` ghép hai chuỗi (`slice(-n)` ở cả hai).
   */
  marketCloses?: ReadonlyArray<number>;
}

/**
 * Cửa sổ phiên của hình, hoặc `null` khi chuỗi chưa đủ phiên — điều kiện để mục có mặt trong ô chọn.
 *
 * Phải là cùng một phép cắt với `windowOf()` / `windowCloses()` bên `formulas/`: lấy
 * `max(min, round(ô))` phiên CUỐI của `usableCloses(ctx)` — và với `fullWindow` (họ `windowCloses()`,
 * vốn đòi đủ ô) thì chuỗi ngắn hơn ô là không có cửa sổ. Hai hàm ấy không xuất ra (mỗi file giữ
 * bản của mình), nên bản này được giữ đúng bằng ca kiểm nhiễu ở `series-view.test.ts` chứ không
 * bằng cách gọi chung.
 */
export function seriesWindow(
  view: SeriesViewSpec,
  inputs: CalcInputs,
  ctx: CalcContext,
): CuaSoPhien | null {
  const closes = usableCloses(ctx);
  if (closes.length < view.min) return null;

  /*
   * Ô cửa sổ đang trống (hay không phải số) thì `calc` báo thiếu số liệu, không tính — hình cũng
   * không có cửa sổ để vẽ: vẽ cả chuỗi ở đó là vẽ một thứ `calc` không hề đọc.
   */
  let size = closes.length;
  if (view.lookbackKey !== undefined) {
    const raw = inputs[view.lookbackKey];
    if (raw === undefined || !Number.isFinite(raw)) return null;
    const can = Math.max(view.min, Math.round(raw));
    /* `calc` đòi đủ `can` phiên (cờ `fullWindow`) thì thiếu là không có cửa sổ — không vẽ thay nó. */
    if (view.fullWindow === true && closes.length < can) return null;
    size = Math.min(closes.length, can);
  }
  const window = closes.slice(-size);

  /*
   * Hình phân tán cần thêm VN-Index đủ CÙNG số phiên — `beta` đòi đủ ở cả hai chuỗi
   * (`requireMarketCloses()`), nên thiếu ở chuỗi chỉ số là không có cửa sổ, như `calc` báo thiếu.
   */
  let marketCloses: ReadonlyArray<number> | undefined;
  if (view.kind === 'scatter') {
    const thiTruong = usableMarketCloses(ctx);
    if (thiTruong.length < size) return null;
    marketCloses = thiTruong.slice(-size);
  }

  /*
   * Ngày chỉ ghép được khi chuỗi phiên có cùng số dòng dùng được với chuỗi giá: `usableCloses()` đọc
   * `ctx.series` trước `ctx.bars`, và hai thứ ấy có thể lệch nhau ở những ca dựng tay. Lệch thì
   * không đoán — nhãn phiên đánh số.
   */
  const bars = (ctx.bars ?? []).filter(
    (bar) => typeof bar.close === 'number' && Number.isFinite(bar.close) && bar.close > 0,
  );
  const dates = bars.length === closes.length ? bars.slice(-size).map((bar) => bar.date) : null;

  return marketCloses === undefined
    ? { closes: window, dates }
    : { closes: window, dates, marketCloses };
}

/** Nhãn một phiên trong cửa sổ: ngày thật khi có, không thì số thứ tự. */
function nhanPhien(cuaSo: CuaSoPhien, index: number): string {
  const date = cuaSo.dates?.[index];
  return date === undefined ? `Phiên ${String(index + 1)}` : formatSessionDate(date);
}

/** Vạch trục cho cửa sổ phiên: tối đa `target` vạch, luôn có phiên đầu và phiên cuối. */
function vachPhien(cuaSo: CuaSoPhien, target = 4): ChartAxis['ticks'] {
  const total = cuaSo.closes.length;
  if (total === 0) return [];
  const count = Math.max(2, Math.min(target, total));
  const seen = new Set<number>();
  const ticks: Array<{ value: number; label: string }> = [];
  for (let i = 0; i < count; i += 1) {
    const index = total === 1 ? 0 : Math.round((i * (total - 1)) / (count - 1));
    if (seen.has(index)) continue;
    seen.add(index);
    const date = cuaSo.dates?.[index];
    ticks.push({
      value: index,
      label: date === undefined ? String(index + 1) : thangNam(date),
    });
  }
  return ticks;
}

/** 'MM/YYYY' của một ngày phiên, cùng nhãn vạch của đường theo thời gian. */
function thangNam(raw: string): string {
  const hien = formatSessionDate(raw);
  const [, thang, nam] = hien.split('/');
  return thang === undefined || nam === undefined ? hien : `${thang}/${nam}`;
}

/** Trục đếm hoặc trục phần trăm, chia vạch bằng `niceAxis()`; nhãn là số trần, không chia bậc. */
function trucDon(lo: number, hi: number, title: Bilingual, target = 5): ChartAxis {
  const nice = niceAxis(lo, hi, target);
  return {
    title,
    domain: nice.domain,
    ticks: nice.ticks.map((value) => ({
      value,
      label: formatNumber(value, { maxDecimals: nice.decimals }),
    })),
  };
}

/*
 * ── Phân phối lợi suất ─────────────────────────────────────────────────────────────────────────
 */

/** Số khoảng nhắm tới: chuỗi ngắn (60 phiên của VaR) chia thưa hơn chuỗi 250 phiên. */
function soKhoangNham(soLoiSuat: number): number {
  return soLoiSuat <= 80 ? 8 : 12;
}

/** Chia lợi suất (theo %) thành các khoảng đều, mép khoảng là bội của một bước đẹp, 0 luôn là một mép. */
function chiaKhoang(loiSuat: ReadonlyArray<number>): ReadonlyArray<HistogramBin> {
  const ext = extentOf(loiSuat);
  if (ext === null) return [];

  const [min, max] = ext;
  const step = niceStep((max - min) / soKhoangNham(loiSuat.length) || 1);
  const lo = Math.floor(min / step + 1e-9) * step;
  let hi = Math.ceil(max / step - 1e-9) * step;
  if (hi <= lo) hi = lo + step;
  const n = Math.max(1, Math.round((hi - lo) / step));
  const dec = decimalsOf(step);

  const counts = new Array<number>(n).fill(0);
  for (const r of loiSuat) {
    const index = Math.min(n - 1, Math.max(0, Math.floor((r - lo) / step + 1e-9)));
    counts[index] = (counts[index] ?? 0) + 1;
  }

  const fmt = (value: number) => formatNumber(value, { maxDecimals: dec, signed: true });
  return counts.map((count, index) => {
    const from = Number((lo + index * step).toFixed(Math.max(dec, 6)));
    const to = Number((lo + (index + 1) * step).toFixed(Math.max(dec, 6)));
    return {
      from,
      to,
      count,
      label: {
        vi: `từ ${fmt(from)} % tới ${fmt(to)} %`,
        en: `from ${fmt(from)} % to ${fmt(to)} %`,
      },
      countLabel: formatValueWithUnit(count, 'phiên'),
    };
  });
}

/**
 * Dựng histogram lợi suất phiên cho một công thức.
 *
 * Hai vạch dọc: lợi suất bình quân của chính cửa sổ (luôn có), và −kết quả khi công thức khai
 * `resultIsLoss` và kết quả đang tính được — kết quả lỗi thì không có vạch, không có số thay thế
 * (FR-06).
 */
export function buildDistributionModel(
  view: SeriesViewSpec,
  cuaSo: CuaSoPhien,
  output: CalcOutput,
  name: Bilingual,
  options: ReadonlyArray<SweepOption>,
  seriesLabel?: string,
): HistogramChart {
  /* Lợi suất log khi công thức tính trên dãy ấy (độ biến động lịch sử): hình chia đúng dãy `calc` đọc. */
  const log = view.logReturns === true;
  const loiSuat = (log ? logReturns(cuaSo.closes) : simpleReturns(cuaSo.closes)).map(
    (r) => r * 100,
  );
  const bins = chiaKhoang(loiSuat);
  const dau = bins[0];
  const cuoi = bins[bins.length - 1];
  const maxCount = Math.max(1, ...bins.map((bin) => bin.count));

  const x: ChartAxis = {
    title: log
      ? { vi: 'Lợi suất log một phiên (%)', en: 'Log return per session (%)' }
      : { vi: 'Lợi suất một phiên (%)', en: 'Return per session (%)' },
    domain: dau === undefined || cuoi === undefined ? [0, 1] : [dau.from, cuoi.to],
    /* Vạch ở mép khoảng, thưa còn tối đa bảy vạch để nhãn không chồng nhau ở khổ 320. */
    ticks: (() => {
      if (dau === undefined) return [];
      const meps = [...bins.map((bin) => bin.from), bins[bins.length - 1]?.to ?? dau.to];
      const stride = Math.max(1, Math.ceil((meps.length - 1) / 6));
      const dec = decimalsOf(meps[1] !== undefined ? meps[1] - (meps[0] ?? 0) : 1);
      return meps
        .filter((_, index) => index % stride === 0 || index === meps.length - 1)
        .map((value) => ({ value, label: formatNumber(value, { maxDecimals: dec }) }));
    })(),
  };
  /* Trục đếm: sàn 4 để bước vạch không bao giờ dưới 1 — "0,5 phiên" không phải một số phiên. */
  const y = trucDon(0, Math.max(4, maxCount), { vi: 'Số phiên', en: 'Sessions' }, 4);

  const binhQuan =
    loiSuat.length === 0 ? null : loiSuat.reduce((sum, r) => sum + r, 0) / loiSuat.length;
  const markers: HistogramMarker[] = [];
  if (binhQuan !== null) {
    markers.push({
      value: binhQuan,
      label: { vi: 'Bình quân', en: 'Average' },
      valueLabel: formatValueWithUnit(binhQuan, '%'),
    });
  }
  if (view.resultIsLoss === true && output.value !== null && Number.isFinite(output.value)) {
    markers.push({
      value: -output.value,
      label: name,
      valueLabel: formatValueWithUnit(-output.value, '%'),
    });
  }

  const table: ChartTable = {
    columns: [
      log
        ? { vi: 'Khoảng lợi suất log', en: 'Log return range' }
        : { vi: 'Khoảng lợi suất', en: 'Return range' },
      { vi: 'Số phiên', en: 'Sessions' },
    ],
    rows: bins.map((bin) => [bin.label, bin.countLabel] as const),
  };

  const dongNhat = bins.reduce<HistogramBin | undefined>(
    (best, bin) => (best === undefined || bin.count > best.count ? bin : best),
    undefined,
  );
  const tuToi =
    cuaSo.closes.length === 0
      ? ''
      : `${nhanPhien(cuaSo, 0)} → ${nhanPhien(cuaSo, cuaSo.closes.length - 1)}`;
  const ten = seriesLabel === undefined ? '' : ` của ${seriesLabel}`;
  const tenEn = seriesLabel === undefined ? '' : ` for ${seriesLabel}`;

  const loaiVi = log ? 'lợi suất log' : 'lợi suất';
  const loaiEn = log ? 'log returns' : 'returns';
  const summaryVi = [
    `Phân phối ${String(loiSuat.length)} ${loaiVi} phiên${ten}, ${tuToi}, chia ${String(bins.length)} khoảng.`,
    dongNhat === undefined
      ? ''
      : `Đông nhất là khoảng ${dongNhat.label.vi} với ${dongNhat.countLabel}.`,
    ...markers.map((marker) => `${marker.label.vi}: ${marker.valueLabel}.`),
  ];
  const summaryEn = [
    `Distribution of ${String(loiSuat.length)} session ${loaiEn}${tenEn}, ${tuToi}, in ${String(bins.length)} ranges.`,
    dongNhat === undefined
      ? ''
      : `The fullest range is ${dongNhat.label.en} with ${dongNhat.countLabel.replace('phiên', 'sessions')}.`,
    ...markers.map((marker) => `${marker.label.en}: ${marker.valueLabel}.`),
  ];

  return {
    kind: 'histogram',
    title: {
      vi: `${name.vi} — phân phối ${loaiVi} phiên`,
      en: `${name.en} — distribution of session ${loaiEn}`,
    },
    summary: {
      vi: summaryVi.filter((s) => s !== '').join(' '),
      en: summaryEn.filter((s) => s !== '').join(' '),
    },
    x,
    y,
    bins,
    markers,
    table,
    options,
    sweepKey: DISTRIBUTION_KEY,
  };
}

/*
 * ── Đường sụt giảm ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * Mức sụt so với đỉnh đã qua, theo %, ở từng phiên của cửa sổ — cùng vòng lặp với `maxDrawdown()`
 * bên `formulas/series-utils.ts`, chỉ khác là giữ lại từng mức thay vì mức lớn nhất.
 */
export function drawdownSeries(closes: ReadonlyArray<number>): number[] {
  let peak = Number.NEGATIVE_INFINITY;
  return closes.map((close) => {
    if (close > peak) peak = close;
    return peak > 0 ? ((peak - close) / peak) * 100 : 0;
  });
}

/** Chỉ số phiên mang dấu "giá trị hiện tại", theo `SeriesViewSpec.mark`. */
function phienDanhDau(
  view: SeriesViewSpec,
  closes: ReadonlyArray<number>,
  sut: ReadonlyArray<number>,
): number {
  const cuoi = closes.length - 1;
  if (view.mark === 'last' || view.mark === undefined) return cuoi;

  if (view.mark === 'deepest') {
    /* `>` chứ không `>=`: phiên ĐẦU TIÊN đạt mức sâu nhất, như vòng lặp của `sut-giam-sau-nhat`. */
    let best = 0;
    sut.forEach((value, index) => {
      if (value > (sut[best] ?? 0)) best = index;
    });
    return best;
  }

  /* Chuỗi giảm dài nhất, chuỗi ĐẦU TIÊN khi bằng nhau — như `chuoi-phien-giam-dai-nhat`. */
  let longest = 0;
  let current = 0;
  let end = -1;
  simpleReturns(closes).forEach((r, j) => {
    if (r < 0) {
      current += 1;
      if (current > longest) {
        longest = current;
        end = j + 1;
      }
    } else {
      current = 0;
    }
  });
  /* Không phiên giảm nào (kết quả 0 phiên) thì không có chuỗi nào để đánh dấu. */
  return end;
}

/** Dựng đường sụt giảm cho một công thức — một `LineChart` thường, chỉ khác `sweepKey`. */
export function buildDrawdownModel(
  view: SeriesViewSpec,
  cuaSo: CuaSoPhien,
  name: Bilingual,
  options: ReadonlyArray<SweepOption>,
  seriesLabel?: string,
): LineChart {
  const sut = drawdownSeries(cuaSo.closes);
  const danhDau = phienDanhDau(view, cuaSo.closes, sut);

  const points: ReadonlyArray<ChartPoint> = sut.map((value, index) => {
    const point: ChartPoint = {
      x: index,
      y: value,
      label: nhanPhien(cuaSo, index),
      valueLabel: formatValueWithUnit(value, '%'),
    };
    if (index === danhDau) point.marked = true;
    return point;
  });

  const sauNhat = Math.max(0, ...sut);
  const y = trucDon(0, Math.max(1, sauNhat), {
    vi: 'Sụt giảm so với đỉnh (%)',
    en: 'Drawdown from peak (%)',
  });
  const x: ChartAxis = {
    title: { vi: 'Ngày', en: 'Date' },
    domain: [0, Math.max(1, points.length - 1)],
    ticks: vachPhien(cuaSo),
    dates: true,
  };

  const table: ChartTable = {
    columns: [x.title, y.title],
    rows: condensePoints(points).map((point) =>
      point === null ? null : ([{ vi: point.label, en: point.label }, point.valueLabel] as const),
    ),
  };

  const diemSau = points.find((point) => point.y === sauNhat);
  const diemDau = points[danhDau];
  const cuoi = points[points.length - 1];
  const ten = seriesLabel === undefined ? '' : ` của ${seriesLabel}`;
  const tenEn = seriesLabel === undefined ? '' : ` for ${seriesLabel}`;

  const summaryVi = [
    cuoi === undefined
      ? ''
      : `Mức sụt so với đỉnh${ten} qua ${String(points.length)} phiên, từ ${points[0]?.label ?? ''} tới ${cuoi.label}.`,
    diemSau === undefined ? '' : `Sâu nhất ${diemSau.valueLabel} tại ${diemSau.label}.`,
    cuoi === undefined ? '' : `Phiên gần nhất ${cuoi.label} còn cách đỉnh ${cuoi.valueLabel}.`,
    diemDau === undefined || view.mark !== 'streakEnd'
      ? ''
      : `Chuỗi giảm dài nhất kết thúc ở ${diemDau.label}.`,
  ];
  const summaryEn = [
    cuoi === undefined
      ? ''
      : `Drawdown from the running peak${tenEn} over ${String(points.length)} sessions, from ${points[0]?.label ?? ''} to ${cuoi.label}.`,
    diemSau === undefined ? '' : `Deepest ${diemSau.valueLabel} on ${diemSau.label}.`,
    cuoi === undefined
      ? ''
      : `The most recent session ${cuoi.label} is ${cuoi.valueLabel} below the peak.`,
    diemDau === undefined || view.mark !== 'streakEnd'
      ? ''
      : `The longest losing streak ends on ${diemDau.label}.`,
  ];

  return {
    kind: 'line',
    title: { vi: `${name.vi} — đường sụt giảm`, en: `${name.en} — drawdown curve` },
    summary: {
      vi: summaryVi.filter((s) => s !== '').join(' '),
      en: summaryEn.filter((s) => s !== '').join(' '),
    },
    x,
    y,
    points,
    table,
    sweepKey: DRAWDOWN_KEY,
    options,
  };
}

/*
 * ── Phân tán lợi suất ──────────────────────────────────────────────────────────────────────────
 */

/** Lợi suất theo % kèm dấu: '+1,25 %', '−0,4 %', '0 %'. */
function phanTram(value: number): string {
  return formatValueWithUnit(value, '%', { signed: true });
}

/**
 * Dựng hình phân tán lợi suất của Beta (26/10/2026): mỗi phiên của cửa sổ `calc` một chấm, lợi suất
 * VN-Index theo trục ngang, lợi suất cổ phiếu theo trục đứng.
 *
 * Đường hồi quy dốc ĐÚNG bằng kết quả (`output.value`) và đi qua điểm bình quân của đám chấm — đó
 * là định nghĩa của đường bình phương nhỏ nhất, và là thứ Beta đo: VN-Index nhích 1 % thì cổ phiếu
 * nhích trung bình β %. Kết quả không tính được thì không có đường (FR-06), đám chấm vẫn vẽ.
 */
export function buildScatterModel(
  cuaSo: CuaSoPhien,
  output: CalcOutput,
  name: Bilingual,
  options: ReadonlyArray<SweepOption>,
  seriesLabel?: string,
): ScatterChart {
  const rm = simpleReturns(cuaSo.marketCloses ?? []).map((r) => r * 100);
  const ri = simpleReturns(cuaSo.closes).map((r) => r * 100);
  const n = Math.min(rm.length, ri.length);

  /* Lợi suất thứ k nối phiên k với phiên k + 1 — nhãn là phiên SAU, ngày lợi suất ấy chốt. */
  const points: ScatterPoint[] = [];
  for (let k = 0; k < n; k += 1) {
    const x = rm[k] ?? 0;
    const y = ri[k] ?? 0;
    points.push({ x, y, label: nhanPhien(cuaSo, k + 1), xLabel: phanTram(x), yLabel: phanTram(y) });
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const coPhieu = seriesLabel ?? 'cổ phiếu';
  const coPhieuEn = seriesLabel ?? 'the stock';

  const x = trucDon(Math.min(0, ...xs), Math.max(0, ...xs), {
    vi: 'Lợi suất VN-Index một phiên (%)',
    en: 'VN-Index return per session (%)',
  });
  const y = trucDon(Math.min(0, ...ys), Math.max(0, ...ys), {
    vi: `Lợi suất ${coPhieu} một phiên (%)`,
    en: `${seriesLabel ?? 'Stock'} return per session (%)`,
  });

  const beta = output.value;
  const fit: ScatterFit | undefined =
    beta === null || !Number.isFinite(beta) || n === 0
      ? undefined
      : {
          slope: beta,
          intercept: mean(ys) - beta * mean(xs),
          label: {
            vi: `Đường hồi quy, độ dốc β = ${formatNumber(beta)}`,
            en: `Regression line, slope β = ${formatNumber(beta)}`,
          },
        };

  /* Bảng số rút gọn như mọi bảng của biểu đồ: phiên đầu, phiên cuối và các phiên rải đều ở giữa. */
  const rutGon = condensePoints(
    points.map((point, index) => ({ x: index, y: point.y, label: point.label, valueLabel: '' })),
  );
  const table: ChartTable = {
    columns: [{ vi: 'Phiên', en: 'Session' }, x.title, y.title],
    rows: rutGon.map((dong) => {
      if (dong === null) return null;
      const point = points[dong.x];
      return point === undefined
        ? null
        : ([{ vi: point.label, en: point.label }, point.xLabel, point.yLabel] as const);
    }),
  };

  const cungChieu = points.filter((point) => point.x * point.y > 0).length;
  const tuToi =
    cuaSo.closes.length === 0
      ? ''
      : `${nhanPhien(cuaSo, 0)} → ${nhanPhien(cuaSo, cuaSo.closes.length - 1)}`;
  const doc = fit === undefined ? '' : formatNumber(Math.abs(fit.slope));
  const summaryVi = [
    `Phân tán ${String(n)} cặp lợi suất phiên của ${coPhieu} theo VN-Index, ${tuToi}.`,
    `${String(cungChieu)} trong ${String(n)} phiên hai bên đi cùng chiều.`,
    fit === undefined
      ? ''
      : `Đường hồi quy dốc ${formatNumber(fit.slope)}: trung bình VN-Index đi 1 % thì ${coPhieu} đi ${doc} % ${fit.slope < 0 ? 'ngược chiều' : 'cùng chiều'}.`,
  ];
  const summaryEn = [
    `Scatter of ${String(n)} session return pairs for ${coPhieuEn} against the VN-Index, ${tuToi}.`,
    `In ${String(cungChieu)} of ${String(n)} sessions the two moved the same way.`,
    fit === undefined
      ? ''
      : `The regression line has slope ${formatNumber(fit.slope)}: on average, when the VN-Index moves 1 %, ${coPhieuEn} moves ${doc} % ${fit.slope < 0 ? 'the opposite way' : 'the same way'}.`,
  ];

  return {
    kind: 'scatter',
    title: {
      vi: `${name.vi} — phân tán lợi suất phiên`,
      en: `${name.en} — scatter of session returns`,
    },
    summary: {
      vi: summaryVi.filter((s) => s !== '').join(' '),
      en: summaryEn.filter((s) => s !== '').join(' '),
    },
    x,
    y,
    points,
    ...(fit === undefined ? {} : { fit }),
    pointLabel: { vi: 'Từng phiên', en: 'Each session' },
    table,
    options,
    sweepKey: SCATTER_KEY,
  };
}
