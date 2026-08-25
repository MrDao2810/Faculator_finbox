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

/** Gieo một mã rồi mở sheet công thức của nó — ba ca dưới đây đều bắt đầu từ đúng chỗ này. */
async function moSheetCongThuc(): Promise<HTMLElement> {
  seedHolding();
  render(<PortfolioScreen />);
  await userEvent.click(await screen.findByRole('button', { name: 'Tính công thức FPT' }));
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
  it('nút ƒ mở danh sách công thức, link mang theo mã trên URL', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Tính công thức FPT' }));

    const sheet = await screen.findByRole('dialog');
    const link = within(sheet).getByRole('link', { name: /P\/E/ });

    /*
     * `?ma=FPT` là thứ FormulaDetail đọc để tự nạp số liệu của mã.
     *
     * Bỏ dấu "/" cuối trước khi so, cùng cách `HeaderNav.test.tsx` làm: `next/link` trong môi
     * trường test không đọc `next.config.mjs` nên nó cắt dấu gạch mà `trailingSlash: true` giữ
     * lại ở bản build thật. Phần đáng kiểm ở đây là tham số, không phải dấu gạch.
     */
    expect(link.getAttribute('href')?.replace('/?', '?')).toBe('/cong-thuc/pe?ma=FPT');
  });

  it('không gọi mạng để dựng danh sách công thức', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: 'Tính công thức FPT' }));
    await screen.findByRole('dialog');

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
    expect(within(sheet).getByRole('link', { name: /ROE/ })).toBeTruthy();

    /*
     * Lọc bằng chính `scoreFormula` + `tokenize` của ô tìm toàn cục, nên gõ KHÔNG DẤU vẫn ra
     * đúng: "co tuc" khớp "cổ tức". Viết một bản so chuỗi riêng cho sheet sẽ làm ca này đỏ.
     *
     * Không khẳng định "mọi kết quả đều có chữ cổ tức trong TÊN": `scoreFormula` tra cả mô tả và
     * `tags`, nên các mô hình chiết khấu cổ tức (Gordon, DDM) cũng khớp — đúng như ở màn Tìm kiếm.
     */
    await userEvent.clear(box);
    await userEvent.type(box, 'co tuc');
    expect(within(sheet).getByRole('link', { name: /Tỷ suất cổ tức/ })).toBeTruthy();
    expect(within(sheet).queryByRole('link', { name: /ROE/ })).toBeNull();
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
    expect(within(sheet).queryByRole('link', { name: /[Bb]iên an toàn/ })).toBeNull();
  });

  it('mã thiếu thị giá: P/E hạ từ 2/2 xuống 1/2 ô, không hứa quá', async () => {
    feed.snapshots.mockResolvedValue(new Map([['FPT', { ...FPT_SNAPSHOT, priceVnd: null }]]));
    const sheet = await moSheetCongThuc();

    expect(within(sheet).getByRole('link', { name: /P\/E/ }).textContent).toContain('1/2');
  });

  it('công thức nâng cao nằm trong nhóm Nâng cao', async () => {
    const sheet = await moSheetCongThuc();

    // `getByRole('region', …)` chỉ tìm thấy khi <section> có tên đọc lên được — nên ca này kiểm
    // luôn cả việc `aria-labelledby` nối đúng vào tiêu đề nhóm.
    const nangCao = within(sheet).getByRole('region', { name: 'Nâng cao' });

    expect(within(nangCao).getByRole('link', { name: /WACC/ })).toBeTruthy();
    // Và công thức cơ bản thì KHÔNG được lọt vào nhóm nâng cao.
    expect(within(nangCao).queryByRole('link', { name: /P\/E/ })).toBeNull();
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
   * Nút Sửa phải có tín hiệu nhìn thấy được, không chỉ đổi màu lúc rê chuột: màn này thiết kế
   * cho 360px, mà điện thoại không có trạng thái rê chuột. Chủ dự án không tìm ra nút vì đúng
   * lý do đó.
   */
  it('nút Sửa mang dấu bút chì, và trình đọc màn hình không đọc ký hiệu ấy', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const nutSua = await screen.findByRole('button', { name: 'Sửa FPT' });
    const dau = nutSua.querySelector('[aria-hidden="true"]');

    expect(dau?.textContent).toBe('✎');
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

  it('dòng mã hiện thị giá đang dùng, ngày mua và lãi/lỗ kèm dấu', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await screen.findByRole('listitem');

    await waitFor(() => {
      expect(row.textContent).toContain('71.400');
    });
    expect(row.textContent).toContain('02/01/2026');
    // Dấu + mang tin chứ không chỉ có màu — NFR-USA-06.
    expect(row.textContent).toContain('+1.140.000');
  });

  /*
   * Nút "Sửa" cố ý CHỈ bao dòng đầu (mã + tên), không bao khối số.
   *
   * `aria-label` nuốt toàn bộ nội dung bên trong nút với trình đọc màn hình, nên bọc cả khối số
   * vào nút là làm số lượng, giá vốn, thị giá, lãi/lỗ và ngày mua biến mất khỏi bản đọc — đúng
   * những con số gói này vừa đưa lên màn. Ai nới nút ra bao cả dòng sẽ làm ca này đỏ.
   */
  it('khối số nằm NGOÀI nút sửa, để trình đọc màn hình không bị nuốt mất', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const nutSua = await screen.findByRole('button', { name: 'Sửa FPT' });

    expect(nutSua.textContent).toContain('FPT');
    expect(nutSua.textContent).not.toContain('CP');
    expect(nutSua.textContent).not.toContain('giá vốn');
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
   * mỗi mẩu là một ô NHÃN–GIÁ TRỊ riêng. Ca này khoá việc nhãn thật sự tồn tại thành phần tử.
   */
  it('mỗi số liệu có nhãn riêng, không còn là một câu nối bằng dấu chấm', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const row = await screen.findByRole('listitem');

    for (const label of ['Số lượng', 'giá vốn', 'Thị giá', 'tỷ trọng', 'Ngày mua']) {
      expect(within(row).getByText(label)).toBeTruthy();
    }
  });

  /*
   * Hai nút cuối thẻ từng là ký tự `ƒ` và `×` trần trên nền trong suốt — chủ dự án báo là nhìn
   * không biết bấm được. Nay là nút thật, có chữ đọc được chứ không phải một ký hiệu.
   */
  it('hai nút cuối thẻ mang chữ, không phải ký tự trần', async () => {
    seedHolding();
    render(<PortfolioScreen />);

    const congThuc = await screen.findByRole('button', { name: 'Tính công thức FPT' });
    const boMa = screen.getByRole('button', { name: 'Bỏ mã FPT' });

    expect(congThuc.textContent).toBe('Tính công thức');
    expect(boMa.textContent).toBe('Bỏ mã');
    expect(congThuc.textContent).not.toBe('ƒ');
  });

  it('tên doanh nghiệp chọn ở sheet được giữ lại và hiện trên dòng mã', async () => {
    render(<PortfolioScreen />);

    await userEvent.click(await screen.findByRole('button', { name: /Thêm mã cổ phiếu/ }));
    await userEvent.click(screen.getByRole('button', { name: 'Mã cổ phiếu' }));
    const sheet = await screen.findByRole('dialog');
    await userEvent.click(within(sheet).getAllByRole('button', { name: 'Chọn' })[0] as HTMLElement);

    await userEvent.type(screen.getByLabelText('Số cổ phiếu nắm giữ'), '100');
    await userEvent.type(screen.getByLabelText('Giá vốn một cổ phiếu (₫)'), '60000');
    await userEvent.click(screen.getByRole('button', { name: 'Thêm vào danh mục' }));

    const nutSua = await screen.findByRole('button', { name: 'Sửa FPT FPT Corp' });
    expect(nutSua.textContent).toContain('FPT Corp');
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
