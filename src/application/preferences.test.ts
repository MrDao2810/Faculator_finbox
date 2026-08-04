import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  writePreferences,
} from './preferences';

describe('mặc định', () => {
  it('mở lần đầu là chế độ Cơ bản, tiếng Việt, biểu phí mặc định', () => {
    expect(DEFAULT_PREFERENCES.mode).toBe('basic');
    expect(DEFAULT_PREFERENCES.locale).toBe('vi');
    expect(DEFAULT_PREFERENCES.feeScheduleId).toBe('hose-2026');
  });

  it('khoá lưu có đánh số phiên bản', () => {
    expect(PREFERENCES_STORAGE_KEY).toMatch(/\.v\d+$/);
  });
});

describe('readPreferences()', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const prefs = { mode: 'advanced', locale: 'en', feeScheduleId: 'hose-2026' } as const;
    expect(readPreferences(writePreferences(prefs))).toEqual(prefs);
  });

  it('chưa có gì trong máy thì dùng mặc định', () => {
    expect(readPreferences(null)).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferences('   ')).toEqual(DEFAULT_PREFERENCES);
  });

  it('JSON hỏng thì không ném lỗi, rơi về mặc định', () => {
    expect(readPreferences('{ hong')).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferences('null')).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferences('[1,2,3]')).toEqual(DEFAULT_PREFERENCES);
    expect(readPreferences('"chuoi"')).toEqual(DEFAULT_PREFERENCES);
  });

  it('một trường rác không làm mất cả bộ', () => {
    const prefs = readPreferences('{"mode":"sieu-cap","locale":"en","feeScheduleId":"hose-2026"}');
    expect(prefs.mode).toBe('basic'); // rác → mặc định
    expect(prefs.locale).toBe('en'); // hợp lệ → giữ
    expect(prefs.feeScheduleId).toBe('hose-2026');
  });

  it('thiếu trường thì bù bằng mặc định', () => {
    expect(readPreferences('{"mode":"advanced"}')).toEqual({
      ...DEFAULT_PREFERENCES,
      mode: 'advanced',
    });
  });

  it('biểu phí đã bị gỡ khỏi cấu hình thì rơi về biểu phí mặc định', () => {
    const prefs = readPreferences('{"feeScheduleId":"bieu-phi-da-xoa"}');
    expect(prefs.feeScheduleId).toBe(DEFAULT_PREFERENCES.feeScheduleId);
  });

  it('bỏ qua trường lạ, không mang theo rác', () => {
    const prefs = readPreferences('{"mode":"advanced","email":"a@b.c"}');
    expect(Object.keys(prefs).sort()).toEqual(['feeScheduleId', 'locale', 'mode']);
  });
});

describe('writePreferences()', () => {
  it('chỉ ghi ba trường đã biết — không để dữ liệu cá nhân lọt vào (LDR-04)', () => {
    const json = writePreferences(DEFAULT_PREFERENCES);
    expect(Object.keys(JSON.parse(json) as object).sort()).toEqual([
      'feeScheduleId',
      'locale',
      'mode',
    ]);
  });
});
