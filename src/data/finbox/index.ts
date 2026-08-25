/**
 * Tầng DATA — cửa gom của cổng số liệu thị trường.
 *
 * Giao diện KHÔNG import thẳng vào đây (CON-03), phải đi qua `@/application`.
 */

import { FINBOX_FEED } from './client';
import type { MarketFeed, TickerRef, TickerSnapshot } from './types';

export type { MarketFeed, TickerRef, TickerSnapshot, FeedFailureKind } from './types';
export { MarketFeedError } from './types';
export { isAbortError } from './client';
export { parseSnapshots, parseTickerList, toFundamentals, toSnapshot } from './map';

/** Bản dùng trong sản phẩm. Đổi nguồn số liệu thị trường thì đổi đúng dòng này. */
export const MARKET_FEED: MarketFeed = FINBOX_FEED;

/**
 * Bản giả cho test và cho màn cần chạy không mạng.
 *
 * Có mặt ở đây thay vì viết lại trong từng file test: một bản giả dùng chung nghĩa là khi hợp
 * đồng `MarketFeed` đổi, mọi test cùng đỏ một lượt thay vì âm thầm kiểm một hợp đồng đã chết.
 */
export function createStubFeed(
  tickers: ReadonlyArray<TickerRef> = [],
  snapshots: ReadonlyArray<TickerSnapshot> = [],
): MarketFeed {
  const byCode = new Map(snapshots.map((item) => [item.code.toUpperCase(), item]));

  return {
    listTickers: () => Promise.resolve(tickers),
    snapshots: (codes) =>
      Promise.resolve(
        new Map(
          codes
            .map((code) => byCode.get(code.trim().toUpperCase()))
            .filter((item): item is TickerSnapshot => item !== undefined)
            .map((item) => [item.code, item]),
        ),
      ),
  };
}
