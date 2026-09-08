// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

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

describe('TickerPickerSheet — đánh dấu mã chưa có số liệu', () => {
  it('không bật đánh dấu thì không dòng nào bị dán nhãn', async () => {
    await moSheet();

    expect(screen.queryByText('chưa có số liệu')).toBeNull();
    expect(screen.queryByText('có thể chưa có số liệu')).toBeNull();
  });

  /*
   * Ca chính: mã ngoài bảng bị dán nhãn TRƯỚC khi người dùng bấm. Trước đợt này họ chọn xong mới
   * nhận câu "chưa có đủ số liệu cơ bản" ở màn, rồi phải mở lại sheet và đoán mã tiếp theo.
   */
  it('bật đánh dấu: mã ngoài bảng bị dán nhãn, mã trong bảng thì không', async () => {
    await moSheet({ markUnusableAsOf: '2026-09-08' });

    expect(within(dong('E1VFVN30')).getByText('chưa có số liệu')).not.toBeNull();
    expect(within(dong('FPT')).queryByText('chưa có số liệu')).toBeNull();
    expect(within(dong('HPG')).queryByText('chưa có số liệu')).toBeNull();
  });

  /*
   * Dán nhãn nhưng KHÔNG khoá nút.
   *
   * Bảng mã sinh lúc build và cũ đi mỗi kỳ báo cáo, nên một mã bị dán nhãn hôm nay hoàn toàn có thể
   * đã công bố thêm quý và dùng được rồi. Khoá lại là biến một dự đoán thành một lệnh cấm.
   */
  it('mã bị dán nhãn vẫn chọn được — nhãn là dự đoán, không phải lệnh cấm', async () => {
    const onPick = vi.fn();
    await moSheet({ markUnusableAsOf: '2026-09-08', onPick });

    const nut = within(dong('E1VFVN30')).getByRole('button');
    expect(nut.hasAttribute('disabled')).toBe(false);
  });

  /*
   * Bảng quá một kỳ báo cáo thì câu chữ hạ giọng: khẳng định một mã hợp lệ là "không dùng được"
   * khiến người dùng bỏ qua nó, và đó là cái giá đắt hơn hẳn một cú bấm thừa.
   */
  it('bảng đã cũ thì nói "có thể chưa có", không khẳng định', async () => {
    await moSheet({ markUnusableAsOf: '2027-06-01' });

    expect(within(dong('E1VFVN30')).getByText('có thể chưa có số liệu')).not.toBeNull();
    expect(screen.queryByText('chưa có số liệu')).toBeNull();
  });
});
