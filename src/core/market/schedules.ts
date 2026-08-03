/**
 * Tầng DOMAIN — số liệu MarketConfig (gói WBS 1.3.2).
 *
 * ⚠ BẢN THẢO — CHỜ NGƯỜI ĐỐI CHIẾU VĂN BẢN GỐC.
 * Gói WBS 5.1.1 ghi rõ: mức phí, thuế suất và ngày hiệu lực dưới đây BẮT BUỘC được
 * người rà soát đối chiếu với văn bản gốc trước khi phát hành v0.1. Cấu trúc dữ liệu,
 * bộ resolver và test đã xong; phần cần kiểm là các con số và ngày tháng.
 *
 * Quy ước ghi giá trị (CON-05): hằng số phần trăm ghi theo dạng người đọc thấy trên
 * văn bản — 0,1 nghĩa là 0,1%. Đổi sang hệ số nhân bằng resolveRate().
 */

import type { FeeSchedule, MarketConfig } from './types';

/**
 * Biểu phí mặc định, đúng nhãn “Mặc định HOSE 2026” của WF-08 và WF-13.
 * Phí môi giới để ở mức phổ biến trên thị trường, người dùng sửa được ở màn Cài đặt;
 * thuế và phí lưu ký là mức luật định nên không sửa.
 */
export const HOSE_2026: FeeSchedule = {
  id: 'hose-2026',
  name: 'Mặc định HOSE 2026',
  description: 'Biểu phí và thuế áp dụng cho giao dịch cổ phiếu niêm yết trên HOSE.',
  constants: [
    {
      key: 'fee.brokerage.buy',
      label: 'Phí môi giới lệnh mua',
      value: 0.15,
      unit: '%',
      effectiveFrom: '2019-02-15',
      legalBasis: 'Thông tư 128/2018/TT-BTC — mức trần phí môi giới 0,5% giá trị giao dịch',
      note: 'Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.',
    },
    {
      key: 'fee.brokerage.sell',
      label: 'Phí môi giới lệnh bán',
      value: 0.15,
      unit: '%',
      effectiveFrom: '2019-02-15',
      legalBasis: 'Thông tư 128/2018/TT-BTC — mức trần phí môi giới 0,5% giá trị giao dịch',
      note: 'Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.',
    },
    {
      key: 'tax.transfer.sell',
      label: 'Thuế chuyển nhượng chứng khoán',
      value: 0.1,
      unit: '%',
      effectiveFrom: '2026-07-01',
      legalBasis: 'Luật Thuế thu nhập cá nhân 109/2025/QH15',
      note: 'Tính trên giá trị bán, thu cả khi giao dịch lỗ.',
    },
    {
      key: 'tax.dividend.cash',
      label: 'Thuế cổ tức tiền mặt',
      value: 5,
      unit: '%',
      effectiveFrom: '2026-07-01',
      legalBasis: 'Luật Thuế thu nhập cá nhân 109/2025/QH15',
    },
    {
      key: 'fee.custody',
      label: 'Phí lưu ký',
      value: 0.27,
      unit: '₫/CP/tháng',
      effectiveFrom: '2022-02-27',
      legalBasis: 'Biểu phí dịch vụ của VSD — Thông tư 101/2021/TT-BTC',
    },
    {
      key: 'market.settlement.days',
      label: 'Chu kỳ thanh toán',
      value: 2,
      unit: 'ngày',
      effectiveFrom: '2022-08-29',
      legalBasis: 'Quy chế giao dịch của HOSE — chu kỳ thanh toán T+2',
    },
    {
      key: 'derivative.vn30f.multiplier',
      label: 'Hệ số nhân hợp đồng VN30F',
      value: 100_000,
      unit: '₫/điểm',
      effectiveFrom: '2017-08-10',
      legalBasis: 'Quy chế của HOSE về hợp đồng tương lai chỉ số VN30',
    },
  ],
};

/** Cấu hình thị trường đang dùng. Thêm biểu phí của từng công ty chứng khoán vào đây. */
export const MARKET_CONFIG: MarketConfig = {
  schedules: [HOSE_2026],
  defaultScheduleId: HOSE_2026.id,
};
