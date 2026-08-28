import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Bốn bậc bo góc, mỗi bậc một vai — đợt rà soát phân cấp thị giác.
 *
 *   `--radius-sm`   6px   chrome nhỏ nằm trong dòng (ô icon, dấu bút chì, dải lãi/lỗ)
 *   `--radius-md`  10px   MỌI điều khiển và MỌI thẻ
 *   `--radius-lg`  16px   chỉ mép trên của bottom sheet
 *   `--radius-pill`       chip và huy hiệu
 *
 * Chỗ hỏng mà bản rà soát bắt được: các điều khiển ĐỨNG CẠNH NHAU trong cùng một hàng lại bo bốn
 * kiểu — ô nhập và ô chọn `lg`, ô tìm kiếm `pill`, ô trong bảng dữ liệu `sm`, còn nút bấm ngay
 * bên cạnh `md`. Không luật nào sai một mình; chỉ đặt cạnh nhau mới thấy.
 *
 * Ca kiểm gác vế dễ trôi nhất: `--radius-lg`. Nó là bậc to nhất nên hay bị với tay lấy cho một
 * cái thẻ "cho nó thoáng", và mỗi lần như thế là thêm một bậc bo nữa trên màn.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Nơi duy nhất `--radius-lg` được phép xuất hiện, kèm lý do. */
const RADIUS_LG_ALLOWED = new Map([
  [
    'ui/primitives/BottomSheet.module.css',
    'mép trên của tấm trượt lên — bo lớn là thứ phân biệt nó với một thẻ thường',
  ],
]);

function moduleCssFiles(): string[] {
  return readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.module.css'))
    .map((name) => join(SRC_DIR, name));
}

function posix(file: string): string {
  return relative(SRC_DIR, file).split('\\').join('/');
}

describe('Bo góc', () => {
  const files = moduleCssFiles();

  it('quét được file để soi', () => {
    // Canary: glob hỏng thì mọi ca kiểm dưới xanh một cách vô nghĩa.
    expect(files.length).toBeGreaterThan(0);
  });

  it('chỉ bottom sheet được dùng --radius-lg', () => {
    const users = files
      .filter((file) => /var\(--radius-lg\)/.test(readFileSync(file, 'utf8')))
      .map(posix);

    expect(users.sort()).toEqual([...RADIUS_LG_ALLOWED.keys()].sort());
  });

  it('mọi mục miễn trừ đều còn cần thiết', () => {
    /*
     * Chống tích tụ: một mục ở lại trong danh sách sau khi file thôi dùng `--radius-lg` sẽ khiến
     * ca kiểm trên hứa nhiều hơn thực tế. Cùng lối `THEME_INVARIANT` của `tokens.test.ts`.
     */
    for (const [name, reason] of RADIUS_LG_ALLOWED) {
      const source = readFileSync(join(SRC_DIR, name), 'utf8');

      expect(source, `${name} — ${reason}`).toMatch(/var\(--radius-lg\)/);
    }
  });

  it('mọi điều khiển nhập liệu bo cùng một bậc', () => {
    const controls: ReadonlyArray<readonly [file: string, className: string]> = [
      ['ui/primitives/Input.module.css', 'control'],
      ['ui/primitives/Select.module.css', 'select'],
      ['ui/primitives/Button.module.css', 'button'],
      ['ui/browse/SearchBox.module.css', 'control'],
      ['app/du-lieu/DataTableScreen.module.css', 'cell'],
    ];

    for (const [file, className] of controls) {
      const css = readFileSync(join(SRC_DIR, file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
      const body = new RegExp(`^\\.${className}\\s*\\{([^}]*)\\}`, 'm').exec(css)?.[1];

      expect(body, `không tìm thấy .${className} trong ${file}`).toBeDefined();
      expect(body, `${file} .${className}`).toMatch(/border-radius:\s*var\(--radius-md\)\s*;/);
    }
  });
});
