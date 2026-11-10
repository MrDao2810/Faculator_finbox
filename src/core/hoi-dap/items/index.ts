import type { CauHoiThuongGap } from '../types';
import { HOI_DAP_CORPORATE } from './corporate';
import { HOI_DAP_DERIVATIVES } from './derivatives';
import { HOI_DAP_FEES } from './fees';
import { HOI_DAP_FUNDAMENTALS } from './fundamentals';
import { HOI_DAP_MULTIPLES } from './multiples';
import { HOI_DAP_PERFORMANCE } from './performance';
import { HOI_DAP_PERSONAL } from './personal';
import { HOI_DAP_PLANNING } from './planning';
import { HOI_DAP_RETURNS } from './returns';
import { HOI_DAP_RISK } from './risk';
import { HOI_DAP_RISK_DRAWDOWN } from './risk-drawdown';
import { HOI_DAP_RISK_RATIOS } from './risk-ratios';
import { HOI_DAP_RISK_VOLATILITY } from './risk-volatility';
import { HOI_DAP_TECHNICAL_TREND } from './technical-trend';
import { HOI_DAP_TECHNICAL_VOLATILITY } from './technical-volatility';
import { HOI_DAP_VALUATION_DCF } from './valuation-dcf';
import { HOI_DAP_VALUATION_MULTIPLES } from './valuation-multiples';

/**
 * Gộp câu hỏi của mọi nhóm công thức. Mỗi file nhóm mang tên file công thức tương ứng trong
 * `src/core/formulas/`, xuất một bản ghi `id → câu hỏi`.
 */
export const HOI_DAP_MUC: Readonly<Record<string, ReadonlyArray<CauHoiThuongGap>>> = {
  ...HOI_DAP_CORPORATE,
  ...HOI_DAP_DERIVATIVES,
  ...HOI_DAP_FEES,
  ...HOI_DAP_FUNDAMENTALS,
  ...HOI_DAP_MULTIPLES,
  ...HOI_DAP_PERFORMANCE,
  ...HOI_DAP_PERSONAL,
  ...HOI_DAP_PLANNING,
  ...HOI_DAP_RETURNS,
  ...HOI_DAP_RISK,
  ...HOI_DAP_RISK_DRAWDOWN,
  ...HOI_DAP_RISK_RATIOS,
  ...HOI_DAP_RISK_VOLATILITY,
  ...HOI_DAP_TECHNICAL_TREND,
  ...HOI_DAP_TECHNICAL_VOLATILITY,
  ...HOI_DAP_VALUATION_DCF,
  ...HOI_DAP_VALUATION_MULTIPLES,
};
