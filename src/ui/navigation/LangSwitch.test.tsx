// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PreferencesProvider } from '@/application/preferences-context';

import { LangSwitch } from './LangSwitch';

/**
 * Nút chuyển ngôn ngữ — gắn lại vào AppHeader ở đợt 8, khi cả hai điều kiện của quyết định
 * đợt 14 đã đạt (có bản dịch + luồng locale thông). Điểm tinh tế đáng gác: sau khi chuyển
 * sang EN, chính cái nút phải NÓI TIẾNG ANH (aria-label đọc từ từ điển EN) — đó là bằng
 * chứng rẻ nhất rằng chữ đổi thật chứ nút không chỉ đổi state.
 */

function dungNut() {
  return render(
    <PreferencesProvider>
      <LangSwitch />
    </PreferencesProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(cleanup);

describe('LangSwitch', () => {
  it('mặc định hiện VI, nhãn nói rõ hành động, và báo trước bản EN còn dịch dở', () => {
    dungNut();
    const nut = screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' });
    expect(nut.textContent).toBe('VI');
    expect(nut.getAttribute('title')).toContain('đang dịch dở');
  });

  it('bấm một lần: sang EN, và chính nút nói tiếng Anh', async () => {
    const user = userEvent.setup();
    dungNut();

    await user.click(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' }));

    const nut = screen.getByRole('button', { name: 'Switch to Vietnamese' });
    expect(nut.textContent).toBe('EN');
    // Câu "bản EN dịch dở" chỉ nhắc khi SẮP chuyển sang EN — đã ở EN rồi thì thôi.
    expect(nut.getAttribute('title')).toBeNull();
  });

  it('bấm hai lần: quay về VI — công tắc hai chiều thật', async () => {
    const user = userEvent.setup();
    dungNut();

    await user.click(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' }));
    await user.click(screen.getByRole('button', { name: 'Switch to Vietnamese' }));

    expect(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' }).textContent).toBe('VI');
  });

  it('lựa chọn được ghi vào localStorage để lần sau còn nhớ', async () => {
    const user = userEvent.setup();
    dungNut();

    await user.click(screen.getByRole('button', { name: 'Chuyển sang tiếng Anh' }));

    const stored = window.localStorage.getItem('ffb.prefs.v1');
    expect(JSON.parse(stored ?? '{}')).toMatchObject({ locale: 'en' });
  });
});
