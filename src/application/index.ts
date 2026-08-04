/**
 * Tầng APPLICATION — cửa duy nhất để tầng giao diện chạm vào Domain (CON-03).
 *
 * src/app và src/ui bị ESLint chặn không cho import thẳng @/core hay @/data.
 * Muốn dùng gì ở Domain thì mở cửa ra đây.
 *
 * Đây là barrel CHỌN LỌC, không phải `export *`: thêm từng thứ một, có chủ đích.
 *
 * Phần React (context, hook) KHÔNG nằm ở đây mà có đường dẫn riêng, để trang chạy phía
 * máy chủ như `sitemap.ts` không phải kéo theo React:
 *   @/application/preferences-context · @/application/use-online-status · @/application/use-list-params
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

// ── Định dạng số theo quy ước Việt Nam (CON-05) ─────────────────────────────
export type { FormatNumberOptions, UnitScaleId } from '@/core/format';
export {
  NO_VALUE,
  UNIT_SCALES,
  findUnitScale,
  formatCalcOutput,
  formatNumber,
  formatValueWithUnit,
  parseViNumber,
  scaleToDong,
  scaleToUnit,
} from '@/core/format';

// ── Trạng thái ô nhập — 5 trạng thái WF-16 (gói 2.3.1) ──────────────────────
export type { InputState, InputStateArgs, InputStateResult } from '@/core/input-state';
export {
  STATE_PRIORITY,
  commitValue,
  isLockedForMode,
  isOutOfRange,
  outOfRangeNote,
  resolveInputState,
} from '@/core/input-state';

// ── Ô nhập móc nối — FR-15 (gói 2.3.4) ──────────────────────────────────────
export type { LinkedArgs, LinkedMode, LinkedResult, LinkedUpstream } from '@/core/linked-input';
export {
  linkedInputs,
  linkedWarning,
  missingLinkedLabels,
  resolveLinked,
  startOverrideValue,
} from '@/core/linked-input';

// ── Dải luồng móc nối — WF-04 (gói 2.4.6) ───────────────────────────────────
export type { FlowChain, FlowStep } from '@/core/flow-chain';
export { buildFlowChain, flowDepth } from '@/core/flow-chain';

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
  countByCategoryFor,
  countBySegmentFor,
  createRegistry,
  defaultInputs,
  expectedCountOf,
  featuredFormulas,
  findCategory,
  normalizeVi,
  searchFormulas,
  selectFormulas,
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

// ── Khung ứng dụng (gói 1.4.1) ──────────────────────────────────────────────
export type { Locale, MessageKey } from './i18n';
export { LOCALES, isLocale, missingKeys, t } from './i18n';

export type { NavItem, RouteKey } from './routes';
export { NAV_ITEMS, ROUTES, activeRouteKey, formulaPath } from './routes';

export type { Preferences } from './preferences';
export { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from './preferences';

export type { ListParams, ListSort, SegmentFilter } from './url-state';
export {
  DEFAULT_LIST_PARAMS,
  isDefaultListParams,
  listParamsToQuery,
  parseListParams,
  serializeListParams,
} from './url-state';
