// @vitest-environment jsdom

/**
 * Khối chuỗi WF-04 — bất biến bố cục của lưới ô nhập.
 *
 * Vì sao có file này: khối chuỗi dựng sau khối "Số liệu" của màn chi tiết và đã **bỏ sót** luật
 * "thanh trượt chiếm trọn hàng" mà khối kia có. Hậu quả đo được trên bản build ở khổ 360px: năm
 * thanh trượt của chuỗi WACC rơi vào ô lưới 143px, nhãn vỡ thành nhiều dòng một chữ và ô giá trị
 * 14ch lọt ra ngoài đè lên cột bên cạnh.
 *
 * Luật nay nằm ở `isWideControl()` dùng chung, nhưng "dùng chung" chỉ là ý định — ca kiểm dưới
 * đây mới là thứ giữ nó. `npm run check:chrome` cũng có một ca đo đúng bất biến này trên Chrome
 * thật, nhưng bộ Chrome KHÔNG chạy trong CI, nên phải có bản jsdom ở đây.
 */

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { FORMULA_MODULES, chainFor, runChain } from '@/application';
import type { CalcContext, FormulaSpec } from '@/application';

import { ChainBody } from './ChainBody';

afterEach(cleanup);

const ALL_SPECS: ReadonlyArray<FormulaSpec> = FORMULA_MODULES.map((m) => m.spec);
const CTX: CalcContext = { asOf: '2026-08-04' };

/** Dựng khối chuỗi đúng cách `FormulaDetail` dựng nó, cho một công thức nằm trong chuỗi. */
function dungKhoi(id: string) {
  const specs = chainFor(ALL_SPECS, id);
  expect(specs.length, `${id} phải nằm trong một chuỗi`).toBeGreaterThan(1);

  const modules = specs
    .map((s) => FORMULA_MODULES.find((m) => m.spec.id === s.id))
    .filter((m) => m !== undefined);

  const chain = runChain({ modules, inputs: {}, overrides: {}, ctx: CTX });

  return render(
    <ChainBody
      formulas={specs}
      chain={chain}
      currentId={id}
      inputs={{}}
      overrides={{}}
      onInput={() => undefined}
      onOverride={() => undefined}
      mode="advanced"
    />,
  );
}

/** Ô lưới bọc một điều khiển: con trực tiếp của phần tử mang class `fields`. */
function oLuoiCua(control: Element): Element | null {
  let el: Element | null = control;
  while (el !== null) {
    const cha: HTMLElement | null = el.parentElement;
    if (cha === null) return null;
    if (/fields/.test(String(cha.className))) return el;
    el = cha;
  }
  return null;
}

describe('ChainBody — lưới ô nhập của thẻ bước', () => {
  /*
   * Ba công thức phủ cả hai nhánh của chuỗi: `wacc` ở giữa nhánh CAPM, `gia-tri-noi-tai-fcff` là
   * nút hội tụ hai nhánh (chuỗi dài nhất Registry có), `bien-an-toan` là đuôi nhánh Gordon.
   */
  for (const id of ['wacc', 'gia-tri-noi-tai-fcff', 'bien-an-toan']) {
    it(`${id}: mọi thanh trượt trong thẻ bước chiếm trọn hàng, không nằm chung cột với ô khác`, () => {
      const { container, unmount } = dungKhoi(id);

      const truot = [...container.querySelectorAll('input[type="range"]')];
      expect(truot.length, 'phải có thanh trượt để mà kiểm').toBeGreaterThan(0);

      const hep = truot
        .map((s) => oLuoiCua(s))
        .filter((o) => o !== null && !/fieldWide/.test(String(o.className)))
        .map((o) => String(o?.className));

      expect(hep, `thanh trượt bị nhét vào ô hẹp: ${hep.join(' · ')}`).toEqual([]);
      unmount();
    });
  }

  it('ô số thì KHÔNG chiếm trọn hàng — nếu không lưới hai cột thành một cột', () => {
    // Ca đối chứng: không có nó thì "cho tất cả fieldWide" cũng làm ca trên xanh.
    const { container } = dungKhoi('gia-tri-noi-tai-fcff');

    const oSo = [...container.querySelectorAll('input[inputmode="decimal"], input[type="text"]')]
      .map((el) => oLuoiCua(el))
      .filter((o) => o !== null);

    expect(oSo.length, 'phải có ô số để mà kiểm').toBeGreaterThan(0);
    expect(oSo.some((o) => !/fieldWide/.test(String(o?.className)))).toBe(true);
  });

  it('dải luồng dựng được và nêu đủ các bước của chuỗi', () => {
    dungKhoi('gia-tri-noi-tai-fcff');
    // Bốn bước: capm → wacc, fcff, rồi hội tụ vào gia-tri-noi-tai-fcff.
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(4);
  });
});
