// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { PreferencesProvider } from '@/application/preferences-context';

import { DateCell, DateField } from './DateInput';

afterEach(cleanup);

/*
 * Ngày 3 tháng 10 năm 2026 — đúng ngày chủ dự án chụp (13/10/2026): cột "Ngày mua" in
 * `03/10/2026`, ô sửa in `10/03/2026`. Loại ngày mà đảo ngày với tháng vẫn ra một ngày có thật.
 */
const ISO = '2026-10-03';
const CHU = '03/10/2026';

/** Nơi gọi tối thiểu: cất đúng thứ `onChange` đưa lên, và phơi nó ra để ca kiểm đọc. */
function Khung({ dau = '', loai = 'field' }: { dau?: string; loai?: 'field' | 'cell' }) {
  const [value, setValue] = useState(dau);
  return (
    <PreferencesProvider>
      {loai === 'field' ? (
        <DateField label="Ngày mua" value={value} onChange={setValue} />
      ) : (
        <DateCell ariaLabel="Dòng 1 · Ngày" value={value} onChange={setValue} />
      )}
      <output data-testid="gia-tri">{value}</output>
    </PreferencesProvider>
  );
}

function giaTri(): string {
  return screen.getByTestId('gia-tri').textContent ?? '';
}

describe.each([
  ['DateField — ô ngày của form', 'field', 'Ngày mua'],
  ['DateCell — ô ngày của bảng', 'cell', 'Dòng 1 · Ngày'],
] as const)('%s', (_ten, loai, nhan) => {
  const o = (): HTMLInputElement => screen.getByLabelText(nhan) as HTMLInputElement;

  it('là ô chữ in ngày/tháng/năm, mở bàn phím số', () => {
    render(<Khung dau={ISO} loai={loai} />);

    expect(o().type).toBe('text');
    expect(o().value).toBe(CHU);
    expect(o().getAttribute('inputmode')).toBe('numeric');
    expect(o().getAttribute('placeholder')).toBe('dd/mm/yyyy');
  });

  it('gõ đủ ngày/tháng/năm thì nơi gọi nhận ISO, còn ô vẫn in đúng chữ vừa gõ', async () => {
    render(<Khung loai={loai} />);

    await userEvent.type(o(), CHU);

    expect(giaTri()).toBe(ISO);
    expect(o().value).toBe(CHU);
  });

  it('gõ dở thì nơi gọi nhận chính chữ đang gõ — không phải ô trống, không phải một ngày đoán', async () => {
    render(<Khung loai={loai} />);

    await userEvent.type(o(), '03/1');

    expect(giaTri()).toBe('03/1');
  });

  /* Đổi chữ dưới tay người đang gõ là con trỏ nhảy; mọi lối viết khác chờ tới lúc rời ô. */
  it('không chèn dấu giữa lúc gõ; rời ô mới chuẩn hoá', async () => {
    render(<Khung loai={loai} />);

    await userEvent.type(o(), '03102026');
    expect(o().value).toBe('03102026');

    await userEvent.tab();

    expect(o().value).toBe(CHU);
    expect(giaTri()).toBe(ISO);
  });

  it('rời ô với một lối viết khác vẫn ra đúng ngày ấy', async () => {
    for (const cach of ['3/10/2026', '03-10-2026', '2026-10-03']) {
      const { unmount } = render(<Khung loai={loai} />);
      await userEvent.type(o(), cach);
      await userEvent.tab();

      expect(o().value, cach).toBe(CHU);
      expect(giaTri(), cach).toBe(ISO);
      unmount();
    }
  });

  it('xoá bớt một ký tự của ngày đang in thì ô KHÔNG tự điền lại', async () => {
    render(<Khung dau={ISO} loai={loai} />);

    await userEvent.type(o(), '{Backspace}');

    expect(o().value).toBe('03/10/202');
    expect(giaTri()).toBe('03/10/202');
  });

  it('chữ cái không vào được ô', async () => {
    render(<Khung loai={loai} />);

    await userEvent.type(o(), 'ngày 3');

    expect(o().value).toBe('3');
  });

  it('ngày không có trên lịch ở lại nguyên chữ sau khi rời ô, để nơi gọi báo lỗi', async () => {
    render(<Khung loai={loai} />);

    await userEvent.type(o(), '31/02/2026');
    await userEvent.tab();

    expect(o().value).toBe('31/02/2026');
    expect(giaTri()).toBe('31/02/2026');
  });

  /*
   * jsdom không có `showPicker()`, nên ca này giả đúng thứ bảng lịch của trình duyệt làm khi người
   * dùng bấm một ngày: đặt giá trị ISO vào ô `type="date"` tàng hình.
   */
  it('nút lịch: chọn một ngày thì ô chữ in ngày ấy theo ngày/tháng/năm', () => {
    render(<Khung loai={loai} />);

    const nut = screen.getByRole('button', { name: `${nhan} · Chọn ngày trên lịch` });
    expect(nut.getAttribute('title')).toBe('Chọn ngày trên lịch');

    const oLich = nut.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;
    expect(oLich.getAttribute('tabindex')).toBe('-1');
    expect(oLich.getAttribute('aria-hidden')).toBe('true');

    // Bấm nút không được ném lỗi dù trình duyệt không có `showPicker()`.
    fireEvent.click(nut);
    fireEvent.change(oLich, { target: { value: ISO } });

    expect(o().value).toBe(CHU);
    expect(giaTri()).toBe(ISO);
  });

  it('ô lịch tàng hình chỉ nhận ngày có thật; chuỗi gõ dở thì nó trống', () => {
    render(<Khung dau="03/1" loai={loai} />);

    const nut = screen.getByRole('button', { name: `${nhan} · Chọn ngày trên lịch` });
    const oLich = nut.parentElement?.querySelector('input[type="date"]') as HTMLInputElement;

    expect(oLich.value).toBe('');
  });
});

describe('DateField — câu lỗi của form', () => {
  it('đi qua đúng đường của primitive Input: aria-invalid và role="alert"', () => {
    render(
      <PreferencesProvider>
        <DateField
          label="Ngày mua"
          value="31/02/2026"
          onChange={() => undefined}
          error="Sai ngày"
        />
      </PreferencesProvider>,
    );

    expect(screen.getByLabelText('Ngày mua').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert').textContent).toBe('Sai ngày');
  });
});
