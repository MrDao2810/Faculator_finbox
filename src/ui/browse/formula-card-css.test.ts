import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Nhãn nhóm của thẻ công thức phải BÁM ĐÁY thẻ, ở cả hai biến thể.
 *
 * ── Lỗi đã xảy ra ───────────────────────────────────────────────────────────────────────────
 *
 * Chủ dự án chụp hàng đầu danh sách `/cong-thuc/` ở khổ PC (08/10/2026): "XIRR — suất sinh lợi
 * nội tại theo ngày thực" là tên dài, huy hiệu "Nâng cao" bị đẩy xuống dòng hai, nên thẻ ấy cao
 * hơn hai thẻ bên cạnh. Lưới ba cột kéo cả ba thẻ cao bằng nhau (`VirtualList.module.css` cho
 * thẻ `height: 100%`), nhưng chỉ nhãn nhóm của XIRR chạm đáy — hai nhãn kia treo lơ lửng giữa
 * thẻ, vì khối chữ bên trong vẫn chỉ cao bằng nội dung của nó.
 *
 * Đo bằng Chrome thật ở 1440px, cuộn từng hàng vào khung nhìn: **20 trong 37 hàng lệch, chỗ lệch
 * nhất 42px**. Sau khi sửa: 0 trong 37, lệch tối đa 0px.
 *
 * ── Vì sao ca kiểm đọc FILE NGUỒN ───────────────────────────────────────────────────────────
 *
 * Không có cách nào thấy lỗi này trong jsdom: nó không bố cục, nên mọi hộp đều 0×0 và "nhãn nào
 * chạm đáy" không có nghĩa. Chrome thật thì thấy, và `check:chrome` có một phép kiểm cho nó —
 * nhưng `check:chrome` cần `out/` đã dựng và KHÔNG chạy trong CI, nên nó không chặn được một lần
 * sửa CSS vô tình. Ca kiểm này gác phần chặn được: ba khai báo phải còn đó.
 *
 * ── Ba khai báo, bỏ một là hỏng ─────────────────────────────────────────────────────────────
 *
 *   `.card   { align-items: stretch }`        kéo khối chữ cao bằng thẻ
 *   `.body   { grid-template-rows: … 1fr }`   hàng cuối nuốt chiều cao thừa
 *   `.category { align-self: end }`           nhãn bám đáy hàng ấy
 *
 * Chúng không thay nhau được, nên ca kiểm dò cả ba chứ không dò một. Lý do từng cái phải thế nằm
 * ở chính chú thích trong `FormulaCard.module.css`.
 *
 * PHẢI bóc chú thích trước khi dò: chú thích của file ấy nhắc lại nguyên văn `flex-start`,
 * `margin-top: auto` và `align-self: end` khi kể vì sao chọn cái này thay cái kia — dò trên văn
 * bản thô là dò trúng lời kể chứ không trúng luật.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./FormulaCard.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Thân của luật ĐẦU TIÊN mang bộ chọn ấy — tức luật ở bậc ngoài cùng. File có đúng một `@media`
 * (cỡ chữ của biến thể ô dưới 1024px, 15/10/2026), đặt ở CUỐI file, nên `indexOf` luôn gặp luật
 * ngoài trước luật trong khối ấy.
 */
function than(selector: string): string {
  const mo = CSS.indexOf(`${selector} {`);
  expect(mo, `không tìm thấy luật \`${selector}\``).toBeGreaterThanOrEqual(0);
  let sau = 1;
  let i = CSS.indexOf('{', mo) + 1;
  const dau = i;
  while (sau > 0 && i < CSS.length) {
    if (CSS[i] === '{') sau += 1;
    if (CSS[i] === '}') sau -= 1;
    i += 1;
  }
  return CSS.slice(dau, i - 1);
}

/**
 * Giá trị của một thuộc tính trong thân luật, hoặc `null` nếu luật không khai nó.
 *
 * Tách theo dấu `;` chứ không dựng biểu thức chính quy: tên thuộc tính CSS mang dấu gạch nối
 * (`align-items`, `grid-template-rows`), và nhét nó vào một mẫu là mời đúng lớp lỗi thoát ký tự.
 */
function khai(selector: string, thuocTinh: string): string | null {
  for (const dong of than(selector).split(';')) {
    const cat = dong.indexOf(':');
    if (cat < 0) continue;
    if (dong.slice(0, cat).trim() === thuocTinh) return dong.slice(cat + 1).trim();
  }
  return null;
}

describe('nhãn nhóm của thẻ công thức bám đáy thẻ', () => {
  it('biến thể HÀNG: thẻ kéo khối chữ cao bằng mình', () => {
    /*
     * `flex-start` là giá trị cũ và là đúng cái làm hỏng: nó để `.body` chỉ cao bằng nội dung,
     * nên chiều cao thừa của thẻ rơi xuống dưới khối chữ thay vì vào trong nó.
     */
    expect(khai('.card', 'align-items')).toBe('stretch');
  });

  it('biến thể HÀNG: hàng cuối của lưới nuốt chiều cao thừa', () => {
    const hang = khai('.body', 'grid-template-rows');
    expect(hang, '`.body` phải khai rõ hàng, không để ba hàng `auto`').not.toBeNull();
    /*
     * Hàng cuối phải là `1fr`. Ba hàng `auto` thì `align-content: stretch` (mặc định của lưới)
     * chia đều chỗ thừa cho CẢ BA, nên mô tả bị đẩy xuống theo chứ không chỉ nhãn nhóm.
     */
    expect(hang?.split(/\s+/).at(-1)).toBe('1fr');
  });

  it('biến thể HÀNG: nhãn nhóm bám đáy ô lưới của nó', () => {
    expect(khai('.category', 'align-self')).toBe('end');
    /*
     * `margin-top` vẫn phải còn: khi thẻ KHÔNG bị kéo cao (dưới 1280px, nơi danh sách là một
     * cột) hàng `1fr` bằng đúng chiều cao nội dung, và lúc ấy chính nó giữ khoảng cách với dòng
     * mô tả. Đổi nó thành `auto` là bỏ khoảng cách ấy ở khổ điện thoại.
     */
    expect(khai('.category', 'margin-top')).toBe('var(--space-2)');
  });

  it('biến thể Ô: nhãn nhóm vẫn bám đáy bằng `margin-top: auto`', () => {
    /*
     * Nhánh ô làm cùng một việc bằng một lối khác, vì `.tile` là flex cột chứ không phải lưới —
     * ghi ở đây để hai nhánh không trôi khỏi nhau. Nó không cần `align-self: end`.
     */
    expect(khai('.tileCategory', 'margin-top')).toBe('auto');
  });
});

/*
 * Nhãn nhóm của Ô kệ dưới 1024px (20/10/2026): chủ dự án khoanh "Định giá" ở kệ "Công thức dùng hằng ngày"
 * trên điện thoại — _"giảm 1 size text phần này"_. Ở 12px nó bằng đúng cỡ mô tả ngay trên; 11px đưa nó về dưới
 * mô tả một bậc, như ở PC (13 dưới 14). Khối `@media` là thứ cuối file nên lấy phần sau nó.
 */
describe('nhãn nhóm của ô kệ nhỏ hơn mô tả một bậc', () => {
  const KHOI_DUOI_1024 = CSS.slice(CSS.indexOf('@media (max-width: 1023.98px)'));
  const co = (boChon: string): string | undefined =>
    new RegExp(`\\${boChon}\\s*\\{[^}]*font-size:\\s*([^;]+);`).exec(KHOI_DUOI_1024)?.[1]?.trim();

  it('dưới 1024px: mô tả 12px, nhãn nhóm 11px', () => {
    expect(co('.tileDescription')).toBe('var(--text-xs)');
    expect(co('.tileCategory')).toBe('11px');
  });

  it('từ 1024px: nhãn 13px vẫn dưới mô tả `--text-sm` (14px)', () => {
    // Cả hai cùng nhỉnh `--font-bump` ở PC (31/10/2026), nên khoảng cách một bậc giữ nguyên.
    expect(khai('.tileCategory', 'font-size')).toBe('calc(13px + var(--font-bump))');
    expect(khai('.tileDescription', 'font-size')).toBe('var(--text-sm)');
  });
});
