import Link from 'next/link';

import { DEFAULT_LIST_PARAMS, formulaListPath } from '@/application';
import type { Category } from '@/application';

import { Pick } from '../i18n/Pick';
import styles from './CategoryGrid.module.css';

export interface CategoryGridProps {
  categories: ReadonlyArray<Category>;
}

/**
 * Lưới lối vào 12 nhóm công thức — khối "Duyệt theo nhóm" của WF-01 (gói WBS 3.1.1, FR-01).
 *
 * Mỗi ô một hàng: tên nhóm bên trái, số công thức dự kiến bên phải — đúng bản thiết kế hi-fi.
 * Số hiện ra là `expectedCount` của SRS 3.8, tức số công thức nhóm này SẼ có, không phải số
 * đang bấm vào được. Đợt 7 từng hiện số thật kèm chữ "sắp có"; chủ dự án chốt lấy hình của
 * bản thiết kế, nên chỗ nói thật về tiến độ nay dồn về dòng cuối trang chủ.
 *
 * Tên dùng `shortName` chứ không phải `name`: ở 360px, "Phí & thuế thị trường VN" vỡ ra bốn
 * dòng và làm cả hàng cao gấp đôi.
 *
 * Mỗi ô là một thẻ <a> thật trỏ tới màn danh sách đã lọc sẵn nhóm đó, nên bấm được, mở tab
 * mới được, và điều hướng được cả khi JavaScript chưa tải xong.
 *
 * `shortName` là `Bilingual`, đọc qua lá client `<Pick>` chứ không `usePick()` thẳng: đây là
 * server component thuần (chỉ dựng ở trang chủ, không hook được) — xem docblock `Pick.tsx`.
 */
export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <ul className={styles.grid}>
      {categories.map((category) => (
        <li key={category.id}>
          <Link
            /* Cùng một hàm với hàng "Xem tất cả" của ô tìm trang chủ — xem formulaListPath(). */
            href={formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: category.id })}
            className={styles.tile}
          >
            <span className={styles.name}>
              <Pick value={category.shortName} />
            </span>
            <span className={styles.count}>{category.expectedCount}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
