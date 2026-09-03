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
  await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
  const sheet = await screen.findByRole('dialog');
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
  await screen.findByText(/Giá phiên/);
  await chonMaTrongForm();
  await userEvent.click(screen.getByRole('button', { name: 'Tính công thức' }));
  return screen.findByRole('dialog');
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
   * UI-04 (mức M) đòi câu miễn trừ nằm trong TẦM NHÌN ĐẦU TIÊN của trang có kết quả. Màn này bày
   * sáu ô tiền ngay đầu màn — trong đó có lãi/lỗ của chính người dùng, con số dễ bị đọc thành lời
   * khuyên nhất trong cả sản phẩm (rủi ro R-06 của SRS). Trước đợt này câu miễn trừ duy nhất ở đây
   * là dải chân trang của AppShell, nằm sau cả danh sách nắm giữ.
   */
  it('câu miễn trừ đứng TRƯỚC lưới sáu ô tiền, không đợi cuộn hết màn (UI-04)', async () => {
    const { container } = render(<PortfolioScreen />);
    await screen.findByText('Nắm giữ');

    const note = container.querySelector('[role="note"]');
    const stats = container.querySelector('[class*="stats"]');
    if (note === null || stats === null) throw new Error('thiếu dải miễn trừ hoặc lưới ô số');

    // compareDocumentPosition thay vì so toạ độ: jsdom không dựng bố cục, nhưng thứ tự trong cây
    // đúng là thứ quyết định cái nào đọc trước trên màn hình và với trình đọc màn hình.
    expect(note.compareDocumentPosition(stats) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
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

    // 100 CP × 71.400 ₫ = 7.140.000 ₫
    await screen.findByText(/7\.140\.000/);
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

    await screen.findByText(/7\.140\.000/);
  });

  it('sửa số lượng KHÔNG gọi lại nguồn — chỉ danh sách mã mới kích hoạt', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await waitFor(() => {
      expect(feed.snapshots).toHaveBeenCalledTimes(1);
    });

    await userEvent.click(screen.getByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '5');

    expect(feed.snapshots).toHaveBeenCalledTimes(1);
  });
});

describe('WF-06 — chọn mã trong toàn thị trường', () => {
  it('ô chọn mã mở sheet và nhận mã đã chọn', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));

    // Danh sách mã chỉ được tải khi sheet thật sự mở.
    await waitFor(() => {
      expect(feed.listTickers).toHaveBeenCalledTimes(1);
    });

    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    expect(screen.getByRole('button', { name: 'Mã cổ phiếu' }).textContent).toContain('FPT');
  });

  it('lọc theo mã, và mã khớp đầu chuỗi đứng trước', async () => {
    feed.listTickers.mockResolvedValue([
      { code: 'VCB', name: 'Vietcombank' },
      { code: 'HPG', name: 'Vận tải Hoà Phát' },
    ]);
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));

    const sheet = await screen.findByRole('dialog');
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
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E/ }));

    // Nhãn nút phải nói ra việc nó sắp làm, không còn là "Thêm vào danh mục" trơn.
    expect(screen.queryByRole('button', { name: 'Thêm vào danh mục' })).toBeNull();
    const nutLuu = screen.getByRole('button', { name: /^(Thêm|Cộng thêm).*công thức$/ });

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

    await screen.findByRole('listitem');
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
  it('chưa chọn mã: ô công thức nói cần mã, và bấm vào thì mở sheet chọn mã', async () => {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));

    const o = screen.getByRole('button', { name: 'Tính công thức' }) as HTMLButtonElement;

    // Không khoá: một nút hứa một việc rồi im lặng là hỏng, dù câu gợi ý bên dưới có nói lý do.
    expect(o.disabled).toBe(false);
    expect(o.textContent).toBe('Chọn mã cổ phiếu trước');
    expect(screen.getByText(/phải có mã rồi mới chọn được/)).toBeTruthy();

    await userEvent.click(o);

    const sheet = await screen.findByRole('dialog');
    expect(within(sheet).getByText('Chọn mã cổ phiếu')).toBeTruthy();
  });

  it('bỏ chọn được công thức đã chọn, và nhãn nút trở lại như cũ', async () => {
    const sheet = await moSheetCongThuc();
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E/ }));

    await userEvent.click(screen.getByRole('button', { name: 'Bỏ chọn công thức' }));

    /*
     * Tra bằng CHỮ chứ không bằng tên nút: ô này lấy tên khả truy cập từ `aria-labelledby` trỏ vào
     * nhãn "Tính công thức", nên tên nút không đổi theo nội dung bên trong — y hệt ô chọn mã.
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
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E/ }));

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
   * hai thứ đó độc lập nhau. Khi đó 15 công thức điền hụt một ô và 8 công thức không điền được ô
   * nào, nên sheet phải nói khác đi thay vì cứ in con số ghim ra.
   */
  it('mã thiếu thị giá: bỏ công thức không điền được ô nào và nói rõ lý do', async () => {
    feed.snapshots.mockResolvedValue(new Map([['FPT', { ...FPT_SNAPSHOT, priceVnd: null }]]));
    const sheet = await moSheetCongThuc();

    expect(within(sheet).getByText(/Chưa tra được thị giá của mã này/)).toBeTruthy();
    // 31 − 8 công thức chỉ điền được đúng ô thị giá.
    expect(within(sheet).getAllByRole('listitem')).toHaveLength(LIVE_PRESET_FORMULAS.length - 8);
    // `bien-an-toan` chỉ điền được mỗi thị giá → phải biến mất hẳn.
    expect(within(sheet).queryByRole('button', { name: /[Bb]iên an toàn/ })).toBeNull();
  });

  it('mã thiếu thị giá: P/E hạ từ 2/2 xuống 1/2 ô, không hứa quá', async () => {
    feed.snapshots.mockResolvedValue(new Map([['FPT', { ...FPT_SNAPSHOT, priceVnd: null }]]));
    const sheet = await moSheetCongThuc();

    expect(within(sheet).getByRole('button', { name: /P\/E/ }).textContent).toContain('1/2');
  });

  it('công thức nâng cao nằm trong nhóm Nâng cao', async () => {
    const sheet = await moSheetCongThuc();

    // `getByRole('region', …)` chỉ tìm thấy khi <section> có tên đọc lên được — nên ca này kiểm
    // luôn cả việc `aria-labelledby` nối đúng vào tiêu đề nhóm.
    const nangCao = within(sheet).getByRole('region', { name: 'Nâng cao' });

    expect(within(nangCao).getByRole('button', { name: /WACC/ })).toBeTruthy();
    // Và công thức cơ bản thì KHÔNG được lọt vào nhóm nâng cao.
    expect(within(nangCao).queryByRole('button', { name: /P\/E/ })).toBeNull();
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
    await screen.findByText(/17\.850\.000/);
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
    await userEvent.type(screen.getByLabelText('Beta (để trống nếu chưa biết)'), '1,1');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    await waitFor(() => {
      expect(screen.queryByText(/Chưa có beta của FPT/)).toBeNull();
    });

    // Beta đã nhập phải HIỆN RA trên thẻ — nhãn và giá trị là hai thẻ rời trong lưới số liệu.
    const row = screen.getByRole('listitem');
    expect(within(row).getByText('beta')).toBeTruthy();
    expect(row.textContent).toContain('1,1');
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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));

    // Ba ô kia vẫn còn — chỉ đúng một ô bị giấu.
    expect(screen.getByLabelText('Số cổ phiếu nắm giữ')).toBeTruthy();
    expect(screen.getByLabelText('Giá vốn một cổ phiếu (₫)')).toBeTruthy();
    expect(screen.queryByLabelText('Beta (để trống nếu chưa biết)')).toBeNull();
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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getAllByRole('button', { name: /Chọn|Cộng thêm/ })[0]!);
  }

  it('không tạo dòng thứ hai — cộng dồn vào dòng cũ', async () => {
    await chonLaiFPT();
    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '50');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Cộng thêm vào mã đã có' }));

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    // 100 + 50 = 150 CP, giá vốn bình quân vẫn 60.000 ₫.
    expect(screen.getByRole('listitem').textContent).toContain('150');
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
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await screen.findByRole('dialog');

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

    const dong = (await screen.findByRole('listitem')).firstElementChild;
    const dau = dong?.querySelector('[aria-hidden="true"] svg');

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
});

describe('WF-06 — form không được hỏng trong im lặng', () => {
  async function moForm(): Promise<void> {
    render(<PortfolioScreen />);
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
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
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '0');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    expect(screen.getByText('Nhập số cổ phiếu nắm giữ, lớn hơn 0.')).toBeTruthy();
    expect(
      screen.getByText('Chưa có mã nào. Thêm mã đầu tiên để xem tổng giá trị và tỷ trọng.'),
    ).toBeTruthy();
  });

  it('beta gõ chữ: nói rõ, không lặng lẽ biến thành “chưa có beta”', async () => {
    // Ô beta chỉ có ở chế độ Nâng cao, nên câu lỗi của nó cũng chỉ có nghĩa ở đó — FR-09.
    await moManNangCao();
    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));

    await userEvent.type(screen.getByLabelText('Beta (để trống nếu chưa biết)'), 'abc');
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
    const sheet = await screen.findByRole('dialog');
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
     * — một ở ô tổng đầu màn, một ở thẻ của mã FPT. Lọc bằng `closest('li')` vì chỉ bản trong
     * thẻ mã mới nằm trong một mục danh sách.
     */
    const lai = screen
      .getAllByText('Lãi/lỗ')
      .find((node) => node.closest('li') === null)?.parentElement;

    expect(lai?.textContent).toContain('1.140.000');
    // Phần trăm là dòng phụ của chính ô ấy, không chiếm thêm một ô thứ bảy.
    expect(lai?.textContent).toContain('19');
  });

  /*
   * Dòng gọn theo bản vẽ WF-06 mang bốn con số: số lượng, giá vốn, tỷ trọng, lãi/lỗ. Thị giá,
   * phần trăm lãi/lỗ, ngày mua và beta xuống khối chi tiết — không mất, chỉ đổi chỗ. Ca này khoá
   * cả hai vế để không ai lặng lẽ bỏ bớt một vế nào.
   */
  it('dòng gọn mang số lượng, giá vốn, tỷ trọng và lãi/lỗ kèm dấu', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await screen.findByRole('listitem');

    await waitFor(() => {
      // 100 CP × 71.400 ₫ = 7.140.000 ₫, tức toàn bộ danh mục → tỷ trọng 100%.
      expect(row.textContent).toContain('100%');
    });
    expect(row.textContent).toContain('100 CP');
    expect(row.textContent).toContain('60.000');
    // Dấu + mang tin chứ không chỉ có màu — NFR-USA-06.
    expect(row.textContent).toContain('+1.140.000');
  });

  it('khối chi tiết mang thị giá, phần trăm lãi/lỗ và ngày mua', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet();

    const row = screen.getByRole('listitem');

    await waitFor(() => {
      expect(row.textContent).toContain('71.400');
    });
    expect(row.textContent).toContain('02/01/2026');
    expect(row.textContent).toContain('+19');
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

    // Nhưng các con số vẫn có mặt trong mục danh sách, ngoài nút.
    const row = screen.getByRole('listitem');
    expect(row.textContent).toContain('FPT');
    expect(row.textContent).toContain('100 CP');
    expect(row.textContent).toContain('giá vốn');
  });

  it('thiếu thị giá: dòng mã nói “chưa có giá”, KHÔNG hiện lãi/lỗ bằng 0', async () => {
    feed.snapshots.mockResolvedValue(new Map());
    seedHolding();
    render(<PortfolioScreen />);

    const row = await screen.findByRole('listitem');
    await waitFor(() => {
      expect(row.textContent).toContain('chưa có giá');
    });
    expect(row.textContent).not.toContain('+0');
  });

  /*
   * Chủ dự án báo khối số trong thẻ "khó hình dung": bản trước ghép tất cả thành một câu nối bằng
   * dấu chấm, cùng cỡ chữ nhỏ nhất và cùng màu xám, nên nhãn lẫn giá trị trông y hệt nhau. Nay
   * mỗi mẩu có nhãn riêng. Ca này khoá việc nhãn thật sự tồn tại thành phần tử — cả nhãn trên
   * dòng gọn lẫn nhãn trong khối chi tiết.
   */
  it('mỗi số liệu có nhãn riêng, không còn là một câu nối bằng dấu chấm', async () => {
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet();

    const row = screen.getByRole('listitem');

    // Trong khối chi tiết: nhãn là một thẻ <dt> riêng, tra khớp đúng chuỗi.
    for (const label of ['Thị giá', 'Lãi/lỗ', 'Ngày mua']) {
      expect(within(row).getByText(label)).toBeTruthy();
    }

    /*
     * Trên dòng gọn thì khác: "giá vốn 60.000 ₫" là MỘT mẩu chữ chứ không phải nhãn rời — đúng
     * bản vẽ WF-06, và đúng chỗ nó cần đứng, ngay dưới số lượng. Nên tra bằng biểu thức.
     */
    expect(within(row).getByText(/^giá vốn /)).toBeTruthy();
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
    expect(screen.queryByRole('button', { name: 'Tính công thức FPT' })).toBeNull();
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

    await userEvent.click(screen.getByRole('button', { name: 'Tính công thức' }));
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getByRole('button', { name: /P\/E/ }));

    await userEvent.click(screen.getByRole('button', { name: 'Lưu và mở công thức' }));

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/cong-thuc/pe/?ma=FPT');
    });
  });

  /*
   * Tên doanh nghiệp xuống khối chi tiết: cột mã trên dòng gọn chỉ rộng đúng ba đến bốn ký tự.
   *
   * Nó vẫn phải có mặt ở HAI chỗ — trong tên khả truy cập của nút phủ (để người dùng bàn phím
   * biết mình đang ở dòng nào mà không phải mở ra), và thành chữ đọc được trong khối chi tiết.
   */
  it('tên doanh nghiệp chọn ở sheet được giữ lại, ở tên nút và trong khối chi tiết', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    await userEvent.click(await screen.findByRole('button', { name: 'Chi tiết FPT FPT Corp' }));

    expect(within(screen.getByRole('listitem')).getByText('FPT Corp')).toBeTruthy();
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

    await screen.findByText(/7\.140\.000/);
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

    await screen.findByText(/7\.140\.000/);
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

describe('WF-06 — lời hứa về dữ liệu riêng tư', () => {
  it('nói rõ chỉ mã rời khỏi máy, số lượng và giá vốn thì không', async () => {
    render(<PortfolioScreen />);

    const note = await screen.findByText(/chỉ lưu trên thiết bị này/i);
    expect(note.textContent).toContain('Chỉ mã cổ phiếu được gửi tới Finbox');
    // Câu cũ hứa "Không gửi lên máy chủ" — nay không còn đúng, không được để sót lại.
    expect(note.textContent).not.toContain('Không gửi lên máy chủ');
  });
});

/*
 * ── Tab "Công thức": phép tính đã lưu từ màn chi tiết ──────────────────────────────────────
 *
 * Tab này cố ý KHÔNG tính lại con số nào — tính lại đòi cả Registry trong gói của `/danh-muc/`,
 * đã đo một lần là 131 kB lên 217 kB, vượt cửa 180 kB. Nên điều kiện để nó lương thiện là bày
 * NGÀY LƯU cùng con số, và ca kiểm dưới ghim đúng chỗ đó.
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

/*
 * Chủ dự án báo: ở tab Mã đang cuộn dở mà bấm sang tab Công thức thì "giao diện bật to ra, cảm
 * giác bị giật". Đo trên Chrome thật với 3 mã và 1 phép tính đã lưu, ra HAI nguyên nhân rời nhau:
 *
 *   1. Thanh cuộn biến mất khi trang hết đủ dài → vùng nhìn rộng thêm 15px → thanh trên giãn từ
 *      1249 lên 1264 và mép trái cụm tab dịch 7,5px. ĐỂ NGUYÊN, có chủ đích: cách chặn duy nhất
 *      (`scrollbar-gutter: stable`) để lại một vệt 15px khác màu chạy dọc mép phải mà không gì
 *      vẽ vào được, và chủ dự án thấy vệt ấy phiền hơn cú giãn — lý lẽ đầy đủ nằm trong docblock
 *      cạnh khối `body { overflow-x: clip }` của `globals.css`. Dù có chặn thì cũng KHÔNG kiểm
 *      được ở đây: jsdom không có bộ dựng hình nên không có thanh cuộn nào để mất.
 *   2. Trang co 1916 → 780px làm trình duyệt kẹp vị trí cuộn 700 → 0.
 *
 * Nguyên nhân 2 là phần sửa được mà không kèm tác dụng phụ, và cũng là phần kiểm được: đổi tab
 * phải chủ động kéo cụm tab trở lại tầm mắt, thay vì phó mặc cho cú kẹp của trình duyệt.
 */
describe('WF-06 — đổi tab không ném người dùng đi chỗ khác', () => {
  it('bấm đổi tab thì kéo cụm tab trở lại tầm mắt', async () => {
    const bay = bayScrollIntoView();
    seedHolding();
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    expect(bay.goi).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    expect(bay.goi).toHaveBeenCalledTimes(1);
    /*
     * `nearest` chứ không `start`: đứng sẵn ở đầu trang mà bấm tab thì màn hình phải ĐỨNG YÊN.
     * `start` sẽ cuộn xuống để đẩy cụm tab lên đỉnh — một cú giật khác, do chính bản vá gây ra.
     */
    expect(bay.goi.mock.calls[0]?.[0]).toMatchObject({ block: 'nearest' });
    bay.go();
  });

  it('mở màn sẵn ở tab Công thức bằng `?tab=` thì KHÔNG tự cuộn — người dùng chưa bấm gì', async () => {
    const bay = bayScrollIntoView();
    window.history.replaceState(null, '', '/danh-muc/?tab=cong-thuc');
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText(/không tính lại/);

    expect(bay.goi).not.toHaveBeenCalled();
    bay.go();
  });
});

/*
 * Chủ dự án báo bấm "Sửa" xong "cảm giác không có gì thay đổi" — nút Sửa nằm trong khối chi tiết
 * của một dòng, mà form luôn dựng ở CUỐI cả danh sách, nên dòng đang sửa càng ở trên thì form
 * càng xa tầm nhìn: form đã mở, chỉ là ngoài màn hình.
 */
describe('WF-06 — mở form thì kéo nó vào tầm mắt', () => {
  it('bấm Sửa thì kéo form vào tầm mắt để thao tác tiếp', async () => {
    const bay = bayScrollIntoView();
    seedHolding();
    render(<PortfolioScreen />);
    await moChiTiet('FPT');

    expect(bay.goi).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Sửa FPT' }));

    expect(bay.goi).toHaveBeenCalledTimes(1);
    /*
     * `start` chứ không `nearest` như cụm tab: form là đích để THAO TÁC tiếp (gõ số, chọn công
     * thức) nên phải lộ trọn các ô nhập, không chỉ "vừa lọt vào tầm nhìn" như cụm tab gọn.
     */
    expect(bay.goi.mock.calls[0]?.[0]).toMatchObject({ block: 'start' });
    bay.go();
  });

  it('bấm "Thêm mã cổ phiếu" cũng kéo form vào tầm mắt — cùng một cơ chế', async () => {
    const bay = bayScrollIntoView();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));

    expect(bay.goi).toHaveBeenCalledTimes(1);
    bay.go();
  });
});

describe('WF-06 — tab Công thức', () => {
  it('mặc định mở tab Mã; chưa lưu gì thì tab kia mời lưu chứ không để trống', async () => {
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    expect(screen.getByText(/Chưa lưu phép tính nào/)).not.toBeNull();
  });

  it('sáu ô chỉ thuộc tab Mã — tab Công thức không mang theo con số của tab kia', async () => {
    seedHolding();
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Tổng giá trị');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    expect(screen.queryByText('Tổng giá trị')).toBeNull();
    expect(screen.queryByText('Nắm giữ')).toBeNull();
  });

  it('bày tên, công thức, kết quả đã lưu và NGÀY LƯU', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    expect(screen.getByText('HPG · P/E')).not.toBeNull();
    expect(screen.getByText('12,5 lần')).not.toBeNull();
    // Ngày lưu là điều kiện để bày một con số không tính lại (xem docblock trên).
    expect(screen.getByText(/25\/08\/2026/)).not.toBeNull();
    expect(screen.getByText(/không tính lại/)).not.toBeNull();
  });

  it('nhãn tab mang số đếm của cả hai bên', async () => {
    seedHolding();
    seedSaved();
    render(<PortfolioScreen />);

    expect(await screen.findByRole('tab', { name: 'Mã (1)' })).not.toBeNull();
    expect(screen.getByRole('tab', { name: 'Công thức (1)' })).not.toBeNull();
  });

  it('nút Mở lại dẫn về đúng công thức kèm ?luu=', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    const open = screen.getByRole('link', { name: 'Mở lại' });
    // `next/link` bỏ dấu '/' ngay trước '?' — cùng cách ca "từ mã sang công thức" ở trên xử lý.
    expect(open.getAttribute('href')?.replace('/?', '?')).toBe(
      '/cong-thuc/pe?luu=pe-1756000000000',
    );
  });

  it('đổi tên ghi thẳng vào localStorage', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Đổi tên HPG · P/E' }));

    const field = screen.getByLabelText('Tên phép tính') as HTMLInputElement;
    await userEvent.clear(field);
    await userEvent.type(field, 'Sàng HPG quý 3');
    await userEvent.click(screen.getByRole('button', { name: 'Lưu tên' }));

    expect(screen.getByText('Sàng HPG quý 3')).not.toBeNull();
    expect(window.localStorage.getItem(SAVED_CALCS_KEY)).toContain('Sàng HPG quý 3');
  });

  it('xoá thì mục biến khỏi màn và khỏi localStorage', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Xoá HPG · P/E' }));

    expect(screen.getByText(/Chưa lưu phép tính nào/)).not.toBeNull();
    expect(window.localStorage.getItem(SAVED_CALCS_KEY)).toBe('[]');
  });

  it('thiếu kết quả thì hiện gạch, KHÔNG hiện 0 (FR-06)', async () => {
    window.localStorage.setItem(
      SAVED_CALCS_KEY,
      JSON.stringify([
        {
          id: 'pe-1',
          formulaId: 'pe',
          name: 'Chưa có số',
          inputs: {},
          resultValue: null,
          resultUnit: 'lần',
          savedAt: Date.now(),
          needsSeries: false,
        },
      ]),
    );
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    expect(screen.getByText('—')).not.toBeNull();
    expect(screen.queryByText('0 lần')).toBeNull();
  });

  it('không gọi mạng chỉ vì đổi sang tab Công thức', async () => {
    seedSaved();
    render(<PortfolioScreen />);

    await screen.findByText('Nắm giữ');
    await userEvent.click(screen.getByRole('tab', { name: /Công thức/ }));

    expect(feed.snapshots).not.toHaveBeenCalled();
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
