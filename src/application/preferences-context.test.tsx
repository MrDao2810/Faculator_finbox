// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PREFERENCES_STORAGE_KEY } from './preferences';
import { PreferencesProvider, usePreferences } from './preferences-context';

/**
 * Cửa `hydrated` của hai effect ghi `<html>` — bản vá cho lỗi nháy bảng màu.
 *
 * ## Lỗi
 *
 * Người đã chọn Tối tải lại trang thì thấy tối → nháy sáng → tối. Đo trên Chrome thật (quan sát
 * viên cài qua CDP trước mọi script của trang):
 *
 *   t=469ms  load              data-theme=dark    color-scheme=dark
 *   t=527ms  data-theme đổi    data-theme=light   color-scheme=light   ← cái nháy
 *   t=580ms  data-theme đổi    data-theme=dark    color-scheme=dark
 *
 * `prefs` khởi tạo bằng `DEFAULT_PREFERENCES` (`theme: 'light'`) — bắt buộc, để lượt render đầu
 * khớp HTML tĩnh. Effect ghi `data-theme` chạy ngay lượt mount với giá trị mặc định ấy và đè lên
 * chữ `'dark'` mà script chặn nháy trong `layout.tsx` vừa đặt; đọc xong `localStorage` thì state
 * đổi và effect chạy lại, trả về `'dark'`.
 *
 * ## Điều các ca dưới KHÔNG gác — đọc trước khi thêm ca mới
 *
 * Chính cái nháy đó **không kiểm được trong jsdom**, và đã thử: một ca dùng `MutationObserver`
 * ghi lại mọi giá trị `data-theme` từng mang vẫn XANH cả khi gỡ bỏ cửa `hydrated`. Lý do là
 * `render()` của testing-library gói cả lượt mount trong một `act()`, nên `setPrefs` trong effect
 * đọc kho được nhập vào cùng lượt commit và effect ghi DOM chỉ chạy đúng một lần, với giá trị đã
 * đúng. Trình duyệt thật thì hai lượt commit tách rời — đó là chỗ cái nháy sống.
 *
 * Nên đừng dựng lại ca kiểu ấy: nó xanh dù bản vá còn hay mất, tức là một cửa gác giả. Cửa gác
 * thật cho hiện tượng nháy nằm ở `scripts/chrome-check.mjs`, chạy trên Chrome thật.
 *
 * Ba ca dưới gác thứ khác, và là rủi ro thật của chính bản vá: cửa `hydrated` không được biến hai
 * effect thành hàng rào chết. Nếu nó chặn nhầm thì `<html>` mất `data-theme`, và CSS — thứ đọc
 * đúng thuộc tính ấy — mù luôn.
 */

function Man() {
  const { theme, mode, setTheme, setMode } = usePreferences();
  return (
    <>
      <p>{`${theme} · ${mode}`}</p>
      <button
        type="button"
        onClick={() => {
          setTheme('dark');
        }}
      >
        sang tối
      </button>
      <button
        type="button"
        onClick={() => {
          setMode('advanced');
        }}
      >
        sang nâng cao
      </button>
    </>
  );
}

function moMan() {
  return render(
    <PreferencesProvider>
      <Man />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-mode');
});

afterEach(cleanup);

describe('PreferencesProvider — cửa `hydrated` không được chặn nhầm', () => {
  it('lựa chọn mặc định vẫn được ghi ra <html> sau khi đọc xong kho', async () => {
    moMan();
    await screen.findByText('light · basic');

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('light');
    });
    // `data-mode` cố ý VẮNG ở chế độ Cơ bản — CSS viết theo hướng "không có thuộc tính là mặc định".
    expect(document.documentElement.dataset.mode).toBeUndefined();
  });

  it('lựa chọn đã lưu trong kho được ghi ra <html>', async () => {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ theme: 'dark', mode: 'advanced' }),
    );

    moMan();
    await screen.findByText('dark · advanced');

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
    expect(document.documentElement.dataset.mode).toBe('advanced');
  });

  it('đổi lựa chọn lúc chạy vẫn ghi thẳng ra <html> — đó là thứ CSS đọc', async () => {
    moMan();
    await screen.findByText('light · basic');

    await userEvent.click(screen.getByRole('button', { name: 'sang tối' }));
    await userEvent.click(screen.getByRole('button', { name: 'sang nâng cao' }));

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('dark');
    });
    expect(document.documentElement.dataset.mode).toBe('advanced');
  });

  /*
   * Máy chặn `localStorage` (chế độ riêng tư của Safari) vẫn phải bật được cờ `hydrated`, nếu
   * không hai effect kẹt vĩnh viễn ở nhánh `return` và `<html>` không bao giờ mang `data-theme`.
   */
  it('máy chặn localStorage vẫn về đúng mặc định, không kẹt ở trạng thái chưa đọc', async () => {
    const goc = window.localStorage.getItem.bind(window.localStorage);
    window.localStorage.getItem = () => {
      throw new Error('SecurityError');
    };

    try {
      moMan();
      await screen.findByText('light · basic');
      await waitFor(() => {
        expect(document.documentElement.dataset.theme).toBe('light');
      });
    } finally {
      window.localStorage.getItem = goc;
    }
  });
});
