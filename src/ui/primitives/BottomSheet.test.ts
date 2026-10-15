import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Giữ dạng "cao cố định" của bottom sheet — `size="tall"`.
 *
 * Đọc file nguồn chứ không render, cùng lý do đã ghi ở `Table.test.ts`: CSS Module không được áp
 * trong jsdom và mọi phần tử đều cao 0, nên một ca kiểm đo chiều cao sẽ xanh ở cả hai phía.
 *
 * ── Con bọ mà nó sinh ra để chặn ──────────────────────────────────────────────────────────────
 *
 * Sheet chọn mã có ô lọc NẰM NGAY TRONG THÂN nó. Mở ra là 60 dòng nên tấm chạm trần 88dvh; gõ
 * "vnm" còn một dòng, và một tấm co theo nội dung tụt xuống chừng hai đốt ngón tay ngay giữa lúc
 * người dùng đang gõ — ô tìm kiếm chạy khỏi chỗ ngón tay vừa đặt. Đó là lỗi chủ dự án báo
 * 14/09/2026.
 *
 * Hai vế phải khớp nhau thì mới hết bọ, mà không vế nào tự nói ra vế kia:
 *
 * 1. `.panelTall` phải ghim `height` ĐÚNG bằng trần `max-height` của `.panel`. Lệch xuống thì
 *    tấm không bao giờ chạm trần, danh sách đầy đủ mất một dải chỗ mà không ai biết vì sao.
 *    Lệch lên thì `max-height` cắt lại — không vỡ, nhưng con số viết ra thành nói dối, và người
 *    sau sửa trần sẽ không hiểu vì sao tấm không cao thêm. Cả hai chiều đều là trôi âm thầm, nên
 *    ghim bằng nhau và bắt sửa cả hai cùng lúc.
 * 2. MỌI sheet có ô lọc trong thân phải THẬT SỰ truyền `size="tall"`. Prop có mặc định `'auto'`,
 *    nên quên truyền là lỗi quay lại trong im lặng — không typecheck nào đỏ. Quét cả thư mục chứ
 *    không ghim hai cái tên: sheet thứ ba mọc ra ngày nào đó cũng phải qua cửa này, mà người viết
 *    nó thì không có lý do gì để đọc file test của một primitive.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./BottomSheet.module.css', import.meta.url)),
  'utf8',
);

const SHEETS_DIR = fileURLToPath(new URL('../sheets/', import.meta.url));

/**
 * Sheet có Ô LỌC trong thân — dấu nhận: dựng `<BottomSheet` và có một `type="search"`.
 *
 * Bám vào `type="search"` chứ không vào mọi `<input>`: thứ sinh ra con bọ là ô LỌC, tức ô mà mỗi
 * ký tự gõ vào lại đổi số dòng bên dưới. `PasteImportSheet` có một `<textarea>` và vẫn co theo
 * nội dung — đúng, vì ở đó không có danh sách nào co lại dưới tay người dùng.
 */
function sheetsCoOLoc(): Array<{ file: string; source: string }> {
  return readdirSync(SHEETS_DIR)
    .filter((name) => name.endsWith('.tsx') && !name.endsWith('.test.tsx'))
    .map((name) => ({ file: name, source: readFileSync(join(SHEETS_DIR, name), 'utf8') }))
    .filter(({ source }) => source.includes('<BottomSheet') && source.includes('type="search"'));
}

/** Bỏ chú thích trước khi soi — docblock ở đây nhắc thẳng tên lớp và cả con số. */
const RULES = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân của một luật phẳng, theo tên lớp. */
function ruleBody(className: string): string {
  const match = new RegExp(`\\.${className}\\s*\\{([^{}]*)\\}`).exec(RULES);
  if (match === null)
    throw new Error(`Không thấy luật .${className} trong BottomSheet.module.css.`);
  return match[1] ?? '';
}

function declaration(body: string, property: string): string | null {
  const match = new RegExp(`(?:^|;)\\s*${property}\\s*:\\s*([^;]+)`).exec(body);
  return match?.[1]?.trim() ?? null;
}

describe('BottomSheet — dạng cao cố định', () => {
  it('`.panelTall` ghim đúng chiều cao trần của `.panel`, không lệch bên nào', () => {
    const tran = declaration(ruleBody('panel'), 'max-height');
    const ghim = declaration(ruleBody('panelTall'), 'height');

    expect(tran, 'trần của .panel biến mất — sheet không còn chừa dải nền phía trên').toBe('88dvh');
    expect(ghim, 'đổi một trong hai thì phải đổi cả hai — xem docblock ở đầu file').toBe(tran);
  });

  it('dùng dvh chứ không vh — bàn phím điện thoại bật lên là khung nhìn đổi', () => {
    /*
     * `vh` tính theo khung nhìn lúc thanh địa chỉ đã thu, nên trên điện thoại một tấm `88vh`
     * cao hơn chỗ thật sự có. Với sheet CO THEO NỘI DUNG thì không ai thấy, vì nó hiếm khi chạm
     * trần; ghim chiều cao rồi thì lượt nào cũng chạm. Cùng bài học đã ghi ở `chart.module.css`.
     */
    expect(declaration(ruleBody('panelTall'), 'height')).toMatch(/dvh$/);
  });

  it('mọi sheet có ô lọc đều bật dạng ấy — prop có mặc định nên quên là im lặng', () => {
    const quen = sheetsCoOLoc()
      .filter(({ source }) => !/size="tall"/.test(source))
      .map(({ file }) => file);

    expect(
      quen,
      'ô lọc nằm trong thân sheet: thiếu size="tall" là tấm lại co theo từng ký tự gõ',
    ).toEqual([]);
  });

  it('phép quét tìm được sheet thật — canary', () => {
    /*
     * Đổi `type="search"` sang một primitive, hay dọn thư mục `sheets/` sang chỗ khác, đều làm
     * phép lọc trên trả về mảng rỗng — và ca kiểm trước xanh một cách vô nghĩa. Hai cái tên dưới
     * đây là hai sheet đang có ô lọc tại thời điểm chốt; thêm bớt thì sửa cả danh sách.
     */
    expect(
      sheetsCoOLoc()
        .map(({ file }) => file)
        .sort(),
    ).toEqual(['FormulaForTickerSheet.tsx', 'TickerPickerSheet.tsx']);
  });
});

/**
 * ── Khổ web: tấm dán đáy tự nổi giữa màn (13/10/2026) ────────────────────────────────────────
 *
 * Từ 1024px mọi tấm không truyền `placement` phải trông Y HỆT dạng `center`. CSS không viết chung
 * được một luật cho "khổ từ 1024" (sống trong `@media`) và "`placement="center"`" (sống trong tên
 * lớp), nên khối `@media` ở cuối file là một BẢN CHÉP — và bản chép thì trôi. Sửa khoảng đệm của
 * hộp thoại Danh mục mà quên khối ấy là sheet chọn mã ở màn chi tiết lệch với chính nó ở màn Danh
 * mục, hai màn cách nhau một cú bấm.
 *
 * Các ca dưới gác đúng những chỗ bản chép có thể hỏng mà không trình duyệt nào kêu.
 *
 * Hằng `MOC_WEB` ghim luôn chữ `screen`: vùng in của sheet Tải về nằm trong `<dialog>` này, và A4
 * ngang rộng 1123px. Bỏ `screen` đi thì ca kiểm ném "Không thấy khối" — đúng lúc bản in ngang sắp
 * đổi hình mà không ai hay (đo bằng `Page.printToPDF`: file 73 kB thành 172 kB).
 */

const MOC_WEB = '@media screen and (min-width: 1024px)';

/** Cắt khối `@media` của khổ web ra khỏi phần còn lại — đếm ngoặc, vì bên trong nó còn luật con. */
function tachKhoiWeb(): { trong: string; ngoai: string; sau: string } {
  const dau = RULES.indexOf(MOC_WEB);
  if (dau === -1) throw new Error(`Không thấy khối ${MOC_WEB} trong BottomSheet.module.css.`);

  const mo = RULES.indexOf('{', dau);
  let sau = 0;
  for (let i = mo; i < RULES.length; i += 1) {
    if (RULES[i] === '{') sau += 1;
    if (RULES[i] === '}') sau -= 1;
    if (sau === 0) {
      return {
        trong: RULES.slice(mo + 1, i),
        ngoai: RULES.slice(0, dau),
        sau: RULES.slice(i + 1),
      };
    }
  }

  throw new Error(`Khối ${MOC_WEB} không đóng ngoặc.`);
}

/** Các khai báo của một luật, theo đúng BỘ CHỌN (chịu được bộ chọn con như `.panelCenter .header`). */
function khaiBao(css: string, selector: string): Record<string, string> {
  for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if ((match[1] ?? '').trim() !== selector) continue;

    return Object.fromEntries(
      (match[2] ?? '')
        .split(';')
        .map((dong) => dong.trim())
        .filter((dong) => dong !== '')
        .map((dong) => {
          const cat = dong.indexOf(':');
          return [
            dong.slice(0, cat).trim(),
            dong
              .slice(cat + 1)
              .trim()
              .replace(/\s+/g, ' '),
          ];
        }),
    );
  }

  throw new Error(`Không thấy luật ${selector} trong BottomSheet.module.css.`);
}

describe('BottomSheet — khổ web tự nổi giữa màn', () => {
  const { trong, ngoai, sau } = tachKhoiWeb();

  /** Luật trong khối `@media` ↔ luật của dạng `center` mà nó phải chép. */
  const CAP: ReadonlyArray<readonly [web: string, center: string]> = [
    ['.sheet', '.sheetCenter'],
    ['.panel', '.panelCenter'],
    ['.header', '.panelCenter .header'],
    ['.body', '.panelCenter .body'],
    ['.footer', '.panelCenter .footer'],
    ['.title', '.panelCenter .title'],
  ];

  it.each(CAP)('%s ở khổ web chép đúng từng khai báo của %s', (web, center) => {
    expect(khaiBao(trong, web), 'đổi một bên thì phải đổi cả bên kia').toEqual(
      khaiBao(ngoai, center),
    );
  });

  it('khối khổ web đứng CUỐI file — sau mọi luật gốc mà nó đè', () => {
    /*
     * `.header`, `.body`, `.footer`, `.title` gốc cùng hạng độ ưu tiên với luật trong khối, và
     * `@media` không cộng thêm gì — nên thứ tự khai là thứ duy nhất quyết định ai thắng. Khai một
     * luật gốc phía sau khối là tấm nổi giữa màn lặng lẽ nhận lại khoảng đệm của tấm dán đáy.
     * Cùng cái bẫy `.panelCenter` từng dính ngày 22/09/2026.
     */
    expect(sau.trim()).toBe('');
  });

  it('vạch kéo bị ẩn ở khổ web — nó hứa một cử chỉ tấm nổi giữa màn không có', () => {
    expect(khaiBao(trong, '.grabber')).toEqual({ display: 'none' });
  });

  it('tấm hẹp chỉ đổi bề ngang, và hẹp hơn tấm thường', () => {
    const hep = khaiBao(trong, '.sheetNarrow');
    const thuong = khaiBao(trong, '.sheet');
    const px = (value: string | undefined): number => Number(/min\((\d+)px/.exec(value ?? '')?.[1]);

    expect(Object.keys(hep).sort()).toEqual(['max-width', 'width']);
    expect(hep['width']).toBe(hep['max-width']);
    expect(px(hep['width'])).toBeLessThan(px(thuong['width']));
  });
});

/*
 * Dưới 1024px tiêu đề tấm dán đáy hạ 18 → 16px (chủ dự án, 15/10/2026, khoanh tiêu đề tấm Lưu: _"giảm
 * size text … chỉ áp dụng cho mobile"_). Luật ở primitive nên mọi tấm dán đáy đi cùng. Ca này giữ ba
 * điều: cỡ 16px, có `screen` (dưới media in bề ngang là bề ngang giấy), và hộp thoại nổi giữa vẫn 20px
 * vì `.panelCenter .title` hai lớp nên thắng.
 */
describe('BottomSheet — tiêu đề nhỏ một bậc dưới 1024px', () => {
  it('tiêu đề 16px trong khối screen, max-width 1023.98px; hộp thoại nổi giữa giữ 20px', () => {
    const khoi = /@media screen and \(max-width: 1023\.98px\)\s*\{([\s\S]*?)\n\}/.exec(RULES)?.[1];

    expect(khoi, 'thiếu khối @media screen and (max-width: 1023.98px)').toBeDefined();
    expect(khoi ?? '').toMatch(/\.title\s*\{\s*font-size:\s*var\(--text-base\);\s*\}/);
    expect(RULES).toMatch(/\.panelCenter \.title\s*\{\s*font-size:\s*var\(--text-lg\);\s*\}/);
  });
});
