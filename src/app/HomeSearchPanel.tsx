'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  DEFAULT_LIST_PARAMS,
  FORMULA_SUMMARIES,
  countByCategoryFor,
  countBySegmentFor,
  countHiddenByLevel,
  formulaListPath,
  formulasForLevel,
  isDefaultListParams,
  selectFormulas,
} from '@/application';
import type { ListParams } from '@/application';
import { usePreferences, useT } from '@/application/preferences-context';
import { CategoryFilter, EmptyState, FormulaCard, HiddenByLevelNote, SearchBox } from '@/ui/browse';
import { Button } from '@/ui/primitives';

import styles from './HomeSearchPanel.module.css';

export interface HomeSearchPanelProps {
  /**
   * Nội dung trang chủ lúc chưa tìm gì: khối "Công thức dùng hằng ngày", hai lưới "Duyệt theo
   * nhóm", dòng tiến độ. Nhận qua `children` chứ không import vào đây — xem docblock dưới.
   */
  children: ReactNode;
}

/**
 * Số kết quả hiện thẳng trên trang chủ.
 *
 * Trang chủ là nơi XEM TRƯỚC, không phải danh sách thứ hai: quá ngần này thì có hàng
 * "Xem tất cả N" bàn giao sang `/cong-thuc/`, nơi duy nhất có URL chia sẻ được (FR-25).
 * Cắt ở đây cũng là lý do trang chủ không phải kéo `VirtualList` vào gói của mình.
 */
const PREVIEW_LIMIT = 8;

/** Trễ trước khi đổi chữ trong vùng aria-live, tính bằng mili giây. */
const LIVE_DELAY = 400;

/**
 * Ô tìm kiếm + lọc ngay tại trang chủ — WF-01 (gói WBS 3.1.1).
 *
 * Trước đợt này ô tìm ở trang chủ là một thẻ `<a>` trông giống ô nhập: bấm vào là nhảy sang
 * `/tim-kiem/`, mà route đó lại sáng mục "Công thức" ở thanh dưới, nên người dùng thấy như bị
 * đá sang màn khác. Nay gõ được tại chỗ, và kết quả hiện ngay bên dưới.
 *
 * ── Vì sao trạng thái nằm trong `useState` chứ KHÔNG lên URL ──────────────────────────────
 *
 * Đây là chỗ khác hẳn `/cong-thuc/`, và không phải do bỏ sót. Dùng `useListParams()` nghĩa là
 * dùng `useSearchParams()`, mà hook đó với `output: 'export'` bắt buộc phải nằm trong
 * `<Suspense>` — và toàn bộ cây bên trong ranh giới ấy BIẾN MẤT khỏi HTML tĩnh. Đo trên bản
 * build của đợt trước:
 *
 *   out/index.html            33.675 B · 0 marker bailout · 11 link công thức
 *   out/cong-thuc/index.html  14.608 B · 1 marker bailout · 0 link công thức
 *   out/cong-thuc/pe/index.html 33.598 B · 0 marker bailout   ← 'use client' KHÔNG giết HTML tĩnh
 *
 * Nói cách khác: thủ phạm là `useSearchParams`, không phải client component. Trang chủ là URL
 * priority 1.0 của sitemap; đẩy nó vào cùng cảnh với `/cong-thuc/` là mất sạch 33 kB nội dung
 * mà Google đang đọc được. Thêm nữa, `/?q=roi` và `/cong-thuc/?q=roi` cho cùng một danh sách —
 * đúng thứ FR-25 không muốn.
 *
 * Hệ quả nhận có ý thức: đang tìm mà bấm Lùi thì rời trang chủ chứ không hoàn tác việc tìm.
 * Cách bù bằng cờ trong `history.state` đã kiểm và KHÔNG dùng được: Next 15 tự ghi đè
 * `history.state` mỗi lần điều hướng nội bộ, nên cờ bị xoá lặng lẽ. Ba lối thoát thay thế đều
 * trong tầm ngón cái và đều trả tiêu điểm về ô tìm: nút × của ô, nút "Xoá bộ lọc", phím Esc.
 *
 * ── Vì sao khối tĩnh đi qua `children` ────────────────────────────────────────────────────
 *
 * KHÔNG phải để cứu HTML tĩnh (việc đó do đoạn trên lo). Lý do là gói JS: nhận qua `children`
 * thì `CategoryGrid` và nhánh `tile` của `FormulaCard` vẫn do server dựng và không lọt vào
 * bundle máy khách của trang chủ. Import thẳng vào đây là chúng vào gói ngay.
 *
 * Kèm theo: mọi thứ đọc `localStorage` hay `window` chỉ được đọc trong `useEffect`, và state
 * khởi tạo phải là hằng số — lần render đầu ở máy khách phải giống hệt HTML dựng lúc build.
 */
export function HomeSearchPanel({ children }: HomeSearchPanelProps) {
  const [params, setParams] = useState<ListParams>(DEFAULT_LIST_PARAMS);
  const { mode } = usePreferences();
  const t = useT();
  const inputRef = useRef<HTMLInputElement>(null);

  /*
   * Chế độ Cơ bản cắt bớt bộ tìm — FR-09, cùng luật với /cong-thuc/ và /tim-kiem/.
   *
   * Không ảnh hưởng HTML tĩnh: lần render đầu `usePreferences()` luôn trả về mặc định (đúng
   * bằng giá trị lúc build), và lúc chưa gõ gì thì cả nhánh này không dựng — trang chủ hiện
   * `children` do server dựng. Khối "Công thức dùng hằng ngày" vì vậy KHÔNG bị lọc: nó là kệ
   * ghim tay của FR-20, không phải danh sách duyệt.
   */
  const pool = useMemo(() => formulasForLevel(FORMULA_SUMMARIES, mode), [mode]);

  const results = useMemo(() => selectFormulas(pool, params), [pool, params]);
  const segmentCounts = useMemo(() => countBySegmentFor(pool, params), [pool, params]);
  const categoryCounts = useMemo(() => countByCategoryFor(pool, params), [pool, params]);

  const hiddenByLevel = useMemo(
    () => countHiddenByLevel(FORMULA_SUMMARIES, params, mode),
    [params, mode],
  );

  const searching = !isDefaultListParams(params);

  /*
   * Chữ trong vùng aria-live đi CHẬM hơn danh sách một nhịp.
   * Danh sách phải đổi tức thì theo từng phím — đó là cảm giác "đang lọc". Nhưng vùng live mà
   * đổi theo từng phím thì trình đọc màn hình bị ngắt lời liên tục và người dùng không nghe
   * trọn được câu nào.
   */
  const [liveText, setLiveText] = useState('');
  useEffect(() => {
    if (!searching) {
      setLiveText('');
      return;
    }
    const timer = setTimeout(() => {
      setLiveText(`${String(results.length)} ${t('list.count')}`);
    }, LIVE_DELAY);
    return () => {
      clearTimeout(timer);
    };
  }, [searching, results.length, t]);

  /** Về trạng thái nhàn, và trả tiêu điểm về ô tìm vì nút vừa bấm đã tự tháo khỏi DOM. */
  function reset(): void {
    setParams(DEFAULT_LIST_PARAMS);
    inputRef.current?.focus();
  }

  const shown = results.slice(0, PREVIEW_LIMIT);
  const hidden = results.length - shown.length;

  /*
   * Bỏ lọc thì còn kết quả không? Hỏi bằng chính `selectFormulas` với duy nhất từ khoá, để câu
   * trả lời không bao giờ lệch với danh sách thật.
   */
  const filtered = params.segment !== 'all' || params.categoryId !== null;
  const withoutFilter = useMemo(
    () => (filtered ? selectFormulas(pool, { ...DEFAULT_LIST_PARAMS, q: params.q }).length : 0),
    [filtered, pool, params.q],
  );

  return (
    <div className={styles.panel}>
      <SearchBox
        inputRef={inputRef}
        value={params.q}
        onChange={(q) => {
          setParams((current) => ({ ...current, q }));
        }}
        /*
         * Tắt hẳn dòng nhắc: bật/tắt nó nghĩa là bật/tắt `aria-describedby` NGAY TRÊN ô đang có
         * tiêu điểm, khiến trình đọc màn hình đọc lại nhãn giữa lúc gõ, và làm nhảy bố cục.
         * Câu "gõ không dấu vẫn ra đúng" chuyển xuống khối rỗng, chỗ nó thật sự cần thiết.
         */
        showHint={false}
        onCancel={reset}
      />

      {/*
        Vùng thông báo dựng NGAY TỪ LẦN RENDER ĐẦU và không bao giờ tháo, chỉ đổi chữ bên trong.
        Sinh nó ra cùng lúc với nội dung thì trình đọc màn hình coi cả vùng là mới và bỏ qua —
        đúng lần đọc quan trọng nhất.
      */}
      <p className={styles.live} aria-live="polite">
        {liveText}
      </p>

      {!searching ? (
        children
      ) : (
        <div className={styles.results}>
          <CategoryFilter
            params={params}
            onChange={(patch) => {
              setParams((current) => ({ ...current, ...patch }));
            }}
            onReset={reset}
            segmentCounts={segmentCounts}
            categoryCounts={categoryCounts}
            showReset
          />

          {/* Vào chế độ tìm là cả vùng dưới đổi nội dung — phải có mốc tiêu đề để định vị. */}
          <h2 className="visually-hidden">{t('home.search.resultsHeading')}</h2>

          <HiddenByLevelNote count={hiddenByLevel} />

          {results.length > 0 ? (
            <>
              <ul className={styles.list}>
                {shown.map((formula) => (
                  <li key={formula.id}>
                    <FormulaCard formula={formula} />
                  </li>
                ))}
              </ul>

              {/* Đường dẫn dựng bằng hàm dùng chung, không ghép chuỗi tay (lỗi thật đợt 7). */}
              <Link className={styles.seeAll} href={formulaListPath(params)}>
                {t('home.search.seeAll')} {results.length} {t('home.search.results')}
                {hidden > 0 && <span className={styles.more}> +{hidden}</span>}
              </Link>
            </>
          ) : (
            <EmptyState
              title={t('list.empty.noMatch.title')}
              lines={[
                t('list.empty.noMatch.scope'),
                t('list.empty.noMatch.hint'),
                t('search.hint'),
              ]}
              action={
                <div className={styles.actions}>
                  {/*
                    Bộ lọc đang che mất kết quả thì nói thẳng còn bao nhiêu nếu bỏ lọc, thay vì
                    để người dùng cụt đường ở một màn rỗng.
                  */}
                  {filtered && withoutFilter > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setParams((current) => ({
                          ...current,
                          segment: 'all',
                          categoryId: null,
                        }));
                        inputRef.current?.focus();
                      }}
                    >
                      {t('home.search.dropFilter')} · {withoutFilter} {t('home.search.results')}
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" onClick={reset}>
                    {t('filter.reset')}
                  </Button>
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}
