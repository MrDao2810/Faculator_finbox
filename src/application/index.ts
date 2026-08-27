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
  Bilingual,
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
  formatIsoDate,
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

// ── Cửa sổ hiển thị của danh sách ảo hoá — WF-02 (gói 3.1.2) ────────────────
export type { VirtualWindow, VirtualWindowArgs } from '@/core/virtual-window';
export {
  DEFAULT_OVERSCAN,
  VIRTUALIZE_THRESHOLD,
  shouldVirtualize,
  windowRange,
} from '@/core/virtual-window';

// ── Dải luồng móc nối — WF-04 (gói 2.4.6) ───────────────────────────────────
export type { FlowChain, FlowStep } from '@/core/flow-chain';
export { buildFlowChain, flowDepth } from '@/core/flow-chain';

// ── Danh mục cá nhân — WF-06 (gói 3.4.1) ────────────────────────────────────
export type { Holding, HoldingValue, PortfolioSummary, PriceState } from '@/core/portfolio';
export { summarisePortfolio, valueHoldings } from '@/core/portfolio';

// ── Phép tính đã lưu — tab "Công thức" của WF-06 ────────────────────────────
export type { SuggestCalcNameInput } from '@/core/saved-calc-name';
export { MAX_SAVED_NAME, suggestCalcNames } from '@/core/saved-calc-name';

// ── Chuỗi giá OHLCV sửa tay — WF-05 (gói 3.3.1) ─────────────────────────────
export type { RowCheck, RowIssue, RowIssueCode, SeriesCheck, SeriesRow } from '@/core/price-series';
export { checkRow, checkSeries, closesOf, emptyRow, toCsv } from '@/core/price-series';

// ── Dòng tiền có ngày sửa tay — thân riêng của XIRR (gói WBS 3.3.1) ─────────
export type {
  Cashflow,
  CashflowIssueCode,
  CashflowRow,
  CashflowRowCheck,
  CashflowRowIssue,
  CashflowSeriesCheck,
} from '@/core/cashflow-series';
export {
  cashflowsOf,
  checkCashflowRow,
  checkCashflowSeries,
  emptyCashflowRow,
} from '@/core/cashflow-series';

// ── Dán dữ liệu từ Excel / CSV — WF-11 (gói 2.5.2) ──────────────────────────
export type { ColumnKind, PasteResult, PriceBar, SkippedRow } from '@/core/paste-import';
export {
  COLUMN_LABELS,
  MAX_PASTE_LINES,
  closeSeries,
  detectDelimiter,
  guessColumns,
  parsePaste,
  summarizeSkipped,
} from '@/core/paste-import';

// ── Nội dung file xuất — WF-12 (gói 2.5.3) ──────────────────────────────────
export type { ExportContent, ExportFormat, ExportLine, ExportOptions } from '@/core/export-content';
export { DISCLAIMER_VI, buildExportContent, exportFileName } from '@/core/export-content';

// ── Bộ số liệu mẫu qua DataProvider — WF-10 (gói 2.5.1, FR-17) ──────────────
export type { DailyBar, DataProvider, Fundamentals, Preset } from '@/data';
export {
  SAMPLE_DATA,
  createStaticProvider,
  hasDraftData,
  presetFillableKeys,
  presetInputs,
} from '@/data';

// ── Số liệu thị trường lúc chạy — gói "Danh mục dùng số liệu thật" ──────────
// Cổng THỨ HAI, tách khỏi `DataProvider` đồng bộ ở trên; xem `src/data/finbox/types.ts`.
export type {
  FeedFailureKind,
  LivePresetFormula,
  MarketFeed,
  TickerRef,
  TickerSnapshot,
} from '@/data';
export {
  LIVE_PRESET_FORMULAS,
  MARKET_FEED,
  MarketFeedError,
  createStubFeed,
  isAbortError,
  presetFromSnapshot,
} from '@/data';

export type { TickerListStatus, UseTickerListResult } from './use-ticker-list';
export { useTickerList } from './use-ticker-list';

export type { CachedTickerList } from './ticker-list-store';
export {
  TICKER_LIST_KEY,
  TICKER_LIST_TTL_MS,
  isTickerListFresh,
  parseCachedTickers,
  serializeCachedTickers,
} from './ticker-list-store';

export type { CachedPrices, CachedQuote } from './price-cache-store';
export {
  PRICE_CACHE_KEY,
  PRICE_CACHE_TTL_MS,
  isPriceCacheFresh,
  oldestAsOf,
  parseCachedPrices,
  serializeCachedPrices,
} from './price-cache-store';

// ── Bộ máy tính toán — chạy một công thức (nền cho nhánh 3 và 5) ────────────
export type { CalcContext, CalcFn, CalcInputs, CalcValues, FormulaModule } from '@/core/calc';
export { missingInputLabels, needsPriceSeries, runFormula } from '@/core/calc';

// ── Chạy cả một chuỗi công thức nối nhau — FR-15 (gói 5.2.3) ────────────────
export type { ChainField, ChainInputs, ChainOverrides, ChainResult, ChainStep } from '@/core/calc';
export { chainFor, runChain } from '@/core/calc';

// ── Biểu đồ — FR-07, FR-08 (nhánh 4) ────────────────────────────────────────
/*
 * Chỉ mở ra những gì `src/ui/charts` thật sự gọi. `sweepPoints`, `rankSweepVariables`,
 * `sweepDomain`, `niceAxis` cố ý KHÔNG có ở đây: chúng là nội bộ của `buildChartModel()`, và
 * barrel càng hẹp thì rung cây càng sạch (xem `sideEffects` trong package.json).
 */
export type {
  BreakdownBar,
  ChartArgs,
  ChartAxis,
  ChartKind,
  ChartModel,
  ChartPoint,
  ChartTable,
  ChartTick,
  ChartSeries,
  DrawableChart,
  LineChart,
  ReferenceLine,
  SeriesTone,
  SweepOption,
  ViewBoxRect,
  WaterfallChart,
} from '@/core/chart';
export {
  CHART_TABLE_ROWS,
  PRIMARY_SERIES_KEY,
  areaPath,
  buildChartModel,
  gapsOf,
  linePath,
  linearScale,
  nearestPointByX,
  pointerToViewBox,
  seriesOf,
  sweepCandidates,
} from '@/core/chart';

// ── Thư viện công thức — đủ 111 / 111 ───────────────────────────────────────
export { FORMULA_MODULES, findFormulaModule } from '@/core/formulas';

// Hằng số thị trường một công thức tra — khối minh bạch nguồn số của màn chi tiết
export { constantsUsedBy } from '@/core/formulas';

// Bóc tách phí & thuế — khối chính của WF-08 (gói 3.2.3)
export type { FeeBreakdown, FeeBreakdownRow } from '@/core/formulas';
export { buildFeeBreakdown } from '@/core/formulas';

// Lịch trả nợ — khối chính của WF-14 (gói 3.2.4)
export type { AmortisationRow, LoanMethod, ScheduleCell } from '@/core/formulas';
export {
  SCHEDULE_GAP,
  amortisationFor,
  condenseSchedule,
  condenseWithGaps,
  methodOf,
} from '@/core/formulas';

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
  FormulaSummary,
  FormulaTestCase,
  HighlightPart,
  Registry,
  RegistryIssue,
  Segment,
} from '@/core/registry';

export {
  CATEGORIES,
  /**
   * ĐẦY ĐỦ metadata — nặng, kéo theo diễn giải và hàm tính của mọi công thức.
   * Chỉ dùng ở màn chi tiết và sitemap. Màn duyệt/tìm dùng `FORMULA_SUMMARIES`.
   */
  FORMULAS,
  /** Chỉ mục nhẹ cho màn duyệt và tìm — xem `formulas/summaries.generated.ts`. */
  FORMULA_SUMMARIES,
  categoriesOf,
  countByCategory,
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  createRegistry,
  defaultInputs,
  expectedCountOf,
  featuredFormulas,
  findCategory,
  formulasForLevel,
  highlightParts,
  normalizeVi,
  // `scoreFormula` + `tokenize`: hai mảnh rời của phép tìm, cho nơi cần LỌC một danh sách đã có
  // thứ tự riêng thay vì sắp lại theo độ liên quan (xem `FormulaForTickerSheet`).
  scoreFormula,
  searchFormulas,
  selectFormulas,
  tokenize,
  variablesForLevel,
} from '@/core/registry';

// ── MarketConfig — thuế & phí (CON-10) ──────────────────────────────────────
export type {
  FeeSchedule,
  MarketConfig,
  MarketConstantKey,
  TypedMarketConstant,
} from '@/core/market';

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
export { LOCALES, isLocale, missingKeys, pick, t } from './i18n';

export type { NavItem, NavKey, RouteKey } from './routes';
export {
  NAV_ITEMS,
  ROUTES,
  activeRouteKey,
  formulaListPath,
  formulaPath,
  showsModeToggle,
} from './routes';

export type { Preferences, Theme } from './preferences';
export { DEFAULT_PREFERENCES, PREFERENCES_STORAGE_KEY } from './preferences';

// Chip “Tìm gần đây” của WF-09 (gói 3.1.3)
export {
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_KEY,
  addRecentSearch,
  parseRecentSearches,
  removeRecentSearch,
  serializeRecentSearches,
} from './recent-searches';

// Bản nháp ô nhập — giữ số người dùng đã gõ qua cú điều hướng rời màn chi tiết
export type { InputDraft } from './input-draft-store';
export {
  INPUT_DRAFT_KEY,
  INPUT_DRAFT_TTL_MS,
  MAX_DRAFTS,
  draftFor,
  parseInputDrafts,
  putDraft,
  removeDraft,
  serializeInputDrafts,
} from './input-draft-store';

// Lịch sử mở công thức — cá nhân hoá khối "Công thức dùng hằng ngày" của trang chủ (FR-20)
// và hai cách sắp xếp "Vừa xem gần đây" / "Hay dùng nhất" ở màn danh sách (`usageOrderMap`).
export type { FormulaUsage, RankFeaturedInput } from './formula-usage';
export {
  FORMULA_USAGE_KEY,
  MAX_USAGE_COUNT,
  MAX_USAGE_ENTRIES,
  PERSONAL_SLOTS,
  USAGE_HALF_LIFE_MS,
  USAGE_MIN_SCORE,
  parseFormulaUsage,
  rankFeaturedIds,
  recordFormulaUsage,
  sameOrder,
  serializeFormulaUsage,
  usageOrderMap,
  usageScore,
} from './formula-usage';

export {
  MAX_HOLDINGS,
  PORTFOLIO_KEY,
  addHolding,
  parseHoldings,
  removeHolding,
  serializeHoldings,
  updateHolding,
} from './portfolio-store';

export type { SavedCalc } from './saved-calc-store';
export {
  MAX_SAVED_CALCS,
  SAVED_CALCS_KEY,
  addSavedCalc,
  parseSavedCalcs,
  removeSavedCalc,
  renameSavedCalc,
  savedCalcId,
  serializeSavedCalcs,
} from './saved-calc-store';

export type { Origin } from './origin-screen';
export {
  ORIGIN_KEY,
  ORIGIN_RESTORE_KEY,
  backTarget,
  matchOrigin,
  originToStore,
  parseOrigin,
} from './origin-screen';

export type { ActiveTicker } from './active-ticker';
export {
  ACTIVE_TICKER_KEY,
  isTickerCode,
  parseActiveTicker,
  serializeActiveTicker,
} from './active-ticker';

export type { StoredSeries } from './price-series-store';
export {
  MAX_SERIES_ROWS,
  PRICE_SERIES_KEY,
  appendRow,
  parseStoredSeries,
  removeRow,
  serializeStoredSeries,
  updateRow,
} from './price-series-store';

export type { ListParams, ListSort, SegmentFilter } from './url-state';
export {
  DEFAULT_LIST_PARAMS,
  isDefaultListParams,
  listParamsToQuery,
  parseListParams,
  serializeListParams,
} from './url-state';
