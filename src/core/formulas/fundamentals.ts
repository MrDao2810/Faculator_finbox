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
        vi: 'Khi đọc báo cáo tài chính theo quý hoặc theo năm và muốn biết lợi nhuận mỗi cổ phiếu đang tăng hay giảm so với kỳ trước.',
        en: 'When reading quarterly or annual financial reports and wanting to see whether profit per share is rising or falling compared with the previous period.',
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
        vi: 'FPT 6 tháng đầu 2026 — LNST 5.055,1 tỷ ₫, 1,71 tỷ cổ phiếu lưu hành',
        en: 'FPT H1 2026 — net income 5,055.1 billion ₫, 1.71 billion shares outstanding',
      },
      inputs: { netIncome: 5_055.1, preferredDividend: 0, sharesOutstanding: 1_714_326_422 },
      expected: 2_949,
      note: {
        vi: 'Thấp hơn khoảng 0,6% so với mức 2.967 ₫ FPT tự công bố, vì doanh nghiệp chia cho số cổ phiếu bình quân gia quyền trong kỳ còn ô nhập ở đây là số cổ phiếu cuối kỳ, sau khi đã phát hành thêm ESOP và cổ phiếu thưởng. Khác biệt về phương pháp, không phải sai số tính toán.',
        en: 'About 0.6% below the 2,967 ₫ FPT reports itself, because the company divides by the weighted-average share count for the period while the field here holds the end-of-period count, after ESOP and bonus share issues. A difference in method, not a calculation error.',
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
        vi: 'Khi thị giá rơi sâu hoặc cổ phiếu bị bán tháo, dùng làm mốc so sánh xem thị trường đang định giá doanh nghiệp thấp hơn giá trị sổ sách bao nhiêu.',
        en: 'When the market price drops sharply or the stock is being sold off, use it as a reference point to see how far below book value the market is pricing the company.',
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
        vi: 'FPT ngày 30/06/2026 — vốn chủ của cổ đông công ty mẹ 39.851,5 tỷ ₫, 1,71 tỷ cổ phiếu',
        en: 'FPT at 30 June 2026 — parent-company equity 39,851.5 billion ₫, 1.71 billion shares',
      },
      inputs: { equity: 39_851.5, sharesOutstanding: 1_714_326_422 },
      expected: 23_246,
      note: {
        vi: 'Phải lấy vốn chủ của cổ đông công ty mẹ chứ không lấy tổng vốn chủ 40.995,7 tỷ ₫: khoản 1.144,2 tỷ ₫ lợi ích cổ đông không kiểm soát sẽ đẩy giá trị sổ sách mỗi cổ phiếu lên gần 3%, và sai lệch đó chảy thẳng sang P/B lẫn số Graham.',
        en: 'Use equity attributable to the parent company’s shareholders, not total equity of 40,995.7 billion ₫: the 1,144.2 billion ₫ of non-controlling interests would lift book value per share by almost 3%, and that error flows straight into P/B and the Graham number.',
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
        vi: 'FPT 6 tháng đầu 2026 — LNST 5.055,1 tỷ ₫ trên vốn chủ 39.851,5 tỷ ₫',
        en: 'FPT H1 2026 — net income 5,055.1 billion ₫ on equity of 39,851.5 billion ₫',
      },
      inputs: { netIncome: 5_055.1, equity: 39_851.5 },
      expected: 12.6848,
      note: {
        vi: 'Đây là hiệu quả của một kỳ SÁU THÁNG, không phải của cả năm. Muốn đặt cạnh lãi suất tiết kiệm 12 tháng thì phải quy lợi nhuận về một năm trước khi chia; ghép lợi nhuận nửa năm với vốn chủ cuối kỳ rồi đọc như số cả năm là lỗi hay gặp nhất lúc tự tính.',
        en: 'This is the return for a SIX-MONTH period, not for a full year. To set it beside a 12-month deposit rate, annualize the profit before dividing; pairing half-year profit with period-end equity and reading the result as an annual figure is the most common mistake when calculating by hand.',
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
        vi: 'Khi so sánh doanh nghiệp có mức vay nợ khác nhau, hoặc khi ROE bị đòn bẩy làm méo.',
        en: 'When comparing companies with different levels of debt, or when leverage is distorting ROE.',
      },
      howToRead: {
        vi: 'So ROA với trung bình ngành là cách đọc đáng tin cậy nhất, vì mỗi ngành cần lượng tài sản khác nhau để tạo ra doanh thu. Trong cùng một doanh nghiệp có lãi, ROA thường thấp hơn ROE vì tổng tài sản bao gồm cả vốn chủ lẫn nợ phải trả — khoảng cách càng rộng thì vay nợ càng nhiều.',
        en: 'Comparing ROA with the industry average is the most reliable way to read it, since different industries need different amounts of assets to generate revenue. Within the same profitable company, ROA is usually lower than ROE because total assets include both equity and liabilities — the wider the gap, the more debt the company carries.',
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
        vi: 'Khoảng cách với ROE 12,68% của cùng kỳ chính là phần đòn bẩy đóng góp: tổng tài sản lớn hơn vốn chủ 1,85 lần vì doanh nghiệp đang dùng 32.738,4 tỷ ₫ nợ phải trả, và mức khuếch đại lợi nhuận trên vốn chủ đúng bằng chừng ấy.',
        en: 'The gap against the same period’s ROE of 12.68% is precisely what leverage contributes: total assets are 1.85 times equity because the company is carrying 32,738.4 billion ₫ of liabilities, and the amplification of the return on equity matches that same multiple.',
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
        vi: 'Khi so sánh khả năng kiểm soát chi phí giữa các doanh nghiệp cùng ngành.',
        en: 'When comparing cost-control ability between companies in the same industry.',
      },
      howToRead: {
        vi: "Biên ròng mỏng nghĩa là chỉ cần chi phí nhích nhẹ là lợi nhuận bốc hơi; biên dày cho doanh nghiệp sức chịu đựng tốt hơn khi thị trường xấu. Mức 'mỏng' hay 'dày' phụ thuộc vào ngành, nên chỉ nên so sánh biên ròng giữa các doanh nghiệp cùng lĩnh vực hoặc so với chính doanh nghiệp đó ở các kỳ trước.",
        en: "A thin net margin means a small uptick in costs can wipe out profit; a thick margin gives a company more resilience when the market turns bad. What counts as 'thin' or 'thick' depends on the industry, so only compare net margin across companies in the same field, or against the same company's own prior periods.",
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
        vi: 'Biên dày như vậy là nét của doanh nghiệp bán dịch vụ phần mềm chứ không bán hàng hoá. Kỳ này còn được nâng thêm bởi 756,6 tỷ ₫ lãi từ công ty liên kết; loại khoản đó ra thì biên của hoạt động cốt lõi thấp hơn khoảng 2,9 điểm phần trăm.',
        en: 'A margin this thick is characteristic of a company selling software services rather than goods. This period is lifted further by 756.6 billion ₫ of income from associates; strip that out and the core operating margin is about 2.9 percentage points lower.',
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
        vi: 'FPT 6 tháng đầu 2026 — doanh thu thuần 26.268,5 tỷ ₫, giá vốn 17.745 tỷ ₫',
        en: 'FPT H1 2026 — net revenue 26,268.5 billion ₫, cost of goods sold 17,745 billion ₫',
      },
      inputs: { revenue: 26_268.5, cogs: 17_745 },
      expected: 32.4476,
      note: {
        vi: 'Giá vốn suy ra bằng doanh thu trừ lợi nhuận gộp 8.523,5 tỷ ₫. Biên gộp kỳ này co lại vì quý 2 doanh thu giảm trong khi giá vốn vẫn tăng, sau khi FPT thôi hợp nhất mảng viễn thông — nên không đọc chuỗi biên gộp 2025 và 2026 như một dãy liền mạch.',
        en: 'Cost of goods sold is derived as revenue minus gross profit of 8,523.5 billion ₫. The margin narrowed this period because Q2 revenue fell while cost of sales still rose, after FPT deconsolidated its telecom arm — so the 2025 and 2026 gross-margin series must not be read as one continuous line.',
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
        vi: 'FPT ngày 30/06/2026 — nợ phải trả 32.738,4 tỷ ₫ trên tổng vốn chủ 40.995,7 tỷ ₫',
        en: 'FPT at 30 June 2026 — total liabilities 32,738.4 billion ₫ against total equity of 40,995.7 billion ₫',
      },
      inputs: { totalLiabilities: 32_738.4, equity: 40_995.7 },
      expected: 0.7986,
      note: {
        vi: 'Ô nhập là TOÀN BỘ nợ phải trả, trong đó chỉ khoảng 17.444 tỷ ₫ là nợ vay có lãi — tính riêng phần nợ vay thì hệ số còn 0,43 lần. Doanh nghiệp lại đang giữ 28.972 tỷ ₫ tiền và đầu tư tài chính ngắn hạn, nhiều hơn cả số nợ vay đó.',
        en: 'The field holds ALL liabilities, of which only about 17,444 billion ₫ is interest-bearing debt — counted on borrowings alone the ratio falls to 0.43x. The company meanwhile holds 28,972 billion ₫ of cash and short-term investments, more than those borrowings.',
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
    symbols: [
      {
        latex: '\\text{Current ratio}',
        meaning: { vi: 'hệ số thanh toán hiện hành, tính bằng lần', en: 'current ratio, in times' },
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
        vi: 'FPT ngày 30/06/2026 — tài sản ngắn hạn 45.702 tỷ ₫, nợ ngắn hạn 29.365,3 tỷ ₫',
        en: 'FPT at 30 June 2026 — current assets 45,702 billion ₫, current liabilities 29,365.3 billion ₫',
      },
      inputs: { currentAssets: 45_702, currentLiabilities: 29_365.3 },
      expected: 1.5563,
      note: {
        vi: 'Nằm giữa hai mốc quen thuộc: 1 lần là vừa đủ trả, 2 lần là rất dư dả. Cơ cấu còn tốt hơn con số, vì gần 29.000 tỷ ₫ trong tài sản ngắn hạn là tiền và tiền gửi ngân hàng — hoá tiền được ngay chứ không phải tồn kho hay khoản phải thu khó đòi.',
        en: 'It sits between the two familiar reference points: 1x is just enough to pay, 2x is very comfortable. The composition is even better than the number, since close to 29,000 billion ₫ of those current assets is cash and bank deposits — convertible immediately rather than inventory or doubtful receivables.',
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
    symbols: [
      {
        latex: '\\text{Quick ratio}',
        meaning: { vi: 'hệ số thanh toán nhanh, tính bằng lần', en: 'quick ratio, in times' },
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
        vi: 'FPT ngày 30/06/2026 — tài sản ngắn hạn 45.702 tỷ ₫, tồn kho 1.183,1 tỷ ₫, nợ ngắn hạn 29.365,3 tỷ ₫',
        en: 'FPT at 30 June 2026 — current assets 45,702 billion ₫, inventory 1,183.1 billion ₫, current liabilities 29,365.3 billion ₫',
      },
      inputs: { currentAssets: 45_702, inventory: 1_183.1, currentLiabilities: 29_365.3 },
      expected: 1.516,
      note: {
        vi: 'Bỏ tồn kho ra gần như không làm hệ số suy giảm, vì tồn kho chỉ chiếm 2,6% tài sản ngắn hạn — nét đặc trưng của doanh nghiệp dịch vụ. Phép thử này chỉ thực sự cảnh báo được ở doanh nghiệp bán lẻ hay sản xuất, nơi hai hệ số cách nhau rất xa.',
        en: 'Removing inventory barely dents the ratio, because inventory is only 2.6% of current assets — the hallmark of a services company. This test only really warns you at retailers or manufacturers, where the two ratios sit far apart.',
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
    symbols: [
      {
        latex: '\\text{Vòng quay}',
        meaning: {
          vi: 'vòng quay tổng tài sản, tính bằng số vòng trong kỳ',
          en: 'total asset turnover, counted in turns per period',
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
        vi: 'FPT 6 tháng đầu 2026 — doanh thu thuần 26.268,5 tỷ ₫ trên tổng tài sản 73.734,2 tỷ ₫',
        en: 'FPT H1 2026 — net revenue 26,268.5 billion ₫ on total assets of 73,734.2 billion ₫',
      },
      inputs: { revenue: 26_268.5, totalAssets: 73_734.2 },
      expected: 0.3563,
      note: {
        vi: 'Doanh thu ở đây mới là nửa năm, nên muốn có số vòng cả năm thì phải quy doanh thu về một năm trước khi chia. Vòng quay thấp cũng không có nghĩa là vận hành kém: gần 40% tài sản của FPT là tiền và tiền gửi ngân hàng, vốn sinh ra doanh thu tài chính chứ không đi qua doanh thu thuần.',
        en: 'The revenue here covers only half a year, so an annual turnover figure requires annualizing revenue before dividing. A low turnover does not mean weak operations either: close to 40% of FPT’s assets is cash and bank deposits, which generate financial income rather than passing through net revenue.',
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
        vi: 'FPT — cổ tức tiền mặt 2.000 ₫/CP, EPS bốn quý gần nhất 5.867 ₫',
        en: 'FPT — cash dividend 2,000 ₫/share, trailing four-quarter EPS 5,867 ₫',
      },
      inputs: { dividendPerShare: 2_000, eps: 5_867 },
      expected: 34.089,
      note: {
        vi: 'FPT đưa khoảng một phần ba lợi nhuận ra trả cổ tức và giữ lại phần còn lại để tái đầu tư. Mức 20% mệnh giá này giữ nguyên nhiều năm liền nên dự đoán được, và phần giữ lại nhân với ROE quy ra cả năm cho tốc độ tăng trưởng nội sinh khoảng 16,7%/năm.',
        en: 'FPT hands out roughly a third of its profit as dividends and retains the rest for reinvestment. The 20%-of-par level has held for years, so it is predictable, and the retained share multiplied by the annualized ROE implies internal growth of about 16.7% a year.',
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
