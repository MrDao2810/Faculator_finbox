import Link from 'next/link';
import { memo } from 'react';

import { findCategory, formulaPath } from '@/application';
import type { FormulaSummary } from '@/application';

import { Pick } from '../i18n/Pick';
import { T } from '../i18n/T';
import { CategoryIcon, toneClass } from './CategoryIcon';
import styles from './FormulaCard.module.css';

export interface FormulaCardProps {
  formula: FormulaSummary;
  /** Ẩn nhãn nhóm khi cả danh sách vốn đã thuộc một nhóm. */
  showCategory?: boolean;
  /**
   * `row` — một hàng ngang có icon nhóm, badge cấp độ, badge nhóm và mũi tên; dùng ở danh sách
   * WF-02 và WF-09. Ở khổ hàng thì cả bốn đều có chỗ, khác hẳn khổ ô 164px của trang chủ.
   * `tile` — ô vuông trong lưới hai cột của trang chủ WF-01: icon nhóm, tên, mô tả và badge
   * nhóm. Vẫn bỏ badge cấp độ và mũi tên, vì ở khổ ô 164px chúng chiếm chỗ của phần chữ mà
   * không nói thêm được gì.
   */
  variant?: 'row' | 'tile';
}

/**
 * Thẻ công thức — gói WBS 2.2.3.
 *
 * Dùng lại ở trang chủ (khối nổi bật), màn danh sách WF-02, và cột giữa của bố cục desktop
 * WF-07 — nên không tự quyết bố cục ngoài, chỉ lo phần bên trong thẻ.
 *
 * Hai biến thể ở chung một file thay vì tách component riêng, để chỗ dựng đường dẫn
 * (`formulaPath`) và chỗ tra nhóm chỉ có một bản.
 *
 * Cả thẻ là một thẻ <a> thật, không phải div bắt sự kiện: bấm được, mở tab mới được,
 * và điều hướng được cả khi JavaScript chưa tải xong.
 *
 * Badge cấp độ và tên/mô tả công thức/nhóm đều đi qua lá `<T>`/`<Pick>` chứ không `useT()`/
 * `usePick()` thẳng: file này được dựng ở CẢ HAI phía — client (FormulaBrowser, HomeSearchPanel)
 * lẫn server (StaticFormulaList, fallback SEO) — nên gọi hook thẳng sẽ ném lỗi ở lượt dựng
 * server. Hai lá này chạy được cả hai chỗ (xem docblock `Pick.tsx`).
 */
function FormulaCardBase({ formula, showCategory = true, variant = 'row' }: FormulaCardProps) {
  const category = findCategory(formula.categoryId);
  const isBasic = formula.level === 'basic';

  if (variant === 'tile') {
    /*
     * Lớp tông đặt trên chính thẻ, không đặt trên icon hay badge: nó chỉ rót hai khe
     * `--category-*`, còn hai phần bên trong đọc khe đó. Xem docblock `toneClass()`.
     */
    return (
      <Link
        href={formulaPath(formula.id)}
        className={`${styles.tile} ${toneClass(formula.categoryId)}`}
      >
        <span className={styles.tileIcon} aria-hidden="true">
          <CategoryIcon id={formula.categoryId} />
        </span>
        <span className={styles.tileName}>
          <Pick value={formula.name} />
        </span>
        <span className={styles.tileDescription}>
          <Pick value={formula.description} />
        </span>
        {showCategory && category !== undefined && (
          <span className={styles.tileCategory}>
            <Pick value={category.shortName} />
          </span>
        )}
      </Link>
    );
  }

  /*
   * Lớp tông cũng đặt trên chính thẻ, y như nhánh ô — xem chú thích ở trên và docblock
   * `toneClass()`. Icon và badge nhóm bên trong chỉ đọc hai khe `--category-*`.
   */
  return (
    <Link
      href={formulaPath(formula.id)}
      className={`${styles.card} ${toneClass(formula.categoryId)}`}
    >
      {/*
        Icon nhóm ở đầu hàng — bản thiết kế mobile đợt 13. Cùng dấu hiệu với nhánh ô của trang
        chủ, nên một công thức mang đúng một hình dù gặp nó ở màn nào.
      */}
      <span className={styles.rowIcon} aria-hidden="true">
        <CategoryIcon id={formula.categoryId} size={20} />
      </span>

      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.name}>
            <Pick value={formula.name} />
          </span>
          <span className={`${styles.badge} ${isBasic ? styles.basic : styles.advanced}`}>
            <T k={isBasic ? 'level.basic' : 'level.advanced'} />
          </span>
        </div>

        <p className={styles.description}>
          <Pick value={formula.description} />
        </p>

        {showCategory && category !== undefined && (
          <div className={styles.category}>
            <Pick value={category.name} />
          </div>
        )}
      </div>

      <svg
        className={styles.chevron}
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
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}

export const FormulaCard = memo(FormulaCardBase);
