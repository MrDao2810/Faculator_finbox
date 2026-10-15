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

/**
 * Bốn thuộc tính làm nên kiểu tiêu đề khối. Bố cục (margin, viền, flex) để từng màn tự lo.
 *
 * Cỡ chữ đi qua token `--section-title-size` từ 15/10/2026: 14px từ 1024px, 12px dưới 1024px (chủ dự
 * án khoanh "Ý NGHĨA", "CÔNG THỨC" trên điện thoại: _"giảm size text … áp dụng cho màn mobile"_). Đè ở
 * một chỗ trong `globals.css` thì cả mười một lớp dưới đây đổi cùng nhau — vẫn một kiểu.
 */
const EXPECTED = {
  'font-size': 'var(--section-title-size)',
  'font-weight': 'var(--weight-bold)',
  'letter-spacing': '0.04em',
  'text-transform': 'uppercase',
  color: 'var(--color-ink)',
} as const;

/** Mọi nơi khai kiểu tiêu đề khối, kèm tên lớp của nó. */
const SECTION_TITLES: ReadonlyArray<readonly [file: string, className: string]> = [
  ['app/cai-dat/SettingsScreen.module.css', 'blockTitle'],
  ['app/cong-thuc/[id]/FormulaDetail.module.css', 'blockTitle'],
  /* Hai khối của màn Công thức — trang chủ `app/page.module.css` gộp vào đây ngày 15/09/2026. */
  ['app/cong-thuc/DailyShelf.module.css', 'blockTitle'],
  ['app/cong-thuc/FormulaListScreen.module.css', 'blockTitle'],
  /*
   * Mộ chí: `app/danh-muc/PortfolioScreen.module.css → .blockTitle` rời danh sách này ngày 12/10/2026.
   * Bản thiết kế hai cột của màn Danh mục đặt tiêu đề cột phải ("Mã nắm giữ", "Phép tính đã lưu") cỡ lớn,
   * chữ thường, ngang hàng với nhãn "Danh mục" ở cột trái — cả hai là tiêu đề TRANG chứ không phải nhãn
   * của một khối trong trang. Lớp mới là `.mainTitle`; đây là ngoại lệ có chủ đích và duy nhất, và lý do
   * viết cạnh luật CSS của nó. Nếu một màn khác muốn dùng cỡ lớn, đó là một cuộc hỏi chủ dự án, không phải
   * một dòng thêm vào bảng này.
   */
  /* Ba thẻ ở cột phải của bài hướng dẫn WF-21: Trong bài này · Mở màn thật · Công thức liên quan. */
  ['app/huong-dan/cong-thuc/[id]/GuideScreen.module.css', 'blockTitle'],
  ['app/ve-chung-toi/AboutScreen.module.css', 'blockTitle'],
  /*
   * Khối "Đang tính theo các mức sau" vào danh sách ngày 13/10/2026. Trước đó tiêu đề của nó cố ý nhẹ
   * hơn một bậc (chữ thường, màu dịu); khi tên từng mức bên dưới lên 14px đậm thì tiêu đề thành ra mờ
   * hơn chính nội dung của nó. Lý do đầy đủ viết cạnh luật `.title` của file ấy.
   */
  ['ui/result/ConstantsNote.module.css', 'title'],
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
 *
 * Bảng hiện RỖNG. Mục duy nhất từng có — dòng "Duyệt theo nhóm · 111 công thức" của trang chủ, cả
 * dòng một màu nhấn theo chủ dự án chốt 09/09/2026 — đi cùng khối ấy khi trang chủ gộp vào màn Công
 * thức (15/09/2026): bản vẽ màn gộp không còn khối "Duyệt theo nhóm". Đó là khối bị bỏ, không phải
 * quyết định màu bị đảo. Bảng giữ lại làm chỗ khai cho lần sau.
 */
const NGOAI_LE_MAU_NHAN: ReadonlyArray<readonly [file: string, className: string, lyDo: string]> =
  [];

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

describe('Cỡ chữ tiêu đề khối theo khổ màn', () => {
  const globals = readFileSync(join(SRC_DIR, 'app/globals.css'), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );

  it('14px từ 1024px — token khai trong :root bằng --text-sm', () => {
    expect(globals).toMatch(/:root\s*\{[^}]*--section-title-size:\s*var\(--text-sm\);/);
  });

  it('12px dưới 1024px — đè trên body trong @media (max-width: 1023.98px)', () => {
    expect(globals).toMatch(
      /@media \(max-width: 1023\.98px\)\s*\{\s*body\s*\{\s*--section-title-size:\s*var\(--text-xs\);/,
    );
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
