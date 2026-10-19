'use client';

import Link from 'next/link';

import { useT } from '@/application/preferences-context';

import styles from './RecentSearches.module.css';

/**
 * Bấm một chip làm gì — hai màn dùng khối này muốn hai chuyện khác hẳn nhau, và kiểu union ở đây
 * bắt phải chọn đúng MỘT, sai là lỗi typecheck chứ không phải lỗi lúc chạy.
 *
 * `onPick` — gọi lại tại chỗ, chip chỉ lọc chính màn đang đứng (màn tìm WF-09, màn Công thức).
 * `hrefFor` — chip là `<a>` thật sang màn khác. Trang chủ cũ dùng dạng này; từ khi nó gộp vào màn
 * Công thức (15/09/2026) không màn nào dùng, nhưng hợp đồng giữ lại vì nó đúng cho bất cứ ô tìm nào
 * nằm ở màn khác danh sách. Phải là link chứ không phải nút gọi `router.push`: `useRouter` đòi app
 * router đã mount, nên component không còn `render()` trần được trong jsdom — 14 ca đỏ ngay khi thử.
 * Link thật còn mở được tab mới và điều hướng được cả khi JS chưa tải xong, đúng lẽ `FormulaCard` theo.
 */
type RecentSearchesAction =
  | { onPick: (term: string) => void; hrefFor?: never }
  | { hrefFor: (term: string) => string; onPick?: never };

export type RecentSearchesProps = {
  terms: ReadonlyArray<string>;
  onClear: () => void;
  /**
   * Hai dạng cùng MỘT hình từ 19/10/2026 (bản vẽ của chủ dự án): hàng "Tìm gần đây" với icon thùng
   * rác dạt phải ở trên, hàng chip có icon đồng hồ ở dưới. Chỉ khác ngữ nghĩa và chỗ đứng:
   *
   * `block` — tiêu đề là `<h2>`. Dùng ở màn tìm WF-09, nơi khối này là NỘI DUNG CHÍNH của trạng
   * thái nhàn nên xứng đáng một tiêu đề; từ 1024px khối đứng cạnh ô tìm (`.block`).
   *
   * `inline` — tiêu đề là nhãn thường, không phải heading. Dùng ngay dưới ô tìm của màn Công thức,
   * nơi hàng chip chỉ là phụ trợ của ô tìm chứ không phải một mục ngang hàng với "Công thức dùng
   * hằng ngày" — cho nó một `<h2>` là dựng thêm một cấp tiêu đề giả giữa ô tìm và kệ.
   */
  variant?: 'block' | 'inline';
} & RecentSearchesAction;

/**
 * Icon đồng hồ đầu mỗi chip — bản vẽ 19/10/2026: vòng tròn, kim từ tâm thẳng lên rồi chéo xuống phải.
 * Bản vẽ cho ô 16px; cùng ngày chủ dự án thu chip lại ("ô height cũng cần thu gọn xuống"), nên ô còn
 * 14px. Nét 2.25 đơn vị ≈ 1,3px ở cỡ này.
 */
function ClockIcon() {
  return (
    <svg
      className={styles.clock}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.25" />
      <path d="M12 7.5V12l3.5 2" />
    </svg>
  );
}

/**
 * Icon thùng rác của nút xoá. Bản vẽ 19/10/2026 đặt chữ "Xoá" ở đây; chủ dự án đổi lại ngay trong
 * ngày: _"text xóa đổi lại thành icon xóa"_ — cùng hình thùng rác khối này đã dùng trước đó.
 */
function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
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
  );
}

/**
 * Chip "Tìm gần đây" — WF-09 trạng thái A (gói WBS 3.1.3).
 *
 * Không tự đọc localStorage: màn gọi nó đọc trong `useEffect` rồi truyền xuống. Đọc ngay lúc
 * khởi tạo state sẽ lệch hydration vì bản build là HTML tĩnh — bài học của đợt 2. Điều này càng
 * chặt ở màn Công thức: `terms` rỗng thì component trả `null`, nên lần render đầu ở máy khách vẫn
 * giống hệt HTML tĩnh.
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

  /* Một màn chỉ có một khối này, nên `id` cố định là đủ — cùng lẽ `recent-title` vẫn dùng. */
  const titleId = variant === 'block' ? 'recent-title' : 'recent-inline-title';
  const title = t('search.recent.title');

  return (
    <section
      className={variant === 'block' ? `${styles.recent} ${styles.block}` : styles.recent}
      aria-labelledby={titleId}
    >
      <div className={styles.head}>
        {variant === 'block' ? (
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
        ) : (
          <span className={styles.title} id={titleId}>
            {title}
          </span>
        )}
        {/* Nút xoá chỉ có icon, nên nhãn phải nằm ở `aria-label` — NFR-USA-06. */}
        <button
          type="button"
          className={styles.clear}
          onClick={onClear}
          aria-label={t('search.recent.clear')}
          title={t('search.recent.clear')}
        >
          <TrashIcon />
        </button>
      </div>

      <ul className={styles.chips}>
        {terms.map((term) => (
          <li key={term} className={styles.item}>
            {hrefFor !== undefined ? (
              <Link className={styles.chip} href={hrefFor(term)}>
                <ClockIcon />
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
                <ClockIcon />
                {term}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
