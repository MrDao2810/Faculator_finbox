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

const loanAmount = sliderVar(
  'amount',
  { vi: 'Số tiền vay', en: 'Loan amount' },
  '₫',
  800_000_000,
  100_000_000,
  2_000_000_000,
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
    latex: 'EMI = \\frac{P \\cdot i \\,(1+i)^n}{(1+i)^n - 1}',
    expression: {
      vi: 'Trả hằng tháng = Số tiền vay × Lãi suất kỳ × (1 + Lãi suất kỳ)^Số kỳ ÷ [(1 + Lãi suất kỳ)^Số kỳ − 1]',
      en: 'Monthly payment = Loan amount × Period rate × (1 + Period rate)^Number of periods ÷ [(1 + Period rate)^Number of periods − 1]',
    },
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
        vi: 'Những năm đầu phần lớn tiền trả là lãi, nên trả trước hạn sớm tiết kiệm được nhiều hơn trả muộn.',
        en: 'In the early years most of the payment is interest, so paying off early saves more than paying off later.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn số tiền hằng tháng thấy vừa sức mà không cộng lại tổng lãi phải trả cả kỳ hạn.',
        en: 'Judging affordability only by the monthly amount, without adding up the total interest paid over the whole term.',
      },
    },
    example: {
      title: {
        vi: 'Vay 800 triệu ₫, 9,5%/năm, 20 năm',
        en: 'Borrow 800 million VND, 9.5%/year, 20 years',
      },
      inputs: { ...WF14 },
      expected: 7_457_049.5,
      note: {
        vi: 'Tổng phải trả khoảng 1.789,7 triệu ₫, trong đó lãi khoảng 989,7 triệu ₫.',
        en: 'Total repayment is about 1,789.7 million VND, of which about 989.7 million VND is interest.',
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
    latex: 'A_1 = \\frac{P}{n} + P \\cdot i',
    expression: {
      vi: 'Kỳ đầu = Số tiền vay ÷ Số kỳ + Số tiền vay × Lãi suất kỳ',
      en: 'First period = Loan amount ÷ Number of periods + Loan amount × Period rate',
    },
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
        vi: 'Vay 800 triệu ₫, 9,5%/năm, 20 năm — kỳ đầu',
        en: 'Borrow 800 million VND, 9.5%/year, 20 years — first period',
      },
      inputs: { ...WF14 },
      expected: 9_666_666.67,
      note: {
        vi: 'Kỳ cuối chỉ còn khoảng 3,36 triệu ₫.',
        en: 'The last period is only about 3.36 million VND.',
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
    name: { vi: 'Lịch trả nợ vay', en: 'Loan amortisation schedule' },
    description: {
      vi: 'Tổng số tiền lãi phải trả trong cả kỳ hạn, kèm bảng chi tiết từng kỳ.',
      en: 'The total interest payable over the whole term, with a detailed period-by-period table.',
    },
    latex: '\\text{Tổng lãi} = \\sum_{k=1}^{n} L_k',
    expression: {
      vi: 'Tổng lãi = Cộng tiền lãi của tất cả các kỳ',
      en: 'Total interest = Sum of the interest of every period',
    },
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
    tags: ['lich tra no', 'tong lai', 'bang tra no', 'amortisation'],
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
        vi: 'Với cùng lãi suất và kỳ hạn, gốc đều luôn cho tổng lãi thấp hơn niên kim, đổi lại kỳ đầu nặng hơn.',
        en: 'For the same rate and term, equal-principal always yields lower total interest than annuity, at the cost of a heavier first period.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn lãi suất mà bỏ qua kỳ hạn. Kéo dài kỳ hạn làm khoản trả hằng tháng nhẹ đi nhưng tổng lãi tăng mạnh.',
        en: 'Looking only at the interest rate while ignoring the term. Extending the term lowers the monthly payment but sharply raises total interest.',
      },
    },
    example: {
      title: {
        vi: 'Vay 800 triệu ₫, 9,5%/năm, 20 năm, niên kim',
        en: 'Borrow 800 million VND, 9.5%/year, 20 years, annuity',
      },
      inputs: { ...WF14, method: 1 },
      expected: 989_691_880.64,
      note: {
        vi: 'Tiền lãi xấp xỉ 124% số tiền đã vay.',
        en: 'The interest is roughly 124% of the amount borrowed.',
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
          { vi: 'lịch trả nợ', en: 'the amortisation schedule' },
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
        options: [
          { value: 1, label: { vi: 'Mỗi năm', en: 'Annually' } },
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
        vi: 'Gửi 10 triệu ₫, 8%/năm, nhập lãi hằng tháng, 10 năm',
        en: 'Deposit 10 million VND, 8%/year, compounded monthly, 10 years',
      },
      inputs: { principal: 10_000_000, rate: 8, years: 10, perYear: 12 },
      expected: 22_196_402.35,
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
    latex: 'I = P \\times \\frac{r}{100 \\times 12} \\times T',
    expression: {
      vi: 'Tiền lãi = Số tiền gửi × Lãi suất năm ÷ 12 × Số tháng',
      en: 'Interest = Deposit amount × Annual rate ÷ 12 × Number of months',
    },
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
        vi: 'Lãi tăng theo đúng tỷ lệ với số tiền gửi và với số tháng.',
        en: 'Interest scales exactly proportionally with the deposit amount and with the number of months.',
      },
      commonMistakes: {
        vi: 'Rút trước hạn thì phần lớn ngân hàng chỉ trả lãi không kỳ hạn, thấp hơn nhiều con số này.',
        en: 'Withdrawing early: most banks then only pay the no-term rate, which is far lower than this figure.',
      },
    },
    example: {
      title: {
        vi: 'Gửi 100 triệu ₫, 5,5%/năm, kỳ hạn 12 tháng',
        en: 'Deposit 100 million VND, 5.5%/year, 12-month term',
      },
      inputs: { principal: 100_000_000, rate: 5.5, months: 12 },
      expected: 5_500_000,
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
    latex: 'PMT = \\frac{FV \\cdot i}{(1+i)^n - 1}',
    expression: {
      vi: 'Gửi hằng tháng = Mục tiêu × Lãi suất kỳ ÷ [(1 + Lãi suất kỳ)^Số tháng − 1]',
      en: 'Monthly deposit = Goal × Period rate ÷ [(1 + Period rate)^Number of months − 1]',
    },
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
        vi: 'Muốn có 1 tỷ ₫ sau 5 năm, lãi kỳ vọng 6%/năm',
        en: 'Want 1 billion VND after 5 years, expected 6%/year',
      },
      inputs: { target: 1_000_000_000, rate: 6, months: 60 },
      expected: 14_332_801.53,
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
