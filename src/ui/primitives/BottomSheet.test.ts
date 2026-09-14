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
