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
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FORMULA_MODULES, chainFor, runChain } from '@/application';
import type { CalcContext, FormulaSpec } from '@/application';

import { ChainBody } from './ChainBody';

afterEach(cleanup);

const ALL_SPECS: ReadonlyArray<FormulaSpec> = FORMULA_MODULES.map((m) => m.spec);
const CTX: CalcContext = { asOf: '2026-08-04' };

/**
 * Giả lập khổ màn cho `manRong()` trong `ChainBody`.
 *
 * jsdom KHÔNG cài `matchMedia`, nên mặc định mọi ca kiểm ở file này chạy ở nhánh "màn hẹp" — đúng
 * nếp mà `use-chart-size.ts` đã ghi. Ca nào cần nhánh màn rộng thì gọi hàm này rồi tự dọn.
 */
function gaKhoMan(rong: boolean): () => void {
  const truoc = window.matchMedia;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: vi.fn((query: string) => ({
      matches: rong,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
  return () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      writable: true,
      value: truoc,
    });
  };
}

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

/**
 * Hai cột thẻ bước ở khổ rộng — hai luật chủ dự án chốt 10/09/2026 (docblock `bocNhom()`): chỉ một
 * nhóm thì cắt thẻ của nó làm đôi, lẻ thì cột trái nhiều hơn một; có cả hai nhóm thì mỗi nhóm là
 * một cột. jsdom không dựng bố cục, nên ca kiểm giữ phần CẤU TRÚC: một `.columns` bọc tối đa hai
 * `.column`, thẻ nào ở cột nào và tiêu đề nhóm đứng ở đâu. Chiều cao bằng nhau là việc của CSS —
 * `check:chrome` mới là nơi đo hình thật.
 */
describe('ChainBody — thẻ bước chia hai cột', () => {
  /** Mã bước của từng thẻ trong một cột, theo thứ tự DOM. */
  function maTrongCot(cot: Element): string[] {
    return [...cot.querySelectorAll(':scope > details')].map((d) =>
      d.id.replace(/^chain-step-/, ''),
    );
  }

  /** Các cột của khối: mảng mã bước của từng cột, theo thứ tự trái → phải. */
  function cacCot(container: HTMLElement): string[][] {
    const boc = container.querySelectorAll('[class*="columns"]');
    expect(boc, 'đúng một bọc hai cột cho cả khối').toHaveLength(1);
    return [...(boc[0]?.querySelectorAll('[class*="column"]') ?? [])]
      .filter((c) => !/columns/.test(String(c.className)))
      .map(maTrongCot);
  }

  function thuTuTopo(container: HTMLElement): string[] {
    return [...container.querySelectorAll('details')].map((d) => d.id.replace(/^chain-step-/, ''));
  }

  /* `gia-tri-noi-tai-fcff`: ba bước trước (lẻ), không bước sau. */
  it('một nhóm ba thẻ: trái hai, phải một — trái nhận đúng hai thẻ đầu theo thứ tự topo', () => {
    const { container } = dungKhoi('gia-tri-noi-tai-fcff');
    const topo = thuTuTopo(container);
    expect(topo).toHaveLength(3);
    expect(cacCot(container)).toEqual([topo.slice(0, 2), topo.slice(2)]);
    // Tiêu đề nhóm đứng NGOÀI hai cột, trên cả hai.
    expect(container.querySelectorAll('[class*="column"] h3')).toHaveLength(0);
  });

  /* `capm`: không bước trước, bốn bước sau (chẵn). */
  it('một nhóm bốn thẻ: mỗi bên hai', () => {
    const { container } = dungKhoi('capm');
    const topo = thuTuTopo(container);
    expect(topo).toHaveLength(4);
    expect(cacCot(container)).toEqual([topo.slice(0, 2), topo.slice(2)]);
  });

  /* `fcfe`: một bước trước (fcff), không bước sau — thẻ lẻ loi không kéo theo cột rỗng. */
  it('một nhóm một thẻ: chỉ có cột trái', () => {
    const { container } = dungKhoi('fcfe');
    expect(cacCot(container)).toEqual([['fcff']]);
  });

  /**
   * Luật "hai cột cùng mép dưới" (`.columnsEven`) chỉ bật khi hai cột BẰNG NHAU số thẻ.
   *
   * Chủ dự án gửi ảnh `gia-tri-noi-tai-fcff` (trái 2 thẻ, phải 1 thẻ): ở đó luật này bắt thẻ WACC
   * một mình cao bằng cả hai thẻ bên trái, dư ra đúng một thẻ thành mảng trống trong lòng nó.
   * jsdom không dựng bố cục nên không đo được chiều cao — ca kiểm gác đúng thứ quyết định luật ấy
   * có hiệu lực hay không, tức sự CÓ MẶT của lớp modifier.
   */
  function coCanBang(container: HTMLElement): boolean {
    const boc = container.querySelector('[class*="columns"]');
    return /columnsEven/.test(String(boc?.className ?? ''));
  }

  it('hai cột lệch số thẻ thì KHÔNG kéo bằng mép dưới — 2 | 1 không có columnsEven', () => {
    const { container } = dungKhoi('gia-tri-noi-tai-fcff');
    expect(cacCot(container).map((c) => c.length)).toEqual([2, 1]);
    expect(coCanBang(container)).toBe(false);
  });

  it('hai cột bằng số thẻ thì kéo bằng mép dưới — 2 | 2 và 1 | 1 đều có columnsEven', () => {
    const bonThe = dungKhoi('capm');
    expect(cacCot(bonThe.container).map((c) => c.length)).toEqual([2, 2]);
    expect(coCanBang(bonThe.container)).toBe(true);
    bonThe.unmount();

    const motMotBen = dungKhoi('wacc');
    expect(cacCot(motMotBen.container).map((c) => c.length)).toEqual([1, 1]);
    expect(coCanBang(motMotBen.container)).toBe(true);
  });

  it('chỉ một cột thì không có gì để kéo bằng', () => {
    const { container } = dungKhoi('fcfe');
    expect(coCanBang(container)).toBe(false);
  });

  /**
   * Bước nào MỞ SẴN — chủ dự án chốt 10/09/2026: ở màn web thì mọi thẻ của nhóm "Bước trước" đều
   * bật sẵn. Màn hẹp giữ nếp cũ (chỉ bước cấp số liệu trực tiếp), vì một cột mà mở hết là đẩy phần
   * còn lại của trang xuống rất xa.
   *
   * `gia-tri-noi-tai-fcff` là ca phân biệt được hai nhánh: ba bước trước (`capm`, `fcff`, `wacc`)
   * nhưng `dependsOn` chỉ có hai (`wacc`, `fcff`) — `capm` cấp số liệu GIÁN TIẾP, qua `wacc`.
   */
  function maDangMo(container: HTMLElement): string[] {
    return [...container.querySelectorAll('details[open]')].map((d) =>
      d.id.replace(/^chain-step-/, ''),
    );
  }

  it('màn hẹp: chỉ mở sẵn bước cấp số liệu TRỰC TIẾP', () => {
    // jsdom không có `matchMedia`, tức đúng nhánh màn hẹp — không cần giả lập gì.
    const { container } = dungKhoi('gia-tri-noi-tai-fcff');
    expect(maDangMo(container).sort()).toEqual(['fcff', 'wacc']);
  });

  it('màn rộng: mở sẵn MỌI bước trước, kể cả bước cấp gián tiếp', () => {
    const donDep = gaKhoMan(true);
    try {
      const { container } = dungKhoi('gia-tri-noi-tai-fcff');
      expect(maDangMo(container).sort()).toEqual(['capm', 'fcff', 'wacc']);
    } finally {
      donDep();
    }
  });

  it('màn rộng: bước SAU vẫn gập, không mở lây', () => {
    const donDep = gaKhoMan(true);
    try {
      // `wacc`: một bước trước (capm), một bước sau (gia-tri-noi-tai-fcff).
      const { container } = dungKhoi('wacc');
      expect(maDangMo(container)).toEqual(['capm']);
    } finally {
      donDep();
    }
  });

  /*
   * `wacc`: một bước trước (capm), một bước sau (gia-tri-noi-tai-fcff). Đây là ảnh chủ dự án gửi —
   * cắt đôi từng nhóm thì ra hai thẻ chồng nhau ở nửa trái, "vẫn 1 cột". Nay mỗi nhóm là một cột,
   * tiêu đề nhóm đứng đầu cột của mình.
   */
  it('có cả hai nhóm: Bước trước là cột trái, Bước sau là cột phải, mỗi cột mang tiêu đề riêng', () => {
    const { container } = dungKhoi('wacc');
    expect(cacCot(container)).toEqual([['capm'], ['gia-tri-noi-tai-fcff']]);

    const tieuDe = [...container.querySelectorAll('[class*="column"] > h3')].map(
      (h) => h.textContent,
    );
    expect(tieuDe).toEqual([
      'Bước trước — cấp số liệu cho công thức đang xem',
      'Bước sau — dùng kết quả của công thức đang xem',
    ]);
  });
});
