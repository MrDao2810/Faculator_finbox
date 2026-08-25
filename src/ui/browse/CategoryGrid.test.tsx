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

/*
 * Con số đi theo chế độ hiển thị — FR-09, vế thứ ba.
 *
 * Trước gói này ô luôn in `expectedCount`, nên bấm nút Cơ bản / Nâng cao ở trang chủ không đổi
 * lấy một con số. Prop `counts` là đường để trang chủ đưa số THẬT của chế độ đang xem vào.
 */
describe('CategoryGrid — số đếm theo chế độ hiển thị', () => {
  const CA_NHAN = categoriesOf('personal');

  it('có `counts` thì in số truyền vào, không in số dự kiến nữa', () => {
    // Đúng bộ số của chế độ Cơ bản: Tài chính DN có 2/2 công thức đều mức nâng cao.
    const counts = new Map([
      ['savings', 5],
      ['investing', 2],
      ['loans', 3],
      ['personal-tax', 1],
      ['corporate-finance', 0],
    ]);

    render(<CategoryGrid categories={CA_NHAN} counts={counts} />);

    const shown = screen.getAllByRole('link').map((a) => a.textContent);
    expect(shown).toEqual([
      'Tiết kiệm5',
      'Đầu tư2',
      'Vay nợ3',
      'Thuế TNCN1',
      // Không phải 'Tài chính DN0' — xem ca ngay dưới.
      'Tài chính DNchỉ ở Nâng cao',
    ]);
  });

  /*
   * Ca đáng giá nhất của khối này. In số `0` ở đây đọc ra là "nhóm này rỗng", trong khi sự thật
   * là "nhóm này chỉ có ở chế độ kia" — đúng lớp im lặng mà FR-06 sinh ra để chặn. Và ô vẫn
   * phải là LINK: màn danh sách phía sau đã có khối rỗng riêng kèm nút bật chế độ, nên chặn
   * đường vào ở đây là cắt mất lối đi duy nhất tới hai công thức ấy.
   */
  it('nhóm rỗng ở chế độ Cơ bản: nói "chỉ ở Nâng cao", KHÔNG in số 0, và vẫn bấm được', () => {
    render(<CategoryGrid categories={CA_NHAN} counts={new Map([['corporate-finance', 0]])} />);

    const link = screen.getByRole('link', { name: /Tài chính DN/ });
    expect(link.textContent).toContain('chỉ ở Nâng cao');
    expect(link.textContent).not.toContain('0');
    expect(parseListParams(queryOf(link.getAttribute('href') ?? '')).categoryId).toBe(
      'corporate-finance',
    );
  });

  it('nhóm không có trong `counts` thì rơi về số dự kiến, không rơi về 0', () => {
    // Bảo vệ hợp đồng cũ: `counts` là tuỳ chọn, thiếu khoá nào thì khoá ấy dùng expectedCount.
    render(<CategoryGrid categories={CA_NHAN} counts={new Map([['savings', 4]])} />);

    const shown = screen.getAllByRole('link').map((a) => a.textContent);
    expect(shown).toEqual(['Tiết kiệm4', 'Đầu tư2', 'Vay nợ3', 'Thuế TNCN1', 'Tài chính DN2']);
  });
});
