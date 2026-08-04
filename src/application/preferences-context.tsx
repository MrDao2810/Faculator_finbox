'use client';

/**
 * Tầng APPLICATION — nơi giữ tuỳ chọn người dùng lúc chạy (gói WBS 1.4.1).
 *
 * Tách khỏi barrel `@/application` và có 'use client' riêng, để trang server-side như
 * `sitemap.ts` không phải kéo theo React context.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Locale } from './i18n';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  writePreferences,
  type Preferences,
} from './preferences';
import type { Level } from '@/core/types';

interface PreferencesContextValue extends Preferences {
  setMode: (mode: Level) => void;
  setLocale: (locale: Locale) => void;
  setFeeScheduleId: (id: string) => void;
  /**
   * Đã đọc xong localStorage hay chưa.
   * Lần render đầu luôn là giá trị mặc định để HTML tĩnh và client khớp nhau;
   * component nào cần tránh nháy nội dung thì đợi cờ này.
   */
  hydrated: boolean;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [hydrated, setHydrated] = useState(false);

  // Đọc trong effect chứ không phải lúc khởi tạo state: bản build là HTML tĩnh,
  // đọc localStorage ngay lúc render đầu sẽ lệch hydration.
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư) — chạy bằng mặc định, không báo lỗi.
    }
    setPrefs(readPreferences(stored));
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Preferences) => {
    setPrefs(next);
    try {
      window.localStorage.setItem(PREFERENCES_STORAGE_KEY, writePreferences(next));
    } catch {
      // Ghi hỏng thì phiên này vẫn dùng được, chỉ là không nhớ sang lần sau.
    }
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      ...prefs,
      hydrated,
      setMode: (mode) => persist({ ...prefs, mode }),
      setLocale: (locale) => persist({ ...prefs, locale }),
      setFeeScheduleId: (feeScheduleId) => persist({ ...prefs, feeScheduleId }),
    }),
    [prefs, hydrated, persist],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/**
 * Đọc tuỳ chọn hiện tại.
 * Gọi ngoài Provider thì trả về mặc định thay vì ném lỗi — một component đặt nhầm chỗ
 * không được làm trắng cả trang.
 */
export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);
  if (context !== null) return context;

  return {
    ...DEFAULT_PREFERENCES,
    hydrated: false,
    setMode: () => undefined,
    setLocale: () => undefined,
    setFeeScheduleId: () => undefined,
  };
}
