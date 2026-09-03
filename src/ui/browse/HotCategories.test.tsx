// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CATEGORIES, FORMULAS } from '@/application';

import { Highlight } from './Highlight';
import { HotCategories } from './HotCategories';

afterEach(cleanup);

/*
 * Hai ca dưới KHÔNG dùng `FORMULAS` nguyên vẹn nữa mà dựng một danh sách rút gọn.
 *
 * Lý do: cả hai đo hành vi "đọc danh sách được truyền vào" chứ không đo Registry. Khi Registry
 * còn dở (21 rồi 73 công thức) thì bản thân nó sẵn có nhóm rỗng và sẵn có ô lệch `expectedCount`,
 * nên tiền đề tự thoả. Đủ 111 công thức là mọi nhóm đều đầy và mọi ô đều khớp `expectedCount`,
 * tiền đề tắt ngóm và ca kiểm đỏ dù component không hề sai.
 *
 * Dựng dữ liệu riêng thì hành vi vẫn được canh, mà ca kiểm không còn phụ thuộc vào việc thư
 * viện đã xong tới đâu.
 */
const HAI_NHOM = ['valuation', 'returns'] as const;

/** Vài công thức của đúng hai nhóm — cố ý ÍT hơn `expectedCount` của chúng. */
const RUT_GON = HAI_NHOM.flatMap((id) => FORMULAS.filter((f) => f.categoryId === id).slice(0, 3));

/**
 * Chữ của tên nhóm và số đếm trong một ô, bỏ qua span icon (`CategoryIcon` không mang chữ).
 * Cùng cách lọc với `CategoryGrid.test.tsx`: chỉ giữ span lá (không lồng span khác) và có chữ.
 */
function chuTrenO(link: Element): string[] {
  return [...link.querySelectorAll('span')]
    .filter((span) => span.querySelector('span') === null && span.textContent !== '')
    .map((span) => span.textContent ?? '');
}

describe('HotCategories — WF-09 khối lối tắt', () => {
  it('chỉ hiện nhóm ĐÃ có công thức, không dẫn vào danh sách rỗng', () => {
    render(<HotCategories formulas={RUT_GON} />);

    const withFormulas = new Set(RUT_GON.map((f) => f.categoryId));
    const empty = CATEGORIES.filter((c) => !withFormulas.has(c.id));
    // Danh sách rút gọn đảm bảo luôn còn nhóm rỗng, bất kể Registry đã đủ hay chưa.
    expect(empty.length).toBeGreaterThan(0);

    for (const category of empty) {
      expect(screen.queryByText(category.shortName.vi), category.shortName.vi).toBeNull();
    }
  });

  it('số trên ô là số công thức thật, không phải số dự kiến của SRS', () => {
    render(<HotCategories formulas={RUT_GON} />);

    const counts = new Map<string, number>();
    for (const formula of RUT_GON) {
      counts.set(formula.categoryId, (counts.get(formula.categoryId) ?? 0) + 1);
    }

    let differsFromExpected = 0;

    for (const link of screen.getAllByRole('link')) {
      const [name, countText] = chuTrenO(link);
      const category = CATEGORIES.find((c) => c.shortName.vi === name);
      expect(category, `không tra được nhóm "${name ?? ''}"`).toBeDefined();

      const shown = Number(countText);
      expect(shown).toBe(counts.get(category?.id ?? ''));
      if (shown !== category?.expectedCount) differsFromExpected += 1;
    }

    /*
     * Và ít nhất một ô phải KHÁC số dự kiến, nếu không ca kiểm trên vẫn xanh khi ai đó đổi sang
     * `expectedCount`. Danh sách rút gọn cắt còn 3 công thức mỗi nhóm nên chắc chắn lệch.
     */
    expect(differsFromExpected).toBeGreaterThan(0);
  });

  it('vẫn hiện đúng số thật khi Registry đã đủ — không rơi về `expectedCount`', () => {
    render(<HotCategories formulas={FORMULAS} />);

    for (const link of screen.getAllByRole('link')) {
      const [name, countText] = chuTrenO(link);
      const category = CATEGORIES.find((c) => c.shortName.vi === name);
      const shown = Number(countText);
      expect(shown, name).toBe(FORMULAS.filter((f) => f.categoryId === category?.id).length);
    }
  });

  it('link mang đúng tham số nhóm, dựng bằng hàm dùng chung', () => {
    render(<HotCategories formulas={FORMULAS} />);

    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).toMatch(/[?&]category=[a-z-]+/);
    }
  });

  it('cắt đúng số ô tối đa', () => {
    render(<HotCategories formulas={FORMULAS} limit={3} />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('không có công thức nào thì không dựng khối rỗng', () => {
    const { container } = render(<HotCategories formulas={[]} />);
    expect(container.textContent).toBe('');
  });
});

describe('Highlight — tô đoạn khớp trên màn', () => {
  it('gõ không dấu vẫn tô đúng chữ có dấu, và dùng thẻ <mark>', () => {
    const { container } = render(<Highlight text="Định giá" query="dinh" />);

    const marks = container.querySelectorAll('mark');
    expect(marks).toHaveLength(1);
    expect(marks[0]?.textContent).toBe('Định');
    // Chữ trên màn không được đổi — chỉ thêm dấu.
    expect(container.textContent).toBe('Định giá');
  });

  it('không khớp gì thì không có thẻ <mark> nào, chữ vẫn nguyên', () => {
    const { container } = render(<Highlight text="Lãi kép" query="roi" />);

    expect(container.querySelectorAll('mark')).toHaveLength(0);
    expect(container.textContent).toBe('Lãi kép');
  });

  it('từ khoá rỗng thì hiện nguyên chữ', () => {
    const { container } = render(<Highlight text="P/E — hệ số giá" query="" />);

    expect(container.querySelectorAll('mark')).toHaveLength(0);
    expect(container.textContent).toBe('P/E — hệ số giá');
  });
});
