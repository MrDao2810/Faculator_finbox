/**
 * Tầng DOMAIN — nhóm tài chính cá nhân: vay nợ và tiết kiệm (gói WBS 5.1.4).
 *
 * Sáu công thức: ba của nhóm Vay nợ (đúng `expectedCount` của SRS 3.8) và ba của nhóm
 * Tiết kiệm. Màn WF-14 dựng trên ba công thức vay nợ.
 *
 * Con số kiểm chứng lấy từ hai nguồn độc lập:
 *   · WF-14 — vay 800 triệu, 9,5%/năm, 20 năm, trả niên kim;
 *   · tài liệu "FORMULAS & UNIT TEST" của bộ FINANCE CALC — các ca UT-CI-01 và tương đương.
 *
 * Quy ước lãi suất: mọi biến `%` nhập theo mức người đọc thấy trên hợp đồng (9,5 nghĩa là
 * 9,5%/năm), đổi sang lãi suất kỳ ở trong thân hàm — cùng quy ước CON-05 với MarketConfig.
 */

import { ok } from '../calc-output';
import type { CalcValues, FormulaModule } from '../calc/types';
import { divideByZero } from '../warnings';
import { SOURCE_CORPORATE_FINANCE, numberVar, sliderVar } from './shared';

/*
 * ── Biến dùng chung ────────────────────────────────────────────────────────────────────
 * WF-14 vẽ ba thanh trượt kèm nhãn min–max, nên ba biến chính khai type 'slider'.
 */

/*
 * Trần 10 tỷ ₫, nới từ 2 tỷ ngày 16/09/2026.
 *
 * Ví dụ của ba công thức vay là một khoản vay mua nhà 3 tỷ ₫ có thật (báo VietnamFinance, xem
 * `example.source`). Để trần ở 2 tỷ thì `clampToSpec()` hạ con số ấy xuống 2 tỷ ngay khi người dùng
 * chạm vào ô, và màn hình hiện một kết quả KHÁC kết quả in ngay bên cạnh trong khối Ví dụ — đúng
 * kiểu sai lệch âm thầm mà FR-02 tồn tại để chặn. Bước nhảy giữ 10 triệu ₫, nên thanh trượt dài hơn
 * chứ không thô hơn.
 */
const loanAmount = sliderVar(
  'amount',
  { vi: 'Số tiền vay', en: 'Loan amount' },
  '₫',
  800_000_000,
  100_000_000,
  10_000_000_000,
  10_000_000,
  {
    description: {
      vi: 'Dư nợ gốc ban đầu của khoản vay.',
      en: 'The initial principal balance of the loan.',
    },
  },
);

const loanRate = sliderVar(
  'rate',
  { vi: 'Lãi suất / năm', en: 'Interest rate / year' },
  '%',
  9.5,
  0,
  18,
  0.1,
  {
    description: {
      vi: 'Lãi suất danh nghĩa theo năm ghi trên hợp đồng.',
      en: 'The nominal annual interest rate stated in the contract.',
    },
  },
);

const loanYears = sliderVar('years', { vi: 'Kỳ hạn', en: 'Term' }, 'năm', 20, 1, 30, 1, {
  description: {
    vi: 'Thời gian trả nợ. Mỗi năm 12 kỳ trả hằng tháng.',
    en: 'The repayment period. Each year has 12 monthly instalments.',
  },
});

/** Bộ số của WF-14, dùng lại cho `example` và `tests` của cả ba công thức vay nợ. */
const WF14 = { amount: 800_000_000, rate: 9.5, years: 20 } as const;

/** Lãi suất một kỳ tháng, từ lãi suất năm dạng phần trăm. */
function monthlyRate(annualPercent: number): number {
  return annualPercent / 100 / 12;
}

/*
 * ── 1. Trả góp niên kim (EMI) ──────────────────────────────────────────────────────────
 */

export const TRA_GOP_NIEN_KIM: FormulaModule = {
  spec: {
    id: 'tra-gop-nien-kim',
    categoryId: 'loans',
    name: { vi: 'Trả góp niên kim', en: 'Annuity loan payment (EMI)' },
    description: {
      vi: 'Số tiền cố định phải trả mỗi tháng cho khoản vay trả góp dư nợ giảm dần.',
      en: 'The fixed amount due each month for a reducing-balance instalment loan.',
    },
    latex: 'EMI = \\frac{P \\cdot i(r) \\,(1+i)^{n(t)}}{(1+i)^n - 1}',
    expression: {
      vi: 'Trả hằng tháng = Số tiền vay × Lãi suất kỳ × (1 + Lãi suất kỳ)^Số kỳ ÷ [(1 + Lãi suất kỳ)^Số kỳ − 1]',
      en: 'Monthly payment = Loan amount × Period rate × (1 + Period rate)^Number of periods ÷ [(1 + Period rate)^Number of periods − 1]',
    },
    symbols: [
      {
        latex: 'EMI',
        meaning: {
          vi: 'khoản trả cố định hằng tháng, ₫/tháng',
          en: 'fixed monthly payment, ₫/month',
        },
      },
      { latex: 'P', meaning: { vi: 'số tiền vay ban đầu, ₫', en: 'loan amount, ₫' } },
      {
        latex: 'i',
        meaning: {
          vi: 'lãi suất một kỳ tháng = lãi suất / năm ÷ 12, dạng thập phân',
          en: 'monthly period rate = annual rate ÷ 12, as a decimal',
        },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'lãi suất vay mỗi năm (ô Lãi suất / năm)',
          en: 'the loan rate per year (Rate per year field)',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số kỳ trả = kỳ hạn (năm) × 12',
          en: 'number of periods = term in years × 12',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'kỳ hạn vay, năm (ô Kỳ hạn)', en: 'loan term, in years (Term field)' },
      },
      {
        latex: '(1+i)^n - 1',
        meaning: {
          vi: 'tiền lãi kép mà 1 đồng sinh ra sau n kỳ',
          en: 'compound interest that 1 unit earns over n periods',
        },
      },
    ],
    chartType: 'stackedBar',
    /*
     * Bóc tách KỲ ĐẦU, không phải cả kỳ hạn. Khoản trả hằng tháng không đổi suốt 240 kỳ nhưng
     * ruột của nó đổi từng kỳ, và chính câu `howToRead` bên dưới nói điều đó: "những năm đầu
     * phần lớn tiền trả là lãi". Hai cột này là hình của đúng câu ấy — ở kỳ 1 phần lãi cao nhất.
     */
    breakdown: [
      {
        key: 'firstPrincipal',
        sign: 1,
        shortLabel: { vi: 'Gốc kỳ đầu', en: 'First-period principal' },
      },
      {
        key: 'firstInterest',
        sign: 1,
        shortLabel: { vi: 'Lãi kỳ đầu', en: 'First-period interest' },
      },
    ],
    breakdownTotal: { vi: 'Trả kỳ đầu', en: 'First-period payment' },
    level: 'basic',
    isFeatured: true,
    tags: ['tra gop', 'emi', 'nien kim', 'vay mua nha'],
    resultUnit: '₫/tháng',
    variables: [loanAmount, loanRate, loanYears],
    explanation: {
      meaning: {
        vi: 'Khoản tiền giống nhau ở mọi kỳ, trong đó phần lãi giảm dần còn phần gốc tăng dần.',
        en: 'The same amount is paid every period, with the interest portion shrinking and the principal portion growing over time.',
      },
      whenToUse: {
        vi: 'Khi vay mua nhà hoặc vay tiêu dùng theo phương thức trả đều hằng tháng.',
        en: 'For home loans or consumer loans repaid with equal monthly instalments.',
      },
      howToRead: {
        vi: 'So khoản trả hằng tháng này với thu nhập của bạn để biết có kham nổi lâu dài không. Con số này giữ nguyên suốt toàn bộ kỳ hạn vay — không giảm dần theo thời gian như ở trả góp gốc đều.',
        en: 'Compare this monthly payment with your income to judge whether it is affordable over the long run. The figure stays the same for the entire loan term — it does not decrease over time the way the equal-principal payment does.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn số tiền hằng tháng thấy vừa sức mà không cộng lại tổng lãi phải trả cả kỳ hạn.',
        en: 'Judging affordability only by the monthly amount, without adding up the total interest paid over the whole term.',
      },
    },
    example: {
      title: {
        vi: 'Vay 3 tỷ ₫ mua nhà ở Hà Nội, 8%/năm, 20 năm, trả niên kim — tháng 3/2026',
        en: 'A 3 billion VND home loan in Hanoi at 8%/year for 20 years, repaid as an annuity — March 2026',
      },
      inputs: { amount: 3_000_000_000, rate: 8, years: 20 },
      expected: 25_093_202,
      note: {
        vi: 'Khoản trả giữ nguyên suốt 240 kỳ nên dễ lập kế hoạch chi tiêu, đổi lại những năm đầu gần như chỉ trả lãi, gốc giảm rất chậm. Mức ngân hàng báo cho người vay — khoảng 28 triệu ₫/tháng — nằm giữa con số niên kim này và kỳ đầu của cách trả gốc đều (32,5 triệu ₫), nên không trùng hẳn phương thức nào.',
        en: 'The payment stays the same across all 240 periods, which makes budgeting easy, but the early years are almost entirely interest and the principal falls very slowly. The roughly 28 million VND a month the bank quoted sits between this annuity figure and the first equal-principal period (32.5 million VND), so it matches neither method exactly.',
      },
      source: {
        vi: 'VietnamFinance, trường hợp vay mua nhà 3 tỷ ₫ tại Hà Nội, 28/03/2026.',
        en: 'VietnamFinance, a 3 billion VND home-loan case in Hanoi, 2026-03-28.',
      },
    },
    tests: [
      { name: 'ví dụ WF-14', inputs: { ...WF14 }, expected: 7_457_049.5, tolerance: 1 },
      {
        // Không có nhánh này thì mẫu số (1+i)^n − 1 bằng 0 và kết quả ra NaN.
        name: 'lãi suất 0% thì chia đều gốc, không chia cho 0',
        inputs: { amount: 120_000_000, rate: 0, years: 10 },
        expected: 1_000_000,
      },
      {
        name: 'không vay gì thì không phải trả gì',
        inputs: { amount: 0, rate: 9.5, years: 20 },
        expected: 0,
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const amount = v('amount');
    const payment = annuityPayment(amount, v('rate'), v('years'));
    if (payment === null) {
      return {
        value: null,
        unit: '₫/tháng',
        warning: divideByZero(
          { vi: 'khoản trả hằng tháng', en: 'the monthly payment' },
          { vi: 'Kỳ hạn', en: 'Term' },
          { vi: 'Nhập kỳ hạn ít nhất 1 năm.', en: 'Enter a term of at least 1 year.' },
        ),
      };
    }

    /*
     * Ruột của kỳ đầu, cho biểu đồ bóc tách. Lãi kỳ 1 tính trên trọn dư nợ gốc, phần còn lại của
     * khoản trả là gốc — nên hai số này cộng lại đúng bằng `payment`, không phải xấp xỉ.
     */
    const firstInterest = amount * monthlyRate(v('rate'));
    return ok(payment, '₫/tháng', {
      extras: { firstPrincipal: payment - firstInterest, firstInterest },
    });
  },
};

/**
 * Khoản trả đều mỗi kỳ. Trả null khi số kỳ bằng 0 — nơi gọi đổi thành cảnh báo.
 * Lãi suất 0% có nhánh riêng: công thức niên kim chia cho 0 ở trường hợp đó.
 */
export function annuityPayment(
  amount: number,
  annualPercent: number,
  years: number,
): number | null {
  const n = Math.round(years * 12);
  if (n <= 0) return null;

  const i = monthlyRate(annualPercent);
  if (i === 0) return amount / n;

  const growth = Math.pow(1 + i, n);
  return (amount * i * growth) / (growth - 1);
}

/*
 * ── 2. Trả góp gốc đều ─────────────────────────────────────────────────────────────────
 */

export const TRA_GOP_GOC_DEU: FormulaModule = {
  spec: {
    id: 'tra-gop-goc-deu',
    categoryId: 'loans',
    name: { vi: 'Trả góp gốc đều', en: 'Equal-principal loan payment' },
    description: {
      vi: 'Số tiền phải trả ở kỳ đầu tiên khi trả gốc đều nhau mỗi tháng.',
      en: 'The amount due in the first period when repaying an equal amount of principal each month.',
    },
    latex: 'A_1 = \\frac{P}{n(t)} + P \\cdot i(r)',
    expression: {
      vi: 'Kỳ đầu = Số tiền vay ÷ Số kỳ + Số tiền vay × Lãi suất kỳ',
      en: 'First period = Loan amount ÷ Number of periods + Loan amount × Period rate',
    },
    symbols: [
      {
        latex: 'A_1',
        meaning: {
          vi: 'khoản phải trả ở kỳ đầu tiên, ₫',
          en: 'payment due in the first period, ₫',
        },
      },
      { latex: 'P', meaning: { vi: 'số tiền vay ban đầu, ₫', en: 'loan amount, ₫' } },
      {
        latex: 'n',
        meaning: {
          vi: 'số kỳ trả = kỳ hạn (năm) × 12',
          en: 'number of periods = term in years × 12',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'kỳ hạn vay, năm (ô Kỳ hạn)', en: 'loan term, in years (Term field)' },
      },
      {
        latex: 'i',
        meaning: {
          vi: 'lãi suất một kỳ tháng = lãi suất / năm ÷ 12, dạng thập phân',
          en: 'monthly period rate = annual rate ÷ 12, as a decimal',
        },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'lãi suất vay mỗi năm (ô Lãi suất / năm)',
          en: 'the loan rate per year (Rate per year field)',
        },
      },
    ],
    chartType: 'stackedBar',
    /* Kỳ đầu chính là kết quả của công thức này, nên hai chặng ghép lại đúng bằng nó. */
    breakdown: [
      {
        key: 'firstPrincipal',
        sign: 1,
        shortLabel: { vi: 'Gốc mỗi kỳ', en: 'Principal per period' },
      },
      {
        key: 'firstInterest',
        sign: 1,
        shortLabel: { vi: 'Lãi kỳ đầu', en: 'First-period interest' },
      },
    ],
    breakdownTotal: { vi: 'Trả kỳ đầu', en: 'First-period payment' },
    level: 'basic',
    tags: ['goc deu', 'tra gop', 'du no giam dan'],
    resultUnit: '₫',
    variables: [loanAmount, loanRate, loanYears],
    explanation: {
      meaning: {
        vi: 'Mỗi kỳ trả một phần gốc như nhau cộng tiền lãi trên dư nợ còn lại, nên số tiền giảm dần.',
        en: 'Each period repays the same amount of principal plus interest on the remaining balance, so the payment decreases over time.',
      },
      whenToUse: {
        vi: 'Khi thu nhập hiện tại đủ mạnh và muốn tổng lãi phải trả thấp hơn niên kim.',
        en: 'When current income is strong enough and the goal is a lower total interest cost than an annuity loan.',
      },
      howToRead: {
        vi: 'Kỳ đầu nặng nhất — đây chính là con số cần cân đối với thu nhập hằng tháng.',
        en: 'The first period is the heaviest — this is the figure to weigh against monthly income.',
      },
      commonMistakes: {
        vi: 'So sánh kỳ đầu của gốc đều với khoản cố định của niên kim rồi kết luận gốc đều đắt hơn.',
        en: 'Comparing the first equal-principal payment to the fixed annuity payment and concluding equal-principal is more expensive.',
      },
    },
    example: {
      title: {
        vi: 'Cũng khoản vay 3 tỷ ₫, 8%/năm, 20 năm nhưng trả gốc đều — kỳ đầu, tháng 3/2026',
        en: 'The same 3 billion VND loan at 8%/year for 20 years but with equal principal — first period, March 2026',
      },
      inputs: { amount: 3_000_000_000, rate: 8, years: 20 },
      expected: 32_500_000,
      note: {
        vi: 'Kỳ đầu gồm 12,5 triệu ₫ gốc và 20 triệu ₫ lãi, rồi nhẹ dần từng tháng vì lãi tính trên dư nợ còn lại. Cùng một bộ số mà hai phương thức chênh nhau hơn 7 triệu ₫ ngay kỳ đầu, nên phải biết ngân hàng đang tính theo cách nào thì đối chiếu mới có nghĩa.',
        en: 'The first period is 12.5 million VND of principal plus 20 million VND of interest, then eases month by month as interest is charged on the remaining balance. On the very same figures the two methods differ by more than 7 million VND in the first period, so a comparison only means something once you know which method the bank uses.',
      },
      source: {
        vi: 'VietnamFinance, trường hợp vay mua nhà 3 tỷ ₫ tại Hà Nội, 28/03/2026.',
        en: 'VietnamFinance, a 3 billion VND home-loan case in Hanoi, 2026-03-28.',
      },
    },
    tests: [
      { name: 'ví dụ WF-14, kỳ đầu', inputs: { ...WF14 }, expected: 9_666_666.67, tolerance: 1 },
      {
        name: 'lãi suất 0% thì kỳ đầu đúng bằng gốc chia số kỳ',
        inputs: { amount: 120_000_000, rate: 0, years: 10 },
        expected: 1_000_000,
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const n = Math.round(v('years') * 12);
    if (n <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          { vi: 'khoản trả kỳ đầu', en: 'the first-period payment' },
          { vi: 'Kỳ hạn', en: 'Term' },
          { vi: 'Nhập kỳ hạn ít nhất 1 năm.', en: 'Enter a term of at least 1 year.' },
        ),
      };
    }
    const amount = v('amount');
    const firstPrincipal = amount / n;
    const firstInterest = amount * monthlyRate(v('rate'));
    return ok(firstPrincipal + firstInterest, '₫', { extras: { firstPrincipal, firstInterest } });
  },
};

/*
 * ── 3. Lịch trả nợ ─────────────────────────────────────────────────────────────────────
 */

const loanMethod: import('../types').VariableSpec = {
  key: 'method',
  label: { vi: 'Phương thức trả', en: 'Repayment method' },
  unit: '',
  type: 'buttonGroup',
  defaultValue: 1,
  level: 'basic',
  description: {
    vi: 'Niên kim trả đều mỗi kỳ; gốc đều trả gốc như nhau, lãi giảm dần.',
    en: 'Annuity pays the same amount each period; equal-principal repays the same principal with decreasing interest.',
  },
  options: [
    { value: 1, label: { vi: 'Niên kim', en: 'Annuity' } },
    { value: 2, label: { vi: 'Gốc đều', en: 'Equal principal' } },
  ],
};

export const LICH_TRA_NO: FormulaModule = {
  spec: {
    id: 'lich-tra-no',
    categoryId: 'loans',
    name: { vi: 'Lịch trả nợ vay', en: 'Loan amortization schedule' },
    description: {
      vi: 'Tổng số tiền lãi phải trả trong cả kỳ hạn, kèm bảng chi tiết từng kỳ.',
      en: 'The total interest payable over the whole term, with a detailed period-by-period table.',
    },
    latex: '\\text{Tổng lãi} = \\sum_{k=1}^{n(t)} L_k(P, r, \\text{PT})',
    expression: {
      vi: 'Tổng lãi = Cộng tiền lãi của tất cả các kỳ',
      en: 'Total interest = Sum of the interest of every period',
    },
    symbols: [
      {
        latex: '\\text{Tổng lãi}',
        meaning: {
          vi: 'toàn bộ tiền lãi phải trả trong cả kỳ hạn, ₫',
          en: 'total interest paid over the whole term, ₫',
        },
      },
      { latex: 'L_k', meaning: { vi: 'tiền lãi của kỳ thứ k, ₫', en: 'interest of period k, ₫' } },
      {
        latex: 'P',
        meaning: {
          vi: 'số tiền vay ban đầu (ô Số tiền vay), ₫',
          en: 'the initial loan amount (Loan amount field), ₫',
        },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'lãi suất vay mỗi năm (ô Lãi suất / năm)',
          en: 'the loan rate per year (Rate per year field)',
        },
      },
      {
        latex: '\\text{PT}',
        meaning: {
          vi: 'phương thức trả, niên kim hay gốc đều (ô Phương thức trả)',
          en: 'repayment method, annuity or equal principal (Repayment method field)',
        },
      },
      {
        latex: 'k',
        meaning: {
          vi: 'số thứ tự kỳ trả, chạy từ 1 tới n',
          en: 'period number, running from 1 to n',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số kỳ trả = kỳ hạn (năm) × 12',
          en: 'number of periods = term in years × 12',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'kỳ hạn vay, năm (ô Kỳ hạn)', en: 'loan term, in years (Term field)' },
      },
    ],
    chartType: 'stackedBar',
    /*
     * ── Cạm bẫy của công thức này, và cách né ────────────────────────────────────────────
     *
     * Cột chồng hiển nhiên là "gốc + lãi" — nhưng KẾT QUẢ của công thức chỉ là phần LÃI, nên
     * hình ấy cộng lại ra tổng phải trả, lệch hẳn con số ở khối Kết quả. Bất biến "tổng các
     * chặng bằng kết quả" sẽ đỏ, và đúng ra phải đỏ: một hình bóc tách cộng không ra con số nó
     * đang minh hoạ là hình nói dối.
     *
     * Lối đi đúng là đảo chiều phép tính, vì tổng lãi CHÍNH LÀ phần dôi ra của những gì phải
     * trả so với những gì đã vay: `tổng phải trả − gốc vay = tổng lãi`, đúng từng đồng theo
     * cách `buildAmortisation()` ép kỳ cuối về dư nợ 0. Hình thành ra hai cột và một cột tổng,
     * và nó nói thẳng đúng điều `commonMistakes` cảnh báo — vay 800 triệu mà phải trả 1.790
     * triệu.
     */
    breakdown: [
      { key: 'totalPaid', sign: 1, shortLabel: { vi: 'Tổng phải trả', en: 'Total repaid' } },
      { key: 'amount', sign: -1, shortLabel: { vi: 'Trừ gốc vay', en: 'Less loan principal' } },
    ],
    breakdownTotal: { vi: 'Tổng lãi', en: 'Total interest' },
    level: 'basic',
    isFeatured: true,
    tags: ['lich tra no', 'tong lai', 'bang tra no', 'amortization'],
    resultUnit: '₫',
    variables: [loanAmount, loanRate, loanYears, loanMethod],
    explanation: {
      meaning: {
        vi: 'Toàn bộ tiền lãi phải trả cho ngân hàng từ kỳ đầu tới khi tất toán.',
        en: 'The total interest owed to the bank from the first period until the loan is fully settled.',
      },
      whenToUse: {
        vi: 'Khi so sánh hai phương thức trả, hoặc cân nhắc rút ngắn kỳ hạn.',
        en: 'When comparing the two repayment methods, or considering shortening the term.',
      },
      howToRead: {
        vi: 'Với cùng lãi suất và kỳ hạn, gốc đều không bao giờ cho tổng lãi cao hơn niên kim — bằng nhau khi lãi suất 0%/năm, còn lại đều thấp hơn — đổi lại kỳ đầu nặng hơn.',
        en: 'For the same rate and term, equal-principal never yields higher total interest than annuity — they tie when the rate is 0%/year, and equal-principal is lower otherwise — at the cost of a heavier first period.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn lãi suất mà bỏ qua kỳ hạn. Kéo dài kỳ hạn làm khoản trả hằng tháng nhẹ đi nhưng tổng lãi tăng mạnh.',
        en: 'Looking only at the interest rate while ignoring the term. Extending the term lowers the monthly payment but sharply raises total interest.',
      },
    },
    example: {
      title: {
        vi: 'Tổng lãi cả 20 năm của khoản vay 3 tỷ ₫, 8%/năm, trả niên kim — tháng 3/2026',
        en: 'Total interest over 20 years on a 3 billion VND loan at 8%/year repaid as an annuity — March 2026',
      },
      inputs: { amount: 3_000_000_000, rate: 8, years: 20, method: 1 },
      expected: 3_022_368_497,
      note: {
        vi: 'Tiền lãi cả kỳ hạn còn nhiều hơn chính số tiền đã vay; đổi sang gốc đều thì tổng lãi còn khoảng 2,41 tỷ ₫, đánh đổi bằng những năm đầu nặng hơn. Con số này còn giả định lãi suất đứng yên suốt 20 năm, trong khi trường hợp thật chỉ được ưu đãi 24 tháng rồi thả nổi 14–15%/năm.',
        en: 'The interest over the whole term exceeds the amount borrowed; switching to equal principal brings it down to about 2.41 billion VND, at the cost of heavier early years. The figure also assumes the rate never moves for 20 years, whereas the real case had only 24 promotional months before floating to 14–15%/year.',
      },
      source: {
        vi: 'VietnamFinance, trường hợp vay mua nhà 3 tỷ ₫ tại Hà Nội, 28/03/2026.',
        en: 'VietnamFinance, a 3 billion VND home-loan case in Hanoi, 2026-03-28.',
      },
    },
    tests: [
      {
        name: 'ví dụ WF-14 — tổng lãi niên kim',
        inputs: { ...WF14, method: 1 },
        expected: 989_691_880.64,
        tolerance: 100,
      },
      {
        // Đối chiếu bằng dạng đóng: i × P × (n+1) / 2 = 763.166.666,67.
        name: 'gốc đều luôn rẻ hơn niên kim ở cùng kỳ hạn',
        inputs: { ...WF14, method: 2 },
        expected: 763_166_666.67,
        tolerance: 100,
      },
      {
        name: 'lãi suất 0% thì không có đồng lãi nào',
        inputs: { amount: 120_000_000, rate: 0, years: 10, method: 1 },
        expected: 0,
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const schedule = buildAmortisation(v('amount'), v('rate'), v('years'), methodOf(v('method')));
    if (schedule === null) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          { vi: 'lịch trả nợ', en: 'the amortization schedule' },
          { vi: 'Kỳ hạn', en: 'Term' },
          { vi: 'Nhập kỳ hạn ít nhất 1 năm.', en: 'Enter a term of at least 1 year.' },
        ),
      };
    }

    const totalInterest = schedule.reduce((sum, row) => sum + row.interest, 0);
    /*
     * Suy ra chứ KHÔNG cộng dồn `row.payment`, dù hai cách bằng nhau về toán.
     *
     * Cộng dồn thì tổng phải trả và số gốc vay đi theo hai đường tích luỹ khác nhau, nên ở lãi
     * suất 0 chúng lệch nhau một hạt bụi dấu phẩy động: đo được 799.999.999,99999988 so với
     * 800.000.000 đúng. Chặng bóc tách "tổng phải trả − gốc vay" khi ấy ra −1,19e−7 thay vì 0,
     * `Math.floor` trong `niceAxis` nới trục xuống trọn một bước, và người dùng thấy vạch
     * "−200 (triệu ₫)" dưới một biểu đồ không có cột nào âm. Đo trên lưới thanh trượt thật:
     * 1.214 bộ số dính, tất cả đều ở lãi suất 0 — kể cả bộ mặc định 800 triệu / 20 năm của WF-14.
     *
     * `buildAmortisation` ép kỳ cuối đóng dư nợ về đúng 0, nên gốc trả trong lịch đúng bằng
     * `amount` và đẳng thức này chặt chứ không phải xấp xỉ.
     */
    const totalPaid = v('amount') + totalInterest;

    return ok(totalInterest, '₫', {
      extras: { totalPaid, periods: schedule.length, firstPayment: schedule[0]?.payment ?? 0 },
    });
  },
};

/*
 * ── Bảng lịch trả nợ — khối chính của WF-14 ────────────────────────────────────────────
 */

export type LoanMethod = 'annuity' | 'equalPrincipal';

export interface AmortisationRow {
  /** Số thứ tự kỳ, bắt đầu từ 1. */
  period: number;
  payment: number;
  principal: number;
  interest: number;
  /** Dư nợ còn lại sau kỳ này. Kỳ cuối phải về đúng 0. */
  balance: number;
}

/** Đổi giá trị số của biến `method` thành phương thức. Giá trị lạ rơi về niên kim. */
export function methodOf(value: number): LoanMethod {
  return value === 2 ? 'equalPrincipal' : 'annuity';
}

/**
 * Lịch trả nợ đầy đủ từng kỳ. Trả null khi kỳ hạn bằng 0.
 *
 * Kỳ cuối được ép về dư nợ 0 và bù chênh lệch vào phần gốc: cộng dồn số thực suốt 240 kỳ
 * luôn để lại vài đồng lẻ, mà một bảng trả nợ còn dư nợ ở kỳ cuối thì người dùng không tin.
 */
export function buildAmortisation(
  amount: number,
  annualPercent: number,
  years: number,
  method: LoanMethod,
): AmortisationRow[] | null {
  const n = Math.round(years * 12);
  if (n <= 0 || !Number.isFinite(amount) || !Number.isFinite(annualPercent)) return null;

  const i = monthlyRate(annualPercent);
  const fixedPayment = method === 'annuity' ? annuityPayment(amount, annualPercent, years) : null;
  if (method === 'annuity' && fixedPayment === null) return null;

  const rows: AmortisationRow[] = [];
  let balance = amount;

  for (let period = 1; period <= n; period += 1) {
    const interest = balance * i;
    const last = period === n;

    let principal: number;
    if (method === 'annuity') {
      principal = (fixedPayment ?? 0) - interest;
    } else {
      principal = amount / n;
    }

    // Kỳ cuối trả nốt đúng phần dư nợ còn lại.
    if (last) principal = balance;

    balance = last ? 0 : balance - principal;
    rows.push({ period, payment: principal + interest, principal, interest, balance });
  }

  return rows;
}

/**
 * Chọn những kỳ đáng hiện ra màn hình.
 *
 * WF-14 ghi bảng 240 kỳ "có rút gọn": đổ hết 240 dòng ra DOM vừa chậm vừa không ai đọc.
 * Giữ 12 kỳ đầu (giai đoạn người vay quan tâm nhất), mốc cuối mỗi năm, và kỳ cuối cùng.
 */
export function condenseSchedule(
  rows: ReadonlyArray<AmortisationRow>,
  headCount = 12,
): ReadonlyArray<AmortisationRow> {
  if (rows.length <= headCount) return rows;

  const kept: AmortisationRow[] = [];
  for (const row of rows) {
    const isHead = row.period <= headCount;
    const isYearEnd = row.period % 12 === 0;
    const isLast = row.period === rows.length;
    if (isHead || isYearEnd || isLast) kept.push(row);
  }
  return kept;
}

/** Chỗ đã bỏ bớt kỳ trong bảng rút gọn. Giao diện vẽ nó thành hàng "…". */
export const SCHEDULE_GAP = 'gap';

/** Một ô của bảng rút gọn: hoặc một kỳ thật, hoặc dấu hiệu "đã bỏ bớt ở đây". */
export type ScheduleCell = AmortisationRow | typeof SCHEDULE_GAP;

/**
 * Bảng rút gọn kèm dấu chỗ đã cắt.
 *
 * Vì sao không để giao diện tự so `period` của hai dòng liền nhau: đó là một phép suy luận về
 * dữ liệu, và suy luận về dữ liệu thì phải test được bằng Node. Để trong JSX thì nó chỉ được
 * kiểm bằng mắt trên trình duyệt.
 *
 * Mỗi khoảng trống được một dấu riêng chứ không gộp thành một dấu duy nhất: bảng 240 kỳ bị cắt
 * ở 19 chỗ khác nhau, gộp lại thành một dấu sẽ khiến người đọc tưởng phần giữa là liền mạch.
 */
export function condenseWithGaps(
  rows: ReadonlyArray<AmortisationRow>,
  headCount = 12,
): ReadonlyArray<ScheduleCell> {
  const cells: ScheduleCell[] = [];
  let previous: number | null = null;

  for (const row of condenseSchedule(rows, headCount)) {
    if (previous !== null && row.period > previous + 1) cells.push(SCHEDULE_GAP);
    cells.push(row);
    previous = row.period;
  }

  return cells;
}

/*
 * ── 4. Lãi kép ─────────────────────────────────────────────────────────────────────────
 */

export const LAI_KEP: FormulaModule = {
  spec: {
    id: 'lai-kep',
    categoryId: 'savings',
    name: { vi: 'Lãi kép', en: 'Compound interest' },
    description: {
      vi: 'Số tiền tích luỹ khi tiền lãi được nhập vào gốc theo định kỳ.',
      en: 'The accumulated amount when interest is periodically compounded into the principal.',
    },
    latex: 'A = P \\left(1 + \\frac{r}{n}\\right)^{n t}',
    expression: {
      vi: 'Số tiền cuối = Gốc × (1 + Lãi suất năm ÷ Số lần nhập lãi)^(Số lần nhập lãi × Số năm)',
      en: 'Final amount = Principal × (1 + Annual rate ÷ Compounding frequency)^(Compounding frequency × Years)',
    },
    symbols: [
      {
        latex: 'A',
        meaning: {
          vi: 'số tiền cuối kỳ, gồm cả gốc lẫn lãi, ₫',
          en: 'final amount, principal plus interest, ₫',
        },
      },
      {
        latex: 'P',
        meaning: { vi: 'số tiền gốc gửi ban đầu, ₫', en: 'initial principal deposited, ₫' },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'lãi suất / năm, dạng thập phân (8% là 0,08)',
          en: 'annual interest rate as a decimal (8% is 0.08)',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số lần nhập lãi mỗi năm, lần',
          en: 'compounding frequency per year, times',
        },
      },
      {
        latex: 't',
        meaning: { vi: 'thời gian gửi, năm', en: 'time the money is deposited, years' },
      },
      {
        latex: 'n t',
        meaning: {
          vi: 'tổng số kỳ nhập lãi trong suốt thời gian gửi',
          en: 'total number of compounding periods over the whole time',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['lai kep', 'compound', 'tich luy'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', { vi: 'Số tiền gốc', en: 'Principal amount' }, '₫', 10_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: { vi: 'Số tiền gửi ban đầu.', en: 'The initial deposit amount.' },
      }),
      sliderVar('rate', { vi: 'Lãi suất / năm', en: 'Interest rate / year' }, '%', 8, 0, 20, 0.1, {
        description: {
          vi: 'Lãi suất danh nghĩa theo năm.',
          en: 'The nominal annual interest rate.',
        },
      }),
      sliderVar('years', { vi: 'Thời gian', en: 'Time' }, 'năm', 10, 1, 50, 1, {
        description: {
          vi: 'Số năm để tiền sinh lãi.',
          en: 'The number of years the money earns interest.',
        },
      }),
      {
        key: 'perYear',
        label: { vi: 'Số lần nhập lãi / năm', en: 'Compounding frequency / year' },
        unit: 'lần',
        type: 'select',
        defaultValue: 12,
        level: 'advanced',
        description: {
          vi: 'Nhập lãi càng dày thì số tiền cuối kỳ càng lớn.',
          en: 'The more frequently interest compounds, the larger the final amount.',
        },
        /*
         * `{ value: 2, ... }` thêm ngày 16/09/2026: ví dụ thật của công thức là một sổ tiết kiệm
         * kỳ hạn 6 tháng (ngân hàng nhập lãi mỗi 6 tháng) — sản phẩm rất phổ biến, không phải số
         * bịa ra cho vừa dữ liệu. Thiếu lựa chọn này thì ô chọn không có mục nào khớp `perYear: 2`
         * của ví dụ, và bấm "về số của ví dụ" sẽ đặt ô chọn ở một giá trị không tồn tại trong danh
         * sách hiện ra.
         */
        options: [
          { value: 1, label: { vi: 'Mỗi năm', en: 'Annually' } },
          { value: 2, label: { vi: 'Mỗi nửa năm', en: 'Semi-annually' } },
          { value: 4, label: { vi: 'Mỗi quý', en: 'Quarterly' } },
          { value: 12, label: { vi: 'Mỗi tháng', en: 'Monthly' } },
          { value: 365, label: { vi: 'Mỗi ngày', en: 'Daily' } },
        ],
      },
    ],
    explanation: {
      meaning: {
        vi: 'Tiền lãi của kỳ trước cũng sinh lãi ở kỳ sau, nên số dư tăng nhanh dần.',
        en: 'The interest from a previous period itself earns interest in later periods, so the balance grows at an accelerating pace.',
      },
      whenToUse: {
        vi: 'Khi ước tính khoản tiết kiệm dài hạn hoặc so sánh các kỳ hạn gửi.',
        en: 'When estimating long-term savings or comparing different deposit terms.',
      },
      howToRead: {
        vi: 'Chênh lệch so với lãi đơn nhỏ ở vài năm đầu và rõ rệt sau mười năm — đó là điểm mạnh của thời gian.',
        en: 'The gap versus simple interest is small in the first few years and becomes pronounced after ten years — that is the power of time.',
      },
      commonMistakes: {
        vi: 'Nhầm lãi suất danh nghĩa với lãi suất thực nhận. Nhập lãi 12 lần một năm cho kết quả cao hơn nhập lãi một lần.',
        en: 'Confusing the nominal rate with the effective rate actually received. Compounding 12 times a year yields more than compounding once.',
      },
    },
    example: {
      title: {
        vi: 'Gửi 1 tỷ ₫ kỳ hạn 6 tháng lãi 8,1%/năm rồi tái tục thêm một kỳ nữa — năm 2026',
        en: 'Deposit 1 billion VND for a 6-month term at 8.1%/year, then roll it over once more — 2026',
      },
      inputs: { principal: 1_000_000_000, rate: 8.1, years: 1, perYear: 2 },
      expected: 1_082_640_250,
      note: {
        vi: 'Hai kỳ nhập lãi cho tiền lãi nhiều hơn lãi đơn khoảng 1,64 triệu ₫ — đó chính là phần “lãi của lãi” sinh ra trong sáu tháng cuối. Sức mạnh của lãi kép chỉ lộ rõ khi kéo dài nhiều năm, và chỉ đúng nếu không rút giữa chừng lẫn lãi suất giữ nguyên qua các kỳ.',
        en: 'Two compounding periods earn about 1.64 million VND more than simple interest — that extra is the “interest on interest” generated in the final six months. Compounding only shows its strength over many years, and only if the money is left untouched and the rate holds from one term to the next.',
      },
      source: {
        vi: 'Diễn đàn VOZ, thớt lãi suất tiết kiệm các ngân hàng năm 2026: kỳ hạn 6 tháng 8,1%/năm tại Cake by VPBank.',
        en: 'The VOZ forum thread on 2026 bank savings rates: a 6-month term at 8.1%/year with Cake by VPBank.',
      },
    },
    tests: [
      {
        name: 'UT-CI-01 — 10 triệu, 8%, 10 năm, nhập lãi tháng',
        inputs: { principal: 10_000_000, rate: 8, years: 10, perYear: 12 },
        expected: 22_196_402.35,
        tolerance: 1,
      },
      {
        name: 'lãi suất 0% thì số tiền giữ nguyên',
        inputs: { principal: 10_000_000, rate: 0, years: 10, perYear: 12 },
        expected: 10_000_000,
      },
      {
        name: 'nhập lãi hằng năm cho kết quả thấp hơn hằng tháng',
        inputs: { principal: 10_000_000, rate: 8, years: 10, perYear: 1 },
        expected: 21_589_249.97,
        tolerance: 1,
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const perYear = v('perYear');
    if (perYear <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          { vi: 'lãi kép', en: 'compound interest' },
          { vi: 'Số lần nhập lãi', en: 'Compounding frequency' },
          {
            vi: 'Chọn ít nhất 1 lần nhập lãi mỗi năm.',
            en: 'Choose at least 1 compounding per year.',
          },
        ),
      };
    }
    const growth = Math.pow(1 + v('rate') / 100 / perYear, perYear * v('years'));
    return ok(v('principal') * growth, '₫');
  },
};

/*
 * ── 5. Lãi tiền gửi có kỳ hạn ──────────────────────────────────────────────────────────
 */

export const LAI_TIEN_GUI: FormulaModule = {
  spec: {
    id: 'lai-tien-gui',
    categoryId: 'savings',
    name: { vi: 'Lãi tiền gửi có kỳ hạn', en: 'Term deposit interest' },
    description: {
      vi: 'Tiền lãi đơn nhận được cho một khoản gửi tiết kiệm có kỳ hạn.',
      en: 'The simple interest earned on a fixed-term savings deposit.',
    },
    latex: 'I = P \\times \\frac{r}{12} \\times T',
    expression: {
      vi: 'Tiền lãi = Số tiền gửi × Lãi suất năm ÷ 12 × Số tháng',
      en: 'Interest = Deposit amount × Annual rate ÷ 12 × Number of months',
    },
    symbols: [
      {
        latex: 'I',
        meaning: {
          vi: 'tiền lãi nhận được khi hết kỳ hạn, ₫',
          en: 'interest received at maturity, ₫',
        },
      },
      { latex: 'P', meaning: { vi: 'số tiền gửi, ₫', en: 'deposit amount, ₫' } },
      {
        latex: 'r',
        meaning: { vi: 'lãi suất / năm, nhập theo %', en: 'annual interest rate, in %' },
      },
      {
        latex: '12',
        meaning: {
          vi: 'số tháng một năm, dùng để đổi lãi suất năm thành lãi suất tháng',
          en: 'months in a year, used to turn the annual rate into a monthly one',
        },
      },
      { latex: 'T', meaning: { vi: 'kỳ hạn gửi, tháng', en: 'deposit term, months' } },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['lai tien gui', 'tiet kiem', 'ky han', 'lai don'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', { vi: 'Số tiền gửi', en: 'Deposit amount' }, '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
      }),
      sliderVar('rate', { vi: 'Lãi suất / năm', en: 'Interest rate / year' }, '%', 5.5, 0, 15, 0.1),
      sliderVar('months', { vi: 'Kỳ hạn', en: 'Term' }, 'tháng', 12, 1, 60, 1),
    ],
    explanation: {
      meaning: {
        vi: 'Số tiền lãi ngân hàng trả khi gửi tiết kiệm tới hết kỳ hạn.',
        en: 'The interest amount the bank pays when a savings deposit is held to full maturity.',
      },
      whenToUse: {
        vi: 'Khi so sánh các kỳ hạn gửi tại một hoặc nhiều ngân hàng.',
        en: 'When comparing deposit terms at one bank or across several banks.',
      },
      howToRead: {
        vi: 'Con số này là tổng tiền lãi cho cả kỳ hạn đã chọn, không phải mức lãi suất theo năm — so nó với mục tiêu tiết kiệm của bạn hoặc với đề nghị của một kỳ hạn hay ngân hàng khác.',
        en: 'This figure is the total interest for the whole term you chose, not an annual rate — compare it with your savings goal or with an offer for a different term or bank.',
      },
      commonMistakes: {
        vi: 'Rút trước hạn thì phần lớn ngân hàng chỉ trả lãi không kỳ hạn, thấp hơn nhiều con số này.',
        en: 'Withdrawing early: most banks then only pay the no-term rate, which is far lower than this figure.',
      },
    },
    example: {
      title: {
        vi: 'Gửi 1 tỷ ₫ kỳ hạn 6 tháng, lãi suất 8,1%/năm — năm 2026',
        en: 'Deposit 1 billion VND for a 6-month term at 8.1%/year — 2026',
      },
      inputs: { principal: 1_000_000_000, rate: 8.1, months: 6 },
      expected: 40_500_000,
      note: {
        vi: 'Công thức quy ước mỗi tháng 30 ngày nên cao hơn cách ngân hàng tính theo số ngày thực (180/365) chừng 600 nghìn ₫ — đủ để lệch với sổ tiết kiệm thật. Tiền lãi tiết kiệm được miễn thuế thu nhập cá nhân, khác cổ tức tiền mặt vốn chịu thuế suất 5%.',
        en: 'The formula assumes 30-day months, so it runs about 600 thousand VND above a bank’s actual-day calculation (180/365) — enough to differ from a real savings book. Savings interest is exempt from personal income tax, unlike cash dividends, which are taxed at 5%.',
      },
      source: {
        vi: 'Diễn đàn VOZ, thớt lãi suất tiết kiệm các ngân hàng năm 2026: kỳ hạn 6 tháng 8,1%/năm tại Cake by VPBank.',
        en: 'The VOZ forum thread on 2026 bank savings rates: a 6-month term at 8.1%/year with Cake by VPBank.',
      },
    },
    tests: [
      {
        name: 'gửi 100 triệu 12 tháng lãi 5,5%',
        inputs: { principal: 100_000_000, rate: 5.5, months: 12 },
        expected: 5_500_000,
        tolerance: 1,
      },
      {
        name: 'gấp đôi kỳ hạn thì gấp đôi tiền lãi',
        inputs: { principal: 100_000_000, rate: 5.5, months: 24 },
        expected: 11_000_000,
        tolerance: 1,
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => ok(((v('principal') * (v('rate') / 100)) / 12) * v('months'), '₫'),
};

/*
 * ── 6. Tiết kiệm theo mục tiêu ─────────────────────────────────────────────────────────
 */

export const TIET_KIEM_MUC_TIEU: FormulaModule = {
  spec: {
    id: 'tiet-kiem-muc-tieu',
    categoryId: 'savings',
    name: { vi: 'Tiết kiệm theo mục tiêu', en: 'Goal-based savings' },
    description: {
      vi: 'Số tiền cần gửi đều mỗi tháng để đạt một mục tiêu tài chính.',
      en: 'The equal monthly deposit needed to reach a financial goal.',
    },
    latex: 'PMT = \\frac{FV \\cdot i(r)}{(1+i)^n - 1}',
    expression: {
      vi: 'Gửi hằng tháng = Mục tiêu × Lãi suất kỳ ÷ [(1 + Lãi suất kỳ)^Số tháng − 1]',
      en: 'Monthly deposit = Goal × Period rate ÷ [(1 + Period rate)^Number of months − 1]',
    },
    symbols: [
      {
        latex: 'PMT',
        meaning: { vi: 'khoản gửi đều hằng tháng, ₫/tháng', en: 'equal monthly deposit, ₫/month' },
      },
      {
        latex: 'FV',
        meaning: {
          vi: 'số tiền mục tiêu muốn có ở cuối kỳ, ₫',
          en: 'target amount to have at the end of the period, ₫',
        },
      },
      {
        latex: 'i',
        meaning: {
          vi: 'lãi suất một kỳ tháng = lãi suất kỳ vọng / năm ÷ 12, dạng thập phân',
          en: 'monthly period rate = expected annual rate ÷ 12, as a decimal',
        },
      },
      {
        latex: 'r',
        meaning: {
          vi: 'lãi suất kỳ vọng mỗi năm (ô Lãi suất kỳ vọng / năm)',
          en: 'the expected rate per year (Expected rate per year field)',
        },
      },
      {
        latex: 'n',
        meaning: {
          vi: 'số tháng gửi, mỗi tháng một khoản',
          en: 'number of months, one deposit per month',
        },
      },
      {
        latex: '(1+i)^n - 1',
        meaning: {
          vi: 'tiền lãi kép mà 1 đồng sinh ra sau n kỳ',
          en: 'compound interest that 1 unit earns over n periods',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['tiet kiem muc tieu', 'goal savings', 'gui dinh ky'],
    resultUnit: '₫/tháng',
    variables: [
      numberVar('target', { vi: 'Số tiền mục tiêu', en: 'Target amount' }, '₫', 1_000_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Số tiền muốn có được vào cuối kỳ.',
          en: 'The amount you want to have by the end of the period.',
        },
      }),
      sliderVar(
        'rate',
        { vi: 'Lãi suất kỳ vọng / năm', en: 'Expected interest rate / year' },
        '%',
        6,
        0,
        20,
        0.1,
      ),
      sliderVar('months', { vi: 'Thời gian', en: 'Time' }, 'tháng', 60, 1, 360, 1),
    ],
    explanation: {
      meaning: {
        vi: 'Khoản gửi đều hằng tháng vừa đủ để tích luỹ tới con số mục tiêu.',
        en: 'The equal monthly deposit that is just enough to accumulate to the target amount.',
      },
      whenToUse: {
        vi: 'Khi đặt mục tiêu mua nhà, mua xe, hoặc lập quỹ dự phòng có thời hạn rõ ràng.',
        en: 'When setting a goal to buy a house, buy a car, or build an emergency fund with a clear deadline.',
      },
      howToRead: {
        vi: 'Kéo dài thời gian làm khoản gửi hằng tháng nhẹ đi rất nhanh, mạnh hơn là nâng lãi suất kỳ vọng.',
        en: 'Extending the time horizon lowers the monthly deposit much faster than raising the expected interest rate does.',
      },
      commonMistakes: {
        vi: 'Lấy mục tiêu chia đều cho số tháng rồi coi là đủ — cách đó bỏ qua phần tiền lãi tích luỹ.',
        en: 'Simply dividing the goal evenly by the number of months and assuming that is enough — this ignores the interest that accumulates.',
      },
    },
    example: {
      title: {
        vi: 'Vợ chồng trẻ muốn có 1 tỷ ₫ sau 48 tháng, lãi kỳ vọng 6,8%/năm — tháng 9/2026',
        en: 'A young couple aiming for 1 billion VND in 48 months at an expected 6.8%/year — September 2026',
      },
      inputs: { target: 1_000_000_000, rate: 6.8, months: 48 },
      expected: 18_186_897,
      note: {
        vi: 'Nếu tiền không sinh lãi thì phải để dành khoảng 20,83 triệu ₫ mỗi tháng, tức tiền lãi gánh hộ chừng 127 triệu ₫ trong bốn năm. Điều công thức không nói: mức để dành này đòi thu nhập hộ gia đình khoảng 25–30 triệu ₫/tháng và kỷ luật chi tiêu rất chặt.',
        en: 'With no interest at all the couple would have to set aside about 20.83 million VND a month, so the interest covers roughly 127 million VND over the four years. What the formula does not say: keeping this up calls for a household income of about 25–30 million VND a month and very tight spending discipline.',
      },
      source: {
        vi: 'Biểu lãi suất tiết kiệm trực tuyến 12 tháng nhóm Big4, VietNamNet 09/09/2026.',
        en: 'The Big4 banks’ 12-month online savings rate table, VietNamNet, 2026-09-09.',
      },
    },
    tests: [
      {
        name: '1 tỷ sau 60 tháng, lãi 6%',
        inputs: { target: 1_000_000_000, rate: 6, months: 60 },
        expected: 14_332_801.53,
        tolerance: 1,
      },
      {
        name: 'lãi suất 0% thì chia đều mục tiêu cho số tháng',
        inputs: { target: 1_200_000_000, rate: 0, months: 60 },
        expected: 20_000_000,
      },
      {
        // Cùng mã cảnh báo với hai công thức vay nợ ở trên: kỳ hạn 0 ở đâu cũng là chia cho 0.
        name: 'thời gian bằng 0 thì không có kế hoạch nào',
        inputs: { target: 1_000_000_000, rate: 6, months: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CORPORATE_FINANCE],
  },
  calc: (v) => {
    const n = Math.round(v('months'));
    if (n <= 0) {
      return {
        value: null,
        unit: '₫/tháng',
        warning: divideByZero(
          { vi: 'khoản gửi hằng tháng', en: 'the monthly deposit' },
          { vi: 'Thời gian', en: 'Time' },
          { vi: 'Nhập thời gian từ 1 tháng trở lên.', en: 'Enter a time of at least 1 month.' },
        ),
      };
    }

    const i = monthlyRate(v('rate'));
    if (i === 0) return ok(v('target') / n, '₫/tháng');

    return ok((v('target') * i) / (Math.pow(1 + i, n) - 1), '₫/tháng');
  },
};

/** Sáu công thức tài chính cá nhân của đợt này. */
export const PERSONAL_FORMULAS: ReadonlyArray<FormulaModule> = [
  TRA_GOP_NIEN_KIM,
  TRA_GOP_GOC_DEU,
  LICH_TRA_NO,
  LAI_KEP,
  LAI_TIEN_GUI,
  TIET_KIEM_MUC_TIEU,
];

/** Dùng ở màn WF-14 để lấy lịch trả nợ từ chính bộ ô nhập của công thức. */
export function amortisationFor(
  inputs: Readonly<Record<string, number>>,
): AmortisationRow[] | null {
  const v: CalcValues = (key) => inputs[key] ?? Number.NaN;
  return buildAmortisation(v('amount'), v('rate'), v('years'), methodOf(v('method')));
}
