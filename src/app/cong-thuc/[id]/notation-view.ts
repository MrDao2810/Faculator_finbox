import { FORMULAS } from '@/application';
import type { Bilingual, FormulaSpec } from '@/application';
import { howToFor } from '@/application/how-to';
import type { FormulaHowTo } from '@/application/how-to';

import { segmentExpressionLines } from './expression-segments';
import type { ExpressionPhrase } from './expression-segments';
import { latexToInlineMathml, latexToMathml } from './latex-html';
import { markSymbols } from './mathml-marks';
import type { NotationHowToView, NotationView } from './notation-types';

/**
 * Dựng mọi thứ thẻ Công thức cần, LÚC BUILD — gói WBS 2.4.3 cộng khung "cách tính" (17/09/2026).
 *
 * ⚠ Bất biến giống `latex-html.ts`: chỉ `page.tsx` (server component) và ca kiểm được import file
 * này. Nó kéo theo `katex` (~280 kB) và chữ cách tính của cả 111 công thức; lọt vào một client
 * component là cả hai đi vào gói JS của mọi trang. `build-only-imports.test.ts` gác điều đó.
 *
 * Mọi chỗ dữ liệu sai đều NÉM LỖI thay vì dựng tiếp một thẻ hỏng: khung trỏ vào ký hiệu không có
 * trong bảng, ký hiệu không tìm được chỗ trong hình, cụm chữ không có trong dòng chữ, liên kết tới
 * công thức không tồn tại. `next build` đỏ ngay — cùng nếp `throwOnError` của KaTeX.
 */
export function buildNotationView(
  spec: FormulaSpec,
  howTo: FormulaHowTo | undefined = howToFor(spec.id),
): NotationView {
  const symbols = spec.symbols ?? [];
  const entries = howTo?.entries ?? [];

  const indexOf = (latex: string): number => {
    const index = symbols.findIndex((symbol) => symbol.latex === latex);
    if (index === -1) {
      throw new Error(`notation-view: ${spec.id} có khung cho "${latex}" mà bảng ký hiệu không có`);
    }
    return index;
  };

  const targets = new Set(entries.map((entry) => indexOf(entry.symbol)));

  const legend = symbols.map((symbol, index) => ({
    index,
    renderings: [latexToMathml(symbol.latex), latexToInlineMathml(symbol.latex)],
  }));
  /*
   * Gắn dấu MỌI dòng bảng, không chỉ dòng có bước tính (26/10/2026). Chủ dự án: _"hiện tại đang chỉ
   * chú thích những ký hiệu khó hiểu, tôi muốn ký hiệu nào cũng cần giải thích"_. Ký hiệu không có
   * bước tính mở khung chỉ có dòng "ký hiệu: nghĩa" — đúng khung hình trong lời giải Bài tập đã mở
   * từ 25/09/2026, nên hai hình nay cùng một bản gắn dấu.
   *
   * Dòng không tìm được chỗ (`D` chỉ nằm trong tên `D/E`…, 8 trên 568 dòng của cả thư viện) thì
   * lặng lẽ không có điểm chạm — rê vào đó là rê vào tên dài hơn, và khung của tên ấy mở. Dòng CÓ
   * bước tính mà không tìm được chỗ thì vẫn là lỗi dữ liệu và phải ném, ngay dưới đây.
   */
  const marked = markSymbols(
    latexToMathml(spec.latex),
    legend,
    new Set(legend.map((row) => row.index)),
  );

  for (const index of targets) {
    if ((marked.hits.get(index) ?? 0) === 0) {
      throw new Error(
        `notation-view: ${spec.id} không tìm được chỗ của "${symbols[index]?.latex ?? ''}" trong hình công thức`,
      );
    }
  }

  const phrasesOf = (locale: 'vi' | 'en'): ExpressionPhrase[] =>
    entries.flatMap((entry) =>
      (entry.phrases?.[locale] ?? []).map((phrase) => ({ sym: indexOf(entry.symbol), phrase })),
    );

  /* Mỗi vế của hình là một DÒNG chữ (luật 6) — cắt dòng trước, tìm cụm trong từng dòng. */
  const expressionOf = (locale: 'vi' | 'en') => {
    const text = spec.expression?.[locale] ?? '';
    return segmentExpressionLines(text, phrasesOf(locale));
  };

  const howToViews: NotationHowToView[] = entries.map((entry) => {
    const sym = indexOf(entry.symbol);

    if (entry.kind === 'linked') {
      const target = formulaById(spec.id, entry.formulaId);
      return {
        sym,
        kind: entry.kind,
        steps: [
          {
            html: latexToMathml(target.latex),
            expression: target.expression ?? { vi: target.latex, en: target.latex },
          },
        ],
        formula: { id: target.id, name: shortName(target.name) },
      };
    }

    const formulaId = entry.kind === 'derived' ? entry.formulaId : undefined;
    const target = formulaId === undefined ? undefined : formulaById(spec.id, formulaId);

    return {
      sym,
      kind: entry.kind,
      steps: entry.steps.map((step) => ({
        html: latexToMathml(step.latex),
        expression: step.expression,
      })),
      ...(target === undefined ? {} : { formula: { id: target.id, name: shortName(target.name) } }),
    };
  });

  return {
    latexHtml: marked.html,
    symbolsHtml: symbols.map((symbol) => latexToInlineMathml(symbol.latex)),
    expression: { vi: expressionOf('vi'), en: expressionOf('en') },
    howTo: howToViews,
  };
}

function formulaById(fromId: string, id: string): FormulaSpec {
  const target = FORMULAS.find((formula) => formula.id === id);
  if (target === undefined) {
    throw new Error(`notation-view: ${fromId} liên kết tới công thức "${id}" không tồn tại`);
  }
  return target;
}

/**
 * Tên công thức cắt ở " — ": "CAPM — chi phí vốn chủ sở hữu" thành "CAPM".
 *
 * Tên đứng ngay dưới các bước tính, cạnh dấu trừ `−` của hình — gạch ngang dài ở đó bị đọc thành
 * phép trừ, lỗi chủ dự án đã bắt hai lần (dòng công thức 16/09, bảng ký hiệu 17/09/2026).
 */
function shortName(name: Bilingual): Bilingual {
  const cut = (text: string) => text.split(' — ')[0] ?? text;
  return { vi: cut(name.vi), en: cut(name.en) };
}
