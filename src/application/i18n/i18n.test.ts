import { describe, expect, it } from 'vitest';

import { LOCALES, isLocale, missingKeys, t, vi } from './index';

describe('khung i18n', () => {
  it('có đúng hai ngôn ngữ', () => {
    expect(LOCALES).toEqual(['vi', 'en']);
  });

  it('mọi key tiếng Việt đều có nội dung — không được để trống', () => {
    expect(missingKeys('vi')).toEqual([]);
  });

  it('lấy đúng câu tiếng Việt', () => {
    expect(t('nav.home')).toBe('Trang chủ');
    expect(t('mode.advanced')).toBe('Nâng cao');
  });

  it('chưa dịch thì rơi về tiếng Việt, không hiện key trần', () => {
    const text = t('nav.home', 'en');
    expect(text).toBe('Trang chủ');
    expect(text).not.toContain('nav.');
  });

  it('liệt kê được phần còn nợ dịch — khối lượng của gói 3.6.3', () => {
    // Bản EN hiện rỗng nên còn nợ đúng bằng tổng số key.
    expect(missingKeys('en')).toHaveLength(Object.keys(vi).length);
  });

  it('isLocale chặn giá trị lạ đọc từ localStorage', () => {
    expect(isLocale('vi')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(7)).toBe(false);
  });

  it('câu miễn trừ FR-24 có mặt và đúng nội dung bắt buộc', () => {
    expect(t('disclaimer.text')).toContain('tham khảo');
    expect(t('disclaimer.text')).toContain('không phải khuyến nghị đầu tư');
  });
});
