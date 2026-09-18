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
  it('số nút ở bảng ký hiệu đúng bằng số khung cách tính đã khai', () => {
    const sai: string[] = [];
    for (const spec of FORMULAS) {
      const notation = buildNotationView(spec);
      const { container, unmount } = render(
        <FormulaNotationCard spec={spec} notation={notation} />,
      );
      const soNut = container.querySelectorAll('dl button[data-sym]').length;
      const soKhung = HOW_TO[spec.id]?.entries.length ?? 0;
      if (soNut !== soKhung) sai.push(`${spec.id}: ${String(soNut)} nút, ${String(soKhung)} khung`);
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
