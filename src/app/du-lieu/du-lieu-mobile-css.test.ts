import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Đầu màn Bảng dữ liệu ở khổ điện thoại (20/10/2026). Chủ dự án khoanh tiêu đề, dòng phụ, hai hàng
 * nút, đầu thẻ nến và thanh 1T/3T/6T: _"cần giảm size text và giảm height của button bản mobile để có
 * nhiều không gian hiển thị chart"_. Đo ở 390px: đỉnh biểu đồ 380 → 330px. Test React không chạy CSS
 * Module, nên ca dưới đọc thẳng hai file.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Thân khối `@media (max-width: 1023.98px)` CUỐI CÙNG của file — đếm ngoặc. */
function khoiDienThoaiCuoi(css: string): string {
  const batDau = css.lastIndexOf('@media (max-width: 1023.98px)');
  if (batDau < 0) return '';
  let i = css.indexOf('{', batDau) + 1;
  const dau = i;
  let sau = 1;
  while (i < css.length && sau > 0) {
    if (css[i] === '{') sau += 1;
    else if (css[i] === '}') sau -= 1;
    i += 1;
  }
  return css.slice(dau, i - 1);
}

function luat(khoi: string, boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(khoi)?.[1] ?? '';
}

const MAN = doc('./DataTableScreen.module.css');
const NEN = doc('../../ui/series/CandleChart.module.css');
const MAN_DT = khoiDienThoaiCuoi(MAN);
const NEN_DT = khoiDienThoaiCuoi(NEN);

describe('đầu màn Bảng dữ liệu dưới 1024px', () => {
  it('tiêu đề 20px, dòng phụ 12px', () => {
    expect(luat(MAN_DT, '.title')).toMatch(/font-size:\s*var\(--text-lg\);/);
    expect(luat(MAN_DT, '.subtitle')).toMatch(/font-size:\s*var\(--text-xs\);/);
  });

  it('năm nút thao tác 28px, chữ 12px', () => {
    const nut = luat(MAN_DT, '.actions > button');
    expect(nut).toMatch(/min-height:\s*28px;/);
    expect(nut).toMatch(/font-size:\s*var\(--text-xs\);/);
  });

  it('đầu thẻ nến: số phiên 12px, giá 20px, mức đổi 12px', () => {
    expect(luat(NEN_DT, '.meta')).toMatch(/font-size:\s*var\(--text-xs\);/);
    expect(luat(NEN_DT, '.price')).toMatch(/font-size:\s*var\(--text-lg\);/);
    expect(luat(NEN_DT, '.changeUp,\n  .changeDown')).toMatch(/font-size:\s*var\(--text-xs\);/);
  });

  /* Nút khoảng không phải `Button`, nên lớp phủ chạm 44px phải tự khai — mất nó là đích bấm 28px. */
  it('nút 1T/3T/6T cùng 28px với năm nút trên, giữ lớp phủ chạm 44px', () => {
    const khoang = luat(NEN_DT, '.range');
    expect(khoang).toMatch(/min-height:\s*28px;/);
    expect(khoang).toMatch(/position:\s*relative;/);
    expect(luat(NEN_DT, '.range::after')).toMatch(/height:\s*var\(--tap-min\);/);
    expect(/min-height:\s*(\d+)px;/.exec(khoang)?.[1]).toBe(
      /min-height:\s*(\d+)px;/.exec(luat(MAN_DT, '.actions > button'))?.[1],
    );
  });

  /*
   * Lượt hai (20/10/2026): _"bo xung quanh đang quá tròn, giảm bớt độ tròn"_. 10px trên khối cao 28–32px
   * gần nửa chiều cao, tức gần viên thuốc. Năm nút và khay cùng bậc `--radius-sm`; nút trong khay vẫn
   * `inherit` từ luật gốc nên không khai lại.
   */
  it('năm nút và khay 1T/3T/6T bo --radius-sm, nút trong khay vẫn lấy bo của khay', () => {
    expect(luat(MAN_DT, '.actions > button')).toMatch(/border-radius:\s*var\(--radius-sm\);/);
    expect(luat(NEN_DT, '.ranges')).toMatch(/border-radius:\s*var\(--radius-sm\);/);
    expect(luat(NEN_DT, '.range')).not.toMatch(/border-radius/);
    expect(/^\.range\s*\{([^}]*)\}/m.exec(NEN)?.[1]).toMatch(/border-radius:\s*inherit;/);
  });

  it('khối điện thoại của thẻ nến đứng sau luật gốc — cùng hạng ưu tiên, thứ tự quyết định', () => {
    const khoi = NEN.lastIndexOf('@media (max-width: 1023.98px)');
    for (const goc of ['.code {', '.meta {', '.price {', '.range {']) {
      expect(NEN.indexOf(goc), goc).toBeLessThan(khoi);
    }
    expect(MAN.indexOf('.title {')).toBeLessThan(MAN.lastIndexOf('@media (max-width: 1023.98px)'));
  });
});
