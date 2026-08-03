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
      expect(WARNING_LABELS[code].trim()).not.toBe('');
    }
  });
});

describe('divideByZero()', () => {
  it('nói rõ mẫu số nào bằng 0 và cách sửa', () => {
    const w = divideByZero('P/E', 'EPS');
    expect(w.code).toBe('DIVIDE_BY_ZERO');
    expect(w.message).toBe('Chưa tính được P/E vì EPS bằng 0.');
    expect(w.fix).toContain('EPS');
  });

  it('cho phép ghi đè gợi ý sửa khi công thức có lối đi riêng', () => {
    expect(divideByZero('P/E', 'EPS', 'Chọn kỳ TTM.').fix).toBe('Chọn kỳ TTM.');
  });
});

describe('meaningless()', () => {
  it('giữ nguyên câu nguyên nhân do công thức cung cấp', () => {
    const w = meaningless('P/E không có ý nghĩa khi doanh nghiệp đang lỗ.');
    expect(w.code).toBe('MEANINGLESS');
    expect(w.message).toContain('đang lỗ');
  });
});

describe('missingSeries()', () => {
  it('nêu cả số phiên cần và số phiên đang có', () => {
    const w = missingSeries(60, 12);
    expect(w.code).toBe('MISSING_SERIES');
    expect(w.message).toContain('60');
    expect(w.message).toContain('12');
    expect(w.fix).toBeTruthy();
  });
});

describe('modelViolation()', () => {
  it('nêu đúng điều kiện bị vi phạm — ca g ≥ WACC của WF-15', () => {
    const w = modelViolation('g ≥ WACC', 'Giảm g xuống dưới WACC hoặc dùng mô hình hai giai đoạn.');
    expect(w.code).toBe('MODEL_VIOLATION');
    expect(w.message).toContain('g ≥ WACC');
    expect(w.fix).toContain('hai giai đoạn');
  });
});

describe('inheritedFrom()', () => {
  it('chỉ ra thượng nguồn đang lỗi', () => {
    const w = inheritedFrom('Beta');
    expect(w.code).toBe('INHERITED');
    expect(w.message).toContain('Beta');
  });

  it('mở hai lối đi khi biết tên biến tại chỗ', () => {
    const w = inheritedFrom('Beta', 'WACC');
    expect(w.fix).toContain('Beta');
    expect(w.fix).toContain('WACC');
  });
});

describe('incompleteInput()', () => {
  it('liệt kê các ô còn trống', () => {
    const w = incompleteInput(['EPS', 'Giá thị trường']);
    expect(w.code).toBe('INCOMPLETE_INPUT');
    expect(w.message).toContain('EPS');
    expect(w.message).toContain('Giá thị trường');
  });

  it('vẫn có câu dùng được khi không truyền nhãn nào', () => {
    expect(incompleteInput([]).message.trim()).not.toBe('');
    expect(incompleteInput(['   ']).message).toBe('Còn ô chưa nhập.');
  });
});
