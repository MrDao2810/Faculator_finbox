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

  /*
   * Căn giữa cụm "tên công thức + con số" (13/10/2026). Chủ dự án khoanh hàng ô nhập của
   * `ev-ebitda`: _"đang bị lệch. cần căn giữa. điều chỉnh tương tự với toàn bộ công thức khác"_ —
   * cụm bám mép trên thẻ, con số đứng ngang MÉP TRÊN hàng ô chứ không ngang giữa hàng.
   *
   * `check:chrome` đo vị trí thật ở 1440; ba ca dưới đây gác Ý ĐỊNH, vì mỗi vế mất đi là một kiểu
   * lệch khác nhau mà React không thấy: bỏ `stretch` thì cụm lại bám mép trên, bỏ phần chừa hàng
   * nút "?" thì cụm cao hơn giữa hàng ô 16px, và phần chừa ấy chỉ đúng khi hàng nút cao bằng
   * chính token đem ra chừa.
   */
  it('cụm kết quả đứng giữa vùng ô nhập theo chiều dọc — ô cao trọn hàng, chừa lại hàng nút "?"', () => {
    const luat = luatTrongMedia(1280, '.merged .result');

    expect(luat, 'khối 1280 phải có luật `.merged .result`').not.toBeNull();
    expect(luat?.than).toMatch(/align-self:\s*stretch/);
    expect(luat?.than).toMatch(/justify-content:\s*center/);
    expect(
      luat?.than,
      'phần chừa phía trên phải bằng chiều cao nút "?" (`--space-6`) cộng khe của `.block` (`--space-2`)',
    ).toMatch(/padding-top:\s*calc\(var\(--space-6\)\s*\+\s*var\(--space-2\)\)/);

    const hangNut = luatTrongMedia(1280, '.merged .blockHead');
    expect(
      hangNut?.than,
      'hàng nút "?" phải cao đúng token đã đem ra chừa ở vế trái, nếu không hai vế trôi khỏi nhau',
    ).toMatch(/min-height:\s*var\(--space-6\)/);
  });

  it('hàng nút thêm bớt của nhóm ô lặp cũng được chừa lại — con số đứng giữa LƯỚI Ô', () => {
    const luat = luatTrongMedia(1280, '.merged:has(.repeatActions) .result');

    expect(
      luat,
      'thiếu luật này thì `gia-von-trung-binh-dca` và `loi-suat-trung-binh-hinh-hoc` có con số ' +
        'thấp hơn giữa lưới ô 20px',
    ).not.toBeNull();
    expect(luat?.than).toMatch(/padding-bottom:\s*calc\(/);
  });

  /*
   * Chiều NGANG nằm ở file khác (`ResultBlock.module.css`, biến thể `flat`), và phải khai tường
   * minh. Từ 01/10 tới 13/10/2026 cụm đứng giữa cột trái chỉ nhờ `align-items: center` của luật
   * `.block` — khai cho LƯỚI nhãn trái số phải của thẻ thường rồi rơi xuống biến thể này — trong
   * khi `.figure` lại ghi `flex-start`. Đổi khuôn thẻ thường là cụm dạt trái mà không ca nào đỏ.
   */
  it('cụm kết quả đứng giữa cột trái theo chiều ngang, khai ngay ở biến thể `flat`', () => {
    const khoiKetQua = readFileSync(
      fileURLToPath(new URL('../../../ui/result/ResultBlock.module.css', import.meta.url)),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const flat = /^\s*\.block\.flat\s*\{([^}]*)\}/m.exec(khoiKetQua);
    expect(flat, 'phải có luật `.block.flat`').not.toBeNull();
    expect(flat?.[1]).toMatch(/align-items:\s*center/);
    expect(flat?.[1]).toMatch(/text-align:\s*center/);

    const conSo = /^\s*\.block\.flat \.figure\s*\{([^}]*)\}/m.exec(khoiKetQua);
    expect(conSo?.[1]).toMatch(/justify-content:\s*center/);
  });
});

/*
 * Hàng nút "Lưu vào danh mục · Thoát" ghim đáy dưới 1024px (chủ dự án, 15/10/2026: "khi scroll nội dung
 * lên xuống thì 2 button này đều ở dưới để người dùng có thể lưu bất cứ lúc nào"). Cùng lý do cả file này
 * tồn tại: test React không chạy CSS Module, nên mất `sticky` là màn sai mà không ca nào đỏ.
 */
describe('Hàng nút cuối màn — ghim đáy ở khổ điện thoại', () => {
  const khoi = KHOI_MEDIA.filter((k) => k.dieuKien.includes('max-width: 1023.98px'))
    .map((k) => /^\s*\.endActions\s*\{([^}]*)\}/m.exec(k.than)?.[1])
    .find((than) => than !== undefined);

  it('sticky, đáy ngay trên thanh điều hướng dưới, có nền để nội dung không lộ qua', () => {
    expect(khoi, 'thiếu luật .endActions trong @media (max-width: 1023.98px)').toBeDefined();
    expect(khoi).toMatch(/position:\s*sticky;/);
    expect(khoi).toMatch(/bottom:\s*calc\(var\(--tabbar-height\)/);
    expect(khoi).toMatch(/background:\s*var\(--color-paper\);/);
  });

  it('khổ gốc KHÔNG ghim — từ 1024px hàng nút đứng yên ở cuối trang', () => {
    const goc = /^\.endActions\s*\{([^}]*)\}/m.exec(KHO_GOC)?.[1] ?? '';
    expect(goc).not.toMatch(/position:/);
  });
});
