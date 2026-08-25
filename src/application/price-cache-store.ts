/**
 * Tầng APPLICATION — chỗ cất thị giá đã tra được của màn Danh mục.
 *
 * Cùng khuôn `ticker-list-store.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm `localStorage` do màn gọi trong `useEffect`.
 *
 * ── Vì sao NAY mới cache giá, trước thì cố ý không ──────────────────────────────────────────
 *
 * `ticker-list-store.ts` từng ghi thẳng lý do không cache thị giá: *"Hiện một cái giá cũ mà
 * không nói rõ cũ là đúng loại số sai mà trông có lý mà FR-06 muốn tránh."* Lý do ấy đúng, và
 * nó chưa bao giờ là "cấm cache" — nó là **cấm cache mà im lặng**.
 *
 * Thứ đã đổi: `TickerSnapshot` nay mang `asOfDate`, lấy từ field `date` của Finbox và đã đối
 * chiếu với `GET /v1/getMarketDates` là ngày phiên thật. Có ngày phiên thì màn nói được "giá
 * phiên 21/08/2026, chưa làm mới được" — lúc đó con số không còn "trông có lý" một cách mập mờ
 * nữa, nó là một sự thật có mốc thời gian, cùng loại với `effectiveFrom` của `MarketConstant`.
 *
 * Điều kiện đi kèm, và nó là điều kiện thật chứ không phải lời hứa suông: `PriceState` có thêm
 * trạng thái `'stale'`, và màn Danh mục **phải** hiện ngày phiên khi đang ở trạng thái đó.
 * `PortfolioScreen.test.tsx` có ca khoá đúng việc này.
 *
 * ── Cất gì và không cất gì ──────────────────────────────────────────────────────────────────
 *
 * Chỉ mã · tên · giá · ngày phiên. KHÔNG cất `fundamentals`: màn Danh mục không dùng tới, còn
 * màn chi tiết công thức thì tra lại theo `?ma=` bằng lời gọi riêng của nó. Cất thừa thì vừa
 * phình localStorage vừa tạo ra một bản số liệu cơ bản cũ mà không ai canh hạn dùng.
 */

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const PRICE_CACHE_KEY = 'ffb.prices.v1';

/**
 * Hạn dùng của bản cache, tính bằng mili giây.
 *
 * Bảy ngày. Cache này CHỈ được dùng khi lời gọi mạng hỏng, nên hạn dùng ở đây không quyết định
 * "bao lâu tra lại một lần" (lần nào vào màn cũng tra lại) mà quyết định "chấp nhận giá cũ tới
 * đâu khi không tra được". Một tuần là quá đủ cho một chuyến bay hay một đợt mất mạng; quá mốc
 * đó thì thà để màn nói thẳng là chưa có giá, còn hơn định giá cả danh mục bằng giá tháng trước.
 */
export const PRICE_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/** Trần số mã cất giữ. Khớp `MAX_HOLDINGS` — không cất giá của mã không nắm giữ. */
const MAX_QUOTES = 50;

/** Một mã trong kho: vừa đủ để định giá lại danh mục và nói rõ giá thuộc phiên nào. */
export interface CachedQuote {
  code: string;
  name: string;
  /** Đơn vị ₫. Luôn dương — mục thiếu giá không được cất, vì cất vào cũng vô dụng. */
  priceVnd: number;
  /** Ngày phiên dạng ISO 'YYYY-MM-DD'. `null` khi nguồn không trả. */
  asOfDate: string | null;
}

export interface CachedPrices {
  /** Mốc thời gian lấy về, mili giây kể từ epoch. */
  fetchedAt: number;
  items: ReadonlyArray<CachedQuote>;
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/**
 * Đọc kho giá từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném: chuỗi hỏng, thiếu mốc thời gian, phần tử sai hình dạng đều rơi về `null`
 * — nơi gọi coi như chưa có gì và đi tra mạng, chứ không định giá bằng dữ liệu rác.
 */
export function parseCachedPrices(raw: string | null | undefined): CachedPrices | null {
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

  const items: CachedQuote[] = [];
  for (const item of record.items) {
    if (typeof item !== 'object' || item === null) continue;
    const entry = item as Record<string, unknown>;

    const code = typeof entry.code === 'string' ? entry.code.trim().toUpperCase() : '';
    const price = entry.priceVnd;
    // Giá không dương thì bỏ hẳn mục: một mục giá 0 lọt vào sẽ định giá mã đó bằng 0 ₫ — đúng
    // thứ FR-06 cấm, và lần này còn cấm ở nơi người dùng không thể thấy nguyên nhân.
    if (code === '' || typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
      continue;
    }

    items.push({
      code,
      name: typeof entry.name === 'string' && entry.name.trim() !== '' ? entry.name.trim() : code,
      priceVnd: price,
      asOfDate: isIsoDate(entry.asOfDate) ? entry.asOfDate : null,
    });

    if (items.length >= MAX_QUOTES) break;
  }

  // Kho rỗng không phải kho: để nơi gọi coi như chưa có gì.
  return items.length === 0 ? null : { fetchedAt, items };
}

/** Chuỗi JSON để ghi vào localStorage. `now` truyền vào, Application không tự lấy đồng hồ. */
export function serializeCachedPrices(items: ReadonlyArray<CachedQuote>, now: number): string {
  return JSON.stringify({ fetchedAt: now, items: items.slice(0, MAX_QUOTES) });
}

/**
 * Kho còn dùng được để thay cho một lần tra hỏng hay không.
 *
 * `now` là tham số bắt buộc chứ không gọi `Date.now()` bên trong — cùng lý do
 * `summarisePortfolio()` bắt buộc nhận `asOf` (NFR-REL-03): hàm thuần thì test không phải giả
 * lập đồng hồ.
 *
 * Mốc thời gian nằm ở TƯƠNG LAI cũng coi là hết hạn — máy người dùng chỉnh sai giờ thì một bản
 * cache "của ngày mai" sẽ không bao giờ tự hết hạn nữa.
 */
export function isPriceCacheFresh(
  cached: CachedPrices | null,
  now: number,
  ttlMs = PRICE_CACHE_TTL_MS,
): boolean {
  if (cached === null) return false;
  const age = now - cached.fetchedAt;
  return age >= 0 && age < ttlMs;
}

/**
 * Ngày phiên cũ nhất trong một nhóm giá — thứ màn hình đem ra khoe với người dùng.
 *
 * Lấy CŨ NHẤT chứ không mới nhất: câu "giá phiên 21/08" phải đúng với **mọi** con số đang hiện,
 * nếu không thì một mã lỡ nhịp sẽ nấp sau ngày đẹp của mã khác. `null` khi không mã nào có ngày.
 */
export function oldestAsOf(items: ReadonlyArray<{ asOfDate: string | null }>): string | null {
  const dates = items
    .map((item) => item.asOfDate)
    .filter((date): date is string => date !== null)
    .sort((a, b) => a.localeCompare(b));

  return dates[0] ?? null;
}
