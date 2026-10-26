// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import { clipToDialog, viewportBounds } from './use-panel-placement';

/**
 * `viewportBounds()` — vùng được phép đặt khung nổi, và là chỗ lỗi tràn mép phải từng nằm.
 *
 * Chủ dự án chụp khung "?" của `roi-rong` thò ra ngoài cửa sổ ngày 09/10/2026. Đo ở 1440px:
 * `window.innerWidth` 1440, `document.documentElement.clientWidth` 1425 (thanh cuộn dọc 15px),
 * mép phải khung 1432 — quá mép vẽ được 7px, đúng bằng 15 trừ lề 8.
 *
 * `placePanel()` KHÔNG sai: nó kẹp đúng theo `bounds` được đưa cho, nên mọi ca kiểm thuần của nó
 * vẫn xanh suốt thời gian lỗi sống. Thứ nói dối là `bounds`. Đó là lý do ca kiểm phải nằm ở đây
 * chứ không thêm vào `place-panel.test.ts`.
 *
 * jsdom không bố cục, nên `clientWidth` mặc định là 0 — phải vá thủ công. Đổi lại được một cửa
 * gác CHẠY TRONG CI, thứ mà phép đo Chrome (`check:chrome`, không nằm trong CI) không cho.
 */

const goc = Object.getOwnPropertyDescriptor(Element.prototype, 'clientWidth');

function gia(innerWidth: number, clientWidth: number): void {
  Object.defineProperty(window, 'innerWidth', { value: innerWidth, configurable: true });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    value: clientWidth,
    configurable: true,
  });
}

afterEach(() => {
  delete (document.documentElement as unknown as Record<string, unknown>).clientWidth;
  if (goc !== undefined) Object.defineProperty(Element.prototype, 'clientWidth', goc);
  document.body.innerHTML = '';
});

describe('viewportBounds()', () => {
  it('mép phải trừ thanh cuộn dọc, không lấy cả bề ngang cửa sổ', () => {
    gia(1440, 1425);
    /* 1425 − 8 = 1417. Lấy `innerWidth` thì ra 1432, tức 7px ngoài vùng vẽ được. */
    expect(viewportBounds().right).toBe(1417);
  });

  it('không có thanh cuộn thì hai cách đo trùng nhau', () => {
    gia(1440, 1440);
    expect(viewportBounds().right).toBe(1432);
  });

  it('lề trái vẫn là lề cố định, không phụ thuộc bề ngang', () => {
    gia(360, 360);
    expect(viewportBounds().left).toBe(8);
    expect(viewportBounds().right).toBe(352);
  });
});

/**
 * `clipToDialog()` — khung "cách tính" trong popup Bài tập (26/10/2026).
 *
 * Thân popup tự cuộn và tấm bo góc cắt mọi thứ tràn ra, nên khung canh theo mép MÀN sẽ thò ra ngoài
 * thân popup, bị cắt và đẻ thanh cuộn ngang. Đo trên Chrome ở 360px trước khi sửa: khung 352px trong
 * thân rộng 329px. jsdom không bố cục, nên hộp của từng tầng vá tay.
 */
describe('clipToDialog()', () => {
  const MAN = { top: 64, left: 8, right: 352, bottom: 772 };

  /** Đặt hộp viền và vùng trong (trừ viền và thanh cuộn) cho một phần tử — jsdom trả toàn 0. */
  function hop(
    el: HTMLElement,
    rect: { left: number; top: number; width: number; height: number },
    inner: { clientLeft?: number; clientTop?: number; clientWidth: number; clientHeight: number },
  ): void {
    el.getBoundingClientRect = () =>
      ({
        ...rect,
        x: rect.left,
        y: rect.top,
        right: rect.left + rect.width,
        bottom: rect.top + rect.height,
        toJSON: () => ({}),
      }) as DOMRect;
    for (const [ten, so] of Object.entries({ clientLeft: 0, clientTop: 0, ...inner })) {
      Object.defineProperty(el, ten, { value: so, configurable: true });
    }
  }

  it('ngoài popup thì giữ nguyên vùng của màn — thẻ Công thức trên trang không đổi gì', () => {
    document.body.innerHTML = '<div style="overflow: hidden"><div id="the"></div></div>';
    const the = document.getElementById('the') as HTMLElement;
    expect(clipToDialog(the, MAN)).toEqual(MAN);
  });

  it('trong popup thì thu vào phần nhìn thấy của thân cuộn, trừ thanh cuộn dọc', () => {
    document.body.innerHTML =
      '<dialog open><div id="tam" style="overflow: hidden"><div id="than" style="overflow-y: auto"><div id="the"></div></div></div></dialog>';
    const tam = document.getElementById('tam') as HTMLElement;
    const than = document.getElementById('than') as HTMLElement;
    const the = document.getElementById('the') as HTMLElement;
    // Tấm 331px có viền 1px; thân bên trong có thanh cuộn dọc 15px ở mép phải.
    hop(
      tam,
      { left: 14, top: 100, width: 331, height: 600 },
      { clientLeft: 1, clientTop: 1, clientWidth: 329, clientHeight: 598 },
    );
    hop(
      than,
      { left: 15, top: 160, width: 329, height: 539 },
      { clientWidth: 314, clientHeight: 539 },
    );

    expect(clipToDialog(the, MAN)).toEqual({
      top: 160 + 8,
      left: 15 + 8,
      // 15 + 314 − 8: mép phải dừng TRƯỚC thanh cuộn, không phải ở mép hộp viền (344 − 8).
      right: 321,
      bottom: 160 + 539 - 8,
    });
  });
});
