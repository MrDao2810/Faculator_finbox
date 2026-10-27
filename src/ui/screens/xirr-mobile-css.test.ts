import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Bảng dòng tiền của XIRR ở khổ điện thoại (20/10/2026). Chủ dự án: _"đang thừa quá nhiều padding và
 * quá rộng. điều chỉnh lại cho nhỏ gọn hơn để tiết kiệm không gian"_. Đo ở 360px trước khi sửa: bảng
 * 348px trong khung 326px (cuộn ngang), dòng 68,5px; sau: vừa khung ở 320/360/390, dòng 44,5px. Test
 * React không chạy CSS Module, nên ca dưới đọc thẳng file.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8');
}

const CSS = doc('./XirrBody.module.css').replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân khối `@media (max-width: 1023.98px)` — đếm ngoặc. */
function khoiDienThoai(css: string): string {
  const batDau = css.indexOf('@media (max-width: 1023.98px)');
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

const DIEN_THOAI = khoiDienThoai(CSS);

function luat(boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(DIEN_THOAI)?.[1] ?? '';
}

describe('bảng dòng tiền XIRR dưới 1024px', () => {
  it('màn trao lớp cashflow cho bảng — bộ chọn table.cashflow mới vượt được luật của primitive', () => {
    expect(doc('./XirrBody.tsx')).toMatch(/<Table[^>]*className=\{styles\.cashflow\}/);
  });

  it('đệm ô 2px dọc · 4px ngang, hàng tiêu đề 8px', () => {
    expect(luat('table.cashflow th,\n  table.cashflow td')).toMatch(
      /padding:\s*2px var\(--space-1\);/,
    );
    expect(luat('table.cashflow thead th')).toMatch(/padding:\s*var\(--space-2\);/);
    const o = luat('.cell');
    expect(o).toMatch(/padding:\s*0 var\(--space-1\);/);
    // Chiều cao nay ở luật gốc, chung mọi khổ — khổ này không được đặt lại.
    expect(o).not.toMatch(/min-height/);
  });

  it('cột ngày co về ruột, phần dư dồn cho ô Số tiền', () => {
    expect(luat('.dateCol')).toMatch(/width:\s*1%;/);
    expect(luat('.dateCell')).toMatch(/min-width:\s*88px;/);
  });

  /*
   * Nút × không có lớp phủ chạm: nó phải tự cao bằng cả dòng, nên ô của nó không được có đệm. Từ
   * 27/10/2026 dòng thấp hơn 44px, và lớp phủ thò sang dòng bên cạnh sẽ xoá nhầm dòng — nên vẫn không có.
   */
  it('cột × không đệm, nút không có lớp phủ chạm thò ra ngoài dòng', () => {
    expect(luat('table.cashflow .removeCol')).toMatch(/padding:\s*0;/);
    expect(CSS).not.toMatch(/\.removeButton::after/);
  });
});

/*
 * Dòng gọn ở MỌI khổ (27/10/2026). Chủ dự án khoanh một dòng của bảng trên máy tính: _"giảm padding,
 * height các phần khoanh đỏ áp dụng màn web pc và web mobile"_. Đo trên Chrome trước: 68,5px ở PC,
 * 44,5px ở điện thoại; sau: ~36,5px cả hai.
 */
describe('bảng dòng tiền XIRR ở mọi khổ', () => {
  it('ô nhập và nút × cao 32px, ô đệm dọc 2px — ở luật gốc, ngoài mọi khối @media', () => {
    const goc = CSS.slice(0, CSS.indexOf('@media (max-width: 1023.98px)'));
    expect(/(?:^|\})\s*\.cell\s*\{[^}]*min-height:\s*32px;/.exec(goc)).not.toBeNull();
    expect(/\.removeButton\s*\{[^}]*min-height:\s*32px;/.exec(goc)).not.toBeNull();
    const o = /table\.cashflow td\s*\{([^}]*)\}/.exec(goc)?.[1] ?? '';
    expect(o).toMatch(/padding-top:\s*2px;/);
    expect(o).toMatch(/padding-bottom:\s*2px;/);
  });

  /* Đo: nội dung 120px trong khung 116px — thanh cuộn dọc mọc cho 4px của lớp phủ nút lịch. */
  it('lớp phủ chạm của nút lịch chỉ nới 2px theo chiều dọc, không tràn khỏi dòng 36px', () => {
    expect(CSS).toMatch(/table\.cashflow td button::after\s*\{\s*inset:\s*-2px -8px;\s*\}/);
  });

  /*
   * Từ 1280px hàng tiêu đề bên phải cao đúng bằng dòng tiêu đề "Giải thích cho người mới" bên trái,
   * để khung bảng thẳng mép trên với ô đầu của khối ấy (chủ dự án, 27/10/2026). Ca so CHÍNH cỡ chữ của
   * tiêu đề bên trái: đổi cỡ bên ấy mà quên bên này là hai mép lệch lại.
   */
  it('từ 1280px hàng tiêu đề cao bằng dòng tiêu đề 18px của khối Giải thích bên trái', () => {
    const khoi = /@media \(min-width: 1280px\)\s*\{([\s\S]*?)\n\}/.exec(CSS)?.[1] ?? '';
    const coTrai = /\.title\s*\{[^}]*font-size:\s*(var\([^)]+\));/.exec(
      doc('../result/ExplanationAccordion.module.css'),
    )?.[1];
    expect(coTrai).toBe('var(--text-md)');
    expect(khoi).toMatch(
      /\.blockHead\s*\{\s*height:\s*calc\(var\(--text-md\) \* var\(--leading-tight\)\);/,
    );
    expect(khoi).toMatch(/\.blockHead > button\s*\{\s*min-height:\s*28px;/);
  });

  it('khối điện thoại đứng sau luật gốc của ô nhập — cùng hạng ưu tiên, thứ tự quyết định', () => {
    const khoi = CSS.indexOf('@media (max-width: 1023.98px)');
    expect(CSS.indexOf('.cell {')).toBeLessThan(khoi);
    expect(CSS.indexOf('.dateCell {')).toBeLessThan(khoi);
  });
});
