'use client';

import Link from 'next/link';

import { DEFAULT_LIST_PARAMS, formulaListPath, formulaPath } from '@/application';
import type { Category, FormulaSummary } from '@/application';
import { usePick, useT } from '@/application/preferences-context';

import { T } from '../i18n/T';
/* Nhập thẳng từ file chứ không qua barrel — cùng lý do đã ghi ở `FormulaCard.tsx`. */
import { Badge } from '../primitives/Badge';
import { CategoryIcon, toneClass } from './CategoryIcon';
import styles from './GroupCard.module.css';
import { Highlight } from './Highlight';

export interface GroupCardProps {
  category: Category;
  /** Các dòng công thức bày trong thẻ — nơi gọi đã chọn và sắp sẵn. */
  formulas: ReadonlyArray<FormulaSummary>;
  /**
   * Tổng số công thức của nhóm trong BỘ ĐANG XEM (đã lọc theo chế độ Cơ bản / Nâng cao).
   * Không truyền thì đầu thẻ không có con số — khối "Có thể bạn cần" dùng thế, vì đó là gợi ý
   * chứ không phải thứ đếm được.
   */
  total?: number;
  /** Số dòng KHỚP khi đang tìm — đầu thẻ in "7 / 13". Chỉ có nghĩa khi có `total`. */
  hits?: number;
  /** Chuỗi đang tìm, để tô sáng đoạn khớp. Rỗng thì chữ hiện nguyên. */
  query?: string;
  /** Gọi khi bấm một dòng — nơi gọi dùng để ghi "Tìm gần đây" (WF-09). */
  onSelect?: (formula: FormulaSummary) => void;
  /** Bày câu mô tả nhóm ngay dưới tên — thư mục ở trạng thái chưa gõ gì. */
  showDescription?: boolean;
  /**
   * Bày dòng mô tả ngắn dưới tên TỪNG công thức. Kết quả tìm bật (để thấy đoạn khớp nằm trong
   * mô tả); thư mục tắt — thẻ chỉ liệt kê tên, bốn dòng cho vừa một hàng thẻ.
   */
  showHints?: boolean;
  /**
   * Link cuối thẻ, dẫn sang màn danh sách đã lọc sẵn nhóm này:
   * `seeAll` — "Xem tất cả N →", khi thẻ chỉ bày một phần; `open` — "Mở nhóm <tên> →".
   */
  footer?: 'seeAll' | 'open';
}

/**
 * Thẻ một nhóm công thức — dùng chung cho hai chỗ của màn tìm WF-09:
 *
 *   - `SearchResults`: kết quả tìm gom theo nhóm (trạng thái đang gõ);
 *   - `FormulaFolders`: thư mục 12 nhóm, mỗi thẻ bày sẵn vài công thức chính (trạng thái nhàn).
 *
 * Bản vẽ khổ PC "Thư mục theo nhóm" (phương án 05, WF-09) vẽ hai trạng thái ấy bằng CÙNG một
 * thẻ: icon + tên nhóm + con số ở đầu, các dòng công thức ở giữa, link mở nhóm ở cuối. Một
 * component cho cả hai để hai trạng thái không trôi thành hai hình khác nhau.
 *
 * Dưới 1024px nó vẫn là danh sách gọn của bản điện thoại đã duyệt (tiêu đề nhóm chữ nhỏ viết
 * hoa, dòng có mũi tên, không viền) — phần CSS quyết chuyện đó, xem `GroupCard.module.css`.
 *
 * Thứ tự dòng do nơi gọi quyết: kết quả tìm giữ thứ tự chấm điểm của `selectFormulas()`, thư
 * mục đưa công thức nổi bật lên trước.
 */
export function GroupCard({
  category,
  formulas,
  total,
  hits,
  query = '',
  onSelect,
  showDescription = false,
  showHints = true,
  footer,
}: GroupCardProps) {
  const pick = usePick();
  const t = useT();

  const countText =
    total === undefined
      ? null
      : hits === undefined
        ? String(total)
        : `${String(hits)} / ${String(total)}`;

  /*
   * Link cuối thẻ trỏ tới màn danh sách đã lọc nhóm — KHÔNG mang theo chuỗi đang tìm. Nó là lối
   * mở cả nhóm, và với "Không có kết quả trong: …" thì mang theo `q` là dẫn vào một danh sách rỗng.
   */
  const groupHref = formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: category.id });

  return (
    <section className={`${styles.card} ${toneClass()}`}>
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">
          <CategoryIcon id={category.id} size={20} />
        </span>
        <h2 className={styles.name}>{pick(category.name)}</h2>
        {countText !== null && <span className={styles.count}>{countText}</span>}
      </div>

      {showDescription && <p className={styles.description}>{pick(category.description)}</p>}

      <ul className={styles.list}>
        {formulas.map((formula) => (
          <li key={formula.id}>
            <Link
              href={formulaPath(formula.id)}
              className={styles.row}
              onClick={() => {
                onSelect?.(formula);
              }}
            >
              <span className={styles.body}>
                <span className={styles.formulaName}>
                  <Highlight text={pick(formula.name)} query={query} />
                </span>
                {showHints && (
                  <span className={styles.hint}>
                    <Highlight text={pick(formula.description)} query={query} />
                  </span>
                )}
              </span>

              <Badge tone={formula.level === 'basic' ? 'basic' : 'advanced'}>
                <T k={formula.level === 'basic' ? 'level.basic' : 'level.advanced'} />
              </Badge>

              <svg
                className={styles.chevron}
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
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>

      {footer !== undefined && (
        <Link className={styles.more} href={groupHref}>
          {footer === 'seeAll'
            ? `${t('search.folder.seeAll')} ${String(total ?? formulas.length)}`
            : `${t('search.folder.open')} ${pick(category.shortName)}`}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}
