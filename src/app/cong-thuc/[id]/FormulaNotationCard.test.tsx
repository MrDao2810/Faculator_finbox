// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FORMULAS } from '@/application';
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
  it('HTML tĩnh giống hệt lần mount đầu — không lệch hydration', () => {
    const spec = specOf('ty-so-sharpe');
    const notation = buildNotationView(spec);
    const tinh = renderToStaticMarkup(<FormulaNotationCard spec={spec} notation={notation} />);
    const { container } = render(<FormulaNotationCard spec={spec} notation={notation} />);
    expect(container.innerHTML).toBe(tinh);
  });

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
    expect(dong.textContent).toBe(spec.expression?.vi);
    expect(dong.querySelectorAll('span[data-sym]').length).toBeGreaterThan(0);
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
