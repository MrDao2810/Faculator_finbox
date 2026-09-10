import { describe, expect, it } from 'vitest';

import {
  checkRow,
  checkSeries,
  closesOf,
  emptyRow,
  parseSeriesDate,
  sortRowsByDate,
  toCsv,
} from './price-series';
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
    expect(issues[0]?.message).toContain('25,1');
    expect(issues[0]?.message).toContain('25,2');
  });

  /*
   * Câu cảnh báo đứng ngay cạnh ô nhập, mà ô nhập viết '25,1'. In ra '25.1' là bày hai lối viết
   * cho cùng một con số trong cùng một dòng, và người đọc phải tự đoán dấu chấm ấy là thập phân
   * hay ngăn nghìn — đúng chỗ đã báo lỗi từ màn WF-05 (CON-05).
   */
  it('số trong câu cảnh báo viết theo quy ước Việt Nam, không lẫn dấu chấm thập phân', () => {
    const issues = [
      ...checkRow(row({ open: 25.05, high: 25.1, low: 25.2, close: 25.15 })),
      ...checkRow(row({ high: 25.2, low: 25, close: 25.5 })),
      ...checkRow(row({ open: 24.9, low: 25.05, high: 25.7 })),
    ];
    for (const issue of issues) {
      expect(issue.message, issue.code).not.toMatch(/\d\.\d/);
    }
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
    /*
     * Câu báo nêu chính NGÀY, KHÔNG nêu số dòng — và ca này ghim cả vế phủ định.
     *
     * Bản trước ghim `'dòng 1'`. Từ 10/09/2026 bảng WF-05 bày ngày mới nhất lên đầu, nên chỉ số
     * trong mảng không còn là con số người dùng đếm bằng mắt: một câu chỉ sai chỗ thì tệ hơn một
     * câu không chỉ chỗ nào, vì họ sẽ đi sửa nhầm dòng. `first` vẫn còn trong `checkSeries()` để
     * bảng tra biết dòng đầu tiên dùng ngày đó, nó chỉ thôi đi vào câu chữ.
     */
    expect(check.rows[0]?.issues[0]?.message).toContain('15/07');
    expect(check.rows[0]?.issues[0]?.message).not.toMatch(/dòng \d/);
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

/*
 * Đọc ngày và sắp xếp — thêm 10/09/2026, khi chủ dự án chốt bảng WF-05 bày ngày mới nhất lên đầu.
 *
 * Cả hai hàm phục vụ đúng một yêu cầu: *"tạo thêm dòng thì hiển thị trên đầu, sau khi nhập liệu
 * xong rồi mới check ngày rồi sort"*. Phần "sort sau" nằm ở màn (sắp lúc tiêu điểm rời dòng); phần
 * "không đoán" nằm ở đây.
 */
describe('parseSeriesDate — đọc ô ngày, không đoán', () => {
  it('đọc được ba lối viết mà bảng này thật sự gặp', () => {
    expect(parseSeriesDate('2025-01-20')).toEqual({ year: 2025, month: 1, day: 20 });
    expect(parseSeriesDate('20/01/2025')).toEqual({ year: 2025, month: 1, day: 20 });
    expect(parseSeriesDate('15/07')).toEqual({ year: null, month: 7, day: 15 });
  });

  it('ngày/tháng đọc theo lối Việt Nam — 15/07 là 15 tháng 7', () => {
    expect(parseSeriesDate('15/07')?.month).toBe(7);
    expect(parseSeriesDate('15/07')?.day).toBe(15);
  });

  it('thứ không phải ngày thì trả null chứ không đoán ra một ngày nào', () => {
    // Chuỗi minh hoạ của trang Beta ghi số thứ tự phiên — đây là dữ liệu THẬT, không phải ca hiếm.
    expect(parseSeriesDate('1')).toBeNull();
    expect(parseSeriesDate('')).toBeNull();
    expect(parseSeriesDate('hôm qua')).toBeNull();
    // Tháng 13 và ngày 32 không tồn tại; nhận bừa là xếp chuỗi theo một ngày không có thật.
    expect(parseSeriesDate('2025-13-01')).toBeNull();
    expect(parseSeriesDate('32/01/2025')).toBeNull();
  });
});

describe('sortRowsByDate — cũ → mới, và không bao giờ đoán', () => {
  function ngay(date: string, close = 10): SeriesRow {
    return { date, open: null, high: null, low: null, close, volume: null };
  }

  it('xếp theo ngày tăng dần, giữ nguyên số dòng', () => {
    const sorted = sortRowsByDate([ngay('2025-03-02'), ngay('2025-01-05'), ngay('2025-02-11')]);

    expect(sorted.map((r) => r.date)).toEqual(['2025-01-05', '2025-02-11', '2025-03-02']);
  });

  it('dòng KHÔNG đọc được ngày thì đứng yên tại chỗ, không bị dồn về một đầu', () => {
    /*
     * Đây là bất biến giữ cho dòng vừa thêm (ngày còn trống) nằm im ở đầu bảng trong lúc người
     * dùng gõ. Ô trống ở vị trí 1 phải VẪN ở vị trí 1 sau khi sắp.
     */
    const sorted = sortRowsByDate([ngay('2025-03-02'), ngay(''), ngay('2025-01-05')]);

    expect(sorted.map((r) => r.date)).toEqual(['2025-01-05', '', '2025-03-02']);
  });

  it('trộn hai lối viết thì lối THIẾU NĂM nhường chỗ — không so được thì không xếp', () => {
    // '15/07' không biết thuộc năm nào, nên nó ở nguyên vị trí 1, còn hai ngày có năm đổi chỗ.
    const sorted = sortRowsByDate([ngay('2025-03-02'), ngay('15/07'), ngay('2024-01-05')]);

    expect(sorted.map((r) => r.date)).toEqual(['2024-01-05', '15/07', '2025-03-02']);
  });

  it('cả bảng cùng lối thiếu năm thì so theo tháng–ngày như thường', () => {
    const sorted = sortRowsByDate([ngay('15/07'), ngay('02/03'), ngay('20/07')]);

    expect(sorted.map((r) => r.date)).toEqual(['02/03', '15/07', '20/07']);
  });

  it('ỔN ĐỊNH: hai dòng trùng ngày giữ nguyên thứ tự tương đối', () => {
    const sorted = sortRowsByDate([ngay('2025-01-05', 1), ngay('2025-01-05', 2)]);

    expect(sorted.map((r) => r.close)).toEqual([1, 2]);
  });

  it('sắp rồi thì `closesOf` vẫn trả chuỗi theo thời gian — đây là chỗ Beta/VaR đọc', () => {
    const sorted = sortRowsByDate([ngay('2025-03-02', 30), ngay('2025-01-05', 10)]);

    expect(closesOf(sorted)).toEqual([10, 30]);
  });

  it('bảng rỗng và bảng một dòng không vỡ', () => {
    expect(sortRowsByDate([])).toEqual([]);
    expect(sortRowsByDate([emptyRow()])).toHaveLength(1);
  });
});
