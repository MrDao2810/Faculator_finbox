/**
 * Tầng DOMAIN — validator của Registry (gói WBS 1.3.1).
 *
 * Nguyên tắc: KHÔNG ném lỗi. Trả về danh sách phát hiện để bộ sinh, test và
 * người biên soạn nội dung đều đọc được cùng một kết quả.
 *
 * `error` là sai sót chặn phát hành. `warning` là chỗ còn thiếu nhưng chưa chặn —
 * ví dụ nhóm chưa có công thức nào, hay ví dụ mẫu bỏ sót một biến.
 */

import type { ControlType, VariableSpec } from '../types';
import type { Category, FormulaSpec, RegistryIssue } from './types';

/** Điều khiển bắt buộc phải khai báo danh sách lựa chọn (LDR-02). */
const NEEDS_OPTIONS: ReadonlyArray<ControlType> = ['select', 'radio', 'toggle', 'buttonGroup'];

/** id chỉ dùng chữ thường, số, dấu chấm và gạch ngang — vì id đi thẳng vào URL (FR-25). */
const ID_PATTERN = /^[a-z0-9]+([.-][a-z0-9]+)*$/;

function isBlank(text: string | undefined): boolean {
  return text === undefined || text.trim() === '';
}

function err(path: string, message: string): RegistryIssue {
  return { severity: 'error', path, message };
}

function warn(path: string, message: string): RegistryIssue {
  return { severity: 'warning', path, message };
}

/** Soát một biến. `path` là tiền tố đường dẫn, ví dụ 'pe.variables.eps'. */
export function validateVariable(spec: VariableSpec, path: string): RegistryIssue[] {
  const issues: RegistryIssue[] = [];

  if (isBlank(spec.key)) issues.push(err(path, 'Biến thiếu key.'));
  if (isBlank(spec.label)) issues.push(err(`${path}.label`, 'Biến thiếu nhãn tiếng Việt.'));

  if (!Number.isFinite(spec.defaultValue)) {
    issues.push(err(`${path}.defaultValue`, 'Giá trị mặc định phải là số hữu hạn.'));
  }

  const { min, max, step } = spec;

  if (min !== undefined && !Number.isFinite(min)) {
    issues.push(err(`${path}.min`, 'min phải là số hữu hạn.'));
  }
  if (max !== undefined && !Number.isFinite(max)) {
    issues.push(err(`${path}.max`, 'max phải là số hữu hạn.'));
  }
  if (min !== undefined && max !== undefined && min >= max) {
    issues.push(err(`${path}.min`, `min (${min}) phải nhỏ hơn max (${max}).`));
  }
  if (step !== undefined && (!Number.isFinite(step) || step <= 0)) {
    issues.push(err(`${path}.step`, 'step phải là số dương.'));
  }

  if (Number.isFinite(spec.defaultValue)) {
    if (min !== undefined && spec.defaultValue < min) {
      issues.push(
        err(`${path}.defaultValue`, `Giá trị mặc định ${spec.defaultValue} nhỏ hơn min.`),
      );
    }
    if (max !== undefined && spec.defaultValue > max) {
      issues.push(
        err(`${path}.defaultValue`, `Giá trị mặc định ${spec.defaultValue} lớn hơn max.`),
      );
    }
  }

  // Thanh trượt phải đủ ba mốc, vì WF-16 hiện nhãn min · step · max ngay dưới thanh.
  if (spec.type === 'slider' && (min === undefined || max === undefined || step === undefined)) {
    issues.push(err(`${path}.type`, 'Thanh trượt phải khai báo đủ min, max và step.'));
  }

  const options = spec.options ?? [];
  const needsOptions = NEEDS_OPTIONS.includes(spec.type);

  if (needsOptions) {
    if (options.length < 2) {
      issues.push(err(`${path}.options`, `Điều khiển ${spec.type} cần ít nhất 2 lựa chọn.`));
    }
    if (spec.type === 'toggle' && options.length > 2) {
      issues.push(err(`${path}.options`, 'Toggle chỉ được có đúng 2 lựa chọn.'));
    }
    for (const [i, option] of options.entries()) {
      if (isBlank(option.label)) {
        issues.push(err(`${path}.options[${i}].label`, 'Lựa chọn thiếu nhãn.'));
      }
      if (!Number.isFinite(option.value)) {
        issues.push(err(`${path}.options[${i}].value`, 'Giá trị lựa chọn phải là số hữu hạn.'));
      }
    }
    const values = options.map((o) => o.value);
    if (new Set(values).size !== values.length) {
      issues.push(err(`${path}.options`, 'Các lựa chọn bị trùng giá trị.'));
    }
    if (options.length > 0 && !values.includes(spec.defaultValue)) {
      issues.push(
        err(`${path}.defaultValue`, 'Giá trị mặc định không nằm trong danh sách lựa chọn.'),
      );
    }
  } else if (options.length > 0) {
    issues.push(warn(`${path}.options`, `Điều khiển ${spec.type} không dùng tới options.`));
  }

  return issues;
}

/**
 * Soát một công thức.
 *
 * @param categoryIds tập id nhóm hợp lệ; truyền vào để validator không phụ thuộc file categories
 */
export function validateFormula(
  formula: FormulaSpec,
  categoryIds: ReadonlySet<string>,
): RegistryIssue[] {
  const issues: RegistryIssue[] = [];
  const path = formula.id.trim() === '' ? '(công thức không có id)' : formula.id;

  if (isBlank(formula.id)) {
    issues.push(err(path, 'Công thức thiếu id.'));
  } else if (!ID_PATTERN.test(formula.id)) {
    issues.push(
      err(
        `${path}.id`,
        'id chỉ được dùng chữ thường, số, dấu chấm và gạch ngang vì id đi vào URL.',
      ),
    );
  }

  if (!categoryIds.has(formula.categoryId)) {
    issues.push(err(`${path}.categoryId`, `Nhóm '${formula.categoryId}' không có trong danh mục.`));
  }

  if (isBlank(formula.name.vi)) issues.push(err(`${path}.name.vi`, 'Thiếu tên tiếng Việt.'));
  if (isBlank(formula.name.en)) {
    issues.push(warn(`${path}.name.en`, 'Thiếu tên tiếng Anh — FR-21 cần khi bật VI/EN.'));
  }
  if (isBlank(formula.description)) issues.push(err(`${path}.description`, 'Thiếu mô tả ngắn.'));
  if (isBlank(formula.latex)) issues.push(err(`${path}.latex`, 'Thiếu chuỗi LaTeX (UI-03).'));
  if (isBlank(formula.resultUnit)) {
    issues.push(err(`${path}.resultUnit`, 'Thiếu đơn vị của kết quả.'));
  }

  // FR-03: bốn mục diễn giải là bắt buộc, không phải tuỳ chọn.
  const explanationFields: ReadonlyArray<[keyof FormulaSpec['explanation'], string]> = [
    ['meaning', 'công thức này nói lên điều gì'],
    ['whenToUse', 'khi nào dùng'],
    ['howToRead', 'cách đọc kết quả'],
    ['commonMistakes', 'sai lầm thường gặp'],
  ];
  for (const [field, label] of explanationFields) {
    if (isBlank(formula.explanation[field])) {
      issues.push(err(`${path}.explanation.${field}`, `Thiếu mục diễn giải: ${label} (FR-03).`));
    }
  }

  // FR-04: mọi công thức phải ghi nguồn tham khảo.
  if (formula.source.length === 0) {
    issues.push(err(`${path}.source`, 'Thiếu nguồn tham khảo (FR-04).'));
  }
  for (const [i, source] of formula.source.entries()) {
    if (isBlank(source.label)) {
      issues.push(
        err(`${path}.source[${i}].label`, 'Nguồn tham khảo không có nội dung trích dẫn.'),
      );
    }
  }

  if (formula.tags.length === 0) {
    issues.push(warn(`${path}.tags`, 'Chưa có từ khoá — tìm kiếm FR-19 sẽ khó ra công thức này.'));
  }

  // Biến
  if (formula.variables.length === 0) {
    issues.push(err(`${path}.variables`, 'Công thức không có biến đầu vào nào.'));
  }
  const seenKeys = new Set<string>();
  for (const variable of formula.variables) {
    const varPath = `${path}.variables.${variable.key}`;
    if (seenKeys.has(variable.key)) {
      issues.push(err(varPath, `Trùng key biến '${variable.key}'.`));
    }
    seenKeys.add(variable.key);
    issues.push(...validateVariable(variable, varPath));
  }

  // Ví dụ (FR-02)
  if (isBlank(formula.example.title)) {
    issues.push(err(`${path}.example.title`, 'Ví dụ thiếu tiêu đề.'));
  }
  issues.push(...checkInputs(formula.example.inputs, seenKeys, `${path}.example.inputs`));

  // Ca kiểm thử (NFR-MNT-02)
  if (formula.tests.length === 0) {
    issues.push(err(`${path}.tests`, 'Công thức mới bắt buộc kèm ít nhất một ca kiểm thử.'));
  }
  for (const [i, testCase] of formula.tests.entries()) {
    const testPath = `${path}.tests[${i}]`;
    if (isBlank(testCase.name)) issues.push(err(`${testPath}.name`, 'Ca kiểm thử thiếu tên.'));
    if (testCase.expected === null && testCase.expectedWarning === undefined) {
      issues.push(
        warn(`${testPath}.expectedWarning`, 'Ca không ra số nên ghi rõ mã cảnh báo mong đợi.'),
      );
    }
    if (testCase.expected !== null && !Number.isFinite(testCase.expected)) {
      issues.push(err(`${testPath}.expected`, 'Kết quả mong đợi phải là số hữu hạn hoặc null.'));
    }
    issues.push(...checkInputs(testCase.inputs, seenKeys, `${testPath}.inputs`));
  }

  return issues;
}

/** Soát toàn bộ Registry: trùng id, nhóm lạ, và các cạnh của đồ thị phụ thuộc. */
export function validateRegistry(
  categories: ReadonlyArray<Category>,
  formulas: ReadonlyArray<FormulaSpec>,
): RegistryIssue[] {
  const issues: RegistryIssue[] = [];

  const categoryIds = new Set<string>();
  for (const category of categories) {
    if (categoryIds.has(category.id)) {
      issues.push(err(`categories.${category.id}`, 'Trùng id nhóm.'));
    }
    categoryIds.add(category.id);
  }

  const formulaIds = new Set<string>();
  for (const formula of formulas) {
    if (formulaIds.has(formula.id)) {
      issues.push(err(formula.id, 'Trùng id công thức.'));
    }
    formulaIds.add(formula.id);
    issues.push(...validateFormula(formula, categoryIds));
  }

  // Cạnh của đồ thị phụ thuộc (FR-15). Phát hiện chu trình để ở gói 5.3.1.
  for (const formula of formulas) {
    for (const [i, dep] of (formula.dependsOn ?? []).entries()) {
      const depPath = `${formula.id}.dependsOn[${i}]`;
      if (dep.formulaId === formula.id) {
        issues.push(err(depPath, 'Công thức không thể phụ thuộc chính nó.'));
      } else if (!formulaIds.has(dep.formulaId)) {
        issues.push(err(depPath, `Không có công thức thượng nguồn '${dep.formulaId}'.`));
      }
      if (!formula.variables.some((v) => v.key === dep.variableKey)) {
        issues.push(err(depPath, `Công thức không có biến '${dep.variableKey}' để nhận giá trị.`));
      }
    }
  }

  // Đối chiếu tiến độ với bảng SRS mục 3.8 — chỉ nhắc, không chặn.
  for (const category of categories) {
    const count = formulas.filter((f) => f.categoryId === category.id).length;
    if (count === 0) {
      issues.push(
        warn(`categories.${category.id}`, `Nhóm '${category.name}' chưa có công thức nào.`),
      );
    } else if (count > category.expectedCount) {
      issues.push(
        warn(
          `categories.${category.id}`,
          `Nhóm '${category.name}' có ${count} công thức, nhiều hơn ${category.expectedCount} theo SRS 3.8.`,
        ),
      );
    }
  }

  return issues;
}

/** Chỉ giữ các phát hiện chặn phát hành. */
export function errorsOnly(issues: ReadonlyArray<RegistryIssue>): RegistryIssue[] {
  return issues.filter((i) => i.severity === 'error');
}

/** Gộp danh sách phát hiện thành một khối chữ đọc được trong log CI. */
export function formatIssues(issues: ReadonlyArray<RegistryIssue>): string {
  return issues
    .map((i) => `${i.severity === 'error' ? 'LỖI' : 'NHẮC'} · ${i.path} — ${i.message}`)
    .join('\n');
}

function checkInputs(
  inputs: Readonly<Record<string, number>>,
  variableKeys: ReadonlySet<string>,
  path: string,
): RegistryIssue[] {
  const issues: RegistryIssue[] = [];

  for (const [key, value] of Object.entries(inputs)) {
    if (!variableKeys.has(key)) {
      issues.push(err(`${path}.${key}`, `Không có biến '${key}' trong công thức.`));
    }
    if (!Number.isFinite(value)) {
      issues.push(err(`${path}.${key}`, 'Giá trị đầu vào phải là số hữu hạn.'));
    }
  }

  for (const key of variableKeys) {
    if (!(key in inputs)) {
      issues.push(warn(`${path}.${key}`, `Bỏ sót biến '${key}' — sẽ chạy bằng giá trị mặc định.`));
    }
  }

  return issues;
}
