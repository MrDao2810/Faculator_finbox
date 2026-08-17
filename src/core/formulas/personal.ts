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
  'Số tiền vay',
  '₫',
  800_000_000,
  100_000_000,
  2_000_000_000,
  10_000_000,
  {
    description: 'Dư nợ gốc ban đầu của khoản vay.',
  },
);

const loanRate = sliderVar('rate', 'Lãi suất / năm', '%', 9.5, 0, 18, 0.1, {
  description: 'Lãi suất danh nghĩa theo năm ghi trên hợp đồng.',
});

const loanYears = sliderVar('years', 'Kỳ hạn', 'năm', 20, 1, 30, 1, {
  description: 'Thời gian trả nợ. Mỗi năm 12 kỳ trả hằng tháng.',
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
    description: 'Số tiền cố định phải trả mỗi tháng cho khoản vay trả góp dư nợ giảm dần.',
    latex: 'EMI = \\frac{P \\cdot i \\,(1+i)^n}{(1+i)^n - 1}',
    expression:
      'Trả hằng tháng = Số tiền vay × Lãi suất kỳ × (1 + Lãi suất kỳ)^Số kỳ ÷ [(1 + Lãi suất kỳ)^Số kỳ − 1]',
    chartType: 'stackedBar',
    /*
     * Bóc tách KỲ ĐẦU, không phải cả kỳ hạn. Khoản trả hằng tháng không đổi suốt 240 kỳ nhưng
     * ruột của nó đổi từng kỳ, và chính câu `howToRead` bên dưới nói điều đó: "những năm đầu
     * phần lớn tiền trả là lãi". Hai cột này là hình của đúng câu ấy — ở kỳ 1 phần lãi cao nhất.
     */
    breakdown: [
      { key: 'firstPrincipal', sign: 1, shortLabel: 'Gốc kỳ đầu' },
      { key: 'firstInterest', sign: 1, shortLabel: 'Lãi kỳ đầu' },
    ],
    breakdownTotal: 'Trả kỳ đầu',
    level: 'basic',
    isFeatured: true,
    tags: ['tra gop', 'emi', 'nien kim', 'vay mua nha'],
    resultUnit: '₫/tháng',
    variables: [loanAmount, loanRate, loanYears],
    explanation: {
      meaning: 'Khoản tiền giống nhau ở mọi kỳ, trong đó phần lãi giảm dần còn phần gốc tăng dần.',
      whenToUse: 'Khi vay mua nhà hoặc vay tiêu dùng theo phương thức trả đều hằng tháng.',
      howToRead:
        'Những năm đầu phần lớn tiền trả là lãi, nên trả trước hạn sớm tiết kiệm được nhiều hơn trả muộn.',
      commonMistakes:
        'Chỉ nhìn số tiền hằng tháng thấy vừa sức mà không cộng lại tổng lãi phải trả cả kỳ hạn.',
    },
    example: {
      title: 'Vay 800 triệu ₫, 9,5%/năm, 20 năm',
      inputs: { ...WF14 },
      expected: 7_457_049.5,
      note: 'Tổng phải trả khoảng 1.789,7 triệu ₫, trong đó lãi khoảng 989,7 triệu ₫.',
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
        warning: divideByZero('khoản trả hằng tháng', 'Kỳ hạn', 'Nhập kỳ hạn ít nhất 1 năm.'),
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
    description: 'Số tiền phải trả ở kỳ đầu tiên khi trả gốc đều nhau mỗi tháng.',
    latex: 'A_1 = \\frac{P}{n} + P \\cdot i',
    expression: 'Kỳ đầu = Số tiền vay ÷ Số kỳ + Số tiền vay × Lãi suất kỳ',
    chartType: 'stackedBar',
    /* Kỳ đầu chính là kết quả của công thức này, nên hai chặng ghép lại đúng bằng nó. */
    breakdown: [
      { key: 'firstPrincipal', sign: 1, shortLabel: 'Gốc mỗi kỳ' },
      { key: 'firstInterest', sign: 1, shortLabel: 'Lãi kỳ đầu' },
    ],
    breakdownTotal: 'Trả kỳ đầu',
    level: 'basic',
    tags: ['goc deu', 'tra gop', 'du no giam dan'],
    resultUnit: '₫',
    variables: [loanAmount, loanRate, loanYears],
    explanation: {
      meaning:
        'Mỗi kỳ trả một phần gốc như nhau cộng tiền lãi trên dư nợ còn lại, nên số tiền giảm dần.',
      whenToUse: 'Khi thu nhập hiện tại đủ mạnh và muốn tổng lãi phải trả thấp hơn niên kim.',
      howToRead: 'Kỳ đầu nặng nhất — đây chính là con số cần cân đối với thu nhập hằng tháng.',
      commonMistakes:
        'So sánh kỳ đầu của gốc đều với khoản cố định của niên kim rồi kết luận gốc đều đắt hơn.',
    },
    example: {
      title: 'Vay 800 triệu ₫, 9,5%/năm, 20 năm — kỳ đầu',
      inputs: { ...WF14 },
      expected: 9_666_666.67,
      note: 'Kỳ cuối chỉ còn khoảng 3,36 triệu ₫.',
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
        warning: divideByZero('khoản trả kỳ đầu', 'Kỳ hạn', 'Nhập kỳ hạn ít nhất 1 năm.'),
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
  label: 'Phương thức trả',
  unit: '',
  type: 'buttonGroup',
  defaultValue: 1,
  level: 'basic',
  description: 'Niên kim trả đều mỗi kỳ; gốc đều trả gốc như nhau, lãi giảm dần.',
  options: [
    { value: 1, label: 'Niên kim' },
    { value: 2, label: 'Gốc đều' },
  ],
};

export const LICH_TRA_NO: FormulaModule = {
  spec: {
    id: 'lich-tra-no',
    categoryId: 'loans',
    name: { vi: 'Lịch trả nợ vay', en: 'Loan amortisation schedule' },
    description: 'Tổng số tiền lãi phải trả trong cả kỳ hạn, kèm bảng chi tiết từng kỳ.',
    latex: '\\text{Tổng lãi} = \\sum_{k=1}^{n} L_k',
    expression: 'Tổng lãi = Cộng tiền lãi của tất cả các kỳ',
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
      { key: 'totalPaid', sign: 1, shortLabel: 'Tổng phải trả' },
      { key: 'amount', sign: -1, shortLabel: 'Trừ gốc vay' },
    ],
    breakdownTotal: 'Tổng lãi',
    level: 'basic',
    isFeatured: true,
    tags: ['lich tra no', 'tong lai', 'bang tra no', 'amortisation'],
    resultUnit: '₫',
    variables: [loanAmount, loanRate, loanYears, loanMethod],
    explanation: {
      meaning: 'Toàn bộ tiền lãi phải trả cho ngân hàng từ kỳ đầu tới khi tất toán.',
      whenToUse: 'Khi so sánh hai phương thức trả, hoặc cân nhắc rút ngắn kỳ hạn.',
      howToRead:
        'Với cùng lãi suất và kỳ hạn, gốc đều luôn cho tổng lãi thấp hơn niên kim, đổi lại kỳ đầu nặng hơn.',
      commonMistakes:
        'Chỉ nhìn lãi suất mà bỏ qua kỳ hạn. Kéo dài kỳ hạn làm khoản trả hằng tháng nhẹ đi nhưng tổng lãi tăng mạnh.',
    },
    example: {
      title: 'Vay 800 triệu ₫, 9,5%/năm, 20 năm, niên kim',
      inputs: { ...WF14, method: 1 },
      expected: 989_691_880.64,
      note: 'Tiền lãi xấp xỉ 124% số tiền đã vay.',
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
        warning: divideByZero('lịch trả nợ', 'Kỳ hạn', 'Nhập kỳ hạn ít nhất 1 năm.'),
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
    description: 'Số tiền tích luỹ khi tiền lãi được nhập vào gốc theo định kỳ.',
    latex: 'A = P \\left(1 + \\frac{r}{n}\\right)^{n t}',
    expression:
      'Số tiền cuối = Gốc × (1 + Lãi suất năm ÷ Số lần nhập lãi)^(Số lần nhập lãi × Số năm)',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['lai kep', 'compound', 'tich luy'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', 'Số tiền gốc', '₫', 10_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Số tiền gửi ban đầu.',
      }),
      sliderVar('rate', 'Lãi suất / năm', '%', 8, 0, 20, 0.1, {
        description: 'Lãi suất danh nghĩa theo năm.',
      }),
      sliderVar('years', 'Thời gian', 'năm', 10, 1, 50, 1, {
        description: 'Số năm để tiền sinh lãi.',
      }),
      {
        key: 'perYear',
        label: 'Số lần nhập lãi / năm',
        unit: 'lần',
        type: 'select',
        defaultValue: 12,
        level: 'advanced',
        description: 'Nhập lãi càng dày thì số tiền cuối kỳ càng lớn.',
        options: [
          { value: 1, label: 'Mỗi năm' },
          { value: 4, label: 'Mỗi quý' },
          { value: 12, label: 'Mỗi tháng' },
          { value: 365, label: 'Mỗi ngày' },
        ],
      },
    ],
    explanation: {
      meaning: 'Tiền lãi của kỳ trước cũng sinh lãi ở kỳ sau, nên số dư tăng nhanh dần.',
      whenToUse: 'Khi ước tính khoản tiết kiệm dài hạn hoặc so sánh các kỳ hạn gửi.',
      howToRead:
        'Chênh lệch so với lãi đơn nhỏ ở vài năm đầu và rõ rệt sau mười năm — đó là điểm mạnh của thời gian.',
      commonMistakes:
        'Nhầm lãi suất danh nghĩa với lãi suất thực nhận. Nhập lãi 12 lần một năm cho kết quả cao hơn nhập lãi một lần.',
    },
    example: {
      title: 'Gửi 10 triệu ₫, 8%/năm, nhập lãi hằng tháng, 10 năm',
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
        warning: divideByZero('lãi kép', 'Số lần nhập lãi', 'Chọn ít nhất 1 lần nhập lãi mỗi năm.'),
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
    description: 'Tiền lãi đơn nhận được cho một khoản gửi tiết kiệm có kỳ hạn.',
    latex: 'I = P \\times \\frac{r}{100 \\times 12} \\times T',
    expression: 'Tiền lãi = Số tiền gửi × Lãi suất năm ÷ 12 × Số tháng',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['lai tien gui', 'tiet kiem', 'ky han', 'lai don'],
    resultUnit: '₫',
    variables: [
      numberVar('principal', 'Số tiền gửi', '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
      }),
      sliderVar('rate', 'Lãi suất / năm', '%', 5.5, 0, 15, 0.1),
      sliderVar('months', 'Kỳ hạn', 'tháng', 12, 1, 60, 1),
    ],
    explanation: {
      meaning: 'Số tiền lãi ngân hàng trả khi gửi tiết kiệm tới hết kỳ hạn.',
      whenToUse: 'Khi so sánh các kỳ hạn gửi tại một hoặc nhiều ngân hàng.',
      howToRead: 'Lãi tăng theo đúng tỷ lệ với số tiền gửi và với số tháng.',
      commonMistakes:
        'Rút trước hạn thì phần lớn ngân hàng chỉ trả lãi không kỳ hạn, thấp hơn nhiều con số này.',
    },
    example: {
      title: 'Gửi 100 triệu ₫, 5,5%/năm, kỳ hạn 12 tháng',
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
    description: 'Số tiền cần gửi đều mỗi tháng để đạt một mục tiêu tài chính.',
    latex: 'PMT = \\frac{FV \\cdot i}{(1+i)^n - 1}',
    expression: 'Gửi hằng tháng = Mục tiêu × Lãi suất kỳ ÷ [(1 + Lãi suất kỳ)^Số tháng − 1]',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['tiet kiem muc tieu', 'goal savings', 'gui dinh ky'],
    resultUnit: '₫/tháng',
    variables: [
      numberVar('target', 'Số tiền mục tiêu', '₫', 1_000_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Số tiền muốn có được vào cuối kỳ.',
      }),
      sliderVar('rate', 'Lãi suất kỳ vọng / năm', '%', 6, 0, 20, 0.1),
      sliderVar('months', 'Thời gian', 'tháng', 60, 1, 360, 1),
    ],
    explanation: {
      meaning: 'Khoản gửi đều hằng tháng vừa đủ để tích luỹ tới con số mục tiêu.',
      whenToUse: 'Khi đặt mục tiêu mua nhà, mua xe, hoặc lập quỹ dự phòng có thời hạn rõ ràng.',
      howToRead:
        'Kéo dài thời gian làm khoản gửi hằng tháng nhẹ đi rất nhanh, mạnh hơn là nâng lãi suất kỳ vọng.',
      commonMistakes:
        'Lấy mục tiêu chia đều cho số tháng rồi coi là đủ — cách đó bỏ qua phần tiền lãi tích luỹ.',
    },
    example: {
      title: 'Muốn có 1 tỷ ₫ sau 5 năm, lãi kỳ vọng 6%/năm',
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
          'khoản gửi hằng tháng',
          'Thời gian',
          'Nhập thời gian từ 1 tháng trở lên.',
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
