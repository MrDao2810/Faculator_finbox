// @vitest-environment jsdom
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import NotFound from './not-found';

/**
 * Trang 404 (20/10/2026). Chủ dự án khoanh hai câu dưới tiêu đề ("Đường dẫn có thể nhập sai…",
 * "Thử tìm công thức theo tên…") và bảo xoá ở cả mobile lẫn web; khoanh cặp nút và bảo giảm cỡ chữ,
 * giảm chiều cao ở bản mobile. Test React không chạy CSS Module, nên ca thứ hai đọc thẳng file.
 */

afterEach(cleanup);

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

describe('trang 404', () => {
  it('chỉ còn tiêu đề và hai lối ra, không dòng giải thích nào', () => {
    const { container } = render(<NotFound />);
    expect(screen.getByText('Không tìm thấy trang này')).toBeTruthy();
    expect(container.querySelectorAll('p')).toHaveLength(0);
    expect(container.textContent).not.toMatch(/nhập sai|dời chỗ|không dấu/);
    expect(screen.getByRole('link', { name: 'Tìm công thức' }).getAttribute('href')).toMatch(
      /^\/tim-kiem\/?$/,
    );
    expect(screen.getByRole('link', { name: 'Về danh sách công thức' })).toBeTruthy();
  });

  it('dưới 1024px hai nút cao 36px, chữ 12px, vùng chạm vẫn 44px; khối nằm cuối file', () => {
    const css = doc('./not-found.module.css');
    const dt = khoiDienThoaiCuoi(css);
    const nut = luat(dt, '.primary,\n  .secondary');
    expect(nut).toMatch(/min-height:\s*36px;/);
    expect(nut).toMatch(/font-size:\s*var\(--text-xs\);/);
    expect(nut).toMatch(/position:\s*relative;/);
    expect(luat(dt, '.primary::after,\n  .secondary::after')).toMatch(
      /height:\s*var\(--tap-min\);/,
    );
    expect(css.trimEnd().endsWith('}\n}')).toBe(true);
    expect(css.lastIndexOf('@media (max-width: 1023.98px)')).toBeGreaterThan(
      css.indexOf('\n.secondary {'),
    );
  });
});
