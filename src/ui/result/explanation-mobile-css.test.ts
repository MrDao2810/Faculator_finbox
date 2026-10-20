import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Khối "Giải thích cho người mới" dưới 1024px: đệm gọn lại (20/10/2026). Chủ dự án: _"điều chỉnh
 * lại padding của phần này đang quá rộng bản mobile"_. Đo ở 390 trên Chrome: hàng tên mục 44 → 36px,
 * đoạn văn đệm 12 × 16 → 8 × 12px, mục đầu của `beta` 124 → 108px, cả khối 452 → 404px; vùng chạm
 * của hàng tên mục vẫn 44px. Test React không chạy CSS Module, nên ca dưới đọc thẳng file.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./ExplanationAccordion.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

const DT = CSS.slice(CSS.lastIndexOf('@media (max-width: 1023.98px)'));
const GOC = CSS.slice(0, CSS.lastIndexOf('@media (max-width: 1023.98px)'));

function luat(boChon: string, css: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1] ?? '';
}

describe('khối giải thích — đệm dưới 1024px', () => {
  it('hàng tên mục 36px, đệm hai bên 12px, vùng chạm vẫn 44px', () => {
    const tom = luat('.summary', DT);
    expect(tom).toMatch(/min-height:\s*36px;/);
    expect(tom).toMatch(/padding:\s*var\(--space-1\) var\(--space-3\);/);
    expect(tom).toMatch(/position:\s*relative;/);
    const cham = luat('.summary::before', DT);
    expect(cham).toMatch(/height:\s*var\(--tap-min\);/);
    expect(cham).toMatch(/top:\s*50%;/);
    expect(cham).toMatch(/transform:\s*translateY\(-50%\);/);
  });

  it('đoạn văn đệm 8 × 12px, cùng mép trái với tên mục', () => {
    expect(luat('.body', DT)).toMatch(/padding:\s*var\(--space-2\) var\(--space-3\);/);
  });

  it('từ 1024px giữ nguyên: hàng tên mục cao tối thiểu 44px, đệm 16px hai bên', () => {
    expect(luat('.summary', GOC)).toMatch(/min-height:\s*var\(--tap-min\);/);
    expect(luat('.summary', GOC)).toMatch(/padding:\s*var\(--space-2\) var\(--space-4\);/);
    expect(luat('.body', GOC)).toMatch(/padding:\s*var\(--space-3\) var\(--space-4\);/);
  });
});
