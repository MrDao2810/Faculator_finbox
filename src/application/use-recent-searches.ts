'use client';

/**
 * Tầng APPLICATION — một kho "Tìm gần đây", đọc/ghi/xoá (gói WBS 3.1.3).
 *
 * ## Vì sao có hook này
 *
 * Hai màn dùng chip "Tìm gần đây" — màn Công thức và màn tìm WF-09 — và trước khi có hook mỗi màn
 * chép một bản gần như y hệt của ba mẩu: `useEffect` đọc kho lúc mount, khối ghi bọc `try/catch`,
 * và `clearRecent()`. Bản chép thứ hai từng thiếu hẳn mẩu GHI, nên nó bày ra thứ màn kia ghi hộ.
 *
 * Nay một bản duy nhất, và **khoá là tham số** — hai ô tìm hiện dùng chung `RECENT_SEARCHES_KEY`
 * (xem docblock `recent-searches.ts` về đợt tách rồi gộp lại), nhưng hook không giả định điều đó.
 *
 * ## Hai ràng buộc không được nới
 *
 * 1. **State khởi tạo bằng hằng số rỗng**, chỉ đọc `localStorage` trong `useEffect`. Bản build là
 *    HTML tĩnh (`output: 'export'`) nên lượt render đầu ở máy khách phải giống hệt lúc build —
 *    đọc ngay lúc khởi tạo state là lệch hydration (bài học đợt 2).
 * 2. **Mọi lần chạm `localStorage` bọc `try/catch`.** Trình duyệt ở chế độ riêng tư ném lỗi ngay
 *    ở `getItem`; màn vẫn phải chạy, chỉ là không có lịch sử.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  addRecentSearch,
  mergeRecentSearches,
  parseRecentSearches,
  serializeRecentSearches,
} from './recent-searches';

export interface UseRecentSearchesResult {
  /** Danh sách đang bày, mới nhất đứng đầu. Rỗng ở lượt render đầu tiên, luôn luôn. */
  terms: ReadonlyArray<string>;
  /**
   * Ghi một mục lên đầu kho.
   *
   * Chuỗi rỗng hay dài bất thường thì không làm gì — `addRecentSearch()` đã lo, ở đây không
   * kiểm lại lần nữa để chỉ có MỘT nơi định nghĩa thế nào là mục hợp lệ.
   */
  remember: (term: string) => void;
  /** Xoá sạch kho này. */
  clear: () => void;
}

export interface UseRecentSearchesOptions {
  /**
   * Khoá của một kho CŨ cần gộp vào kho này ở lần đọc đầu, rồi xoá.
   *
   * Sinh ra cho `LEGACY_HOME_RECENT_SEARCHES_KEY`: trang chủ gộp vào màn Công thức nên kho riêng
   * của nó hết người ghi, nhưng lịch sử người dùng đã có trong đó thì không được mất. Gộp xong là
   * xoá ngay — để lại thì lần mở sau lại gộp, và mục người dùng vừa xoá khỏi kho chung sống lại.
   */
  absorbKey?: string;
}

/**
 * @param storageKey Khoá `localStorage` của kho.
 */
export function useRecentSearches(
  storageKey: string,
  { absorbKey }: UseRecentSearchesOptions = {},
): UseRecentSearchesResult {
  const [terms, setTerms] = useState<ReadonlyArray<string>>([]);

  useEffect(() => {
    try {
      const current = parseRecentSearches(window.localStorage.getItem(storageKey));
      const legacyRaw = absorbKey === undefined ? null : window.localStorage.getItem(absorbKey);

      if (absorbKey === undefined || legacyRaw === null) {
        setTerms(current);
        return;
      }

      const merged = mergeRecentSearches(current, parseRecentSearches(legacyRaw));
      if (merged.length > 0) {
        window.localStorage.setItem(storageKey, serializeRecentSearches(merged));
      }
      // Xoá SAU khi ghi: ghi hỏng (bộ nhớ đầy) thì kho cũ còn nguyên cho lần sau gộp lại.
      window.localStorage.removeItem(absorbKey);
      setTerms(merged);
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư chẳng hạn) thì coi như chưa tìm gì.
      setTerms([]);
    }
  }, [storageKey, absorbKey]);

  /*
   * Ghi bằng dạng cập nhật hàm chứ không đọc `terms` từ closure: hai lần bấm sát nhau trong cùng
   * một lượt render sẽ cùng thấy một danh sách cũ, và lần sau đè mất lần trước.
   */
  const remember = useCallback(
    (term: string) => {
      setTerms((current) => {
        const next = addRecentSearch(current, term);
        try {
          window.localStorage.setItem(storageKey, serializeRecentSearches(next));
        } catch {
          // Không ghi được thì thôi, đừng làm hỏng màn.
        }
        return next;
      });
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    setTerms([]);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Xoá không được thì hàng chip trên màn vẫn sạch; lần mở sau sẽ hiện lại.
    }
  }, [storageKey]);

  return { terms, remember, clear };
}
