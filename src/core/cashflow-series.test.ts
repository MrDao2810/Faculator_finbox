import { describe, expect, it } from 'vitest';

import { cashflowsOf, checkCashflowRow, checkCashflowSeries } from './cashflow-series';

/*
 * Ô ngày của bảng dòng tiền là ô CHỮ in ngày/tháng/năm từ 13/10/2026 (`date-text.ts`), không còn là
 * `<input type="date">` của trình duyệt. Hệ quả ở tầng này: `CashflowRow.date` có thể mang một
 * chuỗi chưa phải ngày, thứ mà ô cũ không bao giờ đưa xuống. Các ca dưới gác đúng chỗ đó.
 */

function ma(date: string, amount: number | null = -100): ReadonlyArray<string> {
  return checkCashflowRow({ date, amount }).map((issue) => issue.code);
}

describe('checkCashflowRow — ngày của một dòng tiền', () => {
  it('ngày ISO có thật thì không có vấn đề gì', () => {
    expect(ma('2026-10-03')).toEqual([]);
  });

  it('ô trống là THIẾU ngày', () => {
    expect(ma('')).toEqual(['MISSING_DATE']);
    expect(ma('   ')).toEqual(['MISSING_DATE']);
  });

  it('chuỗi gõ dở hay chưa chuẩn hoá là ngày CHƯA ĐỌC ĐƯỢC, không phải thiếu ngày', () => {
    for (const dangGo of ['03/1', '03/10/2026', '03102026', 'hôm qua']) {
      expect(ma(dangGo), dangGo).toEqual(['INVALID_DATE']);
    }
  });

  /* V8 đọc '2026-02-31' thành ngày 3 tháng 3: không chặn ở đây thì XIRR tính trên một ngày khác. */
  it('đúng dạng ISO nhưng không có trên lịch cũng bị chặn', () => {
    expect(ma('2026-02-31')).toEqual(['INVALID_DATE']);
  });

  it('câu báo chỉ cách gõ theo ngày/tháng/năm, ở cả hai ngôn ngữ', () => {
    const [issue] = checkCashflowRow({ date: '03/1', amount: -100 });
    expect(issue?.message.vi).toContain('ngày/tháng/năm');
    expect(issue?.message.en).toContain('day/month/year');
  });
});

describe('checkCashflowSeries — ngày trùng', () => {
  it('hai dòng cùng ngày: câu báo in ngày theo ngày/tháng/năm, không in khoá ISO', () => {
    const check = checkCashflowSeries([
      { date: '2026-10-03', amount: -100 },
      { date: '2026-10-03', amount: 50 },
    ]);

    const issue = check.rows[0]?.issues[0];
    expect(issue?.code).toBe('DUPLICATE_DATE');
    expect(issue?.message.vi).toContain('03/10/2026');
    expect(issue?.message.en).toContain('03/10/2026');
    expect(issue?.message.vi).not.toContain('2026-10-03');
    expect(issue?.message.en).not.toContain('2026-10-03');
  });

  it('hai ô cùng gõ dở KHÔNG bị gọi là trùng — chúng chưa phải ngày nào', () => {
    const check = checkCashflowSeries([
      { date: '03/1', amount: -100 },
      { date: '03/1', amount: 50 },
    ]);

    const codes = check.rows.flatMap((row) => row.issues.map((issue) => issue.code));
    expect(codes).toEqual(['INVALID_DATE', 'INVALID_DATE']);
  });
});

describe('cashflowsOf — dòng tiền đưa vào công thức', () => {
  it('bỏ dòng có ngày chưa đọc được, giữ dòng còn lại', () => {
    const flows = cashflowsOf([
      { date: '2026-01-05', amount: -100 },
      { date: '03/1', amount: 40 },
      { date: '2026-10-03', amount: 120 },
    ]);

    expect(flows).toEqual([
      { date: '2026-01-05', amount: -100 },
      { date: '2026-10-03', amount: 120 },
    ]);
  });
});
