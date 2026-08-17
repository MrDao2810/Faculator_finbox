/**
 * Tầng DOMAIN — số liệu MarketConfig (gói WBS 1.3.2).
 *
 * ⚠ BẢN THẢO — CHỜ NGƯỜI ĐỐI CHIẾU VĂN BẢN GỐC CÓ DẤU.
 * Gói WBS 5.1.1 ghi rõ: mức phí, thuế suất và ngày hiệu lực dưới đây BẮT BUỘC được
 * người rà soát đối chiếu với văn bản gốc trước khi phát hành v0.1.
 *
 * Đã qua MỘT vòng đối chiếu trên nguồn mở (14/08/2026, chủ dự án duyệt Q1–Q7) — xem hồ sơ
 * `README.md` cùng thư mục: cả 7 con số khớp nguồn; 4 bản ghi được sửa phần căn cứ/ngày theo
 * hồ sơ ấy. Nhãn bản thảo GIỮ NGUYÊN vì mọi nguồn của vòng này là nguồn thứ cấp
 * (thuvienphapluat.vn chặn máy) — gỡ nhãn là việc của người rà đọc bản gốc trên vbpl.vn/Công báo.
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
      effectiveFrom: '2022-01-01',
      legalBasis:
        'Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45% giá trị giao dịch, không mức sàn',
      note: 'Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.',
    },
    {
      key: 'fee.brokerage.sell',
      label: 'Phí môi giới lệnh bán',
      value: 0.15,
      unit: '%',
      effectiveFrom: '2022-01-01',
      legalBasis:
        'Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45% giá trị giao dịch, không mức sàn',
      note: 'Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.',
    },
    /*
     * Hai hằng số thuế có HAI bản ghi: luật cũ rồi luật mới. Không phải trang trí — docblock của
     * `resolve.ts` hứa người dùng tính lại được giao dịch cũ theo đúng biểu phí thời điểm đó, mà
     * chỉ có bản 01/07/2026 thì mọi `asOf` trước ngày ấy đều báo "thiếu hằng số" cho một mức thuế
     * đã tồn tại nhiều năm. Hai mức trùng nhau (0,1% và 5%) nhưng căn cứ khác nhau, và căn cứ là
     * thứ hiện ra ở khối Nguồn.
     */
    {
      key: 'tax.transfer.sell',
      label: 'Thuế chuyển nhượng chứng khoán',
      value: 0.1,
      unit: '%',
      // 01/01/2015 là ngày Luật 71/2014/QH13 bỏ cách tính 20% trên lãi cuối năm, đưa 0,1%/lần
      // thành cách duy nhất. Trước đó tồn tại song song hai cách nên app không mô hình được —
      // asOf trước 2015 báo thiếu hằng số là ĐÚNG.
      effectiveFrom: '2015-01-01',
      legalBasis: 'Luật 71/2014/QH13 sửa đổi Luật Thuế thu nhập cá nhân — 0,1% giá bán từng lần',
      note: 'Tính trên giá trị bán, thu cả khi giao dịch lỗ.',
    },
    {
      key: 'tax.transfer.sell',
      label: 'Thuế chuyển nhượng chứng khoán',
      value: 0.1,
      unit: '%',
      effectiveFrom: '2026-07-01',
      legalBasis:
        'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2 — 0,1% giá bán từng lần',
      note: 'Tính trên giá trị bán, thu cả khi giao dịch lỗ.',
    },
    {
      key: 'tax.dividend.cash',
      label: 'Thuế cổ tức tiền mặt',
      value: 5,
      unit: '%',
      effectiveFrom: '2009-01-01',
      legalBasis: 'Luật Thuế thu nhập cá nhân 04/2007/QH12 — thuế đầu tư vốn 5%',
    },
    {
      key: 'tax.dividend.cash',
      label: 'Thuế cổ tức tiền mặt',
      value: 5,
      unit: '%',
      effectiveFrom: '2026-07-01',
      legalBasis: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 12 — thuế đầu tư vốn 5%',
      note: 'Luật mới giảm 50% thuế cho lợi tức từ quỹ đầu tư chứng khoán/BĐS — ngoài phạm vi công thức cổ phiếu.',
    },
    {
      key: 'fee.custody',
      label: 'Phí lưu ký',
      value: 0.27,
      unit: '₫/CP/tháng',
      effectiveFrom: '2022-01-01',
      legalBasis:
        'Biểu giá kèm Thông tư 101/2021/TT-BTC (nay biểu giá do VSDC ban hành theo cơ chế Thông tư 83/2024/TT-BTC, mức 0,27 ₫ vẫn giữ)',
    },
    {
      key: 'market.settlement.days',
      label: 'Chu kỳ thanh toán',
      value: 2,
      unit: 'ngày',
      effectiveFrom: '2022-08-29',
      legalBasis:
        'Quy chế bù trừ và thanh toán của VSD — Quyết định 109/QĐ-VSD 19/08/2022 (hiện hành: Quyết định 39/QĐ-HĐTV 2025 của VSDC)',
    },
    {
      key: 'derivative.vn30f.multiplier',
      label: 'Hệ số nhân hợp đồng VN30F',
      value: 100_000,
      unit: '₫/điểm',
      effectiveFrom: '2017-08-10',
      legalBasis:
        'Mẫu hợp đồng tương lai chỉ số VN30 do HNX xây dựng, UBCKNN chấp thuận — thị trường phái sinh vận hành tại HNX từ 10/08/2017',
    },
  ],
};

/** Cấu hình thị trường đang dùng. Thêm biểu phí của từng công ty chứng khoán vào đây. */
export const MARKET_CONFIG: MarketConfig = {
  schedules: [HOSE_2026],
  defaultScheduleId: HOSE_2026.id,
};
