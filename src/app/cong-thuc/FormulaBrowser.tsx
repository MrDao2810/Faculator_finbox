'use client';

import { useCallback, useEffect, useMemo } from 'react';

import {
  FORMULA_SUMMARIES,
  LAST_LIST_URL_KEY,
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  formulasForLevel,
  isDefaultListParams,
  listUrlToStore,
  selectFormulas,
} from '@/application';
import { useListParams } from '@/application/use-list-params';
import { usePreferences, useT } from '@/application/preferences-context';
import { useQueryDraft } from '@/application/use-query-draft';
import {
  CategoryFilter,
  EmptyState,
  FormulaCard,
  HiddenByLevelNote,
  SearchBox,
  VirtualList,
} from '@/ui/browse';
import { Button } from '@/ui/primitives';

import styles from './FormulaBrowser.module.css';

/**
 * Màn WF-02 Danh sách công thức — gói WBS 2.2 (component) và 3.1.2 (lắp ráp).
 *
 * Tách khỏi page.tsx vì cần <Suspense> bao ngoài: `useListParams()` dùng
 * `useSearchParams()`, mà với `output: 'export'` thì hook đó bắt buộc nằm trong Suspense.
 *
 * Danh sách đi qua `VirtualList`: dưới 40 mục thì dựng thẳng, trên thì chỉ dựng phần đang
 * nằm trong tầm nhìn để giữ NFR-PER-02 khi đủ 108 công thức.
 */
export function FormulaBrowser() {
  const { params, setParams, reset } = useListParams();
  const { mode, setMode } = usePreferences();
  const t = useT();

  // Ô nhập đi qua bản nháp cục bộ, không ghi thẳng URL từng phím — xem use-query-draft.ts.
  const commitQuery = useCallback(
    (q: string) => {
      setParams({ q });
    },
    [setParams],
  );
  const { draft, setDraft, resetDraft } = useQueryDraft(params.q, commitQuery);

  // Danh sách và các bộ đếm chạy theo bản nháp để gõ tới đâu thấy tới đó; các bộ lọc còn lại
  // vẫn lấy từ `params` vì chúng đổi theo cú bấm, không theo từng phím.
  const view = useMemo(() => ({ ...params, q: draft }), [params, draft]);

  /*
   * Chế độ Cơ bản cắt bớt danh sách trước khi lọc — FR-09 vế "công thức phức tạp".
   * Mọi bộ đếm cũng chạy trên `pool` chứ không trên bộ đầy đủ: số trên chip lọc mà không khớp
   * số công thức bấm vào được là kiểu sai khó chịu nhất, vì nó trông như lỗi đếm.
   */
  const pool = useMemo(() => formulasForLevel(FORMULA_SUMMARIES, mode), [mode]);

  const formulas = useMemo(() => selectFormulas(pool, view), [pool, view]);
  const segmentCounts = useMemo(() => countBySegmentFor(pool, view), [pool, view]);
  const categoryCounts = useMemo(() => countByCategoryFor(pool, view), [pool, view]);

  /** Bao nhiêu công thức khớp bộ lọc này nhưng chế độ Cơ bản đang giấu đi. */
  const hiddenByLevel = useMemo(
    () => countHiddenByLevel(FORMULA_SUMMARIES, view, mode),
    [view, mode],
  );

  /*
   * Ghi lại màn danh sách đang đứng, để nút quay lại ở trang chi tiết đưa người dùng về ĐÚNG
   * bộ lọc này chứ không về một danh sách trắng trơn (xem `last-list-url.ts`).
   *
   * Chạy theo `params` chứ không theo `draft`: `draft` đổi theo từng phím gõ, mà URL chỉ được
   * ghi sau khoảng nghỉ — bám `draft` là ghi `sessionStorage` mỗi ký tự và nhớ luôn cả những
   * trạng thái URL chưa từng tồn tại.
   */
  useEffect(() => {
    try {
      const url = listUrlToStore(window.location.pathname, window.location.search);
      if (url !== null) window.sessionStorage.setItem(LAST_LIST_URL_KEY, url);
    } catch {
      // Trình duyệt chặn sessionStorage — nút quay lại tự lùi về '/cong-thuc/' trơn.
    }
  }, [params]);

  const isFiltering = !isDefaultListParams(view);
  const registryEmpty = FORMULA_SUMMARIES.length === 0;

  /** Nút "Xoá bộ lọc": dọn cả bản nháp lẫn URL, nếu không từ khoá vừa gõ sẽ hiện lại. */
  const resetAll = useCallback(() => {
    resetDraft();
    reset();
  }, [resetDraft, reset]);

  return (
    <div className={styles.browser}>
      <SearchBox value={draft} onChange={setDraft} showHint={formulas.length === 0} />

      <CategoryFilter
        params={view}
        onChange={setParams}
        onReset={resetAll}
        segmentCounts={segmentCounts}
        categoryCounts={categoryCounts}
        showReset={isFiltering}
      />

      {/* aria-live để trình đọc màn hình biết số kết quả đổi sau mỗi lần gõ. */}
      <p className={styles.count} aria-live="polite">
        {formulas.length} {t('list.count')}
      </p>

      {/*
        Chỉ báo khi danh sách CÒN mục: lúc rỗng thì cả khối rỗng bên dưới đã nói đúng chuyện
        này rồi, hiện cả hai là nói hai lần cùng một câu.
      */}
      {formulas.length > 0 && <HiddenByLevelNote count={hiddenByLevel} />}

      {formulas.length > 0 ? (
        <VirtualList items={formulas} itemKey={(formula) => formula.id} label={t('list.label')}>
          {(formula) => <FormulaCard formula={formula} />}
        </VirtualList>
      ) : registryEmpty ? (
        <EmptyState
          title={t('list.empty.registry.title')}
          lines={[t('list.empty.registry.hint')]}
        />
      ) : hiddenByLevel > 0 ? (
        /*
          Rỗng vì CHẾ ĐỘ chứ không vì bộ lọc. Nhóm "Tài chính DN" có 2/2 công thức mức nâng cao
          nên ở chế độ Cơ bản nó trống hẳn — không nói ra thì người dùng tưởng nhóm chưa làm.
        */
        <EmptyState
          title={t('list.empty.basicOnly.title')}
          lines={[t('list.empty.basicOnly.hint')]}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setMode('advanced');
              }}
            >
              {t('list.showAdvanced')}
            </Button>
          }
        />
      ) : (
        <EmptyState
          title={t('list.empty.noMatch.title')}
          lines={[t('list.empty.noMatch.scope'), t('list.empty.noMatch.hint')]}
          action={
            isFiltering ? (
              <Button variant="secondary" size="sm" onClick={resetAll}>
                {t('filter.reset')}
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
