import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Thẻ gộp "Số liệu + Kết quả": những luật CSS mà mất đi thì MÀN HÌNH SAI nhưng không test nào đỏ.
 *
 * Ca kiểm này sinh ra từ một lỗi thật, ngày 02/10/2026. Dòng thay số (`92.000 ÷ 6.050 = 15,21`)
 * dưới đáy thẻ — thứ bản thiết kế vẽ và là nửa lý do khuôn gộp tồn tại — **không hiện trên bất kỳ
 * công thức nào trong 48 công thức có `spec.substitution`**, suốt từ lúc dựng. Phần tử vẫn ở đúng
 * chỗ trong DOM, nội dung vẫn đúng, chỉ là `display: none` của luật gốc không bao giờ bị gỡ.
 *
 * Vì sao không cửa gác nào thấy:
 *   · test React dựng DOM chứ không chạy CSS Module, nên `<p>` ấy vẫn `toBeInTheDocument()`;
 *   · `check:chrome` CÓ khối đo thẻ gộp, docblock của nó còn ghi "dưới đáy khung là dòng thay số",
 *     nhưng bốn phép đo trong đó không đo dải ấy — chú thích hứa một đằng, phép kiểm làm một nẻo;
 *   · `verify:static` đọc HTML, mà HTML thì đúng.
 *
 * Nên gác hai lớp: `check:chrome` đo dải thật ở 1440 và 360 (hành vi), còn ca kiểm này đọc thẳng
 * file CSS (ý định). Lớp thứ hai rẻ, chạy trong `npm test`, và nói đúng tên thứ bị thiếu — cùng
 * lối với `result-card.test.ts` và `tokens.test.ts`, vì lý do `Table.test.ts` đã ghi.
 */

/*
 * Đọc file rồi BỎ HẾT chú thích trước khi dò.
 *
 * Bắt buộc, không phải cho gọn: chú thích của file này nói về chính các luật nó đứng cạnh, nên
 * `display: none` xuất hiện trong lời văn giải thích vì sao luật gốc đặt `display: none`. Dò trên
 * nguyên văn thì phép kiểm đọc trúng câu chú thích và báo xanh/đỏ theo lời văn chứ không theo luật.
 */
const CSS = readFileSync(
  fileURLToPath(new URL('./FormulaDetail.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Thân của mọi khối `@media ...` trong file, kèm điều kiện của từng khối.
 *
 * Đếm ngoặc chứ không regex: khối media chứa hàng chục luật con, mà `[^}]*` sẽ dừng ở dấu `}`
 * đầu tiên. File này có BẢY khối media và HAI trong số đó là `min-width: 1280px` (một khối xếp ô
 * nhập một hàng một ô, một khối dựng bố cục PC) — nên hàm trả về danh sách, không trả về khối đầu.
 */
function cacKhoiMedia(): ReadonlyArray<{
  dieuKien: string;
  than: string;
  tu: number;
  den: number;
}> {
  const ra: Array<{ dieuKien: string; than: string; tu: number; den: number }> = [];
  const quet = /@media([^{]*)\{/g;
  let khop = quet.exec(CSS);

  while (khop !== null) {
    const batDau = khop.index + khop[0].length - 1;
    let sau = 1;
    let i = batDau + 1;
    while (i < CSS.length && sau > 0) {
      if (CSS[i] === '{') sau += 1;
      else if (CSS[i] === '}') sau -= 1;
      i += 1;
    }
    ra.push({
      dieuKien: (khop[1] ?? '').trim(),
      than: CSS.slice(batDau + 1, i - 1),
      tu: khop.index,
      den: i,
    });
    quet.lastIndex = i;
    khop = quet.exec(CSS);
  }
  return ra;
}

const KHOI_MEDIA = cacKhoiMedia();

/** Cả file TRỪ mọi khối media — tức những luật áp cho mọi khổ màn, kể cả khổ điện thoại. */
const KHO_GOC = KHOI_MEDIA.reduce(
  (con, khoi) => con.replace(CSS.slice(khoi.tu, khoi.den), ''),
  CSS,
);

/**
 * Luật `selector` trong khối `@media (min-width: <mốc>)` nào cũng được — null nếu không có.
 *
 * Trả về cả `viTri` (vị trí của luật trong CẢ FILE, không phải trong thân khối) vì với hai bộ chọn
 * cùng độ ưu tiên thì thứ tự khai là thứ duy nhất phân thắng bại — xem ca kiểm thứ hai.
 */
function luatTrongMedia(moc: number, selector: string): { than: string; viTri: number } | null {
  // Bộ chọn đứng đầu dòng, theo sau là `{` — đủ chặt để không vớ phải `.a .substitution {`.
  const bo = new RegExp(`^[ \\t]*${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`, 'm');

  for (const khoi of KHOI_MEDIA) {
    if (!khoi.dieuKien.includes(`min-width: ${String(moc)}px`)) continue;
    const dau = khoi.than.search(bo);
    if (dau === -1) continue;
    const moLuat = khoi.than.indexOf('{', dau);
    return {
      than: khoi.than.slice(moLuat + 1, khoi.than.indexOf('}', moLuat)),
      // `khoi.tu` là vị trí của `@media` trong file; `than` bắt đầu ngay sau dấu `{` của nó.
      viTri: khoi.tu + (CSS.slice(khoi.tu, khoi.den).indexOf('{') + 1) + dau,
    };
  }
  return null;
}

/** Vị trí luật `.substitution` ngoài mọi media query, tính trong cả file. */
function viTriLuatGoc(): number {
  const bo = /^\.substitution\s*\{/m;
  let tim = 0;
  while (tim < CSS.length) {
    const con = CSS.slice(tim);
    const khop = bo.exec(con);
    if (khop === null) return -1;
    const tuyetDoi = tim + khop.index;
    if (!KHOI_MEDIA.some((k) => tuyetDoi > k.tu && tuyetDoi < k.den)) return tuyetDoi;
    tim = tuyetDoi + 1;
  }
  return -1;
}

describe('Thẻ gộp — luật CSS mà mất đi thì màn sai mà test không đỏ', () => {
  it('dòng thay số ẩn ở khổ gốc — chữ mới không được lọt xuống màn điện thoại', () => {
    const luat = /^\.substitution\s*\{([^}]*)\}/m.exec(KHO_GOC);

    expect(luat, 'phải có luật `.substitution` ngoài mọi media query').not.toBeNull();
    expect(luat?.[1]).toMatch(/display:\s*none/);
  });

  it('dòng thay số BẬT LẠI trong khối 1280 — nếu không thì nó ẩn ở mọi khổ màn', () => {
    const luat = luatTrongMedia(1280, '.substitution');

    expect(luat, 'khối 1280 phải có luật `.substitution`').not.toBeNull();

    const display = /display:\s*([a-z-]+)/.exec(luat?.than ?? '');
    expect(
      display,
      'luật `.substitution` trong khối 1280 phải khai `display` — thiếu nó thì `display: none` ' +
        'của luật gốc thắng ở mọi khổ và dải đáy thẻ không bao giờ hiện',
    ).not.toBeNull();
    expect(display?.[1]).not.toBe('none');
  });

  /*
   * Ca này gác thứ MÀ HAI CA TRÊN KHÔNG THẤY, và nó được thêm sau một đợt rà đối kháng chỉ ra đúng
   * lỗ hổng ấy: hai ca trên chỉ hỏi "có khai `display: none` ở gốc không" và "có khai `display`
   * khác none trong một khối 1280 nào không" — cả hai vẫn xanh nếu hai luật đổi chỗ cho nhau.
   *
   * Mà đổi chỗ là hỏng thật: `.substitution` ở gốc và `.substitution` trong media đều là bộ chọn
   * MỘT LỚP, tức cùng độ ưu tiên 0-1-0, và `@media` không cộng thêm điểm nào. Thứ tự khai là thứ
   * duy nhất phân thắng bại. File có HAI khối `min-width: 1280px`, và khối thứ nhất (xếp ô nhập
   * một hàng một ô) nằm TRƯỚC luật gốc — chuyển dòng `display: block` sang khối ấy là một sửa đổi
   * hoàn toàn hợp lý về mặt đọc code, và nó làm dải thay số biến mất trở lại trên cả 48 công thức
   * trong khi `npm test` vẫn xanh.
   *
   * Cùng cái bẫy đã ghi ở `.panelCenter` của `BottomSheet.module.css` và `.legend > .legendHidden`.
   */
  it('luật bật nằm SAU luật ẩn trong file — cùng độ ưu tiên thì chỉ thứ tự quyết', () => {
    const goc = viTriLuatGoc();
    const luat = luatTrongMedia(1280, '.substitution');

    expect(goc, 'phải tìm được luật `.substitution` ngoài media query').toBeGreaterThan(-1);
    expect(luat).not.toBeNull();
    expect(
      luat?.viTri ?? -1,
      'luật `.substitution` của khối 1280 phải khai SAU luật gốc. Cùng là bộ chọn một lớp nên ' +
        '`@media` không cộng độ ưu tiên — khai trước thì `display: none` của luật gốc thắng và ' +
        'dải thay số lại ẩn ở mọi khổ màn, y như lỗi ngày 02/10/2026',
    ).toBeGreaterThan(goc);
  });

  it('ô nhập độc nhất bị chặn bề ngang — không nuốt trọn cột phải', () => {
    const luat = luatTrongMedia(1280, '.fields.tileGrid > :only-child');

    expect(
      luat,
      '`auto-fit` xoá rãnh rỗng, nên công thức một biến (`thoi-gian-nhan-doi`) để ô nở hết 795px',
    ).not.toBeNull();
    expect(luat?.than).toMatch(/max-width:/);
  });
});
