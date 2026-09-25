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
 */
function viewportBounds(): Bounds {
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

  return { top, left: EDGE, right: window.innerWidth - EDGE, bottom };
}

/** Khối của điểm chạm; cụm chữ xuống dòng thì lấy đúng DÒNG đang có con trỏ. */
function anchorBox(anchor: Element, point: { x: number; y: number } | null) {
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
      const place = placePanel(
        anchorBox(anchor, pointRef.current),
        { width: panel.offsetWidth, height: panel.scrollHeight },
        viewportBounds(),
      );
      setPlacement({
        top: place.top - cardRect.top,
        left: place.left - cardRect.left,
        maxHeight: place.maxHeight,
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
  }, [state, cardRef, panelRef, anchorRef, pointRef, scrollerOf]);

  return placement;
}
