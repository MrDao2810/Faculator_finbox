import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Nút "Chú thích" của thẻ Công thức ở khổ điện thoại (20/10/2026).
 *
 * Chủ dự án khoanh dải trống dưới nút trên `pe`: _"giảm padding bottom của chú thích xuống, đang thừa
 * quá nhiều"_. Nút `sm` cao 36px mà chữ chỉ 11px, cộng 16px đệm đáy thẻ, nên dưới chữ trống ~27px. Nay
 * nút cao 24px và lề âm 8px ăn bớt đệm đáy. Test React không chạy CSS Module, nên ca dưới đọc thẳng file.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./FormulaNotationCard.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân mọi khối `@media (max-width: 1023.98px)`, gộp lại — đếm ngoặc. */
function khoiDienThoai(css: string): string {
  const quet = /@media([^{]*)\{/g;
  let gop = '';
  let khop = quet.exec(css);
  while (khop !== null) {
    const batDau = khop.index + khop[0].length;
    let sau = 1;
    let i = batDau;
    while (i < css.length && sau > 0) {
      if (css[i] === '{') sau += 1;
      else if (css[i] === '}') sau -= 1;
      i += 1;
    }
    if ((khop[1] ?? '').includes('max-width: 1023.98px')) gop += css.slice(batDau, i - 1);
    quet.lastIndex = i;
    khop = quet.exec(css);
  }
  return gop;
}

describe('thẻ Công thức dưới 1024px — nút "Chú thích" không để thừa đáy', () => {
  it('nút cao 24px và lề âm 8px ăn bớt đệm đáy thẻ', () => {
    const nut = /\.legend > \.legendToggle\s*\{([^}]*)\}/.exec(khoiDienThoai(CSS))?.[1] ?? '';
    expect(nut).toMatch(/min-height:\s*24px;/);
    expect(nut).toMatch(/margin-bottom:\s*calc\(var\(--space-2\) \* -1\);/);
  });

  /* Luật gốc `.legend > .legendToggle` cùng bậc ưu tiên — bản điện thoại phải khai sau nó. */
  it('khối điện thoại đứng sau luật gốc của nút', () => {
    const goc = CSS.indexOf('.legend > .legendToggle {');
    const dienThoai = CSS.indexOf('@media (max-width: 1023.98px)');
    expect(goc).toBeGreaterThan(-1);
    expect(goc).toBeLessThan(dienThoai);
  });
});
