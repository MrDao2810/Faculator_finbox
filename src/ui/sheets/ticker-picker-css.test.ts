import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Dòng mã của tấm chọn mã dưới 1024px (21/10/2026). Chủ dự án khoanh một dòng quỹ ETF trên điện
 * thoại: _"hiện tại màn mobile đang nhìn rất xấu và không ổn lắm"_. Nhãn "chưa có dữ liệu" (99px) chen
 * giữa tên và nút, nên ở 390px cột tên còn 58px, tên xuống năm dòng và gãy giữa chữ. Nay nhãn nằm dưới
 * tên. Test React không chạy CSS Module, nên các ca dưới đọc thẳng file.
 */

const CSS = readFileSync(
  fileURLToPath(new URL('./TickerPickerSheet.module.css', import.meta.url)),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

/** Thân khối `@media (max-width: 1023.98px)` chứa luật dòng `.item` — đếm ngoặc. */
function khoiDong(css: string): string {
  const batDau = css.indexOf('@media (max-width: 1023.98px)', css.indexOf('.item {'));
  if (batDau < 0) return '';
  let i = css.indexOf('{', batDau) + 1;
  const dau = i;
  let sau = 1;
  while (i < css.length && sau > 0) {
    if (css[i] === '{') sau += 1;
    else if (css[i] === '}') sau -= 1;
    i += 1;
  }
  return css.slice(dau, i - 1);
}

function luat(khoi: string, boChon: string): string {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[{}])\\s*${thoat}\\s*\\{([^}]*)\\}`, 'm').exec(khoi)?.[1] ?? '';
}

const DT = khoiDong(CSS);

describe('dòng mã của tấm chọn mã', () => {
  it('từ 1024px khối bọc không vẽ gì: dòng vẫn một hàng như trước', () => {
    expect(/^\.text\s*\{([^}]*)\}/m.exec(CSS)?.[1]).toMatch(/display:\s*contents;/);
  });

  it('dưới 1024px khối bọc là lưới mã | tên, canh theo dòng chữ đầu', () => {
    const khoi = luat(DT, '.text');
    expect(khoi).toMatch(/display:\s*grid;/);
    expect(khoi).toMatch(/grid-template-columns:\s*auto minmax\(0, 1fr\);/);
    expect(khoi).toMatch(/align-items:\s*baseline;/);
    expect(khoi).toMatch(/min-width:\s*0;/);
  });

  /*
   * Cùng ngày, chủ dự án khoanh nhãn vàng: _"phần text vàng không cần bo xung quanh, chỉ cần đoạn text
   * vàng in nghiêng là được, rồi cho dịch sang trái 1 chút nữa"_ — mũi tên chỉ về dưới mã.
   */
  it('dưới 1024px nhãn là chữ nghiêng trơn ở hàng dưới, bắt đầu thẳng mép mã', () => {
    const nhan = luat(DT, '.held,\n  .unusable');
    expect(nhan).toMatch(/grid-column:\s*1 \/ -1;/);
    expect(nhan).toMatch(/padding:\s*0;/);
    expect(nhan).toMatch(/font-style:\s*italic;/);
    expect(nhan).toMatch(/background:\s*none;/);
    expect(nhan).toMatch(/border:\s*0;/);
  });

  it('cỡ chữ của mã bám vào khối bọc, nơi mã đang đứng', () => {
    expect(luat(DT, '.name,\n  .text > .code')).toMatch(/font-size:\s*13px;/);
    expect(DT).not.toMatch(/\.item > \.code/);
  });

  it('khối điện thoại đứng sau các luật gốc nó đè', () => {
    const khoi = CSS.indexOf('@media (max-width: 1023.98px)', CSS.indexOf('.item {'));
    for (const goc of ['.item {', '.text {', '.name {', '.held {', '.unusable {']) {
      expect(CSS.indexOf(goc), goc).toBeLessThan(khoi);
    }
  });
});
