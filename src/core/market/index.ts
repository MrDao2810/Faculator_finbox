/** Tầng DOMAIN — cửa gom của MarketConfig (gói WBS 1.3.2). */

export type { FeeSchedule, MarketConfig, MarketConstantKey, TypedMarketConstant } from './types';

export { HOSE_2026, MARKET_CONFIG } from './schedules';

export {
  constantsAsOf,
  findSchedule,
  resolveConstant,
  resolveRate,
  resolveValue,
  scheduleOrDefault,
  validateMarketConfig,
} from './resolve';
