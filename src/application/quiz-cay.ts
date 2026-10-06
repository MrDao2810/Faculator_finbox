/**
 * Tầng APPLICATION — cây công thức cho bộ VẼ, không kèm bộ phân tích (29/09/2026).
 *
 * `CongThucDien.tsx` vẽ một cây `Nut` và cần đúng hai thứ: kiểu cây và `chieuCao` (kéo dãn ngoặc, dấu
 * căn). Lấy chúng qua `@/application/quiz-math` thì kéo theo cả `worked-line.ts` — bộ phân tích cú
 * pháp — mà từ ngày khối Ví dụ thực tế vẽ dòng "Áp vào công thức" bằng `CongThucDien`, bộ vẽ nằm trong
 * First Load JS của cả 111 trang chi tiết. Khối Ví dụ nhận cây dựng sẵn lúc build (`page.tsx`), nên
 * trình duyệt chỉ cần module LÁ `@/core/quiz/nut`, không cần bộ phân tích.
 */

export { chieuCao, chuCuaCay } from '@/core/quiz/nut';
export type { Nut } from '@/core/quiz/nut';
