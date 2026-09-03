/**
 * Tầng DATA — cửa gom (gói WBS 2.5.1).
 *
 * Giao diện KHÔNG import thẳng vào đây (CON-03), phải đi qua `@/application`.
 */

export type { DailyBar, DataProvider, Fundamentals, Preset } from './types';
export { PRESET_CONTRACT_VERSION } from './types';
export { SAMPLE_DATA, createStaticProvider, hasDraftData, hasDraftMarketSeries } from './provider';
export { SAMPLE_PRESETS } from './samples';
export { presetFillableKeys, presetInputs } from './preset-inputs';

// Cổng số liệu thị trường lúc chạy — gói "Danh mục dùng số liệu thật".
export type { FeedFailureKind, MarketFeed, TickerRef, TickerSnapshot } from './finbox';
export { MARKET_FEED, MarketFeedError, createStubFeed, isAbortError } from './finbox';

export type { LivePresetFormula } from './live-preset';
export { LIVE_PRESET_FORMULAS, presetFromSnapshot } from './live-preset';
