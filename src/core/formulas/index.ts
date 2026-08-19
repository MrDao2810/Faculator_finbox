/**
 * Tầng DOMAIN — cửa gom của thư viện công thức (nhánh 5 của WBS).
 *
 * `FORMULA_MODULES` là nguồn duy nhất. `FORMULAS` suy ra từ nó chứ không khai riêng, nên
 * không thể có công thức nào hiện trên giao diện mà thiếu hàm tính, cũng không thể có hàm
 * tính nào không ai gọi tới.
 *
 * Thêm một công thức mới: viết `FormulaModule` trong file nhóm tương ứng, thêm vào mảng
 * xuất của file đó, xong. Ca kiểm thử khai trong `spec.tests` tự động được chạy
 * (xem `formulas.test.ts`), và trang `/cong-thuc/<id>/` tự động được sinh lúc build.
 *
 * Tiến độ: xem `README.md` cùng thư mục. Số công thức thật lấy từ `FORMULA_MODULES.length`,
 * không viết vào chú thích — chú thích đếm tay là thứ lệch đầu tiên khi nhánh 5 đổ thêm.
 */

import type { FormulaModule } from '../calc/types';
import type { FormulaSpec } from '../registry/types';
import { CORPORATE_FORMULAS } from './corporate';
import { DERIVATIVE_FORMULAS } from './derivatives';
import { FEE_FORMULAS } from './fees';
import { FUNDAMENTAL_FORMULAS } from './fundamentals';
import { MULTIPLE_FORMULAS } from './multiples';
import { PERFORMANCE_FORMULAS } from './performance';
import { PERSONAL_FORMULAS } from './personal';
import { PLANNING_FORMULAS } from './planning';
import { RETURN_FORMULAS } from './returns';
import { RISK_FORMULAS } from './risk';
import { RISK_DRAWDOWN_FORMULAS } from './risk-drawdown';
import { RISK_RATIO_FORMULAS } from './risk-ratios';
import { RISK_VOLATILITY_FORMULAS } from './risk-volatility';
import { TECHNICAL_TREND_FORMULAS } from './technical-trend';
import { TECHNICAL_VOLATILITY_FORMULAS } from './technical-volatility';
import { VALUATION_DCF_FORMULAS } from './valuation-dcf';
import { VALUATION_MULTIPLE_FORMULAS } from './valuation-multiples';

export type { FeeBreakdown, FeeBreakdownRow } from './fees';
export { buildFeeBreakdown } from './fees';

export type { AmortisationRow, LoanMethod, ScheduleCell } from './personal';
export {
  SCHEDULE_GAP,
  amortisationFor,
  annuityPayment,
  buildAmortisation,
  condenseSchedule,
  condenseWithGaps,
  methodOf,
} from './personal';

export type { XirrOptions } from './returns';
export { xirr, xirrNotConverged } from './returns';

// Hằng số thị trường một công thức tra — khối minh bạch nguồn số của màn chi tiết
export { constantsUsedBy } from './shared';

/** Toàn bộ công thức đã có hàm tính. */
export const FORMULA_MODULES: ReadonlyArray<FormulaModule> = [
  ...MULTIPLE_FORMULAS,
  ...FUNDAMENTAL_FORMULAS,
  ...VALUATION_MULTIPLE_FORMULAS,
  ...VALUATION_DCF_FORMULAS,
  ...FEE_FORMULAS,
  ...RETURN_FORMULAS,
  ...PERFORMANCE_FORMULAS,
  ...RISK_FORMULAS,
  ...RISK_DRAWDOWN_FORMULAS,
  ...RISK_VOLATILITY_FORMULAS,
  ...RISK_RATIO_FORMULAS,
  ...TECHNICAL_TREND_FORMULAS,
  ...TECHNICAL_VOLATILITY_FORMULAS,
  ...DERIVATIVE_FORMULAS,
  ...PERSONAL_FORMULAS,
  ...PLANNING_FORMULAS,
  ...CORPORATE_FORMULAS,
];

/** Chỉ phần metadata — thứ Registry, sitemap và giao diện đọc tới. */
export const ALL_FORMULAS: ReadonlyArray<FormulaSpec> = FORMULA_MODULES.map((m) => m.spec);

/** Tra hàm tính theo id công thức. Không có thì trả undefined, nơi gọi phải xử lý. */
export function findFormulaModule(id: string): FormulaModule | undefined {
  return FORMULA_MODULES.find((m) => m.spec.id === id);
}
