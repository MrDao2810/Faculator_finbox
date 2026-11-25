/**
 * Tầng DOMAIN — TypeScript thuần.
 * KHÔNG được import React, Next, hay bất kỳ tầng nào bên trên (CON-02, CON-03).
 * ESLint sẽ chặn nếu vi phạm — thử thêm `import { useState } from 'react'` rồi chạy `npm run lint`.
 */

/** Cấp độ hiển thị của một biến hoặc một công thức — dùng cho hai chế độ Cơ bản / Nâng cao (FR-09). */
export type Level = 'basic' | 'advanced';

/**
 * Một đoạn chữ có cả hai ngôn ngữ (gói dịch tiếng Anh cho nội dung công thức).
 * Domain tự viết cả hai vế ngay tại chỗ khai báo — không import i18n (CON-02) — đúng tiền lệ
 * `FormulaSummary.name`. Tầng UI đọc qua `pick()` của `@/application`, không đọc `.vi`/`.en` trực tiếp.
 */
export interface Bilingual {
  vi: string;
  en: string;
}

/**
 * Loại điều khiển nhập liệu sinh ra cho một biến.
 * Danh sách này khớp với bộ điều khiển chốt ở WF-16 và các gói 2.3.1 → 2.3.3.
 */
export type ControlType =
  | 'number' // ô số
  | 'slider' // thanh trượt, cần đủ min/max/step
  | 'select' // danh sách chọn
  | 'radio' // radio nhiều dòng
  | 'toggle' // bật/tắt, đúng 2 lựa chọn
  | 'buttonGroup'; // nhóm nút kiểu Quý · Năm · TTM

/**
 * Một lựa chọn của biến kiểu select / radio / toggle / buttonGroup (LDR-02).
 * Giá trị luôn là số để mọi biến đi vào công thức cùng một kiểu.
 */
export interface VariableOption {
  value: number;
  label: Bilingual;
  /** Dòng mô tả phụ dưới nhãn — radio nhiều dòng ở WF-16 có dùng. */
  description?: Bilingual;
}

/**
 * Đặc tả một biến đầu vào.
 * Bộ điều khiển nhập liệu ở giao diện sinh ra hoàn toàn từ đây, không hard-code (FR-05, LDR-01).
 */
export interface VariableSpec {
  /** Khoá duy nhất trong phạm vi một công thức, ví dụ 'price', 'eps'. */
  key: string;
  /** Nhãn hiện trên giao diện, cả hai ngôn ngữ. */
  label: Bilingual;
  /** Đơn vị hiện bên phải ô nhập: '₫', '%', 'lần', 'CP'… */
  unit: string;
  /** Loại điều khiển. LDR-01 gọi trường này là `type`. */
  type: ControlType;
  /**
   * Giá trị khởi tạo. LDR-01 gọi trường này là `default` — ở đây đổi tên thành
   * `defaultValue` cho khỏi trùng từ khoá, còn ý nghĩa giữ nguyên.
   * Bắt buộc có, để không ô nhập nào khởi động ở trạng thái trống hay NaN.
   */
  defaultValue: number;
  min?: number;
  max?: number;
  step?: number;
  /**
   * Ô chỉ nhận số NGUYÊN — số phiên, số kỳ, số tháng (16/11/2026). Đặt cho ô mà `calc` dùng làm số
   * đếm (cắt chuỗi giá, lặp từng kỳ); gõ số lẻ thì ô báo đỏ và số ấy không đi lên màn, rời ô thì làm
   * tròn (`clampToSpec()`). Không suy ra từ `step`: `step` chỉ còn là việc của biểu đồ.
   */
  integer?: boolean;
  /**
   * Ô phải LỚN HƠN 0 — `min` (0) không được nhận (16/11/2026). Chủ dự án trên ô "Số tiền vay": câu
   * báo phải là "Số tiền vay lớn hơn 0", tức điều kiện là > 0, không phải ≥ 0 hay ≥ một mức tự đặt.
   * Gõ 0 hay số âm là ngoài miền; rời ô thì về `defaultValue` (không có "số dương nhỏ nhất" nào để kẹp).
   */
  positive?: boolean;
  level: Level;
  /** Mô tả ngắn, dùng cho cột MÔ TẢ của bảng biến (FR-02). */
  description?: Bilingual;
  /** Bắt buộc với select / radio / toggle / buttonGroup. */
  options?: ReadonlyArray<VariableOption>;
}

/**
 * Sáu loại cảnh báo chuẩn, chốt ở màn WF-15 của wireframe.
 * Mỗi loại có một thông điệp tiếng Việt đời thường và một gợi ý cách sửa.
 */
export type WarningCode =
  | 'DIVIDE_BY_ZERO' // P/E khi EPS = 0
  | 'MEANINGLESS' // P/E khi doanh nghiệp đang lỗ
  | 'MISSING_SERIES' // Beta khi chưa đủ 60 phiên giá
  | 'MODEL_VIOLATION' // DCF khi g ≥ WACC
  | 'INHERITED' // thượng nguồn lỗi thì hạ nguồn kế thừa (FR-15)
  | 'INCOMPLETE_INPUT'; // còn ô chưa nhập

export interface CalcWarning {
  code: WarningCode;
  /** Nêu đúng nguyên nhân, viết như nói với người mới (NFR-USA-04). Cả hai ngôn ngữ. */
  message: Bilingual;
  /** Dòng gợi ý sửa, hiện sau mũi tên ↳ trên giao diện. Cả hai ngôn ngữ. */
  fix?: Bilingual;
  /**
   * Ô nhập phải sửa, và câu ngắn in đỏ ngay dưới ô ấy — xem `atField()` (18/11/2026).
   *
   * Chỉ có khi lỗi sinh ra từ số người dùng nhập vào một ô cụ thể (EPS ≤ 0 của P/E, giá bán ≤
   * biến phí của điểm hoà vốn). Lỗi do chuỗi giá, do thiếu ô, do bước trước, hay do một đại lượng
   * tính ra không thuộc ô nào thì không có.
   */
  field?: FieldCondition;
  /**
   * Điều kiện về chuỗi giá mà số liệu hiện có chưa đạt, viết thành cụm danh từ để chèn vào câu:
   * "ít nhất 60 phiên giá". Chỉ `missingSeries()` đặt (25/11/2026) — sheet chọn mã đọc nó để ghi
   * dưới từng mã "Số liệu chưa đáp ứng điều kiện … của công thức", xem `dieuKienChuoiThieu()`.
   */
  condition?: Bilingual;
}

/** Điều kiện của công thức vừa bị một ô nhập vi phạm — xem `CalcWarning.field`. */
export interface FieldCondition {
  /** Khoá của ô (`VariableSpec.key`) nhận câu báo. Điều kiện giữa hai ô vẫn chỉ gắn MỘT ô. */
  key: string;
  /**
   * Một câu nêu điều kiện, gọi ô bằng nhãn bỏ ký hiệu trong ngoặc: "EPS phải lớn hơn 0.", "Giá bán
   * phải lớn hơn Biến phí một sản phẩm.". Không giải thích vì sao — thẻ kết quả đã làm việc đó.
   */
  message: Bilingual;
}

/**
 * Kết quả trả về của MỌI hàm tính trong hệ thống.
 *
 * FR-06 · NFR-REL-01 — bất biến quan trọng nhất của dự án:
 * không bao giờ trả về NaN, Infinity, hay 0 thay cho lỗi.
 * Không tính được thì value = null và PHẢI có warning giải thích.
 */
export interface CalcOutput {
  value: number | null;
  unit: string;
  warning?: CalcWarning;
  /** Các số phụ đi kèm, ví dụ tổng chi phí, giá hoà vốn. */
  extras?: Readonly<Record<string, number>>;
  /** Chuỗi điểm để vẽ biểu đồ, ví dụ đường quét độ nhạy (FR-07, FR-08). */
  series?: ReadonlyArray<{ x: number; y: number }>;
}

/**
 * Một hằng số thuế hoặc phí.
 * Tách khỏi công thức, có hiệu lực theo ngày, có căn cứ pháp lý (LDR-03, CON-10).
 */
export interface MarketConstant {
  key: string;
  /** Nhãn hiện trên bảng bóc tách chi phí của WF-08, cả hai ngôn ngữ. */
  label: Bilingual;
  /**
   * Giá trị. Hằng số phần trăm ghi theo quy ước CON-05 — 0,1 nghĩa là 0,1%,
   * đổi sang hệ số nhân bằng resolveRate().
   */
  value: number;
  unit: string;
  /** Ngày bắt đầu có hiệu lực, dạng ISO 'YYYY-MM-DD'. */
  effectiveFrom: string;
  /** Trích dẫn văn bản, ví dụ 'Luật thuế TNCN 109/2025/QH15, Điều 20'. Cả hai ngôn ngữ. */
  legalBasis: Bilingual;
  /** Ghi chú hiện dưới toggle/dòng phụ ở giao diện, ví dụ mức trần hay điều kiện áp dụng. */
  note?: Bilingual;
}
