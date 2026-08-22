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
    latex: 'EPS = \\frac{\\text{LNST} - \\text{Cổ tức ưu đãi}}{\\text{Số CP lưu hành}}',
    expression: {
      vi: 'EPS = (Lợi nhuận sau thuế − Cổ tức ưu đãi) ÷ Số cổ phiếu lưu hành',
      en: 'EPS = (Net income after tax − Preferred dividends) ÷ Shares outstanding',
    },
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
        vi: 'Là đầu vào của P/E và của hầu hết phép so sánh lợi nhuận giữa các doanh nghiệp.',
        en: 'It feeds into P/E and into most profit comparisons between companies.',
      },
      howToRead: {
        vi: 'EPS tăng đều qua các năm là dấu hiệu tốt; EPS âm nghĩa là doanh nghiệp đang lỗ trên mỗi cổ phiếu.',
        en: 'EPS rising steadily year after year is a good sign; a negative EPS means the company is losing money on a per-share basis.',
      },
      commonMistakes: {
        vi: 'So EPS tuyệt đối giữa hai doanh nghiệp có số cổ phiếu khác nhau — EPS 1.000 ₫ không tệ hơn EPS 6.000 ₫ nếu thị giá cũng thấp tương ứng.',
        en: 'Comparing absolute EPS between two companies with different share counts — an EPS of 1,000 ₫ is not worse than an EPS of 6,000 ₫ if the share price is proportionally lower too.',
      },
    },
    example: {
      title: {
        vi: 'LNST 8.894 tỷ ₫, 1,47 tỷ cổ phiếu',
        en: 'Net income 8,894 billion ₫, 1.47 billion shares',
      },
      inputs: { netIncome: 8_894, preferredDividend: 0, sharesOutstanding: 1_470_000_000 },
      expected: 6_050.34,
      note: {
        vi: 'Ra EPS 6.050,34 ₫ — đơn vị ₫/CP, không phải tỷ ₫ như LNST.',
        en: 'Works out to an EPS of 6,050.34 ₫ — a per-share figure, unlike the billion-₫ scale of net income.',
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
    latex: 'BVPS = \\frac{\\text{Vốn chủ sở hữu}}{\\text{Số CP lưu hành}}',
    expression: {
      vi: 'BVPS = Vốn chủ sở hữu ÷ Số cổ phiếu lưu hành',
      en: 'BVPS = Equity ÷ Shares outstanding',
    },
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
        vi: 'Là mẫu số của P/B, và là mốc so sánh khi thị giá rơi sâu.',
        en: 'It is the denominator of P/B, and a reference point when the market price falls sharply.',
      },
      howToRead: {
        vi: 'Thị giá thấp hơn BVPS nghĩa là thị trường định giá doanh nghiệp dưới giá trị sổ sách — cần tìm hiểu vì sao trước khi kết luận là rẻ.',
        en: 'A market price below BVPS means the market is valuing the company under its book value — find out why before concluding it is cheap.',
      },
      commonMistakes: {
        vi: 'Coi BVPS là giá trị thanh lý thật. Sổ sách ghi theo giá gốc, tài sản thực tế có thể bán được cao hơn hoặc thấp hơn nhiều.',
        en: 'Treating BVPS as the actual liquidation value. Book records are kept at historical cost, and assets may actually sell for much more or much less.',
      },
    },
    example: {
      title: {
        vi: 'Vốn chủ 36.456 tỷ ₫, 1,47 tỷ cổ phiếu',
        en: 'Equity 36,456 billion ₫, 1.47 billion shares',
      },
      inputs: { equity: 36_456, sharesOutstanding: 1_470_000_000 },
      expected: 24_800,
      note: {
        vi: 'Ra BVPS 24.800 ₫ — đơn vị ₫/CP, không phải tỷ ₫ như vốn chủ sở hữu.',
        en: 'Works out to a BVPS of 24,800 ₫ — a per-share figure, unlike the billion-₫ scale of equity.',
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
        vi: 'Là chỉ số đầu tiên để sàng lọc doanh nghiệp làm ăn hiệu quả, và để so sánh trong cùng ngành.',
        en: 'The first metric for screening efficiently run companies, and for comparing within the same industry.',
      },
      howToRead: {
        vi: 'ROE giữ được trên 15% nhiều năm liền thường là doanh nghiệp tốt. ROE cao đột biến một năm thì phải xem có phải nhờ lợi nhuận bất thường hay vay nợ nhiều.',
        en: 'An ROE holding above 15% for several years in a row usually signals a good company. A sudden spike in ROE for one year should be checked — it may come from a one-off gain or heavy borrowing.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn ROE mà quên đòn bẩy: vay nợ nhiều làm vốn chủ nhỏ đi và thổi ROE lên cao, kèm theo rủi ro lớn hơn.',
        en: 'Looking only at ROE and forgetting leverage: heavy borrowing shrinks equity and inflates ROE, along with greater risk.',
      },
    },
    example: {
      title: {
        vi: 'LNST 8.894 tỷ ₫, vốn chủ 36.456 tỷ ₫',
        en: 'Net income 8,894 billion ₫, equity 36,456 billion ₫',
      },
      inputs: { netIncome: 8_894, equity: 36_456 },
      expected: 24.4,
      note: {
        vi: 'Trên 15% nhiều năm liền là mức các nhà đầu tư giá trị hay tìm kiếm.',
        en: 'Above 15% for several years running is the level value investors typically look for.',
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
        vi: 'Khi so sánh doanh nghiệp có mức vay nợ khác nhau, hoặc khi ROE bị đòn bẩy làm méo.',
        en: 'When comparing companies with different levels of debt, or when leverage is distorting ROE.',
      },
      howToRead: {
        vi: 'ROA thấp hơn ROE là bình thường vì tài sản luôn lớn hơn vốn chủ; khoảng cách càng rộng thì doanh nghiệp vay nợ càng nhiều.',
        en: 'ROA being lower than ROE is normal, since assets are always larger than equity; the wider the gap, the more the company relies on debt.',
      },
      commonMistakes: {
        vi: 'So ROA giữa hai ngành khác cấu trúc tài sản — ngân hàng và bán lẻ có mặt bằng ROA hoàn toàn khác nhau.',
        en: 'Comparing ROA across industries with different asset structures — banks and retailers sit on completely different ROA baselines.',
      },
    },
    example: {
      title: {
        vi: 'LNST 8.894 tỷ ₫, tổng tài sản 68.000 tỷ ₫',
        en: 'Net income 8,894 billion ₫, total assets 68,000 billion ₫',
      },
      inputs: { netIncome: 8_894, totalAssets: 68_000 },
      expected: 13.08,
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
        vi: 'Khi so sánh khả năng kiểm soát chi phí giữa các doanh nghiệp cùng ngành.',
        en: 'When comparing cost-control ability between companies in the same industry.',
      },
      howToRead: {
        vi: 'Biên ròng mỏng nghĩa là chỉ cần chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho doanh nghiệp sức chịu đựng tốt hơn khi thị trường xấu.',
        en: 'A thin net margin means a small uptick in costs can wipe out profit; a thick margin gives a company more resilience when the market turns bad.',
      },
      commonMistakes: {
        vi: 'So biên ròng giữa bán lẻ (thường vài phần trăm) với phần mềm (vài chục phần trăm) rồi kết luận bán lẻ kém.',
        en: 'Comparing net margin between retail (typically a few percent) and software (tens of percent) and concluding that retail is doing poorly.',
      },
    },
    example: {
      title: {
        vi: 'LNST 8.894 tỷ ₫, doanh thu 62.850 tỷ ₫',
        en: 'Net income 8,894 billion ₫, revenue 62,850 billion ₫',
      },
      inputs: { netIncome: 8_894, revenue: 62_850 },
      expected: 14.15,
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
        vi: 'Khi đánh giá lợi thế cạnh tranh: doanh nghiệp có thương hiệu hay công nghệ riêng thường giữ được biên gộp cao.',
        en: 'When assessing competitive advantage: companies with a strong brand or proprietary technology tend to hold a higher gross margin.',
      },
      howToRead: {
        vi: 'Biên gộp ổn định hoặc tăng dần là dấu hiệu doanh nghiệp giữ được giá bán; biên gộp co lại thường do cạnh tranh ép giá hoặc chi phí đầu vào tăng.',
        en: 'A stable or rising gross margin signals the company is holding its selling price; a shrinking gross margin usually comes from competitive price pressure or rising input costs.',
      },
      commonMistakes: {
        vi: 'Nhầm biên gộp với biên ròng — biên gộp cao vẫn có thể lỗ ròng nếu chi phí vận hành và lãi vay quá lớn.',
        en: 'Confusing gross margin with net margin — a high gross margin can still coexist with a net loss if operating costs and interest expense are too large.',
      },
    },
    example: {
      title: {
        vi: 'Doanh thu 62.850 tỷ ₫, giá vốn 38.400 tỷ ₫',
        en: 'Revenue 62,850 billion ₫, cost of goods sold 38,400 billion ₫',
      },
      inputs: { revenue: 62_850, cogs: 38_400 },
      expected: 38.9,
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
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['de', 'd e', 'no tren von chu', 'don bay', 'debt to equity', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('totalDebt', { vi: 'Tổng nợ phải trả', en: 'Total liabilities' }, 'tỷ ₫', 22_500, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Toàn bộ nợ ngắn hạn và dài hạn trên bảng cân đối kế toán.',
          en: 'All short-term and long-term debt on the balance sheet.',
        },
      }),
      equity,
    ],
    explanation: {
      meaning: {
        vi: 'Mức độ dùng đòn bẩy tài chính: doanh nghiệp dựa vào tiền vay nhiều hay ít so với vốn tự có.',
        en: 'The degree of financial leverage: how much the company relies on borrowed money relative to its own capital.',
      },
      whenToUse: {
        vi: 'Khi đánh giá rủi ro tài chính trước lúc mua, nhất là giai đoạn lãi suất tăng.',
        en: 'When assessing financial risk before buying, especially during periods of rising interest rates.',
      },
      howToRead: {
        vi: 'D/E trên 2 lần là mức đòn bẩy cao với phần lớn ngành sản xuất; riêng ngân hàng và bất động sản có mặt bằng nợ khác hẳn.',
        en: 'A D/E above 2x is high leverage for most manufacturing industries; banks and real estate, however, sit on an entirely different debt baseline.',
      },
      commonMistakes: {
        vi: 'Coi mọi khoản nợ như nhau — nợ chiếm dụng nhà cung cấp không tốn lãi, khác hẳn nợ vay ngân hàng.',
        en: 'Treating all debt as the same — trade payables to suppliers carry no interest, unlike bank borrowings.',
      },
    },
    example: {
      title: {
        vi: 'Nợ phải trả 22.500 tỷ ₫, vốn chủ 36.456 tỷ ₫',
        en: 'Liabilities 22,500 billion ₫, equity 36,456 billion ₫',
      },
      inputs: { totalDebt: 22_500, equity: 36_456 },
      expected: 0.6172,
    },
    tests: [
      { name: 'ca thường', inputs: { totalDebt: 22_500, equity: 36_456 }, expected: 0.6172 },
      {
        name: 'đòn bẩy cao — nợ gấp hơn 3 lần vốn chủ',
        inputs: { totalDebt: 80_000, equity: 25_000 },
        expected: 3.2,
      },
      {
        name: 'vốn chủ bằng 0 thì không chia được',
        inputs: { totalDebt: 22_500, equity: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'vốn chủ âm thì hệ số nợ vô nghĩa — ca kinh điển của nhóm',
        inputs: { totalDebt: 22_500, equity: -3_000 },
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
    return ok(v('totalDebt') / eq, 'lần');
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
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['thanh toan hien hanh', 'current ratio', 'thanh khoan', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('currentAssets', { vi: 'Tài sản ngắn hạn', en: 'Current assets' }, 'tỷ ₫', 42_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tiền, đầu tư ngắn hạn, phải thu và hàng tồn kho.',
          en: 'Cash, short-term investments, receivables, and inventory.',
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
        vi: 'Khi kiểm tra sức khoẻ thanh khoản trước lúc đầu tư, nhất là với doanh nghiệp vay nợ nhiều.',
        en: 'When checking liquidity health before investing, especially for heavily indebted companies.',
      },
      howToRead: {
        vi: 'Dưới 1 lần nghĩa là nợ đến hạn nhiều hơn tài sản có thể xoay — dấu hiệu căng thẳng thanh khoản; quá cao lại có thể là ứ đọng vốn.',
        en: 'Below 1x means liabilities coming due exceed the assets available to cover them — a sign of liquidity stress; too high can instead mean idle, poorly deployed capital.',
      },
      commonMistakes: {
        vi: 'Yên tâm với hệ số cao mà không nhìn cơ cấu: tài sản ngắn hạn toàn hàng tồn kho khó bán thì hệ số cao cũng không cứu được.',
        en: 'Taking comfort in a high ratio without looking at its composition: if current assets are mostly hard-to-sell inventory, a high ratio will not save the company.',
      },
    },
    example: {
      title: {
        vi: 'Tài sản ngắn hạn 42.000 tỷ ₫, nợ ngắn hạn 28.000 tỷ ₫',
        en: 'Current assets 42,000 billion ₫, current liabilities 28,000 billion ₫',
      },
      inputs: { currentAssets: 42_000, currentLiabilities: 28_000 },
      expected: 1.5,
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
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['thanh toan nhanh', 'quick ratio', 'acid test', 'thanh khoan', 'chi so dn'],
    resultUnit: 'lần',
    variables: [
      numberVar('currentAssets', { vi: 'Tài sản ngắn hạn', en: 'Current assets' }, 'tỷ ₫', 42_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Tiền, đầu tư ngắn hạn, phải thu và hàng tồn kho.',
          en: 'Cash, short-term investments, receivables, and inventory.',
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
        vi: 'Với doanh nghiệp có tồn kho lớn hoặc quay vòng chậm — bất động sản, thép, bán lẻ — nơi hệ số hiện hành dễ gây ảo giác an toàn.',
        en: 'For companies with large or slow-turning inventory — real estate, steel, retail — where the current ratio can create a false sense of safety.',
      },
      howToRead: {
        vi: 'Quanh 1 lần trở lên là an toàn; thấp hơn hẳn hệ số hiện hành nghĩa là thanh khoản đang phụ thuộc nặng vào việc bán được hàng tồn.',
        en: 'Around 1x or higher is safe; a quick ratio much lower than the current ratio means liquidity depends heavily on being able to sell inventory.',
      },
      commonMistakes: {
        vi: 'Quên rằng khoản phải thu trong tử số cũng có thể khó đòi — hệ số nhanh cao chưa chắc tiền đã về kịp.',
        en: 'Forgetting that receivables in the numerator can also be hard to collect — a high quick ratio does not guarantee the cash arrives on time.',
      },
    },
    example: {
      title: {
        vi: 'Tài sản ngắn hạn 42.000 tỷ ₫, tồn kho 9.500 tỷ ₫, nợ ngắn hạn 28.000 tỷ ₫',
        en: 'Current assets 42,000 billion ₫, inventory 9,500 billion ₫, current liabilities 28,000 billion ₫',
      },
      inputs: { currentAssets: 42_000, inventory: 9_500, currentLiabilities: 28_000 },
      expected: 1.1607,
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
        vi: 'Khi phân tích vì sao ROA cao hay thấp: ROA chính là biên lợi nhuận ròng nhân với vòng quay này.',
        en: 'When analyzing why ROA is high or low: ROA is exactly net margin multiplied by this turnover ratio.',
      },
      howToRead: {
        vi: 'Bán lẻ quay nhanh (trên 2 vòng) nhưng biên mỏng; điện nước hay bất động sản quay chậm (dưới 0,5 vòng) nhưng biên dày. So sánh phải trong cùng ngành.',
        en: 'Retail turns quickly (above 2x) but with thin margins; utilities or real estate turn slowly (below 0.5x) but with thick margins. Comparisons must stay within the same industry.',
      },
      commonMistakes: {
        vi: 'Kết luận vòng quay thấp là kém mà không nhìn mô hình kinh doanh — doanh nghiệp thâm dụng tài sản vốn dĩ quay chậm.',
        en: 'Concluding that low turnover means poor performance without looking at the business model — asset-intensive companies inherently turn over more slowly.',
      },
    },
    example: {
      title: {
        vi: 'Doanh thu 62.850 tỷ ₫, tổng tài sản 68.000 tỷ ₫',
        en: 'Revenue 62,850 billion ₫, total assets 68,000 billion ₫',
      },
      inputs: { revenue: 62_850, totalAssets: 68_000 },
      expected: 0.9243,
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
        vi: 'Khi chọn cổ phiếu cổ tức, hoặc khi đánh giá mức cổ tức hiện tại có duy trì được lâu dài không.',
        en: 'When picking dividend stocks, or when assessing whether the current dividend level is sustainable long term.',
      },
      howToRead: {
        vi: 'Trên 100% nghĩa là trả nhiều hơn số lãi làm ra — phải lấy từ tiền tích luỹ, khó bền. Doanh nghiệp tăng trưởng nhanh thường giữ hệ số thấp để tái đầu tư.',
        en: 'Above 100% means the company is paying out more than it earns — it must draw on accumulated cash, which is hard to sustain. Fast-growing companies tend to keep this ratio low to reinvest.',
      },
      commonMistakes: {
        vi: 'Chỉ nhìn tỷ suất cổ tức cao mà không xem hệ số chi trả — cổ tức cao nhờ trả vượt khả năng lợi nhuận là cổ tức sắp bị cắt.',
        en: "Looking only at a high dividend yield without checking the payout ratio — a high dividend funded beyond the company's earning capacity is a dividend about to be cut.",
      },
    },
    example: {
      title: {
        vi: 'Cổ tức 2.000 ₫/CP, EPS 6.050 ₫',
        en: 'Dividend 2,000 ₫/share, EPS 6,050 ₫',
      },
      inputs: { dividendPerShare: 2_000, eps: 6_050 },
      expected: 33.06,
      note: {
        vi: 'Giữ lại khoảng hai phần ba lợi nhuận để tái đầu tư.',
        en: 'Retains roughly two-thirds of profit for reinvestment.',
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
