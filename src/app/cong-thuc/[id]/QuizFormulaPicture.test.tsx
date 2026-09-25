// @vitest-environment jsdom

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FORMULAS } from '@/application';
import type { FormulaSpec } from '@/application';

import { buildNotationView } from './notation-view';
import { QuizFormulaPicture } from './QuizFormulaPicture';

/**
 * Hình công thức trong khối lời giải của Bài tập (25/09/2026) — rê vào ký hiệu nào cũng mở khung
 * "cách tính" của thẻ Công thức. Chủ dự án chụp khung ấy trên `V` của Biên an toàn và nói "kiểu
 * thế", sau khi bác bảng nghĩa trơn và bảng ký hiệu cố định bên phải.
 *
 * Dùng `bien-an-toan` vì nó có đủ hai loại ký hiệu: `V` có bước tính và liên kết sang Mô hình
 * Gordon, còn `P` là số nhập thẳng — không có bước nào, nhưng vẫn phải mở được khung nghĩa.
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
function pointer(type: 'pointerover' | 'pointerout', target: Element, pointerType: string) {
  const event = new MouseEvent(type, { bubbles: true });
  Object.defineProperty(event, 'pointerType', { value: pointerType });
  act(() => {
    target.dispatchEvent(event);
  });
}

function dungHinh(id: string) {
  const spec = specOf(id);
  const notation = buildNotationView(spec, undefined, { allSymbols: true });
  const view = render(<QuizFormulaPicture spec={spec} notation={notation} />);
  const goc = view.container.firstElementChild as HTMLElement;
  const symbols = spec.symbols ?? [];
  const soCua = (latex: string) => symbols.findIndex((s) => s.latex === latex);
  return { spec, notation, goc, soCua };
}

describe('QuizFormulaPicture', () => {
  it('mọi ký hiệu của bảng đều có điểm chạm trong hình, không chỉ ký hiệu có bước tính', () => {
    const { goc, spec, notation } = dungHinh('bien-an-toan');
    const coDau = new Set(
      [...goc.querySelectorAll('math [data-sym]')].map((el) => el.getAttribute('data-sym')),
    );
    expect(coDau.size).toBe((spec.symbols ?? []).length);
    expect(notation.howTo.length).toBeLessThan(coDau.size);
  });

  it('rê chuột vào ký hiệu có bước tính thì mở ĐÚNG khung của thẻ Công thức', () => {
    vi.useFakeTimers();
    const { goc, soCua } = dungHinh('bien-an-toan');
    const v = soCua('V');
    pointer('pointerover', goc.querySelector(`math [data-sym="${String(v)}"]`) as Element, 'mouse');
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(goc.getAttribute('data-active')).toBe(String(v));
    const khung = goc.querySelector('[role="group"]') as HTMLElement;
    expect(khung.textContent).toContain('giá trị nội tại');
    expect(khung.querySelectorAll('li math').length).toBeGreaterThan(0);
    expect(khung.hasAttribute('data-title-only')).toBe(false);
    expect(khung.querySelector('a')?.getAttribute('href')?.replace(/\/$/, '')).toBe(
      '/cong-thuc/mo-hinh-gordon',
    );
  });

  it('ký hiệu nhập thẳng mở khung chỉ có dòng nghĩa — không bước, không liên kết', () => {
    const { goc, soCua, spec } = dungHinh('bien-an-toan');
    const p = soCua('P');
    fireEvent.click(goc.querySelector(`math [data-sym="${String(p)}"]`) as Element);

    const khung = goc.querySelector('[role="group"]') as HTMLElement;
    expect(khung).not.toBeNull();
    expect(khung.textContent).toContain(spec.symbols?.[p]?.meaning.vi ?? '∅');
    expect(khung.querySelector('ol')).toBeNull();
    expect(khung.querySelector('a')).toBeNull();
    // Khung một dòng co theo chữ thay vì rộng cố định 22rem — CSS bám thuộc tính này.
    expect(khung.hasAttribute('data-title-only')).toBe(true);
    // Không có gì để tính thì nhãn trợ năng không được gọi nó là "Cách tính".
    expect(khung.getAttribute('aria-label')).toBe(spec.symbols?.[p]?.meaning.vi);
  });

  it('bấm lại đúng ký hiệu ấy thì khung đóng', () => {
    const { goc, soCua } = dungHinh('bien-an-toan');
    const cho = goc.querySelector(`math [data-sym="${String(soCua('P'))}"]`) as Element;
    fireEvent.click(cho);
    fireEvent.click(cho);
    expect(goc.querySelector('[role="group"]')).toBeNull();
  });
});
