import { formatNumber } from './format';
import type { FormulaSpec } from './registry/types';

/**
 * Dòng "thay số" của khối gộp: lấy `spec.substitution` rồi đặt con số đang nhập vào từng chỗ trống.
 *
 * Mẫu viết bằng `{khoá}` của biến (xem docblock `FormulaSpec.substitution`). Hàm này CHỈ thay chữ —
 * nó không tính gì cả, vì con số kết quả luôn đến từ `calc`. Nhờ vậy dòng in ra không thể nói khác
 * khối Kết quả ngay cạnh nó.
 *
 * Số định dạng bằng `formatNumber` đúng như mọi con số khác trên màn, tức theo quy ước Việt Nam ở
 * cả hai ngôn ngữ (`formatNumber` ghim `LOCALE`). Đó cũng là thứ cửa gác ở `formulas.test.ts` tính
 * lại được: `evaluateWorked()` đọc đúng quy ước ấy.
 *
 * Thiếu khoá nào thì trả `null` chứ không in `{price}` ra màn — một chỗ trống lọt ra giao diện là
 * lỗi phải thấy ngay, không phải lỗi để người dùng đọc.
 */
export function fillSubstitution(
  spec: FormulaSpec,
  values: Readonly<Record<string, number>>,
): string | null {
  const template = spec.substitution;
  if (template === undefined) return null;

  let missing = false;
  const filled = template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) => {
    const value = values[key];
    if (value === undefined || !Number.isFinite(value)) {
      missing = true;
      return '';
    }
    return formatNumber(value, { maxDecimals: 4 });
  });

  return missing ? null : filled;
}

/** Khoá biến mà một mẫu thay số nhắc tới — dùng cho cửa gác ở `formulas.test.ts`. */
export function substitutionKeys(template: string): ReadonlyArray<string> {
  return [...template.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1] ?? '');
}
