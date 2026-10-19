import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Cuối màn chi tiết ở khổ điện thoại — khe trên thẻ Bài tập, chính thẻ ấy, và ô miễn trừ cùng
 * khoảng trống quanh nó (19/10/2026, chủ dự án: _"bản mobile thì các phần khoanh đỏ kia cần giảm
 * xuống"_). Bốn file CSS góp phần, test React không chạy CSS Module, nên ca dưới đọc thẳng các file.
 */

function doc(duong: string): string {
  return readFileSync(fileURLToPath(new URL(duong, import.meta.url)), 'utf8');
}

/** Bỏ chú thích — lời văn chú thích nhắc tới chính các con số. */
const boChuThich = (css: string): string => css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân mọi khối `@media (max-width: 1023.98px)` của file, gộp lại — đếm ngoặc. */
function khoiDienThoai(css: string): string {
  const quet = /@media([^{]*)\{/g;
  let gop = '';
  let khop = quet.exec(css);
  while (khop !== null) {
    const batDau = khop.index + khop[0].length;
    let sau = 1;
    let i = batDau;
    while (i < css.length && sau > 0) {
      if (css[i] === '{') sau += 1;
      else if (css[i] === '}') sau -= 1;
      i += 1;
    }
    if ((khop[1] ?? '').includes('max-width: 1023.98px')) gop += css.slice(batDau, i - 1);
    quet.lastIndex = i;
    khop = quet.exec(css);
  }
  return gop;
}

/** Thân mọi luật có bộ chọn viết đúng `boChon`, nối lại. */
function luat(css: string, boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return [...css.matchAll(new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'gm'))]
    .map((k) => k[1] ?? '')
    .join('\n');
}

const MAN = khoiDienThoai(boChuThich(doc('./FormulaDetail.module.css')));
const BAI_TAP = khoiDienThoai(boChuThich(doc('../../../ui/quiz/QuizBody.module.css')));
const MIEN_TRU = khoiDienThoai(boChuThich(doc('../../../ui/navigation/DisclaimerBar.module.css')));

describe('cuối màn chi tiết dưới 1024px (19/10/2026)', () => {
  it('khe trên thẻ Bài tập và trên ô miễn trừ 20 → 12px, đệm đáy màn 32 → 16px', () => {
    expect(luat(MAN, ".quizBlock,\n  .endActions + [role='note']")).toMatch(
      /margin-top:\s*calc\(var\(--space-2\) \* -1\);/,
    );
    expect(luat(MAN, '.detail')).toMatch(/margin-bottom:\s*calc\(var\(--space-4\) \* -1\);/);
  });

  /* Lớp `.quizBlock` chỉ có tác dụng khi màn thật sự trao nó cho khối Bài tập. */
  it('màn chi tiết trao lớp quizBlock cho QuizPanel', () => {
    expect(doc('./FormulaDetail.tsx')).toMatch(/<QuizPanel[^>]*className=\{styles\.quizBlock\}/);
  });

  it('thẻ Bài tập đệm 8 / 12px, ô miễn trừ đệm dọc 6px và dòng 1,4', () => {
    expect(luat(BAI_TAP, '.block')).toMatch(/padding:\s*var\(--space-2\) var\(--space-3\);/);
    expect(luat(MIEN_TRU, '.notice')).toMatch(/padding:\s*6px var\(--space-2\);/);
    expect(luat(MIEN_TRU, '.notice')).toMatch(/line-height:\s*1\.4;/);
  });

  /*
   * Lượt hai (_"vẫn chưa thấy giảm padding xung quanh phần này?"_): phần trống quanh chữ nằm phần lớn
   * trong nút ở hàng tiêu đề. Hàng và nút cùng 28px — `min-height` của hàng là chiều cao nút, hai số
   * lệch nhau là hàng nảy khi đổi "Bắt đầu kiểm tra" ↔ "Thoát". Vùng chạm 44px của `.sm` thò
   * (44 − 28) ÷ 2 = 8px mỗi phía, nên đệm dọc của thẻ không được dưới 8px.
   */
  it('hàng tiêu đề Bài tập và nút của nó cùng 28px, nền hover của nút cách viền thẻ 8px', () => {
    const hang = /min-height:\s*(\d+)px;/.exec(luat(BAI_TAP, '.head'))?.[1];
    const nut = luat(BAI_TAP, '.head > .headAction');
    expect(hang).toBe('28');
    expect(nut).toMatch(new RegExp(`min-height:\\s*${String(hang)}px;`));
    /*
     * Lượt ba (_"khi hover vào đang có padding quá rộng làm xát với bên ngoài"_): lề âm từng là −12px,
     * nền hover chạm viền thẻ. Nay đệm nút 8px, lề âm 4px — nền hover cách viền thẻ 12 − 4 = 8px bên
     * phải, bằng 8px đệm dọc của thẻ ở trên dưới.
     */
    expect(nut).toMatch(/padding-inline:\s*var\(--space-2\);/);
    expect(nut).toMatch(/margin-right:\s*calc\(var\(--space-1\) \* -1\);/);
  });
});
