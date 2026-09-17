/**
 * Khung "cách tính" của nhóm `src/core/formulas/corporate.ts` — kiểu dữ liệu và luật ở `types.ts`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_CORPORATE: Readonly<Record<string, FormulaHowTo>> = {
  /*
   * Số dư đảm phí `P - VC` là phép trừ `calc` làm thật (`margin`), nhưng hình đã viết trọn nó.
   * `DT_{hv}` là kết quả thứ hai của công thức (`extras.breakEvenRevenue`), vế trái của nửa sau hình.
   */
  'diem-hoa-von': {
    entries: [],
    skipped: {
      'Q_{hv}': 'ket-qua',
      FC: 'nhap-tho',
      P: 'nhap-tho',
      VC: 'nhap-tho',
      'P - VC': 'da-hien-trong-hinh',
      'DT_{hv}': 'ket-qua',
    },
    whyNone:
      'Định phí, giá bán và biến phí một sản phẩm là số người dùng tự gõ, số dư đảm phí đã hiện trọn phép tính trong hình, còn sản lượng và doanh thu hoà vốn là hai kết quả của công thức.',
  },

  /*
   * `calc` tính EBIT từ ba ô nhập rồi mới tính đòn bẩy. DOL và DFL không tham gia phép tính kết quả,
   * chúng được tính riêng vào `extras`; nhưng hình có viết cả hai mà không viết cách tính, nên vẫn là
   * đại lượng phải tính. Định phí hoạt động không có dòng trong bảng ký hiệu, nên bước EBIT gọi nó
   * bằng `FC`, cùng ký hiệu với điểm hoà vốn.
   */
  'don-bay-tong-hop': {
    entries: [
      {
        kind: 'derived',
        symbol: 'DOL',
        steps: [
          {
            latex: 'DOL = \\frac{DT - BP}{EBIT}',
            expression: {
              vi: 'Đòn bẩy hoạt động = (Doanh thu − Tổng biến phí) ÷ EBIT',
              en: 'Degree of operating leverage = (Revenue − Total variable cost) ÷ EBIT',
            },
          },
        ],
        calcEvidence: ['dol: contributionMargin / ebit'],
      },
      {
        kind: 'derived',
        symbol: 'DFL',
        steps: [
          {
            latex: 'DFL = \\frac{EBIT}{EBIT - I}',
            expression: {
              vi: 'Đòn bẩy tài chính = EBIT ÷ (EBIT − Lãi vay)',
              en: 'Degree of financial leverage = EBIT ÷ (EBIT − Interest expense)',
            },
          },
        ],
        calcEvidence: ['dfl: ebit / (ebit - interest)'],
      },
      {
        kind: 'derived',
        symbol: 'EBIT',
        phrases: { vi: ['EBIT'], en: ['EBIT'] },
        steps: [
          {
            latex: 'EBIT = DT - BP - FC',
            expression: {
              vi: 'EBIT = Doanh thu − Tổng biến phí − Định phí hoạt động',
              en: 'EBIT = Revenue − Total variable cost − Operating fixed cost',
            },
          },
        ],
        calcEvidence: [
          "const contributionMargin = v('revenue') - v('variableCost')",
          "const ebit = contributionMargin - v('fixedCost')",
        ],
      },
    ],
    skipped: { DTL: 'ket-qua', DT: 'nhap-tho', BP: 'nhap-tho', I: 'nhap-tho' },
  },
};
