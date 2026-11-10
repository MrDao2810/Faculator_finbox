/**
 * Tầng APPLICATION — lối vào "Câu hỏi thường gặp" CHỈ dành cho lúc build (10/11/2026).
 *
 * Cố ý KHÔNG xuất qua barrel `@/application`, cùng lý do `vi-du.ts`: barrel ấy đi vào gói JS của mọi
 * trang, còn câu hỏi của 111 công thức là chữ mà mỗi trang chỉ cần phần của chính nó. `page.tsx`
 * (server component) đọc ở đây rồi truyền xuống bằng prop. Barrel chỉ xuất KIỂU.
 *
 * Nơi được import file này: `src/app/cong-thuc/[id]/page.tsx`. `build-only-imports.test.ts` gác.
 */

export type { CauHoiThuongGap } from '@/core/hoi-dap';
export { hoiDapFor } from '@/core/hoi-dap';
