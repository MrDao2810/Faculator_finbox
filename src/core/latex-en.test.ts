import { describe, expect, it } from 'vitest';

import { howToFor } from './how-to';
import {
  CHI_SO_EN,
  CHU_EN,
  CHU_GIU_NGUYEN,
  KY_HIEU_PHANG_EN,
  KY_HIEU_RIENG_EN,
  latexEn,
} from './latex-en';
import { chuPhang } from './o-ky-hieu';
import { FORMULAS } from './registry';

/** Mọi chuỗi LaTeX một công thức in ra: hình, từng dòng bảng ký hiệu, từng bước cách tính. */
function moiHinh(id: string): string[] {
  const spec = FORMULAS.find((f) => f.id === id);
  if (spec === undefined) return [];
  const steps = (howToFor(id)?.entries ?? []).flatMap((e) =>
    e.kind === 'linked' ? [] : e.steps.map((s) => s.latex),
  );
  return [spec.latex, ...(spec.symbols ?? []).map((s) => s.latex), ...steps];
}

const DAU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

describe('hình công thức tiếng Anh không còn chữ Việt (05/11/2026)', () => {
  it('mọi cụm \\text{} của 111 hình đều đã được xếp: dịch, hoặc giữ nguyên có chủ ý', () => {
    const chuaXep = new Set<string>();
    for (const spec of FORMULAS) {
      for (const latex of moiHinh(spec.id)) {
        for (const m of latex.matchAll(/\\text\{([^{}]*)\}/g)) {
          const chu = m[1] ?? '';
          if (CHU_EN[chu] === undefined && !CHU_GIU_NGUYEN.has(chu)) chuaXep.add(chu);
        }
      }
    }
    expect([...chuaXep]).toEqual([]);
  });

  it.each(FORMULAS.map((s) => [s.id] as const))(
    '%s: bản tiếng Anh không còn dấu tiếng Việt, chỉ số tiếng Việt hay tên viết tắt tiếng Việt',
    (id) => {
      for (const latex of moiHinh(id)) {
        const en = latexEn(latex, id);
        expect(DAU_VIET.test(en), `${id}: "${en}"`).toBe(false);
        for (const m of en.matchAll(/_\{((?:\\,|[^{},\\])*?)[,}]/g)) {
          expect(CHI_SO_EN[m[1] ?? ''], `${id}: chỉ số "${m[1]}" trong "${en}"`).toBeUndefined();
        }
        for (const m of en.matchAll(/\\text\{([^{}]*)\}/g)) {
          expect(CHU_EN[m[1] ?? ''], `${id}: cụm "${m[1]}" trong "${en}"`).toBeUndefined();
        }
        for (const [mau] of KY_HIEU_RIENG_EN[id] ?? []) {
          // Neo hai đầu như `latexEn()`: "DT" trong "DTL" không phải ký hiệu DT.
          const thoat = mau.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const con = new RegExp(`(?<![A-Za-z\\\\])${thoat}(?![A-Za-z])`).test(en);
          expect(con, `${id}: còn "${mau}" trong "${en}"`).toBe(false);
        }
      }
    },
  );

  it.each(FORMULAS.map((s) => [s.id, s] as const))(
    '%s: dòng bảng ký hiệu nằm trong hình thì bản tiếng Anh của nó vẫn nằm trong hình tiếng Anh',
    (id, spec) => {
      const hinh = latexEn(spec.latex, id);
      for (const symbol of spec.symbols ?? []) {
        if (!spec.latex.includes(symbol.latex)) continue;
        expect(hinh, `${id}: "${latexEn(symbol.latex, id)}"`).toContain(latexEn(symbol.latex, id));
      }
    },
  );

  it('không dòng bảng dịch nào thừa — mỗi dòng đều có hình dùng tới', () => {
    const tatCa = FORMULAS.flatMap((s) => moiHinh(s.id)).join('\n');
    const thuaChu = Object.keys(CHU_EN).filter((chu) => !tatCa.includes(`\\text{${chu}}`));
    const thuaChiSo = Object.keys(CHI_SO_EN).filter(
      (chu) => !new RegExp(`_\\{${chu.replace(/\\/g, '\\\\')}[,}]`).test(tatCa),
    );
    const thuaGiu = [...CHU_GIU_NGUYEN].filter((chu) => !tatCa.includes(`\\text{${chu}}`));
    expect({ thuaChu, thuaChiSo, thuaGiu }).toEqual({ thuaChu: [], thuaChiSo: [], thuaGiu: [] });
  });

  it('ký hiệu viết liền trên nhãn đổi đúng như hình đổi', () => {
    /* Mỗi cặp của `KY_HIEU_PHANG_EN` phải là chữ phẳng của một ký hiệu trước và sau `latexEn()`. */
    const cap = new Set<string>();
    for (const spec of FORMULAS) {
      for (const symbol of spec.symbols ?? []) {
        const vi = chuPhang(symbol.latex).trim();
        const en = chuPhang(latexEn(symbol.latex, spec.id)).trim();
        if (vi !== en) cap.add(`${vi}→${en}`);
      }
    }
    for (const [vi, en] of Object.entries(KY_HIEU_PHANG_EN)) {
      expect(cap.has(`${vi}→${en}`), `${vi}→${en}`).toBe(true);
    }
  });

  it('chuỗi không có gì để dịch thì trả CHÍNH nó', () => {
    expect(latexEn('P/E = \\frac{P}{EPS}', 'pe')).toBe('P/E = \\frac{P}{EPS}');
    expect(latexEn('r_d', 'wacc')).toBe('r_d');
    expect(latexEn('r_d', 'gui-quay-vong')).toBe('r_{long}');
    expect(latexEn('DTL = DOL \\times DFL = \\frac{DT - BP}{EBIT - I}', 'don-bay-tong-hop')).toBe(
      'DTL = DOL \\times DFL = \\frac{Rev - TVC}{EBIT - I}',
    );
    expect(latexEn('r_{danh\\,nghia}', 'loi-suat-thuc')).toBe('r_{nominal}');
    expect(latexEn('EMA_{tin hieu,\\,t-1}', 'macd-duong-tin-hieu')).toBe('EMA_{signal,\\,t-1}');
  });

  /*
   * Lượt 06/11/2026 (_"dịch phải xát nghĩa nhất có thể … vì họ là người nước ngoài thì sao"_): thuật ngữ
   * sách giáo khoa thay cho chữ viết tắt mà người nước ngoài không đoán ra (NPAT, CA, PBT) hay chữ cái đầu
   * của từ Việt (D, G, L), và ký hiệu chuẩn thay cho lối gọi vùng miền (EMI).
   */
  it('thuật ngữ sách giáo khoa thay cho chữ viết tắt khó đoán', () => {
    expect(
      latexEn('ROE = \\frac{\\text{LNST}}{\\text{Vốn chủ sở hữu}} \\times 100\\%', 'roe'),
    ).toBe('ROE = \\frac{\\text{Net income}}{\\text{Equity}} \\times 100\\%');
    expect(
      latexEn(
        'NCAV = \\frac{\\text{TSNH} - \\text{Tổng nợ}}{N} \\times 1000',
        'ncav-tren-co-phieu',
      ),
    ).toBe('NCAV = \\frac{\\text{Current assets} - \\text{Total liabilities}}{N} \\times 1000');
    expect(latexEn('EBIT = \\text{LNTT} + \\text{Lãi vay}', 'ev-ebitda')).toBe(
      'EBIT = \\text{EBT} + \\text{Interest expense}',
    );
    expect(latexEn('EBITDA = EBIT + \\text{Khấu hao}', 'ev-ebitda')).toBe(
      'EBITDA = EBIT + \\text{D\\&A}',
    );
    expect(latexEn('D_k = D_{k-1} - G_k', 'lich-tra-no')).toBe('B_k = B_{k-1} - P_k');
    expect(latexEn('EMI', 'tra-gop-nien-kim')).toBe('PMT');
    expect(latexEn('L_{rong}', 'roi-rong')).toBe('\\text{Net profit}');
    expect(latexEn('(P_{dong} - P_{mo})', 'lai-lo-vi-the-long')).toBe('(P_{exit} - P_{entry})');
    expect(latexEn('C = SMA_{ngan} - SMA_{dai}', 'giao-cat-hai-duong-ma')).toBe(
      '\\text{Difference} = SMA_{short} - SMA_{long}',
    );
    expect(latexEn('DD', 'do-lech-chuan-ban-phan')).toBe('\\sigma_d');
    // Một thuế suất chuyển nhượng, một tên: Thuế chuyển nhượng và Thuế TNCN đầu tư cùng vẽ r_{transfer}.
    expect(latexEn('r_{thue}', 'thue-chuyen-nhuong')).toBe('r_{transfer}');
  });
});
