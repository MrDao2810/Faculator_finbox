/**
 * Tầng DATA — chọn 4 mã mẫu ĐÁNG THỬ NHẤT cho một công thức.
 *
 * ── Vì sao có file này ──────────────────────────────────────────────────────────────────────
 *
 * Sheet "Nạp mẫu" bày đúng một bộ mã cho cả 111 công thức, và dòng mô tả của mỗi mã chỉ ghi
 * NGUỒN (`BCTC Q2/2026 · 248 phiên giá`) chứ không ghi con số nào của chính mã đó — nên bốn dòng
 * đọc y hệt nhau, đúng như chủ dự án báo: "4 mẫu ví dụ đang bị trùng thông số để test". Số bên
 * dưới thì khác nhau hẳn (EPS 5.867 / 2.750 / 5.246 / 6.667 ₫), chỉ là không có con số nào lọt
 * lên màn.
 *
 * Hai việc phải làm cùng lúc thì sheet mới hết trùng: nói ra mã đó cho công thức này kết quả
 * BAO NHIÊU, và chọn mã sao cho bốn kết quả ấy KHÁC NHAU. File này lo cả hai.
 *
 * ── Vì sao "trải rộng kết quả" chứ không "chọn tay theo ngành" ───────────────────────────────
 *
 * Chọn tay là biên tập nội dung cho 111 công thức, và mỗi lần kho mã đổi là phải soát lại tay.
 * Trải rộng thì tính được: chạy thật công thức với từng mã trong kho rồi lấy bốn mã ở bốn mức
 * kết quả cách xa nhau. Người dùng mở P/E ra thấy ngay một mã rẻ, một mã đắt và hai mã ở giữa —
 * tức nhìn bốn dòng là hiểu công thức nhạy với cái gì, đúng nghĩa "để test".
 *
 * ── Khi nào KHÔNG xếp hạng ──────────────────────────────────────────────────────────────────
 *
 * Chỉ xếp hạng khi số liệu của mã thật sự đi vào công thức (`presetInputs()` trả về ít nhất một
 * ô). 41 công thức không nhận gì từ mã nào — vay, tiết kiệm, phái sinh, lãi kép — nên mọi mã cho
 * ra đúng một kết quả, và "xếp hạng" ở đó chỉ là bày ra bốn mã theo một thứ tự vô nghĩa.
 *
 * Nhóm công thức CHỈ ăn chuỗi giá (RSI, SMA, sụt giảm từ đỉnh…) cũng không xếp hạng, và lý do
 * khác: xếp được, nhưng xếp theo một con số dựng từ chuỗi PRNG. 247 phiên trước phiên cuối là số
 * tự dựng (xem `samples.ts`), nên thứ hạng ấy là thứ hạng của số bịa — bày ra thì trông như một
 * phát hiện về thị trường. Cả hai nhóm dùng bộ mặc định `WF10_CODES`.
 *
 * ⚠ File này CHẠY công thức, nên nó import `@/core/calc`. Hợp lệ — CON-02 chỉ cấm `src/data` gọi
 * lên `@/ui` và `@/app`; `preset-inputs.ts` cạnh đây cũng đã đọc `@/core/calc`.
 */

import { runFormula } from '@/core/calc';
import type { CalcContext, FormulaModule } from '@/core/calc';
import { defaultInputs } from '@/core/registry';
import type { CalcOutput } from '@/core/types';

import { presetInputs } from './preset-inputs';
import { SAMPLE_PRESETS, WF10_CODES } from './samples';
import type { Preset } from './types';

/** Một mã mẫu kèm thứ nó cho ra khi chạy đúng công thức đang xem. */
export interface PresetPick {
  preset: Preset;
  /**
   * Kết quả công thức với bộ số của mã này.
   *
   * `CalcOutput` chứ không phải `number`: một mã hoàn toàn có thể cho ra cảnh báo (chia cho 0 khi
   * EPS âm, thiếu ô mà mã không cấp được…), và giấu ca đó đi để bày một con số là đúng thứ FR-06
   * cấm. Nơi hiển thị đọc `warning` rồi nói thật.
   */
  output: CalcOutput;
  /** Ô mà mã này điền được cho công thức, theo đúng thứ tự `spec.variables`. */
  filled: ReadonlyArray<{ key: string; value: number }>;
}

/** Số mã bày ra ở sheet. Bốn — đúng con số WF-10 đã chốt, chỉ khác ở chỗ nay chọn theo công thức. */
export const PICK_COUNT = 4;

/**
 * Bốn mã WF-10, KHÔNG kèm kết quả — cho nơi mở sheet mà không có công thức nào.
 *
 * Màn bảng dữ liệu (WF-05) là nơi đó: nó mở sheet để lấy một CHUỖI PHIÊN GIÁ vào bảng, không để
 * tính gì cả. Không có `FormulaModule` thì không xếp hạng được, và bịa ra một thứ tự ở đó chỉ để
 * bốn dòng trông khác nhau là quay lại đúng cái sai vừa gỡ.
 */
export function defaultPresetPicks(
  presets: ReadonlyArray<Preset> = SAMPLE_PRESETS,
): ReadonlyArray<PresetPick> {
  return presets
    .filter((preset) => WF10_CODES.includes(preset.code))
    .map((preset) => ({ preset, output: { value: null, unit: '' }, filled: [] }));
}

/**
 * Chạy thử một công thức với bộ số của một mã.
 *
 * Chuỗi phiên của mã ghi ĐÈ lên `baseCtx`, mọi thứ còn lại (biểu phí, chuỗi VN-Index, ngày tra
 * hằng số) giữ nguyên của nơi gọi. Nhờ vậy con số hiện ở sheet là đúng con số màn hình sẽ ra sau
 * khi bấm Nạp — dựng một ctx riêng ở đây thì công thức nhóm phí mất biểu phí và cả bốn dòng cùng
 * báo "chưa đủ dữ liệu" trong khi màn thật tính ra số bình thường.
 */
function evaluate(formula: FormulaModule, preset: Preset, baseCtx: CalcContext): PresetPick {
  const fromPreset = presetInputs(preset, formula.spec);

  const bars = preset.bars.map(({ date, open, high, low, close, volume }) => ({
    date,
    open,
    high,
    low,
    close,
    volume,
  }));

  const ctx: CalcContext = {
    ...baseCtx,
    bars,
    series: bars.map((bar) => bar.close).filter((close) => close > 0),
  };

  const filled: Array<{ key: string; value: number }> = [];
  for (const variable of formula.spec.variables) {
    const value = fromPreset[variable.key];
    if (value !== undefined) filled.push({ key: variable.key, value });
  }

  return {
    preset,
    output: runFormula(formula, { ...defaultInputs(formula.spec), ...fromPreset }, ctx),
    filled,
  };
}

/**
 * Lấy `count` phần tử TRẢI ĐỀU trên một danh sách đã xếp thứ tự.
 *
 * Lấy hai đầu trước rồi rải đều phần giữa, chứ không lấy `count` phần tử đầu: mục đích là bày ra
 * BIÊN ĐỘ của công thức, nên mã thấp nhất và mã cao nhất là hai mã bắt buộc phải có.
 *
 * Danh sách ngắn hơn `count` thì trả nguyên xi — không lặp lại phần tử cho đủ số.
 */
function spread<T>(sorted: ReadonlyArray<T>, count: number): ReadonlyArray<T> {
  if (sorted.length <= count) return sorted;

  const picked: T[] = [];
  const step = (sorted.length - 1) / (count - 1);

  for (let i = 0; i < count; i += 1) {
    const item = sorted[Math.round(i * step)];
    if (item !== undefined) picked.push(item);
  }

  return picked;
}

/**
 * Bốn mã đáng thử nhất cho `formula`, kèm kết quả của từng mã.
 *
 * @param baseCtx bối cảnh của chính màn đang gọi — ngày tra hằng số, biểu phí, chuỗi VN-Index.
 * Domain không được tự lấy ngày hệ thống (NFR-REL-03) nên nơi gọi phải truyền vào, và truyền cả
 * ctx thay vì riêng `asOf` để con số ở sheet khớp con số màn sẽ hiện — xem `evaluate()`.
 *
 * Thứ tự trả về là thứ tự KẾT QUẢ TĂNG DẦN khi có xếp hạng, và thứ tự kho khi không. Mã cho ra
 * cảnh báo bị loại khỏi phép xếp hạng nhưng vẫn được bù vào cuối nếu chưa đủ bốn: thà bày một
 * dòng nói rõ "không tính được với mã này" còn hơn bày ba dòng và để người dùng đoán mã thứ tư
 * đi đâu.
 */
export function pickPresetsFor(
  formula: FormulaModule,
  presets: ReadonlyArray<Preset>,
  baseCtx: CalcContext,
  count: number = PICK_COUNT,
): ReadonlyArray<PresetPick> {
  const evaluated = presets.map((preset) => evaluate(formula, preset, baseCtx));

  // Mã nào cũng không điền được ô nào — xem docblock đầu file. Bày bộ WF-10 theo đúng thứ tự kho.
  if (evaluated.every((item) => item.filled.length === 0)) {
    const wf10 = evaluated.filter((item) => WF10_CODES.includes(item.preset.code));
    return spread(wf10.length >= count ? wf10 : evaluated, count);
  }

  const ranked = evaluated
    .map((item) => ({ item, value: item.output.value }))
    .filter((entry): entry is { item: PresetPick; value: number } => entry.value !== null)
    .sort((a, b) => a.value - b.value)
    .map((entry) => entry.item);

  const chosen = spread(ranked, count);
  if (chosen.length >= count) return chosen;

  // Bù cho đủ số bằng những mã không ra được con số, giữ nguyên thứ tự kho.
  const already = new Set(chosen.map((item) => item.preset.code));
  return [
    ...chosen,
    ...evaluated.filter((item) => !already.has(item.preset.code)).slice(0, count - chosen.length),
  ];
}
