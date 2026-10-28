// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FORMULAS, t } from '@/application';
import type { FormulaSpec } from '@/application';
import { HOW_TO } from '@/application/how-to';

import { FormulaNotationCard } from './FormulaNotationCard';
import { buildNotationView } from './notation-view';

/**
 * Thẻ Công thức và khung "cách tính" (17/09/2026) — phần HÀNH VI trong trình duyệt giả.
 *
 * Dữ liệu và phần dựng lúc build đã có cửa gác riêng (`how-to.test.ts`, `notation.test.ts`); ở đây
 * gác những thứ chỉ lộ ra khi component chạy: HTML tĩnh khớp lần mount đầu, các nút MathML không bị
 * thay giữa chừng, và bốn cách mở/đóng khung.
 */

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function specOf(id: string): FormulaSpec {
  const spec = FORMULAS.find((formula) => formula.id === id);
  if (spec === undefined) throw new Error(`không có công thức ${id}`);
  return spec;
}

/** jsdom không có `PointerEvent` đầy đủ — dựng sự kiện con trỏ có `pointerType` bằng tay. */
function pointer(
  type: 'pointerover' | 'pointerout',
  target: Element,
  pointerType: string,
  related?: Element,
) {
  const event = new MouseEvent(type, { bubbles: true, relatedTarget: related ?? null });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  act(() => {
    target.dispatchEvent(event);
  });
}

function dungThe(id: string) {
  const spec = specOf(id);
  const notation = buildNotationView(spec);
  const view = render(<FormulaNotationCard spec={spec} notation={notation} />);
  const card = view.container.firstElementChild as HTMLElement;
  return { spec, notation, card, ...view };
}

describe('FormulaNotationCard — dựng', () => {
  /*
   * `ty-so-sortino` có hai vế: nút chữ xuống dòng giữa hai vế là chỗ dễ lệch hydrate nhất.
   *
   * Phải chuẩn hoá thẻ rỗng trước khi so: hình có `\quad` sinh `<mspace width="1em">`, mà
   * `renderToStaticMarkup` in thẻ ấy dạng tự đóng còn `innerHTML` của jsdom in dạng mở rồi đóng.
   * Khác nhau ở BỘ IN CHUỖI, không phải khác nhau ở cây DOM — React hydrate so nút, không so chuỗi.
   */
  const chuanHoa = (html: string) => html.replace(/<(\w+)([^>]*?)\/>/gu, '<$1$2></$1>');

  it.each(['ty-so-sharpe', 'ty-so-sortino'])(
    'HTML tĩnh giống hệt lần mount đầu — không lệch hydration (%s)',
    (id) => {
      const spec = specOf(id);
      const notation = buildNotationView(spec);
      const tinh = renderToStaticMarkup(<FormulaNotationCard spec={spec} notation={notation} />);
      const { container } = render(<FormulaNotationCard spec={spec} notation={notation} />);
      expect(chuanHoa(container.innerHTML)).toBe(chuanHoa(tinh));
    },
  );

  it('giữ đúng cấu trúc mà verify-static và check:chrome bám vào', () => {
    const { card } = dungThe('ty-so-sharpe');
    expect(card.children).toHaveLength(2);
    const formula = card.querySelector('.katex')?.parentElement;
    expect(formula?.nextElementSibling?.tagName).toBe('P');
    for (const dt of card.querySelectorAll('dt')) {
      expect(dt.innerHTML.startsWith('<span class="katex">')).toBe(true);
    }
  });

  it('nút MathML không bị thay khi render lại hay khi mở khung', () => {
    const { spec, notation, card, rerender } = dungThe('ty-so-sharpe');
    const math = card.querySelector('math');
    const dtMath = card.querySelector('dt math');

    rerender(<FormulaNotationCard spec={spec} notation={notation} />);
    const nut = card.querySelector('button[data-sym]') as HTMLButtonElement;
    fireEvent.click(nut);

    expect(card.querySelector('math')).toBe(math);
    expect(card.querySelector('dt math')).toBe(dtMath);
  });

  it('dòng chữ tách đoạn vẫn đọc ra đúng dòng chữ gốc, cụm có khung mang data-sym', () => {
    const { spec, card } = dungThe('ty-so-sharpe');
    const dong = card.querySelector('p') as HTMLElement;
    /*
     * `toBe` chứ không `toContain`, và phép so này nay mang thêm một nghĩa: giữa hai vế có một nút
     * chữ xuống dòng THẬT, nên chỗ ngắt sống sót vào DOM và chép ra ngoài được hai dòng. Ai dọn nút
     * chữ ấy đi sẽ làm đỏ đúng ở đây.
     */
    expect(dong.textContent).toBe(spec.expression?.vi);
    expect(dong.querySelectorAll('span[data-sym]').length).toBeGreaterThan(0);
  });
});

/**
 * Hình nhiều vế thì dòng chữ nhiều dòng (luật 6, 18/09/2026). Ba ca ở trên đều chạy trên công thức
 * MỘT vế, nên đường nhiều dòng có hỏng hẳn chúng vẫn xanh — đây là chỗ gác nó.
 *
 * jsdom không tính CSS Module nên việc XUỐNG DÒNG THẬT trên màn do `check:chrome` đo; ở đây gác
 * phần dựng: số khối `[data-eq]`, `data-lines`, và chữ ghép lại đúng nguyên văn dữ liệu.
 */
describe('FormulaNotationCard — hình nhiều vế, chữ nhiều dòng', () => {
  it('ty-so-sortino: hai vế thành hai khối, mỗi khối một công thức', () => {
    const { spec, card } = dungThe('ty-so-sortino');
    const dong = card.querySelector('p') as HTMLElement;
    const ve = [...dong.querySelectorAll('[data-eq]')];

    expect(dong.getAttribute('data-lines')).toBe('2');
    expect(ve).toHaveLength(2);
    expect(ve.map((el) => el.textContent).join('\n')).toBe(spec.expression?.vi);
    for (const el of ve) {
      expect(el.textContent).toContain('=');
      expect(el.textContent).not.toContain(', với');
    }
  });

  it('cả 111 công thức: số khối đúng bằng số dòng của dữ liệu, chữ không xê một ký tự', () => {
    const sai: string[] = [];
    for (const spec of FORMULAS) {
      const { container, unmount } = render(
        <FormulaNotationCard spec={spec} notation={buildNotationView(spec)} />,
      );
      const dong = container.querySelector('p') as HTMLElement;
      const soDong = (spec.expression?.vi ?? '').split('\n').length;
      const soKhoi = dong.querySelectorAll('[data-eq]').length;
      if (soKhoi !== soDong) sai.push(`${spec.id}: ${String(soKhoi)} khối, ${String(soDong)} dòng`);
      if (dong.textContent !== spec.expression?.vi) sai.push(`${spec.id}: chữ khác dữ liệu`);
      if (dong.getAttribute('data-lines') !== String(soDong)) {
        sai.push(`${spec.id}: data-lines sai`);
      }
      unmount();
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});

describe('FormulaNotationCard — mở và đóng khung', () => {
  it('bấm nút nghĩa ở bảng ký hiệu thì khung mở, tô sáng, bấm lại thì đóng', () => {
    const { card, notation } = dungThe('ty-so-sharpe');
    const dau = notation.howTo[0];
    expect(dau).toBeDefined();
    const nut = card.querySelector(`button[data-sym="${String(dau?.sym)}"]`) as HTMLButtonElement;

    fireEvent.click(nut);
    expect(nut.getAttribute('aria-expanded')).toBe('true');
    expect(card.getAttribute('data-active')).toBe(String(dau?.sym));
    const khung = card.querySelector('[role="group"]') as HTMLElement;
    expect(khung).not.toBeNull();
    expect(nut.getAttribute('aria-controls')).toBe(khung.id);
    expect(khung.querySelectorAll('li math')).toHaveLength(dau?.steps.length ?? 0);

    fireEvent.click(nut);
    expect(card.querySelector('[role="group"]')).toBeNull();
    expect(card.hasAttribute('data-active')).toBe(false);
  });

  it('khung có liên kết thì trỏ đúng trang công thức riêng', () => {
    const { card, notation } = dungThe('ty-so-sharpe');
    const coLienKet = notation.howTo.find((h) => h.formula !== undefined);
    expect(coLienKet).toBeDefined();
    fireEvent.click(card.querySelector(`button[data-sym="${String(coLienKet?.sym)}"]`) as Element);
    const link = card.querySelector('[role="group"] a');
    // `next/link` ngoài cấu hình `trailingSlash` của bản build bỏ dấu `/` cuối — so phần đường dẫn.
    expect(link?.getAttribute('href')?.replace(/\/$/, '')).toBe(
      `/cong-thuc/${coLienKet?.formula?.id ?? ''}`,
    );
  });

  it('rê chuột vào ký hiệu trong hình thì mở sau một nhịp, rời chuột thì tắt sau một nhịp', () => {
    vi.useFakeTimers();
    const { card, notation } = dungThe('ty-so-sharpe');
    const sym = notation.howTo[0]?.sym ?? -1;
    const trongHinh = card.querySelector(`math [data-sym="${String(sym)}"]`) as Element;
    expect(trongHinh).not.toBeNull();

    pointer('pointerover', trongHinh, 'mouse');
    expect(card.querySelector('[role="group"]')).toBeNull();
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(card.getAttribute('data-active')).toBe(String(sym));

    pointer('pointerout', trongHinh, 'mouse', card.querySelector('dl') ?? undefined);
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(card.querySelector('[role="group"]')).toBeNull();
  });

  it('rê qua bằng ngón tay không mở gì — chạm mới mở, và khung được ghim', () => {
    vi.useFakeTimers();
    const { card, notation } = dungThe('ty-so-sharpe');
    const sym = notation.howTo[0]?.sym ?? -1;
    const trongHinh = card.querySelector(`math [data-sym="${String(sym)}"]`) as Element;

    pointer('pointerover', trongHinh, 'touch');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(card.querySelector('[role="group"]')).toBeNull();

    fireEvent.click(trongHinh);
    pointer('pointerout', trongHinh, 'touch');
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(card.getAttribute('data-active')).toBe(String(sym));
  });

  /*
   * 26/10/2026, chủ dự án: _"hiện tại đang chỉ chú thích những ký hiệu khó hiểu, tôi muốn ký hiệu nào
   * cũng cần giải thích"_. `bien-an-toan` có đủ hai loại: `V` có bước tính, `P` là số nhập thẳng.
   */
  it('ký hiệu nhập thẳng trong hình cũng mở khung — chỉ dòng nghĩa, không bước, không liên kết', () => {
    const { card, spec } = dungThe('bien-an-toan');
    const p = (spec.symbols ?? []).findIndex((s) => s.latex === 'P');
    const trongHinh = card.querySelector(`math [data-sym="${String(p)}"]`) as Element;
    expect(trongHinh).not.toBeNull();

    fireEvent.click(trongHinh);
    const khung = card.querySelector('[role="group"]') as HTMLElement;
    expect(khung).not.toBeNull();
    expect(card.getAttribute('data-active')).toBe(String(p));
    expect(khung.textContent).toContain(spec.symbols?.[p]?.meaning.vi ?? '∅');
    expect(khung.querySelector('ol')).toBeNull();
    expect(khung.querySelector('a')).toBeNull();
    expect(khung.hasAttribute('data-title-only')).toBe(true);
    expect(khung.getAttribute('aria-label')).toBe(spec.symbols?.[p]?.meaning.vi);

    fireEvent.click(trongHinh);
    expect(card.querySelector('[role="group"]')).toBeNull();
  });

  /*
   * 28/10/2026, chủ dự án khoanh "Thị giá", "100%" ở dòng chữ và hai dòng `P`, `100%` của bảng Biên
   * an toàn: _"đang chưa hover vào để bật popup lên được như những phần khác, sửa toàn bộ công thức
   * liên quan"_. Ca đảo chiều của "ở bảng, dòng ấy vẫn là chữ thường" (26/10/2026).
   */
  it('dòng chữ và bảng ký hiệu: ký hiệu không có bước tính cũng mở khung, như hình', () => {
    const { card, spec } = dungThe('bien-an-toan');
    const so = (latex: string) => (spec.symbols ?? []).findIndex((s) => s.latex === latex);

    for (const [latex, cum] of [
      ['P', 'Thị giá'],
      ['100\\%', '100%'],
      ['MOS', 'Biên an toàn'],
    ] as const) {
      const sym = String(so(latex));
      const doan = card.querySelector(`p span[data-sym="${sym}"]`);
      expect(doan?.textContent, latex).toBe(cum);
      const nut = card.querySelector(`dl button[data-sym="${sym}"]`) as HTMLButtonElement;
      expect(nut, latex).not.toBeNull();

      for (const cho of [doan as Element, nut]) {
        fireEvent.click(cho);
        const khung = card.querySelector('[role="group"]') as HTMLElement;
        expect(khung.hasAttribute('data-title-only'), latex).toBe(true);
        expect(khung.getAttribute('aria-label')).toBe(spec.symbols?.[Number(sym)]?.meaning.vi);
        fireEvent.click(cho);
        expect(card.querySelector('[role="group"]')).toBeNull();
      }
    }
  });

  it('chạm ra ngoài thì khung đang ghim đóng', () => {
    const { card } = dungThe('ty-so-sharpe');
    fireEvent.click(card.querySelector('button[data-sym]') as Element);
    expect(card.querySelector('[role="group"]')).not.toBeNull();

    fireEvent.pointerDown(document.body);
    expect(card.querySelector('[role="group"]')).toBeNull();
  });

  it('Esc đóng khung và trả focus về nút ở bảng ký hiệu', () => {
    const { card } = dungThe('ty-so-sharpe');
    const nut = card.querySelector('button[data-sym]') as HTMLButtonElement;
    nut.focus();
    fireEvent.click(nut);
    expect(card.querySelector('[role="group"]')).not.toBeNull();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(card.querySelector('[role="group"]')).toBeNull();
    expect(document.activeElement).toBe(nut);
  });
});

describe('FormulaNotationCard — cả 111 công thức', () => {
  /*
   * Mọi dòng bảng là một nút (28/10/2026) — trước đó chỉ dòng có khung cách tính, nên ca này từng đếm
   * nút bằng số khung đã khai. Dòng có khung mở khung đủ bước, dòng còn lại khung chỉ có nghĩa.
   */
  it('mọi dòng bảng ký hiệu là một nút, mở đúng loại khung và đúng nghĩa', () => {
    const sai: string[] = [];
    for (const spec of FORMULAS) {
      const notation = buildNotationView(spec);
      const coBuoc = new Set(notation.howTo.map((h) => h.sym));
      const { container, unmount } = render(
        <FormulaNotationCard spec={spec} notation={notation} />,
      );
      const card = container.firstElementChild as HTMLElement;
      const nut = [...card.querySelectorAll('dl button[data-sym]')];
      const soDong = spec.symbols?.length ?? 0;
      if (nut.length !== soDong) {
        sai.push(`${spec.id}: ${String(nut.length)} nút, ${String(soDong)} dòng`);
      }
      for (const n of nut) {
        const sym = Number(n.getAttribute('data-sym'));
        fireEvent.click(n);
        const khung = card.querySelector('[role="group"]');
        if (khung === null) {
          sai.push(`${spec.id}: nút dòng ${String(sym)} không mở khung`);
          continue;
        }
        if (!(khung.textContent ?? '').includes(spec.symbols?.[sym]?.meaning.vi ?? '∅'))
          sai.push(`${spec.id}: nút dòng ${String(sym)} sai nghĩa`);
        if (khung.hasAttribute('data-title-only') === coBuoc.has(sym))
          sai.push(`${spec.id}: nút dòng ${String(sym)} sai loại khung`);
        fireEvent.click(n);
      }
      unmount();
    }
    expect(sai, sai.join('\n')).toEqual([]);
    expect(Object.keys(HOW_TO)).toHaveLength(FORMULAS.length);
  });

  /*
   * Cụm nào ở dòng chữ cũng mở khung mang đúng nghĩa của dòng nó trỏ tới (28/10/2026). Đếm trên cả
   * thư viện để thấy ngay khi một cụm rơi mất: tiếng Việt và tiếng Anh phải phủ cùng các dòng.
   *
   * 481 trên 568 dòng bảng có cụm ở dòng chữ (trước ngày ấy 101 — chỉ dòng có khung cách tính). 87
   * dòng còn lại không có chữ riêng nào để rê: chỉ số chạy (`t`, `i`, `k`), phép tính gộp mà từng phần
   * đã là cụm riêng (`(1 - t)`, `(1 + r)^n`, `n - 1`), ký hiệu nằm lọt trong tên dài hơn (`n` trong
   * "Giá của n phiên trước", `D` trong `D/E`), hay dòng hình có mà chữ không nhắc (`F_{mua}` của Lợi
   * nhuận ròng, gộp trong "Tổng chi phí"). Rê vào hình hay bảng vẫn mở khung của chúng.
   */
  it('bấm vào bất kỳ cụm nào ở dòng chữ cũng mở khung mang đúng nghĩa của nó', () => {
    const sai: string[] = [];
    let soDongCoCum = 0;
    for (const spec of FORMULAS) {
      const notation = buildNotationView(spec);
      const coBuoc = new Set(notation.howTo.map((h) => h.sym));
      const dongVi = new Set(
        notation.expression.vi.flat().flatMap((d) => (d.sym === undefined ? [] : [d.sym])),
      );
      const dongEn = new Set(
        notation.expression.en.flat().flatMap((d) => (d.sym === undefined ? [] : [d.sym])),
      );
      if ([...dongVi].sort().join() !== [...dongEn].sort().join()) {
        sai.push(`${spec.id}: cụm tiếng Việt và tiếng Anh không phủ cùng các dòng`);
      }
      soDongCoCum += dongVi.size;

      const { container, unmount } = render(
        <FormulaNotationCard spec={spec} notation={notation} />,
      );
      const card = container.firstElementChild as HTMLElement;
      for (const doan of card.querySelectorAll('p span[data-sym]')) {
        const sym = Number(doan.getAttribute('data-sym'));
        fireEvent.click(doan);
        const khung = card.querySelector('[role="group"]');
        if (khung === null) {
          sai.push(`${spec.id}: cụm "${doan.textContent ?? ''}" không mở khung`);
          continue;
        }
        if (!(khung.textContent ?? '').includes(spec.symbols?.[sym]?.meaning.vi ?? '∅'))
          sai.push(`${spec.id}: cụm "${doan.textContent ?? ''}" sai nghĩa`);
        if (khung.hasAttribute('data-title-only') === coBuoc.has(sym))
          sai.push(`${spec.id}: cụm "${doan.textContent ?? ''}" sai loại khung`);
        fireEvent.click(doan);
      }
      unmount();
    }
    expect(sai, sai.join('\n')).toEqual([]);
    expect(soDongCoCum).toBe(481);
  });

  /*
   * Ký hiệu nào trong hình cũng mở khung mang đúng nghĩa của dòng ấy (26/10/2026). Ký hiệu có bước
   * tính thì khung có bước; ký hiệu còn lại thì khung chỉ có dòng nghĩa. 8 dòng của cả thư viện không
   * có chỗ riêng trong hình (nằm lọt trong tên dài hơn) — `notation.test.ts` đếm chúng.
   */
  it('bấm vào bất kỳ ký hiệu nào trong hình cũng mở khung mang đúng nghĩa của nó', () => {
    const sai: string[] = [];
    for (const spec of FORMULAS) {
      const notation = buildNotationView(spec);
      const coBuoc = new Set(notation.howTo.map((h) => h.sym));
      const { container, unmount } = render(
        <FormulaNotationCard spec={spec} notation={notation} />,
      );
      const card = container.firstElementChild as HTMLElement;
      const dau = new Set(
        [...card.querySelectorAll('math [data-sym]')].map((el) => el.getAttribute('data-sym')),
      );
      for (const k of dau) {
        const sym = Number(k);
        const cho = card.querySelector(`math [data-sym="${String(k)}"]`) as Element;
        fireEvent.click(cho);
        const khung = card.querySelector('[role="group"]');
        const nghia = spec.symbols?.[sym]?.meaning.vi ?? '∅';
        if (khung === null) {
          sai.push(`${spec.id}: dòng ${String(sym)} không mở khung`);
          continue;
        }
        if (!(khung.textContent ?? '').includes(nghia))
          sai.push(`${spec.id}: dòng ${String(sym)} sai nghĩa`);
        if (khung.hasAttribute('data-title-only') === coBuoc.has(sym)) {
          sai.push(`${spec.id}: dòng ${String(sym)} sai loại khung`);
        }
        fireEvent.click(cho);
      }
      unmount();
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});

/**
 * Nút ẩn/hiện bảng ký hiệu ở khổ điện thoại (17/09/2026). jsdom không có media query nên ca kiểm
 * gác phần TRẠNG THÁI (lớp ẩn, chữ nút, `aria-expanded`); ẩn thật ở dưới 1024px và nút biến mất ở
 * PC là việc của CSS, đo ở `check:chrome`.
 */
describe('FormulaNotationCard — nút ẩn bảng ký hiệu', () => {
  function nutAn(card: HTMLElement) {
    const bang = card.querySelector('dl') as HTMLElement;
    const nut = card.querySelector(`button[aria-controls="${bang.id}"]`) as HTMLButtonElement;
    return { bang, nut };
  }

  it('bấm thì bảng mang lớp ẩn, chữ nút vẫn là "Chú thích", bấm lại thì bảng hiện', () => {
    const { card } = dungThe('fcfe');
    const { bang, nut } = nutAn(card);
    expect(nut).not.toBeNull();
    expect(nut.getAttribute('aria-expanded')).toBe('true');
    expect(nut.textContent).toBe(t('detail.symbols.toggle'));
    expect(bang.className).not.toMatch(/legendHidden/);

    fireEvent.click(nut);
    expect(bang.className).toMatch(/legendHidden/);
    expect(nut.getAttribute('aria-expanded')).toBe('false');
    // Chủ dự án bỏ cặp "Ẩn/Hiện ký hiệu": một chữ cho cả hai trạng thái, trạng thái nằm ở `aria-expanded`.
    expect(nut.textContent).toBe(t('detail.symbols.toggle'));

    fireEvent.click(nut);
    expect(bang.className).not.toMatch(/legendHidden/);
    expect(nut.getAttribute('aria-expanded')).toBe('true');
  });

  it('bảng đang ẩn mà chạm ký hiệu trong hình thì khung dựng NGOÀI bảng, không bị ẩn theo', () => {
    const { card, notation } = dungThe('ty-so-sharpe');
    const { bang, nut } = nutAn(card);
    fireEvent.click(nut);

    const sym = notation.howTo[0]?.sym ?? -1;
    fireEvent.click(card.querySelector(`math [data-sym="${String(sym)}"]`) as Element);
    const khung = card.querySelector('[role="group"]');
    expect(khung).not.toBeNull();
    expect(bang.contains(khung)).toBe(false);
  });

  it('bấm ẩn bảng lúc khung đang mở thì khung đóng', () => {
    const { card } = dungThe('ty-so-sharpe');
    const { nut } = nutAn(card);
    fireEvent.click(card.querySelector('dl button[data-sym]') as Element);
    expect(card.querySelector('[role="group"]')).not.toBeNull();

    fireEvent.click(nut);
    expect(card.querySelector('[role="group"]')).toBeNull();
  });
});
