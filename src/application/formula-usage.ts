/**
 * Tầng APPLICATION — lịch sử mở công thức, dùng để cá nhân hoá khối "Công thức dùng hằng ngày"
 * của trang chủ (FR-20).
 *
 * Cùng khuôn với `recent-searches.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm `localStorage` do màn chi tiết và trang chủ gọi trong `useEffect`.
 *
 * Trước gói này khối trên trang chủ là kệ ghim tay thuần: 18 công thức gắn cờ `isFeatured` lúc
 * build, ai vào cũng thấy y hệt nhau. Tên khối hứa cá nhân hoá mà mã thì không làm gì cả.
 *
 * LDR-04 · NFR-SEC-01: chỉ lưu id công thức, nằm trên máy, không gửi đi đâu.
 *
 * ── Vì sao file này KHÔNG import `FORMULA_SUMMARIES` ──────────────────────────────────────
 *
 * Tra id có thật hay không là việc của chỗ gọi: `knownIds` truyền vào qua tham số. Import chỉ
 * mục 111 công thức vào đây là kéo nó theo vào gói của 111 trang chi tiết — nơi `recordFormulaUsage`
 * được gọi — mà gói đó vốn đã vượt ngưỡng đo được. Trang chủ thì đã có sẵn chỉ mục trong gói,
 * nên nó không mất gì khi tự truyền vào.
 */

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const FORMULA_USAGE_KEY = 'ffb.usage.v1';

/** Trên 18 ô của khối một ít, để còn chỗ cho ứng viên chen lên. ~24 × 40 B ≈ 1 kB. */
export const MAX_USAGE_ENTRIES = 24;

/** Chặn số phình vô hạn, và chặn luôn giá trị bịa do sửa tay trong DevTools. */
export const MAX_USAGE_COUNT = 9999;

/** Chu kỳ bán rã của điểm dùng: 30 ngày. */
export const USAGE_HALF_LIFE_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Điểm tối thiểu để một công thức được lấy suất trên khối.
 *
 * 1,5 làm hai việc bằng một con số: mở đúng một lần hôm nay được 1,0 — chưa đủ, nên bấm nhầm
 * không xáo trang chủ; còn mở 10 lần nhưng đã 90 ngày trước chỉ còn 1,25 — cũng không đủ, nên
 * thói quen cũ tự nhường chỗ.
 */
export const USAGE_MIN_SCORE = 1.5;

/**
 * Số suất tối đa trên khối dành cho lịch sử.
 *
 * Sáu vì lưới là `minmax(150px, 1fr)`: ở 360px là hai cột, nên 6 ô đúng bằng ba hàng đầu tiên
 * nhìn thấy được. Trần này cũng bảo đảm khối luôn còn ít nhất 12 ghim tay — nó vẫn phải giới
 * thiệu được thứ người dùng chưa biết, không chỉ nhắc lại thứ họ đã dùng.
 */
export const PERSONAL_SLOTS = 6;

/** Id công thức là slug; mọi thứ khác là rác đọc lên từ máy người dùng. */
const ID_PATTERN = /^[a-z0-9-]{1,40}$/;

/** Một dòng lịch sử: công thức nào, mở bao nhiêu lần, lần gần nhất khi nào. */
export interface FormulaUsage {
  /** Id công thức, dạng slug. */
  id: string;
  /** Số lượt dùng thật, số nguyên trong 1..`MAX_USAGE_COUNT`. */
  count: number;
  /** Mốc lượt gần nhất, epoch ms. */
  at: number;
}

/**
 * Điểm dùng tại thời điểm `now`, suy giảm một nửa sau mỗi `USAGE_HALF_LIFE_MS`.
 *
 * Suy giảm áp lúc ĐỌC chứ không tích luỹ lúc ghi, nên `count` và `at` giữ nguyên là dữ liệu
 * trung thực — soi bằng mắt trong DevTools cũng hiểu, và mọi ca test đều tính tay được.
 *
 * `now` phải TRUYỀN VÀO, tuyệt đối không gọi `Date.now()` trong này: lấy giờ hệ thống giữa lúc
 * render là đường thẳng tới lệch hydration, cùng lý do màn chi tiết nhận `asOf` qua prop.
 */
export function usageScore(entry: FormulaUsage, now: number): number {
  // Đồng hồ máy chạy trước làm `at` nằm ở tương lai; không kẹp thì 0.5^âm > 1 và điểm nổ.
  const age = Math.max(0, now - entry.at);
  return entry.count * Math.pow(0.5, age / USAGE_HALF_LIFE_MS);
}

/** Một phần tử đọc lên có dùng được không? Trả về bản đã làm sạch, hoặc `null`. */
function cleanEntry(item: unknown): FormulaUsage | null {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return null;

  const { id, count, at } = item as { id?: unknown; count?: unknown; at?: unknown };

  if (typeof id !== 'string' || !ID_PATTERN.test(id)) return null;
  if (typeof at !== 'number' || !Number.isFinite(at) || at <= 0) return null;
  // Số lượt không phải số nguyên dương thì phần tử không mang thông tin gì — bỏ hẳn.
  if (typeof count !== 'number' || !Number.isInteger(count) || count <= 0) return null;

  // Nhưng số lượt VƯỢT TRẦN thì kẹp chứ đừng bỏ: nó vẫn nói đúng "công thức này hay dùng".
  return { id, count: Math.min(count, MAX_USAGE_COUNT), at };
}

/**
 * Đọc lịch sử từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng, không phải mảng, lẫn phần tử rác đều bị bỏ chứ không
 * làm mất cả danh sách — mất lịch sử thì trang chủ chỉ trở về đúng 18 ghim, còn ném lỗi thì
 * hỏng cả màn.
 *
 * Không sắp xếp lại: mảng ghi ra đã theo thứ tự điểm giảm dần, nên cắt ở cuối là cắt đúng phần
 * kém nhất. Sắp ở đây cũng không được — hàm này không có `now`.
 */
export function parseFormulaUsage(raw: string | null | undefined): FormulaUsage[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const clean: FormulaUsage[] = [];
  for (const item of parsed) {
    const entry = cleanEntry(item);
    if (entry === null) continue;
    // Đọc từ máy người dùng nên vẫn phải chống trùng, phòng bản cũ ghi lỗi.
    if (clean.some((existing) => existing.id === entry.id)) continue;
    clean.push(entry);
    if (clean.length >= MAX_USAGE_ENTRIES) break;
  }

  return clean;
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeFormulaUsage(list: ReadonlyArray<FormulaUsage>): string {
  return JSON.stringify(list.slice(0, MAX_USAGE_ENTRIES));
}

/**
 * Ghi nhận một lượt dùng thật của `id` tại thời điểm `now`.
 *
 * Trả về mảng mới đã sắp theo điểm giảm dần, để lần `parseFormulaUsage` sau cắt đúng chỗ.
 * Đầu vào không dùng được (`now` vô nghĩa, `id` sai dạng) thì trả bản sao nguyên vẹn — ghi
 * hỏng còn tệ hơn không ghi.
 */
export function recordFormulaUsage(
  list: ReadonlyArray<FormulaUsage>,
  rawId: string,
  now: number,
): FormulaUsage[] {
  if (!Number.isFinite(now) || now <= 0) return [...list];
  if (!ID_PATTERN.test(rawId)) return [...list];

  const existing = list.find((entry) => entry.id === rawId);
  const next: FormulaUsage =
    existing === undefined
      ? { id: rawId, count: 1, at: now }
      : {
          id: rawId,
          count: Math.min(existing.count + 1, MAX_USAGE_COUNT),
          // Đồng hồ máy bị chỉnh lùi không được kéo mốc gần nhất đi ngược.
          at: Math.max(existing.at, now),
        };

  const rest = list.filter((entry) => entry.id !== rawId);
  const merged = [next, ...rest].sort((a, b) => usageScore(b, now) - usageScore(a, now));

  // Đầy chỗ thì đuổi mục ĐIỂM THẤP NHẤT, không phải mục cũ nhất: một công thức mở 20 lần hồi
  // tháng trước vẫn đáng giữ hơn một công thức mở đúng một lần hôm kia.
  return merged.slice(0, MAX_USAGE_ENTRIES);
}

export interface RankFeaturedInput {
  /** Thứ tự ghim tay lúc build — cũng là thứ tự dự phòng khi chưa có lịch sử. */
  pinnedIds: ReadonlyArray<string>;
  /** Lịch sử đã đọc từ máy. */
  usage: ReadonlyArray<FormulaUsage>;
  /** Id thật sự có trong Registry; id ngoài tập này bị bỏ qua chứ không làm vỡ khối. */
  knownIds: ReadonlySet<string>;
  /** Mốc thời gian để chấm điểm — truyền vào, xem `usageScore`. */
  now: number;
  /** Số suất tối đa dành cho lịch sử. */
  slots?: number;
}

/**
 * Thứ tự hiển thị cuối cùng của khối: công thức hay mở lên trước, phần còn lại là ghim tay.
 *
 * Hai bất biến, và cả hai đều có test riêng vì cả hai đều nhìn thấy được trên màn:
 *
 *  - độ dài LUÔN đúng bằng `pinnedIds.length` — khối không được co giãn theo lịch sử;
 *  - không id nào lặp — một công thức đã lấy suất cá nhân hoá thì không xuất hiện lần hai
 *    ở phần ghim.
 *
 * Công thức hay mở mà KHÔNG nằm trong danh sách ghim vẫn được chèn lên đầu, và ghim xếp cuối
 * rơi ra. Đó chính là chỗ khác nhau giữa "cá nhân hoá thật" và "chỉ sắp xếp lại 18 ô có sẵn".
 *
 * KHÔNG lọc theo chế độ Cơ bản/Nâng cao: khối FR-20 vốn được miễn lọc (xem docblock của
 * `HomeSearchPanel`), lọc ở đây sẽ làm số ô đổi mỗi lần bấm nút chế độ.
 */
export function rankFeaturedIds({
  pinnedIds,
  usage,
  knownIds,
  now,
  slots = PERSONAL_SLOTS,
}: RankFeaturedInput): string[] {
  /** Vị trí trong danh sách ghim, dùng làm mốc phá hoà cuối cùng cho tất định. */
  const pinnedRank = new Map(pinnedIds.map((id, index) => [id, index]));

  const top = usage
    .filter((entry) => usageScore(entry, now) >= USAGE_MIN_SCORE)
    .filter((entry) => knownIds.has(entry.id))
    .sort((a, b) => {
      const byScore = usageScore(b, now) - usageScore(a, now);
      if (byScore !== 0) return byScore;
      const byRecency = b.at - a.at;
      if (byRecency !== 0) return byRecency;
      // Hoà cả điểm lẫn mốc: bám thứ tự ghim, rồi bám id — kết quả phải tất định.
      const rankA = pinnedRank.get(a.id) ?? Number.MAX_SAFE_INTEGER;
      const rankB = pinnedRank.get(b.id) ?? Number.MAX_SAFE_INTEGER;
      return rankA !== rankB ? rankA - rankB : a.id.localeCompare(b.id);
    })
    .slice(0, Math.max(0, slots))
    .map((entry) => entry.id);

  // Khử trùng đúng MỘT chỗ, ngay tại đây.
  const seen = new Set(top);
  const rest = pinnedIds.filter((id) => !seen.has(id));

  return [...top, ...rest].slice(0, pinnedIds.length);
}

/** Hai thứ tự có trùng khít không — dùng để KHÔNG dựng lại khối khi chẳng có gì đổi. */
export function sameOrder(a: ReadonlyArray<string>, b: ReadonlyArray<string>): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}
