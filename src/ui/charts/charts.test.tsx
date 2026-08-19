// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULAS,
  MARKET_CONFIG,
  SAMPLE_DATA,
  defaultInputs,
  findFormulaModule,
  runFormula,
  scheduleOrDefault,
} from '@/application';
import type { CalcContext, CalcInputs, FormulaModule, Level, SeriesRow } from '@/application';

import { ChartBody } from './ChartBody';
import { hasChart } from './FormulaChart';

/*
 * jsdom chưa cài đặt `<dialog>.showModal()`, và cũng KHÔNG có Fullscreen API hay `screen.orientation`.
 * Chỉ vá đúng hai hàm của `<dialog>`: hai thứ kia phải để nguyên là vắng mặt, vì đó chính là môi
 * trường của iPhone và ca kiểm cần chứng minh màn phóng to vẫn chạy khi thiếu chúng.
 */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

/*
 * Giả lập `history`, KHÔNG để jsdom chạy thật — và đặt cho CẢ FILE, không riêng khối test nút Back.
 *
 * Hai lý do, cả hai đều đã cắn một lần:
 * 1. `window` dùng chung cho mọi ca trong file. Mọi ca bấm "Phóng to" nay đều đẩy một mục lịch sử
 *    thật, và mục ấy rò từ ca này sang ca sau.
 * 2. `history.back()` của jsdom bất đồng bộ, nên thứ tự các ca đủ để đổi kết quả.
 */
beforeEach(() => {
  // Trả `history.state` về mốc sạch trước mỗi ca: `back()` bị vô hiệu nên mục của ca trước không
  // tự lùi ra, và cờ đánh dấu của nó còn nguyên trong state.
  window.history.replaceState(null, '');
  // `pushState` để CHẠY THẬT (spy mặc định gọi xuyên): hàm dọn đọc lại `history.state` để biết mục
  // của mình còn không, nên chặn ở đây là chặn luôn thứ đang cần kiểm.
  vi.spyOn(window.history, 'pushState');
  vi.spyOn(window.history, 'back').mockImplementation(() => undefined);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const CTX: CalcContext = {
  asOf: '2026-08-04',
  schedule: scheduleOrDefault(MARKET_CONFIG),
};

/** Bối cảnh sau khi người dùng bấm "Nạp mẫu" — 248 phiên của FPT đi thẳng vào ctx. */
const FPT_BARS: ReadonlyArray<SeriesRow> = (SAMPLE_DATA.byCode('FPT')?.bars ?? []).map(
  ({ date, open, high, low, close, volume }) => ({ date, open, high, low, close, volume }),
);

const WITH_BARS: CalcContext = {
  ...CTX,
  bars: FPT_BARS,
  series: FPT_BARS.map((bar) => bar.close).filter(
    (close): close is number => typeof close === 'number' && close > 0,
  ),
};

function moduleOf(id: string): FormulaModule {
  const found = findFormulaModule(id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

/**
 * Dựng thẳng `ChartBody`, không đi qua `FormulaChart`.
 *
 * `FormulaChart` bọc `next/dynamic` nên nội dung tới sau một nhịp; các ca dưới đây soi phần dựng
 * hình nên gọi thẳng thân biểu đồ. Ranh giới nạp trễ được kiểm ở `FormulaDetail.test.tsx`.
 */
function draw(id: string, extra: CalcInputs = {}, level: Level = 'basic') {
  const formula = moduleOf(id);
  const inputs = { ...defaultInputs(formula.spec), ...extra };

  return render(
    <ChartBody
      formula={formula}
      inputs={inputs}
      ctx={CTX}
      output={runFormula(formula, inputs, CTX)}
      level={level}
    />,
  );
}

/** Như `draw`, nhưng sau khi đã nạp 248 phiên của FPT — đường dẫn tới trục thời gian. */
function drawLoaded(id: string, extra: CalcInputs = {}, level: Level = 'basic') {
  const formula = moduleOf(id);
  const inputs = { ...defaultInputs(formula.spec), ...extra };

  return render(
    <ChartBody
      formula={formula}
      inputs={inputs}
      ctx={WITH_BARS}
      output={runFormula(formula, inputs, WITH_BARS)}
      level={level}
      seriesLabel="FPT"
    />,
  );
}

/**
 * Nạp mẫu ở chế độ Nâng cao.
 *
 * Cần riêng một lối vì công thức nhóm Nâng cao có biến khai `level: 'advanced'`, và chế độ Cơ bản ẩn
 * chúng khỏi cả màn lẫn ô chọn trục X (FR-09) — quét một ô người dùng không thấy là vẽ ra thứ họ
 * không đối chiếu được với gì.
 */
function drawLoadedAdvanced(id: string, extra: CalcInputs = {}) {
  return drawLoaded(id, extra, 'advanced');
}

describe('hasChart() — phạm vi', () => {
  it('phủ đúng 100 công thức: mọi công thức trừ nhóm khai chartType none', () => {
    const drawn = FORMULAS.filter((spec) => hasChart(spec));
    const skipped = FORMULAS.filter((spec) => !hasChart(spec));

    expect(FORMULAS).toHaveLength(111);
    expect(drawn).toHaveLength(100);
    expect(skipped).toHaveLength(11);
    // Bỏ qua thì phải vì chính cái nhãn ấy, không vì lý do nào khác lẫn vào.
    expect(skipped.every((spec) => spec.chartType === 'none')).toBe(true);
  });

  /*
   * Ba nhãn dưới đây từng là ba lý do bị loại, nay không còn lý do nào: nhóm Nâng cao (`wacc`),
   * nhóm cần chuỗi giá (`sma-n-phien`), và các loại biểu đồ chưa có renderer riêng (`fcff` khai
   * waterfall). Cả ba vẫn ra đường thật — đường quét độ nhạy hoặc đường theo thời gian.
   */
  it('không còn loại trừ theo chế độ hay theo loại biểu đồ', () => {
    expect(hasChart(moduleOf('wacc').spec)).toBe(true);
    expect(hasChart(moduleOf('sma-n-phien').spec)).toBe(true);
    expect(hasChart(moduleOf('fcff').spec)).toBe(true);
    expect(hasChart(moduleOf('var-lich-su').spec)).toBe(true);
  });

  it('phí giao dịch vẫn KHÔNG có biểu đồ — đường thẳng đoán trước được thì vẽ ra vô nghĩa', () => {
    expect(hasChart(moduleOf('phi-giao-dich-mua').spec)).toBe(false);
  });
});

describe('Biểu đồ độ nhạy — cách người dùng đọc được nó', () => {
  it('dựng figure có câu mô tả nêu đủ dải, khoảng kết quả và giá trị hiện tại', () => {
    draw('pe');

    const figure = screen.getByRole('figure');
    expect(figure.tagName).toBe('FIGURE');
    expect(screen.getByText('P/E theo Giá thị trường')).not.toBeNull();
    expect(figure.textContent).toContain('Quét Giá thị trường');
    expect(figure.textContent).toContain('giá trị hiện tại');
  });

  /*
   * SVG bị ẩn khỏi trình đọc màn hình có chủ đích: thông tin nằm ở câu mô tả và bảng số. Nhét
   * <title>/<desc> dài vào SVG được NVDA, JAWS và VoiceOver xử rất khác nhau, mà người dùng vẫn
   * không lần qua 42 điểm bằng tai được.
   */
  it('SVG ẩn khỏi trình đọc màn hình, nhưng bảng số thì HIỆN', () => {
    const { container } = draw('pe');

    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByRole('table')).not.toBeNull();
  });

  it('bảng số mang đúng con số khối Kết quả đang hiện — hai chỗ không được nói hai số', () => {
    draw('pe');

    const pe = moduleOf('pe');
    const shown = runFormula(pe, defaultInputs(pe.spec), CTX);
    const text = shown.value === null ? '' : '15,21';

    expect(screen.getByRole('table').textContent).toContain(text);
  });

  it('tiêu đề cột bảng chính là tên hai trục, kèm đơn vị', () => {
    draw('pe');

    expect(screen.getByRole('columnheader', { name: 'Giá thị trường (₫)' })).not.toBeNull();
    expect(screen.getByRole('columnheader', { name: 'P/E (lần)' })).not.toBeNull();
  });

  it('có dấu "giá trị hiện tại" trên hình — FR-08', () => {
    draw('pe');
    expect(screen.getByTestId('chart-marker')).not.toBeNull();
  });
});

describe('Biểu đồ độ nhạy — FR-06 ở tầng vẽ', () => {
  /*
   * Ca quan trọng nhất của cả nhánh. P/E chia cho EPS, nên quét EPS qua 0 phải cho đường ĐỨT.
   * Một cái `?? 0` ở bất kỳ đâu trên đường vẽ là biểu đồ nói "P/E bằng 0" ở chỗ đúng ra bỏ trống —
   * sai nguy hiểm hơn không vẽ gì, vì nó trông như một câu trả lời.
   */
  it('quét EPS qua 0: có vùng gạch chéo, bảng ghi “— , —”, kèm ghi chú vì sao ngắt', async () => {
    const pe = moduleOf('pe');
    const good = defaultInputs(pe.spec);
    const zero = { ...good, eps: 0 };

    const view = (inputs: CalcInputs) => (
      <ChartBody
        formula={pe}
        inputs={inputs}
        ctx={CTX}
        output={runFormula(pe, inputs, CTX)}
        level="basic"
      />
    );

    const { container, rerender } = render(view(good));

    // Luồng thật của người dùng: đưa EPS lên trục X, rồi gõ 0 vào ô EPS.
    await userEvent.selectOptions(screen.getByLabelText('Xem kết quả đổi theo'), 'eps');
    rerender(view(zero));

    // Vẫn còn đường cho nửa EPS dương...
    expect(container.querySelector('path[data-points]')?.getAttribute('d')).not.toBe('');
    // ...và vùng gạch chéo đánh dấu nửa không tính được.
    expect(container.querySelectorAll('rect[fill^="url(#"]').length).toBeGreaterThan(0);

    expect(screen.getByRole('table').textContent).toContain('— , —');
    expect(screen.getByRole('note').textContent).toContain('không tính được');
    // Và tuyệt đối không có mức nào hiện thành 0 lần.
    expect(screen.getByRole('table').textContent).not.toContain('0 lần');
  });

  it('EPS = 0 mà trục X là giá thì mọi mức đều lỗi — nói ĐÚNG câu khối Kết quả, không vẽ khung rỗng', () => {
    const { container } = draw('pe', { eps: 0 });

    expect(screen.queryByRole('figure')).toBeNull();
    // `path[data-points]` là thẻ của ĐƯỜNG QUÉT; `path` trần cũng khớp biểu tượng InlineWarning.
    expect(container.querySelector('path[data-points]')).toBeNull();
    expect(screen.getByRole('status').textContent).toContain('EPS');
  });

  it('không lọt NaN, Infinity hay undefined ra màn', () => {
    for (const [id, extra] of [
      ['pe', {}],
      ['pe', { eps: 0 }],
      ['roe', {}],
      ['lai-kep', {}],
    ] as const) {
      const { container, unmount } = draw(id, extra);

      expect(container.textContent, id).not.toContain('NaN');
      expect(container.textContent, id).not.toContain('Infinity');
      expect(container.textContent, id).not.toContain('undefined');
      // Cả trong thuộc tính SVG, nơi Chrome sẽ im lặng bỏ qua cả path.
      expect(container.innerHTML, id).not.toContain('NaN');
      unmount();
    }
  });

  it('công thức chờ chuỗi giá thì nói rõ thiếu gì kèm câu chỉ đường, không vẽ khung rỗng', () => {
    draw('rsi-wilder');

    // Không dò `svg` — `InlineWarning` có biểu tượng SVG riêng. Dò đúng thứ vắng mặt: cái hình.
    expect(screen.queryByRole('figure')).toBeNull();
    expect(screen.queryByRole('table')).toBeNull();

    const warning = screen.getByRole('status').textContent ?? '';
    expect(warning).toContain('phiên giá');
    // Phải có câu chỉ đường, không được báo lỗi rồi bỏ mặc (NFR-USA-04).
    expect(warning).toMatch(/Nạp bộ số liệu mẫu|dán chuỗi giá/i);
  });
});

describe('Đường theo thời gian — nạp mã rồi thì vẽ theo số liệu của mã', () => {
  it('nạp FPT xong thì biểu đồ tự vẽ theo 248 phiên, câu mô tả nói rõ mã nào', () => {
    drawLoaded('pe');

    expect(screen.getByText('P/E theo thời gian')).not.toBeNull();

    const figure = screen.getByRole('figure');
    expect(figure.textContent).toContain('P/E của FPT qua 248 phiên');
    // Phải nói rõ mã: một biểu đồ ghi "qua 248 phiên" mà không nói phiên của mã nào thì người đọc
    // không kiểm chứng được con số nào.
    expect(figure.textContent).toContain('Phiên gần nhất');
  });

  it('cột đầu bảng số là NGÀY thật, không phải chỉ số phiên', () => {
    drawLoaded('pe');

    expect(screen.getByRole('columnheader', { name: 'Ngày' })).not.toBeNull();
    expect(screen.getByRole('table').textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('ô chọn có mục "Theo thời gian" đứng đầu và đang được chọn', () => {
    drawLoaded('pe');

    const picker = screen.getByLabelText('Xem kết quả đổi theo') as HTMLSelectElement;
    const labels = [...picker.options].map((option) => option.textContent);

    expect(labels[0]).toBe('Theo thời gian');
    expect(labels).toContain('Giá thị trường');
    expect(picker.selectedIndex).toBe(0);
  });

  it('đổi về một biến thì quay lại đường giả định, và lựa chọn đó được giữ', async () => {
    drawLoaded('pe');

    await userEvent.selectOptions(screen.getByLabelText('Xem kết quả đổi theo'), 'eps');

    expect(screen.getByText('P/E theo EPS')).not.toBeNull();
    expect(screen.queryByText('P/E theo thời gian')).toBeNull();
  });

  /*
   * Trước đợt này, bảy chỉ báo kỹ thuật quét theo CHU KỲ — "RSI đổi thế nào khi chu kỳ chạy từ 5
   * tới 30 phiên". Câu đó đúng nhưng khó với người mới. Có chuỗi giá rồi thì câu dễ hơn hẳn là
   * "RSI của FPT trong một năm qua", và nó vẽ được mà `rsi-wilder` không phải sửa một dòng nào.
   */
  it('chỉ báo cuộn vẽ được theo thời gian nhờ cắt tiền tố chuỗi', () => {
    drawLoaded('rsi-wilder');

    const figure = screen.getByRole('figure');
    expect(figure.textContent).toContain('theo thời gian');
    // Mấy phiên đầu chưa đủ dữ liệu, và câu mô tả phải nói ra chứ không vẽ liền một đường.
    expect(figure.textContent).toContain('phiên đầu chưa đủ dữ liệu');
  });

  /*
   * RSI-14 không tồn tại ở phiên thứ 3 — đó là cách chỉ báo cuộn hoạt động, không phải chỗ hỏng.
   * Bản trước gọi cả 14 phiên ấy là "đường ngắt", làm người đọc đi tìm một sự cố không có. Nay câu
   * mô tả nói đúng bản chất và KHÔNG có dòng cảnh báo nào, còn `he-so-bien-thien` — ngắt thật ở
   * giữa vùng có dữ liệu — thì vẫn phải có.
   */
  it('dải khởi động đầu chuỗi KHÔNG bị gọi là đường ngắt', () => {
    drawLoaded('rsi-wilder');

    expect(screen.getByRole('figure').textContent).toContain('đường bắt đầu từ');
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('ngắt giữa vùng có dữ liệu thì vẫn cảnh báo — hai chuyện khác nhau', () => {
    drawLoadedAdvanced('he-so-bien-thien');

    expect(screen.getByRole('note').textContent).toContain('không tính được');
  });

  it('phiên đầu chưa đủ dữ liệu thì bảng ghi "— , —", tuyệt đối không ghi 0', () => {
    const { container } = drawLoaded('rsi-wilder');
    const table = screen.getByRole('table').textContent ?? '';

    expect(table).toContain('— , —');
    expect(table).not.toContain('0,00 điểm');
    // Và vùng gạch chéo đánh dấu đúng quãng ấy trên hình.
    expect(container.querySelectorAll('rect[fill^="url(#"]').length).toBeGreaterThan(0);
  });

  it('công thức không liên quan tới giá thì nạp mẫu cũng không sinh mục thời gian', () => {
    drawLoaded('lai-kep');

    const picker = screen.queryByLabelText('Xem kết quả đổi theo');
    const labels =
      picker === null ? [] : [...(picker as HTMLSelectElement).options].map((o) => o.textContent);

    expect(labels).not.toContain('Theo thời gian');
  });

  it('không lọt NaN hay undefined ra màn ở chế độ thời gian', () => {
    for (const id of ['pe', 'pb', 'rsi-wilder', 'loi-nhuan-rong', 'stochastic-k']) {
      const { container, unmount } = drawLoaded(id);

      expect(container.textContent, id).not.toContain('NaN');
      expect(container.textContent, id).not.toContain('undefined');
      expect(container.innerHTML, id).not.toContain('NaN');
      unmount();
    }
  });
});

describe('Biểu đồ độ nhạy — đổi trục X', () => {
  it('ô chọn liệt kê đủ biến quét được, mặc định là biến Domain đã chọn', () => {
    draw('pe');

    const picker = screen.getByLabelText('Xem kết quả đổi theo') as HTMLSelectElement;
    expect([...picker.options].map((option) => option.value)).toEqual(['price', 'eps']);
    expect(picker.value).toBe('price');
  });

  it('đổi ô chọn thì trục X và bảng đổi theo', async () => {
    draw('pe');

    await userEvent.selectOptions(screen.getByLabelText('Xem kết quả đổi theo'), 'eps');

    expect(screen.getByText('P/E theo EPS')).not.toBeNull();
    expect(screen.getByRole('columnheader', { name: 'EPS (₫)' })).not.toBeNull();
  });

  it('chỉ một biến quét được thì không bày ô chọn ra làm gì', () => {
    // Lãi kép ở chế độ Cơ bản chỉ hở vài ô; ca này chốt nguyên tắc, không chốt công thức nào.
    const { container } = draw('pe');
    const selects = container.querySelectorAll('select');

    expect(selects.length).toBeLessThanOrEqual(1);
  });
});

/*
 * Bốn họ vừa mở phạm vi, mỗi họ một ca đại diện — không lặp lại 47 lần.
 *
 * Ranh giới cố ý: tầng Domain đã có ca quét CẢ 108 công thức ở `chart.test.ts` (nhanh gấp bội vì
 * không dựng DOM), nên ở đây chỉ kiểm điều duy nhất jsdom mới nói được: bốn họ ấy thật sự dựng ra
 * `<figure>` với bảng số đọc được, chứ không phải một mô hình đúng mà giao diện không lắp nổi.
 */
describe('Phạm vi mở rộng — bốn họ công thức mới có biểu đồ', () => {
  it('nhóm Nâng cao: WACC quét theo biến nâng cao và có bảng số', () => {
    drawLoadedAdvanced('wacc');

    expect(screen.getByRole('figure')).not.toBeNull();
    expect(screen.getByRole('table').textContent).toContain('%');
  });

  it('nhóm cần chuỗi giá: SMA vẽ thành đường theo từng phiên', () => {
    drawLoaded('sma-n-phien');

    // `/theo thời gian/` khớp cả tiêu đề, câu mô tả và mục trong ô chọn — dò trong `<figure>`.
    expect(screen.getByRole('figure').textContent).toContain('theo thời gian');
    expect(screen.getByRole('columnheader', { name: 'Ngày' })).not.toBeNull();
  });

  it('nhóm phân phối: VaR lịch sử vẽ được, và nói rõ 59 phiên đầu chưa đủ quan sát', () => {
    drawLoadedAdvanced('var-lich-su');

    const figure = screen.getByRole('figure');
    expect(figure.textContent).toContain('phiên đầu chưa đủ dữ liệu');
    expect(screen.getByRole('table').textContent).toContain('— , —');
  });

  /*
   * `fcff` khai `waterfall`. Renderer thác nước cần Registry khai thứ tự từng chặng, chưa có — nên
   * tạm thời nó nhận đường quét độ nhạy. Đó là một biểu đồ ĐÚNG, chỉ chưa phải biểu đồ lý tưởng, và
   * đúng hơn hẳn khung "sẽ có ở bản sau" mà nó đứng trước đó.
   */
  it('nhóm chưa có renderer riêng: FCFF nhận đường quét độ nhạy chứ không bỏ trống', () => {
    drawLoadedAdvanced('fcff');

    expect(screen.getByRole('figure')).not.toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('không lọt NaN, Infinity hay undefined ở bất kỳ họ nào trong bốn họ', () => {
    for (const id of ['wacc', 'sma-n-phien', 'var-lich-su', 'fcff', 'ty-so-treynor', 'ev']) {
      const { container, unmount } = drawLoadedAdvanced(id);

      expect(container.textContent, id).not.toContain('NaN');
      expect(container.textContent, id).not.toContain('Infinity');
      expect(container.textContent, id).not.toContain('undefined');
      expect(container.innerHTML, id).not.toContain('NaN');
      unmount();
    }
  });
});

/*
 * Phóng to biểu đồ.
 *
 * Điều đáng canh nhất ở đây KHÔNG phải chuyện mở được lớp phủ, mà là **nó vẫn mở được khi Fullscreen
 * API và `screen.orientation` đều vắng mặt** — đúng môi trường Safari trên iPhone, và cũng đúng môi
 * trường jsdom nên ca kiểm chứng minh được điều đó mà không phải giả lập gì. Nếu ai đó sau này viết
 * lại phần này dựa vào `requestFullscreen()`, những ca dưới đây đỏ ngay.
 */
describe('Phóng to biểu đồ toàn màn hình', () => {
  /** Lớp phủ phóng to — `<dialog>` đang mở, dò bằng vai `dialog`. */
  function manPhongTo(): HTMLElement | null {
    return screen.queryByRole('dialog');
  }

  it('nút phóng to đứng CẠNH ô chọn trục X, trong cùng một hàng', () => {
    const { container } = draw('pe');

    const row = container.querySelector('[class*="controls"]');
    if (row === null) throw new Error('Thiếu hàng điều khiển của biểu đồ.');

    expect(within(row as HTMLElement).getByRole('button', { name: /Phóng to/ })).not.toBeNull();
    expect(within(row as HTMLElement).getByLabelText('Xem kết quả đổi theo')).not.toBeNull();
  });

  /*
   * `SweepPicker` tự trả `null` khi công thức chỉ có một biến quét được. Nút phóng to phải CÒN ở đúng
   * những công thức ấy — đó là lý do nó là khe riêng của `ChartFrame` chứ không nhét vào `picker`.
   */
  it('công thức chỉ có một biến quét được thì vẫn có nút phóng to', () => {
    draw('lai-suat-hieu-dung');

    expect(screen.queryByLabelText('Xem kết quả đổi theo')).toBeNull();
    expect(screen.getByRole('button', { name: /Phóng to/ })).not.toBeNull();
  });

  it('chưa bấm thì không dựng lớp phủ nào — không nhân đôi thẻ SVG của 97 trang', () => {
    const { container } = draw('pe');

    expect(manPhongTo()).toBeNull();
    /*
     * Đúng MỘT đường quét trong DOM, không phải hai. Đếm `path[data-points]` chứ không đếm `<svg>`:
     * nút phóng to và nút thoát cũng là SVG, còn thẻ này chỉ đường quét mới có.
     */
    expect(container.querySelectorAll('path[data-points]')).toHaveLength(1);
  });

  it('bấm là mở lớp phủ mang đúng tên biểu đồ, kèm hình và nút thoát', async () => {
    draw('pe');

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    const overlay = manPhongTo();
    if (overlay === null) throw new Error('Bấm phóng to mà không mở lớp phủ.');

    // Tên vùng lấy từ tiêu đề biểu đồ, để trình đọc màn hình biết mình vừa vào đâu.
    expect(
      within(overlay).getByRole('heading', { name: 'P/E theo Giá thị trường' }),
    ).not.toBeNull();
    expect(overlay.querySelector('svg')).not.toBeNull();
    expect(within(overlay).getByRole('button', { name: 'Thoát phóng to' })).not.toBeNull();
  });

  it('ô chọn trục X bày lại trong lớp phủ, và đổi ở đó thì đổi cả biểu đồ', async () => {
    draw('pe');

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));
    const overlay = manPhongTo();
    if (overlay === null) throw new Error('Bấm phóng to mà không mở lớp phủ.');

    await userEvent.selectOptions(within(overlay).getByLabelText('Xem kết quả đổi theo'), 'eps');

    // Một state, hai chỗ dựng: tiêu đề trong lớp phủ đổi, và tiêu đề trên trang cũng đổi theo.
    expect(within(overlay).getByRole('heading', { name: 'P/E theo EPS' })).not.toBeNull();
    expect(screen.getByRole('figure').textContent).toContain('P/E theo EPS');
  });

  it('bấm thoát thì đóng lại, hình trên trang vẫn còn nguyên', async () => {
    draw('pe');

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Thoát phóng to' }));

    expect(manPhongTo()).toBeNull();
    expect(screen.getByRole('figure')).not.toBeNull();
  });

  /*
   * jsdom trả `matches: false` cho mọi media query, tức "không phải màn dọc", nên câu nhờ xoay đúng ra
   * KHÔNG hiện. Ca này chốt chiều đó: câu nhắc chỉ xuất hiện khi máy đang dọc, không phải bày ra cho
   * mọi người kể cả người đang xem trên máy tính.
   */
  it('máy không ở chiều dọc thì không bày câu nhờ xoay ngang', async () => {
    draw('pe');

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    expect(screen.queryByText(/Xoay ngang điện thoại/)).toBeNull();
  });

  it('màn dọc thì nhờ xoay, và vì không khoá xoay được nên nói luôn cách bật', async () => {
    // Giả lập đúng một điều: máy đang để dọc. Fullscreen API và `screen.orientation` vẫn vắng mặt.
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('portrait'),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;

    try {
      draw('pe');
      await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

      const hint = screen.getByRole('status');
      expect(hint.textContent).toContain('Xoay ngang điện thoại');
      // Không khoá xoay được thì phải chỉ luôn cách bật, chứ không nhờ suông (NFR-USA-04).
      expect(hint.textContent).toContain('bật Xoay màn hình');
    } finally {
      window.matchMedia = original;
    }
  });

  it('không lọt NaN hay undefined vào lớp phủ, kể cả ở công thức có đoạn ngắt', async () => {
    for (const id of ['pe', 'rsi-wilder']) {
      const { container, unmount } = drawLoaded(id);

      await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

      expect(container.textContent, id).not.toContain('NaN');
      expect(container.textContent, id).not.toContain('undefined');
      expect(container.innerHTML, id).not.toContain('NaN');
      unmount();
    }
  });
});

/*
 * `id` trong cây biểu đồ phải TẤT ĐỊNH.
 *
 * Cả thư mục charts nằm sau ranh giới `next/dynamic`, chỗ mà `useId()` sinh chuỗi lệch nhau giữa
 * lần dựng HTML tĩnh và lần hydrate — giả lập Android đo được 5 lượt cảnh báo mỗi trang có biểu đồ.
 * Ba ca dưới đây là thứ giữ cho nó không quay lại; grep không dùng được vì chính các dòng chú thích
 * trong `ChartBody` cũng chứa chữ `useId`.
 */
describe('id của biểu đồ — tất định, không do React sinh', () => {
  /** Hình dạng id React tự sinh: `:r3:` ở React 18, `«r3»` ở bản dựng sẵn phía máy chủ. */
  const ID_CUA_REACT = /^[:«]/;

  it('figcaption mang id ghép từ mã công thức, và figure trỏ đúng vào đó', () => {
    const { container } = draw('pe');

    const figure = container.querySelector('figure');
    const caption = container.querySelector('figcaption');

    expect(caption?.id).toBe('chart-pe-caption');
    expect(figure?.getAttribute('aria-labelledby')).toBe('chart-pe-caption');
  });

  /*
   * Bản trên trang và bản phóng to CÙNG nằm trong DOM khi lớp phủ mở. `<pattern id>` phải duy nhất
   * trong cả tài liệu; trùng thì trình duyệt lấy node đầu và vùng gạch chéo của màn phóng to trỏ
   * nhầm sang hình bên dưới. Hậu tố `-full` là thứ ngăn điều đó.
   */
  it('mở lớp phủ thì có hai pattern gạch chéo, và hai id KHÁC nhau', async () => {
    const { container } = draw('pe');

    expect(container.querySelectorAll('pattern')).toHaveLength(1);

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    const ids = [...container.querySelectorAll('pattern')].map((node) => node.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    expect(ids).toContain('chart-pe-hatch');
    expect(ids).toContain('chart-pe-full-hatch');
  });

  /*
   * Ô chọn trục X cũng nằm trong cây này, và `Select` primitive mặc định tự sinh `id` bằng
   * `useId()` — chính ca kiểm này bắt được nó ở lần vá đầu. Quét cả cây thay vì liệt kê từng
   * component là để lần sau ai thêm một primitive mới vào đây thì đỏ ngay, không phải nhớ.
   */
  it('không id nào trong cây biểu đồ mang hình dạng React tự sinh', async () => {
    const { container } = draw('pe');
    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.filter((id) => ID_CUA_REACT.test(id))).toEqual([]);
  });

  /*
   * Renderer thác nước cũng phải đi qua đúng phép quét ấy, kể cả bản trong màn phóng to.
   * Bỏ sót nó thì bất biến "không `useId()`" không được gác cho renderer mới, và lớp lỗi
   * 5-cảnh-báo-lệch-hydration-mỗi-trang quay lại lặng lẽ ở đúng những trang có bóc tách.
   */
  it('cây biểu đồ THÁC NƯỚC cũng không có id nào do React sinh, kể cả khi phóng to', async () => {
    const { container } = draw('ev');
    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    const ids = [...container.querySelectorAll('[id]')].map((node) => node.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.filter((id) => ID_CUA_REACT.test(id))).toEqual([]);
  });

  it('cả bốn nhánh dựng của ChartBody đều sạch: quét, bóc tách, theo thời gian, chờ dữ liệu', () => {
    // 'sma-n-phien' chưa nạp chuỗi thì rơi vào nhánh `unavailable` — nhánh dựng InlineWarning.
    for (const [nhan, ket] of [
      ['đường quét', draw('pe')],
      ['bóc tách', draw('ev')],
      ['theo thời gian', drawLoaded('sma-n-phien')],
      ['chờ dữ liệu', draw('sma-n-phien')],
    ] as const) {
      const ids = [...ket.container.querySelectorAll('[id]')].map((node) => node.id);
      expect(
        ids.filter((id) => ID_CUA_REACT.test(id)),
        nhan,
      ).toEqual([]);
      ket.unmount();
    }
  });
});

/*
 * Nút Back của hệ thống khi đang phóng to.
 *
 * Lỗi gốc, đo trên giả lập Pixel 7: `<dialog>` không có liên kết nào với lịch sử, nên Back đi thẳng
 * bước điều hướng — người dùng rời `/cong-thuc/pe/` về `/cong-thuc/` và MẤT HẾT số vừa gõ. Lớp phủ
 * "đóng" chỉ vì cả trang bị tháo.
 *
 * Những ca dưới đây kiểm CƠ CHẾ (đẩy mục, nghe popstate, tự dọn). Phần triệu chứng — số đã gõ còn
 * nguyên sau khi bấm Back — phải kiểm trên giả lập mobile, jsdom không có nút Back.
 */
describe('Nút Back của hệ thống — đóng lớp phủ, không rời trang', () => {
  it('chưa bấm phóng to thì không đụng gì tới lịch sử', () => {
    draw('pe');

    expect(window.history.pushState).not.toHaveBeenCalled();
  });

  /*
   * Đối số state phải GIỮ NGUYÊN khoá đã có: App Router của Next vá `pushState` và giữ cây route
   * trong `history.state`. Đẩy object trơn là ghi đè nó, và Back về thì router dựng lại sai nhánh.
   */
  it('bấm phóng to thì đẩy đúng một mục, và không ghi đè state sẵn có của router', async () => {
    window.history.replaceState({ __NA: 'cây route của Next' }, '');
    draw('pe');

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    expect(window.history.pushState).toHaveBeenCalledTimes(1);
    expect(window.history.state).toMatchObject({
      __NA: 'cây route của Next',
      ffbChartZoom: true,
    });
  });

  it('bấm Back thì lớp phủ đóng, và KHÔNG lùi thêm bước nào nữa', async () => {
    draw('pe');
    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));
    expect(screen.queryByRole('dialog')).not.toBeNull();

    fireEvent(window, new PopStateEvent('popstate'));

    expect(screen.queryByRole('dialog')).toBeNull();
    // Ca chống gỡ hai lần: mục của ta vừa bị chính cú Back gỡ đi. Gọi `back()` ở hàm dọn nữa là
    // lùi một bước THẬT — đúng cái lỗi bản vá này đang chặn.
    expect(window.history.back).not.toHaveBeenCalled();
  });

  it('đóng bằng nút X thì tự gỡ mục đã đẩy, không để rác lịch sử', async () => {
    draw('pe');
    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Thoát phóng to' }));

    expect(window.history.back).toHaveBeenCalledTimes(1);
    expect(window.history.pushState).toHaveBeenCalledTimes(1);
  });

  it('mở lại lần hai thì đẩy lại mục mới — cờ của lần trước không kẹt', async () => {
    draw('pe');

    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Thoát phóng to' }));
    await userEvent.click(screen.getByRole('button', { name: /Phóng to/ }));

    expect(window.history.pushState).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('dialog')).not.toBeNull();
  });
});
