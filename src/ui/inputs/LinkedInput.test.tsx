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

  /*
   * ── Nhìn một ô KHÔNG phải là ghi đè nó ────────────────────────────────────────────────────
   *
   * Lỗi thật, chủ dự án chụp màn ngày 29/09/2026. `NumberInput.onBlur` từng chốt giá trị vô
   * điều kiện, mà ở đây mọi lượt `onChange` đều được hiểu là "người dùng ghi đè" — nên chỉ cần
   * bấm vào ô để đọc cho rõ rồi bấm ra chỗ khác là ô bị dán nhãn "đã nhập tay" và ĐỨT khỏi CAPM.
   * Sau đó sửa beta ở trên thì con số này không đổi theo nữa, và không dòng nào trên màn nói vì
   * sao. Đó là mất liên kết dữ liệu chứ không phải phiền phức về nhãn.
   *
   * Ghi đè phải là một hành động có chủ ý: gõ vào ô. Ca ghim đúng ranh giới ấy.
   */
  it('chạm vào ô rồi rời ra KHÔNG biến nó thành ô nhập tay', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={onOverrideChange} />);

    await userEvent.click(screen.getByLabelText('WACC'));
    await userEvent.tab();

    expect(onOverrideChange).not.toHaveBeenCalled();
    expect(screen.queryByText('đã nhập tay')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Nhận tự động' })).toBeNull();
    // Và con số vẫn là của CAPM, không bị chốt lại thành bản đã làm tròn.
    expect((screen.getByLabelText('WACC') as HTMLInputElement).value).toBe('14,3');
  });

  /*
   * Nửa còn lại của ranh giới: gõ thật thì PHẢI ghi đè. Không có ca này thì cờ `edited` ở
   * `NumberInput` có thể bị siết tới mức không còn ghi đè được nữa mà không ai hay.
   */
  it('gõ vào ô thì vẫn ghi đè như cũ', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={onOverrideChange} />);

    const o = screen.getByLabelText('WACC');
    await userEvent.clear(o);
    await userEvent.type(o, '9');
    await userEvent.tab();

    expect(onOverrideChange).toHaveBeenLastCalledWith(9);
  });

  /*
   * ── Gõ một phím KHÔNG LỌT được cũng không được tính là ghi đè ─────────────────────────────
   *
   * Lỗ hổng tự tìm ra khi rà lại đợt sửa 29/09/2026, và đường đi thật KHÔNG phải chỗ ngỡ ban
   * đầu. Chữ cái bị `keepViNumberChars()` lọc sạch nên chuỗi sau khi lọc giống hệt chuỗi trước
   * đó — nhưng `NumberInput` có HAI đường gọi `onChange` lên trên, và bản vá đầu chỉ bịt một:
   *
   * 1. Lượt SỐNG THEO TAY GÕ (`if (parsed !== null) onChange(parsed)`, chạy ngay trong sự kiện
   *    gõ) — đây mới là đường thật gây lỗi. Chuỗi không đổi thì số đọc ra vẫn là số CŨ, mà cửa
   *    cũ chỉ hỏi "có ra số không", không hỏi "số có đổi không", nên `onChange` NỔ NGAY LÚC GÕ,
   *    trước cả khi rời ô — cờ "đã gõ" ở dưới chưa kịp có việc để làm.
   * 2. Lượt CHỐT lúc `onBlur`, gác bằng cờ `edited` — đúng chỗ bản vá đầu nhắm tới, nhưng nó chỉ
   *    là lớp phòng thủ THỨ HAI, không phải chỗ lỗi thật lộ ra trong ca kiểm này.
   *
   * Ca dưới đây kiểm CẢ HAI mốc — ngay sau khi gõ (bắt lượt 1) và sau khi rời ô (bắt lượt 2) —
   * nên một trong hai đường có tái phát thì ca này bắt được, không cần biết đường nào.
   */
  it('gõ một chữ cái bị lọc sạch KHÔNG cắt liên kết CAPM, ở cả lượt gõ lẫn lượt rời ô', async () => {
    const onOverrideChange = vi.fn();
    render(<LinkedInput spec={wacc} upstream={capmOk} onOverrideChange={onOverrideChange} />);

    await userEvent.type(screen.getByLabelText('WACC'), 'a');
    expect(onOverrideChange).not.toHaveBeenCalled();

    await userEvent.tab();
    expect(onOverrideChange).not.toHaveBeenCalled();
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
