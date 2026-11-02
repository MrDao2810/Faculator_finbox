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
  it('đủ "Tất cả" + 12 nhóm, chung một name, trong một fieldset có tên', () => {
    mo();

    const nhom = screen.getByRole('group', { name: 'Nhóm công thức' });
    const radios = screen.getAllByRole('radio');

    expect(nhom.tagName).toBe('FIELDSET');
    expect(radios).toHaveLength(CATEGORIES.length + 1);
    expect(new Set(radios.map((r) => r.getAttribute('name'))).size).toBe(1);
  });

  it('không chọn nhóm nào thì "Tất cả" đang chọn', () => {
    mo();
    expect((screen.getByRole('radio', { name: 'Tất cả' }) as HTMLInputElement).checked).toBe(true);
  });

  it('bấm một nhóm thì báo đúng id; bấm "Tất cả" thì báo null', () => {
    const { onChange } = mo({ value: 'risk' });

    fireEvent.click(screen.getByRole('radio', { name: /^Định giá/ }));
    expect(onChange).toHaveBeenLastCalledWith('valuation');

    fireEvent.click(screen.getByRole('radio', { name: 'Tất cả' }));
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

/**
 * Hai nút ‹ › cuộn hàng chip ở khổ PC đã bỏ (02/11/2026, chủ dự án: _"không dùng mũi tên nữa mà cho
 * hiển thị hết ra"_). Từ 1024px hàng chip xuống dòng; dưới 1024px vẫn vuốt ngang. jsdom không áp CSS
 * nên nửa bố cục gác bằng cách đọc thẳng file, cùng cách cụm ca con số ở dưới.
 */
describe('CategoryChips — hiện đủ, không nút cuộn', () => {
  it('không dựng nút nào: chỉ còn 13 radio', () => {
    mo();
    expect(document.querySelectorAll('button')).toHaveLength(0);
    expect(screen.getAllByRole('radio')).toHaveLength(CATEGORIES.length + 1);
  });

  const raw = readFileSync(join(process.cwd(), 'src/ui/browse/CategoryChips.module.css'), 'utf8');
  const css = raw.replace(/\/\*[\s\S]*?\*\//g, '');

  /** Thân khối `@media (min-width: 1024px)` — khối duy nhất của file mở từ 1024px. */
  function khoiPC(): string {
    const dau = css.indexOf('@media (min-width: 1024px)');
    expect(dau, 'thiếu khối min-width: 1024px').toBeGreaterThanOrEqual(0);
    let cuoi = css.indexOf('{', dau);
    let mo = 0;
    for (; cuoi < css.length; cuoi += 1) {
      if (css[cuoi] === '{') mo += 1;
      else if (css[cuoi] === '}') {
        mo -= 1;
        if (mo === 0) break;
      }
    }
    return css.slice(dau, cuoi + 1);
  }

  it('từ 1024px: khung thôi cuộn và nhóm chip xuống dòng, bề ngang theo khung', () => {
    const pc = khoiPC();
    expect(pc).toMatch(/\.scroller\s*\{[^}]*overflow:\s*visible/);
    expect(pc).toMatch(/\.group\s*\{[^}]*flex-wrap:\s*wrap/);
    expect(pc).toMatch(/\.group\s*\{[^}]*width:\s*auto/);
  });

  it('dưới 1024px vẫn là hàng vuốt ngang: khung gốc cuộn ngang, nhóm gốc không xuống dòng', () => {
    const goc = css.replace(khoiPC(), '');
    expect(goc).toMatch(/\.scroller\s*\{[^}]*overflow-x:\s*auto/);
    expect(goc).toMatch(/\.group\s*\{[^}]*width:\s*max-content/);
    expect(goc).not.toMatch(/flex-wrap:\s*wrap/);
  });

  it('không còn lớp nút cuộn nào trong CSS', () => {
    expect(css).not.toMatch(/\.arrow\b/);
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
