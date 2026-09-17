/**
 * Tầng APPLICATION — lối vào khung "cách tính" CHỈ dành cho lúc build (17/09/2026).
 *
 * Cố ý KHÔNG xuất qua barrel `@/application`. Barrel ấy đi vào gói JS của mọi trang, còn khung cách
 * tính của 111 công thức là chữ nghĩa mà mỗi trang chỉ cần phần của chính nó — `page.tsx` (server
 * component) đọc ở đây, dựng sẵn MathML rồi truyền xuống bằng prop. Lý do đầy đủ ở docblock
 * `src/core/how-to/types.ts`.
 *
 * Nơi được import file này: `src/app/cong-thuc/[id]/notation-view.ts` và ca kiểm.
 * `build-only-imports.test.ts` gác danh sách đó.
 */

export type {
  DefinedHowTo,
  DerivedHowTo,
  FormulaHowTo,
  HowToEntry,
  HowToPhrases,
  HowToSkipReason,
  HowToStep,
  LinkedHowTo,
} from '@/core/how-to';
export { HOW_TO, HOW_TO_BY_FILE, howToFor } from '@/core/how-to';
