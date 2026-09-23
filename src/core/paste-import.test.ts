import { describe, expect, it } from 'vitest';

import {
  COLUMN_LABELS,
  MAX_PASTE_LINES,
  closeSeries,
  detectDelimiter,
  guessColumns,
  parseCells,
  parsePaste,
  splitPasteTable,
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
      { line: 41, reason: 'thiếu cột giá đóng cửa', short: 'thiếu giá đóng cửa', raw: '' },
      { line: 58, reason: 'thiếu cột giá đóng cửa', short: 'thiếu giá đóng cửa', raw: '' },
    ]);

    expect(lines).toEqual(['thiếu cột giá đóng cửa (dòng 41, 58)']);
  });

  it('gộp theo lý do, mỗi lý do một dòng', () => {
    const lines = summarizeSkipped([
      { line: 3, reason: 'thiếu ngày', short: 'thiếu ngày', raw: '' },
      { line: 41, reason: 'thiếu cột giá đóng cửa', short: 'thiếu giá đóng cửa', raw: '' },
    ]);

    expect(lines).toHaveLength(2);
  });

  it('nhiều dòng quá thì nói rõ còn bao nhiêu nữa, không cắt im lặng', () => {
    const many = Array.from({ length: 10 }, (_, i) => ({
      line: i + 1,
      reason: 'thiếu ngày',
      short: 'thiếu ngày',
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

/*
 * ── Đợt 22/09/2026: chặn bốn lỗi "ra số sai mà không báo" ───────────────────────────────
 *
 * Cả bốn đều đã tái hiện được bằng mã thật trước khi sửa: không dòng nào bị bỏ qua, không
 * cảnh báo nào nổ, và con số đưa vào công thức thì sai. Mỗi ca dưới đây ghim đúng một lỗi.
 */
describe('parsePaste() — quy ước số Việt Nam và quốc tế', () => {
  it('một cột giá kiểu Việt không bị cắt đôi ở dấu phẩy thập phân', () => {
    // Trước khi sửa: detectDelimiter chọn ',', giá 25,40 thành hai ô và cột cuối '40' làm giá.
    expect(detectDelimiter('25,40\n25,70')).toBe('\t');
    expect(closeSeries(parsePaste('25,40\n25,70\n24,90'))).toEqual([25.4, 25.7, 24.9]);
  });

  it('CSV dấu phẩy mà số cũng dùng phẩy thập phân: ghép lại chứ không đọc 25,40 thành 40', () => {
    const result = parsePaste('15/07,25,40\n16/07,25,70');

    expect(result.columns).toEqual(['date', 'close']);
    expect(closeSeries(result)).toEqual([25.4, 25.7]);
    expect(result.skipped).toEqual([]);
  });

  it('phẩy ngăn nghìn kiểu Anh: 25,100 là hai mươi lăm nghìn một trăm, và nói rõ là phỏng đoán', () => {
    const result = parsePaste('Date\tClose\n15/07/2025\t25,100\n16/07/2025\t25,400');

    expect(result.numberStyle).toBe('en');
    expect(result.numberStyleGuessed).toBe(true);
    expect(closeSeries(result)).toEqual([25100, 25400]);
  });

  it('người dùng chốt lại cách đọc thì bộ đọc theo, không đoán nữa', () => {
    const result = parsePaste(
      'Date\tClose\n15/07/2025\t25,100\n16/07/2025\t25,400',
      undefined,
      'vi',
    );

    expect(result.numberStyleGuessed).toBe(false);
    expect(closeSeries(result)).toEqual([25.1, 25.4]);
  });

  it('chấm ngăn nghìn kiểu Việt: 25.100 cũng là hai mươi lăm nghìn một trăm', () => {
    expect(closeSeries(parsePaste('Ngày\tĐóng\n15/07/2025\t25.100'))).toEqual([25100]);
  });

  it('ô có cả chấm lẫn phẩy thì dấu đứng SAU là thập phân, không phải đoán', () => {
    const anh = parsePaste('Ngày\tĐóng\n15/07/2025\t1,234.56');
    expect(anh.numberStyleGuessed).toBe(false);
    expect(closeSeries(anh)).toEqual([1234.56]);

    const viet = parsePaste('Ngày\tĐóng\n15/07/2025\t1.234,56');
    expect(closeSeries(viet)).toEqual([1234.56]);
  });

  it('bỏ được đơn vị tiền và đọc ngoặc kế toán thành số âm', () => {
    const result = parsePaste('Ngày\tĐóng\n15/07/2025\t25,40 ₫\n16/07/2025\t(25,70)');

    expect(closeSeries(result)).toEqual([25.4]);
    expect(result.skipped[0]?.reason).toContain('lớn hơn 0');
  });
});

describe('parsePaste() — chiều thời gian', () => {
  const CU_TRUOC = '15/07/2026\t25,40\n16/07/2026\t25,70\n17/07/2026\t25,30';
  const MOI_TRUOC = '17/07/2026\t25,30\n16/07/2026\t25,70\n15/07/2026\t25,40';

  it('chuỗi xếp cũ trước thì giữ nguyên', () => {
    const result = parsePaste(CU_TRUOC);

    expect(result.order).toBe('oldest-first');
    expect(result.reordered).toBe(false);
    expect(closeSeries(result)).toEqual([25.4, 25.7, 25.3]);
  });

  it('chuỗi xếp mới trước — kiểu CafeF, Vietstock, investing.com — được đảo lại', () => {
    const result = parsePaste(MOI_TRUOC);

    expect(result.order).toBe('newest-first');
    expect(result.reordered).toBe(true);
    // `CalcContext.series` đòi phiên CŨ trước phiên MỚI. Đảo sai làm Sharpe đổi dấu.
    expect(closeSeries(result)).toEqual([25.4, 25.7, 25.3]);
  });

  it('không đọc được ngày thì KHÔNG tự sắp, và nói là không biết thứ tự', () => {
    const result = parsePaste('25,40\n25,70\n25,30');

    expect(result.order).toBe('unknown');
    expect(result.reordered).toBe(false);
    expect(closeSeries(result)).toEqual([25.4, 25.7, 25.3]);
  });

  it('ngày lộn xộn cũng là không biết thứ tự, thà nói không biết còn hơn sắp sai', () => {
    expect(parsePaste('16/07/2026\t25,70\n15/07/2026\t25,40\n17/07/2026\t25,30').order).toBe(
      'unknown',
    );
  });
});

describe('parsePaste() — phần đầu file không phải dữ liệu', () => {
  it('bỏ dòng ghi chú # của chính bản xuất CSV, cột không bị lệch', () => {
    const result = parsePaste('# Faculator Finbox\nNgày,Đóng\n15/07/2026,25.4\n16/07/2026,25.7');

    expect(result.preamble).toBe(1);
    expect(result.columns).toEqual(['date', 'close']);
    expect(closeSeries(result)).toEqual([25.4, 25.7]);
  });

  it('bỏ dấu BOM ở đầu file', () => {
    expect(closeSeries(parsePaste('﻿15/07/2026\t25,40'))).toEqual([25.4]);
  });
});

describe('guessColumns() — cột khối lượng', () => {
  it('bảng Ngày · Giá · Khối lượng không gán khối lượng thành giá đóng cửa', () => {
    const result = parsePaste('15/07/2026\t25,40\t1250000\n16/07/2026\t25,70\t980000');

    expect(result.columns).toEqual(['date', 'close', 'volume']);
    expect(closeSeries(result)).toEqual([25.4, 25.7]);
    expect(result.rows[0]?.volume).toBe(1250000);
  });

  it('bảng Ngày · Giá hai cột vẫn lấy cột cuối làm giá đóng cửa', () => {
    expect(parsePaste('15/07/2026\t25,40\n16/07/2026\t25,70').columns).toEqual(['date', 'close']);
  });
});

/*
 * ── Lối vào thứ hai: lưới nhập ──────────────────────────────────────────────────────────
 *
 * Từ 22/09/2026 giao diện WF-11 không còn ô văn bản tự do, nên `parsePaste()` không còn là lối
 * vào duy nhất. `splitPasteTable()` lo nửa cắt ô để đổ vào lưới, `parseCells()` lo nửa đọc số
 * từ chính lưới ấy. Điều phải giữ: hai lối vào cho ra CÙNG kết quả trên cùng dữ liệu — nếu
 * lệch thì bốn cơ chế chặn số sai chỉ còn chạy ở một nửa sản phẩm.
 */
describe('splitPasteTable()', () => {
  it('cắt ô và đoán cột, chưa đọc số nào', () => {
    const table = splitPasteTable(WF11);

    expect(table.cells).toHaveLength(3);
    expect(table.cells[0]).toEqual(['15/07', '25.10', '25.60', '24.90', '25.40']);
    expect(table.columns).toEqual(['date', 'open', 'high', 'low', 'close']);
  });

  it('bỏ dòng tiêu đề khỏi phần thân nhưng vẫn dùng nó để đặt tên cột', () => {
    const table = splitPasteTable('Ngày,Đóng\n15/07/2026,25.4\n16/07/2026,25.7');

    expect(table.hasHeader).toBe(true);
    expect(table.columns).toEqual(['date', 'close']);
    expect(table.cells).toEqual([
      ['15/07/2026', '25.4'],
      ['16/07/2026', '25.7'],
    ]);
  });

  it('giữ nguyên dòng hỏng — lưới phải bày nó ra thì người dùng mới sửa được', () => {
    expect(splitPasteTable('15/07\t25,40\n16/07\tn/a').cells).toHaveLength(2);
  });

  it('bỏ dòng ghi chú # của chính bản xuất CSV và đếm lại', () => {
    const table = splitPasteTable('# Faculator Finbox\nNgày,Đóng\n15/07/2026,25.4');

    expect(table.preamble).toBe(1);
    expect(table.cells).toEqual([['15/07/2026', '25.4']]);
  });
});

describe('parseCells()', () => {
  const OHLC: ReadonlyArray<ColumnKind> = ['date', 'open', 'high', 'low', 'close'];

  it('cho cùng kết quả với parsePaste trên cùng dữ liệu', () => {
    const viaText = parsePaste(WF11);
    const viaGrid = parseCells(splitPasteTable(WF11).cells, OHLC);

    expect(viaGrid.rows).toEqual(viaText.rows);
    expect(viaGrid.numberStyle).toBe(viaText.numberStyle);
    expect(viaGrid.order).toBe(viaText.order);
  });

  /*
   * Lưới luôn chừa dòng trống ở cuối để gõ tiếp. Tính nó là dòng hỏng thì mọi lần dán xong đều
   * kèm một cảnh báo rỗng, và cảnh báo rỗng dạy người dùng bỏ qua cảnh báo thật.
   */
  it('dòng trống hoàn toàn không phải dòng bỏ qua', () => {
    const result = parseCells(
      [
        ['15/07/2026', '25,4'],
        ['', ''],
        ['   ', ''],
      ],
      ['date', 'close'],
    );

    expect(result.rows).toHaveLength(1);
    expect(result.skipped).toEqual([]);
  });

  it('số dòng trong lời báo lỗi đếm theo đúng dòng trên lưới', () => {
    const result = parseCells(
      [
        ['15/07/2026', '25,4'],
        ['16/07/2026', 'n/a'],
        ['17/07/2026', '25,3'],
      ],
      ['date', 'close'],
    );

    expect(result.skipped.map((row) => row.line)).toEqual([2]);
  });

  it('vẫn lật chuỗi xếp phiên mới trước — cơ chế chặn số sai chạy cho cả lối gõ tay', () => {
    const result = parseCells(
      [
        ['17/07/2026', '25,3'],
        ['16/07/2026', '25,7'],
        ['15/07/2026', '25,4'],
      ],
      ['date', 'close'],
    );

    expect(result.reordered).toBe(true);
    expect(closeSeries(result)).toEqual([25.4, 25.7, 25.3]);
  });

  it('vẫn quyết quy ước số theo CẢ lưới, và nói ra khi phải đoán', () => {
    const cells = [
      ['15/07/2026', '25,100'],
      ['16/07/2026', '25,400'],
    ];

    const guessed = parseCells(cells, ['date', 'close']);
    expect(guessed.numberStyle).toBe('en');
    expect(guessed.numberStyleGuessed).toBe(true);
    expect(closeSeries(guessed)).toEqual([25100, 25400]);

    // Người dùng chốt lại thì đọc theo họ, và không hỏi nữa.
    const chosen = parseCells(cells, ['date', 'close'], 'vi');
    expect(chosen.numberStyleGuessed).toBe(false);
    expect(closeSeries(chosen)).toEqual([25.1, 25.4]);
  });

  it('không có cột ngày thì nói thẳng là không biết thứ tự', () => {
    expect(parseCells([['25,4'], ['25,7']], ['close']).order).toBe('unknown');
  });

  it('lưới rỗng cho kết quả rỗng, không ném lỗi', () => {
    const result = parseCells([['', '']], ['date', 'close']);

    expect(result.rows).toEqual([]);
    expect(result.skipped).toEqual([]);
  });
});

/*
 * Bộ đoán tiêu đề phải nhận ra CHÍNH nhãn cột sản phẩm in ra.
 *
 * Ngày 22/09/2026 nó không nhận: nhãn đổi sang viết đủ chữ ("Giá cao nhất") mà từ vựng vẫn chỉ
 * có "cao nhat", nên nạp lại đúng bảng mình vừa xuất thì hai cột Cao và Thấp rơi vào "Không
 * dùng" mà không báo gì. Ca kiểm này quét cả sáu nhãn, nên nhãn nào đổi sau này cũng bị bắt.
 */
describe('guessColumns() — nhãn cột của chính sản phẩm', () => {
  it('mọi nhãn trong COLUMN_LABELS đều được nhận lại đúng vai trò', () => {
    const kinds: ReadonlyArray<ColumnKind> = ['date', 'open', 'high', 'low', 'close', 'volume'];
    const header = kinds.map((kind) => COLUMN_LABELS[kind]).join('\t');

    expect(splitPasteTable(`${header}\n15/07/2026\t1\t2\t0,5\t1,5\t1000`).columns).toEqual(kinds);
  });
});
