import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thông báo "Đã sao chép link" ở đáy màn hình (23/10/2026, chủ dự án: nút Chia sẻ giữ nguyên, lời
 * báo là một dải nhỏ ở dưới cùng tầm 5 giây). Test React không chạy CSS Module, nên ca dưới đọc thẳng
 * file để giữ ba thứ mà một lần "dọn CSS" dễ làm mất: dải neo theo màn mà không bắt cú chạm, nằm TRÊN
 * dải "Lưu vào danh mục · Thoát" ở khổ điện thoại, và hai lớp dấu tích cũ của nút đã đi.
 */

const css = readFileSync(
  fileURLToPath(new URL('./FormulaDetail.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân luật `.thongBao { … }` — luật gốc đầu tiên, rồi luật trong khối điện thoại. */
const goc = /^\.thongBao\s*\{([^}]*)\}/m.exec(css)?.[1] ?? '';
const dienThoai =
  /@media \(max-width: 1023\.98px\)\s*\{\s*\.thongBao\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';

describe('Thông báo sao chép link', () => {
  it('neo theo màn, không bắt cú chạm, nổi trên thanh điều hướng', () => {
    expect(goc, 'thiếu luật .thongBao').not.toBe('');
    expect(goc).toMatch(/position:\s*fixed;/);
    expect(goc).toMatch(/pointer-events:\s*none;/);
    expect(goc).toMatch(/z-index:\s*12;/);
  });

  it('dưới 1024px đứng trên thanh điều hướng dưới VÀ trên dải nút dính đáy (53px)', () => {
    expect(dienThoai, 'thiếu luật điện thoại của .thongBao').not.toBe('');
    expect(dienThoai).toMatch(/var\(--tabbar-height\)/);
    expect(dienThoai).toMatch(/env\(safe-area-inset-bottom/);
    expect(dienThoai).toMatch(/53px/);
  });

  it('nút Chia sẻ không còn hai lớp dấu tích đổi icon', () => {
    expect(css).not.toMatch(/\.narrowOnly/);
    expect(css).not.toMatch(/\.wideOnly/);
  });
});
