// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

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

  /*
   * ĐẢO ngày 13/10/2026. Ca cũ ở đây là "bấm một gợi ý là điền tên đó vào ô": dưới ô tên có một
   * hàng chip bày mọi cái tên tự sinh. Chủ dự án: *"bỏ phần gợi ý tên khi lưu công thức đi, để gọn
   * gàng hơn"*. Giữ ca ở đúng chỗ cũ với khẳng định ngược lại, để hàng chip quay về là một quyết
   * định chứ không phải một lần lỡ tay.
   *
   * Việc ĐIỀN SẴN gợi ý đầu tiên vào ô thì còn — ca ngay trên và ca "gợi ý tự né tên đã có" gác nó.
   */
  it('không còn hàng "Gợi ý tên" dưới ô tên — sheet chỉ có ô tên và nút Lưu', () => {
    renderSheet({ code: 'HPG' });

    expect(screen.queryByText('Gợi ý tên')).toBeNull();
    // Hai cái tên mà hàng chip cũ từng bày bên cạnh gợi ý đầu tiên.
    expect(screen.queryByRole('button', { name: 'P/E · 12,3 lần' })).toBeNull();
    expect(screen.queryByRole('button', { name: /HPG · P\/E/ })).toBeNull();
    // Chip cũ là nút bật/tắt; không còn nút nào mang trạng thái ấy trong sheet.
    expect(document.querySelectorAll('dialog [aria-pressed]')).toHaveLength(0);
  });

  /*
   * ĐẢO ngày 15/10/2026: phụ đề dưới tiêu đề và dòng gợi ý dưới ô tên. Chủ dự án gọi cả hai là
   * "text dư thừa" và xoá. Ca giữ hai câu không quay lại — viết chữ ra chứ không đọc qua `t()`,
   * vì hai khoá đã bỏ khỏi từ điển. Ô tên vẫn tìm được theo nhãn (`nameField()`).
   */
  it('không còn phụ đề "Giữ lại bộ số liệu…" và dòng gợi ý "Tên hiện ở tab…"', () => {
    renderSheet({ code: 'HPG' });

    expect(screen.queryByText(/Giữ lại bộ số liệu/)).toBeNull();
    expect(screen.queryByText(/Tên hiện ở tab/)).toBeNull();
    expect(nameField().getAttribute('aria-describedby') ?? '').not.toMatch(/hint/);
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
    // 'HPG · P/E' nay chỉ còn ở khối tóm tắt (ô tên giữ nó trong `value`, không phải chữ trên màn):
    // `getByText` ném lỗi nếu khớp hơn một chỗ, nên nó gác luôn việc hàng chip không quay lại.
    expect(screen.getByText('HPG · P/E').closest('button')).toBeNull();
  });
});

/*
 * Dưới 1024px dòng tóm tắt và ô tên hạ một bậc (chủ dự án, 15/10/2026). jsdom không áp CSS Module,
 * nên đọc nguồn như `BottomSheet.test.ts`. Chữ trong ô dừng ở 16px: dưới mức ấy iOS phóng trang khi
 * chạm vào ô — ca này chặn ai đó hạ thêm một bậc.
 */
describe('SaveCalcSheet — chữ nhỏ một bậc trên điện thoại', () => {
  it('tên 12px, kết quả 14px, nhãn 12px, chữ trong ô 16px — chỉ dưới 1024px', () => {
    // `process.cwd()` chứ không `import.meta.url`: ở môi trường jsdom đó không phải một URL `file:`.
    const css = readFileSync(
      join(process.cwd(), 'src/ui/sheets/SaveCalcSheet.module.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');
    const khoi = /@media \(max-width: 1023\.98px\)\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
    const co = (selector: string): string | undefined => {
      const dau = khoi.indexOf(`${selector} {`);
      return dau === -1 ? undefined : /font-size:\s*([^;]+);/.exec(khoi.slice(dau))?.[1];
    };

    expect(co('.formula')).toBe('var(--text-xs)');
    expect(co('.result')).toBe('var(--text-sm)');
    expect(co('.nameField label')).toBe('var(--text-xs)');
    expect(co('.nameField input')).toBe('var(--text-base)');
  });

  it('ô tên mang lớp `.nameField` để luật trên chạm được tới nó', () => {
    renderSheet();
    expect(nameField().closest('div[class*="nameField"]')).not.toBeNull();
  });
});
