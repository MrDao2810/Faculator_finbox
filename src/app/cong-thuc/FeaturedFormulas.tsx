'use client';

import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import {
  DAILY_SHELF_OPEN_KEY,
  DAILY_SHELF_PREVIEW,
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
  /** Tiêu đề kệ do server dựng — đứng cùng hàng với nút "Xem tất cả". */
  heading: ReactNode;
  pinned: ReadonlyArray<PinnedTile>;
}

/** `id` của lưới ô — đích `aria-controls` của nút "Xem tất cả". Màn chỉ có một kệ. */
export const SHELF_GRID_ID = 'cong-thuc-hang-ngay-luoi';

/** Tra id có thật không. Màn Công thức vốn đã có chỉ mục này trong gói nên không tốn thêm gì. */
const KNOWN_IDS = new Set(FORMULA_SUMMARIES.map((formula) => formula.id));

/**
 * Hàng tiêu đề và lưới ô của khối "Công thức dùng hằng ngày" — FR-20, có cá nhân hoá.
 *
 * Dời từ trang chủ về màn Công thức ngày 15/09/2026. Kệ có 16 ô (`DAILY_SHELF_IDS`) nhưng lúc đầu
 * chỉ bày `DAILY_SHELF_PREVIEW` ô; nút "Xem tất cả" cuối hàng tiêu đề bày nốt phần còn lại, bấm lần
 * nữa ("Thu gọn") thì thu về. Công thức người dùng hay mở được đưa lên đầu — nhiều nhất
 * `PERSONAL_SLOTS` ô, nên phần bày trước luôn còn ghim tay để giới thiệu được thứ người dùng chưa biết.
 *
 * ── Vì sao ô ẩn vẫn nằm trong HTML ─────────────────────────────────────────────────────────
 *
 * Tám ô sau mang thuộc tính `hidden`, không bị bỏ khỏi cây: bấm "Xem tất cả" chỉ gỡ thuộc tính, không
 * phải dựng thẻ ở máy khách, và thẻ server dựng giữ nguyên. `hidden` cũng rút các ô ấy khỏi thứ tự Tab
 * và cây trợ năng, nên người dùng bàn phím không phải đi qua tám link mình không nhìn thấy. Cắt theo
 * VỊ TRÍ sau khi sắp lại, nên ô cá nhân hoá luôn nằm trong phần nhìn thấy.
 *
 * Nút là `<button aria-expanded>` chứ không phải link: nó mở rộng một vùng tại chỗ, không đưa người
 * dùng đi đâu. Trước khi hydrate bấm nút chưa làm gì — tám ô đầu vẫn đủ dùng, và danh sách đầy đủ
 * ngay bên dưới đã có sẵn trong HTML.
 *
 * Trạng thái mở được nhớ trong tab (`DAILY_SHELF_OPEN_KEY`) và áp lại trong `useLayoutEffect`, không
 * `useEffect`: lượt dựng lại do nó gây ra phải xong TRƯỚC effect của `OriginTracker`, nơi hẹn cú cuộn
 * khôi phục của nút quay lại. Áp muộn hơn thì trình duyệt cuộn theo chiều cao kệ thu gọn rồi kệ mới
 * mở ra, đẩy thẻ vừa xem xuống khỏi chỗ cũ.
 *
 * ── Vì sao thẻ ghim đi qua prop `card` chứ không dựng tại đây ──────────────────────────────
 *
 * `out/cong-thuc/index.html` phải giữ đủ link công thức của kệ: đây là URL mở đầu của sản phẩm, và
 * `verify-static.mjs` gác cả khối lẫn số link. Nếu component này tự dựng mọi ô thì mọi ô đều phụ
 * thuộc đường tra cứu phía máy khách; hỏng một chỗ là mất sạch phần nhìn thấy. Nhận node do server
 * dựng thì các ô ghim KHÔNG đi qua mã mới một dòng nào — đường render ở đây chỉ chạy cho những ô
 * chèn thêm, và nếu tra không ra id thì mục chèn bị bỏ, khối suy biến về đúng hành vi cũ chứ không
 * về khối rỗng.
 *
 * ── Vì sao KHÔNG chờ cờ `hydrated` ─────────────────────────────────────────────────────────
 *
 * State khởi tạo là hằng số (`null`, `false`) nên lượt render đầu ở máy khách dựng đúng cây server đã
 * dựng. Sau effect, thứ tự đổi NGAY thay vì chờ một cờ: khối này chứa ứng viên LCP của màn mở đầu,
 * làm nó trống một nhịp là hồi quy đo được, đổi lấy việc tránh một cú đổi vị trí chưa tới một khung
 * hình. Người chưa có lịch sử — khách mới, mọi bộ máy tìm kiếm, `check:chrome` chạy profile sạch —
 * không thấy một lượt dựng lại nào, vì nhánh `sameOrder` chặn hẳn `setState`.
 *
 * Tiêu đề do `DailyShelf` phía server dựng rồi truyền vào qua `heading`, không có bản "cá nhân hoá"
 * riêng: nó là tên khả truy cập của `<section>` qua `aria-labelledby`, đổi chữ sau hydrate là đổi tên
 * một landmark ngay dưới chân người dùng.
 */
export function FeaturedFormulas({ heading, pinned }: FeaturedFormulasProps) {
  const t = useT();

  // Hằng số: lượt render đầu ở máy khách PHẢI giống hệt HTML dựng lúc build.
  const [order, setOrder] = useState<ReadonlyArray<string> | null>(null);
  const [expanded, setExpanded] = useState(false);

  const pinnedIds = useMemo(() => pinned.map((tile) => tile.id), [pinned]);
  const cards = useMemo(() => new Map(pinned.map((tile) => [tile.id, tile.card])), [pinned]);

  useLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(DAILY_SHELF_OPEN_KEY) === '1') setExpanded(true);
    } catch {
      // Trình duyệt chặn sessionStorage — kệ mở ra thu gọn như lần đầu, không hỏng gì khác.
    }
  }, []);

  function toggle(): void {
    const next = !expanded;
    setExpanded(next);
    try {
      if (next) window.sessionStorage.setItem(DAILY_SHELF_OPEN_KEY, '1');
      else window.sessionStorage.removeItem(DAILY_SHELF_OPEN_KEY);
    } catch {
      // Không ghi được thì chỉ mất phần nhớ qua lượt quay lại; nút vẫn mở/thu bình thường.
    }
  }

  useEffect(() => {
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(FORMULA_USAGE_KEY);
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư) — khối giữ nguyên thứ tự ghim.
      return;
    }

    const usage = parseFormulaUsage(raw);
    if (usage.length === 0) return;

    const ranked = rankFeaturedIds({ pinnedIds, usage, knownIds: KNOWN_IDS, now: Date.now() });
    if (sameOrder(ranked, pinnedIds)) return;

    setOrder((current) => (current !== null && sameOrder(ranked, current) ? current : ranked));
  }, [pinnedIds]);

  // Bỏ ô không tra được TRƯỚC khi cắt, để phần bày trước luôn đủ số ô chứ không hụt một chỗ trống.
  const tiles = (order ?? pinnedIds).flatMap((id) => {
    // Ghim thì lấy đúng node server đã dựng; chèn thêm thì dựng tại đây.
    const card = cards.get(id) ?? tileFor(id);
    // Ô trống còn tệ hơn thiếu ô — id không tra được thì bỏ hẳn `<li>`.
    return card === null ? [] : [{ id, card }];
  });
  const canExpand = tiles.length > DAILY_SHELF_PREVIEW;

  return (
    <>
      <div className={styles.head}>
        {heading}
        {canExpand && (
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={expanded}
            aria-controls={SHELF_GRID_ID}
            onClick={toggle}
          >
            {t(expanded ? 'shelf.collapse' : 'shelf.seeAll')}
            <svg
              className={styles.chevron}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      <ul id={SHELF_GRID_ID} className={styles.cards}>
        {tiles.map(({ id, card }, index) => (
          // Khoá ổn định để React DI CHUYỂN node thay vì tháo/lắp — không có nháy trắng.
          <li key={id} hidden={!expanded && index >= DAILY_SHELF_PREVIEW}>
            {card}
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Thẻ cho một công thức KHÔNG nằm trong danh sách ghim.
 *
 * `rankFeaturedIds` đã lọc theo `KNOWN_IDS` nên nhánh `null` không nên chạy được; giữ nó để
 * một id lạ lọt qua cũng chỉ mất một ô chứ không ném lỗi giữa lúc dựng màn.
 */
function tileFor(id: string): ReactNode | null {
  const formula = FORMULA_SUMMARIES.find((summary) => summary.id === id);
  if (formula === undefined) return null;
  return <FormulaCard formula={formula} variant="tile" />;
}
