/**
 * Tầng DOMAIN — chạy một công thức (gói WBS 3.x, nền cho nhánh 5).
 *
 * `runFormula()` là cổng duy nhất để gọi hàm tính. Nó giữ hai lời hứa mà từng công thức
 * không phải tự nhớ:
 *
 *   1. Ô để trống thì báo "Chưa nhập đủ" kèm tên ô, KHÔNG thay bằng 0. Ô trống không phải
 *      số không — đây đúng ca cuối cùng của WF-15 và là một nửa của NFR-REL-01.
 *   2. Hàm tính ném lỗi thì bắt lại thành cảnh báo, không để ngoại lệ chạy lên giao diện.
 *
 * Cùng cách nghĩ với `ok()`: lưới an toàn đặt ở chỗ đi qua bắt buộc, thay vì trông chờ
 * người viết công thức nhớ kiểm tra.
 */

import { fail } from '../calc-output';
import { defaultInputs } from '../registry/build';
import type { FormulaSpec } from '../registry/types';
import type { Bilingual, CalcOutput } from '../types';
import { incompleteInput, meaningless } from '../warnings';
import type { CalcContext, CalcInputs, CalcValues, FormulaModule } from './types';

/**
 * Nhãn các biến chưa có giá trị dùng được.
 * Thiếu key, hoặc có key nhưng giá trị không hữu hạn, đều tính là chưa nhập.
 */
export function missingInputLabels(
  spec: FormulaSpec,
  inputs: CalcInputs,
): ReadonlyArray<Bilingual> {
  const missing: Bilingual[] = [];
  for (const variable of spec.variables) {
    const value = inputs[variable.key];
    if (value === undefined || !Number.isFinite(value)) missing.push(variable.label);
  }
  return missing;
}

/**
 * Tính một công thức.
 *
 * @param formula công thức cần tính — spec đi liền hàm tính
 * @param inputs  giá trị người dùng đã nhập; ô để trống thì bỏ hẳn key, đừng truyền 0
 * @param ctx     ngày tra hằng số, biểu phí, chuỗi giá, kết quả thượng nguồn
 */
export function runFormula(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
): CalcOutput {
  const { spec, calc } = formula;

  const missing = missingInputLabels(spec, inputs);
  if (missing.length > 0) return fail(spec.resultUnit, incompleteInput(missing));

  // Biến không khai trong spec mà hàm tính lỡ hỏi tới sẽ nhận NaN, rồi ok() đổi thành fail.
  // Thà ra cảnh báo còn hơn ra một con số dựng từ giá trị không có thật.
  const value: CalcValues = (key) => inputs[key] ?? Number.NaN;

  try {
    return calc(value, ctx);
  } catch {
    return fail(
      spec.resultUnit,
      meaningless(
        {
          vi: 'Phép tính gặp lỗi ngoài dự kiến với bộ số liệu hiện tại.',
          en: 'The calculation hit an unexpected error with the current inputs.',
        },
        {
          vi: 'Kiểm tra lại các ô đầu vào, hoặc nạp bộ số liệu mẫu để so sánh.',
          en: 'Double-check the input fields, or load a sample dataset to compare.',
        },
      ),
    );
  }
}

/**
 * Công thức này có ăn chuỗi giá hay không (FR-12).
 *
 * Vì sao THỬ CHẠY thay vì đọc một field khai sẵn: không có field nào khai điều đó. Trước đợt này
 * màn chi tiết lấy `chartType === 'candlestick'` làm cờ — nhưng đó là loại BIỂU ĐỒ, không phải
 * nhu cầu dữ liệu. Hệ quả: 11 công thức có nút "Dán chuỗi giá" trong khi 34 công thức cần chuỗi;
 * cả nhóm phân phối lợi suất, sụt giảm từ đỉnh và hồi quy bị bỏ sót — người dùng gặp lỗi "chưa đủ
 * phiên giá" mà trên màn không có lối nào để nạp.
 *
 * Phép thử ở đây CHÍNH LÀ phép mà `FormulaDetail.test.tsx` đang dùng để chốt con số 34: chạy công
 * thức với giá trị mặc định và KHÔNG có chuỗi, rồi xem nó có báo thiếu chuỗi hay không. Nó không
 * thể lệch với thực tế, còn một field khai tay thì lệch được — cùng cách nghĩ đã chọn cho `ok()`.
 *
 * Đặt cạnh `missingInputLabels()` vì cùng một loại câu hỏi: công thức này còn thiếu gì để ra số.
 * Hàm thuần, một module luôn cho cùng một câu trả lời, nên nơi gọi bọc `useMemo` là đủ.
 *
 * @param asOf ngày tra hằng số — không đổi được kết quả (công thức chuỗi không đọc hằng số nào),
 * nhưng `CalcContext` đòi nó và Domain không được tự lấy ngày hệ thống (NFR-REL-03).
 */
export function needsPriceSeries(formula: FormulaModule, asOf: string): boolean {
  const probe = runFormula(formula, defaultInputs(formula.spec), { asOf });
  return probe.warning?.code === 'MISSING_SERIES';
}
