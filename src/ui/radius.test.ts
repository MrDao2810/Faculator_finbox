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
 *   `--radius-pill`       chip
 *   `8px` (số trần)       khay tab · nhóm Cơ bản / Nâng cao
 *   `5px` (số trần)       huy hiệu cấp độ · hàng điều khiển biểu đồ: nhóm nút Đường/Cột (khung lẫn
 *                         nút) và ô chọn trục đứng cạnh nó
 *
 * Hai bậc số trần KHÔNG có trên thang, và đó là chuyện có thật chứ không phải thiếu sót — đều do
 * chủ dự án chốt sau khi nhìn màn thật. Khay `TabBar` xuống 8 (09/09/2026) và nhóm Cơ bản / Nâng
 * cao theo sau (10/09/2026, từ `--radius-pill`); huy hiệu xuống 8 rồi
 * hạ tiếp còn 5 cùng ngày, vì nó chỉ cao 17–20px nên bo 8 ở đó đã xấp xỉ NỬA chiều cao — mà nửa
 * chiều cao chính là định nghĩa của viên thuốc, nên "8" không hiện ra thành góc bo. Nhóm nút
 * Đường/Cột về 5 ngày 10/09/2026, _"bên ngoài và bên trong cần đồng bộ đều bằng 5"_ — nút trong lấy
 * số bằng `inherit` nên chỉ có MỘT chỗ khai; rồi ô chọn trục đứng cạnh nó theo sau cùng ngày,
 * _"điều chỉnh bo bên trái bằng với bo bên phải"_. Tiền lệ viết số trần có từ `Highlight.module.css`.
 *
 * Đừng dựng token cho hai số này. Số 8 phục vụ đúng một họ điều khiển; số 5 có hai cụm dùng — huy
 * hiệu, và HÀNG điều khiển biểu đồ (ô chọn + nhóm nút là một hàng, chốt để chúng bằng nhau chứ
 * không phải hai lần chọn) — mỗi cụm là một lần chủ dự án chốt bằng mắt cho riêng nó, không phải
 * một bậc chung được chọn rồi áp xuống. Có cụm thứ ba KHÔNG cùng hàng với hai cụm này thì mới là
 * lúc bàn chuyện đưa 5 lên thang. Muốn kéo về thang thì `--radius-sm` (6px) chỉ cách 1px — đó là
 * chỗ để về.
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

  /*
   * Bo 5px — bậc không có trên thang, nên mỗi chỗ dùng phải có ca kiểm giữ.
   *
   * Hai dòng huy hiệu: bảng này từng có ba, `FormulaDetail.module.css .level` là bản chép thứ hai
   * của huy hiệu, mang bộ màu riêng cho màn chi tiết. Đợt đổ nền xanh/cam (09/09/2026) gộp nó về
   * `<Badge>`, nên bản chép ấy KHÔNG còn và dòng thứ ba đi theo. Đây là bảng thu hẹp vì hết việc,
   * không phải vì ai đó bỏ bớt: `.level` nay chỉ còn `vertical-align` + `white-space`.
   *
   * Dòng `kindGroup` là khung của nhóm nút Đường/Cột (10/09/2026). Chỉ ghim KHUNG ở đây: nút bên
   * trong không khai số mà lấy `inherit`, và ca kiểm riêng bên dưới giữ đúng điều đó — ghim cả hai
   * bằng `5px` là mời hai chỗ khai cùng một con số.
   *
   * Dòng `picker select` là ô chọn trục đứng cạnh nhóm nút ấy, cùng ngày — hai điều khiển một hàng
   * phải bo cùng số. Đây là bộ chọn ghép (lớp + thẻ), không phải tên lớp: `ruleBodyFor` nhận nguyên
   * chuỗi bộ chọn nên vẫn tìm đúng luật. Nó KHÔNG lấy `inherit` được như nút trong khay — ô chọn và
   * nhóm nút là hai anh em, không phải cha con — nên đây là chỗ khai thứ hai của số 5 trong hàng,
   * và ca kiểm này là thứ giữ hai chỗ ấy không trôi khỏi nhau.
   */
  const BO_5PX: ReadonlyArray<readonly [file: string, selector: string]> = [
    ['ui/primitives/Badge.module.css', 'basic'],
    ['ui/primitives/Badge.module.css', 'advanced'],
    ['ui/charts/ChartKindToggle.module.css', 'kindGroup'],
    ['ui/charts/chart.module.css', 'picker select'],
  ];

  /**
   * Thân luật theo BỘ CHỌN, chịu được cả bộ chọn ghép (`.basic, .advanced { … }`). Tham số là tên
   * lớp không có dấu chấm — có thể kèm phần đuôi (`picker select` → `.picker select`).
   */
  function ruleBodyFor(css: string, className: string): string | null {
    const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');

    for (const match of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selectors = (match[1] ?? '').split(',').map((part) => part.trim());
      if (selectors.includes(`.${className}`)) return match[2] ?? '';
    }

    return null;
  }

  it.each(BO_5PX)('%s .%s — bo 5px, bậc trần ngoài thang', (file, className) => {
    const body = ruleBodyFor(readFileSync(join(SRC_DIR, file), 'utf8'), className);

    expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
    expect(body ?? '', `${file} .${className}`).toMatch(/border-radius:\s*5px\s*;/);
  });

  /*
   * Bo 8px — bậc thứ hai ngoài thang, nay có HAI chỗ dùng.
   *
   * Khay `TabBar` xuống 8 ngày 09/09/2026; nhóm Cơ bản / Nâng cao (`ModeToggle`) theo sau ngày
   * 10/09/2026 — _"sửa lại bo bên ngoài lẫn bên trong giảm xuống bo 8"_, trước đó nó là
   * `--radius-pill` tức bo tròn hẳn hai đầu.
   *
   * Hai chỗ trùng số là hợp lẽ chứ không phải trùng lặp cần gom: cùng một họ điều khiển (khay chứa
   * mấy nút chọn-một-trong-nhiều), và mỗi lần đều là chủ dự án chốt bằng mắt cho riêng cụm ấy. Có
   * chỗ dùng thứ ba mà KHÔNG cùng họ thì mới là lúc bàn đưa 8 lên thang.
   *
   * Chỉ ghim KHUNG: nút bên trong lấy `inherit`, và ca kiểm ngay dưới giữ đúng điều đó.
   */
  const BO_8PX: ReadonlyArray<readonly [file: string, className: string]> = [
    ['ui/primitives/TabBar.module.css', 'tabs'],
    ['ui/navigation/ModeToggle.module.css', 'group'],
  ];

  it.each(BO_8PX)('%s .%s — bo 8px, bậc trần ngoài thang', (file, className) => {
    const body = ruleBodyFor(readFileSync(join(SRC_DIR, file), 'utf8'), className);

    expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
    expect(body ?? '', `${file} .${className}`).toMatch(/border-radius:\s*8px\s*;/);
  });

  /*
   * Nút trong khay lấy bo từ khay bằng `inherit` — một chỗ khai, không thể lệch.
   *
   * Cùng lý lẽ với nút Đường/Cột ngay dưới, và bắt đúng lúc ai đó "sửa cho rõ" bằng cách ghi thẳng
   * số vào nút — lúc ấy hai bậc bo lại có thể trôi khỏi nhau.
   */
  it.each([
    ['ui/primitives/TabBar.module.css', 'tab'],
    ['ui/navigation/ModeToggle.module.css', 'option'],
  ] as ReadonlyArray<readonly [file: string, className: string]>)(
    '%s .%s — lấy bo góc từ khay bằng inherit',
    (file, className) => {
      const body = ruleBodyFor(readFileSync(join(SRC_DIR, file), 'utf8'), className);

      expect(body, `không tìm thấy luật .${className} trong ${file}`).not.toBeNull();
      expect(body ?? '', `${file} .${className}`).toMatch(/border-radius:\s*inherit\s*;/);
    },
  );

  it('nút Đường/Cột lấy bo góc từ khung bằng inherit — một chỗ khai, không thể lệch', () => {
    /*
     * Chủ dự án chốt "bên ngoài và bên trong cần đồng bộ". Cách giữ đồng bộ bền nhất không phải hai
     * dòng `5px` giống nhau mà là MỘT dòng và một `inherit` — cùng lối `.tab` của `TabBar.module.css`.
     * Ca này bắt đúng lúc ai đó "sửa cho rõ" bằng cách ghi thẳng số vào nút.
     */
    const body = ruleBodyFor(
      readFileSync(join(SRC_DIR, 'ui/charts/ChartKindToggle.module.css'), 'utf8'),
      'kindOption',
    );

    expect(body, 'không tìm thấy luật .kindOption').not.toBeNull();
    expect(body ?? '').toMatch(/border-radius:\s*inherit\s*;/);
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
