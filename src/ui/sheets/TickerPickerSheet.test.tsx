// @vitest-environment jsdom

import { act, cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

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
