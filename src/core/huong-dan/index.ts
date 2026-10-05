/**
 * Tầng DOMAIN — bài "Hướng dẫn sử dụng" của từng công thức (WF-21, 02/10/2026).
 *
 * CHỈ đọc lúc build, qua `@/application/huong-dan`: dựng một bài phải chạy `calc` hàng trăm lượt
 * (dò số phiên tối thiểu, lấy lại câu cảnh báo thật), và chữ của cả 111 bài là thứ mỗi trang chỉ
 * cần phần của chính nó. Cùng nếp `src/core/how-to/` và `src/core/vi-du/`;
 * `build-only-imports.test.ts` gác danh sách nơi được import.
 */

export type { BaiHuongDan, BaiRiengDaChuan, MucId, ONhapHuongDan } from './types';
export { THU_TU_MUC } from './types';
export { baiHuongDan, caKetQuaTrong } from './bai';
