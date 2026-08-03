/**
 * Tầng DOMAIN — 12 nhóm công thức của FR-01.
 *
 * Số lượng ở `expectedCount` lấy đúng bảng SRS mục 3.8: 94 công thức mảng chứng khoán
 * và 13 công thức mảng tài chính cá nhân, tổng 107.
 */

import type { Category } from './types';

export const CATEGORIES: ReadonlyArray<Category> = [
  // ── Mảng chứng khoán — 94 công thức ────────────────────────────────────────
  {
    id: 'valuation',
    segment: 'stock',
    name: 'Định giá',
    nameEn: 'Valuation',
    description: 'Ước tính giá trị hợp lý của cổ phiếu: bội số, chiết khấu dòng tiền, cổ tức.',
    expectedCount: 18,
  },
  {
    id: 'fundamentals',
    segment: 'stock',
    name: 'Chỉ số doanh nghiệp',
    nameEn: 'Company fundamentals',
    description: 'Đọc sức khoẻ doanh nghiệp từ báo cáo tài chính: ROE, ROA, D/E, EPS, BVPS.',
    expectedCount: 13,
  },
  {
    id: 'returns',
    segment: 'stock',
    name: 'Lợi nhuận & cổ tức',
    nameEn: 'Returns & dividends',
    description: 'Đo hiệu quả một khoản đầu tư: ROI, HPR, CAGR, XIRR, tỷ suất cổ tức.',
    expectedCount: 13,
  },
  {
    id: 'risk',
    segment: 'stock',
    name: 'Rủi ro & danh mục',
    nameEn: 'Risk & portfolio',
    description: 'Đo biến động và rủi ro: Beta, Sharpe, Sortino, Max Drawdown, VaR.',
    expectedCount: 17,
  },
  {
    id: 'technical',
    segment: 'stock',
    name: 'Phân tích kỹ thuật',
    nameEn: 'Technical analysis',
    description: 'Chỉ báo đọc từ chuỗi giá: MA, RSI, MACD, Bollinger, ATR, ADX.',
    expectedCount: 18,
  },
  {
    id: 'derivatives',
    segment: 'stock',
    name: 'Phái sinh & quyền chọn',
    nameEn: 'Derivatives & options',
    description: 'Hợp đồng tương lai VN30F, quyền chọn, ký quỹ, đòn bẩy.',
    expectedCount: 7,
  },
  {
    id: 'fees-tax',
    segment: 'stock',
    name: 'Phí & thuế thị trường VN',
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
    nameEn: 'Savings',
    description: 'Lãi kép, lãi tiền gửi, tiết kiệm theo mục tiêu.',
    expectedCount: 5,
  },
  {
    id: 'investing',
    segment: 'personal',
    name: 'Đầu tư',
    nameEn: 'Investing',
    description: 'Đầu tư định kỳ và giá trị tương lai của dòng tiền đều.',
    expectedCount: 2,
  },
  {
    id: 'loans',
    segment: 'personal',
    name: 'Vay nợ',
    nameEn: 'Loans',
    description: 'Trả góp niên kim và gốc đều, lịch trả nợ từng kỳ, tổng lãi phải trả.',
    expectedCount: 3,
  },
  {
    id: 'personal-tax',
    segment: 'personal',
    name: 'Thuế thu nhập cá nhân',
    nameEn: 'Personal income tax',
    description: 'Thuế thu nhập từ tiền lương theo biểu luỹ tiến từng phần.',
    expectedCount: 1,
  },
  {
    id: 'corporate-finance',
    segment: 'personal',
    name: 'Tài chính doanh nghiệp',
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

/** Tổng số công thức dự kiến của một mảng — dùng cho nhãn “chứng khoán 94 / cá nhân 13” ở WF-01. */
export function expectedCountOf(segment: Category['segment']): number {
  return categoriesOf(segment).reduce((sum, c) => sum + c.expectedCount, 0);
}
