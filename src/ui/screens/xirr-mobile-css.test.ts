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

  it('đệm ô 4px, hàng tiêu đề 8px, ô nhập 36px', () => {
    expect(luat('table.cashflow th,\n  table.cashflow td')).toMatch(/padding:\s*var\(--space-1\);/);
    expect(luat('table.cashflow thead th')).toMatch(/padding:\s*var\(--space-2\);/);
    const o = luat('.cell');
    expect(o).toMatch(/min-height:\s*36px;/);
    expect(o).toMatch(/padding:\s*0 var\(--space-1\);/);
  });

  it('cột ngày co về ruột, phần dư dồn cho ô Số tiền', () => {
    expect(luat('.dateCol')).toMatch(/width:\s*1%;/);
    expect(luat('.dateCell')).toMatch(/min-width:\s*88px;/);
  });

  /* Nút × không có lớp phủ chạm: nó phải tự cao bằng cả dòng, nên ô của nó không được có đệm. */
  it('cột × không đệm, nút giữ chiều cao chạm 44px', () => {
    expect(luat('table.cashflow .flagCol:last-child')).toMatch(/padding:\s*0;/);
    expect(/\.removeButton\s*\{[^}]*min-height:\s*var\(--tap-min\);/.exec(CSS)).not.toBeNull();
  });

  it('khối điện thoại đứng sau luật gốc của ô nhập — cùng hạng ưu tiên, thứ tự quyết định', () => {
    const khoi = CSS.indexOf('@media (max-width: 1023.98px)');
    expect(CSS.indexOf('.cell {')).toBeLessThan(khoi);
    expect(CSS.indexOf('.dateCell {')).toBeLessThan(khoi);
  });
});
