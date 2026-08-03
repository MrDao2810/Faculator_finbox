/**
 * Tầng DOMAIN — catalog thông điệp cảnh báo tiếng Việt (gói WBS 1.3.3).
 *
 * WF-15 chốt đúng sáu loại lỗi chuẩn, mỗi loại phải có:
 *   · một câu nêu NGUYÊN NHÂN cụ thể, viết như nói với người mới (NFR-USA-04);
 *   · một dòng GỢI Ý SỬA, hiện sau mũi tên ↳ trên giao diện.
 *
 * Công thức không tự chế thông điệp. Muốn báo lỗi thì gọi hàm trong file này,
 * để cả 107 công thức nói cùng một giọng và đội nội dung sửa được ở một chỗ.
 */

import type { CalcWarning, WarningCode } from './types';

/** Sáu mã cảnh báo, giữ đúng thứ tự của WF-15. Dùng cho vòng lặp và test. */
export const WARNING_CODES = [
  'DIVIDE_BY_ZERO',
  'MEANINGLESS',
  'MISSING_SERIES',
  'MODEL_VIOLATION',
  'INHERITED',
  'INCOMPLETE_INPUT',
] as const satisfies ReadonlyArray<WarningCode>;

/** Nhãn ngắn hiện trên chip cảnh báo. Không phải câu giải thích. */
export const WARNING_LABELS: Readonly<Record<WarningCode, string>> = {
  DIVIDE_BY_ZERO: 'Chia cho 0',
  MEANINGLESS: 'Không có ý nghĩa',
  MISSING_SERIES: 'Thiếu dữ liệu chuỗi',
  MODEL_VIOLATION: 'Vi phạm điều kiện mô hình',
  INHERITED: 'Cảnh báo kế thừa',
  INCOMPLETE_INPUT: 'Chưa nhập đủ',
};

/**
 * Chia cho 0.
 * Ví dụ WF-15: P/E khi EPS bằng 0.
 *
 * @param what    tên kết quả đang tính, ví dụ 'P/E'
 * @param divisor nhãn của mẫu số đang bằng 0, ví dụ 'EPS'
 */
export function divideByZero(what: string, divisor: string, fix?: string): CalcWarning {
  return {
    code: 'DIVIDE_BY_ZERO',
    message: `Chưa tính được ${what} vì ${divisor} bằng 0.`,
    fix: fix ?? `Nhập ${divisor} khác 0 hoặc chọn kỳ khác.`,
  };
}

/**
 * Tính ra số nhưng con số đó vô nghĩa với người dùng.
 * Ví dụ WF-15: P/E khi doanh nghiệp đang lỗ.
 *
 * @param reason câu nêu nguyên nhân, viết đủ nghĩa vì đây là phần người dùng đọc
 */
export function meaningless(reason: string, fix?: string): CalcWarning {
  return { code: 'MEANINGLESS', message: reason, fix };
}

/**
 * Thiếu dữ liệu chuỗi.
 * Ví dụ WF-15: Beta cần ít nhất 60 phiên giá.
 *
 * @param needed số phiên tối thiểu
 * @param have   số phiên đang có
 */
export function missingSeries(needed: number, have: number, what = 'phiên giá'): CalcWarning {
  return {
    code: 'MISSING_SERIES',
    message: `Cần ít nhất ${needed} ${what}, hiện mới có ${have}.`,
    fix: 'Nạp bộ số liệu mẫu hoặc dán chuỗi giá từ Excel.',
  };
}

/**
 * Vi phạm điều kiện của mô hình — số vẫn tính ra được nhưng mô hình không còn đúng.
 * Ví dụ WF-15: DCF khi tốc độ tăng trưởng g ≥ WACC.
 *
 * @param condition điều kiện bị vi phạm, viết bằng ký hiệu người dùng nhìn thấy trên màn
 */
export function modelViolation(condition: string, fix?: string): CalcWarning {
  return {
    code: 'MODEL_VIOLATION',
    message: `Mô hình không dùng được khi ${condition}.`,
    fix,
  };
}

/**
 * Cảnh báo kế thừa — thượng nguồn lỗi thì hạ nguồn không được âm thầm cho ra số (FR-15).
 * WF-15 yêu cầu gợi ý sửa phải chỉ ra hai lối đi: sửa thượng nguồn, hoặc ghi đè tại chỗ.
 *
 * @param upstreamLabel tên công thức thượng nguồn đang lỗi, ví dụ 'Beta'
 * @param selfLabel     tên biến đang bị kế thừa lỗi, ví dụ 'WACC'
 */
export function inheritedFrom(upstreamLabel: string, selfLabel?: string): CalcWarning {
  const fix = selfLabel
    ? `Mở ${upstreamLabel} để sửa · hoặc ghi đè ${selfLabel} tại đây.`
    : `Sửa ${upstreamLabel} hoặc nhập tay giá trị này.`;
  return {
    code: 'INHERITED',
    message: `Chưa tính được vì ${upstreamLabel} ở bước trước đang lỗi.`,
    fix,
  };
}

/**
 * Còn ô chưa nhập.
 *
 * @param missingLabels nhãn các ô còn trống, đã là tiếng Việt
 */
export function incompleteInput(missingLabels: ReadonlyArray<string>): CalcWarning {
  const list = missingLabels.filter((label) => label.trim() !== '');
  return {
    code: 'INCOMPLETE_INPUT',
    message: list.length > 0 ? `Còn thiếu: ${list.join(', ')}.` : 'Còn ô chưa nhập.',
    fix: 'Nhập nốt các ô còn trống rồi kết quả hiện ngay.',
  };
}
