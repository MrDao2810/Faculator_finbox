import { describe, expect, it } from 'vitest';

import { fail, ok } from './calc-output';
import {
  COMPACT_PREFIXES,
  NO_VALUE,
  UNIT_SCALES,
  findUnitScale,
  formatCalcOutput,
  formatNumber,
  formatValueWithUnit,
  parseViNumber,
  rawViNumber,
  scaleToDong,
  scaleToUnit,
  withScalePrefix,
} from './format';
import { divideByZero } from './warnings';

describe('formatNumber()', () => {
  it('ngăn nghìn bằng dấu chấm theo quy ước Việt Nam', () => {
    expect(formatNumber(92_000)).toBe('92.000');
    expect(formatNumber(1_234_567)).toBe('1.234.567');
  });

  it('thập phân bằng dấu phẩy', () => {
    expect(formatNumber(15.21)).toBe('15,21');
    expect(formatNumber(14.3)).toBe('14,3');
  });

  it('cắt về tối đa 2 chữ số thập phân theo mặc định', () => {
    expect(formatNumber(15.2149)).toBe('15,21');
  });

  it('giữ đủ số chữ số khi được yêu cầu', () => {
    expect(formatNumber(4, { minDecimals: 1 })).toBe('4,0');
    expect(formatNumber(0.27, { maxDecimals: 4 })).toBe('0,27');
  });

  it('thêm dấu + cho số dương khi bật signed — cột ROI ròng của WF-08', () => {
    expect(formatNumber(5.01, { signed: true })).toBe('+5,01');
    expect(formatNumber(-5.01, { signed: true })).toBe('-5,01');
    // Số 0 không phải tăng cũng không phải giảm nên không gắn dấu.
    expect(formatNumber(0, { signed: true })).toBe('0');
  });

  it('không bao giờ để lọt NaN hay Infinity ra chuỗi (FR-06)', () => {
    expect(formatNumber(Number.NaN)).toBe(NO_VALUE);
    expect(formatNumber(Number.POSITIVE_INFINITY)).toBe(NO_VALUE);
    expect(formatNumber(Number.NEGATIVE_INFINITY)).toBe(NO_VALUE);
  });
});

describe('formatValueWithUnit()', () => {
  it('ghép số với đơn vị', () => {
    expect(formatValueWithUnit(92_000, '₫')).toBe('92.000 ₫');
    expect(formatValueWithUnit(15.2, 'lần')).toBe('15,2 lần');
  });

  it('đơn vị rỗng thì không để lại khoảng trắng thừa', () => {
    expect(formatValueWithUnit(12, '')).toBe('12');
    expect(formatValueWithUnit(12, '   ')).toBe('12');
  });
});

describe('formatCalcOutput()', () => {
  it('tính được thì hiện số kèm đơn vị', () => {
    expect(formatCalcOutput(ok(15.21, 'lần'))).toBe('15,21 lần');
  });

  it('không tính được thì hiện đúng chuỗi “— , —” của WF-15, không phải 0', () => {
    const out = fail('lần', divideByZero({ vi: 'P/E', en: 'P/E' }, { vi: 'EPS', en: 'EPS' }));
    const text = formatCalcOutput(out);

    expect(text).toBe(`${NO_VALUE} lần`);
    expect(text).not.toContain('0');
    expect(text).not.toContain('NaN');
  });

  it('ok() chặn Infinity nên khối kết quả cũng không thể hiện Infinity', () => {
    expect(formatCalcOutput(ok(1 / 0, 'lần'))).toBe(`${NO_VALUE} lần`);
  });
});

describe('parseViNumber()', () => {
  it('đọc được số có ngăn nghìn', () => {
    expect(parseViNumber('92.000')).toBe(92_000);
    expect(parseViNumber('1.234.567')).toBe(1_234_567);
  });

  it('đọc được số viết liền', () => {
    expect(parseViNumber('92000')).toBe(92_000);
  });

  it('đọc được thập phân dấu phẩy', () => {
    expect(parseViNumber('14,3')).toBe(14.3);
    expect(parseViNumber('0,15')).toBe(0.15);
  });

  it('đọc được cả thập phân dấu chấm — người quen bàn phím số hay gõ kiểu này', () => {
    expect(parseViNumber('14.3')).toBe(14.3);
    expect(parseViNumber('1.2345')).toBe(1.2345);
  });

  it('có phẩy thì chấm là ngăn nghìn', () => {
    expect(parseViNumber('1.234,5')).toBe(1234.5);
  });

  it('đọc được số âm, kể cả dấu trừ Unicode mà wireframe dùng', () => {
    expect(parseViNumber('-4')).toBe(-4);
    expect(parseViNumber('−4')).toBe(-4);
    expect(parseViNumber('−1.200')).toBe(-1200);
  });

  it('bỏ qua khoảng trắng thừa hai đầu', () => {
    expect(parseViNumber('  92.000  ')).toBe(92_000);
  });

  it('chuỗi rỗng trả null chứ không phải 0 — chưa nhập khác với nhập số 0', () => {
    expect(parseViNumber('')).toBeNull();
    expect(parseViNumber('   ')).toBeNull();
  });

  it('đang gõ dở thì trả null, không đoán bừa', () => {
    expect(parseViNumber('-')).toBeNull();
    expect(parseViNumber('−')).toBeNull();
  });

  it('chuỗi rác trả null chứ TUYỆT ĐỐI không trả NaN (FR-06)', () => {
    for (const rac of ['abc', '12abc', '1,2,3', '--5', '1..2', '₫']) {
      expect(parseViNumber(rac), `chuỗi '${rac}'`).toBeNull();
    }
  });

  it('số 0 vẫn là số hợp lệ, không bị nhầm thành “chưa nhập”', () => {
    expect(parseViNumber('0')).toBe(0);
    expect(parseViNumber('0,0')).toBe(0);
  });

  it('đọc lại được đúng thứ formatNumber ghi ra', () => {
    for (const value of [0, 1, -4, 92_000, 1_234_567, 15.21, -0.5]) {
      expect(parseViNumber(formatNumber(value)), `giá trị ${value}`).toBe(value);
    }
  });
});

describe('rawViNumber()', () => {
  /*
   * Bất biến duy nhất đáng nhớ của hàm này. `String()` KHÔNG có tính chất ấy — '100.449' đọc
   * ngược ra 100449 vì trông y hệt một chuỗi ngăn nghìn — và đó chính là lỗi "sửa một ô, giá
   * nhân lên nghìn lần" ở màn WF-05.
   */
  it('đọc ngược lại đúng bằng chính con số đưa vào', () => {
    for (const value of [0, 1, -4, 92_000, 1_234_567, 100.449, 15.21, -0.5, 0.15, 1.2345]) {
      expect(parseViNumber(rawViNumber(value)), `giá trị ${value}`).toBe(value);
    }
  });

  it('dấu thập phân là dấu phẩy, và không có dấu ngăn nghìn', () => {
    expect(rawViNumber(100.449)).toBe('100,449');
    expect(rawViNumber(92_000)).toBe('92000');
    expect(rawViNumber(-0.5)).toBe('-0,5');
  });

  it('cắt nhiễu dấu phẩy động thay vì bày nguyên vào ô nhập', () => {
    expect(rawViNumber(100.45 - 0.001 + 0.001)).toBe('100,45');
    expect(rawViNumber(0.1 + 0.2)).toBe('0,3');
  });

  it('giá trị không hữu hạn cho ô TRỐNG, không bao giờ ra chuỗi NaN (FR-06)', () => {
    expect(rawViNumber(Number.NaN)).toBe('');
    expect(rawViNumber(Number.POSITIVE_INFINITY)).toBe('');
  });
});

describe('đổi đơn vị tiền (CON-05)', () => {
  it('có đủ ba bậc đúng thứ tự nút của WF-16', () => {
    expect(UNIT_SCALES.map((s) => s.label)).toEqual(['tỷ ₫', 'triệu ₫', '₫']);
  });

  it('quy về bậc đã chọn', () => {
    expect(scaleToUnit(92_000_000_000, 'billion')).toBe(92);
    expect(scaleToUnit(92_000_000, 'million')).toBe(92);
    expect(scaleToUnit(92_000, 'dong')).toBe(92_000);
  });

  it('đổi ngược lại về đồng để đưa vào công thức', () => {
    expect(scaleToDong(92, 'billion')).toBe(92_000_000_000);
    expect(scaleToDong(1.5, 'million')).toBe(1_500_000);
  });

  it('đổi đi rồi đổi lại thì về đúng số cũ', () => {
    expect(scaleToDong(scaleToUnit(92_000_000_000, 'billion'), 'billion')).toBe(92_000_000_000);
  });

  it('id lạ thì rơi về bậc đồng chứ không ném lỗi', () => {
    expect(findUnitScale('khong-co-that').id).toBe('dong');
  });
});

describe('rút gọn số lớn cho nhãn trên hình', () => {
  function prefixOf(factor: number) {
    const found = COMPACT_PREFIXES.find((item) => item.factor === factor);
    if (found === undefined) throw new Error(`Không có bậc ${String(factor)} — bảng đã đổi.`);
    return found.prefix;
  }

  const KHONG = prefixOf(1);
  const NGHIN = prefixOf(1_000);
  const TRIEU = prefixOf(1_000_000);
  const TY = prefixOf(1_000_000_000);

  /*
   * Thứ tự tăng dần KHÔNG phải chuyện thẩm mỹ: `pickScale()` bên `chart/build.ts` dựa vào việc bậc
   * "không chia" đứng ĐẦU để trả lời "có cần chia không" bằng đúng một phép so sánh, và dựa vào
   * phần ĐUÔI để lấy bậc lớn nhất còn đọc xuôi. Đảo bảng này là đảo cả hai chỗ đó.
   */
  it('bốn bậc xếp tăng dần, mở đầu bằng bậc "không chia"', () => {
    expect(COMPACT_PREFIXES.map((item) => item.factor)).toEqual([1, 1_000, 1_000_000, 1e9]);
    expect(KHONG).toEqual({ vi: '', en: '' });
  });

  it('ghép tiền tố vào bất kỳ đơn vị nào, không riêng tiền', () => {
    expect(withScalePrefix('₫', TY)).toEqual({ vi: 'tỷ ₫', en: 'billion ₫' });
    expect(withScalePrefix('₫/tháng', TRIEU)?.vi).toBe('triệu ₫/tháng');
    expect(withScalePrefix('sản phẩm', NGHIN)?.vi).toBe('nghìn sản phẩm');
    expect(withScalePrefix('CP', TRIEU)?.vi).toBe('triệu CP');
  });

  it('bậc "không chia" trả nguyên đơn vị; đơn vị rỗng không để lại khoảng trắng thừa', () => {
    expect(withScalePrefix('lần', KHONG)).toEqual({ vi: 'lần', en: 'lần' });
    expect(withScalePrefix('', KHONG)).toEqual({ vi: '', en: '' });
    expect(withScalePrefix('', TRIEU)).toEqual({ vi: 'triệu', en: 'million' });
  });

  /*
   * Cửa chặn quan trọng nhất của hàm này, và nó có từ một lỗi ĐO ĐƯỢC chứ không phải giả định: bốn
   * công thức khai `resultUnit: 'tỷ ₫'`, biến `shares` khai `'triệu CP'`, nên ghép mù cho ra
   * `'Vốn hoá thị trường (tỷ tỷ ₫)'`. 'nghìn tỷ' là hợp từ DUY NHẤT có thật trong nhóm này.
   */
  it('đơn vị đã mang sẵn bậc: chỉ nhận thêm "nghìn", và chỉ khi bậc sẵn có là "tỷ"', () => {
    expect(withScalePrefix('tỷ ₫', NGHIN)?.vi).toBe('nghìn tỷ ₫');

    expect(withScalePrefix('tỷ ₫', TRIEU)).toBeNull();
    expect(withScalePrefix('tỷ ₫', TY)).toBeNull();
    expect(withScalePrefix('triệu CP', NGHIN)).toBeNull();
    expect(withScalePrefix('nghìn ₫', NGHIN)).toBeNull();
  });
});
