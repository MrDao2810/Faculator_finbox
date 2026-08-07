import { describe, expect, it } from 'vitest';

import {
  COLUMN_LABELS,
  MAX_PASTE_LINES,
  closeSeries,
  detectDelimiter,
  guessColumns,
  parsePaste,
  summarizeSkipped,
  type ColumnKind,
} from './paste-import';

/** Đúng chuỗi mẫu WF-11 vẽ trong vùng dán: dán thẳng từ Excel nên ngăn bằng Tab. */
const WF11 = [
  '15/07\t25.10\t25.60\t24.90\t25.40',
  '16/07\t25.40\t25.80\t25.20\t25.70',
  '17/07\t25.70\t25.90\t25.10\t25.30',
].join('\n');

describe('detectDelimiter()', () => {
  it('nhận ra Tab — dán thẳng từ Excel', () => {
    expect(detectDelimiter(WF11)).toBe('\t');
  });

  it('nhận ra dấu phẩy của file CSV', () => {
    expect(detectDelimiter('15/07,25.1,25.6\n16/07,25.4,25.8')).toBe(',');
  });

  it('nhận ra dấu chấm phẩy — Excel bản tiếng Việt hay xuất kiểu này', () => {
    expect(detectDelimiter('15/07;25,1;25,6\n16/07;25,4;25,8')).toBe(';');
  });

  it('không nhầm dấu chấm ngăn nghìn thành ký tự ngăn cột', () => {
    expect(detectDelimiter('15/07\t1.000\t2.000')).toBe('\t');
  });

  it('chuỗi rỗng thì mặc định Tab, không ném lỗi', () => {
    expect(detectDelimiter('')).toBe('\t');
    expect(detectDelimiter('   \n  ')).toBe('\t');
  });
});

describe('guessColumns()', () => {
  it('đọc tiêu đề tiếng Việt', () => {
    expect(guessColumns(['Ngày', 'Mở', 'Cao', 'Thấp', 'Đóng'], true)).toEqual([
      'date',
      'open',
      'high',
      'low',
      'close',
    ]);
  });

  it('đọc tiêu đề tiếng Anh — file tải về hay lẫn hai thứ tiếng', () => {
    expect(guessColumns(['Date', 'Open', 'High', 'Low', 'Close', 'Volume'], true)).toEqual([
      'date',
      'open',
      'high',
      'low',
      'close',
      'volume',
    ]);
  });

  it('đọc được tiêu đề không dấu', () => {
    expect(guessColumns(['ngay', 'gia dong cua'], true)).toEqual(['date', 'close']);
  });

  it('cột lạ thì bỏ qua chứ không đoán bừa', () => {
    expect(guessColumns(['Ngày', 'Vốn hoá', 'Đóng'], true)).toEqual(['date', 'ignore', 'close']);
  });

  it('không có tiêu đề thì đoán theo vị trí', () => {
    expect(guessColumns(['15/07', '25.1', '25.6', '24.9', '25.4'], false)).toEqual([
      'date',
      'open',
      'high',
      'low',
      'close',
    ]);
  });

  it('cột đầu là số thì coi như không có cột ngày', () => {
    expect(guessColumns(['25.1', '25.6', '24.9', '25.4'], false)).toEqual([
      'open',
      'high',
      'low',
      'close',
    ]);
  });

  it('mỗi cột chỉ gán một vai trò, tiêu đề trùng thì cái sau bị bỏ', () => {
    expect(guessColumns(['Đóng', 'Đóng'], true)).toEqual(['close', 'ignore']);
  });

  it('có nhãn tiếng Việt cho mọi vai trò cột', () => {
    const kinds: ColumnKind[] = ['date', 'open', 'high', 'low', 'close', 'volume', 'ignore'];
    for (const kind of kinds) {
      expect(COLUMN_LABELS[kind].trim()).not.toBe('');
    }
  });
});

describe('parsePaste() — ca của WF-11', () => {
  it('đọc đủ ba phiên trong chuỗi mẫu', () => {
    const result = parsePaste(WF11);

    expect(result.rows).toHaveLength(3);
    expect(result.skipped).toEqual([]);
    expect(result.hasHeader).toBe(false);
  });

  it('đọc đúng giá và giữ nguyên chuỗi ngày người dùng dán', () => {
    const [first] = parsePaste(WF11).rows;

    expect(first?.date).toBe('15/07');
    expect(first?.open).toBe(25.1);
    expect(first?.high).toBe(25.6);
    expect(first?.low).toBe(24.9);
    expect(first?.close).toBe(25.4);
  });

  it('KHÔNG tự suy ra năm còn thiếu — Domain không được lấy ngày hệ thống (NFR-REL-03)', () => {
    expect(parsePaste(WF11).rows[0]?.date).not.toContain('20');
  });

  it('ghi số dòng theo đúng vị trí trong chuỗi đã dán, để người dùng dò lại trong Excel', () => {
    expect(parsePaste(WF11).rows.map((r) => r.line)).toEqual([1, 2, 3]);
  });
});

describe('parsePaste() — dòng tiêu đề', () => {
  it('nhận ra và bỏ dòng tiêu đề, không tính là dòng hỏng', () => {
    const result = parsePaste(['Ngày\tĐóng', '15/07\t25.4', '16/07\t25.7'].join('\n'));

    expect(result.hasHeader).toBe(true);
    expect(result.rows).toHaveLength(2);
    expect(result.skipped).toEqual([]);
  });

  it('số dòng vẫn tính cả dòng tiêu đề, đúng như người dùng nhìn thấy', () => {
    const result = parsePaste(['Ngày\tĐóng', '15/07\t25.4'].join('\n'));
    expect(result.rows[0]?.line).toBe(2);
  });

  it('không có tiêu đề thì không nuốt mất dòng dữ liệu đầu tiên', () => {
    expect(parsePaste('15/07\t25.4\n16/07\t25.7').rows).toHaveLength(2);
  });
});

describe('parsePaste() — dòng bỏ qua kèm lý do và số dòng', () => {
  it('thiếu giá đóng cửa thì bỏ qua, ghi đúng số dòng', () => {
    const result = parsePaste(['15/07\t25.4', '16/07\t', '17/07\t25.3'].join('\n'));

    expect(result.rows).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]?.line).toBe(2);
    expect(result.skipped[0]?.reason).toContain('thiếu cột giá đóng cửa');
  });

  it('giá không đọc được thì nêu rõ nội dung sai', () => {
    const result = parsePaste('15/07\tn/a');

    expect(result.skipped[0]?.reason).toContain('n/a');
  });

  it('giá âm hoặc bằng 0 bị loại — không có phiên nào giá 0', () => {
    const result = parsePaste(['15/07\t0', '16/07\t-5', '17/07\t25.3'].join('\n'));

    expect(result.rows).toHaveLength(1);
    expect(result.skipped).toHaveLength(2);
  });

  it('thiếu ngày thì bỏ qua khi bảng có cột ngày', () => {
    const result = parsePaste(['Ngày\tĐóng', '\t25.4'].join('\n'));
    expect(result.skipped[0]?.reason).toBe('thiếu ngày');
  });

  it('bảng không có cột ngày thì không đòi ngày', () => {
    const result = parsePaste('25.1\t25.6\t24.9\t25.4');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.date).toBe('');
  });

  it('dòng trống bị bỏ im lặng, không tính là hỏng', () => {
    const result = parsePaste('15/07\t25.4\n\n\n16/07\t25.7');

    expect(result.rows).toHaveLength(2);
    expect(result.skipped).toEqual([]);
  });

  it('giữ nội dung thô của dòng hỏng để người dùng nhận ra', () => {
    expect(parsePaste('15/07\txxx').skipped[0]?.raw).toContain('xxx');
  });

  it('dòng quá dài thì cắt bớt phần xem trước', () => {
    const long = `15/07\t${'x'.repeat(200)}`;
    const raw = parsePaste(long).skipped[0]?.raw ?? '';

    expect(raw.length).toBeLessThan(60);
    expect(raw.endsWith('…')).toBe(true);
  });
});

describe('parsePaste() — số kiểu Việt Nam', () => {
  it('đọc được dấu phẩy thập phân', () => {
    expect(parsePaste('15/07;25,40').rows[0]?.close).toBe(25.4);
  });

  it('đọc được dấu chấm ngăn nghìn', () => {
    expect(parsePaste('15/07\t92.000').rows[0]?.close).toBe(92_000);
  });

  it('cột khối lượng để trống thì là null chứ không phải 0', () => {
    const result = parsePaste(['Ngày\tĐóng\tKL', '15/07\t25.4\t'].join('\n'));
    expect(result.rows[0]?.volume).toBeNull();
  });
});

describe('parsePaste() — chặn đầu vào quá lớn', () => {
  it('cắt ở trần và NÓI RÕ đã cắt bao nhiêu, không cắt im lặng', () => {
    const huge = Array.from({ length: MAX_PASTE_LINES + 25 }, (_, i) => `15/07\t${i + 1}`).join(
      '\n',
    );
    const result = parsePaste(huge);

    expect(result.truncated).toBe(25);
    expect(result.rows).toHaveLength(MAX_PASTE_LINES);
  });

  it('dưới trần thì không báo cắt', () => {
    expect(parsePaste(WF11).truncated).toBe(0);
  });

  it('chuỗi rỗng trả kết quả rỗng, không ném lỗi', () => {
    const result = parsePaste('');

    expect(result.rows).toEqual([]);
    expect(result.skipped).toEqual([]);
    expect(result.columns).toEqual([]);
  });
});

describe('parsePaste() — người dùng tự gán lại cột', () => {
  it('tôn trọng cách gán do người dùng chọn thay vì đoán', () => {
    // Cùng dữ liệu nhưng bảo cột 2 là giá đóng cửa chứ không phải giá mở cửa.
    const result = parsePaste('15/07\t25.10\t25.60', ['date', 'close', 'ignore']);

    expect(result.rows[0]?.close).toBe(25.1);
    expect(result.rows[0]?.open).toBeNull();
  });

  it('gán thiếu cột đóng cửa thì mọi dòng đều bị bỏ qua kèm lý do', () => {
    const result = parsePaste(WF11, ['date', 'open', 'high', 'low', 'ignore']);

    expect(result.rows).toEqual([]);
    expect(result.skipped).toHaveLength(3);
  });
});

describe('summarizeSkipped()', () => {
  it('dựng đúng câu của WF-11', () => {
    const lines = summarizeSkipped([
      { line: 41, reason: 'thiếu cột giá đóng cửa', raw: '' },
      { line: 58, reason: 'thiếu cột giá đóng cửa', raw: '' },
    ]);

    expect(lines).toEqual(['thiếu cột giá đóng cửa (dòng 41, 58)']);
  });

  it('gộp theo lý do, mỗi lý do một dòng', () => {
    const lines = summarizeSkipped([
      { line: 3, reason: 'thiếu ngày', raw: '' },
      { line: 41, reason: 'thiếu cột giá đóng cửa', raw: '' },
    ]);

    expect(lines).toHaveLength(2);
  });

  it('nhiều dòng quá thì nói rõ còn bao nhiêu nữa, không cắt im lặng', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      line: i + 1,
      reason: 'thiếu ngày',
      raw: '',
    }));

    expect(summarizeSkipped(many, 3)[0]).toContain('… và 7 dòng nữa');
  });

  it('không có dòng hỏng thì không có câu nào', () => {
    expect(summarizeSkipped([])).toEqual([]);
  });
});

describe('closeSeries()', () => {
  it('lấy đúng chuỗi giá đóng cửa cho Beta, Sharpe, MaxDD (FR-12)', () => {
    expect(closeSeries(parsePaste(WF11))).toEqual([25.4, 25.7, 25.3]);
  });
});
