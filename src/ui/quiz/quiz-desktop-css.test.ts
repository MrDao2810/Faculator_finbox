import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Phần chấm điểm của Bài tập từ 1024px (21/10/2026). Chủ dự án chụp dòng "Sai · Kết quả: … · Thứ tự
 * đúng: …" và hộp "Vì sao chưa đúng" của `rut-truoc-han` trên máy tính: _"đang dư thừa quá nhiều
 * padding"_. Đo ở 1024–1440: dòng kết luận cách khung công thức và hộp mỗi bên 28px (lề `<p>` 16px +
 * khe cột 12px), hộp đệm 12 / 16px. Sau: 12px và 8 / 12px — cùng số khối điện thoại đã dùng từ 19/10.
 * Test React không chạy CSS Module, nên ca dưới đọc thẳng file.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./QuizBody.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân mọi khối `@media (min-width: 1024px)`, gộp lại — đếm ngoặc. */
function khoiMayTinh(css: string): string {
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
    if ((khop[1] ?? '').trim() === '(min-width: 1024px)') gop += css.slice(batDau, i - 1);
    quet.lastIndex = i;
    khop = quet.exec(css);
  }
  return gop;
}

const PC = khoiMayTinh(CSS);

describe('phần chấm điểm của Bài tập từ 1024px', () => {
  it('dòng kết luận không lề — khoảng trên dưới chỉ còn khe 12px của cột', () => {
    const than = /p\.markRight,\s*p\.markWrong\s*\{([^}]*)\}/.exec(PC)?.[1] ?? '';
    expect(than).toMatch(/margin:\s*0;/);
    // Chỉ đệm: cỡ chữ máy tính không đổi.
    expect(than).not.toMatch(/font-size/);
  });

  it('hộp "Vì sao chưa đúng" đệm 8 / 12px', () => {
    const hop = /(?:^|[{}])\s*\.explain\s*\{([^}]*)\}/m.exec(PC)?.[1] ?? '';
    expect(hop).toMatch(/padding:\s*var\(--space-2\) var\(--space-3\);/);
  });

  /* Cùng ngày, chủ dự án khoanh thẻ nghỉ trên máy tính: _"giảm padding của phần này xuống"_. */
  it('thẻ Bài tập đệm 12 / 16px, không còn 20px bốn phía', () => {
    const the = /(?:^|[{}])\s*\.block\s*\{([^}]*)\}/m.exec(PC)?.[1] ?? '';
    expect(the).toMatch(/padding:\s*var\(--space-3\) var\(--space-4\);/);
  });

  /*
   * 26/10/2026, chủ dự án khoanh bảng số liệu của câu điền số trên máy tính: nhãn ở mép trái, số ở
   * mép phải — _"số liệu và text giải thích bên trái cần gần nhau"_.
   */
  it('bảng số liệu của đề: hai cột co theo chữ, giá trị đứng ngay sau nhãn', () => {
    const bang = /(?:^|[{}])\s*\.facts\s*\{([^}]*)\}/m.exec(PC)?.[1] ?? '';
    expect(bang).toMatch(/display:\s*grid;/);
    expect(bang).toMatch(/grid-template-columns:\s*auto auto;/);
    expect(bang).toMatch(/width:\s*fit-content;/);
    expect(bang).toMatch(/max-width:\s*100%;/);
    const hang = /(?:^|[{}])\s*\.fact\s*\{([^}]*)\}/m.exec(PC)?.[1] ?? '';
    expect(hang).toMatch(/grid-template-columns:\s*subgrid;/);
    expect(hang).not.toMatch(/space-between/);
  });

  /* Cùng độ đặc hiệu với luật gốc `.explain` / `.block` — khối máy tính phải đứng sau chúng. */
  it('khối máy tính đứng sau luật gốc của hộp và của thẻ', () => {
    const khoi = CSS.lastIndexOf('@media (min-width: 1024px)');
    expect(CSS.indexOf('.explain {')).toBeLessThan(khoi);
    expect(CSS.indexOf('.block {')).toBeLessThan(khoi);
  });

  it('khối máy tính của bảng số liệu đứng sau luật gốc `.facts` / `.fact`', () => {
    const khoi = CSS.indexOf('.facts {', CSS.indexOf('.facts {') + 1);
    expect(CSS.indexOf('.facts {')).toBeLessThan(khoi);
    expect(CSS.indexOf('.fact {')).toBeLessThan(khoi);
  });
});
