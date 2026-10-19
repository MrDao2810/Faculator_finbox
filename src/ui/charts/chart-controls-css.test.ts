import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Hàng điều khiển biểu đồ ở khổ điện thoại — ô chọn trục và nhóm Đường / Cột.
 *
 * 19/10/2026, chủ dự án khoanh hàng này trên điện thoại: _"giảm size text đi, ô select giảm height
 * xuống để tiết kiệm không gian"_. Hai điều khiển nằm ở HAI file CSS (`chart.module.css` và
 * `ChartKindToggle.module.css`), mà chủ dự án đã chốt từ trước rằng hai cột của hàng phải cao bằng
 * nhau. Đổi số ở một file mà quên file kia thì hai nhãn lệch nhau, và test React không chạy CSS
 * Module nên không ca nào thấy. Ca dưới đọc thẳng hai file.
 */

/** Đọc file CSS cạnh test này, bỏ chú thích — lời văn chú thích cũng nhắc tới chính các con số. */
function docCss(ten: string): string {
  return readFileSync(fileURLToPath(new URL(`./${ten}`, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Thân của các khối `@media` có điều kiện chứa `dieuKien` — đếm ngoặc, vì khối chứa nhiều luật. */
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

/** Thân của luật có bộ chọn `boChon` (viết đúng như trong file) bên trong một đoạn CSS. */
function luat(css: string, boChon: string): string | undefined {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\})\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1];
}

const DUOI_1024 = 'max-width: 1023.98px';
const BIEU_DO = khoiMedia(docCss('chart.module.css'), DUOI_1024);
const NUT_LOAI = khoiMedia(docCss('ChartKindToggle.module.css'), DUOI_1024);

/** Số px trong `thuocTinh: …Npx…` của một luật, hoặc `undefined`. */
function soPx(than: string | undefined, mau: RegExp): number | undefined {
  const khop = than === undefined ? null : mau.exec(than);
  return khop?.[1] === undefined ? undefined : Number(khop[1]);
}

describe('hàng điều khiển biểu đồ dưới 1024px', () => {
  it('nhãn và chữ trong ô chọn nhỏ đi một bậc', () => {
    expect(luat(BIEU_DO, '.picker label')).toMatch(/font-size:\s*var\(--text-xs\);/);
    expect(luat(BIEU_DO, '.picker select')).toMatch(/font-size:\s*var\(--text-sm\);/);
    expect(luat(NUT_LOAI, '.kindLabel')).toMatch(/font-size:\s*var\(--text-xs\);/);
  });

  it('ô chọn và nhóm Đường / Cột cao BẰNG NHAU, nút = hàng trừ đệm 4px và viền 2px', () => {
    const oChon = soPx(luat(BIEU_DO, '.picker select'), /min-height:\s*(\d+)px;/);
    const hang = soPx(luat(NUT_LOAI, '.kind'), /minmax\((\d+)px,\s*auto\)/);
    const nut = soPx(luat(NUT_LOAI, '.kindOption'), /min-height:\s*(\d+)px;/);

    expect(oChon, 'thiếu min-height của .picker select dưới 1024px').toBe(36);
    expect(hang, 'hàng thứ hai của .kind phải cao bằng ô chọn').toBe(oChon);
    expect(nut, 'nút = hàng − 2px đệm × 2 − 1px viền × 2').toBe((hang ?? 0) - 6);
  });
});
