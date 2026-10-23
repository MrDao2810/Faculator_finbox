/**
 * Tầng DOMAIN — hình CỘT THEO KỲ, mục thêm của ô "Xem theo" (23/10/2026).
 *
 * Chủ dự án chọn bốn kiểu hình mới; ba kiểu đầu là cùng một dạng — mỗi kỳ một cột, nhiều chuỗi thì
 * chồng lên nhau: trả nợ từng năm (gốc + lãi), số dư từng năm (tiền gốc + lãi tích luỹ), từng đợt mua
 * DCA (giá mua, vạch ở giá vốn trung bình). Số do CHÍNH công thức sinh (`FormulaModule.columns`); file
 * này chỉ tra, kiểm và đặt mục vào ô chọn. Mô hình dựng ở `build.ts`, cạnh hình cơ cấu, vì nó cần
 * cùng bộ chia trục và nhãn ở bậc của trục.
 */

import type { CalcContext, CalcInputs, ColumnData, FormulaModule } from '../calc/types';
import type { CalcOutput } from '../types';
import type { SweepOption } from './types';

/** Khoá của mục trong ô "Xem theo". Hai gạch dưới đầu, cùng nếp `BREAKDOWN_KEY`. */
export const COLUMNS_KEY = '__columns';

/** Mục của ô chọn: chữ là tên hình công thức khai ('Trả nợ từng năm'). */
export function columnsOption(formula: FormulaModule): SweepOption | null {
  const view = formula.columns;
  return view === undefined ? null : { key: COLUMNS_KEY, label: view.title };
}

/**
 * Số của hình cột, đã kiểm — hoặc `null` khi không vẽ được, và đó cũng là điều kiện để mục có mặt
 * trong ô chọn (cùng nếp hình cơ cấu):
 *
 * - công thức không khai, hoặc hàm sinh số trả `null`;
 * - ít hơn hai kỳ: một cột đứng một mình không so được với gì;
 * - một số không hữu hạn, hay thiếu / thừa số so với số chuỗi (FR-06 cho hình);
 * - nhiều chuỗi mà có số ÂM: cột chồng chỉ đọc được khi mọi khúc cộng vào;
 * - mọi số đều bằng 0: không có gì để vẽ.
 */
export function columnData(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  output: CalcOutput,
): ColumnData | null {
  const view = formula.columns;
  if (view === undefined) return null;

  const v = (key: string): number => inputs[key] ?? Number.NaN;
  let data: ColumnData | null;
  try {
    data = view.build(v, ctx, output);
  } catch {
    return null;
  }
  if (data === null || data.groups.length < 2) return null;

  const soChuoi = view.series.length;
  const soCotPhu = view.extraColumns?.length ?? 0;
  const chong = soChuoi >= 2;
  let coKhacKhong = false;

  for (const group of data.groups) {
    if (group.values.length !== soChuoi) return null;
    if ((group.extras?.length ?? 0) !== soCotPhu) return null;
    for (const value of group.values) {
      if (!Number.isFinite(value)) return null;
      if (chong && value < 0) return null;
      if (value !== 0) coKhacKhong = true;
    }
    if (group.extras?.some((value) => !Number.isFinite(value)) === true) return null;
  }
  if (data.lines?.some((line) => !Number.isFinite(line.value)) === true) return null;

  return coKhacKhong ? data : null;
}
