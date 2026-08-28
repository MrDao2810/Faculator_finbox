// @vitest-environment jsdom

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULAS,
  FORMULA_USAGE_KEY,
  MARKET_CONFIG,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_CACHE_KEY,
  PRICE_SERIES_KEY,
  RECENT_SEARCHES_KEY,
  SAVED_CALCS_KEY,
  TICKER_LIST_KEY,
} from '@/application';
import { readPreferences } from '@/application/preferences';
import { PreferencesProvider } from '@/application/preferences-context';

import { SettingsScreen } from './SettingsScreen';

function open() {
  render(
    <PreferencesProvider>
      <SettingsScreen />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('WF-13 — bốn khối đúng thứ tự wireframe', () => {
  it('dựng đủ chế độ hiển thị · đơn vị & biểu phí · dữ liệu trên máy · về sản phẩm', () => {
    open();

    const titles = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(titles).toEqual([
      'Chế độ hiển thị',
      'Đơn vị & biểu thị',
      'Dữ liệu trên máy',
      'Về sản phẩm',
    ]);
  });

  it('có đúng một <h1>', () => {
    open();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });
});

describe('đơn vị & biểu phí — cài đặt ghi được và nhớ được (SW-02)', () => {
  it('đổi bậc đơn vị thì ghi xuống localStorage', async () => {
    open();

    await userEvent.click(screen.getByRole('button', { name: 'tỷ ₫' }));

    const stored = readPreferences(window.localStorage.getItem(PREFERENCES_STORAGE_KEY));
    expect(stored.unitScale).toBe('billion');
  });

  /*
   * MarketConfig hiện chỉ có MỘT biểu phí, nên chưa đổi sang cái khác được — ca kiểm này chốt
   * rằng ô chọn dựng từ cấu hình chứ không viết cứng, để ngày thêm biểu phí thứ hai thì màn
   * tự có nó. Việc "ô chọn một lựa chọn" đã ghi vào TASK.md.
   */
  it('ô chọn biểu phí dựng từ MarketConfig, đánh dấu cái mặc định', () => {
    open();

    const select = screen.getByLabelText(/Biểu phí giao dịch/) as HTMLSelectElement;
    expect(select.options).toHaveLength(MARKET_CONFIG.schedules.length);

    for (const schedule of MARKET_CONFIG.schedules) {
      const option = [...select.options].find((o) => o.value === schedule.id);
      expect(option, schedule.id).toBeDefined();
      expect(option?.textContent).toBe(schedule.name.vi);
    }

    // Biểu phí đang dùng phải là cái đang được chọn sẵn.
    expect(select.value).toBe(MARKET_CONFIG.defaultScheduleId);
  });

  it('nói rõ đổi đơn vị KHÔNG đổi cách đọc ô nhập', () => {
    open();
    expect(screen.getByText(/ô nhập vẫn theo quy ước Việt Nam/)).not.toBeNull();
  });
});

describe('dữ liệu trên máy — LDR-04, NFR-SEC-01', () => {
  it('liệt kê đủ các khoá app đang dùng', () => {
    open();

    for (const key of [
      PREFERENCES_STORAGE_KEY,
      RECENT_SEARCHES_KEY,
      FORMULA_USAGE_KEY,
      PRICE_SERIES_KEY,
      PORTFOLIO_KEY,
      SAVED_CALCS_KEY,
      TICKER_LIST_KEY,
      PRICE_CACHE_KEY,
    ]) {
      expect(screen.getByText(key), key).not.toBeNull();
    }
  });

  /**
   * Cửa gác: kho mới mà quên dòng ở màn này thì đỏ ngay, không đợi ai đó tình cờ nhận ra.
   *
   * Đã thủng hai lần thật — `ffb.tickers.v1` và `ffb.prices.v1` ghi vào máy người dùng từ gói
   * "Danh mục dùng số liệu thật" mà không có nút xoá nào, cho tới đợt cá nhân hoá trang chủ mới
   * được vá. Quét file thay vì liệt kê tay vì chính việc liệt kê tay là thứ đã bỏ sót.
   */
  it('mọi kho localStorage khai trong src/application đều xoá được ở màn này', () => {
    // `process.cwd()` chứ không `import.meta.url`: file này chạy ở môi trường jsdom, nơi
    // `import.meta.url` là một URL http chứ không phải file:// nên `fileURLToPath` ném lỗi.
    const dir = join(process.cwd(), 'src', 'application');
    const files = readdirSync(dir).filter(
      (name) => name.endsWith('.ts') && !name.includes('.test.'),
    );
    // Đường dẫn hỏng thì không có gì để soi và ca kiểm đỗ giả — chặn kiểu đỗ đó.
    expect(files.length, `không quét được ${dir}`).toBeGreaterThan(5);

    /** Kho KHÔNG cần nút xoá, kèm lý do. Danh sách này phải luôn có lý do, không được để trống. */
    const CO_Y: ReadonlyArray<{ key: string; viSao: string }> = [
      {
        key: 'ffb.origin.v1',
        viSao:
          'sessionStorage — màn vừa rời đi và chỗ đang đứng trên đó, tự hết khi đóng tab. Không sống qua phiên nên không có gì để xoá',
      },
      {
        key: 'ffb.origin.prev.v1',
        viSao:
          'sessionStorage — màn gốc liền trước, cùng vòng đời và cùng lý do với ffb.origin.v1. Tách ô thứ hai vì màn tìm kiếm vừa là màn gốc vừa có nút quay lại của chính nó',
      },
      {
        key: 'ffb.origin.restore.v1',
        viSao:
          'sessionStorage — cờ sống đúng MỘT lượt điều hướng: nút quay lại đặt, màn đích đọc rồi xoá ngay. Một nút xoá cho nó là nút không bao giờ có gì để xoá',
      },
      {
        key: 'ffb.activeTicker.v1',
        viSao:
          'sessionStorage — mã dính theo lượt duyệt, tự hết khi đóng tab. Lối xoá nằm ngay tại chỗ nó có tác dụng: nút "Bỏ mã" trên thanh của màn chi tiết công thức',
      },
    ];

    const khai = new Set<string>();
    for (const name of files) {
      const src = readFileSync(join(dir, name), 'utf8');
      for (const match of src.matchAll(/'(ffb\.[a-z.]+v\d+)'/gi)) {
        const key = match[1];
        if (key !== undefined) khai.add(key);
      }
    }
    expect(
      khai.size,
      'không tìm thấy khoá ffb.* nào — biểu thức quét có thể đã hỏng',
    ).toBeGreaterThan(4);

    open();
    const tren_man = new Set(
      screen.getAllByRole('listitem').flatMap((row) => {
        const code = row.querySelector('code')?.textContent;
        return code === null || code === undefined ? [] : [code];
      }),
    );

    const thieu = [...khai].filter(
      (key) => !tren_man.has(key) && !CO_Y.some((mien) => mien.key === key),
    );
    expect(
      thieu,
      `kho nằm trên máy người dùng mà không có nút xoá: ${thieu.join(', ')} — thêm dòng vào STORAGE_ITEMS`,
    ).toEqual([]);
  });

  it('chưa lưu gì thì nói "chưa lưu gì" và khoá nút xoá của dòng đó', () => {
    open();

    expect(screen.getAllByText(/chưa lưu gì/).length).toBeGreaterThan(0);
    for (const button of screen.getAllByRole('button', { name: 'Xoá' })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it('có dữ liệu thì hiện cỡ thật và xoá được đúng dòng đó', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    window.localStorage.setItem(PORTFOLIO_KEY, '[]');
    open();

    const rows = screen.getAllByRole('listitem');
    const recentRow = rows.find((row) => row.textContent?.includes(RECENT_SEARCHES_KEY));
    expect(recentRow).toBeDefined();

    // Đúng độ dài chuỗi đã ghi, hiện nguyên chứ không làm tròn. Chữ nằm rải qua <code> nên
    // phải đọc textContent của cả dòng chứ không dò một nút văn bản.
    const length = (window.localStorage.getItem(RECENT_SEARCHES_KEY) ?? '').length;
    expect(length).toBe(12);
    expect(recentRow?.textContent).toContain(`${String(length)} ký tự`);

    const button = recentRow?.querySelector('button');
    expect((button as HTMLButtonElement).disabled).toBe(false);
    await userEvent.click(button as HTMLElement);

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    // Chỉ xoá đúng dòng vừa bấm, không đụng mục khác.
    expect(window.localStorage.getItem(PORTFOLIO_KEY)).toBe('[]');
  });

  it('nút xoá tất cả hỏi lại trước, và huỷ thì KHÔNG xoá gì', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    open();

    await userEvent.click(screen.getByRole('button', { name: /Xoá toàn bộ/ }));

    expect(window.confirm).toHaveBeenCalled();
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBe('["roi"]');
  });

  it('chưa lưu gì thì nút xoá tất cả bị khoá', () => {
    open();

    const button = screen.getByRole('button', { name: /Xoá toàn bộ/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('nói thẳng dữ liệu không rời khỏi máy (COM-03)', () => {
    open();
    expect(screen.getByText(/không được gửi đi đâu/)).not.toBeNull();
  });
});

/**
 * Thanh HOÀN TÁC — đợt 13.
 *
 * Chủ dự án báo: bấm nút xoá xong "không thấy có gì thay đổi". Bốn ca dưới gác đúng bốn thứ đã
 * hứa: có thanh, hoàn tác được nguyên vẹn, thanh tự tắt sau 5 giây, và rời màn giữa chừng không
 * để lại bộ đếm chạy tiếp.
 *
 * `beforeEach` chung của file gọi `localStorage.clear()`, nên mọi ca ở đây phải TỰ ghi dữ liệu:
 * kho rỗng thì nút xoá bị khoá và không có gì để hoàn tác.
 */
describe('hoàn tác sau khi xoá một kho', () => {
  /** Bấm nút thùng rác của dòng chứa `key`. Trả về đúng nút ấy để ca kiểm soi tiếp nếu cần. */
  async function xoaDong(key: string): Promise<HTMLButtonElement> {
    const row = screen.getAllByRole('listitem').find((li) => li.textContent?.includes(key));
    expect(row, key).toBeDefined();
    const button = row?.querySelector('button') as HTMLButtonElement;
    await userEvent.click(button);
    return button;
  }

  it('xoá xong thì hiện thanh nói rõ kho nào vừa mất, kèm số giây đếm ngược', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    open();

    await xoaDong(RECENT_SEARCHES_KEY);

    const bar = screen.getByRole('status');
    // Tên kho phải có trong câu: xoá xong mà chỉ báo "Đã xoá" thì không neo vào đâu cả.
    expect(bar.textContent).toContain('Từ khoá đã tìm');
    expect(bar.textContent).toContain('5');
    expect(screen.getByRole('button', { name: 'Hoàn tác' })).not.toBeNull();
  });

  /*
   * Xoá phải là XOÁ THẬT ngay (ca "có dữ liệu thì hiện cỡ thật…" ở trên chốt điều đó), nên hoàn
   * tác là GHI LẠI. Chuỗi ghi lại phải khớp từng ký tự — ghi lại một chuỗi "tương đương" là làm
   * hỏng đúng thứ người dùng vừa xin giữ.
   */
  it('bấm Hoàn tác thì kho trở lại nguyên chuỗi cũ, và thanh tắt đi', async () => {
    window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi","pe"]');
    open();

    await xoaDong(RECENT_SEARCHES_KEY);
    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Hoàn tác' }));

    expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBe('["roi","pe"]');
    expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
    // Con số cỡ kho phải quay lại luôn, không đợi lần mở màn sau.
    expect(screen.getAllByRole('listitem').some((li) => li.textContent?.includes('12 ký tự'))).toBe(
      true,
    );
  });

  /*
   * Hai ca dưới dùng ĐỒNG HỒ GIẢ, và cố ý bấm bằng `fireEvent` chứ không `userEvent`:
   * `userEvent` tự chờ giữa các bước bằng timer, nên chạy chung với đồng hồ giả là nó treo cho
   * tới khi vitest cắt ở 5 giây — đã thử và đúng như vậy. Ở đây chỉ cần một cú bấm trơn, không
   * cần chuỗi trỏ/gõ mà `userEvent` dựng ra.
   */
  it('quá 5 giây thì thanh tự tắt và dữ liệu vẫn ở trạng thái đã xoá', () => {
    vi.useFakeTimers();
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
      open();

      const row = screen
        .getAllByRole('listitem')
        .find((li) => li.textContent?.includes(RECENT_SEARCHES_KEY));
      fireEvent.click(row?.querySelector('button') as HTMLElement);
      expect(screen.getByRole('button', { name: 'Hoàn tác' })).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.queryByRole('button', { name: 'Hoàn tác' })).toBeNull();
      expect(window.localStorage.getItem(RECENT_SEARCHES_KEY)).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  /*
   * `setInterval` là cái đầu tiên trong repo. Bộ đếm sống sót qua unmount sẽ gọi `setState` trên
   * một cây đã tháo — trong vitest nó ra cảnh báo, trên máy người dùng nó là rò rỉ. Ca này bắt
   * đúng chỗ đó: rời màn rồi tua gấp đôi cửa sổ 5 giây mà console vẫn sạch.
   */
  it('rời màn giữa chừng thì bộ đếm dừng hẳn, không kêu ca gì', () => {
    vi.useFakeTimers();
    const noise = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      window.localStorage.setItem(RECENT_SEARCHES_KEY, '["roi"]');
      const { unmount } = render(
        <PreferencesProvider>
          <SettingsScreen />
        </PreferencesProvider>,
      );

      const row = screen
        .getAllByRole('listitem')
        .find((li) => li.textContent?.includes(RECENT_SEARCHES_KEY));
      fireEvent.click(row?.querySelector('button') as HTMLElement);

      unmount();
      act(() => {
        vi.advanceTimersByTime(10_000);
      });

      expect(noise).not.toHaveBeenCalled();
    } finally {
      vi.useRealTimers();
    }
  });
});

describe('về sản phẩm', () => {
  it('nói đúng số công thức đang dùng được, không phải số dự kiến của SRS', () => {
    open();

    const about = screen.getByText('Công thức đang dùng được').nextElementSibling;
    expect(about?.textContent).toBe(String(FORMULAS.length));
  });

  /*
   * KHÔNG lặp câu miễn trừ ở màn này: `AppShell` đã đặt nó ở chân mọi trang. Ca kiểm chốt
   * chiều ngược lại, để lần sau ai đó thêm vào thì thấy ngay là có chủ đích chứ không phải quên.
   */
  it('không lặp lại câu miễn trừ — bản ở chân trang do AppShell lo', () => {
    open();
    expect(screen.queryByText(/chỉ mang tính tham khảo/)).toBeNull();
  });

  it('không lọt NaN / Infinity / undefined ra màn — FR-06', () => {
    window.localStorage.setItem(PRICE_SERIES_KEY, '{"code":"FPT","rows":[]}');
    const { container } = render(
      <PreferencesProvider>
        <SettingsScreen />
      </PreferencesProvider>,
    );

    for (const word of ['NaN', 'Infinity', 'undefined']) {
      expect(container.textContent, word).not.toContain(word);
    }
  });
});
