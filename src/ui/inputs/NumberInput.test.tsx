// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VariableSpec } from '@/application';

import { NumberInput } from './NumberInput';

afterEach(cleanup);

const price: VariableSpec = {
  key: 'price',
  label: 'Giá thị trường',
  unit: '₫',
  type: 'number',
  defaultValue: 92_000,
  min: 0,
  max: 1_000_000,
  level: 'basic',
};

const growth: VariableSpec = {
  key: 'g',
  label: 'Tăng trưởng g',
  unit: '%',
  type: 'number',
  defaultValue: 4,
  min: 0,
  max: 12,
  level: 'advanced',
};

function box(): HTMLInputElement {
  return screen.getByLabelText('Giá thị trường') as HTMLInputElement;
}

describe('hiển thị', () => {
  it('hiện giá trị đã định dạng theo quy ước Việt Nam khi không thao tác', () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);
    expect(box().value).toBe('92.000');
  });

  it('nhãn luôn gắn với ô, không dùng placeholder thay nhãn', () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);
    expect(box()).not.toBeNull();
  });

  it('dùng bàn phím số trên điện thoại — WF-03 ghi “bàn phím số · HW-02”', () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);
    expect(box().getAttribute('inputMode')).toBe('decimal');
  });
});

describe('gõ và chốt giá trị', () => {
  it('bỏ dấu ngăn nghìn khi vào ô cho dễ sửa', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());

    expect(box().value).toBe('92000');
  });

  it('KHÔNG kẹp giá trị trong lúc gõ — người dùng gõ gì thì ô hiện nấy', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');

    expect(box().value).toBe('-4');
  });

  it('gõ ngoài miền thì hiện ngay dòng nhắc “! min 0”, không đợi rời ô', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');

    expect(screen.getByText('! min 0')).not.toBeNull();
    expect(box().getAttribute('aria-invalid')).toBe('true');
  });

  it('rời ô mới kẹp về miền hợp lệ và báo lên trên', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={92_000} onChange={onChange} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');
    await userEvent.tab();

    // Lượt CUỐI mới là lượt chốt: trong lúc gõ ô vẫn đẩy `-4` thô lên (xem khối dưới), việc kẹp
    // chỉ xảy ra ở đây.
    expect(onChange).toHaveBeenLastCalledWith(0);
  });

  it('bấm Enter cũng chốt giá trị', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={92_000} onChange={onChange} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '5000{Enter}');

    expect(onChange).toHaveBeenCalledWith(5_000);
  });

  it('bỏ trống rồi rời ô thì rơi về mặc định, không ra NaN (FR-06)', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={50_000} onChange={onChange} />);

    await userEvent.clear(box());
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(92_000);
  });

  it('đọc được số gõ kiểu Việt Nam có dấu chấm ngăn nghìn', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={0} onChange={onChange} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '92.000');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(92_000);
  });
});

/*
 * Khối Kết quả phải sống theo tay gõ.
 *
 * Bản đầu chỉ gọi `onChange` lúc rời ô, nên người dùng gõ xong cả một con số mà kết quả vẫn đứng
 * im cho tới khi bấm ra chỗ khác — trông y như màn bị treo. Đây là chỗ chặn việc đó quay lại.
 */
describe('đẩy giá trị lên ngay trong lúc gõ', () => {
  it('mỗi phím gõ là một lượt báo lên, không đợi rời ô', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={0} onChange={onChange} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '123');

    // Gõ ba phím thì nhận đủ ba mốc — chứng minh kết quả đổi theo từng phím chứ không nhảy một
    // phát ở cuối. Chưa hề rời ô.
    expect(onChange.mock.calls.map((c) => c[0])).toEqual([1, 12, 123]);
  });

  /*
   * "Không kẹp trong lúc gõ" nói về việc KHÔNG SỬA thứ người dùng đang gõ, không phải giữ giá trị
   * lại không cho ra ngoài. Gõ '-4' vào ô min 0 thì ô hiện '-4', dòng '! min 0' hiện ngay, và
   * phần còn lại của màn cũng biết đang là -4 — kẹp để dành cho lúc chốt.
   */
  it('đẩy giá trị THÔ, chưa kẹp, đúng thứ người dùng đang gõ', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={92_000} onChange={onChange} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '-4');

    expect(onChange).toHaveBeenLastCalledWith(-4);
  });

  it('chuỗi chưa ra số thì KHÔNG báo lên — không đẩy NaN hay 0 (FR-06)', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={92_000} onChange={onChange} />);

    await userEvent.clear(box());

    // Ô trắng và mỗi dấu trừ đều chưa phải một con số. Đẩy lên lúc này thì bên nhận buộc phải quy
    // thành 0 hoặc NaN — đúng hai thứ FR-06 cấm. Giữ nguyên giá trị cũ, chờ tới lúc chốt.
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(box(), '-');
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('ô nhận giá trị tự động (FR-15)', () => {
  it('ghi rõ tên công thức nguồn', () => {
    render(<NumberInput spec={price} value={14.3} onChange={vi.fn()} derivedFrom="CAPM" />);
    expect(screen.getByText('↳ CAPM')).not.toBeNull();
  });

  it('nguồn rỗng thì coi như ô nhập tay, không hiện mũi tên trống', () => {
    render(<NumberInput spec={price} value={14.3} onChange={vi.fn()} derivedFrom="" />);
    expect(screen.queryByText('↳')).toBeNull();
  });
});

describe('ô khoá ở chế độ Cơ bản (FR-09)', () => {
  it('không sửa được', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={growth} value={4} onChange={onChange} mode="basic" />);

    const input = screen.getByLabelText('Tăng trưởng g') as HTMLInputElement;
    await userEvent.type(input, '9');

    expect(input.readOnly).toBe(true);
    expect(input.value).not.toContain('9');
  });

  it('có nhãn chữ “nâng cao” chứ không chỉ đổi màu (NFR-USA-06)', () => {
    render(<NumberInput spec={growth} value={4} onChange={vi.fn()} mode="basic" />);
    expect(screen.getByText('nâng cao')).not.toBeNull();
  });

  it('cùng biến đó ở chế độ Nâng cao thì sửa được', () => {
    render(<NumberInput spec={growth} value={4} onChange={vi.fn()} mode="advanced" />);
    const input = screen.getByLabelText('Tăng trưởng g') as HTMLInputElement;
    expect(input.readOnly).toBe(false);
  });
});
