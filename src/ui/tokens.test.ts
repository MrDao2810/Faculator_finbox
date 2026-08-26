import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { cssBlock } from './contrast';

/**
 * Giữ token là điểm đổi duy nhất của hệ thiết kế (gói WBS 1.2.1).
 *
 * Mọi màu phải đi qua biến trong globals.css. Có thế thì khi bản Figma về, đổi bảng màu là
 * sửa một file — không phải đi lùng từng component. Test này chặn màu viết thẳng lọt vào
 * CSS Module, cùng cách làm với contrast.test.ts: đọc file thật, không thêm dependency.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

const GLOBALS_CSS = readFileSync(
  fileURLToPath(new URL('../app/globals.css', import.meta.url)),
  'utf8',
);

/** Bộ chọn bật bảng tối. Cùng chuỗi với globals.css và với contrast.test.ts. */
const DARK_SELECTOR = "[data-theme='dark']";

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
  'refLabel',
] as const;

/** Tên biến khai trong một khối luật, bất kể giá trị là mã màu, `rgba()` hay chuỗi đổ bóng. */
function declaredNames(block: string | null): Set<string> {
  if (block === null) return new Set();
  return new Set([...block.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((match) => match[1] as string));
}

/** Tên biến được `var()` gọi tới trong một chuỗi CSS. */
function usedNames(css: string): Set<string> {
  return new Set([...css.matchAll(/var\(\s*(--[a-z0-9-]+)/g)].map((match) => match[1] as string));
}

/**
 * Biến KHÔNG khai trong globals.css mà vẫn hợp lệ, kèm lý do.
 * `--fill` do `SliderInput.tsx` đặt inline theo giá trị hiện tại, nên nó không thể là token chung.
 */
const LOCAL_VARIABLES = new Set(['--fill']);

/**
 * Gọi `var()` tới một biến chưa ai khai thì CSS lặng thinh: thuộc tính coi như không hợp lệ, và
 * chỗ đó rơi về giá trị thừa kế hoặc trong suốt. Không lỗi, không cảnh báo, chỉ là màu sai.
 *
 * Đã xảy ra thật ba lần và cả ba đều sống nhiều đợt: `--color-bg` (nền `<dialog>` xem biểu đồ
 * toàn màn hình — trong suốt, chỉ "trông ổn" vì trang phía sau màu trắng), `--color-ink-muted` và
 * `--color-surface-muted` (ô nhóm chỉ-Nâng-cao ở CategoryGrid). Bảng màu tối là thứ làm cả ba lộ ra.
 */
describe('mọi biến CSS Module gọi tới đều được khai', () => {
  const declared = declaredNames(cssBlock(GLOBALS_CSS, ':root'));

  it('globals.css khai được ít nhất vài chục biến — test này không được rỗng mà vẫn xanh', () => {
    expect(declared.size).toBeGreaterThan(30);
  });

  for (const file of moduleCssFiles()) {
    const relative = file.slice(SRC_DIR.length).replace(/\\/g, '/');

    it(`${relative} không gọi biến lạ`, () => {
      const unknown = [...usedNames(readFileSync(file, 'utf8'))]
        .filter((name) => !declared.has(name))
        .filter((name) => !LOCAL_VARIABLES.has(name));

      expect(unknown, 'khai biến trong :root của globals.css, hoặc sửa lại tên gọi').toEqual([]);
    });
  }
});

/**
 * Bảng tối phải đè ĐỦ, nếu không thì token bỏ sót giữ nguyên giá trị của bảng sáng — một mảng
 * màu giấy nằm giữa nền tối, hoặc chữ thẫm trên nền thẫm.
 *
 * `contrast.test.ts` chấm tương phản của những token nó biết tên; cửa này lo phần khác: token
 * MỚI thêm về sau. Không có nó thì người thêm token chỉ cần quên khối tối là hỏng lặng lẽ, vì
 * bộ kiểm tương phản không có cách nào biết rằng có một token vừa ra đời.
 */
describe('bảng tối đè đủ token màu của bảng sáng', () => {
  /** Token cố ý KHÔNG đổi theo giao diện, kèm lý do. */
  const THEME_INVARIANT = new Map([
    ['--color-brand-from', 'mảng màu của logo — đổi bảng màu giao diện không kéo logo đổi theo'],
    ['--color-brand-to', 'cùng lý do với --color-brand-from'],
  ]);

  /** Token không phải màu thuần nhưng nhúng cứng màu bên trong, nên vẫn phải viết lại. */
  const COLOUR_DERIVED = ['--shadow-sm', '--shadow-md', '--focus-ring', '--shadow-highlight'];

  const light = declaredNames(cssBlock(GLOBALS_CSS, ':root'));
  const dark = declaredNames(cssBlock(GLOBALS_CSS, DARK_SELECTOR));

  it('có khối bảng tối trong globals.css', () => {
    expect(dark.size).toBeGreaterThan(0);
  });

  it('mọi --color-* của bảng sáng đều có bản tối', () => {
    const missing = [...light]
      .filter((name) => name.startsWith('--color-'))
      .filter((name) => !THEME_INVARIANT.has(name))
      .filter((name) => !dark.has(name));

    expect(missing, `thêm vào khối ${DARK_SELECTOR}, hoặc ghi lý do vào THEME_INVARIANT`).toEqual(
      [],
    );
  });

  it('đổ bóng và vòng focus cũng có bản tối — chúng nhúng cứng màu mực', () => {
    expect(COLOUR_DERIVED.filter((name) => !dark.has(name))).toEqual([]);
  });

  it('token miễn trong danh sách vẫn còn tồn tại — danh sách không được mục ruỗng', () => {
    expect([...THEME_INVARIANT.keys()].filter((name) => !light.has(name))).toEqual([]);
  });

  it('bảng tối không khai token nào mà bảng sáng không có', () => {
    expect([...dark].filter((name) => !light.has(name))).toEqual([]);
  });
});

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
