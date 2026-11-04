/**
 * Khung "cách tính" của nhóm `src/core/formulas/planning.ts` — kiểu dữ liệu và luật ở `types.ts`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_PLANNING: Readonly<Record<string, FormulaHowTo>> = {
  'rut-truoc-han': {
    entries: [],
    skipped: {
      I: 'ket-qua',
      P: 'nhap-tho',
      'r_{kkh}': 'nhap-tho',
      t: 'nhap-tho',
      '12': 'hang-so',
    },
    whyNone:
      'Số tiền gửi, lãi suất không kỳ hạn và số tháng đã gửi đều là số gõ thẳng, phép quy lãi năm về tháng đã hiện trọn trong hình.',
  },

  /*
   * `calc` từ chối khi tổng thời gian không chia hết cho kỳ hạn ngắn (`MEANINGLESS`), nên số vòng quay
   * luôn là số nguyên.
   */
  'gui-quay-vong': {
    entries: [
      {
        kind: 'derived',
        symbol: 'k',
        phrases: { vi: ['Số vòng quay'], en: ['Number of rounds'] },
        steps: [
          {
            latex: 'k = \\frac{T}{m}',
            expression: {
              vi: 'Số vòng quay = Tổng số tháng ÷ Kỳ hạn ngắn, chỉ tính khi chia hết',
              en: 'Number of rounds = Total months ÷ Short term, only when it divides evenly',
            },
          },
        ],
        calcEvidence: ['totalMonths % shortMonths !== 0', 'totalMonths / shortMonths'],
      },
    ],
    skipped: {
      '\\Delta': 'ket-qua',
      P: 'nhap-tho',
      r_n: 'nhap-tho',
      m: 'nhap-tho',
      '12': 'hang-so',
      r_d: 'nhap-tho',
      T: 'nhap-tho',
    },
  },

  'gia-von-trung-binh-dca': {
    entries: [],
    skipped: {
      '\\bar{P}': 'ket-qua',
      i: 'chi-so-chay',
      C_i: 'nhap-tho',
      P_i: 'nhap-tho',
      '\\sum_i C_i': 'da-hien-trong-hinh',
      '\\sum_i C_i / P_i': 'da-hien-trong-hinh',
    },
    whyNone:
      'Tiền và giá mỗi đợt đều là số gõ thẳng, còn tổng tiền và tổng số cổ phiếu đã hiện trọn trong hình.',
  },

  /* Ô lợi suất gõ theo %/năm, nên hình của bước viết dạng tỷ lệ, không `÷ 100`. */
  'so-ky-dca': {
    entries: [
      {
        kind: 'derived',
        symbol: 'i',
        phrases: { vi: ['Lợi suất kỳ'], en: ['Period rate'] },
        steps: [
          {
            latex: 'i = \\frac{r_{nam}}{12}',
            expression: {
              vi: 'Lợi suất kỳ = Lợi suất kỳ vọng một năm ÷ 12',
              en: 'Period rate = Expected annual rate of return ÷ 12',
            },
          },
        ],
        calcEvidence: ["v('rate') / 100 / 12"],
      },
    ],
    skipped: {
      n: 'ket-qua',
      '\\lceil': 'phep-toan',
      '\\ln': 'phep-toan',
      FV: 'nhap-tho',
      C: 'nhap-tho',
    },
  },

  'thue-tncn-dau-tu': {
    entries: [],
    skipped: {
      T: 'ket-qua',
      Q: 'nhap-tho',
      'P_{ban}': 'nhap-tho',
      'r_{cn}': 'hang-so-bieu-phi',
      D: 'nhap-tho',
      'r_{ct}': 'hang-so-bieu-phi',
    },
    whyNone: 'Khối lượng, giá bán và cổ tức là số gõ thẳng, còn hai thuế suất tra từ biểu phí.',
  },
};
