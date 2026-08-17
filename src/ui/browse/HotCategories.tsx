'use client';

import Link from 'next/link';

import { CATEGORIES, DEFAULT_LIST_PARAMS, formulaListPath } from '@/application';
import type { FormulaSummary } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './HotCategories.module.css';

export interface HotCategoriesProps {
  formulas: ReadonlyArray<FormulaSummary>;
  /** Số ô nhiều nhất. Bản thiết kế vẽ sáu ô, hai hàng ba cột ở khổ điện thoại. */
  limit?: number;
}

const DEFAULT_LIMIT = 6;

/**
 * Khối "Danh mục hot" — WF-09 trạng thái chưa gõ gì (gói WBS 3.1.3).
 *
 * "Hot" ở đây đo bằng **số công thức đã dùng được**, không phải số dự kiến của SRS. Đây là chỗ
 * khác có chủ đích với lưới nhóm ở trang chủ: lưới kia hiện `expectedCount` để nói cho người
 * dùng biết thư viện sẽ có gì, nên bấm vào "Kỹ thuật · 18" ra danh sách rỗng — đánh đổi đã ghi
 * ở đợt 8. Khối này thì ngược lại, nó là lối tắt, mà lối tắt dẫn vào phòng trống là lối tắt hỏng.
 * Nhóm chưa có công thức nào **không xuất hiện** ở đây.
 *
 * Là client component (được render trong SearchScreen vốn đã là client) và dùng `useT()` để
 * chữ đổi theo locale người dùng chọn.
 */
export function HotCategories({ formulas, limit = DEFAULT_LIMIT }: HotCategoriesProps) {
  const t = useT();

  const counts = new Map<string, number>();
  for (const formula of formulas) {
    counts.set(formula.categoryId, (counts.get(formula.categoryId) ?? 0) + 1);
  }

  const hot = CATEGORIES.map((category) => ({ category, count: counts.get(category.id) ?? 0 }))
    .filter((entry) => entry.count > 0)
    // Nhiều công thức nhất lên trước; bằng nhau thì giữ thứ tự CATEGORIES cho ổn định giữa
    // các lần build — sắp ngẫu nhiên thì HTML tĩnh đổi mỗi lần build mà không vì lý do gì.
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  if (hot.length === 0) return null;

  return (
    <section className={styles.hot} aria-labelledby="hot-title">
      <h2 className={styles.title} id="hot-title">
        {t('search.hot.title')}
      </h2>

      <ul className={styles.grid}>
        {hot.map(({ category, count }) => (
          <li key={category.id}>
            <Link
              className={styles.tile}
              href={formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: category.id })}
            >
              <span className={styles.name}>{category.shortName}</span>
              <span className={styles.count}>{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
