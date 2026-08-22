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

function tsxFiles(): string[] {
  return readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
    .map((name) => join(SRC_DIR, name));
}

/**
 * Màu viết thẳng vào thuộc tính SVG — lỗ mà phần kiểm CSS Module không với tới.
 *
 * Nhánh biểu đồ mở ra đường rò này: `<circle fill="#3b7bf0">` trong một file `.tsx` không phải CSS
 * Module nên không ai gác, và bảng màu lại có hai chỗ đổi thay vì một. Quy tắc của dự án là mọi
 * màu đi qua `className`, và ca kiểm dưới đây làm nó thành ràng buộc thật.
 *
 * `fill="none"`, `stroke="currentColor"` và `fill={`url(#…)`}` vẫn đạt — chúng không phải màu.
 */
const SVG_HARDCODED_COLOR =
  /(?:fill|stroke|stopColor|stop-color)\s*=\s*["'{]\s*(?:#|rgba?\(|hsla?\()/;

/**
 * `--color-accent-vivid` là xanh rực, chỉ đạt ngưỡng 3:1 của ranh giới điều khiển chứ không đạt
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
      'xanh rực chỉ dùng cho mảng màu; chữ phải dùng var(--color-accent)',
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

describe('SVG nội tuyến cũng chỉ dùng token màu', () => {
  const files = tsxFiles();

  it('tìm thấy file .tsx để kiểm — test này không được rỗng mà vẫn xanh', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const relative = file.slice(SRC_DIR.length).replace(/\\/g, '/');

    it(`${relative} không đặt màu trong thuộc tính SVG`, () => {
      const offenders = readFileSync(file, 'utf8')
        .split('\n')
        .map((line, index) => ({ line: line.trim(), number: index + 1 }))
        .filter(({ line }) => !line.startsWith('*') && !line.startsWith('//'))
        .filter(({ line }) => SVG_HARDCODED_COLOR.test(line));

      expect(
        offenders.map((o) => `dòng ${o.number}: ${o.line}`),
        'màu phải đi qua className rồi var(--color-…), không viết vào fill/stroke',
      ).toEqual([]);
    });
  }
});

/**
 * `fill` của thẻ `<text>` trong SVG chính là màu CHỮ, nên nó phải theo cùng luật với `color`:
 * `--color-accent-vivid` chỉ đạt 3:1 nên không được dùng.
 *
 * Danh sách lớp dưới đây là những lớp đang gán cho `<text>`. Thêm lớp chữ mới thì thêm tên vào đây
 * — chưa có cách nào biết từ CSS rằng một lớp nhắm vào `<text>` hay vào `<path>`.
 */
const SVG_TEXT_CLASSES = [
  'tick',
  'axisTitle',
  'markerLabel',
  'caption',
  'valueLabel',
  'hoverLabel',
  'barValueLabel',
] as const;

describe('chữ trong SVG không dùng màu chỉ đạt 3:1', () => {
  for (const name of SVG_TEXT_CLASSES) {
    it(`.${name} không lấy --color-accent-vivid làm màu chữ`, () => {
      const pattern = new RegExp(
        `\\.${name}[^{]*\\{[^}]*fill:\\s*var\\(\\s*--color-accent-vivid`,
        's',
      );
      const offenders = moduleCssFiles().filter((file) => pattern.test(readFileSync(file, 'utf8')));

      expect(
        offenders.map((f) => f.slice(SRC_DIR.length).replace(/\\/g, '/')),
        'xanh rực chỉ dùng cho nét vẽ; chữ phải dùng var(--color-muted) hoặc var(--color-ink)',
      ).toEqual([]);
    });
  }
});
