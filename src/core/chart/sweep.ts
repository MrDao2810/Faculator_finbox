/**
 * Tầng DOMAIN — động cơ quét độ nhạy (FR-08).
 *
 * Đây là chỗ 50 công thức có biểu đồ mà KHÔNG công thức nào phải khai thêm một dòng metadata.
 * Lý do làm được: `runFormula()` là hàm thuần, đồng bộ, rẻ, và 208 trên 209 biến vô hướng của
 * Registry đã khai sẵn `min` với `max`. Quét một biến = gọi lại `runFormula` 42 lần rồi thu
 * `{x, y}` — không cần biết công thức đang tính cái gì.
 *
 * Vì vậy `CalcOutput.series` KHÔNG dùng ở đây: nó là "một lần chạy trả một chuỗi", còn đường quét
 * là "N lần chạy, mỗi lần một điểm". Ép từng công thức tự trả `series` là quay về 50 việc.
 */

import { runFormula } from '../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { formatCalcOutput, formatValueWithUnit } from '../format';
import { defaultInputs, variablesForLevel } from '../registry/build';
import type { FormulaSpec } from '../registry/types';
import type { Level, VariableSpec } from '../types';
import { extentOf } from './scale';
import type { ChartPoint } from './types';

/** Số điểm quét. Đủ mượt ở khổ 360px, đủ ít để một lượt quét mất dưới một phần mười mili giây. */
export const SWEEP_POINTS = 41;

/** Nửa dải quét: ±50% quanh giá trị hiện tại. */
export const SWEEP_SPAN = 0.5;

/** Hai số coi là một, theo sai số tương đối — dùng để nhận ra điểm "giá trị hiện tại". */
function nearly(a: number, b: number): boolean {
  return Math.abs(a - b) <= Math.abs(b) * 1e-9 + 1e-12;
}

export interface SweepDomain {
  lo: number;
  hi: number;
  count: number;
}

/**
 * Dải quét của một biến.
 *
 * **Quét quanh giá trị hiện tại, KHÔNG quét cả `[min, max]`.** Đây là chỗ dễ làm sai nhất:
 * `min`/`max` trong `VariableSpec` là chặn NHẬP SAI (thứ `clampToSpec` dùng), không phải dải để
 * xem. Biến `price` khai `min: 0, max: 10_000_000` trong khi giá trị dùng thật là 92.000 — quét
 * cả miền thì điểm hiện tại nằm ở pixel đầu tiên bên trái và 40 điểm còn lại vô nghĩa.
 *
 * ±50% mới đúng câu hỏi mà biểu đồ độ nhạy sinh ra để trả lời: "tăng giảm bao nhiêu phần trăm
 * thì kết quả thành bao nhiêu".
 *
 * @returns `null` khi không dựng được dải — nơi gọi nói rõ thay vì vẽ một cột đứng.
 */
export function sweepDomain(
  variable: VariableSpec,
  current: number,
  span = SWEEP_SPAN,
): SweepDomain | null {
  const base = Number.isFinite(current) ? current : variable.defaultValue;
  if (!Number.isFinite(base)) return null;

  let lo: number;
  let hi: number;

  if (base !== 0) {
    lo = base * (1 - span);
    hi = base * (1 + span);
    // Biến âm thì phép nhân đảo chiều hai đầu.
    if (lo > hi) [lo, hi] = [hi, lo];
  } else if (variable.step !== undefined && variable.step > 0) {
    // Giá trị 0 không có "phần trăm quanh nó" — lấy hai mươi bước sang mỗi bên.
    lo = -variable.step * 20;
    hi = variable.step * 20;
  } else if (variable.min !== undefined && variable.max !== undefined) {
    lo = variable.min;
    hi = variable.max;
  } else {
    return null;
  }

  if (variable.min !== undefined) lo = Math.max(lo, variable.min);
  if (variable.max !== undefined) hi = Math.min(hi, variable.max);

  if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return null;

  // Bước thô hơn độ phân giải của dải thì giảm số điểm, kẻo nhiều x trùng nhau sau khi bám bước.
  let count = SWEEP_POINTS;
  if (variable.step !== undefined && variable.step > 0) {
    const step = variable.step;
    const steps = Math.floor((hi - lo) / step) + 1;
    if (steps < SWEEP_POINTS) {
      /*
       * Khi bước chi phối mật độ điểm thì hai đầu dải phải BÁM LƯỚI BƯỚC — cùng gốc `min ?? 0`
       * với `snapToStep()`. Bản trước chỉ giảm số điểm mà để nguyên hai đầu, nên biến `years`
       * (bước 1, mặc định 5) cho dải 2,5 → 7,5 chia đều thành 2,5 · 3,5 · 4,5… — nhãn nói
       * "4,5 năm" trong khi hàm tính làm tròn thành 5 năm: sáu trên bảy điểm của đường là một
       * bậc thang mang nhãn sai. Chỉ trục có bước thô mới đi nhánh này; dải liên tục (41 điểm)
       * giữ nguyên đường cũ.
       */
      const origin = variable.min ?? 0;
      // Lưới bắt đầu ở origin nên mốc lưới mang số lẻ của CẢ HAI: bước 0,5 tính từ min 0,25
      // cho các mốc 1,75 · 2,25… — lấy mỗi số lẻ của bước là toFixed cắt 1,75 thành 1,8.
      const decimals = Math.max(decimalsOf(step), decimalsOf(origin));
      const snappedLo = Number(
        (origin + Math.ceil(roundFloat((lo - origin) / step)) * step).toFixed(decimals),
      );
      const snappedHi = Number(
        (origin + Math.floor(roundFloat((hi - origin) / step)) * step).toFixed(decimals),
      );

      if (snappedHi > snappedLo) {
        lo = snappedLo;
        hi = snappedHi;
        count = Math.round((hi - lo) / step) + 1;
      } else {
        // Dải hẹp hơn một bước — giữ hành vi cũ, còn hơn trả về null làm mất cả biểu đồ.
        count = Math.max(2, steps);
      }
    }
  }

  return { lo, hi, count };
}

/** Số chữ số thập phân của bước — cùng cách `snapToStep()` chống rác dấu phẩy động. */
function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}

/** Gọt nhiễu dấu phẩy động trước khi lấy trần/sàn — 4,999999999 phải là 5, không phải 4. */
function roundFloat(value: number): number {
  return Number(value.toFixed(9));
}

/**
 * Những biến đưa lên trục X được.
 *
 * Loại biến rời rạc (`select`/`radio`/`toggle`/`buttonGroup`) — chỉ có 5 biến như vậy trên toàn bộ
 * 111 công thức, và một danh sách chọn không quét thành đường được.
 *
 * Lọc theo `level` chứ không lấy hết: chế độ Cơ bản ẩn biến nâng cao (FR-09), nên quét một biến
 * người dùng không thấy trên màn là vẽ ra thứ họ không đối chiếu được với ô nhập nào.
 */
export function sweepCandidates(spec: FormulaSpec, level: Level): ReadonlyArray<VariableSpec> {
  return variablesForLevel(spec, level).filter(
    (variable) =>
      (variable.type === 'number' || variable.type === 'slider') &&
      sweepDomain(variable, variable.defaultValue) !== null,
  );
}

/**
 * Chuỗi điểm khi quét một biến, các biến còn lại giữ nguyên giá trị người dùng đang nhập.
 *
 * `y` lấy thẳng `out.value`, tức `number | null`. **Không có `?? 0` ở bất kỳ đâu trong file này** —
 * đó đúng là thứ FR-06 cấm, và cũng là lý do `ChartPoint.y` khai nullable ngay từ kiểu.
 */
export function sweepPoints(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  key: string,
  span = SWEEP_SPAN,
): ReadonlyArray<ChartPoint> {
  const variable = formula.spec.variables.find((item) => item.key === key);
  if (variable === undefined) return [];

  const current = inputs[key] ?? variable.defaultValue;
  const domain = sweepDomain(variable, current, span);
  if (domain === null) return [];

  const xs: number[] = [];
  for (let i = 0; i < domain.count; i += 1) {
    xs.push(domain.lo + (i * (domain.hi - domain.lo)) / (domain.count - 1));
  }

  /*
   * Chèn CHÍNH XÁC giá trị đang nhập vào chuỗi.
   *
   * Nếu chỉ chia đều thì cái dấu "giá trị hiện tại" rơi vào điểm gần nhất chứ không đúng điểm, và
   * con số trên dấu lệch với con số ở khối Kết quả ngay trên đó — hai chỗ nói hai số khác nhau về
   * cùng một phép tính là lỗi nặng hơn cả việc thiếu dấu.
   */
  if (current > domain.lo && current < domain.hi && !xs.some((x) => nearly(x, current))) {
    xs.push(current);
    xs.sort((a, b) => a - b);
  }

  return xs.map((x) => {
    const out = runFormula(formula, { ...inputs, [key]: x }, ctx);
    const point: ChartPoint = {
      x,
      y: out.value,
      label: formatValueWithUnit(x, variable.unit),
      valueLabel: formatCalcOutput(out),
    };
    if (nearly(x, current)) point.marked = true;
    if (out.warning !== undefined) point.reason = out.warning.code;
    return point;
  });
}

export interface SweepRank {
  variable: VariableSpec;
  /** Biên độ đầu ra tương đối khi quét biến này. Càng lớn càng đáng vẽ. -1 là không dùng được. */
  swing: number;
}

/**
 * Xếp hạng biến theo BIÊN ĐỘ ĐẦU RA khi quét nó.
 *
 * Không phải phỏng đoán: "biến làm kết quả đổi mạnh nhất" chính là định nghĩa của độ nhạy, nên
 * xếp hạng thế này là đo đúng thứ biểu đồ muốn nói.
 *
 * Chốt bằng `defaultInputs()` chứ KHÔNG bằng giá trị người dùng đang gõ. Đây là chi tiết quan
 * trọng: xếp hạng theo inputs hiện tại thì biến được quét sẽ nhảy sang biến khác giữa lúc người
 * dùng kéo thanh trượt — trục X đổi tên, biểu đồ nhảy, không ai đọc được. Chốt bằng mặc định biến
 * hàm này thành hàm thuần của `spec`, nên xác định tuyệt đối và không lệch hydration.
 */
export function rankSweepVariables(
  formula: FormulaModule,
  ctx: CalcContext,
  level: Level,
): ReadonlyArray<SweepRank> {
  const base = defaultInputs(formula.spec);

  return sweepCandidates(formula.spec, level)
    .map((variable, index) => {
      const ys = sweepPoints(formula, base, ctx, variable.key).map((point) => point.y);
      const extent = extentOf(ys);
      const usable = ys.filter((y) => y !== null).length;

      const raw =
        extent === null || usable < 2
          ? -1
          : (extent[1] - extent[0]) /
            Math.max(Math.abs(extent[0]), Math.abs(extent[1]), Number.EPSILON);

      /*
       * LÀM TRÒN trước khi so, chứ không so số thô.
       *
       * Tỉ số đơn giản cho biên độ bằng nhau về mặt toán ở cả hai biến: quét P/E theo giá cho
       * đúng 2/3, quét theo EPS cũng đúng 2/3. Nhưng hai đường tính khác nhau nên số thực trả về
       * lệch nhau ở chữ số thứ mười sáu, và khi ấy thứ tự do NHIỄU DẤU PHẨY ĐỘNG quyết định —
       * biểu đồ P/E hoá ra vẽ theo EPS chỉ vì phép chia rơi xuống dưới một phần tỉ tỉ.
       *
       * Làm tròn ba chữ số nghĩa là: chênh nhau dưới 0,1% thì coi là hoà, và hoà thì theo thứ tự
       * khai báo — biến khai trước thường là biến người ta nghĩ tới trước.
       */
      const swing = Math.round(raw * 1000) / 1000;

      return { variable, swing, index };
    })
    .sort((a, b) => (a.swing === b.swing ? a.index - b.index : b.swing - a.swing))
    .map(({ variable, swing }) => ({ variable, swing }));
}

/** Biến mặc định đưa lên trục X. `null` khi công thức không có biến nào quét được. */
export function pickSweepVariable(
  formula: FormulaModule,
  ctx: CalcContext,
  level: Level,
): VariableSpec | null {
  const ranked = rankSweepVariables(formula, ctx, level);
  // Ưu tiên biến thật sự làm kết quả đổi; cả nhóm phẳng thì vẫn vẽ, đường thẳng là câu trả lời thật.
  const best = ranked.find((rank) => rank.swing > 0) ?? ranked[0];
  return best?.variable ?? null;
}
