'use client';

/**
 * Tầng APPLICATION — một kho "Tìm gần đây", đọc/ghi/xoá (gói WBS 3.1.3).
 *
 * ## Vì sao có hook này
 *
 * Hai màn dùng chip "Tìm gần đây" — trang chủ và màn tìm WF-09 — và trước đợt này mỗi màn chép
 * một bản gần như y hệt của ba mẩu: `useEffect` đọc kho lúc mount, khối ghi bọc `try/catch`, và
 * `clearRecent()`. Bản chép ở trang chủ còn thiếu hẳn mẩu GHI, nên nó bày ra thứ màn kia ghi hộ.
 *
 * Nay một bản duy nhất, và **khoá là tham số**: đó chính là chỗ tách hai kho ra khỏi nhau
 * (`RECENT_SEARCHES_KEY` vs `HOME_RECENT_SEARCHES_KEY` — xem docblock `recent-searches.ts`).
 *
 * ## Hai ràng buộc không được nới
 *
 * 1. **State khởi tạo bằng hằng số rỗng**, chỉ đọc `localStorage` trong `useEffect`. Bản build là
 *    HTML tĩnh (`output: 'export'`) nên lượt render đầu ở máy khách phải giống hệt lúc build —
 *    đọc ngay lúc khởi tạo state là lệch hydration (bài học đợt 2). Chặt nhất ở trang chủ, URL
 *    priority 1.0 của sitemap.
 * 2. **Mọi lần chạm `localStorage` bọc `try/catch`.** Trình duyệt ở chế độ riêng tư ném lỗi ngay
 *    ở `getItem`; màn vẫn phải chạy, chỉ là không có lịch sử.
 */

import { useCallback, useEffect, useState } from 'react';

import { addRecentSearch, parseRecentSearches, serializeRecentSearches } from './recent-searches';

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
  /** Xoá sạch kho này. Không đụng kho của màn kia. */
  clear: () => void;
}

/**
 * @param storageKey Khoá `localStorage` của kho — mỗi ô tìm một khoá riêng.
 */
export function useRecentSearches(storageKey: string): UseRecentSearchesResult {
  const [terms, setTerms] = useState<ReadonlyArray<string>>([]);

  useEffect(() => {
    try {
      setTerms(parseRecentSearches(window.localStorage.getItem(storageKey)));
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư chẳng hạn) thì coi như chưa tìm gì.
      setTerms([]);
    }
  }, [storageKey]);

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
