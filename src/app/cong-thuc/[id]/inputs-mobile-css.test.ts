import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Khối Số liệu ở khổ điện thoại — khoảng trống và nút kéo của thanh trượt (19/10/2026).
 *
 * Chủ dự án khoanh năm dải trống trong khối Số liệu của `capm` và nút tròn của thanh trượt: _"những
 * phần như ảnh này đang có padding quá lớn, giảm xuống … slider tròn … bản mobile cần giảm xuống cho
 * gọn"_, rồi con số cạnh nhãn: _"giảm cả size text số này xuống bản mobile nữa"_. Mọi thứ là CSS viết
 * bằng bộ chọn cấu trúc trong `FormulaDetail.module.css`, có bản sao ở `ChainBody.module.css` cho khối
 * chuỗi. Test React không chạy CSS Module, nên ca dưới đọc thẳng hai file: đủ luật, hai bản sao khớp
 * nhau, và nút kéo vẫn nằm giữa rãnh.
 */

function docCss(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Gộp thân mọi khối `@media` có điều kiện chứa `dieuKien` — đếm ngoặc, vì khối chứa nhiều luật. */
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

/**
 * Thân của MỌI luật có bộ chọn viết đúng `boChon`, nối lại, hoặc `undefined` khi không có luật nào.
 * Nối chứ không lấy luật đầu: khối dưới 1024px có hai luật `.fields` (số cột, rồi lề âm của lượt này).
 */
function luat(css: string, boChon: string): string | undefined {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const than = [...css.matchAll(new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'gm'))].map(
    (khop) => khop[1] ?? '',
  );
  return than.length === 0 ? undefined : than.join('\n');
}

const DUOI_1024 = 'max-width: 1023.98px';
const SO_LIEU = khoiMedia(docCss('./FormulaDetail.module.css'), DUOI_1024);
const CHUOI = khoiMedia(docCss('../../../ui/screens/ChainBody.module.css'), DUOI_1024);
const TRUOT = docCss('../../../ui/inputs/SliderInput.module.css');

const DAU_TRUOT = ".fields div:has(+ input[type='range'])";
const O_SO = `${DAU_TRUOT} > span:last-child`;

/** Các luật của lượt này — phải có ở cả khối Số liệu lẫn khối chuỗi, cùng một nội dung. */
const LUAT_CHUNG: ReadonlyArray<readonly [boChon: string, khaiBao: RegExp]> = [
  ['.fields', /margin-bottom:\s*calc\(var\(--space-2\) \* -1\);/],
  ['.fields > .field', /padding-bottom:\s*0;/],
  ['.fields > .fieldWide', /padding-bottom:\s*var\(--space-2\);/],
  [DAU_TRUOT, /line-height:\s*var\(--leading-tight\);/],
  [O_SO, /padding-block:\s*0;\s*font-size:\s*var\(--text-base\);/],
  [`${O_SO} > span:last-child:not(:first-child)`, /font-size:\s*var\(--text-xs\);/],
  [".fields input[type='range']", /margin-block:\s*-8px;/],
  [".fields input[type='range']::-moz-range-thumb", /width:\s*20px;\s*height:\s*20px;/],
];

describe('khối Số liệu dưới 1024px — khoảng trống và nút kéo (19/10/2026)', () => {
  it.each(LUAT_CHUNG)('%s — có ở khối Số liệu và khối chuỗi, cùng khai báo', (boChon, khaiBao) => {
    expect(luat(SO_LIEU, boChon), `FormulaDetail: ${boChon}`).toMatch(khaiBao);
    expect(luat(CHUOI, boChon), `ChainBody: ${boChon}`).toMatch(khaiBao);
  });

  /*
   * Nút kéo phải nằm GIỮA rãnh: lề trên của nút = −(nút − rãnh) ÷ 2, cùng phép tính với nút 28px và
   * 16px gốc ở `SliderInput.module.css`. Đổi cỡ nút mà quên lề là nút lệch khỏi rãnh.
   */
  it('nút kéo 20px nằm giữa rãnh, ở cả hai khối', () => {
    const ranh = Number(
      /\.slider::-webkit-slider-runnable-track\s*\{[^}]*height:\s*(\d+)px;/.exec(TRUOT)?.[1],
    );
    expect(ranh).toBeGreaterThan(0);

    for (const [ten, css] of [
      ['FormulaDetail', SO_LIEU],
      ['ChainBody', CHUOI],
    ] as const) {
      const than = luat(css, ".fields input[type='range']::-webkit-slider-thumb") ?? '';
      const nut = Number(/height:\s*(\d+)px;/.exec(than)?.[1]);
      const le = Number(/margin-top:\s*(-?\d+)px;/.exec(than)?.[1]);
      expect(nut, ten).toBe(20);
      expect(le, ten).toBe(-(nut - ranh) / 2);
    }
  });

  /*
   * Ô trượt vẫn cao 44px (vùng chạm, NFR-USA-01) — lề âm chỉ thu chỗ nó chiếm trong dòng chảy. Lề âm
   * mà lớn hơn nửa phần thừa quanh nút thì nút chồng lên chữ hàng trên, hàng dưới.
   */
  it('ô trượt giữ chiều cao chạm 44px, lề âm không lấn vào chính nút kéo', () => {
    expect(luat(TRUOT, '.slider')).toMatch(/min-height:\s*var\(--tap-min\);/);

    const CHAM = 44; // --tap-min
    const le = Number(
      /margin-block:\s*-(\d+)px;/.exec(luat(SO_LIEU, ".fields input[type='range']") ?? '')?.[1],
    );
    const nut = Number(
      /height:\s*(\d+)px;/.exec(
        luat(SO_LIEU, ".fields input[type='range']::-webkit-slider-thumb") ?? '',
      )?.[1],
    );
    expect(le).toBeGreaterThan(0);
    expect(le).toBeLessThanOrEqual((CHAM - nut) / 2);
  });

  it('hàng nút Thêm / Bỏ đợt thôi kéo lên khi lưới đã trả lại khoảng trống cuối', () => {
    expect(luat(SO_LIEU, '.fields + .repeatActions')).toMatch(/margin-top:\s*0;/);
  });
});
