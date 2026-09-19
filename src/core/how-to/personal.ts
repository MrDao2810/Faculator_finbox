/**
 * Khung "cách tính" của nhóm `src/core/formulas/personal.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * `i` và `n` của nhóm vay nợ và tiết kiệm là đại lượng `calc` tự tính dù trông như chỉ số chạy:
 * `monthlyRate()` chia lãi năm cho 12, `Math.round(years * 12)` đổi kỳ hạn tính bằng năm ra số kỳ
 * tháng. Ngược lại, `n` của lãi kép là số lần nhập lãi chọn trong ô, và `n` của tiết kiệm theo mục
 * tiêu là số tháng gõ thẳng, nên hai chỗ ấy không có khung.
 */

import type { Bilingual } from '../types';
import type { FormulaHowTo, HowToStep } from './types';

/**
 * Lãi suất một kỳ tháng — `monthlyRate()` ở `personal.ts`: lãi năm % ÷ 100 ÷ 12.
 *
 * Chia thẳng lãi DANH NGHĨA cho 12, không quy đổi theo lãi kép như `quyVeMotPhien()` ở `recipes.ts`
 * (hai cách cho hai con số khác nhau, đừng dùng lẫn). Hình viết lãi năm dạng tỷ lệ, không `÷ 100`,
 * cùng quy ước với hình công thức.
 */
function laiSuatKy(laiNam: Bilingual): HowToStep {
  return {
    latex: 'i = \\frac{r}{12}',
    expression: {
      vi: `Lãi suất kỳ i = ${laiNam.vi} r ÷ 12`,
      en: `Period rate i = ${laiNam.en} r ÷ 12`,
    },
  };
}

/** Lãi suất năm ghi trên hợp đồng vay — ô `rate` của ba công thức vay nợ. */
const LAI_NAM_HOP_DONG: Bilingual = { vi: 'Lãi suất năm', en: 'Annual rate' };

/**
 * Số kỳ trả hằng tháng — `Math.round(years * 12)` ở `annuityPayment()`, `buildAmortisation()` và
 * `calc` của trả góp gốc đều. Thanh trượt kỳ hạn bước 1 năm, nên phép làm tròn không đổi gì.
 */
const SO_KY_THANG: HowToStep = {
  latex: 'n = t \\times 12',
  expression: {
    vi: 'Số kỳ n = Số năm vay t × 12',
    en: 'Number of periods n = Loan term in years t × 12',
  },
};

export const HOW_TO_PERSONAL: Readonly<Record<string, FormulaHowTo>> = {
  'tra-gop-nien-kim': {
    entries: [
      {
        kind: 'derived',
        symbol: 'i',
        phrases: { vi: ['Lãi suất kỳ'], en: ['Period rate'] },
        steps: [laiSuatKy(LAI_NAM_HOP_DONG)],
        calcEvidence: ['const i = monthlyRate(annualPercent);', 'annualPercent / 100 / 12'],
      },
      {
        kind: 'derived',
        symbol: 'n',
        phrases: { vi: ['Số kỳ'], en: ['Number of periods'] },
        steps: [SO_KY_THANG],
        calcEvidence: ['const n = Math.round(years * 12);'],
      },
    ],
    skipped: {
      EMI: 'ket-qua',
      P: 'nhap-tho',
      r: 'nhap-tho',
      t: 'nhap-tho',
      '(1+i)^n - 1': 'da-hien-trong-hinh',
    },
  },

  'tra-gop-goc-deu': {
    entries: [
      {
        kind: 'derived',
        symbol: 'n',
        phrases: { vi: ['Số kỳ'], en: ['Number of periods'] },
        steps: [SO_KY_THANG],
        calcEvidence: ["const n = Math.round(v('years') * 12);"],
      },
      {
        kind: 'derived',
        symbol: 'i',
        phrases: { vi: ['Lãi suất kỳ'], en: ['Period rate'] },
        steps: [laiSuatKy(LAI_NAM_HOP_DONG)],
        calcEvidence: ["monthlyRate(v('rate'))", 'annualPercent / 100 / 12'],
      },
    ],
    skipped: { A_1: 'ket-qua', P: 'nhap-tho', t: 'nhap-tho', r: 'nhap-tho' },
  },

  'lich-tra-no': {
    entries: [
      /*
       * Lãi kỳ k tính trên dư nợ CÒN LẠI trước kỳ ấy — `buildAmortisation()`. Dư nợ giảm theo phần
       * gốc đã trả, và phần gốc mỗi kỳ là chỗ hai phương thức khác nhau. Kỳ cuối mã ép gốc bằng đúng
       * dư nợ còn lại để lịch về 0; đó là bù đồng lẻ, không phải một bước tính lãi, nên không tả.
       */
      {
        kind: 'derived',
        symbol: 'L_k',
        phrases: { vi: ['tiền lãi'], en: ['the interest'] },
        steps: [
          laiSuatKy(LAI_NAM_HOP_DONG),
          {
            latex: 'D_k = D_{k-1} - G_k',
            expression: {
              vi: 'Dư nợ sau kỳ k = Dư nợ sau kỳ trước − Gốc trả kỳ k, gốc trả là khoản trả đều trừ tiền lãi kỳ k nếu trả niên kim, là số tiền vay ÷ n nếu trả gốc đều',
              en: 'Balance after period k = Previous balance − Principal repaid in period k, which is the fixed payment minus the interest of period k for an annuity, or the loan amount ÷ n for equal principal',
            },
          },
          {
            latex: 'L_k = D_{k-1} \\times i',
            expression: {
              vi: 'Tiền lãi kỳ k = Dư nợ sau kỳ trước × Lãi suất kỳ i, kỳ 1 tính trên số tiền vay',
              en: 'Interest of period k = Previous balance × Period rate i, with period 1 charged on the loan amount',
            },
          },
        ],
        calcEvidence: [
          'const i = monthlyRate(annualPercent);',
          'const interest = balance * i;',
          'principal = (fixedPayment ?? 0) - interest;',
          'principal = amount / n;',
          'balance = last ? 0 : balance - principal;',
        ],
      },
      {
        kind: 'derived',
        symbol: 'n',
        phrases: { vi: ['tất cả các kỳ'], en: ['every period'] },
        steps: [SO_KY_THANG],
        calcEvidence: ['const n = Math.round(years * 12);'],
      },
    ],
    skipped: {
      '\\text{Tổng lãi}': 'ket-qua',
      k: 'chi-so-chay',
      P: 'nhap-tho',
      r: 'nhap-tho',
      '\\text{PT}': 'nhap-tho',
      t: 'nhap-tho',
    },
  },

  'lai-kep': {
    entries: [],
    skipped: {
      A: 'ket-qua',
      P: 'nhap-tho',
      r: 'nhap-tho',
      n: 'nhap-tho',
      t: 'nhap-tho',
      'n t': 'da-hien-trong-hinh',
    },
    whyNone:
      'Gốc, lãi suất năm, số lần nhập lãi và số năm đều gõ thẳng, phép chia r ÷ n và tích n × t đã hiện trọn trong hình.',
  },

  'lai-tien-gui': {
    entries: [],
    skipped: { I: 'ket-qua', P: 'nhap-tho', r: 'nhap-tho', '12': 'hang-so', T: 'nhap-tho' },
    whyNone:
      'Số tiền gửi, lãi suất năm và số tháng đều gõ thẳng, phép đổi lãi năm ra lãi tháng r ÷ 12 đã hiện trọn trong hình.',
  },

  'tiet-kiem-muc-tieu': {
    entries: [
      {
        kind: 'derived',
        symbol: 'i',
        phrases: { vi: ['Lãi suất kỳ'], en: ['Period rate'] },
        steps: [laiSuatKy({ vi: 'Lãi suất kỳ vọng mỗi năm', en: 'Expected annual rate' })],
        calcEvidence: ["const i = monthlyRate(v('rate'));", 'annualPercent / 100 / 12'],
      },
    ],
    skipped: {
      PMT: 'ket-qua',
      FV: 'nhap-tho',
      r: 'nhap-tho',
      n: 'nhap-tho',
      '(1+i)^n - 1': 'da-hien-trong-hinh',
    },
  },
};
