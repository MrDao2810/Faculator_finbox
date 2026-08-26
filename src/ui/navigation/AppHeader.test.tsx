// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ROUTES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { AppHeader } from './AppHeader';

/**
 * Thành phần của thanh trên.
 *
 * Phép kiểm ở đây KHÔNG lặp lại hành vi của từng nút — mỗi nút đã có file kiểm riêng. Nó gác
 * đúng một thứ: nút đổi giao diện phải nằm trong thanh, và phải nằm trong LỚP BỌC ẩn nó ở khổ
 * hẹp. Gỡ lớp bọc đi thì cụm nút "Sáng | Tối" hiện ra ở 360px, nơi thanh trên vốn đã hết chỗ —
 * mà đó là kiểu hỏng chỉ nhìn tận mắt mới thấy, vì jsdom không áp media query.
 */

vi.mock('next/navigation', () => ({
  usePathname: () => ROUTES.home,
}));

function dungThanh() {
  return render(
    <PreferencesProvider>
      <AppHeader />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe('AppHeader', () => {
  it('có nút icon đổi giao diện, dạng một nút bấm-là-đổi', async () => {
    dungThanh();

    const nut = await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(nut.textContent, 'là nút icon nên không mang chữ nào').toBe('');
  });

  it('nút đổi giao diện nằm trong lớp bọc chỉ hiện ở màn PC', async () => {
    dungThanh();

    const nut = await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    const boc = nut.parentElement;

    expect(boc, 'nút phải có thẻ bọc riêng').not.toBeNull();
    expect(
      String(boc?.className),
      'thẻ bọc phải mang lớp themeControl — đó là chỗ ẩn nút dưới 1024px',
    ).toMatch(/themeControl/);
  });

  /*
   * Thanh trên KHÔNG được dùng bản có chữ: hai ô "Sáng | Tối" rộng gấp ba nút icon, và ở 1024px
   * cụm nút phải chỉ còn dư 16px.
   */
  it('dùng bản icon, không phải cụm hai ô có chữ của màn Cài đặt', async () => {
    dungThanh();

    await screen.findByRole('button', { name: 'Chuyển sang giao diện tối' });
    expect(screen.queryByRole('group', { name: 'Giao diện' })).toBeNull();
  });

  it('vẫn giữ nguyên ba điều khiển cũ, không thay thế cái nào', async () => {
    dungThanh();

    expect(await screen.findByRole('group', { name: 'Chế độ hiển thị' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Tìm công thức' })).toBeTruthy();
  });
});
