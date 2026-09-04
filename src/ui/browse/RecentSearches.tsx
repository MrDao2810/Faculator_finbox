'use client';

import Link from 'next/link';

import { useT } from '@/application/preferences-context';

import styles from './RecentSearches.module.css';

/**
 * Bấm một chip làm gì — hai màn dùng khối này muốn hai chuyện khác hẳn nhau, và kiểu union ở đây
 * bắt phải chọn đúng MỘT, sai là lỗi typecheck chứ không phải lỗi lúc chạy.
 *
 * `onPick` — gọi lại tại chỗ, chip chỉ lọc chính màn đang đứng (màn tìm WF-09).
 * `hrefFor` — chip là `<a>` thật sang màn khác (trang chủ). Phải là link chứ không phải nút gọi
 * `router.push`: `useRouter` đòi app router đã mount, mà `HomeSearchPanel` được kiểm bằng
 * `render()` trần trong jsdom — 14 ca đỏ ngay khi thử. Link thật còn mở được tab mới và điều
 * hướng được cả khi JS chưa tải xong, đúng lẽ mà `FormulaCard` đã theo.
 */
type RecentSearchesAction =
  | { onPick: (term: string) => void; hrefFor?: never }
  | { hrefFor: (term: string) => string; onPick?: never };

export type RecentSearchesProps = {
  terms: ReadonlyArray<string>;
  onClear: () => void;
  /**
   * `block` — có tiêu đề "TÌM GẦN ĐÂY" và nút chữ "Xoá lịch sử" trên một hàng riêng. Dùng ở màn
   * tìm WF-09, nơi khối này là NỘI DUNG CHÍNH của trạng thái nhàn nên xứng đáng một tiêu đề.
   *
   * `inline` — bỏ tiêu đề, nút xoá thu về một icon thùng rác đứng cuối hàng chip. Dùng ngay dưới
   * ô tìm ở trang chủ (bản thiết kế Figma đợt này), nơi hàng chip chỉ là phụ trợ của ô tìm chứ
   * không phải một mục ngang hàng với "Công thức dùng hằng ngày" — cho nó một `<h2>` nữa là dựng
   * thêm một cấp tiêu đề giả giữa ô tìm và kệ.
   */
  variant?: 'block' | 'inline';
} & RecentSearchesAction;

/**
 * Chip "Tìm gần đây" — WF-09 trạng thái A (gói WBS 3.1.3).
 *
 * Không tự đọc localStorage: màn gọi nó đọc trong `useEffect` rồi truyền xuống. Đọc ngay lúc
 * khởi tạo state sẽ lệch hydration vì bản build là HTML tĩnh — bài học của đợt 2. Điều này càng
 * chặt ở trang chủ: `terms` rỗng thì component trả `null`, nên lần render đầu ở máy khách vẫn
 * giống hệt `out/index.html`.
 *
 * LDR-04: chỉ là tên những công thức chính người dùng đã CHỌN trong kết quả tìm, nằm trên máy
 * họ, có nút xoá hết.
 */
export function RecentSearches({
  terms,
  onPick,
  hrefFor,
  onClear,
  variant = 'block',
}: RecentSearchesProps) {
  const t = useT();

  if (terms.length === 0) return null;

  const chips = (
    <ul className={styles.chips}>
      {terms.map((term) => (
        <li key={term}>
          {hrefFor !== undefined ? (
            <Link className={styles.chip} href={hrefFor(term)}>
              {term}
            </Link>
          ) : (
            <button
              type="button"
              className={styles.chip}
              onClick={() => {
                onPick?.(term);
              }}
            >
              {term}
            </button>
          )}
        </li>
      ))}

      {variant === 'inline' && (
        <li>
          {/* Nút xoá ở dạng inline là icon, nên nhãn phải nằm ở `aria-label` — NFR-USA-06. */}
          <button
            type="button"
            className={styles.clearIcon}
            onClick={onClear}
            aria-label={t('search.recent.clear')}
            title={t('search.recent.clear')}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M9 7V4h6v3" />
              <path d="M6.5 7l1 13h9l1-13M10 11v5M14 11v5" />
            </svg>
          </button>
        </li>
      )}
    </ul>
  );

  if (variant === 'inline') {
    // Bỏ `<h2>` thì `aria-labelledby` cũng mất chỗ trỏ tới — nhãn chuyển thẳng lên `<section>`.
    return (
      <section className={styles.recent} aria-label={t('search.recent.title')}>
        {chips}
      </section>
    );
  }

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

      {chips}
    </section>
  );
}
