/**
 * Tầng APPLICATION — cửa duy nhất để tầng giao diện chạm vào Domain (CON-03).
 *
 * src/app và src/ui bị ESLint chặn không cho import thẳng @/core hay @/data.
 * Muốn dùng gì ở Domain thì mở cửa ra đây.
 *
 * Đây là barrel CHỌN LỌC, không phải `export *`: thêm từng thứ một, có chủ đích.
 */

// ── Kiểu dữ liệu nền ────────────────────────────────────────────────────────
export type {
  CalcOutput,
  CalcWarning,
  ControlType,
  Level,
  MarketConstant,
  VariableOption,
  VariableSpec,
  WarningCode,
} from '@/core/types';

// ── CalcOutput & bất biến FR-06 ─────────────────────────────────────────────
export { clampToSpec, fail, inherited, isCalculated, ok, snapToStep } from '@/core/calc-output';

// ── Catalog cảnh báo tiếng Việt (WF-15) ─────────────────────────────────────
export {
  WARNING_CODES,
  WARNING_LABELS,
  divideByZero,
  incompleteInput,
  inheritedFrom,
  meaningless,
  missingSeries,
  modelViolation,
} from '@/core/warnings';

// ── Formula Registry ────────────────────────────────────────────────────────
export type {
  Category,
  ChartType,
  Explanation,
  FormulaDependency,
  FormulaExample,
  FormulaSource,
  FormulaSpec,
  FormulaTestCase,
  Registry,
  RegistryIssue,
  Segment,
} from '@/core/registry';

export {
  CATEGORIES,
  FORMULAS,
  categoriesOf,
  countByCategory,
  createRegistry,
  defaultInputs,
  expectedCountOf,
  featuredFormulas,
  findCategory,
  variablesForLevel,
} from '@/core/registry';

// ── MarketConfig — thuế & phí (CON-10) ──────────────────────────────────────
export type { FeeSchedule, MarketConfig, MarketConstantKey } from '@/core/market';

export {
  MARKET_CONFIG,
  constantsAsOf,
  findSchedule,
  resolveConstant,
  resolveRate,
  resolveValue,
  scheduleOrDefault,
} from '@/core/market';
