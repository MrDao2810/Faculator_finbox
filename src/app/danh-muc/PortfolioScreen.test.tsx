// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LIVE_PRESET_FORMULAS,
  MAX_HOLDINGS,
  PENDING_KEY,
  PORTFOLIO_KEY,
  PORTFOLIO_SORT_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  PRICE_CACHE_TTL_MS,
  SAVED_CALCS_KEY,
  SAVED_SORT_KEY,
  FORMULA_SUMMARIES,
  suggestCalcNames,
  t,
} from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { PortfolioScreen } from './PortfolioScreen';

/**
 * Cổng số liệu thị trường được thay bằng bản giả.
 *
 * `vi.hoisted` là bắt buộc: `vi.mock` được kéo lên đầu file nên factory của nó không thấy được
 * biến khai báo theo lối thường. Thay `@/data` chứ không thay `@/application` vì barrel của
 * Application chỉ re-export lại từ đây — thay đúng một chỗ thì mọi đường đi đều qua bản giả.
 */
const feed = vi.hoisted(() => ({
  listTickers: vi.fn(),
  snapshots: vi.fn(),
}));

vi.mock('@/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data')>();
  return { ...actual, MARKET_FEED: feed };
});

/**
 * Bộ định tuyến giả — màn gọi `router.push()` sau khi lưu một mã có chọn công thức.
 *
 * Bản thật ném `invariant expected app router to be mounted` ngoài cây App Router, nên thiếu bản
 * giả này là **cả 68 ca** đỏ chứ không riêng ca điều hướng. Cùng lối `HeaderNav.test.tsx` đã dùng
 * cho `usePathname`.
 */
const router = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
}));

/** jsdom chưa cài đặt <dialog>.showModal(); hai sheet của màn cần hai hàm này mới mở được. */
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

const FPT_SNAPSHOT = {
  code: 'FPT',
  name: 'FPT Corp',
  priceVnd: 71_400,
  asOfDate: '2026-08-21',
  floor: 'HOSE',
  industry: 'Phần mềm & DV máy tính',
  fundamentals: {
    eps: 5867,
    bookValuePerShare: 23246,
    sharesOutstanding: 1714326422,
    dividendPerShare: 2000,
    netIncome: 9999.4,
    equity: 39851.2,
    period: 'BCTC Q2/2026',
  },
};

/** Một mã sẵn trong máy, để không phải đi qua form ở mọi ca kiểm. */
function seedHolding(): void {
  window.localStorage.setItem(
    PORTFOLIO_KEY,
    JSON.stringify([
      { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
    ]),
  );
}

/**
 * Dựng màn ở chế độ **Nâng cao** — FR-09.
 *
 * `render(<PortfolioScreen />)` trần không có Provider nên `usePreferences()` trả về mặc định,
 * tức chế độ Cơ bản: ở đó ô Beta, ô XIRR và ô nhập beta đều không dựng ra. Ca nào cần tới
 * chúng phải đi qua đây.
 *
 * Hai chi tiết KHÔNG được bỏ, cùng lý do đã ghi ở mục "Hai chỗ ca kiểm dễ đỗ giả" trong
 * `TASK.md`: `PreferencesProvider` đọc localStorage trong **effect**, nên lần render đầu vẫn là
 * Cơ bản — vì vậy (1) phải ghi tuỳ chọn TRƯỚC khi render, và (2) phải **chờ một bằng chứng**
 * của chế độ mới hiện ra rồi mới khẳng định. Thiếu vế (2) thì ca kiểm xanh kể cả khi Provider
 * chưa kịp đọc, tức là ca vô nghĩa.
 */
async function moManNangCao(): Promise<void> {
  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ mode: 'advanced' }));
  render(
    <PreferencesProvider>
      <PortfolioScreen />
    </PreferencesProvider>,
  );
  await screen.findByText('Beta danh mục');
}

/**
 * Tiêu đề của khối Nắm giữ — `<h2>` "Mã".
 *
 * Tra bằng VAI heading chứ không bằng chữ: chữ "Mã" nằm ở BA chỗ — `<h2>` này, nhãn của tab dọc
 * (cùng một khoá i18n) và tiêu đề cột đầu của bảng — nên `findByText('Mã')` thấy ba phần tử. Chữ đã
 * đi qua "Nắm giữ" → "Mã nắm giữ" (sáng 12/10/2026) → "Mã" (chiều cùng ngày, theo chủ dự án).
 *
 * Không còn `moChiTiet()` ở đây: bảng bỏ hàng mở rộng (12/10/2026), Sửa và Bỏ mã là hai nút biểu
 * tượng ngay trên dòng, nên không có khối nào cần mở trước khi chạm tới chúng.
 */
async function tieuDeNamGiu(): Promise<HTMLElement> {
  return screen.findByRole('heading', { name: 'Mã' });
}

/**
 * Tấm đang nằm TRÊN CÙNG.
 *
 * Từ 22/09/2026 form thêm/sửa mã cũng là một `<dialog>` (hộp thoại nổi giữa màn), và sheet chọn
 * mã / chọn công thức mở ĐÈ LÊN nó — nên `getByRole('dialog')` trần thấy hai phần tử và ném lỗi.
 *
 * Lọc theo thuộc tính `open` trước rồi mới lấy cái cuối: sheet đã mở một lần thì Ở LẠI trong DOM
 * ở trạng thái đóng (`mountedSheets`), nên "cái cuối trong thứ tự DOM" một mình là chưa đủ.
 */
async function tamTrenCung(): Promise<HTMLElement> {
  const tams = (await screen.findAllByRole('dialog')).filter((tam) => tam.hasAttribute('open'));
  const tren = tams[tams.length - 1];
  if (tren === undefined) throw new Error('Không có tấm nào đang mở');
  return tren;
}

/**
 * Ô thống kê ở đầu màn, dò theo nhãn của nó.
 *
 * Cần từ 22/09/2026, khi danh sách Nắm giữ thành bảng có cột GIÁ TRỊ và cột LÃI/LỖ: bộ số gieo
 * sẵn chỉ có MỘT mã, nên giá trị của mã bằng đúng tổng danh mục và một `getByText(/7\.140\.000/)`
 * trần thấy hai phần tử. Neo vào nhãn là cách phân biệt không phụ thuộc thứ tự DOM.
 *
 * `selector: 'span'` để tách khỏi tiêu đề cột cùng chữ: nhãn của ô là `<span>`, tiêu đề cột là
 * `<th>`.
 */
async function oThongKe(nhan: string): Promise<HTMLElement> {
  const nhanEl = await screen.findByText(nhan, { selector: 'span' });
  const o = nhanEl.parentElement;
  if (o === null) throw new Error(`Ô thống kê "${nhan}" không có phần tử cha`);
  return o;
}

/**
 * Hàng bảng của một mã.
 *
 * Neo qua nút Sửa của hàng chứ không qua chữ trong ô: nút là thứ trên hàng mang tên mã một cách chắc
 * chắn (`aria-label` "Sửa FPT"), còn mã trần thì trùng với mọi chỗ khác nhắc tới nó (tên hộp thoại,
 * bảng Công thức). Trước 12/10/2026 neo là nút phủ "Chi tiết FPT"; nút ấy và hàng mở rộng đã bỏ. Từ
 * 13/10/2026 nút Sửa không còn là bút chì cuối hàng mà chính là MÃ ở ô đầu — cùng tên, nên neo này
 * không phải đổi.
 */
async function dongMa(code = 'FPT'): Promise<HTMLElement> {
  const nut = await screen.findByRole('button', { name: new RegExp(`^Sửa ${code}$`) });
  const dong = nut.closest('tr');
  if (dong === null) throw new Error(`Không tìm thấy hàng của mã ${code}`);
  return dong;
}

/** jsdom chưa cài đặt `scrollIntoView`; gắn bản giả rồi gỡ để không rò sang file test khác. */
function bayScrollIntoView(): { goi: ReturnType<typeof vi.fn>; go: () => void } {
  const goi = vi.fn();
  const cu = Element.prototype.scrollIntoView as unknown;
  Element.prototype.scrollIntoView = goi;
  return {
    goi,
    go: () => {
      Element.prototype.scrollIntoView = cu as typeof Element.prototype.scrollIntoView;
    },
  };
}

/**
 * Mở form thêm mã rồi chọn một mã trong sheet. Màn phải đã render trước khi gọi.
 *
 * Tìm dòng theo MÃ chứ không lấy `getAllByRole('button', { name: 'Chọn' })[0]`: mọi dòng đều có
 * đúng một nút cùng nhãn "Chọn", nên lấy theo thứ tự là chọn nhầm mã, và mọi khẳng định sau đó
 * sai theo một cách rất khó đoán.
 *
 * Khẳng định nút KHÔNG bị khoá trước khi bấm, và đó không phải sự cẩn thận thừa: từ 10/10/2026
 * nút của mã đang giữ bị khoá, mà `userEvent.click` trên một nút khoá KHÔNG báo lỗi — nó chỉ im
 * lặng không làm gì. Thiếu dòng này thì ca kiểm đỏ ở một chỗ cách đây mười dòng ("không tìm thấy
 * ô Số cổ phiếu…") và không ai đoán ra vì sao.
 */
async function chonMaTrongForm(code = 'FPT'): Promise<void> {
  await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));
  await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
  const sheet = await tamTrenCung();
  const dong = within(sheet)
    .getAllByRole('listitem')
    .find((item) => item.textContent?.startsWith(code) === true);

  const nut = within(dong as HTMLElement).getByRole('button') as HTMLButtonElement;
  expect(nut.disabled, `nút chọn của ${code} đang bị khoá`).toBe(false);
  await userEvent.click(nut);
}

/**
 * Mở sheet chọn công thức từ form THÊM MÃ — nay là một Ô TRONG FORM, không còn là nút ở dòng mã.
 *
 * Chọn HPG, không phải FPT, và đó là hệ quả trực tiếp của quyết định 10/10/2026: FPT đã gieo sẵn
 * vào danh mục nên nút chọn của nó bị khoá, mã đã có không thêm lại được nữa. Vẫn gieo FPT để màn
 * có thật một lượt tra thị giá — danh mục rỗng thì màn KHÔNG gọi mạng lần nào (đúng thiết kế, có
 * ca kiểm riêng) và dòng "Giá phiên" không bao giờ hiện ra để mà chờ.
 *
 * Mã vừa chọn chưa có bản ghi trong `quotes` (màn chỉ tra giá mã ĐANG GIỮ), và màn đọc "chưa có
 * bản ghi" là CHƯA BIẾT chứ không phải "không có giá" — xem docblock `hasPrice` ở
 * `PortfolioScreen`. Nên sheet ở đây hiện đủ 31 dòng. Ca cần nhánh thiếu thị giá thì đi đường
 * `moSheetCongThucKhiSua()` ngay dưới.
 */
async function moSheetCongThuc(): Promise<HTMLElement> {
  seedHolding();
  render(<PortfolioScreen />);
  await screen.findByText(/Giá phiên/);
  await chonMaTrongForm('HPG');
  await userEvent.click(screen.getByRole('button', { name: 'Thêm công thức' }));
  return tamTrenCung();
}

/**
 * Cùng sheet ấy nhưng mở từ form SỬA của FPT — đường duy nhất còn lại tới nhánh "thiếu thị giá".
 *
 * `quotes` chỉ chứa mã đang giữ, nên chỉ ở form sửa thì mã của form mới có một bản ghi để mà
 * thiếu giá. Form thêm không còn tới được nhánh ấy từ 10/10/2026 (mã đang giữ bị khoá), và một
 * `feed.snapshots` trả về mã KHÔNG nằm trong danh mục là thứ nguồn thật không bao giờ gửi về —
 * dựng ca kiểm trên một phản hồi không thể có là ca đỗ vì lý do sai.
 */
async function moSheetCongThucKhiSua(): Promise<HTMLElement> {
  seedHolding();
  render(<PortfolioScreen />);
  await screen.findByText(/Giá phiên/);
  await userEvent.click(await screen.findByRole('button', { name: /^Sửa FPT/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Thêm công thức' }));
  return tamTrenCung();
}

beforeEach(() => {
  window.localStorage.clear();
  /*
   * Trả URL về gốc giữa hai ca.
   *
   * Đổi tab ghi `?tab=cong-thuc` vào URL bằng `history.replaceState` — đúng ý đồ (tải lại trang
   * thì vẫn ở tab cũ), nhưng jsdom giữ `location` chung cho cả file, nên không dọn thì ca sau
   * khởi động ngay ở tab Công thức và không tìm thấy gì của tab Mã.
   */
  window.history.replaceState(null, '', '/');
  router.push.mockReset();
  feed.listTickers.mockReset();
  feed.snapshots.mockReset();
  feed.listTickers.mockResolvedValue([
    { code: 'FPT', name: 'FPT Corp' },
    { code: 'HPG', name: 'Tập đoàn Hoà Phát' },
  ]);
  feed.snapshots.mockResolvedValue(new Map([['FPT', FPT_SNAPSHOT]]));
});

afterEach(cleanup);

describe('WF-06 — danh mục rỗng', () => {
  it('không gọi mạng khi chưa có mã nào', async () => {
    render(<PortfolioScreen />);

    // Chờ effect đọc localStorage chạy xong rồi mới khẳng định — nếu không thì ca này luôn xanh.
    await tieuDeNamGiu();
    expect(feed.snapshots).not.toHaveBeenCalled();
  });

  /*
   * Ô miễn trừ đứng CUỐI MÀN — chủ dự án chốt 15/09/2026: *"nội dung cảnh báo cho xuống cuối
   * trang"*. Trước đó ca này ghim chiều ngược lại (ô đứng trên sáu ô tiền, theo UI-04 mức M).
   *
   * Ghim cả hai tab: tab Công thức dựng SAU khi kho nạp và bấm sang, nên một ô chèn nhầm vào giữa
   * thanh tab và khối ấy sẽ lọt qua nếu ca này chỉ nhìn tab Mã. Và vẫn đúng MỘT ô — đây là câu
   * miễn trừ duy nhất của màn, chân trang không dựng dải xám ở `/danh-muc/`.
   */
  it('câu miễn trừ đứng CUỐI MÀN ở cả hai tab: sau thẻ tóm tắt và Mã, sau Công thức (FR-24)', async () => {
    seedSaved();
    const { container } = render(<PortfolioScreen />);
    await tieuDeNamGiu();

    const notes = screen.getAllByText(t('disclaimer.text'));
    expect(notes).toHaveLength(1);
    const note = notes[0]?.closest('[role="note"]');
    const stats = container.querySelector('[class*="card"]');
    if (note == null || stats === null) throw new Error('thiếu dải miễn trừ hoặc thẻ tóm tắt');

    // compareDocumentPosition thay vì so toạ độ: jsdom không dựng bố cục, nhưng thứ tự trong cây
    // đúng là thứ quyết định cái nào đọc trước trên màn hình và với trình đọc màn hình.
    for (const truoc of [stats, screen.getByRole('heading', { name: 'Mã' })]) {
      expect(note.compareDocumentPosition(truoc) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    }

    await userEvent.click(screen.getByRole('tab', { name: tenTab('Công thức') }));
    const saved = await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
    const khoi = saved.closest('section');
    if (khoi === null) throw new Error('thiếu khối Công thức');
    expect(note.compareDocumentPosition(khoi) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
  });

  it('mọi ô nói rõ chưa có mã nào, KHÔNG ô nào hiện 0 (FR-06)', async () => {
    render(<PortfolioScreen />);

    const notes = await screen.findAllByText('Danh mục chưa có mã nào.');
    // Tổng giá trị · Vốn đã bỏ ra. Dòng lãi/lỗ không dựng khi chưa tính được (lý do đã nằm ở
    // "Tổng giá trị"), Beta và XIRR chỉ có ở chế độ Nâng cao (ca ngay dưới), còn "Số mã" không còn
    // trong thẻ — số đếm nằm ở tab.
    expect(notes).toHaveLength(2);
    expect(screen.queryByText('Lãi/lỗ', { selector: 'span' })).toBeNull();
    expect(screen.queryByText(/^0\s*₫$/)).toBeNull();
  });

  /*
   * Ca này từng đòi Beta và XIRR CŨNG nói "Danh mục chưa có mã nào." (5 câu). Từ 29/09/2026 hai ô
   * ấy không in câu lý do nào nữa (chủ dự án bỏ, xem `StatTileProps.showReason`), nên ca giữ phần
   * FR-06 — "_ _" chứ không phải 0 — và đếm lại: câu ấy chỉ còn ở hai dòng của chế độ Cơ bản.
   */
  it('chế độ Nâng cao: Beta và XIRR hiện “_ _” chứ không hiện 0, không lặp câu chưa có mã (FR-06)', async () => {
    await moManNangCao();

    expect(screen.getAllByText('Danh mục chưa có mã nào.')).toHaveLength(2);
    expect((await oThongKe('Beta danh mục')).textContent).toContain('_ _');
    expect((await oThongKe('XIRR toàn DM')).textContent).toContain('_ _');
    expect(screen.queryByText(/^0\s*₫$/)).toBeNull();
  });

  it('danh mục rỗng thì không có dòng trạng thái thị giá lẫn nút làm mới', async () => {
    render(<PortfolioScreen />);

    await tieuDeNamGiu();
    // Chưa có mã nào thì cũng chưa có giá nào để nói — dòng ấy chỉ tổ chiếm chỗ.
    expect(screen.queryByRole('button', { name: 'Làm mới' })).toBeNull();
  });
});

describe('WF-06 — thị giá lấy từ Finbox', () => {
  it('gọi đúng một lần với danh sách mã đang giữ', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await waitFor(() => {
      expect(feed.snapshots).toHaveBeenCalledTimes(1);
    });
    expect(feed.snapshots.mock.calls[0]?.[0]).toEqual(['FPT']);
  });

  it('tổng giá trị dựng từ thị giá thật', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    /*
     * 100 CP × 71.400 ₫ = 7.140.000 ₫.
     *
     * Neo vào Ô TỔNG chứ không tra cả màn: từ 22/09/2026 bảng Nắm giữ có cột GIÁ TRỊ, mà bộ số
     * gieo sẵn chỉ có một mã — nên con số này in ra hai chỗ và `findByText` trần báo nhiều kết
     * quả. Thứ ca này muốn khẳng định vẫn là ô tổng.
     */
    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });
  });

  it('mạng hỏng: hiện lý do và nút thử lại, KHÔNG ô nào rơi về 0', async () => {
    seedHolding();
    feed.snapshots.mockRejectedValue(new Error('mất mạng'));
    render(<PortfolioScreen />);

    await screen.findByText('Không lấy được thị giá từ Finbox.');
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeTruthy();
    expect(screen.queryByText(/^0\s*₫$/)).toBeNull();
  });

  it('bấm “Thử lại” thì gọi lại nguồn', async () => {
    seedHolding();
    feed.snapshots.mockRejectedValueOnce(new Error('mất mạng'));
    render(<PortfolioScreen />);

    const retry = await screen.findByRole('button', { name: 'Thử lại' });
    feed.snapshots.mockResolvedValue(new Map([['FPT', FPT_SNAPSHOT]]));
    await userEvent.click(retry);

    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });
  });

  it('sửa số lượng KHÔNG gọi lại nguồn — chỉ danh sách mã mới kích hoạt', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await waitFor(() => {
      expect(feed.snapshots).toHaveBeenCalledTimes(1);
    });

    await userEvent.click(screen.getByRole('button', { name: 'Thêm mới' }));
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '5');

    expect(feed.snapshots).toHaveBeenCalledTimes(1);
  });
});

describe('WF-06 — chọn mã trong toàn thị trường', () => {
  it('ô chọn mã mở sheet và nhận mã đã chọn', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));

    // Danh sách mã chỉ được tải khi sheet thật sự mở.
    await waitFor(() => {
      expect(feed.listTickers).toHaveBeenCalledTimes(1);
    });

    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    expect(screen.getByRole('button', { name: 'Mã cổ phiếu' }).textContent).toContain('FPT');
  });

  it('lọc theo mã, và mã khớp đầu chuỗi đứng trước', async () => {
    feed.listTickers.mockResolvedValue([
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'HPG', name: 'Vận tải Hoà Phát' },
    ]);
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));

    const sheet = await tamTrenCung();
    await userEvent.type(within(sheet).getByRole('searchbox'), 'vc');

    /*
     * Chờ chứ không soi ngay: từ 13/10/2026 sheet lọc sau phím cuối một nhịp và hiện "Đang tìm
     * mã…" trong lúc ấy (xem `SEARCH_DELAY_MS` ở `TickerPickerSheet.tsx`).
     *
     * 'VCB' khớp đầu mã; 'HPG' chỉ khớp trong TÊN ('Vận' → 'van' không chứa 'vc') nên bị loại.
     */
    await waitFor(() => {
      const badges = within(sheet)
        .getAllByRole('listitem')
        .map((item) => item.textContent ?? '');
      expect(badges).toHaveLength(1);
      expect(badges[0]).toContain('VCB');
    });
  });
});

describe('WF-06 — từ mã sang công thức', () => {
  /*
   * Ca trung tâm của đợt gộp luồng: MỘT nút vừa lưu mã vừa mở công thức.
   *
   * Bản trước là hai việc rời — thêm mã, rồi tìm lại dòng mã, mở khối chi tiết, bấm "Tính công
   * thức". Nay chọn công thức ngay trong form và nút lưu đổi nhãn theo. Ca này khoá cả ba vế:
   * nhãn nút đổi, mã thật sự được lưu, và điều hướng mang theo `?ma=`.
   */
  it('chọn công thức trong form: một nút vừa lưu mã vừa mở đúng trang công thức', async () => {
    const sheet = await moSheetCongThuc();
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E — hệ số/ }));

    // Nhãn nút phải nói ra việc nó sắp làm, không còn là "Thêm vào danh mục" trơn.
    expect(screen.queryByRole('button', { name: 'Thêm vào danh mục' })).toBeNull();
    /*
     * Phải có chữ "và mở": từ 22/09/2026 nhãn ô chọn công thức là "Thêm công thức", nên một biểu
     * thức `/^Thêm.*công thức$/` trần bắt được CẢ ô ấy lẫn nút gửi form. Hai nhãn gần nhau là cố
     * ý — cả hai đều nói về công thức — nên chỗ phân biệt phải là lời hứa riêng của nút gửi: nó
     * mở trang công thức ra, còn ô kia chỉ chọn.
     */
    const nutLuu = screen.getByRole('button', { name: /^Thêm.* và mở công thức$/ });

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(nutLuu);

    /*
     * `?ma=HPG` là thứ FormulaDetail đọc để tự nạp số liệu của mã. HPG vì danh mục đã có FPT và
     * mã đã có thì không thêm lại được (10/10/2026) — xem `moSheetCongThuc`.
     *
     * Điều hướng bằng `router.push` chứ không bằng `<Link>`: mã phải được LƯU trước đã, và lệnh
     * mở nằm trong một effect khai sau effect ghi localStorage — xem docblock ở `pendingOpen`.
     */
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/cong-thuc/pe/?ma=HPG');
    });
  });

  /*
   * Chọn công thức là TUỲ CHỌN. Không chọn thì nút giữ nhãn cũ và không đi đâu cả — có người chỉ
   * theo dõi danh mục, và bắt họ chọn công thức mới lưu được là dựng ra một cửa ải mới.
   */
  it('không chọn công thức thì chỉ lưu, không điều hướng đi đâu', async () => {
    render(<PortfolioScreen />);
    await chonMaTrongForm();

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    await dongMa();
    expect(router.push).not.toHaveBeenCalled();
  });

  /*
   * Chưa có mã thì chưa chọn được công thức — tỷ lệ "2/2 ô điền sẵn" của mỗi dòng phụ thuộc mã có
   * thị giá hay không, nên mở sheet lúc chưa biết mã là in ra 31 con số chưa chắc đúng (FR-06).
   *
   * Nhưng ràng buộc ấy KHÔNG được biến ô thành ngõ cụt. Bản đầu để `disabled` và chủ dự án báo
   * ngay: "bấm vào chọn công thức không thấy hiệu ứng gì". Ca này khoá cách chữa: nút nói đúng
   * thứ nó sắp làm, và bấm vào là mở sheet chọn mã thật.
   */
  it('chưa chọn mã: ô công thức tự nói cần mã, và bấm vào thì mở sheet chọn mã', async () => {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    const o = screen.getByRole('button', { name: 'Thêm công thức' }) as HTMLButtonElement;

    // Không khoá: một nút hứa một việc rồi im lặng là hỏng.
    expect(o.disabled).toBe(false);
    /*
     * CHÍNH NÚT phải nói ra, không phải một dòng chữ nhỏ dưới nó: câu gợi ý
     * `portfolio.formulaNeedsCode` đã bỏ 22/09/2026, và lý do bỏ được là vì nhãn nút đã nói cả
     * việc cần làm lẫn thứ tự phải làm, ngay tại chỗ người dùng đang bấm. Ca này khoá đúng điều
     * kiện ấy — ai rút gọn nhãn nút về "Chọn công thức" là bỏ luôn lời giải thích cuối cùng.
     */
    expect(o.textContent).toBe('Chọn mã cổ phiếu trước');
    // Và không còn dòng chữ nhỏ nào dưới ô nữa.
    expect(screen.queryByText(/phải có mã rồi mới chọn được/)).toBeNull();

    await userEvent.click(o);

    const sheet = await tamTrenCung();
    expect(within(sheet).getByText('Chọn mã cổ phiếu')).toBeTruthy();
  });

  it('bỏ chọn được công thức đã chọn, và nhãn nút trở lại như cũ', async () => {
    const sheet = await moSheetCongThuc();
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E — hệ số/ }));

    await userEvent.click(screen.getByRole('button', { name: 'Bỏ chọn công thức' }));

    /*
     * Tra bằng CHỮ chứ không bằng tên nút: ô này lấy tên khả truy cập từ `aria-labelledby` trỏ vào
     * nhãn "Thêm công thức", nên tên nút không đổi theo nội dung bên trong — y hệt ô chọn mã.
     */
    expect(screen.getByText('Chọn công thức')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thêm vào danh mục' })).toBeTruthy();
  });

  /*
   * ── Ca "cộng dồn mà có chọn công thức" đã BỎ (10/10/2026) ─────────────────────────────────
   *
   * Nó khoá nhãn nút cho tổ hợp "chọn một mã đang giữ RỒI chọn công thức" — phải ra "Cộng thêm và
   * mở công thức", không được ra "Thêm và mở công thức". Tổ hợp ấy nay không dựng được nữa: sheet
   * chọn mã khoá nút của mã đang giữ, nên form thêm không bao giờ nhận một mã đã có.
   *
   * Không chuyển thành ca đảo ở đây vì chỗ khoá đã dời sang ca "sheet khoá nút của mã đang giữ"
   * trong nhóm dưới — nó chặn ngay ở cửa, tức là chặn cả lỗi nhãn này cùng mọi lỗi khác của
   * trạng thái cộng dồn. Bảng tra `submitLabel` trong `PortfolioScreen.tsx` ghi lại vì sao vẫn
   * giữ dạng bảng dù chỉ còn hai nhánh.
   */

  it('không gọi mạng để dựng danh sách công thức', async () => {
    await moSheetCongThuc();

    // Chỉ đúng một lần gọi cho THỊ GIÁ lúc vào màn; sheet công thức không thêm lần nào.
    expect(feed.snapshots).toHaveBeenCalledTimes(1);
  });

  it('chia hai nhóm cấp độ, Cơ bản đứng trước Nâng cao', async () => {
    const sheet = await moSheetCongThuc();

    /*
     * Thứ tự nhóm được ghim bằng hằng trong component chứ không suy từ thứ tự dữ liệu. Ca này
     * khoá đúng điều đó: `LIVE_PRESET_FORMULAS` xếp theo tỷ lệ ô điền, nên nếu ai đó đổi
     * `filled/total` của một công thức nâng cao thì nhóm Nâng cao sẽ nhảy lên đầu — và ca này đỏ.
     */
    const headings = within(sheet)
      .getAllByRole('heading', { level: 3 })
      .map((heading) => heading.textContent);

    expect(headings).toEqual(['Cơ bản', 'Nâng cao']);
  });

  /*
   * Ca khoá quyết định "KHÔNG lọc theo chế độ".
   *
   * Chế độ mặc định của sản phẩm là Cơ bản, và ba màn duyệt (FormulaBrowser, HomeSearchPanel,
   * SearchScreen) đều ẩn hẳn công thức nâng cao ở chế độ đó. Sheet này cố ý KHÔNG theo, vì nó là
   * kệ ghim tay chứ không phải danh sách duyệt — xem docblock `FormulaForTickerSheet`. Ai thêm
   * bộ lọc sau này sẽ làm ca này đỏ, đúng ý đồ.
   */
  it('chế độ Cơ bản vẫn hiện ĐỦ mọi công thức, không ẩn nhóm Nâng cao', async () => {
    const sheet = await moSheetCongThuc();

    expect(within(sheet).getAllByRole('listitem')).toHaveLength(LIVE_PRESET_FORMULAS.length);
  });

  it('ô tìm lọc danh sách, khớp cả khi gõ không dấu', async () => {
    const sheet = await moSheetCongThuc();
    const box = within(sheet).getByRole('searchbox');

    await userEvent.type(box, 'roe');
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(1);
    expect(within(sheet).getByRole('button', { name: /ROE/ })).toBeTruthy();

    /*
     * Lọc bằng chính `matchFormula` của ô tìm toàn cục, nên gõ KHÔNG DẤU vẫn ra đúng: "co tuc"
     * khớp "cổ tức". Viết một bản so chuỗi riêng cho sheet sẽ làm ca này đỏ.
     *
     * Không khẳng định "mọi kết quả đều có chữ cổ tức trong TÊN": khớp chính tra cả `tags`, nên các
     * mô hình chiết khấu cổ tức (Gordon, DDM) cũng khớp — đúng như ở màn Công thức.
     */
    await userEvent.clear(box);
    await userEvent.type(box, 'co tuc');
    expect(within(sheet).getByRole('button', { name: /Tỷ suất cổ tức/ })).toBeTruthy();
    expect(within(sheet).queryByRole('button', { name: /ROE/ })).toBeNull();
  });

  it('gõ từ khoá không khớp gì thì nói rõ, không để danh sách trống câm', async () => {
    const sheet = await moSheetCongThuc();

    await userEvent.type(within(sheet).getByRole('searchbox'), 'zzzz');

    expect(within(sheet).queryAllByRole('listitem')).toHaveLength(0);
    expect(within(sheet).getByText('Không tìm thấy công thức nào')).toBeTruthy();
  });

  /*
   * Mã tra được số liệu cơ bản nhưng KHÔNG có thị giá là ca có thật — `finbox/map.ts` đối chiếu
   * hai thứ đó độc lập nhau. Khi đó 14 công thức điền hụt một ô và 6 công thức không điền được ô
   * nào, nên sheet phải nói khác đi thay vì cứ in con số ghim ra.
   */
  it('mã thiếu thị giá: bỏ công thức không điền được ô nào và nói rõ lý do', async () => {
    feed.snapshots.mockResolvedValue(new Map([['FPT', { ...FPT_SNAPSHOT, priceVnd: null }]]));
    const sheet = await moSheetCongThucKhiSua();

    expect(within(sheet).getByText(/Chưa tra được thị giá của mã này/)).toBeTruthy();
    // 34 − 6 công thức chỉ điền được đúng ô thị giá.
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(LIVE_PRESET_FORMULAS.length - 6);
    // `bien-an-toan` chỉ điền được mỗi thị giá → phải biến mất hẳn.
    expect(within(sheet).queryByRole('button', { name: /[Bb]iên an toàn/ })).toBeNull();
  });

  it('mã thiếu thị giá: P/E hạ từ 2/2 xuống 1/2 ô, không hứa quá', async () => {
    feed.snapshots.mockResolvedValue(new Map([['FPT', { ...FPT_SNAPSHOT, priceVnd: null }]]));
    const sheet = await moSheetCongThucKhiSua();

    expect(within(sheet).getByRole('button', { name: /P\/E — hệ số/ }).textContent).toContain(
      '1/2',
    );
  });

  it('công thức nâng cao nằm trong nhóm Nâng cao', async () => {
    const sheet = await moSheetCongThuc();

    // `getByRole('region', …)` chỉ tìm thấy khi <section> có tên đọc lên được — nên ca này kiểm
    // luôn cả việc `aria-labelledby` nối đúng vào tiêu đề nhóm.
    const nangCao = within(sheet).getByRole('region', { name: 'Nâng cao' });

    expect(within(nangCao).getByRole('button', { name: /WACC/ })).toBeTruthy();
    // Và công thức cơ bản thì KHÔNG được lọt vào nhóm nâng cao.
    expect(within(nangCao).queryByRole('button', { name: /P\/E — hệ số/ })).toBeNull();
  });
});

describe('WF-06 — sửa một mã đã thêm', () => {
  it('bấm vào dòng mã thì mở form đã đổ sẵn số đang lưu', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));

    expect((screen.getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement).value).toBe('100');
    expect((screen.getByLabelText('Giá vốn một cổ phiếu (₫)') as HTMLInputElement).value).toBe(
      '60.000',
    );
    // Ngày/tháng/năm như cột của bảng, không phải chuỗi ISO của kho — xem khối ngay dưới.
    expect((screen.getByLabelText('Ngày mua') as HTMLInputElement).value).toBe('02/01/2026');
  });

  /*
   * ── Ô ngày mua nói cùng một lối với cột "Ngày mua" (13/10/2026) ─────────────────────────────
   *
   * Chủ dự án chụp màn: cột in `03/10/2026`, bấm vào dòng để sửa thì ô ngày trong hộp thoại in
   * `10/03/2026`. Ô ấy từng là `<input type="date">`, do trình duyệt vẽ theo ngôn ngữ của trình
   * duyệt (Chrome tiếng Anh: tháng/ngày/năm). jsdom không vẽ ô ngày nên không tái hiện được hai
   * thứ tự, nhưng tái hiện được nguyên nhân: ô phải là ô CHỮ và chữ trong ô phải BẰNG chữ của cột.
   */
  function gieoMaMuaNgay(buyDate: string): void {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([{ code: 'FPT', quantity: 100, costPrice: 60_000, buyDate, beta: null }]),
    );
  }

  function ngayDaLuu(): unknown {
    const raw = window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]';
    return (JSON.parse(raw) as ReadonlyArray<{ buyDate?: unknown }>)[0]?.buyDate;
  }

  it('ô ngày mua trong form in ĐÚNG chữ của cột Ngày mua, và là ô chữ chứ không phải ô ngày của trình duyệt', async () => {
    // Ngày 3 tháng 10: đúng ca chủ dự án chụp, và là ngày mà hai thứ tự đọc ra hai ngày khác nhau.
    gieoMaMuaNgay('2026-10-03');
    render(<PortfolioScreen />);

    const dong = (await screen.findByRole('button', { name: 'Sửa FPT' })).closest('tr');
    const oCuoi = dong?.querySelector('td:last-child')?.textContent;
    expect(oCuoi).toBe('03/10/2026');

    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));
    const oNgay = screen.getByLabelText('Ngày mua') as HTMLInputElement;

    expect(oNgay.value).toBe(oCuoi);
    expect(oNgay.type).toBe('text');
  });

  it('gõ ngày theo ngày/tháng/năm thì kho nhận đúng ngày ấy ở dạng ISO', async () => {
    gieoMaMuaNgay('');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    await userEvent.type(screen.getByLabelText('Ngày mua'), '03/10/2026');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    // Ngày 3 tháng 10. Đọc theo tháng/ngày thì sẽ ra '2026-03-10'.
    await waitFor(() => {
      expect(ngayDaLuu()).toBe('2026-10-03');
    });
  });

  /*
   * Bàn phím số của điện thoại không có phím '/', nên tám chữ số liền phải thành một ngày lúc rời
   * ô — cùng luật với cột Ngày của bảng dữ liệu (`withSeriesDateSlashes`).
   */
  it('gõ tám chữ số liền rồi rời ô thì ô tự thành ngày/tháng/năm', async () => {
    gieoMaMuaNgay('');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    const oNgay = screen.getByLabelText('Ngày mua') as HTMLInputElement;
    await userEvent.type(oNgay, '03102026');
    expect(oNgay.value).toBe('03102026');

    await userEvent.tab();
    expect(oNgay.value).toBe('03/10/2026');
  });

  it('chữ cái không vào được ô ngày mua', async () => {
    gieoMaMuaNgay('');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    const oNgay = screen.getByLabelText('Ngày mua') as HTMLInputElement;
    await userEvent.type(oNgay, 'ngày 3');

    expect(oNgay.value).toBe('3');
  });

  /*
   * Ô `type="date"` cũ không cho gõ ra một ngày không có trên lịch. Ô chữ thì cho, nên form phải
   * tự chặn: coi '31/02/2026' là ô trống thì kho mất ngày mua trong khi ô vẫn in một ngày, còn để
   * nó trôi xuống `Date.parse()` thì V8 đọc thành ngày 3 tháng 3.
   */
  it('ngày không có trên lịch thì form báo lỗi và KHÔNG ghi gì xuống kho', async () => {
    gieoMaMuaNgay('2026-01-02');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    const oNgay = screen.getByLabelText('Ngày mua');
    await userEvent.clear(oNgay);
    await userEvent.type(oNgay, '31/02/2026');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(await screen.findByText(/Ngày mua chưa đọc được/)).toBeTruthy();
    expect(ngayDaLuu()).toBe('2026-01-02');
  });

  it('xoá trắng ô ngày mua rồi lưu thì kho ghi "không có ngày", không báo lỗi', async () => {
    gieoMaMuaNgay('2026-01-02');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    await userEvent.clear(screen.getByLabelText('Ngày mua'));
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      expect(ngayDaLuu()).toBe('');
    });
  });

  /*
   * Nút lịch mở bảng lịch của trình duyệt qua một ô `type="date"` TÀNG HÌNH. jsdom không có
   * `showPicker()`, nên ca này giả đúng thứ bảng lịch làm khi người dùng bấm một ngày: đặt giá trị
   * ISO vào ô ấy. Ô chữ phải in lại theo ngày/tháng/năm.
   */
  it('chọn ngày trên lịch thì ô chữ in ngày ấy theo ngày/tháng/năm', async () => {
    gieoMaMuaNgay('');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    const nutLich = screen.getByRole('button', { name: 'Ngày mua · Chọn ngày trên lịch' });
    const oLich = nutLich.parentElement?.querySelector('input[type="date"]');
    expect(oLich).toBeTruthy();
    // Ngoài thứ tự Tab và ngoài cây trợ năng: người dùng bàn phím gõ thẳng vào ô chữ.
    expect(oLich?.getAttribute('tabindex')).toBe('-1');
    expect(oLich?.getAttribute('aria-hidden')).toBe('true');

    fireEvent.change(oLich as Element, { target: { value: '2026-10-03' } });

    expect((screen.getByLabelText('Ngày mua') as HTMLInputElement).value).toBe('03/10/2026');
  });

  /*
   * Ca chặn đúng cái bẫy mà việc sửa sinh ra để chữa.
   *
   * Trước gói này màn chỉ có thêm và bỏ, nên muốn đính chính 100 CP thành 250 CP là phải xoá rồi
   * nhập lại — mà nếu ai đó nối nút Sửa vào `addHolding()` cho nhanh thì kết quả sẽ là 350 CP.
   */
  it('lưu thay đổi THAY THẾ số cũ, không cộng dồn', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));
    const quantity = screen.getByLabelText('Số cổ phiếu nắm giữ');
    await userEvent.clear(quantity);
    await userEvent.type(quantity, '250');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    // 250 CP × 71.400 ₫ = 17.850.000 ₫. Cộng dồn thì sẽ là 350 CP → 24.990.000 ₫.
    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('17.850.000');
    });
    expect(screen.queryByText(/24\.990\.000/)).toBeNull();
  });

  it('ô mã bị khoá khi đang sửa — đổi mã là hai thao tác khác, không phải sửa', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));

    expect(
      (screen.getByRole('button', { name: 'Mã cổ phiếu' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  /*
   * Lời khuyên (`fix`) của cảnh báo beta là "bấm vào mã còn thiếu để sửa và nhập beta". Ca này
   * kiểm rằng đường đi ấy có thật — trước gói này câu đó chỉ tới một chức năng không tồn tại.
   *
   * Dò bằng GIÁ TRỊ của ô chứ không bằng câu cảnh báo: từ 29/09/2026 ô Beta không in câu lý do
   * nữa (ca ngay dưới), nên "_ _" thành con số là bằng chứng duy nhất nhìn thấy được.
   */
  it('nhập được beta qua form sửa, và ô Beta danh mục tính ra ngay', async () => {
    seedHolding();
    // Cả ô Beta lẫn ô nhập beta đều thuộc chế độ Nâng cao — FR-09.
    await moManNangCao();

    expect((await oThongKe('Beta danh mục')).textContent).toContain('_ _');

    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));
    await userEvent.type(screen.getByLabelText('Beta'), '1,1');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(async () => {
      const oBeta = await oThongKe('Beta danh mục');
      expect(oBeta.textContent).toContain('1,1');
      expect(oBeta.textContent).not.toContain('_ _');
    });

    /*
     * Beta đã lưu phải còn nguyên khi mở lại form Sửa — hàng bảng KHÔNG hiện beta nữa (12/10/2026),
     * nên form là nơi duy nhất đọc lại được con số này.
     */
    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));
    expect((screen.getByLabelText('Beta') as HTMLInputElement).value).toBe('1,1');
  });

  /*
   * Ô Beta và ô XIRR hiện "_ _" mà KHÔNG kèm câu lý do — chủ dự án bỏ 29/09/2026 ("không cần phải
   * có đoạn giải thích này"). Với người mới hai ô này gần như luôn ở "_ _", nên câu lý do thành một
   * đoạn cố định kể lại danh sách mã.
   *
   * Viết thẳng câu ra chứ không đọc từ `summarisePortfolio`: cảnh báo vẫn nằm trong dữ liệu, chỉ
   * màn thôi in. Chờ ô Tổng giá trị ra số trước, vì lúc thị giá chưa về thì hai ô này mang một
   * câu khác ("…vì tổng giá trị danh mục đang lỗi") và ca sẽ xanh mà không kiểm được gì.
   */
  it('ô Beta và ô XIRR hiện “_ _” mà không kèm câu lý do', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([{ code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '', beta: null }]),
    );
    await moManNangCao();

    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });

    const oBeta = await oThongKe('Beta danh mục');
    const oXirr = await oThongKe('XIRR toàn DM');
    expect(oBeta.textContent).toContain('_ _');
    expect(oXirr.textContent).toContain('_ _');
    expect(screen.queryByText(/Chưa có beta của|bình quân gia quyền/)).toBeNull();
    expect(screen.queryByText(/Thiếu hoặc sai ngày mua|dựng được dòng tiền/)).toBeNull();
  });

  /*
   * Nút "?" sau hai nhãn (19/10/2026): chủ dự án _"thêm hướng dẫn sử dụng vào đằng sau Beta danh mục
   * và XIRR toàn DM"_. Câu lý do KHÔNG trở lại dưới hàng (ca ngay trên vẫn đứng); nó chỉ hiện trong
   * khung, khi người ta bấm hỏi, và phải kể đúng mã đang thiếu.
   */
  describe('nút “?” của Beta danh mục và XIRR toàn DM', () => {
    function seedThieu(): void {
      window.localStorage.setItem(
        PORTFOLIO_KEY,
        JSON.stringify([
          { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '', beta: null },
        ]),
      );
    }

    async function choGiaVe(): Promise<void> {
      await waitFor(async () => {
        expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
      });
    }

    it('mở khung Beta: là gì, vì sao đang trống (kể đúng mã), cách nhập; bấm lại thì đóng', async () => {
      seedThieu();
      await moManNangCao();
      await choGiaVe();

      const nut = screen.getByRole('link', { name: 'Hướng dẫn: Beta danh mục' });
      await userEvent.click(nut);
      const khung = await screen.findByRole('dialog', { name: 'Beta danh mục' });

      expect(within(khung).getByText('Tại sao phần này đang để trống')).toBeTruthy();
      expect(within(khung).getByText(/Chưa có beta của FPT/)).toBeTruthy();
      expect(within(khung).getByText('Nhập beta của mã vào ô Beta rồi lưu.')).toBeTruthy();
      expect(within(khung).getByText(/^So với mốc 1 lần:/)).toBeTruthy();

      await userEvent.click(nut);
      expect(screen.queryByRole('dialog', { name: 'Beta danh mục' })).toBeNull();
    });

    it('mở khung XIRR: lý do là ngày mua đang thiếu; Esc đóng', async () => {
      seedThieu();
      await moManNangCao();
      await choGiaVe();

      await userEvent.click(screen.getByRole('link', { name: 'Hướng dẫn: XIRR toàn danh mục' }));
      const khung = await screen.findByRole('dialog', { name: 'XIRR toàn danh mục' });

      expect(within(khung).getByText(/Thiếu hoặc sai ngày mua của FPT/)).toBeTruthy();
      expect(within(khung).getByText(/ngày\/tháng\/năm/)).toBeTruthy();

      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: 'XIRR toàn danh mục' })).toBeNull();
    });

    it('dòng đã ra số thì khung không có mục "Tại sao phần này đang để trống"', async () => {
      window.localStorage.setItem(
        PORTFOLIO_KEY,
        JSON.stringify([
          { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: 1.1 },
        ]),
      );
      await moManNangCao();
      await waitFor(async () => {
        expect((await oThongKe('Beta danh mục')).textContent).toContain('1,1');
      });

      await userEvent.click(screen.getByRole('link', { name: 'Hướng dẫn: Beta danh mục' }));
      const khung = await screen.findByRole('dialog', { name: 'Beta danh mục' });
      expect(within(khung).queryByText('Tại sao phần này đang để trống')).toBeNull();
    });

    it('chế độ Cơ bản không có hai nút “?” (hai dòng ấy là của Nâng cao)', async () => {
      seedHolding();
      render(<PortfolioScreen />);
      await tieuDeNamGiu();
      expect(screen.queryByRole('link', { name: /^Hướng dẫn: (Beta|XIRR)/ })).toBeNull();
    });
  });

  /*
   * Số dài không đâm thủng thẻ (29/09/2026) — chủ dự án chụp "866.777.778.513.713.70…" tràn qua ô
   * bên cạnh. Bố cục chỉ đo được trong Chrome (`check:chrome`); ca này ghim hai thứ CSS dựa vào:
   * `--ky-tu` đúng bằng số ký tự, và một `<wbr>` sau mỗi dấu chấm phân nhóm mà `textContent` không
   * đổi một ký tự nào — nhiều ca ở file này dò con số qua đúng `textContent`.
   *
   * Từ 12/10/2026 chỉ SỐ LỚN "Tổng giá trị" co chữ theo `--ky-tu`; các dòng nhỏ bên dưới (vốn, beta,
   * XIRR) cỡ chữ cố định và chỉ mang `<wbr>`, vì chúng nằm trong một lưới nhãn–giá trị đủ rộng.
   * 100.000.000.000 × 71.400 = 7.140.000.000.000.000 — dưới 2^53 nên con số in ra đúng từng chữ số.
   */
  it('số dài: số lớn mang số ký tự cho CSS co chữ, và có chỗ ngắt sau mỗi dấu chấm phân nhóm', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([{ code: 'FPT', quantity: 100_000_000_000, costPrice: 60_000, buyDate: '' }]),
    );
    render(<PortfolioScreen />);

    const oTong = await oThongKe('Tổng giá trị');
    await waitFor(() => {
      expect(oTong.textContent).toContain('7.140.000.000.000.000 ₫');
    });

    const so = oTong.querySelector('[style]');
    if (!(so instanceof HTMLElement)) throw new Error('Không thấy phần tử mang con số');
    expect(so.textContent).toBe('7.140.000.000.000.000 ₫');
    expect(so.style.getPropertyValue('--ky-tu')).toBe(String('7.140.000.000.000.000 ₫'.length));
    expect(so.querySelectorAll('wbr')).toHaveLength(5);
  });
});

/*
 * Chế độ Cơ bản giấu bớt màn Danh mục — FR-09, vế thứ ba (sau "công thức" và "biến").
 *
 * Chủ dự án báo: bấm nút Cơ bản / Nâng cao ở thanh trên thì tab Danh mục không đổi gì. Đúng
 * vậy — trước gói này màn không đọc `usePreferences()` một dòng nào.
 */
describe('WF-06 — chế độ hiển thị giấu bớt ô nâng cao (FR-09)', () => {
  /*
   * Bốn nhãn dòng của thẻ tóm tắt khi danh mục CHƯA có mã nào (dòng lãi/lỗ chưa dựng được, và "Số mã"
   * không còn trong thẻ). Đếm bằng nhãn chứ không đếm phần tử: class đã bị CSS Modules băm.
   */
  const NHAN_O = ['Tổng giá trị', 'Vốn đã bỏ ra', 'Beta danh mục', 'XIRR toàn DM'] as const;

  function demO(): number {
    return NHAN_O.filter((nhan) => screen.queryByText(nhan) !== null).length;
  }

  it('Cơ bản dựng 2 dòng số, Nâng cao dựng 4 — hiệu số đúng bằng số ô nói là đang ẩn', async () => {
    render(<PortfolioScreen />);
    await tieuDeNamGiu();

    const coBan = demO();
    expect(coBan).toBe(2);
    expect(screen.queryByText('Beta danh mục')).toBeNull();
    expect(screen.queryByText('XIRR toàn DM')).toBeNull();

    cleanup();
    await moManNangCao();
    expect(screen.getByText('XIRR toàn DM')).toBeTruthy();

    /*
     * Con số trên dòng "N ô nâng cao đang ẩn" phải bằng ĐÚNG hiệu số ô thật giữa hai chế độ.
     * Đây là chỗ gác hằng số `ADVANCED_TILES`: thêm một ô nâng cao mà quên sửa nó thì câu chữ
     * hứa một đằng, màn giấu một nẻo — mà không cửa nào khác thấy được.
     */
    expect(demO() - coBan).toBe(2);
  });

  it('Cơ bản nói ra là đang giấu, và bấm vào là hiện đủ', async () => {
    render(
      <PreferencesProvider>
        <PortfolioScreen />
      </PreferencesProvider>,
    );
    await tieuDeNamGiu();

    // Phải nói ra bằng SỐ — "một vài ô đang ẩn" thì người dùng không biết mình đang thiếu gì.
    expect(screen.getByText(/ô nâng cao đang ẩn/).textContent).toContain('2');

    await userEvent.click(screen.getByRole('button', { name: 'Bật chế độ Nâng cao' }));

    expect(await screen.findByText('Beta danh mục')).toBeTruthy();
    expect(screen.getByText('XIRR toàn DM')).toBeTruthy();
    // Nói xong việc thì dòng báo phải biến mất, không đứng đó nói một chuyện đã cũ.
    expect(screen.queryByText(/ô nâng cao đang ẩn/)).toBeNull();
  });

  it('Cơ bản: form thêm mã không có ô Beta', async () => {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    // Ba ô kia vẫn còn — chỉ đúng một ô bị giấu.
    expect(screen.getByLabelText('Số cổ phiếu nắm giữ')).toBeTruthy();
    expect(screen.getByLabelText('Giá vốn một cổ phiếu (₫)')).toBeTruthy();
    expect(screen.queryByLabelText('Beta')).toBeNull();
  });

  /*
   * Ca chống hồi quy quan trọng nhất của cả gói.
   *
   * `updateHolding()` THAY THẾ trọn bản ghi. Nếu `submit()` cứ đọc `form.beta` trong khi ô beta
   * đang ẩn, thì mỗi lần người dùng sửa số lượng ở chế độ Cơ bản sẽ xoá sạch beta họ đã nhập
   * trước đó — mất dữ liệu trong im lặng, không phải chuyện ẩn hiển thị.
   */
  it('Cơ bản: sửa một mã đang có beta thì beta KHÔNG bị xoá', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: 1.1 },
      ]),
    );

    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /^Sửa FPT/ }));

    const quantity = screen.getByLabelText('Số cổ phiếu nắm giữ');
    await userEvent.clear(quantity);
    await userEvent.type(quantity, '200');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      const saved: unknown = JSON.parse(window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]');
      expect(saved).toEqual([expect.objectContaining({ quantity: 200, beta: 1.1 })]);
    });
  });
});

/*
 * Chủ dự án báo hai chuyện sau đợt vá 8 đề mục: không tìm thấy chỗ sửa, và "có vẻ đang tạo được
 * mã trùng nhau". Kiểm bằng máy: KHÔNG có mã trùng — `addHolding()` cộng dồn đúng như thiết kế.
 * Cái sai là màn làm việc đó trong im lặng, cộng với nút Sửa không có tín hiệu nào cho biết nó
 * bấm được.
 *
 * ── Cách chữa đã ĐẢO ngày 10/10/2026 ──────────────────────────────────────────────────────────
 *
 * Bản cũ chữa bằng CHỮ: sheet dán nhãn "đã có", nút đổi nhãn thành "Cộng thêm", và form in một
 * câu nói trước rằng số sẽ được cộng dồn. Chủ dự án chốt ngược — *"mã nào đã thêm rồi thì không
 * cho thêm nữa chứ không phải hiển button 'Cộng thêm' làm gì"* — nên nay chữa bằng CỬA: mã đang
 * giữ không chọn được, và muốn đổi số thì bấm vào mã rồi bấm Sửa.
 *
 * Ba ca dưới đây là ca ĐẢO của ba ca cũ, không phải ba ca bị xoá: ai nối lại đường cộng dồn qua
 * sheet sẽ làm chúng đỏ, nên việc ấy là một quyết định chứ không phải một cú trượt tay.
 */
describe('WF-06 — mã đang giữ thì không thêm lại được', () => {
  async function moSheetChonMa(): Promise<HTMLElement> {
    seedHolding();
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    return tamTrenCung();
  }

  /** Dòng của một mã trong sheet, tìm theo mã chứ không theo thứ tự. */
  function dongTrongSheet(sheet: HTMLElement, code: string): HTMLElement {
    const dong = within(sheet)
      .getAllByRole('listitem')
      .find((item) => item.textContent?.startsWith(code) === true);
    if (dong === undefined) throw new Error(`Sheet không có dòng nào của ${code}`);
    return dong;
  }

  it('nút chọn của mã đang giữ bị khoá, mã chưa giữ thì không', async () => {
    const sheet = await moSheetChonMa();

    const nutFpt = within(dongTrongSheet(sheet, 'FPT')).getByRole('button') as HTMLButtonElement;
    const nutHpg = within(dongTrongSheet(sheet, 'HPG')).getByRole('button') as HTMLButtonElement;

    expect(nutFpt.disabled).toBe(true);
    expect(nutHpg.disabled).toBe(false);
  });

  /*
   * Nhãn nút KHÔNG đổi theo trạng thái nữa — `ticker.pickHeld` ("Cộng thêm") đã xoá. Một nhãn
   * riêng cho mã đang giữ sẽ hứa đúng cái việc nút vừa thôi làm.
   */
  it('cả hai nút cùng nhãn "Chọn", không còn nhãn "Cộng thêm" nào', async () => {
    const sheet = await moSheetChonMa();

    expect(within(sheet).getAllByRole('button', { name: 'Chọn' })).toHaveLength(2);
    expect(within(sheet).queryByRole('button', { name: /Cộng thêm/ })).toBeNull();
  });

  /*
   * Một nút xám không giải thích gì thì người dùng bàn phím và trình đọc màn hình chỉ nghe "Chọn,
   * không dùng được". Nhãn "đã có" là lý do duy nhất có trên màn, nên nút phải trỏ vào đúng nó.
   */
  it('nhãn "đã có" vừa hiện trên dòng vừa là lời giải thích của nút khoá', async () => {
    const sheet = await moSheetChonMa();

    const dongFpt = dongTrongSheet(sheet, 'FPT');
    expect(dongFpt.textContent).toContain('đã có');
    expect(dongTrongSheet(sheet, 'HPG').textContent).not.toContain('đã có');

    const nut = within(dongFpt).getByRole('button');
    const idLyDo = nut.getAttribute('aria-describedby');
    expect(idLyDo).not.toBeNull();
    expect(dongFpt.querySelector(`#${idLyDo ?? ''}`)?.textContent).toBe('đã có');
  });

  /*
   * Câu "Mã này đã có trong danh mục. Thêm nữa sẽ cộng dồn số lượng…" đã xoá. Ca ĐẢO: nó không
   * được quay lại ngay cả khi ai đó nối lại đường cộng dồn — câu ấy giải thích một việc mà sản
   * phẩm nay không cho xảy ra.
   */
  it('không còn câu nào nói về việc cộng dồn số lượng', async () => {
    await moSheetChonMa();

    expect(screen.queryByText(/cộng dồn/)).toBeNull();
    expect(screen.queryByText(/giá vốn bình quân/)).toBeNull();
  });

  /*
   * Đường thay thế phải có thật, nếu không thì cái cửa vừa đóng là một ngõ cụt: muốn đổi số của
   * một mã đang giữ thì bấm vào mã rồi bấm Sửa. Ca "sửa một mã đã thêm" ở nhóm trên khoá phần
   * lưu; ca này chỉ khoá rằng lối vào ấy vẫn còn và nó đổ sẵn đúng số đang lưu.
   */
  it('đường thay thế vẫn mở: bấm vào mã rồi bấm Sửa thì đổi được số đang có', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /^Sửa FPT/ }));

    expect((screen.getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement).value).toBe('100');
  });

  /*
   * Hàng mở rộng đi rồi lại về. 12/10/2026 bản hai cột bỏ nó (ca này khi ấy tên "hàng mã không còn nút
   * phủ, mũi tên hay trạng thái đóng/mở nào"). 14/10/2026 bản vẽ khổ ĐIỆN THOẠI của chủ dự án đưa nó
   * trở lại — chỉ dưới 1024px, xem khối "khổ điện thoại" cuối file. Ca này giữ vế PC: mũi tên có trong
   * DOM (CSS ẩn nó từ 1024px) và đóng sẵn, còn bấm vào dòng ở PC thì KHÔNG dựng dòng chi tiết nào — nó mở
   * form Sửa như bản 13/10/2026.
   */
  it('PC: mũi tên "Chi tiết" đóng sẵn, bấm dòng không dựng dòng chi tiết', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
    render(<PortfolioScreen />);

    const dong = await dongMa('FPT');

    const muiTen = within(dong).getByRole('button', { name: 'Chi tiết FPT' });
    expect(muiTen.getAttribute('aria-expanded')).toBe('false');
    // Đóng thì không trỏ `aria-controls` vào đâu: dòng chi tiết chỉ dựng lúc mở.
    expect(muiTen.hasAttribute('aria-controls')).toBe(false);
    // Bấm vào ô của hàng ở PC (jsdom không có `matchMedia` = PC): không thêm dòng nào.
    await userEvent.click(within(dong).getAllByRole('cell')[1] as HTMLElement);
    expect(screen.getAllByRole('row')).toHaveLength(3);
  });
});

describe('WF-06 — form không được hỏng trong im lặng', () => {
  async function moForm(): Promise<void> {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));
  }

  it('chưa chọn mã: nói lý do, và form KHÔNG đóng lại như đã thêm xong', async () => {
    await moForm();
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    expect(screen.getByText('Chọn mã cổ phiếu trước đã.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thêm vào danh mục' })).toBeTruthy();
  });

  /*
   * Ca tệ nhất trong ba ca im lặng cũ: số lượng 0 lọt qua cửa chặn ở màn, bị `addHolding()` loại
   * lặng lẽ, rồi form vẫn đóng lại — trông y hệt như đã thêm xong.
   */
  it('số lượng 0: nói lý do thay vì đóng form như đã thêm xong', async () => {
    await moForm();
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '0');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    expect(screen.getByText('Nhập số cổ phiếu nắm giữ, lớn hơn 0.')).toBeTruthy();
    // Một câu, không hai — vế chỉ đường bỏ 08/10/2026, xem `portfolio.empty` ở `vi.ts`.
    expect(screen.getByText('Chưa có mã nào.')).toBeTruthy();
  });

  /*
   * Ca này gõ 'abc' cho tới 14/09/2026, ngày cửa chặn chữ cái bật lên — từ đó chữ không vào nổi ô
   * nữa nên không còn đường nào dẫn tới câu lỗi bằng chữ cái. Câu lỗi VẪN phải ở lại, vì cửa kia
   * chỉ chặn KÝ TỰ: '1,2,3' gồm toàn ký tự hợp lệ mà `parseViNumber` vẫn trả `null`. Đổi đường
   * vào chứ không xoá ca — thứ nó bảo vệ ("không lặng lẽ biến thành chưa-có-beta") không đổi.
   */
  it('beta không đọc được: nói rõ, không lặng lẽ biến thành “chưa có beta”', async () => {
    // Ô beta chỉ có ở chế độ Nâng cao, nên câu lỗi của nó cũng chỉ có nghĩa ở đó — FR-09.
    await moManNangCao();
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    const beta = screen.getByLabelText('Beta') as HTMLInputElement;
    await userEvent.type(beta, 'abc');
    expect(beta.value).toBe('');

    await userEvent.type(beta, '1,2,3');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    expect(screen.getByText(/Beta phải là một số/)).toBeTruthy();
  });

  it('đủ trần số mã: nói rõ danh mục đã đầy', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify(
        Array.from({ length: MAX_HOLDINGS }, (_, i) => ({
          code: `M${String(i)}`,
          quantity: 10,
          costPrice: 1_000,
          buyDate: '2026-01-02',
        })),
      ),
    );
    await moForm();

    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    expect(screen.getByText(/Danh mục đã đủ/)).toBeTruthy();
  });

  it('sửa lại ô thì câu lỗi của chính ô đó biến mất', async () => {
    await moForm();
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));
    expect(screen.getByText('Nhập số cổ phiếu nắm giữ, lớn hơn 0.')).toBeTruthy();

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '5');
    expect(screen.queryByText('Nhập số cổ phiếu nắm giữ, lớn hơn 0.')).toBeNull();
  });

  /*
   * Chủ dự án chốt 14/09/2026: ô nhập số không được để chữ cái xuất hiện. Ba ô số của form này đi
   * thẳng qua primitive `Input` chứ không qua `NumberInput` (lý do ở docblock màn), nên chúng phải
   * được ghim riêng — sửa `NumberInput` không che được chỗ này.
   */
  it('gõ chữ vào ô số lượng thì ô không nhận', async () => {
    await moForm();

    const o = screen.getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement;
    await userEvent.type(o, '1a0b0');

    expect(o.value).toBe('100');
  });

  it('gõ chữ vào ô giá vốn thì ô không nhận', async () => {
    await moForm();

    const o = screen.getByLabelText('Giá vốn một cổ phiếu (₫)') as HTMLInputElement;
    await userEvent.type(o, 'abc');

    expect(o.value).toBe('');
  });

  /*
   * Lỗi chủ dự án báo 14/09/2026, ngay sau khi cửa chặn chữ cái lên: *"đang nhập số mà bấm nhầm
   * sau text chữ số thì số trong ô lại bị xóa đi"*. Chữ bị loại ngay nên phím xoá ăn vào chữ số
   * thật — và với bộ gõ tiếng Việt thì phím xoá ấy TỰ ĐỘNG (Unikey gửi Backspace + chữ có dấu),
   * nên gõ vài chữ là ô sạch số. Ba ô này đi thẳng qua primitive `Input` nên phải ghim riêng.
   */
  it('bấm nhầm chữ rồi bấm xoá: ba ô số đều không mất chữ số', async () => {
    await moManNangCao();
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    for (const nhan of ['Số cổ phiếu nắm giữ', 'Giá vốn một cổ phiếu (₫)', 'Beta']) {
      const o = screen.getByLabelText(nhan) as HTMLInputElement;
      await userEvent.clear(o);
      await userEvent.type(o, '100');
      await userEvent.type(o, 'a');
      expect(o.value, nhan).toBe('100');

      await userEvent.type(o, '{Backspace}');
      expect(o.value, nhan).toBe('100');

      await userEvent.type(o, '{Backspace}');
      expect(o.value, nhan).toBe('10');
    }
  });

  it('mô phỏng bộ gõ tiếng Việt ở ô số lượng: không mất chữ số nào', async () => {
    await moForm();

    const o = screen.getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement;
    await userEvent.type(o, '250');

    /* Đúng thứ Unikey gửi khi gõ 'a' rồi 's': ký tự, phím xoá, rồi ký tự có dấu. */
    for (const _lan of [1, 2, 3]) {
      await userEvent.type(o, 'a');
      await userEvent.type(o, '{Backspace}');
      await userEvent.type(o, 'á');
    }

    expect(o.value).toBe('250');
  });

  it('dán “60.000 ₫” vào ô giá vốn thì lưu ra đúng 60.000', async () => {
    render(<PortfolioScreen />);
    await chonMaTrongForm();

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    const giaVon = screen.getByLabelText('Giá vốn một cổ phiếu (₫)') as HTMLInputElement;
    await userEvent.click(giaVon);
    await userEvent.paste('60.000 ₫');

    expect(giaVon.value).toBe('60.000');

    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    // Vốn = 100 × 60.000 ₫. Ô "Vốn đã bỏ ra" là con số sống sót kể cả khi mất mạng.
    const von = (await screen.findByText('Vốn đã bỏ ra')).parentElement;
    expect(von?.textContent).toContain('6.000.000');
  });
});

describe('WF-06 — lãi/lỗ và những thứ dòng mã từng giấu', () => {
  it('hai ô mới ra số đúng: vốn, và lãi/lỗ kèm phần trăm làm dòng phụ', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    // 100 CP: vốn 6.000.000 ₫, thị giá 7.140.000 ₫ → lãi 1.140.000 ₫ = +19,0%.
    const von = (await screen.findByText('Vốn đã bỏ ra')).parentElement;
    expect(von?.textContent).toContain('6.000.000');

    /*
     * Tra theo ô chứ không theo cả màn: chữ "Lãi/lỗ" và con số 1.140.000 cố ý xuất hiện HAI lần
     * — một ở ô tổng đầu màn, một ở hàng của mã FPT.
     *
     * Lọc bằng `closest('table')`, KHÔNG phải `closest('li')` như bản trước: từ 22/09/2026 danh
     * sách mã là một `<table>`, nên vị từ cũ đúng cho mọi kết quả và bộ lọc mất hết ý nghĩa —
     * `.find` chỉ còn trả về phần tử đầu theo thứ tự DOM, tình cờ vẫn là ô tổng.
     */
    const lai = screen
      .getAllByText('Lãi/lỗ')
      .find((node) => node.closest('table') === null)?.parentElement;

    expect(lai?.textContent).toContain('1.140.000');
    // Phần trăm là dòng phụ của chính ô ấy, không chiếm thêm một ô thứ bảy.
    expect(lai?.textContent).toContain('19');
  });

  /*
   * Hàng mã mang BẢY con số: số lượng, giá vốn, thị giá, lãi/lỗ (tiền), lãi/lỗ (phần trăm) và tỷ trọng
   * — sáu số, cộng chip mã. Cột Giá trị và cột Doanh nghiệp đã bỏ ngày 12/10/2026, và chữ "CP",
   * "giá vốn", "tỷ trọng" đi liền con số của dòng gọn cũng bỏ theo: tiêu đề cột lo việc ấy.
   */
  it('hàng mã mang số lượng, giá vốn, thị giá, lãi/lỗ kèm dấu và tỷ trọng — không còn cột Giá trị', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await dongMa();
    await waitFor(() => {
      // 100 CP × 71.400 ₫ = 7.140.000 ₫, tức toàn bộ danh mục → tỷ trọng 100%.
      expect(row.textContent).toContain('100,0%');
    });

    const o = within(row)
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    expect(o).toHaveLength(8);
    expect(o[0]).toBe('FPT');
    expect(o[1]).toBe('100');
    expect(o[2]).toBe('60.000');
    expect(o[3]).toBe('71.400');
    // Dấu + mang tin chứ không chỉ có màu — NFR-USA-06. Số tiền và phần trăm là HAI ô.
    expect(o[4]).toBe('+1.140.000');
    expect(o[5]).toContain('+19');
    expect(o[5]).toContain('%');
    expect(o[6]).toBe('100,0%');
    expect(row.textContent).not.toContain('7.140.000');
  });

  /*
   * Ngày mua và beta từng nằm trong khối mở ra khi bấm một dòng (22/09/2026). Bản thiết kế 12/10/2026
   * bỏ khối ấy, và trong một ngày cả hai chỉ còn thấy trong form Sửa — ca này khi đó ghim đúng điều ấy.
   *
   * ĐẢO một nửa ngày 13/10/2026: chủ dự án bỏ hai nút biểu tượng cuối dòng và giao chỗ ấy cho ngày —
   * *"thay thế chỗ trước kia của 2 icon Sửa và Xóa thành hiển thị ngày vì đang chưa có ngày"*. Nên
   * NGÀY MUA nay nằm ở ô cuối của hàng, dưới tiêu đề cột của chính nó. Beta thì vẫn như cũ: không ai
   * giao chỗ cho nó, nên nó chỉ thấy khi mở form.
   */
  it('ngày mua hiện ở ô cuối của hàng; beta vẫn chỉ thấy khi mở form Sửa', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: 1.1 },
      ]),
    );
    await moManNangCao();

    const row = await dongMa();
    const o = within(row).getAllByRole('cell');
    // Ngày kiểu Việt Nam, không phải chuỗi ISO đọc thẳng từ kho.
    expect(o[o.length - 1]?.textContent).toBe('02/01/2026');
    expect(screen.getByRole('columnheader', { name: 'Ngày mua' })).toBeTruthy();
    expect(row.textContent).not.toContain('1,1');

    await userEvent.click(within(row).getByRole('button', { name: 'Sửa FPT' }));
    expect((screen.getByLabelText('Ngày mua') as HTMLInputElement).value).toBe('02/01/2026');
    expect((screen.getByLabelText('Beta') as HTMLInputElement).value).toBe('1,1');
  });

  /*
   * Mã không có ngày mua (ô ấy không bắt buộc), hoặc kho bị sửa tay thành một chuỗi không phải ngày:
   * ô in `_ _` — cùng ký hiệu "chưa có số liệu" của bốn ô thị giá. Không bỏ trống (ô trống trong cột
   * ngày đọc ra là bảng dựng thiếu), và không in nguyên chuỗi rác như thể nó là một ngày.
   */
  it('thiếu ngày mua, hoặc ngày trong kho không phải một ngày: ô in “_ _”', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: 'hôm qua', beta: null },
      ]),
    );
    render(<PortfolioScreen />);

    for (const code of ['FPT', 'HPG']) {
      const o = within(await dongMa(code)).getAllByRole('cell');
      expect(o[o.length - 1]?.textContent, code).toBe('_ _');
    }
    expect(screen.queryByText('hôm qua')).toBeNull();
  });

  /*
   * Thiếu thị giá thì BỐN ô cùng vắng: thị giá, giá trị, lãi/lỗ và tỷ trọng đều tính từ nó.
   *
   * Chủ dự án chốt ký hiệu ngày 22/09/2026: _"nếu thiếu thì để _ _ ý là đang chưa có dữ liệu và
   * bên trên có button làm mới"_. Trước đó cả cụm bên phải đổi thành một chữ "chưa có giá"; lặp
   * câu ấy bốn lần trên một hàng thì không đọc được, nên lý do dời hẳn lên dòng tiêu đề khối.
   *
   * Vế thứ hai là vế FR-06 và nó không đổi: KHÔNG được có một con số 0 nào thế chỗ.
   */
  it('thiếu thị giá: bốn ô hiện “_ _”, KHÔNG hiện lãi/lỗ bằng 0', async () => {
    feed.snapshots.mockResolvedValue(new Map());
    seedHolding();
    render(<PortfolioScreen />);

    const row = await dongMa();
    await waitFor(() => {
      expect(within(row).getAllByText('_ _')).toHaveLength(4);
    });
    expect(row.textContent).not.toContain('+0');
    expect(row.textContent).not.toContain('0%');
  });

  /*
   * Tám cột đều có tiêu đề thật, đúng thứ tự trong bản thiết kế 12/10/2026. Cột cuối từng chỉ chở hai
   * nút biểu tượng với tiêu đề ẩn "Thao tác"; từ 13/10/2026 nó là "Ngày mua", tiêu đề hiện ra như bảy
   * cột kia.
   *
   * Mỗi hàng phải có đúng bấy nhiêu ô: `<th>` và `<td>` thẳng cột nhờ cùng một quy tắc căn lề theo vị
   * trí (xem `.holdList` trong CSS), và đếm hụt hay dư là cách nó trôi mà không ai thấy.
   */
  it('mỗi số liệu có tiêu đề cột thật, và hàng có đúng bấy nhiêu ô', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const tieuDe = (await screen.findAllByRole('columnheader')).map((th) => th.textContent);
    expect(tieuDe).toEqual([
      'Mã',
      'Số CP',
      'Giá vốn',
      'Thị giá',
      'Lãi/lỗ',
      'Lãi/lỗ %',
      'Tỷ trọng',
      'Ngày mua',
    ]);

    const row = await dongMa();
    expect(within(row).getAllByRole('cell')).toHaveLength(tieuDe.length);
  });

  /*
   * ── Ô Mã của hàng: mã là chữ trơn bấm được, thùng rác đứng ngay sau nó (13/10/2026) ──────────
   *
   * Chủ dự án vẽ lại hàng này trên ảnh chụp: *"bỏ bo viền ngoài xanh xanh của tên ticker … chỉ để hiển
   * thị tên ticker thôi. bỏ 2 icon edit và xóa đi. thay vào đó … khi hover chuột vào một mã bất kỳ thì
   * icon xóa sẽ hiển thị chỗ đó … nếu người dùng muốn sửa hoặc xem mã đó thì bấm luôn vào mã"*.
   *
   * Ca cũ ở đây tên là "hai nút biểu tượng trên hàng không mang chữ nhưng đọc được tên" và ghim bút chì
   * cùng thùng rác ở CUỐI hàng. Vẫn hai nút, vẫn hai cái tên ấy — `dongMa()` và mọi ca khác neo vào
   * "Sửa FPT" nên tên phải giữ — nhưng nút Sửa nay chính là MÃ (có chữ), và cả hai dời về ô đầu.
   *
   * Vì sao mã phải là một nút chứ không phải chữ trơn: `<tr>` không lấy được tiêu điểm, nên cú bấm cả
   * dòng không với tới người dùng bàn phím và trình đọc màn hình. Phần "ẩn tới khi rê chuột" là việc
   * của CSS (`.rowRemove`, có phép đo riêng ở `check:chrome`); ca này giữ phần "đọc ra là nút gì".
   */
  it('ô Mã: mã là chữ trơn mang tên "Sửa FPT", thùng rác không chữ đứng ngay sau, không còn chip', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await dongMa();
    const sua = within(row).getByRole('button', { name: 'Sửa FPT' });
    const xoa = within(row).getByRole('button', { name: 'Xoá FPT' });

    // Mã hiện bằng chữ, và tên khả truy cập chứa đúng chữ ấy (WCAG 2.5.3).
    expect(sua.textContent).toBe('FPT');
    expect(xoa.textContent).toBe('');
    // Rê chuột thì hiện tên ngắn của việc — không kèm mã, người rê đang nhìn đúng dòng ấy.
    expect(sua.getAttribute('title')).toBe('Sửa');
    // "Xoá", KHÔNG phải "Bỏ mã": chủ dự án sửa tên nút thùng rác cho khớp bảng Công thức (12/10/2026).
    expect(xoa.getAttribute('title')).toBe('Xoá');
    expect(screen.queryByRole('button', { name: /Bỏ mã/ })).toBeNull();

    // Cả hai nằm trong Ô ĐẦU, mã trước thùng rác. Ô cuối (ngày mua) chỉ chở mũi tên mở dòng chi tiết
    // của khổ điện thoại (14/10/2026) — không thành cột riêng.
    const o = within(row).getAllByRole('cell');
    expect(within(o[0] as HTMLElement).getAllByRole('button')).toEqual([sua, xoa]);
    const muiTen = within(row).getByRole('button', { name: 'Chi tiết FPT' });
    expect(within(o[o.length - 1] as HTMLElement).getAllByRole('button')).toEqual([muiTen]);
    expect(muiTen.textContent).toBe('');
    // Ba nút trên cả hàng, và không còn bút chì.
    expect(within(row).getAllByRole('button')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Thêm công thức FPT' })).toBeNull();
    // Hết chip: mã không còn bọc trong huy hiệu của `Badge`.
    expect(sua.closest('[class*="badge"]')).toBeNull();
    expect(row.querySelector('[class*="badge"]')).toBeNull();
  });

  /*
   * Cả dòng là đích bấm mở form Sửa — không riêng gì chữ của mã. Bấm vào một ô SỐ là cách chắc nhất
   * để chứng minh điều ấy: ô đó không có nút nào bên trong.
   */
  it('bấm vào bất kỳ chỗ nào trên hàng thì mở form Sửa của đúng mã ấy', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
    render(<PortfolioScreen />);

    const row = await dongMa('HPG');
    await userEvent.click(within(row).getAllByRole('cell')[2] as HTMLElement);

    const hop = await tamTrenCung();
    expect(within(hop).getByRole('heading', { name: 'Sửa HPG' })).toBeTruthy();
    expect((within(hop).getByLabelText('Ngày mua') as HTMLInputElement).value).toBe('03/01/2026');
  });

  /*
   * Thùng rác nằm TRONG một dòng bấm được, nên cú bấm của nó không được nổi lên dòng: không chặn thì
   * bấm Xoá vừa xoá mã vừa mở form Sửa cho chính mã vừa biến mất.
   */
  it('bấm thùng rác chỉ xoá — KHÔNG mở form Sửa của mã vừa xoá', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await dongMa();
    await userEvent.click(within(row).getByRole('button', { name: 'Xoá FPT' }));

    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    expect(screen.queryAllByRole('dialog').filter((tam) => tam.hasAttribute('open'))).toHaveLength(
      0,
    );
  });

  /*
   * Bỏ mã bằng MỘT lần bấm, không hỏi lại — đúng bản thiết kế (trước đó phải mở khối chi tiết rồi mới
   * bấm Bỏ mã, tức hai thao tác). Ca này ghim hành vi để việc thêm một bước xác nhận sau này là một
   * quyết định có chủ đích. Ghi cả vào kho: danh mục chỉ sống ở localStorage, nên bỏ trên màn mà kho
   * còn nguyên là lần sau mở lại mã ấy hiện về.
   */
  it('bấm thùng rác thì bỏ đúng mã ấy khỏi màn lẫn khỏi kho, không động tới mã khác', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
    render(<PortfolioScreen />);

    const row = await dongMa('HPG');
    await userEvent.click(within(row).getByRole('button', { name: 'Xoá HPG' }));

    expect(screen.queryByRole('button', { name: 'Sửa HPG' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sửa FPT' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Mã 1' })).toBeTruthy();
    await waitFor(() => {
      const saved: unknown = JSON.parse(window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]');
      expect(saved).toEqual([expect.objectContaining({ code: 'FPT' })]);
    });
  });

  /*
   * Mã đã nằm sẵn trong danh mục vẫn tính được công thức — điều kiện để nút "Tính công thức" ở
   * dòng mã được phép bỏ đi. Đường đi là Sửa → chọn công thức → "Lưu và mở công thức".
   */
  it('mã đã có vẫn mở được công thức, qua form Sửa', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));

    await userEvent.click(screen.getByRole('button', { name: 'Thêm công thức' }));
    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E — hệ số/ }));

    await userEvent.click(screen.getByRole('button', { name: 'Lưu và mở công thức' }));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/cong-thuc/pe/?ma=FPT');
    });
  });

  /*
   * ── Câu định nghĩa tỷ trọng đã BỎ, câu cảnh báo mẫu số hụt thì KHÔNG ──────────────────────
   *
   * Ca ĐẢO, không phải ca xoá — cùng nếp đã dùng cho `quiz.localOnly` và `quiz.notTranslated`:
   * câu chữ quay lại thì phải là một quyết định, không phải một lần lỡ tay.
   *
   * "Tỷ trọng là phần giá trị của một mã trên tổng giá trị danh mục, tính theo thị giá chứ không
   * theo vốn đã bỏ ra" đứng cuối khối từ 22/09/2026 để trả lời chính câu hỏi của chủ dự án lúc ấy
   * ("chưa hiểu tác dụng"), và bỏ ngày 08/10/2026 cũng theo chủ dự án. Mộ chí đầy đủ ở khoá
   * `portfolio.weightNote` trong `vi.ts`, kèm chỗ phải sửa nếu câu hỏi ấy quay lại.
   */
  it('KHÔNG còn câu định nghĩa tỷ trọng dưới bảng — đã bỏ 08/10/2026', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    // Chờ bảng dựng xong rồi mới khẳng định sự vắng mặt, kẻo xanh chỉ vì màn chưa kịp vẽ.
    await screen.findByRole('table');
    expect(screen.queryByText(/Tỷ trọng là phần giá trị/)).toBeNull();
  });

  /*
   * `total` cộng bằng `row.value ?? 0`, nên một mã chưa tra được giá bị coi như 0 và rơi khỏi
   * mẫu số — tỷ trọng các mã còn lại cộng đủ 100% trong khi danh mục thì chưa đủ. Im lặng ở đây
   * đúng là loại "số sai mà trông có lý" mà FR-06 dựng ra để chặn.
   *
   * Nay câu này đứng MỘT MÌNH: trước nó là vế thứ hai nối sau câu định nghĩa, nên ca kiểm cũ dò
   * câu định nghĩa rồi soi phần đuôi. Dò thẳng vào chính nó.
   */
  it('thiếu giá một mã thì nói ra là mẫu số đang hụt', async () => {
    feed.snapshots.mockResolvedValue(new Map());
    seedHolding();
    render(<PortfolioScreen />);

    expect(await screen.findByText(/đang tính trên phần danh mục đã có giá/)).toBeTruthy();
  });

  it('đủ giá thì KHÔNG nói câu mẫu số hụt — nó chỉ đúng khi thật sự hụt', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await screen.findByRole('table');
    await waitFor(() => {
      expect(screen.queryByText(/đang tính trên phần danh mục đã có giá/)).toBeNull();
    });
  });

  /*
   * Cột Doanh nghiệp đã bỏ (12/10/2026) nên tên công ty không còn in trên hàng. Nó vẫn được LƯU khi
   * người dùng chọn mã qua sheet — và có một việc thật để làm: ô "Tìm kiếm" tìm cả theo tên, nên gõ
   * "corp" ra đúng mã FPT dù trên màn không có chữ "Corp" nào.
   */
  it('tên doanh nghiệp chọn ở sheet không in trên hàng, nhưng ô tìm vẫn tìm ra theo tên', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    const row = await dongMa();
    expect(within(row).queryByText('FPT Corp')).toBeNull();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), 'corp');
    expect(screen.getByRole('button', { name: 'Sửa FPT' })).toBeTruthy();
  });
});

describe('WF-06 — ô "Tìm kiếm" lọc bảng Nắm giữ', () => {
  const HPG_SNAPSHOT = {
    ...FPT_SNAPSHOT,
    code: 'HPG',
    name: 'Tập đoàn Hoà Phát',
    priceVnd: 26_000,
  };

  function seedHaiMa(): void {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
    feed.snapshots.mockResolvedValue(
      new Map([
        ['FPT', FPT_SNAPSHOT],
        ['HPG', HPG_SNAPSHOT],
      ]),
    );
  }

  it('gõ mã thì chỉ còn hàng khớp; gõ KHÔNG DẤU tên doanh nghiệp cũng ra', async () => {
    seedHaiMa();
    render(<PortfolioScreen />);
    const o = await screen.findByRole('searchbox', { name: 'Tìm kiếm' });
    await dongMa('HPG');

    await userEvent.type(o, 'hpg');
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sửa HPG' })).toBeTruthy();

    // "Tập đoàn Hoà Phát" → gõ "hoa phat" không dấu vẫn khớp, và FPT thì không.
    await userEvent.clear(o);
    await userEvent.type(o, 'hoa phat');
    expect(screen.getByRole('button', { name: 'Sửa HPG' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();

    // Xoá ô thì đủ hàng trở lại.
    await userEvent.clear(o);
    expect(screen.getByRole('button', { name: 'Sửa FPT' })).toBeTruthy();
  });

  /*
   * Lọc chỉ ẨN HÀNG. Tỷ trọng là phần của một mã trong CẢ danh mục: nếu mẫu số co theo ô tìm thì một
   * mã đứng một mình sẽ hiện "100%" — một con số sai mà trông có lý (FR-06).
   */
  it('lọc không đổi tỷ trọng — mẫu số vẫn là cả danh mục', async () => {
    seedHaiMa();
    render(<PortfolioScreen />);

    const truoc = await waitFor(async () => {
      // HPG: 200 × 26.000 = 5,2 triệu trên tổng 12,34 triệu → 42,1%.
      const o = within(await dongMa('HPG')).getAllByRole('cell')[6];
      expect(o?.textContent).toBe('42,1%');
      return o?.textContent;
    });

    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), 'hpg');

    const sau = within(await dongMa('HPG')).getAllByRole('cell')[6]?.textContent;
    expect(sau).toBe(truoc);
  });

  it('không khớp mã nào thì nói rõ, không dựng một bảng rỗng — và số đếm trên tab vẫn là của cả danh mục', async () => {
    seedHaiMa();
    render(<PortfolioScreen />);

    await userEvent.type(await screen.findByRole('searchbox', { name: 'Tìm kiếm' }), 'zzzz');

    expect(screen.getByText('Không có mã nào khớp.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByRole('tab', { name: 'Mã 2' })).toBeTruthy();
  });

  /*
   * Ca này từng ghim điều NGƯỢC LẠI ("danh mục trống thì không có ô tìm — không có gì để lọc"). Chủ dự
   * án đảo nó ngày 12/10/2026: ô tìm và nút hành động phải đứng yên khi đổi tab, mà giấu ô tìm lúc rỗng
   * thì một tab có dữ liệu và một tab rỗng cho hai dòng tiêu đề khác nhau.
   */
  it('danh mục trống vẫn có ô tìm — dòng tiêu đề không đổi theo việc tab có dữ liệu hay không', async () => {
    render(<PortfolioScreen />);
    await tieuDeNamGiu();

    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thêm mới' })).toBeTruthy();
  });

  /*
   * Con số "5 / 50" cạnh "Mã" và con số cạnh "Công thức" từng có (bản thiết kế
   * 12/10/2026); chủ dự án khoanh cả hai và bảo xoá cùng ngày. Ca này ghim việc BỎ: tiêu đề đứng một
   * mình trong dòng của nó, còn số đếm chỉ nằm trên tab.
   */
  it('tiêu đề hai tab đứng một mình: không còn số đếm cạnh "Mã" hay "Công thức"', async () => {
    seedHaiMa();
    seedSaved();
    render(<PortfolioScreen />);

    const namGiu = await tieuDeNamGiu();
    await dongMa('HPG');
    expect(namGiu.parentElement?.firstElementChild).toBe(namGiu);
    expect(namGiu.nextElementSibling?.textContent ?? '').not.toMatch(/^\s*\d/);
    expect(screen.queryByText(`2 / ${String(MAX_HOLDINGS)}`)).toBeNull();
    expect(screen.queryByText(new RegExp(`trên ${String(MAX_HOLDINGS)} mã`))).toBeNull();
    expect(screen.getByRole('tab', { name: 'Mã 2' })).toBeTruthy();

    await bamTab('Công thức');
    const daLuu = await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
    expect(daLuu.parentElement?.firstElementChild).toBe(daLuu);
    expect(daLuu.nextElementSibling?.textContent ?? '').not.toMatch(/^\s*\d/);
    expect(screen.getByRole('tab', { name: 'Công thức 1' })).toBeTruthy();
  });
});

describe('WF-06 — giá thuộc phiên nào, và làm mới lúc nào', () => {
  it('luôn hiện ngày phiên cùng nút làm mới, không đợi hỏng mới hiện', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await screen.findByText(/21\/08\/2026/);
    expect(screen.getByRole('button', { name: 'Làm mới' })).toBeTruthy();
  });

  it('bấm “Làm mới” lúc mọi thứ đang bình thường thì gọi lại nguồn', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const refresh = await screen.findByRole('button', { name: 'Làm mới' });
    await userEvent.click(refresh);

    await waitFor(() => {
      expect(feed.snapshots).toHaveBeenCalledTimes(2);
    });
  });

  /*
   * Chủ dự án bấm Làm mới và không thấy gì được tải lại (14/10/2026): _"chức năng làm mới đang không làm
   * cho tôi cảm thấy dữ liệu đang được tải lại … thêm loading cho bảng dữ liệu bên dưới"_. Nguồn ở đây trả
   * lời NGAY (mock) — đúng ca thật, Finbox trả trong ~0,2 giây — mà trạng thái chờ vẫn phải đứng đủ lâu để
   * thấy, và chỉ trên các ô sống theo thị giá.
   */
  it('bấm “Làm mới”: bảng bận, ô sống theo giá thành vệt chờ, nút có vòng xoay — đứng đủ lâu để thấy', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const refresh = await screen.findByRole('button', { name: 'Làm mới' });
    const bang = screen.getByRole('table');
    expect(bang.getAttribute('aria-busy')).toBe('false');
    expect(bang.querySelector('[class*="khungCho"]')).toBeNull();

    const batDau = Date.now();
    await userEvent.click(refresh);
    await waitFor(() => {
      expect(feed.snapshots).toHaveBeenCalledTimes(2);
    });

    expect(bang.getAttribute('aria-busy')).toBe('true');
    const dong = screen.getByRole('button', { name: 'Sửa FPT' }).closest('tr') as HTMLElement;
    const o = within(dong).getAllByRole('cell');
    // Thị giá, Lãi/lỗ, %, Tỷ trọng (ô 3–6) là vệt chờ; Số CP, Giá vốn, Ngày mua thì không.
    for (const i of [3, 4, 5, 6]) {
      expect((o[i] as HTMLElement).querySelector('[class*="khungCho"]')).not.toBeNull();
    }
    for (const i of [1, 2, 7]) {
      expect((o[i] as HTMLElement).querySelector('[class*="khungCho"]')).toBeNull();
    }
    // Chữ cũ vẫn nằm dưới vệt (giữ bề ngang ô), và nút bị khoá, có vòng xoay.
    expect((o[3] as HTMLElement).textContent).toContain('71.400');
    const nut = screen.getByRole('button', { name: 'Làm mới' });
    expect(nut.hasAttribute('disabled')).toBe(true);
    expect(nut.querySelector('[class*="nutXoay"]')).not.toBeNull();
    // Tổng giá trị cũng là vệt chờ; "Vốn đã bỏ ra" không phụ thuộc giá nên đứng yên.
    expect((await oThongKe('Tổng giá trị')).querySelector('[class*="khungCho"]')).not.toBeNull();
    expect((await oThongKe('Vốn đã bỏ ra')).querySelector('[class*="khungCho"]')).toBeNull();

    await waitFor(
      () => {
        expect(bang.getAttribute('aria-busy')).toBe('false');
      },
      { timeout: 3000 },
    );
    expect(Date.now() - batDau).toBeGreaterThanOrEqual(550);
    expect(bang.querySelector('[class*="khungCho"]')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Làm mới' }).querySelector('[class*="nutXoay"]'),
    ).toBeNull();
  });

  it('lần tải đầu: ô thị giá là vệt chờ chứ không phải "_ _", và thẻ không báo thiếu giá lúc giá đang về', async () => {
    seedHolding();
    let tra: (value: ReadonlyMap<string, typeof FPT_SNAPSHOT>) => void = () => undefined;
    feed.snapshots.mockReturnValue(
      new Promise((resolve) => {
        tra = resolve;
      }),
    );
    render(<PortfolioScreen />);

    const dong = (await screen.findByRole('button', { name: 'Sửa FPT' })).closest(
      'tr',
    ) as HTMLElement;
    await waitFor(() => {
      expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true');
    });
    const giaTri = within(dong).getAllByRole('cell')[3] as HTMLElement;
    expect(giaTri.querySelector('[class*="khungCho"]')).not.toBeNull();
    expect(screen.queryByText(/thị giá/i, { selector: '[class*="reason"]' })).toBeNull();

    tra(new Map([['FPT', FPT_SNAPSHOT]]));
    await waitFor(() => {
      expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('false');
    });
    expect(giaTri.querySelector('[class*="khungCho"]')).toBeNull();
    expect(giaTri.textContent).toBe('71.400');
  });

  /*
   * Lấy phiên CŨ NHẤT trong các mã đang giữ: câu "Giá phiên 20/08" phải đúng với mọi con số đang
   * hiện. Lấy ngày mới nhất thì mã lỡ nhịp sẽ nấp sau ngày đẹp của mã khác.
   */
  it('nhiều mã lệch phiên thì lấy phiên cũ nhất', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02' },
        { code: 'HPG', quantity: 100, costPrice: 20_000, buyDate: '2026-01-02' },
      ]),
    );
    feed.snapshots.mockResolvedValue(
      new Map([
        ['FPT', FPT_SNAPSHOT],
        ['HPG', { ...FPT_SNAPSHOT, code: 'HPG', name: 'Hoà Phát', asOfDate: '2026-08-18' }],
      ]),
    );
    render(<PortfolioScreen />);

    await screen.findByText(/18\/08\/2026/);
    expect(screen.queryByText(/21\/08\/2026/)).toBeNull();
  });
});

describe('WF-06 — mất mạng vẫn còn số thật, và nói rõ nó cũ', () => {
  /** Gieo sẵn một kho giá đã lưu, đúng hình dạng `serializeCachedPrices` ghi ra. */
  function seedPriceCache(asOfDate = '2026-08-21'): void {
    window.localStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now(),
        items: [{ code: 'FPT', name: 'FPT Corp', priceVnd: 71_400, asOfDate }],
      }),
    );
  }

  it('tra thành công thì ghi lại giá để dành', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });
    await waitFor(() => {
      const raw = window.localStorage.getItem(PRICE_CACHE_KEY);
      expect(raw).not.toBeNull();
      expect(raw).toContain('71400');
    });
  });

  /*
   * Điều kiện để việc dùng giá cũ không thành nói dối: màn PHẢI hiện ngày phiên cùng lúc với con
   * số. Đây chính là ràng buộc mà `price-cache-store.ts` viện ra để được phép tồn tại — bỏ dòng
   * ngày phiên đi là ca này đỏ.
   */
  it('mất mạng mà có giá đã lưu: vẫn ra tổng, kèm ngày phiên và lời cảnh báo', async () => {
    seedHolding();
    seedPriceCache();
    feed.snapshots.mockRejectedValue(new Error('mất mạng'));
    render(<PortfolioScreen />);

    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });
    expect(screen.getByText(/Chưa làm mới được thị giá/)).toBeTruthy();
    expect(screen.getByText(/21\/08\/2026/)).toBeTruthy();
  });

  it('kho giá quá hạn thì KHÔNG dùng — thà thiếu số còn hơn định giá bằng giá tháng trước', async () => {
    seedHolding();
    window.localStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now() - PRICE_CACHE_TTL_MS - 1,
        items: [{ code: 'FPT', name: 'FPT Corp', priceVnd: 71_400, asOfDate: '2026-06-01' }],
      }),
    );
    feed.snapshots.mockRejectedValue(new Error('mất mạng'));
    render(<PortfolioScreen />);

    await screen.findByText('Không lấy được thị giá từ Finbox.');
    expect(screen.queryByText(/7\.140\.000/)).toBeNull();
  });

  it('kho giá không có mã đang giữ thì cũng không dùng', async () => {
    seedHolding();
    window.localStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now(),
        items: [{ code: 'VNM', name: 'Vinamilk', priceVnd: 60_000, asOfDate: '2026-08-21' }],
      }),
    );
    feed.snapshots.mockRejectedValue(new Error('mất mạng'));
    render(<PortfolioScreen />);

    await screen.findByText('Không lấy được thị giá từ Finbox.');
  });
});

/*
 * ── Dải "CỤC BỘ" đã bỏ (09/09/2026, chủ dự án chốt) ─────────────────────────────────────────
 *
 * Ca cũ ở đây ghim nguyên văn `portfolio.localOnly` — "Số lượng và giá vốn chỉ lưu trên thiết bị
 * này. Chỉ mã cổ phiếu được gửi tới Finbox để tra thị giá." — và nó viện dẫn COM-03 / NFR-SEC-01.
 * Câu ấy nay không còn trên màn.
 *
 * ⚠ KHÁC hẳn lượt bỏ câu tương tự ở màn `/du-lieu/` (25/08/2026). Ở đó bỏ được vì màn ấy KHÔNG gọi
 * mạng lần nào, và docblock của nó ghi thẳng rằng "chỗ thật sự cần cảnh báo là màn Danh mục, nơi
 * mã cổ phiếu có rời máy". Lượt này bỏ đúng cái chỗ ấy. Lý lẽ cũ không chuyển sang được, nên đừng
 * đọc hai lượt này như một.
 *
 * Cái KHÔNG đổi: chỉ mã cổ phiếu vào request. `client.ts` gửi đúng `{ symbols }` và `{ ticker }`,
 * số lượng / giá vốn / ngày mua không có đường nào vào đó. Ca dưới giữ vế ấy ở đúng tầng nó sống —
 * tầng dữ liệu — thay cho một ca đọc chữ trên màn.
 */
describe('WF-06 — dữ liệu riêng tư: cam kết còn, câu nói ra thì không', () => {
  it('màn không còn dải cam kết nào — ghim để không ai dựng lại mà không đọc docblock trên', async () => {
    render(<PortfolioScreen />);

    await tieuDeNamGiu();

    expect(screen.queryByText('CỤC BỘ')).toBeNull();
    expect(screen.queryByText(/chỉ lưu trên thiết bị này/i)).toBeNull();
  });

  it('số lượng và giá vốn không xuất hiện trong bất kỳ request nào', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await tieuDeNamGiu();

    /*
     * Ghim theo GIÁ TRỊ chứ không theo tên trường: đổi tên `costPrice` thành gì thì con số 60.000
     * vẫn là con số phải không được rời máy. `seedHolding()` dựng FPT · 100 CP · giá vốn 60.000.
     */
    const daGui = JSON.stringify(feed.snapshots.mock.calls);
    expect(daGui).toContain('FPT');
    expect(daGui).not.toContain('60000');
    expect(daGui).not.toContain('100');
    expect(daGui).not.toContain('2026-01-02');
  });
});

/**
 * Chiều NGƯỢC của một lần bỏ chữ (14/09/2026), cùng khuôn describe ngay trên.
 *
 * Chủ dự án chỉ ra hai câu trong form và cho bỏ: nhãn "Beta (để trống nếu chưa biết)" và dòng
 * "Thị giá lấy từ Finbox theo phiên gần nhất, không phải giá khớp lệnh." Cả hai đều giải thích
 * trước khi người dùng kịp hỏi — vế sau còn nói về một con số chưa có trên màn, vì lúc ấy mã còn
 * chưa được chọn.
 *
 * Hai thứ PHẢI còn, và ca kiểm gác đúng chúng: câu gợi ý beta (nó nói beta LÀ GÌ, không phải
 * "để trống nếu chưa biết"), và câu của chế độ SỬA (nó nói về thao tác đang làm).
 */
describe('WF-06 — form thôi giải thích thay cho người dùng', () => {
  it('nhãn beta là "Beta" trơn, và câu gợi ý beta vẫn ở đó', async () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ mode: 'advanced' }));
    render(
      <PreferencesProvider>
        <PortfolioScreen />
      </PreferencesProvider>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    expect(screen.getByLabelText('Beta')).not.toBeNull();
    expect(screen.queryByLabelText(/để trống nếu chưa biết/)).toBeNull();
    expect(screen.getByText(/Beta đo mức mã này nhảy mạnh hay yếu hơn VN-Index/)).not.toBeNull();
  });

  it('form thêm mã không còn dòng nói về nguồn thị giá', async () => {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    expect(screen.queryByText(/Thị giá lấy từ Finbox/)).toBeNull();
    expect(screen.queryByText(/không phải giá khớp lệnh/)).toBeNull();
  });

  /*
   * Câu của form SỬA ("Đổi số lượng, giá vốn, ngày mua hoặc beta. Muốn đổi mã thì bỏ rồi thêm
   * lại.") đã bỏ 14/09/2026 theo yêu cầu chủ dự án.
   *
   * Ca kiểm này KHÔNG xoá theo mà đổi mỏ neo, vì điều câu ấy nói vẫn phải đọc được — chỉ là nay
   * bằng hình thay vì bằng chữ: nút mã `disabled`. Xoá hẳn ca kiểm thì hôm nào ai đó gỡ `disabled`
   * để "cho sửa cả mã" sẽ không gì đỏ, mà `addHolding()` lại cộng dồn theo mã nên sửa mã tại chỗ
   * là một lối vỡ dữ liệu im lặng.
   */
  it('form SỬA khoá ô mã bằng chính nút, không cần một dòng chữ nói hộ', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));

    expect(screen.queryByText(/Muốn đổi mã thì bỏ rồi thêm lại/)).toBeNull();

    const nutMa = screen.getByRole('button', { name: t('portfolio.formCode') });
    expect(nutMa.hasAttribute('disabled')).toBe(true);
  });
});

/*
 * ── Tab "Công thức": phép tính cất từ màn chi tiết ─────────────────────────────────────────
 *
 * Tab "Công thức", bị gỡ cùng cụm tab (14/09/2026), quay lại thành khối thứ hai của màn
 * (15/09/2026) — vì nút Lưu ở màn chi tiết vẫn ghi vào kho mà không còn chỗ nào bày kho ra — rồi
 * thành tab trở lại (10/10/2026) khi chủ dự án muốn màn tách làm hai phần riêng.
 *
 * Khối cố ý KHÔNG tính lại con số nào — tính lại đòi cả Registry trong gói của `/danh-muc/`, đã đo
 * một lần là 131 kB lên 217 kB, vượt cửa 180 kB. Nên điều kiện để nó lương thiện là bày NGÀY LƯU,
 * và ca kiểm dưới ghim đúng chỗ đó.
 */
function seedSaved(): void {
  window.localStorage.setItem(
    SAVED_CALCS_KEY,
    JSON.stringify([
      {
        id: 'pe-1756000000000',
        formulaId: 'pe',
        name: 'HPG · P/E',
        code: 'HPG',
        inputs: { price: 25000, eps: 2000 },
        resultValue: 12.5,
        resultUnit: 'lần',
        savedAt: new Date(2026, 7, 25, 10, 0, 0).getTime(),
        needsSeries: false,
      },
    ]),
  );
}

/**
 * Tên khả truy cập của một tab là "Mã 1" / "Công thức 0" — chữ rồi số đếm. Khớp phần
 * chữ, bỏ số. (Nhãn tab từng là "Mã nắm giữ" và "Phép tính đã lưu" trong vài giờ ngày 12/10/2026.)
 *
 * KHÔNG dùng `\b`: JS chỉ coi `[A-Za-z0-9_]` là ký tự chữ, nên giữa "ã" và dấu cách không có ranh
 * giới và `/^Mã\b/` không bao giờ khớp.
 */
function tenTab(nhan: string): RegExp {
  return new RegExp(`^${nhan}(?:\\s|$)`);
}

/** Bấm sang một tab của cột trái theo tên khả truy cập đầu tiên (không tính số đếm). */
async function bamTab(nhan: string): Promise<void> {
  await userEvent.click(await screen.findByRole('tab', { name: tenTab(nhan) }));
}

describe('WF-06 — cụm hai tab dọc: Mã · Công thức', () => {
  it('mặc định mở tab Mã: có khối Nắm giữ, chưa có khối Công thức', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await tieuDeNamGiu();
    const tabMa = screen.getByRole('tab', { name: tenTab('Mã') });
    expect(tabMa.getAttribute('aria-selected')).toBe('true');
    expect(
      screen.getByRole('tab', { name: tenTab('Công thức') }).getAttribute('aria-selected'),
    ).toBe('false');
    expect(screen.queryByRole('heading', { name: t('portfolio.savedTitle') })).toBeNull();
  });

  /*
   * Bài học 15/09/2026: lưu xong mà không thấy đâu bị chủ dự án gọi là lỗi. Số đếm của tab ĐANG
   * ĐÓNG là chỗ duy nhất nói kho có mục mà không phải bấm sang tìm.
   */
  it('số đếm của cả hai tab hiện ngay trên thanh, kể cả tab đang đóng', async () => {
    seedHolding();
    seedSaved();
    render(<PortfolioScreen />);

    expect(await screen.findByRole('tab', { name: 'Mã 1' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Công thức 1' })).toBeTruthy();
  });

  it('bấm tab Công thức thì đổi nội dung, ghi ?tab= vào URL và không thêm mục lịch sử', async () => {
    seedHolding();
    seedSaved();
    const truoc = window.history.length;
    render(<PortfolioScreen />);
    await tieuDeNamGiu();

    await bamTab('Công thức');

    expect(screen.getByRole('heading', { name: t('portfolio.savedTitle') })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Mã' })).toBeNull();
    expect(window.location.search).toBe('?tab=cong-thuc');
    expect(window.history.length).toBe(truoc);

    await bamTab('Mã');

    expect(screen.getByRole('heading', { name: 'Mã' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: t('portfolio.savedTitle') })).toBeNull();
    expect(window.location.search).toBe('');
  });

  it('mọi tab trỏ aria-controls vào đúng MỘT vùng nội dung có thật, và vùng ấy nhận lại tên tab', async () => {
    seedSaved();
    render(<PortfolioScreen />);
    await tieuDeNamGiu();

    for (const ten of ['Mã', 'Công thức']) {
      await bamTab(ten);
      const tab = screen.getByRole('tab', { name: tenTab(ten) });
      const vung = screen.getByRole('tabpanel');
      expect(vung.id).toBe(tab.getAttribute('aria-controls'));
      expect(vung.getAttribute('aria-labelledby')).toBe(tab.id);
    }
  });

  it('?tab=cong-thuc mở thẳng tab Công thức', async () => {
    seedSaved();
    window.history.replaceState(null, '', '/danh-muc/?tab=cong-thuc');
    render(<PortfolioScreen />);

    expect(await screen.findByRole('heading', { name: t('portfolio.savedTitle') })).toBeTruthy();
    expect(
      screen.getByRole('tab', { name: tenTab('Công thức') }).getAttribute('aria-selected'),
    ).toBe('true');
  });

  /*
   * Đích của nút Lưu ở màn chi tiết là `/danh-muc/#phep-tinh-da-luu` (`savedCalcsPath()`). Hợp
   * đồng ấy không đổi khi quay lại cụm tab, nhưng nay neo chỉ cần MỞ ĐÚNG TAB: tab Công thức có
   * đúng khối ấy dưới thanh tab nên không còn gì để cuộn tới, và effect cuộn-giữ-neo đã xoá.
   */
  it('vào bằng neo #phep-tinh-da-luu thì mở thẳng tab Công thức và KHÔNG cuộn', async () => {
    const bay = bayScrollIntoView();
    try {
      seedHolding();
      seedSaved();
      window.history.replaceState(null, '', '/danh-muc/#phep-tinh-da-luu');
      render(<PortfolioScreen />);

      const tieuDe = await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
      expect(tieuDe.closest('section')?.id).toBe('phep-tinh-da-luu');
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(bay.goi).not.toHaveBeenCalled();
    } finally {
      bay.go();
    }
  });

  it('về tab Mã thì bỏ neo #phep-tinh-da-luu khỏi URL — không nói dối về chỗ đang đứng', async () => {
    seedSaved();
    window.history.replaceState(null, '', '/danh-muc/#phep-tinh-da-luu');
    render(<PortfolioScreen />);
    await screen.findByRole('heading', { name: t('portfolio.savedTitle') });

    await bamTab('Mã');

    expect(window.location.hash).toBe('');
  });

  it('kho rỗng: tab Công thức hiện câu hướng dẫn và đường sang danh sách công thức', async () => {
    render(<PortfolioScreen />);
    await tieuDeNamGiu();

    await bamTab('Công thức');

    expect(screen.getByText(t('portfolio.savedEmpty'))).toBeTruthy();
    const duong = screen.getByRole('link', { name: t('portfolio.savedEmptyAction') });
    expect(duong.getAttribute('href')).toMatch(/^\/cong-thuc\/?$/);
  });

  it('đổi tab không gọi lại Finbox và không làm mất mã đang giữ', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await screen.findByText(/Giá phiên/);
    const soLanGoi = feed.snapshots.mock.calls.length;

    await bamTab('Công thức');
    await bamTab('Mã');

    expect(await screen.findByRole('button', { name: 'Sửa FPT' })).toBeTruthy();
    expect(feed.snapshots.mock.calls.length).toBe(soLanGoi);
  });

  /*
   * Câu miễn trừ nằm NGOÀI cả hai tab: `usePathname()` không nhìn thấy `?tab=`, nên một tab trắng
   * câu miễn trừ không có cách nào được bù ở `routes.ts`.
   */
  it('câu miễn trừ còn đúng một ô ở cả hai tab', async () => {
    seedSaved();
    render(<PortfolioScreen />);
    await tieuDeNamGiu();
    expect(screen.getAllByText(t('disclaimer.text'))).toHaveLength(1);

    await bamTab('Công thức');

    expect(screen.getAllByText(t('disclaimer.text'))).toHaveLength(1);
  });
});

/**
 * Ba phép tính đã lưu, đủ để soi: tên tự đặt, tên GỢI Ý tự sinh, và một phép tính cần chuỗi giá.
 *
 * Tên gợi ý dựng bằng chính `suggestCalcNames()` chứ không gõ tay: màn nhận ra "đây là tên gợi ý" bằng
 * cách dựng lại bộ gợi ý rồi so, nên một chuỗi gõ tay lệch một dấu cách là ca kiểm đo nhầm thứ.
 *
 * Mốc lưu cố ý khác ngày và khác tháng để sắp xếp có gì mà đảo: B (09/10) mới nhất, C (28/09), A (25/08).
 */
const TEN_BETA_VI = FORMULA_SUMMARIES.find((item) => item.id === 'beta')?.name.vi ?? 'beta';
const MOC_A = new Date(2026, 7, 25, 10, 0, 0).getTime();
const MOC_B = new Date(2026, 9, 9, 10, 0, 0).getTime();
const MOC_C = new Date(2026, 8, 28, 10, 0, 0).getTime();

function seedSavedMany(): void {
  const tenGoiY =
    suggestCalcNames({ formulaName: TEN_BETA_VI, code: 'FPT', savedAt: MOC_B })[0] ?? 'FPT';
  window.localStorage.setItem(
    SAVED_CALCS_KEY,
    JSON.stringify([
      {
        id: 'beta-b',
        formulaId: 'beta',
        name: tenGoiY,
        code: 'FPT',
        inputs: {},
        resultValue: 1.08,
        resultUnit: 'lần',
        savedAt: MOC_B,
        needsSeries: true,
        seriesCount: 120,
      },
      {
        id: 'pe-c',
        formulaId: 'pe',
        name: 'P/E của HPG tháng 9',
        code: 'HPG',
        inputs: { price: 25000, eps: 2500 },
        resultValue: 10,
        resultUnit: 'lần',
        savedAt: MOC_C,
        needsSeries: false,
      },
      {
        id: 'pe-a',
        formulaId: 'pe',
        name: 'HPG · P/E',
        code: 'HPG',
        inputs: { price: 25000, eps: 2000 },
        resultValue: 12.5,
        resultUnit: 'lần',
        savedAt: MOC_A,
        needsSeries: false,
      },
    ]),
  );
}

/** Gieo chuỗi giá trong máy với đúng `soDong` dòng — kho mà màn chi tiết đọc lúc mở một phép tính. */
function seedChuoi(soDong: number): void {
  window.localStorage.setItem(
    PRICE_SERIES_KEY,
    JSON.stringify({
      code: 'FPT',
      rows: Array.from({ length: soDong }, (_, i) => ({
        date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
        open: 10,
        high: 11,
        low: 9,
        close: 10 + i / 100,
        volume: 1000,
      })),
    }),
  );
}

/** Các dòng dữ liệu của bảng Công thức, theo thứ tự đang hiện (bỏ hàng tiêu đề). */
function dongDaLuu(): HTMLElement[] {
  return screen.getAllByRole('row').slice(1);
}

function chuCuaO(dong: HTMLElement, chiSo: number): string {
  return within(dong).getAllByRole('cell')[chiSo]?.textContent ?? '';
}

describe('WF-06 — tab Công thức: bảng', () => {
  /*
   * Đây là vế "thấy lại được" của lỗi chủ dự án báo 15/09/2026. Trước bản vá, kho có mục mà màn
   * không có một chữ nào về nó.
   */
  /*
   * BỐN cột từ 13/10/2026. Cột thứ năm (tiêu đề ẩn "Thao tác", chở hai nút biểu tượng mở/nạp và thùng
   * rác) bỏ khi bảng được dựng lại theo bảng Mã — chủ dự án: *"đồng bộ cả bên Công thức nữa chứ không
   * phải mỗi bên mã"*. Ngày lưu nay là cột cuối, như ngày mua ở bảng Mã.
   */
  it('mỗi phép tính một dòng, mới nhất trước, đủ bốn cột và kết bằng ngày lưu', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');

    const tieuDe = (await screen.findAllByRole('columnheader')).map((th) => th.textContent);
    expect(tieuDe).toEqual(['Công thức', 'Mã', 'Kết quả', 'Ngày lưu']);

    const dong = dongDaLuu();
    expect(dong).toHaveLength(3);
    // B (09/10) → C (28/09) → A (25/08).
    expect(dong.map((d) => chuCuaO(d, 3))).toEqual(['09/10/2026', '28/09/2026', '25/08/2026']);
    expect(dong.map((d) => chuCuaO(d, 1))).toEqual(['FPT', 'HPG', 'HPG']);
  });

  it('tên GỢI Ý chỉ còn tên công thức; tên người dùng tự đặt giữ nguyên, tên công thức làm dòng phụ', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    const [b, c] = dongDaLuu();
    // B mang tên gợi ý "FPT · <tên công thức>": mã đã có cột riêng nên không in lại ở cột Công thức.
    expect(chuCuaO(b as HTMLElement, 0)).toContain(TEN_BETA_VI);
    expect(chuCuaO(b as HTMLElement, 0)).not.toContain('FPT');
    // C do người dùng tự đặt: giữ nguyên từng chữ, và tên công thức đứng dưới để biết nó tính gì.
    expect(chuCuaO(c as HTMLElement, 0)).toContain('P/E của HPG tháng 9');
    expect(chuCuaO(c as HTMLElement, 0)).toContain('P/E — hệ số');
  });

  it('con số kết quả đọc từ số thô đã lưu kèm đơn vị, và "Mở" dẫn tới đúng bản lưu', async () => {
    seedSavedMany();
    seedChuoi(120);
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    const [b, c, a] = dongDaLuu();
    expect(chuCuaO(b as HTMLElement, 2)).toBe('1,08 lần');
    expect(chuCuaO(c as HTMLElement, 2)).toBe('10 lần');
    expect(chuCuaO(a as HTMLElement, 2)).toBe('12,5 lần');

    /*
     * `next/link` dựng ngoài router thật bỏ dấu '/' trước `?` — hành vi của môi trường test, không
     * phải của trang thật (xem `HeaderNav.test.tsx`), nên so khớp cho phép có hoặc không.
     */
    const mo = within(a as HTMLElement).getByRole('link', { name: 'Mở HPG · P/E' });
    expect(mo.getAttribute('href')).toMatch(/^\/cong-thuc\/pe\/?\?luu=pe-a$/);
  });

  /*
   * Luật "cần nạp lại chuỗi" — đúng luật `seriesMismatch` của FormulaDetail: phép tính CẦN chuỗi giá và
   * số dòng chuỗi đang có trong máy khác số dòng lúc lưu. Ba nhánh: kho chuỗi trống, đủ đúng 120, và
   * lệch 119. Ca thứ ba là chỗ nó khác "có chuỗi hay không" — so theo SỐ PHIÊN.
   */
  it('chuỗi giá trong máy trống: dòng cần chuỗi in “_ _”, kèm lý do và nút “Nạp”; số đã lưu KHÔNG hiện', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    const [b] = dongDaLuu();
    expect(chuCuaO(b as HTMLElement, 2)).toBe('_ _');
    expect(b?.textContent).not.toContain('1,08');
    expect(within(b as HTMLElement).getByText('Cần nạp lại chuỗi giá')).toBeTruthy();
    expect(within(b as HTMLElement).getByRole('link', { name: /^Nạp / })).toBeTruthy();
    // Hai dòng không dùng chuỗi giá thì không bao giờ bị cờ.
    expect(
      dongDaLuu().filter((d) => d.textContent?.includes('Cần nạp lại chuỗi giá')),
    ).toHaveLength(1);
  });

  /*
   * ── Dòng của bảng Công thức theo đúng khuôn dòng của bảng Mã (13/10/2026) ────────────────────
   *
   * Ca ĐẢO của ca "Mở và Nạp là nút biểu tượng" (12/10/2026): hôm ấy cuối dòng có hai nút biểu tượng,
   * mũi tên mở/nạp và thùng rác. Chủ dự án đổi bảng Mã sang "mã chữ trơn, bấm cả dòng, dấu X hiện khi
   * rê chuột" rồi bảo: *"đồng bộ cả bên Công thức nữa chứ không phải mỗi bên mã"*. Nên: tên ở ô đầu là
   * một LIÊN KẾT mang chữ (đường của bàn phím và "mở ở tab mới", vì `<tr>` không lấy được tiêu điểm),
   * dấu X đứng ngay sau tên, mã hết là chip, và ô cuối chỉ còn ngày.
   *
   * Ba cái tên "Mở …", "Nạp …", "Xoá …" giữ nguyên từng chữ: mọi ca khác của khối này neo vào chúng.
   */
  it('ô đầu: tên là liên kết "Mở …"/"Nạp …", dấu X không chữ đứng ngay sau; ô cuối không còn nút, mã không còn chip', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    const [b, , a] = dongDaLuu() as [HTMLElement, HTMLElement, HTMLElement];
    const nap = within(b).getByRole('link', { name: /^Nạp / });
    const mo = within(a).getByRole('link', { name: 'Mở HPG · P/E' });
    const xoa = within(a).getByRole('button', { name: 'Xoá HPG · P/E' });

    // Liên kết mang chính tên đang hiện (A do người dùng tự đặt, B là tên gợi ý nên chỉ còn tên
    // công thức); dòng bị cờ đi cùng một đích nhưng tên việc thì khác.
    expect(mo.textContent).toBe('HPG · P/E');
    expect(nap.textContent).toBe(TEN_BETA_VI);
    expect(mo.getAttribute('title')).toBe('Mở');
    expect(nap.getAttribute('title')).toBe('Nạp');

    // Dấu X: không chữ, có tên, có `title`, và đứng ngay sau tên trong Ô ĐẦU.
    expect(xoa.textContent).toBe('');
    expect(xoa.getAttribute('title')).toBe('Xoá');
    expect(xoa.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    const oDau = within(a).getAllByRole('cell')[0] as HTMLElement;
    expect(oDau.contains(mo)).toBe(true);
    expect(mo.nextElementSibling).toBe(xoa);

    // Mỗi dòng đúng một liên kết và một nút — dấu X. Mũi tên "Chi tiết" của khổ điện thoại từng đứng
    // trong ô Kết quả; nó đi cùng dòng thả xuống của bảng này (14/10/2026, lượt hai). Ô cuối chỉ có ngày.
    expect(within(a).getAllByRole('link')).toHaveLength(1);
    expect(within(a).getAllByRole('button')).toHaveLength(1);
    const oKetQua = within(a).getAllByRole('cell')[2] as HTMLElement;
    expect(oKetQua.querySelector('a, button')).toBeNull();
    expect(oKetQua.textContent).toBe('12,5 lần');
    const oCuoi = within(a).getAllByRole('cell')[3] as HTMLElement;
    expect(oCuoi.querySelector('a, button')).toBeNull();
    expect(oCuoi.textContent).toBe('25/08/2026');

    // Hết chip: mã không còn bọc trong huy hiệu của `Badge`.
    const oMa = within(a).getAllByRole('cell')[1] as HTMLElement;
    expect(oMa.textContent).toBe('HPG');
    expect(oMa.querySelector('[class*="badge"]')).toBeNull();
  });

  /* Cùng một hình cho cả hai bảng: dấu X của bảng Công thức vẽ đúng nét của dấu X bảng Mã. */
  it('dấu X của bảng Công thức và của bảng Mã là cùng một biểu tượng', async () => {
    seedHolding();
    seedSavedMany();
    render(<PortfolioScreen />);

    const xMa = await screen.findByRole('button', { name: 'Xoá FPT' });
    const netMa = xMa.querySelector('path')?.getAttribute('d');
    expect(netMa).toBeTruthy();

    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
    const xCongThuc = screen.getByRole('button', { name: 'Xoá HPG · P/E' });

    expect(xCongThuc.querySelector('path')?.getAttribute('d')).toBe(netMa);
    // Hai nét chéo, không phải thùng rác: nét vẽ không có đoạn nằm ngang hay thẳng đứng nào.
    expect(netMa).not.toMatch(/[hHvV]/);
  });

  it('bấm vào bất kỳ chỗ nào trên dòng thì mở đúng bản lưu ấy', async () => {
    seedSavedMany();
    seedChuoi(120);
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    const [, , a] = dongDaLuu() as [HTMLElement, HTMLElement, HTMLElement];
    // Ô Kết quả: không phải liên kết, không phải nút — cú bấm phải do DÒNG nhận.
    await userEvent.click(within(a).getAllByRole('cell')[2] as HTMLElement);

    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push).toHaveBeenCalledWith('/cong-thuc/pe/?luu=pe-a');
  });

  /* Không chặn sự kiện nổi lên thì bấm X vừa xoá vừa mở chính phép tính vừa xoá. */
  it('bấm dấu X chỉ xoá — KHÔNG mở phép tính vừa xoá', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá HPG · P/E' }));

    expect(router.push).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Xoá HPG · P/E' })).toBeNull();
  });

  /* Bấm thẳng vào tên: liên kết tự điều hướng, dòng không được gọi `router.push` thêm một lần nữa. */
  it('bấm vào tên thì chỉ liên kết điều hướng, dòng không điều hướng lần hai', async () => {
    seedSavedMany();
    seedChuoi(120);
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    const [, , a] = dongDaLuu() as [HTMLElement, HTMLElement, HTMLElement];
    await userEvent.click(within(a).getByRole('link', { name: 'Mở HPG · P/E' }));

    expect(router.push).not.toHaveBeenCalled();
  });

  it('chuỗi giá đủ đúng số phiên lúc lưu thì hết cờ, hiện lại số đã lưu', async () => {
    seedSavedMany();
    seedChuoi(120);
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    expect(screen.queryByText('Cần nạp lại chuỗi giá')).toBeNull();
    expect(within(dongDaLuu()[0] as HTMLElement).getByRole('link', { name: /^Mở / })).toBeTruthy();
  });

  it('chuỗi giá lệch một phiên cũng bị cờ — so theo số phiên, không chỉ có hay không', async () => {
    seedSavedMany();
    seedChuoi(119);
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    expect(chuCuaO(dongDaLuu()[0] as HTMLElement, 2)).toBe('_ _');
  });

  it('bấm thùng rác thì gỡ khỏi kho, hết mục thì tab hiện câu rỗng và số đếm về 0', async () => {
    seedSaved();
    render(<PortfolioScreen />);
    await bamTab('Công thức');

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá HPG · P/E' }));

    expect(JSON.parse(window.localStorage.getItem(SAVED_CALCS_KEY) ?? 'null')).toEqual([]);
    expect(screen.getByText(t('portfolio.savedEmpty'))).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Công thức 0' })).toBeTruthy();
  });

  it('nút xoá của dòng tên gợi ý nói rõ cả mã lẫn công thức — hai phép tính cùng công thức không lẫn', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');

    expect(await screen.findByRole('button', { name: `Xoá FPT · ${TEN_BETA_VI}` })).toBeTruthy();
  });
});

describe('WF-06 — tab Công thức: tìm và thứ tự', () => {
  async function moTab(): Promise<void> {
    seedSavedMany();
    seedChuoi(120);
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
  }

  /*
   * Hàng chip lọc theo mã và ô "Sắp xếp" từng nằm trên bảng (bản thiết kế 12/10/2026) và chủ dự án bảo
   * bỏ ngay sau đó. Ca này ghim việc BỎ: ô tìm là công cụ lọc duy nhất, nên chip hay ô chọn quay lại
   * là một quyết định chứ không phải một sơ suất. Việc SẮP thì quay lại ngày 14/10/2026, theo lời chủ dự
   * án, bằng tiêu đề cột như bảng Mã (khối "sắp bảng Công thức bằng tiêu đề cột") — vẫn không có ô chọn.
   */
  it('chỉ có ô tìm: không còn chip lọc theo mã, không còn ô chọn sắp xếp', async () => {
    await moTab();

    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm' })).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByRole('group', { name: 'Lọc theo mã' })).toBeNull();
    expect(screen.queryByRole('combobox')).toBeNull();
  });

  it('lúc chưa bấm gì, bảng xếp phép tính lưu gần nhất lên đầu', async () => {
    await moTab();

    expect(dongDaLuu().map((d) => chuCuaO(d, 3))).toEqual([
      '09/10/2026',
      '28/09/2026',
      '25/08/2026',
    ]);
  });

  it('ô tìm khớp theo tên công thức (cả không dấu), tên tự đặt và mã', async () => {
    await moTab();
    const o = screen.getByRole('searchbox', { name: 'Tìm kiếm' });

    await userEvent.type(o, 'beta');
    expect(dongDaLuu()).toHaveLength(1);

    await userEvent.clear(o);
    await userEvent.type(o, 'thang 9');
    expect(dongDaLuu()).toHaveLength(1);
    expect(chuCuaO(dongDaLuu()[0] as HTMLElement, 3)).toBe('28/09/2026');

    await userEvent.clear(o);
    await userEvent.type(o, 'hpg');
    expect(dongDaLuu()).toHaveLength(2);
  });

  it('không khớp gì thì nói rõ, và thẻ tóm tắt vẫn đếm cả kho', async () => {
    await moTab();

    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), 'khong co gi');

    expect(screen.getByText('Không có phép tính nào khớp.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
    expect((await oThongKe('Trên số mã')).textContent).toContain('2');
  });

  it('thẻ tóm tắt đếm cả kho: số phép tính, số mã, số công thức, số cần nạp lại và ngày gần nhất', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');

    expect((await oThongKe('Trên số mã')).textContent).toContain('2');
    expect((await oThongKe('Công thức khác nhau')).textContent).toContain('2');
    // Chưa gieo chuỗi giá nên dòng B bị cờ.
    expect((await oThongKe('Cần nạp lại chuỗi')).textContent).toContain('1');
    expect(screen.getByText('09/10/2026', { selector: 'span' })).toBeTruthy();
    expect(screen.getByText('Đã lưu').parentElement?.textContent).toContain('3');
  });
});

/*
 * ── Ô "Tìm kiếm" và nút "Thêm mới": MỘT cụm cho cả hai tab (12/10/2026) ───────────────────────
 *
 * Chủ dự án: *"đồng bộ 2 chức năng này để khi đổi tab thì vẫn giữ nguyên 2 chức năng này. đổi tên
 * thành 'Tìm kiếm', button kia thành 'Thêm mới'. khi search ở tab nào thì tab đó hiển thị tương ứng,
 * tương tự với button Thêm mới đang ở tab nào thì thêm mới ở tab đó"*.
 *
 * Trước đó mỗi tab có chữ riêng ("Tìm mã" + "Thêm mã", "Tìm công thức hoặc mã" + "Tính công thức
 * mới") và một chuỗi tìm riêng. Ba ca dưới ghim ba vế của câu trên: cùng chữ ở hai tab, chuỗi tìm đi
 * theo người dùng qua lượt đổi tab, và nút làm việc của tab đang mở.
 */
describe('WF-06 — ô Tìm kiếm và nút Thêm mới dùng chung cho hai tab', () => {
  function seedCaHaiTab(): void {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
    feed.snapshots.mockResolvedValue(
      new Map([
        ['FPT', FPT_SNAPSHOT],
        ['HPG', { ...FPT_SNAPSHOT, code: 'HPG', name: 'Tập đoàn Hoà Phát', priceVnd: 26_000 }],
      ]),
    );
    seedSavedMany();
    seedChuoi(120);
  }

  it('hai tab mang cùng một ô "Tìm kiếm" và cùng một chữ "Thêm mới"', async () => {
    seedCaHaiTab();
    render(<PortfolioScreen />);
    await dongMa('HPG');

    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Thêm mới' })).toBeTruthy();

    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    expect(screen.getByRole('searchbox', { name: 'Tìm kiếm' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Thêm mới' })).toBeTruthy();
    // Chữ cũ của từng tab không còn ở đâu trên màn.
    expect(screen.queryByText('Thêm mã')).toBeNull();
    expect(screen.queryByText('Tính công thức mới')).toBeNull();
  });

  it('chữ đang gõ sống qua lượt đổi tab và lọc bảng của tab đang mở', async () => {
    seedCaHaiTab();
    render(<PortfolioScreen />);
    await dongMa('HPG');

    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), 'hpg');
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sửa HPG' })).toBeTruthy();

    // Sang tab Công thức: ô vẫn giữ "hpg" và bảng chỉ còn hai phép tính của HPG.
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
    expect((screen.getByRole('searchbox', { name: 'Tìm kiếm' }) as HTMLInputElement).value).toBe(
      'hpg',
    );
    expect(dongDaLuu().map((d) => chuCuaO(d, 1))).toEqual(['HPG', 'HPG']);

    // Quay lại tab Mã: vẫn chuỗi ấy, vẫn chỉ hàng HPG.
    await bamTab('Mã');
    await dongMa('HPG');
    expect((screen.getByRole('searchbox', { name: 'Tìm kiếm' }) as HTMLInputElement).value).toBe(
      'hpg',
    );
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
  });

  /*
   * Cùng chữ, khác việc. Ở tab Mã là `<button>` mở hộp thoại thêm mã (tiêu đề hộp thoại vẫn nói rõ
   * "Thêm mã"). Ở tab Công thức là `<a>` sang danh sách công thức: một phép tính chỉ sinh ra ở màn chi
   * tiết công thức, màn này không có form nào để thêm nó tại chỗ — và điều hướng thì phải là liên kết.
   */
  it('"Thêm mới" làm việc của tab đang mở: tab Mã mở form thêm mã, tab Công thức dẫn sang danh sách công thức', async () => {
    seedCaHaiTab();
    render(<PortfolioScreen />);
    await dongMa('HPG');

    await userEvent.click(screen.getByRole('button', { name: 'Thêm mới' }));
    const hop = await tamTrenCung();
    expect(within(hop).getByRole('heading', { name: 'Thêm mã' })).toBeTruthy();
    await userEvent.click(within(hop).getByRole('button', { name: t('portfolio.formCancel') }));

    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
    expect(screen.queryByRole('button', { name: 'Thêm mới' })).toBeNull();
    expect(screen.getByRole('link', { name: 'Thêm mới' }).getAttribute('href')).toMatch(
      /^\/cong-thuc\/?$/,
    );
  });
});

/*
 * ── Form mở thành HỘP THOẠI, không còn chạy trong trang ──────────────────────────────────────
 *
 * Khối này thay chỗ "mở form thì kéo nó vào tầm mắt" (22/09/2026). Hai ca cũ ghim rằng bấm Sửa
 * và bấm Thêm mã đều gọi `scrollIntoView` đúng một lần — lời giải cho đúng vấn đề của bản cũ:
 * form dựng ở CUỐI danh sách nên mở ra ở rất xa nút vừa bấm, và chủ dự án báo "bấm Sửa xong cảm
 * giác không có gì thay đổi".
 *
 * Yêu cầu mới ("bật popup mới lên giữa màn chiếm tầm 50% màn hình") giải cùng vấn đề ấy bằng
 * cách khác và giải triệt để hơn: form không còn nằm trong dòng chảy của trang, nên không còn
 * khoảng cách nào để cuộn qua. Giữ lại lời gọi `scrollIntoView` lúc này là cuộn cái nền phía sau
 * một tấm đang che nó.
 *
 * Nên hai ca dưới khoá đúng thứ THAY THẾ nó: form là một `<dialog>` ĐANG MỞ, và phần trang phía
 * sau không bị cuộn.
 */
describe('WF-06 — form mở thành hộp thoại giữa màn', () => {
  it('bấm Sửa thì mở hộp thoại, không cuộn trang phía sau', async () => {
    const bay = bayScrollIntoView();
    try {
      seedHolding();
      render(<PortfolioScreen />);

      await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));

      const hop = await tamTrenCung();
      expect(hop.tagName).toBe('DIALOG');
      // Tiêu đề hộp thoại gọi đúng tên việc đang làm, kèm mã đang sửa.
      expect(within(hop).getByRole('heading', { name: 'Sửa FPT' })).toBeTruthy();
      // Các ô nhập nằm trong chính hộp thoại ấy, không rơi lại trong trang.
      expect(within(hop).getByLabelText('Số cổ phiếu nắm giữ')).toBeTruthy();

      expect(bay.goi).not.toHaveBeenCalled();
    } finally {
      bay.go();
    }
  });

  it('bấm "Thêm mới" mở cùng một hộp thoại, tiêu đề nói là thêm mã chứ không phải sửa', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Thêm mới' }));

    const hop = await tamTrenCung();
    expect(within(hop).getByRole('heading', { name: 'Thêm mã' })).toBeTruthy();
    expect(within(hop).getByLabelText('Số cổ phiếu nắm giữ')).toBeTruthy();
  });

  /*
   * Ô nhập KHÔNG được nằm sẵn trong DOM lúc form đóng: nhãn của chúng là nhãn thật, nên một ô
   * ẩn vẫn trả lời `getByLabelText` và mọi ca kiểm sau đó thao tác lên một form không ai mở.
   */
  it('form đóng thì không có ô nhập nào trong trang', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await screen.findByText(/Giá phiên/);

    expect(screen.queryByLabelText('Số cổ phiếu nắm giữ')).toBeNull();
  });
});

/*
 * ── Thanh thị giá không được để trống ───────────────────────────────────────────────────────
 *
 * Chủ dự án chụp lại đúng ca này: danh mục có mã 'VNI' (là chỉ số, không phải cổ phiếu nên Finbox
 * không có), nguồn trả lời bình thường, và thanh dưới sáu ô chỉ còn mỗi nút "Làm mới" nằm chơ vơ
 * bên phải một hộp trắng.
 */
describe('WF-06 — thanh thị giá luôn nói được điều gì đó', () => {
  it('nguồn trả lời được nhưng không mã nào có giá: nói lý do thay vì bày một nút trơ', async () => {
    seedHolding();
    // Nguồn KHÔNG hỏng — nó trả lời, chỉ là không có mã nào trong danh mục.
    feed.snapshots.mockResolvedValue(new Map());
    render(<PortfolioScreen />);

    const bar = await screen.findByRole('status');
    expect(bar.textContent).toContain('Chưa có mã nào tra được thị giá.');
    // Và không được mượn câu của ca mất mạng: ở đây mạng vẫn tốt, lời khuyên phải khác.
    expect(bar.textContent).not.toContain('Không lấy được thị giá từ Finbox.');
  });

  it('có giá thì thanh nói ngày phiên chứ không nói câu trống', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const bar = await screen.findByRole('status');
    await waitFor(() => {
      expect(bar.textContent).toContain('21/08/2026');
    });
    expect(bar.textContent).not.toContain('Chưa có mã nào tra được thị giá.');
  });
});

/**
 * ── Mã chờ số liệu: mã lấy từ watchlist Finbox về (13/10/2026) ────────────────────────────────
 *
 * Một watchlist chỉ chứa MÃ, còn một dòng nắm giữ thì bắt buộc có số lượng và giá vốn. Chủ dự án chốt
 * cách đứng giữa: mã lấy về *"vẫn sẽ được phân loại vào danh mục nhưng sẽ có màu tượng trưng riêng để
 * khi người dùng bấm vào sẽ hiển thị bảng nhập thêm thông số đang thiếu"*.
 *
 * Thứ cụm này gác trước hết là FR-06: một dòng chưa có số lượng KHÔNG được thành 0 CP, không được kéo
 * "Vốn đã bỏ ra" của cả danh mục về `_ _`, và không được lọt vào mẫu số của tỷ trọng. Nó giữ được vì
 * mã chờ nằm ở một kho riêng mà `summarisePortfolio()` không bao giờ nhìn thấy — các ca dưới đây ghim
 * đúng hệ quả ấy trên màn.
 *
 * Cửa vào ở đây là `?nhap=`, bộ nối đầu tiên (tên tham số là tạm, chờ Finbox chốt link). Bộ nối API
 * sau này đổ về đúng cửa `importCodes()` nên các ca này không phải viết lại.
 */
describe('WF-06 — mã chờ số liệu: nhập từ ngoài vào bảng Mã', () => {
  const HPG_SNAPSHOT = {
    ...FPT_SNAPSHOT,
    code: 'HPG',
    name: 'Tập đoàn Hoà Phát',
    priceVnd: 27_300,
  };

  /** Mở màn bằng một đường link mang danh sách mã, như Finbox sẽ dựng. */
  function vaoBangLink(codes: string): void {
    window.history.replaceState(null, '', `/?nhap=${codes}`);
  }

  /** Hàng của một mã chờ — neo qua nút "Nhập số liệu <mã>", cùng lối `dongMa()` neo qua nút Sửa. */
  async function dongCho(code: string): Promise<HTMLElement> {
    const nut = await screen.findByRole('button', { name: `Nhập số liệu ${code}` });
    const dong = nut.closest('tr');
    if (dong === null) throw new Error(`Không tìm thấy hàng chờ của mã ${code}`);
    return dong;
  }

  /** Chữ của từng ô trong một hàng, theo thứ tự cột. */
  function chuCacO(dong: HTMLElement): string[] {
    return [...dong.querySelectorAll('td')].map((o) => o.textContent ?? '');
  }

  /** Gieo `n` mã nắm giữ M0, M1, … để đẩy bảng tới sát trần. */
  function seedNhieuMa(n: number): void {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify(
        Array.from({ length: n }, (_, i) => ({
          code: `M${String(i)}`,
          quantity: 10,
          costPrice: 1_000,
          buyDate: '2026-01-02',
        })),
      ),
    );
  }

  beforeEach(() => {
    feed.snapshots.mockResolvedValue(
      new Map([
        ['FPT', FPT_SNAPSHOT],
        ['HPG', HPG_SNAPSHOT],
      ]),
    );
  });

  it('mã trong link thành dòng chờ: thị giá thật, sáu ô còn lại “_ _”, KHÔNG ô nào là 0 (FR-06)', async () => {
    vaoBangLink('hpg');
    render(<PortfolioScreen />);

    const dong = await dongCho('HPG');
    await waitFor(() => {
      expect(chuCacO(dong)[3]).toBe('27.300');
    });

    // Mã · Số CP · Giá vốn · Thị giá · Lãi/lỗ · Lãi/lỗ % · Tỷ trọng · Ngày mua.
    // Ô cuối từng là hai nút không chữ; từ 13/10/2026 là ngày mua, mà mã chờ thì chưa có.
    expect(chuCacO(dong)).toEqual(['HPG', '_ _', '_ _', '27.300', '_ _', '_ _', '_ _', '_ _']);
    expect(dong.className).toMatch(/holdRowPending/);
  });

  it('gọi nguồn với cả mã đang giữ lẫn mã chờ, và chỉ MÃ rời máy', async () => {
    seedHolding();
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    await dongCho('HPG');
    await waitFor(() => {
      expect(feed.snapshots.mock.calls.at(-1)?.[0]).toEqual(['FPT', 'HPG']);
    });

    const daGui = JSON.stringify(feed.snapshots.mock.calls);
    expect(daGui).not.toContain('60000');
    expect(daGui).not.toContain('2026-01-02');
  });

  it('nhập xong thì mã nằm trên đĩa và tham số rời URL; mở lại không sinh dòng đôi', async () => {
    vaoBangLink('HPG,FPT');
    const lanDau = render(<PortfolioScreen />);

    await dongCho('HPG');
    await waitFor(() => {
      expect(window.location.search).toBe('');
    });
    expect(window.localStorage.getItem(PENDING_KEY)).toBe('["HPG","FPT"]');

    // Mở lại bằng CHÍNH đường link ấy: hai mã đã ở trong bảng nên không mã nào vào lần hai.
    lanDau.unmount();
    vaoBangLink('HPG,FPT');
    render(<PortfolioScreen />);

    await dongCho('FPT');
    expect(screen.getAllByRole('button', { name: /^Nhập số liệu / })).toHaveLength(2);
    expect(window.localStorage.getItem(PENDING_KEY)).toBe('["HPG","FPT"]');
  });

  it('mã chờ KHÔNG vào thẻ tóm tắt: tổng giá trị và vốn đã bỏ ra giữ nguyên, tỷ trọng không hụt', async () => {
    seedHolding();
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    await dongCho('HPG');
    // 100 CP FPT × 71.400 và 100 × 60.000 — đúng hai con số của một danh mục chỉ có FPT.
    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('7.140.000');
    });
    expect((await oThongKe('Vốn đã bỏ ra')).textContent).toContain('6.000.000');

    // FPT vẫn là 100% của phần có số: mã chờ không nằm trong mẫu số, nên cũng không có câu "mẫu số hụt".
    expect(chuCacO(await dongMa('FPT'))[6]).toContain('100,0%');
    expect(screen.queryByText(t('portfolio.weightPartial'))).toBeNull();

    // Số trên tab là số DÒNG của bảng.
    expect(screen.getByRole('tab', { name: 'Mã 2' })).toBeTruthy();
  });

  it('bảng chỉ có mã chờ: thẻ tóm tắt “_ _” với đúng lý do, và vẫn nêu ngày phiên của thị giá', async () => {
    vaoBangLink('FPT');
    render(<PortfolioScreen />);

    await dongCho('FPT');
    expect(await screen.findAllByText('Chưa mã nào có số lượng và giá vốn.')).toHaveLength(2);
    // Bảng đang có một dòng — nói "chưa có mã nào" là nói sai về chính màn hình này.
    expect(screen.queryByText('Danh mục chưa có mã nào.')).toBeNull();
    expect(screen.queryByText(t('portfolio.empty'))).toBeNull();
    expect(screen.queryByText(/^0\s*₫$/)).toBeNull();

    const bar = await screen.findByRole('status');
    await waitFor(() => {
      expect(bar.textContent).toContain('21/08/2026');
    });
  });

  /*
   * Giá cũ chỉ được hiện khi màn nêu tên phiên của nó (`price-cache-store.ts`). Luật ấy phải giữ cả
   * khi con số duy nhất trên màn là thị giá của một dòng chờ.
   */
  it('mất mạng, bảng chỉ có mã chờ: thị giá lấy từ kho đã lưu vẫn đi kèm ngày phiên', async () => {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(['FPT']));
    window.localStorage.setItem(
      PRICE_CACHE_KEY,
      JSON.stringify({
        fetchedAt: Date.now(),
        items: [{ code: 'FPT', name: 'FPT Corp', priceVnd: 71_400, asOfDate: '2026-08-21' }],
      }),
    );
    feed.snapshots.mockRejectedValue(new Error('mất mạng'));
    render(<PortfolioScreen />);

    const dong = await dongCho('FPT');
    await waitFor(() => {
      expect(chuCacO(dong)[3]).toBe('71.400');
    });
    expect(screen.getByText(/Chưa làm mới được thị giá/)).toBeTruthy();
    expect(screen.getByText(/21\/08\/2026/)).toBeTruthy();
  });

  it('bấm vào dòng chờ mở hộp thoại nhập số: đúng mã, ô mã khoá, ô số để trống', async () => {
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    const dong = await dongCho('HPG');
    // Bấm vào một Ô của dòng chứ không phải nút: cả dòng là đích bấm.
    await userEvent.click(dong.querySelectorAll('td')[1] as HTMLElement);

    const hop = await tamTrenCung();
    expect(within(hop).getByRole('heading', { name: 'Nhập số liệu HPG' })).toBeTruthy();
    const oMa = within(hop).getByRole('button', { name: 'Mã cổ phiếu' }) as HTMLButtonElement;
    expect(oMa.disabled).toBe(true);
    expect(oMa.textContent).toContain('HPG');
    expect((within(hop).getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement).value).toBe('');
    expect((within(hop).getByLabelText('Giá vốn một cổ phiếu (₫)') as HTMLInputElement).value).toBe(
      '',
    );
    // Nút lưu không hứa "Thêm vào danh mục" (mã đã ở trong bảng) lẫn "Lưu thay đổi" (chưa có gì để đổi).
    expect(within(hop).getByRole('button', { name: 'Lưu số liệu' })).toBeTruthy();
  });

  it('để trống mà bấm lưu thì nói lý do, và dòng vẫn là dòng chờ', async () => {
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Nhập số liệu HPG' }));
    await userEvent.click(screen.getByRole('button', { name: 'Lưu số liệu' }));

    expect(screen.getByText('Nhập số cổ phiếu nắm giữ, lớn hơn 0.')).toBeTruthy();
    expect(window.localStorage.getItem(PENDING_KEY)).toBe('["HPG"]');
    expect(window.localStorage.getItem(PORTFOLIO_KEY)).toBe('[]');
  });

  it('nhập đủ số rồi lưu: dòng thành nắm giữ, rời kho chờ và vào tổng', async () => {
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Nhập số liệu HPG' }));
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '200');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '25000');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu số liệu' }));

    // Hết nút "Nhập số liệu", có nút "Sửa": một dòng, không phải hai.
    const dong = await dongMa('HPG');
    expect(screen.queryByRole('button', { name: 'Nhập số liệu HPG' })).toBeNull();
    expect(dong.className).not.toMatch(/holdRowPending/);
    expect(chuCacO(dong).slice(0, 4)).toEqual(['HPG', '200', '25.000', '27.300']);

    // 200 × 27.300 = 5.460.000; vốn 200 × 25.000 = 5.000.000.
    await waitFor(async () => {
      expect((await oThongKe('Tổng giá trị')).textContent).toContain('5.460.000');
    });
    expect((await oThongKe('Vốn đã bỏ ra')).textContent).toContain('5.000.000');

    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_KEY)).toBeNull();
    });
    const daLuu = JSON.parse(window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]') as Array<{
      code: string;
      quantity: number;
      costPrice: number;
    }>;
    expect(daLuu).toHaveLength(1);
    expect(daLuu[0]).toMatchObject({ code: 'HPG', quantity: 200, costPrice: 25_000 });

    // Số vừa gõ không rời máy.
    expect(JSON.stringify(feed.snapshots.mock.calls)).not.toContain('25000');
  });

  it('thùng rác trên dòng chờ gỡ đúng mã ấy, và KHÔNG mở hộp thoại', async () => {
    vaoBangLink('HPG,FPT');
    render(<PortfolioScreen />);

    await dongCho('FPT');
    await userEvent.click(screen.getByRole('button', { name: 'Xoá HPG' }));

    expect(screen.queryByRole('button', { name: 'Nhập số liệu HPG' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Nhập số liệu FPT' })).toBeTruthy();
    // Bấm nút nằm TRONG dòng không được nổi lên thành bấm dòng.
    expect(screen.queryAllByRole('dialog').filter((tam) => tam.hasAttribute('open'))).toHaveLength(
      0,
    );
    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_KEY)).toBe('["FPT"]');
    });
  });

  it('gỡ hết mã chờ thì kho rời máy hẳn, không để lại một khoá rỗng', async () => {
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá HPG' }));

    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_KEY)).toBeNull();
    });
    expect(await screen.findByText(t('portfolio.empty'))).toBeTruthy();
  });

  it('sheet chọn mã khoá mã đang chờ như mã đang giữ — đã ở trong bảng thì không thêm lần nữa', async () => {
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    await dongCho('HPG');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm mới' }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();

    const nutCua = (code: string): HTMLButtonElement => {
      const dong = within(sheet)
        .getAllByRole('listitem')
        .find((item) => item.textContent?.startsWith(code) === true);
      return within(dong as HTMLElement).getByRole('button') as HTMLButtonElement;
    };
    expect(nutCua('HPG').disabled).toBe(true);
    expect(nutCua('FPT').disabled).toBe(false);
  });

  it('ô tìm lọc cả dòng chờ, theo mã lẫn tên doanh nghiệp gõ không dấu', async () => {
    seedHolding();
    vaoBangLink('HPG');
    render(<PortfolioScreen />);

    const dong = await dongCho('HPG');
    await waitFor(() => {
      expect(chuCacO(dong)[3]).toBe('27.300');
    });

    const o = screen.getByRole('searchbox', { name: 'Tìm kiếm' });
    await userEvent.type(o, 'hoa phat');
    expect(screen.getByRole('button', { name: 'Nhập số liệu HPG' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: /^Sửa FPT$/ })).toBeNull();

    await userEvent.clear(o);
    await userEvent.type(o, 'fpt');
    expect(screen.queryByRole('button', { name: 'Nhập số liệu HPG' })).toBeNull();
    expect(screen.getByRole('button', { name: /^Sửa FPT$/ })).toBeTruthy();
  });

  it('link có mã đang giữ, mã lặp và thứ không phải mã: chỉ mã mới vào, không báo gì', async () => {
    seedHolding();
    vaoBangLink('FPT,a-b,HPG,hpg,ABCDEFGHIJKLMNOP');
    render(<PortfolioScreen />);

    await dongCho('HPG');
    expect(screen.getAllByRole('button', { name: /^Nhập số liệu / })).toHaveLength(1);
    // FPT vẫn là MỘT dòng nắm giữ với số cũ — không cộng dồn, không thành dòng chờ.
    expect(screen.getAllByRole('button', { name: /^Sửa FPT$/ })).toHaveLength(1);
    expect(chuCacO(await dongMa('FPT'))[1]).toBe('100');
    expect(screen.queryByText(/chưa đưa vào được/)).toBeNull();
  });

  it('chạm trần của bảng: mã không vào được bị nêu ĐÍCH DANH, mã còn chỗ vẫn vào', async () => {
    seedNhieuMa(MAX_HOLDINGS - 1);
    vaoBangLink('AAA,BBB,CCC');
    render(<PortfolioScreen />);

    await dongCho('AAA');
    expect(screen.queryByRole('button', { name: 'Nhập số liệu BBB' })).toBeNull();
    expect(
      screen.getByText(
        `Danh mục chỉ chứa ${String(MAX_HOLDINGS)} mã, nên chưa đưa vào được: BBB, CCC.`,
      ),
    ).toBeTruthy();
    expect(screen.getByRole('tab', { name: `Mã ${String(MAX_HOLDINGS)}` })).toBeTruthy();
  });

  it('bảng đã đủ dòng nhờ mã chờ: thêm mã mới bị chặn, nhưng nhập số cho mã chờ thì không', async () => {
    seedNhieuMa(MAX_HOLDINGS - 1);
    vaoBangLink('HPG');
    render(<PortfolioScreen />);
    await dongCho('HPG');

    // 49 dòng nắm giữ + 1 dòng chờ = đủ trần: FPT là mã MỚI nên không còn chỗ.
    await chonMaTrongForm('FPT');
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));
    expect(screen.getByText(/Danh mục đã đủ/)).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }));

    // HPG thì đã có dòng sẵn: nhập số chỉ đổi dòng ấy từ chờ sang nắm giữ, không thêm dòng nào.
    await userEvent.click(screen.getByRole('button', { name: 'Nhập số liệu HPG' }));
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '200');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '25000');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu số liệu' }));

    await dongMa('HPG');
    expect(screen.queryByText(/Danh mục đã đủ/)).toBeNull();
    expect(screen.getByRole('tab', { name: `Mã ${String(MAX_HOLDINGS)}` })).toBeTruthy();
  });

  it('mã chờ đã thành nắm giữ ở nơi khác thì lúc mở lại không còn là dòng chờ', async () => {
    seedHolding();
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(['FPT', 'HPG']));
    render(<PortfolioScreen />);

    await dongCho('HPG');
    expect(screen.queryByRole('button', { name: 'Nhập số liệu FPT' })).toBeNull();
    expect(screen.getAllByRole('button', { name: /^Sửa FPT$/ })).toHaveLength(1);
    await waitFor(() => {
      expect(window.localStorage.getItem(PENDING_KEY)).toBe('["HPG"]');
    });
  });

  it('không có tham số, không có kho chờ: màn như cũ, không ghi khoá nào mới', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await dongMa('FPT');
    expect(screen.queryByRole('button', { name: /^Nhập số liệu / })).toBeNull();
    expect(window.localStorage.getItem(PENDING_KEY)).toBeNull();
  });
});

/*
 * ── Khổ điện thoại (dưới 1024px) — bản vẽ của chủ dự án 14/10/2026 ───────────────────────────────
 *
 * Bố cục là CSS và jsdom không áp CSS Module, nên phần nhìn (năm cột, nút ghim đáy, thẻ thu một hàng,
 * tab ngang) do `check:chrome` đo. Ở đây gác phần HÀNH VI, thứ duy nhất khác giữa hai khổ: bấm vào dòng
 * mở/đóng dòng chi tiết thay vì mở form, một dòng mở một lúc, hai nút trong dòng chi tiết làm đúng
 * việc; cộng thêm hai icon trên thanh trên.
 *
 * `matchMedia` giả trả "không khớp (min-width: 1024px)" — tức khổ điện thoại. Không có nó (mọi ca ở
 * trên) màn hiểu là PC, đúng hành vi các ca ấy ghim.
 */
describe('WF-06 — khổ điện thoại (dưới 1024px)', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.getElementById('header-screen-actions')?.remove();
  });

  function seedHai(): void {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
  }

  function dongChiTiet(): HTMLElement[] {
    return [...document.querySelectorAll<HTMLElement>('tr[id*="-chi-tiet-"]')];
  }

  it('bấm dòng thì dòng chi tiết mở ngay dưới, với Lãi/lỗ · Lãi/lỗ % · Tỷ trọng và hai nút', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await screen.findByText(/Giá phiên/);
    const dong = await dongMa('FPT');

    await userEvent.click(within(dong).getAllByRole('cell')[1] as HTMLElement);

    // Không mở form: ở khổ này bấm dòng là mở chi tiết.
    expect(screen.queryByLabelText('Số cổ phiếu nắm giữ')).toBeNull();
    const [chiTiet] = dongChiTiet();
    expect(chiTiet).toBeDefined();
    expect(dong.nextElementSibling).toBe(chiTiet);
    const muiTen = within(dong).getByRole('button', { name: 'Chi tiết FPT' });
    expect(muiTen.getAttribute('aria-expanded')).toBe('true');
    expect(muiTen.getAttribute('aria-controls')).toBe(chiTiet?.id);

    const ct = chiTiet as HTMLElement;
    expect([...ct.querySelectorAll('dt')].map((dt) => dt.textContent)).toEqual([
      'Lãi/lỗ',
      'Lãi/lỗ %',
      'Tỷ trọng',
    ]);
    // FPT: 100 CP, giá vốn 60.000, thị giá 71.400 → lãi 1.140.000, +19,0%, tỷ trọng 100%.
    expect([...ct.querySelectorAll('dd')].map((dd) => dd.textContent)).toEqual([
      '+1.140.000',
      '+19,0%',
      '100,0%',
    ]);
    // Chủ dự án đổi nhãn nút đỏ của bản vẽ từ "Bỏ mã" thành "Xoá".
    expect(
      within(ct)
        .getAllByRole('button')
        .map((nut) => nut.textContent),
    ).toEqual(['Sửa', 'Xoá']);
    expect(screen.queryByRole('button', { name: /Bỏ mã/ })).toBeNull();
  });

  it('bấm lại thì đóng; mở dòng khác thì dòng trước đóng — một dòng một lúc', async () => {
    seedHai();
    render(<PortfolioScreen />);
    const fpt = await dongMa('FPT');
    const hpg = await dongMa('HPG');

    await userEvent.click(within(fpt).getAllByRole('cell')[2] as HTMLElement);
    expect(dongChiTiet().map((d) => d.id)).toEqual(['portfolio-ma-chi-tiet-FPT']);

    await userEvent.click(within(hpg).getByRole('button', { name: 'Chi tiết HPG' }));
    expect(dongChiTiet().map((d) => d.id)).toEqual(['portfolio-ma-chi-tiet-HPG']);
    expect(
      within(fpt).getByRole('button', { name: 'Chi tiết FPT' }).getAttribute('aria-expanded'),
    ).toBe('false');

    // Bấm mũi tên đang mở: đóng lại, và không vì chặn sự kiện hỏng mà mở rồi đóng ngay.
    await userEvent.click(within(hpg).getByRole('button', { name: 'Chi tiết HPG' }));
    expect(dongChiTiet()).toHaveLength(0);
  });

  it('Sửa trong dòng chi tiết mở form của đúng mã; Xoá bỏ mã khỏi kho', async () => {
    seedHai();
    render(<PortfolioScreen />);
    const fpt = await dongMa('FPT');

    await userEvent.click(within(fpt).getAllByRole('cell')[1] as HTMLElement);
    await userEvent.click(
      within(dongChiTiet()[0] as HTMLElement).getByRole('button', { name: 'Sửa' }),
    );
    expect((screen.getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement).value).toBe('100');
    await userEvent.click(screen.getByRole('button', { name: 'Huỷ' }));

    await userEvent.click(
      within(dongChiTiet()[0] as HTMLElement).getByRole('button', { name: 'Xoá' }),
    );
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    });
    expect(dongChiTiet()).toHaveLength(0);
    const kho = JSON.parse(window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]') as Array<{
      code: string;
    }>;
    expect(kho.map((h) => h.code)).toEqual(['HPG']);
  });

  it('dòng chờ số liệu: chi tiết chỉ có "Nhập số liệu" và "Xoá"', async () => {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(['HPG']));
    render(<PortfolioScreen />);
    const nut = await screen.findByRole('button', { name: 'Nhập số liệu HPG' });
    const dong = nut.closest('tr') as HTMLElement;

    await userEvent.click(within(dong).getAllByRole('cell')[3] as HTMLElement);
    const ct = dongChiTiet()[0] as HTMLElement;
    expect(ct.querySelector('dl')).toBeNull();
    expect(
      within(ct)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Nhập số liệu', 'Xoá']);

    await userEvent.click(within(ct).getByRole('button', { name: 'Nhập số liệu' }));
    expect(screen.getByLabelText('Số cổ phiếu nắm giữ')).toBeTruthy();
  });

  /*
   * Bảng Công thức ở khổ này KHÔNG có dòng thả xuống (chủ dự án vẽ lại 14/10/2026): *"không có popup đổ
   * xuống khi bấm vào mã nữa, chuyển date lên cùng hàng … bấm vào công thức thì là vào phần sửa luôn, tạo
   * thêm Icon xóa ở góc bên phải như ở web"*. Ca cũ ở đây ghim điều ngược lại ("bấm dòng mở chi tiết,
   * KHÔNG điều hướng"); nó được thay, không nới.
   */
  it('tab Công thức: chạm dòng mở thẳng phép tính — không dòng chi tiết, không mũi tên', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
    const a = dongDaLuu()[2] as HTMLElement;

    expect(screen.queryAllByRole('button', { name: /^Chi tiết / })).toEqual([]);
    await userEvent.click(within(a).getAllByRole('cell')[1] as HTMLElement);

    expect(router.push).toHaveBeenCalledWith('/cong-thuc/pe/?luu=pe-a');
    expect(dongDaLuu().every((d) => !d.id.includes('chi-tiet'))).toBe(true);
  });

  it('tab Công thức: dấu X đứng cuối ô Ngày lưu, cùng hàng với ngày; bấm thì xoá, không mở phép tính', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
    const a = dongDaLuu()[2] as HTMLElement;
    const o = within(a).getAllByRole('cell');

    // Bốn ô như PC; ô đầu chỉ còn liên kết tên, dấu X nằm ở ô cuối, ngay sau ngày lưu.
    expect(o).toHaveLength(4);
    expect(within(o[0] as HTMLElement).queryAllByRole('button')).toEqual([]);
    const oCuoi = o[3] as HTMLElement;
    const xoa = within(oCuoi).getByRole('button', { name: 'Xoá HPG · P/E' });
    expect(oCuoi.textContent).toBe('25/08/2026');
    expect(xoa.previousSibling?.textContent).toBe('25/08/2026');
    expect(within(a).getAllByRole('button')).toEqual([xoa]);

    await userEvent.click(xoa);
    await waitFor(() => {
      expect(screen.queryByRole('link', { name: 'Mở HPG · P/E' })).toBeNull();
    });
    expect(router.push).not.toHaveBeenCalled();
  });

  it('thẻ tóm tắt: nút "Chi tiết" mở/đóng phần còn lại của thẻ', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await screen.findByText(/Giá phiên/);

    const nut = screen.getByRole('button', { name: 'Chi tiết' });
    expect(nut.getAttribute('aria-expanded')).toBe('false');
    // Phần đóng lại vẫn nằm trong DOM (CSS ẩn nó): dải giá phiên vẫn là MỘT phần tử status.
    for (const id of (nut.getAttribute('aria-controls') ?? '').split(' ')) {
      expect(document.getElementById(id)).not.toBeNull();
    }
    expect(screen.getAllByRole('status')).toHaveLength(1);

    await userEvent.click(nut);
    expect(nut.getAttribute('aria-expanded')).toBe('true');
  });

  /*
   * Thẻ tóm tắt của tab Công thức KHÔNG mở ra được (14/10/2026): chủ dự án chụp ba dòng đếm của nó và
   * bảo _"bỏ poup như ảnh sau ở màn công thức đi"_. Ba dòng vẫn trong DOM vì khổ PC in chúng sẵn trong
   * thẻ; ở khổ này CSS ẩn chúng, và không còn nút nào để mở.
   */
  it('thẻ tóm tắt tab Công thức: không có nút "Chi tiết", chỉ một hàng "Đã lưu N phép tính"', async () => {
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');

    expect(screen.queryByRole('button', { name: 'Chi tiết' })).toBeNull();
    expect(document.querySelector('[aria-controls^="portfolio-saved-summary"]')).toBeNull();
    expect(screen.getByText('Trên số mã')).toBeTruthy();
  });

  /*
   * Icon của thanh trên đi qua cổng vào ô trống `header-screen-actions` của `AppHeader`. Ca kiểm không
   * dựng thanh trên, nên tự đặt ô trống ấy vào trang trước khi dựng màn.
   */
  function datOTrong(): HTMLElement {
    const o = document.createElement('div');
    o.id = 'header-screen-actions';
    document.body.appendChild(o);
    return o;
  }

  /*
   * Icon Làm mới giá: gạch rồi cho về trong cùng ngày 14/10/2026 — _"thêm lại icon refresh lên để ở bên
   * phải của icon search"_. Ca ở đây từng ghim "CHỈ có icon Tìm kiếm"; nó được đảo, không nới.
   */
  it('thanh trên: icon Tìm kiếm rồi icon Làm mới giá bên phải; bấm thì gọi lại Finbox, icon xoay và khoá', async () => {
    const o = datOTrong();
    seedHolding();
    render(<PortfolioScreen />);
    await screen.findByText(/Giá phiên/);

    const tim = await within(o).findByRole('button', { name: 'Tìm kiếm' });
    const lamMoi = within(o).getByRole('button', { name: 'Làm mới giá' });
    expect(within(o).getAllByRole('button')).toEqual([tim, lamMoi]);
    expect(lamMoi.getAttribute('aria-busy')).toBe('false');
    expect(feed.snapshots).toHaveBeenCalledTimes(1);

    await userEvent.click(lamMoi);
    await waitFor(() => {
      expect(feed.snapshots).toHaveBeenCalledTimes(2);
    });
    expect(lamMoi.getAttribute('aria-busy')).toBe('true');
    expect(lamMoi.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('true');

    await waitFor(
      () => {
        expect(lamMoi.getAttribute('aria-busy')).toBe('false');
      },
      { timeout: 3000 },
    );
    expect(screen.getByRole('table').getAttribute('aria-busy')).toBe('false');
  });

  /*
   * Bấm làm mới ở tab Công thức cũng phải có hiệu ứng tải lại như tab Mã (14/10/2026): _"khi bấm vào tải
   * lại thì cả ở màn Mã và công thức đều có hiệu ứng tải lại như của màn Mã"_. Ở tab này tải lại là ĐỌC
   * LẠI kho phép tính đã lưu — nên một phép tính vừa lưu ở chỗ khác (ghi thẳng vào kho ở đây) hiện ra.
   */
  it('tab Công thức: icon Làm mới đọc lại kho, cột Kết quả và số đếm thành vệt chờ rồi trở lại', async () => {
    const o = datOTrong();
    seedSavedMany();
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
    expect(dongDaLuu()).toHaveLength(3);

    // Một phép tính lưu ở tab trình duyệt khác: kho đổi, màn chưa biết.
    const kho = JSON.parse(window.localStorage.getItem(SAVED_CALCS_KEY) ?? '[]') as unknown[];
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        ...kho,
        {
          id: 'roe-d',
          formulaId: 'roe',
          name: 'ROE của VNM',
          code: 'VNM',
          inputs: {},
          resultValue: 31.2,
          resultUnit: '%',
          savedAt: MOC_B + 1000,
          needsSeries: false,
        },
      ]),
    );

    const lamMoi = await within(o).findByRole('button', { name: 'Làm mới giá' });
    await userEvent.click(lamMoi);

    const bang = screen.getByRole('table');
    expect(bang.getAttribute('aria-busy')).toBe('true');
    expect(lamMoi.getAttribute('aria-busy')).toBe('true');
    expect(dongDaLuu()).toHaveLength(4);
    for (const dong of dongDaLuu()) {
      const o_ = within(dong).getAllByRole('cell');
      // Kết quả (ô 2) là vệt chờ; tên, mã, ngày lưu thì không.
      expect((o_[2] as HTMLElement).querySelector('[class*="khungCho"]')).not.toBeNull();
      for (const i of [0, 1, 3]) {
        expect((o_[i] as HTMLElement).querySelector('[class*="khungCho"]')).toBeNull();
      }
    }
    expect((await oThongKe('Đã lưu')).querySelector('[class*="khungCho"]')).not.toBeNull();

    await waitFor(
      () => {
        expect(bang.getAttribute('aria-busy')).toBe('false');
      },
      { timeout: 3000 },
    );
    expect(bang.querySelector('[class*="khungCho"]')).toBeNull();
    expect(lamMoi.getAttribute('aria-busy')).toBe('false');
  });

  /*
   * Ô tìm mở ra NGAY TRÊN THANH TRÊN, ở chỗ chủ dự án khoanh (14/10/2026), và vẫn là MỘT ô: lúc mở, thân
   * màn không còn bản thứ hai.
   */
  it('icon Tìm kiếm mở ô tìm trên thanh trên; bấm lần nữa thì đóng và XOÁ chữ', async () => {
    const o = datOTrong();
    seedHai();
    render(<PortfolioScreen />);
    await dongMa('HPG');

    const tim = await within(o).findByRole('button', { name: 'Tìm kiếm' });
    expect(tim.getAttribute('aria-expanded')).toBe('false');
    expect(tim.getAttribute('aria-controls')).toBe('portfolio-search');
    expect(within(o).queryByRole('searchbox')).toBeNull();

    // Đóng là kính lúp, mở là dấu X — ô đang mở phải có một nút trông như nút đóng.
    expect(tim.querySelector('path')?.getAttribute('d')).toMatch(/^M11 19a8/);
    await userEvent.click(tim);
    expect(tim.getAttribute('aria-expanded')).toBe('true');
    expect(tim.querySelector('path')?.getAttribute('d')).toBe('M6 6l12 12M18 6 6 18');
    const o_tim = within(o).getByRole('searchbox', { name: 'Tìm kiếm' });
    expect(screen.getAllByRole('searchbox')).toEqual([o_tim]);
    expect(document.getElementById('portfolio-search')?.contains(o_tim)).toBe(true);
    await waitFor(() => {
      expect(document.activeElement).toBe(o_tim);
    });
    // Ô tìm mở thì icon Làm mới giá rời thanh trên — chỉ còn dấu X của ô.
    expect(within(o).getAllByRole('button')).toEqual([tim]);
    await userEvent.type(o_tim, 'hpg');
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    });
    // Đang có chữ là vẫn đang dùng tìm kiếm: icon chưa về.
    expect(within(o).queryByRole('button', { name: 'Làm mới giá' })).toBeNull();

    await userEvent.click(tim);
    expect(tim.getAttribute('aria-expanded')).toBe('false');
    expect(within(o).queryByRole('searchbox')).toBeNull();
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe('');
    expect(await screen.findByRole('button', { name: 'Sửa FPT' })).toBeTruthy();
    // Đóng ô thì icon Làm mới giá về lại, bên phải icon Tìm kiếm.
    expect(within(o).getAllByRole('button')).toEqual([
      tim,
      within(o).getByRole('button', { name: 'Làm mới giá' }),
    ]);
  });

  /*
   * Chủ dự án mở ô rồi không đóng được (14/10/2026): _"bật ô search lên được rồi nhưng không có cách nào
   * tắt đi được ? lỗi nghiêm trọng"_. Ô còn trống thì chạm ra ngoài là đóng; ô có chữ thì KHÔNG — chạm vào
   * dòng kết quả là việc người tìm định làm, đóng ô lúc ấy là xoá chữ và mất kết quả.
   */
  it('ô tìm trên thanh trên còn trống: chạm ra ngoài là đóng; có chữ thì chạm ra ngoài không đóng', async () => {
    const o = datOTrong();
    seedHai();
    render(<PortfolioScreen />);
    await dongMa('HPG');

    const tim = await within(o).findByRole('button', { name: 'Tìm kiếm' });
    await userEvent.click(tim);
    const o_tim = within(o).getByRole('searchbox', { name: 'Tìm kiếm' });
    // Chạm trong khung (vào chính ô) không đóng.
    fireEvent.pointerDown(o_tim);
    expect(tim.getAttribute('aria-expanded')).toBe('true');

    fireEvent.pointerDown(document.body);
    expect(within(o).queryByRole('searchbox')).toBeNull();
    expect(tim.getAttribute('aria-expanded')).toBe('false');
    expect(within(o).getByRole('button', { name: 'Làm mới giá' })).toBeTruthy();

    await userEvent.click(tim);
    await userEvent.type(within(o).getByRole('searchbox', { name: 'Tìm kiếm' }), 'hpg');
    fireEvent.pointerDown(document.body);
    expect(tim.getAttribute('aria-expanded')).toBe('true');
    expect(within(o).getByRole('searchbox', { name: 'Tìm kiếm' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
  });

  it('Esc trong ô tìm trên thanh trên: đóng, xoá chữ, trả tiêu điểm về icon', async () => {
    const o = datOTrong();
    seedHai();
    render(<PortfolioScreen />);
    await dongMa('HPG');

    const tim = await within(o).findByRole('button', { name: 'Tìm kiếm' });
    await userEvent.click(tim);
    const o_tim = within(o).getByRole('searchbox', { name: 'Tìm kiếm' });
    await userEvent.type(o_tim, 'hpg{Escape}');

    expect(within(o).queryByRole('searchbox')).toBeNull();
    expect(tim.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(tim);
    expect(await screen.findByRole('button', { name: 'Sửa FPT' })).toBeTruthy();
    expect(within(o).getByRole('button', { name: 'Làm mới giá' })).toBeTruthy();
  });
});

/*
 * ── Sắp bảng Mã bằng tiêu đề cột (14/10/2026) ──────────────────────────────────────────────────────
 *
 * Chủ dự án: *"thêm tính năng sort cả ở màn web lẫn màn mobile cho bảng Mã ở danh mục"*, và chọn: bấm
 * tiêu đề cột, máy nhớ cách sắp, chỉ bảng Mã. Luật thuần (vòng ba lần bấm, `_ _` đứng cuối, khổ điện
 * thoại bỏ ba cột ẩn) có ca riêng ở `portfolio-sort.test.ts`; ở đây gác phần màn: tiêu đề là nút mang
 * đúng chữ của cột, `aria-sort` nói chiều, dòng đổi chỗ thật, kho ghi và đọc lại, dòng chờ vẫn đứng sau.
 *
 * Bộ số: thứ tự đã thêm vào là HPG, ACB, FPT. ACB không có giá (nguồn chỉ trả FPT và HPG) và không có
 * ngày mua, nên ở mọi cột phụ thuộc giá nó là dòng `_ _`.
 */
describe('WF-06 — sắp bảng Mã bằng tiêu đề cột', () => {
  const HPG_SNAPSHOT = {
    ...FPT_SNAPSHOT,
    code: 'HPG',
    name: 'Tập đoàn Hoà Phát',
    priceVnd: 26_000,
  };

  beforeEach(() => {
    feed.snapshots.mockResolvedValue(
      new Map([
        ['FPT', FPT_SNAPSHOT],
        ['HPG', HPG_SNAPSHOT],
      ]),
    );
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'HPG', quantity: 300, costPrice: 30_000, buyDate: '2026-03-05', beta: null },
        { code: 'ACB', quantity: 50, costPrice: 25_000, buyDate: '', beta: null },
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
      ]),
    );
  });

  /** Mã của từng dòng theo thứ tự trên màn — dòng nắm giữ rồi dòng chờ. */
  function thuTu(): string[] {
    return screen
      .getAllByRole('button', { name: /^(Sửa|Nhập số liệu) [A-Z0-9]+$/ })
      .map((nut) => nut.textContent ?? '');
  }

  function tieuDeCot(nhan: string): HTMLElement {
    return screen.getByRole('columnheader', { name: nhan });
  }

  function nutCot(nhan: string): HTMLElement {
    return within(tieuDeCot(nhan)).getByRole('button');
  }

  function cotDangSap(): Array<string | null> {
    return screen
      .getAllByRole('columnheader')
      .filter((th) => th.hasAttribute('aria-sort'))
      .map((th) => th.textContent);
  }

  async function moMan(): Promise<void> {
    render(<PortfolioScreen />);
    await screen.findByText(/Giá phiên/);
    await dongMa('ACB');
  }

  it('tám tiêu đề là tám nút mang đúng chữ của cột; lúc đầu không cột nào đang sắp', async () => {
    await moMan();

    const tieuDe = screen.getAllByRole('columnheader');
    expect(tieuDe.map((th) => within(th).getByRole('button').textContent)).toEqual([
      'Mã',
      'Số CP',
      'Giá vốn',
      'Thị giá',
      'Lãi/lỗ',
      'Lãi/lỗ %',
      'Tỷ trọng',
      'Ngày mua',
    ]);
    expect(cotDangSap()).toEqual([]);
    expect(thuTu()).toEqual(['HPG', 'ACB', 'FPT']);
  });

  it('Thị giá: lớn trước, rồi nhỏ trước, rồi về thứ tự đã thêm — mã thiếu giá luôn đứng cuối (FR-06)', async () => {
    await moMan();

    await userEvent.click(nutCot('Thị giá'));
    expect(thuTu()).toEqual(['FPT', 'HPG', 'ACB']);
    expect(tieuDeCot('Thị giá').getAttribute('aria-sort')).toBe('descending');

    await userEvent.click(nutCot('Thị giá'));
    expect(thuTu()).toEqual(['HPG', 'FPT', 'ACB']);
    expect(tieuDeCot('Thị giá').getAttribute('aria-sort')).toBe('ascending');

    await userEvent.click(nutCot('Thị giá'));
    expect(thuTu()).toEqual(['HPG', 'ACB', 'FPT']);
    expect(cotDangSap()).toEqual([]);
  });

  it('Mã xếp từ A tới Z ở lần bấm đầu; sang cột khác thì chỉ cột ấy mang aria-sort', async () => {
    await moMan();

    await userEvent.click(nutCot('Mã'));
    expect(thuTu()).toEqual(['ACB', 'FPT', 'HPG']);
    expect(cotDangSap()).toEqual(['Mã']);

    await userEvent.click(nutCot('Lãi/lỗ'));
    expect(thuTu()).toEqual(['FPT', 'HPG', 'ACB']);
    expect(cotDangSap()).toEqual(['Lãi/lỗ']);
  });

  it('sắp không đổi số nào trên dòng — tỷ trọng vẫn đo trên cả danh mục', async () => {
    await moMan();
    const truoc = within(await dongMa('FPT'))
      .getAllByRole('cell')
      .map((o) => o.textContent);

    await userEvent.click(nutCot('Tỷ trọng'));
    const sau = within(await dongMa('FPT'))
      .getAllByRole('cell')
      .map((o) => o.textContent);
    expect(sau).toEqual(truoc);
  });

  it('ô tìm và cách sắp cùng chạy: lọc chỉ bớt dòng, thứ tự vẫn theo cột đang sắp', async () => {
    await moMan();
    await userEvent.click(nutCot('Số CP'));
    expect(thuTu()).toEqual(['HPG', 'FPT', 'ACB']);

    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), 'p');
    await waitFor(() => {
      expect(thuTu()).toEqual(['HPG', 'FPT']);
    });
  });

  it('máy nhớ cách sắp: mở lại màn thì bảng vẫn xếp như lần trước; về thứ tự gốc thì gỡ khoá', async () => {
    await moMan();
    await userEvent.click(nutCot('Ngày mua'));
    expect(window.localStorage.getItem(PORTFOLIO_SORT_KEY)).toBe('{"key":"buyDate","dir":"desc"}');

    cleanup();
    await moMan();
    await waitFor(() => {
      expect(thuTu()).toEqual(['HPG', 'FPT', 'ACB']);
    });
    expect(tieuDeCot('Ngày mua').getAttribute('aria-sort')).toBe('descending');

    // Lần hai đảo chiều, lần ba về thứ tự đã thêm vào — kho không còn khoá nào.
    await userEvent.click(nutCot('Ngày mua'));
    expect(thuTu()).toEqual(['FPT', 'HPG', 'ACB']);
    await userEvent.click(nutCot('Ngày mua'));
    expect(thuTu()).toEqual(['HPG', 'ACB', 'FPT']);
    expect(window.localStorage.getItem(PORTFOLIO_SORT_KEY)).toBeNull();
  });

  it('kho hỏng thì bảng về thứ tự đã thêm vào, không vỡ màn', async () => {
    window.localStorage.setItem(PORTFOLIO_SORT_KEY, '{"key":"khong-co","dir":"len"}');
    await moMan();
    expect(thuTu()).toEqual(['HPG', 'ACB', 'FPT']);
    expect(cotDangSap()).toEqual([]);
  });

  it('dòng chờ số liệu luôn đứng sau dòng nắm giữ, và sắp theo Mã trong khối của chúng', async () => {
    window.localStorage.setItem(PENDING_KEY, JSON.stringify(['VNM', 'BID']));
    await moMan();
    expect(thuTu()).toEqual(['HPG', 'ACB', 'FPT', 'VNM', 'BID']);

    await userEvent.click(nutCot('Mã'));
    expect(thuTu()).toEqual(['ACB', 'FPT', 'HPG', 'BID', 'VNM']);
    await userEvent.click(nutCot('Mã'));
    expect(thuTu()).toEqual(['HPG', 'FPT', 'ACB', 'VNM', 'BID']);
  });

  it('bấm tiêu đề không mở form Sửa của dòng nào', async () => {
    await moMan();
    await userEvent.click(nutCot('Giá vốn'));
    expect(thuTu()).toEqual(['FPT', 'HPG', 'ACB']);
    expect(screen.queryByLabelText('Số cổ phiếu nắm giữ')).toBeNull();
  });

  /*
   * Khổ điện thoại: Lãi/lỗ, % và Tỷ trọng nằm trong dòng chi tiết, không có tiêu đề trên hàng. Cách sắp
   * theo chúng (đặt ở PC, rồi xoay máy tính bảng sang dọc) thì bảng về thứ tự gốc — nhưng KHO VẪN GIỮ,
   * để xoay lại là thấy lại. Năm cột còn lại sắp được như ở PC.
   */
  describe('khổ điện thoại', () => {
    beforeEach(() => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn((query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          addListener: vi.fn(),
          removeListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('cách sắp theo một cột ẩn ở khổ này thì bảng về thứ tự gốc, và kho không bị xoá', async () => {
      window.localStorage.setItem(PORTFOLIO_SORT_KEY, '{"key":"gain","dir":"desc"}');
      await moMan();

      expect(thuTu()).toEqual(['HPG', 'ACB', 'FPT']);
      expect(cotDangSap()).toEqual([]);
      expect(window.localStorage.getItem(PORTFOLIO_SORT_KEY)).toBe('{"key":"gain","dir":"desc"}');
    });

    it('năm cột trên hàng tiêu đề sắp được, và chạm tiêu đề không mở dòng chi tiết nào', async () => {
      await moMan();

      await userEvent.click(nutCot('Số CP'));
      expect(thuTu()).toEqual(['HPG', 'FPT', 'ACB']);
      expect(tieuDeCot('Số CP').getAttribute('aria-sort')).toBe('descending');
      expect(document.querySelectorAll('tr[id*="-chi-tiet-"]')).toHaveLength(0);
    });
  });
});

/*
 * ── Sắp bảng Công thức bằng tiêu đề cột (14/10/2026) ───────────────────────────────────────────────
 *
 * Chủ dự án: *"trong phần công thức đang chưa có chức năng sort. thêm chức năng này cho tôi"*, rồi chọn:
 * cột Kết quả KHÔNG sắp (lẫn ₫, %, lần), và lúc chưa bấm gì tiêu đề Ngày lưu mang sẵn mũi tên ↓. Luật thuần
 * có ca riêng ở `saved-calc-sort.test.ts`; ở đây gác phần màn.
 *
 * Bộ số: ba tên TỰ ĐẶT (dòng chính in đúng tên ấy), mỗi tên mở bằng một chữ có dấu khác nhau, để thứ tự chữ
 * tiếng Việt và thứ tự mã ký tự cho hai kết quả khác nhau — "Ảnh…", "Biên…", "Định…" theo tiếng Việt, còn
 * theo mã ký tự thì "Biên" đứng đầu ("B" nhỏ hơn "Ả" và "Đ"). Ngày lưu: Biên 09/10, Ảnh 28/09, Định 25/08.
 * Biên không có mã, và là phép tính ROE trong khi hai dòng kia là P/E — để ô tìm có thứ lọc riêng.
 */
describe('WF-06 — sắp bảng Công thức bằng tiêu đề cột', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        {
          id: 'pe-dinh',
          formulaId: 'pe',
          name: 'Định giá HPG',
          code: 'HPG',
          inputs: { price: 25000, eps: 2000 },
          resultValue: 12.5,
          resultUnit: 'lần',
          savedAt: MOC_A,
          needsSeries: false,
        },
        {
          id: 'roe-bien',
          formulaId: 'roe',
          name: 'Biên lợi nhuận tháng 9',
          inputs: {},
          resultValue: 18,
          resultUnit: '%',
          savedAt: MOC_B,
          needsSeries: false,
        },
        {
          id: 'pe-anh',
          formulaId: 'pe',
          name: 'Ảnh hưởng của EPS',
          code: 'ACB',
          inputs: { price: 30000, eps: 2000 },
          resultValue: 15,
          resultUnit: 'lần',
          savedAt: MOC_C,
          needsSeries: false,
        },
      ]),
    );
  });

  /** Ngày lưu của từng dòng theo thứ tự trên màn — mỗi dòng một ngày khác nhau. */
  function thuTu(): string[] {
    return dongDaLuu().map((d) => chuCuaO(d, 3));
  }

  const BIEN = '09/10/2026';
  const ANH = '28/09/2026';
  const DINH = '25/08/2026';

  function nutCot(nhan: string): HTMLElement {
    return within(screen.getByRole('columnheader', { name: nhan })).getByRole('button');
  }

  function cotDangSap(): Array<[string | null, string | null]> {
    return screen
      .getAllByRole('columnheader')
      .filter((th) => th.hasAttribute('aria-sort'))
      .map((th) => [th.textContent, th.getAttribute('aria-sort')]);
  }

  async function moTab(): Promise<void> {
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findAllByRole('columnheader');
  }

  it('ba tiêu đề là nút mang đúng chữ của cột, Kết quả thì không; lúc đầu Ngày lưu đang sắp, mới trước', async () => {
    await moTab();

    expect(
      screen
        .getAllByRole('columnheader')
        .map((th) => within(th).queryByRole('button')?.textContent ?? null),
    ).toEqual(['Công thức', 'Mã', null, 'Ngày lưu']);
    expect(cotDangSap()).toEqual([['Ngày lưu', 'descending']]);
    expect(thuTu()).toEqual([BIEN, ANH, DINH]);
  });

  it('Công thức: thứ tự chữ tiếng Việt, rồi đảo chiều, rồi về mặc định', async () => {
    await moTab();

    await userEvent.click(nutCot('Công thức'));
    expect(thuTu()).toEqual([ANH, BIEN, DINH]);
    expect(cotDangSap()).toEqual([['Công thức', 'ascending']]);

    await userEvent.click(nutCot('Công thức'));
    expect(thuTu()).toEqual([DINH, BIEN, ANH]);
    expect(cotDangSap()).toEqual([['Công thức', 'descending']]);

    await userEvent.click(nutCot('Công thức'));
    expect(thuTu()).toEqual([BIEN, ANH, DINH]);
    expect(cotDangSap()).toEqual([['Ngày lưu', 'descending']]);
  });

  it('Mã: A tới Z rồi Z tới A — dòng không có mã đứng cuối ở cả hai chiều', async () => {
    await moTab();

    await userEvent.click(nutCot('Mã'));
    expect(thuTu()).toEqual([ANH, DINH, BIEN]);
    await userEvent.click(nutCot('Mã'));
    expect(thuTu()).toEqual([DINH, ANH, BIEN]);
  });

  it('Ngày lưu: bấm là cũ trước, bấm nữa là về mới trước; máy nhớ, về mặc định thì gỡ khoá', async () => {
    await moTab();
    await userEvent.click(nutCot('Ngày lưu'));
    expect(thuTu()).toEqual([DINH, ANH, BIEN]);
    expect(cotDangSap()).toEqual([['Ngày lưu', 'ascending']]);
    expect(window.localStorage.getItem(SAVED_SORT_KEY)).toBe('{"key":"savedAt","dir":"asc"}');

    cleanup();
    await moTab();
    await waitFor(() => {
      expect(thuTu()).toEqual([DINH, ANH, BIEN]);
    });

    await userEvent.click(nutCot('Ngày lưu'));
    expect(thuTu()).toEqual([BIEN, ANH, DINH]);
    expect(window.localStorage.getItem(SAVED_SORT_KEY)).toBeNull();
  });

  it('kho hỏng, hay nhớ cột Kết quả (cột không sắp), thì bảng về mặc định, không vỡ màn', async () => {
    window.localStorage.setItem(SAVED_SORT_KEY, '{"key":"result","dir":"asc"}');
    await moTab();
    expect(thuTu()).toEqual([BIEN, ANH, DINH]);
    expect(cotDangSap()).toEqual([['Ngày lưu', 'descending']]);
  });

  it('ô tìm và cách sắp cùng chạy: lọc chỉ bớt dòng, thứ tự vẫn theo cột đang sắp', async () => {
    await moTab();
    await userEvent.click(nutCot('Công thức'));
    await userEvent.click(nutCot('Công thức'));
    expect(thuTu()).toEqual([DINH, BIEN, ANH]);

    // Ô tìm khớp cả tên công thức: "p/e" giữ hai phép tính P/E ("Định", "Ảnh"), bỏ phép tính ROE.
    await userEvent.type(screen.getByRole('searchbox', { name: 'Tìm kiếm' }), 'p/e');
    await waitFor(() => {
      expect(thuTu()).toEqual([DINH, ANH]);
    });
  });

  it('bấm tiêu đề không mở phép tính nào, và cách sắp của bảng Mã không bị đụng', async () => {
    await moTab();
    await userEvent.click(nutCot('Mã'));
    expect(router.push).not.toHaveBeenCalled();
    expect(window.localStorage.getItem(PORTFOLIO_SORT_KEY)).toBeNull();
  });
});

/*
 * ── Hai tab cùng mở Danh mục: không tab nào ghi đè mất dữ liệu của tab kia (16/10/2026) ─────────────
 *
 * Chủ dự án hỏi dữ liệu của khách có mất khi thoát web không. Thoát thì không; HAI TAB thì có — đo trên
 * Chrome thật trước khi sửa: tab khác lưu "Bản C", tab này xoá "Bản A", kho còn mỗi "Bản B". Màn ghi
 * nguyên mảng trong state của nó. Các ca dưới ghi kho từ "tab khác" KHÔNG phát sự kiện ở hai ca đầu —
 * đúng khoảng hở tab này chưa kịp biết — nên chúng gác cú đọc lại TRƯỚC thao tác, còn các ca sau gác
 * đường sự kiện `storage` / quay lại tab.
 */
describe('Danh mục — hai tab cùng mở, không tab nào ghi đè mất dữ liệu của tab kia', () => {
  const banLuu = (id: string, name: string): Record<string, unknown> => ({
    id,
    formulaId: 'pe',
    name,
    inputs: { price: 50_000, eps: 5_000 },
    resultValue: 10,
    resultUnit: 'lần',
    savedAt: new Date(2026, 7, 25, 10, 0, 0).getTime(),
    needsSeries: false,
  });
  const tenTrongKho = (): string[] =>
    (
      JSON.parse(window.localStorage.getItem(SAVED_CALCS_KEY) ?? '[]') as Array<{ name: string }>
    ).map((item) => item.name);
  const maTrongKho = (): string[] =>
    (JSON.parse(window.localStorage.getItem(PORTFOLIO_KEY) ?? '[]') as Array<{ code: string }>).map(
      (item) => item.code,
    );
  /** "Tab khác" ghi thẳng vào kho — tab đang thử không nhận được gì. */
  const tabKhacGhi = (key: string, sua: (list: unknown[]) => unknown[]): string => {
    const raw = JSON.stringify(
      sua(JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown[]),
    );
    window.localStorage.setItem(key, raw);
    return raw;
  };

  it('tab khác lưu thêm một phép tính, tab này xoá một dòng: phép tính của tab kia còn nguyên', async () => {
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([banLuu('pe-a', 'Bản A'), banLuu('pe-b', 'Bản B')]),
    );
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findByRole('link', { name: 'Mở Bản A' });

    tabKhacGhi(SAVED_CALCS_KEY, (list) => [banLuu('pe-c', 'Bản C'), ...list]);
    await userEvent.click(screen.getByRole('button', { name: 'Xoá Bản A' }));

    expect(tenTrongKho()).toEqual(['Bản C', 'Bản B']);
  });

  it('tab khác thêm một mã, tab này xoá một mã: mã của tab kia còn nguyên', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'VNM', quantity: 50, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
      ]),
    );
    render(<PortfolioScreen />);
    const vnm = await dongMa('VNM');

    tabKhacGhi(PORTFOLIO_KEY, (list) => [
      ...list,
      { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
    ]);
    await userEvent.click(within(vnm).getByRole('button', { name: 'Xoá VNM' }));

    await waitFor(() => {
      expect(maTrongKho()).toEqual(['FPT', 'HPG']);
    });
  });

  it('tab khác thêm một mã, tab này thêm một mã khác: kho có cả hai', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await dongMa('FPT');

    tabKhacGhi(PORTFOLIO_KEY, (list) => [
      ...list,
      { code: 'VNM', quantity: 50, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
    ]);
    await chonMaTrongForm('HPG');
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '200');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '25000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    await waitFor(() => {
      expect([...maTrongKho()].sort()).toEqual(['FPT', 'HPG', 'VNM']);
    });
  });

  it('tab khác lưu một phép tính: bảng của tab này hiện nó ngay qua sự kiện storage', async () => {
    window.localStorage.setItem(SAVED_CALCS_KEY, JSON.stringify([banLuu('pe-a', 'Bản A')]));
    render(<PortfolioScreen />);
    await bamTab('Công thức');
    await screen.findByRole('link', { name: 'Mở Bản A' });

    const moi = tabKhacGhi(SAVED_CALCS_KEY, (list) => [banLuu('pe-c', 'Bản C'), ...list]);
    fireEvent(window, new StorageEvent('storage', { key: SAVED_CALCS_KEY, newValue: moi }));

    expect(await screen.findByRole('link', { name: 'Mở Bản C' })).toBeTruthy();
  });

  it('tab khác xoá sạch kho (Cài đặt): bảng tab này trống theo, và KHÔNG ghi mã cũ trở lại', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await dongMa('FPT');

    window.localStorage.clear();
    fireEvent(window, new StorageEvent('storage', { key: null }));

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    });
    expect(maTrongKho()).toEqual([]);
  });

  it('quay lại tab (visibilitychange): đọc lại kho, mã tab kia vừa thêm hiện ra', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await dongMa('FPT');

    tabKhacGhi(PORTFOLIO_KEY, (list) => [
      ...list,
      { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
    ]);
    fireEvent(document, new Event('visibilitychange'));

    expect(await screen.findByRole('button', { name: 'Sửa HPG' })).toBeTruthy();
  });
});

/*
 * Xin trình duyệt giữ kho lâu dài — `requestPersistentStorage()` (16/10/2026). Chỉ lúc người dùng VỪA
 * LƯU, không lúc mở màn: Firefox hỏi người dùng một câu, và câu ấy chỉ có nghĩa ngay sau cú Lưu.
 */
describe('Danh mục — xin giữ kho lâu dài sau cú Lưu', () => {
  let persist: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    persist = vi.fn(() => Promise.resolve(true));
    Object.defineProperty(window.navigator, 'storage', {
      configurable: true,
      value: { persisted: () => Promise.resolve(false), persist },
    });
  });

  afterEach(() => {
    Reflect.deleteProperty(window.navigator, 'storage');
  });

  it('mở màn thì KHÔNG xin; thêm một mã thì xin', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await dongMa('FPT');
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(persist).not.toHaveBeenCalled();

    await chonMaTrongForm('HPG');
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '200');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '25000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    await waitFor(() => {
      expect(persist).toHaveBeenCalledTimes(1);
    });
  });
});
