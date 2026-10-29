'use client';

import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

import type { HowToPanelState } from './use-how-to-panel';
import { placePanel } from './place-panel';
import type { Bounds } from './place-panel';

/** Lề giữa khung và mép màn / mép hai thanh dính. */
const EDGE = 8;

/**
 * Vùng đặt được khung: khung nhìn trừ header dính ở trên và thanh tab dính ở dưới. Đo lúc mở khung
 * chứ không nhớ sẵn — ở PC thanh tab không có, và header có thể đã cuộn khỏi màn.
 *
 * ── Mép phải đo bằng `clientWidth`, KHÔNG phải `innerWidth` ─────────────────────────────────
 *
 * `window.innerWidth` tính cả THANH CUỘN DỌC; `document.documentElement.clientWidth` thì không.
 * Trên Chrome Windows thanh ấy rộng 15px, mà `EDGE` chỉ 8px — nên lấy `innerWidth` là cho khung
 * đặt tới 15px quá mép vẽ được, tức nó chui xuống dưới thanh cuộn rồi thò ra ngoài cửa sổ đúng
 * 7px. Đo được trên `roi-rong` ở khổ 1440 ngày 09/10/2026: `innerWidth` 1440, `clientWidth` 1425,
 * mép phải khung 1432. Chủ dự án chụp đúng cảnh ấy.
 *
 * Phép kẹp trong `placePanel` vẫn đúng từ đầu tới cuối — nó kẹp theo `bounds` được đưa cho, và
 * `bounds` mới là thứ nói dối. Nên chỗ sửa là ở đây, và một ca kiểm thuần trên `placePanel` không
 * bao giờ bắt được lỗi này.
 *
 * Chiều DỌC giữ `innerHeight` có chủ ý: cặp tương ứng của nó là thanh cuộn NGANG, mà sản phẩm
 * không bao giờ có thanh ấy (có hẳn phép kiểm Chrome "màn Công thức không tràn ngang"). Đổi sang
 * `clientHeight` thì trên điện thoại lại vướng chuyện thanh địa chỉ co giãn, tức đổi một thứ đang
 * đúng lấy một rủi ro mới.
 */
export function viewportBounds(): Bounds {
  let top = EDGE;
  let bottom = window.innerHeight - EDGE;

  const header = document.querySelector('header');
  if (header !== null) {
    const rect = header.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top <= 1) top = Math.max(top, rect.bottom + EDGE);
  }
  for (const nav of document.querySelectorAll('nav')) {
    const position = getComputedStyle(nav).position;
    if (position !== 'sticky' && position !== 'fixed') continue;
    const rect = nav.getBoundingClientRect();
    if (rect.top > window.innerHeight / 2 && rect.top < window.innerHeight) {
      bottom = Math.min(bottom, rect.top - EDGE);
    }
  }

  return { top, left: EDGE, right: document.documentElement.clientWidth - EDGE, bottom };
}

/**
 * Thu `bounds` vào phần NHÌN THẤY của các khung cắt bao quanh `card`, khi `card` nằm trong một
 * `<dialog>` — popup Bài tập, từ 26/10/2026.
 *
 * Trên trang, khung "cách tính" chỉ cần nằm trong màn. Trong popup thì không đủ: thân popup tự cuộn
 * (`overflow-y: auto`, kéo theo `overflow-x` cũng thành `auto`) và tấm bo góc cắt mọi thứ tràn ra
 * (`overflow: hidden`), nên một khung canh theo mép màn sẽ thò ra ngoài mép thân popup, bị cắt mất
 * phần thò và còn đẻ thêm thanh cuộn ngang cho thân. Kẹp theo từng tổ tiên có `overflow` khác
 * `visible`, lên tới chính `<dialog>`.
 *
 * Chỉ áp trong `<dialog>`: trên trang không có tổ tiên nào cắt khung (khối Bài tập và Ví dụ đã bỏ
 * `deferred` đúng vì lý do ấy), và giữ nguyên đường cũ là không đụng tới thẻ Công thức.
 *
 * Mép đo bằng `clientLeft/clientWidth` chứ không phải `getBoundingClientRect()` trơn — cùng lý do với
 * `viewportBounds()`: hộp viền tính cả thanh cuộn dọc của thân popup.
 */
export function clipToDialog(card: Element, bounds: Bounds): Bounds {
  if (card.closest('dialog') === null) return bounds;

  let { top, left, right, bottom } = bounds;
  for (let el = card.parentElement; el !== null; el = el.parentElement) {
    const style = getComputedStyle(el);
    if (style.overflowX !== 'visible' || style.overflowY !== 'visible') {
      const rect = el.getBoundingClientRect();
      const innerLeft = rect.left + el.clientLeft;
      const innerTop = rect.top + el.clientTop;
      top = Math.max(top, innerTop + EDGE);
      left = Math.max(left, innerLeft + EDGE);
      right = Math.min(right, innerLeft + el.clientWidth - EDGE);
      bottom = Math.min(bottom, innerTop + el.clientHeight - EDGE);
    }
    if (el.tagName === 'DIALOG') break;
  }
  return { top, left, right, bottom };
}

/** Khối của điểm chạm; cụm chữ xuống dòng thì lấy đúng DÒNG đang có con trỏ. */
export function anchorBox(anchor: Element, point: { x: number; y: number } | null) {
  const rects = [...anchor.getClientRects()];
  const hit =
    point === null
      ? undefined
      : rects.find(
          (r) => point.y >= r.top && point.y <= r.bottom && point.x >= r.left && point.x <= r.right,
        );
  const rect = hit ?? anchor.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

export interface PanelPlacement {
  top: number;
  left: number;
  maxHeight: number | null;
  /**
   * Trần bề ngang, chỉ có khi khung rộng hơn chỗ được phép — trong popup ở khổ điện thoại, nơi thân
   * popup hẹp hơn 22rem của khung (xem `clipToDialog`).
   */
  maxWidth?: number;
}

/**
 * Chỗ đặt khung "cách tính", tính theo toạ độ trong khối gốc (`cardRef`, `position: relative`).
 *
 * Tách khỏi `FormulaNotationCard` ngày 25/09/2026, khi hình công thức trong khối lời giải của Bài
 * tập cũng mở đúng khung ấy: hai bản chép của phép đặt này sẽ lệch nhau ở lần sửa đầu tiên.
 *
 * Đặt khung SAU khi nó có mặt trong DOM mà TRƯỚC khi trình duyệt vẽ: lượt đầu khung ẩn
 * (`visibility: hidden`) để đo kích thước, lượt sau mới hiện đúng chỗ — không có cú nhảy nào lọt
 * ra mắt người dùng.
 *
 * @param scrollerOf — khung cuộn ngang chứa hình, nếu có: hình dài cuộn thì điểm chạm trôi theo.
 *   Truyền một hàm ở cấp MODULE, không phải hàm dựng trong thân component: nó nằm trong danh sách
 *   phụ thuộc, nên hàm mới ở mỗi lượt render sẽ gỡ rồi gắn lại hai bộ nghe sau mỗi lần gõ.
 * @param coDinh — trả toạ độ KHUNG NHÌN, cho khung `position: fixed` (`HowToPanel coDinh`): khung
 *   chú thích mở trong khung "Lấy số liệu ở đâu", vốn tự cuộn và cắt mọi khung `absolute` bên trong.
 */
export function usePanelPlacement(
  state: HowToPanelState | null,
  refs: {
    cardRef: RefObject<HTMLDivElement | null>;
    panelRef: RefObject<HTMLDivElement | null>;
    anchorRef: RefObject<Element | null>;
    pointRef: RefObject<{ x: number; y: number } | null>;
  },
  scrollerOf: (card: HTMLDivElement) => Element | null,
  coDinh = false,
): PanelPlacement | null {
  const { cardRef, panelRef, anchorRef, pointRef } = refs;
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);

  useLayoutEffect(() => {
    if (state === null) {
      setPlacement(null);
      return undefined;
    }

    const update = () => {
      const card = cardRef.current;
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      if (card === null || panel === null || anchor === null || !anchor.isConnected) return;

      const cardRect = card.getBoundingClientRect();
      const bounds = clipToDialog(card, viewportBounds());
      /*
       * Khung rộng hơn chỗ được phép thì chặn bề ngang TRƯỚC khi đo chiều cao: chữ xuống dòng thêm
       * thì khung cao lên, và phép đặt trên/dưới phải tính theo chiều cao ấy. Gán thẳng vào DOM ở
       * đây, rồi `HowToPanel` gán lại đúng số ấy qua `style` ở lượt dựng sau.
       */
      const room = Math.floor(bounds.right - bounds.left);
      const maxWidth = room > 0 && panel.offsetWidth > room ? room : undefined;
      if (maxWidth !== undefined) panel.style.maxWidth = `${String(maxWidth)}px`;
      const place = placePanel(
        anchorBox(anchor, pointRef.current),
        { width: panel.offsetWidth, height: panel.scrollHeight },
        bounds,
      );
      setPlacement({
        top: coDinh ? place.top : place.top - cardRect.top,
        left: coDinh ? place.left : place.left - cardRect.left,
        maxHeight: place.maxHeight,
        ...(maxWidth === undefined ? {} : { maxWidth }),
      });
    };

    update();
    const scroller = cardRef.current === null ? null : scrollerOf(cardRef.current);
    window.addEventListener('resize', update);
    scroller?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      scroller?.removeEventListener('scroll', update);
    };
  }, [state, cardRef, panelRef, anchorRef, pointRef, scrollerOf, coDinh]);

  return placement;
}
