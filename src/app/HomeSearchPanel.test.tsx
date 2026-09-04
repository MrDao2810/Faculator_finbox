// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DEFAULT_LIST_PARAMS,
  FORMULA_SUMMARIES,
  PREFERENCES_STORAGE_KEY,
  RECENT_SEARCHES_KEY,
  formulasForLevel,
  parseListParams,
  selectFormulas,
  serializeRecentSearches,
} from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';

import { HomeSearchPanel } from './HomeSearchPanel';

afterEach(cleanup);

/** Đứng thay cho ba khối tĩnh mà trang chủ truyền vào qua children. */
function Content() {
  return <p>KHỐI TĨNH TRANG CHỦ</p>;
}

function renderPanel() {
  return render(
    <HomeSearchPanel>
      <Content />
    </HomeSearchPanel>,
  );
}

const searchBox = (): HTMLElement => screen.getByLabelText('Tìm công thức');

/** Kệ "Công thức dùng hằng ngày" — đúng bộ mà ô tìm ở trang chủ được phép chạm tới. */
const GHIM = FORMULA_SUMMARIES.filter((formula) => formula.isFeatured === true);

/** Cả thư viện ở chế độ mặc định — bộ mà hàng bàn giao hứa trước con số. */
const THU_VIEN_CO_BAN = formulasForLevel(FORMULA_SUMMARIES, 'basic');

const timTrong = (pool: typeof FORMULA_SUMMARIES, q: string) =>
  selectFormulas(pool, { ...DEFAULT_LIST_PARAMS, q });

/**
 * Một từ khoá CHẮC CHẮN khớp ít nhất một ô trên kệ — dò lúc chạy, không viết cứng.
 *
 * Cùng lý do với các hàm dò của bản trước: viết cứng một từ khoá là ca kiểm đỏ vào ngày ai đó
 * đổi danh sách ghim, dù màn không hề sai. Lấy id (kebab, chỉ chữ và gạch) rồi thay gạch bằng
 * khoảng trắng — an toàn với `userEvent.type` hơn gõ tên tiếng Việt có dấu.
 */
function tuKhoaTrenKe(): { id: string; q: string } {
  const ungVien = GHIM.map((f) => ({ id: f.id, q: f.id.replace(/-/g, ' ') })).sort(
    (a, b) => a.q.length - b.q.length,
  );

  for (const ungCu of ungVien) {
    if (timTrong(GHIM, ungCu.q).some((f) => f.id === ungCu.id)) return ungCu;
  }

  throw new Error('Không dò được từ khoá nào khớp kệ ghim — ca kiểm này cần xem lại.');
}

/**
 * Một từ khoá mà THƯ VIỆN CÓ nhưng KỆ KHÔNG — tức đúng cái giá của đợt thu hẹp phạm vi.
 *
 * Đo thật trên Registry lúc chốt phương án: 5 trong 11 từ khoá thường gặp rơi vào ca này
 * (`sma`, `bollinger`, `macd`, `beta`, `roe`). Hàm này dò lại lúc chạy để ca kiểm không phụ
 * thuộc vào việc từ khoá nào cụ thể còn đúng.
 */
function tuKhoaNgoaiKe(): string {
  const ungVien = FORMULA_SUMMARIES.filter((f) => f.isFeatured !== true)
    .map((f) => f.id.replace(/-/g, ' '))
    .sort((a, b) => a.length - b.length);

  for (const q of ungVien) {
    if (timTrong(GHIM, q).length === 0 && timTrong(THU_VIEN_CO_BAN, q).length > 0) return q;
  }

  throw new Error('Không dò được từ khoá nào ngoài kệ — ca kiểm này cần xem lại.');
}

/**
 * Tìm thẻ dẫn tới một công thức trong cây vừa dựng.
 *
 * Chấp nhận cả hai dạng có / không gạch chéo cuối: bản build thật giữ gạch chéo
 * (`trailingSlash: true`, `verify:static` đã đo), còn `next/link` dưới jsdom thì cắt đi. Viết
 * cứng một dạng là ca kiểm ĐẠT MÀ RỖNG — nó không tìm thấy gì nên khẳng định "không có" luôn
 * đúng, kể cả khi màn hỏng thật.
 */
function theCongThuc(container: HTMLElement, id: string): Element | undefined {
  return [...container.querySelectorAll('a')].find((a) => {
    const href = a.getAttribute('href') ?? '';
    return href === `/cong-thuc/${id}` || href === `/cong-thuc/${id}/`;
  });
}

/** Id của mọi thẻ công thức đang dựng — bỏ qua hàng bàn giao vì href của nó có '?'. */
function idDangHien(container: HTMLElement): ReadonlyArray<string> {
  return [...container.querySelectorAll('a')]
    .map((a) => a.getAttribute('href') ?? '')
    .filter((href) => href.startsWith('/cong-thuc/') && !href.includes('?'))
    .map((href) => href.replace('/cong-thuc/', '').replace(/\/$/, ''))
    .filter((id) => id !== '');
}

describe('HomeSearchPanel — trạng thái nhàn', () => {
  it('chưa gõ gì thì hiện đúng nội dung trang chủ, không hiện bộ lọc', () => {
    renderPanel();

    expect(screen.getByText('KHỐI TĨNH TRANG CHỦ')).not.toBeNull();
    expect(screen.queryByRole('group', { name: 'Mảng' })).toBeNull();
    expect(screen.queryByText('Xoá bộ lọc')).toBeNull();
  });

  /*
   * Vùng aria-live phải có mặt TỪ LẦN RENDER ĐẦU. Nếu nó sinh ra cùng lúc với nội dung thì
   * trình đọc màn hình coi cả vùng là mới và bỏ qua — đúng lần đọc quan trọng nhất.
   */
  it('vùng thông báo có sẵn ngay lúc còn nhàn, chỉ là đang rỗng', () => {
    const { container } = renderPanel();
    const live = container.querySelector('[aria-live="polite"]');

    expect(live).not.toBeNull();
    expect(live?.textContent).toBe('');
  });
});

/*
 * Lỗi được báo: gõ vào ô tìm ở trang chủ thì cả trang chủ biến mất, thay bằng bộ chip lọc +
 * "Nhóm công thức" + "Sắp xếp" + "Xoá bộ lọc" — tức giao diện tab Công thức — trong khi thanh
 * dưới vẫn sáng mục "Trang chủ", và không có chữ nào giải thích.
 *
 * Bốn ca dưới gác cách chữa: kệ THU HẸP TẠI CHỖ, mang đúng tiêu đề cũ, tiêu đề ấy HIỆN RA cho
 * mắt thấy, và không dựng lại một mẩu nào của bộ lọc duyệt.
 */
describe('HomeSearchPanel — gõ là kệ thu hẹp tại chỗ, không đổi sang màn khác', () => {
  it('giữ nguyên tiêu đề của kệ, và tiêu đề đó nhìn thấy được', async () => {
    renderPanel();
    await userEvent.type(searchBox(), tuKhoaTrenKe().q);

    const tieuDe = screen.getByRole('heading', { name: 'Công thức dùng hằng ngày' });

    /*
     * Bản trước có tiêu đề "Kết quả tìm kiếm" nhưng gắn `visually-hidden`: trình đọc màn hình
     * nghe được, người nhìn bằng mắt thì không có lời giải thích nào. Đó chính là chỗ khó hiểu
     * được báo, nên lớp ấy không được quay lại.
     */
    expect(String(tieuDe.className)).not.toMatch(/visually-hidden/);
  });

  it('không dựng lại một mẩu nào của bộ lọc duyệt', async () => {
    renderPanel();
    await userEvent.type(searchBox(), tuKhoaTrenKe().q);

    expect(screen.queryByRole('group', { name: 'Mảng' })).toBeNull();
    expect(screen.queryByLabelText('Nhóm công thức')).toBeNull();
    expect(screen.queryByLabelText('Sắp xếp')).toBeNull();
    expect(screen.queryByText('Xoá bộ lọc')).toBeNull();
    expect(screen.queryByText(/công thức nâng cao đang ẩn/)).toBeNull();
  });

  it('xoá hết chữ thì khối tĩnh quay lại', async () => {
    renderPanel();
    const box = searchBox();

    await userEvent.type(box, 'roi');
    expect(screen.queryByText('KHỐI TĨNH TRANG CHỦ')).toBeNull();

    await userEvent.clear(box);
    expect(screen.getByText('KHỐI TĨNH TRANG CHỦ')).not.toBeNull();
  });

  it('nói ra phạm vi bằng con số "n / 18", để không ai tưởng đây là cả thư viện', async () => {
    const { id, q } = tuKhoaTrenKe();
    const { container } = renderPanel();
    await userEvent.type(searchBox(), q);

    const mong = timTrong(GHIM, q);
    expect(
      mong.length,
      'từ khoá dò được phải ra ít nhất một ô, nếu không ca kiểm rỗng nghĩa',
    ).toBeGreaterThan(0);
    expect(theCongThuc(container, id)).not.toBeUndefined();

    const dong = screen.getByText(
      (_, node) =>
        node?.tagName === 'P' &&
        new RegExp(`^\\s*${mong.length}\\s*/\\s*${GHIM.length}\\s`).test(node.textContent ?? ''),
    );
    expect(dong.textContent).toContain('công thức');
  });
});

describe('HomeSearchPanel — phạm vi là kệ ghim, không phải cả thư viện', () => {
  /*
   * Bất biến chính của đợt này. Quét nhiều từ khoá chứ không một, vì một từ khoá tình cờ chỉ
   * khớp ô ghim thì ca kiểm xanh mà không chứng minh được gì.
   */
  it('không bao giờ lọt một công thức ngoài kệ', async () => {
    const ghimIds = new Set(GHIM.map((f) => f.id));
    const tuKhoa = GHIM.slice(0, 4).map((f) => f.id.replace(/-/g, ' '));

    for (const q of tuKhoa) {
      cleanup();
      const { container } = renderPanel();
      await userEvent.type(searchBox(), q);

      const ids = idDangHien(container);
      expect(
        ids.length,
        `"${q}" phải ra ít nhất một thẻ, nếu không ca kiểm rỗng nghĩa`,
      ).toBeGreaterThan(0);

      for (const id of ids) {
        expect(ghimIds.has(id), `"${id}" không nằm trên kệ mà vẫn lọt ra kết quả`).toBe(true);
      }
    }
  });

  /*
   * Kệ là ghim TAY (FR-20) nên `page.tsx` không lọc nó theo cấp độ. Ô tìm vì vậy cũng không
   * được lọc — nếu lọc thì con số "n / 18" đếm hai bộ khác nhau, tức nói dối. Ô ghim mức nâng
   * cao là bằng chứng sống của luật này.
   */
  it('không lọc kệ theo cấp độ: ô ghim mức nâng cao vẫn tìm thấy ở chế độ Cơ bản', async () => {
    const nangCaoTrenKe = GHIM.find((f) => f.level === 'advanced');
    if (nangCaoTrenKe === undefined) {
      throw new Error('Ca kiểm cần ít nhất một ô ghim mức nâng cao — kệ đã đổi, xem lại luật.');
    }

    const { container } = renderPanel();
    await userEvent.type(searchBox(), nangCaoTrenKe.id.replace(/-/g, ' '));

    expect(theCongThuc(container, nangCaoTrenKe.id)).not.toBeUndefined();
  });
});

/*
 * Cái giá đã đo và đã chấp nhận: 5 trong 11 từ khoá thường gặp không có mặt trên kệ. Nên hàng
 * bàn giao sang `/cong-thuc/` KHÔNG còn là tuỳ chọn cuối trang — nó luôn hiện khi đang tìm, và
 * mang sẵn số kết quả của cả thư viện để người dùng biết trước bấm sang có gì.
 */
describe('HomeSearchPanel — hàng bàn giao sang cả thư viện', () => {
  const banGiao = (): HTMLElement => screen.getByRole('link', { name: /Tìm trong cả thư viện/ });

  it('vẫn hiện ngay cả khi kệ có kết quả', async () => {
    const { q } = tuKhoaTrenKe();
    renderPanel();
    await userEvent.type(searchBox(), q);

    expect(banGiao().textContent).toContain(String(timTrong(THU_VIEN_CO_BAN, q).length));
  });

  it('kệ rỗng thì nói rõ phạm vi và chỉ đường tiếp, không để người dùng cụt đường', async () => {
    const q = tuKhoaNgoaiKe();
    renderPanel();
    await userEvent.type(searchBox(), q);

    expect(screen.getByText('Không ô nào trong khối này khớp')).not.toBeNull();
    expect(screen.getByText(/chỉ lọc khối/)).not.toBeNull();

    const soThuVien = timTrong(THU_VIEN_CO_BAN, q).length;
    expect(
      soThuVien,
      'ca kiểm cần từ khoá mà thư viện CÓ, nếu không nó rỗng nghĩa',
    ).toBeGreaterThan(0);
    expect(banGiao().textContent).toContain(String(soThuVien));
  });

  /* Chặn đúng lỗi ghép chuỗi tay của đợt 7: đi trọn vòng dựng link → đọc lại. */
  it('link mang đúng từ khoá đang gõ', async () => {
    renderPanel();
    await userEvent.type(searchBox(), 'roi');

    const href = banGiao().getAttribute('href') ?? '';

    /*
     * Chỉ kiểm phần đường dẫn và phần truy vấn, KHÔNG kiểm dấu '/' cuối: `next/link` trong
     * jsdom không đọc `trailingSlash` của next.config.mjs nên nó rút thành '/cong-thuc?q=…',
     * trong khi bản build thật ra đúng '/cong-thuc/?q=…'. Phần dấu gạch cuối do routes.test.ts
     * giữ, chạy thuần Node nên không dính chuyện này.
     */
    expect(href.startsWith('/cong-thuc')).toBe(true);
    const query = href.slice(href.indexOf('?'));
    expect(parseListParams(new URLSearchParams(query)).q).toBe('roi');
  });

  /*
   * Con số này lọc theo cấp độ, khác với kệ ngay trên. Cố ý khác: nó hứa trước thứ người dùng
   * sẽ thấy ở `/cong-thuc/`, mà màn đó CÓ lọc theo cấp độ. Hứa 5 rồi sang thấy 3 là đúng kiểu
   * sai mà FR-06 tồn tại để chặn, chỉ khác là ở tầng điều hướng.
   */
  it('số kết quả hứa trước đổi theo chế độ, đúng bằng thứ /cong-thuc/ sẽ hiện', async () => {
    const q = tuKhoaNgoaiKe();
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ mode: 'advanced' }));

    render(
      <PreferencesProvider>
        <HomeSearchPanel>
          <Content />
        </HomeSearchPanel>
      </PreferencesProvider>,
    );
    await userEvent.type(searchBox(), q);

    const soNangCao = timTrong(formulasForLevel(FORMULA_SUMMARIES, 'advanced'), q).length;
    expect(banGiao().textContent).toContain(String(soNangCao));

    window.localStorage.clear();
  });
});

describe('HomeSearchPanel — không đánh rơi tiêu điểm', () => {
  /*
   * Nút × tự tháo mình khỏi DOM ngay sau cú bấm. Không trả tiêu điểm về ô tìm thì nó rơi về
   * <body>, và người dùng bàn phím phải Tab lại từ đầu tài liệu.
   */
  it('bấm × của ô tìm thì tiêu điểm quay về ô, không rơi về body', async () => {
    renderPanel();
    const box = searchBox();
    await userEvent.type(box, 'roi');

    await userEvent.click(screen.getByRole('button', { name: 'Xoá ô tìm kiếm' }));

    expect(document.activeElement).toBe(box);
    expect(screen.getByText('KHỐI TĨNH TRANG CHỦ')).not.toBeNull();
  });

  it('phím Esc trong ô tìm cũng đưa về trạng thái nhàn', async () => {
    renderPanel();
    const box = searchBox();
    await userEvent.type(box, 'roi');

    await userEvent.type(box, '{Escape}');

    expect(screen.getByText('KHỐI TĨNH TRANG CHỦ')).not.toBeNull();
    expect(document.activeElement).toBe(box);
  });
});

/*
 * Hàng chip "Tìm gần đây" ngay dưới ô tìm — bản thiết kế Figma "FINBOX VERSION 2".
 *
 * Hình dáng của chính khối chip do `RecentSearches.test.tsx` gác; bốn ca dưới gác phần ĐẤU NỐI ở
 * trang chủ, vốn là chỗ dễ sai hơn: đọc localStorage đúng lúc, ẩn đúng lúc, và chip dẫn sang cả
 * thư viện chứ không lọc kệ tại chỗ.
 */
describe('HomeSearchPanel — chip "Tìm gần đây"', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  function coLichSu(...terms: ReadonlyArray<string>): void {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, serializeRecentSearches(terms));
  }

  /*
   * Trang chủ là HTML tĩnh và là URL priority 1.0 của sitemap. Chưa có lịch sử mà đã dựng ra một
   * nút DOM nào thì lượt render đầu ở máy khách khác `out/index.html` — lệch hydration.
   */
  it('chưa có lịch sử thì không dựng hàng chip nào', () => {
    renderPanel();
    expect(screen.queryByRole('region', { name: 'Tìm gần đây' })).toBeNull();
  });

  /*
   * Lịch sử ghi TÊN công thức đã chọn ở màn tìm, mà màn tìm chạy trên CẢ THƯ VIỆN còn ô tìm ở
   * trang chủ chỉ với tới kệ ghim. Nên chip phải rời trang chủ, không đổ ngược vào ô tìm tại chỗ:
   * `beta` không nằm trên kệ, đổ vào ô tìm là ra ngay một khối rỗng.
   */
  it('chip là link sang cả thư viện, mang đúng từ khoá — không lọc kệ tại chỗ', async () => {
    coLichSu('Beta');
    renderPanel();

    const chip = await screen.findByRole('link', { name: 'Beta' });
    const href = chip.getAttribute('href') ?? '';

    // Không kiểm dấu '/' cuối, cùng lý do đã ghi ở ca hàng bàn giao phía trên.
    expect(href.startsWith('/cong-thuc')).toBe(true);
    expect(parseListParams(new URLSearchParams(href.slice(href.indexOf('?')))).q).toBe('Beta');
  });

  it('đang gõ thì hàng chip ẩn đi, nhường chỗ cho kết quả', async () => {
    coLichSu('Beta');
    renderPanel();
    await screen.findByRole('link', { name: 'Beta' });

    await userEvent.type(searchBox(), tuKhoaTrenKe().q);

    expect(screen.queryByRole('region', { name: 'Tìm gần đây' })).toBeNull();
  });

  it('bấm nút xoá thì hàng chip biến mất và lịch sử trên máy cũng sạch', async () => {
    coLichSu('Beta', 'WACC');
    renderPanel();
    await screen.findByRole('link', { name: 'Beta' });

    await userEvent.click(screen.getByRole('button', { name: 'Xoá lịch sử' }));

    expect(screen.queryByRole('region', { name: 'Tìm gần đây' })).toBeNull();
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
  });
});
