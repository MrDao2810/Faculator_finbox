/**
 * Tầng APPLICATION — chip "Tìm gần đây" của WF-09 (gói WBS 3.1.3).
 *
 * Cùng khuôn với `preferences.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm localStorage do màn tìm kiếm gọi trong `useEffect`.
 *
 * LDR-04 · NFR-SEC-01: chỉ lưu tên công thức người dùng đã CHỌN từ kết quả tìm (không phải chuỗi
 * đã gõ), nằm trên máy, không gửi đi đâu.
 */

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const RECENT_SEARCHES_KEY = 'ffb.recent.v1';

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
