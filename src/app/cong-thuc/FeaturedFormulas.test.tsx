// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DAILY_SHELF_IDS,
  DAILY_SHELF_OPEN_KEY,
  DAILY_SHELF_PREVIEW,
  FORMULA_SUMMARIES,
  FORMULA_USAGE_KEY,
  formulaPath,
  serializeFormulaUsage,
} from '@/application';
import type { FormulaUsage } from '@/application';

import { FeaturedFormulas, SHELF_GRID_ID } from './FeaturedFormulas';
import type { PinnedTile } from './FeaturedFormulas';

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  vi.restoreAllMocks();
});

/**
 * Khối "Công thức dùng hằng ngày" sau khi có cá nhân hoá — FR-20.
 *
 * Dùng ID THẬT từ Registry chứ không fixture bịa: `rankFeaturedIds` lọc theo tập id có thật, nên
 * một bộ id giả sẽ làm mọi ca "lên đầu" lặng lẽ trở thành ca "không đổi gì" và test xanh vô nghĩa.
 */

/** Đúng danh sách ghim mà `DailyShelf` truyền vào. */
const PINNED_IDS: ReadonlyArray<string> = DAILY_SHELF_IDS;

/** Một công thức có thật nhưng KHÔNG nằm trên kệ — ứng viên chen vào khối. */
const NGOAI_GHIM =
  FORMULA_SUMMARIES.find((formula) => !PINNED_IDS.includes(formula.id))?.id ?? 'khong-tim-thay';

const NOW = Date.now();

const TIEU_DE = <h2 id="tieu-de-ke">Kệ hằng ngày</h2>;

/** Thẻ giả lập phần server dựng: chỉ cần một node nhận ra được, không cần cả `FormulaCard`. */
function pinnedTiles(ids: ReadonlyArray<string> = PINNED_IDS): PinnedTile[] {
  return ids.map((id) => ({
    id,
    card: (
      <a data-testid="ghim" href={formulaPath(id)}>
        {id}
      </a>
    ),
  }));
}

function moKe(ids?: ReadonlyArray<string>) {
  return render(<FeaturedFormulas heading={TIEU_DE} pinned={pinnedTiles(ids)} />);
}

function luuLichSu(list: ReadonlyArray<FormulaUsage>): void {
  window.localStorage.setItem(FORMULA_USAGE_KEY, serializeFormulaUsage(list));
}

/** Thứ tự MỌI ô, kể cả ô đang ẩn — `hidden: true` vì ô ẩn đã rời cây trợ năng. */
function thuTuTrenMan(): string[] {
  return screen
    .getAllByRole('listitem', { hidden: true })
    .map((li) => li.querySelector('a')?.textContent ?? '');
}

/** Thứ tự các ô người dùng đang NHÌN THẤY. */
function thuTuDangHien(): string[] {
  return screen.getAllByRole('listitem').map((li) => li.querySelector('a')?.textContent ?? '');
}

function nutMoRong(): HTMLButtonElement {
  return screen.getByRole('button', { name: /Xem tất cả|Thu gọn/ }) as HTMLButtonElement;
}

describe('FeaturedFormulas — chưa có lịch sử', () => {
  it('dựng đúng các node đã truyền, đúng thứ tự ghim, tiêu đề cùng hàng với nút', () => {
    moKe();

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
    expect(screen.getByRole('heading', { name: 'Kệ hằng ngày' })).toBeTruthy();
  });

  it('không còn dòng chữ phụ nào dưới lưới', () => {
    const { container } = moKe();
    expect(container.querySelector(`#${SHELF_GRID_ID} ~ p`)).toBeNull();
    expect(screen.queryByText(/đã được đưa lên đầu/)).toBeNull();
  });

  /**
   * Ca quan trọng nhất của file này.
   *
   * Bản build là HTML tĩnh, nên lượt render đầu ở máy khách phải trùng KHÍT với cây server đã
   * dựng, nếu không React vứt HTML đi và màn mở đầu mất phần Google đang đọc được. Đây là chỗ
   * dựng bằng `react-dom/server` — không có cách nào khác so hai phía với nhau trong một test Node.
   */
  it('lượt render đầu ở máy khách giống hệt HTML dựng lúc build', () => {
    const tiles = pinnedTiles();
    const html = renderToStaticMarkup(<FeaturedFormulas heading={TIEU_DE} pinned={tiles} />);
    const { container } = render(<FeaturedFormulas heading={TIEU_DE} pinned={tiles} />);

    expect(container.innerHTML).toBe(html);
  });

  it('HTML tĩnh giữ ĐỦ link của mọi ô, kể cả ô đang ẩn', () => {
    const html = renderToStaticMarkup(
      <FeaturedFormulas heading={TIEU_DE} pinned={pinnedTiles()} />,
    );
    for (const id of PINNED_IDS) {
      expect(html, id).toContain(`href="${formulaPath(id)}"`);
    }
    expect((html.match(/<li hidden=""/g) ?? []).length).toBe(
      PINNED_IDS.length - DAILY_SHELF_PREVIEW,
    );
  });
});

describe('FeaturedFormulas — "Xem tất cả" mở rộng kệ tại chỗ', () => {
  it('lúc đầu chỉ bày phần đầu của kệ; ô còn lại ẩn khỏi cả mắt lẫn cây trợ năng', () => {
    moKe();

    expect(thuTuDangHien()).toEqual(PINNED_IDS.slice(0, DAILY_SHELF_PREVIEW));
    expect(nutMoRong().getAttribute('aria-expanded')).toBe('false');
    expect(nutMoRong().getAttribute('aria-controls')).toBe(SHELF_GRID_ID);
    expect(document.getElementById(SHELF_GRID_ID)).not.toBeNull();
  });

  it('bấm "Xem tất cả" thì bày đủ mọi ô, nút đổi thành "Thu gọn"; bấm lần nữa thì thu về', () => {
    moKe();

    fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả' }));

    expect(thuTuDangHien()).toEqual(PINNED_IDS);
    const thuGon = screen.getByRole('button', { name: 'Thu gọn' });
    expect(thuGon.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(thuGon);

    expect(thuTuDangHien()).toHaveLength(DAILY_SHELF_PREVIEW);
    expect(screen.getByRole('button', { name: 'Xem tất cả' })).toBeTruthy();
  });

  /*
   * Nút quay lại khôi phục cuộn bằng một con số `scrollY`. Kệ đã mở mà quay về lại thu gọn thì nội
   * dung phía trên ngắn đi mấy hàng thẻ và người dùng rơi xuống dưới chỗ cũ — nên trạng thái mở phải
   * được nhớ trong tab.
   */
  it('bấm mở/thu thì ghi/xoá cờ trong sessionStorage', () => {
    moKe();

    fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả' }));
    expect(window.sessionStorage.getItem(DAILY_SHELF_OPEN_KEY)).toBe('1');

    fireEvent.click(screen.getByRole('button', { name: 'Thu gọn' }));
    expect(window.sessionStorage.getItem(DAILY_SHELF_OPEN_KEY)).toBeNull();
  });

  it('quay lại màn khi kệ đang mở thì kệ mở sẵn ngay lượt dựng đầu sau hydrate', () => {
    window.sessionStorage.setItem(DAILY_SHELF_OPEN_KEY, '1');

    moKe();

    expect(thuTuDangHien()).toEqual(PINNED_IDS);
    expect(nutMoRong().getAttribute('aria-expanded')).toBe('true');
  });

  it('trình duyệt chặn sessionStorage thì nút vẫn mở/thu được', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('chế độ riêng tư');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('chế độ riêng tư');
    });

    moKe();
    fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả' }));

    expect(thuTuDangHien()).toEqual(PINNED_IDS);
  });

  it('kệ không dài hơn phần bày trước thì không có nút, và không ô nào ẩn', () => {
    moKe(PINNED_IDS.slice(0, DAILY_SHELF_PREVIEW));

    expect(screen.queryByRole('button')).toBeNull();
    expect(thuTuDangHien()).toEqual(PINNED_IDS.slice(0, DAILY_SHELF_PREVIEW));
  });
});

describe('FeaturedFormulas — đã có lịch sử', () => {
  it('một ghim ở phần ẩn mà hay mở thì lên đầu phần nhìn thấy, khối vẫn đủ số ô', () => {
    const chon = PINNED_IDS[DAILY_SHELF_PREVIEW + 2];
    expect(chon).toBeDefined();
    luuLichSu([{ id: chon as string, count: 6, at: NOW }]);

    moKe();

    const thuTu = thuTuTrenMan();
    expect(thuTu[0]).toBe(chon);
    expect(thuTu).toHaveLength(PINNED_IDS.length);
    expect([...thuTu].sort()).toEqual([...PINNED_IDS].sort());

    // Cắt theo VỊ TRÍ sau khi sắp: ô thứ tám của bản vẽ bị đẩy xuống thành ô đầu của phần ẩn.
    const dangHien = thuTuDangHien();
    expect(dangHien).toHaveLength(DAILY_SHELF_PREVIEW);
    expect(dangHien[0]).toBe(chon);
    expect(dangHien).not.toContain(PINNED_IDS[DAILY_SHELF_PREVIEW - 1]);
  });

  it('công thức NGOÀI ghim hay mở thì chèn lên đầu và ghim cuối rơi ra', () => {
    luuLichSu([{ id: NGOAI_GHIM, count: 6, at: NOW }]);

    moKe();

    const items = screen.getAllByRole('listitem', { hidden: true });
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

  it('mở đúng một lần thì chưa đủ ngưỡng — kệ không xáo vì một cú bấm nhầm', () => {
    luuLichSu([{ id: NGOAI_GHIM, count: 1, at: NOW }]);

    moKe();

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
  });

  it('id không còn trong Registry thì bỏ qua, thứ tự giữ nguyên', () => {
    luuLichSu([{ id: 'cong-thuc-da-xoa', count: 9, at: NOW }]);

    moKe();

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
  });
});

describe('FeaturedFormulas — kho hỏng hoặc không đọc được', () => {
  it('JSON hỏng thì giữ thứ tự ghim', () => {
    window.localStorage.setItem(FORMULA_USAGE_KEY, '[{"id":"pe"');

    moKe();

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
  });

  it('trình duyệt chặn localStorage thì khối vẫn dựng đủ, không ném lỗi', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('chế độ riêng tư');
    });

    moKe();

    expect(thuTuTrenMan()).toEqual(PINNED_IDS);
  });
});
