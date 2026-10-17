/**
 * Tầng DOMAIN — nhóm "Chỉ số doanh nghiệp" (gói WBS 5.2.x, categoryId 'fundamentals').
 *
 * Mười một công thức, cộng với P/E và P/B đã có ở `multiples.ts` là đủ 13 theo
 * `expectedCount` của SRS 3.8.
 *
 * Bộ số kiểm chứng minh hoạ theo cỡ một cổ phiếu vốn hoá lớn (LNST ≈ 8.894 tỷ ₫,
 * vốn chủ sở hữu 36.456 tỷ ₫, 1,47 tỷ cổ phiếu — dựng ban đầu quanh preset FPT của
 * `src/data/samples.ts` trước khi bộ mẫu đó đổi sang số thật từ Finbox_v2, xem TASK.md).
 * Cố tình KHÔNG cập nhật theo mỗi lần `npm run gen:live-fundamentals`: đây là ví dụ
 * cố định để người đọc dò tay theo, không phải khẳng định "khớp bộ số liệu mẫu"
 * (khẳng định đó có `prose-audit.test.ts` gác riêng — xem `example.note` mỗi công thức).
 * Mọi số kỳ vọng trong `tests[]` đều tính trước bằng script dạng đóng độc lập,
 * theo đúng luật của README thư mục này.
 *
 * Quy ước đơn vị: các khoản trên báo cáo tài chính nhập bằng **tỷ ₫** cho dễ gõ;
 * số cổ phiếu nhập bằng **CP**. Hai công thức ra kết quả ₫/CP (EPS, BVPS) nhân 1e9
 * trong thân hàm — đó là đổi đơn vị tỷ ₫ → ₫, không phải hằng số thị trường.
 *
 * Các biến `sharesOutstanding`, `dividendPerShare`, `eps` đặt key trùng đúng trường
 * của `Fundamentals` trong tầng Data, để nút "Nạp mẫu" của WF-10 tự điền được.
 *
 * Ca lỗi kinh điển của nhóm: vốn chủ sở hữu âm (ROE, D/E, BVPS vô nghĩa), doanh thu
 * bằng 0, nợ ngắn hạn bằng 0 — cùng mã cảnh báo ở mọi công thức theo WF-15.
 */

import { fail, ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { FormulaSource } from '../registry/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, SOURCE_VAS, numberVar } from './shared';

/*
 * ── Nguồn riêng của nhóm (FR-04) ───────────────────────────────────────────────────────
 */

const SOURCE_PHAN_TICH_BCTC: FormulaSource = {
  label: {
    vi: 'Giáo trình Phân tích báo cáo tài chính — Nguyễn Năng Phúc (NXB Đại học Kinh tế Quốc dân)',
    en: 'Financial Statement Analysis textbook — Nguyễn Năng Phúc (National Economics University Press)',
  },
};

/*
 * ── Biến dùng chung ────────────────────────────────────────────────────────────────────
 * Mỗi biến khai một lần rồi các công thức dùng lại, để cùng một khái niệm luôn cùng
 * nhãn, cùng đơn vị và cùng miền giá trị ở mọi màn hình.
 */

const netIncome = numberVar(
  'netIncome',
  { vi: 'Lợi nhuận sau thuế', en: 'Net income after tax' },
  'tỷ ₫',
  8_894,
  {
    min: -1_000_000,
    max: 1_000_000,
    description: {
      vi: 'Lợi nhuận sau thuế của cổ đông công ty mẹ trong kỳ. Đang lỗ thì nhập số âm.',
      en: "Net income after tax attributable to the parent company's shareholders for the period. Enter a negative number if the company is running a loss.",
    },
  },
);

const equity = numberVar('equity', { vi: 'Vốn chủ sở hữu', en: 'Equity' }, 'tỷ ₫', 36_456, {
  min: -1_000_000,
  max: 10_000_000,
  description: {
    vi: 'Vốn chủ sở hữu trên bảng cân đối kế toán cuối kỳ.',
    en: 'Equity on the balance sheet at period end.',
  },
});

const totalAssets = numberVar(
  'totalAssets',
  { vi: 'Tổng tài sản', en: 'Total assets' },
  'tỷ ₫',
  68_000,
  {
    min: 0,
    max: 10_000_000,
    description: {
      vi: 'Tổng tài sản trên bảng cân đối kế toán cuối kỳ.',
      en: 'Total assets on the balance sheet at period end.',
    },
  },
);

const revenue = numberVar('revenue', { vi: 'Doanh thu thuần', en: 'Net revenue' }, 'tỷ ₫', 62_850, {
  min: 0,
  max: 10_000_000,
  description: {
    vi: 'Doanh thu bán hàng và cung cấp dịch vụ sau khi trừ các khoản giảm trừ.',
    en: 'Revenue from sales and services after deducting sales allowances.',
  },
});

const sharesOutstanding = numberVar(
  'sharesOutstanding',
  { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
  'CP',
  1_470_000_000,
  {
    min: 0,
    max: 50_000_000_000,
    description: {
      vi: 'Số cổ phiếu phổ thông đang lưu hành, không tính cổ phiếu quỹ.',
      en: 'Number of common shares outstanding, excluding treasury shares.',
    },
  },
);

const currentLiabilities = numberVar(
  'currentLiabilities',
  { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
  'tỷ ₫',
  28_000,
  {
    min: 0,
    max: 10_000_000,
    description: {
      vi: 'Các khoản phải trả trong vòng 12 tháng tới.',
      en: 'Amounts payable within the next 12 months.',
    },
  },
);

/*
 * ── 1. EPS cơ bản ──────────────────────────────────────────────────────────────────────
 */

export const EPS_CO_BAN: FormulaModule = {
  spec: {
    id: 'eps-co-ban',
    categoryId: 'fundamentals',
    name: { vi: 'EPS cơ bản', en: 'Basic earnings per share' },
    description: {
      vi: 'Mỗi cổ phiếu phổ thông làm ra bao nhiêu đồng lợi nhuận trong kỳ.',
      en: 'How much profit each common share earns during the period.',
    },
    latex:
      'EPS = \\frac{\\text{LNST} - \\text{Cổ tức ưu đãi}}{\\text{Số CP lưu hành}} \\times 10^9',
    expression: {
      vi: 'EPS = (Lợi nhuận sau thuế − Cổ tức ưu đãi) ÷ Số cổ phiếu lưu hành × 10^9',
      en: 'EPS = (Net income after tax − Preferred dividends) ÷ Shares outstanding × 10^9',
    },
    substitution: '({netIncome} − {preferredDividend}) ÷ {sharesOutstanding} × 10^9',
    symbols: [
      {
        latex: 'EPS',
        meaning: { vi: 'lợi nhuận trên mỗi cổ phiếu, tính bằng ₫', en: 'earnings per share, in ₫' },
      },
      {
        latex: '\\text{LNST}',
        meaning: {
          vi: 'lợi nhuận sau thuế trong kỳ, tỷ ₫',
          en: 'net income after tax for the period, billion ₫',
        },
      },
      {
        latex: '\\text{Cổ tức ưu đãi}',
        meaning: {
          vi: 'cổ tức trả cho cổ phiếu ưu đãi trong kỳ, không có thì bằng 0, tỷ ₫',
          en: 'dividends paid on preferred shares for the period, 0 if there are none, billion ₫',
        },
      },
      {
        latex: '\\text{Số CP lưu hành}',
        meaning: {
          vi: 'số cổ phiếu (CP) phổ thông đang lưu hành',
          en: 'number of common shares outstanding',
        },
      },
      {
        latex: '10^9',
        meaning: { vi: 'đổi tỷ ₫ ra ₫', en: 'converts billion ₫ into ₫' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['eps', 'loi nhuan tren co phieu', 'earnings per share', 'chi so dn'],
    resultUnit: '₫',
    variables: [
      netIncome,
      numberVar(
        'preferredDividend',
        { vi: 'Cổ tức ưu đãi', en: 'Preferred dividends' },
        'tỷ ₫',
        0,
        {
          min: 0,
          max: 100_000,
          level: 'advanced',
          description: {
            vi: 'Cổ tức trả cho cổ phiếu ưu đãi trong kỳ. Không có thì để 0.',
            en: 'Dividends paid to preferred shares during the period. Leave at 0 if none.',
          },
        },
      ),
      sharesOutstanding,
    ],
    explanation: {
      meaning: {
        vi: 'Phần lợi nhuận thuộc về một cổ phiếu phổ thông sau khi trừ phần của cổ đông ưu đãi.',
        en: "The portion of profit belonging to one common share after subtracting the preferred shareholders' portion.",
      },
      whenToUse: {
        vi: 'Dùng khi bạn vừa đọc tin công ty công bố lợi nhuận quý hoặc năm và muốn biết mỗi cổ phiếu mình cầm làm ra bao nhiêu đồng lãi, so với cùng kỳ năm trước.',
        en: "Use it when you have just read a company's quarterly or yearly profit report and want to know how many dong of profit each share you hold earned, compared with the same period last year.",
      },
      howToRead: {
        vi: 'So với EPS của chính công ty ở cùng kỳ năm trước: cao hơn nghĩa là mỗi cổ phiếu bạn cầm đang làm ra nhiều lãi hơn, thấp hơn là ít hơn. Số âm nghĩa là công ty đang lỗ, tính trên mỗi cổ phiếu.',
        en: "Compared with the company's own EPS for the same period a year earlier: higher means each share you hold is earning more profit, lower means it is earning less. A negative figure means the company is making a loss, counted per share.",
      },
      commonMistakes: {
        vi: 'So EPS tuyệt đối giữa hai doanh nghiệp có số cổ phiếu khác nhau — EPS 1.000 ₫ không tệ hơn EPS 6.000 ₫ nếu thị giá cũng thấp tương ứng.',
        en: 'Comparing absolute EPS between two companies with different share counts — an EPS of 1,000 ₫ is not worse than an EPS of 6,000 ₫ if the share price is proportionally lower too.',
      },
    },
    example: {
      title: {
        vi: 'FPT 6 tháng đầu 2026 — LNST 5.055,1 tỷ ₫, 1,71 tỷ cổ phiếu lưu hành',
        en: 'FPT H1 2026 — net income 5,055.1 billion ₫, 1.71 billion shares outstanding',
      },
      inputs: { netIncome: 5_055.1, preferredDividend: 0, sharesOutstanding: 1_714_326_422 },
      expected: 2_949,
      note: {
        vi: 'So với mốc 0 đồng: kết quả dương nghĩa là 6 tháng đầu 2026 FPT có lãi, tính ra mỗi cổ phiếu phổ thông làm ra khoảng 2.949 ₫ lãi. Đây mới là lãi nửa năm, nên chỉ đặt cạnh EPS 6 tháng đầu các năm trước, không đặt cạnh EPS cả năm.',
        en: 'Compared with the 0 dong mark: the positive result means FPT made a profit in the first half of 2026, working out to about 2,949 ₫ of profit for each common share. This is only half a year of profit, so set it beside first-half EPS of earlier years, not beside full-year EPS.',
      },
      source: {
        vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT H1 2026 business results release, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'bộ số FPT của WF-10',
        inputs: { netIncome: 8_894, preferredDividend: 0, sharesOutstanding: 1_470_000_000 },
        expected: 6_050.34,
      },
      {
        name: 'có cổ tức ưu đãi thì trừ ra trước khi chia',
        inputs: { netIncome: 8_894, preferredDividend: 894, sharesOutstanding: 1_470_000_000 },
        expected: 5_442.18,
      },
      {
        name: 'doanh nghiệp lỗ thì EPS âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, preferredDividend: 0, sharesOutstanding: 1_000_000_000 },
        expected: -1_200,
      },
      {
        name: 'số cổ phiếu bằng 0 thì không chia được',
        inputs: { netIncome: 8_894, preferredDividend: 0, sharesOutstanding: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const shares = v('sharesOutstanding');
    if (shares === 0) {
      return fail(
        '₫',
        divideByZero(
          { vi: 'EPS', en: 'EPS' },
          { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
          {
            vi: 'Nhập số cổ phiếu đang lưu hành của doanh nghiệp.',
            en: "Enter the company's shares outstanding.",
          },
        ),
      );
    }
    // × 1e9: đổi tỷ ₫ → ₫ vì kết quả tính trên từng cổ phiếu.
    return ok(((v('netIncome') - v('preferredDividend')) * 1e9) / shares, '₫');
  },
};

/*
 * ── 2. BVPS ────────────────────────────────────────────────────────────────────────────
 */

export const BVPS: FormulaModule = {
  spec: {
    id: 'bvps',
    categoryId: 'fundamentals',
    name: { vi: 'BVPS — giá trị sổ sách mỗi cổ phiếu', en: 'Book value per share' },
    description: {
      vi: 'Mỗi cổ phiếu đang nắm giữ bao nhiêu đồng vốn chủ sở hữu trên sổ sách.',
      en: 'How much book equity each share currently represents.',
    },
    latex: 'BVPS = \\frac{\\text{Vốn chủ sở hữu}}{\\text{Số CP lưu hành}} \\times 10^9',
    expression: {
      vi: 'BVPS = Vốn chủ sở hữu ÷ Số cổ phiếu lưu hành × 10^9',
      en: 'BVPS = Equity ÷ Shares outstanding × 10^9',
    },
    substitution: '{equity} ÷ {sharesOutstanding} × 10^9',
    symbols: [
      {
        latex: 'BVPS',
        meaning: {
          vi: 'giá trị sổ sách mỗi cổ phiếu, tính bằng ₫',
          en: 'book value per share, in ₫',
        },
      },
      {
        latex: '\\text{Vốn chủ sở hữu}',
        meaning: { vi: 'vốn chủ sở hữu cuối kỳ, tỷ ₫', en: 'equity at period end, billion ₫' },
      },
      {
        latex: '\\text{Số CP lưu hành}',
        meaning: {
          vi: 'số cổ phiếu (CP) phổ thông đang lưu hành',
          en: 'number of common shares outstanding',
        },
      },
      {
        latex: '10^9',
        meaning: { vi: 'đổi tỷ ₫ ra ₫', en: 'converts billion ₫ into ₫' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bvps', 'gia tri so sach', 'book value', 'chi so dn'],
    resultUnit: '₫',
    variables: [equity, sharesOutstanding],
    explanation: {
      meaning: {
        vi: 'Số tiền lý thuyết mỗi cổ phiếu nhận được nếu doanh nghiệp giải thể và bán tài sản đúng giá sổ sách.',
        en: 'The theoretical amount each share would receive if the company were liquidated and its assets sold at exactly book value.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đọc báo cáo tài chính và muốn quy vốn chủ sở hữu hàng nghìn tỷ đồng ra mỗi cổ phiếu được bao nhiêu đồng, để đặt cạnh giá cổ phiếu hay so với năm trước.',
        en: "Use it when you read a financial statement and want to turn equity worth trillions of dong into dong per share, to set beside the share price or against last year's figure.",
      },
      howToRead: {
        vi: 'So với giá thị trường hiện tại của cổ phiếu: giá cao hơn con số này nghĩa là thị trường trả thêm cho khả năng làm ra lãi của công ty, giá thấp hơn nghĩa là thị trường định giá công ty dưới số vốn ghi trên sổ, thường vì lo công ty làm ăn kém đi.',
        en: "Compared with the current market price of the share: a price above this figure means the market is paying extra for the company's ability to earn profit, and a price below it means the market values the company at less than the equity on its books, usually out of worry that business is weakening.",
      },
      commonMistakes: {
        vi: 'Coi BVPS là giá trị thanh lý thật. Sổ sách ghi theo giá gốc, tài sản thực tế có thể bán được cao hơn hoặc thấp hơn nhiều.',
        en: 'Treating BVPS as the actual liquidation value. Book records are kept at historical cost, and assets may actually sell for much more or much less.',
      },
    },
    example: {
      title: {
        vi: 'FPT ngày 30/06/2026 — vốn chủ của cổ đông công ty mẹ 39.851,5 tỷ ₫, 1,71 tỷ cổ phiếu',
        en: 'FPT at 30 June 2026 — parent-company equity 39,851.5 billion ₫, 1.71 billion shares',
      },
      inputs: { equity: 39_851.5, sharesOutstanding: 1_714_326_422 },
      expected: 23_246,
      note: {
        vi: 'So với thị giá FPT phiên 11/09/2026 là 72.700 ₫: mỗi cổ phiếu chỉ có 23.246 ₫ vốn của cổ đông ghi trên sổ, chưa tới một phần ba giá ấy, nghĩa là khoảng 49.454 ₫ trong giá là phần thị trường trả cho khả năng làm ra lãi của FPT, không phải cho tài sản ghi trên sổ.',
        en: "Compared with FPT's 2026-09-11 close of 72,700 ₫: each share has only 23,246 ₫ of shareholders' equity on the books, under a third of that price, so about 49,454 ₫ of the price is what the market pays for FPT's ability to earn profit rather than for assets on the books.",
      },
      source: {
        vi: 'Bảng cân đối kế toán hợp nhất 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'bộ số FPT của WF-10',
        inputs: { equity: 36_456, sharesOutstanding: 1_470_000_000 },
        expected: 24_800,
      },
      {
        name: 'số cổ phiếu bằng 0 thì không chia được',
        inputs: { equity: 36_456, sharesOutstanding: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ sở hữu âm thì giá trị sổ sách không còn ý nghĩa',
        inputs: { equity: -5_000, sharesOutstanding: 1_000_000_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const shares = v('sharesOutstanding');
    if (shares === 0) {
      return fail(
        '₫',
        divideByZero(
          { vi: 'BVPS', en: 'BVPS' },
          { vi: 'Số cổ phiếu lưu hành', en: 'Shares outstanding' },
          {
            vi: 'Nhập số cổ phiếu đang lưu hành của doanh nghiệp.',
            en: "Enter the company's shares outstanding.",
          },
        ),
      );
    }
    const eq = v('equity');
    if (eq < 0) {
      return fail(
        '₫',
        meaningless(
          {
            vi: 'BVPS không có ý nghĩa khi vốn chủ sở hữu đang âm.',
            en: 'BVPS is not meaningful when equity is negative.',
          },
          {
            vi: 'Doanh nghiệp lỗ luỹ kế vượt vốn góp. Xem lại báo cáo tài chính trước khi định giá.',
            en: 'Accumulated losses exceed contributed capital. Review the financial statements before valuing the company.',
          },
        ),
      );
    }
    return ok((eq * 1e9) / shares, '₫');
  },
};

/*
 * ── 3. ROE ─────────────────────────────────────────────────────────────────────────────
 */

export const ROE: FormulaModule = {
  spec: {
    id: 'roe',
    categoryId: 'fundamentals',
    name: { vi: 'ROE — tỷ suất sinh lời trên vốn chủ', en: 'Return on equity' },
    description: {
      vi: 'Một đồng vốn của cổ đông làm ra bao nhiêu đồng lợi nhuận trong một năm.',
      en: 'How much profit each unit of shareholder capital generates in a year.',
    },
    latex: 'ROE = \\frac{\\text{LNST}}{\\text{Vốn chủ sở hữu}} \\times 100\\%',
    expression: {
      vi: 'ROE = Lợi nhuận sau thuế ÷ Vốn chủ sở hữu × 100',
      en: 'ROE = Net income after tax ÷ Equity × 100',
    },
    substitution: '{netIncome} ÷ {equity} × 100',
    symbols: [
      {
        latex: 'ROE',
        meaning: { vi: 'tỷ suất sinh lời trên vốn chủ, tính bằng %', en: 'return on equity, in %' },
      },
      {
        latex: '\\text{LNST}',
        meaning: {
          vi: 'lợi nhuận sau thuế trong kỳ, tỷ ₫',
          en: 'net income after tax for the period, billion ₫',
        },
      },
      {
        latex: '\\text{Vốn chủ sở hữu}',
        meaning: {
          vi: 'vốn chủ sở hữu trên bảng cân đối kế toán cuối kỳ, tỷ ₫',
          en: 'equity on the balance sheet at period end, billion ₫',
        },
      },
      {
        latex: '100',
        meaning: { vi: 'đổi tỷ lệ ra phần trăm', en: 'converts the ratio to a percentage' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roe', 'ty suat sinh loi', 'von chu so huu', 'return on equity', 'chi so dn'],
    resultUnit: '%',
    variables: [netIncome, equity],
    explanation: {
      meaning: {
        vi: 'Hiệu quả sử dụng vốn của cổ đông: bỏ 100 đồng vốn thì mỗi năm sinh ra bao nhiêu đồng lãi.',
        en: 'How efficiently shareholder capital is used: for every 100 units of capital invested, how many units of profit it generates each year.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đang lọc vài công ty để giữ lâu dài và muốn biết công ty nào làm ra nhiều lãi hơn trên chính số vốn thuộc về cổ đông.',
        en: 'Use it when you are shortlisting a few companies to hold for the long run and want to know which one earns more profit on the money that belongs to its shareholders.',
      },
      howToRead: {
        vi: 'So với lãi suất gửi tiết kiệm kỳ hạn một năm, khi lợi nhuận nhập vào là của cả năm: cao hơn nghĩa là vốn của cổ đông đang sinh lời hơn gửi ngân hàng, thấp hơn là kém cả gửi tiền. Số âm nghĩa là công ty đang lỗ trên vốn của cổ đông.',
        en: "Compared with the one-year savings deposit rate, when the profit entered covers a full year: higher means shareholders' capital is earning more than a bank deposit would, lower means it is earning less. A negative figure means the company is losing money on its shareholders' capital.",
      },
      commonMistakes: {
        vi: 'Chỉ nhìn ROE mà quên đòn bẩy: vay nợ nhiều làm vốn chủ nhỏ đi và thổi ROE lên cao, kèm theo rủi ro lớn hơn.',
        en: 'Looking only at ROE and forgetting leverage: heavy borrowing shrinks equity and inflates ROE, along with greater risk.',
      },
    },
    example: {
      title: {
        vi: 'FPT 6 tháng đầu 2026 — LNST 5.055,1 tỷ ₫ trên vốn chủ 39.851,5 tỷ ₫',
        en: 'FPT H1 2026 — net income 5,055.1 billion ₫ on equity of 39,851.5 billion ₫',
      },
      inputs: { netIncome: 5_055.1, equity: 39_851.5 },
      expected: 12.6848,
      note: {
        vi: 'So với lãi suất gửi tiết kiệm kỳ hạn một năm: 12,68% mới là lãi của 6 tháng, tức mỗi 100 đồng vốn của cổ đông FPT làm ra 12,68 đồng lãi trong nửa đầu 2026, nên chưa đặt cạnh lãi suất một năm được. Nếu nửa cuối năm lãi bằng nửa đầu thì cả năm khoảng 25,4%, đó mới là số để so với lãi suất ấy.',
        en: "Compared with a one-year savings deposit rate: 12.68% covers only 6 months, meaning each 100 dong of FPT shareholders' equity earned 12.68 dong in the first half of 2026, so it cannot yet be set beside a one-year rate. If the second half earns as much as the first, the full year comes to about 25.4%, and that is the figure to compare with the rate.",
      },
      source: {
        vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 và bảng cân đối kế toán 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT H1 2026 business results release and balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      { name: 'bộ số FPT của WF-10', inputs: { netIncome: 8_894, equity: 36_456 }, expected: 24.4 },
      {
        name: 'doanh nghiệp lỗ thì ROE âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, equity: 10_000 },
        expected: -12,
      },
      {
        name: 'vốn chủ bằng 0 thì không chia được',
        inputs: { netIncome: 8_894, equity: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ âm thì ROE vô nghĩa — ca kinh điển của nhóm',
        inputs: { netIncome: 500, equity: -2_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const eq = v('equity');
    if (eq === 0) {
      return fail(
        '%',
        divideByZero(
          { vi: 'ROE', en: 'ROE' },
          { vi: 'Vốn chủ sở hữu', en: 'Equity' },
          { vi: 'Nhập vốn chủ sở hữu khác 0.', en: 'Enter a non-zero equity value.' },
        ),
      );
    }
    if (eq < 0) {
      return fail(
        '%',
        meaningless(
          {
            vi: 'ROE không có ý nghĩa khi vốn chủ sở hữu đang âm: lãi chia cho vốn âm cho ra một con số gây hiểu lầm.',
            en: 'ROE is not meaningful when equity is negative: profit divided by negative capital produces a misleading number.',
          },
          {
            vi: 'Xem lỗ luỹ kế trên báo cáo tài chính, hoặc dùng ROA để thay thế.',
            en: 'Check accumulated losses on the financial statements, or use ROA instead.',
          },
        ),
      );
    }
    return ok((v('netIncome') / eq) * 100, '%');
  },
};

/*
 * ── 4. ROA ─────────────────────────────────────────────────────────────────────────────
 */

export const ROA: FormulaModule = {
  spec: {
    id: 'roa',
    categoryId: 'fundamentals',
    name: { vi: 'ROA — tỷ suất sinh lời trên tài sản', en: 'Return on assets' },
    description: {
      vi: 'Một đồng tài sản của doanh nghiệp tạo ra bao nhiêu đồng lợi nhuận.',
      en: 'How much profit each unit of company assets generates.',
    },
    latex: 'ROA = \\frac{\\text{LNST}}{\\text{Tổng tài sản}} \\times 100\\%',
    expression: {
      vi: 'ROA = Lợi nhuận sau thuế ÷ Tổng tài sản × 100',
      en: 'ROA = Net income after tax ÷ Total assets × 100',
    },
    substitution: '{netIncome} ÷ {totalAssets} × 100',
    symbols: [
      {
        latex: 'ROA',
        meaning: { vi: 'tỷ suất sinh lời trên tài sản, tính bằng %', en: 'return on assets, in %' },
      },
      {
        latex: '\\text{LNST}',
        meaning: {
          vi: 'lợi nhuận sau thuế trong kỳ, tỷ ₫',
          en: 'net income after tax for the period, billion ₫',
        },
      },
      {
        latex: '\\text{Tổng tài sản}',
        meaning: {
          vi: 'tổng tài sản trên bảng cân đối kế toán cuối kỳ, tỷ ₫',
          en: 'total assets on the balance sheet at period end, billion ₫',
        },
      },
      {
        latex: '100',
        meaning: { vi: 'đổi tỷ lệ ra phần trăm', en: 'converts the ratio to a percentage' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['roa', 'ty suat sinh loi', 'tong tai san', 'return on assets', 'chi so dn'],
    resultUnit: '%',
    variables: [netIncome, totalAssets],
    explanation: {
      meaning: {
        vi: 'Hiệu quả dùng toàn bộ tài sản — cả vốn tự có lẫn vốn vay — để tạo ra lợi nhuận.',
        en: 'How efficiently all assets — both equity-funded and debt-funded — are used to generate profit.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn so hai công ty cùng ngành mà một bên vay nợ nhiều hơn hẳn, và muốn biết bên nào làm ra nhiều lãi hơn trên toàn bộ tài sản, kể cả phần mua bằng tiền vay.',
        en: 'Use it when you compare two companies in the same industry where one borrows far more than the other, and want to know which earns more profit on everything it owns, including what was bought with borrowed money.',
      },
      howToRead: {
        vi: 'So với ROA của các công ty cùng ngành trong cùng kỳ: cao hơn nghĩa là công ty làm ra nhiều lãi hơn trên mỗi đồng tài sản đang dùng, thấp hơn là dùng tài sản kém hiệu quả hơn đối thủ. Số âm nghĩa là công ty đang lỗ.',
        en: 'Compared with the ROA of companies in the same industry for the same period: higher means the company earns more profit on each dong of assets it uses, lower means it uses its assets less efficiently than its rivals. A negative figure means the company is making a loss.',
      },
      commonMistakes: {
        vi: 'So ROA giữa hai ngành khác cấu trúc tài sản — ngân hàng và bán lẻ có mặt bằng ROA hoàn toàn khác nhau.',
        en: 'Comparing ROA across industries with different asset structures — banks and retailers sit on completely different ROA baselines.',
      },
    },
    example: {
      title: {
        vi: 'FPT 6 tháng đầu 2026 — LNST 5.055,1 tỷ ₫ trên tổng tài sản 73.734,2 tỷ ₫',
        en: 'FPT H1 2026 — net income 5,055.1 billion ₫ on total assets of 73,734.2 billion ₫',
      },
      inputs: { netIncome: 5_055.1, totalAssets: 73_734.2 },
      expected: 6.8558,
      note: {
        vi: 'So với tổng tài sản 73.734,2 tỷ ₫ của FPT: ROA 6,86% nghĩa là cứ 100 đồng tài sản công ty đang dùng, kể cả phần có nhờ vay nợ, làm ra 6,86 đồng lãi sau thuế trong 6 tháng đầu 2026. Đây mới là lãi nửa năm, nếu nửa cuối năm lãi bằng nửa đầu thì cả năm khoảng 13,7%.',
        en: "Compared with FPT's total assets of 73,734.2 billion ₫: ROA of 6.86% means every 100 dong of assets the company uses, including those funded by borrowing and other liabilities, earned 6.86 dong of after-tax profit in the first half of 2026. This is only half a year of profit, and if the second half earns as much as the first, the full year comes to about 13.7%.",
      },
      source: {
        vi: 'Bản tin kết quả kinh doanh 6 tháng đầu 2026 và bảng cân đối kế toán 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT H1 2026 business results release and balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { netIncome: 8_894, totalAssets: 68_000 },
        expected: 13.08,
      },
      {
        name: 'doanh nghiệp lỗ thì ROA âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, totalAssets: 50_000 },
        expected: -2.4,
      },
      {
        name: 'tổng tài sản bằng 0 thì không chia được',
        inputs: { netIncome: 8_894, totalAssets: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const assets = v('totalAssets');
    if (assets === 0) {
      return fail(
        '%',
        divideByZero(
          { vi: 'ROA', en: 'ROA' },
          { vi: 'Tổng tài sản', en: 'Total assets' },
          { vi: 'Nhập tổng tài sản khác 0.', en: 'Enter a non-zero total assets value.' },
        ),
      );
    }
    return ok((v('netIncome') / assets) * 100, '%');
  },
};

/*
 * ── 5. ROS — biên lợi nhuận ròng ───────────────────────────────────────────────────────
 */

export const BIEN_LOI_NHUAN_RONG: FormulaModule = {
  spec: {
    id: 'bien-loi-nhuan-rong',
    categoryId: 'fundamentals',
    name: { vi: 'ROS — biên lợi nhuận ròng', en: 'Net profit margin' },
    description: {
      vi: 'Cứ 100 đồng doanh thu thì doanh nghiệp giữ lại được bao nhiêu đồng lãi ròng.',
      en: 'Out of every 100 units of revenue, how much the company keeps as net profit.',
    },
    latex: 'ROS = \\frac{\\text{LNST}}{\\text{Doanh thu thuần}} \\times 100\\%',
    expression: {
      vi: 'ROS = Lợi nhuận sau thuế ÷ Doanh thu thuần × 100',
      en: 'ROS = Net income after tax ÷ Net revenue × 100',
    },
    substitution: '{netIncome} ÷ {revenue} × 100',
    symbols: [
      {
        latex: 'ROS',
        meaning: { vi: 'biên lợi nhuận ròng, tính bằng %', en: 'net profit margin, in %' },
      },
      {
        latex: '\\text{LNST}',
        meaning: {
          vi: 'lợi nhuận sau thuế trong kỳ, tỷ ₫',
          en: 'net income after tax for the period, billion ₫',
        },
      },
      {
        latex: '\\text{Doanh thu thuần}',
        meaning: {
          vi: 'doanh thu bán hàng và cung cấp dịch vụ sau các khoản giảm trừ, tỷ ₫',
          en: 'revenue from goods and services after deductions, billion ₫',
        },
      },
      {
        latex: '100',
        meaning: { vi: 'đổi tỷ lệ ra phần trăm', en: 'converts the ratio to a percentage' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['ros', 'bien loi nhuan rong', 'net margin', 'profit margin', 'chi so dn'],
    resultUnit: '%',
    variables: [netIncome, revenue],
    explanation: {
      meaning: {
        vi: 'Phần trăm doanh thu còn lại sau khi trừ mọi chi phí, thuế và lãi vay.',
        en: 'The percentage of revenue left after deducting all costs, taxes, and interest expense.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đọc báo cáo tài chính thấy doanh thu tăng mạnh mà lãi không tăng theo, và muốn biết mỗi đồng bán hàng công ty còn giữ lại được bao nhiêu sau mọi khoản chi.',
        en: 'Use it when you read a financial statement where revenue jumped but profit lagged behind, and want to know how much of each dong of sales the company keeps after every expense.',
      },
      howToRead: {
        vi: 'So với biên ròng của chính công ty ở các kỳ trước: cao hơn nghĩa là mỗi đồng doanh thu giữ lại được nhiều lãi hơn, thấp hơn là chi phí đang ăn vào lãi nhiều hơn. Số âm nghĩa là công ty đang lỗ, trên 100% là lãi đến chủ yếu từ khoản ngoài bán hàng.',
        en: "Compared with the company's own net margin in earlier periods: higher means each dong of revenue is keeping more profit, lower means costs are eating more of it than before. A negative figure means the company is making a loss, and above 100% means profit comes mainly from sources other than sales.",
      },
      commonMistakes: {
        vi: 'So biên ròng giữa bán lẻ (thường vài phần trăm) với phần mềm (vài chục phần trăm) rồi kết luận bán lẻ kém.',
        en: 'Comparing net margin between retail (typically a few percent) and software (tens of percent) and concluding that retail is doing poorly.',
      },
    },
    example: {
      title: {
        vi: 'FPT 6 tháng đầu 2026 — LNST 5.055,1 tỷ ₫ trên doanh thu thuần 26.268,5 tỷ ₫',
        en: 'FPT H1 2026 — net income 5,055.1 billion ₫ on net revenue of 26,268.5 billion ₫',
      },
      inputs: { netIncome: 5_055.1, revenue: 26_268.5 },
      expected: 19.244,
      note: {
        vi: 'So với toàn bộ doanh thu thuần 26.268,5 tỷ ₫ của FPT: lãi sau thuế chiếm 19,24%, tức cứ 100 đồng doanh thu trong 6 tháng đầu 2026, sau khi trừ mọi chi phí, thuế và lãi vay, còn lại 19,24 đồng lãi thuộc về cổ đông công ty mẹ.',
        en: "Compared with FPT's total net revenue of 26,268.5 billion ₫: after-tax profit is 19.24% of it, so for every 100 dong of revenue in the first half of 2026, 19.24 dong of profit was left for the parent company's shareholders after all costs, tax and interest.",
      },
      source: {
        vi: 'Báo cáo kết quả hoạt động kinh doanh hợp nhất 6 tháng đầu 2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated H1 2026 income statement, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      { name: 'ca thường', inputs: { netIncome: 8_894, revenue: 62_850 }, expected: 14.15 },
      {
        name: 'doanh nghiệp lỗ thì biên ròng âm — vẫn là con số có nghĩa',
        inputs: { netIncome: -1_200, revenue: 30_000 },
        expected: -4,
      },
      {
        name: 'doanh thu bằng 0 — ca kinh điển của nhóm',
        inputs: { netIncome: 8_894, revenue: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const rev = v('revenue');
    if (rev === 0) {
      return fail(
        '%',
        divideByZero(
          { vi: 'ROS', en: 'ROS' },
          { vi: 'Doanh thu thuần', en: 'Net revenue' },
          {
            vi: 'Nhập doanh thu thuần khác 0, hoặc chọn kỳ có doanh thu.',
            en: 'Enter a non-zero net revenue, or choose a period with revenue.',
          },
        ),
      );
    }
    return ok((v('netIncome') / rev) * 100, '%');
  },
};

/*
 * ── 6. Biên lợi nhuận gộp ──────────────────────────────────────────────────────────────
 */

export const BIEN_LOI_NHUAN_GOP: FormulaModule = {
  spec: {
    id: 'bien-loi-nhuan-gop',
    categoryId: 'fundamentals',
    name: { vi: 'Biên lợi nhuận gộp', en: 'Gross profit margin' },
    description: {
      vi: 'Phần trăm doanh thu còn lại sau khi trừ giá vốn hàng bán.',
      en: 'The percentage of revenue left after deducting cost of goods sold.',
    },
    latex:
      '\\text{Biên gộp} = \\frac{\\text{Doanh thu} - \\text{Giá vốn}}{\\text{Doanh thu}} \\times 100\\%',
    expression: {
      vi: 'Biên gộp = (Doanh thu thuần − Giá vốn hàng bán) ÷ Doanh thu thuần × 100',
      en: 'Gross margin = (Net revenue − Cost of goods sold) ÷ Net revenue × 100',
    },
    substitution: '({revenue} − {cogs}) ÷ {revenue} × 100',
    symbols: [
      {
        latex: '\\text{Biên gộp}',
        meaning: { vi: 'biên lợi nhuận gộp, tính bằng %', en: 'gross profit margin, in %' },
      },
      {
        latex: '\\text{Doanh thu}',
        meaning: {
          vi: 'doanh thu thuần trong kỳ, tỷ ₫',
          en: 'net revenue for the period, billion ₫',
        },
      },
      {
        latex: '\\text{Giá vốn}',
        meaning: {
          vi: 'giá vốn hàng bán trong kỳ, tỷ ₫',
          en: 'cost of goods sold for the period, billion ₫',
        },
      },
      {
        latex: '100',
        meaning: { vi: 'đổi tỷ lệ ra phần trăm', en: 'converts the ratio to a percentage' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['bien loi nhuan gop', 'gross margin', 'gia von', 'chi so dn'],
    resultUnit: '%',
    variables: [
      revenue,
      numberVar('cogs', { vi: 'Giá vốn hàng bán', en: 'Cost of goods sold' }, 'tỷ ₫', 38_400, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Chi phí trực tiếp tạo ra hàng hoá, dịch vụ đã bán trong kỳ.',
          en: 'Direct cost of producing the goods and services sold during the period.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Sức mạnh giá bán so với chi phí trực tiếp — chưa tính chi phí bán hàng, quản lý hay lãi vay.',
        en: 'Pricing power relative to direct costs — before selling, administrative, or interest expenses.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đọc tin giá vật tư tăng hay đối thủ hạ giá bán, và muốn biết mỗi đồng bán hàng còn lại bao nhiêu sau khi trừ riêng chi phí làm ra món hàng đó.',
        en: 'Use it when you read news of rising raw-material costs or rivals cutting prices, and want to know how much of each dong of sales is left after subtracting just the cost of making the goods themselves.',
      },
      howToRead: {
        vi: 'So với biên gộp của các công ty cùng ngành trong cùng kỳ: cao hơn nghĩa là công ty bán được giá tốt hơn so với chi phí làm ra hàng, thấp hơn là đang phải bán sát giá vốn hơn đối thủ. Số âm nghĩa là công ty đang bán dưới giá vốn.',
        en: 'Compared with the gross margin of companies in the same industry for the same period: higher means the company gets a better price relative to what the goods cost to make, lower means it sells closer to cost than its rivals. A negative figure means the company is selling below cost.',
      },
      commonMistakes: {
        vi: 'Nhầm biên gộp với biên ròng — biên gộp cao vẫn có thể lỗ ròng nếu chi phí vận hành và lãi vay quá lớn.',
        en: 'Confusing gross margin with net margin — a high gross margin can still coexist with a net loss if operating costs and interest expense are too large.',
      },
    },
    example: {
      title: {
        vi: 'FPT 6 tháng đầu 2026 — doanh thu thuần 26.268,5 tỷ ₫, giá vốn 17.745 tỷ ₫',
        en: 'FPT H1 2026 — net revenue 26,268.5 billion ₫, cost of goods sold 17,745 billion ₫',
      },
      inputs: { revenue: 26_268.5, cogs: 17_745 },
      expected: 32.4476,
      note: {
        vi: 'So với doanh thu thuần 26.268,5 tỷ ₫ của FPT: trừ giá vốn 17.745 tỷ ₫ còn 8.523,5 tỷ ₫ lãi gộp, tức cứ 100 đồng doanh thu trong 6 tháng đầu 2026 thì còn khoảng 32,45 đồng để trang trải chi phí bán hàng, quản lý, lãi vay và thuế, phần còn lại sau đó mới là lãi ròng.',
        en: "Compared with FPT's net revenue of 26,268.5 billion ₫: taking away the 17,745 billion ₫ cost of goods sold leaves 8,523.5 billion ₫ of gross profit, so of every 100 dong of revenue in the first half of 2026 about 32.45 dong remained to cover selling and administrative costs, interest and tax, and only what is left after that is net profit.",
      },
      source: {
        vi: 'Báo cáo kết quả hoạt động kinh doanh hợp nhất 6 tháng đầu 2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated H1 2026 income statement, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      { name: 'ca thường', inputs: { revenue: 62_850, cogs: 38_400 }, expected: 38.9 },
      {
        name: 'giá vốn cao hơn doanh thu thì biên gộp âm — bán dưới giá vốn',
        inputs: { revenue: 30_000, cogs: 33_000 },
        expected: -10,
      },
      {
        name: 'doanh thu bằng 0 — ca kinh điển của nhóm',
        inputs: { revenue: 0, cogs: 38_400 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const rev = v('revenue');
    if (rev === 0) {
      return fail(
        '%',
        divideByZero(
          { vi: 'biên lợi nhuận gộp', en: 'gross profit margin' },
          { vi: 'Doanh thu thuần', en: 'Net revenue' },
          { vi: 'Nhập doanh thu thuần khác 0.', en: 'Enter a non-zero net revenue.' },
        ),
      );
    }
    return ok(((rev - v('cogs')) / rev) * 100, '%');
  },
};

/*
 * ── 7. D/E — nợ trên vốn chủ ───────────────────────────────────────────────────────────
 */

export const NO_TREN_VON_CHU: FormulaModule = {
  spec: {
    id: 'no-tren-von-chu',
    categoryId: 'fundamentals',
    name: { vi: 'D/E — hệ số nợ trên vốn chủ', en: 'Debt to equity ratio' },
    description: {
      vi: 'Doanh nghiệp đang vay bao nhiêu đồng nợ trên mỗi đồng vốn của cổ đông.',
      en: 'How much debt the company carries for every unit of shareholder capital.',
    },
    latex: 'D/E = \\frac{\\text{Tổng nợ phải trả}}{\\text{Vốn chủ sở hữu}}',
    expression: {
      vi: 'D/E = Tổng nợ phải trả ÷ Vốn chủ sở hữu',
      en: 'D/E = Total liabilities ÷ Equity',
    },
    substitution: '{totalLiabilities} ÷ {equity}',
    symbols: [
      {
        latex: 'D/E',
        meaning: {
          vi: 'hệ số nợ trên vốn chủ, tính bằng lần',
          en: 'debt-to-equity ratio, in times',
        },
      },
      {
        latex: 'D',
        meaning: {
          vi: 'nợ (debt), tức tổng nợ phải trả, tỷ ₫',
          en: 'debt, i.e. total liabilities, billion ₫',
        },
      },
      {
        latex: 'E',
        meaning: { vi: 'vốn chủ sở hữu (equity), tỷ ₫', en: 'equity, billion ₫' },
      },
      {
        latex: '\\text{Tổng nợ phải trả}',
        meaning: {
          vi: 'toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán, không riêng nợ vay, tỷ ₫',
          en: 'all short- and long-term liabilities on the balance sheet, not just borrowings, billion ₫',
        },
      },
      {
        latex: '\\text{Vốn chủ sở hữu}',
        meaning: {
          vi: 'vốn chủ sở hữu trên bảng cân đối kế toán cuối kỳ, tỷ ₫',
          en: 'equity on the balance sheet at period end, billion ₫',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['de', 'd e', 'no tren von chu', 'don bay', 'debt to equity', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      /*
       * Khoá `totalLiabilities`, KHÔNG phải `totalDebt`.
       *
       * `ev` cũng có khoá `totalDebt`, cùng đơn vị tỷ ₫, nhưng nghĩa hẹp hơn hẳn — nhãn của nó là
       * "Nợ vay", tức chỉ nợ vay có lãi. Ô ở đây là TOÀN BỘ nợ phải trả. Hai nghĩa khác nhau mà
       * trùng cả tên lẫn đơn vị thì `presetInputs()` không tách được, nên bộ mẫu đổ tổng nợ phải
       * trả vào ô "Nợ vay" của `ev` và ra một giá trị doanh nghiệp thổi phồng.
       *
       * `ncav-tren-co-phieu` đã có sẵn khoá `totalLiabilities` với đúng nghĩa này (và mô tả cũng
       * ghi rõ "không riêng nợ vay"), nên đây là gộp về khoá đã có chứ không phải đặt tên mới.
       */
      numberVar(
        'totalLiabilities',
        { vi: 'Tổng nợ phải trả', en: 'Total liabilities' },
        'tỷ ₫',
        22_500,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán.',
            en: 'All short-term and long-term debt on the balance sheet.',
          },
        },
      ),
      equity,
    ],
    explanation: {
      meaning: {
        vi: 'Mức độ dùng đòn bẩy tài chính: doanh nghiệp dựa vào tiền vay nhiều hay ít so với vốn tự có.',
        en: 'The degree of financial leverage: how much the company relies on borrowed money relative to its own capital.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn nghe tin lãi suất cho vay đang tăng và muốn biết công ty có cổ phiếu mình định mua đang gánh khoản nợ lớn cỡ nào so với phần vốn thuộc về cổ đông.',
        en: 'Use it when you hear that lending rates are rising and want to know how large a debt load the company whose shares you plan to buy is carrying compared with the capital that belongs to its shareholders.',
      },
      howToRead: {
        vi: 'So với hệ số của các công ty cùng ngành ở cùng thời điểm: cao hơn nghĩa là công ty gánh nhiều nợ hơn đối thủ trên mỗi đồng vốn của cổ đông, thấp hơn là nhẹ nợ hơn. Trên 1 nghĩa là tổng nợ phải trả đã nhiều hơn số vốn thuộc về cổ đông.',
        en: "Compared with the ratio of companies in the same industry at the same time: higher means the company carries more debt than its rivals for each dong of shareholders' capital, lower means it is less indebted. Above 1 means total liabilities already exceed the capital that belongs to shareholders.",
      },
      commonMistakes: {
        vi: 'Coi mọi khoản nợ như nhau — nợ chiếm dụng nhà cung cấp không tốn lãi, khác hẳn nợ vay ngân hàng.',
        en: 'Treating all debt as the same — trade payables to suppliers carry no interest, unlike bank borrowings.',
      },
    },
    example: {
      title: {
        vi: 'FPT ngày 30/06/2026 — nợ phải trả 32.738,4 tỷ ₫ trên tổng vốn chủ 40.995,7 tỷ ₫',
        en: 'FPT at 30 June 2026 — total liabilities 32,738.4 billion ₫ against total equity of 40,995.7 billion ₫',
      },
      inputs: { totalLiabilities: 32_738.4, equity: 40_995.7 },
      expected: 0.7986,
      note: {
        vi: 'So với mốc 1 lần: 0,8 lần nghĩa là tổng nợ phải trả 32.738,4 tỷ ₫ của FPT vẫn ít hơn tổng vốn chủ 40.995,7 tỷ ₫, cứ 1 đồng vốn chủ có khoảng 0,8 đồng nợ phải trả. Số nợ ấy gồm cả khoản không tính lãi như tiền còn nợ nhà cung cấp, nên phần thật sự đi vay còn ít hơn 0,8 đồng.',
        en: "Compared with the 1 times mark: 0.8 times means FPT's total liabilities of 32,738.4 billion ₫ are still smaller than its total equity of 40,995.7 billion ₫, about 0.8 dong of liabilities for every 1 dong of equity. Those liabilities include interest-free items such as money owed to suppliers, so the part that is actual borrowing is less than 0.8 dong.",
      },
      source: {
        vi: 'Bảng cân đối kế toán hợp nhất 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      { name: 'ca thường', inputs: { totalLiabilities: 22_500, equity: 36_456 }, expected: 0.6172 },
      {
        name: 'đòn bẩy cao — nợ gấp hơn 3 lần vốn chủ',
        inputs: { totalLiabilities: 80_000, equity: 25_000 },
        expected: 3.2,
      },
      {
        name: 'vốn chủ bằng 0 thì không chia được',
        inputs: { totalLiabilities: 22_500, equity: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ âm thì hệ số nợ vô nghĩa — ca kinh điển của nhóm',
        inputs: { totalLiabilities: 22_500, equity: -3_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const eq = v('equity');
    if (eq === 0) {
      return fail(
        'lần',
        divideByZero(
          { vi: 'D/E', en: 'D/E' },
          { vi: 'Vốn chủ sở hữu', en: 'Equity' },
          { vi: 'Nhập vốn chủ sở hữu khác 0.', en: 'Enter a non-zero equity value.' },
        ),
      );
    }
    if (eq < 0) {
      return fail(
        'lần',
        meaningless(
          {
            vi: 'D/E không có ý nghĩa khi vốn chủ sở hữu đang âm: hệ số ra âm dù doanh nghiệp ngập trong nợ.',
            en: 'D/E is not meaningful when equity is negative: the ratio comes out negative even though the company is drowning in debt.',
          },
          {
            vi: 'Vốn chủ âm tự nó đã là tín hiệu rủi ro nặng. Xem lỗ luỹ kế trên báo cáo tài chính.',
            en: 'Negative equity is itself a serious risk signal. Check accumulated losses on the financial statements.',
          },
        ),
      );
    }
    return ok(v('totalLiabilities') / eq, 'lần');
  },
};

/*
 * ── 8. Hệ số thanh toán hiện hành ──────────────────────────────────────────────────────
 */

export const THANH_TOAN_HIEN_HANH: FormulaModule = {
  spec: {
    id: 'thanh-toan-hien-hanh',
    categoryId: 'fundamentals',
    name: { vi: 'Hệ số thanh toán hiện hành', en: 'Current ratio' },
    description: {
      vi: 'Tài sản ngắn hạn gấp bao nhiêu lần nợ phải trả trong 12 tháng tới.',
      en: 'How many times current assets cover the liabilities due within the next 12 months.',
    },
    latex: '\\text{Current ratio} = \\frac{\\text{Tài sản ngắn hạn}}{\\text{Nợ ngắn hạn}}',
    expression: {
      vi: 'Hệ số hiện hành = Tài sản ngắn hạn ÷ Nợ ngắn hạn',
      en: 'Current ratio = Current assets ÷ Current liabilities',
    },
    substitution: '{currentAssets} ÷ {currentLiabilities}',
    symbols: [
      {
        latex: '\\text{Current ratio}',
        meaning: { vi: 'hệ số thanh toán hiện hành, tính bằng lần', en: 'current ratio, in times' },
      },
      {
        latex: '\\text{Tài sản ngắn hạn}',
        meaning: {
          vi: 'tiền, đầu tư ngắn hạn, phải thu, hàng tồn kho và tài sản ngắn hạn khác, tỷ ₫',
          en: 'cash, short-term investments, receivables, inventory and other current assets, billion ₫',
        },
      },
      {
        latex: '\\text{Nợ ngắn hạn}',
        meaning: {
          vi: 'các khoản phải trả trong vòng 12 tháng tới, tỷ ₫',
          en: 'amounts payable within the next 12 months, billion ₫',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['thanh toan hien hanh', 'current ratio', 'thanh khoan', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('currentAssets', { vi: 'Tài sản ngắn hạn', en: 'Current assets' }, 'tỷ ₫', 42_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tiền, đầu tư ngắn hạn, phải thu, hàng tồn kho và tài sản ngắn hạn khác, tức dòng Tài sản ngắn hạn trên bảng cân đối.',
          en: 'Cash, short-term investments, receivables, inventory and other current assets, i.e. the Current assets line of the balance sheet.',
        },
      }),
      currentLiabilities,
    ],
    explanation: {
      meaning: {
        vi: 'Khả năng dùng tài sản ngắn hạn để trả các khoản nợ sắp đến hạn.',
        en: 'The ability to use current assets to pay off liabilities coming due.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đọc tin một công ty sắp phải trả một khoản nợ lớn và muốn biết tiền mặt, tiền khách còn nợ và hàng trong kho của nó có đủ trả nợ đến hạn trong năm không.',
        en: 'Use it when you read that a company has a large debt coming due and want to know whether its cash, the money customers still owe it and the goods in its warehouse can cover the debts falling due within the year.',
      },
      howToRead: {
        vi: 'So với mốc 1 lần: trên 1 nghĩa là tài sản ngắn hạn đủ trả hết nợ đến hạn trong năm và còn dư, dưới 1 là chưa đủ, công ty phải trông vào tiền làm ra sau này hoặc vay thêm mới trả kịp.',
        en: 'Compared with the 1 mark: above 1 means current assets are enough to pay off all the debts falling due within the year with some to spare, below 1 means they fall short, so the company must count on cash it has yet to earn or on new borrowing to pay on time.',
      },
      commonMistakes: {
        vi: 'Yên tâm với hệ số cao mà không nhìn cơ cấu: tài sản ngắn hạn toàn hàng tồn kho khó bán thì hệ số cao cũng không cứu được.',
        en: 'Taking comfort in a high ratio without looking at its composition: if current assets are mostly hard-to-sell inventory, a high ratio will not save the company.',
      },
    },
    example: {
      title: {
        vi: 'FPT ngày 30/06/2026 — tài sản ngắn hạn 45.702 tỷ ₫, nợ ngắn hạn 29.365,3 tỷ ₫',
        en: 'FPT at 30 June 2026 — current assets 45,702 billion ₫, current liabilities 29,365.3 billion ₫',
      },
      inputs: { currentAssets: 45_702, currentLiabilities: 29_365.3 },
      expected: 1.5563,
      note: {
        vi: 'So với mốc 1 lần: 1,56 lần nghĩa là tài sản ngắn hạn 45.702 tỷ ₫ của FPT đủ trả hết 29.365,3 tỷ ₫ nợ đến hạn trong 12 tháng tính từ 30/06/2026 mà vẫn dư khoảng 16.336,7 tỷ ₫, chưa cần trông vào tiền làm ra sau này hay vay thêm.',
        en: "Compared with the 1 times mark: 1.56 times means FPT's current assets of 45,702 billion ₫ cover all 29,365.3 billion ₫ of liabilities due within 12 months of 30 June 2026 with about 16,336.7 billion ₫ to spare, without relying on future earnings or new borrowing.",
      },
      source: {
        vi: 'Bảng cân đối kế toán hợp nhất 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { currentAssets: 42_000, currentLiabilities: 28_000 },
        expected: 1.5,
      },
      {
        name: 'dưới 1 lần — nợ đến hạn vượt tài sản ngắn hạn',
        inputs: { currentAssets: 18_000, currentLiabilities: 24_000 },
        expected: 0.75,
      },
      {
        name: 'nợ ngắn hạn bằng 0 — ca kinh điển của nhóm',
        inputs: { currentAssets: 42_000, currentLiabilities: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const liabilities = v('currentLiabilities');
    if (liabilities === 0) {
      return fail(
        'lần',
        divideByZero(
          { vi: 'hệ số thanh toán hiện hành', en: 'current ratio' },
          { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
          {
            vi: 'Doanh nghiệp không có nợ ngắn hạn thì không cần hệ số này — thanh khoản đã an toàn.',
            en: 'A company with no current liabilities does not need this ratio — its liquidity is already safe.',
          },
        ),
      );
    }
    return ok(v('currentAssets') / liabilities, 'lần');
  },
};

/*
 * ── 9. Hệ số thanh toán nhanh ──────────────────────────────────────────────────────────
 */

export const THANH_TOAN_NHANH: FormulaModule = {
  spec: {
    id: 'thanh-toan-nhanh',
    categoryId: 'fundamentals',
    name: { vi: 'Hệ số thanh toán nhanh', en: 'Quick ratio' },
    description: {
      vi: 'Khả năng trả nợ ngắn hạn khi không kịp bán hàng tồn kho.',
      en: 'The ability to pay current liabilities without having time to sell inventory.',
    },
    latex:
      '\\text{Quick ratio} = \\frac{\\text{Tài sản ngắn hạn} - \\text{Hàng tồn kho}}{\\text{Nợ ngắn hạn}}',
    expression: {
      vi: 'Hệ số nhanh = (Tài sản ngắn hạn − Hàng tồn kho) ÷ Nợ ngắn hạn',
      en: 'Quick ratio = (Current assets − Inventory) ÷ Current liabilities',
    },
    substitution: '({currentAssets} − {inventory}) ÷ {currentLiabilities}',
    symbols: [
      {
        latex: '\\text{Quick ratio}',
        meaning: { vi: 'hệ số thanh toán nhanh, tính bằng lần', en: 'quick ratio, in times' },
      },
      {
        latex: '\\text{Tài sản ngắn hạn}',
        meaning: {
          vi: 'tiền, đầu tư ngắn hạn, phải thu, hàng tồn kho và tài sản ngắn hạn khác, tỷ ₫',
          en: 'cash, short-term investments, receivables, inventory and other current assets, billion ₫',
        },
      },
      {
        latex: '\\text{Hàng tồn kho}',
        meaning: {
          vi: 'giá trị hàng tồn kho, phần tài sản ngắn hạn khó đổi ra tiền nhất, tỷ ₫',
          en: 'the value of inventory, the part of current assets hardest to turn into cash, billion ₫',
        },
      },
      {
        latex: '\\text{Nợ ngắn hạn}',
        meaning: {
          vi: 'các khoản phải trả trong vòng 12 tháng tới, tỷ ₫',
          en: 'amounts payable within the next 12 months, billion ₫',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['thanh toan nhanh', 'quick ratio', 'acid test', 'thanh khoan', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('currentAssets', { vi: 'Tài sản ngắn hạn', en: 'Current assets' }, 'tỷ ₫', 42_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tiền, đầu tư ngắn hạn, phải thu, hàng tồn kho và tài sản ngắn hạn khác, tức dòng Tài sản ngắn hạn trên bảng cân đối.',
          en: 'Cash, short-term investments, receivables, inventory and other current assets, i.e. the Current assets line of the balance sheet.',
        },
      }),
      numberVar('inventory', { vi: 'Hàng tồn kho', en: 'Inventory' }, 'tỷ ₫', 9_500, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Giá trị hàng tồn kho — phần tài sản ngắn hạn khó đổi thành tiền nhanh nhất.',
          en: 'The value of inventory — the current asset that is hardest to convert into cash quickly.',
        },
      }),
      currentLiabilities,
    ],
    explanation: {
      meaning: {
        vi: 'Phép thử khắt khe hơn hệ số hiện hành: loại hàng tồn kho ra vì bán được hàng cần thời gian.',
        en: 'A stricter test than the current ratio: it excludes inventory because selling goods takes time.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn xem một công ty bất động sản, thép hay bán lẻ đang tồn nhiều hàng, và muốn biết nếu số hàng ấy chưa bán được thì nó còn đủ sức trả nợ sắp đến hạn không.',
        en: 'Use it when you are looking at a property, steel or retail company sitting on a lot of unsold goods and want to know whether it could still meet its debts coming due if those goods do not sell.',
      },
      howToRead: {
        vi: 'So với mốc 1 lần: trên 1 nghĩa là chưa cần bán món hàng nào trong kho, phần tài sản ngắn hạn còn lại vẫn đủ trả hết nợ đến hạn trong năm, dưới 1 là việc trả nợ đúng hạn phụ thuộc vào chuyện bán được hàng trong kho.',
        en: 'Compared with the 1 mark: above 1 means that without selling anything from inventory, the rest of the current assets can still pay off all the debts falling due within the year, and below 1 means paying on time depends on selling the goods in inventory.',
      },
      commonMistakes: {
        vi: 'Quên rằng khoản phải thu trong tử số cũng có thể khó đòi — hệ số nhanh cao chưa chắc tiền đã về kịp.',
        en: 'Forgetting that receivables in the numerator can also be hard to collect — a high quick ratio does not guarantee the cash arrives on time.',
      },
    },
    example: {
      title: {
        vi: 'FPT ngày 30/06/2026 — tài sản ngắn hạn 45.702 tỷ ₫, tồn kho 1.183,1 tỷ ₫, nợ ngắn hạn 29.365,3 tỷ ₫',
        en: 'FPT at 30 June 2026 — current assets 45,702 billion ₫, inventory 1,183.1 billion ₫, current liabilities 29,365.3 billion ₫',
      },
      inputs: { currentAssets: 45_702, inventory: 1_183.1, currentLiabilities: 29_365.3 },
      expected: 1.516,
      note: {
        vi: 'So với mốc 1 lần: 1,52 lần nghĩa là chưa cần bán món hàng nào trong kho, tài sản ngắn hạn còn lại của FPT vẫn đủ trả hết 29.365,3 tỷ ₫ nợ ngắn hạn và dư khoảng 15.153,6 tỷ ₫. Kết quả sát hệ số hiện hành 1,56 lần vì tồn kho chỉ 1.183,1 tỷ ₫, khoảng 2,6% tài sản ngắn hạn.',
        en: "Compared with the 1 times mark: 1.52 times means that without selling anything from inventory, FPT's remaining current assets still cover all 29,365.3 billion ₫ of current liabilities with about 15,153.6 billion ₫ to spare. The result is close to the current ratio of 1.56 times because inventory is only 1,183.1 billion ₫, about 2.6% of current assets.",
      },
      source: {
        vi: 'Bảng cân đối kế toán hợp nhất 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { currentAssets: 42_000, inventory: 9_500, currentLiabilities: 28_000 },
        expected: 1.1607,
      },
      {
        name: 'nợ ngắn hạn bằng 0 — ca kinh điển của nhóm',
        inputs: { currentAssets: 42_000, inventory: 9_500, currentLiabilities: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'tồn kho lớn hơn tài sản ngắn hạn thì số liệu chưa nhất quán',
        inputs: { currentAssets: 8_000, inventory: 9_500, currentLiabilities: 5_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const liabilities = v('currentLiabilities');
    if (liabilities === 0) {
      return fail(
        'lần',
        divideByZero(
          { vi: 'hệ số thanh toán nhanh', en: 'quick ratio' },
          { vi: 'Nợ ngắn hạn', en: 'Current liabilities' },
          {
            vi: 'Doanh nghiệp không có nợ ngắn hạn thì không cần hệ số này — thanh khoản đã an toàn.',
            en: 'A company with no current liabilities does not need this ratio — its liquidity is already safe.',
          },
        ),
      );
    }
    const assets = v('currentAssets');
    const inventory = v('inventory');
    if (inventory > assets) {
      return fail(
        'lần',
        meaningless(
          {
            vi: 'Hàng tồn kho đang lớn hơn tài sản ngắn hạn — hai số liệu này mâu thuẫn vì tồn kho là một phần của tài sản ngắn hạn.',
            en: 'Inventory is larger than current assets — these two figures are inconsistent, since inventory is a part of current assets.',
          },
          {
            vi: 'Kiểm tra lại hai ô trên bảng cân đối kế toán, cùng một kỳ báo cáo.',
            en: 'Recheck both figures on the balance sheet for the same reporting period.',
          },
        ),
      );
    }
    return ok((assets - inventory) / liabilities, 'lần');
  },
};

/*
 * ── 10. Vòng quay tổng tài sản ─────────────────────────────────────────────────────────
 */

export const VONG_QUAY_TONG_TAI_SAN: FormulaModule = {
  spec: {
    id: 'vong-quay-tong-tai-san',
    categoryId: 'fundamentals',
    name: { vi: 'Vòng quay tổng tài sản', en: 'Total asset turnover' },
    description: {
      vi: 'Một đồng tài sản tạo ra bao nhiêu đồng doanh thu trong một năm.',
      en: 'How much revenue each unit of assets generates in a year.',
    },
    latex: '\\text{Vòng quay} = \\frac{\\text{Doanh thu thuần}}{\\text{Tổng tài sản}}',
    expression: {
      vi: 'Vòng quay tài sản = Doanh thu thuần ÷ Tổng tài sản',
      en: 'Asset turnover = Net revenue ÷ Total assets',
    },
    substitution: '{revenue} ÷ {totalAssets}',
    symbols: [
      {
        latex: '\\text{Vòng quay}',
        meaning: {
          vi: 'vòng quay tổng tài sản, tính bằng số vòng trong kỳ',
          en: 'total asset turnover, counted in turns per period',
        },
      },
      {
        latex: '\\text{Doanh thu thuần}',
        meaning: {
          vi: 'doanh thu bán hàng và cung cấp dịch vụ sau các khoản giảm trừ, tỷ ₫',
          en: 'revenue from goods and services after deductions, billion ₫',
        },
      },
      {
        latex: '\\text{Tổng tài sản}',
        meaning: {
          vi: 'tổng tài sản trên bảng cân đối kế toán cuối kỳ, tỷ ₫',
          en: 'total assets on the balance sheet at period end, billion ₫',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['vong quay tai san', 'asset turnover', 'hieu suat', 'chi so dn'],
    resultUnit: 'vòng',
    variables: [revenue, totalAssets],
    explanation: {
      meaning: {
        vi: 'Tốc độ "quay" tài sản thành doanh thu — thước đo hiệu suất vận hành của doanh nghiệp.',
        en: 'The speed at which assets are "turned" into revenue — a measure of operating efficiency.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn thấy một công ty vừa mở thêm nhiều cửa hàng, nhà máy và muốn biết tài sản của nó giờ mang về bao nhiêu doanh thu, so với trước đó hay đối thủ cùng ngành.',
        en: 'Use it when you see a company that has just opened many new stores or plants and want to know how much revenue its assets now bring in, compared with before or with a rival in the same industry.',
      },
      howToRead: {
        vi: 'So với vòng quay của chính công ty ở các năm trước, khi doanh thu nhập vào là của cả năm: cao hơn nghĩa là mỗi đồng tài sản đang mang về nhiều doanh thu hơn, thấp hơn là mỗi đồng tài sản đang mang về ít doanh thu hơn trước.',
        en: "Compared with the company's own turnover in earlier years, when the revenue entered covers a full year: higher means each dong of assets is bringing in more revenue, lower means each dong of assets is bringing in less revenue than before.",
      },
      commonMistakes: {
        vi: 'Kết luận vòng quay thấp là kém mà không nhìn mô hình kinh doanh — doanh nghiệp thâm dụng tài sản vốn dĩ quay chậm.',
        en: 'Concluding that low turnover means poor performance without looking at the business model — asset-intensive companies inherently turn over more slowly.',
      },
    },
    example: {
      title: {
        vi: 'FPT 6 tháng đầu 2026 — doanh thu thuần 26.268,5 tỷ ₫ trên tổng tài sản 73.734,2 tỷ ₫',
        en: 'FPT H1 2026 — net revenue 26,268.5 billion ₫ on total assets of 73,734.2 billion ₫',
      },
      inputs: { revenue: 26_268.5, totalAssets: 73_734.2 },
      expected: 0.3563,
      note: {
        vi: 'So với tổng tài sản 73.734,2 tỷ ₫ của FPT: 0,36 vòng nghĩa là doanh thu thuần 6 tháng đầu 2026 mới bằng khoảng 36% số ấy, mỗi 100 đồng tài sản mang về chừng 36 đồng doanh thu. Nếu nửa cuối năm bán được bằng nửa đầu thì cả năm khoảng 0,71 vòng, con số để so với các năm trước.',
        en: "Compared with FPT's total assets of 73,734.2 billion ₫: 0.36 turns means net revenue for the first half of 2026 equaled only about 36% of those assets, roughly 36 dong of revenue for every 100 dong of assets. If the second half sells as much as the first, the full year comes to about 0.71 turns, the figure to compare with earlier years.",
      },
      source: {
        vi: 'Báo cáo kết quả hoạt động kinh doanh hợp nhất 6 tháng đầu 2026 và bảng cân đối kế toán 30/06/2026 của FPT, lấy trên CafeF ngày 15/09/2026.',
        en: 'FPT consolidated H1 2026 income statement and balance sheet at 30 June 2026, taken from CafeF on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'ca thường',
        inputs: { revenue: 62_850, totalAssets: 68_000 },
        expected: 0.9243,
      },
      {
        name: 'doanh nghiệp thâm dụng tài sản quay chậm',
        inputs: { revenue: 20_000, totalAssets: 80_000 },
        expected: 0.25,
      },
      {
        name: 'tổng tài sản bằng 0 thì không chia được',
        inputs: { revenue: 62_850, totalAssets: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA, SOURCE_PHAN_TICH_BCTC],
  },
  calc: (v) => {
    const assets = v('totalAssets');
    if (assets === 0) {
      return fail(
        'vòng',
        divideByZero(
          { vi: 'vòng quay tổng tài sản', en: 'total asset turnover' },
          { vi: 'Tổng tài sản', en: 'Total assets' },
          { vi: 'Nhập tổng tài sản khác 0.', en: 'Enter a non-zero total assets value.' },
        ),
      );
    }
    return ok(v('revenue') / assets, 'vòng');
  },
};

/*
 * ── 11. Hệ số chi trả cổ tức ───────────────────────────────────────────────────────────
 */

export const TY_LE_CHI_TRA_CO_TUC: FormulaModule = {
  spec: {
    id: 'ty-le-chi-tra-co-tuc',
    categoryId: 'fundamentals',
    name: { vi: 'Hệ số chi trả cổ tức', en: 'Dividend payout ratio' },
    description: {
      vi: 'Doanh nghiệp đem bao nhiêu phần trăm lợi nhuận ra trả cổ tức tiền mặt.',
      en: 'What percentage of profit the company pays out as cash dividends.',
    },
    latex: '\\text{Payout} = \\frac{DPS}{EPS} \\times 100\\%',
    expression: {
      vi: 'Hệ số chi trả = Cổ tức tiền mặt mỗi cổ phiếu ÷ EPS × 100',
      en: 'Payout ratio = Cash dividend per share ÷ EPS × 100',
    },
    substitution: '{dividendPerShare} ÷ {eps} × 100',
    symbols: [
      {
        latex: '\\text{Payout}',
        meaning: { vi: 'hệ số chi trả cổ tức, tính bằng %', en: 'dividend payout ratio, in %' },
      },
      {
        latex: 'DPS',
        meaning: {
          vi: 'cổ tức tiền mặt mỗi cổ phiếu trong năm, ₫',
          en: 'cash dividend per share for the year, ₫',
        },
      },
      {
        latex: 'EPS',
        meaning: { vi: 'lợi nhuận trên mỗi cổ phiếu, ₫', en: 'earnings per share, ₫' },
      },
      {
        latex: '100',
        meaning: { vi: 'đổi tỷ lệ ra phần trăm', en: 'converts the ratio to a percentage' },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['chi tra co tuc', 'payout ratio', 'co tuc', 'dps', 'chi so dn'],
    resultUnit: '%',
    variables: [
      numberVar(
        'dividendPerShare',
        { vi: 'Cổ tức tiền mặt / CP', en: 'Cash dividend / share' },
        '₫',
        2_000,
        {
          min: 0,
          max: 100_000,
          description: {
            vi: 'Tổng cổ tức tiền mặt trả cho một cổ phiếu trong năm.',
            en: 'Total cash dividend paid per share during the year.',
          },
        },
      ),
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
            en: 'Net income after tax divided by shares outstanding.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Cách doanh nghiệp chia lợi nhuận: phần trả ngay cho cổ đông và phần giữ lại để tái đầu tư.',
        en: 'How the company splits its profit: the part paid out to shareholders right away and the part retained for reinvestment.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn giữ một cổ phiếu vì cổ tức tiền mặt và muốn biết khoản cổ tức ấy chiếm bao nhiêu trong số lãi mỗi cổ phiếu làm ra, nhất là khi công ty vừa báo lãi giảm.',
        en: 'Use it when you hold a stock for its cash dividend and want to know how big a slice of the per-share profit that dividend takes, especially right after the company reports lower profit.',
      },
      howToRead: {
        vi: 'So với mốc 100%: dưới 100% nghĩa là công ty chia một phần lãi và giữ phần còn lại để tái đầu tư, trên 100% là chia nhiều hơn số lãi làm ra, phải lấy thêm từ tiền tích luỹ. Kết quả 0 chưa chắc là công ty không chia gì, vì cổ tức bằng cổ phiếu không tính ở đây.',
        en: 'Compared with the 100% mark: below 100% means the company pays out part of its profit and keeps the rest to reinvest, above 100% means it pays out more than it earned and must dip into accumulated cash. A result of 0 does not necessarily mean the company paid nothing, because stock dividends are not counted here.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn tỷ suất cổ tức cao mà không xem hệ số chi trả — cổ tức cao nhờ trả vượt khả năng lợi nhuận là cổ tức sắp bị cắt.',
        en: "Looking only at a high dividend yield without checking the payout ratio — a high dividend funded beyond the company's earning capacity is a dividend about to be cut.",
      },
    },
    example: {
      title: {
        vi: 'FPT — cổ tức tiền mặt 2.000 ₫/CP, EPS bốn quý gần nhất 5.867 ₫',
        en: 'FPT — cash dividend 2,000 ₫/share, trailing four-quarter EPS 5,867 ₫',
      },
      inputs: { dividendPerShare: 2_000, eps: 5_867 },
      expected: 34.089,
      note: {
        vi: 'So với mốc 100%: 34,09% nghĩa là FPT đem ra trả cổ tức tiền mặt khoảng một phần ba số lãi mỗi cổ phiếu làm ra trong bốn quý gần nhất, 2.000 ₫ trên 5.867 ₫, và giữ lại khoảng hai phần ba để tiếp tục làm ăn.',
        en: 'Compared with the 100% mark: 34.09% means FPT pays out about a third of what each share earned over the last four quarters as a cash dividend, 2,000 ₫ out of 5,867 ₫, and keeps about two thirds to reinvest in the business.',
      },
      source: {
        vi: 'Lịch sử chi trả cổ tức FPT trên cotuc.vn, EPS bốn quý gần nhất theo CafeF, lấy ngày 15/09/2026.',
        en: 'FPT dividend history on cotuc.vn, trailing four-quarter EPS from CafeF, taken on 2026-09-15.',
      },
    },
    tests: [
      {
        name: 'bộ số FPT của WF-10',
        inputs: { dividendPerShare: 2_000, eps: 6_050 },
        expected: 33.06,
      },
      {
        name: 'bộ số VNM — trả gần hết lợi nhuận làm ra',
        inputs: { dividendPerShare: 3_850, eps: 4_310 },
        expected: 89.33,
      },
      {
        name: 'EPS bằng 0 thì không chia được',
        inputs: { dividendPerShare: 2_000, eps: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'doanh nghiệp lỗ mà vẫn trả cổ tức thì hệ số vô nghĩa',
        inputs: { dividendPerShare: 2_000, eps: -1_500 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA, SOURCE_VAS],
  },
  calc: (v) => {
    const eps = v('eps');
    if (eps === 0) {
      return fail(
        '%',
        divideByZero(
          { vi: 'hệ số chi trả cổ tức', en: 'dividend payout ratio' },
          { vi: 'EPS', en: 'EPS' },
          {
            vi: 'Nhập EPS khác 0 hoặc chọn kỳ có lợi nhuận.',
            en: 'Enter a non-zero EPS or choose a period with profit.',
          },
        ),
      );
    }
    if (eps < 0) {
      return fail(
        '%',
        meaningless(
          {
            vi: 'Hệ số chi trả không có ý nghĩa khi doanh nghiệp đang lỗ: cổ tức lúc này lấy từ tiền tích luỹ, không phải từ lợi nhuận trong kỳ.',
            en: 'The payout ratio is not meaningful when the company is running a loss: the dividend in that case comes from accumulated cash, not from profit earned in the period.',
          },
          {
            vi: 'Xem nguồn tiền trả cổ tức trên báo cáo lưu chuyển tiền tệ.',
            en: 'Check the source of dividend funding on the cash flow statement.',
          },
        ),
      );
    }
    return ok((v('dividendPerShare') / eps) * 100, '%');
  },
};

/** Mười một chỉ số doanh nghiệp của đợt này — cộng P/E, P/B ở multiples.ts là đủ nhóm 13. */
export const FUNDAMENTAL_FORMULAS: ReadonlyArray<FormulaModule> = [
  EPS_CO_BAN,
  BVPS,
  ROE,
  ROA,
  BIEN_LOI_NHUAN_RONG,
  BIEN_LOI_NHUAN_GOP,
  NO_TREN_VON_CHU,
  THANH_TOAN_HIEN_HANH,
  THANH_TOAN_NHANH,
  VONG_QUAY_TONG_TAI_SAN,
  TY_LE_CHI_TRA_CO_TUC,
];
