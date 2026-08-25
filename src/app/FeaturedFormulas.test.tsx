// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  formulaPath,
  serializeFormulaUsage,
} from '@/application';
import type { FormulaUsage } from '@/application';

import { FeaturedFormulas } from './FeaturedFormulas';
import type { PinnedTile } from './FeaturedFormulas';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

/**
 * Khối "Công thức dùng hằng ngày" sau khi có cá nhân hoá — FR-20.
 *
 * Dùng ID THẬT từ Registry chứ không fixture bịa: `rankFeaturedIds` lọc theo tập id có thật, nên
 * một bộ id giả sẽ làm mọi ca "lên đầu" lặng lẽ trở thành ca "không đổi gì" và test xanh vô nghĩa.
 */

/** Đúng danh sách ghim mà trang chủ truyền vào. */
const PINNED_IDS = FORMULA_SUMMARIES.filter((formula) => formula.isFeatured === true).map(
  (formula) => formula.id,
);

/** Một công thức có thật nhưng KHÔNG được ghim — ứng viên chen vào khối. */
const NGOAI_GHIM =
  FORMULA_SUMMARIES.find((formula) => formula.isFeatured !== true)?.id ?? 'khong-tim-thay';

const NOW = Date.now();

/** Thẻ giả lập phần server dựng: chỉ cần một node nhận ra được, không cần cả `FormulaCard`. */
function pinnedTiles(): PinnedTile[] {
  return PINNED_IDS.map((id) => ({
    id,
    card: (
      <a data-testid="ghim" href={formulaPath(id)}>
        {id}
      </a>
    ),
  }));
}

function luuLichSu(list: ReadonlyArray<FormulaUsage>): void {
  window.localStorage.setItem(FORMULA_USAGE_KEY, serializeFormulaUsage(list));
}

function thuTuTrenMan(): string[] {
  return screen.getAllByRole('listitem').map((li) => li.querySelector('a')?.textContent ?? '');
}

describe('FeaturedFormulas — chưa có lịch sử', () => {
  it('dựng đúng các node đã truyền, đúng thứ tự ghim, không có dòng phụ đề', () => {
    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
    expect(screen.queryByText(/đã được đưa lên đầu/)).toBeNull();
  });

  /**
   * Ca quan trọng nhất của file này.
   *
   * Bản build là HTML tĩnh, nên lượt render đầu ở máy khách phải trùng KHÍT với cây server đã
   * dựng, nếu không React vứt HTML đi và trang chủ mất phần Google đang đọc được. Đây là chỗ duy
   * nhất trong repo dựng bằng `react-dom/server` — không có cách nào khác so hai phía với nhau
   * trong một test Node.
   */
  it('lượt render đầu ở máy khách giống hệt HTML dựng lúc build', () => {
    const tiles = pinnedTiles();
    const html = renderToStaticMarkup(<FeaturedFormulas pinned={tiles} />);
    const { container } = render(<FeaturedFormulas pinned={tiles} />);

    expect(container.innerHTML).toBe(html);
  });
});

describe('FeaturedFormulas — đã có lịch sử', () => {
  it('một ghim hay mở thì lên đầu, khối vẫn đủ số ô và hiện dòng phụ đề', () => {
    const chon = PINNED_IDS[9];
    expect(chon).toBeDefined();
    luuLichSu([{ id: chon as string, count: 6, at: NOW }]);

    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    const thuTu = thuTuTrenMan();
    expect(thuTu[0]).toBe(chon);
    expect(thuTu).toHaveLength(PINNED_IDS.length);
    expect([...thuTu].sort()).toEqual([...PINNED_IDS].sort());
    expect(screen.getByText(/đã được đưa lên đầu/)).toBeTruthy();
  });

  it('công thức NGOÀI ghim hay mở thì chèn lên đầu và ghim cuối rơi ra', () => {
    luuLichSu([{ id: NGOAI_GHIM, count: 6, at: NOW }]);

    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(PINNED_IDS.length);

    // Thẻ chèn do component tự dựng bằng FormulaCard, không mang data-testid của phần ghim.
    const dau = items[0]?.querySelector('a');
    /*
     * Dấu `/` cuối để tuỳ: `formulaPath()` có, nhưng `next/link` chuẩn hoá bỏ nó vì trong test
     * không có `next.config.mjs` nào để đọc `trailingSlash: true`. Bản build thật thì có, và
     * `verify:static` mới là chỗ gác đường dẫn cuối cùng.
     */
    expect(dau?.getAttribute('href')).toMatch(new RegExp(`^${formulaPath(NGOAI_GHIM)}?$`));
    expect(dau?.getAttribute('data-testid')).toBeNull();

    expect(thuTuTrenMan()).not.toContain(PINNED_IDS[PINNED_IDS.length - 1]);
  });

  it('mở đúng một lần thì chưa đủ ngưỡng — trang chủ không xáo vì một cú bấm nhầm', () => {
    luuLichSu([{ id: NGOAI_GHIM, count: 1, at: NOW }]);

    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
    expect(screen.queryByText(/đã được đưa lên đầu/)).toBeNull();
  });

  it('id không còn trong Registry thì bỏ qua, thứ tự giữ nguyên', () => {
    luuLichSu([{ id: 'cong-thuc-da-xoa', count: 9, at: NOW }]);

    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
  });
});

describe('FeaturedFormulas — kho hỏng hoặc không đọc được', () => {
  it('JSON hỏng thì giữ thứ tự ghim', () => {
    window.localStorage.setItem(FORMULA_USAGE_KEY, '[{"id":"pe"');

    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
    expect(screen.queryByText(/đã được đưa lên đầu/)).toBeNull();
  });

  it('trình duyệt chặn localStorage thì khối vẫn dựng đủ, không ném lỗi', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('chế độ riêng tư');
    });

    render(<FeaturedFormulas pinned={pinnedTiles()} />);

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
    expect(screen.queryByText(/đã được đưa lên đầu/)).toBeNull();
  });
});
