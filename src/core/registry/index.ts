/**
 * Tầng DOMAIN — cửa gom của Formula Registry (gói WBS 1.3.1).
 *
 * Danh sách công thức thật nằm ở nhánh 5 của WBS: mỗi nhóm một module khai báo
 * FormulaSpec[], gom lại rồi truyền vào `createRegistry()`. Hiện chưa có công thức nào
 * nên `FORMULAS` còn rỗng — validator sẽ nhắc “nhóm chưa có công thức nào”, đúng như mong đợi.
 */

export type {
  Category,
  ChartType,
  Explanation,
  FormulaDependency,
  FormulaExample,
  FormulaSource,
  FormulaSpec,
  FormulaTestCase,
  IssueSeverity,
  Registry,
  RegistryIssue,
  Segment,
} from './types';

export { CATEGORIES, categoriesOf, expectedCountOf, findCategory } from './categories';

export {
  assertRegistryValid,
  countByCategory,
  createRegistry,
  defaultInputs,
  featuredFormulas,
  registryErrors,
  serializeRegistry,
  variablesForLevel,
} from './build';

export {
  errorsOnly,
  formatIssues,
  validateFormula,
  validateRegistry,
  validateVariable,
} from './validate';

import type { FormulaSpec } from './types';

/** Toàn bộ công thức của sản phẩm. Nhánh 5 sẽ đổ dần 107 công thức vào đây. */
export const FORMULAS: ReadonlyArray<FormulaSpec> = [];
