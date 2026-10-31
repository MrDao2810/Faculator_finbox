import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { cssBlock } from './contrast';

/**
 * Giữ thang chữ khỏi dồn cục lại — đợt rà soát phân cấp thị giác.
 *
 * Trước đợt này `--text-xs` là 12px và `--text-sm` là 13px, cách nhau đúng 1px, mà hai bậc ấy
 * chiếm 231 trên 291 khai báo `font-size` của cả dự án. Hệ quả đo được trên màn: tên công thức,
 * mô tả và nhãn nhóm gần như cùng một cỡ, nên ba vai primary – secondary – metadata không đọc ra
 * được bằng mắt. Bản rà soát thiết kế báo đúng triệu chứng đó ở sáu màn khác nhau.
 *
 * Không có cửa gác nào cho `--text-*` trước đây: `tokens.test.ts` chỉ soi màu, `contrast.test.ts`
 * chỉ soi tương phản. Thêm một bậc chữ hay bóp một bậc lại đều lọt. Ca kiểm này đóng lỗ đó.
 *
 * Chỉ ràng buộc ĐÁY thang (xs → md) vì đó là chỗ chật và là chỗ ba vai sống. Phần trên (lg trở
 * lên) vốn đã thưa và dành cho tiêu đề với con số kết quả, không cần luật.
 */

const GLOBALS_CSS = readFileSync(
  fileURLToPath(new URL('../app/globals.css', import.meta.url)),
  'utf8',
);

/** Bậc đáy, theo đúng thứ tự tăng dần. Đây là những bậc ba vai chữ dùng tới. */
const BOTTOM_STEPS = ['--text-xs', '--text-sm', '--text-base', '--text-md'] as const;

const ALL_STEPS = [...BOTTOM_STEPS, '--text-lg', '--text-xl', '--text-2xl', '--text-3xl'] as const;

/** Khoảng cách nhỏ nhất giữa hai bậc liền nhau ở đáy thang. 1px là thứ đợt này sinh ra để chặn. */
const MIN_STEP_PX = 2;

function scale(): ReadonlyMap<string, number> {
  // `cssBlock` trả null khi không tìm thấy khối. Để rỗng thì ca kiểm canary bên dưới đỏ, đúng ý.
  const root = cssBlock(GLOBALS_CSS, ':root') ?? '';
  const found = new Map<string, number>();

  for (const match of root.matchAll(/(--text-[a-z0-9-]+)\s*:\s*(\d+)px\s*;/g)) {
    const [, name, value] = match;
    if (name === undefined || value === undefined) continue;

    found.set(name, Number(value));
  }

  return found;
}

describe('Thang chữ', () => {
  const sizes = scale();

  it('khai đủ tám bậc, tất cả bằng px', () => {
    // Canary: regex hỏng hay khối `:root` cắt sai thì bản đồ rỗng và mọi ca kiểm dưới thành vô nghĩa.
    expect([...sizes.keys()].sort()).toEqual([...ALL_STEPS].sort());
  });

  it('tăng dần đều, không bậc nào bằng hay nhỏ hơn bậc trước', () => {
    const values = ALL_STEPS.map((name) => sizes.get(name));

    expect(values.every((value) => value !== undefined)).toBe(true);

    for (let i = 1; i < values.length; i += 1) {
      const previous = values[i - 1];
      const current = values[i];
      if (previous === undefined || current === undefined) continue;

      expect(current).toBeGreaterThan(previous);
    }
  });

  it.each(BOTTOM_STEPS.slice(1).map((name, index) => [BOTTOM_STEPS[index], name] as const))(
    '%s và %s cách nhau ít nhất 2px — 1px thì mắt không phân biệt được',
    (lower, upper) => {
      const from = sizes.get(lower ?? '');
      const to = sizes.get(upper);

      expect(from).toBeDefined();
      expect(to).toBeDefined();
      if (from === undefined || to === undefined) return;

      expect(to - from).toBeGreaterThanOrEqual(MIN_STEP_PX);
    },
  );
});

/**
 * Nhãn chữ HOA phải tự khai độ đậm.
 *
 * Sinh ra từ một lỗi thật, chủ dự án báo khi xem thẻ mã ở khổ hẹp: `PortfolioScreen.cellLabel`
 * thiếu HẲN `font-weight`, nên nó vẽ ở 400 trong khi `.gainLabel` ngay trên nó và `StatTile.label`
 * ở đầu cùng màn — cùng vai, cùng cỡ `--text-xs`, cùng màu `--color-muted`, cùng viết hoa — đều ở
 * 500. Chữ hoa 12px màu xám ở 400 là tổ hợp mảnh nhất có thể.
 *
 * Không cửa nào bắt được: luật ấy tự nó hợp lệ, `tokens.test.ts` chỉ soi màu, và jsdom không áp
 * CSS nên không ca kiểm nào so được hai file với nhau. Chỉ đặt cạnh nhau mới thấy.
 *
 * Vì sao ràng buộc đúng chữ HOA: `text-transform: uppercase` gần như luôn đi với vai metadata ở
 * `--text-xs`, tức cỡ nhỏ nhất của thang — chỗ mà độ đậm mặc định của trình duyệt tạo khác biệt
 * lớn nhất, và cũng là chỗ dễ quên nhất. Luật chỉ đòi KHAI RA, không ép giá trị nào: `blockTitle`
 * dùng bold, nhãn metadata dùng medium, cả hai đều đạt.
 */
describe('Nhãn chữ hoa', () => {
  const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

  function moduleCssFiles(): string[] {
    return readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
      .filter((name) => name.endsWith('.module.css'))
      .map((name) => join(SRC_DIR, name));
  }

  /** Mọi luật CSS khai `text-transform: uppercase`, kèm chỗ khai. */
  function uppercaseRules(): ReadonlyArray<{ where: string; body: string }> {
    const found: { where: string; body: string }[] = [];

    for (const file of moduleCssFiles()) {
      const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const where = relative(SRC_DIR, file).split('\\').join('/');

      for (const match of css.matchAll(/^(\.[a-zA-Z][\w-]*)[^{]*\{([^}]*)\}/gm)) {
        const [, name, body] = match;
        if (name === undefined || body === undefined) continue;
        if (!/text-transform:\s*uppercase/.test(body)) continue;

        found.push({ where: `${where} ${name}`, body });
      }
    }

    return found;
  }

  const rules = uppercaseRules();

  it('quét được luật chữ hoa để soi', () => {
    // Canary: regex hay glob hỏng thì ca kiểm dưới xanh một cách vô nghĩa.
    expect(rules.length).toBeGreaterThan(5);
  });

  it('luật nào viết hoa cũng khai font-weight, không để rơi về mặc định của trình duyệt', () => {
    const missing = rules
      .filter((rule) => !/font-weight/.test(rule.body))
      .map((rule) => rule.where);

    expect(missing).toEqual([]);
  });
});

/**
 * Chữ PC nhỉnh thêm `--font-bump` (31/10/2026). Chủ dự án: _"phông chữ màn web pc đang hơi nhỏ. tăng
 * 0.5 hoặc 0.4 gì đó trong toàn bộ dự án"_.
 *
 * Hai vế. (1) Khối `@media screen and (min-width: 1024px)` của `globals.css` viết lại đủ tám bậc bằng
 * đúng bậc của `:root` cộng nút, và khai lại `--section-title-size` — thiếu một dòng thì bậc ấy đứng
 * yên ở PC mà không ai thấy, vì jsdom không áp CSS. (2) "Toàn bộ dự án" phải giữ được về sau: một
 * `font-size` ghi số trần (px/rem) áp ở PC mà không cộng nút là một chỗ chữ không nhỉnh theo. Số trần
 * nằm trong khối chỉ dành cho khổ hẹp (`max-width` dưới 1024px) thì không tính; chữ TRONG hình SVG tính
 * bằng đơn vị viewBox, tự to theo khung, nên hai file biểu đồ được miễn; nút "Chú thích" chỉ có dưới
 * 1024px (từ 1024px nó `display: none`).
 */
describe('Chữ PC nhỉnh thêm', () => {
  const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));
  const sizes = scale();

  /** Khối `body` trong `@media screen and (min-width: 1024px)` — chỗ duy nhất khai nút ở PC. */
  function pcBody(): string {
    const media = cssBlock(GLOBALS_CSS, '@media screen and (min-width: 1024px)') ?? '';
    return cssBlock(media, 'body') ?? '';
  }

  it('nút là 0 ở :root và 0,5px ở khối PC', () => {
    const root = cssBlock(GLOBALS_CSS, ':root') ?? '';
    expect(root).toMatch(/--font-bump:\s*0px;/);
    expect(pcBody()).toMatch(/--font-bump:\s*0\.5px;/);
  });

  it.each(ALL_STEPS)('%s ở PC bằng đúng bậc của :root cộng nút', (name) => {
    const goc = sizes.get(name);
    expect(goc).toBeDefined();
    expect(pcBody()).toContain(`${name}: calc(${String(goc)}px + var(--font-bump));`);
  });

  it('khai lại --section-title-size để nó đọc bậc mới', () => {
    expect(pcBody()).toMatch(/--section-title-size:\s*var\(--text-sm\);/);
  });

  /** Chỗ được miễn, kèm lý do ở docblock trên. */
  const MIEN = new Set([
    'ui/charts/chart.module.css',
    'ui/series/CandleChart.module.css',
    'app/cong-thuc/[id]/FormulaNotationCard.module.css .legend > .legendToggle',
  ]);

  /** Mọi `font-size: <số>(px|rem);` áp ở PC: không nằm trong `@media` nào có `max-width` dưới 1024px. */
  function soTranOPc(): string[] {
    const found: string[] = [];
    const files = readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' }).filter((name) =>
      name.endsWith('.css'),
    );

    for (const name of files) {
      const where = name.split('\\').join('/');
      if (where === 'app/globals.css' || MIEN.has(where)) continue;
      const css = readFileSync(join(SRC_DIR, name), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const stack: string[] = [];
      let head = '';

      for (const char of css) {
        if (char === '{') {
          stack.push(head.trim());
          head = '';
        } else if (char === '}') {
          stack.pop();
          head = '';
        } else if (char === ';') {
          const decl = /(?:^|\s)font-size\s*:\s*([\d.]+(?:px|rem))\s*$/.exec(head);
          head = '';
          if (decl === null) continue;
          const chiKhoHep = stack.some((at) => {
            const max = /max-width:\s*([\d.]+)px/.exec(at);
            return at.startsWith('@') && max !== null && Number(max[1]) < 1024;
          });
          if (chiKhoHep) continue;
          const selector = [...stack].reverse().find((s) => !s.startsWith('@')) ?? '?';
          const key = `${where} ${selector.replace(/\s+/g, ' ')}`;
          if (MIEN.has(key)) continue;
          found.push(`${key} → ${decl[1] ?? ''}`);
        } else {
          head += char;
        }
      }
    }

    return found;
  }

  it('không còn cỡ chữ số trần nào áp ở PC mà không cộng nút', () => {
    expect(soTranOPc()).toEqual([]);
  });
});
