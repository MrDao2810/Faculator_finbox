/**
 * Tầng DOMAIN — luật của một DÒNG CÔNG THỨC VIẾT BẰNG CHỮ.
 *
 * Hai nơi hiện loại dòng này: `FormulaSpec.expression` ngay dưới hình công thức, và dòng chữ của
 * từng bước trong khung "cách tính" (`src/core/how-to/`). Cả hai là một hình KaTeX đọc thành lời,
 * nên chịu cùng một bộ luật — và bộ luật ấy sống ở đây, không chép vào hai file test.
 *
 * Mỗi luật đều sinh ra từ một lỗi thật, ghi ở ca kiểm tương ứng trong `formulas.test.ts`:
 *
 * 1. Không sót ký hiệu LaTeX (`\`, `{`, `}`): bốn công thức từng hiện LaTeX thô ra màn.
 * 2. Có dấu bằng: dòng chữ là một công thức, không phải một mẩu biểu thức rời.
 * 3. Không gạch ngang (`—`, `–`): đứng cạnh dấu trừ `−` thì chủ dự án đọc thành phép trừ.
 * 4. Hằng số (số khác 0, 1, 2) của dòng chữ và của hình phải là MỘT tập: "tại sao trên công thức
 *    không có nhân với 100 mà bên dưới lại nhân với 100?" (17/09/2026).
 *
 * Không import gì ngoài bộ tách ký hiệu — chạy được ở Node lẫn trình duyệt.
 */

import { latexSymbolTokens } from './latex-symbols';

export type TextLocale = 'vi' | 'en';

/** Luật 1: dấu gạch chéo ngược của LaTeX sót lại. */
export const LATEX_BACKSLASH = /\\/;
/** Luật 1: ngoặc nhọn của LaTeX sót lại. */
export const LATEX_BRACES = /[{}]/;
/** Luật 3: gạch ngang dài hoặc vừa — loại gạch duy nhất được đứng cạnh công thức là dấu trừ `−`. */
export const DASHES = /[–—]/;

/**
 * Các lỗi của một dòng công thức viết bằng chữ, theo luật 1–3. Mảng rỗng nghĩa là đạt.
 *
 * Trả về mô tả ngắn chứ không ném: nơi gọi (ca kiểm) tự ghép tên công thức vào để người sửa biết
 * chỗ nào hỏng.
 */
export function expressionLineProblems(text: string): string[] {
  const problems: string[] = [];
  if (LATEX_BACKSLASH.test(text)) problems.push('còn dấu gạch chéo ngược của LaTeX');
  if (LATEX_BRACES.test(text)) problems.push('còn ngoặc nhọn của LaTeX');
  if (!text.includes('=')) problems.push('thiếu dấu bằng');
  if (DASHES.test(text)) problems.push('có gạch ngang, dễ đọc nhầm thành dấu trừ');
  return problems;
}

/**
 * Tập hằng số (khác 0, 1, 2) của một dòng chữ, đã quy về dấu chấm thập phân và sắp xếp.
 *
 * Tiếng Việt viết `1.000` là một nghìn và `22,5` là thập phân; tiếng Anh ngược lại. Phân cách
 * nghìn bị bỏ trước khi tách số, nên `1.000` và `1000` cùng ra `1000`.
 */
export function numbersInText(text: string, locale: TextLocale): string[] {
  const thousands = locale === 'vi' ? /(\d)\.(?=\d{3}\b)/g : /(\d),(?=\d{3}\b)/g;
  const decimal = locale === 'vi' ? ',' : '.';
  const found = text.replace(thousands, '$1').match(/\d+(?:[.,]\d+)?/g) ?? [];
  const normalized = found
    .map((s) => (decimal === ',' ? s.replace(',', '.') : s))
    .filter((s) => !['0', '1', '2'].includes(s));
  return [...new Set(normalized)].sort();
}

/**
 * Tập hằng số (khác 0, 1, 2) của một chuỗi LaTeX — theo đúng luật số của `latexSymbolTokens()`,
 * đã quy về dấu chấm thập phân và sắp xếp.
 */
export function numbersInLatex(latex: string): string[] {
  return [
    ...new Set(
      latexSymbolTokens(latex)
        .filter((token) => /^\d/.test(token))
        .map((token) => token.replace(',', '.')),
    ),
  ].sort();
}
