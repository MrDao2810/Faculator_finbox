/**
 * Khung "cách tính" của nhóm `src/core/formulas/returns.ts` — kiểu dữ liệu và luật ở `types.ts`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_RETURNS: Readonly<Record<string, FormulaHowTo>> = {
  roi: {
    entries: [],
    skipped: { ROI: 'ket-qua', 'V_{cuoi}': 'nhap-tho', 'V_{dau}': 'nhap-tho', '100': 'hang-so' },
    whyNone: 'Vốn bỏ ra và giá trị hiện tại đều là số gõ thẳng, phép tính đã hiện trọn trong hình.',
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
  },

  'ty-suat-co-tuc': {
    entries: [],
    skipped: { DY: 'ket-qua', D: 'nhap-tho', P: 'nhap-tho', '100': 'hang-so' },
    whyNone: 'Cổ tức cả năm và thị giá đều là số đọc thẳng từ thông báo cổ tức và bảng giá.',
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
  },
};
