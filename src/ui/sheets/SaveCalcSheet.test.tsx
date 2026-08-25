// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { SaveCalcSheet } from './SaveCalcSheet';

/**
 * jsdom chưa cài đặt <dialog>.showModal() — cùng bản vá của `ExportSheet.test.tsx`.
 */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(cleanup);

/** 25/08/2026 lúc 10 giờ sáng giờ địa phương. */
const SAVED_AT = new Date(2026, 7, 25, 10, 0, 0).getTime();

/** Ô tên. Ép kiểu để đọc `.value` — repo không cài `@testing-library/jest-dom`. */
function nameField(): HTMLInputElement {
  return screen.getByLabelText('Đặt tên cho phép tính') as HTMLInputElement;
}

function renderSheet(overrides: Partial<Parameters<typeof SaveCalcSheet>[0]> = {}) {
  const onSave = vi.fn(() => true);
  render(
    <SaveCalcSheet
      open
      onClose={() => undefined}
      formulaName="P/E"
      resultText="12,3 lần"
      existingNames={[]}
      full={false}
      hasResult
      savedAt={SAVED_AT}
      onSave={onSave}
      {...overrides}
    />,
  );
  return { onSave };
}

describe('SaveCalcSheet', () => {
  it('điền sẵn gợi ý đầu tiên vào ô tên', () => {
    renderSheet({ code: 'HPG' });
    expect(nameField().value).toBe('HPG · P/E');
  });

  it('bấm một gợi ý là điền tên đó vào ô', async () => {
    renderSheet({ code: 'HPG' });

    await userEvent.click(screen.getByRole('button', { name: 'P/E · 12,3 lần' }));
    expect(nameField().value).toBe('P/E · 12,3 lần');
  });

  it('lưu đúng cái tên đang có trong ô', async () => {
    const { onSave } = renderSheet({ code: 'HPG' });

    await userEvent.click(screen.getByRole('button', { name: 'Lưu vào danh mục' }));
    expect(onSave).toHaveBeenCalledWith('HPG · P/E');
    expect(screen.getByText(/Đã lưu vào Danh mục/)).not.toBeNull();
  });

  it('tên rỗng thì không lưu và nói rõ lý do', async () => {
    const { onSave } = renderSheet();

    await userEvent.clear(nameField());
    await userEvent.click(screen.getByRole('button', { name: 'Lưu vào danh mục' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Đặt một cái tên trước đã/)).not.toBeNull();
  });

  it('trùng tên đã có thì chặn, kể cả khi khác hoa thường', async () => {
    const { onSave } = renderSheet({ existingNames: ['đã có rồi'] });

    const field = nameField();
    await userEvent.clear(field);
    await userEvent.type(field, 'Đã Có Rồi');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu vào danh mục' }));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/Đã có một phép tính tên này/)).not.toBeNull();
  });

  it('gợi ý tự né tên đã có, nên bấm Lưu ngay là được', async () => {
    const { onSave } = renderSheet({ code: 'HPG', existingNames: ['HPG · P/E'] });

    expect(nameField().value).toBe('HPG · P/E (2)');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu vào danh mục' }));
    expect(onSave).toHaveBeenCalledWith('HPG · P/E (2)');
  });

  /*
   * Ca quan trọng nhất của sheet này: một kết quả lỗi mà lưu được sẽ nằm ở tab Danh mục dưới
   * một cái tên do chính người dùng đặt, ở nơi không có ô nhập nào để nhìn ra nguyên nhân.
   */
  it('kết quả đang lỗi thì không lưu được và nói rõ vì sao', async () => {
    const { onSave } = renderSheet({ hasResult: false, resultText: '—, — lần' });

    expect(screen.getByText(/Kết quả đang báo lỗi/)).not.toBeNull();
    expect(
      (screen.getByRole('button', { name: 'Lưu vào danh mục' }) as HTMLButtonElement).disabled,
    ).toBe(true);

    await userEvent.click(screen.getByRole('button', { name: 'Lưu vào danh mục' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('kho đã đầy thì chặn và chỉ cách gỡ', () => {
    renderSheet({ full: true });

    expect(screen.getByText(/Đã lưu đủ 30 phép tính/)).not.toBeNull();
    expect(
      (screen.getByRole('button', { name: 'Lưu vào danh mục' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  it('ghi hỏng thì nói ra, không đóng lại như đã lưu xong', async () => {
    render(
      <SaveCalcSheet
        open
        onClose={() => undefined}
        formulaName="P/E"
        resultText="12,3 lần"
        existingNames={[]}
        full={false}
        hasResult
        savedAt={SAVED_AT}
        onSave={() => false}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Lưu vào danh mục' }));

    expect(screen.getByRole('alert').textContent).toMatch(/Chưa lưu được/);
    expect(screen.queryByText(/Đã lưu vào Danh mục/)).toBeNull();
  });

  it('bày kết quả ngay trong sheet — sheet che mất khối Kết quả ở màn ngoài', () => {
    renderSheet({ code: 'HPG' });

    expect(screen.getByText('12,3 lần')).not.toBeNull();
    // 'HPG · P/E' xuất hiện hai chỗ: khối tóm tắt và một chip gợi ý. Khối tóm tắt là chỗ
    // KHÔNG bấm được — tìm đúng nó thay vì đếm số lần khớp.
    const summary = screen
      .getAllByText('HPG · P/E')
      .find((node) => node.closest('button') === null);
    expect(summary).not.toBeUndefined();
  });
});
