/**
 * Tầng DOMAIN — các phần của hình CƠ CẤU (vành khuyên), mục thêm của ô "Xem theo" (22/10/2026).
 *
 * Tách khỏi `build.ts` cùng lý do `breakdown.ts` tách ra: đây là một LỐI SINH SỐ riêng, còn mô hình
 * vẫn do `buildChartModel()` dựng. Hình dùng lại mô hình thác nước (`WaterfallChart`) — các phần
 * cộng dồn rồi một cột tổng — nên vành khuyên và dạng "Thanh ngang" vẽ đúng cùng một bộ số, cùng
 * bảng số dưới hình, cùng đường xuất PDF / PNG.
 *
 * Khác bóc tách ở chỗ TỔNG: bóc tách cộng ra kết quả của công thức, còn tổng ở đây là tổng các phần
 * (xem `CompositionSpec`). Cột tổng vì thế tính từ chính các phần, không đọc `output.value`.
 */

import { formatValueWithUnit } from '../format';
import type { CompositionSpec, FormulaSpec } from '../registry/types';
import type { Bilingual, CalcOutput } from '../types';
import type { CalcInputs } from '../calc/types';
import type { BreakdownBar, SweepOption } from './types';

/** Khoá của mục trong ô "Xem theo". Hai gạch dưới đầu, cùng nếp `BREAKDOWN_KEY`. */
export const COMPOSITION_KEY = '__composition';

/** Mục của ô chọn: chữ là tên hình công thức khai ('Cơ cấu nguồn vốn'). */
export function compositionOption(view: CompositionSpec): SweepOption {
  return { key: COMPOSITION_KEY, label: view.title };
}

/** Giá trị của một phần: tra ô nhập trước, rồi mới tới `extras` của kết quả. */
function partValue(key: string, inputs: CalcInputs, output: CalcOutput): number | null {
  const fromInput = inputs[key];
  if (fromInput !== undefined && Number.isFinite(fromInput)) return fromInput;

  const fromExtras = output.extras?.[key];
  if (fromExtras !== undefined && Number.isFinite(fromExtras)) return fromExtras;

  return null;
}

function labelOf(spec: FormulaSpec, key: string): Bilingual {
  const variable = spec.variables.find((item) => item.key === key);
  return variable?.label ?? { vi: key, en: key };
}

/**
 * Các cột của hình cơ cấu: từng phần cộng dồn, rồi cột TỔNG bằng đúng tổng các phần.
 *
 * `null` khi hình không vẽ được — và đó cũng là điều kiện để mục có mặt trong ô chọn:
 *
 * - một phần tra không ra số (ô trống, `calc` lỗi nên không có `extras`);
 * - một phần ÂM: vành khuyên không có chỗ cho nó, vẽ thành múi là nói nó cộng vào (FR-06 cho hình);
 * - tổng không dương: không có gì để chia.
 *
 * Phần BẰNG 0 thì vẫn vẽ: doanh nghiệp không nợ đồng nào là 100 % vốn chủ, một câu đúng và đáng xem.
 */
export function compositionBars(
  spec: FormulaSpec,
  inputs: CalcInputs,
  output: CalcOutput,
): ReadonlyArray<BreakdownBar> | null {
  const view = spec.composition;
  if (view === undefined || view.parts.length < 2) return null;

  const bars: BreakdownBar[] = [];
  let running = 0;

  for (const part of view.parts) {
    const value = partValue(part.key, inputs, output);
    if (value === null || value < 0) return null;

    running += value;
    bars.push({
      label: part.label ?? labelOf(spec, part.key),
      delta: value,
      cumulative: running,
      valueLabel: formatValueWithUnit(value, view.unit),
    });
  }

  if (!(running > 0) || !Number.isFinite(running)) return null;

  bars.push({
    label: view.total,
    delta: running,
    cumulative: running,
    valueLabel: formatValueWithUnit(running, view.unit),
    isTotal: true,
  });

  return bars;
}
