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

  it('có nút Ghi đè, chưa có nút Hoàn tác', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Ghi đè' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
  });

  it('có lối mở công thức thượng nguồn để sửa tận gốc', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={vi.fn()} />);

    const link = screen.getByRole('link', { name: 'Mở công thức nguồn' });
    // Chỉ kiểm link trỏ đúng công thức. Dấu '/' cuối KHÔNG kiểm ở đây: test không nạp
    // next.config.mjs nên <Link> chuẩn hoá bỏ dấu này, khác với bản build thật đang đặt
    // trailingSlash: true. Luật dấu '/' cuối do routes.test.ts canh.
    expect(link.getAttribute('href')).toContain('/cong-thuc/capm');
  });

  it('bấm Ghi đè thì bắt đầu từ giá trị đang hiện, không bắt gõ lại từ đầu', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={onOverrideChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ghi đè' }));

    expect(onOverrideChange).toHaveBeenCalledWith(14.3);
  });
});

describe('đã ghi đè', () => {
  it('hiện nhãn chữ “đã ghi đè” chứ không chỉ đổi màu (FR-15, NFR-USA-06)', () => {
    render(<LinkedInput spec={wacc} upstream={capmOk} override={11} onOverrideChange={vi.fn()} />);

    expect(screen.getByText('đã ghi đè')).not.toBeNull();
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

    await userEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));

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

  it('vẫn mở nút Ghi đè — đó là lối thoát WF-15 hứa với người dùng', () => {
    render(<LinkedInput spec={wacc} upstream={capmLoi} onOverrideChange={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Ghi đè' })).not.toBeNull();
  });

  it('bấm Ghi đè khi không có số nào để lấy thì bắt đầu từ mặc định của biến', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmLoi} onOverrideChange={onOverrideChange} />);

    await userEvent.click(screen.getByRole('button', { name: 'Ghi đè' }));

    expect(onOverrideChange).toHaveBeenCalledWith(12.1);
  });

  it('CA THEN CHỐT — ghi đè xong thì thoát hẳn cảnh báo kế thừa', () => {
    render(<LinkedInput spec={wacc} upstream={capmLoi} override={11} onOverrideChange={vi.fn()} />);

    expect(screen.queryByText(/Cần ít nhất 60 phiên giá/)).toBeNull();
    expect(screen.getByText('đã ghi đè')).not.toBeNull();
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
  it('không có nút Ghi đè lẫn Hoàn tác, không có dòng ghi nguồn', () => {
    render(<LinkedInput spec={wacc} onOverrideChange={vi.fn()} />);

    expect(screen.queryByRole('button', { name: 'Ghi đè' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Mở công thức nguồn' })).toBeNull();
  });
});
