/**
 * Tầng DOMAIN — bộ đồ nghề chuỗi giá cho các công thức đọc `ctx.series` / `ctx.bars`
 * (nhóm Kỹ thuật và phần lớn nhóm Rủi ro, FR-12).
 *
 * Vì sao gom một chỗ: bốn nhóm công thức cùng cần "lấy chuỗi lợi suất", "độ lệch chuẩn mẫu",
 * "đủ N phiên chưa" — mỗi file tự chế một bản là bốn chỗ để sai lệch nhau. Các hàm ở đây là
 * hàm thuần, test riêng ở `series-utils.test.ts`, và tuân đúng nếp FR-06: thiếu dữ liệu thì
 * trả `CalcWarning` cho công thức `fail()` tiếp, không bao giờ trả một con số bịa.
 *
 * Quy ước chiều: chuỗi xếp phiên CŨ trước, phiên MỚI CUỐI — cùng chiều với bảng WF-05.
 */

import type { CalcContext } from '../calc/types';
import type { SeriesRow } from '../price-series';
import type { CalcWarning } from '../types';
import { missingSeries } from '../warnings';

/**
 * Chuỗi giá đóng cửa dùng được từ ctx.
 *
 * Ưu tiên `ctx.series`; không có thì rút cột close từ `ctx.bars`. Chỉ giữ giá hữu hạn và
 * DƯƠNG: giá 0 hay âm không phải một phiên giao dịch thật, đưa vào lợi suất là chia cho 0.
 */
export function usableCloses(ctx: CalcContext): number[] {
  const raw = ctx.series ?? ctx.bars?.map((bar) => bar.close) ?? [];
  return raw.filter((close): close is number => typeof close === 'number' && close > 0);
}

/**
 * Đòi tối thiểu `min` phiên giá đóng cửa.
 *
 * @returns mảng giá nếu đủ, hoặc `CalcWarning` MISSING_SERIES nếu thiếu — nơi gọi kiểm bằng
 * `Array.isArray()`. Trả về một trong hai chứ không ném lỗi, để thân công thức viết được:
 *
 * ```ts
 * const closes = requireCloses(ctx, 60);
 * if (!Array.isArray(closes)) return fail('%', closes);
 * ```
 */
export function requireCloses(
  ctx: CalcContext,
  min: number,
  what = 'phiên giá',
): number[] | CalcWarning {
  const closes = usableCloses(ctx);
  return closes.length >= min ? closes : missingSeries(min, closes.length, what);
}

/** Như `requireCloses` nhưng trả chuỗi phiên OHLCV đầy đủ — chỉ giữ phiên có giá đóng cửa. */
export function requireBars(
  ctx: CalcContext,
  min: number,
  what = 'phiên giá',
): SeriesRow[] | CalcWarning {
  const bars = (ctx.bars ?? []).filter(
    (bar): bar is SeriesRow & { close: number } => typeof bar.close === 'number' && bar.close > 0,
  );
  return bars.length >= min ? bars : missingSeries(min, bars.length, what);
}

/**
 * Chuỗi lợi suất đơn giữa các phiên liền nhau: r_t = P_t / P_{t-1} − 1.
 * N giá cho N−1 lợi suất. Giá vào đây đã dương (đi qua `usableCloses`) nên không chia cho 0.
 */
export function simpleReturns(closes: ReadonlyArray<number>): number[] {
  const returns: number[] = [];
  for (let i = 1; i < closes.length; i += 1) {
    const previous = closes[i - 1];
    const current = closes[i];
    if (previous !== undefined && current !== undefined && previous > 0) {
      returns.push(current / previous - 1);
    }
  }
  return returns;
}

/** Trung bình cộng. Mảng rỗng trả NaN — `ok()` sẽ đổi thành fail, không lọt ra màn. */
export function mean(values: ReadonlyArray<number>): number {
  if (values.length === 0) return Number.NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * Độ lệch chuẩn MẪU (chia n−1) — quy ước của thống kê tài chính khi chuỗi là mẫu quan sát.
 * Dưới 2 phần tử trả NaN thay vì 0: một quan sát không nói được gì về độ phân tán.
 */
export function sampleStdDev(values: ReadonlyArray<number>): number {
  if (values.length < 2) return Number.NaN;
  const average = mean(values);
  const squared = values.reduce((sum, value) => sum + (value - average) ** 2, 0);
  return Math.sqrt(squared / (values.length - 1));
}

/**
 * Mức sụt giảm sâu nhất từ đỉnh (max drawdown), trả PHÂN SỐ DƯƠNG: 0,25 nghĩa là đáy từng
 * thấp hơn đỉnh trước đó 25%. Chuỗi tăng đều trả 0 — không rơi phiên nào là drawdown 0, đó
 * là kết quả thật chứ không phải lỗi.
 */
export function maxDrawdown(closes: ReadonlyArray<number>): number {
  let peak = Number.NEGATIVE_INFINITY;
  let worst = 0;
  for (const close of closes) {
    if (close > peak) peak = close;
    else if (peak > 0) worst = Math.max(worst, (peak - close) / peak);
  }
  return worst;
}

/** Trung bình động đơn giản của `period` phần tử CUỐI chuỗi. Thiếu phần tử trả NaN. */
export function lastSma(closes: ReadonlyArray<number>, period: number): number {
  if (period < 1 || closes.length < period) return Number.NaN;
  return mean(closes.slice(-period));
}

/**
 * Trung bình động luỹ thừa (EMA) tại phiên cuối, hệ số k = 2/(n+1), mồi bằng SMA của `period`
 * phiên đầu — đúng cách các bảng giá phổ thông tính, nên số kiểm đối chiếu được với chúng.
 */
export function lastEma(closes: ReadonlyArray<number>, period: number): number {
  if (period < 1 || closes.length < period) return Number.NaN;
  const k = 2 / (period + 1);
  let ema = mean(closes.slice(0, period));
  for (let i = period; i < closes.length; i += 1) {
    const close = closes[i];
    if (close !== undefined) ema = close * k + ema * (1 - k);
  }
  return ema;
}
