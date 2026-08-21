/**
 * Tầng DOMAIN — số liệu MarketConfig (gói WBS 1.3.2).
 *
 * ĐÃ ĐỐI CHIẾU VĂN BẢN GỐC — gói WBS 5.1.1 đóng ngày 17/08/2026, hết điều kiện chặn v0.1 về
 * số liệu thị trường.
 *
 * Bảy hằng số dưới đây qua hai vòng: máy tra nguồn mở (14/08/2026 — hồ sơ `README.md` cùng thư
 * mục ghi từng nguồn và từng quyết định Q1–Q7), rồi chủ dự án đọc bản gốc có dấu và xác nhận,
 * kể cả hai mốc hiệu lực của bản ghi thuế tiền nhiệm mà vòng máy không tra tới.
 *
 * Sửa một con số ở đây là đổi kết quả của 8 công thức phí & thuế, nên đi kèm bắt buộc phải có
 * `legalBasis` trỏ đúng văn bản ĐANG hiệu lực (LDR-03, CON-10) và một dòng trong hồ sơ nói vì
 * sao. Mục cuối hồ sơ liệt kê ba chỗ đã biết là sẽ phải tra lại — thông tư phí, biểu giá VSDC,
 * và chu kỳ thanh toán.
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
  name: { vi: 'Mặc định HOSE 2026', en: 'HOSE default 2026' },
  description: {
    vi: 'Biểu phí và thuế áp dụng cho giao dịch cổ phiếu niêm yết trên HOSE.',
    en: 'Fee and tax schedule applied to trading of stocks listed on HOSE.',
  },
  constants: [
    {
      key: 'fee.brokerage.buy',
      label: { vi: 'Phí môi giới lệnh mua', en: 'Buy order brokerage fee' },
      value: 0.15,
      unit: '%',
      effectiveFrom: '2022-01-01',
      legalBasis: {
        vi: 'Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45% giá trị giao dịch, không mức sàn',
        en: 'Circular 102/2021/TT-BTC — brokerage fee capped at 0.45% of transaction value, no floor',
      },
      note: {
        vi: 'Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.',
        en: 'A common market rate, not a statutory rate. Editable in Settings.',
      },
    },
    {
      key: 'fee.brokerage.sell',
      label: { vi: 'Phí môi giới lệnh bán', en: 'Sell order brokerage fee' },
      value: 0.15,
      unit: '%',
      effectiveFrom: '2022-01-01',
      legalBasis: {
        vi: 'Thông tư 102/2021/TT-BTC — mức trần phí môi giới 0,45% giá trị giao dịch, không mức sàn',
        en: 'Circular 102/2021/TT-BTC — brokerage fee capped at 0.45% of transaction value, no floor',
      },
      note: {
        vi: 'Mức phổ biến trên thị trường, không phải mức luật định. Sửa được ở màn Cài đặt.',
        en: 'A common market rate, not a statutory rate. Editable in Settings.',
      },
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
      label: { vi: 'Thuế chuyển nhượng chứng khoán', en: 'Securities transfer tax' },
      value: 0.1,
      unit: '%',
      // 01/01/2015 là ngày Luật 71/2014/QH13 bỏ cách tính 20% trên lãi cuối năm, đưa 0,1%/lần
      // thành cách duy nhất. Trước đó tồn tại song song hai cách nên app không mô hình được —
      // asOf trước 2015 báo thiếu hằng số là ĐÚNG.
      effectiveFrom: '2015-01-01',
      legalBasis: {
        vi: 'Luật 71/2014/QH13 sửa đổi Luật Thuế thu nhập cá nhân — 0,1% giá bán từng lần',
        en: 'Law 71/2014/QH13 amending the Personal Income Tax Law — 0.1% of the sale value per trade',
      },
      note: {
        vi: 'Tính trên giá trị bán, thu cả khi giao dịch lỗ.',
        en: 'Charged on the sale value, collected even when the trade is at a loss.',
      },
    },
    {
      key: 'tax.transfer.sell',
      label: { vi: 'Thuế chuyển nhượng chứng khoán', en: 'Securities transfer tax' },
      value: 0.1,
      unit: '%',
      effectiveFrom: '2026-07-01',
      legalBasis: {
        vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 13 khoản 2 — 0,1% giá bán từng lần',
        en: 'Personal Income Tax Law 109/2025/QH15, Article 13 clause 2 — 0.1% of the sale value per trade',
      },
      note: {
        vi: 'Tính trên giá trị bán, thu cả khi giao dịch lỗ.',
        en: 'Charged on the sale value, collected even when the trade is at a loss.',
      },
    },
    {
      key: 'tax.dividend.cash',
      label: { vi: 'Thuế cổ tức tiền mặt', en: 'Cash dividend tax' },
      value: 5,
      unit: '%',
      effectiveFrom: '2009-01-01',
      legalBasis: {
        vi: 'Luật Thuế thu nhập cá nhân 04/2007/QH12 — thuế đầu tư vốn 5%',
        en: 'Personal Income Tax Law 04/2007/QH12 — 5% tax on capital investment income',
      },
    },
    {
      key: 'tax.dividend.cash',
      label: { vi: 'Thuế cổ tức tiền mặt', en: 'Cash dividend tax' },
      value: 5,
      unit: '%',
      effectiveFrom: '2026-07-01',
      legalBasis: {
        vi: 'Luật Thuế thu nhập cá nhân 109/2025/QH15, Điều 12 — thuế đầu tư vốn 5%',
        en: 'Personal Income Tax Law 109/2025/QH15, Article 12 — 5% tax on capital investment income',
      },
      note: {
        vi: 'Luật mới giảm 50% thuế cho lợi tức từ quỹ đầu tư chứng khoán/BĐS — ngoài phạm vi công thức cổ phiếu.',
        en: 'The new law cuts the tax by 50% for income from securities/real-estate investment funds — outside the scope of the stock formulas here.',
      },
    },
    {
      key: 'fee.custody',
      label: { vi: 'Phí lưu ký', en: 'Custody fee' },
      value: 0.27,
      unit: '₫/CP/tháng',
      effectiveFrom: '2022-01-01',
      legalBasis: {
        vi: 'Biểu giá kèm Thông tư 101/2021/TT-BTC (nay biểu giá do VSDC ban hành theo cơ chế Thông tư 83/2024/TT-BTC, mức 0,27 ₫ vẫn giữ)',
        en: 'Price schedule under Circular 101/2021/TT-BTC (now issued by VSDC under the Circular 83/2024/TT-BTC mechanism; the 0.27 ₫ rate is unchanged)',
      },
    },
    {
      key: 'market.settlement.days',
      label: { vi: 'Chu kỳ thanh toán', en: 'Settlement cycle' },
      value: 2,
      unit: 'ngày',
      effectiveFrom: '2022-08-29',
      legalBasis: {
        vi: 'Quy chế bù trừ và thanh toán của VSD — Quyết định 109/QĐ-VSD 19/08/2022 (hiện hành: Quyết định 39/QĐ-HĐTV 2025 của VSDC)',
        en: 'VSD clearing and settlement regulation — Decision 109/QĐ-VSD dated 2022-08-19 (currently VSDC Decision 39/QĐ-HĐTV 2025)',
      },
    },
    {
      key: 'derivative.vn30f.multiplier',
      label: { vi: 'Hệ số nhân hợp đồng VN30F', en: 'VN30F contract multiplier' },
      value: 100_000,
      unit: '₫/điểm',
      effectiveFrom: '2017-08-10',
      legalBasis: {
        vi: 'Mẫu hợp đồng tương lai chỉ số VN30 do HNX xây dựng, UBCKNN chấp thuận — thị trường phái sinh vận hành tại HNX từ 10/08/2017',
        en: 'VN30 index futures contract specification drafted by HNX and approved by the State Securities Commission — the derivatives market has run on HNX since 2017-08-10',
      },
    },
  ],
};

/** Cấu hình thị trường đang dùng. Thêm biểu phí của từng công ty chứng khoán vào đây. */
export const MARKET_CONFIG: MarketConfig = {
  schedules: [HOSE_2026],
  defaultScheduleId: HOSE_2026.id,
};
