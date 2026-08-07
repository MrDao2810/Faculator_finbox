// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { DISCLAIMER_VI, ok } from '@/application';
import type { FormulaSpec } from '@/application';

import { ExportSheet } from './ExportSheet';
import { PasteImportSheet } from './PasteImportSheet';
import { PresetSheet } from './PresetSheet';

/**
 * jsdom chưa cài đặt <dialog>.showModal(). Vá hai hàm này để sheet mở ra được — chỉ là
 * hạn chế của môi trường test, trình duyệt thật có sẵn.
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

const PE: FormulaSpec = {
  id: 'pe',
  categoryId: 'fundamentals',
  name: { vi: 'Hệ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
  description: 'Trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
  latex: 'x',
  chartType: 'sensitivity',
  level: 'basic',
  tags: [],
  resultUnit: 'lần',
  variables: [
    {
      key: 'price',
      label: 'Giá thị trường',
      unit: '₫',
      type: 'number',
      defaultValue: 0,
      level: 'basic',
    },
  ],
  explanation: { meaning: 'a', whenToUse: 'b', howToRead: 'c', commonMistakes: 'd' },
  example: { title: 'x', inputs: {}, expected: 1 },
  tests: [],
  source: [{ label: 'CFA Institute' }],
};

describe('ExportSheet — FR-24', () => {
  function open() {
    render(
      <ExportSheet
        open
        onClose={vi.fn()}
        formula={PE}
        output={ok(15.2, 'lần')}
        inputs={{ price: 92_000 }}
      />,
    );
  }

  it('nói rõ miễn trừ không tắt được, đúng câu WF-12', () => {
    open();

    expect(screen.getByText(/Miễn trừ tự động đính kèm/)).not.toBeNull();
    expect(screen.getByText(/Không thể tắt/)).not.toBeNull();
  });

  /*
   * Từ đợt 11b hai tuỳ chọn là CÔNG TẮC chứ không phải ô tick, nên vai trò cần tìm là 'switch'.
   * Điều phải chặn thì không đổi: không được có bất kỳ điều khiển bật/tắt nào cho miễn trừ.
   */
  it('KHÔNG có công tắc nào cho miễn trừ — chỉ hai tuỳ chọn kèm theo', () => {
    open();

    expect(screen.getAllByRole('switch')).toHaveLength(2);
    expect(screen.queryByRole('switch', { name: /miễn trừ/i })).toBeNull();
    // Và cũng không được lén quay lại dạng ô tick.
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
  });

  it('câu miễn trừ nằm sẵn trong vùng in, kể cả khi tắt hết tuỳ chọn', async () => {
    open();

    for (const box of screen.getAllByRole('switch')) {
      await userEvent.click(box);
      expect(box.getAttribute('aria-checked')).toBe('false');
    }

    expect(screen.getByText(DISCLAIMER_VI)).not.toBeNull();
  });

  it('đổi định dạng thì đổi nhãn nút, và trạng thái chọn báo bằng aria-pressed', async () => {
    open();

    expect(screen.getByRole('button', { name: 'Xuất PDF' })).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /PNG/ }));

    expect(screen.getByRole('button', { name: 'Xuất PNG' })).not.toBeNull();
  });
});

describe('PresetSheet — WF-10', () => {
  it('liệt kê bốn mã mẫu và nói rõ số liệu là bản thảo', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} />);

    expect(screen.getByText('FPT')).not.toBeNull();
    expect(screen.getByText('Tập đoàn Hoà Phát')).not.toBeNull();
    expect(screen.getByText(/chưa đối chiếu báo cáo thật/)).not.toBeNull();
  });

  it('hứa rõ với người dùng là nạp xong vẫn sửa được — FR-10', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} />);
    expect(screen.getByText(/vẫn sửa được từng cái một/)).not.toBeNull();
  });

  it('tìm bỏ dấu được, gõ "hoa phat" ra HPG', async () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Tìm mã cổ phiếu'), 'hoa phat');

    expect(screen.getByText('HPG')).not.toBeNull();
    expect(screen.queryByText('FPT')).toBeNull();
  });

  /*
   * Chủ dự án báo: gõ vào ô tìm thì sheet co lại, ô tìm nhảy xuống ngay giữa lúc đang gõ.
   * Hai ca dưới chốt hai mảnh của bản vá. Riêng phần ghim chiều cao bằng số đo thì jsdom
   * không dựng layout nên đo đâu cũng ra 0 — chỗ đó kiểm trên trình duyệt thật.
   */
  it('cảnh báo số liệu bản thảo xét trên cả bộ, không biến mất khi lọc không ra gì', async () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Tìm mã cổ phiếu'), 'khongcoma nao');

    expect(screen.getByText(/Không có mã nào khớp/)).not.toBeNull();
    expect(screen.getByText(/chưa đối chiếu báo cáo thật/)).not.toBeNull();
  });

  it('đóng sheet thì xoá từ khoá, lần mở sau bắt đầu từ danh sách đầy đủ', async () => {
    const onClose = vi.fn();
    const { rerender } = render(<PresetSheet open onClose={onClose} onLoad={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Tìm mã cổ phiếu'), 'hoa phat');
    expect(screen.queryByText('FPT')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(onClose).toHaveBeenCalled();

    rerender(<PresetSheet open={false} onClose={onClose} onLoad={vi.fn()} />);
    rerender(<PresetSheet open onClose={onClose} onLoad={vi.fn()} />);

    expect((screen.getByLabelText('Tìm mã cổ phiếu') as HTMLInputElement).value).toBe('');
    expect(screen.getByText('FPT')).not.toBeNull();
  });

  it('bấm Nạp thì trả preset lên trên rồi đóng sheet', async () => {
    const onLoad = vi.fn();
    const onClose = vi.fn();
    render(<PresetSheet open onClose={onClose} onLoad={onLoad} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'Nạp' })[0] as HTMLElement);

    expect(onLoad).toHaveBeenCalledTimes(1);
    expect(onLoad.mock.calls[0]?.[0]).toMatchObject({ code: 'FPT' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('PasteImportSheet — WF-11', () => {
  it('chưa dán gì thì nút Nạp bị khoá', () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    const button = screen.getByRole('button', { name: /^Nạp/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('dán vào thì đếm ngay số dòng hợp lệ, trước khi bấm Nạp', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.40\n16/07\t25.70');

    expect(screen.getByText(/2 dòng hợp lệ/)).not.toBeNull();
  });

  it('nêu rõ dòng hỏng kèm số dòng — đúng khuôn WF-11', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.40\n16/07\tn/a\n17/07\t25.30');

    expect(screen.getByText(/1 dòng bỏ qua/)).not.toBeNull();
    expect(screen.getByText(/dòng 2/)).not.toBeNull();
  });

  it('bấm Nạp thì trả kết quả đã đọc lên trên', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.40\n16/07\t25.70');
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));

    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onImport.mock.calls[0]?.[0]?.rows).toHaveLength(2);
  });

  /* ── Phần dựng lại ở đợt 11b ─────────────────────────────────────────── */

  it('gán cột là chip nhưng vẫn là <select> thật — bàn phím và trình đọc màn hình dùng được', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.10\t25.60\t24.90\t25.40');

    // Năm cột dán vào → năm chip, mỗi chip có nhãn riêng để dò được cột nào là cột nào.
    const first = screen.getByLabelText('Cột 1') as HTMLSelectElement;
    expect(first.tagName).toBe('SELECT');
    expect(first.value).toBe('date');
    expect(screen.getByLabelText('Cột 5')).not.toBeNull();
  });

  it('đổi vai trò một cột thì đọc lại dữ liệu theo cách gán mới', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.40\n16/07\t25.70');
    expect(screen.getByText(/2 dòng hợp lệ/)).not.toBeNull();

    // Bỏ cột giá đóng cửa đi thì không còn dòng nào dùng được — cột 'close' là bắt buộc.
    await userEvent.selectOptions(screen.getByLabelText('Cột 2'), 'ignore');

    expect(screen.getByText(/0 dòng hợp lệ/)).not.toBeNull();
  });

  it('hiện khung xem trước để đối chiếu trước khi nạp', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.10\t25.60\t24.90\t25.40');

    const preview = screen.getByRole('table', {
      name: /Vài phiên đầu đọc được/,
    });
    // Một dòng tiêu đề + một dòng dữ liệu.
    expect(preview.querySelectorAll('tr')).toHaveLength(2);
    expect(preview.textContent).toContain('15/07');
    expect(preview.textContent).toContain('25,4');
  });

  it('dán quá số dòng xem trước thì nói rõ còn bao nhiêu dòng nữa', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    const lines = Array.from({ length: 8 }, (_, i) => `1${i}/07\t25.40`).join('\n');
    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste(lines);

    // 8 dòng đọc được, khung xem trước cắt ở 5 → còn 3.
    expect(screen.getByText(/3 dòng nữa/)).not.toBeNull();
  });

  it('không lọt NaN hay undefined ra màn khi ô số bỏ trống — FR-06', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    // Chỉ có ngày và giá đóng cửa; bốn cột còn lại trống.
    await userEvent.click(screen.getByLabelText('Dán dữ liệu vào đây'));
    await userEvent.paste('15/07\t25.40');

    const preview = screen.getByRole('table', { name: /Vài phiên đầu đọc được/ });
    expect(preview.textContent).not.toContain('NaN');
    expect(preview.textContent).not.toContain('undefined');
    expect(preview.textContent).toContain('—');
  });
});
