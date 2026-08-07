// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  FORMULAS,
  MARKET_CONFIG,
  PORTFOLIO_KEY,
  PREFERENCES_STORAGE_KEY,
  PRICE_SERIES_KEY,
  RECENT_SEARCHES_KEY,
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
      expect(option?.textContent).toBe(schedule.name);
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
  it('liệt kê đủ bốn khoá app đang dùng', () => {
    open();

    for (const key of [
      PREFERENCES_STORAGE_KEY,
      RECENT_SEARCHES_KEY,
      PRICE_SERIES_KEY,
      PORTFOLIO_KEY,
    ]) {
      expect(screen.getByText(key), key).not.toBeNull();
    }
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
