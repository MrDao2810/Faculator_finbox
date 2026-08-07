/**
 * Tầng APPLICATION — tuỳ chọn người dùng, phần logic thuần (gói WBS 1.4.1).
 *
 * SW-02 · LDR-04: lưu ở localStorage, chỉ nằm trên thiết bị, không có dữ liệu định danh cá nhân.
 * NFR-SEC-01 · COM-03: không có gì trong đây được gửi ra khỏi máy.
 *
 * File này KHÔNG import React để test được bằng Node. Phần React nằm ở preferences-context.tsx.
 */

import { UNIT_SCALES, type UnitScaleId } from '@/core/format';
import { MARKET_CONFIG } from '@/core/market';
import type { Level } from '@/core/types';

import { isLocale, type Locale } from './i18n';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy người dùng không làm hỏng bản mới. */
export const PREFERENCES_STORAGE_KEY = 'ffb.prefs.v1';

export interface Preferences {
  /** Chế độ hiển thị Cơ bản / Nâng cao — FR-09. */
  mode: Level;
  locale: Locale;
  /** Biểu phí đang chọn ở WF-08 và WF-13. */
  feeScheduleId: string;
  /**
   * Bậc đơn vị tiền mặc định của các BẢNG số liệu (CON-05).
   *
   * Chỉ đổi cách BÀY con số, không đổi con số: công thức luôn tính bằng đồng, việc quy đổi do
   * `scaleToUnit()` lo. Ô nhập không đụng tới cài đặt này — `parseViNumber()` đọc theo quy ước
   * Việt Nam và đó là hợp đồng riêng của ô nhập, đổi theo cài đặt là mở lại đúng lớp lỗi
   * "nhập 1,1 ra 11" của đợt 9.
   */
  unitScale: UnitScaleId;
}

export const DEFAULT_PREFERENCES: Preferences = {
  mode: 'basic', // người dùng F0 là nhóm mặc định (SRS 1.3.3)
  locale: 'vi',
  feeScheduleId: MARKET_CONFIG.defaultScheduleId,
  // 'triệu ₫' là mặc định của WF-14 ("ĐVT: triệu đồng"), giữ nguyên hình cũ cho người đang dùng.
  unitScale: 'million',
};

function isMode(value: unknown): value is Level {
  return value === 'basic' || value === 'advanced';
}

function isUnitScale(value: unknown): value is UnitScaleId {
  return typeof value === 'string' && UNIT_SCALES.some((scale) => scale.id === value);
}

function isKnownSchedule(value: unknown): value is string {
  return typeof value === 'string' && MARKET_CONFIG.schedules.some((s) => s.id === value);
}

/**
 * Đọc tuỳ chọn từ chuỗi JSON trong localStorage.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng, thiếu trường, sai kiểu, hay biểu phí đã bị gỡ khỏi
 * cấu hình đều rơi về mặc định của riêng trường đó. Một ô rác không được làm mất cả bộ.
 */
export function readPreferences(raw: string | null | undefined): Preferences {
  if (raw === null || raw === undefined || raw.trim() === '') return { ...DEFAULT_PREFERENCES };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { ...DEFAULT_PREFERENCES };
  }

  const record = parsed as Record<string, unknown>;

  return {
    mode: isMode(record.mode) ? record.mode : DEFAULT_PREFERENCES.mode,
    locale: isLocale(record.locale) ? record.locale : DEFAULT_PREFERENCES.locale,
    feeScheduleId: isKnownSchedule(record.feeScheduleId)
      ? record.feeScheduleId
      : DEFAULT_PREFERENCES.feeScheduleId,
    unitScale: isUnitScale(record.unitScale) ? record.unitScale : DEFAULT_PREFERENCES.unitScale,
  };
}

/** Chuỗi JSON để ghi vào localStorage. Chỉ ghi những trường đã biết, không ghi thừa. */
export function writePreferences(prefs: Preferences): string {
  return JSON.stringify({
    mode: prefs.mode,
    locale: prefs.locale,
    feeScheduleId: prefs.feeScheduleId,
    unitScale: prefs.unitScale,
  });
}
