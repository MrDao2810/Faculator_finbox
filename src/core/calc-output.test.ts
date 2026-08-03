import { describe, expect, it } from 'vitest';

import { clampToSpec, fail, inherited, isCalculated, ok } from './calc-output';
import type { VariableSpec } from './types';

const priceSpec: VariableSpec = {
  key: 'price',
  label: 'Giá thị trường',
  unit: '₫',
  min: 0,
  max: 1_000_000,
  step: 100,
  level: 'basic',
};

describe('ok()', () => {
  it('trả về giá trị khi tính được', () => {
    const out = ok(15.2, 'lần');
    expect(out.value).toBe(15.2);
    expect(out.unit).toBe('lần');
    expect(out.warning).toBeUndefined();
  });

  it('chặn Infinity — không để lọt ra giao diện (FR-06)', () => {
    const out = ok(92_000 / 0, 'lần');
    expect(out.value).toBeNull();
    expect(out.warning?.code).toBe('MEANINGLESS');
  });

  it('chặn NaN — không để lọt ra giao diện (FR-06)', () => {
    const out = ok(0 / 0, 'lần');
    expect(out.value).toBeNull();
    expect(out.warning).toBeDefined();
  });

  it('giữ nguyên số phụ và chuỗi vẽ biểu đồ', () => {
    const out = ok(1, '₫', { extras: { total: 381_850 }, series: [{ x: 1, y: 2 }] });
    expect(out.extras?.total).toBe(381_850);
    expect(out.series).toHaveLength(1);
  });
});

describe('fail()', () => {
  it('luôn kèm lý do bằng tiếng Việt', () => {
    const out = fail('lần', {
      code: 'DIVIDE_BY_ZERO',
      message: 'Chưa tính được P/E vì EPS bằng 0.',
      fix: 'Nhập EPS khác 0 hoặc chọn kỳ khác',
    });
    expect(out.value).toBeNull();
    expect(out.warning?.message).toContain('EPS');
    expect(out.warning?.fix).toBeTruthy();
  });
});

describe('inherited()', () => {
  it('nêu đúng công thức thượng nguồn đang lỗi (FR-15)', () => {
    const out = inherited('%', 'Beta');
    expect(out.value).toBeNull();
    expect(out.warning?.code).toBe('INHERITED');
    expect(out.warning?.message).toContain('Beta');
  });
});

describe('clampToSpec()', () => {
  it('kẹp về min khi nhỏ hơn khoảng hợp lệ', () => {
    expect(clampToSpec(-4, priceSpec)).toBe(0);
  });

  it('kẹp về max khi vượt khoảng hợp lệ', () => {
    expect(clampToSpec(9_999_999, priceSpec)).toBe(1_000_000);
  });

  it('giữ nguyên giá trị hợp lệ', () => {
    expect(clampToSpec(92_000, priceSpec)).toBe(92_000);
  });

  it('không bao giờ trả về NaN', () => {
    expect(clampToSpec(Number.NaN, priceSpec)).toBe(0);
  });
});

describe('isCalculated()', () => {
  it('phân biệt được kết quả có số và kết quả lỗi', () => {
    expect(isCalculated(ok(1, 'lần'))).toBe(true);
    expect(isCalculated(inherited('lần', 'WACC'))).toBe(false);
  });
});
