// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import {
  CATEGORIES,
  DEFAULT_LIST_PARAMS,
  FORMULAS,
  countHiddenByLevel,
  formulasForLevel,
  parseListParams,
  selectFormulas,
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

describe('HomeSearchPanel — gõ để lọc tại chỗ', () => {
  it('gõ một chữ là khối tĩnh nhường chỗ cho bộ lọc và kết quả', async () => {
    renderPanel();
    await userEvent.type(searchBox(), 'roi');

    expect(screen.queryByText('KHỐI TĨNH TRANG CHỦ')).toBeNull();
    expect(screen.getByRole('group', { name: 'Mảng' })).not.toBeNull();
    expect(screen.getByRole('heading', { name: 'Kết quả tìm kiếm' })).not.toBeNull();
  });

  it('xoá hết chữ thì khối tĩnh quay lại', async () => {
    renderPanel();
    const box = searchBox();

    await userEvent.type(box, 'roi');
    expect(screen.queryByText('KHỐI TĨNH TRANG CHỦ')).toBeNull();

    await userEvent.clear(box);
    expect(screen.getByText('KHỐI TĨNH TRANG CHỦ')).not.toBeNull();
  });

  it('chỉ dựng tối đa 8 thẻ, nhưng hàng "Xem tất cả" nói đúng TỔNG số kết quả', async () => {
    /*
     * Đếm trên đúng bộ mà panel đang dùng: mặc định sản phẩm là chế độ Cơ bản, và từ đợt này
     * chế độ đó lọc bớt công thức mức nâng cao (FR-09). Lấy `FORMULAS` trọn bộ ở đây là ca
     * kiểm tự đặt ra một kỳ vọng mà màn không hứa.
     */
    const wide = selectFormulas(formulasForLevel(FORMULAS, 'basic'), {
      ...DEFAULT_LIST_PARAMS,
      q: 'gia',
    });
    expect(wide.length, 'ca kiểm này cần một truy vấn ra hơn 8 kết quả').toBeGreaterThan(8);

    renderPanel();
    await userEvent.type(searchBox(), 'gia');

    const cards = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(cards).toHaveLength(8);

    // Dòng bàn giao phải nói TỔNG, không phải 8 — nếu không người dùng tưởng chỉ có bấy nhiêu.
    const seeAll = screen.getByRole('link', { name: /Xem tất cả/ });
    expect(seeAll.textContent).toContain(String(wide.length));
  });

  /* Chặn đúng lỗi ghép chuỗi tay của đợt 7: đi trọn vòng dựng link → đọc lại. */
  it('link "Xem tất cả" mang đúng từ khoá đang gõ', async () => {
    renderPanel();
    await userEvent.type(searchBox(), 'roi');

    const href = screen.getByRole('link', { name: /Xem tất cả/ }).getAttribute('href') ?? '';

    /*
     * Chỉ kiểm phần đường dẫn và phần truy vấn, KHÔNG kiểm dấu '/' cuối: `next/link` trong
     * jsdom không đọc `trailingSlash` của next.config.mjs nên nó rút thành '/cong-thuc?q=…',
     * trong khi bản build thật ra đúng '/cong-thuc/?q=…' (đã kiểm trên out/index.html).
     * Phần dấu gạch cuối do routes.test.ts giữ, chạy thuần Node nên không dính chuyện này.
     */
    expect(href.startsWith('/cong-thuc')).toBe(true);
    const query = href.slice(href.indexOf('?'));
    expect(parseListParams(new URLSearchParams(query)).q).toBe('roi');
  });
});

describe('HomeSearchPanel — không tìm thấy gì', () => {
  it('nói rõ phạm vi sản phẩm chứ không để màn trắng', async () => {
    renderPanel();
    await userEvent.type(searchBox(), 'bitcoin');

    expect(screen.getByText('Không tìm thấy công thức nào')).not.toBeNull();
    expect(screen.getByText(/không có tiền mã hoá/)).not.toBeNull();
    expect(screen.queryByRole('link', { name: /Xem tất cả/ })).toBeNull();
  });
});

describe('HomeSearchPanel — không đánh rơi tiêu điểm', () => {
  /*
   * Ba nút dưới đây đều TỰ THÁO MÌNH khỏi DOM ngay sau cú bấm. Không trả tiêu điểm về ô tìm
   * thì nó rơi về <body>, và người dùng bàn phím phải Tab lại từ đầu tài liệu.
   */
  it('bấm × của ô tìm thì tiêu điểm quay về ô, không rơi về body', async () => {
    renderPanel();
    const box = searchBox();
    await userEvent.type(box, 'roi');

    await userEvent.click(screen.getByRole('button', { name: 'Xoá ô tìm kiếm' }));

    expect(document.activeElement).toBe(box);
    expect(screen.getByText('KHỐI TĨNH TRANG CHỦ')).not.toBeNull();
  });

  it('bấm "Xoá bộ lọc" thì tiêu điểm quay về ô tìm', async () => {
    renderPanel();
    const box = searchBox();
    await userEvent.type(box, 'roi');

    await userEvent.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));

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

const segmentOf = (categoryId: string): string | undefined =>
  CATEGORIES.find((c) => c.id === categoryId)?.segment;

/**
 * Một từ khoá chỉ khớp mảng cá nhân, DÒ ngay lúc chạy thay vì viết cứng.
 *
 * Bản trước viết cứng 'lai kep'. Đúng khi thư viện mới có 21 công thức, nhưng tới 107 thì nó
 * khớp cả `gia-tri-tuong-lai` và `loi-suat-nam-hoa` bên mảng chứng khoán, lọc sang Chứng khoán
 * không còn rỗng và ca kiểm đỏ dù màn không hề sai. Dò lúc chạy thì ca kiểm đo đúng hành vi
 * "lọc làm rỗng thì mách lối ra", không đo tình cờ của nội dung Registry.
 *
 * Lấy từ khoá NGẮN NHẤT thoả điều kiện để `userEvent.type` khỏi gõ cả một câu dài.
 */
function tuKhoaChiThuocCaNhan(): string {
  const ungVien = FORMULAS.filter((f) => segmentOf(f.categoryId) === 'personal')
    .map((f) => f.name.vi)
    .sort((a, b) => a.length - b.length);

  for (const q of ungVien) {
    const hits = selectFormulas(FORMULAS, { ...DEFAULT_LIST_PARAMS, q });
    if (hits.length > 0 && hits.every((h) => segmentOf(h.categoryId) === 'personal')) return q;
  }

  throw new Error('Không còn từ khoá nào chỉ thuộc mảng cá nhân — ca kiểm này cần xem lại.');
}

/**
 * Một công thức mức NÂNG CAO tìm được bằng chính id của nó, dò lúc chạy.
 *
 * Cùng lý do với `tuKhoaChiThuocCaNhan()`: viết cứng một id là ca kiểm đỏ vào ngày ai đó đổi
 * cấp độ công thức đó, dù màn không hề sai. Gõ id (kebab, chỉ chữ và gạch) an toàn với
 * `userEvent.type` hơn gõ tên tiếng Việt có dấu gạch dài.
 */
function congThucNangCaoDeTim(): { id: string; q: string } {
  const ungVien = FORMULAS.filter((f) => f.level === 'advanced')
    .map((f) => ({ id: f.id, q: f.id.replace(/-/g, ' ') }))
    .sort((a, b) => a.q.length - b.q.length);

  for (const c of ungVien) {
    const query = { ...DEFAULT_LIST_PARAMS, q: c.q };
    const oNangCao = selectFormulas(FORMULAS, query).slice(0, 8);
    const oCoBan = selectFormulas(formulasForLevel(FORMULAS, 'basic'), query);
    if (oNangCao.some((f) => f.id === c.id) && !oCoBan.some((f) => f.id === c.id)) return c;
  }

  throw new Error('Không còn công thức nâng cao nào để dò — ca kiểm này cần xem lại.');
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

/*
 * Vế thứ hai của FR-09 ("Nâng cao mở toàn bộ tham số VÀ CÔNG THỨC PHỨC TẠP").
 *
 * Trước đợt này nút Cơ bản / Nâng cao nằm ở thanh trên của mọi màn nhưng bấm vào gần như
 * không đổi gì: chỉ 9 / 108 công thức có biến mức nâng cao để mà ẩn. Hai ca dưới chốt việc
 * nút ấy có tác dụng thật ngay trên trang chủ.
 */
describe('HomeSearchPanel — chế độ hiển thị lọc kết quả (FR-09)', () => {
  function renderCoPrefs() {
    return render(
      <PreferencesProvider>
        <HomeSearchPanel>
          <Content />
        </HomeSearchPanel>
      </PreferencesProvider>,
    );
  }

  it('chế độ Cơ bản giấu công thức nâng cao, và NÓI RA đang giấu bao nhiêu', async () => {
    window.localStorage.clear();
    const { id, q } = congThucNangCaoDeTim();

    const { container } = renderCoPrefs();
    await userEvent.type(searchBox(), q);

    expect(theCongThuc(container, id)).toBeUndefined();

    const dangAn = countHiddenByLevel(FORMULAS, { ...DEFAULT_LIST_PARAMS, q }, 'basic');
    expect(dangAn).toBeGreaterThan(0);
    expect(screen.getByText(/công thức nâng cao đang ẩn/).textContent).toContain(String(dangAn));
  });

  it('bấm "Bật chế độ Nâng cao" ngay trong dòng đó là công thức hiện ra', async () => {
    window.localStorage.clear();
    const { id, q } = congThucNangCaoDeTim();

    const { container } = renderCoPrefs();
    await userEvent.type(searchBox(), q);
    await userEvent.click(screen.getByRole('button', { name: 'Bật chế độ Nâng cao' }));

    expect(theCongThuc(container, id)).not.toBeUndefined();
    // Đã hiện đủ thì dòng báo tự biến mất, không để lại một câu nói sai.
    expect(screen.queryByText(/công thức nâng cao đang ẩn/)).toBeNull();
  });
});

describe('HomeSearchPanel — bộ lọc che mất kết quả', () => {
  it('lọc mảng khiến rỗng thì mách còn bao nhiêu nếu bỏ lọc', async () => {
    renderPanel();
    const tuKhoa = tuKhoaChiThuocCaNhan();
    await userEvent.type(searchBox(), tuKhoa);
    await userEvent.click(screen.getByRole('button', { name: /Chứng khoán/ }));

    expect(screen.getByText('Không tìm thấy công thức nào')).not.toBeNull();

    const rescue = screen.getByRole('button', { name: /Bỏ lọc · \d+ kết quả/ });
    await userEvent.click(rescue);

    // Bỏ lọc xong thì có kết quả trở lại, và từ khoá vẫn còn nguyên.
    expect(screen.queryByText('Không tìm thấy công thức nào')).toBeNull();
    expect((searchBox() as HTMLInputElement).value).toBe(tuKhoa);
  });
});
