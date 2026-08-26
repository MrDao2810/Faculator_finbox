import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  PREFERENCES_STORAGE_KEY,
  readPreferences,
  writePreferences,
} from './preferences';

describe('mặc định', () => {
  it('mở lần đầu là chế độ Cơ bản, tiếng Việt, giao diện sáng, biểu phí mặc định', () => {
    expect(DEFAULT_PREFERENCES.mode).toBe('basic');
    expect(DEFAULT_PREFERENCES.locale).toBe('vi');
    // Phải là 'light': HTML tĩnh dựng lúc build không mang `data-theme`, tức là bảng sáng.
    expect(DEFAULT_PREFERENCES.theme).toBe('light');
    expect(DEFAULT_PREFERENCES.feeScheduleId).toBe('hose-2026');
    // 'triệu ₫' là bậc WF-14 vẽ sẵn trên bảng lịch trả nợ — mặc định giữ nguyên hình cũ.
    expect(DEFAULT_PREFERENCES.unitScale).toBe('million');
  });

  it('khoá lưu có đánh số phiên bản', () => {
    expect(PREFERENCES_STORAGE_KEY).toMatch(/\.v\d+$/);
  });
});

describe('readPreferences()', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const prefs = {
      mode: 'advanced',
      locale: 'en',
      theme: 'dark',
      feeScheduleId: 'hose-2026',
      unitScale: 'billion',
    } as const;
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

  it('bậc đơn vị lạ thì rơi về mặc định, không lọt xuống bảng', () => {
    expect(readPreferences('{"unitScale":"trieu-do"}').unitScale).toBe(
      DEFAULT_PREFERENCES.unitScale,
    );
    expect(readPreferences('{"unitScale":42}').unitScale).toBe(DEFAULT_PREFERENCES.unitScale);
    expect(readPreferences('{"unitScale":"dong"}').unitScale).toBe('dong');
  });

  it('bảng màu lạ thì rơi về sáng', () => {
    expect(readPreferences('{"theme":"tim-than"}').theme).toBe('light');
    expect(readPreferences('{"theme":true}').theme).toBe('light');
    expect(readPreferences('{"theme":"dark"}').theme).toBe('dark');
  });

  /*
   * Bản ghi có sẵn trong máy người dùng từ trước khi có giao diện tối — không có trường `theme`.
   * Nó phải đọc ra bảng sáng chứ không được làm hỏng cả bộ; đó là lý do khoá vẫn là `v1`.
   */
  it('bản cũ chưa có trường theme vẫn đọc được nguyên vẹn', () => {
    const prefs = readPreferences('{"mode":"advanced","locale":"en","unitScale":"dong"}');
    expect(prefs.theme).toBe('light');
    expect(prefs.mode).toBe('advanced');
    expect(prefs.locale).toBe('en');
    expect(prefs.unitScale).toBe('dong');
  });

  it('bỏ qua trường lạ, không mang theo rác', () => {
    const prefs = readPreferences('{"mode":"advanced","email":"a@b.c"}');
    expect(Object.keys(prefs).sort()).toEqual([
      'feeScheduleId',
      'locale',
      'mode',
      'theme',
      'unitScale',
    ]);
  });
});

describe('writePreferences()', () => {
  it('chỉ ghi những trường đã biết — không để dữ liệu cá nhân lọt vào (LDR-04)', () => {
    const json = writePreferences(DEFAULT_PREFERENCES);
    expect(Object.keys(JSON.parse(json) as object).sort()).toEqual([
      'feeScheduleId',
      'locale',
      'mode',
      'theme',
      'unitScale',
    ]);
  });
});
