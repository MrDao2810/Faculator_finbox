/**
 * Tầng DOMAIN — cửa gom của Formula Registry (gói WBS 1.3.1).
 *
 * Danh sách công thức thật nằm ở `src/core/formulas/`: mỗi nhóm một module khai `FormulaModule`
 * (spec đi liền hàm tính), gom lại ở `formulas/index.ts`. `FORMULAS` chỉ lấy phần metadata
 * của bộ đó, không khai riêng — nhờ vậy không thể có công thức hiện trên giao diện mà thiếu
 * hàm tính.
 */

export type {
  Category,
  ChartType,
  Explanation,
  FormulaDependency,
  FormulaExample,
  FormulaQuery,
  FormulaSource,
  FormulaSpec,
  FormulaSummary,
  FormulaTestCase,
  IssueSeverity,
  ListSort,
  Registry,
  RegistryIssue,
  Segment,
  SegmentFilter,
} from './types';

export {
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  formulasForLevel,
  normalizeVi,
  scoreFormula,
  searchFormulas,
  selectFormulas,
  tokenize,
} from './search';

export { highlightParts, highlightRanges } from './highlight';
export type { HighlightPart, HighlightRange } from './highlight';

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

import { ALL_FORMULAS } from '../formulas';
import type { FormulaSpec } from './types';

/**
 * Toàn bộ công thức của sản phẩm, ĐẦY ĐỦ metadata — đủ 107 / 107.
 * Thêm công thức là sửa `src/core/formulas/`, không sửa file này.
 *
 * Nặng: kéo theo cả diễn giải, ví dụ, ca kiểm thử và hàm tính của mọi công thức. Chỉ màn
 * chi tiết và sitemap mới cần tới. Màn duyệt, tìm và mọi chỗ đếm số phải dùng
 * `FORMULA_SUMMARIES` — xem chú thích ở đó.
 */
export const FORMULAS: ReadonlyArray<FormulaSpec> = ALL_FORMULAS;

/*
 * Chỉ mục nhẹ. Xuất lại từ đây để nơi gọi chỉ cần biết một cửa `@/core/registry`, nhưng
 * đường import đi THẲNG tới file sinh tự động, không vòng qua `../formulas` — vòng qua là
 * mất sạch tác dụng.
 */
export { FORMULA_SUMMARIES } from '../formulas/summaries.generated';
