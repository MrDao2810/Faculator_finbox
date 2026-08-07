// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CATEGORIES, categoriesOf, parseListParams } from '@/application';

import { CategoryGrid } from './CategoryGrid';

afterEach(cleanup);

/**
 * Lưới nhóm của WF-01 — gói WBS 3.1.1, dựng lại theo bản thiết kế ở đợt 8.
 *
 * Ca quan trọng nhất là ca đọc ngược đường dẫn: đợt 7 từng ghép tay chuỗi `?nhom=<id>` trong
 * khi bộ đọc URL dùng tham số khác, link vẫn mở được trang nên trông như chạy đúng mà thật ra
 * không lọc gì. Ở đây dựng URL rồi đọc lại bằng chính `parseListParams()`.
 */

function queryOf(href: string): URLSearchParams {
  return new URLSearchParams(href.slice(href.indexOf('?')));
}

describe('CategoryGrid', () => {
  it('dựng đủ một ô cho mỗi nhóm được truyền vào', () => {
    render(<CategoryGrid categories={CATEGORIES} />);
    expect(screen.getAllByRole('link')).toHaveLength(12);
  });

  it('hiện tên rút gọn chứ không phải tên đầy đủ — chỗ hẹp 150px', () => {
    render(<CategoryGrid categories={categoriesOf('stock')} />);

    expect(screen.getByText('Phí & thuế VN')).not.toBeNull();
    expect(screen.queryByText('Phí & thuế thị trường VN')).toBeNull();
    expect(screen.getByText('Chỉ số DN')).not.toBeNull();
    expect(screen.getByText('Kỹ thuật')).not.toBeNull();
  });

  it('hiện số công thức dự kiến của SRS 3.8', () => {
    render(<CategoryGrid categories={categoriesOf('personal')} />);

    // Tiết kiệm 5 · Đầu tư 2 · Vay nợ 3 · Thuế TNCN 1 · Tài chính DN 2 = 13.
    const shown = screen.getAllByRole('link').map((a) => a.textContent);
    expect(shown).toEqual(['Tiết kiệm5', 'Đầu tư2', 'Vay nợ3', 'Thuế TNCN1', 'Tài chính DN2']);
  });

  it('không còn nhãn "sắp có" nào — chủ dự án chốt lấy hình của bản thiết kế', () => {
    render(<CategoryGrid categories={CATEGORIES} />);
    expect(screen.queryByText(/sắp có/i)).toBeNull();
  });

  it('mỗi ô trỏ sang màn danh sách đã lọc sẵn đúng nhóm đó', () => {
    render(<CategoryGrid categories={CATEGORIES} />);
    const links = screen.getAllByRole('link');

    CATEGORIES.forEach((category, index) => {
      const href = links[index]?.getAttribute('href') ?? '';
      // Không so chuỗi thô: đọc ngược bằng chính bộ đọc URL của tầng Application.
      expect(parseListParams(queryOf(href)).categoryId, category.id).toBe(category.id);
    });
  });

  it('danh sách rỗng thì không ném lỗi, chỉ ra lưới rỗng', () => {
    render(<CategoryGrid categories={[]} />);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
  });
});
