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

/*
 * Khung "cách tính" từ 1024px rộng theo hình của nó, không cuộn ngang (21/10/2026). Chủ dự án mở khung
 * `ΔNWC` của `fcff` trên máy tính và thấy thanh cuộn dưới hình. Quét 112 khung ở 1024 và 1440: chỉ khung
 * ấy rộng ra (352 → 392px), 111 khung còn lại giữ 352px; ở 390 không đổi gì.
 */
describe('khung "cách tính" từ 1024px — hình hiện đủ, không thanh cuộn', () => {
  const pc = /@media \(min-width: 1024px\)\s*\{([\s\S]*?)\n\}/g;
  const khoiPc = [...CSS.matchAll(pc)].map((m) => m[1] ?? '').join('\n');

  it('khung co giãn theo nội dung, sàn 22rem, trần là bề ngang màn', () => {
    const khung = /\.panel:not\(\[data-title-only\]\)\s*\{([^}]*)\}/.exec(khoiPc)?.[1] ?? '';
    expect(khung).toMatch(/(^|\s)width:\s*max-content;/);
    expect(khung).toMatch(/min-width:\s*min\(22rem, calc\(100vw - 16px\)\);/);
    expect(khung).toMatch(/max-width:\s*calc\(100vw - 16px\);/);
  });

  it('chữ không kéo khung rộng ra: tiêu đề, dòng chữ của bước và link mang `contain: inline-size`', () => {
    for (const lop of ['.panelTitle', '.stepText', '.panelLink']) {
      expect(khoiPc).toContain(`.panel:not([data-title-only]) ${lop}`);
    }
    expect(khoiPc).toMatch(/contain:\s*inline-size;/);
    // Khối cùng dòng mà bị chặn bề ngang nội tại thì co về 0 — link phải là khối.
    expect(khoiPc).toMatch(
      /\.panel:not\(\[data-title-only\]\) \.panelLink\s*\{\s*display:\s*block;/,
    );
  });

  it('bề ngang gốc 22rem vẫn nằm ngoài khối PC — điện thoại không đổi', () => {
    const goc = /\n\.panel\s*\{([^}]*)\}/.exec(CSS)?.[1] ?? '';
    expect(goc).toMatch(/width:\s*min\(22rem, calc\(100vw - 16px\)\);/);
    expect(khoiDienThoai(CSS)).not.toContain('max-content');
  });
});
