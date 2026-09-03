// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VariableSpec } from '@/application';

import { InlineNumber } from './InlineNumber';

afterEach(cleanup);

const price: VariableSpec = {
  key: 'price',
  label: { vi: 'Giá thị trường', en: 'Market price' },
  unit: '₫',
  type: 'number',
  defaultValue: 92_000,
  min: 0,
  max: 1_000_000,
  level: 'basic',
};

function box(): HTMLInputElement {
  return screen.getByLabelText('Giá thị trường') as HTMLInputElement;
}

function ve(value: number, onChange = vi.fn()) {
  render(
    <InlineNumber spec={price} value={value} onChange={onChange} ariaLabel="Giá thị trường" />,
  );
  return onChange;
}

/*
 * Hai ô số của dự án phải cư xử GIỐNG NHAU với cùng một con số ngoài miền. Trước đây `NumberInput`
 * hiện '! min 0' còn ô này âm thầm kẹp về 0 lúc rời ô, không một chữ nào — cùng một luật miền mà
 * hai ô nói hai chuyện là chỗ người dùng kết luận "máy tính sai".
 */
describe('InlineNumber — ngoài miền thì nói ra trước khi kẹp', () => {
  it('gõ số ngoài miền thì ô đánh dấu ngay, không đợi rời ô', async () => {
    ve(92_000);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');

    expect(box().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toContain('min 0');
  });

  it('dấu hiệu không chỉ là màu — có ký tự chữ đi kèm (NFR-USA-06)', async () => {
    const { container } = render(
      <InlineNumber spec={price} value={-4} onChange={vi.fn()} ariaLabel="Giá thị trường" />,
    );

    expect(container.textContent).toContain('!');
  });

  it('vẫn KHÔNG kẹp trong lúc gõ — ô hiện đúng thứ người dùng gõ', async () => {
    ve(92_000);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');

    expect(box().value).toBe('-4');
  });

  it('rời ô mới kẹp, và đó là chỗ DUY NHẤT kẹp', async () => {
    const onChange = ve(92_000);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');
    await userEvent.tab();

    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('số trong miền thì không có dấu báo nào', async () => {
    const { container } = render(
      <InlineNumber spec={price} value={50_000} onChange={vi.fn()} ariaLabel="Giá thị trường" />,
    );

    expect(box().getAttribute('aria-invalid')).toBeNull();
    expect(container.textContent).not.toContain('!');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  /* Cùng lỗi `String(100.449)` → 100449 đã vá ở `NumberInput` và `NumberCell`. */
  it('chạm vào ô có số lẻ rồi rời ra không làm giá nhân lên nghìn lần', async () => {
    const onChange = ve(100.449);

    await userEvent.click(box());
    expect(box().value).toBe('100,449');

    await userEvent.tab();
    // Giá trị không đổi thì `commit()` không gọi lên trên — im lặng ở đây nghĩa là số còn nguyên.
    expect(onChange).not.toHaveBeenCalled();
  });
});
