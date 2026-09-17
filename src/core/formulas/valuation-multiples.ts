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

/*
 * Nhãn mang theo KÝ HIỆU trong ngoặc khi latex của công thức dùng đúng ký hiệu ấy cho ô này —
 * `P` ở cả ps, von-hoa-thi-truong và ty-suat-loi-nhuan-tren-gia. Không có nó, người đọc phải tự
 * đoán chữ nào trong công thức ứng với ô nào; nhóm định giá dòng tiền (`capm`, `wacc`, `fcff`…)
 * đã làm vậy từ đầu, đây là kéo phần còn lại cho khớp.
 */
const sharePrice = numberVar(
  'price',
  { vi: 'Giá thị trường (P)', en: 'Market price (P)' },
  '₫',
  92_000,
  {
    min: 0,
    max: 10_000_000,
    description: {
      vi: 'Giá đóng cửa gần nhất của một cổ phiếu.',
      en: 'The most recent closing price of one share.',
    },
  },
);

const sharesOutstanding = numberVar(
  'shares',
  // `N` trong latex của von-hoa-thi-truong và ncav-tren-co-phieu — hai công thức duy nhất dùng
  // hằng này.
  { vi: 'Số cổ phiếu lưu hành (N)', en: 'Shares outstanding (N)' },
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
    symbols: [
      {
        latex: 'P/S',
        meaning: { vi: 'hệ số giá trên doanh thu, lần', en: 'price to sales ratio, in times' },
      },
      {
        latex: 'P',
        meaning: { vi: 'giá thị trường một cổ phiếu, ₫', en: 'market price of one share, ₫' },
      },
      {
        latex: 'S_{ps}',
        meaning: { vi: 'doanh thu trên mỗi cổ phiếu, ₫', en: 'revenue per share, ₫' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ps', 'p s', 'gia tren doanh thu', 'boi so', 'dinh gia', 'price to sales'],
    resultUnit: 'lần',
    variables: [
      sharePrice,
      numberVar(
        'salesPerShare',
        { vi: 'Doanh thu trên mỗi cổ phiếu (S)', en: 'Revenue per share (S)' },
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
        vi: 'FPT — giá 72.700 ₫ phiên 11/09/2026, doanh thu 37.157 ₫/CP',
        en: 'FPT — price 72,700 ₫ at the 2026-09-11 close, revenue 37,157 ₫/share',
      },
      inputs: { price: 72_700, salesPerShare: 37_157 },
      expected: 1.9566,
      note: {
        vi: 'Mỗi đồng doanh thu của FPT đang được trả gần hai đồng — mức dễ chịu với doanh nghiệp phần mềm biên lợi nhuận cao, trong khi nhóm bán lẻ biên mỏng thường giao dịch dưới 0,5 lần. Doanh thu khó làm đẹp hơn lợi nhuận, nhưng bội số này bỏ qua toàn bộ chi phí nên một doanh nghiệp đang lỗ vẫn có thể có P/S trông rất gọn.',
        en: 'Each dong of FPT’s revenue is being priced at nearly two dong — comfortable for a high-margin software company, while thin-margin retailers usually trade below 0.5x. Revenue is harder to dress up than profit, but this multiple ignores costs entirely, so a loss-making company can still show a tidy-looking P/S.',
      },
      source: {
        vi: 'stockanalysis.com, doanh thu bốn quý gần nhất của CTCP FPT (mã FPT); giá phiên 11/09/2026.',
        en: 'stockanalysis.com, FPT Corp’s (ticker FPT) last four quarters of revenue; price at the 2026-09-11 close.',
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
    symbols: [
      {
        latex: 'EV',
        meaning: { vi: 'giá trị doanh nghiệp, tỷ ₫', en: 'enterprise value, billion ₫' },
      },
      {
        latex: '\\text{Vốn hoá}',
        meaning: { vi: 'vốn hoá thị trường, tỷ ₫', en: 'market capitalization, billion ₫' },
      },
      {
        latex: '\\text{Nợ vay}',
        meaning: {
          vi: 'tổng nợ vay ngắn hạn và dài hạn, tỷ ₫',
          en: 'total short-term and long-term debt, billion ₫',
        },
      },
      {
        latex: '\\text{Tiền mặt}',
        meaning: {
          vi: 'tiền và tương đương tiền, tỷ ₫',
          en: 'cash and cash equivalents, billion ₫',
        },
      },
    ],
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
        vi: 'FPT — vốn hoá 124.631,5 tỷ ₫, nợ vay 17.444 tỷ ₫, tiền và đầu tư ngắn hạn 28.971,6 tỷ ₫ (30/06/2026)',
        en: 'FPT — market cap 124,631.5 billion ₫, debt 17,444 billion ₫, cash and short-term investments 28,971.6 billion ₫ (2026-06-30)',
      },
      inputs: { marketCap: 124_631.5, totalDebt: 17_444, cash: 28_971.6 },
      expected: 113_104,
      note: {
        vi: 'EV thấp hơn cả vốn hoá vì FPT giữ nhiều tiền hơn nợ vay — nợ vay ròng âm khoảng 11.528 tỷ ₫, nên người mua trọn doanh nghiệp được cầm lại khoản tiền ròng đó. Lưu ý về số liệu: dòng nợ vay quý 2/2026 của FPT trên CafeF bị đảo nhãn với dự phòng phải trả, hai cách đọc cho 17.444 và 18.448 tỷ ₫, làm EV lệch khoảng 1%.',
        en: 'EV comes out below market cap because FPT holds more cash than debt — net debt is roughly −11,528 billion ₫, so a buyer of the whole company keeps that net cash. A data caveat: FPT’s Q2/2026 debt line on CafeF is swapped with its provisions line, giving 17,444 versus 18,448 billion ₫ and shifting EV by about 1%.',
      },
      source: {
        vi: 'CafeF, bảng cân đối kế toán CTCP FPT (mã FPT) quý 2/2026; vốn hoá theo giá phiên 11/09/2026.',
        en: 'CafeF, FPT Corp’s (ticker FPT) Q2/2026 balance sheet; market cap at the 2026-09-11 close.',
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
    symbols: [
      {
        latex: 'EV/EBITDA',
        meaning: { vi: 'bội số EV trên EBITDA, lần', en: 'EV to EBITDA multiple, in times' },
      },
      {
        latex: 'EV',
        meaning: { vi: 'giá trị doanh nghiệp, tỷ ₫', en: 'enterprise value, billion ₫' },
      },
      {
        latex: 'EBITDA',
        meaning: {
          vi: 'lợi nhuận trước lãi vay, thuế và khấu hao, tỷ ₫',
          en: 'earnings before interest, tax, depreciation and amortization, billion ₫',
        },
      },
    ],
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
        vi: 'FPT — EV 113.103,9 tỷ ₫, EBITDA quy năm 13.901,9 tỷ ₫ (6 tháng đầu 2026)',
        en: 'FPT — EV 113,103.9 billion ₫, annualized EBITDA 13,901.9 billion ₫ (H1 2026)',
      },
      inputs: { ev: 113_103.9, ebitda: 13_901.9 },
      expected: 8.1359,
      note: {
        vi: 'Khoảng tám năm EBITDA để hoàn lại giá mua trọn doanh nghiệp, trùng khớp với bội số 8,14 lần stockanalysis công bố độc lập. EBITDA ở đây quy năm bằng cách nhân đôi số liệu sáu tháng — cách làm chỉ đúng khi hoạt động kinh doanh không có mùa vụ mạnh.',
        en: 'Roughly eight years of EBITDA to recover the full purchase price, matching the 8.14x that stockanalysis publishes independently. The EBITDA here is annualized by doubling six months of data — valid only when the business has no strong seasonality.',
      },
      source: {
        vi: 'CafeF, báo cáo tài chính CTCP FPT (mã FPT) 6 tháng đầu 2026; EV lấy từ công thức EV của nhóm này.',
        en: 'CafeF, FPT Corp’s (ticker FPT) H1 2026 financial statements; EV from this group’s EV formula.',
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
    symbols: [
      {
        latex: 'EV/Sales',
        meaning: { vi: 'bội số EV trên doanh thu, lần', en: 'EV to sales multiple, in times' },
      },
      {
        latex: 'EV',
        meaning: { vi: 'giá trị doanh nghiệp, tỷ ₫', en: 'enterprise value, billion ₫' },
      },
      {
        latex: '\\text{Doanh thu}',
        meaning: {
          vi: 'doanh thu thuần bốn quý gần nhất, tỷ ₫',
          en: 'net revenue over the last four quarters, billion ₫',
        },
      },
    ],
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
        vi: 'FPT — EV 113.103,9 tỷ ₫, doanh thu quy năm 52.537 tỷ ₫ theo nền hợp nhất mới',
        en: 'FPT — EV 113,103.9 billion ₫, annualized revenue 52,537 billion ₫ on the new consolidation basis',
      },
      inputs: { ev: 113_103.9, revenue: 52_537 },
      expected: 2.1528,
      note: {
        vi: 'Cao hơn P/S 1,96 lần của cùng cổ phiếu chỉ vì chọn kỳ khác: mẫu số ở đây là doanh thu quy năm theo nền hợp nhất đã bỏ FPT Telecom, còn P/S vẫn dùng doanh thu bốn quý gần nhất 63.698,4 tỷ ₫. Hai bội số cùng đo một thứ vẫn ra hai kết quả, nên luôn phải đọc kèm kỳ của mẫu số.',
        en: 'Higher than the same stock’s P/S of 1.96x purely because of the period chosen: the denominator here is annualized revenue on the consolidation basis that excludes FPT Telecom, while P/S still uses the last four quarters’ 63,698.4 billion ₫. Two multiples measuring the same thing still give two answers, so always read the denominator’s period alongside them.',
      },
      source: {
        vi: 'CafeF, báo cáo kết quả kinh doanh CTCP FPT (mã FPT) quý 2/2026; EV lấy từ công thức EV của nhóm này.',
        en: 'CafeF, FPT Corp’s (ticker FPT) Q2/2026 income statement; EV from this group’s EV formula.',
      },
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
    symbols: [
      {
        latex: 'PEG',
        meaning: { vi: 'hệ số P/E trên tăng trưởng, lần', en: 'P/E to growth ratio, in times' },
      },
      {
        latex: 'P/E',
        meaning: {
          vi: 'P/E hiện tại — hệ số giá trên lợi nhuận, lần',
          en: 'current P/E — price to earnings ratio, in times',
        },
      },
      {
        latex: 'g',
        meaning: {
          vi: 'tăng trưởng lợi nhuận kỳ vọng, %/năm',
          en: 'expected earnings growth, %/year',
        },
      },
    ],
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
        { vi: 'Tăng trưởng lợi nhuận kỳ vọng (g)', en: 'Expected earnings growth (g)' },
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
        vi: 'Dùng con số tăng trưởng quá lạc quan — g là một dự phóng, không chắc chắn như P/E vốn tính từ số liệu đã có, nên sai lệch vài điểm phần trăm ở g dễ kéo PEG lệch xa kết luận ban đầu.',
        en: 'Using an overly optimistic growth figure — g is a forecast, less certain than P/E which is computed from data already on hand, so an error of a few percentage points in g can easily pull PEG far from the original conclusion.',
      },
    },
    example: {
      title: {
        vi: 'FPT — P/E 12,39 lần, lợi nhuận 6 tháng đầu 2026 tăng 14,1% so với cùng kỳ',
        en: 'FPT — P/E 12.39x, H1 2026 earnings up 14.1% year on year',
      },
      inputs: { pe: 12.39, growth: 14.1 },
      expected: 0.8787,
      note: {
        vi: 'Dưới 1 theo quy tắc Peter Lynch, tức P/E đang thấp so với tốc độ tăng trưởng của chính doanh nghiệp. Cả kết luận treo vào chữ g: thay bằng kế hoạch công ty 15%/năm thì PEG còn 0,83, còn dự phóng thận trọng 10%/năm đẩy PEG lên 1,24 và lật ngược nhận định — nên nhập g kèm ghi rõ nguồn.',
        en: 'Below 1 by Peter Lynch’s rule, meaning the P/E is low relative to the company’s own growth rate. The whole conclusion hangs on g: the company’s own 15%/year plan brings PEG down to 0.83, while a conservative 10%/year forecast lifts it to 1.24 and flips the reading — so record where g came from.',
      },
      source: {
        vi: 'CafeF, kết quả kinh doanh 6 tháng đầu 2026 của CTCP FPT (mã FPT); P/E theo giá phiên 11/09/2026.',
        en: 'CafeF, FPT Corp’s (ticker FPT) H1 2026 results; P/E at the 2026-09-11 close.',
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
    symbols: [
      {
        latex: '\\text{Vốn hoá}',
        meaning: { vi: 'vốn hoá thị trường, tỷ ₫', en: 'market capitalization, billion ₫' },
      },
      {
        latex: 'P',
        meaning: { vi: 'giá thị trường một cổ phiếu, ₫', en: 'market price of one share, ₫' },
      },
      {
        latex: 'N',
        meaning: {
          vi: 'số cổ phiếu lưu hành, triệu CP',
          en: 'shares outstanding, in millions of shares',
        },
      },
    ],
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
        vi: 'Khi mới tìm hiểu một cổ phiếu lạ, hoặc muốn cân đối danh mục theo tỷ trọng vốn hoá lớn, vừa, nhỏ phù hợp khẩu vị rủi ro của bản thân.',
        en: 'When first researching an unfamiliar stock, or wanting to balance a portfolio across large-, mid-, and small-cap weights to match your own risk appetite.',
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
        vi: 'FPT — giá 72.700 ₫ phiên 11/09/2026, 1.714,33 triệu cổ phiếu lưu hành',
        en: 'FPT — price 72,700 ₫ at the 2026-09-11 close, 1,714.33 million shares outstanding',
      },
      inputs: { price: 72_700, shares: 1_714.33 },
      expected: 124_632,
      note: {
        vi: 'Khoảng 4,7 tỷ USD, đưa FPT vào nhóm doanh nghiệp lớn nhất sàn HOSE. Con số đổi theo từng phiên: ở đáy 24/07/2026 giá 62.900 ₫ cho vốn hoá 107.831 tỷ ₫, bốc hơi gần 17.000 tỷ trong bảy tuần dù doanh nghiệp không có gì thay đổi — vốn hoá đo thị trường, không đo giá trị doanh nghiệp.',
        en: 'Around 4.7 billion USD, placing FPT among the largest companies on HOSE. The figure moves session by session: at the 2026-07-24 low, a price of 62,900 ₫ gave a market cap of 107,831 billion ₫ — nearly 17,000 billion gone in seven weeks with nothing changing at the company, because market cap measures the market, not the business.',
      },
      source: {
        vi: 'Investing.com, giá lịch sử CTCP FPT (mã FPT), phiên 11/09/2026.',
        en: 'Investing.com, FPT Corp’s (ticker FPT) historical prices, 2026-09-11 session.',
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
    symbols: [
      {
        latex: '\\text{Graham}',
        meaning: {
          vi: 'số Graham — mức giá tối đa hợp lý theo chuẩn Graham, ₫',
          en: 'Graham number — the maximum reasonable price by Graham’s standard, ₫',
        },
      },
      {
        latex: '22{,}5',
        meaning: {
          vi: 'P/E tối đa 15 nhân P/B tối đa 1,5 mà Graham đặt ra',
          en: 'Graham’s maximum P/E of 15 times his maximum P/B of 1.5',
        },
      },
      {
        latex: 'EPS',
        meaning: { vi: 'lợi nhuận trên mỗi cổ phiếu, ₫', en: 'earnings per share, ₫' },
      },
      {
        latex: 'BVPS',
        meaning: { vi: 'giá trị sổ sách trên mỗi cổ phiếu, ₫', en: 'book value per share, ₫' },
      },
    ],
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
      numberVar(
        'bvps',
        { vi: 'Giá trị sổ sách / CP (BVPS)', en: 'Book value / share (BVPS)' },
        '₫',
        24_800,
        {
          min: -1_000_000,
          max: 10_000_000,
          description: {
            vi: 'Vốn chủ sở hữu chia cho số cổ phiếu đang lưu hành.',
            en: 'Shareholders’ equity divided by shares outstanding.',
          },
        },
      ),
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
        vi: 'FPT — EPS 5.867 ₫, giá trị sổ sách 23.246 ₫/CP tại 30/06/2026',
        en: 'FPT — EPS 5,867 ₫, book value 23,246 ₫/share as of 2026-06-30',
      },
      inputs: { eps: 5_867, bvps: 23_246 },
      expected: 55_395,
      note: {
        vi: 'Thấp hơn giá phiên 11/09/2026 khoảng 24%, tức FPT đang đắt theo chuẩn Graham. Hằng số 22,5 là tích của P/E tối đa 15 và P/B tối đa 1,5 mà Graham đặt cho thị trường Mỹ giữa thế kỷ 20, nên áp nguyên ngưỡng P/B ấy cho một doanh nghiệp phần mềm gần như luôn cho ra kết luận đắt.',
        en: 'About 24% below the 2026-09-11 close, so FPT looks expensive by Graham’s standard. The 22.5 constant is a maximum P/E of 15 times a maximum P/B of 1.5, set for the mid-20th-century US market, so applying that P/B ceiling to a software company almost always returns “expensive”.',
      },
      source: {
        vi: 'stockanalysis.com, EPS bốn quý gần nhất và BVPS 30/06/2026 của CTCP FPT (mã FPT).',
        en: 'stockanalysis.com, FPT Corp’s (ticker FPT) last-four-quarters EPS and 2026-06-30 BVPS.',
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
    symbols: [
      {
        latex: 'NCAV',
        meaning: {
          vi: 'giá trị tài sản ngắn hạn ròng trên mỗi cổ phiếu, ₫',
          en: 'net current asset value per share, ₫',
        },
      },
      {
        latex: '\\text{TSNH}',
        meaning: { vi: 'tài sản ngắn hạn, tỷ ₫', en: 'current assets, billion ₫' },
      },
      {
        latex: '\\text{Tổng nợ}',
        meaning: { vi: 'tổng nợ phải trả, tỷ ₫', en: 'total liabilities, billion ₫' },
      },
      {
        latex: 'N',
        meaning: {
          vi: 'số cổ phiếu lưu hành, triệu CP',
          en: 'shares outstanding, in millions of shares',
        },
      },
    ],
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
        vi: 'FPT — tài sản ngắn hạn 45.702 tỷ ₫, tổng nợ phải trả 32.738,4 tỷ ₫, 1.714,33 triệu CP (30/06/2026)',
        en: 'FPT — current assets 45,702 billion ₫, total liabilities 32,738.4 billion ₫, 1,714.33 million shares (2026-06-30)',
      },
      inputs: { currentAssets: 45_702, totalLiabilities: 32_738.4, shares: 1_714.33 },
      expected: 7_562,
      note: {
        vi: 'Chỉ bằng khoảng một phần mười giá phiên 11/09/2026, trong khi chuẩn net-net của Graham còn đòi mua dưới hai phần ba NCAV. Đây là kết quả bình thường: net-net là bộ lọc dành cho cổ phiếu bị bỏ rơi lúc khủng hoảng, giá trị của con số nằm ở chỗ nó đặt một mức sàn rất dè dặt.',
        en: 'Only about a tenth of the 2026-09-11 close, while Graham’s net-net screen asks for a price below two-thirds of NCAV on top of that. This is a normal outcome: net-net is a filter for stocks abandoned in a crisis, and the number’s value lies in marking a deliberately conservative floor.',
      },
      source: {
        vi: 'CafeF, bảng cân đối kế toán CTCP FPT (mã FPT) quý 2/2026.',
        en: 'CafeF, FPT Corp’s (ticker FPT) Q2/2026 balance sheet.',
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
    symbols: [
      {
        latex: 'E/P',
        meaning: { vi: 'tỷ suất lợi nhuận trên giá, %', en: 'earnings yield, %' },
      },
      {
        latex: 'EPS',
        meaning: { vi: 'lợi nhuận trên mỗi cổ phiếu, ₫', en: 'earnings per share, ₫' },
      },
      {
        latex: 'P',
        meaning: { vi: 'giá thị trường một cổ phiếu, ₫', en: 'market price of one share, ₫' },
      },
      {
        latex: '100\\%',
        meaning: { vi: 'đổi tỷ lệ ra phần trăm', en: 'converts the ratio to a percentage' },
      },
    ],
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
      title: {
        vi: 'FPT — EPS 5.867 ₫, giá 72.700 ₫ phiên 11/09/2026',
        en: 'FPT — EPS 5,867 ₫, price 72,700 ₫ at the 2026-09-11 close',
      },
      inputs: { eps: 5_867, price: 72_700 },
      expected: 8.0702,
      note: {
        vi: 'Đúng bằng nghịch đảo P/E 12,39 lần. Đặt cạnh lãi suất tiết kiệm 12 tháng 6,8%/năm và lợi suất trái phiếu chính phủ kỳ hạn 10 năm 4,57%/năm thì phần bù rủi ro khoảng 3,5 điểm phần trăm — nhưng đây là lợi nhuận doanh nghiệp làm ra, phần thực về túi cổ đông chỉ là cổ tức 2,75%.',
        en: 'Exactly the inverse of the 12.39x P/E. Set against a 12-month deposit rate of 6.8%/year and a 10-year government bond yield of 4.57%/year, the risk premium is about 3.5 percentage points — but this is profit the company earns, while what actually reaches shareholders is the 2.75% dividend.',
      },
      source: {
        vi: 'Investing.com, giá phiên 11/09/2026 và EPS bốn quý gần nhất của CTCP FPT (mã FPT).',
        en: 'Investing.com, FPT Corp’s (ticker FPT) 2026-09-11 close and last-four-quarters EPS.',
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
        /*
         * EPS âm KHÔNG phải ca vô nghĩa: E/P là tỷ lệ đơn nên giữ nguyên dấu, và đây đúng là lý do
         * kinh điển người ta dùng E/P thay P/E khi mẫu so sánh có công ty lỗ (P/E thì đảo ngược
         * thứ hạng, E/P thì không). −1.200 ÷ 92.000 × 100 = −1,3%.
         */
        name: 'doanh nghiệp lỗ cho tỷ suất âm — vẫn là con số đọc được, khác P/E',
        inputs: { eps: -1_200, price: 92_000 },
        expected: -1.3,
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

    /*
     * KHÔNG chặn EPS ≤ 0. E/P là một TỶ LỆ ĐƠN (EPS ÷ Giá), không phải bội số nghịch đảo như P/E:
     * nó giữ nguyên dấu, nên doanh nghiệp lỗ cho ra một tỷ suất ÂM đọc được — và đó đúng là lý do
     * kinh điển E/P được ưa dùng hơn P/E khi mẫu so sánh có công ty lỗ (P/E đảo ngược thứ hạng,
     * E/P thì không). Chặn ở đây còn mâu thuẫn với chính "Khi nào dùng" và "Cách đọc kết quả" của
     * công thức, vốn dạy đem tỷ suất này so thẳng với lãi suất tiết kiệm — đúng lúc nó âm là lúc
     * phép so ấy nói được nhiều nhất.
     */
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
    symbols: [
      {
        latex: 'P_{\\text{mục tiêu}}',
        meaning: { vi: 'giá mục tiêu, ₫', en: 'target price, ₫' },
      },
      {
        latex: 'P/E_{\\text{mục tiêu}}',
        meaning: {
          vi: 'P/E mục tiêu — bội số kỳ vọng thị trường sẽ trả, lần',
          en: 'target P/E — the multiple the market is expected to pay, in times',
        },
      },
      {
        latex: 'EPS',
        meaning: {
          vi: 'lợi nhuận trên mỗi cổ phiếu hiện tại, ₫',
          en: 'current earnings per share, ₫',
        },
      },
    ],
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
      title: {
        vi: 'FPT — EPS 5.867 ₫, P/E mục tiêu 15 lần theo trung bình lịch sử',
        en: 'FPT — EPS 5,867 ₫, target P/E of 15x from its historical average',
      },
      inputs: { eps: 5_867, targetPe: 15 },
      expected: 88_005,
      note: {
        vi: 'Cao hơn giá phiên 11/09/2026 khoảng 21%, tức còn dư địa tăng nếu bội số quay lại mức trung bình lịch sử của chính FPT. Toàn bộ kết quả treo vào một con số do người dùng chọn, nên hãy đọc nó như một dải kịch bản theo vài mức P/E chứ không phải một điểm giá.',
        en: 'About 21% above the 2026-09-11 close, so there is upside if the multiple returns to FPT’s own historical average. The whole result rests on a single number the user picks, so read it as a range of scenarios across several P/E levels rather than as one price point.',
      },
      source: {
        vi: 'stockanalysis.com, EPS bốn quý gần nhất của CTCP FPT (mã FPT); so với giá phiên 11/09/2026.',
        en: 'stockanalysis.com, FPT Corp’s (ticker FPT) last-four-quarters EPS; compared with the 2026-09-11 close.',
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
