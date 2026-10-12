// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SearchBox } from './SearchBox';

afterEach(cleanup);

/*
 * Bản gọn (`compact`) sinh ra để ô tìm đứng cùng hàng với tiêu đề của màn Danh mục mà không đội hàng
 * ấy lên 44px. Hai điều phải giữ: mặc định KHÔNG đổi (màn Công thức và màn Tìm kiếm vẫn dùng ô 44px),
 * và phần thu nhỏ chỉ có hiệu lực từ 1024px — dưới đó là khổ chạm tay, và iOS phóng to trang khi ô
 * nhập có chữ dưới 16px. jsdom không áp CSS Module nên vế sau đọc thẳng file CSS.
 */
describe('SearchBox — bản gọn', () => {
  function lopBoc(): string {
    return screen.getByRole('searchbox').closest('div')?.parentElement?.className ?? '';
  }

  it('mặc định không mang lớp gọn; bật `compact` thì thêm đúng một lớp', () => {
    render(<SearchBox value="" onChange={vi.fn()} />);
    const thuong = lopBoc();
    cleanup();

    render(<SearchBox value="" onChange={vi.fn()} compact />);
    const gon = lopBoc();

    expect(gon.startsWith(thuong)).toBe(true);
    expect(gon.split(' ')).toHaveLength(thuong.split(' ').length + 1);
  });

  it('mọi luật của bản gọn nằm trong `@media (min-width: 1024px)`', () => {
    // `process.cwd()` chứ không `import.meta.url`: ở môi trường jsdom đó không phải một URL `file:`.
    const css = readFileSync(
      join(process.cwd(), 'src/ui/browse/SearchBox.module.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    const moKhoi = css.indexOf('@media (min-width: 1024px)');

    expect(moKhoi).toBeGreaterThan(-1);
    expect(css.slice(0, moKhoi)).not.toContain('.compact');
    expect(css.slice(moKhoi)).toContain('.compact .control');
  });
});

describe('SearchBox — nhãn và chữ mờ', () => {
  /*
   * Mặc định phải giữ NGUYÊN: ô này đang phục vụ màn Công thức và màn Tìm kiếm, và hai prop mới chỉ
   * có nghĩa với chỗ mượn ô để lọc thứ khác (màn Danh mục).
   */
  it('không truyền gì thì vẫn là ô tìm công thức', () => {
    render(<SearchBox value="" onChange={vi.fn()} />);

    const input = screen.getByRole('searchbox', { name: 'Tìm công thức' });
    expect(input.getAttribute('placeholder')).toBe('Tên công thức, ví dụ P/E hay định giá');
  });

  it('nhãn và chữ mờ đi theo prop, và nhãn ẩn đổi cùng chữ mờ', () => {
    render(<SearchBox value="" onChange={vi.fn()} label="Tìm mã" placeholder="Tìm mã" />);

    // Tên khả truy cập đổi theo — nếu chỉ đổi chữ mờ thì người nghe vẫn nghe "Tìm công thức".
    const input = screen.getByRole('searchbox', { name: 'Tìm mã' });
    expect(input.getAttribute('placeholder')).toBe('Tìm mã');
    expect(screen.queryByText('Tìm công thức')).toBeNull();
  });
});
