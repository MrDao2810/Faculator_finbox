import { describe, expect, it } from 'vitest';

import { MAX_SAVED_NAME, suggestCalcNames } from './saved-calc-name';

/** 25/08/2026 lúc 10 giờ sáng giờ địa phương — đủ xa nửa đêm để không lệch ngày vì múi giờ. */
const SAVED_AT = new Date(2026, 7, 25, 10, 0, 0).getTime();

describe('suggestCalcNames', () => {
  it('có mã thì gợi ý đầu tiên là mã ghép tên công thức', () => {
    const names = suggestCalcNames({
      formulaName: 'P/E',
      code: 'HPG',
      resultText: '12,3 lần',
      savedAt: SAVED_AT,
    });

    expect(names[0]).toBe('HPG · P/E');
    expect(names[1]).toBe('P/E · 12,3 lần');
    expect(names[2]).toBe('P/E · 25/08/2026');
  });

  it('không có mã thì gợi ý đầu tiên lùi về dạng ngày, không để trống', () => {
    const names = suggestCalcNames({
      formulaName: 'P/E',
      resultText: '12,3 lần',
      savedAt: SAVED_AT,
    });

    expect(names[0]).toBe('P/E · 25/08/2026');
    expect(names[1]).toBe('P/E · 12,3 lần');
    // Gợi ý thứ ba trùng gợi ý đầu nên bị bỏ chứ không lặp lại.
    expect(names).toHaveLength(2);
  });

  it('viết hoa mã người dùng gõ thường', () => {
    const names = suggestCalcNames({ formulaName: 'ROE', code: 'fpt', savedAt: SAVED_AT });
    expect(names[0]).toBe('FPT · ROE');
  });

  it('chưa tính được kết quả thì bỏ hẳn gợi ý theo kết quả', () => {
    const names = suggestCalcNames({ formulaName: 'P/E', code: 'HPG', savedAt: SAVED_AT });
    expect(names).toEqual(['HPG · P/E', 'P/E · 25/08/2026']);
  });

  it('né tên đã có bằng hậu tố (2)', () => {
    const names = suggestCalcNames({
      formulaName: 'P/E',
      code: 'HPG',
      savedAt: SAVED_AT,
      existing: ['HPG · P/E'],
    });

    expect(names[0]).toBe('HPG · P/E (2)');
  });

  it('so trùng không phân biệt hoa thường và khoảng trắng thừa', () => {
    const names = suggestCalcNames({
      formulaName: 'P/E',
      code: 'HPG',
      savedAt: SAVED_AT,
      existing: ['  hpg  ·  p/e '],
    });

    expect(names[0]).toBe('HPG · P/E (2)');
  });

  it('đếm tiếp khi cả hậu tố (2) cũng đã có', () => {
    const names = suggestCalcNames({
      formulaName: 'P/E',
      code: 'HPG',
      savedAt: SAVED_AT,
      existing: ['HPG · P/E', 'HPG · P/E (2)'],
    });

    expect(names[0]).toBe('HPG · P/E (3)');
  });

  it('không gợi ý nào vượt trần độ dài, kể cả khi đã né trùng', () => {
    const long = 'Giá trị nội tại theo dòng tiền tự do của doanh nghiệp có chiết khấu';
    const first = suggestCalcNames({ formulaName: long, code: 'VIC', savedAt: SAVED_AT })[0] ?? '';
    const deduped =
      suggestCalcNames({
        formulaName: long,
        code: 'VIC',
        savedAt: SAVED_AT,
        existing: [first],
      })[0] ?? '';

    expect(first.length).toBeLessThanOrEqual(MAX_SAVED_NAME);
    expect(deduped.length).toBeLessThanOrEqual(MAX_SAVED_NAME);
    // Hậu tố phải sống sót qua việc cắt — mất nó là mất đúng thứ phân biệt hai mục.
    expect(deduped.endsWith(' (2)')).toBe(true);
  });

  it('thiếu cả tên công thức lẫn mã vẫn ra một cái tên dùng được', () => {
    const names = suggestCalcNames({ formulaName: '   ', savedAt: SAVED_AT });
    expect(names).toEqual(['25/08/2026']);
  });

  it('mốc thời gian hỏng thì không sinh tên rỗng', () => {
    const names = suggestCalcNames({ formulaName: 'P/E', savedAt: Number.NaN });
    expect(names).toEqual(['P/E']);
    expect(names.every((name) => name.trim() !== '')).toBe(true);
  });
});
