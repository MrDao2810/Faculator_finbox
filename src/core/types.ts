/**
 * Tầng DOMAIN — TypeScript thuần.
 * KHÔNG được import React, Next, hay bất kỳ tầng nào bên trên (CON-02, CON-03).
 * ESLint sẽ chặn nếu vi phạm — thử thêm `import { useState } from 'react'` rồi chạy `npm run lint`.
 */

/** Cấp độ hiển thị của một biến hoặc một công thức — dùng cho hai chế độ Cơ bản / Nâng cao (FR-09). */
export type Level = 'basic' | 'advanced';

/**
 * Đặc tả một biến đầu vào.
 * Bộ điều khiển nhập liệu ở giao diện sinh ra hoàn toàn từ đây, không hard-code (FR-05).
 */
export interface VariableSpec {
  /** Khoá duy nhất trong phạm vi một công thức, ví dụ 'price', 'eps'. */
  key: string;
  /** Nhãn tiếng Việt hiện trên giao diện. */
  label: string;
  /** Đơn vị hiện bên phải ô nhập: '₫', '%', 'lần', 'CP'… */
  unit: string;
  min?: number;
  max?: number;
  step?: number;
  level: Level;
  /** Mô tả ngắn, dùng cho cột MÔ TẢ của bảng biến (FR-02). */
  description?: string;
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
  /** Nêu đúng nguyên nhân, viết như nói với người mới (NFR-USA-04). */
  message: string;
  /** Dòng gợi ý sửa, hiện sau mũi tên ↳ trên giao diện. */
  fix?: string;
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
  value: number;
  unit: string;
  /** Ngày bắt đầu có hiệu lực, dạng ISO 'YYYY-MM-DD'. */
  effectiveFrom: string;
  /** Trích dẫn văn bản, ví dụ 'Luật thuế TNCN 109/2025/QH15, Điều 20'. */
  legalBasis: string;
}
