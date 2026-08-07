import { describe, expect, it } from 'vitest';

import { emptyRow } from '@/core/price-series';
import type { SeriesRow } from '@/core/price-series';

import {
  MAX_SERIES_ROWS,
  appendRow,
  parseStoredSeries,
  removeRow,
  serializeStoredSeries,
  updateRow,
} from './price-series-store';

function row(patch: Partial<SeriesRow> = {}): SeriesRow {
  return { date: '15/07', open: 25.1, high: 25.7, low: 25.05, close: 25.4, volume: 1000, ...patch };
}

describe('parseStoredSeries — đọc từ máy người dùng, không tin gì cả', () => {
  it('đọc lại đúng thứ đã ghi', () => {
    const series = { code: 'HPG', rows: [row()] };
    expect(parseStoredSeries(serializeStoredSeries(series))).toEqual(series);
  });

  it('không có gì trong máy thì trả bảng rỗng', () => {
    expect(parseStoredSeries(null)).toEqual({ code: '', rows: [] });
    expect(parseStoredSeries(undefined)).toEqual({ code: '', rows: [] });
    expect(parseStoredSeries('   ')).toEqual({ code: '', rows: [] });
  });

  it('JSON hỏng thì trả bảng rỗng chứ không ném lỗi', () => {
    expect(() => parseStoredSeries('{ hong')).not.toThrow();
    expect(parseStoredSeries('{ hong')).toEqual({ code: '', rows: [] });
  });

  it('không phải object thì bỏ — kể cả mảng', () => {
    expect(parseStoredSeries('[1,2,3]')).toEqual({ code: '', rows: [] });
    expect(parseStoredSeries('"HPG"')).toEqual({ code: '', rows: [] });
    expect(parseStoredSeries('null')).toEqual({ code: '', rows: [] });
  });

  it('rows không phải mảng thì giữ mã, bỏ bảng', () => {
    expect(parseStoredSeries('{"code":"fpt","rows":"nhieu"}')).toEqual({ code: 'FPT', rows: [] });
  });

  it('mã được viết hoa và cắt ngắn', () => {
    expect(parseStoredSeries('{"code":" hpg ","rows":[]}').code).toBe('HPG');
    expect(parseStoredSeries(`{"code":"${'X'.repeat(50)}","rows":[]}`).code).toHaveLength(12);
  });

  it('ô số lạ thành null chứ KHÔNG thành 0 — 0 là một con số có nghĩa khác (FR-06)', () => {
    const parsed = parseStoredSeries(
      '{"code":"","rows":[{"date":"15/07","open":"25.1","high":null,"low":true,"close":25.4,"volume":{}}]}',
    );

    expect(parsed.rows[0]).toEqual({
      date: '15/07',
      open: null,
      high: null,
      low: null,
      close: 25.4,
      volume: null,
    });
  });

  it('NaN và Infinity ghi ra JSON thành null, đọc lại vẫn là null', () => {
    const raw = serializeStoredSeries({ code: '', rows: [row({ close: Number.NaN })] });
    expect(parseStoredSeries(raw).rows[0]?.close).toBeNull();
  });

  it('phần tử không phải object bị bỏ, các dòng còn lại vẫn giữ', () => {
    const parsed = parseStoredSeries(
      '{"code":"","rows":[{"date":"15/07","close":25.4},7,"x",null]}',
    );
    expect(parsed.rows).toHaveLength(1);
    expect(parsed.rows[0]?.date).toBe('15/07');
  });

  it('cắt ở trần số phiên', () => {
    const many = Array.from({ length: MAX_SERIES_ROWS + 50 }, () => ({ date: '15/07', close: 1 }));
    expect(parseStoredSeries(JSON.stringify({ code: '', rows: many })).rows).toHaveLength(
      MAX_SERIES_ROWS,
    );
  });
});

describe('sửa bảng', () => {
  const rows = [row({ date: '15/07' }), row({ date: '16/07' })];

  it('updateRow chỉ đổi đúng ô được chỉ định', () => {
    const next = updateRow(rows, 1, { close: 26 });
    expect(next[1]?.close).toBe(26);
    expect(next[1]?.date).toBe('16/07');
    expect(next[0]).toEqual(rows[0]);
  });

  it('updateRow với chỉ số ngoài phạm vi thì giữ nguyên, không tạo lỗ trống', () => {
    expect(updateRow(rows, 9, { close: 1 })).toEqual(rows);
    expect(updateRow(rows, -1, { close: 1 })).toEqual(rows);
  });

  it('không sửa mảng gốc — mọi hàm đều trả mảng mới', () => {
    updateRow(rows, 0, { close: 99 });
    removeRow(rows, 0);
    appendRow(rows, emptyRow());
    expect(rows).toHaveLength(2);
    expect(rows[0]?.close).toBe(25.4);
  });

  it('removeRow bỏ đúng dòng', () => {
    expect(removeRow(rows, 0).map((r) => r.date)).toEqual(['16/07']);
  });

  it('appendRow thêm vào cuối và dừng ở trần', () => {
    expect(appendRow(rows, emptyRow())).toHaveLength(3);

    const full = Array.from({ length: MAX_SERIES_ROWS }, () => row());
    expect(appendRow(full, emptyRow())).toHaveLength(MAX_SERIES_ROWS);
  });
});
