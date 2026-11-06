import { describe, expect, it } from 'vitest';

import { FORMULAS } from '@/application';

import { buildNotationView } from './notation-view';
import { notationForLocale } from './notation-types';

/*
 * Bản tiếng Anh của thẻ Công thức (05/11/2026). Chủ dự án chuyển sang tiếng Anh và thấy hình vẫn in
 * `\text{Tổng nợ phải trả}`, `P_{mục tiêu}`: _"chuyển sang ngôn ngữ tiếng anh rồi mà vẫn còn tiếng việt,
 * cần chuyển đổi sang tiếng anh, xát nghĩa nhất có thể"_. Xem `src/core/latex-en.ts`.
 */

const DAU_VIET = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;
/** Chữ bên trong các thẻ MathML — bỏ thẻ, giữ chữ. */
const chu = (html: string) => html.replace(/<[^>]*>/g, ' ');

const VIEWS = FORMULAS.map((spec) => [spec.id, spec, buildNotationView(spec)] as const);

describe('thẻ Công thức có bản tiếng Anh', () => {
  it.each(VIEWS)(
    '%s: bản tiếng Anh (nếu có) không còn một chữ có dấu tiếng Việt nào',
    (_id, _spec, view) => {
      const en = notationForLocale(view, 'en');
      const tatCa = [
        en.latexHtml,
        ...en.symbolsHtml,
        ...en.howTo.flatMap((entry) => entry.steps.map((step) => step.html)),
      ];
      for (const html of tatCa) expect(DAU_VIET.test(chu(html)), chu(html)).toBe(false);
    },
  );

  it('chỉ công thức có chữ Việt trong hình mới mang thêm bản tiếng Anh', () => {
    const coBanAnh = VIEWS.filter(([, , view]) => view.en !== undefined).map(([id]) => id);
    // Đo ngày 05/11/2026: 66 trên 111 — 59 có chữ Việt trong chính hình hay bảng ký hiệu, 7 chỉ vì một
    // bước cách tính dẫn tới hình của công thức khác (`pe` dẫn tới EPS cơ bản, có LNST).
    // 06/11/2026: 67 — Trả góp niên kim vẽ PMT thay EMI (lối gọi của ngân hàng Ấn Độ) ở bản tiếng Anh.
    // Cùng ngày: 68 — Độ lệch chuẩn bán phần vẽ σ_d thay DD (tiếng Anh đọc DD là drawdown).
    expect(coBanAnh).toHaveLength(68);
    expect(coBanAnh).toContain('tra-gop-nien-kim');
    expect(coBanAnh).toContain('do-lech-chuan-ban-phan');
    expect(coBanAnh).toContain('no-tren-von-chu');
    expect(coBanAnh).toContain('gia-muc-tieu');
    expect(coBanAnh).toContain('pe');
    expect(coBanAnh).not.toContain('capm');
  });

  it('D/E: hình, bảng ký hiệu đều sang tiếng Anh; bản tiếng Việt giữ nguyên', () => {
    const view = VIEWS.find(([id]) => id === 'no-tren-von-chu')?.[2];
    if (view === undefined) throw new Error('thiếu no-tren-von-chu');
    expect(chu(notationForLocale(view, 'en').latexHtml)).toContain('Total liabilities');
    expect(chu(notationForLocale(view, 'en').symbolsHtml.join(' '))).toContain('Equity');
    expect(chu(notationForLocale(view, 'vi').latexHtml)).toContain('Tổng nợ phải trả');
  });

  it('điểm chạm của bản tiếng Anh trùng bản tiếng Việt, từng ký hiệu một', () => {
    for (const [id, , view] of VIEWS) {
      if (view.en === undefined) continue;
      const dem = (html: string) =>
        [...html.matchAll(/data-sym="(\d+)"/g)]
          .map((m) => m[1])
          .sort()
          .join(',');
      expect(dem(view.en.latexHtml), id).toBe(dem(view.latexHtml));
    }
  });

  it('tiếng Việt, hoặc công thức không có bản Anh: trả CHÍNH object cũ, không dựng lại MathML', () => {
    const [, , de] = VIEWS.find(([id]) => id === 'no-tren-von-chu') ?? [];
    const [, , pe] = VIEWS.find(([id]) => id === 'capm') ?? [];
    if (de === undefined || pe === undefined) throw new Error('thiếu dữ liệu');
    expect(notationForLocale(de, 'vi')).toBe(de);
    expect(notationForLocale(pe, 'en')).toBe(pe);
  });
});
