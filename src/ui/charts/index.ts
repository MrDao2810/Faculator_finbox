/**
 * Biểu đồ — nhánh 4 (FR-07, FR-08).
 *
 * Barrel này CHỈ mở ra `FormulaChart` và `hasChart`. Các renderer (`LineChart`, `ChartFrame`,
 * `SweepPicker`, `ChartBody`) cố ý không có ở đây: mọi màn chi tiết đều import từ barrel này, nên
 * một dòng re-export renderer sẽ kéo cả nhánh biểu đồ ra khỏi chunk nạp trễ — đúng cái bẫy mà
 * `sheets/index.ts` vừa phải dọn ở đợt trước.
 */

export { FormulaChart, hasChart } from './FormulaChart';
export type { FormulaChartProps } from './FormulaChart';
