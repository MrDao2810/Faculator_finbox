'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { FocusEvent, MouseEvent, PointerEvent } from 'react';

/**
 * Trạng thái khung "cách tính" của thẻ Công thức (17/09/2026).
 *
 * `via` tách hai cách mở vì chúng đóng khác nhau: mở bằng RÊ CHUỘT thì rời chuột là tắt; mở bằng
 * BẤM/CHẠM (hay Enter trên nút) thì khung được GHIM, chỉ đóng khi bấm lại đúng điểm chạm ấy, chạm
 * ra ngoài, bấm Esc hay rời focus khỏi thẻ.
 */
export interface HowToPanelState {
  sym: number;
  via: 'hover' | 'pin';
}

/** Rê qua một ký hiệu không mở khung ngay — lướt chuột ngang qua hình không được làm khung nhấp nháy. */
const OPEN_DELAY_MS = 100;
/**
 * Rời chuột thì chờ một nhịp mới tắt: người dùng phải kịp đưa chuột từ ký hiệu vào KHUNG để bấm
 * liên kết "Xem công thức" (WCAG 1.4.13 — nội dung hiện khi trỏ vào phải trỏ vào được).
 */
const CLOSE_DELAY_MS = 200;

interface Hotspot {
  element: Element;
  sym: number;
}

/**
 * Điều khiển khung cách tính. Mọi sự kiện gắn ở GỐC thẻ và tìm điểm chạm bằng
 * `closest('[data-sym]')`: điểm chạm trong hình là phần tử MathML dựng sẵn lúc build, React không
 * gắn được sự kiện lên từng cái.
 *
 * @param hasHowTo — dòng bảng ký hiệu nào có khung; phần tử có `data-sym` mà không có khung thì bỏ qua.
 * @param resetKey — đổi giá trị thì khung đóng (đổi ngôn ngữ: chữ trong khung đã khác).
 */
export function useHowToPanel(hasHowTo: (sym: number) => boolean, resetKey: unknown) {
  const [state, setState] = useState<HowToPanelState | null>(null);
  const stateRef = useRef<HowToPanelState | null>(null);
  stateRef.current = state;

  const cardRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  /** Phần tử đang được trỏ/chạm — khung đặt theo nó. */
  const anchorRef = useRef<Element | null>(null);
  /** Toạ độ con trỏ lúc mở — chọn đúng dòng của một cụm chữ bị xuống dòng. */
  const pointRef = useRef<{ x: number; y: number } | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimers = useCallback(() => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  }, []);

  const inPanel = useCallback(
    (target: EventTarget | null) =>
      target instanceof Node && panelRef.current !== null && panelRef.current.contains(target),
    [],
  );

  const hotspotOf = useCallback(
    (target: EventTarget | null): Hotspot | null => {
      if (!(target instanceof Element) || inPanel(target)) return null;
      const element = target.closest('[data-sym]');
      if (element === null || cardRef.current === null || !cardRef.current.contains(element)) {
        return null;
      }
      const sym = Number(element.getAttribute('data-sym'));
      return Number.isInteger(sym) && hasHowTo(sym) ? { element, sym } : null;
    },
    [hasHowTo, inPanel],
  );

  const close = useCallback(() => {
    clearTimers();
    setState(null);
  }, [clearTimers]);

  const onPointerOver = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse') return;
      if (inPanel(event.target)) {
        clearTimeout(closeTimer.current);
        return;
      }
      const hot = hotspotOf(event.target);
      if (hot === null) return;

      clearTimeout(closeTimer.current);
      const current = stateRef.current;
      if (current?.via === 'pin') return;

      const open = () => {
        anchorRef.current = hot.element;
        pointRef.current = { x: event.clientX, y: event.clientY };
        setState({ sym: hot.sym, via: 'hover' });
      };
      if (current?.via === 'hover') {
        // Đang mở một khung bằng rê chuột: chuyển sang ký hiệu mới ngay, không chờ.
        if (current.sym !== hot.sym) open();
        return;
      }
      clearTimeout(openTimer.current);
      openTimer.current = setTimeout(open, OPEN_DELAY_MS);
    },
    [hotspotOf, inPanel],
  );

  const onPointerOut = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (event.pointerType !== 'mouse') return;
      const next = event.relatedTarget;
      // Đi vào khung, hay đi giữa hai phần của cùng một ký hiệu: không tính là rời.
      if (inPanel(next)) return;
      const nextHot = hotspotOf(next);
      const current = stateRef.current;
      if (nextHot !== null && current !== null && nextHot.sym === current.sym) return;

      clearTimeout(openTimer.current);
      if (current?.via !== 'hover') return;
      clearTimeout(closeTimer.current);
      closeTimer.current = setTimeout(() => {
        setState((s) => (s?.via === 'hover' ? null : s));
      }, CLOSE_DELAY_MS);
    },
    [hotspotOf, inPanel],
  );

  const onClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      if (inPanel(event.target)) return;
      const hot = hotspotOf(event.target);
      if (hot === null) return;

      clearTimers();
      const current = stateRef.current;
      if (current?.sym === hot.sym && current.via === 'pin') {
        setState(null);
        return;
      }
      anchorRef.current = hot.element;
      // Enter/Space trên nút cũng ra `click`, với toạ độ 0 — lúc ấy đặt theo cả khối của nút.
      pointRef.current =
        event.clientX === 0 && event.clientY === 0 ? null : { x: event.clientX, y: event.clientY };
      setState({ sym: hot.sym, via: 'pin' });
    },
    [clearTimers, hotspotOf, inPanel],
  );

  /** Focus rời hẳn khỏi thẻ thì khung đang ghim đóng — người dùng bàn phím đã đi tiếp. */
  const onBlur = useCallback(
    (event: FocusEvent<HTMLElement>) => {
      if (stateRef.current?.via !== 'pin') return;
      const next = event.relatedTarget;
      if (next instanceof Node && cardRef.current?.contains(next) === true) return;
      if (next === null) return; // bấm vào chỗ không nhận focus: `pointerdown` bên dưới lo
      close();
    },
    [close],
  );

  // Chạm ra ngoài và Esc — nghe ở cả tài liệu, vì focus không nhất thiết đang ở trong thẻ.
  useEffect(() => {
    if (state === null) return undefined;

    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (inPanel(event.target) || hotspotOf(event.target) !== null) return;
      if (stateRef.current?.via === 'pin') close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const sym = stateRef.current?.sym;
      const focusInCard = cardRef.current?.contains(document.activeElement) === true;
      close();
      if (focusInCard && sym !== undefined) {
        cardRef.current
          ?.querySelector<HTMLButtonElement>(`button[data-sym="${String(sym)}"]`)
          ?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [state, close, hotspotOf, inPanel]);

  // Đổi ngôn ngữ thì khung đóng. Lượt chạy đầu (lúc mount) không có khung nào nên không đổi gì.
  useEffect(() => {
    setState(null);
  }, [resetKey]);

  useEffect(() => clearTimers, [clearTimers]);

  return {
    state,
    cardRef,
    panelRef,
    anchorRef,
    pointRef,
    close,
    handlers: { onPointerOver, onPointerOut, onClick, onBlur },
  };
}
