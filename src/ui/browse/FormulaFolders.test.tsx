// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { CATEGORIES, FORMULAS } from '@/application';
import type { FormulaSummary } from '@/application';

import { FormulaFolders } from './FormulaFolders';
import { GroupCard } from './GroupCard';

afterEach(cleanup);

/*
 * Cùng lối `HotCategories.test.tsx` đã ghi: bộ RÚT GỌN chứ không phải `FORMULAS` nguyên vẹn, để
 * tiền đề "có nhóm rỗng" và "thẻ bày ít hơn tổng" không tắt ngóm khi Registry đã đủ 111.
 */
const HAI_NHOM = ['valuation', 'returns'] as const;
const RUT_GON: FormulaSummary[] = HAI_NHOM.flatMap((id) =>
  FORMULAS.filter((f) => f.categoryId === id).slice(0, 6),
);

/** Thẻ của một nhóm, tra theo tên đầy đủ — `GroupCard` in `category.name`, không phải `shortName`. */
function the(tenNhom: string): HTMLElement {
  const heading = screen.getByRole('heading', { name: tenNhom });
  const section = heading.closest('section');
  if (section === null) throw new Error(`Thẻ "${tenNhom}" không nằm trong <section> — xem lại.`);
  return section;
}

describe('FormulaFolders — thư mục 12 nhóm, WF-09 khổ PC', () => {
  it('chỉ dựng thẻ cho nhóm ĐÃ có công thức — thư mục không dẫn vào phòng trống', () => {
    render(<FormulaFolders formulas={RUT_GON} />);

    const coCongThuc = new Set(RUT_GON.map((f) => f.categoryId));
    const rong = CATEGORIES.filter((c) => !coCongThuc.has(c.id));
    // Bộ rút gọn đảm bảo luôn còn nhóm rỗng, bất kể Registry đã đủ hay chưa.
    expect(rong.length).toBeGreaterThan(0);

    for (const category of rong) {
      expect(screen.queryByRole('heading', { name: category.name.vi }), category.id).toBeNull();
    }
    expect(screen.getAllByRole('heading')).toHaveLength(coCongThuc.size);
  });

  /*
   * Con số ở đầu thẻ và con số trong "Xem tất cả N" là MỘT — cùng `all.length`. Hai chỗ trên cùng
   * một thẻ mà nói hai số là đúng loại im lặng FR-06 sinh ra để chặn, chỉ khác là ở phần đếm.
   */
  it('số ở đầu thẻ bằng số trong link "Xem tất cả", và là số công thức THẬT của nhóm', () => {
    render(<FormulaFolders formulas={RUT_GON} />);

    for (const id of HAI_NHOM) {
      const category = CATEGORIES.find((c) => c.id === id);
      const thuc = RUT_GON.filter((f) => f.categoryId === id).length;
      const card = the(category?.name.vi ?? '');

      expect(within(card).getByText(String(thuc)), id).not.toBeNull();
      expect(within(card).getByRole('link', { name: /Xem tất cả/ }).textContent, id).toContain(
        String(thuc),
      );
    }
  });

  it('mỗi thẻ bày nhiều nhất bốn dòng, công thức nổi bật lên trước', () => {
    render(<FormulaFolders formulas={RUT_GON} />);

    for (const id of HAI_NHOM) {
      const category = CATEGORIES.find((c) => c.id === id);
      const dong = within(the(category?.name.vi ?? '')).getAllByRole('link', {
        name: (name) => !/Xem tất cả|Mở nhóm/.test(name),
      });

      expect(dong.length, id).toBeLessThanOrEqual(4);

      const noiBat = RUT_GON.filter((f) => f.categoryId === id && f.isFeatured === true).slice(
        0,
        4,
      );
      for (const [i, formula] of noiBat.entries()) {
        expect(dong[i]?.getAttribute('href') ?? '', `${id} dòng ${String(i)}`).toContain(
          formula.id,
        );
      }
    }
  });

  /* Bày hết thì không còn gì để "xem tất cả" — link đổi thành lối mở cả nhóm. */
  it('nhóm bày hết công thức thì link cuối là "Mở nhóm", không phải "Xem tất cả"', () => {
    const motNhom = FORMULAS.filter((f) => f.categoryId === 'valuation').slice(0, 3);
    render(<FormulaFolders formulas={motNhom} />);

    expect(screen.getByRole('link', { name: /Mở nhóm/ })).not.toBeNull();
    expect(screen.queryByRole('link', { name: /Xem tất cả/ })).toBeNull();
  });

  it('không có công thức nào thì không dựng lưới rỗng', () => {
    const { container } = render(<FormulaFolders formulas={[]} />);
    expect(container.textContent).toBe('');
  });
});

describe('GroupCard — thẻ nhóm dùng chung cho kết quả tìm và thư mục', () => {
  const NHOM = CATEGORIES[0];
  if (NHOM === undefined) throw new Error('Registry phải có ít nhất một nhóm.');
  const BA = FORMULAS.filter((f) => f.categoryId === NHOM.id).slice(0, 3);

  it('đang tìm thì đầu thẻ in "khớp / tổng", không in mỗi một số', () => {
    render(<GroupCard category={NHOM} formulas={BA} total={13} hits={BA.length} />);

    expect(screen.getByText(`${String(BA.length)} / 13`)).not.toBeNull();
  });

  it('không truyền `total` thì đầu thẻ không có con số nào — dùng cho khối gợi ý', () => {
    const { container } = render(<GroupCard category={NHOM} formulas={BA} />);

    expect(container.querySelector('h2')?.parentElement?.childElementCount).toBe(2);
  });

  it('bấm một dòng thì gọi `onSelect` với đúng công thức — chỗ ghi "Tìm gần đây"', () => {
    const onSelect = vi.fn();
    render(<GroupCard category={NHOM} formulas={BA} onSelect={onSelect} />);

    const dau = BA[0];
    if (dau === undefined) throw new Error('Cần ít nhất một công thức cho ca này.');
    screen.getByRole('link', { name: new RegExp(dau.name.vi.slice(0, 12)) }).click();

    expect(onSelect).toHaveBeenCalledWith(dau);
  });
});
