// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CATEGORIES } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { CategoryChips } from './CategoryChips';

afterEach(cleanup);

/** Đủ 12 nhóm, cùng một con số cho cả hai chế độ — ca nào cần khác thì tự dựng Map riêng. */
function demDeu(n: number): Map<string, number> {
  return new Map(CATEGORIES.map((category) => [category.id, n]));
}

function mo(props: Partial<Parameters<typeof CategoryChips>[0]> = {}) {
  const onChange = props.onChange ?? vi.fn();
  render(
    <PreferencesProvider>
      <CategoryChips
        value={props.value ?? null}
        onChange={onChange}
        basicCounts={props.basicCounts ?? demDeu(3)}
        allCounts={props.allCounts ?? demDeu(5)}
      />
    </PreferencesProvider>,
  );
  return { onChange };
}

describe('CategoryChips — một nhóm radio, không phải 13 công tắc', () => {
  it('đủ "Tất cả nhóm" + 12 nhóm, chung một name, trong một fieldset có tên', () => {
    mo();

    const nhom = screen.getByRole('group', { name: 'Nhóm công thức' });
    const radios = screen.getAllByRole('radio');

    expect(nhom.tagName).toBe('FIELDSET');
    expect(radios).toHaveLength(CATEGORIES.length + 1);
    expect(new Set(radios.map((r) => r.getAttribute('name'))).size).toBe(1);
  });

  it('không chọn nhóm nào thì "Tất cả nhóm" đang chọn', () => {
    mo();
    expect((screen.getByRole('radio', { name: 'Tất cả nhóm' }) as HTMLInputElement).checked).toBe(
      true,
    );
  });

  it('bấm một nhóm thì báo đúng id; bấm "Tất cả nhóm" thì báo null', () => {
    const { onChange } = mo({ value: 'risk' });

    fireEvent.click(screen.getByRole('radio', { name: /^Định giá/ }));
    expect(onChange).toHaveBeenLastCalledWith('valuation');

    fireEvent.click(screen.getByRole('radio', { name: 'Tất cả nhóm' }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('nhóm đang chọn theo prop value', () => {
    mo({ value: 'risk' });
    expect((screen.getByRole('radio', { name: /^Rủi ro/ }) as HTMLInputElement).checked).toBe(true);
  });
});

describe('CategoryChips — con số', () => {
  /*
   * jsdom không áp CSS Module, nên cả hai nhánh con số cùng nằm trong chữ của chip. Ca này gác
   * việc CẢ HAI được dựng; nhánh nào hiện ra do CSS quyết — xem cụm ca đọc file CSS ở dưới.
   */
  it('mỗi chip nhóm mang cả số của chế độ Cơ bản lẫn số của cả thư viện', () => {
    mo({
      basicCounts: new Map([['valuation', 8]]),
      allCounts: new Map([['valuation', 20]]),
    });

    const chip = screen.getByRole('radio', { name: /^Định giá/ }).closest('label');
    expect(chip?.textContent).toContain('8');
    expect(chip?.textContent).toContain('20');
  });

  it('nhóm mà chế độ Cơ bản giấu sạch thì in chữ, không in số 0', () => {
    mo({
      basicCounts: new Map([['corporate-finance', 0]]),
      allCounts: new Map([['corporate-finance', 2]]),
    });

    const chip = screen.getByRole('radio', { name: /^Tài chính DN/ }).closest('label');
    const nhanhCoBan = chip?.querySelector('span > span:nth-of-type(2)');
    expect(nhanhCoBan?.textContent).toBe('chỉ ở Nâng cao');
  });

  it('rỗng vì chuỗi tìm (cả thư viện cũng 0) thì in số 0 thật', () => {
    mo({
      basicCounts: new Map([['corporate-finance', 0]]),
      allCounts: new Map([['corporate-finance', 0]]),
    });

    const chip = screen.getByRole('radio', { name: /^Tài chính DN/ }).closest('label');
    expect(chip?.textContent).not.toContain('chỉ ở Nâng cao');
  });
});

describe('CategoryChips — hai nút cuộn', () => {
  /*
   * Nút chỉ dành cho chuột: bàn phím đi bằng phím mũi tên trong nhóm radio. Để nó nhận tiêu điểm
   * là thêm hai điểm dừng Tab không làm gì cho người dùng bàn phím.
   */
  it('ẩn khỏi cây trợ năng và không nhận Tab', () => {
    mo();
    const nut = document.querySelectorAll('button');

    expect(nut).toHaveLength(2);
    for (const button of nut) {
      expect(button.getAttribute('aria-hidden')).toBe('true');
      expect(button.getAttribute('tabindex')).toBe('-1');
      expect(button.getAttribute('title')).not.toBe('');
    }
  });

  it('lúc mới dựng: nút lùi tắt vì đang ở đầu hàng', () => {
    mo();
    const [lui] = document.querySelectorAll('button');
    expect((lui as HTMLButtonElement).disabled).toBe(true);
  });

  /*
   * jsdom không dựng bố cục: `clientWidth`, `scrollWidth`, `scrollLeft` đều là 0, tức hàng chip
   * "vừa khít" và cả hai nút tắt. Giả lập một hàng tràn (khung 300px, nội dung 1200px) TRƯỚC khi
   * dựng, rồi gắn `scrollBy` giả vào đúng khung cuộn để kiểm chiều và độ dài của cú cuộn.
   */
  it('nút tới cuộn sang phải 4/5 khung; cuộn khỏi đầu hàng thì nút lùi bật và cuộn ngược lại', () => {
    const goc = {
      client: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'clientWidth'),
      scroll: Object.getOwnPropertyDescriptor(Element.prototype, 'scrollWidth'),
    };
    Object.defineProperty(HTMLElement.prototype, 'clientWidth', {
      configurable: true,
      get: () => 300,
    });
    Object.defineProperty(Element.prototype, 'scrollWidth', {
      configurable: true,
      get: () => 1200,
    });

    try {
      mo();
      const khung = document.querySelector('fieldset')?.parentElement as HTMLDivElement;
      const scrollBy = vi.fn();
      khung.scrollBy = scrollBy as unknown as typeof khung.scrollBy;

      const [lui, toi] = [...document.querySelectorAll('button')] as HTMLButtonElement[];
      expect(toi?.disabled, 'hàng tràn thì nút tới phải bật').toBe(false);
      fireEvent.click(toi as HTMLButtonElement);
      expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: 240 }));

      // Người dùng đã cuộn giữa hàng — khung báo sự kiện cuộn, nút lùi phải bật.
      Object.defineProperty(khung, 'scrollLeft', { configurable: true, get: () => 400 });
      fireEvent.scroll(khung);
      expect(lui?.disabled).toBe(false);
      fireEvent.click(lui as HTMLButtonElement);
      expect(scrollBy).toHaveBeenLastCalledWith(expect.objectContaining({ left: -240 }));
    } finally {
      if (goc.client) Object.defineProperty(HTMLElement.prototype, 'clientWidth', goc.client);
      if (goc.scroll) Object.defineProperty(Element.prototype, 'scrollWidth', goc.scroll);
    }
  });
});

/**
 * Nửa còn lại của cơ chế con số nằm trong CSS — jsdom không đọc CSS Module thật, nên gác bằng cách
 * đọc thẳng file. Cùng cách `ModeToggle.test.tsx` gác cơ chế `data-mode`.
 */
describe('CategoryChips.module.css — chiều của phép chọn theo chế độ', () => {
  const raw = readFileSync(join(process.cwd(), 'src/ui/browse/CategoryChips.module.css'), 'utf8');
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

  it('mặc định (không có thuộc tính) hiện số của chế độ Cơ bản', () => {
    expect(css).toContain(":global(html:not([data-mode='advanced'])) .countBasic");
    expect(css).toContain(":global(html[data-mode='advanced']) .countAdvanced");
  });

  it('không nhánh nào bám vào data-mode="basic" — ca mặc định sẽ rơi mất', () => {
    expect(css).not.toContain("[data-mode='basic']");
  });
});
