import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Cửa gác cho `--color-hairline` — bậc kẻ mảnh nhất, thêm ở đợt lấy mã màu bản Figma
 * "FINBOX VERSION 2" (#f2f2f2 bảng sáng · #232c3e bảng tối).
 *
 * ## Vì sao cần một ca kiểm riêng
 *
 * Ba bậc kẻ của dự án phân biệt nhau bằng VAI, không bằng độ đậm — mà vai thì không đọc được từ mã
 * màu. Người sau nhìn thấy hai token gần giống nhau rất dễ "dọn cho nhất quán", và hậu quả KHÔNG có
 * cửa nào khác bắt được: `contrast.test.ts` chỉ chấm 3:1 cho `--color-border-strong` với
 * `--color-focus`, còn `--color-border`/`--color-hairline` chỉ bị kiểm là CÓ MẶT. Đổi sai thì CI
 * xanh trọn trong khi thẻ biến mất khỏi trang.
 *
 * Số đo tại thời điểm chốt (bảng sáng): hairline #f2f2f2 trên nền thẻ trắng đạt 1,12:1, còn
 * border #d7dee9 đạt 1,35:1. Chênh nhau chưa tới 0,25 — đủ nhỏ để không ai nhận ra bằng mắt khi
 * review một diff, đủ lớn để một viền thẻ 1,07:1 trên nền trang biến mất.
 */

const SRC_DIR = fileURLToPath(new URL('..', import.meta.url));

function moduleCssFiles(): string[] {
  return readdirSync(SRC_DIR, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.module.css'))
    .map((name) => join(SRC_DIR, name));
}

/** Đường dẫn tương đối, dấu gạch chéo xuôi — để thông báo lỗi giống nhau trên mọi máy. */
function rel(path: string): string {
  return relative(SRC_DIR, path).replace(/\\/g, '/');
}

/**
 * Cắt từng luật CSS phẳng thành cặp (bộ chọn, thân).
 *
 * Đủ cho thư mục này: 67 CSS Module đều viết phẳng, không lồng. `[^{}]` ở cả hai vế là thứ giữ cho
 * nó không vắt qua một luật khác — cùng lối thận trọng mà `cssBlock()` của `contrast.ts` đã dùng.
 *
 * BỎ CHÚ THÍCH TRƯỚC KHI CẮT, và đây không phải chuyện làm cho sạch: docblock của dự án hay nằm
 * ngay trên luật nó giải thích, mà `[^{}]+` thì nuốt trọn cả khối chú thích ấy vào phần bộ chọn.
 * Bản đầu của ca kiểm này đỏ đúng vì thế — `.holdRow` bóc ra thành cả đoạn văn kèm `.holdRow`.
 * Cùng bài học đã ghi ở `section-title.test.ts` và `CategoryGrid.test.ts`.
 */
function rules(css: string): Array<{ selector: string; body: string }> {
  const found: Array<{ selector: string; body: string }> = [];
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(stripped)) !== null) {
    found.push({
      selector: (match[1] ?? '').trim().replace(/\s+/g, ' '),
      body: match[2] ?? '',
    });
  }

  return found;
}

/** Viền một phía — dáng của một KẺ CHIA. */
const ONE_SIDED = /border-(?:top|bottom|left|right)\s*:[^;]*var\(\s*--color-([a-z-]+)\s*\)/g;

/** Viền đủ bốn phía — dáng của một RANH GIỚI, dù viết tắt hay viết đủ. */
const ALL_SIDED = /(?:^|[;{\s])border\s*:[^;]*var\(\s*--color-([a-z-]+)\s*\)/gm;

describe('--color-hairline chỉ làm kẻ chia, không làm ranh giới', () => {
  /*
   * Hairline không đứng vững một mình: 1,12:1 trên nền thẻ, 1,07:1 trên nền trang. Nó chỉ dùng
   * được khi ĐÃ có một viền ngoài lo phần ranh giới. Dùng nó cho `border:` bốn phía nghĩa là chính
   * nó đang phải làm ranh giới — đúng thứ nó không làm nổi.
   */
  it('không CSS Module nào dùng nó cho viền bốn phía', () => {
    const viPham: string[] = [];

    for (const file of moduleCssFiles()) {
      const css = readFileSync(file, 'utf8');
      for (const { selector, body } of rules(css)) {
        for (const match of body.matchAll(ALL_SIDED)) {
          if (match[1] === 'hairline') viPham.push(`${rel(file)} → ${selector}`);
        }
      }
    }

    expect(viPham, 'hairline quá mảnh để làm ranh giới — dùng --color-border cho viền thẻ').toEqual(
      [],
    );
  });

  /*
   * #f2f2f2 SÁNG HƠN `--color-sunken` (#e8edf4): đặt lên nhau thì viền đọc ra là quầng sáng chứ
   * không phải mép. Đây là cái bẫy khó thấy nhất của đợt tách token, vì nó chỉ lộ ra ở đúng những
   * khối có nền chìm — `<th>` của bảng, chip "Gán cột", dải miễn trừ.
   */
  it('không dùng nó trên chính khối có nền chìm — ở đó nó đảo chiều', () => {
    const viPham: string[] = [];

    for (const file of moduleCssFiles()) {
      const css = readFileSync(file, 'utf8');
      for (const { selector, body } of rules(css)) {
        const coHairline = /var\(\s*--color-hairline\s*\)/.test(body);
        const nenChim = /background(?:-color)?\s*:[^;]*var\(\s*--color-sunken\s*\)/.test(body);
        if (coHairline && nenChim) viPham.push(`${rel(file)} → ${selector}`);
      }
    }

    expect(viPham, 'hairline sáng hơn --color-sunken nên sẽ thành quầng sáng').toEqual([]);
  });
});

/**
 * Bảy kẻ chia CỐ Ý ở lại `--color-border`, mỗi cái một lý do.
 *
 * Ghim danh sách chứ không chỉ đếm: đếm thì đổi một chỗ rồi thêm một chỗ khác là hoà, và ca kiểm
 * im lặng. Cùng lối với danh sách id trong `chart.test.ts` — một mục mới không được lọt qua mà
 * không có người xem xét.
 *
 * Ai muốn hạ một trong bảy dòng này xuống hairline thì phải sửa cả danh sách, và lúc đó sẽ đọc
 * đúng lý do vì sao nó ở đây.
 */
const GIU_COLOR_BORDER: ReadonlyArray<readonly [file: string, selector: string, lyDo: string]> = [
  [
    'app/danh-muc/PortfolioScreen.module.css',
    '.holdRow',
    'Kẻ chia giữa hai mã. Mỗi dòng là một đích bấm cao 44px và không có nền xen kẽ, nên đường kẻ là thứ DUY NHẤT tách chúng.',
  ],
  [
    'ui/browse/SearchResults.module.css',
    '.row',
    'Cùng cảnh với .holdRow: các dòng kết quả tìm đều bấm được, mất kẻ là dính thành một khối chữ.',
  ],
  [
    'ui/navigation/AppHeader.module.css',
    '.header',
    'Mép dưới của thanh trên DÍNH (position: sticky), nền surface. Đường kẻ này là thứ duy nhất tách nó khỏi nội dung đang cuộn phía dưới.',
  ],
  [
    'ui/navigation/BottomTabBar.module.css',
    '.bar',
    'Mép trên của thanh tab dưới, cùng cảnh dính với AppHeader.',
  ],
  [
    'ui/navigation/DisclaimerBar.module.css',
    '.bar',
    'Nền của chính nó là --color-sunken, mà hairline sáng hơn nền chìm nên sẽ đảo chiều.',
  ],
  [
    'ui/sheets/PasteImportSheet.module.css',
    '.preview thead th',
    'Nền --color-sunken, cùng lý do đảo chiều. Phần tbody td bên dưới thì đã chuyển sang hairline — hai bậc kẻ khác nhau ở đây là CỐ Ý, đầu bảng đậm hơn thân bảng.',
  ],
  [
    'app/du-lieu/DataTableScreen.module.css',
    '.table th',
    'Nền --color-sunken, cùng lý do. Cũng cùng cặp đầu-bảng/thân-bảng với PasteImportSheet.',
  ],
];

describe('kẻ chia cố ý ở lại --color-border', () => {
  it('đúng bảy chỗ, không thừa không thiếu', () => {
    const thucTe: string[] = [];

    for (const file of moduleCssFiles()) {
      const css = readFileSync(file, 'utf8');
      for (const { selector, body } of rules(css)) {
        for (const match of body.matchAll(ONE_SIDED)) {
          if (match[1] === 'border') thucTe.push(`${rel(file)} → ${selector}`);
        }
      }
    }

    const mongDoi = GIU_COLOR_BORDER.map(([file, selector]) => `${file} → ${selector}`);

    expect(
      [...thucTe].sort(),
      'thêm/bớt một kẻ chia dùng --color-border thì cập nhật GIU_COLOR_BORDER kèm lý do',
    ).toEqual([...mongDoi].sort());
  });

  it('mỗi mục đều có lý do viết ra, không để trống cho qua', () => {
    for (const [file, selector, lyDo] of GIU_COLOR_BORDER) {
      expect(lyDo.length, `${file} → ${selector}`).toBeGreaterThan(40);
    }
  });
});
