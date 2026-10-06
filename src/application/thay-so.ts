/**
 * Tầng APPLICATION — phân tích mẫu thay số, CHỈ dành cho lúc build (05/10/2026).
 *
 * Cố ý KHÔNG xuất qua barrel `@/application`, cùng lý do `how-to.ts` và `vi-du.ts`: file này kéo
 * theo `worked-line.ts`, bộ phân tích cú pháp 24 kB, mà barrel thì đi vào gói JS của mọi trang.
 *
 * Trình duyệt không cần nó: cây dựng xong lúc build là đứng yên, chỉ các lá đổi theo phím gõ, và
 * việc đặt số vào lá do `datSoThaySo` lo — hàm ấy ở `@/core/substitution-cay`, nhẹ, xuất qua barrel
 * bình thường.
 *
 * Nơi được import file này: `src/app/cong-thuc/[id]/page.tsx`. `build-only-imports.test.ts` gác.
 */

export { derivedShape, substitutionShape } from '@/core/substitution-shape';
