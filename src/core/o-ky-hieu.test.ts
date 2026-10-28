import { describe, expect, it } from 'vitest';

import { ALL_FORMULAS } from './formulas';
import { chuPhang, kyHieuCuaNhan, kyHieuCuaO } from './o-ky-hieu';
import type { FormulaSpec } from './registry/types';

function spec(id: string): FormulaSpec {
  const found = ALL_FORMULAS.find((s) => s.id === id);
  if (found === undefined) throw new Error(`không có ${id}`);
  return found;
}

function latexCua(id: string, key: string): string | undefined {
  const s = spec(id);
  const k = kyHieuCuaO(s, key);
  return k === null ? undefined : s.symbols?.[k]?.latex;
}

describe('ô nhập → dòng bảng ký hiệu', () => {
  it('WACC: mỗi ô sáng đúng ký hiệu ghi ở cuối nhãn', () => {
    expect(latexCua('wacc', 'equity')).toBe('E');
    expect(latexCua('wacc', 'debt')).toBe('D');
    expect(latexCua('wacc', 'costEquity')).toBe('r_e');
    expect(latexCua('wacc', 'costDebt')).toBe('r_d');
    expect(latexCua('wacc', 'taxRate')).toBe('t');
  });

  it('hình viết bằng chữ: nhãn không có ký hiệu thì khớp cả nhãn với dòng `\\text{…}`', () => {
    const s = spec('thanh-toan-hien-hanh');
    for (const v of s.variables) {
      const k = kyHieuCuaO(s, v.key);
      expect(k, v.key).not.toBeNull();
      expect(chuPhang(s.symbols?.[k ?? -1]?.latex ?? '')).toBe(v.label.vi);
    }
  });

  it('nhóm lặp: ô "(C1)" sáng dòng `C_i`, ô "(r2)" sáng dòng `r_k`, không lẫn `r_{G}`', () => {
    expect(latexCua('gia-von-trung-binh-dca', 'amount1')).toBe('C_i');
    expect(latexCua('gia-von-trung-binh-dca', 'price2')).toBe('P_i');
    expect(latexCua('loi-suat-trung-binh-hinh-hoc', 'r2')).toBe('r_k');
  });

  it('ô không ứng với dòng nào thì không sáng gì, không đoán', () => {
    // `h` chỉ là chỉ số dưới của r̄₊ và r̄₋, không có dòng riêng.
    expect(kyHieuCuaO(spec('ty-so-thang-thua'), 'threshold')).toBeNull();
    // Ô đếm đợt của DCA không có ký hiệu trên nhãn và không có dòng.
    expect(kyHieuCuaO(spec('gia-von-trung-binh-dca'), 'lots')).toBeNull();
    expect(kyHieuCuaO(spec('wacc'), 'khong-co')).toBeNull();
  });

  /*
   * Quét cả Registry: ô đã khớp thì dòng khớp phải mang ĐÚNG chữ của nhãn (hay gốc của nó, ở nhóm lặp).
   * Một ô sáng nhầm dòng là nói sai với người dùng về con số họ đang gõ.
   */
  it('cả 111 công thức: ô nào sáng thì sáng đúng dòng của chính nó', () => {
    let soO = 0;
    for (const s of ALL_FORMULAS) {
      for (const v of s.variables) {
        const k = kyHieuCuaO(s, v.key);
        if (k === null) continue;
        soO += 1;
        const phang = chuPhang(s.symbols?.[k]?.latex ?? '').trim();
        const ky = kyHieuCuaNhan(v.label.vi) ?? v.label.vi.trim();
        const goc = ky.replace(/\d+$/, '');
        expect(phang === ky || (phang.startsWith(goc) && phang.length === goc.length + 1)).toBe(
          true,
        );
      }
    }
    // Đo ngày 28/10/2026: 215 trên 269 ô ứng với một dòng của bảng ký hiệu.
    expect(soO).toBe(215);
  });
});
