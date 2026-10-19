// @vitest-environment jsdom

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULA_LIST_ANCHOR,
  FORMULA_SUMMARIES,
  LEGACY_HOME_RECENT_SEARCHES_KEY,
  PREFERENCES_STORAGE_KEY,
  RECENT_SEARCHES_KEY,
} from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';
import { RESULT_OPENED_KEY } from '@/application/use-list-url-state';

import { FormulaListScreen } from './FormulaListScreen';

/*
 * `ListUrlSync` gọi `useSearchParams()` — ngoài App Router thật thì phải có bản giả. Chuỗi truy vấn
 * đọc từ `window.location` để ca nào đặt URL bằng `history.replaceState` thì hook thấy đúng URL ấy.
 */
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(window.location.search),
  usePathname: () => window.location.pathname,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

/* Hai hàm của `OriginTracker` đều ghi sessionStorage — ở đây chỉ cần biết chúng được gọi LÚC NÀO. */
const { rememberOrigin, cancelScrollRestore } = vi.hoisted(() => ({
  rememberOrigin: vi.fn(),
  cancelScrollRestore: vi.fn(),
}));
vi.mock('@/ui/layout/OriginTracker', () => ({ rememberOrigin, cancelScrollRestore }));

const TONG = FORMULA_SUMMARIES.length;
const SO_CO_BAN = FORMULA_SUMMARIES.filter((f) => f.level === 'basic').length;
const MOT_CONG_THUC_NANG_CAO = FORMULA_SUMMARIES.find((f) => f.level === 'advanced');
if (MOT_CONG_THUC_NANG_CAO === undefined) {
  throw new Error('Cần ít nhất một công thức mức Nâng cao trong Registry cho ca kiểm này.');
}
const PE = FORMULA_SUMMARIES.find((f) => f.id === 'pe');
if (PE === undefined) throw new Error('Cần công thức "pe" trong Registry cho ca kiểm này.');

/** Kệ giả — thứ màn nhận qua prop, không phải việc của file này. */
const KE = <p data-testid="ke">kệ hằng ngày</p>;

function moMan() {
  return render(
    <PreferencesProvider>
      <FormulaListScreen shelf={KE} />
    </PreferencesProvider>,
  );
}

/** Khối "Danh sách công thức" — mọi phép đếm thẻ chỉ đếm TRONG khối này. */
function khoiDanhSach(): HTMLElement {
  const el = document.getElementById(FORMULA_LIST_ANCHOR);
  if (el === null) throw new Error('Không thấy khối danh sách.');
  return el;
}

/** Id công thức của các thẻ trong danh sách (href `next/link` dưới jsdom mất dấu `/` cuối). */
function idTrongDanhSach(): string[] {
  return [...khoiDanhSach().querySelectorAll('li a[href^="/cong-thuc/"]')].map((a) =>
    (a.getAttribute('href') ?? '').replace(/^\/cong-thuc\//, '').replace(/\/$/, ''),
  );
}

function oTim(): HTMLInputElement {
  return screen.getByLabelText('Tìm công thức') as HTMLInputElement;
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.history.replaceState(null, '', '/cong-thuc/');
  document.documentElement.removeAttribute('data-mode');
  rememberOrigin.mockClear();
  cancelScrollRestore.mockClear();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

/*
 * ── HTML tĩnh ────────────────────────────────────────────────────────────────────────────────
 *
 * Màn này là URL mở đầu của sản phẩm. Thứ Google đọc và thứ người dùng thấy trước khi JS chạy là
 * lượt dựng server — `renderToStaticMarkup` là cách duy nhất nhìn thấy nó trong một test.
 */
describe('FormulaListScreen — lượt dựng tĩnh', () => {
  const html = renderToStaticMarkup(<FormulaListScreen shelf={KE} />);

  it('danh sách dựng ĐỦ mọi công thức, không lọc theo chế độ — Google phải thấy đủ đường vào', () => {
    const ids = new Set(
      [...html.matchAll(/href="\/cong-thuc\/([a-z0-9-]+)\/?"/g)].map((m) => m[1]),
    );
    expect(ids.size).toBe(TONG);
  });

  it('thẻ Nâng cao mang lớp để CSS giấu trước hydrate — đúng số thẻ Nâng cao', () => {
    const soLop = (html.match(/advancedPreHydrate/g) ?? []).length;
    expect(soLop).toBe(TONG - SO_CO_BAN);
  });

  it('kệ do nơi gọi truyền vào nằm sẵn trong HTML', () => {
    expect(html).toContain('kệ hằng ngày');
  });

  it('dòng "Hiển thị" mang cả hai con số để CSS chọn theo chế độ', () => {
    const dong = /Hiển thị[\s\S]*?<\/p>/.exec(html)?.[0] ?? '';
    expect(dong).toContain(`>${String(SO_CO_BAN)}<`);
    expect(dong).toContain(`>${String(TONG)}<`);
  });

  it('khối danh sách có neo riêng và hàng chip nhóm dạng radio', () => {
    expect(html).toContain(`id="${FORMULA_LIST_ANCHOR}"`);
    expect((html.match(/type="radio"/g) ?? []).length).toBe(13);
  });

  it('không có <h1> trong thân màn — tiêu đề nằm ở thanh trên', () => {
    expect(html).not.toMatch(/<h1[\s>]/);
  });
});

describe('FormulaListScreen — sau khi đọc xong tuỳ chọn', () => {
  it('chế độ Cơ bản thì danh sách chỉ còn công thức Cơ bản', async () => {
    moMan();

    await waitFor(() => {
      expect(idTrongDanhSach()).toHaveLength(SO_CO_BAN);
    });
    expect(idTrongDanhSach()).not.toContain(MOT_CONG_THUC_NANG_CAO.id);
  });

  it('chế độ Nâng cao đã lưu thì đủ cả thư viện', async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ mode: 'advanced', locale: 'vi', theme: 'light' }),
    );
    moMan();

    await waitFor(() => {
      expect(idTrongDanhSach()).toContain(MOT_CONG_THUC_NANG_CAO.id);
    });
    expect(idTrongDanhSach()).toHaveLength(TONG);
  });

  it('cụm Cơ bản / Nâng cao nằm trong khối danh sách, mang tên "Mức độ"', () => {
    moMan();
    expect(within(khoiDanhSach()).getByRole('group', { name: 'Mức độ' })).toBeTruthy();
  });
});

describe('FormulaListScreen — ô tìm lọc cả danh sách tại chỗ', () => {
  it('gõ là danh sách thu hẹp và kệ ẩn đi (vẫn nằm trong DOM)', async () => {
    moMan();
    await waitFor(() => {
      expect(idTrongDanhSach()).toHaveLength(SO_CO_BAN);
    });

    fireEvent.change(oTim(), { target: { value: 'P/E' } });

    expect(idTrongDanhSach()).toContain('pe');
    expect(idTrongDanhSach().length).toBeLessThan(SO_CO_BAN);

    const ke = screen.getByTestId('ke');
    expect(ke.closest('[hidden]')).not.toBeNull();
  });

  it('xoá chữ thì kệ hiện lại', () => {
    moMan();
    fireEvent.change(oTim(), { target: { value: 'roi' } });
    fireEvent.change(oTim(), { target: { value: '' } });

    expect(screen.getByTestId('ke').closest('[hidden]')).toBeNull();
  });

  it('bấm một KẾT QUẢ TÌM thì ghi tên công thức vào kho "Tìm gần đây" chung', () => {
    moMan();
    fireEvent.change(oTim(), { target: { value: 'P/E' } });

    const link = within(khoiDanhSach())
      .getAllByRole('link')
      .find((a) => /\/cong-thuc\/pe\/?$/.test(a.getAttribute('href') ?? ''));
    expect(link).toBeDefined();
    fireEvent.click(link as HTMLElement);

    expect(JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')).toEqual([
      PE.name.vi,
    ]);
  });

  it('chưa gõ gì mà bấm thẻ thì KHÔNG ghi lịch sử tìm — đó không phải một kết quả tìm', async () => {
    moMan();
    await waitFor(() => {
      expect(idTrongDanhSach()).toContain('pe');
    });

    const link = within(khoiDanhSach())
      .getAllByRole('link')
      .find((a) => /\/cong-thuc\/pe\/?$/.test(a.getAttribute('href') ?? ''));
    fireEvent.click(link as HTMLElement);

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
  });

  it('bấm chip "Tìm gần đây" thì lọc ngay tại chỗ, không chuyển màn', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([PE.name.vi]));
    moMan();

    fireEvent.click(await screen.findByRole('button', { name: PE.name.vi }));

    expect(oTim().value).toBe(PE.name.vi);
    expect(window.location.search).toContain('q=');
    expect(idTrongDanhSach()).toContain('pe');
  });

  it('gộp kho lịch sử cũ của trang chủ ở lần mở đầu', async () => {
    window.localStorage.setItem(LEGACY_HOME_RECENT_SEARCHES_KEY, JSON.stringify(['ROI']));
    moMan();

    expect(await screen.findByRole('button', { name: 'ROI' })).toBeTruthy();
    expect(window.localStorage.getItem(LEGACY_HOME_RECENT_SEARCHES_KEY)).toBeNull();
  });

  /*
   * 19/10/2026: chủ dự án chuyển sang tiếng Anh, chip vẫn đọc tên tiếng Việt — kho ghi tên theo
   * ngôn ngữ LÚC BẤM và chip in lại nguyên chuỗi. Nay chip in theo ngôn ngữ đang bật, và kho ghi tên
   * gốc `vi` ở mọi ngôn ngữ.
   */
  it('tiếng Anh: chip ghi bằng tên Việt hiện bằng tên Anh, bấm thì lọc theo tên Anh', async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ mode: 'basic', locale: 'en', theme: 'light' }),
    );
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([PE.name.vi]));
    moMan();

    fireEvent.click(await screen.findByRole('button', { name: PE.name.en }));
    expect(screen.queryByRole('button', { name: PE.name.vi })).toBeNull();
    expect((screen.getByRole('searchbox') as HTMLInputElement).value).toBe(PE.name.en);
    expect(idTrongDanhSach()).toContain('pe');
  });

  it('tiếng Anh: bấm một kết quả tìm vẫn ghi tên GỐC tiếng Việt vào kho', async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ mode: 'basic', locale: 'en', theme: 'light' }),
    );
    moMan();
    fireEvent.change(screen.getByRole('searchbox') as HTMLInputElement, {
      target: { value: 'P/E' },
    });

    const link = within(khoiDanhSach())
      .getAllByRole('link')
      .find((a) => /\/cong-thuc\/pe\/?$/.test(a.getAttribute('href') ?? ''));
    fireEvent.click(link as HTMLElement);

    expect(JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')).toEqual([
      PE.name.vi,
    ]);
  });
});

/*
 * 16/10/2026: chủ dự án gõ "%b" và nhận 96 thẻ, phần lớn không liên quan. Luật mới ở
 * `search.ts`/`phrase.ts`; hai ca dưới đây giữ nó ở đúng màn đã báo lỗi.
 */
describe('FormulaListScreen — khớp tên lên đầu, khớp phụ tô vàng', () => {
  beforeEach(() => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ mode: 'advanced', locale: 'vi', theme: 'light' }),
    );
  });

  function theCua(id: string): HTMLElement {
    const the = within(khoiDanhSach())
      .getAllByRole('link')
      .find((a) => new RegExp(`/cong-thuc/${id}/?$`).test(a.getAttribute('href') ?? ''));
    if (the === undefined) throw new Error(`Không thấy thẻ ${id}.`);
    return the;
  }

  it('"%b" chỉ còn đúng thẻ %B', async () => {
    moMan();
    await waitFor(() => {
      expect(idTrongDanhSach()).toHaveLength(TONG);
    });

    fireEvent.change(oTim(), { target: { value: '%b' } });

    expect(idTrongDanhSach()).toEqual(['phan-tram-b-bollinger']);
    expect(khoiDanhSach().querySelectorAll('mark')).toHaveLength(0);
  });

  it('"p/e": thẻ khớp tên đứng trên, thẻ chỉ nhắc P/E trong mô tả đứng dưới và tô đúng cụm ấy', async () => {
    moMan();
    await waitFor(() => {
      expect(idTrongDanhSach()).toHaveLength(TONG);
    });

    fireEvent.change(oTim(), { target: { value: 'p/e' } });

    const ids = idTrongDanhSach();
    expect(ids.slice(0, 2)).toEqual(['pe', 'peg']);
    expect([...ids.slice(2)].sort()).toEqual(['gia-muc-tieu', 'ty-suat-loi-nhuan-tren-gia']);

    // Khớp chính không tô gì; khớp phụ tô đúng "P/E" trong mô tả, chữ trên thẻ không đổi.
    expect(theCua('pe').querySelectorAll('mark')).toHaveLength(0);
    const phu = theCua('gia-muc-tieu');
    expect([...phu.querySelectorAll('mark')].map((m) => m.textContent)).toEqual(['P/E']);
    const moTa = FORMULA_SUMMARIES.find((f) => f.id === 'gia-muc-tieu')?.description.vi ?? '';
    expect(phu.textContent).toContain(moTa);
  });
});

describe('FormulaListScreen — hàng chip nhóm và nút xoá bộ lọc', () => {
  it('chọn một nhóm thì danh sách chỉ còn nhóm ấy và URL mang ?category=', async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ mode: 'advanced', locale: 'vi', theme: 'light' }),
    );
    moMan();

    fireEvent.click(within(khoiDanhSach()).getByRole('radio', { name: /^Rủi ro/ }));

    const rrIds = new Set(
      FORMULA_SUMMARIES.filter((f) => f.categoryId === 'risk').map((f) => f.id),
    );
    await waitFor(() => {
      expect(idTrongDanhSach().length).toBe(rrIds.size);
    });
    expect(idTrongDanhSach().every((id) => rrIds.has(id))).toBe(true);
    expect(window.location.search).toBe('?category=risk');
  });

  it('nút "Xoá bộ lọc" chỉ hiện khi có bộ lọc, và xoá bộ lọc mà giữ chuỗi tìm', () => {
    moMan();
    expect(screen.queryByRole('button', { name: 'Xoá bộ lọc' })).toBeNull();

    fireEvent.change(oTim(), { target: { value: 'gia' } });
    expect(screen.queryByRole('button', { name: 'Xoá bộ lọc' })).toBeNull();

    fireEvent.click(within(khoiDanhSach()).getByRole('radio', { name: /^Định giá/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Xoá bộ lọc' }));

    expect(
      (within(khoiDanhSach()).getByRole('radio', { name: 'Tất cả' }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(oTim().value).toBe('gia');
  });

  it('nhóm chỉ có công thức Nâng cao ở chế độ Cơ bản thì nói rõ và có nút bật', async () => {
    moMan();
    await waitFor(() => {
      expect(idTrongDanhSach()).toHaveLength(SO_CO_BAN);
    });

    fireEvent.click(within(khoiDanhSach()).getByRole('radio', { name: /^Tài chính DN/ }));

    expect(screen.getByText('Ở đây chỉ có công thức nâng cao')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Bật chế độ Nâng cao' }));
    expect(document.documentElement.dataset.mode).toBe('advanced');
  });

  /*
   * Ca ĐẢO, không xoá: dòng "N công thức nâng cao đang ẩn · Bật chế độ Nâng cao" trên đầu danh sách
   * bỏ ngày 19/10/2026 (chủ dự án: "bỏ đoạn giải thích này đi", mộ chí `list.hiddenByLevel` ở
   * `vi.ts`). Dòng ấy quay lại phải là một quyết định.
   */
  it('chế độ Cơ bản giấu thẻ nâng cao mà không còn dòng "nâng cao đang ẩn" trên đầu danh sách', async () => {
    moMan();
    await waitFor(() => {
      expect(idTrongDanhSach()).toHaveLength(SO_CO_BAN);
    });

    // Canary: Cơ bản thật sự đang giấu bớt thẻ, nên ca này đúng là ca CÓ thứ đang ẩn.
    expect(SO_CO_BAN).toBeLessThan(FORMULA_SUMMARIES.length);
    expect(screen.queryByText(/nâng cao đang ẩn/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Bật chế độ Nâng cao' })).toBeNull();
  });
});

/*
 * Nút quay lại ở trang chi tiết đưa người dùng về đúng bộ lọc VÀ đúng chỗ cuộn. Ghi màn gốc lúc gắn
 * là đè `scrollY` đang chờ khôi phục bằng số 0 của trang vừa mở — `OriginTracker` chạy SAU màn này
 * (nó đứng sau `<main>` trong `AppShell`), nên nó đọc phải con số đã bị đè.
 */
describe('FormulaListScreen — nhớ màn gốc đúng lúc', () => {
  it('KHÔNG gọi rememberOrigin chỉ vì gắn', () => {
    moMan();
    expect(rememberOrigin).not.toHaveBeenCalled();
  });

  it('gọi rememberOrigin sau khi URL thật sự đổi vì người dùng lọc', () => {
    moMan();
    fireEvent.click(within(khoiDanhSach()).getByRole('radio', { name: /^Vay nợ/ }));

    expect(rememberOrigin).toHaveBeenCalled();
  });

  it('link có bộ lọc mở thẳng vào màn thì áp bộ lọc, vẫn không ghi đè màn gốc', async () => {
    window.history.replaceState(null, '', '/cong-thuc/?category=loans');
    moMan();

    await act(async () => {
      await Promise.resolve();
    });

    expect(
      (within(khoiDanhSach()).getByRole('radio', { name: /^Vay nợ/ }) as HTMLInputElement).checked,
    ).toBe(true);
    expect(rememberOrigin).not.toHaveBeenCalled();
  });
});

/*
 * Chủ dự án yêu cầu 18/09/2026: tìm, bấm một kết quả xem chi tiết, quay lại thì ô tìm phải TRỐNG.
 * Lối về nào (nút ‹, "Huỷ", nút Lùi) cũng gắn lại màn ở đúng URL có `?q=`, nên các ca dưới dựng lại
 * đúng cảnh ấy: tháo màn rồi gắn lại ở URL cũ. Cơ chế nằm ở `useListUrlState`; ở đây gác chỗ màn nối
 * vào nó — cú bấm nào đánh dấu, và màn trông ra sao lúc về.
 */
describe('FormulaListScreen — quay về từ một kết quả tìm', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  /** Thẻ `pe` trong khối danh sách. */
  function thePe(): HTMLElement {
    const link = within(khoiDanhSach())
      .getAllByRole('link')
      .find((a) => /\/cong-thuc\/pe\/?$/.test(a.getAttribute('href') ?? ''));
    if (link === undefined) throw new Error('Không thấy thẻ "pe" trong danh sách.');
    return link;
  }

  /**
   * Bấm như một ngón tay thật: `pointerdown` tới trước và xả lần ghi URL đang đợi, `click` tới sau.
   * Dấu "vừa mở kết quả" chép đúng URL lúc `click`, nên thứ tự này là một phần của ca kiểm.
   */
  function bamThe(the: HTMLElement, phim: { ctrlKey?: boolean } = {}): void {
    fireEvent.pointerDown(the, phim);
    fireEvent.click(the, phim);
  }

  /** Cho microtask ghi lại URL chạy. */
  async function choGhiUrl(): Promise<void> {
    await act(async () => {
      await Promise.resolve();
    });
  }

  it('ô tìm trống, kệ hiện lại, URL bỏ ?q=, màn về đầu trang', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    moMan();
    fireEvent.change(oTim(), { target: { value: 'P/E' } });
    bamThe(thePe());
    expect(window.location.search).toBe('?q=P%2FE');

    cleanup();
    moMan();
    await choGhiUrl();

    expect(oTim().value).toBe('');
    expect(screen.getByTestId('ke').closest('[hidden]')).toBeNull();
    expect(window.location.search).toBe('');
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(cancelScrollRestore).toHaveBeenCalledTimes(1);
    // Chip "Tìm gần đây" mang tên công thức vừa mở, sẵn cho lượt tìm sau.
    expect(await screen.findByRole('button', { name: PE.name.vi })).toBeTruthy();
  });

  /*
   * `next dev` bật StrictMode: effect chạy, tháo giả, chạy lại. Một lần ghi hẹn bằng bộ hẹn giờ của
   * hook sẽ bị lượt tháo giả huỷ mất, URL giữ nguyên `?q=` và lần tải lại sau hiện chữ cũ.
   */
  it('StrictMode chạy effect hai lần vẫn ghi lại URL', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    moMan();
    fireEvent.change(oTim(), { target: { value: 'P/E' } });
    bamThe(thePe());

    cleanup();
    render(
      <StrictMode>
        <PreferencesProvider>
          <FormulaListScreen shelf={KE} />
        </PreferencesProvider>
      </StrictMode>,
    );
    await choGhiUrl();

    expect(oTim().value).toBe('');
    expect(window.location.search).toBe('');
  });

  it('chỉ bỏ chuỗi tìm, nhóm đang chọn vẫn giữ', async () => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    window.history.replaceState(null, '', `/cong-thuc/?q=P%2FE&category=${PE.categoryId}`);
    moMan();
    bamThe(thePe());

    cleanup();
    moMan();
    await choGhiUrl();

    expect(oTim().value).toBe('');
    expect(window.location.search).toBe(`?category=${PE.categoryId}`);
  });

  it('Ctrl-bấm (mở tab mới) vẫn ghi "Tìm gần đây" nhưng không đánh dấu, gắn lại vẫn giữ chữ', async () => {
    moMan();
    fireEvent.change(oTim(), { target: { value: 'P/E' } });
    bamThe(thePe(), { ctrlKey: true });

    expect(window.sessionStorage.getItem(RESULT_OPENED_KEY)).toBeNull();
    expect(JSON.parse(window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '[]')).toEqual([
      PE.name.vi,
    ]);

    cleanup();
    moMan();
    await choGhiUrl();

    expect(oTim().value).toBe('P/E');
    expect(cancelScrollRestore).not.toHaveBeenCalled();
  });
});

/*
 * Ô tìm ghim dưới thanh trên ở khổ điện thoại (17/10/2026, chủ dự án: "scroll nội dung trong phần công
 * thức đến đâu thì thanh search cũng cần để yên trên top giống như cơ chế của header").
 *
 * Hai nửa, và jsdom không thấy nửa nào: nó không chạy CSS Module, nên mất `sticky` là màn sai mà không
 * ca hành vi nào đỏ; còn `sticky` chỉ dính trong khối CHA, nên bọc ô tìm chung khung với hàng chip là ô
 * tìm trôi đi sau vài chục pixel cuộn dù luật CSS vẫn nguyên. Ca đầu gác cấu trúc, ca sau đọc thẳng luật.
 */
describe('ô tìm ghim dưới thanh trên ở khổ điện thoại', () => {
  it('khung bọc ô tìm nằm cùng cha với khối danh sách và không chứa hàng chip lịch sử', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify([PE.name.vi]));
    moMan();
    const chip = await screen.findByRole('button', { name: PE.name.vi });

    const cha = khoiDanhSach().parentElement;
    let khung: HTMLElement = oTim();
    while (khung.parentElement !== null && khung.parentElement !== cha) khung = khung.parentElement;

    expect(khung.parentElement, 'ô tìm phải là con trực tiếp của màn, kéo tới hết danh sách').toBe(
      cha,
    );
    expect(khung.contains(chip), 'hàng chip lịch sử không được ghim theo ô tìm').toBe(false);
  });

  it('dưới 1024px khung ô tìm là sticky, đỉnh ngay dưới thanh trên, có nền; từ 1024px đứng yên', () => {
    const css = readFileSync(
      join(process.cwd(), 'src/app/cong-thuc/FormulaListScreen.module.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, '');

    const ghim = /@media \(max-width: 1023\.98px\)\s*\{\s*\.searchSlot\s*\{([^}]*)\}/.exec(
      css,
    )?.[1];
    expect(ghim, 'thiếu luật .searchSlot trong @media (max-width: 1023.98px)').toBeDefined();
    expect(ghim).toMatch(/position:\s*sticky;/);
    expect(ghim).toMatch(/top:\s*calc\(var\(--header-height\) \+ 1px/);
    expect(ghim).toMatch(/background:\s*var\(--color-paper\);/);

    const ngoaiMedia = css.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*\s*\}/g, '');
    expect(ngoaiMedia).not.toMatch(/\.searchSlot\s*\{[^}]*position:/);
  });
});

/*
 * Bộ lọc của khối danh sách dưới 1024px (19/10/2026, chủ dự án: "giảm size text và giảm height bản
 * những phần tôi khoanh đỏ áp dụng cho màn mobile"). Nhóm Cơ bản / Nâng cao (`ModeToggle`) và ô Sắp
 * xếp đứng trên cùng hàng điều khiển, nên phải cao bằng nhau; hai con số nằm ở hai luật khác nhau và
 * jsdom không chạy CSS, nên ca này đọc thẳng file.
 */
describe('bộ lọc của khối danh sách ở khổ điện thoại', () => {
  /** Gộp thân mọi khối `@media (max-width: 1023.98px)` — đếm ngoặc, vì khối chứa nhiều luật. */
  function khoiDuoi1024(css: string): string {
    const quet = /@media([^{]*)\{/g;
    let gop = '';
    let khop = quet.exec(css);
    while (khop !== null) {
      const batDau = khop.index + khop[0].length;
      let sau = 1;
      let i = batDau;
      while (i < css.length && sau > 0) {
        if (css[i] === '{') sau += 1;
        else if (css[i] === '}') sau -= 1;
        i += 1;
      }
      if ((khop[1] ?? '').includes('max-width: 1023.98px')) gop += css.slice(batDau, i - 1);
      quet.lastIndex = i;
      khop = quet.exec(css);
    }
    return gop;
  }

  const khoi = khoiDuoi1024(
    readFileSync(
      join(process.cwd(), 'src/app/cong-thuc/FormulaListScreen.module.css'),
      'utf8',
    ).replace(/\/\*[\s\S]*?\*\//g, ''),
  );

  it('nhóm Mức độ và ô Sắp xếp cao bằng nhau, chữ nhỏ đi một bậc', () => {
    const nut = /\.level button\s*\{([^}]*)\}/.exec(khoi)?.[1];
    const sap = /\.controls > \.sort > select\s*\{([^}]*)\}/.exec(khoi)?.[1];
    const cao = (than: string | undefined) =>
      Number(/min-height:\s*(\d+)px;/.exec(than ?? '')?.[1]);

    expect(nut, 'thiếu luật .level button dưới 1024px').toBeDefined();
    expect(sap, 'thiếu luật ô Sắp xếp dưới 1024px').toBeDefined();
    // Nhóm = nút + đệm 2px × 2 + viền 1px × 2 (`.group` của `ModeToggle.module.css`).
    expect(cao(sap)).toBe(cao(nut) + 6);
    expect(nut).toMatch(/font-size:\s*var\(--text-xs\);/);
    expect(sap).toMatch(/font-size:\s*var\(--text-xs\);/);
    expect(khoi).toMatch(/\.count\s*\{[^}]*font-size:\s*var\(--text-sm\);/);
  });

  /*
   * Lượt hai cùng ngày, chủ dự án vẽ mũi tên: "thử đưa tiêu đề lên đầu của select rồi chuyển 2 select
   * trên thành 1 hàng ngang". Nhãn lên trên, hai cụm chung một hàng, ô Sắp xếp giãn tới mép phải.
   */
  it('nhãn nằm trên điều khiển, hai cụm chung một hàng, ô Sắp xếp giãn lấp phần còn lại', () => {
    const hang = /\.controls\s*\{([^}]*)\}/.exec(khoi)?.[1];
    const mucDo = /\.level\s*\{([^}]*)\}/.exec(khoi)?.[1];
    const sapXep = /\.controls > \.sort\s*\{([^}]*)\}/.exec(khoi)?.[1];
    const o = /\.controls > \.sort > select\s*\{([^}]*)\}/.exec(khoi)?.[1];

    expect(hang).toMatch(/flex-wrap:\s*nowrap;/);
    expect(hang).toMatch(/align-items:\s*flex-end;/);
    expect(mucDo).toMatch(/flex-direction:\s*column;/);
    expect(mucDo).toMatch(/flex:\s*none;/);
    expect(sapXep).toMatch(/flex-direction:\s*column;/);
    expect(sapXep).toMatch(/flex:\s*1 1 0;/);
    expect(o).toMatch(/width:\s*100%;/);
    expect(o).toMatch(/min-width:\s*0;/);
  });
});
