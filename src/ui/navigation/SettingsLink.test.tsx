// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PREFERENCES_STORAGE_KEY, ROUTES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { SettingsLink } from './SettingsLink';

/**
 * Icon bánh răng trên thanh trên — lối vào màn Cài đặt từ 28/10/2026, thay cho mục Cài đặt của thanh
 * nav. Chỗ đứng của nó trong thanh (bên trái nút Sáng/Tối, con trực tiếp của cụm nút) gác ở
 * `AppHeader.test.tsx`; file này gác chính cái link.
 *
 * Icon không mang chữ, nên `aria-label` là thứ DUY NHẤT nói cho trình đọc màn hình biết nó dẫn đi
 * đâu — cùng lý do `ThemeSwitch.test.tsx` gác nhãn của nút anh em.
 */

const duongDan = vi.hoisted(() => ({ hienTai: '/cong-thuc/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => duongDan.hienTai,
}));

function dungIcon(path: string = ROUTES.formulas) {
  duongDan.hienTai = path;
  return render(
    <PreferencesProvider>
      <SettingsLink />
    </PreferencesProvider>,
  );
}

/** `next/link` ngoài router thật bỏ dấu '/' cuối — xem `HeaderNav.test.tsx`. */
function boDauCuoi(path: string): string {
  return path.length > 1 ? path.replace(/\/$/, '') : path;
}

/** Lõi bánh răng — `<path>` thứ hai; cái đầu là vành răng, luôn vẽ nét. */
function loi(link: HTMLElement): Element | null {
  return link.querySelectorAll('svg path')[1] ?? null;
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe('SettingsLink', () => {
  it('là MỘT link tới màn Cài đặt, không mang chữ', async () => {
    dungIcon();

    const links = await screen.findAllByRole('link');
    expect(links).toHaveLength(1);
    expect(boDauCuoi(links[0]?.getAttribute('href') ?? '')).toBe(boDauCuoi(ROUTES.settings));
    expect(links[0]?.textContent).toBe('');
  });

  /*
   * Tên là tên ĐÍCH, không phải hành động: đây là đường tới một màn, khác hai nút công tắc đứng
   * cạnh. `title` cho người dùng chuột một dòng gợi ý, vì icon không mang chữ.
   */
  it('aria-label và title đều là "Cài đặt"', async () => {
    dungIcon();

    const link = await screen.findByRole('link', { name: 'Cài đặt' });
    expect(link.getAttribute('title')).toBe('Cài đặt');
  });

  /*
   * Hai dấu hiệu ngoài màu của trạng thái "đang ở đây" (NFR-USA-06): viền 2px do CSS đọc chính
   * `aria-current` vẽ, và lõi bánh răng chuyển sang ĐẶC — phần React vẽ, gác ở đây.
   */
  it.each([ROUTES.settings, '/cai-dat'])(
    'ở %s mang aria-current="page" và lõi bánh răng tô đặc',
    async (path) => {
      dungIcon(path);

      const link = await screen.findByRole('link', { name: 'Cài đặt' });
      expect(link.getAttribute('aria-current')).toBe('page');
      expect(loi(link)?.getAttribute('fill')).toBe('currentColor');
      expect(loi(link)?.getAttribute('stroke')).toBe('none');
    },
  );

  it.each([ROUTES.formulas, ROUTES.portfolio, ROUTES.about, '/cong-thuc/pe/', '/cai-dat-khac/'])(
    'ở %s không mang aria-current, lõi vẽ nét',
    async (path) => {
      dungIcon(path);

      const link = await screen.findByRole('link', { name: 'Cài đặt' });
      expect(link.getAttribute('aria-current')).toBeNull();
      expect(loi(link)?.getAttribute('fill')).toBe('none');
      expect(loi(link)?.getAttribute('stroke')).toBe('currentColor');
    },
  );

  it('icon giấu khỏi trình đọc màn hình và vẽ bằng currentColor', async () => {
    dungIcon();

    const link = await screen.findByRole('link', { name: 'Cài đặt' });
    const svg = link.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(link.querySelectorAll('svg path')).toHaveLength(2);
  });

  it('đổi sang tiếng Anh thì tên đổi theo', async () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ locale: 'en' }));
    dungIcon();

    const link = await screen.findByRole('link', { name: 'Settings' });
    expect(link.getAttribute('title')).toBe('Settings');
  });

  it('gọi ngoài Provider thì không nổ', () => {
    duongDan.hienTai = ROUTES.formulas;
    render(<SettingsLink />);

    expect(screen.getByRole('link', { name: 'Cài đặt' })).toBeTruthy();
  });
});
