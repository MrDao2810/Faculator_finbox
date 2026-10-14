// @vitest-environment jsdom

import { act, cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { TICKER_LIST_KEY, TICKER_LIST_TTL_MS, serializeCachedTickers } from '@/application';

import { TickerPickerSheet } from './TickerPickerSheet';

/**
 * Cổng danh sách mã thay bằng bản giả — sheet gọi `MARKET_FEED.listTickers()` qua `useTickerList`.
 *
 * `vi.hoisted` là bắt buộc vì `vi.mock` bị kéo lên đầu file; cùng khuôn `FormulaDetail.test.tsx`.
 */
const feed = vi.hoisted(() => ({ listTickers: vi.fn(), snapshots: vi.fn() }));

vi.mock('@/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data')>();
  return { ...actual, MARKET_FEED: feed };
});

/**
 * Bảng mã có báo cáo dùng được — thay bằng bản giả để ca kiểm không phụ thuộc file sinh.
 *
 * File sinh thật (`ticker-coverage.generated.ts`) đổi mỗi lần chạy `npm run gen:ticker-coverage`,
 * nên ghim một mã cụ thể của nó là ghim một ca test vào lịch công bố báo cáo của doanh nghiệp.
 */
vi.mock('@/application/ticker-coverage', () => ({
  tickerCoverage: (asOf: string) => ({
    codes: new Set(['FPT', 'HPG']),
    fetchedAt: '2026-09-08T00:00:00.000Z',
    // 2027 cách 2026-09-08 hơn 100 ngày — dùng để bật nhánh câu chữ hạ giọng.
    stale: asOf.startsWith('2027'),
  }),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
});

afterEach(() => {
  cleanup();
  feed.listTickers.mockReset();
});

const DANH_SACH = [
  { code: 'FPT', name: 'FPT Corp' },
  { code: 'HPG', name: 'Tập đoàn Hoà Phát' },
  { code: 'E1VFVN30', name: 'Quỹ ETF VFMVN30' },
];

function dong(code: string): HTMLElement {
  const item = screen.getByText(code).closest('li');
  if (item === null) throw new Error(`Không thấy dòng của mã ${code}.`);
  return item;
}

async function moSheet(props: Partial<Parameters<typeof TickerPickerSheet>[0]> = {}) {
  feed.listTickers.mockResolvedValue(DANH_SACH);
  render(<TickerPickerSheet open onClose={() => undefined} onPick={() => undefined} {...props} />);
  // Danh sách về qua một lời hứa; chờ dòng đầu hiện rồi mới soi.
  await screen.findByText('FPT');
}

describe('TickerPickerSheet — đánh dấu mã chưa có dữ liệu', () => {
  it('không bật đánh dấu thì không dòng nào bị dán nhãn', async () => {
    await moSheet();

    expect(screen.queryByText('chưa có dữ liệu')).toBeNull();
    expect(screen.queryByText('có thể chưa có dữ liệu')).toBeNull();
  });

  /*
   * Ca chính: mã ngoài bảng bị dán nhãn TRƯỚC khi người dùng bấm. Trước đợt này họ chọn xong mới
   * nhận câu "chưa có đủ số liệu cơ bản" ở màn, rồi phải mở lại sheet và đoán mã tiếp theo.
   */
  it('bật đánh dấu: mã ngoài bảng bị dán nhãn, mã trong bảng thì không', async () => {
    await moSheet({ markUnusableAsOf: '2026-09-08' });

    expect(within(dong('E1VFVN30')).getByText('chưa có dữ liệu')).not.toBeNull();
    expect(within(dong('FPT')).queryByText('chưa có dữ liệu')).toBeNull();
    expect(within(dong('HPG')).queryByText('chưa có dữ liệu')).toBeNull();
  });

  /*
   * ĐẢO CHIỀU 06/10/2026. Ca này trước đây tên là "mã bị dán nhãn vẫn chọn được — nhãn là dự
   * đoán, không phải lệnh cấm", và nó khẳng định nút KHÔNG khoá.
   *
   * Chủ dự án nhìn màn thật rồi chốt ngược: *"đang chưa có dữ liệu thì không cho bấm vào button
   * Chọn"*. Bấm vào rồi mới nhận câu "chưa có đủ số liệu cơ bản" ở màn là một chuyến đi uổng, và
   * nhãn đứng ngay cạnh nút đã nói đủ vì sao nút xám. Ca giữ nguyên chỗ, đổi lời khẳng định —
   * để ai đọc lại biết đây là một quyết định, không phải một ca kiểm bị bỏ quên.
   */
  it('mã bị dán nhãn thì KHOÁ nút Chọn', async () => {
    const onPick = vi.fn();
    await moSheet({ markUnusableAsOf: '2026-09-08', onPick });

    const nut = within(dong('E1VFVN30')).getByRole('button');
    expect(nut.hasAttribute('disabled')).toBe(true);
    /* Nút xám phải nói được vì sao xám, cho người dùng bàn phím và trình đọc màn hình. */
    expect(nut.getAttribute('aria-describedby')).toBe('ticker-chua-co-E1VFVN30');

    /* Mã có dữ liệu thì không bị vạ lây. */
    expect(within(dong('FPT')).getByRole('button').hasAttribute('disabled')).toBe(false);
  });

  /*
   * Bảng quá một kỳ báo cáo thì câu chữ hạ giọng: khẳng định một mã hợp lệ là "không dùng được"
   * khiến người dùng bỏ qua nó, và đó là cái giá đắt hơn hẳn một cú bấm thừa.
   */
  it('bảng đã cũ thì nói "có thể chưa có", không khẳng định', async () => {
    await moSheet({ markUnusableAsOf: '2027-06-01' });

    expect(within(dong('E1VFVN30')).getByText('có thể chưa có dữ liệu')).not.toBeNull();
    expect(screen.queryByText('chưa có dữ liệu')).toBeNull();
  });

  /*
   * Khoá THEO ĐỘ CHẮC của nhãn. Bảng đã cũ thì nhãn tự hạ giọng thành "có thể chưa có dữ liệu" —
   * một câu nói "có thể" mà đi kèm một nút cấm thì hai thứ nói hai chuyện, nên nút mở lại. Đây
   * đúng là trường hợp lý do cũ (bảng sinh lúc build, mã có thể đã công bố thêm quý) còn đứng
   * vững, nên nó không mất đi mà thu hẹp lại.
   */
  it('bảng đã cũ thì nút MỞ lại, vì nhãn chỉ còn là phỏng đoán', async () => {
    await moSheet({ markUnusableAsOf: '2027-06-01' });

    const nut = within(dong('E1VFVN30')).getByRole('button');
    expect(nut.hasAttribute('disabled')).toBe(false);
  });
});

/*
 * Mã đã có trong danh mục — KHOÁ, không phải cộng dồn (chủ dự án chốt 10/10/2026).
 *
 * Trước đó mã đang giữ vẫn chọn được và chỉ mang nhãn "đã có" cùng một nhãn nút riêng "Cộng
 * thêm"; nguyên văn yêu cầu và lý do ở bia mộ `portfolio.mergeNote` trong `vi.ts`.
 *
 * Nhóm này ở ĐÂY chứ không chỉ ở `PortfolioScreen.test.tsx` vì một ca không màn nào dựng nổi: màn
 * Danh mục không truyền `markUnusableAsOf`, nên tổ hợp "vừa đang giữ VỪA chưa có báo cáo" chỉ tới
 * được từ cấp component.
 */
describe('TickerPickerSheet — mã đang giữ', () => {
  it('vắng `heldCodes` thì không dòng nào bị khoá hay dán nhãn', async () => {
    await moSheet();

    expect(screen.queryByText('đã có')).toBeNull();
    for (const ma of ['FPT', 'HPG', 'E1VFVN30']) {
      expect(within(dong(ma)).getByRole('button').hasAttribute('disabled')).toBe(false);
    }
  });

  it('mã đang giữ: nút khoá, nhãn "đã có", và nút trỏ vào đúng nhãn ấy', async () => {
    const onPick = vi.fn();
    await moSheet({ heldCodes: new Set(['FPT']), onPick });

    const nut = within(dong('FPT')).getByRole('button');
    expect(nut.hasAttribute('disabled')).toBe(true);
    expect(nut.getAttribute('aria-describedby')).toBe('ticker-da-co-FPT');
    expect(within(dong('FPT')).getByText('đã có')).not.toBeNull();

    /* Mã chưa giữ không bị vạ lây. */
    expect(within(dong('HPG')).getByRole('button').hasAttribute('disabled')).toBe(false);
    expect(within(dong('HPG')).queryByText('đã có')).toBeNull();
  });

  /* Nhãn nút không đổi theo trạng thái nữa — `ticker.pickHeld` ("Cộng thêm") đã xoá. */
  it('nút của mã đang giữ vẫn ghi "Chọn", không có nhãn riêng', async () => {
    await moSheet({ heldCodes: new Set(['FPT']) });

    expect(screen.getAllByRole('button', { name: 'Chọn' })).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Cộng thêm|Thêm/ })).toBeNull();
  });

  /*
   * Vướng cả hai lý do thì `aria-describedby` phải kể cả hai, theo đúng thứ tự nhãn hiện trên
   * dòng. Bỏ bớt một lý do là cho người dùng bàn phím nghe một nửa sự thật: họ sẽ đi tìm mã khác
   * để thay, không biết rằng mã này còn vướng cả chuyện thiếu báo cáo.
   */
  it('vừa đang giữ vừa thiếu báo cáo: nút trỏ vào CẢ HAI nhãn', async () => {
    await moSheet({ heldCodes: new Set(['E1VFVN30']), markUnusableAsOf: '2026-09-08' });

    const nut = within(dong('E1VFVN30')).getByRole('button');
    expect(nut.hasAttribute('disabled')).toBe(true);
    expect(nut.getAttribute('aria-describedby')).toBe(
      'ticker-da-co-E1VFVN30 ticker-chua-co-E1VFVN30',
    );
  });

  /*
   * Bảng mã đã cũ thì nhãn "chưa có dữ liệu" hạ giọng và nút MỞ lại (xem nhóm trên) — nhưng
   * "đã có" thì không bao giờ là phỏng đoán: màn đọc thẳng từ danh mục trên máy người dùng. Nên
   * nút vẫn khoá, và chỉ còn một lý do được kể.
   */
  it('bảng mã cũ không làm nhẹ lệnh khoá của "đã có"', async () => {
    await moSheet({ heldCodes: new Set(['E1VFVN30']), markUnusableAsOf: '2027-06-01' });

    const nut = within(dong('E1VFVN30')).getByRole('button');
    expect(nut.hasAttribute('disabled')).toBe(true);
    expect(nut.getAttribute('aria-describedby')).toBe('ticker-da-co-E1VFVN30');
  });
});

/*
 * Cache quá hạn mà lượt làm mới hỏng: danh sách cũ vẫn dùng được, và không kèm câu nào.
 *
 * Câu "Đang hiện danh sách của lần tải trước, có thể đã cũ." đã bỏ 29/09/2026 theo yêu cầu chủ dự
 * án, xem bia mộ `ticker.stale` trong `vi.ts`. Ca này viết thẳng câu ra chứ không đọc qua `t()`, vì
 * khoá đã xoá: câu quay lại thì phải là một quyết định, không phải một sơ suất.
 */
describe('TickerPickerSheet — cache quá hạn mà làm mới hỏng', () => {
  afterEach(() => {
    window.localStorage.removeItem(TICKER_LIST_KEY);
  });

  it('vẫn hiện danh sách cũ, không báo lỗi, không kèm câu "có thể đã cũ"', async () => {
    window.localStorage.setItem(
      TICKER_LIST_KEY,
      serializeCachedTickers(DANH_SACH, Date.now() - 2 * TICKER_LIST_TTL_MS),
    );
    let tuChoi: (loi: unknown) => void = () => undefined;
    feed.listTickers.mockReturnValue(
      new Promise((_, reject) => {
        tuChoi = reject;
      }),
    );

    render(<TickerPickerSheet open onClose={() => undefined} onPick={() => undefined} />);
    // Bản cache hiện ngay, trước khi lượt làm mới kịp về.
    await screen.findByText('FPT');

    await act(async () => {
      tuChoi(new Error('mất mạng'));
    });

    expect(feed.listTickers).toHaveBeenCalledTimes(1);
    expect(screen.getByText('HPG')).not.toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByRole('note')).toBeNull();
    expect(screen.queryByText(/lần tải trước|có thể đã cũ/)).toBeNull();
  });
});

/*
 * ── Bày dần 20 mã một lượt, và vòng xoay khi tìm (13/10/2026) ───────────────────────────────
 *
 * Chủ dự án: *"ban đầu hiển thị 20 mã khi người dùng scroll xuống dưới thì hiển thị icon xoay tròn
 * loading... rồi hiển thị thêm 20 mã nữa. còn nếu người dùng search thì cần loading để tìm mã tương
 * ứng"*. Thay cho bản cũ dựng 60 dòng rồi ghi "60/1.649 mã".
 *
 * jsdom không có `IntersectionObserver`, và ở đó sheet cố ý bày hết (xem `bayDan`) — nên nhóm này
 * tự dựng một bộ quan sát giả và tự bắn tín hiệu "mốc cuối vào tầm nhìn".
 */
describe('TickerPickerSheet — bày dần và vòng xoay', () => {
  /** 45 mã: hai lượt đầy và một lượt lẻ, để thấy cả lúc mốc cuối biến mất. */
  const NHIEU_MA = Array.from({ length: 45 }, (_, i) => ({
    code: `M${String(i + 1).padStart(2, '0')}`,
    name: `Doanh nghiệp ${String(i + 1)}`,
  }));

  type GoiLai = (entries: ReadonlyArray<{ isIntersecting: boolean }>) => void;
  let dangQuanSat: GoiLai[] = [];

  beforeEach(() => {
    dangQuanSat = [];
    window.localStorage.removeItem(TICKER_LIST_KEY);

    vi.stubGlobal(
      'IntersectionObserver',
      class {
        private readonly goi: GoiLai;
        constructor(goi: GoiLai) {
          this.goi = goi;
        }
        observe(): void {
          dangQuanSat.push(this.goi);
        }
        disconnect(): void {
          dangQuanSat = dangQuanSat.filter((item) => item !== this.goi);
        }
        unobserve(): void {
          this.disconnect();
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    window.localStorage.removeItem(TICKER_LIST_KEY);
  });

  /**
   * Giả lập "người dùng vừa cuộn tới đáy danh sách".
   *
   * CHỜ mốc đáy được quan sát lại rồi mới bắn: sau mỗi lượt bày thêm, `IntersectionObserver` gắn lại
   * trong một effect chạy SAU lượt vẽ. Bắn ngay khi danh sách vừa đủ 40 dòng thì lúc máy tải nặng (cả
   * bộ test chạy song song) effect ấy chưa chạy, `dangQuanSat` rỗng, cú cuộn rơi vào khoảng không và
   * ca hỏng vì hết giờ chờ — đã gặp đúng một lần ở `npm test` ngày 14/10/2026, chạy riêng thì xanh.
   */
  async function cuonToiDay(): Promise<void> {
    await waitFor(() => {
      expect(dangQuanSat.length).toBeGreaterThan(0);
    });
    act(() => {
      for (const goi of dangQuanSat) goi([{ isIntersecting: true }]);
    });
  }

  async function moNhieuMa(): Promise<void> {
    feed.listTickers.mockResolvedValue(NHIEU_MA);
    render(<TickerPickerSheet open onClose={() => undefined} onPick={() => undefined} />);
    await screen.findByText('M01');
  }

  it('mở ra là 20 mã; cuộn tới đáy thì thêm 20, rồi tới hết thì mốc cuối biến mất', async () => {
    await moNhieuMa();

    expect(screen.getAllByRole('listitem')).toHaveLength(20);
    expect(screen.getByText('Đang tải thêm mã…')).not.toBeNull();

    await cuonToiDay();
    // Chưa thêm ngay: vòng xoay hiện một nhịp rồi dòng mới mới tới.
    expect(screen.getAllByRole('listitem')).toHaveLength(20);
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(40);
    });

    await cuonToiDay();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(45);
    });
    // Hết mã thì không còn gì để chờ — vòng xoay ở đáy không được quay mãi.
    expect(screen.queryByText('Đang tải thêm mã…')).toBeNull();
    expect(dangQuanSat).toHaveLength(0);
  });

  it('gõ vào ô tìm thì hiện "Đang tìm mã…" thay danh sách, rồi mới ra kết quả', async () => {
    await moNhieuMa();

    await userEvent.type(screen.getByRole('searchbox'), 'm07');

    expect(screen.getByText('Đang tìm mã…')).not.toBeNull();
    expect(screen.queryAllByRole('listitem')).toHaveLength(0);

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });
    expect(screen.getByText('M07')).not.toBeNull();
    expect(screen.queryByText('Đang tìm mã…')).toBeNull();
  });

  /* Kết quả mới bày lại từ lượt đầu, không thừa hưởng số dòng của kết quả trước. */
  it('đã cuộn thêm rồi mới tìm thì kết quả lại bắt đầu từ 20 mã', async () => {
    await moNhieuMa();

    await cuonToiDay();
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(40);
    });

    // "doanh nghiep" khớp tên của cả 45 mã.
    await userEvent.type(screen.getByRole('searchbox'), 'doanh nghiep');
    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(20);
    });
  });

  /*
   * Dòng "60/1.649 mã" đã bỏ: chủ dự án đọc 60 thành "số mã có" (bia mộ `ticker.capped` ở
   * `vi.ts`). Ca viết thẳng hình dạng của dòng ấy ra, vì khoá đã xoá — nó quay lại thì phải là một
   * quyết định, không phải một sơ suất.
   */
  it('không còn dòng đếm "x/y mã" dưới danh sách', async () => {
    await moNhieuMa();

    expect(screen.queryByText(/\d+\s*\/\s*\d+/)).toBeNull();
  });
});
