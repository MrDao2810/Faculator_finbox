import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Mặt phẳng cảnh báo vàng phải giống nhau ở mọi màn — đợt rà soát phân cấp thị giác.
 *
 * Bản rà soát thiết kế xếp "Warning/Disclaimer" vào nhóm "lặp lại nhưng chưa đồng nhất giữa các
 * màn". Đo được năm chỗ dựng lại cùng bộ ba token vàng với hai bán kính và hai cỡ chữ:
 *
 *   `InlineWarning.warning`              bo `sm`
 *   `PortfolioScreen.priceError`         bo `sm`, cỡ 12
 *   `FormulaDetail.seriesShortNote`      bo `sm`, cỡ 12
 *   `DisclaimerBar.notice`               bo `md`, cỡ 13
 *   `XirrBody.issues`                    bo `md`, cỡ 13
 *
 * Mỗi luật tự nó vẫn hợp lệ — `tokens.test.ts` chỉ chặn màu viết thẳng, không so hai file với
 * nhau — nên chênh lệch này không cửa nào bắt được. Ca kiểm dưới đây là cửa đó.
 *
 * KHÔNG gom thành component: năm chỗ có cấu trúc bên trong khác hẳn nhau (một cái có icon và
 * dòng "cách sửa", một cái là `<ul>`, một cái là `<p>` một dòng). Thứ phải giống nhau là MẶT
 * PHẲNG — nền, viền, bo góc, cỡ chữ — nên neo đúng bốn thứ ấy.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

const SURFACES: ReadonlyArray<readonly [file: string, className: string]> = [
  ['ui/result/InlineWarning.module.css', 'warning'],
  ['ui/navigation/DisclaimerBar.module.css', 'notice'],
  ['ui/screens/XirrBody.module.css', 'issues'],
  ['app/danh-muc/PortfolioScreen.module.css', 'priceError'],
  ['app/cong-thuc/[id]/FormulaDetail.module.css', 'seriesShortNote'],
];

const EXPECTED = {
  background: 'var(--color-warning-soft)',
  border: '1px solid var(--color-warning-line)',
  'border-radius': 'var(--radius-md)',
} as const;

function ruleBody(css: string, className: string): string | null {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return new RegExp(`^\\.${className}\\s*\\{([^}]*)\\}`, 'm').exec(stripped)?.[1] ?? null;
}

describe('Mặt phẳng cảnh báo vàng', () => {
  it.each(SURFACES)('%s .%s dùng đúng nền, viền và bo góc chung', (file, className) => {
    const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className);

    expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
    if (body === null) return;

    for (const [property, value] of Object.entries(EXPECTED)) {
      const literal = value.replace(/[()\\.*+?[\]^$|]/g, '\\$&');
      expect(body, `${file} .${className} — ${property}`).toMatch(
        new RegExp(`${property}\\s*:\\s*${literal}\\s*;`),
      );
    }
  });

  it('không mặt nào còn để cỡ chữ nhỏ nhất — câu cảnh báo phải đọc được', () => {
    /*
     * `--text-xs` là bậc dành cho metadata (nhãn ô, huy hiệu, tên nhóm). Một câu giải thích vì
     * sao phép tính không ra số KHÔNG phải metadata, và ở bậc đó nó mờ ngang một dòng chú thích
     * bên lề — trái hẳn NFR-USA-04, vốn đòi câu lỗi nói rõ nguyên nhân kèm cách sửa.
     *
     * Khai `font-size` là tuỳ chọn (`InlineWarning` để con bên trong tự lo), nhưng khai thì
     * không được là `--text-xs`.
     */
    for (const [file, className] of SURFACES) {
      const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), className) ?? '';

      expect(body, `${file} .${className}`).not.toMatch(/font-size:\s*var\(--text-xs\)/);
    }
  });
});
