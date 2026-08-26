// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { ThemeSwitch } from './ThemeSwitch';

/**
 * Nút icon đổi giao diện trên thanh trên. Bản có chữ ở màn Cài đặt là `ThemePicker`.
 *
 * Nút này không có chữ, nên `aria-label` là thứ DUY NHẤT nói cho trình đọc màn hình biết bấm vào
 * thì gì xảy ra — mất nó là nút thành một ô vuông câm. Phần lớn phép kiểm ở đây gác đúng chỗ đó.
 *
 * Việc chọn icon nào do CSS làm theo `data-theme` chứ không do React, nên jsdom (không áp CSS
 * Module) sẽ thấy CẢ HAI icon trong DOM. Đó là đúng, và ca kiểm dưới đây ghim điều đó lại — có
 * hai icon cùng nằm sẵn mới là cơ chế khiến icon đúng ngay từ lượt vẽ đầu.
 */

function dungNut() {
  return render(
    <PreferencesProvider>
      <ThemeSwitch />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

afterEach(cleanup);

describe('ThemeSwitch', () => {
  it('là MỘT nút, không phải hai', async () => {
    dungNut();

    await screen.findByRole('button');
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('đang sáng thì nhãn mời chuyển sang tối', async () => {
    dungNut();

    expect(await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' })).toBeTruthy();
  });

  it('bấm thì đổi giao diện VÀ đổi nhãn theo', async () => {
    dungNut();

    await userEvent.click(await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' }));

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(screen.getByRole('button', { name: 'Chuyển sang giao diện sáng' })).toBeTruthy();
  });

  it('bấm lần nữa thì quay về sáng — công tắc hai chiều', async () => {
    dungNut();

    await userEvent.click(await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' }));
    await userEvent.click(screen.getByRole('button', { name: 'Chuyển sang giao diện sáng' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' })).toBeTruthy();
  });

  it('nhớ lựa chọn sang lần mở sau — SW-02', async () => {
    const { unmount } = dungNut();
    await userEvent.click(await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' }));
    unmount();

    expect(window.localStorage.getItem(PREFERENCES_STORAGE_KEY)).toContain('"theme":"dark"');

    dungNut();
    expect(await screen.findByRole('button', { name: 'Chuyển sang giao diện sáng' })).toBeTruthy();
  });

  /*
   * Hai icon cùng nằm trong DOM là CƠ CHẾ, không phải thừa: CSS chọn cái nào hiện theo
   * `data-theme`, nên icon đúng ngay từ lượt vẽ đầu — trước cả khi React hydrate. Đổi sang cho
   * React chọn một icon là mở lại đúng cái nháy sai mà script chặn nháy ở `layout.tsx` sinh ra
   * để tránh.
   */
  it('cả hai icon nằm sẵn trong DOM để CSS chọn, không phải React chọn', async () => {
    dungNut();

    const nut = await screen.findByRole('button');
    expect(nut.querySelectorAll('svg')).toHaveLength(2);
  });

  it('icon bị giấu khỏi trình đọc màn hình — nhãn nằm ở aria-label', async () => {
    dungNut();

    const nut = await screen.findByRole('button');
    for (const svg of nut.querySelectorAll('svg')) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('đổi sang tiếng Anh thì nhãn đổi theo', async () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ locale: 'en' }));
    dungNut();

    expect(await screen.findByRole('button', { name: 'Switch to dark appearance' })).toBeTruthy();
  });

  it('gọi ngoài Provider thì không nổ, chỉ là bấm không ăn', () => {
    render(<ThemeSwitch />);

    expect(screen.getByRole('button', { name: 'Chuyển sang giao diện tối' })).toBeTruthy();
  });
});
