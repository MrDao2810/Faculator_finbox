import { describe, expect, it } from 'vitest';

import { FORMULA_SUMMARIES } from '@/application';

import { FORMULA_ICONS } from './formula-icons';

/**
 * Bộ hình riêng của 111 công thức (`formula-icons.ts`).
 *
 * Ba lời hứa, cả ba hỏng lặng lẽ nếu không có ca kiểm: công thức mới vào Registry mà quên vẽ thì
 * thẻ của nó lùi về icon nhóm và trông như mọi thẻ cùng nhóm; công thức đổi id thì hình cũ nằm lại
 * mà không ai gọi tới; và hai công thức trùng hình thì hình không còn nói được gì.
 *
 * Ca thứ tư gác chuỗi SVG: nó được nhúng bằng `dangerouslySetInnerHTML`, nên ngoài bốn thẻ vẽ của
 * bộ hình và các thuộc tính trình bày, không thứ gì được lọt vào — nhất là `<script>` và `on…=`.
 */

describe('mỗi công thức trong Registry có đúng một hình', () => {
  it('không công thức nào thiếu hình', () => {
    const thieu = FORMULA_SUMMARIES.map((f) => f.id).filter(
      (id) => FORMULA_ICONS[id] === undefined,
    );
    expect(thieu, 'vẽ thêm hình trong formula-icons.ts').toEqual([]);
  });

  it('bộ hình không giữ id đã biến mất khỏi Registry', () => {
    const known = new Set(FORMULA_SUMMARIES.map((f) => f.id));
    const thua = Object.keys(FORMULA_ICONS).filter((id) => !known.has(id));
    expect(thua, 'xoá hình thừa — công thức này không còn trong Registry').toEqual([]);
  });

  it('không hai công thức nào trùng hình', () => {
    const theoHinh = new Map<string, string>();
    const trung: string[] = [];
    for (const [id, svg] of Object.entries(FORMULA_ICONS)) {
      const khac = theoHinh.get(svg);
      if (khac !== undefined) trung.push(`${khac} = ${id}`);
      theoHinh.set(svg, id);
    }
    expect(trung).toEqual([]);
  });
});

describe('chuỗi SVG chỉ chứa phần vẽ', () => {
  const THE = new Set(['g', 'path', 'circle', 'rect']);
  const THUOC_TINH = new Set([
    'transform',
    'd',
    'cx',
    'cy',
    'r',
    'x',
    'y',
    'width',
    'height',
    'rx',
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'stroke-dasharray',
  ]);

  for (const [id, svg] of Object.entries(FORMULA_ICONS)) {
    it(id, () => {
      const the = [...svg.matchAll(/<\/?([a-zA-Z][\w-]*)/g)].map((m) => m[1] ?? '');
      expect(
        the.filter((t) => !THE.has(t)),
        'thẻ ngoài bộ g/path/circle/rect',
      ).toEqual([]);

      const thuocTinh = [...svg.matchAll(/\s([a-zA-Z][\w:-]*)=/g)].map((m) => m[1] ?? '');
      expect(thuocTinh.filter((a) => !THUOC_TINH.has(a))).toEqual([]);

      // Màu chỉ theo `currentColor`, để icon lấy màu chỗ đặt nó ở cả hai bảng màu.
      const mau = [...svg.matchAll(/\s(?:fill|stroke)="([^"]*)"/g)].map((m) => m[1] ?? '');
      expect(mau.filter((v) => v !== 'currentColor' && v !== 'none')).toEqual([]);

      // Mỗi thẻ đã mở đều đóng (tự đóng hoặc có thẻ đóng), nếu không phần sau bị nuốt vào nó.
      const mo = (svg.match(/<(?!\/)[^>]*[^/]>/g) ?? []).length;
      const dong = (svg.match(/<\//g) ?? []).length;
      expect(mo).toBe(dong);
    });
  }
});
