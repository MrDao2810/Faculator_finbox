/**
 * Tầng APPLICATION — chỗ cất danh sách mã đã tải về (gói "Danh mục dùng số liệu thật").
 *
 * Cùng khuôn `recent-searches.ts` và `portfolio-store.ts`: phần thuần nằm ở đây, không import
 * React, nên test được bằng Node; phần chạm `localStorage` do màn gọi trong `useEffect`.
 *
 * ── Vì sao phải tự cache, dù đã có service worker ───────────────────────────────────────────
 *
 * `handles()` trong `public/sw.js` loại thẳng mọi request khác origin, nên danh sách mã tải từ
 * `dcs.finbox.vn` KHÔNG nằm trong kho của service worker. Không có lớp này thì mở màn lúc mất
 * mạng là ô chọn mã rỗng trơn — trái NFR-REL-02 ("dùng được khi mất mạng").
 *
 * Hạn dùng ở đây rộng tay (24 h) vì danh sách mã đổi vài lần một năm, còn giá thì đổi từng
 * phiên — nên thị giá có kho riêng, luật riêng: xem `price-cache-store.ts`.
 *
 * ⚠ Chỗ này từng ghi "cache danh sách mã chứ KHÔNG cache thị giá", với lý do hiện một cái giá cũ
 * mà không nói rõ cũ là đúng loại "số sai mà trông có lý" mà FR-06 muốn tránh. Lý do đó vẫn
 * nguyên giá trị; thứ đã đổi là nay `TickerSnapshot` mang `asOfDate` nên màn nói được rõ giá
 * thuộc phiên nào. Kho giá ra đời kèm đúng ràng buộc ấy — đọc docblock của nó trước khi sửa.
 */

import type { TickerRef } from '@/data';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const TICKER_LIST_KEY = 'ffb.tickers.v1';

/**
 * Hạn dùng của bản cache, tính bằng mili giây.
 *
 * Một ngày: đủ ngắn để mã mới lên sàn xuất hiện trong vòng một hôm, đủ dài để người dùng mở
 * app nhiều lần trong ngày không phải tải lại 82 kB.
 */
export const TICKER_LIST_TTL_MS = 24 * 60 * 60 * 1000;

/** Trần số mục đọc vào. Thị trường có ~1.650 mã; để dư phòng ngày sàn thêm hàng loạt. */
const MAX_TICKERS = 4000;

export interface CachedTickerList {
  /** Mốc thời gian lấy về, mili giây kể từ epoch. */
  fetchedAt: number;
  items: ReadonlyArray<TickerRef>;
}

/**
 * Đọc bản cache từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném: chuỗi hỏng, thiếu mốc thời gian, phần tử sai hình dạng đều rơi về `null`
 * — nơi gọi coi như chưa có cache và đi tải, chứ không thấy màn trắng.
 */
export function parseCachedTickers(raw: string | null | undefined): CachedTickerList | null {
  if (raw === null || raw === undefined || raw.trim() === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;

  const fetchedAt = record.fetchedAt;
  if (typeof fetchedAt !== 'number' || !Number.isFinite(fetchedAt) || fetchedAt <= 0) return null;
  if (!Array.isArray(record.items)) return null;

  const items: TickerRef[] = [];
  for (const item of record.items) {
    if (typeof item !== 'object' || item === null) continue;
    const entry = item as Record<string, unknown>;
    if (typeof entry.code !== 'string' || typeof entry.name !== 'string') continue;

    const code = entry.code.trim().toUpperCase();
    const name = entry.name.trim();
    if (code === '' || name === '') continue;

    items.push({ code, name });
    if (items.length >= MAX_TICKERS) break;
  }

  // Cache rỗng không phải cache: để nơi gọi đi tải lại thay vì tin một danh sách trống.
  return items.length === 0 ? null : { fetchedAt, items };
}

/** Chuỗi JSON để ghi vào localStorage. `now` truyền vào, Application không tự lấy đồng hồ. */
export function serializeCachedTickers(items: ReadonlyArray<TickerRef>, now: number): string {
  return JSON.stringify({ fetchedAt: now, items: items.slice(0, MAX_TICKERS) });
}

/**
 * Bản cache còn dùng được mà không cần tải lại hay không.
 *
 * `now` là tham số bắt buộc chứ không gọi `Date.now()` bên trong — cùng lý do
 * `summarisePortfolio()` bắt buộc nhận `asOf` và `resolveConstant()` nhận `asOf` (NFR-REL-03):
 * hàm thuần thì test không phải giả lập đồng hồ.
 *
 * Mốc thời gian nằm ở TƯƠNG LAI cũng coi là hết hạn — máy người dùng chỉnh sai giờ thì một bản
 * cache "của ngày mai" sẽ không bao giờ tự làm mới nữa.
 */
export function isTickerListFresh(
  cached: CachedTickerList | null,
  now: number,
  ttlMs = TICKER_LIST_TTL_MS,
): boolean {
  if (cached === null) return false;
  const age = now - cached.fetchedAt;
  return age >= 0 && age < ttlMs;
}
