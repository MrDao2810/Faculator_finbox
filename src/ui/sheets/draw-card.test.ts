import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { extractColorTokens } from '../contrast';

/**
 * Thẻ chia sẻ PNG luôn nền sáng, kể cả khi giao diện đang ở bảng tối.
 *
 * Đây là quyết định sản phẩm, không phải chi tiết kỹ thuật: file xuất rời khỏi màn hình và sống
 * tiếp một mình — dán vào báo cáo, gửi qua chat, đem đi in — nên nó theo quy ước của TÀI LIỆU
 * chứ không theo tuỳ chọn hiển thị của người vừa bấm nút. Cùng lẽ với việc file xuất luôn là
 * tài liệu tiếng Việt dù giao diện đang tiếng Anh (FR-24, xem docblock của `draw-card.ts`).
 *
 * Quét mã nguồn chứ không chạy hàm vẽ: `drawExportCard` cần canvas 2D thật, mà jsdom không có.
 * Cùng cách `constants-gate.test.ts` quét chỗ gọi hằng số thị trường.
 */

const SOURCE = readFileSync(fileURLToPath(new URL('./draw-card.ts', import.meta.url)), 'utf8');

/**
 * Chỉ phần MÃ, bỏ dòng chú thích — cùng cách lọc với `tokens.test.ts`.
 * Chú thích ở đầu file kể lại chuyện `getComputedStyle` từng nằm đây và vì sao bị gỡ; đó là thứ
 * cần giữ, không phải thứ cần cấm.
 */
const CODE = SOURCE.split('\n')
  .map((line) => line.trim())
  .filter((line) => !line.startsWith('*') && !line.startsWith('//') && !line.startsWith('/*'))
  .join('\n');

const GLOBALS_CSS = readFileSync(
  fileURLToPath(new URL('../../app/globals.css', import.meta.url)),
  'utf8',
);

describe('thẻ PNG ghim ở bảng màu sáng', () => {
  /*
   * Đọc token đang áp dụng là ĐÚNG cái làm tấm thẻ đổi màu theo giao diện. Bản trước của file
   * này làm vậy, kèm chú thích "để thẻ PNG cùng bảng màu với giao diện" — hợp lý khi chỉ có một
   * bảng màu, hỏng ngay khi có hai. Không có ca này thì lần dọn dẹp sau rất dễ đưa nó về.
   */
  it('không đọc token đang áp dụng qua getComputedStyle', () => {
    expect(CODE).not.toContain('getComputedStyle');
  });

  /*
   * Mã màu ở đây là bản CHÉP từ :root — chép thì phải đối chiếu, không thì bảng sáng đổi mà tấm
   * thẻ giữ nguyên màu cũ, và không ai biết cho tới lúc nhìn tận mắt một file PNG.
   */
  it('tám mã màu khớp từng chữ với bảng sáng trong globals.css', () => {
    const light = extractColorTokens(GLOBALS_CSS);

    const expected: ReadonlyArray<[string, string]> = [
      ['paper', '--color-surface'],
      ['ink', '--color-ink'],
      ['inkSoft', '--color-ink-soft'],
      ['muted', '--color-muted'],
      ['accent', '--color-accent'],
      ['border', '--color-border'],
      ['warnBg', '--color-warning-soft'],
      ['warnInk', '--color-warning'],
    ];

    for (const [field, token] of expected) {
      const value = light[token];
      expect(value, `globals.css thiếu ${token}`).toBeDefined();

      const declared = new RegExp(`${field}:\\s*'([^']+)'`).exec(CODE)?.[1];
      expect(declared, `draw-card.ts thiếu trường ${field}`).toBeDefined();
      expect(declared, `${field} lệch với ${token} trong globals.css`).toBe(value);
    }
  });

  /*
   * Cấm mã màu RIÊNG của bảng tối, không cấm mọi mã bảng tối khai ra.
   *
   * Hai tập hợp ấy trùng nhau cho tới khi có token đầu tiên mang CÙNG một giá trị ở cả hai bảng
   * — `--color-on-result` (#ffffff, chữ trên thẻ đáp án, xem `globals.css`). Từ lúc đó bản cũ
   * của ca này báo lỗi giả: nó thấy #ffffff trong khối tối rồi kết luận nền thẻ PNG là màu bảng
   * tối, trong khi #ffffff cũng chính là `--color-surface` của bảng sáng.
   *
   * Lọc theo bảng sáng giữ đúng ý ban đầu và chặt hơn một chút: thứ phải chặn là màu chỉ tồn tại
   * ở bảng tối, vì đó mới là màu kéo tấm PNG lệch khỏi bảng sáng.
   */
  it('không lấy màu RIÊNG của bảng tối', () => {
    const dark = extractColorTokens(GLOBALS_CSS, "[data-theme='dark']");
    const light = new Set(
      Object.values(extractColorTokens(GLOBALS_CSS)).map((value) => value.toLowerCase()),
    );

    const darkOnly = Object.values(dark).filter((value) => !light.has(value.toLowerCase()));
    expect(darkOnly.length, 'không bóc được mã màu nào — ca kiểm thành vô nghĩa').toBeGreaterThan(
      0,
    );

    for (const value of darkOnly) {
      expect(CODE.toLowerCase(), `mã màu ${value} chỉ có ở bảng tối`).not.toContain(
        value.toLowerCase(),
      );
    }
  });
});
