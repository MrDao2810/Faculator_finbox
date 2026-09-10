// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { PRICE_SERIES_KEY, serializeStoredSeries } from '@/application';
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

  it('ô số chưa điền hiện dấu gạch chờ, ô ngày thì không', async () => {
    napBang();
    moMan();

    const oMo = await screen.findByLabelText('Dòng 1 · Mở');
    const oNgay = await screen.findByLabelText('Dòng 1 · Ngày');

    // Trắng trơn thì đọc ra là ô khoá — đúng thứ chủ dự án báo là "quá mờ nhạt".
    expect(oMo.getAttribute('placeholder')).toBe('_ _');
    expect(oNgay.getAttribute('placeholder')).toBeNull();
  });

  it('bàn phím số của điện thoại mở đúng loại cho từng cột', async () => {
    napBang();
    moMan();

    expect((await screen.findByLabelText('Dòng 1 · Đóng')).getAttribute('inputmode')).toBe(
      'decimal',
    );
    expect((await screen.findByLabelText('Dòng 1 · Ngày')).getAttribute('inputmode')).toBe('text');
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

/** Giá trị của các ô Ngày, theo đúng thứ tự chúng nằm trên màn. */
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

    expect(ngayTrenMan()).toEqual(['2025-01-03', '2025-01-02', '2025-01-01']);
  });

  /* Vế đắt nhất: phần LƯU vẫn theo thời gian, vì cả nhóm công thức rủi ro đọc nó như chuỗi. */
  it('mảng đã lưu vẫn theo thời gian cũ → mới, KHÔNG lật theo màn', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    expect(ngayDaLuu()).toEqual(['2025-01-01', '2025-01-02', '2025-01-03']);
  });

  it('bảng nạp vào lộn thứ tự thì được xếp lại ngay lúc mở màn', async () => {
    napBang([BA_PHIEN[2], BA_PHIEN[0], BA_PHIEN[1]] as ReadonlyArray<SeriesRow>);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    expect(ngayTrenMan()).toEqual(['2025-01-03', '2025-01-02', '2025-01-01']);
  });

  it('số dòng đếm theo thứ tự NHÌN THẤY — dòng 1 là dòng trên cùng', async () => {
    napBang(BA_PHIEN);
    moMan();

    const dongMot = await screen.findByLabelText('Dòng 1 · Ngày');
    expect((dongMot as HTMLInputElement).value).toBe('2025-01-03');
  });
});

describe('DataTableScreen — dòng mới thêm nằm trên đầu, xếp lại sau khi nhập xong', () => {
  it('bấm "Thêm dòng" thì dòng trống hiện ở ĐẦU bảng', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));

    expect(ngayTrenMan()).toEqual(['', '2025-01-03', '2025-01-02', '2025-01-01']);
  });

  it('đang gõ ngày thì dòng ĐỨNG YÊN, chưa bị xếp đi chỗ khác', async () => {
    napBang(BA_PHIEN);
    moMan();
    await screen.findByLabelText('Dòng 1 · Ngày');

    fireEvent.click(screen.getByRole('button', { name: /Thêm dòng/ }));
    // Ngày này thuộc GIỮA chuỗi, nên nếu xếp ngay thì dòng nhảy xuống dưới trong lúc đang gõ.
    fireEvent.change(screen.getByLabelText('Dòng 1 · Ngày'), {
      target: { value: '2025-01-02' },
    });

    expect(ngayTrenMan()[0]).toBe('2025-01-02');
    expect(ngayTrenMan()).toHaveLength(4);
    expect(ngayTrenMan()[1]).toBe('2025-01-03');
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
    expect(ngayTrenMan()).toEqual(['2025-01-03', '2025-01-02', '2025-01-02', '2025-01-01']);
    expect(ngayDaLuu()).toEqual(['2025-01-01', '2025-01-02', '2025-01-02', '2025-01-03']);
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
