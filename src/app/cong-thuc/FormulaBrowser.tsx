'use client';

import { useMemo } from 'react';

import {
  FORMULAS,
  countByCategoryFor,
  countBySegmentFor,
  isDefaultListParams,
  selectFormulas,
  t,
} from '@/application';
import { useListParams } from '@/application/use-list-params';
import { CategoryFilter, EmptyState, FormulaCard, SearchBox } from '@/ui/browse';
import { Button } from '@/ui/primitives';

import styles from './FormulaBrowser.module.css';

/**
 * Phần động của màn danh sách công thức — gói WBS 2.2.
 *
 * Tách khỏi page.tsx vì cần <Suspense> bao ngoài: `useListParams()` dùng
 * `useSearchParams()`, mà với `output: 'export'` thì hook đó bắt buộc nằm trong Suspense.
 *
 * Bố cục đầy đủ của WF-02 (đếm kết quả, ảo hoá danh sách 107 mục) thuộc gói 3.1.2;
 * ở đây mới là phần lắp ba component của 2.2 vào với nhau.
 */
export function FormulaBrowser() {
  const { params, setParams, reset } = useListParams();

  const formulas = useMemo(() => selectFormulas(FORMULAS, params), [params]);
  const segmentCounts = useMemo(() => countBySegmentFor(FORMULAS, params), [params]);
  const categoryCounts = useMemo(() => countByCategoryFor(FORMULAS, params), [params]);

  const isFiltering = !isDefaultListParams(params);
  const registryEmpty = FORMULAS.length === 0;

  return (
    <div className={styles.browser}>
      <SearchBox
        value={params.q}
        onChange={(q) => {
          setParams({ q });
        }}
        showHint={formulas.length === 0}
      />

      <CategoryFilter
        params={params}
        onChange={setParams}
        onReset={reset}
        segmentCounts={segmentCounts}
        categoryCounts={categoryCounts}
        showReset={isFiltering}
      />

      {/* aria-live để trình đọc màn hình biết số kết quả đổi sau mỗi lần gõ. */}
      <p className={styles.count} aria-live="polite">
        {formulas.length} {t('list.count')}
      </p>

      {formulas.length > 0 ? (
        <ul className={styles.list}>
          {formulas.map((formula) => (
            <li key={formula.id}>
              <FormulaCard formula={formula} />
            </li>
          ))}
        </ul>
      ) : registryEmpty ? (
        <EmptyState
          title={t('list.empty.registry.title')}
          lines={[t('list.empty.registry.hint')]}
        />
      ) : (
        <EmptyState
          title={t('list.empty.noMatch.title')}
          lines={[t('list.empty.noMatch.scope'), t('list.empty.noMatch.hint')]}
          action={
            isFiltering ? (
              <Button variant="secondary" size="sm" onClick={reset}>
                {t('filter.reset')}
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
