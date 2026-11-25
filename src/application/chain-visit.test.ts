import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from '@/application';

import {
  CHAIN_FORMULA_IDS,
  isChainFormula,
  parseStoredOverrides,
  sameChain,
  serializeStoredOverrides,
} from './chain-visit';
import { visitContinuesAt } from './formula-visit';

describe('CHAIN_FORMULA_IDS — danh sách ghim khớp Registry', () => {
  it('đúng tập công thức đứng ở một đầu của cạnh dependsOn, và cùng MỘT thành phần liên thông', () => {
    const canh: Array<[string, string]> = [];
    for (const m of FORMULA_MODULES) {
      for (const dep of m.spec.dependsOn ?? []) canh.push([m.spec.id, dep.formulaId]);
    }
    const trongChuoi = new Set(canh.flat());
    expect([...trongChuoi].sort()).toEqual([...CHAIN_FORMULA_IDS].sort());

    // Liên thông: loang từ một đỉnh phải chạm đủ mọi đỉnh.
    const thay = new Set<string>([CHAIN_FORMULA_IDS[0] ?? '']);
    for (let lan = 0; lan < canh.length; lan += 1) {
      for (const [a, b] of canh) {
        if (thay.has(a) || thay.has(b)) {
          thay.add(a);
          thay.add(b);
        }
      }
    }
    expect([...thay].sort()).toEqual([...CHAIN_FORMULA_IDS].sort());
  });
});

describe('sameChain', () => {
  it('hai công thức trong chuỗi là cùng chuỗi; ngoài chuỗi thì không cùng ai', () => {
    expect(sameChain('capm', 'wacc')).toBe(true);
    expect(sameChain('capm', 'pe')).toBe(false);
    expect(sameChain('pe', 'pe')).toBe(false);
    expect(isChainFormula('wacc')).toBe(true);
  });
});

describe('visitContinuesAt — trong chuỗi móc nối', () => {
  it('sang công thức cùng chuỗi vẫn là một lượt xem', () => {
    expect(visitContinuesAt('wacc', '/cong-thuc/capm/')).toBe(true);
    expect(visitContinuesAt('capm', '/cong-thuc/gia-tri-noi-tai-fcff/')).toBe(true);
  });

  it('ra khỏi chuỗi thì hết lượt', () => {
    expect(visitContinuesAt('wacc', '/cong-thuc/pe/')).toBe(false);
    expect(visitContinuesAt('wacc', '/cong-thuc/')).toBe(false);
    expect(visitContinuesAt('pe', '/cong-thuc/capm/')).toBe(false);
  });
});

describe('kho Ghi đè', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const kho = { wacc: { costEquity: 12.5 } };
    expect(parseStoredOverrides(serializeStoredOverrides(kho))).toEqual(kho);
  });

  it('bỏ mọi thứ không phải { công thức trong chuỗi: { khoá: số hữu hạn } }', () => {
    expect(parseStoredOverrides(null)).toEqual({});
    expect(parseStoredOverrides('không phải json')).toEqual({});
    expect(parseStoredOverrides('[1,2]')).toEqual({});
    expect(
      parseStoredOverrides(
        JSON.stringify({ pe: { a: 1 }, wacc: { costEquity: 'x', 'a b': 2, rd: 5, bad: null } }),
      ),
    ).toEqual({ wacc: { rd: 5 } });
  });
});
