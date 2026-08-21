/**
 * Tầng APPLICATION — khung đa ngôn ngữ (gói WBS 1.4.1).
 *
 * Không dùng thư viện ngoài: sản phẩm chỉ có hai ngôn ngữ và từ điển phẳng, thêm thư viện
 * i18n đầy đủ chỉ tốn thêm dung lượng gói (NFR-PER-04).
 *
 * Nguyên tắc: thiếu bản dịch thì rơi về tiếng Việt chứ KHÔNG hiện key trần ra màn hình.
 */

import type { Bilingual } from '@/core/types';

import { en } from './en';
import { vi } from './vi';

export const LOCALES = ['vi', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/** Mọi key hợp lệ, sinh từ chính từ điển tiếng Việt. */
export type MessageKey = keyof typeof vi;

const DICTIONARIES: Readonly<Record<Locale, Partial<Record<MessageKey, string>>>> = { vi, en };

/** Lấy câu chữ theo ngôn ngữ. Chưa dịch thì trả bản tiếng Việt. */
export function t(key: MessageKey, locale: Locale = 'vi'): string {
  return DICTIONARIES[locale][key] ?? vi[key];
}

/** Kiểm chuỗi đọc từ localStorage hay URL có phải ngôn ngữ hợp lệ không. */
export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as ReadonlyArray<string>).includes(value);
}

/** Danh sách key chưa có bản dịch — dùng cho test và cho việc đo khối lượng gói 3.6.3. */
export function missingKeys(locale: Locale): MessageKey[] {
  const dictionary = DICTIONARIES[locale];
  return (Object.keys(vi) as MessageKey[]).filter((key) => {
    const text = dictionary[key];
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

export { vi, en };
