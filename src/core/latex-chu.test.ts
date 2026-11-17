import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from './formulas';
import { latexThanhChu } from './latex-chu';

describe('latexThanhChu — hình công thức thành chữ cho file PDF', () => {
  it.each([
    ['P/E = \\frac{P}{EPS}', 'P/E = P/EPS'],
    ['P_{mua}', 'Pmua'],
    ['\\beta_p', 'βp'],
    ['r_{t+1}', 'r_(t+1)'],
    ['\\frac{V - P}{V} \\times 100', '(V − P)/V × 100'],
    ['\\sqrt{N}', '√N'],
    ['x^{2}', 'x²'],
    ['(1 + r)^{n t}', '(1 + r)^(n t)'],
    ['\\bar{r}', 'r̄'],
    ['\\text{Vốn chủ sở hữu}', 'Vốn chủ sở hữu'],
    ['\\left\\lfloor x \\right\\rfloor', '⌊x⌋'],
    ['\\max\\{a, b\\}', 'max{a, b}'],
    ['\\Delta B', 'ΔB'],
  ])('%s → %s', (latex, chu) => {
    expect(latexThanhChu(latex)).toBe(chu);
  });

  it('hình nhiều dòng (\\\\) thành nhiều dòng chữ', () => {
    expect(latexThanhChu('\\begin{array}{l} a = 1 \\\\ b = 2 \\end{array}')).toBe('a = 1\nb = 2');
  });

  it('không còn dấu gạch chéo ngược, ngoặc nhọn hay gạch dưới trần trong hình của cả 111 công thức', () => {
    for (const { spec } of FORMULA_MODULES) {
      const chu = latexThanhChu(spec.latex);
      expect(chu, spec.id).not.toMatch(/\\/);
      for (const s of spec.symbols ?? []) {
        expect(latexThanhChu(s.latex), `${spec.id}: ${s.latex}`).not.toMatch(/\\|[{}]$/);
      }
    }
  });
});
