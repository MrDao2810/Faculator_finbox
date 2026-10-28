// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PREFERENCES_STORAGE_KEY, ROUTES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { BottomTabBar } from './BottomTabBar';

/**
 * Thanh tab dưới (dưới 1024px). Ba tab từ 28/10/2026: mục Cài đặt rời thanh ở cả PC lẫn điện thoại,
 * thành icon bánh răng trên thanh trên (`SettingsLink`). Ngoài `NAV_ITEMS` (gác ở `routes.test.ts`)
 * trước đây không gì ghim thanh này — file này gác thứ người dùng điện thoại thấy: số tab, nhãn NGẮN,
 * icon, và tab nào sáng.
 */

const duongDan = vi.hoisted(() => ({ hienTai: '/cong-thuc/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => duongDan.hienTai,
}));

function dungThanh(path: string = ROUTES.formulas) {
  duongDan.hienTai = path;
  return render(
    <PreferencesProvider>
      <BottomTabBar />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe('BottomTabBar', () => {
  it('ba tab theo thứ tự, nhãn ngắn của thanh dưới: Công thức · Danh mục · Giới thiệu', () => {
    dungThanh();

    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(3);
    expect(
      within(nav)
        .getAllByRole('link')
        .map((a) => a.textContent),
    ).toEqual(['Công thức', 'Danh mục', 'Giới thiệu']);
  });

  it('không còn tab Cài đặt, ở cả hai ngôn ngữ', () => {
    dungThanh();
    expect(screen.queryByRole('link', { name: 'Cài đặt' })).toBeNull();

    cleanup();
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ locale: 'en' }));
    dungThanh();
    expect(screen.getByRole('link', { name: 'Portfolio' })).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'Settings' })).toBeNull();
  });

  it('mỗi tab một icon, giấu khỏi trình đọc màn hình', () => {
    dungThanh();

    for (const link of screen.getAllByRole('link')) {
      const icons = link.querySelectorAll('svg');
      expect(icons, link.textContent ?? '').toHaveLength(1);
      expect(icons[0]?.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('ở màn Danh mục, tab Danh mục mang aria-current và icon đặc', () => {
    dungThanh(ROUTES.portfolio);

    const tab = screen.getByRole('link', { name: 'Danh mục' });
    expect(tab.getAttribute('aria-current')).toBe('page');
    expect(tab.querySelector('svg path')?.getAttribute('fill')).toBe('currentColor');
    expect(screen.getByRole('link', { name: 'Công thức' }).getAttribute('aria-current')).toBeNull();
  });

  /*
   * Ngoại lệ có chủ ý — xem `activeRouteKey()`: Cài đặt không còn tab, và gán nó về một tab khác là
   * nói sai chỗ người dùng đang đứng. Dấu "đang ở đây" nằm ở icon bánh răng trên thanh trên.
   */
  it('ở màn Cài đặt không tab nào mang aria-current', () => {
    dungThanh(ROUTES.settings);

    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('aria-current'), link.textContent ?? '').toBeNull();
    }
  });
});
