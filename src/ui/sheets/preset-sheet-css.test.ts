import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Tấm "Nạp bộ số liệu mẫu" (21/10/2026). Chủ dự án chụp tấm trên điện thoại, dòng số liệu tràn dưới
 * nút "Nạp" và thân tấm có thanh cuộn ngang: _"sửa lỗi khi bật nạp mẫu thì bị lỗi giao diện. bước đầu
 * hãy giảm padding, giảm height các button, giảm size text. đưa bottom dialog thành dialog ở giữa. áp
 * dụng cho mobile"_. Test React không chạy CSS Module, nên các ca dưới đọc thẳng file.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Thân khối `@media screen and (max-width: 1023.98px)` CUỐI CÙNG của file — đếm ngoặc. */
function khoiDienThoai(css: string): string {
  const batDau = css.lastIndexOf('@media screen and (max-width: 1023.98px)');
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

const CSS = doc('./PresetSheet.module.css');
const DT = khoiDienThoai(CSS);
const TSX = readFileSync(fileURLToPath(new URL('./PresetSheet.tsx', import.meta.url)), 'utf8');

describe('dòng số liệu của từng mã không tràn ra ngoài cột', () => {
  /*
   * Bản cũ khoá CẢ Ô không ngắt (`.field { white-space: nowrap }`). Từ khi nhãn mang ký hiệu, "Tổng nợ
   * phải trả (D) 31.881 tỷ ₫" dài hơn cột ở 390px, nên dòng chui dưới nút "Nạp" và thân tấm cuộn ngang.
   */
  it('ô là khối liền nhưng không rộng quá cột; chỉ con số + đơn vị là không ngắt', () => {
    const o = /^\.field\s*\{([^}]*)\}/m.exec(CSS)?.[1] ?? '';
    expect(o).toMatch(/display:\s*inline-block;/);
    expect(o).toMatch(/max-width:\s*100%;/);
    expect(o).not.toMatch(/nowrap/);
    expect(/^\.fieldValue\s*\{([^}]*)\}/m.exec(CSS)?.[1]).toMatch(/white-space:\s*nowrap;/);
  });

  it('con số và đơn vị nằm trong .fieldValue', () => {
    expect(TSX).toMatch(
      /<span className=\{styles\.fieldValue\}>\{valueText\(value, unit\)\}<\/span>/,
    );
  });
});

describe('dưới 1024px: hộp thoại nổi giữa, gọn lại', () => {
  it('tấm truyền placement="center" và lớp riêng để CSS của nó bám vào', () => {
    expect(TSX).toMatch(/placement="center"/);
    expect(TSX).toMatch(/className=\{styles\.sheet\}/);
  });

  it('đầu và thân đệm 12 × 16px, tiêu đề 14px', () => {
    expect(luat(DT, 'dialog.sheet > div > header:first-child')).toMatch(
      /padding:\s*var\(--space-3\) var\(--space-4\);/,
    );
    expect(luat(DT, 'dialog.sheet > div > header:first-child h2')).toMatch(
      /font-size:\s*var\(--text-sm\);/,
    );
    expect(luat(DT, 'dialog.sheet > div > div:nth-child(2)')).toMatch(
      /padding:\s*var\(--space-3\) var\(--space-4\);/,
    );
  });

  it('dòng mã đệm 8px; tên và kết quả 13px, dòng số liệu 11px', () => {
    expect(luat(DT, '.item')).toMatch(/padding:\s*var\(--space-2\);/);
    expect(luat(DT, '.name,\n  .result')).toMatch(/font-size:\s*13px;/);
    expect(luat(DT, '.meta,\n  .noResult')).toMatch(/font-size:\s*11px;/);
  });

  /*
   * Nút cao 28px, vùng chạm 44px vẫn của `.sm::after` nhô 8px trên dưới — vừa đúng 8px đệm của dòng,
   * nên vùng chạm của nút này không lấn sang dòng bên cạnh.
   */
  it('nút "Nạp" và nút sang kho lớn 28px, chữ 12px; vẫn là nút sm (giữ vùng chạm 44px)', () => {
    const nut = luat(DT, '.item > button,\n  .browse > button');
    expect(nut).toMatch(/min-height:\s*28px;/);
    expect(nut).toMatch(/font-size:\s*var\(--text-xs\);/);
    expect(TSX.match(/size="sm"/g)?.length).toBe(2);
  });

  /*
   * Tấm chọn mã của màn chi tiết thay chỗ tấm này qua lối rẽ "Danh sách … mã khác →" và nút ‹, nên đầu
   * và thân hai tấm phải y hệt nhau (21/10/2026, chủ dự án: _"chuyển sang màn mới là màn chọn mã thì cũng
   * là dialog giữa. và cần giảm padding của phần khoanh đỏ màn mới"_). So từng luật, không chép số.
   */
  it('tấm chọn mã của màn chi tiết: nổi giữa, đầu và thân y hệt tấm này', () => {
    const chonMa = khoiDienThoai(doc('./TickerPickerSheet.module.css'));
    const hang = (khoi: string, lop: string, duoi: string): string =>
      luat(khoi, `dialog.${lop} > div > ${duoi}`).replace(/\s+/g, ' ').trim();

    for (const duoi of ['header:first-child', 'header:first-child h2', 'div:nth-child(2)']) {
      expect(hang(chonMa, 'compact', duoi), duoi).not.toBe('');
      expect(hang(chonMa, 'compact', duoi), duoi).toBe(hang(DT, 'sheet', duoi));
    }

    const chiTiet = readFileSync(
      fileURLToPath(new URL('../../app/cong-thuc/[id]/FormulaDetail.tsx', import.meta.url)),
      'utf8',
    );
    const the = /<TickerPickerPanel[\s\S]*?\/>/.exec(chiTiet)?.[0] ?? '';
    expect(the).toMatch(/placement="center"/);
    expect(the).toMatch(/\n\s*compact\n/);
  });

  it('khối điện thoại đứng sau các luật gốc nó đè', () => {
    const khoi = CSS.lastIndexOf('@media screen and (max-width: 1023.98px)');
    for (const goc of ['.item {', '.name {', '.meta {', '.result {', '.browse {']) {
      expect(CSS.indexOf(goc), goc).toBeLessThan(khoi);
    }
  });
});
