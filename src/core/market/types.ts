/**
 * Tầng DOMAIN — cấu trúc MarketConfig (gói WBS 1.3.2).
 *
 * CON-10 · LDR-03: mọi hằng số thuế và phí nằm ở đây, KHÔNG hard-code trong công thức.
 * Luật đổi thì thêm một bản ghi mới với `effectiveFrom` mới, không sửa đè bản cũ —
 * nhờ vậy tính lại được một giao dịch trong quá khứ theo đúng biểu phí thời điểm đó.
 */

import type { Bilingual, MarketConstant } from '../types';

/**
 * Khoá hằng số dùng chung cho cả hệ thống.
 * Union chứ không phải string tự do, để công thức gõ sai khoá là hỏng lúc typecheck.
 */
export type MarketConstantKey =
  | 'fee.brokerage.buy' // phí môi giới lệnh mua
  | 'fee.brokerage.sell' // phí môi giới lệnh bán
  | 'fee.custody' // phí lưu ký theo cổ phiếu mỗi tháng
  | 'tax.transfer.sell' // thuế thu nhập từ chuyển nhượng chứng khoán
  | 'tax.dividend.cash' // thuế thu nhập từ cổ tức tiền mặt
  | 'market.settlement.days' // chu kỳ thanh toán T+n
  | 'derivative.vn30f.multiplier'; // hệ số nhân hợp đồng VN30F

/** Hằng số đã gắn khoá có kiểu. */
export interface TypedMarketConstant extends MarketConstant {
  key: MarketConstantKey;
}

/**
 * Một biểu phí chọn được ở ô “Biểu phí” của WF-08 và WF-13.
 * Một biểu phí có thể chứa nhiều bản ghi cùng khoá nhưng khác `effectiveFrom`.
 */
export interface FeeSchedule {
  id: string;
  /** Tên hiện trong danh sách chọn, ví dụ 'Mặc định HOSE 2026'. */
  name: Bilingual;
  description: Bilingual;
  constants: ReadonlyArray<TypedMarketConstant>;
}

/** Toàn bộ cấu hình thị trường của sản phẩm. */
export interface MarketConfig {
  schedules: ReadonlyArray<FeeSchedule>;
  /** id biểu phí dùng khi người dùng chưa chọn gì. */
  defaultScheduleId: string;
}
