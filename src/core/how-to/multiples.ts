/**
 * Khung "cách tính" của nhóm `src/core/formulas/multiples.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Cả hai bội số là giá đọc thẳng trên bảng giá chia cho một chỉ số trên mỗi cổ phiếu, và `calc` chỉ
 * làm đúng phép chia ấy. Chỉ số ở mẫu là ô gõ tay mà thư viện có công thức riêng ra cùng đơn vị ₫
 * (`eps-co-ban`, `bvps`), nên mỗi công thức có đúng một khung `linked`.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_MULTIPLES: Readonly<Record<string, FormulaHowTo>> = {
  pe: {
    entries: [
      {
        kind: 'linked',
        symbol: 'EPS',
        phrases: { vi: ['EPS'], en: ['EPS'] },
        formulaId: 'eps-co-ban',
        variableKey: 'eps',
      },
    ],
    skipped: { 'P/E': 'ket-qua', P: 'nhap-tho' },
    skippedPhrases: {
      'P/E': { vi: ['P/E'], en: ['P/E'] },
      P: { vi: ['Giá thị trường'], en: ['Market price'] },
    },
  },

  pb: {
    entries: [
      {
        kind: 'linked',
        symbol: 'BVPS',
        phrases: { vi: ['Giá trị sổ sách mỗi cổ phiếu'], en: ['Book value per share'] },
        formulaId: 'bvps',
        variableKey: 'bookValuePerShare',
      },
    ],
    skipped: { 'P/B': 'ket-qua', P: 'nhap-tho' },
    skippedPhrases: {
      'P/B': { vi: ['P/B'], en: ['P/B'] },
      P: { vi: ['Giá thị trường'], en: ['Market price'] },
    },
  },
};
