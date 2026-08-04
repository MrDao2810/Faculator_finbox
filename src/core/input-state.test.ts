import { describe, expect, it } from 'vitest';

import {
  STATE_PRIORITY,
  commitValue,
  isLockedForMode,
  isOutOfRange,
  outOfRangeNote,
  resolveInputState,
  type InputStateArgs,
} from './input-state';
import type { VariableSpec } from './types';

/** Biến cơ bản, đúng ô 'Giá thị trường' của WF-03. */
const price: VariableSpec = {
  key: 'price',
  label: 'Giá thị trường',
  unit: '₫',
  type: 'number',
  defaultValue: 92_000,
  min: 0,
  max: 1_000_000,
  level: 'basic',
};

/** Biến nâng cao, đúng ô 'Tăng trưởng g' của WF-16 (min 0 · step 0,1 · max 12). */
const growth: VariableSpec = {
  key: 'g',
  label: 'Tăng trưởng g',
  unit: '%',
  type: 'slider',
  defaultValue: 4,
  min: 0,
  max: 12,
  step: 0.1,
  level: 'advanced',
};

function state(patch: Partial<InputStateArgs> = {}) {
  return resolveInputState({
    raw: '92.000',
    spec: price,
    focused: false,
    mode: 'basic',
    ...patch,
  });
}

describe('năm trạng thái của WF-16', () => {
  it('1 — mặc định: có giá trị, không thao tác', () => {
    const result = state();
    expect(result.state).toBe('default');
    expect(result.note).toBeUndefined();
    expect(result.value).toBe(92_000);
  });

  it('2 — đang nhập: con trỏ đang ở trong ô', () => {
    expect(state({ focused: true }).state).toBe('editing');
  });

  it('3 — tự động từ công thức khác, kèm dòng “↳ CAPM”', () => {
    const result = state({ raw: '14,3', derivedFrom: 'CAPM' });
    expect(result.state).toBe('derived');
    expect(result.note).toBe('↳ CAPM');
    expect(result.value).toBe(14.3);
  });

  it('4 — ngoài miền hợp lệ, kèm dòng “! min 0”', () => {
    const result = state({ raw: '−4' });
    expect(result.state).toBe('outOfRange');
    expect(result.note).toBe('! min 0');
    // Giữ nguyên thứ người dùng gõ, KHÔNG tự sửa thành 0.
    expect(result.value).toBe(-4);
  });

  it('5 — khoá khi biến nâng cao gặp chế độ Cơ bản, kèm nhãn “nâng cao”', () => {
    const result = state({ raw: '4,0', spec: growth, mode: 'basic' });
    expect(result.state).toBe('locked');
    expect(result.note).toBe('nâng cao');
  });

  it('bảng ưu tiên liệt kê đúng năm trạng thái, không thừa không thiếu', () => {
    expect(STATE_PRIORITY).toHaveLength(5);
    expect(new Set(STATE_PRIORITY).size).toBe(5);
  });
});

describe('thứ tự ưu tiên khi nhiều trạng thái cùng đúng', () => {
  it('khoá thắng đang nhập — ô khoá thì không gõ được', () => {
    expect(state({ spec: growth, mode: 'basic', focused: true }).state).toBe('locked');
  });

  it('khoá thắng ngoài miền', () => {
    expect(state({ spec: growth, mode: 'basic', raw: '99' }).state).toBe('locked');
  });

  it('khoá thắng cả giá trị tự động', () => {
    expect(state({ spec: growth, mode: 'basic', derivedFrom: 'CAPM' }).state).toBe('locked');
  });

  it('ngoài miền thắng đang nhập — đang gõ vẫn phải thấy nhắc miền ngay', () => {
    const result = state({ raw: '−4', focused: true });
    expect(result.state).toBe('outOfRange');
    expect(result.note).toBe('! min 0');
  });

  it('ngoài miền thắng giá trị tự động — báo miền cụ thể hữu ích hơn là chỉ ghi nguồn', () => {
    expect(state({ raw: '−4', derivedFrom: 'CAPM' }).state).toBe('outOfRange');
  });

  it('giá trị tự động thắng đang nhập', () => {
    expect(state({ derivedFrom: 'CAPM', focused: true }).state).toBe('derived');
  });

  it('biến nâng cao ở chế độ Nâng cao thì KHÔNG khoá', () => {
    expect(state({ spec: growth, mode: 'advanced', raw: '4' }).state).toBe('default');
  });

  it('biến cơ bản không bao giờ bị khoá, kể cả ở chế độ Cơ bản', () => {
    expect(isLockedForMode(price, 'basic')).toBe(false);
    expect(isLockedForMode(price, 'advanced')).toBe(false);
  });
});

describe('ô trống', () => {
  it('chưa nhập gì thì không tính là ngoài miền — đó là việc của INCOMPLETE_INPUT', () => {
    const result = state({ raw: '' });
    expect(result.state).toBe('default');
    expect(result.value).toBeNull();
  });

  it('đang gõ trong ô trống thì là trạng thái đang nhập', () => {
    expect(state({ raw: '', focused: true }).state).toBe('editing');
  });

  it('nguồn tự động rỗng thì coi như nhập tay, không hiện mũi tên trống', () => {
    expect(state({ derivedFrom: '' }).state).toBe('default');
    expect(state({ derivedFrom: '   ' }).state).toBe('default');
  });
});

describe('isOutOfRange()', () => {
  it('bắt cả hai đầu miền', () => {
    expect(isOutOfRange(-1, price)).toBe(true);
    expect(isOutOfRange(1_000_001, price)).toBe(true);
  });

  it('đúng biên thì hợp lệ, không phải ngoài miền', () => {
    expect(isOutOfRange(0, price)).toBe(false);
    expect(isOutOfRange(1_000_000, price)).toBe(false);
  });

  it('chưa nhập thì không phải ngoài miền', () => {
    expect(isOutOfRange(null, price)).toBe(false);
  });

  it('biến không khai báo miền thì nhận mọi số', () => {
    const free: VariableSpec = { ...price, min: undefined, max: undefined };
    expect(isOutOfRange(-999_999, free)).toBe(false);
  });
});

describe('outOfRangeNote()', () => {
  it('nhắc đúng đầu bị vượt', () => {
    expect(outOfRangeNote(-4, price)).toBe('! min 0');
    expect(outOfRangeNote(13, growth)).toBe('! max 12');
  });

  it('số trong miền thì không có dòng nhắc', () => {
    expect(outOfRangeNote(500, price)).toBeUndefined();
  });

  it('định dạng số của dòng nhắc theo quy ước Việt Nam', () => {
    expect(outOfRangeNote(2_000_000, price)).toBe('! max 1.000.000');
  });
});

describe('commitValue() — chốt giá trị khi rời ô', () => {
  it('kẹp về miền hợp lệ, đây là chỗ DUY NHẤT được kẹp', () => {
    expect(commitValue('−4', price)).toBe(0);
    expect(commitValue('2.000.000', price)).toBe(1_000_000);
  });

  it('số hợp lệ thì giữ nguyên', () => {
    expect(commitValue('92.000', price)).toBe(92_000);
  });

  it('bỏ trống thì rơi về defaultValue chứ không phải 0 hay NaN (FR-06)', () => {
    expect(commitValue('', price)).toBe(92_000);
    expect(commitValue('   ', price)).toBe(92_000);
  });

  it('gõ rác cũng rơi về defaultValue, không bao giờ ra NaN', () => {
    const value = commitValue('abc', price);
    expect(value).toBe(92_000);
    expect(Number.isNaN(value)).toBe(false);
  });

  it('số 0 là số hợp lệ, không bị nhầm thành chưa nhập', () => {
    expect(commitValue('0', price)).toBe(0);
  });
});
