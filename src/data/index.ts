/**
 * Tầng DATA — cửa gom (gói WBS 2.5.1).
 *
 * Giao diện KHÔNG import thẳng vào đây (CON-03), phải đi qua `@/application`.
 */

export type { DailyBar, DataProvider, Fundamentals, Preset } from './types';
export { SAMPLE_DATA, createStaticProvider, hasDraftData } from './provider';
export { SAMPLE_PRESETS } from './samples';
