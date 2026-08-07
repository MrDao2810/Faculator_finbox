import { describe, expect, it } from 'vitest';

import { checkRow, checkSeries, closesOf, emptyRow, toCsv } from './price-series';
import type { SeriesRow } from './price-series';

/** Một phiên hợp lệ, dùng làm khuôn rồi ghi đè từng mảnh trong các ca lỗi. */
function row(patch: Partial<SeriesRow> = {}): SeriesRow {
  return {
    date: '15/07',
    open: 25.1,
    high: 25.7,
    low: 25.05,
    close: 25.4,
    volume: 1_200_000,
    ...patch,
  };
}

function codes(r: SeriesRow): string[] {
  return checkRow(r).map((issue) => issue.code);
}

describe('checkRow — một phiên', () => {
  it('phiên đủ và hợp lý thì không có vấn đề gì', () => {
    expect(checkRow(row())).toEqual([]);
  });

  it('dòng trống mới thêm báo thiếu ngày và thiếu giá đóng cửa, không báo lỗi giá', () => {
    expect(codes(emptyRow())).toEqual(['MISSING_DATE', 'MISSING_CLOSE']);
  });

  it('bắt giá cao nhỏ hơn giá thấp — đúng ca của wireframe WF-05', () => {
    const issues = checkRow(row({ open: 25.05, high: 25.1, low: 25.2, close: 25.15 }));
    expect(issues.map((i) => i.code)).toContain('HIGH_BELOW_LOW');
    expect(issues[0]?.message).toContain('25.1');
    expect(issues[0]?.message).toContain('25.2');
  });

  it('bắt giá cao nhỏ hơn giá đóng cửa của chính phiên đó', () => {
    expect(codes(row({ high: 25.2, low: 25, close: 25.5 }))).toContain('HIGH_NOT_HIGHEST');
  });

  it('bắt giá thấp lớn hơn giá mở của chính phiên đó', () => {
    expect(codes(row({ open: 24.9, low: 25.05, high: 25.7 }))).toContain('LOW_NOT_LOWEST');
  });

  it('giá bằng 0 hoặc âm không phải là giá', () => {
    expect(codes(row({ close: 0 }))).toContain('NON_POSITIVE_PRICE');
    expect(codes(row({ open: -1 }))).toContain('NON_POSITIVE_PRICE');
  });

  it('khối lượng âm bị bắt, khối lượng 0 thì không — phiên không khớp lệnh là có thật', () => {
    expect(codes(row({ volume: -5 }))).toContain('NEGATIVE_VOLUME');
    expect(codes(row({ volume: 0 }))).toEqual([]);
  });

  it('thiếu cột phụ không phải lỗi — chỉ cần ngày và giá đóng cửa', () => {
    expect(codes(row({ open: null, high: null, low: null, volume: null }))).toEqual([]);
  });

  it('thiếu giá cao thì không suy ra mâu thuẫn cao/thấp', () => {
    expect(codes(row({ high: null }))).toEqual([]);
  });

  it('không ném lỗi với giá trị không hữu hạn, chỉ báo giá không hợp lệ', () => {
    expect(() => checkRow(row({ close: Number.NaN }))).not.toThrow();
    expect(codes(row({ close: Number.POSITIVE_INFINITY }))).toContain('NON_POSITIVE_PRICE');
  });
});

describe('checkSeries — cả bảng', () => {
  it('đếm đúng số dòng dùng được', () => {
    const check = checkSeries([row({ date: '15/07' }), row({ date: '16/07' })]);
    expect(check.usableCount).toBe(2);
    expect(check.total).toBe(2);
    expect(check.rows).toEqual([]);
  });

  it('bắt ngày trùng và chỉ đúng dòng đầu tiên đã dùng ngày đó', () => {
    const check = checkSeries([
      row({ date: '15/07' }),
      row({ date: '16/07' }),
      row({ date: '15/07' }),
    ]);

    expect(check.usableCount).toBe(2);
    expect(check.rows).toHaveLength(1);
    expect(check.rows[0]?.index).toBe(2);
    expect(check.rows[0]?.issues[0]?.code).toBe('DUPLICATE_DATE');
    // Nói rõ dòng số mấy, đếm từ 1 như người dùng nhìn thấy trên bảng.
    expect(check.rows[0]?.issues[0]?.message).toContain('dòng 1');
  });

  it('một dòng hỏng không làm hỏng cả bảng', () => {
    const check = checkSeries([row({ date: '15/07' }), row({ date: '16/07', high: 1, low: 9 })]);
    expect(check.usableCount).toBe(1);
    expect(check.rows).toHaveLength(1);
  });

  it('bảng rỗng không ném lỗi', () => {
    expect(checkSeries([])).toEqual({ rows: [], usableCount: 0, total: 0 });
  });
});

describe('closesOf — chuỗi đưa vào CalcContext', () => {
  it('lấy giá đóng cửa theo đúng thứ tự bảng', () => {
    expect(
      closesOf([row({ date: '15/07', close: 25.4 }), row({ date: '16/07', close: 25.6 })]),
    ).toEqual([25.4, 25.6]);
  });

  it('bỏ dòng có vấn đề chứ không tính trên dữ liệu mâu thuẫn', () => {
    const rows = [
      row({ date: '15/07', close: 25.4 }),
      row({ date: '16/07', high: 1, low: 9, close: 5 }),
      // Giá đóng cửa phải nằm trong khoảng cao–thấp của chính phiên, nếu không dòng này
      // cũng bị loại — đúng luật, và soạn ca kiểm này lần đầu tôi đã vi phạm nó.
      row({ date: '17/07', close: 25.6 }),
    ];
    expect(closesOf(rows)).toEqual([25.4, 25.6]);
  });

  it('bỏ dòng trống mới thêm', () => {
    expect(closesOf([row(), emptyRow()])).toEqual([25.4]);
  });
});

describe('toCsv', () => {
  it('có dòng tiêu đề tiếng Việt và một dòng cho mỗi phiên', () => {
    const csv = toCsv([row({ date: '15/07' })]);
    const lines = csv.split('\n');

    expect(lines[0]).toBe('Ngày,Mở,Cao,Thấp,Đóng,Khối lượng');
    expect(lines[1]).toBe('15/07,25.1,25.7,25.05,25.4,1200000');
  });

  it('ô chưa nhập để trống chứ không ghi 0 — 0 là một con số có nghĩa khác', () => {
    const csv = toCsv([
      { date: '15/07', open: null, high: null, low: null, close: 25.4, volume: null },
    ]);
    expect(csv.split('\n')[1]).toBe('15/07,,,,25.4,');
  });

  it('ngày có dấu phẩy thì được bọc ngoặc kép để Excel không tách cột', () => {
    const csv = toCsv([row({ date: 'T2, 15/07' })]);
    expect(csv.split('\n')[1]).toContain('"T2, 15/07"');
  });

  it('bảng rỗng vẫn xuất được, chỉ có dòng tiêu đề', () => {
    expect(toCsv([])).toBe('Ngày,Mở,Cao,Thấp,Đóng,Khối lượng');
  });
});
