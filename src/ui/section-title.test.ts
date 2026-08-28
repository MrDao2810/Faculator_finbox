import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Tiêu đề khối phải có MỘT kiểu duy nhất trên cả sản phẩm — đợt rà soát phân cấp thị giác.
 *
 * Trước đợt này cùng một cấp tiêu đề được vẽ ba kiểu khác nhau:
 *
 *   12px/medium/0,06em/xám   — `FormulaDetail`, `ChainBody`
 *   13px/bold/0,04em/xanh    — `page`, `PortfolioScreen`, `SettingsScreen`, `FeeTaxBody`,
 *                              `LoanScheduleBody`, `XirrBody`
 *
 * Kiểu thứ nhất gây hại nhất ở màn chi tiết: tiêu đề khối NHỎ HƠN và MỜ HƠN chữ thân bài, nên
 * chín khối của WF-03 đọc thành một dải chữ liền. Bản rà soát thiết kế báo đúng thế ở hai mục
 * ("thiếu phân cấp rõ" và "khoảng cách giữa các khối chưa rõ ràng").
 *
 * ── Vì sao là ca kiểm neo chứ không phải một component dùng chung ──────────────────────────────
 *
 * Sáu trên tám khai báo vốn đã GIỐNG HỆT nhau từng dòng; chỗ hỏng là hai cái lệch, không phải
 * việc thiếu chỗ khai chung. Gom thành component thì phải sửa 11 file TSX và tự nhận thêm một
 * ranh giới gói, đổi lại chẳng chặn được gì mà ca kiểm này không chặn. Đây cũng đúng lối dự án
 * đã dùng cho `UNIT_SCALES[].label` với khoá i18n: chép có chủ đích, và một ca kiểm neo giữ hai
 * bên không trôi khỏi nhau.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Bốn thuộc tính làm nên kiểu tiêu đề khối. Bố cục (margin, viền, flex) để từng màn tự lo. */
const EXPECTED = {
  'font-size': 'var(--text-sm)',
  'font-weight': 'var(--weight-bold)',
  'letter-spacing': '0.04em',
  'text-transform': 'uppercase',
  color: 'var(--color-ink)',
} as const;

/** Mọi nơi khai kiểu tiêu đề khối, kèm tên lớp của nó. */
const SECTION_TITLES: ReadonlyArray<readonly [file: string, className: string]> = [
  ['app/cai-dat/SettingsScreen.module.css', 'blockTitle'],
  ['app/cong-thuc/[id]/FormulaDetail.module.css', 'blockTitle'],
  ['app/danh-muc/PortfolioScreen.module.css', 'blockTitle'],
  ['app/page.module.css', 'blockTitle'],
  ['ui/screens/ChainBody.module.css', 'title'],
  ['ui/screens/FeeTaxBody.module.css', 'blockTitle'],
  ['ui/screens/LoanScheduleBody.module.css', 'blockTitle'],
  ['ui/screens/XirrBody.module.css', 'blockTitle'],
];

/** Cắt đúng thân luật của một lớp, bỏ chú thích để `color:` trong docblock không lọt vào. */
function ruleBody(css: string, className: string): string | null {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const match = new RegExp(`^\\.${className}\\s*\\{([^}]*)\\}`, 'm').exec(stripped);

  return match?.[1] ?? null;
}

describe('Tiêu đề khối — một kiểu duy nhất', () => {
  it.each(SECTION_TITLES)('%s .%s khai đủ và đúng cả năm thuộc tính', (file, className) => {
    const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className);

    expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
    if (body === null) return;

    for (const [property, value] of Object.entries(EXPECTED)) {
      expect(body, `${file} .${className} — ${property}`).toMatch(
        new RegExp(`${property}\\s*:\\s*${value.replace(/[()\\.*+?[\]^$|]/g, '\\$&')}\\s*;`),
      );
    }
  });

  it('không tiêu đề khối nào còn dùng màu nhấn — xanh dành cho hành động và Kết quả', () => {
    for (const [file, className] of SECTION_TITLES) {
      const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className) ?? '';

      expect(body, `${file} .${className}`).not.toMatch(/color:\s*var\(--color-accent\)/);
    }
  });
});
