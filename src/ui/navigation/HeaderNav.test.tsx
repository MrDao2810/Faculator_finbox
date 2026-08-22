// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { HeaderNav } from './HeaderNav';
import { LangSwitch } from './LangSwitch';

/**
 * Nav ngang của thanh trên — chỉ khác `BottomTabBar` ở chỗ không có icon và dấu hiệu "đang chọn"
 * là gạch chân thay vì icon đặc; nguồn mục và cách xác định `pathname` dùng chung qua
 * `useActiveNavKey()`, nên phép kiểm ở đây tập trung vào phần khác biệt: href đúng, mục đang
 * chọn đúng, và nhãn đổi theo ngôn ngữ — không lặp lại mọi ca của `BottomTabBar`.
 */

let pathname: string = ROUTES.home;

vi.mock('next/navigation', () => ({
  usePathname: () => pathname,
}));

function dungNav() {
  return render(
    <PreferencesProvider>
      <HeaderNav />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  pathname = ROUTES.home;
  window.localStorage.clear();
});

afterEach(cleanup);

/*
 * `next/link` dựng ngoài router thật (đúng môi trường của test này) bỏ dấu '/' cuối khỏi `href`
 * — chỉ là hành vi của test harness, không phải của trang thật (`trailingSlash: true` ở
 * `next.config.mjs` chỉ áp dụng khi build/dev qua Next thật). So khớp sau khi bỏ dấu cuối ở cả
 * hai vế để không phụ thuộc hành vi riêng của môi trường test.
 */
function boDauCuoi(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

describe('HeaderNav', () => {
  it('bốn mục trỏ đúng ROUTES', () => {
    dungNav();
    expect(
      boDauCuoi(screen.getByRole('link', { name: 'Trang chủ' }).getAttribute('href') ?? ''),
    ).toBe(boDauCuoi(ROUTES.home));
    expect(
      boDauCuoi(screen.getByRole('link', { name: 'Công thức' }).getAttribute('href') ?? ''),
    ).toBe(boDauCuoi(ROUTES.formulas));
    expect(
      boDauCuoi(screen.getByRole('link', { name: 'Danh mục' }).getAttribute('href') ?? ''),
    ).toBe(boDauCuoi(ROUTES.portfolio));
    expect(
      boDauCuoi(screen.getByRole('link', { name: 'Cài đặt' }).getAttribute('href') ?? ''),
    ).toBe(boDauCuoi(ROUTES.settings));
  });

  it('mục khớp đường dẫn hiện tại được đánh dấu aria-current="page"', () => {
    pathname = ROUTES.formulas;
    dungNav();

    const dangChon = screen.getByRole('link', { name: 'Công thức' });
    expect(dangChon.getAttribute('aria-current')).toBe('page');
    expect(screen.getByRole('link', { name: 'Trang chủ' }).getAttribute('aria-current')).toBeNull();
  });

  it('đường dẫn công thức con vẫn sáng đúng mục Công thức', () => {
    pathname = '/cong-thuc/wacc/';
    dungNav();

    expect(screen.getByRole('link', { name: 'Công thức' }).getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('nav mang aria-label đọc từ nav.primary', () => {
    dungNav();
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeTruthy();
  });

  it('chuyển sang EN thì cả bốn nhãn đổi theo', async () => {
    const user = userEvent.setup();
    // Đặt cạnh LangSwitch — đúng cách hai component thật sự sống chung trong AppHeader — để đổi
    // locale qua một tương tác thật, không chỉ ghi thẳng localStorage.
    render(
      <PreferencesProvider>
        <HeaderNav />
        <LangSwitch />
      </PreferencesProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' }));

    expect(screen.getByRole('link', { name: 'Home' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Formulas' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeTruthy();
  });
});
