/**
 * Khung "cách tính" của nhóm `src/core/formulas/performance.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Chín công thức của nhóm đều chỉ nhận ô gõ tay và thay thẳng vào hình: `calc` không tự tính một
 * đại lượng trung gian nào trước khi thay (không chuỗi giá, không lãi quy kỳ). Nên chỉ còn loại
 * `linked`, và chỉ ở `tong-loi-suat-tai-dau-tu`, nơi hai ô gõ tay là kết quả của công thức khác.
 */

import type { FormulaHowTo } from './types';

export const HOW_TO_PERFORMANCE: Readonly<Record<string, FormulaHowTo>> = {
  'loi-suat-nam-hoa': {
    entries: [],
    skipped: { 'r_{nam}': 'ket-qua', 'r_{ky}': 'nhap-tho', m: 'nhap-tho' },
    whyNone:
      'Lợi suất một kỳ và số kỳ trong năm đều gõ thẳng, còn phép luỹ thừa đã hiện trọn trong hình.',
    skippedPhrases: {
      'r_{nam}': { vi: ['Lợi suất năm'], en: ['Annual return'] },
      'r_{ky}': { vi: ['Lợi suất một kỳ'], en: ['Return per period'] },
      m: { vi: ['Số kỳ trong năm'], en: ['Number of periods per year'] },
    },
  },

  'loi-suat-thuc': {
    entries: [],
    skipped: { 'r_{thuc}': 'ket-qua', 'r_{danh\\,nghia}': 'nhap-tho', '\\pi': 'nhap-tho' },
    whyNone:
      'Lợi suất danh nghĩa đọc trên sao kê và lạm phát đọc từ số liệu công bố đều gõ thẳng, phép chia đã hiện trọn trong hình.',
    skippedPhrases: {
      'r_{thuc}': { vi: ['Lợi suất thực'], en: ['Real return'] },
      'r_{danh\\,nghia}': { vi: ['Lợi suất danh nghĩa'], en: ['Nominal return'] },
      '\\pi': { vi: ['Lạm phát'], en: ['Inflation'] },
    },
  },

  'lai-suat-hieu-dung': {
    entries: [],
    skipped: { EAR: 'ket-qua', r: 'nhap-tho', m: 'nhap-tho' },
    whyNone:
      'Lãi suất niêm yết và số lần ghép lãi đều gõ thẳng, phép chia r ÷ m và phép luỹ thừa đã hiện trọn trong hình.',
    skippedPhrases: {
      EAR: { vi: ['EAR'], en: ['EAR'] },
      r: { vi: ['Lãi suất danh nghĩa'], en: ['Nominal rate'] },
      m: { vi: ['Số lần ghép lãi'], en: ['Compounding frequency'] },
    },
  },

  'tong-loi-suat-tai-dau-tu': {
    entries: [
      /*
       * "Tăng giá bình quân mỗi năm" đi vào hình dưới dạng luỹ thừa (1 + g)^n, tức đúng là tăng
       * trưởng KÉP bình quân của giá — CAGR. Liên kết để người dùng không lấy trung bình cộng mức
       * tăng từng năm (con số ấy luôn cao hơn và thổi phồng kết quả).
       */
      {
        kind: 'linked',
        symbol: 'g',
        phrases: { vi: ['Tăng giá mỗi năm'], en: ['Annual price growth'] },
        formulaId: 'cagr',
        variableKey: 'priceGrowth',
      },
      {
        kind: 'linked',
        symbol: 'y',
        phrases: { vi: ['Tỷ suất cổ tức'], en: ['Dividend yield'] },
        formulaId: 'ty-suat-co-tuc',
        variableKey: 'dividendYield',
      },
    ],
    skipped: { TR: 'ket-qua', n: 'nhap-tho' },
    skippedPhrases: {
      TR: { vi: ['Tổng lợi suất'], en: ['Total return'] },
      n: { vi: ['Số năm'], en: ['Years'] },
    },
  },

  'loi-suat-trung-binh-hinh-hoc': {
    entries: [],
    skipped: {
      'r_{G}': 'ket-qua',
      '\\prod_{k=1}^{n}': 'phep-toan',
      r_k: 'nhap-tho',
      k: 'chi-so-chay',
      n: 'nhap-tho',
      '1/n': 'da-hien-trong-hinh',
    },
    whyNone:
      'Lợi suất từng kỳ và số kỳ đều gõ thẳng, phép nhân dồn và căn bậc n đã hiện trọn trong hình.',
    skippedPhrases: {
      'r_{G}': { vi: ['Lợi suất hình học'], en: ['Geometric return'] },
      r_k: { vi: ['r kỳ 1', 'r kỳ 2'], en: ['period-1 return', 'period-2 return'] },
      n: { vi: ['Số kỳ'], en: ['Number of periods'] },
    },
  },

  'irr-nien-kim': {
    entries: [],
    skipped: {
      IRR: 'ket-qua',
      P: 'nhap-tho',
      C: 'nhap-tho',
      n: 'nhap-tho',
      '1 - (1 + IRR)^{-n}': 'da-hien-trong-hinh',
    },
    whyNone:
      'Vốn bỏ ra, dòng thu mỗi kỳ và số kỳ đều gõ thẳng, IRR là chính kết quả, và cụm 1 − (1 + IRR)^(−n) đã hiện trọn trong hình.',
    skippedPhrases: {
      IRR: { vi: ['IRR'], en: ['IRR'] },
      P: { vi: ['Vốn bỏ ra'], en: ['Capital invested'] },
      C: { vi: ['Dòng thu mỗi kỳ'], en: ['Payment per period'] },
      n: { vi: ['Số kỳ'], en: ['Number of periods'] },
    },
  },

  'thoi-gian-nhan-doi': {
    entries: [],
    skipped: {
      t: 'ket-qua',
      '\\ln': 'phep-toan',
      '2': 'hang-so',
      r: 'nhap-tho',
      '\\approx': 'phep-toan',
      '72': 'hang-so',
      '100': 'hang-so',
    },
    whyNone:
      'Lợi suất năm là số gõ thẳng, phần còn lại là hằng số 2, 72, 100 và phép logarit đã hiện trọn trong hình.',
    skippedPhrases: {
      '2': { vi: ['2'], en: ['2'] },
      '72': { vi: ['72'], en: ['72'] },
      '100': { vi: ['100'], en: ['100'] },
      t: { vi: ['Số năm nhân đôi'], en: ['Years to double'] },
      '\\ln': { vi: ['ln'], en: ['ln'] },
      r: { vi: ['Lợi suất năm'], en: ['Annual return'] },
      '\\approx': { vi: ['xấp xỉ nhanh bằng'], en: ['roughly'] },
    },
  },

  'loi-suat-quy-nam-theo-ngay': {
    entries: [],
    skipped: {
      'r_{nam}': 'ket-qua',
      'P_{ban}': 'nhap-tho',
      'P_{mua}': 'nhap-tho',
      '365': 'hang-so',
      d: 'nhap-tho',
    },
    whyNone: 'Giá mua, giá bán và số ngày nắm giữ đều gõ thẳng, 365 là hằng số.',
    skippedPhrases: {
      '365': { vi: ['365'], en: ['365'] },
      'r_{nam}': { vi: ['Lợi suất quy năm'], en: ['Annualized return'] },
      'P_{ban}': { vi: ['Giá bán'], en: ['Sell price'] },
      'P_{mua}': { vi: ['Giá mua'], en: ['Buy price'] },
      d: { vi: ['Số ngày nắm giữ'], en: ['Days held'] },
    },
  },

  'loi-suat-vuot-chuan': {
    entries: [],
    skipped: { ER: 'ket-qua', 'r_{p}': 'nhap-tho', 'r_{b}': 'nhap-tho' },
    whyNone:
      'Lợi suất danh mục và lợi suất chuẩn so sánh đều gõ thẳng, kết quả chỉ là hiệu của hai số ấy.',
    skippedPhrases: {
      ER: { vi: ['Lợi suất vượt chuẩn'], en: ['Excess return'] },
      'r_{p}': { vi: ['Lợi suất danh mục'], en: ['Portfolio return'] },
      'r_{b}': { vi: ['Lợi suất chuẩn so sánh'], en: ['Benchmark return'] },
    },
  },
};
