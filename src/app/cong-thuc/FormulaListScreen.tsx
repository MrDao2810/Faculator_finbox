'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  CLEARED_SELECT_FILTERS,
  FORMULA_LIST_ANCHOR,
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  LEGACY_HOME_RECENT_SEARCHES_KEY,
  RECENT_SEARCHES_KEY,
  countByCategoryFor,
  countHiddenByLevel,
  formulasForLevel,
  hasSelectFilters,
  isDefaultListParams,
  parseFormulaUsage,
  selectFormulas,
  usageOrderMap,
} from '@/application';
import type { FormulaSummary, FormulaUsage, ListSort } from '@/application';
import { ListUrlSync } from '@/application/list-url-sync';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { useListUrlState } from '@/application/use-list-url-state';
import { useRecentSearches } from '@/application/use-recent-searches';
import {
  CategoryChips,
  EmptyState,
  FormulaCard,
  HiddenByLevelNote,
  RecentSearches,
  SearchBox,
  VirtualList,
} from '@/ui/browse';
import { rememberOrigin } from '@/ui/layout/OriginTracker';
import { ModeToggle } from '@/ui/navigation';
import { Button, Select } from '@/ui/primitives';

import styles from './FormulaListScreen.module.css';

/** `id` tiêu đề khối danh sách — chuỗi cứng chứ không `useId()`, vì bản build là HTML tĩnh. */
const LIST_TITLE_ID = `${FORMULA_LIST_ANCHOR}-tieu-de`;
/** `id` chữ "Mức độ" nhìn thấy — tên khả truy cập của cụm Cơ bản / Nâng cao. */
const LEVEL_LABEL_ID = 'muc-do';
/** `id` ô Sắp xếp — truyền thẳng cho `Select` thay vì để nó tự sinh bằng `useId()`. */
const SORT_ID = 'sap-xep';

/** Trễ trước khi đổi chữ trong vùng aria-live, tính bằng mili giây. */
const LIVE_DELAY = 400;

/** Bộ công thức của chế độ Cơ bản — dựng một lần, cùng một hàm màn chi tiết và màn tìm dùng. */
const BASIC_POOL = formulasForLevel(FORMULA_SUMMARIES, 'basic');

/**
 * Thứ tự trong ô Sắp xếp gom theo LOẠI tiêu chí, không theo thứ tự thêm vào: hai cách sắp bám
 * thói quen người dùng đứng cạnh nhau ngay sau mặc định, rồi tới cấp độ, cuối cùng là bảng chữ
 * cái. Người tìm "cái mình vừa xem" không phải quét qua A → Z mới thấy.
 */
const SORTS: ReadonlyArray<{
  value: ListSort;
  labelKey: 'sort.featured' | 'sort.recent' | 'sort.used' | 'sort.basic' | 'sort.az' | 'sort.za';
}> = [
  { value: 'featured', labelKey: 'sort.featured' },
  { value: 'recent', labelKey: 'sort.recent' },
  { value: 'used', labelKey: 'sort.used' },
  { value: 'basic', labelKey: 'sort.basic' },
  { value: 'az', labelKey: 'sort.az' },
  { value: 'za', labelKey: 'sort.za' },
];

export interface FormulaListScreenProps {
  /**
   * Khối "Công thức dùng hằng ngày" do SERVER dựng — xem docblock `DailyShelf`. Nhận qua prop chứ
   * không import, để các thẻ của kệ có sẵn trong HTML tĩnh và không lọt vào gói máy khách.
   */
  shelf: ReactNode;
}

/**
 * Màn Công thức — trang chủ WF-01 và danh sách WF-02 GỘP LÀM MỘT (chủ dự án chốt 15/09/2026).
 *
 * Từ trên xuống: ô tìm gõ được + chip "Tìm gần đây" → kệ "Công thức dùng hằng ngày" → khối "Danh
 * sách công thức" (hàng tiêu đề có Mức độ và Sắp xếp, hàng chip nhóm, dòng đếm, lưới thẻ). Chủ dự
 * án mô tả: *"sử dụng màn công thức và đưa phần công thức dùng hàng ngày lên đầu, giữ nguyên thiết
 * kế Công thức ở phía dưới chỉ là thu nhỏ và tối giản các button lớn cũ"*.
 *
 * ── Ô tìm lọc CẢ danh sách, tại chỗ ─────────────────────────────────────────────────────────────
 *
 * Trang chủ cũ chỉ lọc 18 ô của kệ, vì lọc cả thư viện là thay trang chủ bằng giao diện của một màn
 * khác dưới cái tab "Trang chủ". Nay không còn màn nào khác: danh sách đầy đủ nằm ngay dưới, nên gõ
 * là lọc nó. Kệ ẨN trong lúc tìm (thuộc tính `hidden`, không tháo khỏi DOM — tháo ra là mất thứ tự đã
 * cá nhân hoá mỗi lần xoá ô tìm), để kết quả nằm ngay dưới chỗ đang gõ thay vì dưới cả kệ.
 *
 * Ô tìm cũ ở `/cong-thuc/` là một link sang `/tim-kiem/` trông như ô nhập (`SearchBoxLink`) — đã bỏ.
 * Màn tìm WF-09 vẫn còn nguyên, chỉ không còn lối vào từ đây.
 *
 * ── Cụm Cơ bản / Nâng cao ở hàng tiêu đề danh sách, không ở thanh trên ─────────────────────────
 *
 * Luật cũ `showsModeToggle()` đo trên Chrome ở 420×900: trang chủ lúc nhàn bấm đổi chế độ không đổi
 * MỘT ký tự, 94/111 trang chi tiết bấm không thấy gì — nút đặt ở chỗ không trả lời gì dạy người dùng
 * rằng "nút này hỏng". Ở màn danh sách thì con số đổi 79 → 111 ngay cạnh ngón tay. Nay nút đứng
 * NGAY TRONG hàng tiêu đề của chính danh sách nó làm đổi, kèm chữ "Mức độ" — lý do cũ còn đúng hơn.
 *
 * ── HTML tĩnh và lượt hydrate ────────────────────────────────────────────────────────────────
 *
 *   - Không `useSearchParams()` ở đây — xem `use-list-url-state.ts`. Kệ và danh sách nằm trong HTML.
 *   - Trước khi đọc xong tuỳ chọn (`hydrated`), danh sách dựng ĐỦ 111 thẻ: Google phải thấy đủ đường
 *     vào, và `verify-static.mjs` đếm. Thẻ Nâng cao mang lớp `advancedPreHydrate` để CSS giấu chúng
 *     ngay từ pixel đầu khi `<html>` chưa có `data-mode='advanced'` — người dùng Cơ bản không còn
 *     thấy danh sách co 111 → 79 lúc tải trang (vế danh sách của lỗi #21). Sau hydrate React tháo
 *     đúng những `<li>` vốn đã `display: none`, nên màn không nhúc nhích.
 *   - Con số trên chip nhóm và dòng "Hiển thị · N" dựng CẢ HAI nhánh, CSS chọn theo `data-mode` —
 *     cùng cơ chế `ModeToggle`, nên đổi chế độ không bao giờ làm số nháy.
 */
export function FormulaListScreen({ shelf }: FormulaListScreenProps) {
  const t = useT();
  const pick = usePick();
  const { mode, hydrated, setMode } = usePreferences();
  const inputRef = useRef<HTMLInputElement>(null);

  const { params, setQuery, setFilters, reset, flushUrl, applySearch } = useListUrlState({
    onUrlWritten: rememberOrigin,
  });

  /*
   * Chip "Tìm gần đây" — kho CHUNG với màn tìm WF-09, vì hai ô tìm nay chạy trên cùng một phạm vi.
   * Kho riêng cũ của trang chủ được gộp vào ở lần mở đầu tiên rồi xoá — xem `recent-searches.ts`.
   */
  const {
    terms: recent,
    remember,
    clear: clearRecent,
  } = useRecentSearches(RECENT_SEARCHES_KEY, { absorbKey: LEGACY_HOME_RECENT_SEARCHES_KEY });

  /*
   * Lịch sử mở công thức, cho hai cách sắp "Vừa xem gần đây" và "Hay dùng nhất".
   *
   * Khởi tạo là hằng số `null` để lượt render đầu ở máy khách dựng ĐÚNG cây của HTML tĩnh — luật
   * chung của repo, xem docblock `FeaturedFormulas`. `now` chốt luôn tại đây: `usageScore` bán rã 30
   * ngày nên một phiên làm việc không đổi được thứ hạng, đổi lại `Date.now()` không bao giờ chạy
   * trong lúc render.
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

  /** Chỉ chấm điểm khi cách sắp đang chọn thật sự cần — các cách còn lại không đụng tới. */
  const usageOrder = useMemo(() => {
    if (history === null) return undefined;
    if (params.sort !== 'recent' && params.sort !== 'used') return undefined;
    return usageOrderMap(history.usage, params.sort, history.now);
  }, [history, params.sort]);

  /*
   * Hai kết quả song song: của chế độ Cơ bản và của cả thư viện.
   *
   * Cả hai con số cùng phải có mặt trong DOM để CSS chọn theo `data-mode`, và thứ tự tương đối của
   * thẻ Cơ bản trong hai danh sách là MỘT — cùng phép so, cùng thứ tự đầu vào — nên giấu bằng CSS
   * các thẻ Nâng cao của `allMatches` cho ra đúng `basicMatches`.
   */
  const basicMatches = useMemo(
    () => selectFormulas(BASIC_POOL, params, { usageOrder }),
    [params, usageOrder],
  );
  const allMatches = useMemo(
    () => selectFormulas(FORMULA_SUMMARIES, params, { usageOrder }),
    [params, usageOrder],
  );

  /* Trước hydrate: đủ 111 (HTML tĩnh). Sau hydrate: đúng chế độ người dùng đã chọn. */
  const formulas = hydrated && mode === 'basic' ? basicMatches : allMatches;

  const basicCategoryCounts = useMemo(() => countByCategoryFor(BASIC_POOL, params), [params]);
  const allCategoryCounts = useMemo(() => countByCategoryFor(FORMULA_SUMMARIES, params), [params]);

  /**
   * Bao nhiêu công thức khớp bộ lọc này nhưng chế độ Cơ bản đang giấu. Không phụ thuộc chế độ đang
   * chọn — dòng báo chỉ HIỆN ở chế độ Cơ bản, và CSS lo vế ấy.
   */
  const hiddenByLevel = useMemo(
    () => countHiddenByLevel(FORMULA_SUMMARIES, params, 'basic'),
    [params],
  );

  const searching = params.q.trim() !== '';
  const filtering = !isDefaultListParams(params);
  const registryEmpty = FORMULA_SUMMARIES.length === 0;
  const visibleCount = formulas.length;

  /**
   * Ghi "Tìm gần đây" khi người dùng bấm vào một KẾT QUẢ TÌM — không phải mỗi lần họ mở một công
   * thức (thứ sau đã có kho riêng `ffb.usage.v1`). Vì vậy chỉ truyền xuống thẻ lúc đang tìm.
   *
   * `useCallback` là bắt buộc: `FormulaCard` là `memo`, truyền hàm mới mỗi lượt gõ thì cả lưới
   * dựng lại theo từng phím.
   */
  const rememberResult = useCallback(
    (formula: FormulaSummary) => {
      remember(pick(formula.name));
    },
    [remember, pick],
  );

  /** Bấm lại một thứ đã tìm: lọc NGAY tại chỗ, URL ghi ngay, tiêu điểm về ô tìm. */
  const pickRecent = useCallback(
    (term: string) => {
      setQuery(term);
      flushUrl();
      inputRef.current?.focus();
    },
    [setQuery, flushUrl],
  );

  /*
   * Chữ trong vùng aria-live đi CHẬM hơn danh sách một nhịp: danh sách phải đổi tức thì theo từng
   * phím, nhưng vùng live đổi theo từng phím thì trình đọc màn hình bị ngắt lời liên tục. Lúc chưa
   * lọc gì thì im — con số mặc định không phải tin mới.
   */
  const [liveText, setLiveText] = useState('');
  useEffect(() => {
    if (!filtering) {
      setLiveText('');
      return;
    }
    const timer = setTimeout(() => {
      setLiveText(`${String(visibleCount)} ${t('list.count')}`);
    }, LIVE_DELAY);
    return () => {
      clearTimeout(timer);
    };
  }, [filtering, visibleCount, params, t]);

  return (
    <div className={styles.screen}>
      {/*
        Không có `<h1>` trong thân màn: tiêu đề "Công thức" do thanh trên dựng (`headerTitleKey()`).
        Trang vẫn đúng một `<h1>` — `verify-static.mjs` đếm.
      */}
      <div className={styles.searchArea}>
        <div className={styles.searchSlot}>
          <SearchBox
            inputRef={inputRef}
            value={params.q}
            onChange={setQuery}
            onCancel={() => {
              setQuery('');
            }}
            onSubmit={flushUrl}
          />
        </div>

        {/* Chip lịch sử chỉ ở trạng thái chưa gõ — đang tìm thì kết quả mới là thứ cần đọc. */}
        {!searching && (
          <RecentSearches
            variant="inline"
            terms={recent}
            onPick={pickRecent}
            onClear={clearRecent}
          />
        )}
      </div>

      {/*
        Vùng thông báo dựng NGAY TỪ LẦN RENDER ĐẦU và không bao giờ tháo, chỉ đổi chữ bên trong —
        sinh nó ra cùng lúc với nội dung thì trình đọc màn hình coi cả vùng là mới và bỏ qua.
      */}
      <p className={styles.live} aria-live="polite">
        {liveText}
      </p>

      <div hidden={searching}>{shelf}</div>

      <section id={FORMULA_LIST_ANCHOR} className={styles.list} aria-labelledby={LIST_TITLE_ID}>
        <div className={styles.listHead}>
          <h2 className={styles.blockTitle} id={LIST_TITLE_ID}>
            {t('list.label')}
          </h2>

          <div className={styles.controls}>
            <div className={styles.level}>
              <span className={styles.controlLabel} id={LEVEL_LABEL_ID}>
                {t('list.levelLabel')}
              </span>
              <ModeToggle labelledBy={LEVEL_LABEL_ID} />
            </div>

            <Select
              id={SORT_ID}
              className={styles.sort}
              label={t('sort.label')}
              value={params.sort}
              onChange={(event) => {
                setFilters({ sort: event.target.value as ListSort });
              }}
            >
              {SORTS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  {t(sort.labelKey)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <CategoryChips
          value={params.categoryId}
          onChange={(categoryId) => {
            setFilters({ categoryId });
          }}
          basicCounts={basicCategoryCounts}
          allCounts={allCategoryCounts}
        />

        <div className={styles.summary}>
          {/*
            "Hiển thị · 79 công thức" — cả hai con số nằm sẵn, CSS chọn theo `data-mode`. Dấu `·` là
            ký tự THẬT trong JSX để nó đi vào chuỗi trình đọc màn hình đọc.
          */}
          <p className={styles.count}>
            {t('list.showing')} · <span className={styles.countBasic}>{basicMatches.length}</span>
            <span className={styles.countAdvanced}>{allMatches.length}</span> {t('list.count')}
          </p>

          {/*
            Chỉ xoá BỘ LỌC (nhóm + cách sắp), không đụng chuỗi tìm — ô tìm có nút × của riêng nó.
            Hỏi đúng câu `hasSelectFilters`, không phải "có lọc gì không": đang tìm mà bộ lọc mặc
            định thì nút này bấm vào không đổi gì, và một nút không làm gì còn tệ hơn vắng mặt.
          */}
          {hasSelectFilters(params) && (
            <Button
              variant="ghost"
              size="sm"
              className={styles.reset}
              onClick={() => {
                setFilters(CLEARED_SELECT_FILTERS);
              }}
            >
              {t('filter.reset')}
            </Button>
          )}
        </div>

        {/*
          Dòng "N công thức nâng cao đang ẩn" — chỉ khi danh sách CÒN mục (lúc rỗng thì khối rỗng đã
          nói), và chỉ ở chế độ Cơ bản (CSS giấu ở chế độ Nâng cao; con số không phụ thuộc chế độ).
        */}
        {hiddenByLevel > 0 && basicMatches.length > 0 && (
          <div className={styles.onlyBasic}>
            <HiddenByLevelNote count={hiddenByLevel} />
          </div>
        )}

        {formulas.length > 0 ? (
          <VirtualList
            items={formulas}
            itemKey={(formula) => formula.id}
            label={t('list.label')}
            itemClassName={
              hydrated
                ? undefined
                : (formula) =>
                    formula.level === 'advanced' ? styles.advancedPreHydrate : undefined
            }
          >
            {(formula) => (
              <FormulaCard formula={formula} onSelect={searching ? rememberResult : undefined} />
            )}
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
            /*
              Nút này xoá SẠCH, khác hẳn nút cùng tên ở dòng đếm phía trên — và sự khác nhau ấy là
              cố ý. Ở đây danh sách đang RỖNG, nên thứ giữ nó rỗng thường là chuỗi tìm chứ không phải
              bộ lọc. Xoá mỗi bộ lọc là trả người dùng về đúng màn trống cũ — một lối thoát không dẫn
              đi đâu.
            */
            action={
              filtering ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    reset();
                    inputRef.current?.focus();
                  }}
                >
                  {t('filter.reset')}
                </Button>
              ) : undefined
            }
          />
        )}
      </section>

      <ListUrlSync onSearch={applySearch} />
    </div>
  );
}
