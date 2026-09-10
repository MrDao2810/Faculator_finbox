'use client';

import { CATEGORIES } from '@/application';
import type { FormulaSummary } from '@/application';

import styles from './FormulaFolders.module.css';
import { GroupCard } from './GroupCard';

export interface FormulaFoldersProps {
  /** Bộ công thức đang xem — đã lọc theo chế độ Cơ bản / Nâng cao, cùng `pool` với kết quả tìm. */
  formulas: ReadonlyArray<FormulaSummary>;
  /** Số dòng nhiều nhất mỗi thẻ. Bản vẽ vẽ bốn. */
  rows?: number;
}

const DEFAULT_ROWS = 4;

/**
 * Chọn các dòng bày trong một thẻ: công thức NỔI BẬT (`isFeatured`, cùng cờ với kệ trang chủ)
 * lên trước, rồi tới phần còn lại theo thứ tự Registry. Không sắp theo bảng chữ cái: bốn dòng
 * đầu của "Định giá" phải là P/E, P/B… chứ không phải "Biên an toàn" chỉ vì chữ B đứng trước.
 */
function chonDong(all: ReadonlyArray<FormulaSummary>, rows: number): FormulaSummary[] {
  const featured = all.filter((f) => f.isFeatured === true);
  const rest = all.filter((f) => f.isFeatured !== true);
  return [...featured, ...rest].slice(0, rows);
}

/**
 * Thư mục 12 nhóm — WF-09 trạng thái chưa gõ gì ở khổ PC, bản vẽ "Thư mục theo nhóm"
 * (phương án 05): mỗi nhóm một thẻ bày sẵn vài công thức chính, nhìn một lượt là thấy cả thư
 * viện, không phải gõ mới thấy.
 *
 * Thay cho khối "Danh mục hot" ở khổ này (khối ấy vẫn là bản điện thoại, xem `SearchScreen`).
 * Cùng luật với nó: đếm bằng số công thức ĐÃ DÙNG ĐƯỢC trong `formulas`, không phải
 * `expectedCount` của SRS; nhóm không có công thức nào thì không có thẻ — thư mục dẫn vào phòng
 * trống là thư mục hỏng. Nhiều công thức nhất lên trước; bằng nhau thì giữ thứ tự `CATEGORIES`.
 *
 * Con số ở đầu thẻ và con số của link "Xem tất cả N" là MỘT — cùng `all.length` — để hai chỗ
 * trên một thẻ không bao giờ nói hai số.
 */
export function FormulaFolders({ formulas, rows = DEFAULT_ROWS }: FormulaFoldersProps) {
  const byCategory = new Map<string, FormulaSummary[]>();
  for (const formula of formulas) {
    const bucket = byCategory.get(formula.categoryId);
    if (bucket === undefined) byCategory.set(formula.categoryId, [formula]);
    else bucket.push(formula);
  }

  const folders = CATEGORIES.map((category) => ({
    category,
    all: byCategory.get(category.id) ?? [],
  }))
    .filter((folder) => folder.all.length > 0)
    .sort((a, b) => b.all.length - a.all.length);

  if (folders.length === 0) return null;

  return (
    <ul className={styles.grid}>
      {folders.map(({ category, all }) => {
        const shown = chonDong(all, rows);
        return (
          <li key={category.id}>
            <GroupCard
              category={category}
              formulas={shown}
              total={all.length}
              showDescription
              showHints={false}
              footer={all.length > shown.length ? 'seeAll' : 'open'}
            />
          </li>
        );
      })}
    </ul>
  );
}
