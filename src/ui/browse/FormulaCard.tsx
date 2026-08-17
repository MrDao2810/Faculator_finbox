import Link from 'next/link';
import { memo } from 'react';

import { findCategory, formulaPath } from '@/application';
import type { FormulaSummary } from '@/application';

import { T } from '../i18n/T';
import styles from './FormulaCard.module.css';

export interface FormulaCardProps {
  formula: FormulaSummary;
  /** Ẩn nhãn nhóm khi cả danh sách vốn đã thuộc một nhóm. */
  showCategory?: boolean;
  /**
   * `row` — một hàng ngang có badge cấp độ và mũi tên, dùng ở danh sách WF-02 và WF-09.
   * `tile` — ô vuông trong lưới hai cột của trang chủ WF-01: gọn hơn, bỏ badge và mũi tên
   * vì ở khổ ô 150px chúng chiếm chỗ của phần chữ mà không nói thêm được gì.
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
 * Badge cấp độ đi qua lá `<T>` chứ không `useT()`: file này được dựng ở CẢ HAI phía — client
 * (FormulaBrowser, HomeSearchPanel) lẫn server (StaticFormulaList, fallback SEO) — nên gọi hook
 * thẳng sẽ ném lỗi ở lượt dựng server. Lá `<T>` chạy được cả hai chỗ.
 */
function FormulaCardBase({ formula, showCategory = true, variant = 'row' }: FormulaCardProps) {
  const category = findCategory(formula.categoryId);
  const isBasic = formula.level === 'basic';

  if (variant === 'tile') {
    return (
      <Link href={formulaPath(formula.id)} className={styles.tile}>
        <span className={styles.tileName}>{formula.name.vi}</span>
        <span className={styles.tileDescription}>{formula.description}</span>
        {showCategory && category !== undefined && (
          <span className={styles.tileCategory}>{category.shortName}</span>
        )}
      </Link>
    );
  }

  return (
    <Link href={formulaPath(formula.id)} className={styles.card}>
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.name}>{formula.name.vi}</span>
          <span className={`${styles.badge} ${isBasic ? styles.basic : styles.advanced}`}>
            <T k={isBasic ? 'level.basic' : 'level.advanced'} />
          </span>
        </div>

        <p className={styles.description}>{formula.description}</p>

        {showCategory && category !== undefined && (
          <div className={styles.category}>{category.name}</div>
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
