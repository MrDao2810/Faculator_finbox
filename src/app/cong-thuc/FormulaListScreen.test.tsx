// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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

/* `rememberOrigin` ghi sessionStorage — ở đây chỉ cần biết nó được gọi LÚC NÀO. */
const rememberOrigin = vi.hoisted(() => vi.fn());
vi.mock('@/ui/layout/OriginTracker', () => ({ rememberOrigin }));

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
  window.history.replaceState(null, '', '/cong-thuc/');
  document.documentElement.removeAttribute('data-mode');
  rememberOrigin.mockClear();
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
      (within(khoiDanhSach()).getByRole('radio', { name: 'Tất cả nhóm' }) as HTMLInputElement)
        .checked,
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
