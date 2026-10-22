/**
 * Tầng DOMAIN — cửa gom của biểu đồ (FR-07, FR-08).
 *
 * Toàn bộ toán nằm ở đây, không ở component: ESLint chặn `src/ui` chạm `@/core`, và đó là ràng
 * buộc có lợi — nó ép phần khó nhất (chọn biến, chia vạch, xử lý điểm đứt) thành hàm thuần test
 * được bằng Node, nên kiểm được cho cả 111 công thức trong một ca test thay vì 111 ca.
 *
 * KHÔNG gom vào `series-utils.ts`: file đó bị 34 công thức import nên nằm trong gói mà cả 111
 * trang chi tiết đều tải. Nhánh này chỉ được nạp trễ qua `ChartBody`.
 */

export type {
  BreakdownBar,
  ChartAxis,
  ChartCandle,
  ChartKind,
  ChartModel,
  ChartPoint,
  ChartSeries,
  ChartTable,
  ChartTick,
  DrawableChart,
  HistogramBin,
  HistogramChart,
  HistogramMarker,
  LineChart,
  SeriesTone,
  SweepOption,
  WaterfallChart,
  UnavailableChart,
} from './types';
export { PRIMARY_SERIES_KEY } from './types';

/* Chỗ DUY NHẤT ghép chuỗi chính với chuỗi phụ — tầng vẽ lặp trên kết quả của nó. */
export { seriesOf } from './series';

/*
 * `ReferenceLine` khai ở `registry/types.ts` cùng chỗ với `BreakdownStage` — nó là metadata của
 * CÔNG THỨC, không phải của biểu đồ. Mở lại qua cửa này vì `LineChart.referenceLines` mang đúng
 * kiểu ấy, và tầng giao diện chỉ được đi qua `@/application`, vốn chỉ mở lại `@/core/chart`.
 */
export type { ReferenceLine } from '../registry/types';

export type { NiceAxis } from './scale';
export { decimalsOf, extentOf, linearScale, niceAxis, niceStep } from './scale';

export { areaPath, fixed, gapsOf, linePath, stepPath } from './path';

/* Các dạng vẽ một hình đang mời — nguồn duy nhất của ô chọn "Loại biểu đồ". */
export type { DangVe, PhanVanhKhuyen, VanhKhuyen } from './dang-ve';
export { coDoiDau, dangVeCuaHinh, dangVeHieuLuc, laTrucRoiRac, vanhKhuyen } from './dang-ve';

export type { ViewBoxRect } from './pointer';
export { nearestPointByX, pointerToViewBox } from './pointer';

export type { SweepDomain, SweepRank } from './sweep';
export {
  SWEEP_POINTS,
  SWEEP_SPAN,
  pickSweepVariable,
  rankSweepVariables,
  sweepCandidates,
  sweepDomain,
  sweepPoints,
} from './sweep';

export { CHART_TABLE_ROWS, condensePoints } from './table';

export type { ChartArgs } from './build';
export { buildChartModel } from './build';

/* Đường giá vẽ kèm mang khoá này — dạng Nến bỏ đúng đường ấy ra khỏi hình. */
export { CLOSE_PRICE_KEY } from './history';

/* Hai mục theo chuỗi giá của ô "Xem theo" (21/10/2026): khoá, nhãn, và phép hỏi "khoá này có phải một trong hai". */
export {
  DISTRIBUTION_KEY,
  DISTRIBUTION_LABEL,
  DRAWDOWN_KEY,
  DRAWDOWN_LABEL,
  drawdownSeries,
  laHinhChuoiGia,
  seriesWindow,
} from './series-view';
export type { CuaSoPhien } from './series-view';

/* Mục "Cơ cấu …" của ô "Xem theo" — hình tròn chia một tổng (22/10/2026). */
export { COMPOSITION_KEY, compositionBars } from './composition';

/*
 * Chặng bóc tách công thức TỰ TÍNH RA — khối Số liệu đọc để bày chúng ra, xem docblock ở
 * `breakdown.ts`. Nằm ở đây chứ không ở `registry` vì nó suy từ `spec.breakdown`, thứ chỉ có
 * nghĩa với biểu đồ.
 */

/*
 * Biểu đồ NẾN của màn bảng chuỗi giá WF-05 — loại riêng, không phải nhánh của `ChartModel`.
 * Lý do đầy đủ ở docblock `candles.ts`.
 */
export type { CandleBar, CandleModel, CandleRange } from './candles';
export { CANDLE_RANGE_SESSIONS, buildCandleModel } from './candles';
