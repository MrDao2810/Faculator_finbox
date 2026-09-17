import { describe, expect, it } from 'vitest';

import { FORMULAS } from '@/application';

import { latexToInlineMathml, latexToMathml } from './latex-html';
import { markSymbols, unmarkSymbols } from './mathml-marks';

/**
 * Gắn dấu ký hiệu vào MathML — luật khớp ở docblock `mathml-marks.ts`.
 *
 * Mỗi luật có một ca dựng tay bằng LaTeX thật (qua KaTeX thật, không chuỗi MathML viết tay): luật
 * sai thì ca của nó đỏ, và ca quét cả 111 công thức ở cuối gác chuyện gắn dấu không làm đổi một
 * byte nào khác của hình.
 */

function bangKyHieu(latexes: ReadonlyArray<string>) {
  return latexes.map((latex, index) => ({
    index,
    renderings: [latexToMathml(latex), latexToInlineMathml(latex)],
  }));
}

/** Gắn dấu cho đúng một dòng, trả về số chỗ tìm được. */
function soCho(formula: string, legend: ReadonlyArray<string>, dong: number): number {
  return (
    markSymbols(latexToMathml(formula), bangKyHieu(legend), new Set([dong])).hits.get(dong) ?? 0
  );
}

describe('markSymbols() — luật khớp', () => {
  it('khớp theo cấu trúc, và gắn data-sym vào đúng phần tử', () => {
    const { html, hits } = markSymbols(
      latexToMathml('S = \\frac{\\bar{r}_p - r_f}{\\sigma_p}'),
      bangKyHieu(['S', '\\bar{r}_p', 'r_f', '\\sigma_p']),
      new Set([1, 3]),
    );
    expect(hits.get(1)).toBe(1);
    expect(hits.get(3)).toBe(1);
    expect(html).toContain('<msub data-sym="1">');
    expect(html).toContain('<msub data-sym="3">');
    // Dòng không nằm trong targets thì không mang dấu.
    expect(html).not.toContain('data-sym="0"');
    expect(html).not.toContain('data-sym="2"');
  });

  it('luật 4 — gốc của r_f không phải ký hiệu r', () => {
    // r chỉ nằm trong r_f, và r_f là một dòng riêng của bảng.
    expect(soCho('x = r_f + 1', ['x', 'r_f', 'r'], 2)).toBe(0);
    // Không có dòng r_f thì r trong r_t đúng là r (chỉ số chạy t).
    expect(soCho('x = r_t + 1', ['x', 'r', 't'], 1)).toBe(1);
  });

  it('luật 5 — không khớp vào giữa một tên nhiều chữ đã có dòng riêng', () => {
    // P/E = P ÷ EPS: P chỉ là ký hiệu ở tử số, không phải chữ P của P/E hay của EPS.
    expect(soCho('P/E = \\frac{P}{EPS}', ['P/E', 'P', 'EPS'], 1)).toBe(1);
  });

  it('luật 5 — dãy có toán tử không phải một tên: t trong (1 − t) vẫn là thuế suất t', () => {
    expect(soCho('F = E \\, (1 - t)', ['F', 'E', 't', '(1 - t)'], 2)).toBe(1);
  });

  it('luật 5 — phép chia viết dòng không bị coi là tên: t trong 1/t vẫn khớp', () => {
    expect(soCho('C = V^{1/t} - 1', ['C', 'V', 't'], 2)).toBe(1);
  });

  it('luật 6 — không khớp một dãy vắt qua hai đối số của phân số', () => {
    // "a b" là một dãy hai chữ; trong \frac{a}{b} hai chữ ấy là tử và mẫu, không phải một dãy.
    expect(soCho('x = \\frac{a}{b}', ['x', 'a b', 'a', 'b'], 1)).toBe(0);
  });

  it('dãy phủ trọn một mrow thì gắn dấu lên chính mrow ấy, không bọc thêm', () => {
    const { html } = markSymbols(
      latexToMathml('W = \\frac{a}{\\left| b \\right|}'),
      bangKyHieu(['W', 'a', 'b', '\\left| b \\right|']),
      new Set([2, 3]),
    );
    expect(html).toContain('<mrow data-sym="3">');
    expect(html).not.toContain('data-sym-wrap');
    // b vẫn có dấu riêng bên trong.
    expect(html).toContain('data-sym="2"');
  });

  it('dãy hai đầu là ngoặc thì bọc được; hai đầu là toán tử có khoảng cách thì gắn từng phần tử', () => {
    const boc = markSymbols(
      latexToMathml('x = 2 (1 - t) + y'),
      bangKyHieu(['x', '(1 - t)', 't', 'y']),
      new Set([1]),
    );
    expect(boc.html).toContain('<mrow data-sym="1" data-sym-wrap="">');

    const tungPhan = markSymbols(
      latexToMathml('x = a - b + c'),
      bangKyHieu(['x', '- b +', 'a', 'c']),
      new Set([1]),
    );
    expect(tungPhan.html).not.toContain('data-sym-wrap');
    expect(tungPhan.html.match(/data-sym="1"/g)).toHaveLength(3);
  });

  it('ký hiệu nhiều chỗ thì mọi chỗ đều mang dấu', () => {
    expect(soCho('A = P (1 + i)^n - P i', ['A', 'P', 'i', 'n'], 2)).toBe(2);
  });

  it('hai dòng cùng đòi một chỗ thì ném lỗi, không đoán', () => {
    expect(() =>
      markSymbols(latexToMathml('x = ab'), bangKyHieu(['x', 'ab', 'a b']), new Set([1, 2])),
    ).toThrow(/cùng/);
  });

  it('gỡ dấu trả về đúng chuỗi KaTeX ban đầu', () => {
    const goc = latexToMathml('W = \\frac{\\overline{r^{+}}}{\\left| \\overline{r^{-}} \\right|}');
    const { html } = markSymbols(
      goc,
      bangKyHieu([
        'W',
        '\\overline{r^{+}}',
        '\\overline{r^{-}}',
        '\\left| \\overline{r^{-}} \\right|',
      ]),
      new Set([1, 2, 3]),
    );
    expect(html).not.toBe(goc);
    expect(unmarkSymbols(html)).toBe(goc);
  });
});

describe('markSymbols() — cả 111 công thức, mọi dòng bảng ký hiệu cùng lúc', () => {
  it('không ném lỗi, và gỡ dấu ra đúng từng byte của hình KaTeX gốc', () => {
    const hong: string[] = [];
    for (const spec of FORMULAS) {
      const symbols = spec.symbols ?? [];
      const goc = latexToMathml(spec.latex);
      try {
        const { html } = markSymbols(
          goc,
          bangKyHieu(symbols.map((s) => s.latex)),
          new Set(symbols.map((_s, i) => i)),
        );
        if (unmarkSymbols(html) !== goc) hong.push(`${spec.id}: gỡ dấu không ra hình gốc`);
      } catch (error) {
        hong.push(`${spec.id}: ${(error as Error).message}`);
      }
    }
    expect(hong, hong.join('\n')).toEqual([]);
  });
});
