// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

/**
 * Nạp từ điển tiếng Anh hỏng một lần (mở PWA lúc mất mạng rồi bấm VI) thì bấm nút lần nữa phải THỬ NẠP
 * LẠI (29/10/2026). Trước đó effect nạp chỉ phụ thuộc `prefs.locale`; lựa chọn đã lưu vẫn là 'en' nên
 * nút chết tới khi tải lại trang, dù `loadLocale` hứa "lần sau thử lại".
 */
const dieuKhien = vi.hoisted(() => ({ daNap: false, soLanGoi: 0, hong: true }));

vi.mock('@/application/i18n', async (importOriginal) => {
  const goc = await importOriginal<typeof import('@/application/i18n')>();
  return {
    ...goc,
    isLocaleLoaded: (locale: string) => locale === 'vi' || dieuKhien.daNap,
    loadLocale: (locale: string) => {
      if (locale === 'vi') return Promise.resolve();
      dieuKhien.soLanGoi += 1;
      if (dieuKhien.hong) return Promise.reject(new Error('offline'));
      dieuKhien.daNap = true;
      return Promise.resolve();
    },
  };
});

import { PREFERENCES_STORAGE_KEY } from '@/application/preferences';
import { PreferencesProvider, usePreferences } from '@/application/preferences-context';

/** Nút đổi ngôn ngữ tối thiểu, đúng phép của LangSwitch: ghi ngôn ngữ ĐANG HIỆN, bấm thì gửi ngôn ngữ kia. */
function NutDoiNgonNgu() {
  const { locale, setLocale } = usePreferences();
  return (
    <button type="button" onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}>
      {locale === 'vi' ? 'VI' : 'EN'}
    </button>
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

const doi = (): Promise<void> =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

describe('nút VI/EN sau một lần nạp từ điển hỏng', () => {
  it('mạng về rồi bấm nút thì nạp lại và màn chuyển sang tiếng Anh', async () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ locale: 'en' }));
    render(
      <PreferencesProvider>
        <NutDoiNgonNgu />
      </PreferencesProvider>,
    );
    await doi();
    expect(dieuKhien.soLanGoi).toBe(1);
    expect(screen.getByRole('button').textContent).toBe('VI');

    dieuKhien.hong = false;
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });
    await doi();

    expect(dieuKhien.soLanGoi).toBe(2);
    expect(screen.getByRole('button').textContent).toBe('EN');
  });
});
