import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Khung chứa hình công thức phải chừa chỗ cho nét chữ trên và dưới (16/11/2026).
 *
 * Chủ dự án chụp chữ D ở tử số của `DY = D / P × 100` bị cụt đầu: _"sửa lại lỗi này ở toàn bộ công
 * thức, không được có lỗi này"_. Chrome dàn MathML bằng hộp SÁT NÉT chữ, và cả bốn khung dưới đây cắt
 * tràn (`overflow-y: hidden`, đi kèm `overflow-x: auto` để cuộn ngang). Đo trên Chrome cả 111 trang:
 * nét cao nhất chạm ĐÚNG mép trên khung, nét thấp nhất chạm đúng mép dưới — hở 0px ở 111/111 hình
 * chính và 99/111 hình của khối Ví dụ. Một pixel lệch do hinting của Windows là mất đỉnh chữ. Đệm dọc
 * nằm trong vùng không bị cắt; đo lại sau khi sửa: hở 3–4px ở mọi hình, 390 lẫn 1440.
 *
 * Test React không chạy CSS Module, nên ca dưới đọc thẳng file. Thêm một khung cắt tràn mới chứa hình
 * công thức thì thêm một dòng vào `KHUNG`.
 */

const KHUNG: ReadonlyArray<readonly [file: string, selector: string, noiHien: string]> = [
  ['./FormulaDetail.module.css', '.formula', 'hình chính của thẻ Công thức'],
  ['./FormulaDetail.module.css', '.substitutionHinh', 'dải thay số dưới kết quả'],
  ['./FormulaNotationCard.module.css', '.stepMath', 'hình từng bước trong khung "cách tính"'],
  ['./FormulaNotationCard.module.css', '.quizPictureMath', 'hình ở khối Ví dụ và Bài tập'],
];

function docCss(file: string): string {
  return readFileSync(fileURLToPath(new URL(file, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Thân mọi khối có selector đúng bằng `selector` (không tính selector ghép như `.formula:has(…)`). */
function cacKhoi(css: string, selector: string): string[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const quet = new RegExp(`(^|[\\s}])${escaped}\\s*\\{([^}]*)\\}`, 'g');
  return [...css.matchAll(quet)].map((m) => m[2] ?? '');
}

describe('khung chứa hình công thức chừa chỗ cho nét chữ', () => {
  it.each(KHUNG)('%s %s (%s): cắt tràn thì phải có đệm dọc', (file, selector) => {
    const khoi = cacKhoi(docCss(file), selector).filter((than) =>
      /overflow-y:\s*hidden/.test(than),
    );
    expect(khoi.length, `không thấy khối cắt tràn của ${selector}`).toBeGreaterThan(0);
    for (const than of khoi) {
      expect(than).toMatch(/padding-block:\s*0\.25em;/);
    }
  });
});
