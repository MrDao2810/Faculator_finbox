import { describe, expect, it } from 'vitest';

import { emptyRow } from '@/core/price-series';
import type { SeriesRow } from '@/core/price-series';

import {
  MAX_SERIES_ROWS,
  appendRow,
  parseStoredSeries,
  parseWorkingSeries,
  removeRow,
  serializeStoredSeries,
  serializeWorkingSeries,
  updateRow,
} from './price-series-store';
import type { WorkingSeries } from './price-series-store';

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

/**
 * Bản ghi chuỗi đang dùng trên màn chi tiết — cũng đọc lên từ máy người dùng, nên cũng không tin
 * gì cả. Khác bảng WF-05 ở một điểm quan trọng: bản ghi hỏng phải ra `null` (màn chạy như trước,
 * không khôi phục gì) chứ không ra một bản rỗng, vì "chuỗi rỗng" ở đây nghĩa là xoá mất chuỗi
 * công thức đang tính.
 */
describe('parseWorkingSeries — chuỗi đã thay tại chỗ', () => {
  const record: WorkingSeries = {
    id: 'ty-so-sharpe',
    rows: [row({ date: '15/07' }), row({ date: '16/07' })],
    marketSeries: null,
    source: 'paste',
    code: null,
  };

  it('đọc lại đúng thứ đã ghi', () => {
    expect(parseWorkingSeries(serializeWorkingSeries(record))).toEqual(record);
  });

  it('giữ được chuỗi thị trường đi kèm — Beta đọc cả hai vế', () => {
    const beta: WorkingSeries = { ...record, id: 'beta', marketSeries: [1, 2, 3], code: 'FPT' };
    expect(parseWorkingSeries(serializeWorkingSeries(beta))).toEqual(beta);
  });

  it('chuỗi rỗng, JSON hỏng, mảng, hay không có gì đều ra null', () => {
    expect(parseWorkingSeries(null)).toBeNull();
    expect(parseWorkingSeries('')).toBeNull();
    expect(parseWorkingSeries('{{{ không phải JSON')).toBeNull();
    expect(parseWorkingSeries('[]')).toBeNull();
  });

  it('id sai dạng hoặc nguồn lạ thì bỏ cả bản ghi', () => {
    expect(parseWorkingSeries(JSON.stringify({ ...record, id: '../../etc' }))).toBeNull();
    expect(parseWorkingSeries(JSON.stringify({ ...record, source: 'mã' }))).toBeNull();
  });

  it('không còn dòng nào dùng được thì coi như không có bản ghi', () => {
    expect(parseWorkingSeries(JSON.stringify({ ...record, rows: [] }))).toBeNull();
    expect(parseWorkingSeries(JSON.stringify({ ...record, rows: 'mấy dòng' }))).toBeNull();
  });

  it('mã sai dạng thì bỏ RIÊNG mã, giữ chuỗi', () => {
    const parsed = parseWorkingSeries(JSON.stringify({ ...record, code: 'không phải mã' }));
    expect(parsed?.code).toBeNull();
    expect(parsed?.rows).toHaveLength(2);
  });

  it('chuỗi thị trường rỗng hoặc lẫn rác thì chỉ giữ phần là số', () => {
    expect(parseWorkingSeries(JSON.stringify({ ...record, marketSeries: [] }))?.marketSeries).toBe(
      null,
    );
    expect(
      parseWorkingSeries(JSON.stringify({ ...record, marketSeries: [1, 'hai', null, 3] }))
        ?.marketSeries,
    ).toEqual([1, 3]);
  });

  it('cắt ở trần số phiên, cả khi ghi lẫn khi đọc', () => {
    const many = Array.from({ length: MAX_SERIES_ROWS + 50 }, () => row());
    const written = serializeWorkingSeries({ ...record, rows: many });
    expect(parseWorkingSeries(written)?.rows).toHaveLength(MAX_SERIES_ROWS);
  });
});
