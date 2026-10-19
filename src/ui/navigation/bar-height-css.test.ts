import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Chiều cao hai thanh khung ở khổ điện thoại (19/10/2026, chủ dự án: "padding và height của các phần
 * này đang quá cao, cần giảm xuống").
 *
 * Điều dễ vỡ không nằm ở con số mà ở cặp đôi: thanh trên thấp xuống 48px thì `.inner` phải bỏ đệm
 * dọc, vì nút quay lại của màn chi tiết (`BackLink`) giữ vùng chạm 44px. Còn 4px đệm là thanh màn ấy
 * cao 52px, các màn khác 48px, và thanh nhảy mỗi lần đổi màn. jsdom không chạy CSS nên ca này đọc
 * thẳng hai file.
 */

function docCss(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Thân gộp của các khối `@media` có điều kiện chứa `dieuKien` — đếm ngoặc. */
function khoiMedia(css: string, dieuKien: string): string {
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
    if ((khop[1] ?? '').includes(dieuKien)) gop += css.slice(batDau, i - 1);
    quet.lastIndex = i;
    khop = quet.exec(css);
  }
  return gop;
}

const DUOI_1024 = 'max-width: 1023.98px';
const TOKEN = khoiMedia(docCss('../../app/globals.css'), DUOI_1024);
const THANH_TREN = khoiMedia(docCss('./AppHeader.module.css'), DUOI_1024);

const px = (than: string, ten: string) =>
  Number(new RegExp(`${ten}:\\s*(\\d+)px;`).exec(than)?.[1] ?? Number.NaN);

describe('hai thanh khung ở khổ điện thoại', () => {
  it('thanh trên 48px, thanh dưới 52px', () => {
    expect(px(TOKEN, '--header-height')).toBe(48);
    expect(px(TOKEN, '--tabbar-height')).toBe(52);
  });

  it('thanh trên không đệm dọc và vẫn cao ít nhất 44px, để nút quay lại không kéo thanh cao lên', () => {
    expect(THANH_TREN).toMatch(/\.inner\s*\{[^}]*padding-block:\s*0;/);
    expect(px(TOKEN, '--header-height')).toBeGreaterThanOrEqual(44);
  });
});
