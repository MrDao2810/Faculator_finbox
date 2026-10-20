import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Khung "?" (hướng dẫn sử dụng) dưới 1024px — chữ nhỏ đi một bậc (20/10/2026).
 *
 * Chủ dự án khoanh mục "Lấy số liệu ở đâu" của `ev-ebitda` trên điện thoại: _"giảm size text ở hướng
 * dẫn sử dụng phần tôi khoanh đỏ, áp dụng cho màn mobile"_. Bộ số theo khung hướng dẫn của Danh mục
 * (19/10): tiêu đề 14px, tên ô và thân 12px. Test React không chạy CSS Module, nên đọc thẳng file.
 */

function docCss(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

/** Thân khối `@media (max-width: 1023.98px)` — khối cuối của mỗi file nên lấy phần sau nó. */
function khoiDuoi1024(css: string): string {
  const mo = css.indexOf('@media (max-width: 1023.98px)');
  expect(mo, 'thiếu khối dưới 1024px').toBeGreaterThanOrEqual(0);
  return css.slice(mo);
}

const THAN = khoiDuoi1024(docCss('./GuideBody.module.css'));
const KHUNG = khoiDuoi1024(docCss('../../app/cong-thuc/[id]/GuideHintPanel.module.css'));

describe('khung hướng dẫn sử dụng dưới 1024px', () => {
  it('tên ô, lời chỉ chỗ lấy số, đoạn chữ và khung lưu ý cùng về 12px', () => {
    const luat = /([^{}]+)\{\s*font-size:\s*var\(--text-xs\);\s*\}/.exec(THAN);
    const boChon = (luat?.[1] ?? '').split(',').map((s) => s.trim());
    expect(boChon).toEqual(['.fieldLabel', '.fieldWhere', '.prose', '.caution']);
  });

  it('tiêu đề mục của khung 14px — vẫn lớn hơn thân bài một bậc', () => {
    expect(KHUNG).toMatch(/\.panel h2\s*\{\s*font-size:\s*var\(--text-sm\);\s*\}/);
  });
});
