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
import type { Bilingual, CalcOutput } from '../types';
import type { CalcInputs } from '../calc/types';
import type { BreakdownBar } from './types';

/** Khoá của mục "Bóc tách" trong ô chọn trục X. Không trùng được với key biến vì có gạch dưới đôi. */
export const BREAKDOWN_KEY = '__breakdown';

export const BREAKDOWN_LABEL = { vi: 'Bóc tách', en: 'Breakdown' };

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

/**
 * Những chặng bóc tách KHÔNG phải ô nhập — công thức tự tính ra rồi mới đem vẽ.
 *
 * Sinh ra từ một lỗ hổng chủ dự án chỉ đúng chỗ (16/09/2026) trên `fcfe`: hình bóc tách có cột
 * `Lãi vay sau thuế` 48 tỷ ₫, mà khối Số liệu chỉ có `Chi phí lãi vay` 60 và `Thuế suất` 20% đứng
 * rời nhau — con số 48 và cái tên ấy không xuất hiện ở bất kỳ đâu ngoài hình. Người đọc thấy một
 * đại lượng có tên, có độ dài, nhưng không tra được nó ở đâu ra.
 *
 * Đây ĐÚNG lớp vấn đề mà `ConstantsNote` đã giải cho hằng số thuế/phí: một con số công thức đang
 * tính theo, không phải ô nhập, nên không có chỗ nào trên trang nói tới. Cách chữa cũng cùng một
 * lối — bày thẳng ra ở cuối khối Số liệu, không bắt người dùng tự suy.
 *
 * Lọc bằng `inputs[key] === undefined` chứ không bằng `spec.variables`: đó đúng là phép mà
 * `stageValue()` ngay dưới dùng để quyết định tra ô nhập hay tra `extras`, nên hai chỗ không thể
 * lệch nhau. Chặng nào tra không ra số thì bỏ hẳn khỏi danh sách — cùng lẽ với `canDrawBreakdown()`:
 * thà không nói còn hơn bày một cái tên kèm chỗ trống.
 *
 * Nhãn lấy y hệt cách hình lấy (`shortLabel` trước, rồi mới tới nhãn biến), vì mục đích của cả
 * hàm này là để HAI CHỖ GỌI CÙNG MỘT TÊN.
 */
export function derivedStages(
  spec: FormulaSpec,
  inputs: CalcInputs,
  output: CalcOutput,
): ReadonlyArray<{ key: string; label: Bilingual; value: number }> {
  const stages = spec.breakdown ?? [];
  const found: { key: string; label: Bilingual; value: number }[] = [];

  for (const stage of stages) {
    if (inputs[stage.key] !== undefined) continue;

    const value = output.extras?.[stage.key];
    if (value === undefined || !Number.isFinite(value)) continue;

    found.push({ key: stage.key, label: stage.shortLabel ?? labelOf(spec, stage.key), value });
  }

  return theoThuTuTinh(spec, found);
}

/**
 * Sắp lại các chặng theo THỨ TỰ TÍNH: chặng nào bị chặng khác nhắc tới thì phải đứng trước.
 *
 * Lỗi thật, chủ dự án chỉ ngày 05/10/2026 trên `tra-gop-nien-kim`: khối bày "Gốc kỳ đầu" trước,
 * mà công thức của nó là `Trả hằng tháng − Lãi kỳ đầu` — tức dùng một con số 21,5 triệu chưa ai
 * giới thiệu, rồi hàng DƯỚI mới tính con số ấy. *"Lãi kỳ đầu tự dưng lôi đâu ra 21 triệu? xong bên
 * dưới mới tính lãi kỳ đầu? phi logic? cần tuần tự và hợp lý hơn."*
 *
 * Thứ tự cũ là thứ tự khai `spec.breakdown`, tức thứ tự CỘT của biểu đồ bóc tách — đúng cho hình
 * vẽ (gốc rồi lãi, như một cột chồng đọc từ dưới lên) nhưng sai cho một danh sách đọc từ trên
 * xuống. Hai thứ tự khác nhau vì chúng trả lời hai câu hỏi khác nhau, nên biểu đồ GIỮ nguyên thứ
 * tự khai: nó đọc `spec.breakdown` thẳng, không đi qua hàm này.
 *
 * Sắp xếp ỔN ĐỊNH: chặng không phụ thuộc ai giữ nguyên thứ tự khai. Chỉ chặng nào nhắc tới một
 * chặng khác mới bị đẩy xuống sau chặng ấy.
 */
function theoThuTuTinh(
  spec: FormulaSpec,
  chang: ReadonlyArray<{ key: string; label: Bilingual; value: number }>,
): ReadonlyArray<{ key: string; label: Bilingual; value: number }> {
  const mau = spec.derivedSubstitution;
  if (mau === undefined || chang.length < 2) return chang;

  const coMat = new Set(chang.map((c) => c.key));
  /** Chặng `key` nhắc tới những chặng nào — chỉ tính chặng cũng đang có mặt trong danh sách. */
  const can = (key: string): ReadonlyArray<string> =>
    [...(mau[key] ?? '').matchAll(/\{([A-Za-z0-9_]+)\}/g)]
      .map((m) => m[1] ?? '')
      .filter((k) => k !== key && coMat.has(k));

  const ra: typeof chang extends ReadonlyArray<infer T> ? T[] : never = [];
  const xong = new Set<string>();
  const dangXet = new Set<string>();

  const them = (key: string): void => {
    if (xong.has(key) || dangXet.has(key)) return;
    dangXet.add(key);
    for (const truoc of can(key)) them(truoc);
    dangXet.delete(key);
    const c = chang.find((x) => x.key === key);
    if (c !== undefined && !xong.has(key)) {
      xong.add(key);
      ra.push(c);
    }
  };

  for (const c of chang) them(c.key);
  return ra;
}

/** Giá trị của một chặng: tra ô nhập trước, rồi mới tới `extras` của kết quả. */
function stageValue(stage: BreakdownStage, inputs: CalcInputs, output: CalcOutput): number | null {
  const fromInput = inputs[stage.key];
  if (fromInput !== undefined && Number.isFinite(fromInput)) return fromInput;

  const fromExtras = output.extras?.[stage.key];
  if (fromExtras !== undefined && Number.isFinite(fromExtras)) return fromExtras;

  return null;
}

function labelOf(spec: FormulaSpec, key: string): Bilingual {
  const variable = spec.variables.find((item) => item.key === key);
  return variable?.label ?? { vi: key, en: key };
}

/**
 * Tên cột tổng: `breakdownTotal` nếu công thức khai, không thì lấy phần trước dấu gạch dài của
 * tên công thức — 'EV — giá trị…' thành 'EV'. Tên tiếng Anh thường không có dấu gạch dài đó nên
 * giữ nguyên cả câu — chấp nhận được vì đây chỉ là nhãn cột tổng, không phải chỗ đúng/sai.
 */
function shortTotalLabel(spec: FormulaSpec): Bilingual {
  if (spec.breakdownTotal !== undefined) return spec.breakdownTotal;
  const [headVi] = spec.name.vi.split(' — ');
  const [headEn] = spec.name.en.split(' — ');
  return { vi: headVi ?? spec.name.vi, en: headEn ?? spec.name.en };
}
