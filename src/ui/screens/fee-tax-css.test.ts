import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Bảng "Bóc tách chi phí" và thẻ "Giá hoà vốn thực" ở khổ điện thoại (`FeeTaxBody`).
 *
 * 19/10/2026, chủ dự án: _"giảm size text khoanh đỏ …, giảm height phần khoanh đỏ bên dưới. giảm
 * padding …. áp dụng trong bản mobile"_. Test React không chạy CSS Module, nên ca dưới đọc thẳng file:
 * khối dưới 1024px phải có đủ bốn luật, và phải đứng SAU luật gốc của chúng — cùng độ ưu tiên, nên
 * khai trước là luật gốc thắng và màn điện thoại về lại số cũ mà không ca nào đỏ.
 */

function docCss(ten: string): string {
  return readFileSync(fileURLToPath(new URL(`./${ten}`, import.meta.url)), 'utf8').replace(
    /\/\*[\s\S]*?\*\//g,
    '',
  );
}

const MOC = '@media (max-width: 1023.98px)';
const PHI = docCss('FeeTaxBody.module.css');
const NO = docCss('LoanScheduleBody.module.css');

/** Thân luật `boChon` trong khối dưới 1024px của `css`. */
function trongKhoi(css: string, boChon: string): string | undefined {
  const thoat = boChon.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:\\{|\\})\\s*${thoat}\\s*\\{([^}]*)\\}`).exec(
    css.slice(css.indexOf(MOC)),
  )?.[1];
}

/** Khối dưới 1024px có mặt và đứng SAU luật gốc của từng lớp nó ghi đè. */
function dungSauLuatGoc(css: string, cacLop: ReadonlyArray<string>): void {
  const viTriKhoi = css.indexOf(MOC);
  expect(viTriKhoi).toBeGreaterThan(-1);
  for (const lop of cacLop) {
    const goc = new RegExp(`(?:^|\\})\\s*\\${lop}\\s*\\{`, 'm').exec(css);
    expect(goc, `thiếu luật gốc ${lop}`).not.toBeNull();
    expect(goc?.index ?? Infinity, `${lop} phải khai trước khối điện thoại`).toBeLessThan(
      viTriKhoi,
    );
  }
}

describe('FeeTaxBody — khổ điện thoại gọn hơn (19/10/2026)', () => {
  it('khối dưới 1024px tồn tại và đứng sau luật gốc của mọi lớp nó ghi đè', () => {
    dungSauLuatGoc(PHI, [
      '.row',
      '.rowFormula',
      '.rowValue',
      '.stat',
      '.headline',
      '.headlineValue',
    ]);
  });

  it('dòng phí 6 / 10px không khe dưới nhãn, con số 13px, thẻ hoà vốn 8 / 10px', () => {
    expect(trongKhoi(PHI, '.row')).toMatch(/padding:\s*6px 10px;/);
    expect(trongKhoi(PHI, '.rowFormula')).toMatch(/margin-top:\s*0;/);
    expect(trongKhoi(PHI, '.rowValue')).toMatch(/font-size:\s*13px;/);
    expect(trongKhoi(PHI, '.stat')).toMatch(/padding:\s*var\(--space-2\) 10px;/);
  });

  /*
   * Lượt hai: thẻ "Lợi nhuận ròng" — số 26px, đệm trên dưới 8px. Thẻ tóm tắt của lịch trả nợ cùng
   * khuôn đáp án (`result-card.test.ts`), nên ca này đòi nó mang đúng hai con số ấy; hạ một thẻ mà
   * quên thẻ kia là ba thẻ đáp án lại hai cỡ trên điện thoại.
   */
  it('thẻ "Lợi nhuận ròng" và thẻ tóm tắt lịch trả nợ: số --text-xl, đệm dọc 8px', () => {
    expect(trongKhoi(PHI, '.headline')).toMatch(/padding:\s*var\(--space-2\) var\(--space-4\);/);
    expect(trongKhoi(PHI, '.headlineValue')).toMatch(/font-size:\s*var\(--text-xl\);/);

    dungSauLuatGoc(NO, ['.summary', '.summaryValue']);
    expect(trongKhoi(NO, '.summary')).toMatch(/padding:\s*var\(--space-2\) var\(--space-4\);/);
    expect(trongKhoi(NO, '.summaryValue')).toMatch(/font-size:\s*var\(--text-xl\);/);
  });
});
