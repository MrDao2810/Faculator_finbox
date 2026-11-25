// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FORMULAS } from '@/application';

import { VariableTable } from './VariableTable';

afterEach(cleanup);

function specOf(id: string) {
  const spec = FORMULAS.find((f) => f.id === id);
  if (spec === undefined) throw new Error(`thiếu công thức ${id}`);
  return spec;
}

describe('VariableTable — thu gọn khi nhiều biến', () => {
  it('công thức nhiều biến: hàng thừa đánh dấu ẩn, nút ghi đúng số, bấm mở rồi thu gọn', () => {
    const spec = specOf('gia-tri-noi-tai-fcff');
    const { container } = render(<VariableTable formula={spec} />);
    const tong = container.querySelectorAll('tbody tr').length;
    expect(tong).toBeGreaterThan(3);
    const an = tong - 2;
    expect(container.querySelectorAll('tr[data-an]')).toHaveLength(an);

    const nut = screen.getByRole('button', { name: `Xem thêm ${String(an)} biến` });
    expect(nut.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[data-thu-gon]')).not.toBeNull();

    fireEvent.click(nut);
    expect(container.querySelector('[data-thu-gon]')).toBeNull();
    expect(screen.getByRole('button', { name: 'Thu gọn' }).getAttribute('aria-expanded')).toBe(
      'true',
    );
  });

  it('công thức ít biến: không có nút, không hàng nào bị ẩn', () => {
    const { container } = render(<VariableTable formula={specOf('pe')} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(container.querySelectorAll('tr[data-an]')).toHaveLength(0);
  });
});
