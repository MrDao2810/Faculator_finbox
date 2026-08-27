'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  DEFAULT_LIST_PARAMS,
  FORMULA_SUMMARIES,
  formulaListPath,
  formulasForLevel,
  isDefaultListParams,
  selectFormulas,
} from '@/application';
import type { ListParams } from '@/application';
import { usePreferences, useT } from '@/application/preferences-context';
import { EmptyState, FormulaCard, SearchBox } from '@/ui/browse';

import styles from './HomeSearchPanel.module.css';

export interface HomeSearchPanelProps {
  /**
   * Nội dung trang chủ lúc chưa tìm gì: khối "Công thức dùng hằng ngày", hai lưới "Duyệt theo
   * nhóm", dòng tiến độ. Nhận qua `children` chứ không import vào đây — xem docblock dưới.
   */
  children: ReactNode;
}

/**
 * Phạm vi của ô tìm ở trang chủ: đúng 18 ô ghim tay của khối "Công thức dùng hằng ngày" (FR-20).
 *
 * ── Vì sao chỉ 18 chứ không phải cả 111 ───────────────────────────────────────────────────
 *
 * Bản trước tìm trong cả thư viện, và hệ quả là gõ một ký tự thì TOÀN BỘ trang chủ biến mất,
 * thay bằng bộ chip lọc + "Nhóm công thức" + "Sắp xếp" + "Xoá bộ lọc" — tức đúng giao diện tab
 * Công thức, trong khi thanh dưới vẫn sáng mục "Trang chủ". Một màn mang nội dung của màn khác
 * dưới cái tab của màn này, và không có chữ nào giải thích. Chủ dự án báo đúng chỗ đó.
 *
 * Nay ô tìm làm đúng vai mà `SearchLink.tsx` vẫn ghi cho nó: **lọc danh sách đang xem**. Danh
 * sách đang xem ở trang chủ là kệ 18 ô, nên tìm trong 18 ô.
 *
 * ── Giá phải trả, đã đo và đã chấp nhận ───────────────────────────────────────────────────
 *
 * Đếm trên Registry thật với 11 từ khoá thường gặp: 5 từ ra RỖNG trong 18 ô dù thư viện có —
 * `sma` (0/5), `bollinger` (0/4), `macd` (0/2), `beta` (0/3), `roe` (0/1). Vì vậy hàng bàn giao
 * sang `/cong-thuc/` KHÔNG còn là tuỳ chọn cuối trang mà luôn hiện khi đang tìm, kèm sẵn số kết
 * quả của cả thư viện — người dùng biết trước bấm sang có gì, chứ không phải đoán.
 *
 * KHÔNG lọc theo cấp độ Cơ bản/Nâng cao: kệ 18 ô cũng không lọc — `page.tsx` dựng nó thẳng từ cờ
 * `isFeatured` chứ không đi qua `formulasForLevel()`, vì FR-20 là kệ ghim tay chứ không phải danh
 * sách duyệt. Lọc một bên mà không lọc bên kia thì con số "n / 18" nói dối.
 */
const FEATURED_POOL = FORMULA_SUMMARIES.filter((formula) => formula.isFeatured);

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
 * `history.state` mỗi lần điều hướng nội bộ, nên cờ bị xoá lặng lẽ. Hai lối thoát thay thế đều
 * trong tầm ngón cái và đều trả tiêu điểm về ô tìm: nút × của ô và phím Esc. (Nút "Xoá bộ lọc"
 * từng là lối thứ ba, nay không còn: trang chủ đã bỏ hẳn bộ lọc duyệt — xem `FEATURED_POOL`.)
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
   * Kết quả CHÍNH — lọc đúng kệ đang bày trên màn, không lọc theo cấp độ. Xem `FEATURED_POOL`.
   *
   * Không ảnh hưởng HTML tĩnh: lúc chưa gõ gì thì cả nhánh này không dựng, trang chủ hiện
   * `children` do server dựng.
   */
  const results = useMemo(() => selectFormulas(FEATURED_POOL, params), [params]);

  const searching = !isDefaultListParams(params);

  /*
   * Cả thư viện khớp bao nhiêu — con số đứng trong hàng bàn giao sang `/cong-thuc/`.
   *
   * Ở ĐÂY thì lọc theo cấp độ, khác với `results` ngay trên, và cố ý khác: con số này hứa trước
   * thứ người dùng sẽ thấy sau khi bấm, mà màn `/cong-thuc/` có lọc theo cấp độ. Hứa 5 rồi sang
   * đó thấy 3 là đúng kiểu sai mà FR-06 tồn tại để chặn, chỉ khác là ở tầng điều hướng.
   */
  const toanThuVien = useMemo(
    () =>
      searching ? selectFormulas(formulasForLevel(FORMULA_SUMMARIES, mode), params).length : 0,
    [searching, params, mode],
  );

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
          {/*
            Khối kết quả mang ĐÚNG tiêu đề và đúng hình lưới của kệ mà nó đang lọc. Đây là cả
            điểm mấu chốt của đợt sửa: gõ vào ô tìm thì khối "Công thức dùng hằng ngày" thu hẹp
            lại tại chỗ, chứ không bị thay bằng một màn khác. Người dùng vẫn biết mình đang ở đâu.

            Tiêu đề HIỆN RA cho mắt thấy, không còn `visually-hidden` như bản trước: câu duy nhất
            giải thích "vừa xảy ra chuyện gì" mà chỉ trình đọc màn hình nghe được thì người nhìn
            bằng mắt không có lời giải thích nào — đúng chỗ chủ dự án báo là khó hiểu.
          */}
          <section className={styles.resultsBlock} aria-labelledby="home-search-results">
            <h2 className={styles.resultsTitle} id="home-search-results">
              {t('home.featured.title')}
            </h2>

            {/* "3 / 18 công thức" — nói ra phạm vi, để không ai tưởng đây là cả thư viện. */}
            <p className={styles.scope}>
              {results.length} / {FEATURED_POOL.length} {t('list.count')}
            </p>

            {results.length > 0 ? (
              <ul className={styles.cards}>
                {results.map((formula) => (
                  <li key={formula.id}>
                    <FormulaCard formula={formula} variant="tile" />
                  </li>
                ))}
              </ul>
            ) : (
              /*
                Rỗng ở đây là chuyện THƯỜNG, không phải hỏng: 5 trong 11 từ khoá thường gặp không
                có mặt trong 18 ô ghim. Nên câu chữ không nói "không tìm thấy" — nó nói phạm vi
                đang hẹp, và hàng bàn giao ngay dưới mới là lối đi tiếp.
              */
              <EmptyState
                title={t('home.search.featuredEmpty')}
                lines={[t('home.search.featuredScope'), t('search.hint')]}
              />
            )}
          </section>

          {/*
            Hàng bàn giao sang cả thư viện — LUÔN hiện khi đang tìm, không chỉ lúc rỗng.
            Kèm sẵn số kết quả để người dùng biết trước bấm sang có gì, thay vì bấm để dò.
            Đường dẫn dựng bằng hàm dùng chung, không ghép chuỗi tay (lỗi thật đợt 7).
          */}
          <div className={styles.handoff}>
            <p className={styles.notFound}>{t('home.search.notFound')}</p>
            <Link className={styles.seeAll} href={formulaListPath(params)}>
              {t('home.search.searchWhole')}
              <span className={styles.more}>
                {toanThuVien} {t('home.search.results')}
              </span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
