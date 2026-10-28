/**
 * Khung "cách tính" của nhóm `src/core/formulas/returns.ts` — kiểu dữ liệu và luật ở `types.ts`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_RETURNS: Readonly<Record<string, FormulaHowTo>> = {
  roi: {
    entries: [],
    skipped: { ROI: 'ket-qua', 'V_{cuoi}': 'nhap-tho', 'V_{dau}': 'nhap-tho', '100': 'hang-so' },
    whyNone: 'Vốn bỏ ra và giá trị hiện tại đều là số gõ thẳng, phép tính đã hiện trọn trong hình.',
    skippedPhrases: {
      '100': { vi: ['100'], en: ['100'] },
      ROI: { vi: ['ROI'], en: ['ROI'] },
      'V_{cuoi}': { vi: ['Giá trị hiện tại'], en: ['Current value'] },
      'V_{dau}': { vi: ['Vốn bỏ ra'], en: ['Capital invested'] },
    },
  },

  hpr: {
    entries: [],
    skipped: {
      HPR: 'ket-qua',
      'P_{cuoi}': 'nhap-tho',
      'P_{dau}': 'nhap-tho',
      D: 'nhap-tho',
      '100': 'hang-so',
    },
    whyNone:
      'Giá đầu kỳ, giá cuối kỳ và cổ tức nhận trong kỳ đều là số gõ thẳng, phép tính đã hiện trọn trong hình.',
    skippedPhrases: {
      '100': { vi: ['100'], en: ['100'] },
      HPR: { vi: ['HPR'], en: ['HPR'] },
      'P_{cuoi}': { vi: ['Giá cuối kỳ'], en: ['Ending price'] },
      'P_{dau}': { vi: ['Giá đầu kỳ'], en: ['Starting price'] },
      D: { vi: ['Cổ tức'], en: ['Dividend'] },
    },
  },

  cagr: {
    entries: [],
    skipped: {
      CAGR: 'ket-qua',
      'V_{cuoi}': 'nhap-tho',
      'V_{dau}': 'nhap-tho',
      t: 'nhap-tho',
      '1/t': 'da-hien-trong-hinh',
    },
    whyNone:
      'Giá trị đầu, giá trị cuối và số năm đều là số gõ thẳng, phép lấy căn bậc t đã hiện trọn trong hình.',
    skippedPhrases: {
      CAGR: { vi: ['CAGR'], en: ['CAGR'] },
      'V_{cuoi}': { vi: ['Giá trị cuối'], en: ['Ending value'] },
      'V_{dau}': { vi: ['Giá trị đầu'], en: ['Starting value'] },
      t: { vi: ['Số năm'], en: ['Number of years'] },
    },
  },

  'ty-suat-co-tuc': {
    entries: [],
    skipped: { DY: 'ket-qua', D: 'nhap-tho', P: 'nhap-tho', '100': 'hang-so' },
    whyNone: 'Cổ tức cả năm và thị giá đều là số đọc thẳng từ thông báo cổ tức và bảng giá.',
    skippedPhrases: {
      '100': { vi: ['100'], en: ['100'] },
      DY: { vi: ['Tỷ suất cổ tức'], en: ['Dividend yield'] },
      D: { vi: ['Cổ tức cả năm'], en: ['Annual dividend'] },
      P: { vi: ['Thị giá'], en: ['Market price'] },
    },
  },

  /*
   * Người dùng gõ NGÀY, `xirr()` tự sắp dòng tiền theo ngày rồi đổi mỗi ngày ra số ngày kể từ ngày sớm
   * nhất, nên d_i là đại lượng phải tính. Ẩn số XIRR là kết quả, không có khung.
   */
  xirr: {
    entries: [
      {
        kind: 'derived',
        symbol: 'd_i',
        phrases: {
          vi: ['Số ngày kể từ dòng tiền đầu tiên'],
          en: ['Days since the first cash flow'],
        },
        steps: [
          {
            latex: 'd_i = t_i - \\min_j t_j',
            expression: {
              vi: 'Số ngày kể từ dòng tiền đầu tiên = Ngày của dòng tiền i − Ngày sớm nhất trong bảng, đếm theo ngày lịch',
              en: 'Days since the first cash flow = Date of cash flow i − Earliest date in the table, counted in calendar days',
            },
          },
        ],
        calcEvidence: ['a.date.localeCompare(b.date)', '(at - start) / 86_400_000'],
      },
    ],
    skipped: { XIRR: 'ket-qua', CF_i: 'nhap-tho', i: 'chi-so-chay', '365': 'hang-so' },
    skippedPhrases: {
      '365': { vi: ['365'], en: ['365'] },
      XIRR: { vi: ['XIRR'], en: ['XIRR'] },
      CF_i: { vi: ['Dòng tiền'], en: ['Cash flow'] },
    },
  },
};
