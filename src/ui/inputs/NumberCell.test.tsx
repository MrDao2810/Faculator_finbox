// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NumberCell } from './NumberCell';

afterEach(cleanup);

function cell(): HTMLInputElement {
  return screen.getByLabelText('Giá đóng cửa') as HTMLInputElement;
}

/** Ô của bảng luôn có nơi gọi giữ state — dựng lại đúng vòng đó, nếu không thì test nói dối. */
function Bang({ start, onValue }: { start: number | null; onValue?: (v: number | null) => void }) {
  const [value, setValue] = useState<number | null>(start);
  return (
    <NumberCell
      value={value}
      ariaLabel="Giá đóng cửa"
      onChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

describe('NumberCell — ô số của bảng WF-05 và bảng dòng tiền', () => {
  /*
   * Lỗi số 1 của màn WF-05: gõ '100,' thì `parseViNumber` trả 100, nơi gọi vẽ lại ô thành '100'
   * và dấu phẩy biến mất ngay dưới tay — không bao giờ gõ tới được phần thập phân.
   */
  it('gõ được số thập phân: dấu phẩy không bị nuốt giữa chừng', async () => {
    render(<Bang start={null} />);

    await userEvent.type(cell(), '100,4');

    expect(cell().value).toBe('100,4');
  });

  it('đẩy giá trị lên ngay từng phím, không đợi rời ô', async () => {
    const onValue = vi.fn();
    render(<Bang start={null} onValue={onValue} />);

    await userEvent.type(cell(), '25,5');

    expect(onValue).toHaveBeenLastCalledWith(25.5);
  });

  /*
   * Lỗi số 2: ô hiện `String(100.449)` = '100.449', chuỗi ấy đọc ngược lại thành 100449. Chỉ cần
   * chạm vào ô rồi gõ thêm một ký tự là giá nhảy lên gấp nghìn lần.
   */
  it('số lẻ hiện bằng dấu phẩy nên sửa tiếp không làm giá nhân lên nghìn lần', async () => {
    const onValue = vi.fn();
    render(<Bang start={100.449} onValue={onValue} />);

    expect(cell().value).toBe('100,449');

    await userEvent.type(cell(), '9');

    expect(onValue).toHaveBeenLastCalledWith(100.4499);
  });

  it('xoá trắng ô cho ra null — ô CHƯA điền, không phải số 0 (NFR-REL-01)', async () => {
    const onValue = vi.fn();
    render(<Bang start={25} onValue={onValue} />);

    await userEvent.clear(cell());

    expect(onValue).toHaveBeenLastCalledWith(null);
  });

  it('rời ô thì hiện lại bản dựng từ giá trị, không giữ chuỗi gõ dở', async () => {
    render(<Bang start={null} />);

    await userEvent.type(cell(), '25,50');
    await userEvent.tab();

    expect(cell().value).toBe('25,5');
  });
});
