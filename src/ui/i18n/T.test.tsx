// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PreferencesProvider } from '@/application/preferences-context';

import { T } from './T';

/**
 * Lá `<T>` là cách duy nhất chữ trong SERVER component (trang chủ, khung AppShell) đổi theo
 * locale mà không kéo cả khối vào gói máy khách. Hai điều phải giữ: render đầu luôn là tiếng
 * Việt (khớp HTML tĩnh — lệch là cảnh báo hydration), và sau hydrate thì đổi theo lựa chọn
 * đã lưu.
 */

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe('lá <T> cho server component', () => {
  it('ngoài Provider (và trong HTML tĩnh) là tiếng Việt', () => {
    render(<T k="nav.home" />);
    expect(screen.getByText('Trang chủ')).toBeDefined();
  });

  it('người dùng đã chọn EN thì chữ đổi sau hydrate', async () => {
    window.localStorage.setItem('ffb.prefs.v1', JSON.stringify({ locale: 'en' }));

    render(
      <PreferencesProvider>
        <p>
          <T k="nav.home" />
        </p>
      </PreferencesProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Home')).toBeDefined();
    });
  });
});
