import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * "Con số đáp án" phải có MỘT khuôn duy nhất — đợt rà soát phân cấp thị giác.
 *
 * Trước đợt này sản phẩm có năm kiểu vẽ cho cùng một vai:
 *
 *   `ResultBlock`                 sans, clamp(32→40), mực, nền trắng + đổ bóng
 *   `FeeTaxBody.headline`         mono, 32, TRẮNG trên nền xanh ĐẶC
 *   `LoanScheduleBody.summary`    mono, 32, xanh trên nền chìm
 *   `PortfolioScreen.savedResult` mono, 20, xanh
 *   `StatTile.value`              sans, 20, mực
 *
 * Bản rà soát thiết kế báo "Result card... lặp lại nhưng chưa đồng nhất giữa các màn" và "kết
 * quả cuối phải là điểm nổi bật nhất". Ba cái đầu là "đáp án của cả màn" nên gom về một khuôn:
 * nền trắng, viền xanh `--color-selected` 1,5px, nhãn xanh viết hoa, con số mực.
 *
 * Hai cái sau CỐ Ý ở ngoài: chúng là con số trong một dòng danh sách chứ không phải đáp án của
 * màn. Chúng đi theo `StatTile.value` — ca kiểm cuối giữ đúng điều đó.
 *
 * Đọc file nguồn chứ không render, cùng lý do đã ghi ở `Table.test.ts`.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Ba thẻ mang đáp án của cả một màn: [file, lớp khung, lớp nhãn, lớp con số]. */
const ANSWER_CARDS: ReadonlyArray<
  readonly [file: string, frame: string, label: string, value: string]
> = [
  ['ui/result/ResultBlock.module.css', 'block', 'eyebrow', 'value'],
  ['ui/screens/FeeTaxBody.module.css', 'headline', 'headlineLabel', 'headlineValue'],
  ['ui/screens/LoanScheduleBody.module.css', 'summary', 'summaryLabel', 'summaryValue'],
];

const FRAME = {
  background: 'var(--color-surface)',
  border: '1.5px solid var(--color-selected)',
  'border-radius': 'var(--radius-md)',
} as const;

const LABEL = {
  'font-size': 'var(--text-xs)',
  'font-weight': 'var(--weight-medium)',
  'letter-spacing': '0.08em',
  'text-transform': 'uppercase',
  color: 'var(--color-selected)',
} as const;

const VALUE = {
  'font-size': 'clamp(var(--text-2xl), 9vw, var(--text-3xl))',
  'font-weight': 'var(--weight-bold)',
  'line-height': 'var(--leading-tight)',
  'font-variant-numeric': 'tabular-nums',
  color: 'var(--color-ink)',
} as const;

function ruleBody(css: string, className: string): string | null {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return new RegExp(`^\\.${className}\\s*\\{([^}]*)\\}`, 'm').exec(stripped)?.[1] ?? null;
}

function expectDeclarations(
  body: string | null,
  expected: Readonly<Record<string, string>>,
  where: string,
): void {
  expect(body, `không tìm thấy luật ${where}`).not.toBeNull();
  if (body === null) return;

  for (const [property, value] of Object.entries(expected)) {
    const literal = value.replace(/[()\\.*+?[\]^$|]/g, '\\$&');
    expect(body, `${where} — ${property}`).toMatch(
      new RegExp(`${property}\\s*:\\s*${literal}\\s*;`),
    );
  }
}

describe('Thẻ kết quả — một khuôn duy nhất', () => {
  it.each(ANSWER_CARDS)('%s — khung, nhãn và con số cùng một kiểu', (file, frame, label, value) => {
    const css = readFileSync(join(SRC_DIR, file), 'utf8');

    expectDeclarations(ruleBody(css, frame), FRAME, `${file} .${frame}`);
    expectDeclarations(ruleBody(css, label), LABEL, `${file} .${label}`);
    expectDeclarations(ruleBody(css, value), VALUE, `${file} .${value}`);
  });

  it('không thẻ đáp án nào còn dùng mặt chữ mono cho con số', () => {
    /*
     * `tabular-nums` đã cho chữ số đều mà không phải đổi mặt chữ. Đổi mặt chữ giữa các màn là
     * thứ làm cùng một con số trông như hai loại dữ liệu khác nhau.
     */
    for (const [file, , , value] of ANSWER_CARDS) {
      const body = ruleBody(readFileSync(join(SRC_DIR, file), 'utf8'), value) ?? '';

      expect(body, `${file} .${value}`).not.toMatch(/font-family/);
    }
  });

  it('khối lỗi cao bằng khối kết quả, nên trang không xê dịch khi chuyển trạng thái', () => {
    const body = ruleBody(
      readFileSync(join(SRC_DIR, 'ui/result/ErrorState.module.css'), 'utf8'),
      'value',
    );

    expectDeclarations(
      body,
      { 'font-size': VALUE['font-size'], 'line-height': VALUE['line-height'] },
      'ErrorState .value',
    );
  });

  it('con số trong một dòng danh sách đi theo StatTile, KHÔNG theo khuôn thẻ đáp án', () => {
    const saved = ruleBody(
      readFileSync(join(SRC_DIR, 'app/danh-muc/PortfolioScreen.module.css'), 'utf8'),
      'savedResult',
    );

    expectDeclarations(
      saved,
      {
        'font-size': 'var(--text-lg)',
        'font-weight': 'var(--weight-bold)',
        'font-variant-numeric': 'tabular-nums',
        color: 'var(--color-ink)',
      },
      'PortfolioScreen .savedResult',
    );
  });
});
