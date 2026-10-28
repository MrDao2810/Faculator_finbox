/**
 * Tầng APPLICATION — khung đa ngôn ngữ (gói WBS 1.4.1).
 *
 * Không dùng thư viện ngoài: sản phẩm chỉ có hai ngôn ngữ và từ điển phẳng, thêm thư viện
 * i18n đầy đủ chỉ tốn thêm dung lượng gói (NFR-PER-04).
 *
 * Nguyên tắc: thiếu bản dịch thì rơi về tiếng Việt chứ KHÔNG hiện key trần ra màn hình.
 */

import type { Bilingual } from '@/core/types';

import { vi } from './vi';

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Mọi key hợp lệ, sinh từ chính từ điển tiếng Việt. */
export type MessageKey = keyof typeof vi;

/**
 * Từ điển đã có trong bộ nhớ. Tiếng Anh NẠP ĐỘNG (28/10/2026): trước đó `vi` và `en` cùng nằm
 * trong chunk chung của mọi trang, nên người dùng tiếng Việt — đa số — tải thêm 8,5 kB gzip bản
 * tiếng Anh ở mọi lượt mở trang. Giờ `en` chỉ về khi có người cần nó (`loadLocale`): lúc tải
 * trang với lựa chọn đã lưu là `en`, hoặc lúc bấm nút đổi ngôn ngữ.
 *
 * Chưa về thì `t()` rơi về tiếng Việt, đúng nguyên tắc ở đầu file. Màn hình không lộ cảnh đó:
 * `PreferencesProvider` chỉ gỡ `data-locale-pending` (thứ che trang) khi từ điển đã có, và nút đổi
 * ngôn ngữ chờ từ điển về rồi mới đổi.
 */
const DICTIONARIES: Record<Locale, Partial<Record<MessageKey, string>> | undefined> = {
  vi,
  en: undefined,
};

/** Từ điển của ngôn ngữ này đã nằm trong bộ nhớ chưa. Tiếng Việt luôn có. */
export function isLocaleLoaded(locale: Locale): boolean {
  return DICTIONARIES[locale] !== undefined;
}

let enDangNap: Promise<void> | null = null;

/**
 * Nạp từ điển của một ngôn ngữ. Gọi nhiều lần vẫn chỉ tải một lần; tải hỏng (ngoại tuyến, chunk
 * chưa từng được service worker cất) thì lần sau thử lại, và màn ở lại tiếng Việt.
 *
 * `import()` TRẦN, không qua `next/dynamic`: đây là dữ liệu, không phải component, và chunk của nó
 * không được nằm trong HTML của trang nào.
 */
export function loadLocale(locale: Locale): Promise<void> {
  if (locale === 'vi' || DICTIONARIES.en !== undefined) return Promise.resolve();
  enDangNap ??= import('./en').then(
    (mod) => {
      DICTIONARIES.en = mod.en;
    },
    (error: unknown) => {
      enDangNap = null;
      throw error;
    },
  );
  return enDangNap;
}

/** Lấy câu chữ theo ngôn ngữ. Chưa dịch (hoặc từ điển chưa về) thì trả bản tiếng Việt. */
export function t(key: MessageKey, locale: Locale = 'vi'): string {
  return DICTIONARIES[locale]?.[key] ?? vi[key];
}

/** Kiểm chuỗi đọc từ localStorage hay URL có phải ngôn ngữ hợp lệ không. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as ReadonlyArray<string>).includes(value);
}

/**
 * Danh sách key chưa có bản dịch — dùng cho test và cho việc đo khối lượng gói 3.6.3. Từ điển chưa
 * nạp thì mọi key đều thiếu (`vitest.setup.ts` nạp sẵn `en` cho cả bộ test).
 */
export function missingKeys(locale: Locale): MessageKey[] {
  const dictionary = DICTIONARIES[locale];
  return (Object.keys(vi) as MessageKey[]).filter((key) => {
    const text = dictionary?.[key];
    return text === undefined || text.trim() === '';
  });
}

/**
 * Đọc một field nội dung công thức (`Bilingual`, khai ở Domain) theo locale đang chọn.
 * Đây là hàm DUY NHẤT tầng UI dùng để đọc `name`/`description`/`explanation.*`/`label`… —
 * không đọc thẳng `.vi`/`.en`, để đổi quy tắc chọn ngôn ngữ (ví dụ rơi về vi khi en rỗng)
 * chỉ phải sửa một chỗ.
 */
export function pick(value: Bilingual, locale: Locale): string {
  if (locale === 'en') return value.en.trim() === '' ? value.vi : value.en;
  return value.vi;
}

/*
 * `en` KHÔNG xuất tiếp ở đây: một dòng `export { en }` là mở đường cho mã máy khách nhập tĩnh nó và
 * kéo từ điển về chunk chung. Test cần thì nhập thẳng `./en`.
 */
export { vi };
