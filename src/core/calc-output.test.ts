import { describe, expect, it } from 'vitest';

import { clampToSpec, fail, inherited, isCalculated, ok, snapToStep } from './calc-output';
import type { VariableSpec } from './types';

const priceSpec: VariableSpec = {
  key: 'price',
  label: 'Giá thị trường',
  unit: '₫',
  type: 'number',
  defaultValue: 0,
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

  it('gợi ý sửa chỉ ra cả hai lối đi khi biết tên biến tại chỗ (WF-15)', () => {
    const out = inherited('%', 'Beta', 'WACC');
    expect(out.warning?.fix).toContain('Beta');
    expect(out.warning?.fix).toContain('WACC');
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

  it('không bao giờ trả về NaN — rơi về giá trị mặc định', () => {
    expect(clampToSpec(Number.NaN, priceSpec)).toBe(priceSpec.defaultValue);
  });

  it('biến không khai báo min/max thì giữ nguyên mọi số hữu hạn', () => {
    const free: VariableSpec = {
      key: 'g',
      label: 'Tăng trưởng',
      unit: '%',
      type: 'number',
      defaultValue: 0,
      level: 'advanced',
    };
    expect(clampToSpec(-12.5, free)).toBe(-12.5);
  });
});

describe('snapToStep()', () => {
  it('làm tròn về bội của step', () => {
    expect(snapToStep(92_040, priceSpec)).toBe(92_000);
    expect(snapToStep(92_060, priceSpec)).toBe(92_100);
  });

  it('không sinh rác dấu phẩy động với step lẻ', () => {
    const rate: VariableSpec = {
      key: 'r',
      label: 'Lãi suất',
      unit: '%',
      type: 'slider',
      defaultValue: 6,
      min: 0,
      max: 20,
      step: 0.1,
      level: 'basic',
    };
    expect(snapToStep(6.24, rate)).toBe(6.2);
    expect(snapToStep(0.3, rate)).toBe(0.3);
  });

  it('biến không có step thì giữ nguyên', () => {
    const free: VariableSpec = {
      key: 'eps',
      label: 'EPS',
      unit: '₫',
      type: 'number',
      defaultValue: 0,
      level: 'basic',
    };
    expect(snapToStep(4_321.5, free)).toBe(4_321.5);
  });

  it('không bao giờ đẩy giá trị ra ngoài miền hợp lệ', () => {
    expect(snapToStep(999_999, priceSpec)).toBeLessThanOrEqual(1_000_000);
    expect(snapToStep(-1, priceSpec)).toBe(0);
  });
});

describe('isCalculated()', () => {
  it('phân biệt được kết quả có số và kết quả lỗi', () => {
    expect(isCalculated(ok(1, 'lần'))).toBe(true);
    expect(isCalculated(inherited('lần', 'WACC'))).toBe(false);
  });
});
