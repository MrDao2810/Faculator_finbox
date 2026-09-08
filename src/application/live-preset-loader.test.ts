import { afterEach, describe, expect, it, vi } from 'vitest';

import { LIVE_FUNDAMENTALS } from '@/data/live-fundamentals.generated';
import type { TickerSnapshot } from '@/data/finbox/types';

/**
 * Cổng thị trường thay bằng bản giả — `loadLivePreset()` gọi `MARKET_FEED` qua barrel `@/data`.
 *
 * `vi.hoisted` là bắt buộc vì `vi.mock` bị kéo lên đầu file; cùng khuôn `FormulaDetail.test.tsx`.
 * Giữ nguyên phần còn lại của barrel (`presetFromSnapshot`, `isAbortError`) để ca kiểm đi đúng
 * đường sản phẩm chạy, chỉ chặn đúng chỗ ra mạng.
 */
const feed = vi.hoisted(() => ({
  listTickers: vi.fn(),
  snapshots: vi.fn(),
  priceHistory: vi.fn(),
}));

vi.mock('@/data', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data')>();
  return { ...actual, MARKET_FEED: feed };
});

const { loadLivePreset } = await import('./live-preset-loader');

const ASOF = '2026-09-08';

const SNAPSHOT: TickerSnapshot = {
  code: 'FPT',
  name: 'FPT Corp',
  priceVnd: 71_400,
  asOfDate: '2026-08-21',
  floor: 'HOSE',
  industry: 'Phần mềm & DV máy tính',
  fundamentals:
    LIVE_FUNDAMENTALS.FPT ??
    (() => {
      throw new Error('file sinh thiếu FPT');
    })(),
};

const HISTORY = [
  { date: '2026-08-10', open: null, high: null, low: null, close: 69_500, volume: null },
  { date: '2026-08-11', open: null, high: null, low: null, close: 70_100, volume: null },
];

function traVe(snapshot: TickerSnapshot | null, history: unknown): void {
  feed.snapshots.mockResolvedValue(new Map(snapshot === null ? [] : [['FPT', snapshot]]));
  if (history instanceof Error) feed.priceHistory.mockRejectedValue(history);
  else feed.priceHistory.mockResolvedValue(history);
}

afterEach(() => {
  feed.snapshots.mockReset();
  feed.priceHistory.mockReset();
});

describe('nạp số liệu thật của một mã', () => {
  it('gộp chuỗi phiên vào preset để biểu đồ có đường thời gian', async () => {
    traVe(SNAPSHOT, HISTORY);

    const result = await loadLivePreset('FPT', ASOF);

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.preset.bars.map((bar) => bar.date)).toEqual([
      '2026-08-10',
      '2026-08-11',
      '2026-08-21',
    ]);
  });

  /*
   * Bất biến quan trọng nhất của gói này.
   *
   * Chuỗi phiên là phần THÊM cho biểu đồ; số liệu cơ bản mới là thứ người dùng đến vì nó. Để một
   * lời gọi phụ hỏng kéo theo cả preset là đánh đổi ngược — họ mất luôn EPS, vốn chủ, doanh thu
   * chỉ vì không lấy được mười phiên giá.
   */
  it('chuỗi phiên hỏng thì vẫn nạp được số liệu, chỉ mất đường thời gian', async () => {
    traVe(SNAPSHOT, new Error('mất mạng'));

    const result = await loadLivePreset('FPT', ASOF);

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    // Đúng hành vi trước đợt này: một phiên, biểu đồ rơi về đường quét giả định.
    expect(result.preset.bars).toHaveLength(1);
    expect(result.preset.fundamentals.eps).toBe(5867);
  });

  it('nguồn trả chuỗi rỗng cũng vậy — không phải lỗi', async () => {
    traVe(SNAPSHOT, []);

    const result = await loadLivePreset('FPT', ASOF);

    expect(result.status).toBe('ok');
    if (result.status !== 'ok') return;
    expect(result.preset.bars).toHaveLength(1);
  });

  /*
   * Chiều ngược lại: lỗi HUỶ của lời gọi phụ KHÔNG được nuốt. Người dùng đã rời màn thì không có
   * gì để bày, và `'cancelled'` là thứ nơi gọi đọc để im lặng.
   */
  it('huỷ giữa chừng vẫn ra "cancelled", không thành "ok" nửa vời', async () => {
    const huy = new Error('Đã huỷ');
    huy.name = 'AbortError';
    traVe(SNAPSHOT, huy);

    expect((await loadLivePreset('FPT', ASOF)).status).toBe('cancelled');
  });

  it('mã không có số liệu cơ bản vẫn là "no-data", chuỗi phiên không cứu được', async () => {
    traVe({ ...SNAPSHOT, fundamentals: null }, HISTORY);

    expect((await loadLivePreset('FPT', ASOF)).status).toBe('no-data');
  });

  it('số liệu cơ bản hỏng thì "failed", phân biệt với "no-data"', async () => {
    feed.snapshots.mockRejectedValue(new Error('HTTP 503'));
    feed.priceHistory.mockResolvedValue(HISTORY);

    expect((await loadLivePreset('FPT', ASOF)).status).toBe('failed');
  });
});
