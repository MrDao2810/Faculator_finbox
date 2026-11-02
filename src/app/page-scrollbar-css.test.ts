import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thanh cuộn của trang dưới 1024px (31/10/2026) — xem docblock "Dưới 1024px: trang không có thanh
 * cuộn" trong `globals.css`.
 *
 * Chủ dự án mở rồi đóng thẻ tổng của Danh mục liên tục ở khổ điện thoại và thấy cả giao diện "phập
 * phồng": trang đổi giữa vừa khít màn và dài hơn màn, thanh cuộn cổ điển hiện ra rồi biến mất, mỗi lần
 * lấy đi rồi trả lại 13–15px bề ngang. jsdom không vẽ thanh cuộn và Chrome headless cũng không, nên ca
 * này đọc thẳng CSS.
 */

const CSS = readFileSync(fileURLToPath(new URL('./globals.css', import.meta.url)), 'utf8');

/** Khối `@media` bắt đầu ở vị trí `batDau` — đếm ngoặc, vì khối có ngoặc con. */
function khoiMedia(batDau: number): string {
  let sau = CSS.indexOf('{', batDau) + 1;
  for (let mo = 1; mo > 0 && sau < CSS.length; sau += 1) {
    if (CSS[sau] === '{') mo += 1;
    if (CSS[sau] === '}') mo -= 1;
  }
  return CSS.slice(batDau, sau);
}

describe('thanh cuộn của trang', () => {
  it('dưới 1024px trang không có thanh cuộn chiếm chỗ, cả hai cú pháp', () => {
    const khoi = [...CSS.matchAll(/@media \(max-width: 1023\.98px\) \{/g)]
      .map((m) => khoiMedia(m.index))
      .find((k) => k.includes('scrollbar-width'));
    expect(khoi).toBeDefined();
    expect(khoi).toMatch(/html \{\s*scrollbar-width: none;\s*\}/);
    expect(khoi).toMatch(/html::-webkit-scrollbar \{\s*display: none;\s*\}/);
  });

  it('không chỗ nào khác ẩn thanh cuộn của trang, và không chừa dải bằng `scrollbar-gutter`', () => {
    // Từ 1024px giữ quyết định cũ: thanh cuộn vẫn hiện; dải chừa đã bị gỡ vì để lại vệt khác màu.
    const khaiBao = CSS.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(khaiBao.match(/html \{\s*scrollbar-width: none;/g)).toHaveLength(1);
    expect(khaiBao).not.toMatch(/scrollbar-gutter\s*:/);
  });
});
