import { describe, expect, it } from 'vitest';

import { fail, ok } from '../calc-output';
import { FORMULA_MODULES } from '../formulas';
import type { FormulaSpec } from '../registry/types';
import { divideByZero } from '../warnings';
import { missingInputLabels, needsPriceSeries, runFormula } from './run';
import { formatFailures, runAllSpecTests, runSpecTests } from './run-tests';
import type { CalcContext, FormulaModule } from './types';

const CTX: CalcContext = { asOf: '2026-08-04' };

/** Công thức tối giản để soi chính bộ máy, không phải soi toán tài chính. */
const SPEC: FormulaSpec = {
  id: 'chia',
  categoryId: 'fundamentals',
  name: { vi: 'Phép chia', en: 'Divide' },
  description: 'Lấy tử chia mẫu.',
  latex: 'a / b',
  chartType: 'none',
  level: 'basic',
  tags: ['chia'],
  resultUnit: 'lần',
  variables: [
    { key: 'a', label: 'Tử số', unit: '', type: 'number', defaultValue: 10, level: 'basic' },
    { key: 'b', label: 'Mẫu số', unit: '', type: 'number', defaultValue: 2, level: 'basic' },
  ],
  explanation: { meaning: 'a', whenToUse: 'b', howToRead: 'c', commonMistakes: 'd' },
  example: { title: 'x', inputs: { a: 10, b: 2 }, expected: 5 },
  tests: [
    { name: 'ca thường', inputs: { a: 10, b: 2 }, expected: 5 },
    {
      name: 'chia cho 0',
      inputs: { a: 10, b: 0 },
      expected: null,
      expectedWarning: 'DIVIDE_BY_ZERO',
    },
  ],
  source: [{ label: 'Sách giáo khoa' }],
};

const CHIA: FormulaModule = {
  spec: SPEC,
  calc: (v) => {
    const b = v('b');
    if (b === 0) return fail('lần', divideByZero('phép chia', 'Mẫu số'));
    return ok(v('a') / b, 'lần');
  },
};

describe('missingInputLabels()', () => {
  it('thiếu key thì báo đúng nhãn tiếng Việt của ô', () => {
    expect(missingInputLabels(SPEC, { a: 10 })).toEqual(['Mẫu số']);
  });

  it('có key nhưng giá trị không hữu hạn cũng tính là chưa nhập', () => {
    expect(missingInputLabels(SPEC, { a: Number.NaN, b: 2 })).toEqual(['Tử số']);
    expect(missingInputLabels(SPEC, { a: Number.POSITIVE_INFINITY, b: 2 })).toEqual(['Tử số']);
  });

  it('đủ hết thì không báo gì', () => {
    expect(missingInputLabels(SPEC, { a: 10, b: 2 })).toEqual([]);
  });

  it('số 0 là giá trị hợp lệ, không phải ô trống', () => {
    expect(missingInputLabels(SPEC, { a: 0, b: 0 })).toEqual([]);
  });
});

describe('runFormula()', () => {
  it('tính đúng khi đủ đầu vào', () => {
    expect(runFormula(CHIA, { a: 10, b: 2 }, CTX)).toMatchObject({ value: 5, unit: 'lần' });
  });

  it('ô để trống thì báo “Chưa nhập đủ” kèm tên ô, KHÔNG thay bằng 0 (NFR-REL-01)', () => {
    const out = runFormula(CHIA, { a: 10 }, CTX);

    expect(out.value).toBeNull();
    expect(out.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(out.warning?.message).toContain('Mẫu số');
  });

  it('ô trống KHÔNG rơi về defaultValue — mặc định chỉ là giá trị khởi tạo của giao diện', () => {
    // Mẫu số mặc định là 2; nếu bộ máy tự điền thì kết quả sẽ ra 5 thay vì báo thiếu.
    expect(runFormula(CHIA, { a: 10 }, CTX).value).toBeNull();
  });

  it('giữ nguyên cảnh báo do chính công thức phát ra', () => {
    const out = runFormula(CHIA, { a: 10, b: 0 }, CTX);

    expect(out.value).toBeNull();
    expect(out.warning?.code).toBe('DIVIDE_BY_ZERO');
  });

  it('hàm tính ném lỗi thì bắt lại thành cảnh báo, không cho ngoại lệ lên giao diện', () => {
    const noi: FormulaModule = {
      spec: SPEC,
      calc: () => {
        throw new Error('vỡ');
      },
    };

    const out = runFormula(noi, { a: 1, b: 1 }, CTX);

    expect(out.value).toBeNull();
    expect(out.warning?.code).toBe('MEANINGLESS');
    expect(out.unit).toBe('lần');
  });

  it('hàm tính hỏi biến không khai trong spec thì ra cảnh báo chứ không ra số bịa', () => {
    const lac: FormulaModule = { spec: SPEC, calc: (v) => ok(v('khong-co'), 'lần') };

    expect(runFormula(lac, { a: 1, b: 1 }, CTX).value).toBeNull();
  });

  it('kết quả không hữu hạn bị ok() chặn lại — lưới an toàn FR-06 vẫn nguyên', () => {
    const tran: FormulaModule = { spec: SPEC, calc: (v) => ok(v('a') / v('b'), 'lần') };

    expect(runFormula(tran, { a: 1, b: 0 }, CTX).value).toBeNull();
  });
});

describe('needsPriceSeries()', () => {
  const canChuoi = () => FORMULA_MODULES.filter((m) => needsPriceSeries(m, CTX.asOf));

  it('công thức vô hướng thì không cần chuỗi giá', () => {
    expect(needsPriceSeries(CHIA, CTX.asOf)).toBe(false);
  });

  it('đúng 34 công thức ăn chuỗi giá — thêm bớt là có người vừa đổi hợp đồng dữ liệu', () => {
    expect(canChuoi()).toHaveLength(34);
  });

  /*
   * Ca này chốt lại đúng cái bug đợt này sửa, bằng số.
   *
   * Màn chi tiết từng lấy `chartType === 'candlestick'` làm cờ "cần chuỗi giá". Nến chỉ là 11
   * trong 34 — 23 công thức còn lại gặp lỗi "chưa đủ phiên giá" mà trên màn không có nút nào để
   * nạp. Nếu ai đó lại đi đường `chartType`, con số 23 dưới đây sẽ nói ngay vì sao không được.
   */
  it('nến chỉ là 11 trong 34 — lấy chartType làm cờ dữ liệu bỏ sót 23 công thức', () => {
    const nen = canChuoi().filter((m) => m.spec.chartType === 'candlestick');

    expect(nen).toHaveLength(11);
    expect(canChuoi().length - nen.length).toBe(23);
  });

  it('trọn bốn loại biểu đồ dựa trên chuỗi đều cần chuỗi, không loại nào lọt', () => {
    const dungChuoi: ReadonlyArray<string> = ['candlestick', 'histogram', 'underwater', 'scatter'];

    for (const formula of FORMULA_MODULES) {
      if (!dungChuoi.includes(formula.spec.chartType)) continue;
      expect(needsPriceSeries(formula, CTX.asOf), formula.spec.id).toBe(true);
    }
  });

  it('chỉ nhóm Rủi ro và Kỹ thuật mới ăn chuỗi', () => {
    for (const formula of canChuoi()) {
      expect(['risk', 'technical'], formula.spec.id).toContain(formula.spec.categoryId);
    }
  });
});

describe('runSpecTests() — làm cho NFR-MNT-02 chạy thật', () => {
  it('công thức đúng thì không có ca nào hỏng', () => {
    expect(runSpecTests(CHIA, CTX)).toEqual([]);
  });

  it('bắt được kết quả sai số', () => {
    // Cố ý chỉ phá ca thường, để ca chia-cho-0 vẫn đạt và danh sách hỏng chỉ có đúng một mục.
    const sai: FormulaModule = {
      ...CHIA,
      calc: (v) =>
        v('b') === 0
          ? fail('lần', divideByZero('phép chia', 'Mẫu số'))
          : ok(v('a') / v('b') + 1, 'lần'),
    };
    const failures = runSpecTests(sai, CTX);

    expect(failures).toHaveLength(1);
    expect(failures[0]?.testName).toBe('ca thường');
    expect(failures[0]?.reason).toContain('mong đợi 5');
  });

  it('bắt được ca lẽ ra phải lỗi mà lại ra số — đây là chỗ FR-06 thủng', () => {
    const lo: FormulaModule = { ...CHIA, calc: (v) => ok(v('a') / (v('b') || 1), 'lần') };
    const failures = runSpecTests(lo, CTX);

    expect(failures).toHaveLength(1);
    expect(failures[0]?.testName).toBe('chia cho 0');
    expect(failures[0]?.reason).toContain('lại ra');
  });

  it('bắt được ca ra đúng lỗi nhưng sai mã cảnh báo', () => {
    const nham: FormulaModule = {
      ...CHIA,
      calc: (v) =>
        v('b') === 0
          ? fail('lần', { code: 'MEANINGLESS', message: 'lý do khác' })
          : ok(v('a') / v('b'), 'lần'),
    };
    const failures = runSpecTests(nham, CTX);

    expect(failures).toHaveLength(1);
    expect(failures[0]?.reason).toContain('DIVIDE_BY_ZERO');
  });

  it('tôn trọng sai số riêng của từng ca', () => {
    const lech: FormulaSpec = {
      ...SPEC,
      tests: [{ name: 'nới sai số', inputs: { a: 10, b: 3 }, expected: 3.3, tolerance: 0.05 }],
    };

    expect(runSpecTests({ ...CHIA, spec: lech }, CTX)).toEqual([]);
  });

  it('gộp được ca hỏng của nhiều công thức và in ra đọc được', () => {
    const sai: FormulaModule = { ...CHIA, calc: () => ok(0, 'lần') };
    const text = formatFailures(runAllSpecTests([CHIA, sai], CTX));

    expect(text).toContain('chia · ca thường');
  });
});
