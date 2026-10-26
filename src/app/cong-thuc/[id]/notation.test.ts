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
 * Hình gắn dấu MỌI ký hiệu, không chỉ ký hiệu có khung cách tính — từ 25/09/2026 ở dòng Công thức
 * của lời giải Bài tập, từ 26/10/2026 ở cả thẻ Công thức (chủ dự án: _"ký hiệu nào cũng cần giải
 * thích"_), nên chỉ còn một bản hình. Đo trên cả thư viện: 560 trên 568 dòng bảng tìm được chỗ (546
 * trên 554 trước khi 13 cụm chữ như "Tài sản ngắn hạn" có dòng riêng, 16/10/2026; 559 trên 567 trước
 * dòng `100` của thời gian nhân đôi, cùng ngày); 8 dòng còn lại chỉ nằm lọt trong một tên dài hơn
 * (`D` trong `D/E`…), đúng tám dòng docblock `mathml-marks.ts` đã kể — rê vào đó là mở khung của
 * tên dài hơn.
 */
describe('buildNotationView() — hình gắn dấu mọi ký hiệu', () => {
  it('phủ 560 trên 568 dòng bảng, và dấu nào cũng trỏ tới một dòng có thật', () => {
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
      expect(tong).toBe(568);
      expect(coCho).toBe(560);
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
