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

import { FORMULA_MODULES, chainFor, defaultInputs, runChain, t } from '@/application';
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

/**
 * Dựng khối chuỗi đúng cách `FormulaDetail` dựng nó, cho một công thức nằm trong chuỗi.
 *
 * `soMacDinh` nạp số mặc định vào mọi bước, đúng như màn thật lúc mới mở (`defaultInputs`). Bỏ
 * trống thì mọi bước chạy với ô rỗng và ra "_ _": đủ cho ca soi bố cục, không đủ cho ca đọc số.
 */
function dungKhoi(id: string, soMacDinh = false) {
  const specs = chainFor(ALL_SPECS, id);
  expect(specs.length, `${id} phải nằm trong một chuỗi`).toBeGreaterThan(1);

  const modules = specs
    .map((s) => FORMULA_MODULES.find((m) => m.spec.id === s.id))
    .filter((m) => m !== undefined);

  const inputs = soMacDinh
    ? Object.fromEntries(modules.map((m) => [m.spec.id, defaultInputs(m.spec)]))
    : {};
  const chain = runChain({ modules, inputs, overrides: {}, ctx: CTX });

  return render(
    <ChainBody
      formulas={specs}
      chain={chain}
      currentId={id}
      inputs={inputs}
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

  /*
   * Khối từng mở đầu bằng một hình vẽ chuỗi phụ thuộc; bỏ ngày 16/09/2026 (lý do ở docblock
   * `ChainBody.tsx`). Ca này đổi sang ghim thứ THAY nó gánh việc: mọi bước khác của chuỗi đều
   * phải có thẻ riêng, không bước nào bị nuốt mất cùng hình vẽ.
   */
  it('mỗi bước khác của chuỗi có một thẻ riêng', () => {
    const { container } = dungKhoi('gia-tri-noi-tai-fcff');

    const ma = [...container.querySelectorAll('details')].map((d) =>
      d.id.replace(/^chain-step-/, ''),
    );

    // Ba bước cấp số: capm → wacc, và fcff. Bước đang xem không có thẻ — ô của nó ở khối Số liệu.
    expect(ma.sort()).toEqual(['capm', 'fcff', 'wacc']);
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

  /* `bien-an-toan`: hai bước cấp số (`mo-hinh-gordon`, và `capm` cấp gián tiếp qua nó). */
  it('một nhóm hai thẻ: mỗi bên một', () => {
    const { container } = dungKhoi('bien-an-toan');
    const topo = thuTuTopo(container);
    expect(topo).toHaveLength(2);
    expect(cacCot(container)).toEqual([topo.slice(0, 1), topo.slice(1)]);
  });

  /* `fcfe`: đúng một bước cấp số (fcff) — thẻ lẻ loi không kéo theo cột rỗng. */
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

  it('hai cột bằng số thẻ thì kéo bằng mép dưới — 1 | 1 có columnsEven', () => {
    // Registry hiện chỉ còn một ca chẵn: `bien-an-toan` với hai bước cấp số.
    const { container } = dungKhoi('bien-an-toan');
    expect(cacCot(container).map((c) => c.length)).toEqual([1, 1]);
    expect(coCanBang(container)).toBe(true);
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

  /*
   * Khối chỉ còn bày bước CẤP SỐ LIỆU — nửa "Bước sau" bỏ ngày 16/09/2026. `wacc` là ca gọn nhất
   * để ghim: nó vừa có một bước trước (`capm`) vừa có một bước sau (`gia-tri-noi-tai-fcff`), nên
   * bước sau mà rò lại thì ca này đỏ ngay.
   */
  it('chỉ bày bước cấp số liệu, không bày bước dùng kết quả', () => {
    const { container } = dungKhoi('wacc');

    expect(cacCot(container)).toEqual([['capm']]);
    expect(container.textContent).not.toContain('Giá trị nội tại');
  });

  it('không còn tiêu đề nhóm — tiêu đề khối đã gọi tên các thẻ', () => {
    const { container } = dungKhoi('gia-tri-noi-tai-fcff');
    expect(container.querySelectorAll('h3')).toHaveLength(0);
  });
});

/**
 * Thẻ gọi theo tên CON SỐ nó cấp, không theo tên công thức — chủ dự án chốt 17/09/2026, lý do ở
 * docblock `ChainBody.tsx`.
 *
 * Bản trước ghi tên công thức cạnh một con số trần ("CAPM — chi phí vốn chủ sở hữu … 17 %"), và
 * chủ dự án khoanh đỏ đúng con số ấy: người dùng không biết nó ở đâu ra. Ca đầu ghim hình đã duyệt
 * trên trang `bien-an-toan`; các ca sau quét mọi trang có chuỗi, để thẻ nào cũng gọi được tên con số.
 */
describe('ChainBody — thẻ gọi theo tên con số nó cấp', () => {
  /** Ba phần của dòng tóm tắt một thẻ: tên con số, vai của nó, con số. */
  function dongTomTat(container: HTMLElement, formulaId: string) {
    const summary = container.querySelector(`#chain-step-${formulaId} > summary`);
    return {
      ten: summary?.querySelector('[class*="stepName"]')?.textContent ?? null,
      vai: summary?.querySelector('[class*="stepRole"]')?.textContent ?? null,
      so: summary?.querySelector('[class*="stepValue"]')?.textContent ?? null,
    };
  }

  it('bien-an-toan: thẻ mang tên ô nhận số, rồi nói kết quả của công thức nào, dùng cho công thức nào', () => {
    const { container } = dungKhoi('bien-an-toan', true);

    // 3,5 + 1,2 × 8 = 13,1% từ số mặc định của CAPM, chảy vào ô r của Gordon.
    const capm = dongTomTat(container, 'capm');
    expect(capm.ten).toBe('Suất sinh lợi yêu cầu (r)');
    expect(capm.vai).toBe(
      'kết quả của CAPM — chi phí vốn chủ sở hữu, dùng cho Mô hình Gordon (DDM một giai đoạn)',
    );
    expect(capm.so).toContain('13,1');

    // 2.000 × 1,05 ÷ 0,081 = 25.925,93 ₫, chảy vào ô V ở khối Số liệu của chính Biên an toàn.
    const gordon = dongTomTat(container, 'mo-hinh-gordon');
    expect(gordon.ten).toBe('Giá trị nội tại ước tính (V)');
    expect(gordon.vai).toBe(
      'kết quả của Mô hình Gordon (DDM một giai đoạn), dùng cho Biên an toàn',
    );
    expect(gordon.so).toContain('25.925,93');
  });

  const TRANG_CO_CHUOI = ALL_SPECS.filter((spec) => chainFor(ALL_SPECS, spec.id).length > 1).map(
    (spec) => spec.id,
  );

  it('quét được các trang có chuỗi — các ca dưới không được rỗng mà vẫn xanh', () => {
    expect(TRANG_CO_CHUOI.length).toBeGreaterThan(0);
  });

  for (const id of TRANG_CO_CHUOI) {
    it(`${id}: mọi thẻ gọi con số bằng nhãn của ô nhận nó, không bằng tên công thức`, () => {
      const specs = chainFor(ALL_SPECS, id);
      const { container, unmount } = dungKhoi(id, true);

      const buocs = [...container.querySelectorAll('details')].map((d) =>
        d.id.replace(/^chain-step-/, ''),
      );
      expect(buocs.length, `${id}: không có thẻ nào để kiểm`).toBeGreaterThan(0);

      for (const buoc of buocs) {
        const spec = specs.find((s) => s.id === buoc);
        // Nơi nhận: công thức trong chuỗi khai `dependsOn` trỏ vào bước này, cùng ô nhận của nó.
        const noiNhan = specs.flatMap((s) =>
          (s.dependsOn ?? [])
            .filter((d) => d.formulaId === buoc)
            .map((d) => ({
              ten: s.name.vi,
              nhan: s.variables.find((v) => v.key === d.variableKey)?.label.vi ?? '@@',
            })),
        );
        const { ten, vai, so } = dongTomTat(container, buoc);
        const noi = `${id} · ${buoc}`;

        expect(noiNhan.length, `${noi}: không có nơi nhận`).toBeGreaterThan(0);
        expect(ten, noi).not.toBe(spec?.name.vi);
        for (const n of noiNhan) {
          expect(ten, noi).toContain(n.nhan);
          expect(vai, noi).toContain(n.ten);
        }
        expect(vai, noi).toContain(
          `${t('chain.resultOf')} ${spec?.name.vi ?? '@@'}, ${t('chain.usedFor')} `,
        );
        // Luật cũ của dòng tóm tắt vẫn giữ: gập thẻ lại vẫn thấy con số (số mặc định đều tính được).
        expect(so ?? '', `${noi}: dòng tóm tắt mất con số`).toMatch(/\d/);
      }
      unmount();
    });
  }
});
