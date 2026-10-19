import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thẻ bước của khối "Số liệu lấy từ công thức khác" ở khổ điện thoại (19/10/2026).
 *
 * Chủ dự án khoanh dòng "kết quả của FCFF …, dùng cho FCFE …" trên `fcfe`: nó thụt vào sau dấu ▸ và
 * chừa một dải trống bên trái — _"cho sang bên trái thay vì dóng xuống dòng như ảnh làm thừa 1 khoảng
 * bên trái"_. Dưới 1024px dòng tóm tắt thành lưới hai hàng và dòng vai trò trải cả ba cột. Test React
 * không chạy CSS Module, nên ca dưới đọc thẳng file.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./ChainBody.module.css', import.meta.url)),
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

const DIEN_THOAI = khoiDienThoai(CSS);

function luat(boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(DIEN_THOAI)?.[1] ?? '';
}

describe('ChainBody dưới 1024px — dòng vai trò chạy từ mép trái thẻ', () => {
  it('dòng tóm tắt là lưới hai hàng, dòng vai trò trải cả ba cột', () => {
    const tomTat = luat('.summary');
    expect(tomTat).toMatch(/display:\s*grid;/);
    expect(tomTat).toMatch(/'dau ten so'\s*'vai vai vai'/);
    expect(luat('.stepText')).toMatch(/display:\s*contents;/);
    expect(luat('.stepRole')).toMatch(/grid-area:\s*vai;/);
    expect(luat('.summary::before')).toMatch(/grid-area:\s*dau;/);
    expect(luat('.stepName')).toMatch(/grid-area:\s*ten;/);
    expect(luat('.stepValue')).toMatch(/grid-area:\s*so;/);
  });

  /* Khối điện thoại phải đứng SAU luật gốc `.summary`: cùng độ ưu tiên, chỉ thứ tự quyết định. */
  it('khối điện thoại đứng sau luật gốc của dòng tóm tắt', () => {
    expect(CSS.indexOf('.summary {')).toBeLessThan(CSS.indexOf('@media (max-width: 1023.98px)'));
  });
});
