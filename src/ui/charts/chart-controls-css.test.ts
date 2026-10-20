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

/*
 * Khoảng trống quanh biểu đồ ở khổ điện thoại (19/10/2026, chủ dự án: _"giảm padding xung quanh … để
 * hiển thị nhiều không gian chart hơn"_). Lề TRONG SVG có ca riêng ở `charts.test.tsx`; ở đây là phần
 * CSS, thứ test React không chạy: khung vẽ tràn vào đệm thẻ, và hàng "Xem số liệu" thấp đi mà vùng chạm
 * vẫn đủ 44px (NFR-USA-01). Lớp phủ chạm mất đi thì hàng 28px là một đích bấm quá nhỏ, không ai thấy.
 */
describe('biểu đồ dưới 1024px: vùng vẽ rộng hơn, đáy thẻ gọn hơn', () => {
  it('khung vẽ tràn vào đệm thẻ 8px mỗi bên, căn giữa', () => {
    const khung = luat(BIEU_DO, '.chart > .plot');
    expect(khung).toMatch(/width:\s*calc\(100% \+ 2 \* var\(--space-2\)\);/);
    expect(khung).toMatch(/align-self:\s*center;/);
    expect(luat(BIEU_DO, '.chart')).toMatch(/padding-bottom:\s*var\(--space-2\);/);
  });

  it('"Xem số liệu" thấp 28px mà lớp phủ vẫn giữ vùng chạm 44px', () => {
    const hang = luat(BIEU_DO, '.summary');
    expect(soPx(hang, /min-height:\s*(\d+)px;/)).toBe(28);
    expect(hang).toMatch(/position:\s*relative;/);

    const phu = luat(BIEU_DO, '.summary::after');
    expect(phu).toMatch(/height:\s*var\(--tap-min\);/);
    expect(phu).toMatch(/position:\s*absolute;/);
  });
});

/*
 * Tên biểu đồ ở khổ điện thoại (20/10/2026, chủ dự án: _"giảm size text phần trong ảnh xuống áp dụng bản
 * mobile. cần làm cho toàn bộ các công thức khác"_). 16 → 15px, không xuống 14px: tên của một khối
 * không được nhỏ bằng nội dung dưới nó, mà ô chọn trục ngay dưới in chữ 14px ở khổ này.
 */
describe('tên biểu đồ dưới 1024px', () => {
  it('15px — nhỏ đi mà vẫn lớn hơn chữ trong ô chọn trục ngay dưới', () => {
    const ten = luat(BIEU_DO, '.captionTitle');
    expect(ten).toMatch(/font-size:\s*0\.9375rem;/);
    expect(luat(BIEU_DO, '.picker select')).toMatch(/font-size:\s*var\(--text-sm\);/);
  });
});
