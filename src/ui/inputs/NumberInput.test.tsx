// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VariableSpec } from '@/application';

import { NumberInput } from './NumberInput';

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

const growth: VariableSpec = {
  key: 'g',
  label: { vi: 'Tăng trưởng g', en: 'Growth g' },
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

  /*
   * Chạm vào ô rồi bấm ra chỗ khác KHÔNG được đổi con số. Trước đây `onFocus` đặt draft bằng
   * `String(value)`, nên 100,449 thành chuỗi '100.449' — chuỗi ấy đọc ngược lại là 100449 vì
   * trông y hệt ngăn nghìn, và người dùng mất giá gấp nghìn lần mà không đụng phím nào.
   */
  it('chạm vào ô có số lẻ rồi rời ra không làm giá nhân lên nghìn lần', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={100.449} onChange={onChange} />);

    await userEvent.click(box());
    expect(box().value).toBe('100,449');

    await userEvent.tab();
    expect(onChange).toHaveBeenLastCalledWith(100.449);
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

/*
 * Chủ dự án chốt 14/09/2026: *"tất cả các ô nhập số liệu … không được có sự xuất hiện của chữ
 * cái"*. Chặn ở `onChange` chứ không bằng `type="number"` — lý do đầy đủ ở docblock của component.
 * Đây cũng là chỗ duy nhất che `filtered-change.ts`, nên ca con trỏ nằm ở đây.
 */
describe('chỉ nhận ký tự của một con số', () => {
  it('gõ chữ cái thì ô không nhận, con số đang có vẫn nguyên', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={92_000} onChange={onChange} />);

    await userEvent.click(box());
    await userEvent.type(box(), 'abc');

    expect(box().value).toBe('92000');
    // Chữ rụng trước khi tới `parseViNumber`, nên mọi lượt báo lên đều là giá trị CŨ — không có
    // lượt nào mang `null`, NaN hay 0 (FR-06).
    for (const [value] of onChange.mock.calls) expect(value).toBe(92_000);
  });

  it('gõ lẫn chữ và số thì chỉ phần số lọt vào ô', async () => {
    render(<NumberInput spec={price} value={0} onChange={vi.fn()} />);

    await userEvent.clear(box());
    await userEvent.type(box(), '1a2b3');

    expect(box().value).toBe('123');
  });

  it('dán chuỗi lẫn chữ thì giữ lại phần số: “92.000 ₫” ra “92.000”', async () => {
    const onChange = vi.fn();
    render(<NumberInput spec={price} value={0} onChange={onChange} />);

    await userEvent.click(box());
    await userEvent.clear(box());
    await userEvent.paste('92.000 ₫');

    expect(box().value).toBe('92.000');
    expect(onChange).toHaveBeenLastCalledWith(92_000);
  });

  it('dán chuỗi toàn chữ thì ô giữ nguyên thứ đang có', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.paste('không có số nào');

    expect(box().value).toBe('92000');
  });

  it('vẫn gõ được đủ lối viết số Việt Nam — dấu phẩy, dấu chấm và bốn kiểu dấu trừ', async () => {
    render(<NumberInput spec={growth} value={0} onChange={vi.fn()} />);
    const g = () => screen.getByLabelText('Tăng trưởng g') as HTMLInputElement;

    for (const chuoi of ['14,3', '1.234,5', '-4', '−4', '–4', '—4']) {
      await userEvent.clear(g());
      await userEvent.type(g(), chuoi);
      expect(g().value, `chuỗi '${chuoi}'`).toBe(chuoi);
    }
  });

  /*
   * Ô là controlled, nên khi ký tự bị loại mà state không đổi thì React ghi lại `value` sau sự
   * kiện và trình duyệt đẩy con trỏ về CUỐI ô — gõ nhầm một chữ ở giữa '92.000' là con trỏ văng
   * ra đuôi. `filterTypedValue()` sinh ra để giữ đúng chỗ ấy.
   */
  it('con trỏ không nhảy về cuối khi ký tự bị loại ở GIỮA chuỗi', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    expect(box().value).toBe('92000');

    await userEvent.type(box(), 'x', { initialSelectionStart: 2, initialSelectionEnd: 2 });

    expect(box().value).toBe('92000');
    expect(box().selectionStart).toBe(2);
  });

  /*
   * Lỗi chủ dự án báo 14/09/2026: *"đang nhập số mà bấm nhầm sau text chữ số thì số trong ô lại bị
   * xóa đi"*. Gõ '100', bấm nhầm 'a' (chữ bị loại ngay), rồi bấm Backspace để xoá chữ vừa nhầm —
   * phím xoá ăn thẳng vào chữ số thật.
   *
   * Với bộ gõ tiếng Việt thì phím xoá ấy TỰ ĐỘNG: Unikey gõ 'a' rồi 's' để ra 'á' bằng cách gửi
   * Backspace rồi chèn 'á'. Mỗi chữ có dấu là một chữ số biến mất — ca `mô phỏng bộ gõ` dưới đây
   * ghim đúng chuỗi thao tác đó.
   */
  it('bấm nhầm chữ rồi bấm xoá: phím xoá ăn vào chữ vừa nhầm, KHÔNG ăn vào chữ số', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.clear(box());
    await userEvent.type(box(), '100');
    await userEvent.type(box(), 'a');
    expect(box().value).toBe('100');

    await userEvent.type(box(), '{Backspace}');
    expect(box().value).toBe('100');

    // Lần xoá thứ hai mới là xoá thật — chuỗi "vừa gõ nhầm" đã tiêu ở lần đầu.
    await userEvent.type(box(), '{Backspace}');
    expect(box().value).toBe('10');
  });

  it('bấm nhầm hai chữ thì nuốt đúng hai phím xoá, không hơn', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.clear(box());
    await userEvent.type(box(), '100ab');
    expect(box().value).toBe('100');

    await userEvent.type(box(), '{Backspace}{Backspace}');
    expect(box().value).toBe('100');

    await userEvent.type(box(), '{Backspace}');
    expect(box().value).toBe('10');
  });

  it('mô phỏng bộ gõ tiếng Việt: gõ chữ có dấu không làm mất chữ số nào', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.clear(box());
    await userEvent.type(box(), '100');

    /* Đúng thứ Unikey gửi khi người dùng gõ 'a' rồi 's': ký tự, phím xoá, rồi ký tự có dấu. */
    for (const _lan of [1, 2, 3]) {
      await userEvent.type(box(), 'a');
      await userEvent.type(box(), '{Backspace}');
      await userEvent.type(box(), 'á');
    }

    expect(box().value).toBe('100');
  });

  it('phím xoá vẫn xoá bình thường khi không có ký tự nào vừa bị loại', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.clear(box());
    await userEvent.type(box(), '100');
    await userEvent.type(box(), '{Backspace}');

    expect(box().value).toBe('10');
  });

  /* Dời con trỏ đi rồi thì phím xoá không còn là "xoá chữ vừa nhầm" nữa. */
  it('bấm phím khác rồi mới xoá thì phím xoá ăn thật', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.clear(box());
    await userEvent.type(box(), '100a');
    await userEvent.type(box(), '{ArrowLeft}{ArrowRight}');
    await userEvent.type(box(), '{Backspace}');

    expect(box().value).toBe('10');
  });

  it('con trỏ đứng đúng sau phần số vừa dán ở giữa chuỗi', async () => {
    render(<NumberInput spec={price} value={92_000} onChange={vi.fn()} />);

    await userEvent.click(box());
    await userEvent.type(box(), '4a', { initialSelectionStart: 2, initialSelectionEnd: 2 });

    // '92' + '4' + '000', con trỏ ngay sau số 4 vừa gõ chứ không nhảy ra đuôi.
    expect(box().value).toBe('924000');
    expect(box().selectionStart).toBe(3);
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
