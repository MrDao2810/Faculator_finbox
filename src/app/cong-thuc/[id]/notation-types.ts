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
  /** Hình công thức, đã gắn `data-sym` cho các ký hiệu có khung. */
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
