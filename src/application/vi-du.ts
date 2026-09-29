/**
 * Tầng APPLICATION — lối vào lời giải của khối "Ví dụ thực tế" CHỈ dành cho lúc build (29/09/2026).
 *
 * Cố ý KHÔNG xuất qua barrel `@/application`, cùng lý do `how-to.ts`: barrel ấy đi vào gói JS của mọi
 * trang, còn lời giải của 111 ví dụ là chữ mà mỗi trang chỉ cần phần của chính nó. `page.tsx` (server
 * component) đọc ở đây rồi truyền xuống bằng prop. Barrel chỉ xuất KIỂU (`export type` biến mất lúc
 * biên dịch).
 *
 * Nơi được import file này: `src/app/cong-thuc/[id]/page.tsx`. `build-only-imports.test.ts` gác.
 */

export type { ViDuGiai, ViDuNguon } from '@/core/vi-du';
export { viDuGiaiFor } from '@/core/vi-du';
