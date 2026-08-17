// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PreferencesProvider, usePreferences, useT } from './preferences-context';
import { PREFERENCES_STORAGE_KEY } from './preferences';

/**
 * Luồng locale của gói 3.6.3 (đợt 8): `useT()` là đường duy nhất chữ client đổi theo
 * ngôn ngữ, nên hợp đồng của nó phải có ca kiểm riêng — nhất là hai vế dễ vỡ ngầm:
 * ngoài Provider phải rơi về tiếng Việt (test render component trần vẫn chạy), và
 * localStorage có sẵn EN thì chữ chỉ được đổi SAU hydrate (trước đó phải khớp HTML tĩnh).
 */

/** Đầu dò: một dòng chữ theo locale và một nút chuyển hẳn sang EN. */
function DauDo() {
  const t = useT();
  const { setLocale } = usePreferences();

  return (
    <div>
      <p>{t('nav.home')}</p>
      <button
        type="button"
        onClick={() => {
          setLocale('en');
        }}
      >
        doi-ngon-ngu
      </button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.lang = 'vi';
});

afterEach(cleanup);

describe('useT() — luồng locale', () => {
  it('ngoài Provider thì rơi về tiếng Việt, không ném lỗi', () => {
    render(<DauDo />);
    expect(screen.getByText('Trang chủ')).toBeDefined();
  });

  it('mặc định trong Provider là tiếng Việt', () => {
    render(
      <PreferencesProvider>
        <DauDo />
      </PreferencesProvider>,
    );
    expect(screen.getByText('Trang chủ')).toBeDefined();
  });

  it('setLocale(en) đổi chữ ngay, ghi localStorage, và đổi thuộc tính lang của <html>', async () => {
    const user = userEvent.setup();
    render(
      <PreferencesProvider>
        <DauDo />
      </PreferencesProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'doi-ngon-ngu' }));

    expect(screen.getByText('Home')).toBeDefined();
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ locale: 'en' });
    expect(document.documentElement.lang).toBe('en');
  });

  it('localStorage có sẵn EN thì chữ đổi sau hydrate — render đầu vẫn tiếng Việt', async () => {
    window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ locale: 'en' }));

    render(
      <PreferencesProvider>
        <DauDo />
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeDefined();
    });
    expect(document.documentElement.lang).toBe('en');
  });
});
