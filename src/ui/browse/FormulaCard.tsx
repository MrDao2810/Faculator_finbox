import Link from 'next/link';

import { findCategory, formulaPath, t } from '@/application';
import type { FormulaSpec } from '@/application';

import styles from './FormulaCard.module.css';

export interface FormulaCardProps {
  formula: FormulaSpec;
  /** Ẩn nhãn nhóm khi cả danh sách vốn đã thuộc một nhóm. */
  showCategory?: boolean;
}

/**
 * Thẻ công thức — gói WBS 2.2.3.
 *
 * Dùng lại ở trang chủ (khối nổi bật), màn danh sách WF-02, và cột giữa của bố cục desktop
 * WF-07 — nên không tự quyết bố cục ngoài, chỉ lo phần bên trong thẻ.
 *
 * Cả thẻ là một thẻ <a> thật, không phải div bắt sự kiện: bấm được, mở tab mới được,
 * và điều hướng được cả khi JavaScript chưa tải xong.
 */
export function FormulaCard({ formula, showCategory = true }: FormulaCardProps) {
  const category = findCategory(formula.categoryId);
  const isBasic = formula.level === 'basic';

  return (
    <Link href={formulaPath(formula.id)} className={styles.card}>
      <div className={styles.body}>
        <div className={styles.head}>
          <span className={styles.name}>{formula.name.vi}</span>
          <span className={`${styles.badge} ${isBasic ? styles.basic : styles.advanced}`}>
            {t(isBasic ? 'level.basic' : 'level.advanced')}
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
