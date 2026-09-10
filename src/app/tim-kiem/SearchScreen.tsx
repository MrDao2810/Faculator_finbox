'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import {
  CATEGORIES,
  DEFAULT_LIST_PARAMS,
  FORMULA_SUMMARIES,
  RECENT_SEARCHES_KEY,
  countHiddenByLevel,
  formulaListPath,
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
  FormulaFolders,
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
 *
 * ── Khổ PC: bản vẽ "Thư mục theo nhóm" ────────────────────────────────────────────────────
 *
 * Đây là màn duy nhất KHÔNG có trong bộ 11 bản vẽ hi-fi, nên nó từng dùng tạm bản điện thoại
 * kẹp lại 720px. Chủ dự án gửi bản vẽ riêng cho nó (phương án 05/10), và bản vẽ ấy quyết đúng
 * ba câu hỏi đang để ngỏ ở docblock cũ của `SearchScreen.module.css`: khung trải rộng, chưa gõ
 * gì thì bày THƯ MỤC 12 nhóm chứ không phải sáu ô "Danh mục hot", còn kết quả tìm là chính lưới
 * thư mục ấy thu lại còn những nhóm có kết quả.
 *
 * Hai khối lối tắt cùng nằm trong DOM và CSS chọn theo bề ngang — cùng lối `CategoryGrid` đã
 * dùng cho cặp con số Cơ bản / Nâng cao, và ở đây không có ràng buộc HTML tĩnh nào (trang bọc
 * `<Suspense fallback={null}>`) nên đây thuần là chuyện chọn hình theo khổ màn.
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

  /*
   * Số công thức của TỪNG nhóm trong bộ đang tìm — đầu mỗi thẻ kết quả in "7 / 13". Đếm trên
   * `pool` chứ không trên `FORMULA_SUMMARIES`: mẫu số phải là thứ người dùng bấm vào được ở chế
   * độ hiện tại, đúng như dòng "xem tất cả N" và khối thư mục.
   */
  const totals = useMemo(() => {
    const counts = new Map<string, number>();
    for (const formula of pool) {
      counts.set(formula.categoryId, (counts.get(formula.categoryId) ?? 0) + 1);
    }
    return counts;
  }, [pool]);

  /*
   * Những nhóm CÓ công thức nhưng không có kết quả nào khớp — hàng chip cuối trạng thái đang gõ,
   * theo bản vẽ. Nói ra chỗ đã tìm mà không thấy, để người dùng biết mình đã quét hết thư viện
   * chứ không phải mới quét bốn nhóm hiện trên màn.
   */
  const emptyCategories = useMemo(() => {
    if (trimmed === '') return [];
    const hit = new Set(results.map((formula) => formula.categoryId));
    return CATEGORIES.filter(
      (category) => (totals.get(category.id) ?? 0) > 0 && !hit.has(category.id),
    );
  }, [results, totals, trimmed]);

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

        Ô tìm và hàng chip "Tìm gần đây" đứng CÙNG MỘT HÀNG ở khổ PC — bản vẽ "Thư mục theo nhóm"
        vẽ chúng thế. Ở khổ điện thoại `.topRow` vẫn là một cột, nên hai khối xếp dọc như cũ.
      */}
      <div className={styles.topRow}>
        <div ref={inputRef} className={styles.searchSlot}>
          <SearchBox
            value={draft}
            onChange={setDraft}
            onSubmit={() => {
              // Enter là dấu hiệu người dùng gõ xong: chốt URL ngay để link chia sẻ được luôn.
              commitDraft(draft);
            }}
          />
        </div>

        {trimmed === '' && (
          <RecentSearches terms={recent} onPick={commitDraft} onClear={clearRecent} />
        )}
      </div>

      {trimmed === '' ? (
        <>
          {/*
            Hai lối tắt cho người chưa biết gõ gì, CSS chọn theo khổ màn (xem docblock đầu file):
            sáu ô "Danh mục hot" ở điện thoại, thư mục 12 thẻ ở khổ PC. Cả hai chỉ hiện những nhóm
            ĐÃ có công thức — lối tắt dẫn vào phòng trống là lối tắt hỏng.
          */}
          <div className={styles.onlyPhone}>
            <HotCategories formulas={pool} />
          </div>
          <div className={styles.onlyDesktop}>
            <FormulaFolders formulas={pool} />
          </div>

          <p className={styles.tip}>{t('search.tip')}</p>
        </>
      ) : results.length > 0 ? (
        <>
          {/* WF-09 ghi rõ dòng này: nói cho người dùng biết vì sao gõ không dấu vẫn ra. */}
          <p className={styles.matchNote} aria-live="polite">
            {t('search.matchNote')} “{trimmed}” · {results.length} {t('search.resultCount')}
          </p>

          <HiddenByLevelNote count={hiddenByLevel} />

          <SearchResults
            formulas={results}
            query={trimmed}
            onSelect={onSelectResult}
            totals={totals}
          />

          {/*
            Hàng chip những nhóm không có kết quả nào — bản vẽ đặt nó ở cuối trạng thái đang gõ.
            Là link thật sang danh sách đã lọc nhóm, KHÔNG mang theo chuỗi đang tìm: mang theo là
            dẫn thẳng vào một danh sách rỗng, đúng thứ vừa nói là không có gì.
          */}
          {emptyCategories.length > 0 && (
            <p className={styles.noneIn}>
              <span className={styles.noneInLabel}>{t('search.noneIn')}</span>
              {emptyCategories.map((category) => (
                <Link
                  key={category.id}
                  className={styles.noneInChip}
                  href={formulaListPath({ ...DEFAULT_LIST_PARAMS, categoryId: category.id })}
                >
                  {pick(category.shortName)}
                </Link>
              ))}
            </p>
          )}
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
            thay vì phải nghĩ ra từ khoá khác. Cùng cặp hai dáng với trạng thái nhàn ở trên.

            Từng có thêm một link "Xoá tìm kiếm · xem tất cả 111" ngay dưới đây — chủ dự án cho bỏ.
            Thanh nav dưới đã có mục "Công thức" dẫn đúng chỗ đó, nên nó là lối ra thứ hai cho cùng
            một nơi, đặt ở cuối một màn vốn đã dài.
          */}
          <div className={styles.onlyPhone}>
            <HotCategories formulas={pool} />
          </div>
          <div className={styles.onlyDesktop}>
            <FormulaFolders formulas={pool} />
          </div>
        </>
      )}
    </div>
  );
}
