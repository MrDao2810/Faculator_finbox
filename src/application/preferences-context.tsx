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

import { pick, t, type Locale, type MessageKey } from './i18n';
import type { Bilingual } from '@/core/types';
import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  writePreferences,
  type Preferences,
  type Theme,
} from './preferences';
import type { UnitScaleId } from '@/core/format';
import type { Level } from '@/core/types';

interface PreferencesContextValue extends Preferences {
  setMode: (mode: Level) => void;
  setLocale: (locale: Locale) => void;
  setTheme: (theme: Theme) => void;
  setFeeScheduleId: (id: string) => void;
  setUnitScale: (id: UnitScaleId) => void;
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

  // HTML tĩnh khai `lang="vi"` (layout.tsx). Người dùng đã chọn EN thì thuộc tính phải đổi
  // theo, không thì trình đọc màn hình đọc chữ Anh bằng giọng Việt. Chạy sau hydrate nên
  // không lệch với HTML tĩnh.
  useEffect(() => {
    document.documentElement.lang = prefs.locale;
  }, [prefs.locale]);

  /*
   * Bảng màu, cùng cách với `lang` ngay trên: ghi vào `<html>` sau khi hydrate xong.
   *
   * HTML tĩnh không mang `data-theme` (mặc định là bảng sáng), nên lượt render đầu vẫn khớp.
   * Người đã chọn Tối được script chặn nháy trong `layout.tsx` đặt thuộc tính này TRƯỚC lượt vẽ
   * đầu; effect ở đây ghi lại đúng giá trị ấy, nên hai chỗ không đánh nhau.
   *
   * `<meta name="theme-color">` phải vá theo, nếu không thanh trạng thái trên di động vẫn giữ
   * màu giấy sáng viền quanh một trang tối. Đọc thẳng token đã áp thay vì chép mã màu vào đây —
   * đổi bảng màu trong globals.css là thẻ meta đi theo, không có mã màu thứ hai để lệch.
   */
  useEffect(() => {
    document.documentElement.dataset.theme = prefs.theme;

    const paper = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-paper')
      .trim();
    if (paper !== '') {
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', paper);
    }
  }, [prefs.theme]);

  /*
   * Chế độ hiển thị, cùng khuôn `data-theme` ngay trên và vì cùng một lý do.
   *
   * Khối "Duyệt theo nhóm" ở trang chủ do SERVER dựng nên nó không đọc được chế độ; nó bày sẵn
   * cả hai con số và để CSS chọn theo thuộc tính này (xem docblock `CategoryGrid`). Thiếu effect
   * này thì đổi chế độ ở màn Cài đặt xong quay về trang chủ, con số vẫn đứng im cho tới lần tải
   * cứng tiếp theo — script khởi động chỉ chạy đúng một lần.
   *
   * `remove` chứ không ghi `'basic'`: CSS ở cả hai chỗ viết theo hướng "không có thuộc tính là
   * mặc định", để HTML tĩnh và máy chặn localStorage rơi đúng vào nhánh ấy. Ghi giá trị mặc định
   * ra DOM thì có hai cách diễn đạt cho cùng một trạng thái, và chỉ cần một chỗ quên `:not()` là
   * sai lặng lẽ.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.mode === 'advanced') root.dataset.mode = 'advanced';
    else delete root.dataset.mode;
  }, [prefs.mode]);

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
      setTheme: (theme) => persist({ ...prefs, theme }),
      setFeeScheduleId: (feeScheduleId) => persist({ ...prefs, feeScheduleId }),
      setUnitScale: (unitScale) => persist({ ...prefs, unitScale }),
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
    setTheme: () => undefined,
    setFeeScheduleId: () => undefined,
    setUnitScale: () => undefined,
  };
}

/**
 * Bản `t()` đã buộc vào locale đang chọn — luồng locale của gói 3.6.3.
 *
 * Mọi client component hiện chữ dùng hook này rồi đặt tên biến là `t`, để call site giữ
 * nguyên dạng `t('key')` quen thuộc. Ngoài Provider (test render component trần) thì
 * `usePreferences()` trả mặc định nên chữ ra tiếng Việt — đúng hành vi HTML tĩnh.
 *
 * Server component KHÔNG gọi được hook — chữ cần đổi theo locale ở đó đi qua lá client
 * `<T k="…">` (src/ui/i18n/T.tsx); chữ cố ý đứng yên (câu miễn trừ FR-24, metadata build-time,
 * fallback SEO `StaticFormulaList`) thì giữ `t()` thẳng từ `@/application`.
 */
export function useT(): (key: MessageKey) => string {
  const { locale } = usePreferences();
  return useCallback((key: MessageKey) => t(key, locale), [locale]);
}

/**
 * Bản `pick()` đã buộc vào locale đang chọn — đọc nội dung công thức (`Bilingual`) khai ở Domain.
 * Cùng một nguyên tắc với `useT()`: gọi ngoài Provider vẫn ra tiếng Việt, không ném lỗi.
 */
export function usePick(): (value: Bilingual) => string {
  const { locale } = usePreferences();
  return useCallback((value: Bilingual) => pick(value, locale), [locale]);
}
