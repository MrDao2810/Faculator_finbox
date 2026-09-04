// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RecentSearches } from './RecentSearches';

afterEach(cleanup);

/**
 * Chip "Tìm gần đây" — gói WBS 3.1.3, thêm dạng `inline` ở đợt theo bản thiết kế Figma
 * "FINBOX VERSION 2".
 *
 * Hai dạng nằm ở hai màn khác nhau và làm hai việc khác nhau khi bấm, nên phải kiểm cả hai: sửa
 * dạng `inline` cho trang chủ mà vô tình đổi luôn `block` thì màn tìm WF-09 mất tiêu đề và mất
 * nút "Xoá lịch sử" mà không ca nào khác thấy.
 */

const TERMS = ['P/E', 'WACC'] as const;

describe('RecentSearches — chung cho cả hai dạng', () => {
  /*
   * Ca quan trọng nhất với TRANG CHỦ, không phải với màn tìm: trang chủ là HTML tĩnh, và danh
   * sách chỉ được đọc từ localStorage trong `useEffect`. Nếu khối này dựng ra bất cứ nút DOM nào
   * lúc `terms` còn rỗng thì lượt render đầu ở máy khách khác `out/index.html` — lệch hydration.
   */
  it('danh sách rỗng thì không dựng lấy một nút DOM nào', () => {
    const { container } = render(
      <RecentSearches terms={[]} onPick={vi.fn()} onClear={vi.fn()} variant="inline" />,
    );

    expect(container.innerHTML).toBe('');
  });
});

describe('RecentSearches — dạng block, màn tìm WF-09', () => {
  it('là dạng MẶC ĐỊNH: có tiêu đề và nút chữ "Xoá lịch sử"', () => {
    render(<RecentSearches terms={TERMS} onPick={vi.fn()} onClear={vi.fn()} />);

    expect(screen.getByRole('heading', { name: 'Tìm gần đây' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Xoá lịch sử' })).not.toBeNull();
  });

  it('chip là NÚT gọi lại tại chỗ, không phải link rời màn', async () => {
    const onPick = vi.fn();
    render(<RecentSearches terms={TERMS} onPick={onPick} onClear={vi.fn()} />);

    expect(screen.queryByRole('link')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'P/E' }));

    expect(onPick).toHaveBeenCalledWith('P/E');
  });
});

describe('RecentSearches — dạng inline, hàng chip dưới ô tìm ở trang chủ', () => {
  function renderInline(hrefFor = (term: string) => `/cong-thuc/?q=${encodeURIComponent(term)}`) {
    const onClear = vi.fn();
    const view = render(
      <RecentSearches terms={TERMS} hrefFor={hrefFor} onClear={onClear} variant="inline" />,
    );
    return { ...view, onClear };
  }

  /*
   * Trang chủ đã có `<h2>` cho "Công thức dùng hằng ngày" và "Duyệt theo nhóm". Thêm một `<h2>`
   * nữa cho hàng chip là dựng một cấp tiêu đề giả chen giữa ô tìm và kệ — xem docblock của prop.
   */
  it('không dựng tiêu đề nào', () => {
    renderInline();
    expect(screen.queryByRole('heading')).toBeNull();
  });

  /* Bỏ `<h2>` thì `aria-labelledby` mất chỗ trỏ tới; vùng vẫn phải tự xưng tên được. */
  it('vùng vẫn có tên cho trình đọc màn hình', () => {
    renderInline();
    expect(screen.getByRole('region', { name: 'Tìm gần đây' })).not.toBeNull();
  });

  /* Nút chỉ còn icon, nên nhãn phải nằm ở `aria-label` — NFR-USA-06. */
  it('nút xoá thu về icon nhưng vẫn đọc được tên', async () => {
    const { onClear } = renderInline();

    const nut = screen.getByRole('button', { name: 'Xoá lịch sử' });
    await userEvent.click(nut);

    expect(onClear).toHaveBeenCalledTimes(1);
  });

  /*
   * Chip là `<a>` THẬT, không phải nút gọi `router.push`: `useRouter` đòi app router đã mount nên
   * `HomeSearchPanel` không còn `render()` trần được (14 ca đỏ khi thử). Link còn mở tab mới được.
   */
  it('chip là link thật, mang đúng đường dẫn do hrefFor dựng', () => {
    renderInline();

    const href = screen.getByRole('link', { name: 'P/E' }).getAttribute('href') ?? '';

    /*
     * Kiểm phần đường dẫn và phần truy vấn, KHÔNG kiểm dấu '/' cuối: `next/link` trong jsdom
     * không đọc `trailingSlash` của next.config.mjs nên nó rút '/cong-thuc/?q=…' thành
     * '/cong-thuc?q=…', trong khi bản build thật giữ dấu gạch. Cùng lý do đã ghi ở
     * `HomeSearchPanel.test.tsx`; phần dấu gạch cuối do `routes.test.ts` giữ.
     */
    expect(href.startsWith('/cong-thuc')).toBe(true);
    expect(href).toContain('q=P%2FE');
    expect(screen.queryByRole('button', { name: 'P/E' })).toBeNull();
  });
});
