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

/*
 * ── Ô chọn và nhóm nút đứng lẻ: lên cùng hàng với nhãn khi vừa (19/10/2026) ───────────────────────
 *
 * Chủ dự án khoanh ô "Độ tin cậy (α)" của `var-lich-su` ở điện thoại: khung chọn rộng hết hàng cho
 * một chữ "95%", hàng nhãn trên trống gần hết — _"thu nhỏ ô select lại rồi đưa lên cùng hàng ngang"_.
 * Nhóm nút ("Phương thức trả" của `lich-tra-no`) theo cùng luật vì nó là ô chọn dạng nút. Luật nằm ở
 * CSS (test React không chạy CSS Module), nên ca dưới đọc thẳng hai file, như mọi ca ở trên.
 */
const O_CHON = '.fields > .fieldLone:has(> select)';
const NHOM_NUT = ".fields > .fieldWide:has(> [role='group'])";

const LUAT_O_CHON: ReadonlyArray<readonly [boChon: string, khaiBao: RegExp]> = [
  // Gốc của cả hai là CỘT flex trong primitive — thiếu `row` thì hai con vẫn xếp dọc, giữa hàng.
  [O_CHON, /display:\s*flex;\s*flex-direction:\s*row;\s*flex-wrap:\s*wrap;/],
  // Bỏ `subgrid` là mất 8px của hai hàng phụ rỗng: đo được khe 4px thay vì 12px tới ô sau.
  [O_CHON, /padding-bottom:\s*var\(--space-2\);/],
  [`${O_CHON} > label`, /flex:\s*1000 1 auto;/],
  [`${O_CHON} > select`, /flex:\s*1 1 auto;\s*width:\s*auto;/],
  [NHOM_NUT, /flex-direction:\s*row;\s*flex-wrap:\s*wrap;/],
  [`${NHOM_NUT} > div:first-child`, /flex:\s*1000 1 auto;/],
  [`${NHOM_NUT} > [role='group']`, /flex:\s*1 1 auto;/],
];

describe('ô chọn và nhóm nút đứng lẻ dưới 1024px — nhãn trái, điều khiển gọn bên phải', () => {
  it.each(LUAT_O_CHON)('%s — có ở khối Số liệu và khối chuỗi, cùng khai báo', (boChon, khaiBao) => {
    expect(luat(SO_LIEU, boChon), `FormulaDetail: ${boChon}`).toMatch(khaiBao);
    expect(luat(CHUOI, boChon), `ChainBody: ${boChon}`).toMatch(khaiBao);
  });

  /*
   * Tỉ lệ `flex-grow` là cả phép sửa: chung hàng thì phần thừa về nhãn (ô giữ bề rộng nội dung, dạt
   * phải), một mình hàng dưới thì ô hưởng trọn phần thừa (trải hết hàng — đúng hình cũ khi không vừa).
   * Hai số mà xích lại gần nhau thì ô chung hàng bị kéo giãn ra giữa.
   */
  it('nhãn giãn gấp ít nhất 1000 lần điều khiển', () => {
    for (const [nhan, dieuKhien] of [
      [`${O_CHON} > label`, `${O_CHON} > select`],
      [`${NHOM_NUT} > div:first-child`, `${NHOM_NUT} > [role='group']`],
    ] as const) {
      const gian = (boChon: string): number =>
        Number(/flex:\s*(\d+)/.exec(luat(SO_LIEU, boChon) ?? '')?.[1]);
      expect(gian(nhan) / gian(dieuKhien)).toBeGreaterThanOrEqual(1000);
    }
  });

  it('chỉ ô SỐ lẻ giữ nhãn trên, khung dưới — luật mới không chạm tới nó', () => {
    expect(luat(SO_LIEU, '.fields > .fieldLone')).toMatch(/^\s*grid-column:\s*1 \/ -1;\s*$/);
  });
});
