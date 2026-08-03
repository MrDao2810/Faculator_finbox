/**
 * Tầng DOMAIN — bộ sinh Registry (gói WBS 1.3.1).
 *
 * CON-04: Registry là nguồn dữ liệu duy nhất và KHÔNG sửa tay dạng JSON.
 * Ở đây nguồn gốc là các module TypeScript — nhờ vậy sai schema bị bắt ngay lúc
 * typecheck, còn sai nội dung thì validator bắt lúc chạy test.
 * `serializeRegistry()` sinh ra bản JSON khi cần một artifact tĩnh để trao đổi.
 */

import { CATEGORIES } from './categories';
import type { Category, FormulaSpec, Registry, RegistryIssue } from './types';
import { errorsOnly, formatIssues, validateRegistry } from './validate';

/**
 * Dựng Registry và soát luôn trong lúc dựng.
 * Không ném lỗi — phát hiện nằm ở `registry.issues` để nơi gọi tự quyết xử lý.
 */
export function createRegistry(
  formulas: ReadonlyArray<FormulaSpec>,
  categories: ReadonlyArray<Category> = CATEGORIES,
): Registry {
  const issues = validateRegistry(categories, formulas);

  const byId = new Map<string, FormulaSpec>();
  for (const formula of formulas) {
    if (!byId.has(formula.id)) byId.set(formula.id, formula);
  }

  const byCategory = new Map<string, FormulaSpec[]>();
  for (const category of categories) byCategory.set(category.id, []);
  for (const formula of formulas) {
    const bucket = byCategory.get(formula.categoryId);
    if (bucket) bucket.push(formula);
  }

  return { categories, formulas, byId, byCategory, issues };
}

/**
 * Chặn cứng khi Registry có lỗi. Dùng ở test và ở bước sinh JSON, không dùng lúc render.
 * @throws Error kèm danh sách lỗi đã định dạng
 */
export function assertRegistryValid(registry: Registry): void {
  const errors = errorsOnly(registry.issues);
  if (errors.length > 0) {
    throw new Error(`Registry có ${errors.length} lỗi:\n${formatIssues(errors)}`);
  }
}

/**
 * Sinh bản JSON của Registry.
 * Chỉ xuất phần metadata — hàm tính nằm ở mã nguồn, không nằm trong JSON.
 */
export function serializeRegistry(registry: Registry, pretty = true): string {
  const payload = {
    version: 1,
    categories: registry.categories,
    formulas: registry.formulas,
  };
  return JSON.stringify(payload, null, pretty ? 2 : 0);
}

/** Bộ giá trị khởi tạo của một công thức, sinh thẳng từ VariableSpec (FR-05). */
export function defaultInputs(formula: FormulaSpec): Record<string, number> {
  const inputs: Record<string, number> = {};
  for (const variable of formula.variables) {
    inputs[variable.key] = variable.defaultValue;
  }
  return inputs;
}

/** Biến hiện ra ở một chế độ hiển thị. Chế độ Nâng cao thấy tất (FR-09). */
export function variablesForLevel(
  formula: FormulaSpec,
  level: 'basic' | 'advanced',
): ReadonlyArray<FormulaSpec['variables'][number]> {
  if (level === 'advanced') return formula.variables;
  return formula.variables.filter((v) => v.level === 'basic');
}

/** Công thức đưa lên khối nổi bật của trang chủ (FR-20). */
export function featuredFormulas(registry: Registry): ReadonlyArray<FormulaSpec> {
  return registry.formulas.filter((f) => f.isFeatured === true);
}

/** Đếm công thức theo nhóm — số hiện trên dropdown lọc của WF-02. */
export function countByCategory(registry: Registry): ReadonlyMap<string, number> {
  const counts = new Map<string, number>();
  for (const [categoryId, list] of registry.byCategory) {
    counts.set(categoryId, list.length);
  }
  return counts;
}

/** Danh sách phát hiện đang chặn phát hành. */
export function registryErrors(registry: Registry): ReadonlyArray<RegistryIssue> {
  return errorsOnly(registry.issues);
}
