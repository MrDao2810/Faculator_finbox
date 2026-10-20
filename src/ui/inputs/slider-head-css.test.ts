import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Hàng "nhãn · con số" của thanh trượt (19/10/2026).
 *
 * Chủ dự án chụp "380 phiên" lơ lửng giữa hàng, dưới nhãn "Số phiên gần nhất đưa vào tính", ở
 * 360px: _"tôi đã yêu cầu từ trước là cần đồng bộ những phần có thiết kế tương tự rồi mà"_ — tức
 * luật của thẻ Kết quả: nhãn trái, con số phải, nhãn dài thì số xuống hàng nhưng vẫn dính mép
 * phải. Hai nửa của phép sửa nằm ở CSS, mà test React không chạy CSS Module, nên ca dưới đọc thẳng
 * hai file. Nửa thứ ba (chỗ giữ theo miền thay cho 14ch) do `SliderInput.test.tsx` gác.
 */

function docCss(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Tách CSS thành phần ngoài mọi `@media` và thân các khối `@media` có điều kiện chứa `dieuKien`. */
function tachMedia(css: string, dieuKien: string): { ngoai: string; trong: string } {
  const quet = /@media([^{]*)\{/g;
  let ngoai = '';
  let trong = '';
  let tu = 0;
  let khop = quet.exec(css);
  while (khop !== null) {
    ngoai += css.slice(tu, khop.index);
    const batDau = khop.index + khop[0].length;
    let sau = 1;
    let i = batDau;
    while (i < css.length && sau > 0) {
      if (css[i] === '{') sau += 1;
      else if (css[i] === '}') sau -= 1;
      i += 1;
    }
    if ((khop[1] ?? '').includes(dieuKien)) trong += css.slice(batDau, i - 1);
    tu = i;
    quet.lastIndex = i;
    khop = quet.exec(css);
  }
  return { ngoai: ngoai + css.slice(tu), trong };
}

/** Thân của luật có bộ chọn viết đúng `boChon`, hoặc `undefined`. */
function luat(css: string, boChon: string): string | undefined {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1];
}

const TU_1280 = 'min-width: 1280px';
const TRUOT = tachMedia(docCss('./SliderInput.module.css'), TU_1280);
const SO_GON_THO = docCss('./InlineNumber.module.css');
const SO_GON = tachMedia(SO_GON_THO, TU_1280);

describe('thanh trượt: con số cạnh nhãn luôn ở mép phải', () => {
  it('con số xuống hàng dưới nhãn thì vẫn dính mép phải (lề trái tự động)', () => {
    expect(luat(TRUOT.ngoai, '.valueBox')).toMatch(/margin-left:\s*auto/);
  });

  it('ô nhỏ của khối gộp (từ 1280px) bỏ lề ấy — lề tự động ở cột flex tắt mất `stretch`', () => {
    const o = luat(TRUOT.trong, '.compact .valueBox');
    expect(o).toMatch(/margin-left:\s*0/);
    expect(o).toMatch(/align-self:\s*stretch/);
  });
});

describe('InlineNumber: chỗ giữ theo số ký tự thay cho 14ch', () => {
  it('ô gõ được ghim đúng bằng chỗ giữ, bản chỉ đọc lấy chỗ giữ làm sàn', () => {
    expect(luat(SO_GON.ngoai, '.giuCho .input')).toMatch(/width:\s*calc\(var\(--ky-tu\) \* 1ch\)/);
    const chiDoc = luat(SO_GON.ngoai, '.giuCho span.input');
    expect(chiDoc).toMatch(/width:\s*auto/);
    expect(chiDoc).toMatch(/min-width:\s*calc\(var\(--ky-tu\) \* 1ch\)/);
  });

  it('luật giữ chỗ khai TRƯỚC khối ô nhỏ 1280px — cùng độ đặc hiệu, ô nhỏ trải hết hàng phải thắng', () => {
    const giuCho = SO_GON_THO.indexOf('.giuCho .input');
    const khoiNho = SO_GON_THO.indexOf('@media (min-width: 1280px)');
    expect(giuCho).toBeGreaterThan(0);
    expect(khoiNho).toBeGreaterThan(giuCho);
    expect(luat(SO_GON.trong, '.compact .input')).toMatch(/width:\s*auto/);
  });
});
