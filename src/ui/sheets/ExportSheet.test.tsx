// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  DISCLAIMER_VI,
  SAMPLE_DATA,
  defaultPresetPicks,
  findFormulaModule,
  ok,
  pickPresetsFor,
} from '@/application';
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
  description: {
    vi: 'Trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
    en: 'How much is paid per unit of profit.',
  },
  latex: 'x',
  chartType: 'sensitivity',
  level: 'basic',
  tags: [],
  resultUnit: 'lần',
  variables: [
    {
      key: 'price',
      label: { vi: 'Giá thị trường', en: 'Market price' },
      unit: '₫',
      type: 'number',
      defaultValue: 0,
      level: 'basic',
    },
  ],
  explanation: {
    meaning: { vi: 'a', en: 'a' },
    whenToUse: { vi: 'b', en: 'b' },
    howToRead: { vi: 'c', en: 'c' },
    commonMistakes: { vi: 'd', en: 'd' },
  },
  example: { title: { vi: 'x', en: 'x' }, inputs: {}, expected: 1 },
  tests: [],
  source: [{ label: { vi: 'CFA Institute', en: 'CFA Institute' } }],
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

/**
 * Biểu đồ trong file xuất — lỗi 8️⃣ của đợt kiểm thử.
 *
 * Trước đợt này cả bản in lẫn tấm PNG đều in ra một khung nét đứt kèm câu hẹn "sẽ có ở bản sau",
 * dù màn hình ngay phía sau đang vẽ hình. Nay vùng in nhận BẢN CHÉP của chính hình ấy.
 */
describe('ExportSheet — biểu đồ trong vùng in', () => {
  /** Dựng một hình biểu đồ trên trang, đúng dấu mà `cloneChartSvg` đi tìm. */
  function dungHinh(idBase: string): void {
    const holder = document.createElement('div');
    holder.dataset.hinhGia = 'true';
    holder.innerHTML = `<svg data-chart-svg="${idBase}" viewBox="0 0 320 200"><path class="line" d="M0 0" /></svg>`;
    document.body.append(holder);
  }

  afterEach(() => {
    for (const node of document.querySelectorAll('[data-hinh-gia]')) node.remove();
  });

  function moSheet(formula: FormulaSpec = PE) {
    render(
      <ExportSheet
        open
        onClose={vi.fn()}
        formula={formula}
        output={ok(15.2, 'lần')}
        inputs={{ price: 92_000 }}
      />,
    );
  }

  it('đổ bản chép của hình đang hiện vào vùng in', async () => {
    dungHinh('chart-pe');
    moSheet();

    // Bộ chụp nạp bằng `import()` nên phải chờ một nhịp — đó chính là cái giá của chunk riêng.
    await waitFor(() => {
      expect(document.querySelector('.print-chart-plot > svg')).not.toBeNull();
    });
  });

  it('công thức không có biểu đồ thì khe để trống, không dựng hình rỗng', async () => {
    // Không dựng hình nào — đúng cảnh 11 công thức khai `chartType: 'none'`.
    moSheet();

    await waitFor(() => {
      expect(screen.getByText('Công thức này không có biểu đồ.')).not.toBeNull();
    });
    expect(document.querySelector('.print-chart-plot > svg')).toBeNull();
  });

  it('không lấy nhầm hình của công thức khác đang nằm trong DOM', async () => {
    dungHinh('chart-roe');
    moSheet();

    await waitFor(() => {
      expect(screen.getByText('Công thức này không có biểu đồ.')).not.toBeNull();
    });
    expect(document.querySelector('.print-chart-plot > svg')).toBeNull();
  });

  /*
   * Việc ẩn câu dự phòng do CSS lo, không do React — `window.print()` chặn luồng ngay tại chỗ nên
   * một `setState` gọi ngay trước đó chưa kịp ra tới DOM. jsdom không áp CSS Module hay globals.css
   * nên ca kiểm phải soi thẳng file nguồn; đó là cách duy nhất chốt được ràng buộc này.
   */
  it('globals.css có luật ẩn câu dự phòng khi khe đã có hình', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');

    expect(css).toContain('.print-chart:has(.print-chart-plot > svg) .print-chart-note');
  });
});

describe('PresetSheet — WF-10', () => {
  /** Hình dạng "không có công thức nào" — đúng thứ màn bảng dữ liệu WF-05 truyền vào. */
  const noFormula = defaultPresetPicks();

  it('liệt kê bốn mã mẫu và nói rõ phần nào của số liệu là tự dựng', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} picks={noFormula} />);

    expect(screen.getByText('FPT')).not.toBeNull();
    expect(screen.getByText(/Hòa Phát/)).not.toBeNull();
    // Nhãn phải nói ĐÚNG nửa nào là số tự dựng: fundamentals và thị giá là số thật từ Finbox.
    expect(screen.getByText(/đường đi của giá thì không/)).not.toBeNull();
  });

  it('hứa rõ với người dùng là nạp xong vẫn sửa được — FR-10', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} picks={noFormula} />);
    expect(screen.getByText(/ô nào mã có số thì vẫn sửa được/)).not.toBeNull();
  });

  /*
   * ── Bốn dòng phải KHÁC NHAU ────────────────────────────────────────────────────────────
   *
   * Bản trước in `preset.meta` dưới mỗi mã — chuỗi `BCTC <kỳ> · 248 phiên giá` dựng từ kỳ báo
   * cáo và một hằng số, mà mọi mã lấy cùng một lượt nên cùng một kỳ. Bốn dòng đọc y hệt nhau,
   * đúng như chủ dự án báo. Ca kiểm này là cửa chặn: dòng mô tả của bốn mã không được trùng.
   */
  it('mỗi dòng nói số của chính mã đó, không nói nguồn — bốn dòng không trùng nhau', () => {
    const formula = findFormulaModule('pe');
    if (formula === undefined) throw new Error('Không tìm thấy công thức P/E.');

    const picks = pickPresetsFor(formula, SAMPLE_DATA.list(), { asOf: '2026-09-07' });
    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={picks}
        spec={formula.spec}
        wantsSeries={false}
      />,
    );

    const lines = screen
      .getAllByRole('listitem')
      .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '');

    expect(lines).toHaveLength(4);
    expect(new Set(lines).size).toBe(4);
    // Dòng nguồn cũ không được xuất hiện ở ca có xếp hạng — nó chính là chuỗi trùng lặp.
    for (const line of lines) expect(line).not.toContain('248 phiên giá');
  });

  it('xếp bốn mã theo kết quả tăng dần, để nhìn một lượt là thấy biên độ', () => {
    const formula = findFormulaModule('pb');
    if (formula === undefined) throw new Error('Không tìm thấy công thức P/B.');

    const picks = pickPresetsFor(formula, SAMPLE_DATA.list(), { asOf: '2026-09-07' });
    const values = picks.map((item) => item.output.value ?? Number.NaN);

    expect(values).toHaveLength(4);
    for (let i = 1; i < values.length; i += 1) {
      expect(values[i] ?? 0).toBeGreaterThan(values[i - 1] ?? 0);
    }
  });

  it('công thức không dùng số liệu của mã nào thì nói thẳng, không bịa ra thứ hạng', () => {
    const formula = findFormulaModule('lai-kep');
    if (formula === undefined) throw new Error('Không tìm thấy công thức lãi kép.');

    const picks = pickPresetsFor(formula, SAMPLE_DATA.list(), { asOf: '2026-09-07' });
    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={picks}
        spec={formula.spec}
        wantsSeries={false}
      />,
    );

    expect(picks.map((item) => item.preset.code)).toEqual(['FPT', 'HPG', 'VNM', 'MWG']);
    expect(screen.getByText(/không đổi được ô nào của công thức này/)).not.toBeNull();

    /*
     * Kể cả ở ca này bốn dòng vẫn phải khác nhau. Bản đầu của đợt sửa vẫn in `preset.meta` xuống
     * đây, nên "Trả góp gốc đều" mở ra vẫn thấy bốn dòng `BCTC Q2/2026 · 248 phiên giá` y hệt —
     * đúng triệu chứng ban đầu, chỉ là ở một nhánh khác. Không có số nào của mã đi vào công thức
     * thì dòng phụ để TRỐNG, tên và ngành đã đủ phân biệt.
     */
    const lines = screen
      .getAllByRole('listitem')
      .map((item) => item.textContent?.replace(/\s+/g, ' ').trim() ?? '');

    expect(new Set(lines).size).toBe(4);
    for (const line of lines) expect(line).not.toContain('248 phiên giá');
  });

  /*
   * ── Ô tìm đã bị BỎ, và đó là điểm chính của bản vá ─────────────────────────────────────
   *
   * Kho này có đúng bốn mã. Một ô tìm ở đây hứa một kho mã, gõ mã thứ năm thì ra "không có mã
   * nào khớp", trong khi sheet chọn mã kia có 1.649 mã — chủ dự án báo đúng mâu thuẫn đó. Ba
   * ca kiểm ô tìm cũ (lọc bỏ dấu, lọc không ra gì, xoá từ khoá lúc đóng) đã bỏ theo; xem
   * docblock `PresetSheet` để không ai dựng lại ô tìm mà không biết vì sao nó từng bị gỡ.
   */
  it('không còn ô tìm — bốn mã thì không có gì để tìm', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} picks={noFormula} />);

    expect(screen.queryByRole('searchbox')).toBeNull();
    for (const code of ['FPT', 'HPG', 'VNM', 'MWG']) {
      expect(screen.getByText(code)).not.toBeNull();
    }
  });

  it('mở sẵn lối sang kho mã toàn thị trường, và nói rõ nó chỉ có một phiên giá', async () => {
    const onClose = vi.fn();
    const onBrowseMarket = vi.fn();
    render(
      <PresetSheet
        open
        onClose={onClose}
        onLoad={vi.fn()}
        picks={noFormula}
        onBrowseMarket={onBrowseMarket}
      />,
    );

    expect(screen.getByText(/chỉ có MỘT phiên giá/)).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /toàn thị trường/ }));

    expect(onBrowseMarket).toHaveBeenCalledTimes(1);
    // Đóng sheet mẫu trước khi mở sheet kia — hai bottom sheet chồng nhau là một cái bẫy focus.
    expect(onClose).toHaveBeenCalled();
  });

  it('không truyền onBrowseMarket thì không hiện lối rẽ nào', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} picks={noFormula} />);
    expect(screen.queryByRole('button', { name: /toàn thị trường/ })).toBeNull();
  });

  it('bấm Nạp thì trả preset lên trên rồi đóng sheet', async () => {
    const onLoad = vi.fn();
    const onClose = vi.fn();
    render(<PresetSheet open onClose={onClose} onLoad={onLoad} picks={noFormula} />);

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
    expect(preview.textContent).toContain('_ _');
  });
});
