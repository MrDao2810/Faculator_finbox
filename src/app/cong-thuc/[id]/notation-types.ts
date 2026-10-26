/**
 * Kiểu dữ liệu của thẻ Công thức mà `page.tsx` dựng sẵn lúc build rồi truyền xuống client.
 *
 * Tách khỏi `notation-view.ts` vì file ấy import `katex` và dữ liệu cách tính của 111 công thức:
 * client component chỉ được chạm vào KIỂU, không được chạm vào file dựng. `import type` từ đây bị
 * xoá sạch lúc biên dịch.
 */

import type { Bilingual } from '@/application';

import type { ExpressionSegment } from './expression-segments';

export type { ExpressionSegment } from './expression-segments';

/** Một bước của khung cách tính, hình đã dựng thành MathML. */
export interface NotationStepView {
  html: string;
  expression: Bilingual;
}

/** Khung cách tính của một dòng bảng ký hiệu. */
export interface NotationHowToView {
  /** Số thứ tự dòng trong `spec.symbols`. */
  sym: number;
  kind: 'derived' | 'linked' | 'defined';
  steps: ReadonlyArray<NotationStepView>;
  /** Công thức riêng trong thư viện — khung thêm liên kết "Xem công thức". */
  formula?: { id: string; name: Bilingual };
}

export interface NotationView {
  /**
   * Hình công thức, đã gắn `data-sym` cho MỌI ký hiệu tìm được chỗ trong hình (26/10/2026) — ký
   * hiệu có bước tính mở khung đủ bước, ký hiệu còn lại mở khung chỉ có dòng "ký hiệu: nghĩa".
   *
   * Từ 25/09 tới 26/10/2026 có hai bản: bản này chỉ gắn ký hiệu có bước tính (cho thẻ Công thức,
   * nơi bảng ký hiệu đứng cạnh hình), và `latexHtmlAllSymbols` gắn đủ cả (cho hình trong lời giải
   * Bài tập và Ví dụ). Chủ dự án muốn ký hiệu nào trên thẻ cũng có khung, nên hai bản thành một.
   */
  latexHtml: string;
  /** Từng ký hiệu của bảng, MathML dòng — cùng thứ tự với `spec.symbols`. */
  symbolsHtml: ReadonlyArray<string>;
  /**
   * Dòng chữ dưới hình, đã tách đoạn theo điểm chạm, cho cả hai ngôn ngữ.
   *
   * MỘT MẢNG DÒNG: hình nhiều vế thì chữ nhiều dòng, ngắt đúng chỗ `\quad` của hình (luật 6 ở
   * `src/core/expression-rules.ts`). 106 công thức có đúng một dòng.
   */
  expression: Readonly<Record<'vi' | 'en', ReadonlyArray<ReadonlyArray<ExpressionSegment>>>>;
  howTo: ReadonlyArray<NotationHowToView>;
}
