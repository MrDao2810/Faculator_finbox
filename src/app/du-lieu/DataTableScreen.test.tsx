// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  PRICE_SERIES_KEY,
  WORKING_SERIES_KEY,
  serializeStoredSeries,
  serializeWorkingSeries,
} from '@/application';
import type { SeriesRow } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { DataTableScreen } from './DataTableScreen';

/**
 * Màn WF-05 Bảng dữ liệu — ca kiểm đầu tiên của màn này.
 *
 * Màn dựng từ đợt 6 mà chưa từng có file test, và đó chính là lý do chủ dự án phải tự phát hiện
 * ra rằng bảng "quá mờ nhạt … không biết là có thể nhập liệu được vào đó": không có gì ghim lại
 * rằng từng ô của bảng là một ô NHẬP chứ không phải chữ chỉ để đọc.
 *
 * Hình thức (viền, nền) thì jsdom không đo được — CSS Module ở đây chỉ là tên lớp giả. Nên phần
 * ghim được là phần ngữ nghĩa: ô phải là `<input>` sửa được, và ô số chưa điền phải có dấu gạch
 * chờ thay vì trắng trơn.
 */

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(''),
}));

/** Hai sheet WF-10/WF-11 dựng sẵn trong cây; jsdom chưa cài đặt <dialog>.showModal(). */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

/**
 * Đúng hình dạng chuỗi mà chủ dự án gặp: chỉ có giá đóng cửa, cột ngày là chỉ số phiên, bốn cột
 * Mở/Cao/Thấp/Khối lượng bỏ trống — do "Xem ví dụ minh hoạ" của trang công thức Beta đổ sang.
 */
const CHI_CO_GIA_DONG: ReadonlyArray<SeriesRow> = [
  { date: '1', open: null, high: null, low: null, close: 100, volume: null },
  { date: '2', open: null, high: null, low: null, close: 100.44999999999997, volume: null },
];

function napBang(rows: ReadonlyArray<SeriesRow> = CHI_CO_GIA_DONG): void {
  window.localStorage.setItem(PRICE_SERIES_KEY, serializeStoredSeries({ code: 'VNM', rows }));
}

function moMan() {
  return render(
    <PreferencesProvider>
      <DataTableScreen />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  // Chuỗi đã thay tại chỗ ở màn chi tiết sống trong kho phiên — không dọn thì nó chảy sang ca sau.
  window.sessionStorage.clear();
});

afterEach(cleanup);

describe('DataTableScreen — bảng phải đọc ra là bảng nhập được', () => {
  it('mỗi ô của bảng là một <input> sửa được, không phải chữ chỉ để đọc', async () => {
    napBang();
    moMan();

    // Sáu cột × hai dòng. Lấy theo nhãn trợ năng chứ không theo tên lớp CSS.
    const oDong = await screen.findByLabelText('Dòng 2 · Đóng');

    expect(oDong.tagName).toBe('INPUT');
    expect((oDong as HTMLInputElement).readOnly).toBe(false);
    expect((oDong as HTMLInputElement).disabled).toBe(false);
  });

  /*
   * Ô Ngày từng KHÔNG có dấu gạch chờ (ca này ghim điều ngược lại). Chủ dự án 20/10/2026: _"chỗ nhập
   * ngày đang để trống không có _ _ ở dưới ẩn ý là được nhập"_ — nên cả sáu ô cùng một dấu.
   */
  it('ô chưa điền hiện dấu gạch chờ, cả ô ngày lẫn ô số', async () => {
    napBang();
    moMan();

    const oMo = await screen.findByLabelText('Dòng 1 · Mở');
    const oNgay = await screen.findByLabelText('Dòng 1 · Ngày');

    // Trắng trơn thì đọc ra là ô khoá — đúng thứ chủ dự án báo là "quá mờ nhạt".
    expect(oMo.getAttribute('placeholder')).toBe('_ _');
    expect(oNgay.getAttribute('placeholder')).toBe('_ _');
  });

  /*
   * Cột Ngày để `inputMode="text"` cho tới 14/09/2026, ngày chủ dự án chốt đưa nó vào cùng luật với
   * các ô số: bàn phím số, không chữ cái. Đổi dòng ghim này phải đọc kèm cái bẫy đi liền — bàn phím
   * số KHÔNG có phím '/', nên `withSeriesDateSlashes()` lúc rời ô là phần bù bắt buộc. Ai gỡ nó là
   * khoá người dùng điện thoại ra khỏi cột này; hai ca dưới giữ đúng chỗ đó.
   */
  it('bàn phím số của điện thoại mở đúng loại cho từng cột', async () => {
    napBang();
    moMan();

    expect((await screen.findByLabelText('Dòng 1 · Đóng')).getAttribute('inputmode')).toBe(
      'decimal',
    );
    expect((await screen.findByLabelText('Dòng 1 · Ngày')).getAttribute('inputmode')).toBe(
      'numeric',
    );
  });

  it('ô Ngày không nhận chữ cái, chỉ chữ số và dấu ngăn', async () => {
    napBang([{ date: '', open: null, high: null, low: null, close: 100, volume: null }]);
    moMan();

    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;
    await userEvent.type(oNgay, 'ngày 15/07');

    expect(oNgay.value).toBe('15/07');
  });

  it('gõ tám chữ số rồi rời ô thì tự thành ngày có dấu ngăn', async () => {
    napBang([{ date: '', open: null, high: null, low: null, close: 100, volume: null }]);
    moMan();

    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;
    await userEvent.type(oNgay, '07092026');
    expect(oNgay.value).toBe('07092026');

    await userEvent.tab();

    // Rời ô thì in gọn ngày/tháng (năm in một lần trên bảng); chạm lại là thấy đủ ngày đã ghép dấu.
    const sau = screen.getByLabelText('Dòng 1 · Ngày') as HTMLInputElement;
    expect(sau.value).toBe('07/09');
    fireEvent.focus(sau);
    expect(sau.value).toBe('07/09/2026');
  });

  /* Chuỗi minh hoạ trang Beta ghi số thứ tự phiên vào cột này — chạm vào rồi rời ra không được đổi. */
  it('số thứ tự phiên vẫn gõ được, không bị chèn dấu', async () => {
    napBang();
    moMan();

    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;
    const truoc = oNgay.value;
    expect(truoc).toMatch(/^\d$/);

    await userEvent.click(oNgay);
    await userEvent.tab();

    expect((screen.getByLabelText('Dòng 1 · Ngày') as HTMLInputElement).value).toBe(truoc);
  });
});

/*
 * ── Cột Ngày nói MỘT lối viết: ngày/tháng/năm (13/10/2026) ───────────────────────────────────
 *
 * Chủ dự án báo ở màn Danh mục: cột in `03/10/2026`, ô sửa in `10/03/2026`, và yêu cầu rà cả sản
 * phẩm cho đồng bộ. Bảng này mắc cùng kiểu lỗi theo cách riêng: bộ mẫu và Finbox ghi ISO, người
 * dùng gõ kiểu Việt, nên một cột in hai lối viết — và cùng một phiên hiện '2026-09-08' ở đây nhưng
 * '08/09/2026' trên trục biểu đồ của màn chi tiết.
 */
describe('DataTableScreen — cột Ngày chỉ in ngày/tháng/năm', () => {
  const MOT_PHIEN = { open: null, high: null, low: null, close: 100, volume: null } as const;

  it('bảng cất dạng ISO thì mở ra in ngày/tháng/năm, và kho được ghi lại theo lối ấy', async () => {
    napBang([{ date: '2026-10-03', ...MOT_PHIEN }]);
    moMan();

    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;

    // Ngày 3 tháng 10 — không phải '2026-10-03', càng không phải '10/03/2026'. Ô in gọn ngày/tháng,
    // chạm vào là đủ năm.
    expect(oNgay.value).toBe('03/10');
    fireEvent.focus(oNgay);
    expect(oNgay.value).toBe('03/10/2026');
    await waitFor(() => {
      expect(ngayDaLuu()).toEqual(['03/10/2026']);
    });
  });

  it('gõ ngày kiểu ISO rồi rời ô thì ô tự về ngày/tháng/năm', async () => {
    napBang([{ date: '', ...MOT_PHIEN }]);
    moMan();

    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;
    await userEvent.type(oNgay, '2026-10-03');
    // Đang gõ thì KHÔNG đổi chữ dưới tay: đổi là con trỏ nhảy.
    expect(oNgay.value).toBe('2026-10-03');

    await userEvent.tab();

    expect((screen.getByLabelText('Dòng 1 · Ngày') as HTMLInputElement).value).toBe('03/10');
    expect(ngayDaLuu()).toEqual(['03/10/2026']);
  });

  it('ngày thiếu năm giữ nguyên — bảng không tự suy ra năm', async () => {
    napBang([{ date: '15/07', ...MOT_PHIEN }]);
    moMan();

    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;
    await userEvent.click(oNgay);
    await userEvent.tab();

    expect((screen.getByLabelText('Dòng 1 · Ngày') as HTMLInputElement).value).toBe('15/07');
  });

  /*
   * Vế LOGIC của cùng lỗi, không chỉ là chuyện chữ: phép dò ngày trùng từng so theo chữ trong ô,
   * nên '03/10/2026' gõ tay và '2026-10-03' của bộ mẫu là hai khoá khác nhau. Một phiên nằm hai
   * dòng mà cột kiểm tra im lặng, và chuỗi có phiên lặp làm độ biến động tụt xuống (FR-06).
   */
  it('cùng một ngày viết hai lối vẫn bị báo là ngày trùng', async () => {
    napBang([
      { date: '2026-10-02', ...MOT_PHIEN },
      { date: '2026-10-03', ...MOT_PHIEN },
      { date: '', ...MOT_PHIEN },
    ]);
    moMan();

    /*
     * Dòng chưa có ngày nằm trên cùng (cuối mảng). Gõ kiểu ISO và CHƯA rời ô: lúc này ô mang
     * '2026-10-03' còn dòng bên dưới đã được đưa về '03/10/2026' lúc mở màn — hai chữ khác nhau,
     * một ngày. Câu báo in ngày theo lối của bảng.
     */
    const oNgay = (await screen.findByLabelText('Dòng 1 · Ngày')) as HTMLInputElement;
    expect(oNgay.value).toBe('');
    expect((screen.getByLabelText('Dòng 2 · Ngày') as HTMLInputElement).value).toBe('03/10');
    expect(ngayDaLuu()).toEqual(['02/10/2026', '03/10/2026', '']);
    await userEvent.type(oNgay, '2026-10-03');
    expect(oNgay.value).toBe('2026-10-03');

    expect(await screen.findByText(/Ngày 03\/10\/2026 xuất hiện ở hơn một dòng/)).toBeTruthy();
  });
});

/*
 * Dòng ghi chú "Chuỗi giá chỉ lưu trên thiết bị này (localStorage). Không gửi lên máy chủ." bị bỏ
 * ngày 25/08/2026 theo yêu cầu của chủ dự án — người dùng không cần đọc nó.
 *
 * Ghim lại vì câu ấy trước đó được docblock của màn viện dẫn NFR-SEC-01/COM-03, nên rất dễ bị
 * dựng lại "cho đúng yêu cầu". Bỏ được là vì màn này KHÔNG gọi mạng lần nào.
 *
 * Vế cũ ở đây — "chỗ thật sự cần cảnh báo là màn Danh mục, `portfolio.localOnly` vẫn còn nguyên"
 * — nay đã sai: dải ấy cũng bỏ ngày 09/09/2026 theo yêu cầu chủ dự án, nên không màn nào còn nói.
 * Xem `PortfolioScreen.test.tsx`, mục "dữ liệu riêng tư: cam kết còn, câu nói ra thì không".
 */
describe('DataTableScreen — không còn dòng ghi chú localStorage', () => {
  it('bảng có số liệu: không nhắc localStorage, cũng không nhắc "máy chủ"', async () => {
    napBang();
    const { container } = moMan();

    await screen.findByLabelText('Dòng 1 · Đóng');

    expect(container.textContent).not.toContain('localStorage');
    expect(container.textContent).not.toContain('máy chủ');
    expect(screen.queryByText('CỤC BỘ')).toBeNull();
  });

  it('bảng trống cũng vậy — dòng ghi chú trước đây đứng ngoài khối bảng', async () => {
    const { container } = moMan();

    await screen.findByText(/Bảng đang trống/);

    expect(container.textContent).not.toContain('localStorage');
    expect(screen.queryByText('CỤC BỘ')).toBeNull();
  });
});

/**
 * Thứ tự bảng — chủ dự án chốt 10/09/2026, cùng đợt với bản vẽ biểu đồ nến:
 * *"hiển thị dữ liệu trong bảng số liệu ngày mới nhất lên đầu, và tạo thêm dòng thì hiển thị trên
 * đầu, sau khi nhập liệu xong rồi mới check ngày rồi sort"*.
 *
 * Ba ca dưới gác ba vế của câu ấy, cộng một ca gác thứ đắt nhất nếu làm sai: **mảng đã lưu vẫn
 * theo thời gian cũ → mới**. `closesOf()` đọc mảng ấy như một chuỗi thời gian, nên lật nó là Beta,
 * độ biến động và VaR tính ngược mà không có gì trên màn nói là đã ngược.
 */
const BA_PHIEN: ReadonlyArray<SeriesRow> = [
  { date: '2025-01-01', open: 100, high: 106, low: 99, close: 105, volume: 1000 },
  { date: '2025-01-02', open: 105, high: 112, low: 104, close: 110, volume: 1100 },
  { date: '2025-01-03', open: 110, high: 118, low: 109, close: 115, volume: 1200 },
];

/**
 * Giá trị của các ô Ngày, theo đúng thứ tự chúng nằm trên màn. Ô không đang sửa in gọn ngày/tháng
 * (20/10/2026), nên ngày đủ năm đọc ra là '03/01'; ngày đủ năm nằm ở `ngayDaLuu()`.
 */
function ngayTrenMan(): string[] {
  return screen.getAllByLabelText(/^Dòng \d+ · Ngày$/).map((el) => (el as HTMLInputElement).value);
}

/** Mảng đã ghi vào localStorage — thứ mà `closesOf()` sẽ đọc. */
function ngayDaLuu(): string[] {
  const raw = window.localStorage.getItem(PRICE_SERIES_KEY) ?? '{}';
  const parsed: unknown = JSON.parse(raw);
  const rows = (parsed as { rows?: ReadonlyArray<{ date?: string }> }).rows ?? [];
  return rows.map((r) => r.date ?? '');
}

describe('DataTableScreen — ngày mới nhất lên đầu, nhưng chỉ ở phần nhìn thấy', () => {
  it('bảng bày ngày mới nhất ở dòng trên cùng', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    expect(ngayTrenMan()).toEqual(['03/01', '02/01', '01/01']);
  });

  /* Vế đắt nhất: phần LƯU vẫn theo thời gian, vì cả nhóm công thức rủi ro đọc nó như chuỗi. */
  it('mảng đã lưu vẫn theo thời gian cũ → mới, KHÔNG lật theo màn', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    expect(ngayDaLuu()).toEqual(['01/01/2025', '02/01/2025', '03/01/2025']);
  });

  it('bảng nạp vào lộn thứ tự thì được xếp lại ngay lúc mở màn', async () => {
    napBang([BA_PHIEN[2], BA_PHIEN[0], BA_PHIEN[1]] as ReadonlyArray<SeriesRow>);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    expect(ngayTrenMan()).toEqual(['03/01', '02/01', '01/01']);
  });

  it('số dòng đếm theo thứ tự NHÌN THẤY — dòng 1 là dòng trên cùng', async () => {
    napBang(BA_PHIEN);
    moMan();

    const dongMot = await screen.findByLabelText('Dòng 1 · Ngày');
    expect((dongMot as HTMLInputElement).value).toBe('03/01');
  });
});

describe('DataTableScreen — dòng mới thêm nằm trên đầu, xếp lại sau khi nhập xong', () => {
  it('bấm "Thêm dòng" thì dòng trống hiện ở ĐẦU bảng', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));

    expect(ngayTrenMan()).toEqual(['', '03/01', '02/01', '01/01']);
  });

  it('đang gõ ngày thì dòng ĐỨNG YÊN, chưa bị xếp đi chỗ khác', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));
    // Ngày này thuộc GIỮA chuỗi, nên nếu xếp ngay thì dòng nhảy xuống dưới trong lúc đang gõ.
    // Đang sửa thì ô in đúng chữ đang gõ, chưa gọn về ngày/tháng.
    fireEvent.focus(screen.getByLabelText('Dòng 1 · Ngày'));
    fireEvent.change(screen.getByLabelText('Dòng 1 · Ngày'), {
      target: { value: '2025-01-02' },
    });

    expect(ngayTrenMan()[0]).toBe('2025-01-02');
    expect(ngayTrenMan()).toHaveLength(4);
    expect(ngayTrenMan()[1]).toBe('03/01');
  });

  it('tiêu điểm rời khỏi dòng thì mới xếp lại theo ngày', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));
    const oNgay = screen.getByLabelText('Dòng 1 · Ngày');
    fireEvent.change(oNgay, { target: { value: '2025-01-02' } });

    /* React 17+ nối `onBlur` vào `focusout`; `relatedTarget` ngoài dòng nghĩa là đã nhập xong. */
    fireEvent.focusOut(oNgay, { relatedTarget: document.body });

    // Hai phiên cùng ngày 02/01 nằm cạnh nhau, và phiên mới nhất vẫn trên cùng.
    expect(ngayTrenMan()).toEqual(['03/01', '02/01', '02/01', '01/01']);
    expect(ngayDaLuu()).toEqual(['01/01/2025', '02/01/2025', '02/01/2025', '03/01/2025']);
  });

  it('dòng mới chưa có ngày thì ở nguyên đầu bảng kể cả sau khi rời tiêu điểm', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));
    fireEvent.focusOut(screen.getByLabelText('Dòng 1 · Ngày'), { relatedTarget: document.body });

    // Không đọc được ngày thì không xếp — đoán một chỗ cho nó là đoán, xem `sortRowsByDate()`.
    expect(ngayTrenMan()[0]).toBe('');
  });
});

/**
 * Cột "Kiểm tra dữ liệu" — bản vẽ 10/09/2026 gom ba thứ trước đây nằm rải rác dưới bảng.
 * Ca dưới gác chỗ dễ sai nhất khi bảng lật: con số dòng trong câu báo lỗi.
 */
describe('DataTableScreen — cột kiểm tra dữ liệu', () => {
  it('câu báo lỗi gọi đúng số dòng NHÌN THẤY, không phải chỉ số trong mảng', async () => {
    napBang([
      BA_PHIEN[0],
      { date: '2025-01-02', open: 105, high: 90, low: 120, close: 110, volume: 1100 },
      BA_PHIEN[2],
    ] as ReadonlyArray<SeriesRow>);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    // Dòng hỏng là phần tử số 1 của mảng, nhưng trên màn nó là dòng thứ 2 (đếm từ trên xuống).
    expect(screen.getByRole('button', { name: /Tới dòng 2/ })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Tới dòng 3/ })).toBeNull();
  });

  it('không dòng nào lỗi thì nói ra, không để trống một khoảng', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    expect(screen.getByText('Không dòng nào đang lỗi.')).not.toBeNull();
  });
});

/**
 * Hai chuỗi cùng tồn tại là có chủ ý — dán ở màn chi tiết CỐ Ý không ghi đè bảng này (xem
 * `applyPreset()` ở `FormulaDetail.tsx`) — nên phải có luật ai thắng khi người dùng quay lại màn
 * chi tiết. Luật: thao tác GẦN NHẤT thắng. Thiếu nó thì bảng vừa sửa xong lại bị một chuỗi cũ hơn
 * che mất, mà trên màn không có gì nói vì sao.
 */
describe('sửa bảng thì chuỗi đã thay tại chỗ ở màn chi tiết hết hiệu lực', () => {
  /** Đúng hình dạng `FormulaDetail` ghi ra khi người dùng dán chuỗi tại chỗ. */
  function gieoChuoiTaiCho(): void {
    window.sessionStorage.setItem(
      WORKING_SERIES_KEY,
      serializeWorkingSeries({
        id: 'ty-so-sharpe',
        rows: CHI_CO_GIA_DONG,
        marketSeries: null,
        source: 'paste',
        code: null,
      }),
    );
  }

  it('chỉ MỞ bảng ra xem thì chuỗi kia vẫn còn — lượt ghi đầu không phải một lần sửa', async () => {
    napBang();
    gieoChuoiTaiCho();
    moMan();

    await screen.findByLabelText('Dòng 1 · Đóng');

    expect(window.sessionStorage.getItem(WORKING_SERIES_KEY)).not.toBeNull();
  });

  it('sửa một ô thì chuỗi kia bị bỏ — bảng vừa sửa mới là thứ mới nhất', async () => {
    napBang();
    gieoChuoiTaiCho();
    moMan();

    const oDong = await screen.findByLabelText('Dòng 1 · Đóng');
    fireEvent.change(oDong, { target: { value: '123' } });

    expect(window.sessionStorage.getItem(WORKING_SERIES_KEY)).toBeNull();
  });

  it('chỉ chạm vào một ô rồi rời ra, không sửa gì: chuỗi kia vẫn còn (29/10/2026)', async () => {
    napBang();
    gieoChuoiTaiCho();
    moMan();

    const oDong = await screen.findByLabelText('Dòng 1 · Đóng');
    fireEvent.focus(oDong);
    fireEvent.focusOut(oDong, { relatedTarget: document.body });

    expect(window.sessionStorage.getItem(WORKING_SERIES_KEY)).not.toBeNull();
  });
});

describe('DataTableScreen — sửa ngày rồi bấm sang dòng khác, số gõ tiếp vào đúng phiên (29/10/2026)', () => {
  it('chưa xếp lại khi tiêu điểm chỉ chuyển giữa hai dòng; số gõ tiếp ghi vào phiên của ô đang thấy', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    // Dòng 1 là 03/01. Sửa nó thành ngày CŨ nhất rồi bấm thẳng sang ô Mở của dòng 2 (02/01).
    const oNgay = screen.getByLabelText('Dòng 1 · Ngày');
    fireEvent.focus(oNgay);
    fireEvent.change(oNgay, { target: { value: '2024-12-01' } });
    const oMoDong2 = screen.getByLabelText('Dòng 2 · Mở');
    fireEvent.focusOut(oNgay, { relatedTarget: oMoDong2 });
    fireEvent.focus(oMoDong2);
    fireEvent.change(screen.getByLabelText('Dòng 2 · Mở'), { target: { value: '999' } });

    const luu = JSON.parse(window.localStorage.getItem(PRICE_SERIES_KEY) ?? '{}') as {
      rows: Array<{ date: string; open: number }>;
    };
    const phien0201 = luu.rows.find((row) => row.date === '02/01/2025');
    const phien0101 = luu.rows.find((row) => row.date === '01/01/2025');
    expect(phien0201?.open).toBe(999);
    expect(phien0101?.open).toBe(100);

    // Rời hẳn phần thân bảng thì mới xếp lại theo ngày.
    fireEvent.focusOut(screen.getByLabelText('Dòng 2 · Mở'), { relatedTarget: document.body });
    expect(ngayDaLuu()[0]).toBe('01/12/2024');
  });
});

/*
 * Hai câu chủ dự án bảo xoá như chữ dư (16/10/2026): dòng nhỏ cạnh "Bảng số liệu", và phần đuôi của
 * mục chú thích phiên lỗi trên biểu đồ. Con số "N phiên lỗi" ở lại — hình thiếu phiên thì phải nói ra.
 */
describe('DataTableScreen — không còn chữ dư quanh bảng và biểu đồ', () => {
  it('không có "Mới → cũ · sửa trực tiếp trong ô", và mục phiên lỗi chỉ còn con số', async () => {
    napBang([
      ...CHI_CO_GIA_DONG,
      { date: '3', open: null, high: null, low: null, close: null, volume: null },
    ]);
    moMan();
    await screen.findByLabelText('Dòng 1 · Đóng');

    const chu = document.body.textContent;
    expect(chu).not.toContain('Mới → cũ');
    expect(chu).not.toContain('sửa trực tiếp trong ô');
    expect(chu).toContain('1 phiên lỗi');
    expect(chu).not.toContain('chưa vẽ, sửa ở bảng dưới');
  });
});

/**
 * Mã là nhãn của CHUỖI, nên chuỗi đổi nguồn thì mã phải đi (16/10/2026).
 *
 * Chủ dự án báo: nạp mẫu FPT, rồi "Dán Excel/CSV" bộ dữ liệu mẫu — biểu đồ và bảng vẽ chuỗi mới mà
 * đầu thẻ biểu đồ vẫn ghi "FPT · 248 phiên". Mã gieo ở đây là "ZZZ": không trùng mã nào của sheet
 * nạp mẫu, nên "không còn chữ ZZZ trên màn" không bị một danh sách mã khác làm nhiễu.
 */
describe('DataTableScreen — dán đè hay xoá bảng thì mã cũ không còn', () => {
  const MA_CU = 'ZZZ';

  function napBangCoMa(): void {
    window.localStorage.setItem(
      PRICE_SERIES_KEY,
      serializeStoredSeries({ code: MA_CU, rows: CHI_CO_GIA_DONG }),
    );
  }

  function maTrongKho(): string {
    const raw = window.localStorage.getItem(PRICE_SERIES_KEY) ?? '{}';
    return (JSON.parse(raw) as { code?: string }).code ?? '';
  }

  it('dán bộ dữ liệu mẫu đè lên bảng của mã thì mã biến mất, cả trên màn lẫn trong kho', async () => {
    napBangCoMa();
    moMan();
    await screen.findByLabelText('Dòng 1 · Đóng');
    // Có mã trên màn thì mới có cái để mất — không thì ca này không chứng minh được gì.
    expect(document.body.textContent).toContain(MA_CU);

    await userEvent.click(screen.getByRole('button', { name: 'Dán Excel/CSV' }));
    // Tấm mở ra là thấy sẵn bảng đang dùng, nên nút ở chỗ "Dữ liệu mẫu" đang là "Xoá hết".
    await userEvent.click(await screen.findByRole('button', { name: 'Xoá hết' }));
    await userEvent.click(screen.getByRole('button', { name: 'Dữ liệu mẫu' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Nạp 64 dòng' }));

    await waitFor(() => {
      expect(document.body.textContent).not.toContain(MA_CU);
    });
    expect(maTrongKho()).toBe('');
  });

  it('xoá cả bảng rồi gõ dòng mới thì dòng ấy không mang mã cũ', async () => {
    napBangCoMa();
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    moMan();
    await screen.findByLabelText('Dòng 1 · Đóng');

    await userEvent.click(screen.getByRole('button', { name: 'Xoá' }));
    await userEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));

    await screen.findByLabelText('Dòng 1 · Ngày');
    expect(document.body.textContent).not.toContain(MA_CU);
    expect(maTrongKho()).toBe('');
  });

  it('chỉ MỞ màn thì mã vẫn còn — bảng có dòng thì nhãn của nó không bị xoá nhầm', async () => {
    napBangCoMa();
    moMan();
    await screen.findByLabelText('Dòng 1 · Đóng');

    expect(document.body.textContent).toContain(MA_CU);
    expect(maTrongKho()).toBe(MA_CU);
  });
});

/*
 * Dán và "Thêm dòng" dùng chung MỘT luật ngày trùng (28/10/2026).
 *
 * Tester báo, chủ dự án giao sửa: "Dán dữ liệu chuỗi OHLC không check ngày đã tồn tại (không đồng nhất
 * với thao tác Thêm dòng)". Đo trên Chrome trước khi sửa: dán một dòng 15/09 vào dòng 1 của tấm thì số
 * của phiên 15/09 bị thay, nạp xong cột kiểm tra vẫn "Không dòng nào đang lỗi"; còn "Thêm dòng" gõ
 * đúng ngày ấy thì bị báo ngay. Hai ca dưới chạy hai thao tác trên cùng một bảng.
 */
describe('DataTableScreen — dán và "Thêm dòng" cùng một luật ngày trùng', () => {
  const SAU_PHIEN: ReadonlyArray<SeriesRow> = [
    { date: '08/09/2026', open: 100, high: 105, low: 95, close: 102, volume: 1000 },
    { date: '09/09/2026', open: 102, high: 106, low: 100, close: 104, volume: 1100 },
    { date: '10/09/2026', open: 104, high: 108, low: 103, close: 107, volume: 1200 },
    { date: '11/09/2026', open: 107, high: 109, low: 104, close: 105, volume: 1300 },
    { date: '14/09/2026', open: 105, high: 110, low: 104, close: 109, volume: 1400 },
    { date: '15/09/2026', open: 109, high: 112, low: 108, close: 111, volume: 1500 },
  ];

  it('dán một phiên đã có: tấm báo trùng ngày trước khi nạp, và bảng giữ số cũ của phiên ấy', async () => {
    napBang(SAU_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Đóng');

    await userEvent.click(screen.getByRole('button', { name: 'Dán Excel/CSV' }));
    fireEvent.paste(await screen.findByLabelText('Ngày, Dòng 1'), {
      clipboardData: { getData: () => '15/09/2026\t200\t210\t190\t205\t9999' },
    });

    expect(await screen.findByText('1 dòng trùng ngày')).toBeTruthy();
    expect((screen.getByRole('button', { name: 'Nạp 6 dòng' }) as HTMLButtonElement).disabled).toBe(
      true,
    );

    await userEvent.click(screen.getByRole('checkbox', { name: /Bỏ qua 1 dòng lỗi/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Nạp 6 dòng' }));

    await waitFor(() => {
      expect((screen.getByLabelText('Dòng 1 · Đóng') as HTMLInputElement).value).toBe('111');
    });
    expect(screen.queryByLabelText('Dòng 7 · Ngày')).toBeNull();
    expect(screen.getByText('Không dòng nào đang lỗi.')).toBeTruthy();
  });

  it('"Thêm dòng" rồi gõ cùng ngày ấy thì bảng cũng báo trùng — một luật cho hai thao tác', async () => {
    napBang(SAU_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Đóng');

    await userEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));
    await userEvent.type(await screen.findByLabelText('Dòng 1 · Ngày'), '15/09/2026');

    expect(await screen.findByText(/Ngày 15\/09\/2026 xuất hiện ở hơn một dòng/)).toBeTruthy();
  });
});

/*
 * ── Bảng theo khuôn lưới "Bảng dữ liệu" (20/10/2026) ────────────────────────────────────────────
 *
 * Chủ dự án, sau khi lưới của popup "Bảng dữ liệu" dựng lại theo bản vẽ: _"thay đổi tương tự với
 * bảng số liệu của phần Chuỗi giá OHLCV"_. Các ca dưới gác phần hành vi của khuôn ấy — tên cột ngắn
 * bấm để sắp xếp, số thứ tự đếm theo màn, dòng năm, màu cột Đóng — cộng hai vế riêng của màn này:
 * mảng đã lưu không đổi thứ tự khi bảng xếp, và thứ tự đã chốt xếp lại khi tiêu điểm rời dòng.
 */
describe('DataTableScreen — bảng theo khuôn lưới "Bảng dữ liệu"', () => {
  /* Bốn phiên trải hai năm: một phiên đóng < mở (31/12), một phiên thiếu giá mở, một thiếu khối lượng. */
  const BON_PHIEN: ReadonlyArray<SeriesRow> = [
    { date: '2025-12-30', open: 100, high: 106, low: 99, close: 105, volume: 1000 },
    { date: '2025-12-31', open: 105, high: 112, low: 98, close: 99, volume: 3000 },
    { date: '2026-01-02', open: 99, high: 118, low: 97, close: 115, volume: null },
    { date: '2026-01-05', open: null, high: null, low: null, close: 101, volume: 2000 },
  ];

  const bang = () => within(screen.getByRole('region', { name: 'Bảng số liệu' }));
  const soCotDau = () =>
    bang()
      .getAllByRole('rowheader')
      .map((th) => th.textContent);
  const cotTrenMan = (ten: string) =>
    screen
      .getAllByLabelText(new RegExp(`^Dòng \\d+ · ${ten}$`))
      .map((el) => (el as HTMLInputElement).value);

  async function moBonPhien(rows: ReadonlyArray<SeriesRow> = BON_PHIEN) {
    napBang(rows);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');
  }

  it('đầu cột in tên ngắn, mỗi tên là một nút sắp xếp; mở ra là Ngày đang xếp mới nhất trước', async () => {
    await moBonPhien();

    const dau = bang().getAllByRole('columnheader');
    expect(dau.slice(1, 7).map((th) => th.textContent)).toEqual([
      'Ngày',
      'Mở',
      'Cao',
      'Thấp',
      'Đóng',
      'KL',
    ]);
    // "KL" không nằm trong "Khối lượng", nên tên đọc được ghép cả hai.
    expect(bang().getByRole('button', { name: 'Khối lượng (KL)' })).not.toBeNull();
    expect(
      bang().getByRole('button', { name: 'Ngày' }).closest('th')?.getAttribute('aria-sort'),
    ).toBe('descending');
    expect(ngayTrenMan()).toEqual(['05/01', '02/01', '31/12', '30/12']);
  });

  /*
   * Tên ngắn CHỈ ở điện thoại (21/10/2026): bản vẽ là ảnh chụp điện thoại, và chủ dự án — _"web pc thì
   * không cần tiết kiệm chữ … ghi rõ lại tiêu đề"_. Từ 1024px đầu cột in tên đầy đủ, cùng chữ lưới popup
   * (`paste.col.*`) chứ không phải nhãn ô ngắn của màn này ("Mở", "Đóng").
   */
  it('từ 1024px đầu cột in tên đầy đủ, như lưới popup', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: (query: string) => ({
        matches: query === '(min-width: 1024px)',
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }),
    });
    try {
      await moBonPhien();

      const dau = bang().getAllByRole('columnheader');
      expect(dau.slice(1, 7).map((th) => th.textContent)).toEqual([
        'Ngày',
        'Giá mở cửa',
        'Giá cao nhất',
        'Giá thấp nhất',
        'Giá đóng cửa',
        'Khối lượng',
      ]);
      expect(bang().getByRole('button', { name: 'Khối lượng (KL)' }).textContent).toBe(
        'Khối lượng',
      );
      // Chủ dự án (21/10/2026): _"web pc thì cần hiển thị đầy đủ … ngày: cần hiện rõ ngày tháng năm"_.
      expect(cotTrenMan('Ngày')).toEqual(['05/01/2026', '02/01/2026', '31/12/2025', '30/12/2025']);
    } finally {
      Reflect.deleteProperty(window, 'matchMedia');
    }
  });

  it('bấm Đóng: lớn nhất trước, bấm nữa nhỏ nhất trước, lần ba về ngày mới nhất trước', async () => {
    await moBonPhien();
    const nut = bang().getByRole('button', { name: 'Giá đóng cửa' });

    await userEvent.click(nut);
    expect(cotTrenMan('Đóng')).toEqual(['115', '105', '101', '99']);
    expect(nut.closest('th')?.getAttribute('aria-sort')).toBe('descending');
    expect(
      bang().getByRole('button', { name: 'Ngày' }).closest('th')?.hasAttribute('aria-sort'),
    ).toBe(false);

    await userEvent.click(nut);
    expect(cotTrenMan('Đóng')).toEqual(['99', '101', '105', '115']);
    expect(nut.closest('th')?.getAttribute('aria-sort')).toBe('ascending');

    await userEvent.click(nut);
    expect(ngayTrenMan()).toEqual(['05/01', '02/01', '31/12', '30/12']);
    expect(nut.closest('th')?.hasAttribute('aria-sort')).toBe(false);
  });

  it('ô trống đứng cuối ở cả hai chiều, không chen vào như số 0', async () => {
    await moBonPhien();
    const nut = bang().getByRole('button', { name: 'Khối lượng (KL)' });

    await userEvent.click(nut);
    expect(cotTrenMan('Khối lượng')).toEqual(['3000', '2000', '1000', '']);
    await userEvent.click(nut);
    expect(cotTrenMan('Khối lượng')).toEqual(['1000', '2000', '3000', '']);
  });

  it('bấm Ngày chỉ đảo qua lại giữa cũ trước và mới trước', async () => {
    await moBonPhien();
    const nut = bang().getByRole('button', { name: 'Ngày' });

    await userEvent.click(nut);
    expect(ngayTrenMan()).toEqual(['30/12', '31/12', '02/01', '05/01']);
    expect(nut.closest('th')?.getAttribute('aria-sort')).toBe('ascending');

    await userEvent.click(nut);
    expect(ngayTrenMan()).toEqual(['05/01', '02/01', '31/12', '30/12']);
  });

  /*
   * Số thứ tự đếm theo MÀN, như lưới popup sau câu của chủ dự án: _"sao số thứ tự 1 mà lại là ngày
   * 12/09/2025 ? mà không phải là 15/09/2026"_. Và xếp bảng không được đụng vào mảng đã lưu — Beta,
   * độ biến động, VaR đọc nó như một chuỗi thời gian.
   */
  it('số thứ tự đếm 1, 2, 3 từ trên xuống ở mọi kiểu xếp; mảng đã lưu không đổi', async () => {
    await moBonPhien();
    const luuTruoc = ngayDaLuu();
    expect(luuTruoc).toEqual(['30/12/2025', '31/12/2025', '02/01/2026', '05/01/2026']);
    expect(soCotDau()).toEqual(['1', '2', '3', '4']);

    await userEvent.click(bang().getByRole('button', { name: 'Giá đóng cửa' }));

    expect(soCotDau()).toEqual(['1', '2', '3', '4']);
    expect((screen.getByLabelText('Dòng 1 · Đóng') as HTMLInputElement).value).toBe('115');
    expect(ngayDaLuu()).toEqual(luuTruoc);
  });

  it('cột kiểm gọi đúng số dòng đang thấy khi bảng đang xếp', async () => {
    // Phiên 31/12 hỏng: giá cao thấp hơn giá thấp.
    await moBonPhien(
      BON_PHIEN.map((row) => (row.date === '2025-12-31' ? { ...row, high: 90, low: 120 } : row)),
    );
    expect(screen.getByRole('button', { name: /Tới dòng 3/ })).not.toBeNull();

    // Xếp theo Đóng giảm dần: 99 là giá nhỏ nhất, phiên hỏng xuống dòng 4.
    await userEvent.click(bang().getByRole('button', { name: 'Giá đóng cửa' }));

    expect(screen.getByRole('button', { name: /Tới dòng 4/ })).not.toBeNull();
    expect(screen.queryByRole('button', { name: /Tới dòng 3/ })).toBeNull();
    expect(cotTrenMan('Đóng')[3]).toBe('99');
  });

  it('sửa ô của cột đang xếp thì dòng đứng yên, rời dòng thì mới xếp lại', async () => {
    await moBonPhien();
    await userEvent.click(bang().getByRole('button', { name: 'Giá đóng cửa' }));

    const o = screen.getByLabelText('Dòng 1 · Đóng');
    fireEvent.change(o, { target: { value: '50' } });
    expect(cotTrenMan('Đóng')).toEqual(['50', '105', '101', '99']);

    fireEvent.focusOut(o, { relatedTarget: document.body });

    expect(cotTrenMan('Đóng')).toEqual(['105', '101', '99', '50']);
    expect(soCotDau()).toEqual(['1', '2', '3', '4']);
  });

  it('"Thêm dòng" khi đang xếp theo cột khác vẫn đặt dòng trống trên cùng', async () => {
    await moBonPhien();
    await userEvent.click(bang().getByRole('button', { name: 'Giá đóng cửa' }));

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));

    expect(ngayTrenMan()[0]).toBe('');
    expect(cotTrenMan('Đóng')).toEqual(['', '115', '105', '101', '99']);
    expect(soCotDau()).toEqual(['1', '2', '3', '4', '5']);
  });

  it('bỏ một dòng khi đang xếp thì các dòng còn lại giữ chỗ', async () => {
    await moBonPhien();
    await userEvent.click(bang().getByRole('button', { name: 'Giá đóng cửa' }));

    await userEvent.click(screen.getByRole('button', { name: 'Xoá dòng 2' }));

    expect(cotTrenMan('Đóng')).toEqual(['115', '101', '99']);
    expect(ngayDaLuu()).toEqual(['31/12/2025', '02/01/2026', '05/01/2026']);
  });

  it('năm in một lần trên bảng: một năm, khoảng năm, hay không gì khi chuỗi không ghi năm', async () => {
    await moBonPhien();
    expect(bang().getByText('Từ năm 2025 tới 2026')).not.toBeNull();
    cleanup();

    await moBonPhien(BA_PHIEN);
    expect(bang().getByText('Năm 2025')).not.toBeNull();
    cleanup();

    // Chuỗi minh hoạ trang Beta đánh số phiên '1', '2' — không có năm nào để in.
    napBang();
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');
    expect(bang().queryByText(/^Năm |^Từ năm /)).toBeNull();
  });

  it('cột Đóng mang hướng của phiên so với giá MỞ; thiếu giá mở thì không tô', async () => {
    await moBonPhien();

    const huong = screen
      .getAllByLabelText(/^Dòng \d+ · Đóng$/)
      .map((el) => el.closest('td')?.getAttribute('data-xu-huong') ?? null);
    // 05/01 thiếu giá mở · 02/01 đóng 115 ≥ mở 99 · 31/12 đóng 99 < mở 105 · 30/12 đóng 105 ≥ mở 100.
    expect(huong).toEqual([null, 'tang', 'giam', 'tang']);
  });
});
