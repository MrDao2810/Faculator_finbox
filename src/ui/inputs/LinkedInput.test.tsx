// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { fail, ok } from '@/application';
import type { LinkedUpstream, VariableSpec } from '@/application';

import { LinkedInput } from './LinkedInput';

afterEach(cleanup);

const wacc: VariableSpec = {
  key: 'wacc',
  label: { vi: 'WACC', en: 'WACC' },
  unit: '%',
  type: 'number',
  defaultValue: 12.1,
  min: 0,
  max: 100,
  level: 'basic',
};

const capmOk: LinkedUpstream = {
  formulaId: 'capm',
  label: { vi: 'CAPM', en: 'CAPM' },
  output: ok(14.3, '%'),
};

const capmLoi: LinkedUpstream = {
  formulaId: 'capm',
  label: { vi: 'CAPM', en: 'CAPM' },
  output: fail('%', {
    code: 'MISSING_SERIES',
    message: {
      vi: 'Cần ít nhất 60 phiên giá, hiện mới có 24.',
      en: 'Need at least 60 price sessions, currently only 24.',
    },
    fix: {
      vi: 'Nạp bộ số liệu mẫu hoặc dán chuỗi giá từ Excel.',
      en: 'Load a sample dataset or paste a price series from Excel.',
    },
  }),
};

describe('đang nhận giá trị tự động', () => {
  it('hiện giá trị của thượng nguồn và ghi rõ tên nguồn (FR-15)', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={vi.fn()} />);

    expect((screen.getByLabelText('WACC') as HTMLInputElement).value).toBe('14,3');
    expect(screen.getByText('↳ CAPM')).not.toBeNull();
  });

  it('chưa có nút Nhận tự động — chưa ghi đè thì chưa có gì để hoàn tác', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Nhận tự động' })).toBeNull();
  });
});

describe('đã nhập tay', () => {
  it('hiện nhãn chữ “đã nhập tay” chứ không chỉ đổi màu (FR-15, NFR-USA-06)', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} override={11} onOverrideChange={vi.fn()} />);

    expect(screen.getByText('đã nhập tay')).not.toBeNull();
    expect((screen.getByLabelText('WACC') as HTMLInputElement).value).toBe('11');
  });

  it('bỏ dòng “↳ CAPM” vì giá trị nay là của người dùng, không phải của CAPM', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} override={11} onOverrideChange={vi.fn()} />);
    expect(screen.queryByText('↳ CAPM')).toBeNull();
  });

  it('bấm Hoàn tác thì bỏ ghi đè, quay lại nhận tự động', async () => {
    const onOverrideChange = vi.fn();
    render(
      <LinkedInput
        spec={wacc}
        upstream={capmOk}
        override={11}
        onOverrideChange={onOverrideChange}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Nhận tự động' }));

    expect(onOverrideChange).toHaveBeenCalledWith(undefined);
  });

  it('sửa thẳng trên ô cũng tính là ghi đè, không bắt bấm nút trước', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={onOverrideChange} />);

    const input = screen.getByLabelText('WACC');
    await userEvent.clear(input);
    await userEvent.type(input, '9,5');
    await userEvent.tab();

    expect(onOverrideChange).toHaveBeenCalledWith(9.5);
  });
});

describe('thượng nguồn lỗi — cảnh báo kế thừa', () => {
  it('hiện lý do và gợi ý sửa thay vì âm thầm cho ra số (FR-15)', () => {
    render(<LinkedInput spec={wacc} upstream={capmLoi} onOverrideChange={vi.fn()} />);

    expect(screen.getByText(/Cần ít nhất 60 phiên giá/)).not.toBeNull();
    expect(screen.getByText(/Nạp bộ số liệu mẫu/)).not.toBeNull();
  });

  it('ô vẫn hiện mặc định của biến và gõ đè lên được — đó là lối thoát WF-15 hứa với người dùng', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmLoi} onOverrideChange={onOverrideChange} />);

    const input = screen.getByLabelText('WACC') as HTMLInputElement;
    expect(input.value).toBe('12,1');

    await userEvent.clear(input);
    await userEvent.type(input, '9');
    await userEvent.tab();

    expect(onOverrideChange).toHaveBeenCalledWith(9);
  });

  it('CA THEN CHỐT — ghi đè xong thì thoát hẳn cảnh báo kế thừa', () => {
    render(<LinkedInput spec={wacc} upstream={capmLoi} override={11} onOverrideChange={vi.fn()} />);

    expect(screen.queryByText(/Cần ít nhất 60 phiên giá/)).toBeNull();
    expect(screen.getByText('đã nhập tay')).not.toBeNull();
    expect((screen.getByLabelText('WACC') as HTMLInputElement).value).toBe('11');
  });

  it('không lọt NaN ra màn dù chưa có giá trị nào dùng được', () => {
    const { container } = render(
      <LinkedInput spec={wacc} upstream={capmLoi} onOverrideChange={vi.fn()} />,
    );

    expect(container.textContent ?? '').not.toContain('NaN');
    expect(container.textContent ?? '').not.toContain('undefined');
  });
});

describe('ô nhập tay — không móc nối', () => {
  it('không có nút Nhận tự động — không có gì để hoàn tác', () => {
    render(<LinkedInput spec={wacc} onOverrideChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Nhận tự động' })).toBeNull();
  });
});
