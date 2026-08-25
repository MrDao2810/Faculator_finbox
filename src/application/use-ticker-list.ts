'use client';

/**
 * Tầng APPLICATION — nạp danh sách mã cho ô chọn mã (gói "Danh mục dùng số liệu thật").
 *
 * Cùng vai với `use-list-params.ts`: phần thuần nằm ở `ticker-list-store.ts` và test được bằng
 * Node, còn hook này chỉ ghép các mảnh lại — `MARKET_FEED` (mạng), kho cache (localStorage) và
 * vòng đời React.
 *
 * ── Hai tầng nguồn ──────────────────────────────────────────────────────────────────────────
 *
 * 1. **localStorage** — hiện ngay danh sách của lần trước, kể cả khi đang mất mạng (NFR-REL-02).
 * 2. **Mạng** — chỉ gọi khi cache hết hạn hoặc trống.
 *
 * Có cache thì **hiện cache trước rồi mới làm mới ngầm**. Bắt người dùng nhìn vòng quay 82 kB
 * mỗi lần mở sheet là trả giá cho một danh sách gần như không đổi.
 *
 * Cố ý KHÔNG có thêm một tầng nhớ cấp module ở đây. Bản đầu có, để mở sheet lần thứ hai không
 * phải `JSON.parse` lại — nhưng đó là một biến toàn cục sống ngoài React, và cái giá thật của nó
 * hiện ra ngay ở test: danh sách của ca kiểm trước rò sang ca kiểm sau. Đọc lại localStorage tốn
 * khoảng một mili giây; một trạng thái toàn cục ẩn thì tốn nhiều hơn thế.
 *
 * Chỉ gọi mạng khi `active` — tức khi người dùng thật sự mở ô chọn mã. Nạp sẵn lúc vào trang là
 * gửi một request ra ngoài cho người có khi chẳng bao giờ bấm vào đó.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { MARKET_FEED, MarketFeedError, isAbortError } from '@/data';
import type { FeedFailureKind, TickerRef } from '@/data';

import {
  TICKER_LIST_KEY,
  isTickerListFresh,
  parseCachedTickers,
  serializeCachedTickers,
} from './ticker-list-store';
import type { CachedTickerList } from './ticker-list-store';

export type TickerListStatus = 'loading' | 'ready' | 'error';

export interface UseTickerListResult {
  items: ReadonlyArray<TickerRef>;
  status: TickerListStatus;
  /** Vì sao hỏng — `null` khi không hỏng. Có thể khác `null` mà vẫn `status: 'ready'`: xem `stale`. */
  failure: FeedFailureKind | null;
  /**
   * Đang hiện một bản cũ.
   *
   * Xảy ra khi cache đã quá hạn mà lần làm mới lại hỏng. Danh sách vẫn dùng được nên KHÔNG che
   * nó bằng màn lỗi — chỉ nói cho người dùng biết là số liệu cũ.
   */
  stale: boolean;
  reload: () => void;
}

function readCache(): CachedTickerList | null {
  try {
    return parseCachedTickers(window.localStorage.getItem(TICKER_LIST_KEY));
  } catch {
    // Trình duyệt chặn localStorage — coi như chưa có cache, vẫn tải được bình thường.
    return null;
  }
}

function writeCache(items: ReadonlyArray<TickerRef>, now: number): void {
  try {
    window.localStorage.setItem(TICKER_LIST_KEY, serializeCachedTickers(items, now));
  } catch {
    // Hết dung lượng hoặc bị chặn — không chặn việc đang làm.
  }
}

export function useTickerList(active: boolean): UseTickerListResult {
  const [items, setItems] = useState<ReadonlyArray<TickerRef>>([]);
  const [status, setStatus] = useState<TickerListStatus>('loading');
  const [failure, setFailure] = useState<FeedFailureKind | null>(null);
  const [stale, setStale] = useState(false);

  /** Tăng lên mỗi lần bấm "Thử lại" — để effect chạy lại mà không cần state phụ nào khác. */
  const [attempt, setAttempt] = useState(0);
  const reload = useCallback(() => {
    setAttempt((n) => n + 1);
  }, []);

  /** Chặn lượt tải cũ ghi đè lượt mới khi người dùng bấm Thử lại liên tiếp. */
  const runId = useRef(0);

  useEffect(() => {
    if (!active) return;

    const id = ++runId.current;
    const controller = new AbortController();
    const now = Date.now();

    const cached = readCache();
    const fresh = isTickerListFresh(cached, now);

    if (cached !== null) {
      // Hiện ngay thứ đang có, kể cả khi đã cũ — rồi mới quyết có làm mới hay không.
      setItems(cached.items);
      setStatus('ready');
      setFailure(null);
      setStale(!fresh);
    } else {
      setStatus('loading');
      setFailure(null);
      setStale(false);
    }

    // Còn hạn và không phải người dùng chủ động bấm Thử lại thì dừng ở đây, không chạm mạng.
    if (fresh && attempt === 0) return;

    void (async () => {
      try {
        const list = await MARKET_FEED.listTickers(controller.signal);
        if (id !== runId.current) return;

        writeCache(list, Date.now());

        setItems(list);
        setStatus('ready');
        setFailure(null);
        setStale(false);
      } catch (error) {
        if (id !== runId.current || isAbortError(error)) return;

        const kind: FeedFailureKind =
          error instanceof MarketFeedError ? error.kind : ('network' as const);

        setFailure(kind);
        // Có bản cũ thì giữ nguyên danh sách và chỉ đánh dấu là cũ; không có gì thì mới là lỗi.
        if (cached === null) setStatus('error');
        else setStale(true);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [active, attempt]);

  return { items, status, failure, stale, reload };
}
