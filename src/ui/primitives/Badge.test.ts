import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Giữ huy hiệu ở đúng MỘT chỗ khai — đợt rà soát phân cấp thị giác.
 *
 * Trước đợt này `.badge` được khai lại trong bảy CSS Module, và bốn bản của cùng một huy hiệu
 * "nâng cao" render ra bốn kiểu: `ButtonGroup` đủ cỡ chữ lẫn độ đậm, `RadioGroup` và `Toggle`
 * thiếu độ đậm, `SliderInput` thiếu hẳn cỡ chữ nên to hơn ba cái kia. Không ca kiểm nào bắt
 * được, vì mỗi file tự nó vẫn hợp lệ — chỉ khi đặt cạnh nhau mới thấy lệch.
 *
 * Đọc file nguồn chứ không render, cùng lý do đã ghi ở `Table.test.ts`: CSS Module không được
 * áp trong jsdom nên so cỡ chữ lúc chạy sẽ xanh dù có lệch thật.
 */

const UI_DIR = fileURLToPath(new URL('../..', import.meta.url));

/** Khai một luật `.badge` — đầu dòng, để `.foo .badge` hay chú thích không tính. */
const DECLARES_BADGE = /^\.badge[\s,{]/m;

/** Nơi duy nhất được phép khai. */
const HOME = 'ui/primitives/Badge.module.css';

/** Bốn ô nhập cùng bày huy hiệu "nâng cao" khi biến bị khoá ở chế độ Cơ bản. */
const LOCKED_BADGE_USERS = [
  'ui/inputs/ButtonGroup.tsx',
  'ui/inputs/RadioGroup.tsx',
  'ui/inputs/SliderInput.tsx',
  'ui/inputs/Toggle.tsx',
] as const;

function moduleCssFiles(): string[] {
  return readdirSync(UI_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.module.css'))
    .map((name) => join(UI_DIR, name));
}

function posix(file: string): string {
  return relative(UI_DIR, file).split('\\').join('/');
}

describe('Badge — một chỗ khai duy nhất', () => {
  it('không CSS Module nào ngoài Badge.module.css còn tự khai .badge', () => {
    const files = moduleCssFiles();

    // Canary: glob hỏng thì danh sách rỗng và ca kiểm xanh một cách vô nghĩa.
    expect(files.length).toBeGreaterThan(0);

    const offenders = files
      .filter((file) => DECLARES_BADGE.test(readFileSync(file, 'utf8')))
      .map(posix);

    expect(offenders).toEqual([HOME]);
  });

  it('cả bốn ô nhập bày huy hiệu "nâng cao" qua cùng một primitive', () => {
    for (const name of LOCKED_BADGE_USERS) {
      const source = readFileSync(join(UI_DIR, name), 'utf8');

      expect(source).toContain('<Badge tone="advanced">');
      // Bản cũ: mỗi file một `styles.badge` riêng. Không được quay lại.
      expect(source).not.toContain('styles.badge');
    }
  });

  it('hai danh sách mã dùng chung tone code, nên bề rộng cột mã bằng nhau', () => {
    for (const name of ['ui/sheets/PresetSheet.tsx', 'ui/sheets/TickerPickerSheet.tsx']) {
      const source = readFileSync(join(UI_DIR, name), 'utf8');

      expect(source).toContain('<Badge tone="code">');
      expect(source).not.toContain('styles.badge');
    }
  });
});
