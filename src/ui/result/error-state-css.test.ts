import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thẻ lỗi là MỘT hàng: `_ _ đơn vị` bên trái, câu nguyên nhân dạt mép phải (27/10/2026). Chủ dự án
 * khoanh câu "Cần tối thiểu 2 dòng tiền" dưới `_ _ %/năm` của XIRR và kẻ mũi tên sang mép phải:
 * _"chuyển vùng đỏ lòm khoanh đỏ sang bên phải mà tôi chỉ để không gian tối giản hơn"_. Đo trên
 * Chrome: thẻ XIRR 69 → 47px ở 1440, 66 → 46,5px ở 390. Test React không chạy CSS Module, nên ca
 * dưới đọc thẳng file.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./ErrorState.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân luật đầu dòng của một lớp, ngoài mọi khối @media (luật gốc đứng trước khối đầu tiên). */
function luatGoc(lop: string): string {
  const goc = CSS.slice(0, CSS.indexOf('@media'));
  return new RegExp(`(?:^|\\})\\s*\\.${lop}\\s*\\{([^}]*)\\}`).exec(goc)?.[1] ?? '';
}

describe('thẻ lỗi một hàng, câu nguyên nhân dạt phải', () => {
  it('thẻ là hàng flex xuống dòng được, thẳng chân chữ — không còn cột dọc', () => {
    const the = luatGoc('block');
    expect(the).toMatch(/flex-wrap:\s*wrap;/);
    expect(the).toMatch(/align-items:\s*baseline;/);
    expect(the).not.toMatch(/flex-direction:\s*column/);
  });

  /*
   * Lề tự động ở `.head`, không ở `.cause`: cùng hàng thì hai cách như nhau, nhưng khi câu dài phải
   * xuống hàng dưới, lề ở `.cause` đẩy một câu ngắn hơn thẻ sang phải thành khối thụt lề lơ lửng
   * (đo trên P/E lỗ ở 1440px). Lề ở `.head` để câu ấy về mép trái như trước.
   */
  it('chỗ dư thuộc về `_ _`, nên câu xuống hàng vẫn bắt đầu từ mép trái', () => {
    expect(luatGoc('head')).toMatch(/margin-right:\s*auto;/);
    expect(luatGoc('cause')).not.toMatch(/margin-left:\s*auto/);
  });

  it('không khối @media nào đặt lại thẻ về cột dọc', () => {
    expect(CSS.slice(CSS.indexOf('@media'))).not.toMatch(/flex-direction:\s*column/);
  });
});
