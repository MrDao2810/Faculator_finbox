// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ORIGIN_KEY, ORIGIN_PREV_KEY } from '@/application';

import { HeaderIdentity } from './HeaderIdentity';

/**
 * Thanh trên nằm ở layout gốc nên nút ‹ sống qua cú điều hướng giữa `/tim-kiem/` và trang chi tiết, mà
 * hai màn ấy được cấp CÙNG bộ tham số (`backLinkFor()`). Đo 29/10/2026: từ kết quả tìm kiếm sang
 * `/cong-thuc/roe/`, nút ‹ vẫn dẫn về danh sách (đích tính cho màn trước); từ chi tiết bấm ‹ về
 * `/tim-kiem/?q=roe`, nút ‹ trên màn tìm kiếm trỏ về CHÍNH NÓ. `HeaderIdentity` nay gắn lại nút theo
 * `pathname`.
 */
const duong = vi.hoisted(() => ({ hienTai: '/' }));
vi.mock('next/navigation', () => ({ usePathname: () => duong.hienTai }));

afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
});

const nho = (khoa: string, url: string): void => {
  window.sessionStorage.setItem(khoa, JSON.stringify({ url, scrollY: 0 }));
};
const link = (): string => {
  const a = screen.getByRole('link');
  return `${a.getAttribute('href') ?? ''} | ${a.textContent ?? ''}`;
};

function diDen(path: string): void {
  duong.hienTai = path.split('?')[0] ?? path;
  window.history.replaceState(null, '', path);
}

describe('nút ‹ ở thanh trên — điều hướng giữa hai màn cùng bộ tham số', () => {
  it('từ /tim-kiem/ sang trang chi tiết: đích được tính lại, trỏ về kết quả tìm kiếm', () => {
    nho(ORIGIN_KEY, '/tim-kiem/?q=roe');
    nho(ORIGIN_PREV_KEY, '/cong-thuc/');
    diDen('/tim-kiem/?q=roe');
    const view = render(<HeaderIdentity />);

    diDen('/cong-thuc/roe/');
    view.rerender(<HeaderIdentity />);

    expect(link()).toBe('/tim-kiem?q=roe | Tìm công thức');
  });

  it('từ trang chi tiết về /tim-kiem/: nút ‹ không trỏ về chính màn tìm kiếm', () => {
    nho(ORIGIN_KEY, '/tim-kiem/?q=roe');
    nho(ORIGIN_PREV_KEY, '/cong-thuc/');
    diDen('/cong-thuc/roe/');
    const view = render(<HeaderIdentity />);
    expect(link().startsWith('/tim-kiem?q=roe')).toBe(true);

    diDen('/tim-kiem/?q=roe');
    view.rerender(<HeaderIdentity />);

    expect(link().startsWith('/tim-kiem')).toBe(false);
  });
});
