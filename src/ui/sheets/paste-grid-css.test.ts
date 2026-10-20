import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Lưới "Bảng dữ liệu" theo bản vẽ 20/10/2026. Chủ dự án gửi một bảng giá mẫu: _"đổi bảng dữ liệu
 * thành kiểu mới này cho tôi. bỏ tính năng mở cột này đi. đồng thời nếu width không đủ để hiển thị
 * số liệu thì có thể scroll ngang"_. Test React không chạy CSS Module, nên các ca dưới đọc thẳng file:
 * ba thứ ở đây đều chỉ thấy được trên trình duyệt thật, và đều đã đo bằng Chrome ở 390, 700, 1024, 1440.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8');
}

const CSS = doc('./PasteImportSheet.module.css').replace(/\/\*[\s\S]*?\*\//g, '');
const TSX = doc('./PasteImportSheet.tsx');

/** Thân của luật đầu tiên có đúng bộ chọn ấy (ngoài mọi khối `@media`), hoặc chuỗi rỗng. */
function luat(boChon: string, css = CSS): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1] ?? '';
}

/** Thân khối `@media` có đúng điều kiện ấy — đếm ngoặc. */
function khoi(dieuKien: string): string {
  const batDau = CSS.indexOf(`@media ${dieuKien}`);
  if (batDau < 0) return '';
  let i = CSS.indexOf('{', batDau) + 1;
  const dau = i;
  let sau = 1;
  while (i < CSS.length && sau > 0) {
    if (CSS[i] === '{') sau += 1;
    else if (CSS[i] === '}') sau -= 1;
    i += 1;
  }
  return CSS.slice(dau, i - 1);
}

describe('lưới Bảng dữ liệu — bản vẽ 20/10/2026', () => {
  /*
   * Cuộn sang cột Khối lượng mà không còn thấy ngày là không biết con số ấy của phiên nào. Cột Ngày
   * dính ngay sau cột số dòng, nên chỗ nó dính (`left`) phải bằng ĐÚNG bề ngang cột số dòng.
   */
  it('cột số dòng và cột Ngày đứng yên khi cuộn ngang, cột Ngày dính sát sau cột số dòng', () => {
    const soDong = luat('.grid thead th.lineHead,\n.grid tbody th');
    expect(soDong).toMatch(/position:\s*sticky/);
    expect(soDong).toMatch(/left:\s*0/);

    const ngay = luat('.grid thead th.thDate,\n.grid tbody td.tdDate');
    expect(ngay).toMatch(/position:\s*sticky/);
    const lech = /left:\s*([^;]+);/.exec(ngay)?.[1]?.trim();
    const rongCotSo = /width:\s*([^;]+);/.exec(luat('.colLine'))?.[1]?.trim();
    expect(lech).toBeDefined();
    expect(lech).toBe(rongCotSo);
  });

  /*
   * Chỉ KHUNG cuộn ngang, trang thì không: khung phải tự cuộn cả hai chiều. Và từ 1024px khung cao
   * đúng tiêu đề + 12 dòng, không cắt nửa dòng ở mép dưới — con số viết tay, nên ghim theo `ROW_H`.
   */
  it('khung tự cuộn, và từ 1024px cao đúng tiêu đề cộng 12 dòng', () => {
    expect(luat('.gridScroll')).toMatch(/overflow:\s*auto/);

    const rowH = Number(/const ROW_H = (\d+);/.exec(TSX)?.[1]);
    const tieuDe = Number(/height:\s*(\d+)px/.exec(luat('.grid thead th'))?.[1]);
    expect(rowH).toBe(32);
    const coSo = Number(
      /flex-basis:\s*(\d+)px/.exec(khoi('(min-width: 1024px) {\n  .gridScroll'))?.[1],
    );
    // Tiêu đề + 1px kẻ dưới, 12 dòng, 2px viền khung.
    expect(coSo).toBe(tieuDe + 1 + 12 * rowH + 2);
  });

  /*
   * Đo trên Chrome lần đầu: dòng sọc KHÔNG hiện, vì `.grid tbody td` (một lớp, hai tên thẻ) thắng
   * `.rowStripe > td` (một lớp, một tên thẻ). Luật sọc và luật dòng lỗi phải mang `.grid` ở đầu.
   */
  it('luật dòng sọc và dòng lỗi đủ độ ưu tiên để thắng nền mặc định của ô', () => {
    expect(luat('.grid tbody th,\n.grid tbody td')).toMatch(/background:/);
    expect(luat('.grid .rowStripe > th,\n.grid .rowStripe > td')).toMatch(/background:/);
    expect(luat('.grid .rowBad > td,\n.grid .rowBad > th')).toMatch(/--color-danger-soft/);
    // Dòng lỗi khai SAU dòng sọc: cùng độ ưu tiên, thứ tự quyết — dòng lỗi phải thắng.
    expect(CSS.indexOf('.grid .rowBad > td')).toBeGreaterThan(CSS.indexOf('.grid .rowStripe > th'));
  });

  /*
   * Lượt hai cùng ngày. Chủ dự án khoanh "Tải file CSV" · "Xoá hết": _"giảm height và size trong
   * button"_, và hàng tên cột: _"vì đã in đậm rồi nên không nhất thiết để size text lớn như vậy"_.
   * Nút thấp đi nhưng dưới 1024px phần chạm vẫn 44px.
   */
  it('nút thanh công cụ 30px chữ 12px, phần chạm 44px dưới 1024px; tên cột 12px đậm', () => {
    for (const nut of ['.fileButton', '.linkButton']) {
      expect(luat(nut), nut).toMatch(/min-height:\s*30px/);
      expect(luat(nut), nut).toMatch(/font-size:\s*var\(--text-xs\)/);
    }
    expect(
      luat('.fileButton::after,\n  .linkButton::after', khoi('(max-width: 1023.98px)')),
    ).toMatch(/height:\s*var\(--tap-min\)/);
    expect(luat('.head')).toMatch(/font-size:\s*var\(--text-xs\)/);
    expect(luat('.head')).toMatch(/font-weight:\s*var\(--weight-bold\)/);
  });

  /* Ca đảo chiều: bảng chọn vai trò cột đã bỏ cùng nút "Cột 6/6". */
  it('không còn kiểu nào của bảng chọn vai trò cột', () => {
    for (const lop of ['.pickPanel', '.pickRow', '.pick ', '.toolButton', '.toolCount']) {
      expect(CSS.includes(lop), lop).toBe(false);
    }
  });
});
