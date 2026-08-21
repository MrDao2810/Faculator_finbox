/**
 * Tầng DOMAIN — cổng duy nhất để tạo ra một CalcOutput.
 *
 * Mọi công thức đều phải trả về qua ok() hoặc fail(). Không hàm nào được
 * `return someNumber` trần. Đó là cách duy nhất giữ được bất biến FR-06:
 * người dùng không bao giờ nhìn thấy NaN, Infinity hay 0 thay cho lỗi.
 */

import type { Bilingual, CalcOutput, CalcWarning, VariableSpec } from './types';
import { inheritedFrom, meaningless } from './warnings';

type Extra = Pick<CalcOutput, 'extras' | 'series'>;

/**
 * Trả về kết quả tính được.
 * Nếu giá trị lọt vào NaN hoặc Infinity thì tự động chuyển thành fail —
 * lưới an toàn cuối cùng, không phụ thuộc vào việc người viết công thức có nhớ kiểm tra hay không.
 */
export function ok(value: number, unit: string, extra: Extra = {}): CalcOutput {
  if (!Number.isFinite(value)) {
    return fail(
      unit,
      meaningless(
        {
          vi: 'Phép tính cho ra giá trị không xác định với bộ số liệu hiện tại.',
          en: 'The calculation produced an undefined value with the current inputs.',
        },
        { vi: 'Kiểm tra lại các ô đầu vào.', en: 'Double-check the input fields.' },
      ),
    );
  }
  return { value, unit, ...extra };
}

/** Trả về trạng thái không tính được, kèm lý do bắt buộc. */
export function fail(unit: string, warning: CalcWarning): CalcOutput {
  return { value: null, unit, warning };
}

/**
 * Cảnh báo kế thừa: thượng nguồn lỗi thì hạ nguồn không được âm thầm cho ra số (FR-15).
 *
 * @param upstreamLabel tên công thức thượng nguồn đang lỗi, ví dụ 'Beta'
 * @param selfLabel     tên biến tại chỗ, để gợi ý sửa chỉ đúng nút Ghi đè (WF-15)
 */
export function inherited(
  unit: string,
  upstreamLabel: Bilingual,
  selfLabel?: Bilingual,
): CalcOutput {
  return fail(unit, inheritedFrom(upstreamLabel, selfLabel));
}

/**
 * Kẹp giá trị người dùng nhập vào khoảng hợp lệ của biến.
 * Không ném lỗi, không trả NaN — luôn cho ra một số dùng được.
 * Gặp giá trị không phải số thì rơi về defaultValue của chính biến đó.
 */
export function clampToSpec(raw: number, spec: VariableSpec): number {
  if (!Number.isFinite(raw)) return spec.defaultValue;
  let v = raw;
  if (spec.min !== undefined && v < spec.min) v = spec.min;
  if (spec.max !== undefined && v > spec.max) v = spec.max;
  return v;
}

/**
 * Làm tròn về bội của step, tính từ min (hoặc từ 0 nếu biến không khai báo min).
 * Dùng cho thanh trượt; ô số nhập tay thì không gọi, để người dùng gõ số lẻ được.
 * Biến không có step thì trả nguyên giá trị.
 */
export function snapToStep(raw: number, spec: VariableSpec): number {
  const clamped = clampToSpec(raw, spec);
  const step = spec.step;
  if (step === undefined || !Number.isFinite(step) || step <= 0) return clamped;

  const base = spec.min ?? 0;
  const snapped = base + Math.round((clamped - base) / step) * step;

  // Làm tròn theo số chữ số thập phân của step để tránh rác dấu phẩy động (0,30000000000000004).
  const decimals = decimalsOf(step);
  const rounded = Number(snapped.toFixed(decimals));

  // Bước nhảy có thể đẩy giá trị ra ngoài miền — kẹp lại lần nữa cho chắc.
  return clampToSpec(rounded, spec);
}

/** Kiểm tra nhanh dùng trong test và trong lớp hiển thị. */
export function isCalculated(out: CalcOutput): out is CalcOutput & { value: number } {
  return out.value !== null;
}

function decimalsOf(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot === -1 ? 0 : text.length - dot - 1;
}
