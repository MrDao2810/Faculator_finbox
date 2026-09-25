/**
 * Cắt bộ câu hỏi của MỘT công thức, chạy lúc build.
 *
 * Cùng khuôn `notation-view.ts`: `page.tsx` (server component) gọi ở đây rồi truyền kết quả
 * xuống `FormulaDetail` bằng prop. Nhờ vậy mỗi trang chi tiết chỉ mang 1–5 câu của chính nó,
 * thay vì cả ngân hàng 206 câu (~150 kB chữ) nhân lên 111 lần.
 *
 * `build-only-imports.test.ts` gác: `@/application/quiz` chỉ được import từ file này.
 */

import type { FormulaSpec } from '@/application';
import { quizFor } from '@/application/quiz';
import type { QuizItem } from '@/application/quiz';

/**
 * Phần của khối Bài tập trên MỘT trang: câu hỏi của công thức ấy, và chỉ thế.
 *
 * Từ 24/09 tới 25/09/2026 nó mang thêm dòng chữ công thức và nghĩa của bảng ký hiệu, cho khối lời
 * giải. Nay khối lời giải in chính HÌNH công thức kèm bảng ký hiệu đủ cả ký hiệu, và cả hai thứ ấy
 * `FormulaDetail` đã cầm sẵn (`notation` cùng `spec.symbols`) — chuyền xuống từ đó thì không tốn
 * thêm byte nào trong HTML của trang, còn cắt ở đây là in chúng hai lần.
 */
export interface QuizView {
  items: ReadonlyArray<QuizItem>;
  /**
   * Có câu nào mà dòng Công thức của lời giải in HÌNH công thức của trang không — tức có `giai` mà
   * không ghi đè `congThuc`. `page.tsx` chỉ dựng bản hình gắn dấu mọi ký hiệu khi cờ này bật.
   */
  needsFormulaPicture: boolean;
}

export function quizViewFor(spec: FormulaSpec): QuizView {
  const items = quizFor(spec.id);
  return {
    items,
    needsFormulaPicture: items.some(
      (item) => item.giai !== undefined && item.giai.congThuc === undefined,
    ),
  };
}
