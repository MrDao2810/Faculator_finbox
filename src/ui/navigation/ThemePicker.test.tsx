// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { ThemePicker } from './ThemePicker';

/**
 * Cụm chọn bảng màu Sáng / Tối có CHỮ, ở khối "Chế độ hiển thị" của màn Cài đặt (WF-13).
 * Bản icon trên thanh trên là `ThemeSwitch`, có file kiểm riêng.
 *
 * Ba thứ đáng gác, và không thứ nào là "nút có đổi state không":
 *   · thuộc tính `data-theme` trên `<html>` — đó mới là thứ CSS thật sự đọc;
 *   · lựa chọn còn lại sau khi tải lại trang (SW-02);
 *   · trạng thái đang chọn KHÔNG chỉ được báo bằng màu (NFR-USA-06) — với đúng cái nút đổi màu
 *     này thì đó là điều kiện sống còn.
 */

function dungNut() {
  return render(
    <PreferencesProvider>
      <ThemePicker />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(cleanup);

describe('ThemePicker', () => {
  it('mặc định là Sáng, và nói ra bằng aria-pressed chứ không chỉ bằng màu', async () => {
    dungNut();

    const sang = await screen.findByRole('button', { name: 'Sáng' });
    const toi = screen.getByRole('button', { name: 'Tối' });

    expect(sang.getAttribute('aria-pressed')).toBe('true');
    expect(toi.getAttribute('aria-pressed')).toBe('false');
  });

  it('bấm Tối thì ghi data-theme lên <html> — thứ CSS thật sự đọc', async () => {
    dungNut();

    await userEvent.click(await screen.findByRole('button', { name: 'Tối' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Tối' }).getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByRole('button', { name: 'Sáng' }).getAttribute('aria-pressed')).toBe('false');
  });

  it('bấm về Sáng thì gỡ bảng tối, không kẹt lại', async () => {
    dungNut();

    await userEvent.click(await screen.findByRole('button', { name: 'Tối' }));
    await userEvent.click(screen.getByRole('button', { name: 'Sáng' }));

    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('nhớ lựa chọn sang lần mở sau — SW-02', async () => {
    const { unmount } = dungNut();
    await userEvent.click(await screen.findByRole('button', { name: 'Tối' }));
    unmount();

    expect(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)).toContain('"theme":"dark"');

    dungNut();
    const toi = await screen.findByRole('button', { name: 'Tối' });
    expect(toi.getAttribute('aria-pressed')).toBe('true');
  });

  it('đổi sang tiếng Anh thì nhãn nút đổi theo', async () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ locale: 'en' }));
    dungNut();

    expect(await screen.findByRole('button', { name: 'Light' })).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Appearance' })).toBeTruthy();
  });

  it('gọi ngoài Provider thì không nổ, chỉ là bấm không ăn', () => {
    render(<ThemePicker />);

    expect(screen.getByRole('button', { name: 'Sáng' }).getAttribute('aria-pressed')).toBe('true');
  });
});
