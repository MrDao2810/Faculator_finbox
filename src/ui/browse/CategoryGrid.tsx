import Link from 'next/link';

import { DEFAULT_LIST_PARAMS, formulaListPath } from '@/application';
import type { Category } from '@/application';

import { Pick } from '../i18n/Pick';
import { T } from '../i18n/T';
import { CategoryIcon, toneClass } from './CategoryIcon';
import styles from './CategoryGrid.module.css';

export interface CategoryGridProps {
  categories: ReadonlyArray<Category>;
  /**
   * Số công thức xem được ở chế độ **Cơ bản**, khoá theo `category.id`.
   *
   * Không truyền thì ô chỉ in `expectedCount` như bản đầu — hợp đồng cũ mà
   * `CategoryGrid.test.tsx` vẫn gác. Truyền vào thì ô mang CẢ HAI con số và để CSS chọn theo
   * `data-mode` trên `<html>`; xem docblock của component.
   */
  basicCounts?: ReadonlyMap<string, number>;
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
 *
 * ── Vì sao CẢ HAI con số nằm trong HTML, và CSS mới là thứ chọn ─────────────────────────────
 *
 * Chế độ Cơ bản chỉ với tới 79 / 111 công thức, nên ở chế độ ấy con số `expectedCount` nói sai:
 * chủ dự án báo đúng chỗ này — "trang chủ luôn hiện 111 bất kể bộ lọc". Nhưng chế độ nằm trong
 * `localStorage` của từng máy, mà file này do SERVER dựng và nằm trong `out/index.html` — nó
 * không có cách nào biết lựa chọn ấy lúc build.
 *
 * Ba đường đi, và vì sao chọn đường thứ ba:
 *
 *   1. Biến `CategoryGrid` thành client component. Hỏng ngay: `page.tsx` ghi rõ khối này phải do
 *      server dựng để không lọt vào gói máy khách (NFR-PER-04).
 *   2. Bọc một client island đọc `usePreferences()` rồi dựng lại con số. Chạy được, nhưng lượt vẽ
 *      đầu vẫn là 111 rồi mới nhảy về 79 — đúng loại nháy mà `THEME_BOOT_SCRIPT` sinh ra để chặn,
 *      lần này lại rơi vào khối đầu trang chủ.
 *   3. Dựng sẵn cả hai con số, để CSS chọn theo `data-mode` trên `<html>` — thuộc tính do chính
 *      script khởi động ấy đặt TRƯỚC lượt vẽ đầu. Không thêm một byte JS nào, không có nháy, và
 *      đúng nếp `ThemeSwitch` đã dùng: giữ cả hai nhánh trong DOM, để CSS quyết, vì lượt render
 *      đầu ở máy khách buộc phải khớp HTML tĩnh.
 *
 * Mặc định (không có thuộc tính) là **Cơ bản**, khớp `DEFAULT_PREFERENCES.mode`. Nên `out/index.html`
 * bày con số của chế độ Cơ bản, và người mở lần đầu thấy đúng thứ họ bấm vào được.
 */
export function CategoryGrid({ categories, basicCounts }: CategoryGridProps) {
  return (
    <ul className={styles.grid}>
      {categories.map((category) => {
        const basic = basicCounts?.get(category.id);
        /*
         * Nhóm mà chế độ Cơ bản giấu sạch — hiện chỉ có 'corporate-finance' (2/2 công thức đều
         * mức nâng cao). In số `0` ở đây đọc ra là "nhóm này rỗng", trong khi sự thật là "nhóm
         * này chỉ có ở chế độ kia" — đúng kiểu im lặng FR-06 sinh ra để chặn. Ô vẫn là link
         * thật: màn danh sách phía sau đã có khối rỗng riêng kèm nút bật chế độ.
         */
        const basicEmpty = basic === 0;

        return (
          <li key={category.id}>
            <Link
              /* Cùng một hàm với hàng "Xem tất cả" của ô tìm trang chủ — xem formulaListPath(). */
              href={formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: category.id })}
              className={[styles.tile, toneClass(), basicEmpty ? styles.basicEmpty : '']
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.icon} aria-hidden="true">
                <CategoryIcon id={category.id} size={16} />
              </span>
              <span className={styles.name}>
                <Pick value={category.shortName} />
              </span>

              {/*
                Không truyền `basicCounts` thì chỉ có MỘT badge, y hệt bản đầu — nhánh này giữ
                cho `CategoryGrid` còn dùng được ở nơi không quan tâm tới chế độ.
              */}
              {basic === undefined ? (
                <span className={styles.count}>{category.expectedCount}</span>
              ) : (
                <>
                  <span className={`${styles.count} ${styles.countBasic}`}>
                    {basicEmpty ? <T k="home.browse.advancedOnly" /> : basic}
                  </span>
                  <span className={`${styles.count} ${styles.countAdvanced}`}>
                    {category.expectedCount}
                  </span>
                </>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
