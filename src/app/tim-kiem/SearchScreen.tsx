'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  FORMULA_SUMMARIES,
  MAX_RECENT_SEARCHES,
  RECENT_SEARCHES_KEY,
  ROUTES,
  addRecentSearch,
  countHiddenByLevel,
  formulasForLevel,
  parseRecentSearches,
  selectFormulas,
  serializeRecentSearches,
  t,
} from '@/application';
import { useListParams } from '@/application/use-list-params';
import { usePreferences } from '@/application/preferences-context';
import { useQueryDraft } from '@/application/use-query-draft';
import {
  EmptyState,
  HiddenByLevelNote,
  HotCategories,
  RecentSearches,
  SearchBox,
  SearchResults,
} from '@/ui/browse';
import { BackLink } from '@/ui/navigation';

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
  const [recent, setRecent] = useState<ReadonlyArray<string>>([]);
  const inputRef = useRef<HTMLDivElement>(null);

  // Ô nhập đi qua bản nháp cục bộ, không ghi thẳng URL từng phím — xem use-query-draft.ts.
  const commitQuery = useCallback(
    (q: string) => {
      setParams({ q });
    },
    [setParams],
  );
  const { draft, setDraft, commitDraft } = useQueryDraft(params.q, commitQuery);

  // Đọc localStorage trong effect, KHÔNG đọc lúc khởi tạo state: bản build là HTML tĩnh nên
  // lần render đầu ở máy khách phải giống hệt lúc build, nếu không lệch hydration (bài học đợt 2).
  useEffect(() => {
    try {
      setRecent(parseRecentSearches(window.localStorage.getItem(RECENT_SEARCHES_KEY)));
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư chẳng hạn) thì coi như chưa tìm gì.
      setRecent([]);
    }
  }, []);

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

  /** Ghi lại từ khoá đã dùng — chỉ khi nó thật sự ra kết quả, để lịch sử không đầy rác. */
  useEffect(() => {
    if (trimmed === '' || results.length === 0) return;

    // Chờ người dùng ngừng gõ rồi mới ghi, nếu không mỗi ký tự thành một mục lịch sử.
    const timer = setTimeout(() => {
      setRecent((current) => {
        const next = addRecentSearch(current, trimmed, MAX_RECENT_SEARCHES);
        try {
          window.localStorage.setItem(RECENT_SEARCHES_KEY, serializeRecentSearches(next));
        } catch {
          // Không ghi được thì thôi, đừng làm hỏng màn.
        }
        return next;
      });
    }, 900);

    return () => {
      clearTimeout(timer);
    };
  }, [trimmed, results.length]);

  function clearRecent(): void {
    setRecent([]);
    try {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Xoá không được thì danh sách trên màn vẫn sạch; lần sau mở lại sẽ hiện lại.
    }
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
        Wireframe WF-09 vẽ dấu `‹` ngay bên trái ô tìm. Ở 360px ô tìm cần trọn bề ngang nên
        đường ra xếp lên trên nó — vẫn là hàng đầu tiên của màn, đúng chỗ mắt tìm.
      */}
      <BackLink />

      <div ref={inputRef}>
        <SearchBox
          value={draft}
          onChange={setDraft}
          onSubmit={() => {
            // Enter là dấu hiệu người dùng gõ xong: chốt URL ngay để link chia sẻ được luôn.
            commitDraft(draft);
          }}
          showHint={trimmed === ''}
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

          <SearchResults formulas={results} query={trimmed} />
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
              hiddenByLevel > 0
                ? [t('list.empty.basicOnly.hint')]
                : [t('list.empty.noMatch.scope'), t('search.hint')]
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
            Không tìm thấy thì lối ra không chỉ có một link "xem tất cả": khối nhóm cho người
            dùng nhảy thẳng vào vùng mình quan tâm, thay vì phải nghĩ ra từ khoá khác.
          */}
          <HotCategories formulas={pool} />

          <Link className={styles.seeAll} href={ROUTES.formulas}>
            {t('search.seeAll')} {pool.length}
          </Link>
        </>
      )}
    </div>
  );
}
