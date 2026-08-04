// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Button } from './Button';

/**
 * Test khói của hạ tầng render component (gói WBS 2.3, bước 0).
 *
 * Trước đợt này vitest chỉ chạy môi trường Node và chỉ nhận `*.test.ts`, nên file `.test.tsx`
 * bị bỏ qua IM LẶNG — không lỗi, chỉ là không chạy. File này tồn tại để chứng minh hạ tầng
 * mới thật sự hoạt động, trước khi các component của 2.3 và 2.4 dựa vào nó.
 */

afterEach(cleanup);

describe('hạ tầng render component', () => {
  it('render được và đọc được nhãn', () => {
    render(<Button>Ghi đè</Button>);
    expect(screen.getByRole('button', { name: 'Ghi đè' })).not.toBeNull();
  });

  it('bấm được bằng chuột thật', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hoàn tác</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('mặc định là type="button" nên đặt trong form không vô tình submit', () => {
    render(<Button>Nạp mẫu</Button>);
    expect(screen.getByRole('button', { name: 'Nạp mẫu' }).getAttribute('type')).toBe('button');
  });
});
