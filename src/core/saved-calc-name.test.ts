import { describe, expect, it } from 'vitest';

import { MAX_SAVED_NAME, displayCalcName, suggestCalcNames } from './saved-calc-name';

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

/*
 * Chủ dự án gửi ảnh tab "Formulas" ở chế độ EN: dòng phụ đã là "AAA · True break-even price" mà
 * tên ngay trên vẫn "AAA · Giá hoà vốn thực". Nguyên nhân: tên là chuỗi ĐÃ GHÉP, cất vào
 * localStorage ở ngôn ngữ lúc bấm Lưu. Bộ ca dưới đây chốt cách gỡ — xem docblock của hàm.
 */
describe('displayCalcName', () => {
  const CHUNG = {
    viName: 'Giá hoà vốn thực',
    localName: 'True break-even price',
    savedAt: SAVED_AT,
  };

  it('tên vốn là GỢI Ý thì dựng lại ở ngôn ngữ đang xem', () => {
    expect(displayCalcName({ ...CHUNG, stored: 'AAA · Giá hoà vốn thực', code: 'AAA' })).toBe(
      'AAA · True break-even price',
    );
  });

  it('gợi ý dạng ngày (không có mã) cũng dịch được', () => {
    expect(displayCalcName({ ...CHUNG, stored: 'Giá hoà vốn thực · 25/08/2026' })).toBe(
      'True break-even price · 25/08/2026',
    );
  });

  /*
   * Gợi ý số 2 ghép KẾT QUẢ, mà chuỗi kết quả cũng đổi theo ngôn ngữ (đơn vị). Nhận ra bằng bản
   * tiếng Việt, dựng lại bằng bản đang xem — hai vế phải đi thành cặp, thiếu một là trượt.
   */
  it('gợi ý ghép kết quả: nhận ra bằng bản vi, dựng lại bằng bản đang xem', () => {
    expect(
      displayCalcName({
        ...CHUNG,
        stored: 'Giá hoà vốn thực · 92.370,28 ₫',
        viResult: '92.370,28 ₫',
        localResult: '92.370,28 ₫',
      }),
    ).toBe('True break-even price · 92.370,28 ₫');
  });

  /*
   * Đây là nửa quan trọng hơn của hàm: tên NGƯỜI DÙNG TỰ GÕ là dữ liệu của họ, không phải chữ
   * giao diện. Đổi ngôn ngữ mà nó bị viết lại thì đó mới là lỗi thật.
   */
  it('tên tự gõ giữ nguyên từng chữ', () => {
    expect(displayCalcName({ ...CHUNG, stored: 'Mua đợt 2 nếu về vùng này' })).toBe(
      'Mua đợt 2 nếu về vùng này',
    );
  });

  /*
   * Hậu tố né trùng ' (2)' do `dedupe()` gắn SAU khi ghép nên nó không có trong bộ gợi ý gốc.
   * Không tách ra trước khi so thì mọi mục trùng tên đều trượt và ở lại tiếng Việt.
   */
  it('tách hậu tố né trùng trước khi so, rồi gắn lại', () => {
    expect(displayCalcName({ ...CHUNG, stored: 'AAA · Giá hoà vốn thực (2)', code: 'AAA' })).toBe(
      'AAA · True break-even price (2)',
    );
  });

  it('đang ở tiếng Việt thì trả lại đúng chuỗi cũ, không đụng gì', () => {
    const stored = 'AAA · Giá hoà vốn thực';
    expect(
      displayCalcName({
        stored,
        viName: 'Giá hoà vốn thực',
        localName: 'Giá hoà vốn thực',
        code: 'AAA',
        savedAt: SAVED_AT,
      }),
    ).toBe(stored);
  });

  it('tên rỗng không làm hàm ném lỗi', () => {
    expect(displayCalcName({ ...CHUNG, stored: '' })).toBe('');
  });
});
