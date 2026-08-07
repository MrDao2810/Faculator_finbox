import { readFileSync, readdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

/**
 * Khoá mồ côi tự tích lại sau mỗi lần dựng lại màn: viết key trước, đổi ý, quên xoá. Đợt 13
 * dọn 13 khoá như vậy — trong đó 6 khoá `page.placeholder.*` còn nói SAI ("màn WF-01 sẽ dựng"
 * trong khi đã dựng xong từ đợt 8). Ca kiểm này giữ cho chuyện đó không lặp lại, và quan
 * trọng hơn: gói 3.6.3 sẽ dịch từng khoá sang tiếng Anh, dịch cả khoá chết là tốn công thật.
 */
describe('từ điển không được có khoá mồ côi', () => {
  const SRC = fileURLToPath(new URL('../..', import.meta.url));

  function walk(dir: string): string[] {
    const out: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) out.push(...walk(path));
      else if (extname(path) === '.ts' || extname(path) === '.tsx') out.push(path);
    }
    return out;
  }

  it('mọi key khai báo đều có nơi dùng', () => {
    // Tìm CHÍNH chuỗi key ở bất cứ đâu ngoài thư mục i18n, không chỉ tìm `t('key')`: nhiều
    // key đi vòng qua `labelKey`/`nameKey`/`hintKey` trong một mảng cấu hình rồi mới tới
    // `t(item.labelKey)` — chỉ soi lời gọi trực tiếp là báo nhầm hàng chục khoá.
    const files = walk(SRC).filter((path) => !path.includes(join('application', 'i18n')));
    // Đường dẫn hỏng thì `files` rỗng và ca kiểm đỗ vì KHÔNG có gì để soi — chặn kiểu đỗ giả đó.
    expect(files.length, `không quét được src/ từ ${SRC}`).toBeGreaterThan(50);

    const blob = files.map((path) => readFileSync(path, 'utf8')).join('\n');

    const orphans = Object.keys(vi).filter((key) => !blob.includes(`'${key}'`));

    expect(orphans, `khoá không nơi nào dùng: ${orphans.join(', ')}`).toEqual([]);
  });
});
