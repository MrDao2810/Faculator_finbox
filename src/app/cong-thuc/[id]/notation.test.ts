import { describe, expect, it } from 'vitest';

import { FORMULAS } from '@/application';
import type { FormulaSpec } from '@/application';

import { latexToMathml } from './latex-html';
import { unmarkSymbols } from './mathml-marks';
import { buildNotationView } from './notation-view';
import type { NotationView } from './notation-types';

/**
 * Thẻ Công thức dựng lúc build — hình có gắn dấu, dòng chữ tách đoạn, khung cách tính.
 *
 * Phần DỮ LIỆU của khung cách tính gác ở `src/core/how-to/how-to.test.ts`; ở đây gác phần DỰNG,
 * thứ chỉ kiểm được khi có KaTeX: ký hiệu có khung phải tìm được chỗ trong hình, cụm chữ phải ghép
 * lại đúng dòng chữ, và gắn dấu không được đổi một byte nào khác của hình.
 *
 * `FFB_HOWTO_IDS=id1,id2` thu về vài công thức, cùng nghĩa với cửa gác dữ liệu.
 */

const chiKiem = process.env.FFB_HOWTO_IDS?.split(',')
  .map((id) => id.trim())
  .filter((id) => id !== '');
const canKiem: ReadonlyArray<FormulaSpec> =
  chiKiem === undefined ? FORMULAS : FORMULAS.filter((spec) => chiKiem.includes(spec.id));

/** Số ô tô sáng dựng sẵn trong CSS (`[data-active='k'] [data-sym='k']`, k từ 0). */
const SO_O_TO_SANG = 12;

const views = new Map<string, NotationView | Error>();
function viewOf(spec: FormulaSpec): NotationView | Error {
  let view = views.get(spec.id);
  if (view === undefined) {
    try {
      view = buildNotationView(spec);
    } catch (error) {
      view = error as Error;
    }
    views.set(spec.id, view);
  }
  return view;
}

/*
 * Hình chỉ gắn dấu ký hiệu CÓ khung cách tính (`FormulaHowTo.entries`) — ĐẢO lại 04/11/2026. Từ
 * 25/09/2026 (dòng Công thức của lời giải Bài tập) rồi 26/10/2026 (thẻ Công thức, chủ dự án: _"ký
 * hiệu nào cũng cần giải thích"_) hình từng gắn dấu MỌI ký hiệu; chủ dự án xem thẻ CAPM, bấm vào
 * dòng `r_e` (chính kết quả) và thấy khung chỉ lặp lại dòng bảng đã in sẵn cạnh nó — _"đang có những
 * ký hiệu đơn giản có chú thích ở dưới rồi nên không cần bấm vào để hiện chú thích nữa"_, nên chỉ
 * dòng có bước tính thật còn được gắn dấu. Đo trên cả thư viện: 113 dòng có khung, tất cả đều tìm
 * được chỗ trong hình (đúng số `entries` của cả thư viện — `how-to.test.ts` gác phần dữ liệu).
 */
describe('buildNotationView() — hình chỉ gắn dấu ký hiệu có khung cách tính', () => {
  it('113 dòng có khung đều tìm được chỗ, và dấu nào cũng trỏ tới một dòng có thật', () => {
    let tong = 0;
    let coCho = 0;
    const sai: string[] = [];
    for (const spec of canKiem) {
      const view = viewOf(spec);
      if (view instanceof Error) continue;
      const soDong = (spec.symbols ?? []).length;
      const dau = new Set(
        [...view.latexHtml.matchAll(/data-sym="(\d+)"/g)].map((m) => Number(m[1])),
      );
      for (const sym of dau) {
        if (!(sym >= 0 && sym < soDong)) sai.push(`${spec.id}: dấu ${String(sym)} ngoài bảng`);
      }
      tong += soDong;
      coCho += dau.size;
    }
    expect(sai, sai.join('\n')).toEqual([]);
    if (canKiem.length === FORMULAS.length) {
      // 568 → 570 ngày 13/11/2026: `gia-tri-noi-tai-fcff` thêm hai dòng bảng ký hiệu (D, Tiền mặt).
      expect(tong).toBe(571);
      expect(coCho).toBe(113);
    }
  });
});

/*
 * Khung cách tính có liên kết in "Xem công thức CAPM": tên đích là phần TRƯỚC gạch nối có cách hai bên,
 * không kèm phần mô tả. Phép cắt này được sửa bằng máy trong lượt đổi gạch dài thành gạch nối
 * (02/11/2026) mà không ca nào giữ; cắt hỏng thì khung in nguyên "CAPM - chi phí vốn chủ sở hữu".
 */
describe('buildNotationView() — tên công thức đích trong khung cách tính', () => {
  it('chỉ là ký hiệu trước " - ", ở cả hai ngôn ngữ', () => {
    const sai: string[] = [];
    let coMoTa = 0;
    for (const spec of canKiem) {
      const view = viewOf(spec);
      if (view instanceof Error) continue;
      for (const khung of view.howTo) {
        if (khung.formula === undefined) continue;
        const dich = FORMULAS.find((f) => f.id === khung.formula?.id);
        for (const ngon of ['vi', 'en'] as const) {
          const day = dich?.name[ngon] ?? '';
          if (day.includes(' - ')) coMoTa += 1;
          const ten = khung.formula.name[ngon];
          if (ten !== day.split(' - ')[0] || ten.includes(' - ')) {
            sai.push(`${spec.id} → ${khung.formula.id} (${ngon}): "${ten}"`);
          }
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
    // Có ít nhất một đích mang phần mô tả, nên ca này thật sự thử phép cắt.
    if (canKiem.length === FORMULAS.length) expect(coMoTa).toBeGreaterThan(0);
  });
});

describe('buildNotationView() — thẻ Công thức dựng lúc build', () => {
  it('dựng được thẻ, không ném lỗi', () => {
    const hong = canKiem.flatMap((spec) => {
      const view = viewOf(spec);
      return view instanceof Error ? [`${spec.id}: ${view.message}`] : [];
    });
    expect(hong, hong.join('\n')).toEqual([]);
  });

  it('gỡ dấu ra đúng từng byte của hình KaTeX gốc', () => {
    const lech = canKiem.filter((spec) => {
      const view = viewOf(spec);
      return (
        !(view instanceof Error) && unmarkSymbols(view.latexHtml) !== latexToMathml(spec.latex)
      );
    });
    expect(lech.map((s) => s.id)).toEqual([]);
  });

  it('mỗi khung cách tính có ít nhất một điểm chạm trong hình', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      const view = viewOf(spec);
      if (view instanceof Error) continue;
      for (const { sym } of view.howTo) {
        if (!view.latexHtml.includes(`data-sym="${String(sym)}"`)) {
          sai.push(`${spec.id}: dòng ${String(sym)} không có chỗ trong hình`);
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  /*
   * Từ 28/10/2026 đoạn chữ của dòng KHÔNG có khung cũng là điểm chạm (`skippedPhrases`), nên phép so
   * là "dòng có thật của bảng", không còn là "dòng có khung".
   */
  it('ghép các đoạn lại đúng bằng dòng chữ gốc, và đoạn nào cũng trỏ tới một dòng của bảng', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      const view = viewOf(spec);
      if (view instanceof Error) continue;
      const soDong = (spec.symbols ?? []).length;
      for (const ngon of ['vi', 'en'] as const) {
        const dong = view.expression[ngon];
        /*
         * Ghép DÒNG bằng ký tự xuống dòng, ghép ĐOẠN trong dòng bằng chuỗi rỗng: phép cắt dòng
         * (luật 6) không được làm mất hay thêm một ký tự nào so với dữ liệu gốc.
         */
        const ghep = dong.map((d) => d.map((s) => s.text).join('')).join('\n');
        if (ghep !== (spec.expression?.[ngon] ?? '')) {
          sai.push(`${spec.id} · ${ngon}: ghép đoạn không ra dòng chữ gốc`);
        }
        for (const d of dong.flat()) {
          if (d.text.includes('\n'))
            sai.push(`${spec.id} · ${ngon}: đoạn còn sót ký tự xuống dòng`);
          if (d.sym !== undefined && !(d.sym >= 0 && d.sym < soDong)) {
            sai.push(`${spec.id} · ${ngon}: đoạn "${d.text}" trỏ ra ngoài bảng ký hiệu`);
          }
        }
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it(`bảng ký hiệu không dài hơn ${String(SO_O_TO_SANG)} dòng — số ô tô sáng dựng sẵn trong CSS`, () => {
    const dai = canKiem.filter((spec) => (spec.symbols ?? []).length > SO_O_TO_SANG);
    expect(dai.map((s) => s.id)).toEqual([]);
  });
});
