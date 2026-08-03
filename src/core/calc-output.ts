/**
 * Tầng DOMAIN — cổng duy nhất để tạo ra một CalcOutput.
 *
 * Mọi công thức đều phải trả về qua ok() hoặc fail(). Không hàm nào được
 * `return someNumber` trần. Đó là cách duy nhất giữ được bất biến FR-06:
 * người dùng không bao giờ nhìn thấy NaN, Infinity hay 0 thay cho lỗi.
 */

import type { CalcOutput, CalcWarning, VariableSpec } from './types';

type Extra = Pick<CalcOutput, 'extras' | 'series'>;

/**
 * Trả về kết quả tính được.
 * Nếu giá trị lọt vào NaN hoặc Infinity thì tự động chuyển thành fail —
 * lưới an toàn cuối cùng, không phụ thuộc vào việc người viết công thức có nhớ kiểm tra hay không.
 */
export function ok(value: number, unit: string, extra: Extra = {}): CalcOutput {
  if (!Number.isFinite(value)) {
    return fail(unit, {
      code: 'MEANINGLESS',
      message: 'Phép tính cho ra giá trị không xác định với bộ số liệu hiện tại.',
      fix: 'Kiểm tra lại các ô đầu vào.',
    });
  }
  return { value, unit, ...extra };
}

/** Trả về trạng thái không tính được, kèm lý do bắt buộc. */
export function fail(unit: string, warning: CalcWarning): CalcOutput {
  return { value: null, unit, warning };
}

/** Cảnh báo kế thừa: thượng nguồn lỗi thì hạ nguồn không được âm thầm cho ra số (FR-15). */
export function inherited(unit: string, upstreamLabel: string, fix?: string): CalcOutput {
  return fail(unit, {
    code: 'INHERITED',
    message: `Chưa tính được vì ${upstreamLabel} ở bước trước đang lỗi.`,
    fix: fix ?? `Sửa ${upstreamLabel} hoặc nhập tay giá trị này.`,
  });
}

/**
 * Kẹp giá trị người dùng nhập vào khoảng hợp lệ của biến.
 * Không ném lỗi, không trả NaN — luôn cho ra một số dùng được.
 */
export function clampToSpec(raw: number, spec: VariableSpec): number {
  if (!Number.isFinite(raw)) return spec.min ?? 0;
  let v = raw;
  if (spec.min !== undefined && v < spec.min) v = spec.min;
  if (spec.max !== undefined && v > spec.max) v = spec.max;
  return v;
}

/** Kiểm tra nhanh dùng trong test và trong lớp hiển thị. */
export function isCalculated(out: CalcOutput): out is CalcOutput & { value: number } {
  return out.value !== null;
}
