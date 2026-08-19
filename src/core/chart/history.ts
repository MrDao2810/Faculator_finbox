/**
 * Tầng DOMAIN — đường theo THỜI GIAN, tính lại công thức trên từng phiên giá thật.
 *
 * Đường quét độ nhạy của `sweep.ts` trả lời một câu giả định: *"nếu giá đổi ±50% thì sao"*. File này
 * trả lời một câu khác, và với người mới thì dễ hiểu hơn nhiều vì không phải tưởng tượng gì:
 * *"P/E của FPT trong 248 phiên vừa rồi nằm ở đâu, và hôm nay cao hay thấp so với cả năm ấy"*.
 *
 * Cùng một `ChartPoint[]`, cùng một renderer, cùng một bảng số — chỉ khác chỗ điểm sinh ra từ đâu.
 * Nhờ vậy nó là **một mục thêm vào ô chọn trục X đã có**, không phải một loại biểu đồ mới.
 *
 * Hai lối tính, và một công thức dùng được cả hai thì làm cả hai:
 *
 *   1. **Chân giá** — thay ô giá bằng giá đóng cửa của từng phiên. Phủ 11 công thức nhóm Cơ bản.
 *   2. **Cắt tiền tố** — chạy lại công thức với chuỗi giá cắt tới đúng phiên đó. Phủ 7 chỉ báo kỹ
 *      thuật, và chính lối này khiến RSI vẽ được theo thời gian mà `rsi-wilder` không phải sửa gì.
 *
 * Chi phí đo trên bộ mẫu FPT 248 phiên: chân giá 0,17 ms; cắt tiền tố 1,76 ms. NFR-PER-02 cho
 * 100 ms, nên vẫn không cần debounce, không cần worker.
 */

import { needsPriceSeries, runFormula } from '../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { formatCalcOutput, formatIsoDate } from '../format';
import type { SeriesRow } from '../price-series';
import type { ChartPoint } from './types';

/**
 * Khoá của mục "theo thời gian" trong ô chọn trục X.
 *
 * Hai dấu gạch dưới ở đầu để không bao giờ trùng khoá biến thật: `variablesForLevel` sinh khoá từ
 * `VariableSpec.key`, và mọi khoá trong Registry đều là camelCase chữ cái.
 */
export const HISTORY_KEY = '__time';

/** Nhãn hiện trên ô chọn. */
export const HISTORY_LABEL = 'Theo thời gian';

/**
 * Chân *giá hiện tại* — thay theo từng phiên.
 *
 * Đây là nửa quan trọng của quy tắc hai chân. Nếu thay bừa mọi ô có chữ "giá" thì `loi-nhuan-rong`
 * hoá ra mua và bán cùng một giá ở mọi phiên, tức đường lãi lỗ phẳng bằng 0 — vẽ ra một điều sai.
 */
const CURRENT_LEG = ['price', 'sellPrice', 'endPrice'] as const;

/**
 * Chân *giá vào* — GIỮ NGUYÊN giá người dùng đã nhập.
 *
 * Giữ lại chính là chỗ ý nghĩa tự đúng mà không công thức nào phải khai thêm metadata:
 * `loi-nhuan-rong` thành "lãi lỗ của tôi qua từng phiên nếu mua ở giá đã nhập", `hpr` thành "lợi
 * suất kể từ giá khởi điểm". Và công thức chỉ có chân vào (`gia-hoa-von`, `co-lenh-rui-ro`) TỰ LOẠI
 * mình khỏi lối chân giá, vì không có gì để thay theo phiên.
 */
const ENTRY_LEG = ['buyPrice', 'startPrice', 'entryPrice'] as const;

/** Ít hơn số này thì một đường theo thời gian không nói được gì. */
const MIN_SESSIONS = 5;

export interface HistoryPlan {
  /** Ô giá thay theo từng phiên. Rỗng nghĩa là công thức không có chân giá nào. */
  priceKeys: ReadonlyArray<string>;
  /** Có phải cắt chuỗi giá theo tiền tố hay không. */
  truncateSeries: boolean;
}

/**
 * Công thức này vẽ theo thời gian được bằng lối nào, hay không lối nào.
 *
 * Nhận `asOf` chứ không nhận cả `ctx` cho phần hỏi chuỗi: `needsPriceSeries()` là thuộc tính TĨNH
 * của công thức (nó dò bằng `defaultInputs` và một ctx trống), nên trộn ctx thật vào đây sẽ khiến
 * câu trả lời đổi theo việc người dùng đã nạp dữ liệu chưa — mà đó là câu hỏi khác.
 */
export function historyPlan(formula: FormulaModule, asOf: string): HistoryPlan | null {
  const keys = new Set(formula.spec.variables.map((variable) => variable.key));
  const priceKeys = CURRENT_LEG.filter((key) => keys.has(key));
  const truncateSeries = needsPriceSeries(formula, asOf);

  if (priceKeys.length === 0 && !truncateSeries) return null;
  return { priceKeys, truncateSeries };
}

/** Chuỗi phiên dùng được, hoặc `null` khi chưa nạp đủ. */
function sessionsOf(ctx: CalcContext): ReadonlyArray<SeriesRow> | null {
  const bars = ctx.bars;
  if (bars === undefined || bars.length < MIN_SESSIONS) return null;
  return bars;
}

/** Có dữ liệu để vẽ đường thời gian ngay lúc này hay không. */
export function canDrawHistory(formula: FormulaModule, ctx: CalcContext): boolean {
  return historyPlan(formula, ctx.asOf) !== null && sessionsOf(ctx) !== null;
}

/**
 * Ngày ISO thành nhãn tiếng Việt.
 *
 * Trước gói hằng số, thân hàm nằm ngay đây kèm lý do: `format.ts` thuộc gói cơ sở mà cả 119 trang
 * đều tải, còn định dạng ngày thì chỉ biểu đồ cần, nên để bên này để trang chủ khỏi trả tiền cho
 * một thứ nó không dùng. Lý do đó hết hiệu lực khi khối hằng số của màn chi tiết cũng phải in ngày
 * hiệu lực: gói cơ sở giờ CÓ dùng, và giữ hai bản cắt chuỗi giống hệt nhau ở hai tầng mới là cái
 * giá đắt hơn. Thân hàm chuyển sang `formatIsoDate` trong `format.ts`; tên này giữ nguyên vì nó
 * mang nghĩa riêng của biểu đồ (nhãn một PHIÊN giao dịch) và đang được gọi ở nhiều chỗ.
 */
export function formatSessionDate(iso: string): string {
  return formatIsoDate(iso);
}

/** Nhãn ngắn cho vạch trục: chỉ tháng và năm, đủ gọn để bốn vạch không chồng nhau ở khổ 360px. */
export function formatSessionMonth(iso: string): string {
  const [year, month] = iso.split('-');
  if (year === undefined || month === undefined) return iso;
  return `${month}/${year}`;
}

/**
 * Một điểm cho mỗi phiên: x là chỉ số phiên, y là kết quả công thức tại phiên đó.
 *
 * Dùng chỉ số phiên làm x chứ không dùng mốc thời gian: thị trường nghỉ cuối tuần và ngày lễ, nên
 * trục theo thời gian thật sẽ có những quãng trống mà giá không hề ngừng — đường vẽ ra trông như
 * đang thiếu dữ liệu. Mọi biểu đồ giá đều đánh trục theo phiên vì lý do đó, và nhãn vạch vẫn là
 * ngày thật nên người đọc không mất thông tin nào.
 *
 * `y` lấy thẳng `out.value`, tức `number | null`. Với chỉ báo cuộn thì mấy phiên đầu ĐÚNG RA là
 * `null` — RSI-14 chưa có 14 phiên thì không tồn tại, và đường phải bắt đầu từ chỗ nó tồn tại chứ
 * không được vẽ 0 rồi vọt lên (FR-06).
 */
export function historyPoints(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
): ReadonlyArray<ChartPoint> {
  const plan = historyPlan(formula, ctx.asOf);
  const bars = sessionsOf(ctx);
  if (plan === null || bars === null) return [];

  const last = bars.length - 1;

  return bars.map((bar, index) => {
    const close = bar.close;

    const sessionInputs =
      close === null || !Number.isFinite(close) || plan.priceKeys.length === 0
        ? inputs
        : { ...inputs, ...Object.fromEntries(plan.priceKeys.map((key) => [key, close])) };

    /*
     * Cắt CẢ `bars` lẫn `series`, và cắt từ cùng một chỗ.
     *
     * Nếu chỉ cắt một trong hai thì công thức đọc `ctx.bars` sẽ thấy 12 phiên còn công thức đọc
     * `ctx.series` thấy 248 — hai chỉ báo trên cùng biểu đồ nói hai mốc thời gian khác nhau.
     */
    const sessionCtx = plan.truncateSeries
      ? {
          ...ctx,
          bars: bars.slice(0, index + 1),
          series: bars
            .slice(0, index + 1)
            .map((row) => row.close)
            .filter((value): value is number => typeof value === 'number' && value > 0),
        }
      : ctx;

    const out = runFormula(formula, sessionInputs, sessionCtx);

    const point: ChartPoint = {
      x: index,
      y: out.value,
      label: formatSessionDate(bar.date),
      valueLabel: formatCalcOutput(out),
    };
    // Phiên gần nhất LÀ "giá trị hiện tại" của đường thời gian — cùng vai với điểm đang nhập của
    // đường quét, nên dùng lại đúng cờ ấy và dấu trên hình không phải biết mình đang ở chế độ nào.
    if (index === last) point.marked = true;
    if (out.warning !== undefined) point.reason = out.warning.code;
    return point;
  });
}

/**
 * Vạch trục cho một chuỗi phiên: `target` vạch chia đều, luôn có phiên đầu và phiên cuối.
 *
 * Không dùng `niceAxis()` cho trục này. Nó làm tròn miền ra bội của bước, nên với 248 phiên sẽ sinh
 * vạch ở chỉ số 250 — một phiên không tồn tại, không có ngày để ghi nhãn.
 */
export function sessionTicks(
  bars: ReadonlyArray<SeriesRow>,
  target = 4,
): ReadonlyArray<{ value: number; label: string }> {
  const total = bars.length;
  if (total === 0) return [];
  if (total === 1) {
    const only = bars[0];
    return only === undefined ? [] : [{ value: 0, label: formatSessionMonth(only.date) }];
  }

  const count = Math.max(2, Math.min(target, total));
  const seen = new Set<number>();
  const ticks: Array<{ value: number; label: string }> = [];

  for (let i = 0; i < count; i += 1) {
    const index = Math.round((i * (total - 1)) / (count - 1));
    if (seen.has(index)) continue;
    seen.add(index);
    const bar = bars[index];
    if (bar !== undefined) ticks.push({ value: index, label: formatSessionMonth(bar.date) });
  }

  return ticks;
}
