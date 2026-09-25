/**
 * Cắt bộ câu hỏi của MỘT công thức, chạy lúc build.
 *
 * Cùng khuôn `notation-view.ts`: `page.tsx` (server component) gọi ở đây rồi truyền kết quả
 * xuống `FormulaDetail` bằng prop. Nhờ vậy mỗi trang chi tiết chỉ mang 1–5 câu của chính nó,
 * thay vì cả ngân hàng 206 câu (~150 kB chữ) nhân lên 111 lần.
 *
 * `build-only-imports.test.ts` gác: `@/application/quiz` chỉ được import từ file này.
 */

import type { Bilingual, FormulaSpec } from '@/application';
import { quizFor } from '@/application/quiz';
import type { QuizItem } from '@/application/quiz';

/**
 * Phần của khối Bài tập trên MỘT trang: câu hỏi của công thức ấy, cộng chính công thức ấy.
 *
 * Công thức đi kèm để khối lời giải có cấu trúc (`QuizGiai`) dựng được dòng "Công thức" mà
 * không câu nào phải chép lại nó. Chép lại là dựng bản sao thứ hai của một thứ đã có.
 *
 * `kyHieu` là bảng "A: là gì" của chính công thức — người đọc rê chuột lên dòng công thức thì
 * hiện ra. Lấy NGHĨA dạng chữ chứ không lấy MathML đã dựng: MathML của công thức đã nằm sẵn
 * một bản trong HTML tĩnh của trang (thẻ Công thức đầu màn), truyền thêm một bản nữa xuống
 * khối Bài tập là nhân đôi nó trên cả 111 trang, trong khi `npm run size` vốn đã đỏ.
 */
export interface QuizView {
  items: ReadonlyArray<QuizItem>;
  bieuThuc?: Bilingual;
  kyHieu: ReadonlyArray<Bilingual>;
}

export function quizViewFor(spec: FormulaSpec): QuizView {
  return {
    items: quizFor(spec.id),
    bieuThuc: spec.expression,
    kyHieu: (spec.symbols ?? []).map((symbol) => symbol.meaning),
  };
}
