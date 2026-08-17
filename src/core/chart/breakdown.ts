/**
 * Tầng DOMAIN — dựng các cột của biểu đồ bóc tách (thác nước WF-17, FR-07).
 *
 * Tách khỏi `build.ts` cùng lý do `history.ts` tách ra: đó là một LỐI SINH ĐIỂM riêng, không phải
 * một loại biểu đồ riêng. `build.ts` vẫn là cổng duy nhất, và ô chọn trục X vẫn chỉ giữ một chuỗi
 * `sweepKey` — "Bóc tách" là một mục trong đúng ô ấy, đứng cạnh "Theo thời gian".
 *
 * Vì sao chặng đọc từ metadata chứ không suy từ `extras`: xem docblock của `BreakdownStage`.
 */

import { formatValueWithUnit } from '../format';
import type { BreakdownStage, FormulaSpec } from '../registry/types';
import type { CalcOutput } from '../types';
import type { CalcInputs } from '../calc/types';
import type { BreakdownBar } from './types';

/** Khoá của mục "Bóc tách" trong ô chọn trục X. Không trùng được với key biến vì có gạch dưới đôi. */
export const BREAKDOWN_KEY = '__breakdown';

export const BREAKDOWN_LABEL = 'Bóc tách';

/**
 * Công thức này bóc tách được hay không.
 *
 * Ba điều kiện, và điều kiện thứ ba là điều kiện thật sự: khai `chartType` đúng loại, khai
 * `breakdown`, và **mọi chặng phải tra ra số**. Chặng tra không ra thì thà không vẽ còn hơn vẽ
 * một cột trống mang nhãn — cùng cách nghĩ với `canDrawHistory()`.
 */
export function canDrawBreakdown(
  spec: FormulaSpec,
  inputs: CalcInputs,
  output: CalcOutput,
): boolean {
  if (spec.chartType !== 'waterfall' && spec.chartType !== 'stackedBar') return false;
  if (spec.breakdown === undefined || spec.breakdown.length === 0) return false;
  if (output.value === null) return false;

  return spec.breakdown.every((stage) => stageValue(stage, inputs, output) !== null);
}

/**
 * Các cột của thác nước: từng chặng cộng dồn, rồi một cột TỔNG đứng cuối.
 *
 * Cột tổng vẽ từ 0 lên chứ không nối tiếp cột trước — đó là điểm phân biệt thác nước với cột
 * chồng, và cũng là chỗ người đọc đối chiếu được với con số ở khối Kết quả.
 *
 * Trả mảng rỗng nếu có chặng nào tra không ra số. Nơi gọi đã hỏi `canDrawBreakdown()` trước, nên
 * đây chỉ là lưới an toàn thứ hai — không ném lỗi, đúng lời hứa của `build.ts`.
 */
export function breakdownBars(
  spec: FormulaSpec,
  inputs: CalcInputs,
  output: CalcOutput,
): ReadonlyArray<BreakdownBar> {
  const stages = spec.breakdown ?? [];
  if (stages.length === 0 || output.value === null) return [];

  const bars: BreakdownBar[] = [];
  let running = 0;

  for (const stage of stages) {
    const raw = stageValue(stage, inputs, output);
    if (raw === null) return [];

    const delta = raw * stage.sign;
    running += delta;

    bars.push({
      label: stage.shortLabel ?? labelOf(spec, stage.key),
      delta,
      cumulative: running,
      valueLabel: formatValueWithUnit(delta, spec.resultUnit),
    });
  }

  bars.push({
    label: shortTotalLabel(spec),
    delta: output.value,
    cumulative: output.value,
    valueLabel: formatValueWithUnit(output.value, spec.resultUnit),
    isTotal: true,
  });

  return bars;
}

/**
 * Miền trục cho thác nước, LUÔN chứa số 0.
 *
 * Không dùng chung `extentOf()` của đường quét được: đường quét chỉ cần bao các điểm, còn cột thì
 * đứng trên số 0 — bỏ 0 ra ngoài miền là cột "Vốn hoá" 9.200 tỷ và cột "EV" 11.500 tỷ trông chỉ
 * chênh nhau một mẩu, trong khi thật ra cột này bằng bốn phần năm cột kia.
 */
export function breakdownExtent(
  bars: ReadonlyArray<BreakdownBar>,
): readonly [number, number] | null {
  if (bars.length === 0) return null;

  let lo = 0;
  let hi = 0;

  for (const bar of bars) {
    // Cột thường chạy từ mức tổng TRƯỚC nó tới mức sau nó; cột tổng chạy từ 0.
    const from = bar.isTotal === true ? 0 : bar.cumulative - bar.delta;
    lo = Math.min(lo, from, bar.cumulative);
    hi = Math.max(hi, from, bar.cumulative);
  }

  if (!Number.isFinite(lo) || !Number.isFinite(hi)) return null;

  /*
   * Quét bụi dấu phẩy động trước khi giao cho `niceAxis`.
   *
   * Một cận cách 0 chưa tới một phần tỷ của cột lớn nhất thì đó là sai số cộng dồn, không phải
   * số liệu: chuỗi chặng lẽ ra triệt tiêu về đúng 0 nhưng còn sót ~1e−7. Để nguyên thì
   * `Math.floor(low / step)` trong `niceAxis` biến hạt bụi ấy thành trọn MỘT BƯỚC trục — trục
   * chạy xuống −200 triệu cho một hình không có cột nào âm (đo thật ở `lich-tra-no`, lãi 0%).
   * Nguyên nhân gốc của ca ấy đã vá tại chỗ, nhưng lớp lỗi thì nằm ở đây: bất kỳ công thức nào
   * có chặng dấu trừ đều triệt tiêu bằng phép trừ hai số thực, nên công thức thứ 11 khai bóc
   * tách sẽ gặp lại. Ngưỡng tương đối chứ không tuyệt đối, vì các cột trải từ đơn vị đồng tới
   * hàng nghìn tỷ.
   */
  const BUI = 1e-9;
  const lonNhat = Math.max(Math.abs(lo), Math.abs(hi));
  if (lo < 0 && -lo < BUI * lonNhat) lo = 0;
  if (hi > 0 && hi < BUI * lonNhat) hi = 0;

  // Mọi cột bằng 0 thì miền suy biến — cho một khoảng tối thiểu để trục vẫn chia được vạch.
  if (lo === hi) return [lo - 1, hi + 1];

  return [lo, hi];
}

/** Giá trị của một chặng: tra ô nhập trước, rồi mới tới `extras` của kết quả. */
function stageValue(stage: BreakdownStage, inputs: CalcInputs, output: CalcOutput): number | null {
  const fromInput = inputs[stage.key];
  if (fromInput !== undefined && Number.isFinite(fromInput)) return fromInput;

  const fromExtras = output.extras?.[stage.key];
  if (fromExtras !== undefined && Number.isFinite(fromExtras)) return fromExtras;

  return null;
}

function labelOf(spec: FormulaSpec, key: string): string {
  return spec.variables.find((variable) => variable.key === key)?.label ?? key;
}

/**
 * Tên cột tổng: `breakdownTotal` nếu công thức khai, không thì lấy phần trước dấu gạch dài của
 * tên công thức — 'EV — giá trị…' thành 'EV'.
 */
function shortTotalLabel(spec: FormulaSpec): string {
  if (spec.breakdownTotal !== undefined) return spec.breakdownTotal;
  const [head] = spec.name.vi.split(' — ');
  return head ?? spec.name.vi;
}
