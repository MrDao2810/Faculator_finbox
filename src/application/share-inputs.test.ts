import { describe, expect, it } from 'vitest';

import type { VariableSpec } from '@/core/types';

import { SHARE_INPUTS_PARAM, decodeShareInputs, encodeShareInputs } from './share-inputs';

/** Ba biến đủ để chạm mọi luật: có miền, không miền, và một biến để thử khoá lạ. */
const VARS: ReadonlyArray<VariableSpec> = [
  {
    key: 'principal',
    label: { vi: 'Số tiền gốc', en: 'Principal' },
    unit: '₫',
    type: 'number',
    defaultValue: 10_000_000,
    min: 0,
    max: 100_000_000,
    level: 'basic',
  },
  {
    key: 'rate',
    label: { vi: 'Lãi suất', en: 'Rate' },
    unit: '%',
    type: 'slider',
    defaultValue: 8,
    min: 0,
    max: 20,
    level: 'basic',
  },
  {
    key: 'years',
    label: { vi: 'Số năm', en: 'Years' },
    unit: 'năm',
    type: 'number',
    defaultValue: 10,
    level: 'basic',
  },
];

describe('tên tham số', () => {
  /*
   * Ghim chuỗi thật chứ không so với chính hằng số: khoá này nằm trên URL người dùng đã chia sẻ
   * đi, nên đổi nó là làm chết mọi link cũ. Ca kiểm là chỗ bắt việc đổi ấy phải cố ý.
   */
  it("là 'so', không đổi được lặng lẽ", () => {
    expect(SHARE_INPUTS_PARAM).toBe('so');
  });
});

describe('encodeShareInputs()', () => {
  it('gói đủ ba biến, theo đúng thứ tự khai báo', () => {
    expect(encodeShareInputs(VARS, { principal: 5_000_000, rate: 11, years: 7 })).toBe(
      'principal_5000000~rate_11~years_7',
    );
  });

  /* Ổn định: cùng bộ số phải luôn ra cùng chuỗi, kể cả khi object đưa vào xáo thứ tự khoá. */
  it('thứ tự khoá của object không đổi được chuỗi ra', () => {
    const a = encodeShareInputs(VARS, { years: 7, principal: 5_000_000, rate: 11 });
    const b = encodeShareInputs(VARS, { principal: 5_000_000, rate: 11, years: 7 });

    expect(a).toBe(b);
  });

  it('bỏ qua ô thiếu và ô không phải số hữu hạn — không gói NaN vào link', () => {
    expect(encodeShareInputs(VARS, { principal: 1, rate: Number.NaN })).toBe('principal_1');
    expect(encodeShareInputs(VARS, { years: Number.POSITIVE_INFINITY })).toBe('');
  });
});

describe('decodeShareInputs()', () => {
  it('đọc lại đúng bộ số vừa gói — vòng tròn khép kín', () => {
    const inputs = { principal: 5_000_000, rate: 11, years: 7 };

    expect(decodeShareInputs(VARS, encodeShareInputs(VARS, inputs))).toEqual(inputs);
  });

  it('số thập phân đi qua được', () => {
    expect(decodeShareInputs(VARS, 'rate_12.5')).toEqual({ rate: 12.5 });
  });

  /*
   * Ba luật an toàn của phần giải mã — chuỗi này đến từ URL, tức từ người lạ.
   */
  it('bỏ khoá không có trong spec — link cũ trỏ vào công thức đã đổi biến vẫn mở được', () => {
    expect(decodeShareInputs(VARS, 'principal_1~khoaLa_9')).toEqual({ principal: 1 });
  });

  it('bỏ giá trị không phải số hữu hạn', () => {
    expect(decodeShareInputs(VARS, 'principal_abc~rate_Infinity~years_5')).toEqual({ years: 5 });
  });

  it('KẸP về miền của biến — link không đẩy được màn ra ngoài chỗ ô nhập tự tới được', () => {
    expect(decodeShareInputs(VARS, 'rate_999')).toEqual({ rate: 20 });
    expect(decodeShareInputs(VARS, 'principal_-1000')).toEqual({ principal: 0 });
  });

  /* Chuỗi rác cho ra object rỗng chứ không ném lỗi: một ký tự thừa không được làm trắng cả trang. */
  it('chuỗi rỗng, null, undefined và chuỗi rác đều cho object rỗng', () => {
    expect(decodeShareInputs(VARS, '')).toEqual({});
    expect(decodeShareInputs(VARS, null)).toEqual({});
    expect(decodeShareInputs(VARS, undefined)).toEqual({});
    expect(decodeShareInputs(VARS, '~~_~_principal')).toEqual({});
  });

  /*
   * Chuỗi mã hoá không được chứa ký tự phải escape khi lên URL — nếu có, link dán vào ô chat sẽ
   * dài ra và xấu đi, đúng thứ lối mã hoá này sinh ra để tránh.
   */
  it('chuỗi ra đi thẳng vào URL, không cần escape', () => {
    const packed = encodeShareInputs(VARS, { principal: 5_000_000, rate: 12.5, years: 7 });

    expect(encodeURIComponent(packed)).toBe(packed);
  });
});
