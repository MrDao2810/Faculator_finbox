'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  FORMULA_SUMMARIES,
  RECENT_SEARCHES_KEY,
  countHiddenByLevel,
  formulasForLevel,
  selectFormulas,
} from '@/application';
import type { FormulaSummary } from '@/application';
import { useListParams } from '@/application/use-list-params';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { useQueryDraft } from '@/application/use-query-draft';
import { useRecentSearches } from '@/application/use-recent-searches';
import {
  EmptyState,
  HiddenByLevelNote,
  HotCategories,
  RecentSearches,
  SearchBox,
  SearchResults,
} from '@/ui/browse';

import styles from './SearchScreen.module.css';

/** Gợi ý khi không tìm thấy gì — WF-09 trạng thái B, khối "Có thể bạn cần". */
const SUGGESTED_IDS: ReadonlyArray<string> = ['co-lenh-rui-ro', 'roi', 'gia-hoa-von'];

/**
 * Màn WF-09 Tìm kiếm, hai trạng thái — gói WBS 3.1.3.
 *
 * Vì sao có màn này bên cạnh `/cong-thuc/` vốn cũng tìm được:
 * `/cong-thuc/` là màn DUYỆT có kèm ô tìm — giữ nguyên bộ chip lọc và dòng đếm, và là URL
 * chính danh cho Google. Màn này là màn TÌM: tự đặt con trỏ vào ô nhập, có chip tìm gần đây,
 * kết quả gom theo nhóm. Cả hai gọi cùng một `selectFormulas()` ở tầng Domain nên không có
 * chỗ nào để hai màn lệch kết quả nhau.
 *
 * Trang cha đặt `robots: noindex` và không có trong `sitemap.xml`: hai URL cùng ra một danh
 * sách là đúng thứ FR-25 không muốn.
 */
export function SearchScreen() {
  const { params, setParams } = useListParams();
  const { mode } = usePreferences();
  const t = useT();
  const pick = usePick();
  const inputRef = useRef<HTMLDivElement>(null);

  /*
   * Kho RIÊNG của màn này — chip ghi ở trang chủ không lọt sang đây và ngược lại. Xem docblock
   * `recent-searches.ts` về vì sao hai kho.
   */
  const { terms: recent, remember, clear: clearRecent } = useRecentSearches(RECENT_SEARCHES_KEY);

  // Ô nhập đi qua bản nháp cục bộ, không ghi thẳng URL từng phím — xem use-query-draft.ts.
  const commitQuery = useCallback(
    (q: string) => {
      setParams({ q });
    },
    [setParams],
  );
  const { draft, setDraft, commitDraft } = useQueryDraft(params.q, commitQuery);

  // Đặt con trỏ vào ô nhập khi vào màn: người dùng bấm sang đây là để gõ.
  useEffect(() => {
    inputRef.current?.querySelector('input')?.focus();
  }, []);

  // Lọc theo BẢN NHÁP chứ không theo `params.q`: gõ tới đâu thấy kết quả tới đó. `params` vẫn
  // là nguồn của các bộ lọc khác (nhóm, mảng, cấp độ) vì chúng không gõ từng ký tự.
  const trimmed = draft.trim();

  /*
   * Chế độ Cơ bản cắt bớt bộ tìm — FR-09. Cùng một `pool` cho kết quả, khối "Danh mục hot" và
   * dòng "xem tất cả N": ba con số trên cùng một màn mà đếm hai bộ khác nhau là sai hiển nhiên.
   */
  const pool = useMemo(() => formulasForLevel(FORMULA_SUMMARIES, mode), [mode]);

  const results = useMemo(
    () => (trimmed === '' ? [] : selectFormulas(pool, { ...params, q: trimmed })),
    [pool, params, trimmed],
  );

  const hiddenByLevel = useMemo(
    () =>
      trimmed === '' ? 0 : countHiddenByLevel(FORMULA_SUMMARIES, { ...params, q: trimmed }, mode),
    [params, trimmed, mode],
  );

  /**
   * Ghi "Tìm gần đây" khi người dùng THỰC SỰ chọn một kết quả — không phải cứ gõ ra kết quả là
   * ghi. Bản trước tự ghi ngay khi có kết quả (debounce 900ms sau khi ngừng gõ), nên gõ "Giá"
   * rồi không bấm gì vẫn ra một mục "Giá" trong lịch sử — sai với điều người dùng mong đợi:
   * lịch sử phải là công thức đã CHỌN, không phải chữ đã GÕ.
   *
   * Vì vậy lưu lại TÊN công thức (`pick(formula.name)`) chứ không phải `trimmed`, và chỉ gọi từ
   * `onClick` của dòng kết quả (`SearchResults`'s `onSelect`) — xem chỗ gọi bên dưới.
   */
  function onSelectResult(formula: FormulaSummary): void {
    remember(pick(formula.name));
  }

  // Giữ đúng thứ tự đã chọn, không theo thứ tự Registry — id lạ thì bỏ qua chứ không vỡ màn.
  // Lấy từ `pool`: gợi ý một công thức mà bấm vào rồi quay ra không thấy trong danh sách là tệ hơn
  // gợi ý ít đi một mục. (Cả ba id đang chọn đều mức Cơ bản nên thực tế không mất mục nào.)
  const suggestions = SUGGESTED_IDS.map((id) => pool.find((f) => f.id === id)).filter(
    (f) => f !== undefined,
  );

  return (
    <div className={styles.screen}>
      {/*
        Đường ra KHÔNG còn ở đây — nó chuyển lên thanh trên cùng đợt với màn chi tiết và bảng dữ
        liệu (xem `HeaderIdentity`). Wireframe WF-09 vẽ dấu `‹` ngay bên trái ô tìm; bản dựng cũ
        xếp nó lên TRÊN ô tìm vì ở 360px ô tìm cần trọn bề ngang. Nay nó nằm ở hàng dính trên, tức
        gần đúng chỗ bản vẽ muốn hơn cả bản cũ, mà ô tìm vẫn giữ trọn bề ngang và lên được dòng đầu.
      */}
      <div ref={inputRef}>
        <SearchBox
          value={draft}
          onChange={setDraft}
          onSubmit={() => {
            // Enter là dấu hiệu người dùng gõ xong: chốt URL ngay để link chia sẻ được luôn.
            commitDraft(draft);
          }}
        />
      </div>

      {trimmed === '' ? (
        <>
          <RecentSearches terms={recent} onPick={commitDraft} onClear={clearRecent} />

          {/* Lối tắt cho người chưa biết gõ gì — chỉ những nhóm ĐÃ có công thức. */}
          <HotCategories formulas={pool} />

          <p className={styles.tip}>{t('search.tip')}</p>
        </>
      ) : results.length > 0 ? (
        <>
          {/* WF-09 ghi rõ dòng này: nói cho người dùng biết vì sao gõ không dấu vẫn ra. */}
          <p className={styles.matchNote} aria-live="polite">
            {t('search.matchNote')} “{trimmed}” · {results.length} {t('search.resultCount')}
          </p>

          <HiddenByLevelNote count={hiddenByLevel} />

          <SearchResults formulas={results} query={trimmed} onSelect={onSelectResult} />
        </>
      ) : (
        <>
          {/*
            Khớp từ khoá nhưng mọi kết quả đều mức nâng cao: đó KHÔNG phải "không tìm thấy".
            Nói đúng chuyện đang xảy ra, kèm nút bật — nếu không người dùng đi đổi từ khoá mãi
            mà không bao giờ ra.
          */}
          <EmptyState
            title={
              hiddenByLevel > 0
                ? t('list.empty.basicOnly.title')
                : `${t('search.noMatch')} “${trimmed}”`
            }
            lines={
              hiddenByLevel > 0 ? [t('list.empty.basicOnly.hint')] : [t('list.empty.noMatch.scope')]
            }
          />

          <HiddenByLevelNote count={hiddenByLevel} />

          {suggestions.length > 0 && (
            <>
              <h2 className={styles.suggestTitle}>{t('search.suggest.title')}</h2>
              <SearchResults formulas={suggestions} />
            </>
          )}

          {/*
            Lối ra khi không tìm thấy: khối nhóm cho người dùng nhảy thẳng vào vùng mình quan tâm,
            thay vì phải nghĩ ra từ khoá khác.

            Từng có thêm một link "Xoá tìm kiếm · xem tất cả 111" ngay dưới đây — chủ dự án cho bỏ.
            Thanh nav dưới đã có mục "Công thức" dẫn đúng chỗ đó, nên nó là lối ra thứ hai cho cùng
            một nơi, đặt ở cuối một màn vốn đã dài.
          */}
          <HotCategories formulas={pool} />
        </>
      )}
    </div>
  );
}
