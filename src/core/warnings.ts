/**
 * Tầng DOMAIN — catalog thông điệp cảnh báo song ngữ (gói WBS 1.3.3, mở rộng gói dịch tiếng Anh).
 *
 * WF-15 chốt đúng sáu loại lỗi chuẩn, mỗi loại phải có:
 *   · một câu nêu NGUYÊN NHÂN cụ thể, viết như nói với người mới (NFR-USA-04);
 *   · một dòng GỢI Ý SỬA, hiện sau mũi tên ↳ trên giao diện.
 *
 * Công thức không tự chế thông điệp. Muốn báo lỗi thì gọi hàm trong file này,
 * để cả 111 công thức nói cùng một giọng và đội nội dung sửa được ở một chỗ.
 *
 * Mỗi hàm tự viết CẢ HAI câu vi/en ngay tại chỗ — không import i18n (CON-02), đúng cách
 * `FormulaSummary.name: {vi, en}` đã làm từ trước. Tham số nhãn/nguyên nhân cũng là `Bilingual`
 * để hai câu ghép ra đúng ngôn ngữ của chính nó.
 */

import type { Bilingual, CalcWarning, WarningCode } from './types';

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
export const WARNING_LABELS: Readonly<Record<WarningCode, Bilingual>> = {
  DIVIDE_BY_ZERO: { vi: 'Chia cho 0', en: 'Division by zero' },
  MEANINGLESS: { vi: 'Không có ý nghĩa', en: 'Not meaningful' },
  MISSING_SERIES: { vi: 'Thiếu dữ liệu chuỗi', en: 'Missing series data' },
  MODEL_VIOLATION: { vi: 'Vi phạm điều kiện mô hình', en: 'Model condition violated' },
  INHERITED: { vi: 'Cảnh báo kế thừa', en: 'Inherited warning' },
  INCOMPLETE_INPUT: { vi: 'Chưa nhập đủ', en: 'Incomplete input' },
};

/**
 * Chia cho 0.
 * Ví dụ WF-15: P/E khi EPS bằng 0.
 *
 * @param what    tên kết quả đang tính, ví dụ 'P/E'
 * @param divisor nhãn của mẫu số đang bằng 0, ví dụ 'EPS'
 */
export function divideByZero(what: Bilingual, divisor: Bilingual, fix?: Bilingual): CalcWarning {
  return {
    code: 'DIVIDE_BY_ZERO',
    message: {
      vi: `Chưa tính được ${what.vi} vì ${divisor.vi} bằng 0.`,
      en: `Cannot calculate ${what.en} because ${divisor.en} is 0.`,
    },
    fix: fix ?? {
      vi: `Nhập ${divisor.vi} khác 0 hoặc chọn kỳ khác.`,
      en: `Enter a non-zero ${divisor.en} or choose a different period.`,
    },
  };
}

/**
 * Tính ra số nhưng con số đó vô nghĩa với người dùng.
 * Ví dụ WF-15: P/E khi doanh nghiệp đang lỗ.
 *
 * @param reason câu nêu nguyên nhân, viết đủ nghĩa vì đây là phần người dùng đọc
 */
export function meaningless(reason: Bilingual, fix?: Bilingual): CalcWarning {
  return { code: 'MEANINGLESS', message: reason, fix };
}

/**
 * Thiếu dữ liệu chuỗi.
 * Ví dụ WF-15: Beta cần ít nhất 60 phiên giá.
 *
 * @param needed số phiên tối thiểu
 * @param have   số phiên đang có
 */
export function missingSeries(needed: number, have: number, what?: Bilingual): CalcWarning {
  const label = what ?? { vi: 'phiên giá', en: 'price sessions' };
  return {
    code: 'MISSING_SERIES',
    message: {
      vi: `Cần ít nhất ${needed} ${label.vi}, hiện mới có ${have}.`,
      en: `Need at least ${needed} ${label.en}, currently only ${have}.`,
    },
    fix: {
      vi: 'Nạp bộ số liệu mẫu hoặc dán chuỗi giá từ Excel.',
      en: 'Load a sample dataset or paste a price series from Excel.',
    },
  };
}

/**
 * Vi phạm điều kiện của mô hình — số vẫn tính ra được nhưng mô hình không còn đúng.
 * Ví dụ WF-15: DCF khi tốc độ tăng trưởng g ≥ WACC.
 *
 * @param condition điều kiện bị vi phạm, viết bằng ký hiệu người dùng nhìn thấy trên màn
 */
export function modelViolation(condition: Bilingual, fix?: Bilingual): CalcWarning {
  return {
    code: 'MODEL_VIOLATION',
    message: {
      vi: `Mô hình không dùng được khi ${condition.vi}.`,
      en: `The model does not apply when ${condition.en}.`,
    },
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
export function inheritedFrom(upstreamLabel: Bilingual, selfLabel?: Bilingual): CalcWarning {
  const fix: Bilingual = selfLabel
    ? {
        vi: `Mở ${upstreamLabel.vi} để sửa · hoặc ghi đè ${selfLabel.vi} tại đây.`,
        en: `Open ${upstreamLabel.en} to fix it · or override ${selfLabel.en} here.`,
      }
    : {
        vi: `Sửa ${upstreamLabel.vi} hoặc nhập tay giá trị này.`,
        en: `Fix ${upstreamLabel.en} or enter this value manually.`,
      };
  return {
    code: 'INHERITED',
    message: {
      vi: `Chưa tính được vì ${upstreamLabel.vi} ở bước trước đang lỗi.`,
      en: `Cannot calculate because ${upstreamLabel.en} in the previous step is broken.`,
    },
    fix,
  };
}

/**
 * Còn ô chưa nhập.
 *
 * @param missingLabels nhãn các ô còn trống
 */
export function incompleteInput(missingLabels: ReadonlyArray<Bilingual>): CalcWarning {
  const vi = missingLabels.map((label) => label.vi).filter((label) => label.trim() !== '');
  const en = missingLabels.map((label) => label.en).filter((label) => label.trim() !== '');
  return {
    code: 'INCOMPLETE_INPUT',
    message: {
      vi: vi.length > 0 ? `Còn thiếu: ${vi.join(', ')}.` : 'Còn ô chưa nhập.',
      en: en.length > 0 ? `Still missing: ${en.join(', ')}.` : 'There are empty fields.',
    },
    fix: {
      vi: 'Nhập nốt các ô còn trống rồi kết quả hiện ngay.',
      en: 'Fill in the remaining fields and the result appears right away.',
    },
  };
}
