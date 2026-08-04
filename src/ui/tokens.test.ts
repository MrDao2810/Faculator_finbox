import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Giữ token là điểm đổi duy nhất của hệ thiết kế (gói WBS 1.2.1).
 *
 * Mọi màu phải đi qua biến trong globals.css. Có thế thì khi bản Figma về, đổi bảng màu là
 * sửa một file — không phải đi lùng từng component. Test này chặn màu viết thẳng lọt vào
 * CSS Module, cùng cách làm với contrast.test.ts: đọc file thật, không thêm dependency.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

/** Màu viết thẳng: mã hex, rgb(), hsl(), và vài tên màu hay bị gõ theo thói quen. */
const HARDCODED_COLOR =
  /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|:\s*(white|black|red|green|blue|gray|grey)\b/;

function moduleCssFiles(): string[] {
  return readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.module.css'))
    .map((name) => join(SRC_DIR, name));
}

/**
 * `--color-accent-vivid` là cam rực, chỉ đạt ngưỡng 3:1 của ranh giới điều khiển chứ không đạt
 * 4,5:1 của chữ. Nó tồn tại để làm mảng màu — vạch chỉ báo, dấu hiệu thương hiệu, đường biểu đồ.
 * Gán vào `color` là phá NFR-USA-06, nên chặn ngay ở đây thay vì trông chờ người review nhớ.
 * Khớp cả `color:` lẫn `-webkit-text-fill-color:`, nhưng bỏ qua `background-color`/`border-color`:
 * ký tự ngay trước phải là đầu dòng, `;`, `{` hoặc khoảng trắng — không phải dấu `-`.
 */
const VIVID_AS_TEXT =
  /(?:^|[;{\s])(?:-webkit-text-fill-)?color\s*:\s*var\(\s*--color-accent-vivid/m;

describe('CSS Module chỉ dùng token màu', () => {
  const files = moduleCssFiles();

  it('tìm thấy file CSS Module để kiểm — test này không được rỗng mà vẫn xanh', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('không file nào dùng --color-accent-vivid làm màu chữ', () => {
    const offenders = files.filter((file) => VIVID_AS_TEXT.test(readFileSync(file, 'utf8')));

    expect(
      offenders.map((f) => f.slice(SRC_DIR.length).replace(/\\/g, '/')),
      'cam rực chỉ dùng cho mảng màu; chữ phải dùng var(--color-accent)',
    ).toEqual([]);
  });

  for (const file of files) {
    const relative = file.slice(SRC_DIR.length).replace(/\\/g, '/');

    it(`${relative} không có màu viết thẳng`, () => {
      const offenders = readFileSync(file, 'utf8')
        .split('\n')
        .map((line, index) => ({ line: line.trim(), number: index + 1 }))
        .filter(({ line }) => !line.startsWith('*') && !line.startsWith('/*'))
        .filter(({ line }) => HARDCODED_COLOR.test(line));

      expect(
        offenders.map((o) => `dòng ${o.number}: ${o.line}`),
        'dùng var(--color-…) thay vì viết thẳng mã màu',
      ).toEqual([]);
    });
  }
});
