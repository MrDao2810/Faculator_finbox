/**
 * Tầng APPLICATION — chỗ cất chuỗi giá của màn WF-05 (gói WBS 3.3.1).
 *
 * Cùng khuôn với `recent-searches.ts`: phần thuần nằm ở đây, không import React, nên test được
 * bằng Node; phần chạm `localStorage` do màn gọi trong `useEffect`.
 *
 * NFR-SEC-01 · COM-03: chuỗi giá là dữ liệu người dùng tự nhập, nằm trên máy họ, không gửi
 * đi đâu. Sản phẩm không có backend nên đây không phải lựa chọn — nhưng vẫn phải nói rõ
 * trên màn để người dùng biết dữ liệu của mình đi đâu.
 */

import type { SeriesRow } from '@/core/price-series';

/** Đổi khoá khi cấu trúc đổi, để bản cũ trong máy không làm hỏng bản mới. */
export const PRICE_SERIES_KEY = 'ffb.series.v1';

/**
 * Trần số phiên giữ lại. Beta theo thông lệ cần 60 phiên, một năm giao dịch khoảng 250;
 * 400 đủ rộng cho mọi công thức trong SRS mà vẫn không phình localStorage (giới hạn ~5 MB
 * cho cả tên miền, và bảng này chỉ là một trong nhiều thứ được cất ở đó).
 */
export const MAX_SERIES_ROWS = 400;

/** Chuỗi giá của một mã, kèm mã đang xem để màn biết đang sửa chuỗi của ai. */
export interface StoredSeries {
  /** Mã cổ phiếu viết hoa, ví dụ 'HPG'. Chuỗi rỗng nghĩa là bảng tự nhập, chưa gắn mã nào. */
  code: string;
  rows: ReadonlyArray<SeriesRow>;
}

/** Một ô số đọc từ JSON. Thứ gì không phải số hữu hạn đều thành `null` chứ không thành 0. */
function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

/**
 * Đọc từ chuỗi JSON.
 *
 * TUYỆT ĐỐI không ném lỗi: chuỗi hỏng, không phải object, thiếu trường, hay lẫn kiểu lạ đều
 * bị bỏ chứ không làm mất cả bảng. Dữ liệu này nằm trong máy người dùng và có thể do bản cũ
 * ghi ra, nên phải coi mọi thứ đọc lên là không đáng tin.
 */
export function parseStoredSeries(raw: string | null | undefined): StoredSeries {
  const empty: StoredSeries = { code: '', rows: [] };
  if (raw === null || raw === undefined || raw.trim() === '') return empty;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return empty;
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return empty;

  const source = parsed as Record<string, unknown>;
  const code = typeof source.code === 'string' ? source.code.trim().toUpperCase().slice(0, 12) : '';

  if (!Array.isArray(source.rows)) return { code, rows: [] };

  const rows: SeriesRow[] = [];
  for (const item of source.rows) {
    if (typeof item !== 'object' || item === null) continue;
    const record = item as Record<string, unknown>;

    rows.push({
      date: typeof record.date === 'string' ? record.date.trim().slice(0, 20) : '',
      open: numberOrNull(record.open),
      high: numberOrNull(record.high),
      low: numberOrNull(record.low),
      close: numberOrNull(record.close),
      volume: numberOrNull(record.volume),
    });

    if (rows.length >= MAX_SERIES_ROWS) break;
  }

  return { code, rows };
}

/** Chuỗi JSON để ghi vào localStorage. */
export function serializeStoredSeries(series: StoredSeries): string {
  return JSON.stringify({
    code: series.code.trim().toUpperCase().slice(0, 12),
    rows: series.rows.slice(0, MAX_SERIES_ROWS),
  });
}

/**
 * Sửa một ô trong bảng, trả về mảng mới.
 *
 * Chỉ số ngoài phạm vi thì trả nguyên mảng cũ chứ không tạo lỗ trống — bảng luôn liền mạch.
 */
export function updateRow(
  rows: ReadonlyArray<SeriesRow>,
  index: number,
  patch: Partial<SeriesRow>,
): SeriesRow[] {
  if (index < 0 || index >= rows.length) return [...rows];
  return rows.map((row, position) => (position === index ? { ...row, ...patch } : row));
}

/** Bỏ một dòng khỏi bảng. */
export function removeRow(rows: ReadonlyArray<SeriesRow>, index: number): SeriesRow[] {
  return rows.filter((_, position) => position !== index);
}

/** Thêm một dòng vào cuối, chặn ở trần `MAX_SERIES_ROWS`. */
export function appendRow(rows: ReadonlyArray<SeriesRow>, row: SeriesRow): SeriesRow[] {
  if (rows.length >= MAX_SERIES_ROWS) return [...rows];
  return [...rows, row];
}
