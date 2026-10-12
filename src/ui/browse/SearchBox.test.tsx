// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SearchBox } from './SearchBox';

afterEach(cleanup);

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
