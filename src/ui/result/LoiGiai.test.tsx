// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LoiGiai } from './LoiGiai';
import type { LoiGiaiDong } from './LoiGiai';

/**
 * Dòng "Thay số" thu gọn khi có nhiều biến (khổ điện thoại). Ẩn bằng CSS nên HTML luôn đủ mọi biến;
 * ca này khoá việc đánh dấu đúng biến nào ẩn, nút, và `aria-expanded`.
 */
afterEach(cleanup);

function gan(n: number): LoiGiaiDong[] {
  return Array.from({ length: n }, (_, i) => ({
    kyHieu: `\\text{bien${String(i)}}`,
    giaTri: { vi: String(i) },
  }));
}

function ve(n: number) {
  return render(<LoiGiai tinh={{ vi: 'X' }} gan={gan(n)} ketQua="1" nguon="n" />);
}

describe('LoiGiai — thu gọn dòng Thay số', () => {
  it('ít biến: không có nút, không biến nào bị đánh dấu ẩn', () => {
    const { container } = ve(3);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelectorAll('[data-an]')).toHaveLength(0);
  });

  it('nhiều biến: 2 biến đầu hiện, các biến sau đánh dấu ẩn, nút ghi đúng số biến ẩn', () => {
    const { container } = ve(12);
    const dl = container.querySelector('dl dl');
    expect(dl?.hasAttribute('data-thu-gon')).toBe(true);
    // 10 biến ẩn × (dt + dd)
    expect(container.querySelectorAll('[data-an]')).toHaveLength(20);
    const nut = screen.getByRole('button', { name: 'Xem thêm 10 biến' });
    expect(nut.getAttribute('aria-expanded')).toBe('false');
  });

  it('bấm nút mở hết rồi bấm lại thì thu gọn', () => {
    const { container } = ve(12);
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm 10 biến' }));
    expect(container.querySelector('dl dl')?.hasAttribute('data-thu-gon')).toBe(false);
    const nut = screen.getByRole('button', { name: 'Thu gọn' });
    expect(nut.getAttribute('aria-expanded')).toBe('true');
    fireEvent.click(nut);
    expect(container.querySelector('dl dl')?.hasAttribute('data-thu-gon')).toBe(true);
  });
});
