import Link from 'next/link';

import { DEFAULT_LIST_PARAMS, formulaListPath } from '@/application';
import type { Category } from '@/application';

import { Pick } from '../i18n/Pick';
import { T } from '../i18n/T';
import styles from './CategoryGrid.module.css';

export interface CategoryGridProps {
  categories: ReadonlyArray<Category>;
  /**
   * Số công thức ĐANG XEM ĐƯỢC của từng nhóm, khoá theo `category.id`.
   *
   * Không truyền thì ô in `expectedCount` như trước — hình của bản thiết kế hi-fi, và là hợp
   * đồng cũ mà `CategoryGrid.test.tsx` vẫn gác. Truyền vào thì con số đi theo chế độ hiển thị
   * (FR-09): ở Nâng cao hai vế trùng nhau vì cả 12 nhóm đã đủ số, ở Cơ bản thì nhỏ hơn.
   */
  counts?: ReadonlyMap<string, number>;
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
 * `shortName` là `Bilingual`, đọc qua lá client `<Pick>` chứ không `usePick()` thẳng: component
 * này dựng được ở cả hai phía — xem docblock `Pick.tsx`.
 */
export function CategoryGrid({ categories, counts }: CategoryGridProps) {
  return (
    <ul className={styles.grid}>
      {categories.map((category) => {
        const visible = counts?.get(category.id) ?? category.expectedCount;
        /*
         * Nhóm mà chế độ Cơ bản giấu sạch — hiện chỉ có 'corporate-finance' (2/2 công thức đều
         * mức nâng cao). In số `0` ở đây đọc ra là "nhóm này rỗng", trong khi sự thật là "nhóm
         * này chỉ có ở chế độ kia" — đúng kiểu im lặng FR-06 sinh ra để chặn. Ô vẫn là link
         * thật: màn danh sách phía sau đã có khối rỗng riêng kèm nút bật chế độ.
         */
        const advancedOnly = visible === 0;

        return (
          <li key={category.id}>
            <Link
              /* Cùng một hàm với hàng "Xem tất cả" của ô tìm trang chủ — xem formulaListPath(). */
              href={formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: category.id })}
              className={advancedOnly ? `${styles.tile} ${styles.advancedOnly}` : styles.tile}
            >
              <span className={styles.name}>
                <Pick value={category.shortName} />
              </span>
              <span className={styles.count}>
                {advancedOnly ? <T k="home.browse.advancedOnly" /> : visible}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
