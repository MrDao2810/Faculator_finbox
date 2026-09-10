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

/**
 * Tiêu đề khối được phép mang MÀU NHẤN — ngoại lệ có tên, không phải lỗ hổng.
 *
 * Luật gốc ("xanh dành cho hành động và cho khối Kết quả") vẫn đứng, và `EXPECTED.color` vẫn buộc
 * mọi lớp trong `SECTION_TITLES` khai `--color-ink`. Ngoại lệ đi bằng một lớp CHỒNG LÊN, nên bốn
 * thuộc tính còn lại vẫn khai một chỗ và vẫn bị gác.
 *
 * Ghim thành bảng chứ không bỏ qua: một lớp bổ sung màu là cách đơn giản nhất để lách hai ca kiểm
 * bên dưới mà chúng không hay biết. Ai thêm một tiêu đề khối màu nhấn thì phải khai vào đây, và lúc
 * ấy sẽ đọc đúng lý do vì sao cái đang có được phép.
 */
const NGOAI_LE_MAU_NHAN: ReadonlyArray<readonly [file: string, className: string, lyDo: string]> = [
  [
    'app/page.module.css',
    'blockTitleAccent',
    'Dòng "Duyệt theo nhóm · 111 công thức" là MỘT câu liền: tên khối và con số đọc nối nhau. Chủ dự án chốt 09/09/2026 cho cả dòng một màu, thay vì hai màu như bản vẽ Figma cũ.',
  ],
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

describe('Ngoại lệ màu nhấn — có tên và có lý do', () => {
  /*
   * Ngoại lệ phải là lớp CHỒNG LÊN, tức nó chỉ được khai đúng `color`. Khai thêm cỡ chữ hay độ đậm
   * ở đây là dựng một kiểu tiêu đề thứ hai bằng cửa sau, đúng thứ cả file này tồn tại để chặn.
   */
  it.each(NGOAI_LE_MAU_NHAN)('%s .%s chỉ đổi màu, không đổi gì khác', (file, className) => {
    const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className);

    expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
    expect(body ?? '').toMatch(/color:\s*var\(--color-accent\)\s*;/);

    for (const property of Object.keys(EXPECTED)) {
      if (property === 'color') continue;
      expect(body ?? '', `${file} .${className} — không được khai lại ${property}`).not.toMatch(
        new RegExp(`${property}\\s*:`),
      );
    }
  });

  it('mỗi ngoại lệ đều có lý do viết ra, không để trống cho qua', () => {
    for (const [file, className, lyDo] of NGOAI_LE_MAU_NHAN) {
      expect(lyDo.length, `${file} .${className}`).toBeGreaterThan(40);
    }
  });
});
