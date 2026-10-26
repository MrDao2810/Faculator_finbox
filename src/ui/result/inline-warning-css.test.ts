import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thẻ cảnh báo vàng gọn (`InlineWarning`): câu và dòng gợi ý bắt đầu từ mép trái thẻ, không thụt
 * sau icon (23/10/2026, chủ dự án kẻ mũi tên sang trái trên thẻ "Thiếu dữ liệu chuỗi" của biểu đồ).
 *
 * jsdom không dàn trang, nên ca này đọc CSS: thẻ là lưới hai cột, khối chữ tan vào lưới, câu và
 * dòng gợi ý trải hết hai cột. Quay về flex hai ô là hai dòng ấy thụt vào lại.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./InlineWarning.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function luat(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|\\n)${escaped}\\s*\\{([^}]*)\\}`).exec(CSS)?.[1] ?? '';
}

describe('InlineWarning — câu cảnh báo thẳng mép trái thẻ', () => {
  it('thẻ là lưới hai cột: icon, rồi nhãn', () => {
    const than = luat('.warning');
    expect(than).toMatch(/display:\s*grid;/);
    expect(than).toMatch(/grid-template-columns:\s*auto minmax\(0, 1fr\);/);
  });

  it('khối chữ tan vào lưới của thẻ', () => {
    expect(luat('.body')).toMatch(/display:\s*contents;/);
  });

  it('câu và dòng gợi ý trải hết hai cột, bắt đầu dưới icon', () => {
    expect(luat('.message,\n.fix')).toMatch(/grid-column:\s*1 \/ -1;/);
  });
});
