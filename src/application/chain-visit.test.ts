import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from '@/application';

import {
  CHAIN_ANCESTORS,
  isChainFormula,
  parseStoredOverrides,
  sameChain,
  serializeStoredOverrides,
} from './chain-visit';
import { visitContinuesAt } from './formula-visit';

describe('CHAIN_ANCESTORS — bảng ghim khớp Registry', () => {
  it('đúng tập thượng nguồn (trực tiếp và gián tiếp) tính từ dependsOn, từng công thức một', () => {
    const by = new Map(FORMULA_MODULES.map((m) => [m.spec.id, m.spec]));
    const thuongNguon = (id: string, seen = new Set<string>()): Set<string> => {
      for (const dep of by.get(id)?.dependsOn ?? []) {
        if (seen.has(dep.formulaId)) continue;
        seen.add(dep.formulaId);
        thuongNguon(dep.formulaId, seen);
      }
      return seen;
    };

    const tinhLai: Record<string, string[]> = {};
    for (const m of FORMULA_MODULES) {
      const tren = [...thuongNguon(m.spec.id)].sort();
      if (tren.length > 0) tinhLai[m.spec.id] = tren;
    }
    const daGhim = Object.fromEntries(
      Object.entries(CHAIN_ANCESTORS).map(([id, tren]) => [id, [...tren].sort()]),
    );
    expect(daGhim).toEqual(tinhLai);
  });
});

describe('sameChain', () => {
  it('hai công thức trong chuỗi là cùng chuỗi; ngoài chuỗi thì không cùng ai', () => {
    expect(sameChain('capm', 'wacc')).toBe(true);
    expect(sameChain('capm', 'pe')).toBe(false);
    expect(sameChain('pe', 'eps-co-ban')).toBe(true);
    expect(sameChain('eps-co-ban', 'peg')).toBe(true);
    // Cùng đồ thị liên thông nhưng không cái nào nuôi cái nào: không mang gì theo sang.
    expect(sameChain('pe', 'pb')).toBe(false);
    expect(sameChain('mo-hinh-gordon', 'wacc')).toBe(false);
    expect(sameChain('roe', 'roe')).toBe(false);
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
    expect(visitContinuesAt('pe', '/cong-thuc/eps-co-ban/')).toBe(true);
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
        JSON.stringify({ roe: { a: 1 }, wacc: { costEquity: 'x', 'a b': 2, rd: 5, bad: null } }),
      ),
    ).toEqual({ wacc: { rd: 5 } });
  });
});
