// @vitest-environment jsdom

import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  LIVE_PRESET_FORMULAS,
  MAX_HOLDINGS,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_CACHE_KEY,
  PRICE_CACHE_TTL_MS,
  SAVED_CALCS_KEY,
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
 * Mở khối chi tiết của một mã.
 *
 * Từ đợt dựng lại theo bản vẽ WF-06, dòng mã là một dòng gọn ba cột (mã · số lượng/giá vốn ·
 * tỷ trọng/lãi lỗ) và cả dòng là một nút mở khối chi tiết. Thị giá, phần trăm lãi/lỗ, ngày mua,
 * beta, tên doanh nghiệp và hai nút Sửa · Bỏ mã đều nằm trong khối ấy — nên mọi ca kiểm chạm tới
 * chúng phải đi qua đây trước.
 */
async function moChiTiet(code = 'FPT'): Promise<void> {
  await userEvent.click(
    await screen.findByRole('button', { name: new RegExp(`^Chi tiết ${code}`) }),
  );
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
 * Neo qua nút phủ của hàng chứ không qua chữ trong ô: nút là thứ DUY NHẤT trên hàng mang tên mã
 * một cách chắc chắn (`aria-label` "Chi tiết FPT"), còn mã trần thì trùng với mọi chỗ khác nhắc
 * tới nó. Hàng MỞ RA là một `<tr>` thứ hai nên không lọt vào đây.
 */
async function dongMa(code = 'FPT'): Promise<HTMLElement> {
  const nut = await screen.findByRole('button', { name: new RegExp(`^Chi tiết ${code}`) });
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
 * Tìm dòng theo MÃ chứ không lấy `getAllByRole('button', { name: 'Chọn' })[0]`: mã đang giữ có
 * nhãn nút khác ("Chọn thêm"), nên khi danh mục đã có FPT thì nút 'Chọn' đầu tiên lại là của HPG
 * — chọn nhầm mã, và mọi khẳng định sau đó sai theo một cách rất khó đoán.
 */
async function chonMaTrongForm(code = 'FPT'): Promise<void> {
  await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
  const sheet = await tamTrenCung();
  const dong = within(sheet)
    .getAllByRole('listitem')
    .find((item) => item.textContent?.startsWith(code) === true);

  await userEvent.click(within(dong as HTMLElement).getByRole('button'));
}

/**
 * Mở sheet chọn công thức — nay là một Ô TRONG FORM, không còn là nút ở dòng mã.
 *
 * Vẫn gieo sẵn FPT vào danh mục trước khi render, dù form thêm mã không cần: sheet in ra tỷ lệ
 * "2/2 ô điền sẵn" của từng công thức, mà tỷ lệ ấy phụ thuộc mã có thị giá hay không. Danh mục
 * rỗng thì màn KHÔNG gọi mạng lần nào (đúng thiết kế, có ca kiểm riêng), nên `quotes` rỗng và
 * mọi dòng sẽ tụt một ô. Gieo trước là cách để sheet thấy đúng ca thường gặp.
 */
async function moSheetCongThuc(): Promise<HTMLElement> {
  seedHolding();
  render(<PortfolioScreen />);
  /*
   * Chờ lượt tra thị giá xong HẲN rồi mới mở form. Thiếu bước này thì `quotes` còn rỗng lúc sheet
   * dựng, `hasPrice` thành false, và danh sách rụng 8 dòng — ca "hiện đủ 31 công thức" đỏ vì một
   * lý do không liên quan gì tới thứ nó đang kiểm. Dòng "Giá phiên" có ở cả hai ca (có giá và
   * `priceVnd: null`), nên nó là mốc chờ dùng được cho mọi ca trong nhóm này.
   */
  await screen.findByText(/giá phiên/);
  await chonMaTrongForm();
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
    await screen.findByText('Nắm giữ');
    expect(feed.snapshots).not.toHaveBeenCalled();
  });

  /*
   * Ô miễn trừ đứng CUỐI MÀN — chủ dự án chốt 15/09/2026: *"nội dung cảnh báo cho xuống cuối
   * trang"*. Trước đó ca này ghim chiều ngược lại (ô đứng trên sáu ô tiền, theo UI-04 mức M).
   *
   * Ghim cả khối Phép tính đã lưu: khối ấy dựng SAU khi kho nạp, nên một ô chèn nhầm vào giữa
   * Nắm giữ và khối ấy sẽ lọt qua nếu ca này chỉ dựng danh mục rỗng. Và vẫn đúng MỘT ô — đây là
   * câu miễn trừ duy nhất của màn, chân trang không dựng dải xám ở `/danh-muc/`.
   */
  it('câu miễn trừ đứng CUỐI MÀN, sau sáu ô tiền, Nắm giữ và Phép tính đã lưu (FR-24)', async () => {
    seedSaved();
    const { container } = render(<PortfolioScreen />);
    const saved = await screen.findByRole('heading', { name: t('portfolio.savedTitle') });

    const notes = screen.getAllByText(t('disclaimer.text'));
    expect(notes).toHaveLength(1);
    const note = notes[0]?.closest('[role="note"]');
    const stats = container.querySelector('[class*="stats"]');
    if (note == null || stats === null) throw new Error('thiếu dải miễn trừ hoặc lưới ô số');

    // compareDocumentPosition thay vì so toạ độ: jsdom không dựng bố cục, nhưng thứ tự trong cây
    // đúng là thứ quyết định cái nào đọc trước trên màn hình và với trình đọc màn hình.
    for (const truoc of [stats, screen.getByText('Nắm giữ'), saved.closest('section')]) {
      if (truoc === null) throw new Error('thiếu khối Phép tính đã lưu');
      expect(note.compareDocumentPosition(truoc) & Node.DOCUMENT_POSITION_PRECEDING).toBeTruthy();
    }
  });

  it('mọi ô nói rõ chưa có mã nào, KHÔNG ô nào hiện 0 (FR-06)', async () => {
    render(<PortfolioScreen />);

    const notes = await screen.findAllByText('Danh mục chưa có mã nào.');
    // Tổng giá trị · Vốn đã bỏ ra · Lãi/lỗ. Beta và XIRR chỉ có ở chế độ Nâng cao (ca ngay
    // dưới), còn ô "Số mã" thì 0 là con số ĐÚNG nên nó không mang câu này.
    expect(notes).toHaveLength(3);
    expect(screen.queryByText(/^0\s*₫$/)).toBeNull();
  });

  it('chế độ Nâng cao: hai ô nâng cao cũng nói rõ chưa có mã nào (FR-06)', async () => {
    await moManNangCao();

    // Ba ô của chế độ Cơ bản, cộng Beta và XIRR.
    expect(screen.getAllByText('Danh mục chưa có mã nào.')).toHaveLength(5);
    expect(screen.queryByText(/^0\s*₫$/)).toBeNull();
  });

  it('danh mục rỗng thì không có dòng trạng thái thị giá lẫn nút làm mới', async () => {
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
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

    await userEvent.click(screen.getByRole('button', { name: /Thêm mã/ }));
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '5');

    expect(feed.snapshots).toHaveBeenCalledTimes(1);
  });
});

describe('WF-06 — chọn mã trong toàn thị trường', () => {
  it('ô chọn mã mở sheet và nhận mã đã chọn', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
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

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));

    const sheet = await tamTrenCung();
    await userEvent.type(within(sheet).getByRole('searchbox'), 'vc');

    // 'VCB' khớp đầu mã; 'HPG' chỉ khớp trong TÊN ('Vận' → 'van' không chứa 'vc') nên bị loại.
    const badges = within(sheet)
      .getAllByRole('listitem')
      .map((item) => item.textContent ?? '');
    expect(badges).toHaveLength(1);
    expect(badges[0]).toContain('VCB');
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
     * thức `/^(Thêm|Cộng thêm).*công thức$/` trần bắt được CẢ ô ấy lẫn nút gửi form. Hai nhãn gần
     * nhau là cố ý — cả hai đều nói về công thức — nên chỗ phân biệt phải là lời hứa riêng của
     * nút gửi: nó mở trang công thức ra, còn ô kia chỉ chọn.
     */
    const nutLuu = screen.getByRole('button', { name: /^(Thêm|Cộng thêm).* và mở công thức$/ });

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(nutLuu);

    /*
     * `?ma=FPT` là thứ FormulaDetail đọc để tự nạp số liệu của mã.
     *
     * Điều hướng bằng `router.push` chứ không bằng `<Link>`: mã phải được LƯU trước đã, và lệnh
     * mở nằm trong một effect khai sau effect ghi localStorage — xem docblock ở `pendingOpen`.
     */
    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/cong-thuc/pe/?ma=FPT');
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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

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
    // FPT đã có sẵn trong danh mục nên nhãn là bản "cộng dồn", không phải "Thêm vào danh mục".
    expect(screen.getByRole('button', { name: 'Cộng thêm vào mã đã có' })).toBeTruthy();
  });

  /*
   * Nhãn nút phải nói đúng CẢ HAI việc nó sắp làm.
   *
   * Chọn một mã đang giữ là cộng dồn, không phải thêm dòng mới — đó là lý do `portfolio.formMerge`
   * ra đời. Bản đầu của nhánh có công thức đã lặng lẽ dựng lại đúng lỗi ấy: ba tầng toán tử ba
   * ngôi lồng nhau để lọt tổ hợp "cộng dồn + mở công thức" và nhãn ra "Thêm và mở công thức".
   */
  it('cộng dồn mà có chọn công thức: nhãn nút nói cả hai việc, không hứa một dòng mới', async () => {
    const sheet = await moSheetCongThuc();
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E — hệ số/ }));

    expect(screen.getByRole('button', { name: 'Cộng thêm và mở công thức' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Thêm và mở công thức' })).toBeNull();
  });

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
     * Lọc bằng chính `scoreFormula` + `tokenize` của ô tìm toàn cục, nên gõ KHÔNG DẤU vẫn ra
     * đúng: "co tuc" khớp "cổ tức". Viết một bản so chuỗi riêng cho sheet sẽ làm ca này đỏ.
     *
     * Không khẳng định "mọi kết quả đều có chữ cổ tức trong TÊN": `scoreFormula` tra cả mô tả và
     * `tags`, nên các mô hình chiết khấu cổ tức (Gordon, DDM) cũng khớp — đúng như ở màn Tìm kiếm.
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
    const sheet = await moSheetCongThuc();

    expect(within(sheet).getByText(/Chưa tra được thị giá của mã này/)).toBeTruthy();
    // 34 − 6 công thức chỉ điền được đúng ô thị giá.
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(LIVE_PRESET_FORMULAS.length - 6);
    // `bien-an-toan` chỉ điền được mỗi thị giá → phải biến mất hẳn.
    expect(within(sheet).queryByRole('button', { name: /[Bb]iên an toàn/ })).toBeNull();
  });

  it('mã thiếu thị giá: P/E hạ từ 2/2 xuống 1/2 ô, không hứa quá', async () => {
    feed.snapshots.mockResolvedValue(new Map([['FPT', { ...FPT_SNAPSHOT, priceVnd: null }]]));
    const sheet = await moSheetCongThuc();

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

    await moChiTiet();
    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));

    expect((screen.getByLabelText('Số cổ phiếu nắm giữ') as HTMLInputElement).value).toBe('100');
    expect((screen.getByLabelText('Giá vốn một cổ phiếu (₫)') as HTMLInputElement).value).toBe(
      '60.000',
    );
    expect((screen.getByLabelText('Ngày mua') as HTMLInputElement).value).toBe('2026-01-02');
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

    await moChiTiet();
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

    await moChiTiet();
    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));

    expect(
      (screen.getByRole('button', { name: 'Mã cổ phiếu' }) as HTMLButtonElement).disabled,
    ).toBe(true);
  });

  /*
   * Lời khuyên của cảnh báo beta là "bấm vào mã còn thiếu để sửa và nhập beta". Ca này kiểm rằng
   * đường đi ấy có thật — trước gói này câu đó chỉ tới một chức năng không tồn tại.
   */
  it('nhập được beta qua form sửa, đúng như cảnh báo beta chỉ dẫn', async () => {
    seedHolding();
    // Cả cảnh báo beta lẫn ô nhập beta đều thuộc chế độ Nâng cao — FR-09.
    await moManNangCao();

    expect(await screen.findByText(/Chưa có beta của FPT/)).toBeTruthy();

    await moChiTiet();
    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));
    await userEvent.type(screen.getByLabelText('Beta'), '1,1');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      expect(screen.queryByText(/Chưa có beta của FPT/)).toBeNull();
    });

    /*
     * Beta đã nhập phải HIỆN RA — nhãn và giá trị là hai thẻ rời trong lưới số liệu của HÀNG MỞ
     * RA, tức `<tr>` ngay sau hàng của mã. Không tra trong `dongMa()`: từ 22/09/2026 khối chi
     * tiết là một hàng riêng, không còn nằm lồng trong hàng gọn.
     *
     * Không bấm mở lại: hàng vẫn đang mở từ lúc bấm Sửa, nên một cú bấm nữa là ĐÓNG nó.
     */
    const chiTiet = (await dongMa()).nextElementSibling as HTMLElement;
    expect(within(chiTiet).getByText('beta')).toBeTruthy();
    expect(chiTiet.textContent).toContain('1,1');
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
   * Sáu nhãn ô của màn. Đếm bằng nhãn chứ không đếm phần tử: mọi ô đều đặt `showEyebrow={false}`
   * nên không có chữ "CHỈ SỐ" chung để bám, còn class thì đã bị CSS Modules băm.
   */
  const NHAN_O = [
    'Tổng giá trị',
    'Vốn đã bỏ ra',
    'Lãi/lỗ',
    'Beta danh mục',
    'XIRR toàn DM',
    'Số mã',
  ] as const;

  function demO(): number {
    return NHAN_O.filter((nhan) => screen.queryByText(nhan) !== null).length;
  }

  it('Cơ bản dựng 4 ô, Nâng cao dựng 6 — hiệu số đúng bằng số ô nói là đang ẩn', async () => {
    render(<PortfolioScreen />);
    await screen.findByText('Nắm giữ');

    const coBan = demO();
    expect(coBan).toBe(4);
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
    await screen.findByText('Nắm giữ');

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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

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
    await moChiTiet();
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
 * bấm được. Ba ca dưới đây khoá cả hai.
 */
describe('WF-06 — thêm lại mã đang giữ thì phải nói rõ là cộng dồn', () => {
  async function chonLaiFPT(): Promise<void> {
    seedHolding();
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getAllByRole('button', { name: /Chọn|Cộng thêm/ })[0]!);
  }

  it('không tạo dòng thứ hai — cộng dồn vào dòng cũ', async () => {
    await chonLaiFPT();
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '50');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Cộng thêm vào mã đã có' }));

    /*
     * Đếm HÀNG MÃ, không đếm `<tr>`: bảng còn một hàng tiêu đề, và một hàng mở ra nữa nếu người
     * dùng đã bấm vào mã. Nút phủ "Chi tiết <mã>" có đúng một cái trên mỗi mã, nên nó là thứ đếm
     * đúng số mã đang giữ.
     */
    expect(screen.getAllByRole('button', { name: /^Chi tiết / })).toHaveLength(1);
    // 100 + 50 = 150 CP, giá vốn bình quân vẫn 60.000 ₫.
    expect((await dongMa()).textContent).toContain('150');
  });

  it('form nói trước là sẽ cộng dồn, và nhãn nút đổi theo', async () => {
    await chonLaiFPT();

    expect(screen.getByText(/sẽ cộng dồn số lượng/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Cộng thêm vào mã đã có' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Thêm vào danh mục' })).toBeNull();
  });

  it('sheet chọn mã đánh dấu mã đang giữ ngay trên dòng', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();

    const items = within(sheet).getAllByRole('listitem');
    // FPT đang giữ → có nhãn "đã có"; HPG chưa giữ → không.
    expect(items[0]?.textContent).toContain('đã có');
    expect(items[1]?.textContent).not.toContain('đã có');
  });

  /*
   * Dòng mã phải có tín hiệu nhìn thấy được là bấm được, không chỉ đổi màu lúc rê chuột: màn này
   * thiết kế cho 360px, mà điện thoại không có trạng thái rê chuột. Chủ dự án không tìm ra nút
   * Sửa của bản trước vì đúng lý do đó, và bản dựng theo bản vẽ WF-06 thừa hưởng nguyên bài học
   * ấy — chỉ đổi ký hiệu, từ dấu bút chì sang mũi tên của khối mở ra.
   */
  it('dòng mã mang mũi tên, và trình đọc màn hình không đọc ký hiệu ấy', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const dong = await dongMa();
    const dau = dong.querySelector('[aria-hidden="true"] svg');

    expect(dau).toBeTruthy();
    // `aria-hidden` là thứ giữ mũi tên khỏi bản đọc; tên nút phủ đã nói "Chi tiết FPT".
    expect(dau?.closest('[aria-hidden="true"]')?.textContent).toBe('');
  });

  /*
   * Nút phủ lên dòng phải nói ĐÚNG việc nó làm.
   *
   * Bản trước cả dòng là nút Sửa, nên bấm vào dòng là nhảy thẳng vào form. Nay dòng mở khối chi
   * tiết, và Sửa là một nút trong khối ấy — tên nút phải đi theo, nếu không người dùng bàn phím
   * nghe "Sửa FPT" rồi nhận được một khối số.
   */
  it('cả dòng là một nút mở khối chi tiết, và nói rõ trạng thái đóng/mở', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const nut = await screen.findByRole('button', { name: 'Chi tiết FPT' });
    expect(nut.getAttribute('aria-expanded')).toBe('false');

    await userEvent.click(nut);
    expect(nut.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button', { name: 'Sửa FPT' })).toBeTruthy();

    // Bấm lần nữa thì đóng lại — và ba nút hành động biến mất cùng khối.
    await userEvent.click(nut);
    expect(nut.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
  });

  /*
   * Chỉ MỘT khối chi tiết được mở tại một thời điểm.
   *
   * Mỗi khối cao gần ba dòng gọn, nên hai khối cùng mở đẩy mã dưới xuống khuất và khối số nổi
   * lên giữa màn không còn rõ thuộc về mã nào. Ghim cả hai vế — mã mới mở RA và mã cũ đóng LẠI —
   * vì chỉ ghim vế đầu thì ca kiểm vẫn xanh với bản `Set` cũ.
   */
  it('mở khối chi tiết của mã khác thì khối đang mở tự đóng', async () => {
    window.localStorage.setItem(
      PORTFOLIO_KEY,
      JSON.stringify([
        { code: 'FPT', quantity: 100, costPrice: 60_000, buyDate: '2026-01-02', beta: null },
        { code: 'HPG', quantity: 200, costPrice: 25_000, buyDate: '2026-01-03', beta: null },
      ]),
    );
    render(<PortfolioScreen />);

    const fpt = await screen.findByRole('button', { name: 'Chi tiết FPT' });
    const hpg = await screen.findByRole('button', { name: 'Chi tiết HPG' });

    await userEvent.click(fpt);
    expect(fpt.getAttribute('aria-expanded')).toBe('true');

    await userEvent.click(hpg);
    expect(hpg.getAttribute('aria-expanded')).toBe('true');
    expect(fpt.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('button', { name: 'Sửa FPT' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sửa HPG' })).toBeTruthy();
  });
});

describe('WF-06 — form không được hỏng trong im lặng', () => {
  async function moForm(): Promise<void> {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
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
    expect(
      screen.getByText('Chưa có mã nào. Thêm mã đầu tiên để xem tổng giá trị và tỷ trọng.'),
    ).toBeTruthy();
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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

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
   * Hàng mã mang SÁU con số kể từ 22/09/2026: số lượng, giá vốn, thị giá, giá trị, lãi/lỗ (cả
   * tiền lẫn phần trăm) và tỷ trọng. Trước đợt này thị giá và phần trăm lãi/lỗ nằm trong khối mở
   * ra; ảnh thiết kế chủ dự án đưa kéo chúng lên hàng, và ca này khoá đúng danh sách ấy để không
   * ai lặng lẽ bỏ bớt một vế nào.
   */
  it('hàng mã mang số lượng, giá vốn, thị giá, giá trị, lãi/lỗ kèm dấu và tỷ trọng', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await dongMa();

    await waitFor(() => {
      // 100 CP × 71.400 ₫ = 7.140.000 ₫, tức toàn bộ danh mục → tỷ trọng 100%.
      expect(row.textContent).toContain('100%');
    });
    expect(row.textContent).toContain('100 CP');
    expect(row.textContent).toContain('60.000');
    expect(row.textContent).toContain('71.400');
    expect(row.textContent).toContain('7.140.000');
    // Dấu + mang tin chứ không chỉ có màu — NFR-USA-06. Hai vế của lãi/lỗ đứng cùng một ô.
    expect(row.textContent).toContain('+1.140.000');
    expect(row.textContent).toContain('+19');
  });

  /*
   * Hàng mở ra nay CHỈ còn ngày mua và beta — hai thứ không có cột nào trên bảng. Ca này khoá cả
   * chiều ngược lại: thị giá và phần trăm lãi/lỗ KHÔNG được in lại ở đây, vì in hai lần là dựng
   * hai nguồn sự thật cho cùng một con số.
   */
  it('hàng mở ra mang ngày mua, và KHÔNG lặp lại thị giá', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet();

    const chiTiet = (await dongMa()).nextElementSibling as HTMLElement;

    expect(chiTiet.textContent).toContain('02/01/2026');
    expect(chiTiet.textContent).not.toContain('71.400');
    expect(chiTiet.textContent).not.toContain('+19');
  });

  /*
   * Nút bấm của dòng là một nút PHỦ trống rỗng, không phải một nút bọc quanh nội dung.
   *
   * `aria-label` nuốt toàn bộ nội dung bên trong nút với trình đọc màn hình, nên bọc cả dòng vào
   * nút là làm số lượng, giá vốn, tỷ trọng và lãi/lỗ biến mất khỏi bản đọc. Ai đổi nút phủ thành
   * nút bọc sẽ làm ca này đỏ.
   */
  it('khối số nằm NGOÀI nút bấm của dòng, để trình đọc màn hình không bị nuốt mất', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const nut = await screen.findByRole('button', { name: 'Chi tiết FPT' });

    expect(nut.textContent).toBe('');

    // Nhưng các con số vẫn có mặt trong hàng, ngoài nút.
    const row = await dongMa();
    expect(row.textContent).toContain('FPT');
    expect(row.textContent).toContain('100 CP');
    expect(row.textContent).toContain('giá vốn');
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
   * Chủ dự án báo khối số trong thẻ "khó hình dung": bản trước ghép tất cả thành một câu nối bằng
   * dấu chấm, cùng cỡ chữ nhỏ nhất và cùng màu xám, nên nhãn lẫn giá trị trông y hệt nhau. Nay
   * mỗi mẩu có nhãn riêng, và từ 22/09/2026 nhãn ấy là TIÊU ĐỀ CỘT thật.
   *
   * Ca này khoá cả ba lối đặt tên đang cùng tồn tại, vì chúng phục vụ hai khổ màn khác nhau trên
   * cùng một cây DOM:
   *   - tiêu đề cột (`columnheader`) — thứ người dùng PC đọc;
   *   - nhãn đi liền con số ('giá vốn 60.000 ₫') — thứ người dùng điện thoại đọc, khi hàng tiêu
   *     đề đang `display: none`;
   *   - `<dt>` trong hàng mở ra, cho hai số không có cột nào.
   */
  it('mỗi số liệu có nhãn riêng, không còn là một câu nối bằng dấu chấm', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet();

    // Tám cột số liệu đều có tiêu đề thật, đúng thứ tự trong ảnh thiết kế.
    const tieuDe = screen.getAllByRole('columnheader').map((th) => th.textContent);
    expect(tieuDe).toEqual([
      'Mã',
      'Doanh nghiệp',
      'Số lượng',
      'Giá vốn',
      'Thị giá',
      'Giá trị',
      'Lãi/lỗ',
      'Tỷ trọng',
      '',
    ]);

    const row = await dongMa();
    const chiTiet = row.nextElementSibling as HTMLElement;

    /*
     * Hàng mở ra phải trải ĐÚNG bấy nhiêu cột. Đếm hụt thì trình duyệt độn một ô trống vào cuối
     * bảng, đếm dư thì bảng rộng hơn chính nó — cả hai đều là lỗi lặng, nên hằng số `HOLD_COLUMNS`
     * trong `PortfolioScreen.tsx` phải khớp số `<th>` thật.
     */
    expect(within(chiTiet).getByRole('cell').getAttribute('colspan')).toBe(String(tieuDe.length));

    // Hàng mở ra: nhãn là một thẻ <dt> riêng, tra khớp đúng chuỗi.
    expect(within(chiTiet).getByText('Ngày mua')).toBeTruthy();

    /*
     * Trên hàng, ở khổ dòng gọn, "giá vốn 60.000 ₫" là MỘT mẩu chữ chứ không phải nhãn rời —
     * đúng bản vẽ WF-06, và đúng chỗ nó cần đứng, ngay dưới số lượng.
     */
    expect(within(row).getByText(/^giá vốn/)).toBeTruthy();
    expect(within(row).getByText('tỷ trọng')).toBeTruthy();
  });

  /*
   * Hai nút cuối khối chi tiết từng là ký tự `ƒ` và `×` trần trên nền trong suốt — chủ dự án báo
   * là nhìn không biết bấm được. Nay là nút thật, có chữ đọc được chứ không phải một ký hiệu.
   *
   * Từng có nút thứ ba, "Tính công thức", và nó đã bỏ ở đợt gộp luồng thêm mã: chọn công thức nay
   * là một ô TRONG FORM. Ca này khoá luôn việc nó không quay lại — hai lối cho cùng một việc là
   * đúng thứ đợt ấy dọn đi.
   */
  it('hai nút cuối khối chi tiết mang chữ, không phải ký tự trần', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet();

    const sua = screen.getByRole('button', { name: 'Sửa FPT' });
    const boMa = screen.getByRole('button', { name: 'Bỏ mã FPT' });

    expect(sua.textContent).toBe('Sửa');
    expect(boMa.textContent).toBe('Bỏ mã');
    expect(sua.textContent).not.toBe('ƒ');
    expect(screen.queryByRole('button', { name: 'Thêm công thức FPT' })).toBeNull();
  });

  /*
   * Mã đã nằm sẵn trong danh mục vẫn tính được công thức — điều kiện để nút "Tính công thức" ở
   * dòng mã được phép bỏ đi. Đường đi là Sửa → chọn công thức → "Lưu và mở công thức".
   */
  it('mã đã có vẫn mở được công thức, qua form Sửa', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet();
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
   * ── Tỷ trọng phải nói rõ MẪU SỐ ──────────────────────────────────────────────────────────
   *
   * Chủ dự án đọc cột ấy và báo "chưa hiểu tác dụng" (22/09/2026). "6%" đứng trần thì mẫu số có
   * hai lựa chọn hợp lý — giá trị thị trường và vốn đã bỏ ra — mà cột chỉ rộng 10% bề ngang,
   * không chở nổi một mệnh đề. Nên câu giải nghĩa đứng cuối khối.
   */
  it('cuối khối có câu nói rõ tỷ trọng tính trên cái gì', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const cau = await screen.findByText(/Tỷ trọng là phần giá trị/);
    expect(cau.textContent).toContain('tổng giá trị danh mục');
    // Vế phân biệt với mẫu số kia — thiếu nó thì câu vẫn mơ hồ đúng chỗ nó đi giải quyết.
    expect(cau.textContent).toContain('không theo vốn đã bỏ ra');
  });

  /*
   * `total` cộng bằng `row.value ?? 0`, nên một mã chưa tra được giá bị coi như 0 và rơi khỏi
   * mẫu số — tỷ trọng các mã còn lại cộng đủ 100% trong khi danh mục thì chưa đủ. Im lặng ở đây
   * đúng là loại "số sai mà trông có lý" mà FR-06 dựng ra để chặn.
   */
  it('thiếu giá một mã thì câu ấy nói thêm là mẫu số đang hụt', async () => {
    feed.snapshots.mockResolvedValue(new Map());
    seedHolding();
    render(<PortfolioScreen />);

    await waitFor(async () => {
      expect((await screen.findByText(/Tỷ trọng là phần giá trị/)).textContent).toContain(
        'đang tính trên phần danh mục đã có giá',
      );
    });
  });

  it('đủ giá thì KHÔNG nói câu mẫu số hụt — nó chỉ đúng khi thật sự hụt', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await screen.findByText(/Tỷ trọng là phần giá trị/);
    await waitFor(() => {
      expect(screen.queryByText(/đang tính trên phần danh mục đã có giá/)).toBeNull();
    });
  });

  /*
   * Tên doanh nghiệp LÊN hàng từ 22/09/2026, đảo lại quyết định cũ ("xuống khối chi tiết vì cột
   * mã trên dòng gọn chỉ rộng ba đến bốn ký tự") — bảng có hẳn một cột cho nó.
   *
   * Nó vẫn phải có mặt ở HAI chỗ: trong tên khả truy cập của nút phủ (để người dùng bàn phím
   * biết mình đang ở hàng nào), và thành chữ đọc được ở cột DOANH NGHIỆP. Vế thứ hai của ca này
   * khoá chiều ngược lại — KHÔNG in nó lần nữa trong hàng mở ra.
   */
  it('tên doanh nghiệp chọn ở sheet được giữ lại, ở tên nút và ở cột Doanh nghiệp', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await tamTrenCung();
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Chi tiết FPT FPT Corp' }));

    const row = await dongMa();
    expect(within(row).getByText('FPT Corp')).toBeTruthy();
    // Không lặp lại trong hàng mở ra — một cái tên, một chỗ.
    expect((row.nextElementSibling as HTMLElement).textContent).not.toContain('FPT Corp');
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

    await screen.findByText('Nắm giữ');

    expect(screen.queryByText('CỤC BỘ')).toBeNull();
    expect(screen.queryByText(/chỉ lưu trên thiết bị này/i)).toBeNull();
  });

  it('số lượng và giá vốn không xuất hiện trong bất kỳ request nào', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');

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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

    expect(screen.getByLabelText('Beta')).not.toBeNull();
    expect(screen.queryByLabelText(/để trống nếu chưa biết/)).toBeNull();
    expect(screen.getByText(/Beta đo mức mã này nhảy mạnh hay yếu hơn VN-Index/)).not.toBeNull();
  });

  it('form thêm mã không còn dòng nói về nguồn thị giá', async () => {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

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

    await moChiTiet();
    await userEvent.click(await screen.findByRole('button', { name: 'Sửa FPT' }));

    expect(screen.queryByText(/Muốn đổi mã thì bỏ rồi thêm lại/)).toBeNull();

    const nutMa = screen.getByRole('button', { name: t('portfolio.formCode') });
    expect(nutMa.hasAttribute('disabled')).toBe(true);
  });
});

/*
 * ── Khối "Phép tính đã lưu": phép tính cất từ màn chi tiết ─────────────────────────────────
 *
 * Từng là tab "Công thức", bị gỡ cùng cụm tab (14/09/2026) rồi quay lại thành khối thứ hai của màn
 * (15/09/2026) — vì nút Lưu ở màn chi tiết vẫn ghi vào kho mà không còn chỗ nào bày kho ra.
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

describe('WF-06 — phép tính đã lưu là khối thứ hai của màn', () => {
  /*
   * Khối nằm thường trực dưới danh mục của MỌI người. Một ô rỗng thường trực kèm câu hướng dẫn là
   * đúng thứ chủ dự án gỡ khi bỏ tabbar — nên chưa lưu gì thì không có khối nào cả.
   */
  it('chưa lưu phép tính nào thì không dựng khối', async () => {
    render(<PortfolioScreen />);

    // Chờ effect đọc localStorage chạy xong, không thì ca này luôn xanh.
    await screen.findByText('Nắm giữ');
    expect(screen.queryByRole('heading', { name: t('portfolio.savedTitle') })).toBeNull();
  });

  /*
   * Đây là vế "thấy lại được" của lỗi chủ dự án báo 15/09/2026. Trước bản vá, kho có mục mà màn
   * không có một chữ nào về nó.
   */
  it('có phép tính đã lưu thì bày tên, ngày lưu, và "Xem" mở lại đúng bản lưu', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    const tieuDe = await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
    const khoi = tieuDe.closest('section') as HTMLElement;

    expect(within(khoi).getByText('HPG · P/E')).not.toBeNull();
    /*
     * Dòng phụ bỏ mảnh nào đã nằm trong tên: "HPG" có trong "HPG · P/E" nên rụng, còn tên đầy đủ
     * của công thức thì không nên ở lại. Ngày lưu thì LUÔN ở cuối — chỗ duy nhất nói con số thuộc
     * mốc nào.
     */
    const dongPhu = within(khoi).getByText(/lưu 25\/08\/2026$/);
    expect(dongPhu.textContent?.startsWith('HPG')).toBe(false);
    /*
     * `next/link` dựng ngoài router thật bỏ dấu '/' trước `?` — hành vi của môi trường test, không
     * phải của trang thật (xem `HeaderNav.test.tsx`), nên so khớp cho phép có hoặc không.
     */
    expect(within(khoi).getByRole('link', { name: 'Xem' }).getAttribute('href')).toMatch(
      /^\/cong-thuc\/pe\/?\?luu=pe-1756000000000$/,
    );
  });

  it('bấm Xoá thì gỡ khỏi kho, và hết mục thì khối biến mất', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Xoá HPG · P/E' }));

    expect(JSON.parse(window.localStorage.getItem(SAVED_CALCS_KEY) ?? 'null')).toEqual([]);
    expect(screen.queryByRole('heading', { name: t('portfolio.savedTitle') })).toBeNull();
  });

  /*
   * Đích của nút Lưu ở màn chi tiết là `/danh-muc/#phep-tinh-da-luu`. Không trông vào việc trình
   * duyệt tự nhảy tới neo: khối chỉ dựng SAU khi kho nạp trong effect, và danh sách Nắm giữ phía
   * trên nạp cùng lượt ấy đẩy khối xuống thêm. Ca này ghim rằng màn tự cuộn, và cuộn đúng khối.
   */
  it('vào bằng neo của khối thì cuộn tới đúng khối ấy, sau khi kho đã nạp', async () => {
    const bay = bayScrollIntoView();
    try {
      seedHolding();
      seedSaved();
      window.history.replaceState(null, '', '/danh-muc/#phep-tinh-da-luu');
      render(<PortfolioScreen />);

      const tieuDe = await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
      await waitFor(() => {
        expect(bay.goi).toHaveBeenCalledTimes(1);
      });

      expect(bay.goi.mock.contexts[0]).toBe(tieuDe.closest('section'));
      expect(bay.goi.mock.calls[0]?.[0]).toMatchObject({ block: 'start' });
    } finally {
      bay.go();
    }
  });

  /*
   * Cuộn một lần là không đủ — đo trên Chrome thật: thị giá về SAU lượt cuộn, mỗi dòng Nắm giữ cao
   * thêm một hàng và đẩy khối xuống tận đáy màn. Màn giữ neo bằng `ResizeObserver` cho tới khi bố
   * cục ổn định. Nhưng điều kiện dừng mới là thứ quyết định việc giữ neo có được phép hay không:
   * người dùng đã tự cuộn đi mà màn còn kéo họ về là một lỗi tệ hơn lỗi đang chữa.
   *
   * jsdom không có `ResizeObserver` nên dựng bản giả nắm lấy callback, rồi tự bắn nó.
   */
  it('khung màn đổi cỡ thì canh lại khối, nhưng người dùng tự thao tác là thôi ngay', async () => {
    const bay = bayScrollIntoView();
    const cu = globalThis.ResizeObserver;
    let bao: (() => void) | null = null;
    const ngat = vi.fn();
    globalThis.ResizeObserver = class {
      constructor(callback: () => void) {
        bao = callback;
      }
      observe(): void {}
      unobserve(): void {}
      disconnect(): void {
        ngat();
      }
    } as unknown as typeof ResizeObserver;

    try {
      seedHolding();
      seedSaved();
      window.history.replaceState(null, '', '/danh-muc/#phep-tinh-da-luu');
      render(<PortfolioScreen />);

      await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
      await waitFor(() => {
        expect(bay.goi).toHaveBeenCalled();
      });
      expect(bao).not.toBeNull();

      // Thị giá về, khung màn cao thêm → canh lại.
      const truoc = bay.goi.mock.calls.length;
      (bao as unknown as () => void)();
      expect(bay.goi).toHaveBeenCalledTimes(truoc + 1);

      // Người dùng lăn chuột → thôi giữ neo, và bộ quan sát được tháo hẳn.
      window.dispatchEvent(new Event('wheel'));
      expect(ngat).toHaveBeenCalled();
    } finally {
      globalThis.ResizeObserver = cu;
      bay.go();
    }
  });

  it('không có neo thì KHÔNG cuộn — mở tab Danh mục thường vẫn đứng ở đầu màn', async () => {
    const bay = bayScrollIntoView();
    try {
      seedSaved();
      render(<PortfolioScreen />);

      await screen.findByRole('heading', { name: t('portfolio.savedTitle') });
      // Qua hẳn một nhịp khung hình — lượt cuộn (nếu có) được hẹn bằng requestAnimationFrame.
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(bay.goi).not.toHaveBeenCalled();
    } finally {
      bay.go();
    }
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
      await moChiTiet('FPT');

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

  it('bấm "Thêm mã" mở cùng một hộp thoại, tiêu đề nói là thêm chứ không phải sửa', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã/ }));

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
    await screen.findByText(/giá phiên/);

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
