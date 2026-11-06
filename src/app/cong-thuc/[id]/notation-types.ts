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
   * Hình công thức, đã gắn `data-sym` cho ký hiệu CÓ khung cách tính (`FormulaHowTo.entries`).
   *
   * Từ 26/10 tới 03/11/2026 mọi ký hiệu được gắn dấu, kể cả ký hiệu không có bước tính (khung của
   * nó khi ấy chỉ có dòng "ký hiệu: nghĩa", lặp lại đúng dòng bảng ký hiệu đã in sẵn cạnh nó) — chủ
   * dự án gọi đó là thừa và luật bị ĐẢO lại 04/11/2026, xem docblock của `FormulaNotationCard.tsx`.
   * Trước 26/10/2026 có hai bản riêng (bản này cho thẻ Công thức, `latexHtmlAllSymbols` cho hình
   * trong lời giải Bài tập/Ví dụ, gắn đủ mọi ký hiệu); nay chỉ còn một bản, như trước 26/10, nhưng
   * `QuizFormulaPicture` dùng CHUNG bản này thay vì có bản riêng.
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
  /**
   * Bản tiếng Anh của mọi MathML trên (05/11/2026) — có khi và chỉ khi hình của công thức có chữ Việt
   * (`	ext{Tổng nợ phải trả}`, `P_{mua}`, LNST…). Màn chọn bản theo ngôn ngữ qua
   * `notationForLocale()`; vắng thì bản trên dùng cho cả hai thứ tiếng.
   */
  en?: NotationEnView;
}

/** MathML tiếng Anh, cùng hình dạng và thứ tự với các trường tương ứng của `NotationView`. */
export interface NotationEnView {
  latexHtml: string;
  symbolsHtml: ReadonlyArray<string>;
  /** `stepsHtml[i][j]` là `howTo[i].steps[j].html` bản tiếng Anh. */
  stepsHtml: ReadonlyArray<ReadonlyArray<string>>;
}

/**
 * Thẻ Công thức theo ngôn ngữ ĐANG HIỆN: ở tiếng Anh, thay mọi MathML bằng bản tiếng Anh nếu công thức
 * có. Hàm thuần, không kéo `katex` — client gọi được. Trả CHÍNH `view` khi không có gì để thay, để
 * `useMemo` của các khối bên dưới không dựng lại MathML vô cớ.
 */
export function notationForLocale(view: NotationView, locale: 'vi' | 'en'): NotationView {
  const en = view.en;
  if (locale === 'vi' || en === undefined) return view;
  return {
    ...view,
    latexHtml: en.latexHtml,
    symbolsHtml: en.symbolsHtml,
    howTo: view.howTo.map((entry, i) => ({
      ...entry,
      steps: entry.steps.map((step, j) => ({ ...step, html: en.stepsHtml[i]?.[j] ?? step.html })),
    })),
  };
}
