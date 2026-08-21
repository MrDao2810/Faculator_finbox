'use client';

import Link from 'next/link';

import { findCategory, formulaPath } from '@/application';
import type { FormulaSummary } from '@/application';
import { usePick } from '@/application/preferences-context';

import { T } from '../i18n/T';
import { Highlight } from './Highlight';
import styles from './SearchResults.module.css';

export interface SearchResultsProps {
  formulas: ReadonlyArray<FormulaSummary>;
  /**
   * Chuỗi đang tìm, để tô sáng đoạn khớp.
   * Bỏ trống thì chữ hiện nguyên — khối "Có thể bạn cần" của trạng thái không-tìm-thấy dùng
   * chính component này mà không có gì để tô.
   */
  query?: string;
}

interface Group {
  id: string;
  name: string;
  formulas: FormulaSummary[];
}

/**
 * Danh sách kết quả tìm kiếm gom theo nhóm — WF-09 trạng thái A (gói WBS 3.1.3).
 *
 * Khác `FormulaCard` ở chỗ mỗi dòng gọn hơn và có nhãn nhóm bên phải, đúng như wireframe vẽ:
 * đang tìm thì người dùng cần quét nhanh nhiều dòng, không cần mô tả dài.
 *
 * Thứ tự nhóm bám theo thứ tự kết quả do `selectFormulas()` chấm điểm, KHÔNG sắp lại theo
 * bảng chữ cái — kết quả khớp nhất phải nằm trên cùng.
 */
export function SearchResults({ formulas, query = '' }: SearchResultsProps) {
  const pick = usePick();
  const groups: Group[] = [];
  const byId = new Map<string, Group>();

  for (const formula of formulas) {
    let group = byId.get(formula.categoryId);
    if (group === undefined) {
      const category = findCategory(formula.categoryId);
      group = {
        id: formula.categoryId,
        name: category !== undefined ? pick(category.name) : formula.categoryId,
        formulas: [],
      };
      byId.set(formula.categoryId, group);
      groups.push(group);
    }
    group.formulas.push(formula);
  }

  return (
    <div className={styles.groups}>
      {groups.map((group) => (
        <section key={group.id} className={styles.group}>
          <h2 className={styles.groupName}>{group.name}</h2>

          <ul className={styles.list}>
            {group.formulas.map((formula) => (
              <li key={formula.id}>
                <Link href={formulaPath(formula.id)} className={styles.row}>
                  <span className={styles.body}>
                    <span className={styles.name}>
                      <Highlight text={pick(formula.name)} query={query} />
                    </span>
                    <span className={styles.hint}>
                      <Highlight text={pick(formula.description)} query={query} />
                    </span>
                  </span>

                  <span className={styles.level}>
                    <T k={formula.level === 'basic' ? 'level.basic' : 'level.advanced'} />
                  </span>

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
        </section>
      ))}
    </div>
  );
}
