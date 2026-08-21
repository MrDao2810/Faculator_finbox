import { describe, expect, it } from 'vitest';

import {
  WARNING_CODES,
  WARNING_LABELS,
  divideByZero,
  incompleteInput,
  inheritedFrom,
  meaningless,
  missingSeries,
  modelViolation,
} from './warnings';

describe('catalog cảnh báo (WF-15)', () => {
  it('có đúng sáu mã, không thừa không thiếu', () => {
    expect(WARNING_CODES).toHaveLength(6);
    expect(new Set(WARNING_CODES).size).toBe(6);
  });

  it('mã nào cũng có nhãn ngắn tiếng Việt', () => {
    for (const code of WARNING_CODES) {
      expect(WARNING_LABELS[code].vi.trim()).not.toBe('');
    }
  });
});

describe('divideByZero()', () => {
  it('nói rõ mẫu số nào bằng 0 và cách sửa', () => {
    const w = divideByZero({ vi: 'P/E', en: 'P/E' }, { vi: 'EPS', en: 'EPS' });
    expect(w.code).toBe('DIVIDE_BY_ZERO');
    expect(w.message.vi).toBe('Chưa tính được P/E vì EPS bằng 0.');
    expect(w.fix?.vi).toContain('EPS');
  });

  it('cho phép ghi đè gợi ý sửa khi công thức có lối đi riêng', () => {
    expect(
      divideByZero(
        { vi: 'P/E', en: 'P/E' },
        { vi: 'EPS', en: 'EPS' },
        { vi: 'Chọn kỳ TTM.', en: 'Choose the TTM period.' },
      ).fix?.vi,
    ).toBe('Chọn kỳ TTM.');
  });
});

describe('meaningless()', () => {
  it('giữ nguyên câu nguyên nhân do công thức cung cấp', () => {
    const w = meaningless({
      vi: 'P/E không có ý nghĩa khi doanh nghiệp đang lỗ.',
      en: 'P/E is not meaningful when the business is losing money.',
    });
    expect(w.code).toBe('MEANINGLESS');
    expect(w.message.vi).toContain('đang lỗ');
  });
});

describe('missingSeries()', () => {
  it('nêu cả số phiên cần và số phiên đang có', () => {
    const w = missingSeries(60, 12);
    expect(w.code).toBe('MISSING_SERIES');
    expect(w.message.vi).toContain('60');
    expect(w.message.vi).toContain('12');
    expect(w.fix).toBeTruthy();
  });
});

describe('modelViolation()', () => {
  it('nêu đúng điều kiện bị vi phạm — ca g ≥ WACC của WF-15', () => {
    const w = modelViolation(
      { vi: 'g ≥ WACC', en: 'g ≥ WACC' },
      {
        vi: 'Giảm g xuống dưới WACC hoặc dùng mô hình hai giai đoạn.',
        en: 'Lower g below WACC or use the two-stage model.',
      },
    );
    expect(w.code).toBe('MODEL_VIOLATION');
    expect(w.message.vi).toContain('g ≥ WACC');
    expect(w.fix?.vi).toContain('hai giai đoạn');
  });
});

describe('inheritedFrom()', () => {
  it('chỉ ra thượng nguồn đang lỗi', () => {
    const w = inheritedFrom({ vi: 'Beta', en: 'Beta' });
    expect(w.code).toBe('INHERITED');
    expect(w.message.vi).toContain('Beta');
  });

  it('mở hai lối đi khi biết tên biến tại chỗ', () => {
    const w = inheritedFrom({ vi: 'Beta', en: 'Beta' }, { vi: 'WACC', en: 'WACC' });
    expect(w.fix?.vi).toContain('Beta');
    expect(w.fix?.vi).toContain('WACC');
  });
});

describe('incompleteInput()', () => {
  it('liệt kê các ô còn trống', () => {
    const w = incompleteInput([
      { vi: 'EPS', en: 'EPS' },
      { vi: 'Giá thị trường', en: 'Market price' },
    ]);
    expect(w.code).toBe('INCOMPLETE_INPUT');
    expect(w.message.vi).toContain('EPS');
    expect(w.message.vi).toContain('Giá thị trường');
  });

  it('vẫn có câu dùng được khi không truyền nhãn nào', () => {
    expect(incompleteInput([]).message.vi.trim()).not.toBe('');
    expect(incompleteInput([{ vi: '   ', en: '   ' }]).message.vi).toBe('Còn ô chưa nhập.');
  });
});
