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
  ChartKind,
  ChartModel,
  ChartPoint,
  ChartSeries,
  ChartTable,
  ChartTick,
  DrawableChart,
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

export { areaPath, fixed, gapsOf, linePath } from './path';

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
