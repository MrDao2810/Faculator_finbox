/**
 * Tầng APPLICATION — sắp xếp bảng Công thức (phép tính đã lưu) của màn Danh mục, và chỗ nhớ cách sắp
 * trên máy (14/10/2026).
 *
 * Chủ dự án: *"trong phần công thức đang chưa có chức năng sort. thêm chức năng này cho tôi"* — đảo câu
 * "bảng Công thức giữ mới nhất lên đầu" chốt lúc dựng tính năng sắp của bảng Mã cùng ngày. Hỏi lại hai
 * điều, chủ dự án chọn: cột **Kết quả KHÔNG sắp** (một cột lẫn ₫, %, lần — xếp 1,08 lần cạnh 4.318 ₫
 * như thể so được là nói sai), và lúc chưa bấm gì tiêu đề **Ngày lưu mang sẵn mũi tên ↓**, vì bảng vốn
 * đã xếp mới nhất lên đầu — tiêu đề nói đúng thứ tự đang có. Bấm tiêu đề cột thay cho ô chọn chiều sắp
 * từng bị xoá ngày 12/10/2026; máy nhớ cách sắp như bảng Mã (`portfolio-sort.ts`).
 *
 * Khác bảng Mã ở MỘT chỗ, và nó theo từ lựa chọn thứ hai: không có trạng thái "không sắp". Thứ tự gốc
 * của bảng này LÀ một cột (Ngày lưu, mới trước), nên vòng bấm trả về cột ấy chứ không về `null`:
 *
 *   · Công thức, Mã: lần đầu từ A tới Z, lần hai đảo chiều, lần ba về mặc định (Ngày lưu ↓).
 *   · Ngày lưu: đang ở mặc định thì bấm là cũ nhất lên đầu, bấm nữa là về mặc định. Đang sắp theo cột
 *     khác thì bấm là về mặc định — chiều "hay cần nhất" của một cột ngày là mới trước, như Ngày mua.
 *
 * Dòng không có mã đứng CUỐI ở cả hai chiều, cùng lẽ với ô `_ _` của bảng Mã. Hai dòng bằng nhau giữ
 * thứ tự mới trước: bảng được xếp theo ngày lưu trước, rồi sắp ổn định theo cột được bấm.
 *
 * Cùng khuôn với `portfolio-sort.ts`: phần thuần, không import React, không ném lỗi.
 */

import type { SortDirection } from './portfolio-sort';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const SAVED_SORT_KEY = 'ffb.saved.sort.v1';

/** Ba cột sắp được, theo thứ tự trái sang phải. Kết quả không có ở đây — xem docblock file. */
export const SAVED_SORT_KEYS = ['title', 'code', 'savedAt'] as const;

export type SavedSortKey = (typeof SAVED_SORT_KEYS)[number];

export interface SavedSort {
  key: SavedSortKey;
  dir: SortDirection;
}

/** Thứ tự lúc chưa bấm gì: mới lưu nhất lên đầu. */
export const DEFAULT_SAVED_SORT: SavedSort = { key: 'savedAt', dir: 'desc' };

/** Ba trường của một dòng mà luật sắp cần. `title` là dòng chính in ở ô Công thức. */
export interface SavedSortFields {
  title: string;
  code: string | undefined;
  savedAt: number;
}

function firstDirection(key: SavedSortKey): SortDirection {
  return key === 'savedAt' ? 'desc' : 'asc';
}

export function isDefaultSavedSort(sort: SavedSort): boolean {
  return sort.key === DEFAULT_SAVED_SORT.key && sort.dir === DEFAULT_SAVED_SORT.dir;
}

/** Cách sắp sau khi bấm tiêu đề cột `key`. */
export function nextSavedSort(current: SavedSort, key: SavedSortKey): SavedSort {
  const first = firstDirection(key);
  if (current.key !== key) return { key, dir: first };
  if (current.dir === first) return { key, dir: first === 'asc' ? 'desc' : 'asc' };
  return DEFAULT_SAVED_SORT;
}

/**
 * So tên theo thứ tự chữ tiếng Việt (chữ có dấu đứng cạnh chữ gốc của nó, không dồn xuống cuối như khi
 * so theo mã ký tự), số trong tên theo giá trị ("Kỳ 2" trước "Kỳ 10"). Dựng một lần: dựng lại mỗi lượt
 * so là chậm thấy được.
 */
const TEN = new Intl.Collator('vi', { numeric: true });

function compare(a: SavedSortFields, b: SavedSortFields, sort: SavedSort): number {
  let raw: number;
  switch (sort.key) {
    case 'title':
      raw = TEN.compare(a.title, b.title);
      break;
    case 'code': {
      // Dòng không mã đứng cuối ở CẢ HAI chiều — chiều chỉ lật phần so có mã.
      if (a.code === undefined || b.code === undefined) {
        return a.code === b.code ? 0 : a.code === undefined ? 1 : -1;
      }
      // Mã chỉ có chữ Latin hoa và chữ số, nên so theo mã ký tự là đủ và giống nhau ở mọi máy.
      raw = a.code < b.code ? -1 : a.code > b.code ? 1 : 0;
      break;
    }
    case 'savedAt':
      raw = a.savedAt - b.savedAt;
      break;
  }
  return sort.dir === 'asc' ? raw : -raw;
}

/**
 * Các dòng theo cách sắp. Luôn trả bản sao. Xếp mới trước TRƯỚC, rồi sắp ổn định theo cột được bấm —
 * `Array.prototype.sort` ổn định từ ES2019 — nên hai dòng cùng tên hay cùng mã đứng mới trước.
 */
export function sortSavedRows<T>(
  rows: ReadonlyArray<T>,
  sort: SavedSort,
  fieldsOf: (row: T) => SavedSortFields,
): T[] {
  const newestFirst = [...rows].sort((a, b) => fieldsOf(b).savedAt - fieldsOf(a).savedAt);
  if (isDefaultSavedSort(sort)) return newestFirst;
  return newestFirst.sort((a, b) => compare(fieldsOf(a), fieldsOf(b), sort));
}

/**
 * Đọc cách sắp đã nhớ từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi. Kho trống, hỏng, cột lạ (kể cả `result` — cột không sắp) hay chiều lạ thì
 * về mặc định.
 */
export function parseSavedSort(raw: string | null | undefined): SavedSort {
  if (raw === null || raw === undefined || raw.trim() === '') return DEFAULT_SAVED_SORT;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return DEFAULT_SAVED_SORT;
  }

  if (typeof parsed !== 'object' || parsed === null) return DEFAULT_SAVED_SORT;
  const { key, dir } = parsed as { key?: unknown; dir?: unknown };
  if (!SAVED_SORT_KEYS.some((known) => known === key)) return DEFAULT_SAVED_SORT;
  if (dir !== 'asc' && dir !== 'desc') return DEFAULT_SAVED_SORT;
  return { key: key as SavedSortKey, dir };
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeSavedSort(sort: SavedSort): string {
  return JSON.stringify({ key: sort.key, dir: sort.dir });
}
