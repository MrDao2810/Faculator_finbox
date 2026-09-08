/**
 * Tầng APPLICATION — chip "Tìm gần đây" của WF-09 (gói WBS 3.1.3).
 *
 * Cùng khuôn với `preferences.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm localStorage do hook `use-recent-searches.ts` gọi trong `useEffect`.
 *
 * LDR-04 · NFR-SEC-01: chỉ lưu tên công thức người dùng đã CHỌN từ kết quả tìm (không phải chuỗi
 * đã gõ), nằm trên máy, không gửi đi đâu.
 *
 * ── HAI kho, không phải một ───────────────────────────────────────────────────────────────
 *
 * App có hai ô tìm, và chúng chạy trên hai phạm vi khác hẳn nhau: ô ở trang chủ chỉ với tới 18 ô
 * ghim của khối "Công thức dùng hằng ngày" (`FEATURED_POOL` trong `HomeSearchPanel`), còn màn tìm
 * WF-09 chạy trên cả thư viện. Dùng chung một kho thì một chip sinh ra ở màn này lại hiện ở màn
 * kia — nó nói với người dùng rằng họ đã tìm thứ đó Ở ĐÂY, trong khi không phải. Chuyện đó đã
 * xảy ra thật cho tới đợt này: trang chủ chỉ ĐỌC và XOÁ kho, không hề ghi, nên toàn bộ chip nó
 * bày ra là do màn tìm ghi hộ.
 *
 * Nên mỗi ô tìm một khoá, và chỉ màn nào ghi thì màn ấy đọc. Phần thuần bên dưới không biết gì
 * về khoá — nơi gọi truyền khoá vào `useRecentSearches()`.
 */

/**
 * Lịch sử của màn tìm WF-09 (`/tim-kiem/`).
 *
 * Khoá GIỮ NGUYÊN qua đợt tách: lịch sử người dùng đang có được ghi từ đúng màn này, nên nó ở
 * lại đúng chỗ của nó. Đổi khoá khi CẤU TRÚC dữ liệu đổi — ở đây cấu trúc không đổi.
 */
export const RECENT_SEARCHES_KEY = 'ffb.recent.v1';

/** Lịch sử RIÊNG của ô tìm trang chủ — xem docblock đầu file về vì sao hai kho. */
export const HOME_RECENT_SEARCHES_KEY = 'ffb.recent.home.v1';

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

/** Bỏ một từ khoá khỏi danh sách. */
export function removeRecentSearch(list: ReadonlyArray<string>, term: string): string[] {
  return list.filter((existing) => existing.toLowerCase() !== term.toLowerCase());
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeRecentSearches(list: ReadonlyArray<string>): string {
  return JSON.stringify(list.slice(0, MAX_RECENT_SEARCHES));
}
