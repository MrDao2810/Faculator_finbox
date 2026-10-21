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

  /*
   * ĐẢO 21/10/2026. Ca này trước đây là "ô nhỏ của khối gộp (từ 1280px) bỏ lề ấy": ô nhỏ xếp dọc
   * (nhãn, con số trải hết hàng, rãnh). Chủ dự án khoanh ô "Số kỳ nhận tiền (n)" của `irr-nien-kim`
   * và vẽ mũi tên sang phải: _"chuyển số liệu + kỳ sang bên phải như tôi chỉ rồi sau đó có thể giảm
   * height"_. Nay ô nhỏ giữ hàng `.head` gốc: không khai lại hướng, không đè lề tự động.
   */
  it('ô nhỏ của khối gộp (từ 1280px): con số ở cuối hàng nhãn, không xếp dọc', () => {
    const dau = luat(TRUOT.trong, '.compact .head');
    expect(dau).not.toMatch(/flex-direction/);
    expect(dau).toMatch(/align-items:\s*flex-start/);
    const o = luat(TRUOT.trong, '.compact .valueBox');
    expect(o).not.toMatch(/margin-left/);
    expect(o).not.toMatch(/align-self/);
    expect(o).toMatch(/padding:\s*0/);
  });

  it('ô nhỏ: nhãn hẹp quá 6rem thì con số xuống hàng; rãnh bám đáy ô', () => {
    expect(luat(TRUOT.trong, '.compact .label')).toMatch(/flex:\s*1 1 6rem/);
    const ranh = luat(TRUOT.trong, '.compact .slider');
    expect(ranh).toMatch(/min-height:\s*16px/);
    expect(ranh).toMatch(/margin-top:\s*auto/);
  });
});

describe('InlineNumber: chỗ giữ theo số ký tự thay cho 14ch', () => {
  it('ô gõ được ghim đúng bằng chỗ giữ, bản chỉ đọc lấy chỗ giữ làm sàn', () => {
    expect(luat(SO_GON.ngoai, '.giuCho .input')).toMatch(/width:\s*calc\(var\(--ky-tu\) \* 1ch\)/);
    const chiDoc = luat(SO_GON.ngoai, '.giuCho span.input');
    expect(chiDoc).toMatch(/width:\s*auto/);
    expect(chiDoc).toMatch(/min-width:\s*calc\(var\(--ky-tu\) \* 1ch\)/);
  });

  /*
   * ĐẢO 21/10/2026. Ca này trước đây ghim khối `.compact` từ 1280px khai SAU luật giữ chỗ (ô nhỏ
   * trải hết hàng phải thắng). Khối ấy bỏ cùng prop `compact` khi ô trượt nhỏ đưa con số lên cuối
   * hàng nhãn, nên luật giữ chỗ nay áp ở mọi khổ.
   */
  it('không còn khối ô nhỏ 1280px nào đè luật giữ chỗ', () => {
    expect(SO_GON.trong).toBe('');
    expect(SO_GON_THO).not.toMatch(/\.compact/);
    const truot = readFileSync(
      fileURLToPath(new URL('./SliderInput.tsx', import.meta.url)),
      'utf8',
    );
    const o = /<InlineNumber[\s\S]*?\/>/.exec(truot)?.[0] ?? '';
    expect(o).not.toMatch(/compact/);
  });
});
