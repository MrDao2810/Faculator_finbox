'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  parseFormulaUsage,
  rankFeaturedIds,
  sameOrder,
} from '@/application';
import { useT } from '@/application/preferences-context';
import { FormulaCard } from '@/ui/browse';

import styles from './FeaturedFormulas.module.css';

export interface PinnedTile {
  /** Id công thức — khoá của `<li>`, và cũng là thứ đối chiếu với lịch sử. */
  id: string;
  /** Thẻ do SERVER dựng sẵn. Xem docblock: đây là thứ giữ HTML tĩnh nguyên vẹn. */
  card: ReactNode;
}

export interface FeaturedFormulasProps {
  pinned: ReadonlyArray<PinnedTile>;
}

/** Tra id có thật không. Trang chủ vốn đã có chỉ mục này trong gói nên không tốn thêm gì. */
const KNOWN_IDS = new Set(FORMULA_SUMMARIES.map((formula) => formula.id));

/**
 * Khối "Công thức dùng hằng ngày" — FR-20, nay có cá nhân hoá.
 *
 * Trước gói này khối là kệ ghim tay thuần: 18 công thức gắn cờ `isFeatured` lúc build, ai vào
 * cũng thấy y hệt nhau, và tên khối hứa một cơ chế mà mã không hề có. Nay công thức người dùng
 * hay mở được đưa lên đầu — nhiều nhất `PERSONAL_SLOTS` ô, nên khối luôn còn ít nhất 12 ghim
 * tay để còn giới thiệu được thứ người dùng chưa biết.
 *
 * ── Vì sao thẻ ghim đi qua prop `card` chứ không dựng tại đây ──────────────────────────────
 *
 * `out/index.html` phải giữ đủ 18 link công thức: trang chủ là URL priority 1.0 của sitemap, và
 * `verify-static.mjs` gác cả `id="home-featured"` lẫn số link. Nếu component này tự dựng cả 18
 * ô thì mọi ô đều phụ thuộc đường tra cứu phía máy khách; hỏng một chỗ là mất sạch phần nhìn
 * thấy. Nhận node do server dựng thì 18 ô ghim KHÔNG đi qua mã mới một dòng nào — đường render
 * ở đây chỉ chạy cho tối đa 6 ô chèn thêm, và nếu tra không ra id thì mục chèn bị bỏ, khối suy
 * biến về đúng hành vi cũ chứ không về khối rỗng.
 *
 * ── Vì sao KHÔNG chờ cờ `hydrated`, và vì sao tiêu đề không đổi ────────────────────────────
 *
 * State khởi tạo là hằng số `null` nên lượt render đầu ở máy khách dựng đúng cây server đã dựng
 * — luật chung của repo, xem docblock `HomeSearchPanel`. Sau effect, thứ tự đổi NGAY thay vì
 * chờ một cờ: khối này chứa ứng viên LCP của trang chủ, làm nó trống một nhịp là hồi quy đo
 * được, đổi lấy việc tránh một cú đổi vị trí chưa tới một khung hình. Người chưa có lịch sử —
 * khách mới, mọi bộ máy tìm kiếm, `check:chrome` chạy profile sạch — không thấy một lượt dựng
 * lại nào, vì nhánh `sameOrder` chặn hẳn `setState`.
 *
 * Tiêu đề giữ nguyên ở `page.tsx` phía server, không có bản "cá nhân hoá" riêng: nó là tên khả
 * truy cập của `<section>` qua `aria-labelledby`, đổi chữ sau hydrate là đổi tên một landmark
 * ngay dưới chân người dùng. Câu chữ vốn đã đúng — cá nhân hoá chỉ làm nó đúng hơn.
 */
export function FeaturedFormulas({ pinned }: FeaturedFormulasProps) {
  const t = useT();

  // Hằng số: lượt render đầu ở máy khách PHẢI giống hệt HTML dựng lúc build.
  const [order, setOrder] = useState<ReadonlyArray<string> | null>(null);

  const pinnedIds = useMemo(() => pinned.map((tile) => tile.id), [pinned]);
  const cards = useMemo(() => new Map(pinned.map((tile) => [tile.id, tile.card])), [pinned]);

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(FORMULA_USAGE_KEY);
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư) — khối giữ nguyên 18 ghim.
      return;
    }

    const usage = parseFormulaUsage(raw);
    if (usage.length === 0) return;

    const ranked = rankFeaturedIds({ pinnedIds, usage, knownIds: KNOWN_IDS, now: Date.now() });
    if (sameOrder(ranked, pinnedIds)) return;

    setOrder((current) => (current !== null && sameOrder(ranked, current) ? current : ranked));
  }, [pinnedIds]);

  const ids = order ?? pinnedIds;

  return (
    <>
      <ul className={styles.cards}>
        {ids.map((id) => {
          // Ghim thì lấy đúng node server đã dựng; chèn thêm thì dựng tại đây.
          const card = cards.get(id) ?? tileFor(id);
          // Ô trống còn tệ hơn thiếu ô — id không tra được thì bỏ hẳn `<li>`.
          if (card === null) return null;
          // Khoá ổn định để React DI CHUYỂN node thay vì tháo/lắp — không có nháy trắng.
          return <li key={id}>{card}</li>;
        })}
      </ul>

      {order !== null && <p className={styles.personalNote}>{t('home.featured.personalNote')}</p>}
    </>
  );
}

/**
 * Thẻ cho một công thức KHÔNG nằm trong danh sách ghim.
 *
 * `rankFeaturedIds` đã lọc theo `KNOWN_IDS` nên nhánh `null` không nên chạy được; giữ nó để
 * một id lạ lọt qua cũng chỉ mất một ô chứ không ném lỗi giữa lúc dựng trang chủ.
 */
function tileFor(id: string): ReactNode | null {
  const formula = FORMULA_SUMMARIES.find((summary) => summary.id === id);
  if (formula === undefined) return null;
  return <FormulaCard formula={formula} variant="tile" />;
}
