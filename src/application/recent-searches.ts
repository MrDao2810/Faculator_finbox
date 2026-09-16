/**
 * Tầng APPLICATION — chip "Tìm gần đây" của WF-09 (gói WBS 3.1.3).
 *
 * Cùng khuôn với `preferences.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm localStorage do hook `use-recent-searches.ts` gọi trong `useEffect`.
 *
 * LDR-04 · NFR-SEC-01: chỉ lưu tên công thức người dùng đã CHỌN từ kết quả tìm (không phải chuỗi
 * đã gõ), nằm trên máy, không gửi đi đâu.
 *
 * ── MỘT kho lại, sau một thời gian là hai ─────────────────────────────────────────────────
 *
 * Từng có HAI kho, và lý do khi ấy đúng: ô tìm ở trang chủ chỉ với tới 18 ô ghim của khối
 * "Công thức dùng hằng ngày", còn màn tìm WF-09 chạy trên cả thư viện. Dùng chung một kho thì chip
 * sinh ra ở màn này hiện ở màn kia và nói với người dùng rằng họ đã tìm thứ đó Ở ĐÂY — sai.
 *
 * Ngày 15/09/2026 trang chủ gộp vào màn Công thức, và ô tìm ở đó lọc CẢ THƯ VIỆN — đúng phạm vi
 * của màn tìm. Lý do tách không còn, nên hai ô tìm quay về dùng chung `RECENT_SEARCHES_KEY`. Đây là
 * đảo quyết định có chủ đích, không phải quên bài học cũ: điều kiện sinh ra bài học ấy đã hết.
 *
 * Kho cũ của trang chủ không bị bỏ rơi trên máy người dùng: màn Công thức gộp nó vào kho chung ở
 * lần mở đầu tiên rồi xoá (`useRecentSearches(…, { absorbKey })`).
 */

/**
 * Lịch sử tìm — dùng chung cho ô tìm ở màn Công thức và màn tìm WF-09 (`/tim-kiem/`).
 *
 * Khoá GIỮ NGUYÊN qua cả hai đợt tách rồi gộp: lịch sử người dùng đang có vẫn ở đúng chỗ của nó.
 * Đổi khoá khi CẤU TRÚC dữ liệu đổi — ở đây cấu trúc không đổi.
 */
export const RECENT_SEARCHES_KEY = 'ffb.recent.v1';

/**
 * Kho CŨ của ô tìm trang chủ — chỉ còn được đọc đúng một lần để gộp vào `RECENT_SEARCHES_KEY`.
 *
 * Không ai ghi vào khoá này nữa. Nó còn tên ở đây vì phép gộp cần biết nó, và vì kho nằm trên máy
 * người dùng thì phải có đường dọn — xem `mergeRecentSearches()` và `SettingsScreen.tsx`.
 */
export const LEGACY_HOME_RECENT_SEARCHES_KEY = 'ffb.recent.home.v1';

/** WF-09 vẽ ba chip; giữ dư một ít để người dùng còn thấy lịch sử. */
export const MAX_RECENT_SEARCHES = 6;

/**
 * Chặn trên cho một mục — mốc an toàn phòng dữ liệu hỏng chứ không phải giới hạn thường gặp:
 * chuỗi ghi vào đây là tên công thức do `SearchScreen` truyền, tên dài nhất trong Registry cũng
 * chưa tới phân nửa mức này.
 */
const MAX_TERM_LENGTH = 60;

/**
 * Đọc danh sách từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng, không phải mảng, lẫn phần tử không phải chuỗi, hay
 * dài quá mức đều bị bỏ chứ không làm mất cả danh sách.
 */
export function parseRecentSearches(raw: string | null | undefined): string[] {
  if (raw === null || raw === undefined || raw.trim() === '') return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  const clean: string[] = [];
  for (const item of parsed) {
    if (typeof item !== 'string') continue;
    const term = item.trim();
    if (term === '' || term.length > MAX_TERM_LENGTH) continue;
    // Đọc từ máy người dùng nên vẫn phải chống trùng, phòng bản cũ ghi lỗi.
    if (clean.some((existing) => existing.toLowerCase() === term.toLowerCase())) continue;
    clean.push(term);
    if (clean.length >= MAX_RECENT_SEARCHES) break;
  }

  return clean;
}

/**
 * Thêm một từ khoá vào đầu danh sách.
 *
 * Gõ lại đúng từ cũ thì đẩy nó lên đầu chứ không tạo mục thứ hai; so trùng bỏ qua hoa thường
 * vì "P/E" và "p/e" là cùng một lần tìm. Chuỗi rỗng bị bỏ qua, danh sách giữ nguyên.
 */
export function addRecentSearch(
  list: ReadonlyArray<string>,
  rawTerm: string,
  max = MAX_RECENT_SEARCHES,
): string[] {
  const term = rawTerm.trim();
  if (term === '' || term.length > MAX_TERM_LENGTH) return [...list];

  const rest = list.filter((existing) => existing.toLowerCase() !== term.toLowerCase());
  return [term, ...rest].slice(0, Math.max(0, max));
}

/**
 * Gộp kho cũ vào kho đang dùng — phép gộp một lần của `LEGACY_HOME_RECENT_SEARCHES_KEY`.
 *
 * Kho đang dùng GIỮ thứ tự của nó và đứng trước: nó là lịch sử gần đây nhất người dùng tạo ra. Mục
 * của kho cũ nối sau, bỏ trùng không phân biệt hoa thường, và cả danh sách vẫn chịu đúng trần
 * `MAX_RECENT_SEARCHES` — gộp hai kho không được đẻ ra một hàng chip dài gấp đôi.
 */
export function mergeRecentSearches(
  primary: ReadonlyArray<string>,
  legacy: ReadonlyArray<string>,
): string[] {
  const merged: string[] = [];
  for (const term of [...primary, ...legacy]) {
    if (merged.some((existing) => existing.toLowerCase() === term.toLowerCase())) continue;
    merged.push(term);
    if (merged.length >= MAX_RECENT_SEARCHES) break;
  }
  return merged;
}

/** Bỏ một từ khoá khỏi danh sách. */
export function removeRecentSearch(list: ReadonlyArray<string>, term: string): string[] {
  return list.filter((existing) => existing.toLowerCase() !== term.toLowerCase());
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeRecentSearches(list: ReadonlyArray<string>): string {
  return JSON.stringify(list.slice(0, MAX_RECENT_SEARCHES));
}
