/**
 * Cửa gác: mọi ô mở BÀN PHÍM SỐ đều phải đi qua một cửa lọc ký tự.
 *
 * Chủ dự án chốt 14/09/2026: *"tất cả các ô nhập số liệu … không được có sự xuất hiện của chữ
 * cái"*. Luật ấy nằm rải ở sáu chỗ gọi, mà chỗ gọi thứ bảy — một ô số mới thêm sau này — sẽ không
 * có gì nhắc người viết. Ca kiểm này là thứ nhắc.
 *
 * Cách nhận diện: `inputMode="decimal"` và `inputMode="numeric"` là dấu hiệu chắc chắn nhất của
 * một ô số, chắc hơn tên component hay tên biến, vì nó là thứ tác động thật lên bàn phím điện
 * thoại. File nào đặt một trong hai thứ ấy thì phải nhắc tới `keepViNumberChars` hoặc
 * `keepSeriesDateChars`. `inputMode="search"` của ba ô tìm kiếm không khớp mẫu nên đứng ngoài.
 *
 * Giới hạn đã biết, ghi ra để không ai tưởng nó chặt hơn thực tế: cửa này soi CHỮ trong file, nên
 * một ô đặt `inputMode` qua biến sẽ lọt, và nó không kiểm cửa lọc có được gắn đúng ô hay không.
 * Phần ấy do ca kiểm hành vi của từng component giữ — đây chỉ là lưới chặn việc QUÊN HẲN.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/** Gốc src/ — cùng lối đi mà `i18n.test.ts` dùng cho hai cửa gác quét file của nó. */
const SRC = fileURLToPath(new URL('../..', import.meta.url));

const BAN_PHIM_SO = /inputMode="(?:decimal|numeric)"/;
const CUA_LOC = /keepViNumberChars|keepSeriesDateChars/;
/* Phần bù phím xoá — thiếu nó là ô ăn mất chữ số thật, xem `guardFilteredDelete`. */
const BU_PHIM_XOA = /guardFilteredDelete/;

/**
 * Năm file được phép có bàn phím số, đúng bằng số chỗ gọi hôm nay.
 *
 * Ghim cả danh sách chứ không chỉ kiểm từng file: thêm một ô số ở chỗ thứ sáu cũng phải làm ca này
 * đỏ, để người thêm đọc docblock trên trước khi nối nó vào.
 */
const CHO_GOI = [
  'app/danh-muc/PortfolioScreen.tsx',
  'app/du-lieu/DataTableScreen.tsx',
  'ui/inputs/InlineNumber.tsx',
  'ui/inputs/NumberCell.tsx',
  'ui/inputs/NumberInput.tsx',
  /*
   * Ô điền số của câu hỏi dạng `dien-so` — WF-19C, 23/09/2026. Đúng chỗ gọi thứ sáu mà docblock
   * trên nói tới. Đổi tên file ngày 24/09/2026: phần dựng một câu tách khỏi `QuizBody.tsx` sang
   * `QuizQuestion.tsx` để dải câu đã làm dựng lại được y hệt câu đang hỏi.
   */
  'ui/quiz/QuizQuestion.tsx',
];

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (extname(path) === '.ts' || extname(path) === '.tsx') out.push(path);
  }
  return out;
}

/** Mọi file nguồn của hai tầng Trình bày, bỏ ca kiểm — ca kiểm nhắc tên hàm là chuyện thường. */
function fileTrinhBay(): string[] {
  return [...walk(join(SRC, 'ui')), ...walk(join(SRC, 'app'))].filter(
    (path) => !path.includes('.test.'),
  );
}

function duongDan(path: string): string {
  return relative(SRC, path).replaceAll('\\', '/');
}

describe('mọi ô mở bàn phím số đều phải lọc ký tự', () => {
  const coBanPhimSo = fileTrinhBay()
    .filter((path) => BAN_PHIM_SO.test(readFileSync(path, 'utf8')))
    .map(duongDan)
    .sort();

  it('đúng năm chỗ gọi, không hơn không kém', () => {
    expect(coBanPhimSo).toEqual(CHO_GOI);
  });

  it('không file nào bật bàn phím số mà quên cửa lọc', () => {
    for (const path of coBanPhimSo) {
      expect(CUA_LOC.test(readFileSync(join(SRC, path), 'utf8')), path).toBe(true);
    }
  });

  /*
   * Vế thứ hai, thêm sau khi chủ dự án báo lỗi mất chữ số (14/09/2026): cửa lọc mà đi một mình thì
   * phím xoá ăn vào chữ số thật, và với bộ gõ tiếng Việt thì phím xoá ấy là TỰ ĐỘNG. Hai hàm phải
   * đi cùng nhau ở mọi chỗ gọi — xem docblock `guardFilteredDelete`.
   */
  it('không file nào có cửa lọc mà quên phần bù phím xoá', () => {
    for (const path of coBanPhimSo) {
      expect(BU_PHIM_XOA.test(readFileSync(join(SRC, path), 'utf8')), path).toBe(true);
    }
  });
});
