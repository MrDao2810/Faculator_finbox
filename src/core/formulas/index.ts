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
export { constantsUsedBy, substitutionConstants } from './shared';

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

/**
 * 17 file nhóm theo khoá, khoá là TÊN FILE trong thư mục này (28/10/2026).
 *
 * Có bảng này để mỗi trang chi tiết chỉ nạp NHÓM của chính nó: `page.tsx` (lúc build) hỏi
 * `groupOfFormula()`, rồi vỏ `FormulaDetailHost` nạp động đúng một file cửa
 * `src/application/formula-groups/<khoá>.ts`. Trước đó `FormulaDetail` nhập `FORMULA_MODULES`, nên
 * trang nào cũng chở cả 111 công thức — 764 kB thô / ~198 kB gzip, chỉ 22,5 kB trong đó là `calc`.
 *
 * Thêm một file nhóm thì thêm khoá ở đây, thêm file cửa cùng tên, và một dòng `dynamic()` trong
 * `FormulaDetailHost.tsx`; `formula-groups.test.ts` đỏ nếu thiếu một trong ba.
 */
export const FORMULA_GROUPS = {
  multiples: MULTIPLE_FORMULAS,
  fundamentals: FUNDAMENTAL_FORMULAS,
  'valuation-multiples': VALUATION_MULTIPLE_FORMULAS,
  'valuation-dcf': VALUATION_DCF_FORMULAS,
  fees: FEE_FORMULAS,
  returns: RETURN_FORMULAS,
  performance: PERFORMANCE_FORMULAS,
  risk: RISK_FORMULAS,
  'risk-drawdown': RISK_DRAWDOWN_FORMULAS,
  'risk-volatility': RISK_VOLATILITY_FORMULAS,
  'risk-ratios': RISK_RATIO_FORMULAS,
  'technical-trend': TECHNICAL_TREND_FORMULAS,
  'technical-volatility': TECHNICAL_VOLATILITY_FORMULAS,
  derivatives: DERIVATIVE_FORMULAS,
  personal: PERSONAL_FORMULAS,
  planning: PLANNING_FORMULAS,
  corporate: CORPORATE_FORMULAS,
} as const satisfies Record<string, ReadonlyArray<FormulaModule>>;

export type FormulaGroupKey = keyof typeof FORMULA_GROUPS;

/** Nhóm chứa công thức `id`; không có thì undefined. */
export function groupOfFormula(id: string): FormulaGroupKey | undefined {
  for (const [key, modules] of Object.entries(FORMULA_GROUPS)) {
    if (modules.some((m) => m.spec.id === id)) return key as FormulaGroupKey;
  }
  return undefined;
}

/** Chỉ phần metadata — thứ Registry, sitemap và giao diện đọc tới. */
export const ALL_FORMULAS: ReadonlyArray<FormulaSpec> = FORMULA_MODULES.map((m) => m.spec);

/** Tra hàm tính theo id công thức. Không có thì trả undefined, nơi gọi phải xử lý. */
export function findFormulaModule(id: string): FormulaModule | undefined {
  return FORMULA_MODULES.find((m) => m.spec.id === id);
}
