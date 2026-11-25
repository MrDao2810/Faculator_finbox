/**
 * Tầng DOMAIN — chuỗi giá của một mã thị trường có đủ cho công thức không (25/11/2026).
 *
 * Chủ dự án mở "Nạp mẫu" trên một công thức chuỗi giá và không tìm được mã nào tính ra số:
 * _"các công thức khác nhau nếu có điều kiện của công thức thì cần kiểm tra xem trong các mã mà mã
 * nào đủ yêu cầu thì hiển thị lên trước danh sách rồi lần lượt đến mã nào không đủ (mã nào không
 * đáp ứng yêu cầu thì cần có text in nghiêng nhỏ bên dưới mã …)"_.
 *
 * Nguồn thị trường (`MarketFeed.priceHistory`, trường `tendays` của Finbox) trả CÙNG MỘT dáng cho
 * mọi mã: tối đa 10 phiên, chỉ có ngày và giá đóng cửa (mở cửa, cao, thấp, khối lượng là `null`).
 * Nên câu hỏi "mã này có đủ phiên không" không cần gọi mạng từng mã: chạy công thức một lượt trên
 * một chuỗi đúng dáng ấy, và nếu công thức báo `MISSING_SERIES` thì điều kiện nó nêu là điều kiện
 * mà MỌI mã thị trường đều chưa đạt. Đo 25/11/2026 với số mặc định: cả 35 công thức chuỗi giá đều
 * báo thiếu (RSI 15 phiên, SMA 20, VaR/Sharpe/Beta 60; ATR, Stochastic, VWAP còn thiếu cột).
 *
 * Chạy với số ĐANG NHẬP chứ không với số mặc định: người dùng hạ "Số phiên" xuống 10 thì SMA-10
 * đủ phiên, và câu báo phải biến mất theo.
 */

import type { SeriesRow } from '../price-series';
import type { Bilingual } from '../types';
import { runFormula } from './run';
import type { CalcContext, CalcInputs, FormulaModule } from './types';

/** Số phiên `tendays` của Finbox trả về cho một mã. */
export const SO_PHIEN_MA_THI_TRUONG = 10;

/**
 * Điều kiện chuỗi giá công thức đòi mà một mã thị trường chưa đạt, hoặc `null` khi đạt (hoặc công
 * thức không cần chuỗi giá).
 *
 * Giá giả lập tăng nhẹ đều 1% mỗi phiên: một chuỗi phẳng làm vài công thức báo lỗi khác
 * (độ lệch chuẩn bằng 0) trước khi kịp đếm phiên, và chỉ có số phiên mới là điều cần biết ở đây.
 */
export function dieuKienChuoiThieu(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  soPhien: number = SO_PHIEN_MA_THI_TRUONG,
): Bilingual | null {
  const bars: SeriesRow[] = Array.from({ length: soPhien }, (_, i) => ({
    date: `2026-01-${String(i + 1).padStart(2, '0')}`,
    open: null,
    high: null,
    low: null,
    close: Math.round(10_000 * 1.01 ** i),
    volume: null,
  }));
  const out = runFormula(formula, inputs, {
    ...ctx,
    bars,
    series: bars.map((bar) => bar.close ?? 0),
  });
  if (out.warning?.code !== 'MISSING_SERIES') return null;
  return out.warning.condition ?? null;
}
