/**
 * Tầng DOMAIN — cửa gom khung "cách tính" của 111 công thức.
 *
 * ⚠ CHỈ lúc build và trong ca kiểm. Không file nào nằm trong gói JS máy khách được import thư mục
 * này, kể cả qua barrel `@/application`: lối vào duy nhất cho tầng giao diện là
 * `@/application/how-to`, và chỉ `page.tsx` (server component) dùng nó. Lý do ở docblock `types.ts`.
 *
 * Mỗi file nhóm ở đây mang cùng tên với file nhóm ở `src/core/formulas/`, để người sửa `calc` của
 * một công thức biết ngay khung cách tính của nó nằm đâu.
 */

import { HOW_TO_CORPORATE } from './corporate';
import { HOW_TO_DERIVATIVES } from './derivatives';
import { HOW_TO_FEES } from './fees';
import { HOW_TO_FUNDAMENTALS } from './fundamentals';
import { HOW_TO_MULTIPLES } from './multiples';
import { HOW_TO_PERFORMANCE } from './performance';
import { HOW_TO_PERSONAL } from './personal';
import { HOW_TO_PLANNING } from './planning';
import { HOW_TO_RETURNS } from './returns';
import { HOW_TO_RISK } from './risk';
import { HOW_TO_RISK_DRAWDOWN } from './risk-drawdown';
import { HOW_TO_RISK_RATIOS } from './risk-ratios';
import { HOW_TO_RISK_VOLATILITY } from './risk-volatility';
import { HOW_TO_TECHNICAL_TREND } from './technical-trend';
import { HOW_TO_TECHNICAL_VOLATILITY } from './technical-volatility';
import type { FormulaHowTo } from './types';
import { HOW_TO_VALUATION_DCF } from './valuation-dcf';
import { HOW_TO_VALUATION_MULTIPLES } from './valuation-multiples';

export type {
  DefinedHowTo,
  DerivedHowTo,
  FormulaHowTo,
  HowToEntry,
  HowToPhrases,
  HowToSkipReason,
  HowToStep,
  LinkedHowTo,
} from './types';

/**
 * Dữ liệu theo từng file nhóm, khoá là tên file của nhóm ở `src/core/formulas/`.
 *
 * Giữ riêng thay vì chỉ xuất bản gộp: gộp bằng spread thì một id khai ở hai file lặng lẽ đè nhau,
 * và cửa gác cần đếm từng file mới thấy được. Cửa gác `calcEvidence` cũng cần biết khung thuộc file
 * nào để đọc đúng mã nguồn.
 */
export const HOW_TO_BY_FILE: Readonly<Record<string, Readonly<Record<string, FormulaHowTo>>>> = {
  'corporate.ts': HOW_TO_CORPORATE,
  'derivatives.ts': HOW_TO_DERIVATIVES,
  'fees.ts': HOW_TO_FEES,
  'fundamentals.ts': HOW_TO_FUNDAMENTALS,
  'multiples.ts': HOW_TO_MULTIPLES,
  'performance.ts': HOW_TO_PERFORMANCE,
  'personal.ts': HOW_TO_PERSONAL,
  'planning.ts': HOW_TO_PLANNING,
  'returns.ts': HOW_TO_RETURNS,
  'risk.ts': HOW_TO_RISK,
  'risk-drawdown.ts': HOW_TO_RISK_DRAWDOWN,
  'risk-ratios.ts': HOW_TO_RISK_RATIOS,
  'risk-volatility.ts': HOW_TO_RISK_VOLATILITY,
  'technical-trend.ts': HOW_TO_TECHNICAL_TREND,
  'technical-volatility.ts': HOW_TO_TECHNICAL_VOLATILITY,
  'valuation-dcf.ts': HOW_TO_VALUATION_DCF,
  'valuation-multiples.ts': HOW_TO_VALUATION_MULTIPLES,
};

/** Toàn bộ khung cách tính, khoá là id công thức. */
export const HOW_TO: Readonly<Record<string, FormulaHowTo>> = Object.assign(
  {},
  ...Object.values(HOW_TO_BY_FILE),
) as Readonly<Record<string, FormulaHowTo>>;

/** Khung cách tính của một công thức. Chưa khai thì `undefined` — nơi gọi hiểu là "không có khung". */
export function howToFor(formulaId: string): FormulaHowTo | undefined {
  return HOW_TO[formulaId];
}
