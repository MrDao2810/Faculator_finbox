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
 * Bảng mã có số liệu dùng được — bản giả, cùng lý do và cùng khuôn `TickerPickerSheet.test.tsx`:
 * file sinh thật đổi mỗi lần chạy `npm run gen:ticker-coverage`, nên ghim con số của nó là ghim
 * một ca test vào lịch công bố báo cáo của doanh nghiệp.
 *
 * 1.202 mã: FPT, HPG (hai trong bốn mã mẫu) và 1.200 mã bịa. VNM, MWG cố ý KHÔNG có trong bảng —
 * để phép trừ "những mã mẫu đang bày phía trên" phải đếm đúng số mã TRÙNG, không trừ cứng bốn.
 */
const docBangMa = vi.hoisted(() =>
  vi.fn((asOf: string) => ({
    codes: new Set(['FPT', 'HPG', ...Array.from({ length: 1200 }, (_, i) => `M${String(i)}`)]),
    fetchedAt: '2026-09-08T00:00:00.000Z',
    // 2027 cách 2026-09-08 hơn 100 ngày — bật nhánh "bảng đã cũ".
    stale: asOf.startsWith('2027'),
  })),
);

vi.mock('@/application/ticker-coverage', () => ({ tickerCoverage: docBangMa }));

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
   * ── Nhãn "Mẫu ưu tiên" đã BỎ ở mọi nhánh (21/10/2026) ───────────────────────────────────────
   *
   * Nó từng gọi tên bốn dòng ở nhánh CÓ xếp hạng. Chủ dự án chụp sheet trên điện thoại: _"xóa đoạn
   * text 'Mẫu ưu tiên — bốn mã hợp nhất để chạy thử công thức này' này ở cả mobile lẫn web"_. Ca này
   * ĐẢO chiều ca cũ thay vì xoá, để nhãn có quay lại thì là một quyết định chứ không phải một lần lỡ
   * tay. Chữ viết thẳng ra vì khoá `preset.topPicks` đã xoá. Nhánh xếp hạng nay không có câu dẫn nào.
   */
  it('nhánh có xếp hạng không còn nhãn "Mẫu ưu tiên" hay câu dẫn nào', () => {
    const pe = findFormulaModule('pe');
    const laiKep = findFormulaModule('lai-kep');
    if (pe === undefined || laiKep === undefined) throw new Error('Thiếu công thức để dựng ca.');

    const picks = pickPresetsFor(pe, SAMPLE_DATA.list(), { asOf: '2026-09-07' });
    // Đúng ca đang gác: có xếp hạng (mã điền được ô của công thức).
    expect(picks.some((item) => item.filled.length > 0)).toBe(true);

    const coXepHang = render(
      <PresetSheet open onClose={vi.fn()} onLoad={vi.fn()} picks={picks} spec={pe.spec} />,
    );
    expect(screen.queryByText(/Mẫu ưu tiên/)).toBeNull();
    expect(screen.queryByText(/không đổi được ô nào của công thức này/)).toBeNull();
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
   * ── Công thức chỉ ăn chuỗi giá: KHÔNG còn câu dẫn nào (13/10/2026) ─────────────────────────
   *
   * Câu `preset.seriesOnlyNote` ("Công thức này chạy bằng chuỗi phiên giá. Chỉ phiên gần nhất là
   * giá thật…") đã bỏ theo yêu cầu chủ dự án — mộ chí ở `vi.ts`. Ca này gác hai điều của nhánh
   * mới: chỗ trống ấy không bị lấp bằng câu của ca khác (`noTickerNote` nói bốn mã không đổi được
   * ô nào, sai hẳn ở đây vì nạp một mã là có chuỗi để tính), và dòng mức giá của từng mã vẫn còn.
   */
  it('công thức chỉ ăn chuỗi giá thì đầu sheet không có câu dẫn, mỗi dòng vẫn in mức giá', () => {
    const formula = findFormulaModule('sma-n-phien');
    if (formula === undefined) throw new Error('Không tìm thấy công thức SMA.');

    const picks = pickPresetsFor(formula, SAMPLE_DATA.list(), { asOf: '2026-09-07' });
    // Đúng ca đang gác: không mã nào điền được ô nhập nào, nên không có xếp hạng.
    expect(picks.every((item) => item.filled.length === 0)).toBe(true);

    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={picks}
        spec={formula.spec}
        wantsSeries
      />,
    );

    expect(screen.queryByText(/chạy bằng chuỗi phiên giá/)).toBeNull();
    expect(screen.queryByText(/không đổi được ô nào của công thức này/)).toBeNull();
    expect(screen.queryByText(/Mẫu ưu tiên/)).toBeNull();

    const lines = screen.getAllByRole('listitem').map((item) => item.textContent ?? '');
    expect(lines).toHaveLength(4);
    for (const line of lines) expect(line).toContain('Giá phiên gần nhất');
  });

  /*
   * ── Nút sang kho lớn nói ra BAO NHIÊU mã dùng được (13/10/2026) ────────────────────────────
   *
   * Chủ dự án: *"chỗ này cần có thêm text ghi rõ có bao nhiêu mã có thể áp dụng được vào công thức
   * đang dùng ví dụ như: Danh sách 60 mã khác"*. Con số đọc từ đúng bảng mà sheet chọn mã dùng để
   * khoá nút "Chọn", trừ những mã mẫu đang bày phía trên.
   */
  it('nút sang kho lớn in số mã khác mà công thức dùng được, trừ mã mẫu đang bày', async () => {
    const formula = findFormulaModule('sma-n-phien');
    if (formula === undefined) throw new Error('Không tìm thấy công thức SMA.');

    const picks = pickPresetsFor(formula, SAMPLE_DATA.list(), { asOf: '2026-09-07' });
    // Bốn mã bày ra là FPT, HPG, VNM, MWG; bảng giả chỉ có hai mã đầu → 1.202 − 2 = 1.200.
    expect(picks.map((item) => item.preset.code)).toEqual(['FPT', 'HPG', 'VNM', 'MWG']);

    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={picks}
        spec={formula.spec}
        wantsSeries
        onBrowseMarket={vi.fn()}
        marketAsOf="2026-10-13"
      />,
    );

    expect(await screen.findByRole('button', { name: 'Danh sách 1.200 mã khác →' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /toàn thị trường/ })).toBeNull();
  });

  /*
   * Ba ca con số sẽ SAI nên nút giữ nhãn không số — lý do từng ca ở `PresetSheet.soMaKhac`. Mỗi
   * ca chờ bảng về rồi mới soi: soi ngay thì ca nào cũng xanh, vì lượt render đầu chưa có bảng.
   */
  it.each([
    {
      ten: 'công thức không dùng số của mã nào',
      id: 'lai-kep',
      wantsSeries: false,
      asOf: '2026-10-13',
    },
    { ten: 'bảng mã đã cũ', id: 'sma-n-phien', wantsSeries: true, asOf: '2027-06-01' },
  ])('$ten thì nút giữ nhãn không số', async ({ id, wantsSeries, asOf }) => {
    const formula = findFormulaModule(id);
    if (formula === undefined) throw new Error(`Không tìm thấy công thức ${id}.`);
    docBangMa.mockClear();

    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={pickPresetsFor(formula, SAMPLE_DATA.list(), { asOf: '2026-09-07' })}
        spec={formula.spec}
        wantsSeries={wantsSeries}
        onBrowseMarket={vi.fn()}
        marketAsOf={asOf}
      />,
    );

    await waitFor(() => {
      expect(docBangMa).toHaveBeenCalled();
    });
    expect(screen.getByRole('button', { name: /toàn thị trường/ })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Danh sách/ })).toBeNull();
  });

  it('không truyền ngày của màn thì không nạp bảng mã, nút giữ nhãn không số', () => {
    docBangMa.mockClear();
    render(
      <PresetSheet
        open
        onClose={vi.fn()}
        onLoad={vi.fn()}
        picks={noFormula}
        onBrowseMarket={vi.fn()}
      />,
    );

    expect(docBangMa).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /toàn thị trường/ })).not.toBeNull();
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
      // Tên ngắn "KL" không nằm trong tên đầy đủ nên được ghép vào sau — xem nút sắp xếp ở sheet.
      'Khối lượng (KL)',
    ]) {
      expect(screen.getByRole('button', { name }), name).not.toBeNull();
    }
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

    // Ô ngày in gọn ngày/tháng; năm đứng một lần trên lưới — ca "dòng năm" ở dưới. Phiên mới nhất
    // đứng đầu và mang số 1, nên "Dòng 1" là 16/07.
    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('16/07');
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 1') as HTMLInputElement).value).toBe(
      '25.700',
    );
    expect((screen.getByLabelText('Khối lượng, Dòng 2') as HTMLInputElement).value).toBe(
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

    // Số phiên đọc được nằm trên nút Nạp; năm của chuỗi ở dòng năm trên lưới.
    expect(screen.getByRole('button', { name: 'Nạp 2 dòng' })).not.toBeNull();
    expect(screen.getByText('Năm 2026')).not.toBeNull();
    // Ô thô của người dùng nằm nguyên trong lưới để soát lại, không phải số đã đọc xong.
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 2') as HTMLInputElement).value).toBe('25,40');
  });

  it('dán thêm một cột vào lưới đang có dữ liệu thì không đụng vai trò cột đã chọn', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await userEvent.type(screen.getByLabelText('Ngày, Dòng 1'), '15/07/2026');
    await userEvent.click(screen.getByLabelText('Giá đóng cửa, Dòng 1'));
    await userEvent.paste('25,40\n25,70');

    expect(screen.getByRole('button', { name: 'Ngày' })).not.toBeNull();
    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('15/07');
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

    // Ngày không có trên lịch xếp CUỐI như ô trống, không lên đầu như phiên mới nhất: dòng 3 trên màn.
    const bad = screen.getByLabelText('Ngày, Dòng 3');
    expect(bad.getAttribute('aria-invalid')).toBe('true');
    // Và ô giá cùng dòng KHÔNG bị đổ lỗi lây.
    expect(screen.getByLabelText('Giá đóng cửa, Dòng 3').getAttribute('aria-invalid')).toBeNull();
    // Câu báo lỗi nói đúng số dòng đang thấy trên màn.
    expect(screen.getByText(/\(dòng 3\)/)).not.toBeNull();
  });

  it('giá đóng cửa không đọc được thì tô ô giá, không tô ô ngày', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,40\n16/07/2026\tn/a');

    // 16/07 là phiên mới nhất nên đứng đầu: dòng 1 trên màn.
    expect(screen.getByLabelText('Giá đóng cửa, Dòng 1').getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByLabelText('Ngày, Dòng 1').getAttribute('aria-invalid')).toBeNull();
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
      expect(screen.getByRole('button', { name: 'Nạp 2 dòng' })).not.toBeNull();
    });
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 1') as HTMLInputElement).value).toBe('25.7');
  });

  /*
   * Câu "Đang xem dòng 1 – 8 trong 249" ĐÃ BỎ (chủ dự án, 14/10/2026: "xóa text thừa này đi"). Ca này
   * từng ghim nó có mặt; nay ghim nó vắng mặt, để câu ấy quay lại là một quyết định chứ không là sơ suất.
   *
   * Câu xác nhận "64 phiên đọc được, từ … tới …" cũng ĐÃ BỎ (chủ dự án, 20/10/2026: _"xóa đoạn text …
   * đi"_), cùng một lối ghim. Số phiên còn trên nút Nạp.
   */
  it('thanh dưới lưới không còn câu "Đang xem dòng …" hay "… phiên đọc được, từ … tới …"', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await loadSample();

    expect(screen.queryByText(/Đang xem dòng/)).toBeNull();
    expect(screen.queryByText(/phiên đọc được/)).toBeNull();
    expect(screen.getByRole('button', { name: 'Nạp 64 dòng' })).not.toBeNull();
  });

  /* ── Phân luồng cột ──────────────────────────────────────────────────── */

  /*
   * ── Bản vẽ 20/10/2026: tên cột ngắn là nút sắp xếp, ngày gọn, năm một lần, cột Đóng có màu ──────
   *
   * Chủ dự án gửi một bảng giá mẫu: _"đổi bảng dữ liệu thành kiểu mới này"_, và nói dấu ˅ cạnh tên
   * cột _"là icon sắp xếp bảng. cần thêm vào cho tôi"_.
   */

  /** Ba phiên: đóng > mở, đóng < mở, đóng > mở. Giá đóng cửa 25.400 · 25.300 · 25.900. */
  const BA_PHIEN = [
    { date: '15/07/2026', open: 25100, high: 25600, low: 24900, close: 25400, volume: 1250000 },
    { date: '16/07/2026', open: 25400, high: 25800, low: 25200, close: 25300, volume: 980000 },
    { date: '17/07/2026', open: 25300, high: 26000, low: 25200, close: 25900, volume: 870000 },
  ];

  /** Giá trị từng ô của một cột, theo thứ tự ĐANG BÀY trên màn (cả dòng trống cuối lưới). */
  const cotTrenMan = (ten: string) =>
    screen
      .getAllByLabelText(new RegExp(`^${ten}, Dòng \\d+$`))
      .map((el) => (el as HTMLInputElement).value);

  it('đầu cột in tên ngắn, nhưng tên đọc được của nút vẫn là tên đầy đủ', () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    const dau = screen.getAllByRole('columnheader').map((th) => th.textContent);
    expect(dau).toEqual(['Dòng', 'Ngày', 'Mở', 'Cao', 'Thấp', 'Đóng', 'KL']);
    expect(screen.getByRole('button', { name: 'Giá mở cửa' }).textContent).toBe('Mở');
  });

  it('bấm tên cột: giảm dần, rồi tăng dần, rồi về mặc định — phiên mới nhất lên đầu', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />);
    // aria-sort nằm trên ô tiêu đề, ô ấy lấy tên theo chữ đang in nên tìm qua nút của nó.
    const dauDong = () => {
      const th = screen.getByRole('button', { name: 'Giá đóng cửa' }).closest('th');
      if (th === null) throw new Error('nút sắp xếp không nằm trong ô tiêu đề');
      return th;
    };

    expect(dauDong().getAttribute('aria-sort')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Giá đóng cửa' }));
    expect(dauDong().getAttribute('aria-sort')).toBe('descending');
    // Ô trống của dòng cuối lưới đứng cuối ở cả hai chiều, không chen vào như một con số 0.
    expect(cotTrenMan('Giá đóng cửa')).toEqual(['25.900', '25.400', '25.300', '']);

    await userEvent.click(screen.getByRole('button', { name: 'Giá đóng cửa' }));
    expect(dauDong().getAttribute('aria-sort')).toBe('ascending');
    expect(cotTrenMan('Giá đóng cửa')).toEqual(['25.300', '25.400', '25.900', '']);

    await userEvent.click(screen.getByRole('button', { name: 'Giá đóng cửa' }));
    expect(dauDong().getAttribute('aria-sort')).toBeNull();
    // Mặc định là theo ngày, mới nhất trước: 17/07 · 16/07 · 15/07.
    expect(cotTrenMan('Giá đóng cửa')).toEqual(['25.900', '25.300', '25.400', '']);
  });

  /*
   * Chủ dự án (lượt hai, 20/10/2026) thấy ba dòng đầu là tháng 9/2025 của một chuỗi chạy tới 9/2026:
   * _"thời gian gần nhất thì cần xếp lên đầu thay vì để xuống cuối bảng"_. Mở ra là đã xếp Ngày giảm
   * dần; bấm Ngày thì đảo qua lại giữa cũ trước và mới trước.
   */
  it('mở ra là phiên mới nhất đứng đầu; bấm Ngày thì đảo qua lại', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />);
    const dauNgay = () => screen.getByRole('button', { name: 'Ngày' }).closest('th');

    expect(cotTrenMan('Ngày')).toEqual(['17/07', '16/07', '15/07', '']);
    expect(dauNgay()?.getAttribute('aria-sort')).toBe('descending');

    await userEvent.click(screen.getByRole('button', { name: 'Ngày' }));
    expect(cotTrenMan('Ngày')).toEqual(['15/07', '16/07', '17/07', '']);
    expect(dauNgay()?.getAttribute('aria-sort')).toBe('ascending');

    await userEvent.click(screen.getByRole('button', { name: 'Ngày' }));
    expect(cotTrenMan('Ngày')).toEqual(['17/07', '16/07', '15/07', '']);
  });

  /*
   * Dán một mẩu không tiêu đề vào giữa bảng: mẩu đi XUỐNG theo thứ tự trên màn. Bảng bày mới trước, nên
   * dòng ngay dưới trên màn là phiên cũ hơn — rải theo chỉ số lưới thì cột dán vào sẽ chạy ngược lên.
   */
  it('dán một cột số vào bảng đang bày mới trước thì số đi xuống đúng như trên màn', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />);

    // Dòng trên cùng màn là 17/07, phiên mới nhất.
    await userEvent.click(screen.getByLabelText('Giá mở cửa, Dòng 1'));
    await userEvent.paste('11\n22');

    expect((screen.getByLabelText('Giá mở cửa, Dòng 1') as HTMLInputElement).value).toBe('11');
    expect((screen.getByLabelText('Giá mở cửa, Dòng 2') as HTMLInputElement).value).toBe('22');
    expect((screen.getByLabelText('Giá mở cửa, Dòng 3') as HTMLInputElement).value).toBe('25.100');
  });

  /*
   * Sắp xếp chỉ đổi thứ tự BÀY RA: bảng xếp kiểu gì thì số liệu nạp vào cũng không đổi một con số.
   * Số thứ tự ở cột đầu thì đi theo màn — chủ dự án (lượt ba): _"sao số thứ tự 1 mà lại là ngày
   * 12/09/2025 ? mà không phải là 15/09/2026"_. Dòng trên cùng luôn mang số 1, với mọi kiểu xếp.
   */
  it('số thứ tự đếm 1, 2, 3 từ trên xuống ở mọi kiểu xếp; thứ được nạp không đổi', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} initialRows={BA_PHIEN} />);
    const soCotDau = () => screen.getAllByRole('rowheader').map((th) => th.textContent);

    // Mặc định: 17/07 là dòng 1.
    expect(soCotDau()).toEqual(['1', '2', '3', '4']);
    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('17/07');

    await userEvent.click(screen.getByRole('button', { name: 'Giá đóng cửa' }));
    expect(soCotDau()).toEqual(['1', '2', '3', '4']);
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 1') as HTMLInputElement).value).toBe(
      '25.900',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Nạp 3 dòng' }));
    expect(onImport.mock.calls[0]?.[0]?.rows.map((row: { close: number }) => row.close)).toEqual([
      25400, 25300, 25900,
    ]);
  });

  /* Đang xếp mà sửa một ô thì dòng ấy đứng yên dưới ngón tay, không nhảy theo con số mới. */
  it('sửa ô của cột đang xếp thì dòng không nhảy chỗ', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />);

    await userEvent.click(screen.getByRole('button', { name: 'Giá đóng cửa' }));
    const o = screen.getByLabelText('Giá đóng cửa, Dòng 2');
    await userEvent.clear(o);
    await userEvent.type(o, '99.000');

    expect(cotTrenMan('Giá đóng cửa')).toEqual(['25.900', '99.000', '25.300', '']);
  });

  /*
   * Ô ngày in gọn ngày/tháng — chủ dự án: _"bên trên ghi năm rồi thì bên dưới trong bảng chỉ cần ghi
   * ngày tháng là tự biết"_. Chỉ là cách in: bấm vào ô là thấy lại cả ngày để sửa.
   */
  it('ô ngày in ngày/tháng, bấm vào thì hiện đủ năm để sửa', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />);
    const o = screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement;

    expect(o.value).toBe('17/07');
    await userEvent.click(o);
    expect(o.value).toBe('17/07/2026');
    await userEvent.tab();
    expect(o.value).toBe('17/07');
  });

  it('dòng năm trên lưới: một năm thì in năm ấy, hai năm thì in khoảng, lưới trắng thì không in', () => {
    const { unmount } = render(
      <PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />,
    );
    expect(screen.getByText('Năm 2026')).not.toBeNull();
    unmount();

    const quaNam = [
      { date: '30/12/2025', open: 25100, high: 25600, low: 24900, close: 25400, volume: 1250000 },
      { date: '02/01/2026', open: 25400, high: 25800, low: 25200, close: 25300, volume: 980000 },
    ];
    const lan2 = render(
      <PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={quaNam} />,
    );
    expect(screen.getByText('Từ năm 2025 tới 2026')).not.toBeNull();
    lan2.unmount();

    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.queryByText(/Năm \d{4}|Từ năm/)).toBeNull();
  });

  /* Cột Đóng: xanh khi đóng ≥ mở, cam khi đóng < mở — so với giá mở của CHÍNH phiên ấy. */
  it('ô giá đóng cửa mang chiều so với giá mở cửa của cùng phiên', () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={BA_PHIEN} />);
    const chieu = (dong: number) =>
      screen.getByLabelText(`Giá đóng cửa, Dòng ${String(dong)}`).closest('td')?.dataset.xuHuong;

    expect(chieu(1)).toBe('tang');
    expect(chieu(2)).toBe('giam');
    expect(chieu(3)).toBe('tang');
    // Dòng trống cuối lưới: thiếu giá thì không tô.
    expect(chieu(4)).toBeUndefined();
  });

  /*
   * ── Sáu cột cố định, không còn "Không dùng" — 13/10/2026 ─────────────────────────────
   *
   * Chủ dự án khoanh ô chọn "Cột 6 · Không dùng": *"tạo ô không dùng là cái gì. tôi đã trước có
   * task tôi đã yêu cầu là không có select của không dùng rồi. tạo đủ dữ liệu của 6 cột là thôi
   * không cần tạo gì nữa và cũng không thể tạo được thêm nữa. nếu khách nạp thừa thêm 1 cột dữ
   * liệu chưa rõ tên thì cứ tạo thêm 1 cột thừa ra đó"*. Các ca dưới đây ghim từng vế của câu ấy.
   */

  /** Bảng có tiêu đề, thừa một cột sản phẩm không biết tên. */
  const THUA_COT = [
    'Ngày\tGiá mở cửa\tGiá cao nhất\tGiá thấp nhất\tGiá đóng cửa\tKhối lượng\tGT khớp lệnh',
    '15/07/2026\t25,10\t25,60\t24,90\t25,40\t1.250.000\t31,7',
    '16/07/2026\t25,40\t25,80\t25,20\t25,70\t980.000\t25,1',
  ].join('\n');

  /*
   * Ca ĐẢO CHIỀU (20/10/2026): bảng chọn vai trò cột và nút "Cột 6/6" mở nó đã bỏ — chủ dự án gạch
   * chéo cả hai: _"bỏ tính năng mở cột này đi"_. Nút hay ô chọn ấy quay lại phải là một quyết định.
   */
  it('không còn nút "Cột" hay ô chọn vai trò cột nào', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={LOADED} />);

    expect(screen.queryByRole('button', { name: /^Cột/ })).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();

    // Bấm tên cột là sắp xếp, không mở bảng nào.
    await userEvent.click(screen.getByRole('button', { name: 'Giá đóng cửa' }));
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByText('Không dùng')).toBeNull();
  });

  /*
   * Dán ít cột hơn sáu thì lưới KHÔNG co lại: sáu cột vẫn đứng đủ, số rơi đúng cột của nó.
   * Trước 13/10/2026 dán hai cột là lưới còn hai cột.
   */
  it('dán bảng hai cột thì lưới vẫn đủ sáu cột, số nằm đúng cột', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,40\n16/07/2026\t25,70');

    // Sáu cột dữ liệu cộng cột số dòng.
    expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 1') as HTMLInputElement).value).toBe('25,70');
    expect((screen.getByLabelText('Giá mở cửa, Dòng 1') as HTMLInputElement).value).toBe('');
    expect((screen.getByLabelText('Khối lượng, Dòng 1') as HTMLInputElement).value).toBe('');
  });

  it('dữ liệu thừa một cột chưa rõ tên thì cột ấy đứng thêm ở cuối, dưới tên của chính nó', async () => {
    const onImport = vi.fn();
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} />);

    await paste(THUA_COT);

    // Sáu cột của chuỗi giá cộng một cột thừa. Cột thừa không xếp được, nên tên nó không là nút.
    expect(screen.getByRole('columnheader', { name: 'GT khớp lệnh' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'GT khớp lệnh' })).toBeNull();
    expect((screen.getByLabelText('GT khớp lệnh, Dòng 2') as HTMLInputElement).value).toBe('31,7');
    expect(screen.queryByText('Không dùng')).toBeNull();

    // Cột thừa không lấy mất số của cột nào: cả sáu trường vẫn được nạp.
    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));
    expect(onImport.mock.calls[0]?.[0]?.rows[0]).toMatchObject({
      date: '15/07/2026',
      open: 25.1,
      high: 25.6,
      low: 24.9,
      close: 25.4,
      volume: 1_250_000,
    });
  });

  it('bảng không có tiêu đề mà thừa cột thì cột thừa mang số thứ tự của nó', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} />);

    await paste('15/07/2026\t25,10\t25,60\t24,90\t25,40\t1.250.000\t31,7');

    expect(screen.getByRole('columnheader', { name: 'Cột 7' })).not.toBeNull();
    expect((screen.getByLabelText('Cột 7, Dòng 1') as HTMLInputElement).value).toBe('31,7');
  });

  /*
   * Ba ca đổi vai trò cột ("gán lại là hai cột đổi chỗ", "đổi kiểu gì vẫn đủ sáu trường", "cột thừa
   * nhận một vai trò thì cột trống nó thay ra được bỏ") đã BỎ ngày 20/10/2026 cùng bảng chọn cột mà
   * chúng kiểm. Cái giá, đã nói với chủ dự án: máy đoán sai vai trò một cột của file thì không còn chỗ
   * sửa trên lưới — xem docblock `DEFAULT_COLUMNS` ở PasteImportSheet.tsx.
   */

  /*
   * Một file là cả một bộ dữ liệu, nên nó THAY lưới. Trước 13/10/2026 file đè lên lưới tại ô đầu:
   * tải file hai cột Ngày · Đóng lên chuỗi đang dùng là giá đóng cửa rơi vào cột "Giá mở cửa", cột
   * Giá đóng cửa vẫn mang số CŨ và dòng cũ phía dưới còn nguyên — hai bộ số trộn vào nhau mà nút
   * vẫn mời Nạp (FR-06). Lưới gần như không bao giờ trống từ khi sheet mở ra là thấy sẵn chuỗi.
   */
  it('tải file lên lưới đang có chuỗi thì thay cả lưới, không trộn hai bộ số', async () => {
    const onImport = vi.fn();
    const DANG_DUNG = [
      ...LOADED,
      { date: '17/07/2026', open: 25700, high: 25900, low: 25100, close: 25300, volume: 870000 },
    ];
    render(<PasteImportSheet open onClose={vi.fn()} onImport={onImport} initialRows={DANG_DUNG} />);

    const file = new File(['Ngày,Đóng\n01/08/2026,30.4\n02/08/2026,30.7'], 'gia.csv', {
      type: 'text/csv',
    });
    await userEvent.upload(screen.getByLabelText('Tải file CSV'), file);

    await screen.findByRole('button', { name: 'Nạp 2 dòng' });
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 2') as HTMLInputElement).value).toBe('30.4');
    expect((screen.getByLabelText('Giá mở cửa, Dòng 1') as HTMLInputElement).value).toBe('');
    // Không còn dòng nào của chuỗi cũ.
    expect(screen.queryByDisplayValue('17/07')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: /^Nạp/ }));
    expect(onImport.mock.calls[0]?.[0]?.rows.map((row: { close: number }) => row.close)).toEqual([
      30.4, 30.7,
    ]);
  });

  /*
   * Khối dán mang theo dòng tiêu đề là cả một bảng, nên cũng thay lưới — dán vào ô nào cũng vậy.
   * Đè nó lên lưới là bỏ dòng tiêu đề rồi rải số theo vị trí: 'Ngày · Đóng · KL' dán vào chuỗi
   * đang dùng thì giá đóng cửa nằm dưới "Giá mở cửa" và khối lượng nằm dưới "Giá cao nhất".
   */
  it('dán một bảng có dòng tiêu đề lên lưới đang có chuỗi thì xếp theo tên cột, không rải theo vị trí', async () => {
    render(<PasteImportSheet open onClose={vi.fn()} onImport={vi.fn()} initialRows={LOADED} />);

    await userEvent.click(screen.getByLabelText('Giá cao nhất, Dòng 2'));
    await userEvent.paste('Ngày\tĐóng\tKL\n01/08/2026\t30,4\t500.000\n02/08/2026\t30,7\t600.000');

    expect((screen.getByLabelText('Ngày, Dòng 1') as HTMLInputElement).value).toBe('02/08');
    expect((screen.getByLabelText('Giá đóng cửa, Dòng 1') as HTMLInputElement).value).toBe('30,7');
    expect((screen.getByLabelText('Khối lượng, Dòng 1') as HTMLInputElement).value).toBe('600.000');
    expect((screen.getByLabelText('Giá mở cửa, Dòng 1') as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('button', { name: 'Nạp 2 dòng' })).not.toBeNull();
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
    expect(screen.getByRole('button', { name: 'Nạp 2 dòng' })).not.toBeNull();
  });
});
