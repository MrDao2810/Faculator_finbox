import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import type { FormulaSummary } from '../registry/types';
import { ALL_FORMULAS } from './index';
import { FORMULA_SUMMARIES } from './summaries.generated';

/**
 * Chỉ mục nhẹ được SINH RA từ `ALL_FORMULAS`, không viết tay.
 *
 * Vì sao phải sinh chứ không tự lấy `ALL_FORMULAS.map(...)` lúc chạy: `map` giữ nguyên cạnh
 * import từ màn danh sách tới toàn bộ Registry, mà cạnh đó chính là thứ cần cắt — trước đợt
 * này, chunk 93 kB chứa diễn giải của cả 21 công thức bị **cả 29 trang** tải, kể cả 404.
 *
 * Sinh lại: `npm run gen:summaries`.
 */

const TARGET = fileURLToPath(new URL('./summaries.generated.ts', import.meta.url));

/** Đúng những trường `FormulaSummary` khai, theo thứ tự cố định để bản sinh ra ổn định. */
function summaryOf(spec: (typeof ALL_FORMULAS)[number]): FormulaSummary {
  return {
    id: spec.id,
    categoryId: spec.categoryId,
    name: { vi: spec.name.vi, en: spec.name.en },
    description: spec.description,
    level: spec.level,
    ...(spec.isFeatured === true ? { isFeatured: true } : {}),
    tags: [...spec.tags],
  };
}

const expected = ALL_FORMULAS.map(summaryOf);

/** Chuỗi TS đã theo đúng cấu hình prettier của dự án (nháy đơn, dấu phẩy cuối). */
function render(summaries: ReadonlyArray<FormulaSummary>): string {
  const quote = (text: string) => `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;

  const entries = summaries.map((s) => {
    const lines = [
      `    id: ${quote(s.id)},`,
      `    categoryId: ${quote(s.categoryId)},`,
      `    name: { vi: ${quote(s.name.vi)}, en: ${quote(s.name.en)} },`,
      `    description: ${quote(s.description)},`,
      `    level: ${quote(s.level)},`,
      ...(s.isFeatured === true ? ['    isFeatured: true,'] : []),
      `    tags: [${s.tags.map(quote).join(', ')}],`,
    ];
    return `  {\n${lines.join('\n')}\n  },`;
  });

  return `/**
 * SINH TỰ ĐỘNG TỪ \`ALL_FORMULAS\` — ĐỪNG SỬA TAY.
 * Sinh lại bằng: npm run gen:summaries
 *
 * Đây là chỉ mục nhẹ cho màn duyệt và tìm: chỉ tên, mô tả, thẻ và cấp độ. Cố tình KHÔNG
 * import gì từ các module công thức, để trang danh sách không phải tải diễn giải, ví dụ,
 * ca kiểm thử và hàm tính của toàn bộ Registry (NFR-PER-04).
 *
 * \`summaries.test.ts\` đối chiếu file này với Registry thật sau mỗi lần chạy test, nên nó
 * không thể lệch mà không ai biết.
 */

import type { FormulaSummary } from '../registry/types';

export const FORMULA_SUMMARIES: ReadonlyArray<FormulaSummary> = [
${entries.join('\n')}
];
`;
}

// Cờ môi trường do `scripts/gen-summaries.mjs` đặt. Không có cờ thì test chỉ ĐỐI CHIẾU —
// `npm test` không bao giờ được tự sửa file trong repo.
if (process.env['UPDATE_SUMMARIES'] === '1') {
  writeFileSync(TARGET, render(expected), 'utf8');
}

describe('chỉ mục nhẹ của Registry', () => {
  it('khớp từng công thức với Registry thật — không lệch, không thiếu, không thừa', () => {
    expect(FORMULA_SUMMARIES).toEqual(expected);
  });

  it('file sinh ra khớp đúng bản render hiện tại — chạy `npm run gen:summaries` nếu đỏ', () => {
    expect(readFileSync(TARGET, 'utf8').replaceAll('\r\n', '\n')).toBe(render(expected));
  });

  it('KHÔNG import gì từ module công thức — cạnh import đó là thứ cần cắt', () => {
    const source = readFileSync(TARGET, 'utf8');
    const imports = [...source.matchAll(/^import .*?from '([^']+)';$/gm)].map((m) => m[1]);

    // Chỉ được nhập kiểu, mà kiểu thì bị xoá lúc biên dịch nên không vào gói.
    expect(imports).toEqual(['../registry/types']);
    expect(source).toContain('import type { FormulaSummary }');
  });

  it('không mang theo phần nặng của FormulaSpec', () => {
    const source = readFileSync(TARGET, 'utf8');
    for (const heavy of ['explanation', 'example', 'tests:', 'source:', 'variables', 'latex']) {
      expect(source, `chỉ mục nhẹ không được chứa "${heavy}"`).not.toContain(heavy);
    }
  });

  it('mọi id trong chỉ mục đều tra được ở Registry đầy đủ', () => {
    const ids = new Set(ALL_FORMULAS.map((f) => f.id));
    for (const summary of FORMULA_SUMMARIES) {
      expect(ids.has(summary.id), summary.id).toBe(true);
    }
    expect(FORMULA_SUMMARIES).toHaveLength(ALL_FORMULAS.length);
  });
});
