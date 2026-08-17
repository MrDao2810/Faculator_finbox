'use client';

import { useT } from '@/application/preferences-context';

import styles from './RecentSearches.module.css';

export interface RecentSearchesProps {
  terms: ReadonlyArray<string>;
  onPick: (term: string) => void;
  onClear: () => void;
}

/**
 * Chip "Tìm gần đây" — WF-09 trạng thái A (gói WBS 3.1.3).
 *
 * Không tự đọc localStorage: màn tìm kiếm đọc trong `useEffect` rồi truyền xuống. Đọc ngay
 * lúc khởi tạo state sẽ lệch hydration vì bản build là HTML tĩnh — bài học của đợt 2.
 *
 * LDR-04: chỉ là những chuỗi chính người dùng đã gõ, nằm trên máy họ, có nút xoá hết.
 */
export function RecentSearches({ terms, onPick, onClear }: RecentSearchesProps) {
  const t = useT();

  if (terms.length === 0) return null;

  return (
    <section className={styles.recent} aria-labelledby="recent-title">
      <div className={styles.head}>
        <h2 className={styles.title} id="recent-title">
          {t('search.recent.title')}
        </h2>
        <button type="button" className={styles.clear} onClick={onClear}>
          {t('search.recent.clear')}
        </button>
      </div>

      <ul className={styles.chips}>
        {terms.map((term) => (
          <li key={term}>
            <button
              type="button"
              className={styles.chip}
              onClick={() => {
                onPick(term);
              }}
            >
              {term}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
