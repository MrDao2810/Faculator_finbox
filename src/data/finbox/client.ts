/**
 * Tầng DATA — bản cài đặt `MarketFeed` gọi thật `dcs.finbox.vn`.
 *
 * Chỉ có phần MẠNG ở đây; mọi phép đọc số nằm ở `map.ts` để kiểm được không cần mạng.
 *
 * ── Vì sao hai endpoint này, không phải endpoint khác ───────────────────────────────────────
 *
 * · `GET /bp/codes` — nguồn duy nhất trả **cả danh sách mã** trong một lời gọi (1.729 mục,
 *   82 KB). Không cần token.
 * · `POST /data/symbols` — trả 346 field cho **nhiều mã một lượt**, trong đó có `priceFlat`
 *   (thị giá) lẫn đủ field dựng `Fundamentals`. Đo được: 30 mã ≈ 199 KB, 0,23 s.
 *
 * Đã thử và loại: `GET /data/symbol/{mã}/quotes` trả HTTP 200 nhưng thân rỗng 0 byte, nên không
 * có đường nào lấy riêng giá cho nhẹ hơn — nếu sau này Finbox mở một endpoint chỉ-giá thì đây là
 * chỗ đổi, và không màn nào phải sửa theo.
 *
 * Service worker KHÔNG đụng tới các lời gọi này: `handles()` trong `public/sw.js` loại cross-origin
 * và loại non-GET. Nghĩa là không có cache ngầm nào cứu lúc mất mạng — phần cache do tầng
 * Application lo (`ticker-list-store.ts`), có chủ đích.
 */

import { parseSnapshots, parseTickerList } from './map';
import { MarketFeedError } from './types';
import type { MarketFeed, TickerRef, TickerSnapshot } from './types';

/** Phải khớp đúng origin đã mở trong `connect-src` của `public/_headers`. */
const ORIGIN = 'https://dcs.finbox.vn';

/**
 * Hạn chờ.
 *
 * Rộng tay hơn mức đo được (0,23 s cho 30 mã) vì con số ấy đo trên máy có mạng tốt; thứ cần chặn
 * ở đây là ca treo vô hạn, không phải ca chậm.
 */
const TIMEOUT_MS = 12_000;

/** Người dùng huỷ (đóng sheet, rời màn) — nơi gọi bỏ qua im lặng, không phải lỗi để báo. */
export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * Gọi một endpoint và trả thân JSON.
 *
 * Gộp tay hai nguồn huỷ (hạn chờ và `signal` của nơi gọi) thay vì dùng `AbortSignal.any()`: hàm
 * đó chưa nằm trong `lib: ES2022` mà `tsconfig.json` đang đặt.
 */
async function requestJson(
  path: string,
  init: RequestInit,
  signal: AbortSignal | undefined,
): Promise<unknown> {
  if (signal?.aborted === true) throw new DOMException('Đã huỷ', 'AbortError');

  const controller = new AbortController();
  /*
   * Ghi nhận bằng CỜ chứ không đọc lại `signal.aborted` ở khối catch: `aborted` đổi giá trị
   * trong lúc chạy, nhưng TypeScript đã thu hẹp nó thành `false` ngay từ câu lệnh chặn phía
   * trên và giữ nguyên đến hết hàm — so lại ở dưới sẽ báo lỗi "không bao giờ đúng".
   */
  let cancelledByCaller = false;
  const forward = () => {
    cancelledByCaller = true;
    controller.abort();
  };
  signal?.addEventListener('abort', forward, { once: true });

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(`${ORIGIN}${path}`, { ...init, signal: controller.signal });

    if (!response.ok) {
      throw new MarketFeedError('http', `Finbox trả về HTTP ${String(response.status)}.`);
    }

    try {
      return await response.json();
    } catch {
      throw new MarketFeedError('malformed', 'Phản hồi của Finbox không phải JSON đọc được.');
    }
  } catch (error) {
    if (error instanceof MarketFeedError) throw error;
    // Nơi gọi chủ động huỷ: để nguyên lỗi huỷ, đừng biến nó thành "lỗi mạng" trên màn.
    if (cancelledByCaller) throw error;

    throw new MarketFeedError(
      'network',
      timedOut ? 'Gọi Finbox quá hạn chờ.' : 'Không kết nối được tới Finbox.',
    );
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forward);
  }
}

const JSON_POST: Pick<RequestInit, 'method' | 'headers'> = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};

export const FINBOX_FEED: MarketFeed = {
  async listTickers(signal?: AbortSignal): Promise<ReadonlyArray<TickerRef>> {
    const body = await requestJson('/bp/codes', { method: 'GET' }, signal);
    const list = parseTickerList(body);

    // Gọi được nhưng ra rỗng nghĩa là hình dạng đã đổi — nói thẳng, đừng để màn hiện danh sách
    // trống như thể thị trường không có mã nào.
    if (list.length === 0) {
      throw new MarketFeedError('malformed', 'Finbox không trả về mã nào trong danh sách.');
    }

    return list;
  },

  async snapshots(
    codes: ReadonlyArray<string>,
    signal?: AbortSignal,
  ): Promise<ReadonlyMap<string, TickerSnapshot>> {
    const wanted = [...new Set(codes.map((code) => code.trim().toUpperCase()))].filter(
      (code) => code !== '',
    );
    // Không mã nào thì không gọi: một lời gọi rỗng vẫn là một lần rời máy người dùng.
    if (wanted.length === 0) return new Map();

    const body = await requestJson(
      '/data/symbols',
      { ...JSON_POST, body: JSON.stringify({ symbols: wanted }) },
      signal,
    );

    return parseSnapshots(body);
  },
};
