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
import type { FormulaSpec } from '../registry/types';
import type { CalcOutput } from '../types';
import { incompleteInput, meaningless } from '../warnings';
import type { CalcContext, CalcInputs, CalcValues, FormulaModule } from './types';

/**
 * Nhãn các biến chưa có giá trị dùng được.
 * Thiếu key, hoặc có key nhưng giá trị không hữu hạn, đều tính là chưa nhập.
 */
export function missingInputLabels(spec: FormulaSpec, inputs: CalcInputs): ReadonlyArray<string> {
  const missing: string[] = [];
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
        'Phép tính gặp lỗi ngoài dự kiến với bộ số liệu hiện tại.',
        'Kiểm tra lại các ô đầu vào, hoặc nạp bộ số liệu mẫu để so sánh.',
      ),
    );
  }
}
