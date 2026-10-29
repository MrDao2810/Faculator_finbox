import { describe, expect, it } from 'vitest';

import { ALL_FORMULAS } from './formulas';
import { chuPhang, kyHieuCuaNhan, kyHieuCuaO, nhanCoKyHieu } from './o-ky-hieu';
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
  it('WACC: mỗi ô ứng với đúng ký hiệu ghi ở cuối nhãn', () => {
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

  it('nhóm lặp: ô "(C1)" ứng với dòng `C_i`, ô "(r2)" với dòng `r_k`, không lẫn `r_{G}`', () => {
    expect(latexCua('gia-von-trung-binh-dca', 'amount1')).toBe('C_i');
    expect(latexCua('gia-von-trung-binh-dca', 'price2')).toBe('P_i');
    expect(latexCua('loi-suat-trung-binh-hinh-hoc', 'r2')).toBe('r_k');
  });

  it('ô không ứng với dòng nào thì trả null, không đoán', () => {
    // `h` chỉ là chỉ số dưới của r̄₊ và r̄₋, không có dòng riêng.
    expect(kyHieuCuaO(spec('ty-so-thang-thua'), 'threshold')).toBeNull();
    // Ô đếm đợt của DCA không có ký hiệu trên nhãn và không có dòng.
    expect(kyHieuCuaO(spec('gia-von-trung-binh-dca'), 'lots')).toBeNull();
    expect(kyHieuCuaO(spec('wacc'), 'khong-co')).toBeNull();
  });

  /*
   * Quét cả Registry: ô đã khớp thì dòng khớp phải mang ĐÚNG chữ của nhãn (hay gốc của nó, ở nhóm lặp).
   * Một ô trỏ nhầm dòng thì khung chú thích nói sai với người dùng về con số họ đang gõ.
   */
  it('cả 111 công thức: ô nào có dòng thì đúng dòng của chính nó', () => {
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

/*
 * Tên ô cắt quanh phần ký hiệu — chỗ đặt nút mở khung chú thích trong khung "Lấy số liệu ở đâu"
 * (28/10/2026, chủ dự án khoanh '(TSNH)' và '(N)' của `ncav-tren-co-phieu`).
 */
describe('nhanCoKyHieu — phần nào của tên ô là ký hiệu', () => {
  it('NCAV: "(TSNH)" và "(N)" ở cuối tên; "Tổng nợ phải trả" không có dòng nào nên in trơn', () => {
    const s = spec('ncav-tren-co-phieu');
    expect(nhanCoKyHieu(s, 'currentAssets')).toEqual({
      sym: s.symbols?.findIndex((r) => r.latex === '\\text{TSNH}'),
      vi: { truoc: 'Tài sản ngắn hạn ', kyHieu: '(TSNH)', sau: '' },
      en: { truoc: 'Current assets ', kyHieu: '(TSNH)', sau: '' },
    });
    expect(nhanCoKyHieu(s, 'shares')?.vi.kyHieu).toBe('(N)');
    expect(nhanCoKyHieu(s, 'totalLiabilities')).toBeNull();
  });

  it('ký hiệu mở đầu tên ("EPS — …"): điểm chạm là đúng chữ EPS, phần giải nghĩa sau là chữ trơn', () => {
    expect(nhanCoKyHieu(spec('pe'), 'eps')).toMatchObject({
      vi: { truoc: '', kyHieu: 'EPS', sau: ' — lợi nhuận trên mỗi cổ phiếu' },
      en: { truoc: '', kyHieu: 'EPS', sau: ' — earnings per share' },
    });
  });

  it('hình viết tên ô bằng chữ: cả tên là điểm chạm, ở cả hai ngôn ngữ', () => {
    const s = spec('thanh-toan-hien-hanh');
    for (const v of s.variables) {
      const nhan = nhanCoKyHieu(s, v.key);
      expect(nhan?.vi).toEqual({ truoc: '', kyHieu: v.label.vi, sau: '' });
      expect(nhan?.en).toEqual({ truoc: '', kyHieu: v.label.en, sau: '' });
    }
  });

  /*
   * Ba khúc ghép lại phải ra ĐÚNG tên ô, không thiếu không thừa một ký tự: khung "?" in ba khúc liền
   * nhau thay cho tên. Và bản tiếng Anh phải cắt ra cùng ký hiệu — đổi ngôn ngữ mà nút đổi chữ thì
   * nút ấy đang trỏ một ký hiệu khác.
   */
  it('cả 111 công thức: ba khúc ghép ra đúng tên ô, hai ngôn ngữ cùng một ký hiệu', () => {
    let soO = 0;
    for (const s of ALL_FORMULAS) {
      for (const v of s.variables) {
        const nhan = nhanCoKyHieu(s, v.key);
        expect(nhan?.sym ?? null, `${s.id}.${v.key}`).toBe(kyHieuCuaO(s, v.key));
        if (nhan === null) continue;
        soO += 1;
        for (const lang of ['vi', 'en'] as const) {
          const k = nhan[lang];
          expect(k.truoc + k.kyHieu + k.sau, `${s.id}.${v.key} ${lang}`).toBe(v.label[lang]);
          expect(k.kyHieu.trim(), `${s.id}.${v.key} ${lang}`).not.toBe('');
        }
        if (nhan.vi.kyHieu !== v.label.vi) {
          expect(nhan.en.kyHieu, `${s.id}.${v.key}`).toBe(nhan.vi.kyHieu);
        }
      }
    }
    expect(soO).toBe(215);
  });
});
