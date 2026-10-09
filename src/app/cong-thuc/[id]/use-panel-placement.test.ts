// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';

import { viewportBounds } from './use-panel-placement';

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
