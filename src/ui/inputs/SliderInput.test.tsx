// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VariableSpec } from '@/application';

import { SliderInput } from './SliderInput';

afterEach(cleanup);

/** Lãi suất kiểu WF-16: bước 0,1% — thứ chặn người dùng gõ 12,37%. */
const RATE: VariableSpec = {
  key: 'rate',
  label: { vi: 'Lãi suất', en: 'Interest rate' },
  unit: '%',
  type: 'slider',
  level: 'basic',
  defaultValue: 12,
  min: 0,
  max: 30,
  step: 0.1,
};

/** Khoản vay của `tra-gop-nien-kim`: bước 10.000.000 ₫ — ca cực đoan nhất của cùng vấn đề. */
const AMOUNT: VariableSpec = {
  key: 'amount',
  label: { vi: 'Số tiền vay', en: 'Loan amount' },
  unit: '₫',
  type: 'slider',
  level: 'basic',
  defaultValue: 500_000_000,
  min: 10_000_000,
  max: 2_000_000_000,
  step: 10_000_000,
};

function draw(spec: VariableSpec, value: number, level: 'basic' | 'advanced' = 'advanced') {
  const onChange = vi.fn();
  const view = render(<SliderInput spec={spec} value={value} onChange={onChange} mode={level} />);
  return { ...view, onChange };
}

const box = (): HTMLInputElement => screen.getByRole('textbox') as HTMLInputElement;
const slider = (): HTMLInputElement => screen.getByRole('slider') as HTMLInputElement;

// Tắt cùng đợt tắt lối gõ thẳng vào con số — xem GO_SO_TRUC_TIEP ở SliderInput.tsx.
describe.skip('SliderInput — con số cạnh nhãn gõ được', () => {
  it('có hai điều khiển cùng một tên: một thanh trượt và một ô nhập', () => {
    draw(RATE, 12);

    expect(slider()).not.toBeNull();
    expect(box()).not.toBeNull();
    // Cùng tên vì chúng sửa cùng một con số; phân biệt bằng VAI, không bằng nhãn.
    expect(screen.getAllByLabelText('Lãi suất')).toHaveLength(2);
  });

  it('hiện giá trị đã định dạng kèm đơn vị khi không có tiêu điểm', () => {
    draw(AMOUNT, 500_000_000);

    expect(box().value).toBe('500.000.000');
    expect(screen.getByText('₫')).not.toBeNull();
  });

  it('vào ô thì bỏ dấu ngăn nghìn cho dễ sửa', async () => {
    draw(AMOUNT, 500_000_000);

    await userEvent.click(box());

    expect(box().value).toBe('500000000');
  });
});

/*
 * ── Ca chính của cả file ──────────────────────────────────────────────────────────────────────
 *
 * `step` là độ phân giải của NGÓN TAY, không phải luật của con số. Trước đợt này chỗ này là một
 * `<output>` chỉ để đọc, nên 97 biến kiểu slider trên toàn Registry chỉ nhập được bằng cách kéo —
 * và kéo thì bám lưới bước. Người dùng lấy số thật của một mã đưa vào thì không đưa được.
 */
// Tắt cùng đợt tắt lối gõ thẳng vào con số — xem GO_SO_TRUC_TIEP ở SliderInput.tsx.
describe.skip('SliderInput — gõ KHÔNG bám lưới bước', () => {
  it('gõ 12,37 với bước 0,1 thì giữ đúng 12,37', async () => {
    const { onChange } = draw(RATE, 12);

    await userEvent.clear(box());
    await userEvent.type(box(), '12,37');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(12.37);
  });

  it('gõ khoản vay 1.234.000.000 ₫ với bước 10 triệu thì giữ nguyên từng đồng', async () => {
    const { onChange } = draw(AMOUNT, 500_000_000);

    await userEvent.clear(box());
    await userEvent.type(box(), '1234000000');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(1_234_000_000);
  });

  it('Enter cũng chốt được, không bắt phải rời ô', async () => {
    const { onChange } = draw(RATE, 12);

    await userEvent.clear(box());
    await userEvent.type(box(), '7,25{Enter}');

    expect(onChange).toHaveBeenCalledWith(7.25);
  });

  it('nhận dấu phẩy thập phân kiểu Việt', async () => {
    const { onChange } = draw(RATE, 12);

    await userEvent.clear(box());
    await userEvent.type(box(), '9,5');
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(9.5);
  });

  /*
   * Miền thì VẪN là luật. `min`/`max` là chặn nhập sai — âm lãi suất hay vay hai nghìn tỷ đều
   * không có nghĩa — nên gõ ra ngoài miền vẫn bị kẹp, chỉ bước là được bỏ qua.
   */
  it('gõ ra ngoài miền thì kẹp về min hoặc max, không nhận bừa', async () => {
    const { onChange: low } = draw(RATE, 12);
    await userEvent.clear(box());
    await userEvent.type(box(), '-5{Enter}');
    expect(low).toHaveBeenCalledWith(0);

    cleanup();

    const { onChange: high } = draw(RATE, 12);
    await userEvent.clear(box());
    await userEvent.type(box(), '999{Enter}');
    expect(high).toHaveBeenCalledWith(30);
  });

  it('bỏ trống rồi rời ô thì về giá trị mặc định của biến, không thành 0 (FR-06)', async () => {
    // Bắt đầu từ 20 chứ không từ chính giá trị mặc định, để thấy được nó có thật sự chuyển về.
    const { onChange } = draw(RATE, 20);

    await userEvent.clear(box());
    await userEvent.tab();

    expect(onChange).toHaveBeenCalledWith(RATE.defaultValue);
  });

  it('gõ lại đúng con số đang có thì không bắn onChange — không dựng lại màn vô ích', async () => {
    const { onChange } = draw(RATE, 12);

    await userEvent.click(box());
    await userEvent.tab();

    expect(onChange).not.toHaveBeenCalled();
  });
});

/*
 * Thẻ `range` của HTML tự làm tròn `value` về bội của `step`. Để `step="0.1"` mà giá trị là 12,37
 * thì nút kéo hiện ở 12,4 trong khi phép tính chạy 12,37 — hai chỗ trên một hàng nói hai số.
 */
describe('SliderInput — thanh trượt không được nói khác ô nhập', () => {
  it('giá trị đúng lưới thì giữ nguyên bước, để phím mũi tên và cú kéo nhảy theo bước', () => {
    draw(RATE, 12);

    expect(slider().getAttribute('step')).toBe('0.1');
    expect(slider().value).toBe('12');
  });

  it('giá trị lệch lưới thì hạ step xuống "any" để nút kéo hiện đúng chỗ', () => {
    draw(RATE, 12.37);

    expect(slider().getAttribute('step')).toBe('any');
    expect(slider().value).toBe('12.37');
  });

  it('kéo thì VẪN bám lưới bước — hành vi cũ giữ nguyên', () => {
    const { onChange } = draw(RATE, 12);

    /*
     * `userEvent` không kéo được thanh trượt. Phải dùng `fireEvent.change` chứ không gán `.value`
     * rồi tự bắn `Event`: React theo dõi giá trị qua bộ đổi thuộc tính riêng, nên gán tay thì nó
     * coi là không có gì đổi và bỏ qua sự kiện.
     */
    fireEvent.change(slider(), { target: { value: '12.34' } });

    expect(onChange).toHaveBeenCalledWith(12.3);
  });
});

describe('SliderInput — ô khoá ở chế độ Cơ bản', () => {
  const ADVANCED: VariableSpec = { ...RATE, level: 'advanced' };

  /*
   * Vế "không gõ được" bỏ đi cùng đợt tắt lối gõ thẳng (xem GO_SO_TRUC_TIEP ở SliderInput.tsx) —
   * con số nay là <output>, không còn ô nhập nào để thử gõ. Vế "không kéo được" thì KHÔNG liên
   * quan tới đợt ấy và vẫn là điều phải giữ, nên ca kiểm ở lại với đúng phần đó.
   */
  it('biến nâng cao trong chế độ Cơ bản thì không kéo được', () => {
    draw(ADVANCED, 12, 'basic');

    expect(slider().disabled).toBe(true);
  });

  it('có nhãn chữ "nâng cao" chứ không chỉ mờ đi (NFR-USA-06)', () => {
    draw(ADVANCED, 12, 'basic');

    expect(screen.getByText('nâng cao')).not.toBeNull();
  });

  // Tắt cùng đợt tắt lối gõ thẳng vào con số — xem GO_SO_TRUC_TIEP ở SliderInput.tsx.
  it.skip('cùng biến ấy ở chế độ Nâng cao thì gõ được', async () => {
    const { onChange } = draw(ADVANCED, 12, 'advanced');

    expect(box().readOnly).toBe(false);
    await userEvent.clear(box());
    await userEvent.type(box(), '3,75{Enter}');

    expect(onChange).toHaveBeenCalledWith(3.75);
  });
});
