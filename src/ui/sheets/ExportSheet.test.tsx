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

  it('liệt kê bốn mã mẫu', () => {
    render(<PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} picks={noFormula} />);

    expect(screen.getByText('FPT')).not.toBeNull();
    expect(screen.getByText(/Hòa Phát/)).not.toBeNull();
  });

  /*
   * ── Hai ca kiểm đã GỠ, ghi lại để không ai dựng lại mà không biết đã đổi gì ─────────────────
   *
   * Ca "nói rõ phần nào của số liệu là tự dựng" gác khối vàng `preset.draftTitle`/`draftDetail`,
   * và ca "hứa rõ nạp xong vẫn sửa được — FR-10" gác câu chân sheet `preset.editableAfterLoad`.
   * Chủ dự án chốt gỡ cả hai câu ngày 09/09/2026.
   *
   * Giữ lại ca kiểm cho một câu đã bỏ thì nó đỏ mãi; đổi nó thành "câu ấy KHÔNG còn" thì nó gác
   * một điều không ai định làm lại. Nên gỡ, và ca kiểm thật sự còn giá trị nằm ở chỗ khác:
   * `samples.ts` vẫn `isDraft` (ba ca ghim cờ ấy) và `preset.draftExport` vẫn đính vào file xuất
   * (`export-content` có ca riêng). Lời hứa FR-10 nay do hành vi giữ, không do một câu chữ.
   */

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

  /*
   * ── Nhãn "Mẫu ưu tiên" chỉ đúng ở nhánh CÓ xếp hạng ────────────────────────────────────────
   *
   * Chỉ ở đó `pickPresetsFor()` mới chạy thật công thức với từng mã rồi trải bốn mã trên biên độ
   * kết quả. Nhánh kia bốn mã là bộ WF-10 theo thứ tự kho, và nhãn ấy đặt ngay trên câu "bốn mã
   * dưới đây không đổi được ô nào của công thức này" là hai dòng cãi nhau trong một màn.
   */
  it('gọi tên bốn dòng là mẫu ưu tiên — và chỉ khi chúng thật sự chọn theo công thức', () => {
    const pe = findFormulaModule('pe');
    const laiKep = findFormulaModule('lai-kep');
    if (pe === undefined || laiKep === undefined) throw new Error('Thiếu công thức để dựng ca.');

    const coXepHang = render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={pickPresetsFor(pe, SAMPLE_DATA.list(), { asOf: '2026-09-07' })}
        spec={pe.spec}
      />,
    );
    expect(screen.getByText(/Mẫu ưu tiên/)).not.toBeNull();
    coXepHang.unmount();

    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={pickPresetsFor(laiKep, SAMPLE_DATA.list(), { asOf: '2026-09-07' })}
        spec={laiKep.spec}
      />,
    );
    expect(screen.queryByText(/Mẫu ưu tiên/)).toBeNull();
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

  /* Vế "và nói rõ nó chỉ có một phiên giá" đã rời ca này cùng `preset.browseMarketNote` — gỡ theo
     yêu cầu chủ dự án. Phần còn lại của ca vẫn nguyên giá trị: lối sang kho lớn phải mở đúng chỗ,
     và sheet mẫu phải đóng trước khi sheet kia mở. */
  it('mở sẵn lối sang kho mã toàn thị trường', async () => {
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

/*
 * ── Dựng lại ngày 22/09/2026, lượt ba ───────────────────────────────────────────────────
 *
 * Lượt một sửa phân luồng cột và chặn bốn chỗ cho ra số sai. Lượt hai bỏ ô văn bản tự do và
 * thay bằng lưới. Lượt ba là bản thiết kế chủ dự án vẽ ra: popup nổi giữa màn, chỉ vẽ phần
 * dòng đang nhìn thấy, lỗi chỉ đúng Ô, và bỏ dòng lỗi phải có người bấm đồng ý.
 *
 * Trong jsdom mọi kích thước đọc ra đều là 0, nên lưới rơi về mức sàn `MIN_RENDERED` — đủ dòng
 * cho các ca dưới đây, và đó cũng chính là lý do mức sàn ấy tồn tại.
 */
describe('PasteImportSheet — WF-11', () => {
  /** Dán cả khối vào lưới, đúng như Ctrl+V vào ô đầu tiên. */
  const paste = async (text: string) => {
    await userEvent.click(screen.getByLabelText('Ngày, Dòng 1'));
    await userEvent.paste(text);
  };

  /** Mở bảng chọn vai trò cột — từ lượt ba nó nằm sau nút "Cột", không còn ở mỗi đầu cột. */
  const openColumns = async () => {
    await userEvent.click(screen.getByRole('button', { name: /^Cột/ }));
  };

  /** Nạp bộ mẫu. Nó tới qua  riêng nên phải chờ chunk ấy về. */
  const loadSample = async () => {
    await userEvent.click(screen.getByRole('button', { name: 'Dữ liệu mẫu' }));
    await screen.findByRole('button', { name: 'Nạp 64 dòng' });
  };

  it('chưa nhập gì thì nút Nạp bị khoá', () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    const button = screen.getByRole('button', { name: /^Nạp/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  /*
   * Ô văn bản tự do là thứ đã bị bỏ, không phải thứ được thu nhỏ đi. Ghim bằng DOM chứ không
   * bằng chữ: còn một `<textarea>` nào ở đây nghĩa là lối cũ đã quay lại.
   */
  it('không còn ô văn bản tự do nào — chỗ nhập là lưới ô', () => {
    const { container } = render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    expect(container.querySelector('textarea')).toBeNull();
    expect(screen.getByRole('table', { name: /Lưới nhập chuỗi giá/ })).not.toBeNull();
  });

  /*
   * Mở ra là ĐỦ sáu cột. Bản trước mở hai cột kèm nút "Thêm cột"; chủ dự án chốt ngược lại, và
   * vì đã đủ nên nút ấy không còn lý do tồn tại — ghim cả hai vế ở đây.
   */
  it('mở ra là đã gõ được ngay, đủ sáu cột, kèm ví dụ nằm trong ô', () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    for (const name of [
      'Ngày',
      'Giá mở cửa',
      'Giá cao nhất',
      'Giá thấp nhất',
      'Giá đóng cửa',
      'Khối lượng',
    ]) {
      expect(screen.getByRole('button', { name }), name).not.toBeNull();
    }
    expect(screen.getByRole('button', { name: 'Cột 6/6' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Thêm cột' })).toBeNull();

    // Hình dạng cần gõ nằm ngay trong ô sẽ gõ, không phải một câu dặn ở trên.
    expect(screen.getByPlaceholderText('15/07/2026')).not.toBeNull();
    expect(screen.getAllByPlaceholderText('25,4')).toHaveLength(4);
    expect(screen.getByPlaceholderText('1.000.000')).not.toBeNull();
  });

  /*
   * ── Mở ra là thấy chuỗi ĐANG dùng ────────────────────────────────────
   *
   * Chủ dự án: "sau khi sử dụng chuỗi mẫu thì nó đang được áp dụng ra bên ngoài. thì lúc từ bên
   * ngoài vào lại để xem thì phải xem được luôn thông tin chuỗi mẫu đó trong bảng dữ liệu chứ".
   * Đúng: màn ngoài đang tính trên 64 phiên mà mở sheet ra thấy lưới trắng thì người dùng không
   * soi lại được chuỗi của mình, không sửa được một ô sai, và dễ đọc thành "chuỗi bay mất rồi".
   */
  const LOADED = [
    { date: '15/07/2026', open: 25100, high: 25600, low: 24900, close: 25400, volume: 1250000 },
    { date: '16/07/2026', open: 25400, high: 25800, low: 25200, close: 25700, volume: 980000 },
  ];

  it('mở ra là thấy ngay chuỗi màn ngoài đang dùng, không phải lưới trắng', () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={LOADED} />);

    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('15/07/2026');
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 2') as HTMLInputElement).value).toBe(
      '25.700',
    );
    expect((screen.getByLabelText('Khối lượng, Dòng 1') as HTMLInputElement).value).toBe(
      '1.250.000',
    );
    expect(screen.getByRole('button', { name: 'Nạp 2 dòng' })).not.toBeNull();
    // Số do CHÍNH sheet viết ra nên quy ước đã chắc — không được quay lại hỏi người dùng.
    expect(screen.queryByText(/Số này đọc là bao nhiêu/)).toBeNull();
  });

  it('Xoá hết vẫn xoá được, hiệu ứng đổ chuỗi cũ không ghi đè lại', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={LOADED} />);

    await userEvent.click(screen.getByRole('button', { name: 'Xoá hết' }));

    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('button', { name: /^Nạp/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  /* ── Gõ tay: không còn dấu ngăn cột nào để gõ sai ─────────────────────── */

  it('gõ thẳng vào từng ô là ra phiên, không cần dấu cách hay dấu phẩy nào', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Ngày, Dòng 1'), '15/07/2026');
    await userEvent.type(screen.getByLabelText('Giá đóng cửa, Dòng 1'), '25,4');

    expect(screen.getByRole('button', { name: 'Nạp 1 dòng' })).not.toBeNull();
  });

  it('gõ tới dòng cuối thì lưới tự mở thêm dòng', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    expect(screen.queryByLabelText('Ngày, Dòng 5')).toBeNull();

    await userEvent.type(screen.getByLabelText('Ngày, Dòng 4'), '15/07/2026');

    expect(screen.getByLabelText('Ngày, Dòng 5')).not.toBeNull();
  });

  /*
   * Dữ liệu mẫu phải ĐỦ ĐIỀU KIỆN cho công thức chạy, không chỉ để nhìn cho có.
   *
   * Bản trước là 10 phiên tự bịa: bấm xong thì biểu đồ trục thời gian vẫn vẽ được (đòi 5 phiên)
   * nhưng Sharpe, Sortino và Beta vẫn báo thiếu phiên — mốc của chúng là 60. Mốc 60 cũng là
   * `MIN_USABLE_ROWS` của màn Bảng dữ liệu. Ghim bằng con số, không bằng cảm tính.
   */
  it('Dữ liệu mẫu đủ phiên cho mọi công thức chuỗi, không riêng biểu đồ', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    await loadSample();
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));

    const rows = onImport.mock.calls[0]?.[0]?.rows as ReadonlyArray<{
      date: string;
      open: number | null;
      high: number | null;
      low: number | null;
      close: number;
      volume: number | null;
    }>;

    expect(rows.length).toBeGreaterThanOrEqual(60);
    // Đủ sáu cột chứ không riêng giá đóng cửa — nến và khối lượng cũng phải vẽ được.
    for (const row of rows) {
      expect(row.date).not.toBe('');
      expect(row.open).not.toBeNull();
      expect(row.high).not.toBeNull();
      expect(row.low).not.toBeNull();
      expect(row.volume).not.toBeNull();
      expect(row.close).toBeGreaterThan(0);
    }
  });

  /*
   * Mẫu là số liệu THẬT, nên nó phải cư xử như số liệu thật: mỗi phiên thoả Thấp ≤ Mở ≤ Cao và
   * Thấp ≤ Đóng ≤ Cao. Một bộ mẫu dựng bằng tay rất dễ vi phạm chỗ này mà không ai để ý.
   */
  it('Dữ liệu mẫu có OHLC hợp lệ ở mọi phiên, và chạy từ cũ tới mới', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    await loadSample();

    // Chuỗi đã xếp cũ trước nên không có câu "đã đảo lại" — mẫu đi đường sạch.
    expect(screen.queryByText(/Đã đảo lại/)).toBeNull();
    expect(screen.queryByText(/dòng lỗi/)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));
    const rows = onImport.mock.calls[0]?.[0]?.rows as ReadonlyArray<{
      open: number;
      high: number;
      low: number;
      close: number;
    }>;

    for (const row of rows) {
      expect(row.low).toBeLessThanOrEqual(Math.min(row.open, row.close));
      expect(row.high).toBeGreaterThanOrEqual(Math.max(row.open, row.close));
    }
  });

  it('bấm Dữ liệu mẫu thì đi trọn được đường mà không cần có file', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await loadSample();

    expect(screen.getByRole('button', { name: 'Nạp 64 dòng' })).not.toBeNull();
    // Có dữ liệu rồi thì chỗ ấy đổi thành lối dọn đi, không mời dán mẫu nữa.
    expect(screen.queryByRole('button', { name: 'Dữ liệu mẫu' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Xoá hết' })).not.toBeNull();
  });

  it('Xoá hết thì lưới về trạng thái ban đầu', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await loadSample();
    await userEvent.click(screen.getByRole('button', { name: 'Xoá hết' }));

    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('');
    expect((screen.getByRole('button', { name: /^Nạp/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  /* ── Dán: cả khối tự rải đúng cột ─────────────────────────────────────── */

  it('dán vào một ô thì cả khối tự rải đúng cột, đếm ngay số phiên', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,40\n16/07/2026\t25,70');

    const line = screen.getByText(/2 phiên đọc được/);
    expect(line.textContent).toContain('từ 15/07/2026 tới 16/07/2026');
    // Ô thô của người dùng nằm nguyên trong lưới để soát lại, không phải số đã đọc xong.
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 1') as HTMLInputElement).value).toBe('25,40');
  });

  it('dán thêm một cột vào lưới đang có dữ liệu thì không đụng vai trò cột đã chọn', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Ngày, Dòng 1'), '15/07/2026');
    await userEvent.click(screen.getByLabelText('Giá đóng cửa, Dòng 1'));
    await userEvent.paste('25,40\n25,70');

    expect(screen.getByRole('button', { name: 'Ngày' })).not.toBeNull();
    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('15/07/2026');
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 2') as HTMLInputElement).value).toBe('25,70');
  });

  it('bấm Nạp thì trả kết quả đã đọc lên trên', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    await paste('15/07\t25,40\n16/07\t25,70');
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));

    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onImport.mock.calls[0]?.[0]?.rows).toHaveLength(2);
  });

  /*
   * Lưới luôn chừa một dòng trống ở cuối để gõ tiếp. Nó KHÔNG được tính là dòng hỏng — báo
   * "1 dòng lỗi" ngay sau khi dán xong là lời cảnh báo rỗng.
   */
  it('dòng trống cuối lưới không bị đếm thành dòng lỗi', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,40\n16/07/2026\t25,70');

    expect(screen.queryByText(/dòng lỗi/)).toBeNull();
    expect(screen.queryByText(/dòng bỏ qua/)).toBeNull();
  });

  /* ── Lỗi chỉ đúng ô ───────────────────────────────────────────────────── */

  /*
   * '28/13/2026' không phải một ngày. Trước lượt ba nó vẫn lọt: ngày giữ nguyên dạng thô nên
   * chỉ làm cả bảng tụt xuống "không đọc được thứ tự phiên". Một ô gõ nhầm tháng 13 phải bị
   * chỉ đúng tên, đúng ô.
   */
  it('ngày sai bị bắt, tô đúng ô ngày chứ không chỉ báo cả dòng', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,40\n28/13/2026\t25,85\n17/07/2026\t25,30');

    expect(screen.getByText(/1 dòng sai ngày/)).not.toBeNull();

    const bad = screen.getByLabelText('Ngày, Dòng 2');
    expect(bad.getAttribute('aria-invalid')).toBe('true');
    // Và ô giá cùng dòng KHÔNG bị đổ lỗi lây.
    expect(screen.getByLabelText('Giá đóng cửa, Dòng 2').getAttribute('aria-invalid')).toBeNull();
  });

  it('giá đóng cửa không đọc được thì tô ô giá, không tô ô ngày', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,40\n16/07/2026\tn/a');

    expect(screen.getByLabelText('Giá đóng cửa, Dòng 2').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Ngày, Dòng 2').getAttribute('aria-invalid')).toBeNull();
  });

  /* Vứt lặng lẽ ba dòng rồi báo "248 phiên sẵn sàng" đúng là thứ FR-06 tồn tại để chặn. */
  it('còn dòng lỗi thì nút Nạp khoá cho tới khi người dùng đồng ý bỏ chúng', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    await paste('15/07/2026\t25,40\n28/13/2026\t25,85\n17/07/2026\t25,30');

    const button = screen.getByRole('button', { name: /^Nạp/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await userEvent.click(screen.getByRole('checkbox', { name: /Bỏ qua 1 dòng lỗi/ }));

    expect(button.disabled).toBe(false);
    await userEvent.click(button);
    expect(onImport.mock.calls[0]?.[0]?.rows).toHaveLength(2);
  });

  /*
   * Tải file là lối vào thứ ba, cạnh gõ tay và dán. Nó đi qua ĐÚNG bộ đọc của hai lối kia —
   * một bộ đọc riêng cho file là chỗ bốn cơ chế chặn số sai lặng lẽ biến mất.
   */
  it('chọn file CSV thì đổ thẳng vào lưới, qua cùng bộ đọc với lối dán', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    const file = new File(['Ngày,Đóng\n15/07/2026,25.4\n16/07/2026,25.7'], 'gia.csv', {
      type: 'text/csv',
    });
    await userEvent.upload(screen.getByLabelText('Tải file CSV'), file);

    await waitFor(() => {
      expect(screen.getByText(/2 phiên đọc được/)).not.toBeNull();
    });
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 2') as HTMLInputElement).value).toBe('25.7');
  });

  it('thanh trạng thái nói đang xem dòng nào trong tổng bao nhiêu', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await loadSample();

    // 64 phiên cộng một dòng trống chừa sẵn để gõ tiếp.
    expect(screen.getByText(/Đang xem dòng 1 – \d+ trong 65/)).not.toBeNull();
  });

  /* ── Phân luồng cột ──────────────────────────────────────────────────── */

  it('tên vai trò đứng ngay trên đầu cột, bấm vào là mở bảng chọn', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07\t25,10\t25,60\t24,90\t25,40');
    expect(screen.getByRole('button', { name: 'Giá thấp nhất' })).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Ngày' }));

    const first = screen.getByLabelText('Cột 1') as HTMLSelectElement;
    expect(first.tagName).toBe('SELECT');
    expect(first.value).toBe('date');
    expect((screen.getByLabelText('Cột 5') as HTMLSelectElement).value).toBe('close');
  });

  it('nút Cột đếm số cột đã nhận vai trò', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07\t25,40\t99,90');

    expect(screen.getByRole('button', { name: 'Cột 3/3' })).not.toBeNull();
  });

  it('đổi vai trò một cột thì đọc lại, và nói rõ đang thiếu cột giá đóng cửa', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07\t25,40\n16/07\t25,70');
    expect(screen.getByText(/2 phiên đọc được/)).not.toBeNull();

    await openColumns();
    await userEvent.selectOptions(screen.getByLabelText('Cột 2'), 'ignore');

    expect(screen.getByText(/Chưa cột nào được đặt là Giá đóng cửa/)).not.toBeNull();
    expect((screen.getByRole('button', { name: /^Nạp/ }) as HTMLButtonElement).disabled).toBe(true);
  });

  /*
   * Hai cột cùng một vai trò thì bộ đọc lấy cột ĐẦU (`indexOf`), nên cột sau thành ô chết:
   * người dùng bấm đổi mà không có gì xảy ra và cũng không có gì báo.
   */
  it('một vai trò chỉ ở đúng một cột: gán lại thì cột cũ tự nhả ra', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    // Ba cột 'Ngày · số · số' được đoán là Ngày · Giá mở cửa · Giá đóng cửa.
    await paste('15/07\t25,40\t99,90');
    await openColumns();
    expect((screen.getByLabelText('Cột 3') as HTMLSelectElement).value).toBe('close');

    await userEvent.selectOptions(screen.getByLabelText('Cột 2'), 'close');

    expect((screen.getByLabelText('Cột 2') as HTMLSelectElement).value).toBe('close');
    expect((screen.getByLabelText('Cột 3') as HTMLSelectElement).value).toBe('ignore');
    // Và con số đọc ra phải là của cột vừa gán, không phải cột cũ.
    expect(screen.getByText(/1 phiên đọc được/)).not.toBeNull();
  });

  /* ── Chặn số sai, mỗi ca một lỗi đã tái hiện được ────────────────────── */

  it('dán chuỗi xếp phiên mới trước thì đảo lại và nói ra', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    // Đúng thứ tự CafeF, Vietstock và investing.com xuất ra.
    await paste('17/07/2026\t25,30\n16/07/2026\t25,70\n15/07/2026\t25,40');

    expect(screen.getByText(/Đã đảo lại cho chuỗi chạy từ cũ tới mới/)).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));
    expect(onImport.mock.calls[0]?.[0]?.rows.map((row: { close: number }) => row.close)).toEqual([
      25.4, 25.7, 25.3,
    ]);
  });

  it('không có cột ngày thì nói thẳng là không đọc được thứ tự phiên', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('25,40\n25,70\n25,30');

    expect(screen.getByText(/Không đọc được thứ tự phiên/)).not.toBeNull();
  });

  it('quy ước số mập mờ thì hỏi lại bằng chính con số ấy, chọn xong đọc lại ngay', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    // '25,100' đọc được thành 25,1 lẫn 25.100 — lệch nhau 1000 lần.
    await paste('15/07/2026\t25,100\n16/07/2026\t25,400');
    expect(screen.getByText(/Số này đọc là bao nhiêu/)).not.toBeNull();

    await userEvent.click(screen.getByRole('button', { name: '25,1' }));
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));

    expect(onImport.mock.calls[0]?.[0]?.rows.map((row: { close: number }) => row.close)).toEqual([
      25.1, 25.4,
    ]);
  });

  it('quá trần thì giữ phần GẦN ĐÂY nhất và nói đã bỏ bao nhiêu', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} maxRows={2} />);

    await paste('13/07/2026\t10\n14/07/2026\t20\n15/07/2026\t30\n16/07/2026\t40');

    expect(screen.getByText(/Chỉ giữ được phần gần đây nhất/)).not.toBeNull();
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));
    expect(onImport.mock.calls[0]?.[0]?.rows.map((row: { close: number }) => row.close)).toEqual([
      30, 40,
    ]);
  });

  it('bỏ dòng ghi chú đầu file của chính bản xuất CSV, không để lệch cột', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('# Faculator Finbox\nNgày,Đóng\n15/07/2026,25.4\n16/07/2026,25.7');

    expect(screen.getByRole('button', { name: 'Giá đóng cửa' })).not.toBeNull();
    expect(screen.getByText(/2 phiên đọc được/)).not.toBeNull();
  });
});
