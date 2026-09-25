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
 * Bản hình gắn dấu MỌI ký hiệu — cho dòng Công thức trong khối lời giải của Bài tập (25/09/2026).
 * Đo trên cả thư viện: 546 trên 554 dòng bảng tìm được chỗ; 8 dòng còn lại chỉ nằm lọt trong một
 * tên dài hơn (`D` trong `D/E`…), đúng tám dòng docblock `mathml-marks.ts` đã kể.
 */
describe('buildNotationView() — bản hình gắn dấu mọi ký hiệu', () => {
  it('chỉ dựng khi được hỏi: trang không có câu cần nó thì không mang thêm byte', () => {
    const spec = canKiem[0];
    if (spec === undefined) throw new Error('không có công thức nào để kiểm');
    expect(buildNotationView(spec).latexHtmlAllSymbols).toBeUndefined();
  });

  it('cả 111 công thức dựng được, gỡ dấu ra đúng từng byte hình gốc, và phủ 546 trên 554 dòng', () => {
    let tong = 0;
    let coCho = 0;
    const lech: string[] = [];
    for (const spec of canKiem) {
      const html =
        buildNotationView(spec, undefined, { allSymbols: true }).latexHtmlAllSymbols ?? '';
      if (unmarkSymbols(html) !== latexToMathml(spec.latex)) lech.push(spec.id);
      const dau = new Set([...html.matchAll(/data-sym="(\d+)"/g)].map((m) => m[1]));
      tong += (spec.symbols ?? []).length;
      coCho += dau.size;
    }
    expect(lech).toEqual([]);
    if (canKiem.length === FORMULAS.length) {
      expect(tong).toBe(554);
      expect(coCho).toBe(546);
    }
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

  it('mỗi khung có ít nhất một điểm chạm trong hình, và dấu chỉ trỏ tới dòng có khung', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      const view = viewOf(spec);
      if (view instanceof Error) continue;
      const coKhung = new Set(view.howTo.map((h) => h.sym));
      for (const sym of coKhung) {
        if (!view.latexHtml.includes(`data-sym="${String(sym)}"`)) {
          sai.push(`${spec.id}: dòng ${String(sym)} không có chỗ trong hình`);
        }
      }
      for (const m of view.latexHtml.matchAll(/data-sym="(\d+)"/g)) {
        if (!coKhung.has(Number(m[1]))) sai.push(`${spec.id}: dấu ${m[1] ?? ''} không có khung`);
      }
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });

  it('ghép các đoạn lại đúng bằng dòng chữ gốc, và đoạn nào cũng trỏ tới dòng có khung', () => {
    const sai: string[] = [];
    for (const spec of canKiem) {
      const view = viewOf(spec);
      if (view instanceof Error) continue;
      const coKhung = new Set(view.howTo.map((h) => h.sym));
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
          if (d.sym !== undefined && !coKhung.has(d.sym)) {
            sai.push(`${spec.id} · ${ngon}: đoạn "${d.text}" trỏ tới dòng không có khung`);
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
