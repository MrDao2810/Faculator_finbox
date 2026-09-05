/**
 * Tầng DOMAIN — nhóm Định giá, nửa BỘI SỐ & SO SÁNH (gói WBS 5.2.x).
 *
 * Mười công thức: P/S, giá trị doanh nghiệp (EV), EV/EBITDA, EV/Sales, PEG,
 * vốn hoá thị trường, số Graham, NCAV trên cổ phiếu, tỷ suất lợi nhuận trên giá và giá mục tiêu.
 * Nửa còn lại của nhóm (chiết khấu dòng tiền, cổ tức) do đợt khác đảm nhận.
 *
 * P/E và P/B đã nằm ở nhóm 'fundamentals' theo wireframe WF-02/WF-03, nên không lặp lại
 * ở đây — nhóm này chỉ nhận các bội số chưa có.
 *
 * Quy ước đơn vị: các khoản mục báo cáo tài chính (vốn hoá, nợ, tiền mặt, doanh thu,
 * EBITDA, tài sản, nợ phải trả) nhập theo tỷ ₫; số cổ phiếu lưu hành theo triệu CP;
 * các con số trên mỗi cổ phiếu (giá, EPS, BVPS) theo ₫ — khớp thói quen đọc báo cáo
 * của nhà đầu tư Việt Nam và tránh ô nhập mười ba chữ số.
 *
 * Ca lỗi WF-15 của nhóm này: doanh thu bằng 0 (chia cho 0), EBITDA âm (bội số vô nghĩa),
 * tăng trưởng bằng 0 hoặc âm với PEG.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, numberVar } from './shared';

/*
 * ── Nguồn riêng của các công thức Graham (FR-04) ───────────────────────────────────────
 */

const SOURCE_INTELLIGENT_INVESTOR: FormulaSource = {
  label: {
    vi: 'Benjamin Graham — The Intelligent Investor (bản hiệu đính 2006, chú giải của Jason Zweig), chương 14–15',
    en: 'Benjamin Graham — The Intelligent Investor (2006 revised edition, annotated by Jason Zweig), chapters 14–15',
  },
};

const SOURCE_SECURITY_ANALYSIS: FormulaSource = {
  label: {
    vi: 'Benjamin Graham & David Dodd — Security Analysis (ấn bản 6, McGraw-Hill, 2008)',
    en: 'Benjamin Graham & David Dodd — Security Analysis (6th edition, McGraw-Hill, 2008)',
  },
};

/*
 * ── Biến dùng lại trong nhóm ───────────────────────────────────────────────────────────
 */

const sharePrice = numberVar('price', { vi: 'Giá thị trường', en: 'Market price' }, '₫', 92_000, {
  min: 0,
  max: 10_000_000,
  description: {
    vi: 'Giá đóng cửa gần nhất của một cổ phiếu.',
    en: 'The most recent closing price of one share.',
  },
});

const sharesOutstanding = numberVar(
  'shares',
  { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
  'triệu CP',
  118,
  {
    min: 0,
    max: 100_000,
    description: {
      vi: 'Số cổ phiếu đang lưu hành, tính bằng triệu.',
      en: 'Number of shares currently outstanding, in millions.',
    },
  },
);

const enterpriseValueInput = numberVar(
  'ev',
  { vi: 'Giá trị doanh nghiệp (EV)', en: 'Enterprise value (EV)' },
  'tỷ ₫',
  11_500,
  {
    min: -1_000_000,
    max: 10_000_000,
    description: {
      vi: 'Vốn hoá cộng nợ vay trừ tiền mặt — tính bằng công thức EV của nhóm này.',
      en: 'Market cap plus debt minus cash — calculated with this group’s EV formula.',
    },
  },
);

/*
 * ── 1. P/S — giá trên doanh thu ────────────────────────────────────────────────────────
 */

export const PS: FormulaModule = {
  spec: {
    id: 'ps',
    categoryId: 'valuation',
    name: { vi: 'P/S — hệ số giá trên doanh thu', en: 'Price to sales ratio' },
    description: {
      vi: 'Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng doanh thu của doanh nghiệp.',
      en: 'How much investors pay for each dong of the company’s revenue.',
    },
    latex: 'P/S = \\frac{P}{S_{ps}}',
    expression: {
      vi: 'P/S = Giá thị trường ÷ Doanh thu trên mỗi cổ phiếu',
      en: 'P/S = Market price ÷ Revenue per share',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ps', 'p s', 'gia tren doanh thu', 'boi so', 'dinh gia', 'price to sales'],
    resultUnit: 'lần',
    variables: [
      sharePrice,
      numberVar(
        'salesPerShare',
        { vi: 'Doanh thu trên mỗi cổ phiếu', en: 'Revenue per share' },
        '₫',
        45_000,
        {
          min: -1_000_000,
          max: 10_000_000,
          description: {
            vi: 'Doanh thu thuần bốn quý gần nhất chia cho số cổ phiếu đang lưu hành.',
            en: 'Net revenue over the last four quarters divided by shares outstanding.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Thị trường đang định giá mỗi đồng doanh thu của doanh nghiệp bằng bao nhiêu đồng vốn.',
        en: 'How much capital the market assigns to each dong of the company’s revenue.',
      },
      whenToUse: {
        vi: 'Khi doanh nghiệp chưa có lãi nên P/E không dùng được — công ty tăng trưởng, công ty mới niêm yết.',
        en: 'When the company has no profit yet so P/E does not work — growth companies, newly listed companies.',
      },
      howToRead: {
        vi: 'P/S thấp hơn các doanh nghiệp cùng ngành gợi ý cổ phiếu đang rẻ so với quy mô doanh thu. So khác ngành thì vô nghĩa vì biên lợi nhuận mỗi ngành một khác.',
        en: 'A P/S lower than industry peers suggests the stock is cheap relative to its revenue scale. Comparing across industries is meaningless, since profit margins differ by industry.',
      },
      commonMistakes: {
        vi: 'Quên rằng doanh thu lớn không đồng nghĩa có lãi — P/S thấp ở doanh nghiệp biên lợi nhuận mỏng không phải là món hời.',
        en: 'Forgetting that large revenue does not mean profit — a low P/S at a thin-margin company is not necessarily a bargain.',
      },
    },
    example: {
      title: {
        vi: 'Giá 92.000 ₫, doanh thu 45.000 ₫/CP',
        en: 'Price 92,000 ₫, revenue 45,000 ₫/share',
      },
      inputs: { price: 92_000, salesPerShare: 45_000 },
      expected: 2.04,
      note: {
        vi: 'Mỗi đồng doanh thu đang được trả giá hơn hai đồng.',
        en: 'Each dong of revenue is being priced at more than two dong.',
      },
    },
    tests: [
      {
        name: 'ca thường — giá 92.000 ₫, doanh thu 45.000 ₫/CP',
        inputs: { price: 92_000, salesPerShare: 45_000 },
        expected: 2.04,
      },
      {
        name: 'doanh thu bằng 0 — ca chia cho 0 của nhóm định giá',
        inputs: { price: 92_000, salesPerShare: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh thu âm là số liệu sai, không trả bội số âm',
        inputs: { price: 92_000, salesPerShare: -5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const sales = v('salesPerShare');

    if (sales === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          { vi: 'P/S', en: 'P/S' },
          { vi: 'Doanh thu trên mỗi cổ phiếu', en: 'revenue per share' },
          {
            vi: 'Nhập doanh thu khác 0 hoặc chọn kỳ báo cáo khác.',
            en: 'Enter a non-zero revenue or choose a different reporting period.',
          },
        ),
      };
    }

    if (sales < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'Doanh thu trên mỗi cổ phiếu không thể âm — số liệu đang nhập sai.',
            en: 'Revenue per share cannot be negative — the entered figure is wrong.',
          },
          {
            vi: 'Kiểm tra lại báo cáo kết quả kinh doanh, doanh thu thuần luôn từ 0 trở lên.',
            en: 'Check the income statement again — net revenue is always zero or positive.',
          },
        ),
      };
    }

    return ok(v('price') / sales, 'lần');
  },
};

/*
 * ── 2. EV — giá trị doanh nghiệp ───────────────────────────────────────────────────────
 */

export const EV: FormulaModule = {
  spec: {
    id: 'ev',
    categoryId: 'valuation',
    name: { vi: 'EV — giá trị doanh nghiệp', en: 'Enterprise value' },
    description: {
      vi: 'Số tiền cần bỏ ra để mua trọn doanh nghiệp, gồm cả nợ và trừ đi tiền mặt.',
      en: 'The amount needed to buy the whole company, including its debt and net of its cash.',
    },
    latex: 'EV = \\text{Vốn hoá} + \\text{Nợ vay} - \\text{Tiền mặt}',
    expression: {
      vi: 'EV = Vốn hoá thị trường + Nợ vay − Tiền và tương đương tiền',
      en: 'EV = Market capitalization + Debt − Cash and cash equivalents',
    },
    chartType: 'waterfall',
    level: 'basic',
    tags: ['ev', 'gia tri doanh nghiep', 'enterprise value', 'von hoa', 'no vay'],
    resultUnit: 'tỷ ₫',
    variables: [
      numberVar(
        'marketCap',
        { vi: 'Vốn hoá thị trường', en: 'Market capitalization' },
        'tỷ ₫',
        9_200,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Giá thị trường nhân với số cổ phiếu đang lưu hành.',
            en: 'Market price multiplied by shares outstanding.',
          },
        },
      ),
      numberVar('totalDebt', { vi: 'Nợ vay', en: 'Debt' }, 'tỷ ₫', 3_500, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tổng nợ vay ngắn hạn và dài hạn trên bảng cân đối kế toán.',
          en: 'Total short-term and long-term debt on the balance sheet.',
        },
      }),
      numberVar(
        'cash',
        { vi: 'Tiền và tương đương tiền', en: 'Cash and cash equivalents' },
        'tỷ ₫',
        1_200,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Tiền mặt, tiền gửi và các khoản tương đương tiền.',
            en: 'Cash, deposits, and cash-equivalent items.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Giá mua trọn doanh nghiệp theo góc nhìn người thâu tóm: trả vốn hoá cho cổ đông, gánh thay nợ vay, rồi được cầm luôn tiền mặt trong két.',
        en: 'The price of buying the whole company from an acquirer’s point of view: pay shareholders the market cap, take on its debt, and keep the cash already in the vault.',
      },
      whenToUse: {
        vi: 'Khi so sánh các doanh nghiệp có cơ cấu nợ khác nhau — vốn hoá bỏ qua nợ nên dễ đánh lừa.',
        en: 'When comparing companies with different debt structures — market cap ignores debt and is easily misleading.',
      },
      howToRead: {
        vi: 'EV lớn hơn vốn hoá nghĩa là doanh nghiệp vay nhiều hơn tiền mặt đang giữ. EV âm là hiếm — tiền mặt vượt cả vốn hoá cộng nợ.',
        en: 'EV greater than market cap means the company owes more debt than the cash it holds. A negative EV is rare — cash exceeds market cap plus debt.',
      },
      commonMistakes: {
        vi: 'Lấy vốn hoá làm giá mua doanh nghiệp mà quên khoản nợ người mua phải gánh — hai công ty cùng vốn hoá có thể đắt rẻ rất khác nhau.',
        en: 'Treating market cap as the purchase price and forgetting the debt the buyer must take on — two companies with the same market cap can be very differently priced.',
      },
    },
    example: {
      title: {
        vi: 'Vốn hoá 9.200 tỷ ₫, nợ vay 3.500 tỷ ₫, tiền mặt 1.200 tỷ ₫',
        en: 'Market cap 9,200 billion ₫, debt 3,500 billion ₫, cash 1,200 billion ₫',
      },
      inputs: { marketCap: 9_200, totalDebt: 3_500, cash: 1_200 },
      expected: 11_500,
      note: {
        vi: 'Muốn mua trọn doanh nghiệp này thực chất phải bỏ ra 11.500 tỷ ₫.',
        en: 'Buying the whole company actually requires 11,500 billion ₫.',
      },
    },
    tests: [
      {
        name: 'ca thường — vốn hoá 9.200, nợ 3.500, tiền mặt 1.200',
        inputs: { marketCap: 9_200, totalDebt: 3_500, cash: 1_200 },
        expected: 11_500,
      },
      {
        name: 'doanh nghiệp nhiều tiền mặt thì EV thấp hơn vốn hoá',
        inputs: { marketCap: 5_000, totalDebt: 200, cash: 1_500 },
        expected: 3_700,
      },
      {
        name: 'vốn hoá bằng 0 thì không có doanh nghiệp để định giá',
        inputs: { marketCap: 0, totalDebt: 3_500, cash: 1_200 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
    /*
     * Ba chặng của thác nước chính là ba ô nhập — không cần `extras`, không sửa `calc`.
     * Đây cũng là lý do `ev` được chọn làm công thức chứng minh cho renderer bóc tách.
     */
    breakdown: [
      { key: 'marketCap', sign: 1, shortLabel: { vi: 'Vốn hoá', en: 'Market cap' } },
      { key: 'totalDebt', sign: 1, shortLabel: { vi: 'Nợ vay', en: 'Debt' } },
      { key: 'cash', sign: -1, shortLabel: { vi: 'Tiền mặt', en: 'Cash' } },
    ],
  },
  calc: (v) => {
    const marketCap = v('marketCap');

    if (marketCap <= 0) {
      return {
        value: null,
        unit: 'tỷ ₫',
        warning: meaningless(
          {
            vi: 'Vốn hoá bằng 0 nghĩa là chưa có giá thị trường để tính giá trị doanh nghiệp.',
            en: 'Zero market cap means there is no market price yet to calculate enterprise value.',
          },
          {
            vi: 'Tính vốn hoá trước bằng công thức Vốn hoá thị trường trong nhóm này.',
            en: 'Calculate market cap first, using the Market capitalization formula in this group.',
          },
        ),
      };
    }

    return ok(marketCap + v('totalDebt') - v('cash'), 'tỷ ₫');
  },
};

/*
 * ── 3. EV/EBITDA ───────────────────────────────────────────────────────────────────────
 */

export const EV_EBITDA: FormulaModule = {
  spec: {
    id: 'ev-ebitda',
    categoryId: 'valuation',
    name: { vi: 'EV/EBITDA', en: 'EV to EBITDA ratio' },
    description: {
      vi: 'Giá mua trọn doanh nghiệp gấp bao nhiêu lần lợi nhuận trước lãi vay, thuế và khấu hao.',
      en: 'How many times the price to buy the whole company sits above earnings before interest, tax, and depreciation.',
    },
    latex: 'EV/EBITDA = \\frac{EV}{EBITDA}',
    expression: {
      vi: 'EV/EBITDA = Giá trị doanh nghiệp ÷ EBITDA',
      en: 'EV/EBITDA = Enterprise value ÷ EBITDA',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    isFeatured: true,
    tags: ['ev ebitda', 'boi so', 'dinh gia', 'khau hao', 'enterprise multiple'],
    resultUnit: 'lần',
    variables: [
      enterpriseValueInput,
      numberVar('ebitda', { vi: 'EBITDA', en: 'EBITDA' }, 'tỷ ₫', 1_450, {
        min: -1_000_000,
        max: 10_000_000,
        description: {
          vi: 'Lợi nhuận trước lãi vay, thuế và khấu hao, bốn quý gần nhất.',
          en: 'Earnings before interest, tax, and depreciation over the last four quarters.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Số năm dòng lợi nhuận hoạt động cần có để hoàn lại toàn bộ giá mua doanh nghiệp, nếu EBITDA giữ nguyên.',
        en: 'How many years of operating earnings it would take to recover the full purchase price, if EBITDA stays constant.',
      },
      whenToUse: {
        vi: 'So sánh định giá giữa các doanh nghiệp có mức nợ và chính sách khấu hao khác nhau — chỗ mà P/E dễ méo.',
        en: 'Comparing valuations across companies with different debt levels and depreciation policies — a spot where P/E is easily distorted.',
      },
      howToRead: {
        vi: 'Thấp hơn trung bình ngành gợi ý đang rẻ. Nhưng EBITDA chưa trừ chi đầu tư, nên ngành thâm dụng vốn thường có bội số thấp một cách tự nhiên.',
        en: 'Lower than the industry average suggests the stock is cheap. But EBITDA has not deducted capital expenditure, so capital-intensive industries naturally carry lower multiples.',
      },
      commonMistakes: {
        vi: 'Coi EBITDA là dòng tiền thật — nó bỏ qua chi đầu tư và thay đổi vốn lưu động, dùng cho ngành nặng tài sản dễ lạc quan quá mức.',
        en: 'Treating EBITDA as real cash flow — it ignores capital expenditure and working-capital changes, so using it for asset-heavy industries is easy to be too optimistic about.',
      },
    },
    example: {
      title: {
        vi: 'EV 11.500 tỷ ₫, EBITDA 1.450 tỷ ₫',
        en: 'EV 11,500 billion ₫, EBITDA 1,450 billion ₫',
      },
      inputs: { ev: 11_500, ebitda: 1_450 },
      expected: 7.93,
      note: {
        vi: 'Khoảng 8 năm EBITDA để hoàn lại giá mua trọn doanh nghiệp.',
        en: 'Roughly 8 years of EBITDA to recover the full purchase price.',
      },
    },
    tests: [
      {
        name: 'ca thường — EV 11.500, EBITDA 1.450',
        inputs: { ev: 11_500, ebitda: 1_450 },
        expected: 7.93,
      },
      {
        name: 'EBITDA bằng 0 — chia cho 0',
        inputs: { ev: 11_500, ebitda: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'EBITDA âm thì bội số vô nghĩa — ca WF-15 của nhóm',
        inputs: { ev: 11_500, ebitda: -300 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const ebitda = v('ebitda');

    if (ebitda === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          { vi: 'EV/EBITDA', en: 'EV/EBITDA' },
          { vi: 'EBITDA', en: 'EBITDA' },
          {
            vi: 'Nhập EBITDA khác 0 hoặc chọn kỳ báo cáo khác.',
            en: 'Enter a non-zero EBITDA or choose a different reporting period.',
          },
        ),
      };
    }

    if (ebitda < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'EV/EBITDA không có ý nghĩa khi EBITDA âm — hoạt động kinh doanh đang lỗ trước cả khấu hao.',
            en: 'EV/EBITDA is meaningless when EBITDA is negative — the business is losing money even before depreciation.',
          },
          {
            vi: 'Dùng EV/Sales hoặc P/B để thay thế.',
            en: 'Use EV/Sales or P/B instead.',
          },
        ),
      };
    }

    return ok(v('ev') / ebitda, 'lần');
  },
};

/*
 * ── 4. EV/Sales ────────────────────────────────────────────────────────────────────────
 */

export const EV_SALES: FormulaModule = {
  spec: {
    id: 'ev-sales',
    categoryId: 'valuation',
    name: { vi: 'EV/Sales — EV trên doanh thu', en: 'EV to sales ratio' },
    description: {
      vi: 'Giá mua trọn doanh nghiệp gấp bao nhiêu lần doanh thu một năm.',
      en: 'How many times the price to buy the whole company sits above one year of revenue.',
    },
    latex: 'EV/Sales = \\frac{EV}{\\text{Doanh thu}}',
    expression: {
      vi: 'EV/Sales = Giá trị doanh nghiệp ÷ Doanh thu thuần',
      en: 'EV/Sales = Enterprise value ÷ Net revenue',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['ev sales', 'ev doanh thu', 'boi so', 'dinh gia', 'ev to sales'],
    resultUnit: 'lần',
    variables: [
      enterpriseValueInput,
      numberVar('revenue', { vi: 'Doanh thu thuần', en: 'Net revenue' }, 'tỷ ₫', 9_800, {
        min: -1_000_000,
        max: 10_000_000,
        description: {
          vi: 'Doanh thu thuần bốn quý gần nhất trên báo cáo kết quả kinh doanh.',
          en: 'Net revenue over the last four quarters on the income statement.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi đồng doanh thu đang được định giá bằng bao nhiêu đồng, đã tính cả phần nợ người mua phải gánh.',
        en: 'How much each dong of revenue is being valued at, including the debt the buyer must take on.',
      },
      whenToUse: {
        vi: 'Khi cả lợi nhuận lẫn EBITDA đều âm nên các bội số lợi nhuận không dùng được, hoặc khi so doanh nghiệp có cơ cấu nợ khác nhau.',
        en: 'When both earnings and EBITDA are negative so earnings multiples do not work, or when comparing companies with different debt structures.',
      },
      howToRead: {
        vi: 'So trong cùng ngành: thấp hơn trung bình gợi ý đang rẻ so với quy mô kinh doanh. Ngành biên lợi nhuận cao thì EV/Sales cao là bình thường.',
        en: 'Compare within the same industry: lower than average suggests cheap relative to business scale. A high-margin industry naturally carries a higher EV/Sales.',
      },
      commonMistakes: {
        vi: 'Dùng vốn hoá thay cho EV ở tử số — như vậy hai doanh nghiệp cùng doanh thu nhưng nợ khác hẳn nhau lại trông giống nhau.',
        en: 'Using market cap instead of EV in the numerator — this makes two companies with the same revenue but very different debt look alike.',
      },
    },
    example: {
      title: {
        vi: 'EV 11.500 tỷ ₫, doanh thu 9.800 tỷ ₫',
        en: 'EV 11,500 billion ₫, revenue 9,800 billion ₫',
      },
      inputs: { ev: 11_500, revenue: 9_800 },
      expected: 1.17,
    },
    tests: [
      {
        name: 'ca thường — EV 11.500, doanh thu 9.800',
        inputs: { ev: 11_500, revenue: 9_800 },
        expected: 1.17,
      },
      {
        name: 'doanh thu bằng 0 — chia cho 0, ca WF-15 của nhóm',
        inputs: { ev: 11_500, revenue: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh thu âm là số liệu sai',
        inputs: { ev: 11_500, revenue: -100 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const revenue = v('revenue');

    if (revenue === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          { vi: 'EV/Sales', en: 'EV/Sales' },
          { vi: 'Doanh thu thuần', en: 'net revenue' },
          {
            vi: 'Nhập doanh thu khác 0 hoặc chọn kỳ báo cáo khác.',
            en: 'Enter a non-zero revenue or choose a different reporting period.',
          },
        ),
      };
    }

    if (revenue < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'Doanh thu thuần không thể âm — số liệu đang nhập sai.',
            en: 'Net revenue cannot be negative — the entered figure is wrong.',
          },
          {
            vi: 'Kiểm tra lại báo cáo kết quả kinh doanh, doanh thu thuần luôn từ 0 trở lên.',
            en: 'Check the income statement again — net revenue is always zero or positive.',
          },
        ),
      };
    }

    return ok(v('ev') / revenue, 'lần');
  },
};

/*
 * ── 5. PEG ─────────────────────────────────────────────────────────────────────────────
 */

export const PEG: FormulaModule = {
  spec: {
    id: 'peg',
    categoryId: 'valuation',
    name: { vi: 'PEG — P/E trên tăng trưởng', en: 'Price/earnings to growth ratio' },
    description: {
      vi: 'P/E đã chia cho tốc độ tăng trưởng lợi nhuận, để so cổ phiếu tăng trưởng với nhau.',
      en: 'P/E divided by the earnings growth rate, so growth stocks can be compared with each other.',
    },
    latex: 'PEG = \\frac{P/E}{g}',
    expression: {
      vi: 'PEG = P/E ÷ Tăng trưởng lợi nhuận kỳ vọng (%/năm)',
      en: 'PEG = P/E ÷ Expected earnings growth (%/year)',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['peg', 'tang truong', 'boi so', 'dinh gia', 'growth'],
    resultUnit: 'lần',
    variables: [
      numberVar('pe', { vi: 'P/E hiện tại', en: 'Current P/E' }, 'lần', 15.2, {
        min: 0,
        max: 1_000,
        description: {
          vi: 'Hệ số giá trên lợi nhuận — tính bằng công thức P/E của nhóm Chỉ số DN.',
          en: 'The price-to-earnings ratio — calculated with the P/E formula in the Company ratios group.',
        },
      }),
      numberVar(
        'growth',
        { vi: 'Tăng trưởng lợi nhuận kỳ vọng', en: 'Expected earnings growth' },
        '%/năm',
        12,
        {
          min: -100,
          max: 200,
          description: {
            vi: 'Tốc độ tăng EPS dự kiến vài năm tới, nhập 12 nghĩa là 12%/năm.',
            en: 'Expected EPS growth rate over the next few years — entering 12 means 12%/year.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'P/E cao có xứng đáng hay không tuỳ vào tốc độ tăng lợi nhuận — PEG đưa hai thứ đó về một con số.',
        en: 'Whether a high P/E is justified depends on the earnings growth rate — PEG folds both into one number.',
      },
      whenToUse: {
        vi: 'So sánh các cổ phiếu tăng trưởng có P/E chênh nhau nhiều, khi P/E đứng một mình dễ kết luận nhầm là đắt.',
        en: 'Comparing growth stocks whose P/E differs a lot, where P/E alone can wrongly look expensive.',
      },
      howToRead: {
        vi: 'Quanh 1 thường coi là hợp lý: P/E tương xứng tốc độ tăng trưởng. Dưới 1 gợi ý rẻ so với tăng trưởng, trên 2 là đắt trừ khi tăng trưởng rất chắc chắn.',
        en: 'Around 1 is usually considered fair: P/E matches the growth rate. Below 1 suggests cheap relative to growth, above 2 is expensive unless the growth is very certain.',
      },
      commonMistakes: {
        vi: 'Dùng con số tăng trưởng quá lạc quan — PEG nhạy với g hơn với P/E, dự phóng sai vài điểm phần trăm là kết luận đảo chiều.',
        en: 'Using an overly optimistic growth figure — PEG is more sensitive to g than to P/E, so a few percentage points of forecast error can flip the conclusion.',
      },
    },
    example: {
      title: {
        vi: 'P/E 15,2 lần, tăng trưởng kỳ vọng 12%/năm',
        en: 'P/E 15.2x, expected growth 12%/year',
      },
      inputs: { pe: 15.2, growth: 12 },
      expected: 1.27,
      note: {
        vi: 'Trên 1 một chút — định giá tương xứng với tốc độ tăng trưởng.',
        en: 'A little above 1 — the valuation is roughly in line with the growth rate.',
      },
    },
    tests: [
      {
        name: 'ca thường — P/E 15,2 và tăng trưởng 12%',
        inputs: { pe: 15.2, growth: 12 },
        expected: 1.27,
      },
      {
        name: 'tăng trưởng bằng 0 — chia cho 0, ca WF-15 của nhóm',
        inputs: { pe: 15.2, growth: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tăng trưởng âm thì PEG vô nghĩa',
        inputs: { pe: 15.2, growth: -5 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'P/E bằng 0 thì không có gì để so với tăng trưởng',
        inputs: { pe: 0, growth: 12 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const pe = v('pe');
    const growth = v('growth');

    if (pe <= 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'PEG cần một P/E dương — P/E bằng 0 hoặc âm nghĩa là chính P/E đang không dùng được.',
            en: 'PEG needs a positive P/E — a P/E of zero or negative means P/E itself is unusable.',
          },
          {
            vi: 'Tính lại P/E trước; doanh nghiệp đang lỗ thì dùng P/B hoặc P/S.',
            en: 'Recalculate P/E first; for a loss-making company use P/B or P/S instead.',
          },
        ),
      };
    }

    if (growth === 0) {
      return {
        value: null,
        unit: 'lần',
        warning: divideByZero(
          { vi: 'PEG', en: 'PEG' },
          { vi: 'Tăng trưởng lợi nhuận kỳ vọng', en: 'expected earnings growth' },
          {
            vi: 'PEG chỉ dành cho doanh nghiệp có tăng trưởng. Không tăng trưởng thì so thẳng P/E với ngành.',
            en: 'PEG is only for growing companies. Without growth, compare P/E directly with the industry instead.',
          },
        ),
      };
    }

    if (growth < 0) {
      return {
        value: null,
        unit: 'lần',
        warning: meaningless(
          {
            vi: 'PEG không có ý nghĩa khi lợi nhuận dự kiến đi lùi — chia cho tăng trưởng âm cho ra số âm không diễn giải được.',
            en: 'PEG is meaningless when earnings are expected to decline — dividing by negative growth gives a negative number with no sensible interpretation.',
          },
          {
            vi: 'Với doanh nghiệp suy giảm, so thẳng P/E với ngành hoặc dùng P/B.',
            en: 'For a declining company, compare P/E directly with the industry or use P/B instead.',
          },
        ),
      };
    }

    return ok(pe / growth, 'lần');
  },
};

/*
 * ── 6. Vốn hoá thị trường ──────────────────────────────────────────────────────────────
 */

export const VON_HOA: FormulaModule = {
  spec: {
    id: 'von-hoa-thi-truong',
    categoryId: 'valuation',
    name: { vi: 'Vốn hoá thị trường', en: 'Market capitalization' },
    description: {
      vi: 'Tổng giá trị thị trường của toàn bộ cổ phiếu đang lưu hành.',
      en: 'The total market value of all outstanding shares.',
    },
    latex: '\\text{Vốn hoá} = P \\times N',
    expression: {
      vi: 'Vốn hoá = Giá thị trường × Số cổ phiếu lưu hành',
      en: 'Market cap = Market price × Shares outstanding',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['von hoa', 'market cap', 'quy mo', 'gia tri thi truong'],
    resultUnit: 'tỷ ₫',
    variables: [sharePrice, sharesOutstanding],
    explanation: {
      meaning: {
        vi: 'Số tiền cần có để mua hết cổ phiếu của doanh nghiệp theo giá thị trường hiện tại.',
        en: 'The amount of money needed to buy every share of the company at its current market price.',
      },
      whenToUse: {
        vi: 'Xếp cỡ doanh nghiệp — vốn hoá lớn, vừa, nhỏ — và làm đầu vào cho EV cùng các bội số so sánh.',
        en: 'Sizing a company — large-cap, mid-cap, small-cap — and as an input for EV and comparable multiples.',
      },
      howToRead: {
        vi: 'Vốn hoá là giá thị trường gán cho phần vốn cổ đông, chưa tính nợ. Doanh nghiệp lớn thường biến động giá êm hơn doanh nghiệp vốn hoá nhỏ.',
        en: 'Market cap is the market value assigned to shareholders’ equity, not counting debt. Large companies tend to have smoother price swings than small-cap ones.',
      },
      commonMistakes: {
        vi: 'Nhầm vốn hoá với giá mua trọn doanh nghiệp — người mua còn phải gánh nợ vay, con số đó là EV.',
        en: 'Confusing market cap with the price to buy the whole company — the buyer must also take on debt, which is what EV captures.',
      },
    },
    example: {
      title: {
        vi: 'Giá 92.000 ₫, 118 triệu cổ phiếu lưu hành',
        en: 'Price 92,000 ₫, 118 million shares outstanding',
      },
      inputs: { price: 92_000, shares: 118 },
      expected: 10_856,
      note: {
        vi: 'Thuộc nhóm vốn hoá lớn trên sàn HOSE.',
        en: 'Falls in the large-cap group on the HOSE exchange.',
      },
    },
    tests: [
      {
        name: 'ca thường — giá 92.000 ₫ nhân 118 triệu CP',
        inputs: { price: 92_000, shares: 118 },
        expected: 10_856,
      },
      {
        name: 'giá 25.000 ₫ với 500 triệu CP',
        inputs: { price: 25_000, shares: 500 },
        expected: 12_500,
      },
      {
        name: 'số cổ phiếu bằng 0 thì không có gì để định giá, không trả 0',
        inputs: { price: 92_000, shares: 0 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const price = v('price');
    const shares = v('shares');

    if (shares <= 0) {
      return {
        value: null,
        unit: 'tỷ ₫',
        warning: meaningless(
          {
            vi: 'Số cổ phiếu lưu hành bằng 0 nghĩa là chưa có doanh nghiệp để tính vốn hoá.',
            en: 'Zero shares outstanding means there is no company to calculate a market cap for.',
          },
          {
            vi: 'Nhập số cổ phiếu đang lưu hành, xem ở báo cáo thường niên hoặc trang công bố thông tin.',
            en: 'Enter the number of shares outstanding, found in the annual report or disclosure filings.',
          },
        ),
      };
    }

    if (price <= 0) {
      return {
        value: null,
        unit: 'tỷ ₫',
        warning: meaningless(
          {
            vi: 'Giá thị trường bằng 0 thì vốn hoá không phản ánh giá trị nào.',
            en: 'A market price of zero means market cap does not reflect any real value.',
          },
          {
            vi: 'Nhập giá đóng cửa gần nhất của cổ phiếu.',
            en: 'Enter the most recent closing price of the share.',
          },
        ),
      };
    }

    // Giá (₫) × số CP (triệu) ra triệu ₫; chia 1.000 để về tỷ ₫.
    return ok((price * shares) / 1_000, 'tỷ ₫');
  },
};

/*
 * ── 7. Số Graham ───────────────────────────────────────────────────────────────────────
 */

export const SO_GRAHAM: FormulaModule = {
  spec: {
    id: 'so-graham',
    categoryId: 'valuation',
    name: { vi: 'Số Graham', en: 'Graham number' },
    description: {
      vi: 'Mức giá tối đa Benjamin Graham cho là hợp lý, dựa trên EPS và giá trị sổ sách.',
      en: 'The maximum price Benjamin Graham considered reasonable, based on EPS and book value.',
    },
    latex: '\\text{Graham} = \\sqrt{22{,}5 \\times EPS \\times BVPS}',
    expression: {
      vi: 'Số Graham = Căn bậc hai của (22,5 × EPS × Giá trị sổ sách mỗi cổ phiếu)',
      en: 'Graham number = Square root of (22.5 × EPS × Book value per share)',
    },
    chartType: 'sensitivity',
    level: 'advanced',
    tags: ['so graham', 'graham number', 'gia tri noi tai', 'dau tu gia tri', 'value investing'],
    resultUnit: '₫',
    variables: [
      numberVar(
        'eps',
        { vi: 'EPS — lợi nhuận trên mỗi cổ phiếu', en: 'EPS — earnings per share' },
        '₫',
        6_050,
        {
          min: -1_000_000,
          max: 1_000_000,
          description: {
            vi: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
            en: 'Net profit after tax divided by shares outstanding.',
          },
        },
      ),
      numberVar('bvps', { vi: 'Giá trị sổ sách / CP', en: 'Book value / share' }, '₫', 24_800, {
        min: -1_000_000,
        max: 10_000_000,
        description: {
          vi: 'Vốn chủ sở hữu chia cho số cổ phiếu đang lưu hành.',
          en: 'Shareholders’ equity divided by shares outstanding.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Trần giá gộp hai giới hạn Graham đặt ra — P/E không quá 15 và P/B không quá 1,5 (15 × 1,5 = 22,5).',
        en: 'A price ceiling combining two limits Graham set — P/E no more than 15 and P/B no more than 1.5 (15 × 1.5 = 22.5).',
      },
      whenToUse: {
        vi: 'Sàng lọc nhanh cổ phiếu theo trường phái đầu tư giá trị cổ điển: giá dưới số Graham mới xem tiếp.',
        en: 'A quick classical value-investing screen: only stocks priced below the Graham number are worth a closer look.',
      },
      howToRead: {
        vi: 'Giá thị trường thấp hơn số Graham gợi ý cổ phiếu chưa đắt theo chuẩn Graham. Đây là bộ lọc bảo thủ, dễ bỏ sót doanh nghiệp tăng trưởng nhanh.',
        en: 'A market price below the Graham number suggests the stock is not yet expensive by Graham’s standard. This is a conservative filter that can easily miss fast-growing companies.',
      },
      commonMistakes: {
        vi: 'Áp cho doanh nghiệp tăng trưởng hoặc công ty công nghệ ít tài sản hữu hình — chuẩn 22,5 sinh ra cho doanh nghiệp truyền thống ổn định.',
        en: 'Applying it to growth companies or tech companies with few tangible assets — the 22.5 standard was designed for stable, traditional businesses.',
      },
    },
    example: {
      title: {
        vi: 'EPS 6.050 ₫, giá trị sổ sách 24.800 ₫/CP',
        en: 'EPS 6,050 ₫, book value 24,800 ₫/share',
      },
      inputs: { eps: 6_050, bvps: 24_800 },
      expected: 58_102.5,
      note: {
        vi: 'Giá thị trường 92.000 ₫ đang cao hơn hẳn mức trần theo chuẩn Graham.',
        en: 'The market price of 92,000 ₫ is well above the Graham ceiling.',
      },
    },
    tests: [
      {
        name: 'ca thường — EPS 6.050 ₫ và BVPS 24.800 ₫',
        inputs: { eps: 6_050, bvps: 24_800 },
        expected: 58_102.5,
        tolerance: 1,
      },
      {
        name: 'EPS 3.000 ₫ và BVPS 15.000 ₫',
        inputs: { eps: 3_000, bvps: 15_000 },
        expected: 31_819.81,
        tolerance: 1,
      },
      {
        name: 'doanh nghiệp lỗ thì không có số Graham',
        inputs: { eps: -1_200, bvps: 24_800 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'vốn chủ sở hữu âm cũng không tính được',
        inputs: { eps: 6_050, bvps: -5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_INTELLIGENT_INVESTOR, SOURCE_SECURITY_ANALYSIS],
  },
  calc: (v) => {
    const eps = v('eps');
    const bvps = v('bvps');

    if (eps <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Số Graham cần EPS dương — doanh nghiệp đang lỗ hoặc không có lợi nhuận thì căn bậc hai không có nghĩa.',
            en: 'The Graham number needs a positive EPS — for a loss-making or unprofitable company, the square root has no meaning.',
          },
          {
            vi: 'Dùng NCAV trên cổ phiếu hoặc P/B để đánh giá doanh nghiệp đang lỗ.',
            en: 'Use net current asset value per share or P/B to assess a loss-making company.',
          },
        ),
      };
    }

    if (bvps <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Số Graham cần giá trị sổ sách dương — vốn chủ sở hữu đang âm hoặc bằng 0.',
            en: 'The Graham number needs a positive book value — shareholders’ equity is negative or zero.',
          },
          {
            vi: 'Xem lại bảng cân đối kế toán trước khi định giá theo trường phái giá trị.',
            en: 'Review the balance sheet before applying value-investing valuation.',
          },
        ),
      };
    }

    return ok(Math.sqrt(22.5 * eps * bvps), '₫');
  },
};

/*
 * ── 8. NCAV trên cổ phiếu ──────────────────────────────────────────────────────────────
 */

export const NCAV: FormulaModule = {
  spec: {
    id: 'ncav-tren-co-phieu',
    categoryId: 'valuation',
    name: { vi: 'NCAV trên cổ phiếu', en: 'Net current asset value per share' },
    description: {
      vi: 'Giá trị tài sản ngắn hạn còn lại cho mỗi cổ phiếu sau khi trả hết mọi khoản nợ.',
      en: 'The current-asset value left per share after paying off every liability.',
    },
    latex: 'NCAV = \\frac{\\text{TSNH} - \\text{Tổng nợ}}{N}',
    expression: {
      vi: 'NCAV mỗi cổ phiếu = (Tài sản ngắn hạn − Tổng nợ phải trả) ÷ Số cổ phiếu lưu hành',
      en: 'NCAV per share = (Current assets − Total liabilities) ÷ Shares outstanding',
    },
    chartType: 'waterfall',
    /*
     * Chặng phải là số TRÊN MỖI CỔ PHIẾU, không phải tài sản và nợ thô.
     *
     * Công thức này có phép CHIA sau phép trừ, nên khai thẳng `currentAssets` và `totalLiabilities`
     * là hai cột đơn vị `tỷ ₫` cộng lại ra 2.200 trong khi kết quả là 18.644 `₫/CP` — lệch bốn chữ
     * số và lệch cả đơn vị. Bất biến "tổng các chặng bằng kết quả" bắt đúng ca này, nên hai số dưới
     * đây được chia sẵn ở `calc` rồi mới đưa lên hình.
     */
    breakdown: [
      {
        key: 'assetsPerShare',
        sign: 1,
        shortLabel: { vi: 'TSNH mỗi CP', en: 'Current assets/share' },
      },
      {
        key: 'liabilitiesPerShare',
        sign: -1,
        shortLabel: { vi: 'Trừ nợ mỗi CP', en: 'Less liabilities/share' },
      },
    ],
    breakdownTotal: { vi: 'NCAV', en: 'NCAV' },
    level: 'advanced',
    tags: ['ncav', 'net net', 'graham', 'tai san ngan han', 'dau tu gia tri'],
    resultUnit: '₫',
    variables: [
      numberVar('currentAssets', { vi: 'Tài sản ngắn hạn', en: 'Current assets' }, 'tỷ ₫', 4_800, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tiền, phải thu, hàng tồn kho — mục A trên bảng cân đối kế toán.',
          en: 'Cash, receivables, inventory — section A on the balance sheet.',
        },
      }),
      numberVar(
        'totalLiabilities',
        { vi: 'Tổng nợ phải trả', en: 'Total liabilities' },
        'tỷ ₫',
        2_600,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Toàn bộ nợ ngắn hạn và dài hạn, không riêng nợ vay.',
            en: 'All short-term and long-term liabilities, not just borrowed debt.',
          },
        },
      ),
      sharesOutstanding,
    ],
    explanation: {
      meaning: {
        vi: 'Phép định giá bi quan nhất của Graham: coi tài sản dài hạn bằng 0, chỉ tính tài sản ngắn hạn trừ hết nợ.',
        en: 'Graham’s most pessimistic valuation: treat long-term assets as worthless and count only current assets minus all liabilities.',
      },
      whenToUse: {
        vi: 'Săn cổ phiếu net-net — giá thị trường thấp hơn cả NCAV, tức mua rẻ hơn giá trị thanh lý dè dặt nhất.',
        en: 'Hunting for net-net stocks — a market price below NCAV means buying for less than the most conservative liquidation value.',
      },
      howToRead: {
        vi: 'Giá dưới NCAV là tín hiệu rẻ hiếm gặp, thường chỉ xuất hiện lúc thị trường hoảng loạn. NCAV âm là chuyện bình thường — chỉ nghĩa là doanh nghiệp không thuộc dạng net-net.',
        en: 'A price below NCAV is a rare cheap signal, usually appearing only during market panics. A negative NCAV is normal — it just means the company is not a net-net.',
      },
      commonMistakes: {
        vi: 'Quên rằng phải thu và hàng tồn kho có thể không thu hồi đủ giá trị sổ sách — Graham còn khuyên chỉ mua dưới hai phần ba NCAV.',
        en: 'Forgetting that receivables and inventory may not recover their full book value — Graham himself recommended buying only below two-thirds of NCAV.',
      },
    },
    example: {
      title: {
        vi: 'Tài sản ngắn hạn 4.800 tỷ ₫, tổng nợ 2.600 tỷ ₫, 118 triệu CP',
        en: 'Current assets 4,800 billion ₫, total liabilities 2,600 billion ₫, 118 million shares',
      },
      inputs: { currentAssets: 4_800, totalLiabilities: 2_600, shares: 118 },
      expected: 18_644.07,
      note: {
        vi: 'Giá thị trường dưới mức này mới được coi là cổ phiếu net-net.',
        en: 'Only a market price below this level would make the stock a net-net.',
      },
    },
    tests: [
      {
        name: 'ca thường — TSNH 4.800, nợ 2.600, 118 triệu CP',
        inputs: { currentAssets: 4_800, totalLiabilities: 2_600, shares: 118 },
        expected: 18_644.07,
        tolerance: 1,
      },
      {
        name: 'nợ vượt tài sản ngắn hạn thì NCAV âm — không phải net-net, vẫn là con số thật',
        inputs: { currentAssets: 1_000, totalLiabilities: 1_500, shares: 100 },
        expected: -5_000,
        tolerance: 1,
      },
      {
        name: 'số cổ phiếu bằng 0 — chia cho 0',
        inputs: { currentAssets: 4_800, totalLiabilities: 2_600, shares: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_SECURITY_ANALYSIS, SOURCE_INTELLIGENT_INVESTOR],
  },
  calc: (v) => {
    const shares = v('shares');

    if (shares <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: divideByZero(
          { vi: 'NCAV trên cổ phiếu', en: 'NCAV per share' },
          { vi: 'Số cổ phiếu lưu hành', en: 'shares outstanding' },
          {
            vi: 'Nhập số cổ phiếu đang lưu hành lớn hơn 0.',
            en: 'Enter a number of shares outstanding greater than 0.',
          },
        ),
      };
    }

    // (tỷ ₫) ÷ (triệu CP) ra nghìn ₫/CP; nhân 1.000 để về ₫/CP.
    const assetsPerShare = (v('currentAssets') / shares) * 1_000;
    const liabilitiesPerShare = (v('totalLiabilities') / shares) * 1_000;

    return ok(assetsPerShare - liabilitiesPerShare, '₫', {
      extras: { assetsPerShare, liabilitiesPerShare },
    });
  },
};

/*
 * ── 9. Tỷ suất lợi nhuận trên giá ──────────────────────────────────────────────────────
 */

export const TY_SUAT_LOI_NHUAN_TREN_GIA: FormulaModule = {
  spec: {
    id: 'ty-suat-loi-nhuan-tren-gia',
    categoryId: 'valuation',
    name: { vi: 'Tỷ suất lợi nhuận trên giá', en: 'Earnings yield' },
    description: {
      vi: 'Mỗi 100 đồng bỏ ra mua cổ phiếu đang tạo ra bao nhiêu đồng lợi nhuận — nghịch đảo của P/E.',
      en: 'How much profit each 100 dong spent buying the stock generates — the inverse of P/E.',
    },
    latex: 'E/P = \\frac{EPS}{P} \\times 100\\%',
    expression: {
      vi: 'Tỷ suất lợi nhuận = EPS ÷ Giá thị trường × 100',
      en: 'Earnings yield = EPS ÷ Market price × 100',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['earnings yield', 'ty suat loi nhuan', 'nghich dao pe', 'e p', 'so voi lai suat'],
    resultUnit: '%',
    variables: [
      numberVar(
        'eps',
        { vi: 'EPS — lợi nhuận trên mỗi cổ phiếu', en: 'EPS — earnings per share' },
        '₫',
        6_050,
        {
          min: -1_000_000,
          max: 1_000_000,
          description: {
            vi: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
            en: 'Net profit after tax divided by shares outstanding.',
          },
        },
      ),
      sharePrice,
    ],
    explanation: {
      meaning: {
        vi: 'Đảo ngược P/E thành một tỷ suất phần trăm, để so trực tiếp cổ phiếu với lãi suất tiền gửi hay trái phiếu.',
        en: 'Flips P/E into a percentage yield, so a stock can be compared directly with a deposit rate or bond yield.',
      },
      whenToUse: {
        vi: 'Khi cân nhắc bỏ tiền vào cổ phiếu hay kênh lãi suất cố định — hai bên cùng một đơn vị phần trăm nên so được ngay.',
        en: 'When weighing whether to put money into stocks or a fixed-income channel — both sides share the same percentage unit so they can be compared directly.',
      },
      howToRead: {
        vi: 'Cao hơn lãi suất tiết kiệm đáng kể thì cổ phiếu đang cho suất sinh lời lợi nhuận hấp dẫn hơn gửi tiền — đổi lại rủi ro cao hơn hẳn.',
        en: 'Meaningfully higher than the savings rate means the stock offers a more attractive earnings yield than a deposit — in exchange for far higher risk.',
      },
      commonMistakes: {
        vi: 'Coi tỷ suất này là tiền thật về túi — doanh nghiệp thường chỉ chia một phần lợi nhuận làm cổ tức, phần còn lại giữ lại tái đầu tư.',
        en: 'Treating this yield as actual cash in hand — a company usually pays out only part of its profit as dividends and retains the rest for reinvestment.',
      },
    },
    example: {
      title: { vi: 'EPS 6.050 ₫, giá 92.000 ₫', en: 'EPS 6,050 ₫, price 92,000 ₫' },
      inputs: { eps: 6_050, price: 92_000 },
      expected: 6.58,
      note: {
        vi: 'Đúng bằng 1 chia cho P/E 15,2 lần của ví dụ WF-03.',
        en: 'Exactly 1 divided by the P/E of 15.2x from the WF-03 example.',
      },
    },
    tests: [
      {
        name: 'ca thường — nghịch đảo ví dụ P/E của WF-03',
        inputs: { eps: 6_050, price: 92_000 },
        expected: 6.58,
      },
      {
        name: 'EPS 5.000 ₫ với giá 40.000 ₫ cho tỷ suất 12,5%',
        inputs: { eps: 5_000, price: 40_000 },
        expected: 12.5,
      },
      {
        name: 'giá bằng 0 — chia cho 0',
        inputs: { eps: 6_050, price: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh nghiệp không có lãi thì tỷ suất vô nghĩa',
        inputs: { eps: -1_200, price: 92_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const price = v('price');
    const eps = v('eps');

    if (price === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'tỷ suất lợi nhuận trên giá', en: 'earnings yield' },
          { vi: 'Giá thị trường', en: 'market price' },
          {
            vi: 'Nhập giá đóng cửa gần nhất của cổ phiếu.',
            en: 'Enter the most recent closing price of the share.',
          },
        ),
      };
    }

    if (eps <= 0) {
      return {
        value: null,
        unit: '%',
        warning: meaningless(
          {
            vi: 'Tỷ suất lợi nhuận trên giá không có ý nghĩa khi doanh nghiệp không có lãi.',
            en: 'Earnings yield is meaningless when the company has no profit.',
          },
          {
            vi: 'Dùng P/B hoặc P/S để đánh giá doanh nghiệp đang lỗ.',
            en: 'Use P/B or P/S to assess a loss-making company.',
          },
        ),
      };
    }

    return ok((eps / price) * 100, '%');
  },
};

/*
 * ── 10. Giá mục tiêu ───────────────────────────────────────────────────────────────────
 *
 * Cố ý ĐỘC LẬP, không phải một mắt xích của chuỗi FR-15: ứng viên cạnh duy nhất là
 * `pe → targetPe`, nhưng P/E hiện tại khác hẳn P/E mục tiêu về ý nghĩa — nối chúng bằng
 * `dependsOn` là dạy sai người dùng rằng hai con số đó là một. Xem `formulas/README.md`
 * mục "Còn thiếu".
 */

export const GIA_MUC_TIEU: FormulaModule = {
  spec: {
    id: 'gia-muc-tieu',
    categoryId: 'valuation',
    name: { vi: 'Giá mục tiêu', en: 'Target price' },
    description: {
      vi: 'Mức giá kỳ vọng nếu thị trường định giá cổ phiếu theo đúng P/E mục tiêu đã chọn.',
      en: 'The expected price if the market values the stock exactly at the chosen target P/E.',
    },
    latex: 'P_{\\text{mục tiêu}} = P/E_{\\text{mục tiêu}} \\times EPS',
    expression: {
      vi: 'Giá mục tiêu = P/E mục tiêu × EPS',
      en: 'Target price = Target P/E × EPS',
    },
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['gia muc tieu', 'target price', 'dinh gia', 'pe muc tieu'],
    resultUnit: '₫',
    variables: [
      numberVar('targetPe', { vi: 'P/E mục tiêu', en: 'Target P/E' }, 'lần', 15, {
        min: 0,
        max: 1_000,
        description: {
          vi: 'Bội số P/E kỳ vọng thị trường sẽ trả, ví dụ P/E trung bình ngành.',
          en: 'The P/E multiple the market is expected to pay, for example the industry average P/E.',
        },
      }),
      numberVar(
        'eps',
        { vi: 'EPS — lợi nhuận trên mỗi cổ phiếu', en: 'EPS — earnings per share' },
        '₫',
        6_050,
        {
          min: -1_000_000,
          max: 1_000_000,
          description: {
            vi: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
            en: 'Net profit after tax divided by shares outstanding.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mức giá cổ phiếu sẽ có nếu thị trường định giá đúng theo một P/E mục tiêu do người dùng chọn, giữ nguyên EPS hiện tại.',
        en: 'The price the stock would reach if the market valued it at a user-chosen target P/E, holding current EPS constant.',
      },
      whenToUse: {
        vi: 'Khi ước tính điểm chốt lời hoặc so dư địa tăng giá với thị giá đang có, dựa trên kỳ vọng P/E sẽ đi về đâu.',
        en: 'When estimating a take-profit level or comparing upside against the current market price, based on where P/E is expected to head.',
      },
      howToRead: {
        vi: 'Giá mục tiêu cao hơn thị giá hiện tại nghĩa là còn dư địa tăng NẾU P/E mục tiêu thành hiện thực — đây là một kịch bản, không phải một lời hứa.',
        en: 'A target price above the current market price means there is upside room IF the target P/E materialises — this is a scenario, not a promise.',
      },
      commonMistakes: {
        vi: 'Lấy P/E mục tiêu từ một doanh nghiệp khác ngành, hoặc quên rằng giá mục tiêu tính trên EPS HIỆN TẠI — EPS có thể đổi trước khi P/E kịp đạt mức mục tiêu.',
        en: 'Taking the target P/E from a company in a different industry, or forgetting that the target price is based on CURRENT EPS — EPS can change before P/E reaches the target level.',
      },
    },
    example: {
      title: { vi: 'EPS 6.050 ₫, P/E mục tiêu 18 lần', en: 'EPS 6,050 ₫, target P/E 18x' },
      inputs: { eps: 6_050, targetPe: 18 },
      expected: 108_900,
      note: {
        vi: 'Cao hơn thị giá 92.000 ₫ của ví dụ WF-03 — dư địa tăng nếu P/E đạt đúng mức mục tiêu.',
        en: 'Higher than the 92,000 ₫ market price in the WF-03 example — upside if P/E reaches the target level.',
      },
    },
    tests: [
      {
        name: 'ca thường — EPS 6.050 ₫ với P/E mục tiêu 18 lần',
        inputs: { eps: 6_050, targetPe: 18 },
        expected: 108_900,
      },
      {
        name: 'P/E mục tiêu thấp hơn P/E hiện tại thì giá mục tiêu thấp hơn thị giá',
        inputs: { eps: 6_050, targetPe: 10 },
        expected: 60_500,
      },
      {
        name: 'doanh nghiệp đang lỗ thì không có giá mục tiêu theo P/E',
        inputs: { eps: -1_200, targetPe: 15 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
      {
        name: 'P/E mục tiêu bằng 0 hoặc âm không phải một kỳ vọng hợp lý',
        inputs: { eps: 6_050, targetPe: 0 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const eps = v('eps');
    const targetPe = v('targetPe');

    if (eps <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'Giá mục tiêu cần EPS dương — nhân P/E mục tiêu với lợi nhuận âm hoặc bằng 0 không cho ra một mức giá có nghĩa.',
            en: 'Target price needs a positive EPS — multiplying the target P/E by zero or negative earnings does not give a meaningful price.',
          },
          {
            vi: 'Dùng Số Graham hoặc NCAV trên cổ phiếu để định giá doanh nghiệp đang lỗ.',
            en: 'Use the Graham number or net current asset value per share to value a loss-making company.',
          },
        ),
      };
    }

    if (targetPe <= 0) {
      return {
        value: null,
        unit: '₫',
        warning: meaningless(
          {
            vi: 'P/E mục tiêu phải dương — một mức bội số bằng 0 hoặc âm không phải là kỳ vọng định giá hợp lý.',
            en: 'The target P/E must be positive — a multiple of zero or negative is not a reasonable valuation expectation.',
          },
          {
            vi: 'Nhập một P/E mục tiêu dương, ví dụ P/E trung bình ngành hoặc P/E lịch sử của chính cổ phiếu.',
            en: 'Enter a positive target P/E, for example the industry average P/E or the stock’s own historical P/E.',
          },
        ),
      };
    }

    return ok(targetPe * eps, '₫');
  },
};

/** Mười công thức bội số & so sánh của nhóm Định giá. */
export const VALUATION_MULTIPLE_FORMULAS: ReadonlyArray<FormulaModule> = [
  PS,
  EV,
  EV_EBITDA,
  EV_SALES,
  PEG,
  VON_HOA,
  SO_GRAHAM,
  NCAV,
  TY_SUAT_LOI_NHUAN_TREN_GIA,
  GIA_MUC_TIEU,
];
