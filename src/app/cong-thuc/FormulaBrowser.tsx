'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  formulasForLevel,
  isDefaultListParams,
  parseFormulaUsage,
  selectFormulas,
  usageOrderMap,
} from '@/application';
import type { FormulaUsage } from '@/application';
import { useListParams } from '@/application/use-list-params';
import { usePreferences, useT } from '@/application/preferences-context';
import {
  CategoryFilter,
  EmptyState,
  FormulaCard,
  HiddenByLevelNote,
  SearchBoxLink,
  VirtualList,
} from '@/ui/browse';
import { rememberOrigin } from '@/ui/layout/OriginTracker';
import { Button } from '@/ui/primitives';

import styles from './FormulaBrowser.module.css';

/**
 * Màn WF-02 Danh sách công thức — gói WBS 2.2 (component) và 3.1.2 (lắp ráp).
 *
 * Tách khỏi page.tsx vì cần <Suspense> bao ngoài: `useListParams()` dùng
 * `useSearchParams()`, mà với `output: 'export'` thì hook đó bắt buộc nằm trong Suspense.
 *
 * Danh sách đi qua `VirtualList`, nhưng ở cỡ 111 công thức nó dựng THẲNG cả danh sách: ngưỡng
 * ảo hoá là 1000 vì đo lại thấy ảo hoá làm việc cuộn tệ đi ở cỡ này. Xem docblock `VirtualList`.
 *
 * Ô tìm ở đầu màn KHÔNG gõ được — bấm vào là nhảy sang `/tim-kiem/` (xem `SearchBoxLink`), nơi
 * mới thật sự gõ-lọc-tại-chỗ. Vì vậy `params.q` chỉ còn đọc từ URL (link chia sẻ, hoặc gõ tay),
 * không còn cơ chế bản nháp `useQueryDraft` như trước.
 */
export function FormulaBrowser() {
  const { params, setParams, reset } = useListParams();
  const { mode, setMode } = usePreferences();
  const t = useT();

  /*
   * Chế độ Cơ bản cắt bớt danh sách trước khi lọc — FR-09 vế "công thức phức tạp".
   * Mọi bộ đếm cũng chạy trên `pool` chứ không trên bộ đầy đủ: số trên chip lọc mà không khớp
   * số công thức bấm vào được là kiểu sai khó chịu nhất, vì nó trông như lỗi đếm.
   */
  const pool = useMemo(() => formulasForLevel(FORMULA_SUMMARIES, mode), [mode]);

  /*
   * Lịch sử mở công thức, cho hai cách sắp "Vừa xem gần đây" và "Hay dùng nhất".
   *
   * Khởi tạo là hằng số `null` để lượt render đầu ở máy khách dựng ĐÚNG cây mà bản tĩnh
   * `StaticFormulaList` đã dựng — luật chung của repo, xem docblock `FeaturedFormulas`.
   * Người chưa có lịch sử không bao giờ đi qua `setState` này, nên không có lượt dựng lại nào.
   *
   * `now` chốt luôn tại đây thay vì lấy lúc render: `usageScore` bán rã 30 ngày nên một phiên
   * làm việc không đổi được thứ hạng, đổi lại `Date.now()` không bao giờ chạy trong lúc render
   * — đúng ràng buộc mà `formula-usage.ts` ghi ra.
   */
  const [history, setHistory] = useState<{
    usage: ReadonlyArray<FormulaUsage>;
    now: number;
  } | null>(null);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(FORMULA_USAGE_KEY);
    } catch {
      // Trình duyệt chặn localStorage — hai cách sắp ấy về đúng thứ tự mặc định.
      return;
    }

    const usage = parseFormulaUsage(raw);
    if (usage.length === 0) return;
    setHistory({ usage, now: Date.now() });
  }, []);

  /** Chỉ chấm điểm khi cách sắp đang chọn thật sự cần — hai cách còn lại không đụng tới. */
  const usageOrder = useMemo(() => {
    if (history === null) return undefined;
    if (params.sort !== 'recent' && params.sort !== 'used') return undefined;
    return usageOrderMap(history.usage, params.sort, history.now);
  }, [history, params.sort]);

  const formulas = useMemo(
    () => selectFormulas(pool, params, { usageOrder }),
    [pool, params, usageOrder],
  );
  const segmentCounts = useMemo(() => countBySegmentFor(pool, params), [pool, params]);
  const categoryCounts = useMemo(() => countByCategoryFor(pool, params), [pool, params]);

  /** Bao nhiêu công thức khớp bộ lọc này nhưng chế độ Cơ bản đang giấu đi. */
  const hiddenByLevel = useMemo(
    () => countHiddenByLevel(FORMULA_SUMMARIES, params, mode),
    [params, mode],
  );

  /*
   * Ghi lại màn danh sách đang đứng, để nút quay lại ở trang chi tiết đưa người dùng về ĐÚNG
   * bộ lọc này chứ không về một danh sách trắng trơn (xem `origin-screen.ts`).
   *
   * `OriginTracker` trong `AppShell` đã ghi ở bốn thời điểm chung, nhưng KHÔNG bắt được lần này:
   * đổi bộ lọc chỉ thay TRUY VẤN chứ không thay `pathname`, nên effect bên ấy không chạy lại.
   * Đây là chỗ duy nhất biết chuyện đó vừa xảy ra, nên nó gọi thẳng.
   */
  useEffect(() => {
    rememberOrigin();
  }, [params]);

  const isFiltering = !isDefaultListParams(params);
  const registryEmpty = FORMULA_SUMMARIES.length === 0;

  return (
    <div className={styles.browser}>
      <SearchBoxLink />

      <CategoryFilter
        params={params}
        onChange={setParams}
        onReset={reset}
        segmentCounts={segmentCounts}
        categoryCounts={categoryCounts}
        showReset={isFiltering}
      />

      {/* aria-live để trình đọc màn hình biết số kết quả đổi sau mỗi lần đổi bộ lọc. */}
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
