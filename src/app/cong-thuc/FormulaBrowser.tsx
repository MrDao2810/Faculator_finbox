'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  CLEARED_SELECT_FILTERS,
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  countByCategoryFor,
  countHiddenByLevel,
  formulasForLevel,
  hasSelectFilters,
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
  SEGMENT_LABEL_KEYS,
  SEGMENT_TABS_ID,
  SearchBoxLink,
  VirtualList,
} from '@/ui/browse';
import { rememberOrigin } from '@/ui/layout/OriginTracker';
import { Button, tabId } from '@/ui/primitives';

import styles from './FormulaBrowser.module.css';

/**
 * id của vùng nội dung mà thanh tab mảng điều khiển.
 *
 * Chuỗi cứng chứ không `useId()`: bản build là HTML tĩnh, và id do React sinh khác nhau giữa
 * lượt dựng lúc build và lượt hydrate — cùng lý do cả thư mục `ui/charts` bị cấm `useId()`.
 */
const PANEL_ID = 'danh-sach-cong-thuc';

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
  /*
   * Không còn `countBySegmentFor(pool, params)`: ba tab mảng đã bỏ số đếm, chỉ còn chữ. Hàm ấy
   * vẫn sống ở Domain kèm ca kiểm riêng — xem docblock `CategoryFilter`.
   */
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

      {/*
        Nút "Xoá bộ lọc" của khối này chỉ xoá HAI Ô CHỌN nó đứng cạnh, không đụng thanh tab mảng
        bên trên và cũng không đụng chuỗi tìm — xem `CLEARED_SELECT_FILTERS` bên `url-state.ts`.

        `showReset` phải hỏi ĐÚNG câu ấy (`hasSelectFilters`), không phải `isFiltering`: đang ở
        mảng "Cá nhân" mà hai ô chọn vẫn mặc định thì `isFiltering` là true, nút hiện lên, bấm vào
        không đổi gì. Một nút không làm gì còn tệ hơn một nút vắng mặt.
      */}
      <CategoryFilter
        params={params}
        onChange={setParams}
        onReset={() => {
          setParams(CLEARED_SELECT_FILTERS);
        }}
        categoryCounts={categoryCounts}
        showReset={hasSelectFilters(params)}
        panelId={PANEL_ID}
      />

      {/*
        Vùng nội dung của thanh tab mảng.

        Bọc CẢ dòng đếm lẫn danh sách (và cả bốn khối rỗng): chúng là một vùng duy nhất mà thanh
        tab thay đổi, nên `aria-labelledby` phải trỏ về tab đang chọn để trình đọc màn hình biết
        đang đọc danh sách của mảng nào.

        `aria-live` của dòng đếm vẫn giữ: nó nói ra số kết quả sau MỌI lần đổi bộ lọc, kể cả đổi
        nhóm hay đổi cách sắp — những thứ không đi qua thanh tab.
      */}
      <div
        id={PANEL_ID}
        role="tabpanel"
        aria-labelledby={tabId(SEGMENT_TABS_ID, params.segment)}
        className={styles.panel}
      >
        {/*
          Mở đầu bằng TÊN MẢNG đang chọn — "Tất cả · 111 công thức", "Chứng khoán · 98 công thức".

          Trước chỉ có "111 công thức", đứng một mình dưới cụm tab thì trông trống và không nói
          nó đang đếm cái gì. Tên mảng lấy từ `SEGMENT_LABEL_KEYS`, đúng bảng mà ba tab đang đọc,
          nên dòng này và tab đang chọn không bao giờ gọi khác tên nhau.

          Dấu `·` là ký tự THẬT trong JSX, không phải `gap` hay `::before`: nó phải đi vào cả chuỗi
          mà `aria-live` đọc lên. Cùng khuôn với dòng "Duyệt theo nhóm · 111 công thức" ở trang chủ
          và với `<h3>` của từng mảng — ba chỗ cùng bày một cặp "tên · số đếm".

          ⚠ Con số vẫn là số công thức khớp TOÀN BỘ bộ lọc, không riêng mảng: chọn thêm một nhóm
          thì nó tụt xuống trong khi chữ "Chứng khoán" vẫn đứng đó. Đúng ý chủ dự án — dòng này
          nói "trong mảng này, còn bấy nhiêu" — nhưng đừng đọc nó thành sĩ số của mảng.
        */}
        <p className={styles.count} aria-live="polite">
          {t(SEGMENT_LABEL_KEYS[params.segment])} · {formulas.length} {t('list.count')}
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
            /*
              Nút này xoá SẠCH, khác hẳn nút cùng tên ở khối bộ lọc phía trên — và sự khác nhau ấy
              là cố ý. Ở đây danh sách đang RỖNG, nên thứ đang giữ nó rỗng thường là chuỗi tìm hoặc
              mảng chứ không phải hai ô chọn. Xoá mỗi hai ô ấy là trả người dùng về đúng màn trống
              cũ — một lối thoát không dẫn đi đâu. Nút trên thì ngược lại: nó đứng cạnh hai ô chọn
              và chỉ được phép nói về chúng.
            */
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
    </div>
  );
}
