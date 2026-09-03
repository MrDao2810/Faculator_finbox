/**
 * Tầng DOMAIN — 12 nhóm công thức của FR-01.
 *
 * Số lượng ở `expectedCount` lấy theo bảng SRS mục 3.8, đã qua ba lần nâng — **bảng SRS ngoài
 * repo phải sửa theo cho khớp**, nếu không tài liệu lệch nhau vĩnh viễn:
 *
 *   - Gốc: 94 chứng khoán + 13 cá nhân = 107.
 *   - Gói 5.2.3: Định giá 18 → 19 (107 → 108) cho `gia-tri-noi-tai-fcff` — mắt xích khép nhánh
 *     FCFF của chuỗi định giá, thiếu nó thì WACC, FCFF và FCFE là ba công thức không ai tiêu
 *     thụ kết quả.
 *   - Đợt thêm ba công thức "cố ý chưa đăng ký" ở `formulas/README.md`: Định giá 19 → 20
 *     (108 → 109) cho `gia-muc-tieu` (độc lập, không cần dữ liệu mới); Rủi ro 17 → 18
 *     (109 → 110) cho `beta` (hồi quy cần chuỗi VN-Index — nay `samples.ts` đã có); Lợi nhuận
 *     & cổ tức 13 → 14 (110 → 111) cho `xirr` (hàm thuần đã có từ trước, nay có thân riêng
 *     quản lý bảng dòng tiền — `ui/screens/XirrBody.tsx`).
 *
 * Tổng hiện tại: **98 chứng khoán + 13 cá nhân = 111**. Đủ ba công thức "cố ý chưa đăng ký".
 *
 * `shortName` lấy đúng nguyên văn wireframe WF-01 — đó là chữ đã được duyệt cho lưới hai cột,
 * không phải bản rút gọn tôi tự nghĩ ra.
 */

import type { Category } from './types';

export const CATEGORIES: ReadonlyArray<Category> = [
  // ── Mảng chứng khoán — 98 công thức ────────────────────────────────────────
  {
    id: 'valuation',
    segment: 'stock',
    name: { vi: 'Định giá', en: 'Valuation' },
    shortName: { vi: 'Định giá', en: 'Valuation' },
    description: {
      vi: 'Ước tính giá trị hợp lý của cổ phiếu: bội số, chiết khấu dòng tiền, cổ tức, giá mục tiêu.',
      en: 'Estimate a stock’s fair value: multiples, discounted cash flow, dividends, target price.',
    },
    expectedCount: 20,
  },
  {
    id: 'fundamentals',
    segment: 'stock',
    name: { vi: 'Chỉ số doanh nghiệp', en: 'Company fundamentals' },
    shortName: { vi: 'Chỉ số DN', en: 'Fundamentals' },
    description: {
      vi: 'Đọc sức khoẻ doanh nghiệp từ báo cáo tài chính: ROE, ROA, D/E, EPS, BVPS.',
      en: 'Read company health from the financial statements: ROE, ROA, D/E, EPS, BVPS.',
    },
    expectedCount: 13,
  },
  {
    id: 'returns',
    segment: 'stock',
    name: { vi: 'Lợi nhuận & cổ tức', en: 'Returns & dividends' },
    shortName: { vi: 'Lợi nhuận', en: 'Returns' },
    description: {
      vi: 'Đo hiệu quả một khoản đầu tư: ROI, HPR, CAGR, XIRR, tỷ suất cổ tức.',
      en: 'Measure how well an investment performed: ROI, HPR, CAGR, XIRR, dividend yield.',
    },
    expectedCount: 14,
  },
  {
    id: 'risk',
    segment: 'stock',
    name: { vi: 'Rủi ro & danh mục', en: 'Risk & portfolio' },
    shortName: { vi: 'Rủi ro', en: 'Risk' },
    description: {
      vi: 'Đo biến động và rủi ro: Beta, Sharpe, Sortino, Treynor, Max Drawdown, VaR.',
      en: 'Measure volatility and risk: Beta, Sharpe, Sortino, Treynor, Max Drawdown, VaR.',
    },
    expectedCount: 18,
  },
  {
    id: 'technical',
    segment: 'stock',
    name: { vi: 'Phân tích kỹ thuật', en: 'Technical analysis' },
    shortName: { vi: 'Kỹ thuật', en: 'Technical' },
    description: {
      // Kể đúng chỉ báo Registry CÓ. 'ADX' từng đứng ở đây và không có công thức nào tên vậy —
      // mô tả nhóm là chỗ người dùng đọc trước khi bấm vào, hứa một chỉ báo không tồn tại là gửi
      // họ đi tìm thứ không có (cùng lớp lỗi mà `prose-audit` phép A gác cho phần diễn giải).
      vi: 'Chỉ báo đọc từ chuỗi giá: MA, RSI, MACD, Bollinger, ATR, Stochastic.',
      en: 'Indicators read from the price series: MA, RSI, MACD, Bollinger, ATR, Stochastic.',
    },
    expectedCount: 18,
  },
  {
    id: 'derivatives',
    segment: 'stock',
    /*
     * Tên nhóm bỏ vế "& quyền chọn", và đó là sửa cho khớp THỰC TẾ chứ không phải cắt phạm vi:
     * thị trường Việt Nam mới có hợp đồng tương lai chỉ số niêm yết, chưa có quyền chọn — lý do
     * ghi ở docblock `derivatives.ts`. Cả 7/7 công thức của nhóm xoay quanh VN30F. Bảng SRS mục
     * 3.8 cũng chỉ ghi "Phái sinh". Tên cũ hiện trên ô lọc và trên mọi thẻ công thức, tức nó hứa
     * với người dùng một mảng nội dung không tồn tại.
     */
    name: { vi: 'Phái sinh', en: 'Derivatives' },
    shortName: { vi: 'Phái sinh', en: 'Derivatives' },
    description: {
      vi: 'Hợp đồng tương lai VN30F: giá lý thuyết, basis, lãi lỗ vị thế, ký quỹ, đòn bẩy.',
      en: 'VN30F index futures: theoretical price, basis, position P&L, margin, leverage.',
    },
    expectedCount: 7,
  },
  {
    id: 'fees-tax',
    segment: 'stock',
    name: { vi: 'Phí & thuế thị trường VN', en: 'Vietnam market fees & taxes' },
    shortName: { vi: 'Phí & thuế VN', en: 'VN fees & tax' },
    description: {
      vi: 'Phí môi giới, thuế chuyển nhượng, thuế cổ tức, phí lưu ký, giá hoà vốn thực, lợi nhuận ròng.',
      en: 'Brokerage fees, transfer tax, dividend tax, custody fee, real break-even price, net profit.',
    },
    expectedCount: 8,
  },

  // ── Mảng tài chính cá nhân — 13 công thức ──────────────────────────────────
  {
    id: 'savings',
    segment: 'personal',
    name: { vi: 'Tiết kiệm', en: 'Savings' },
    shortName: { vi: 'Tiết kiệm', en: 'Savings' },
    description: {
      vi: 'Lãi kép, lãi tiền gửi, tiết kiệm theo mục tiêu.',
      en: 'Compound interest, deposit interest, goal-based savings.',
    },
    expectedCount: 5,
  },
  {
    id: 'investing',
    segment: 'personal',
    name: { vi: 'Đầu tư', en: 'Investing' },
    shortName: { vi: 'Đầu tư', en: 'Investing' },
    description: {
      vi: 'Đầu tư định kỳ và giá trị tương lai của dòng tiền đều.',
      en: 'Periodic investing and the future value of a level cash flow series.',
    },
    expectedCount: 2,
  },
  {
    id: 'loans',
    segment: 'personal',
    name: { vi: 'Vay nợ', en: 'Loans' },
    shortName: { vi: 'Vay nợ', en: 'Loans' },
    description: {
      vi: 'Trả góp niên kim và gốc đều, lịch trả nợ từng kỳ, tổng lãi phải trả.',
      en: 'Annuity and equal-principal instalments, the period-by-period repayment schedule, total interest owed.',
    },
    expectedCount: 3,
  },
  {
    id: 'personal-tax',
    segment: 'personal',
    name: { vi: 'Thuế thu nhập cá nhân', en: 'Personal income tax' },
    shortName: { vi: 'Thuế TNCN', en: 'Income tax' },
    description: {
      vi: 'Thuế thu nhập từ tiền lương theo biểu luỹ tiến từng phần.',
      en: 'Tax on salary income under the progressive partial-bracket schedule.',
    },
    expectedCount: 1,
  },
  {
    id: 'corporate-finance',
    segment: 'personal',
    name: { vi: 'Tài chính doanh nghiệp', en: 'Corporate finance' },
    shortName: { vi: 'Tài chính DN', en: 'Corp. finance' },
    description: {
      vi: 'Điểm hoà vốn sản lượng và NPV thẩm định dự án.',
      en: 'Break-even output volume and NPV for project appraisal.',
    },
    expectedCount: 2,
  },
];

/** Tra nhóm theo id. Không tìm thấy thì trả undefined, không ném lỗi. */
export function findCategory(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

/** Danh sách nhóm của một mảng, giữ nguyên thứ tự khai báo. */
export function categoriesOf(segment: Category['segment']): ReadonlyArray<Category> {
  return CATEGORIES.filter((c) => c.segment === segment);
}

/** Tổng số công thức dự kiến của một mảng — dùng cho nhãn “chứng khoán 98 / cá nhân 13” ở WF-01. */
export function expectedCountOf(segment: Category['segment']): number {
  return categoriesOf(segment).reduce((sum, c) => sum + c.expectedCount, 0);
}
