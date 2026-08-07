// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { LAST_LIST_URL_KEY } from '@/application';

import { BackLink } from './BackLink';

afterEach(cleanup);
beforeEach(() => {
  window.sessionStorage.clear();
});

/**
 * `href` của link, đã bỏ dấu `/` ngay trước `?` hoặc ở cuối.
 *
 * `next/link` trong jsdom không đọc `trailingSlash: true` của `next.config.mjs` nên nó cắt dấu
 * `/` cuối; bản build thật thì giữ (đã kiểm: `out/cong-thuc/pe/index.html` có
 * `href="/cong-thuc/"`). Đây là chuyện của môi trường test, không phải của component — nên
 * chuẩn hoá đi để ca kiểm đo đúng thứ nó muốn đo là ĐƯỜNG DẪN và BỘ LỌC.
 */
function hrefOf(name?: string): string {
  const link = name === undefined ? screen.getByRole('link') : screen.getByRole('link', { name });
  const href = link.getAttribute('href') ?? '';
  // Giữ nguyên '/' trơn — cắt nó đi thì còn chuỗi rỗng, chẳng đo được gì.
  return href === '/' ? href : href.replace(/\/(?=\?|$)/, '');
}

describe('BackLink — đường ra của các màn trong', () => {
  it('là một link THẬT, không phải nút — mở tab mới được và chạy cả khi chưa có JS', () => {
    render(<BackLink />);

    const link = screen.getByRole('link');
    expect(link.tagName).toBe('A');
    expect(link.getAttribute('href')).not.toBeNull();
  });

  it('có chữ chứ không chỉ mỗi mũi tên — chính cái mũi tên trơn là thứ người dùng tìm không ra', () => {
    render(<BackLink />);

    expect(screen.getByRole('link', { name: 'Danh sách công thức' })).not.toBeNull();
  });

  it('chưa nhớ gì thì về danh sách trơn', () => {
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc');
  });

  it('nhớ được thì về ĐÚNG bộ lọc vừa rời đi', () => {
    window.sessionStorage.setItem(LAST_LIST_URL_KEY, '/cong-thuc/?q=rui+ro&category=risk');
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc?q=rui+ro&category=risk');
  });

  /*
   * `sessionStorage` sửa được bằng tay và giá trị của nó đi thẳng vào `href`. Ranh giới an toàn
   * nằm ở `parseListUrl()` và có test riêng; ở đây kiểm rằng component THẬT SỰ đi qua nó.
   */
  it('không để rác trong sessionStorage lọt vào href', () => {
    window.sessionStorage.setItem(LAST_LIST_URL_KEY, 'javascript:alert(1)');
    render(<BackLink />);

    expect(hrefOf()).toBe('/cong-thuc');
  });

  it('tắt `rememberList` thì bỏ qua chỗ đã nhớ và dùng đường dẫn dự phòng', () => {
    window.sessionStorage.setItem(LAST_LIST_URL_KEY, '/cong-thuc/?category=risk');
    render(<BackLink rememberList={false} fallbackHref="/" labelKey="nav.home" />);

    expect(hrefOf('Trang chủ')).toBe('/');
  });

  it('mũi tên ẩn với trình đọc màn hình — chữ mới là tên của link', () => {
    const { container } = render(<BackLink />);

    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });
});
