/**
 * Tầng DOMAIN — cửa gom của bộ máy tính toán.
 *
 * Danh sách công thức nằm ở `src/core/formulas/`; ở đây chỉ có hợp đồng và cách chạy.
 */

export type { CalcContext, CalcFn, CalcInputs, CalcValues, FormulaModule } from './types';

export { missingInputLabels, runFormula } from './run';

export type { SpecTestFailure } from './run-tests';
export { DEFAULT_TOLERANCE, formatFailures, runAllSpecTests, runSpecTests } from './run-tests';
