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
  // ── Mảng chứng khoán — 95 công thức ────────────────────────────────────────
  {
    id: 'valuation',
    segment: 'stock',
    name: 'Định giá',
    shortName: 'Định giá',
    nameEn: 'Valuation',
    description:
      'Ước tính giá trị hợp lý của cổ phiếu: bội số, chiết khấu dòng tiền, cổ tức, giá mục tiêu.',
    expectedCount: 20,
  },
  {
    id: 'fundamentals',
    segment: 'stock',
    name: 'Chỉ số doanh nghiệp',
    shortName: 'Chỉ số DN',
    nameEn: 'Company fundamentals',
    description: 'Đọc sức khoẻ doanh nghiệp từ báo cáo tài chính: ROE, ROA, D/E, EPS, BVPS.',
    expectedCount: 13,
  },
  {
    id: 'returns',
    segment: 'stock',
    name: 'Lợi nhuận & cổ tức',
    shortName: 'Lợi nhuận',
    nameEn: 'Returns & dividends',
    description: 'Đo hiệu quả một khoản đầu tư: ROI, HPR, CAGR, XIRR, tỷ suất cổ tức.',
    expectedCount: 14,
  },
  {
    id: 'risk',
    segment: 'stock',
    name: 'Rủi ro & danh mục',
    shortName: 'Rủi ro',
    nameEn: 'Risk & portfolio',
    description: 'Đo biến động và rủi ro: Beta, Sharpe, Sortino, Treynor, Max Drawdown, VaR.',
    expectedCount: 18,
  },
  {
    id: 'technical',
    segment: 'stock',
    name: 'Phân tích kỹ thuật',
    shortName: 'Kỹ thuật',
    nameEn: 'Technical analysis',
    description: 'Chỉ báo đọc từ chuỗi giá: MA, RSI, MACD, Bollinger, ATR, ADX.',
    expectedCount: 18,
  },
  {
    id: 'derivatives',
    segment: 'stock',
    name: 'Phái sinh & quyền chọn',
    shortName: 'Phái sinh',
    nameEn: 'Derivatives & options',
    description: 'Hợp đồng tương lai VN30F, quyền chọn, ký quỹ, đòn bẩy.',
    expectedCount: 7,
  },
  {
    id: 'fees-tax',
    segment: 'stock',
    name: 'Phí & thuế thị trường VN',
    shortName: 'Phí & thuế VN',
    nameEn: 'Vietnam market fees & taxes',
    description:
      'Phí môi giới, thuế chuyển nhượng, thuế cổ tức, phí lưu ký, giá hoà vốn thực, lợi nhuận ròng.',
    expectedCount: 8,
  },

  // ── Mảng tài chính cá nhân — 13 công thức ──────────────────────────────────
  {
    id: 'savings',
    segment: 'personal',
    name: 'Tiết kiệm',
    shortName: 'Tiết kiệm',
    nameEn: 'Savings',
    description: 'Lãi kép, lãi tiền gửi, tiết kiệm theo mục tiêu.',
    expectedCount: 5,
  },
  {
    id: 'investing',
    segment: 'personal',
    name: 'Đầu tư',
    shortName: 'Đầu tư',
    nameEn: 'Investing',
    description: 'Đầu tư định kỳ và giá trị tương lai của dòng tiền đều.',
    expectedCount: 2,
  },
  {
    id: 'loans',
    segment: 'personal',
    name: 'Vay nợ',
    shortName: 'Vay nợ',
    nameEn: 'Loans',
    description: 'Trả góp niên kim và gốc đều, lịch trả nợ từng kỳ, tổng lãi phải trả.',
    expectedCount: 3,
  },
  {
    id: 'personal-tax',
    segment: 'personal',
    name: 'Thuế thu nhập cá nhân',
    shortName: 'Thuế TNCN',
    nameEn: 'Personal income tax',
    description: 'Thuế thu nhập từ tiền lương theo biểu luỹ tiến từng phần.',
    expectedCount: 1,
  },
  {
    id: 'corporate-finance',
    segment: 'personal',
    name: 'Tài chính doanh nghiệp',
    shortName: 'Tài chính DN',
    nameEn: 'Corporate finance',
    description: 'Điểm hoà vốn sản lượng và NPV thẩm định dự án.',
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

/** Tổng số công thức dự kiến của một mảng — dùng cho nhãn “chứng khoán 95 / cá nhân 13” ở WF-01. */
export function expectedCountOf(segment: Category['segment']): number {
  return categoriesOf(segment).reduce((sum, c) => sum + c.expectedCount, 0);
}
