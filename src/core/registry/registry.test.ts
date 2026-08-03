import { describe, expect, it } from 'vitest';

import type { VariableSpec } from '../types';
import {
  assertRegistryValid,
  countByCategory,
  createRegistry,
  defaultInputs,
  featuredFormulas,
  serializeRegistry,
  variablesForLevel,
} from './build';
import { CATEGORIES, categoriesOf, expectedCountOf, findCategory } from './categories';
import type { FormulaSpec } from './types';
import { errorsOnly, validateFormula, validateRegistry, validateVariable } from './validate';

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

/** Một công thức hợp lệ, dùng làm khuôn rồi ghi đè từng mảnh trong các ca lỗi. */
function makeFormula(patch: Partial<FormulaSpec> = {}): FormulaSpec {
  return {
    id: 'pe',
    categoryId: 'valuation',
    name: { vi: 'Tỷ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
    description: 'Cho biết nhà đầu tư trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
    latex: 'P/E = \\frac{P}{EPS}',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['pe', 'dinh gia', 'boi so'],
    resultUnit: 'lần',
    variables: [
      {
        key: 'price',
        label: 'Giá thị trường',
        unit: '₫',
        type: 'number',
        defaultValue: 92_000,
        min: 0,
        level: 'basic',
      },
      {
        key: 'eps',
        label: 'EPS',
        unit: '₫',
        type: 'number',
        defaultValue: 6_050,
        level: 'advanced',
      },
    ],
    explanation: {
      meaning: 'Số năm lợi nhuận cần có để hoàn lại giá đang mua.',
      whenToUse: 'So sánh nhanh hai doanh nghiệp cùng ngành.',
      howToRead: 'P/E càng cao thì kỳ vọng tăng trưởng càng lớn, kèm rủi ro càng lớn.',
      commonMistakes: 'So P/E giữa hai ngành khác nhau.',
    },
    example: {
      title: 'Cổ phiếu giá 92.000 ₫, EPS 6.050 ₫',
      inputs: { price: 92_000, eps: 6_050 },
      expected: 15.21,
    },
    tests: [
      { name: 'ca chuẩn', inputs: { price: 92_000, eps: 6_050 }, expected: 15.21 },
      {
        name: 'EPS bằng 0 thì không ra số',
        inputs: { price: 92_000, eps: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [{ label: 'Damodaran, Investment Valuation, chương 18' }],
    ...patch,
  };
}

describe('12 nhóm công thức (FR-01)', () => {
  it('có đúng 12 nhóm, id không trùng', () => {
    expect(CATEGORIES).toHaveLength(12);
    expect(new Set(CATEGORIES.map((c) => c.id)).size).toBe(12);
  });

  it('khớp bảng SRS 3.8: 94 chứng khoán + 13 cá nhân = 107', () => {
    expect(expectedCountOf('stock')).toBe(94);
    expect(expectedCountOf('personal')).toBe(13);
    expect(expectedCountOf('stock') + expectedCountOf('personal')).toBe(107);
  });

  it('chia đúng 7 nhóm chứng khoán và 5 nhóm cá nhân', () => {
    expect(categoriesOf('stock')).toHaveLength(7);
    expect(categoriesOf('personal')).toHaveLength(5);
  });

  it('tra được nhóm theo id và không ném lỗi với id lạ', () => {
    expect(findCategory('fees-tax')?.name).toBe('Phí & thuế thị trường VN');
    expect(findCategory('khong-co')).toBeUndefined();
  });
});

describe('validateVariable()', () => {
  const base: VariableSpec = {
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

  it('biến hợp lệ thì không có lỗi', () => {
    expect(errorsOnly(validateVariable(base, 'x'))).toHaveLength(0);
  });

  it('bắt min ≥ max', () => {
    const issues = errorsOnly(validateVariable({ ...base, min: 20, max: 20 }, 'x'));
    expect(issues.some((i) => i.message.includes('nhỏ hơn max'))).toBe(true);
  });

  it('bắt step không dương', () => {
    expect(errorsOnly(validateVariable({ ...base, step: 0 }, 'x'))).not.toHaveLength(0);
  });

  it('bắt giá trị mặc định nằm ngoài miền', () => {
    const issues = errorsOnly(validateVariable({ ...base, defaultValue: 50 }, 'x'));
    expect(issues.some((i) => i.path.endsWith('defaultValue'))).toBe(true);
  });

  it('thanh trượt thiếu mốc thì báo lỗi (WF-16)', () => {
    const issues = errorsOnly(validateVariable({ ...base, step: undefined }, 'x'));
    expect(issues.some((i) => i.message.includes('min, max và step'))).toBe(true);
  });

  it('select thiếu lựa chọn thì báo lỗi (LDR-02)', () => {
    const select: VariableSpec = {
      key: 'period',
      label: 'Kỳ',
      unit: '',
      type: 'select',
      defaultValue: 1,
      level: 'basic',
    };
    expect(errorsOnly(validateVariable(select, 'x'))).not.toHaveLength(0);
  });

  it('toggle chỉ chấp nhận đúng 2 lựa chọn', () => {
    const toggle: VariableSpec = {
      key: 'includeFee',
      label: 'Tính cả phí',
      unit: '',
      type: 'toggle',
      defaultValue: 1,
      level: 'basic',
      options: [
        { value: 0, label: 'Không' },
        { value: 1, label: 'Có' },
        { value: 2, label: 'Thừa' },
      ],
    };
    expect(errorsOnly(validateVariable(toggle, 'x'))).not.toHaveLength(0);
  });

  it('mặc định phải nằm trong danh sách lựa chọn', () => {
    const radio: VariableSpec = {
      key: 'method',
      label: 'Phương thức trả',
      unit: '',
      type: 'radio',
      defaultValue: 9,
      level: 'basic',
      options: [
        { value: 0, label: 'Niên kim' },
        { value: 1, label: 'Gốc đều' },
      ],
    };
    const issues = errorsOnly(validateVariable(radio, 'x'));
    expect(issues.some((i) => i.message.includes('danh sách lựa chọn'))).toBe(true);
  });
});

describe('validateFormula()', () => {
  it('công thức đầy đủ thì không có lỗi', () => {
    expect(errorsOnly(validateFormula(makeFormula(), CATEGORY_IDS))).toHaveLength(0);
  });

  it('bắt nhóm không tồn tại', () => {
    const issues = errorsOnly(
      validateFormula(makeFormula({ categoryId: 'khong-co' }), CATEGORY_IDS),
    );
    expect(issues.some((i) => i.path.endsWith('categoryId'))).toBe(true);
  });

  it('bắt id sai định dạng vì id đi thẳng vào URL (FR-25)', () => {
    const issues = errorsOnly(validateFormula(makeFormula({ id: 'P/E Ratio' }), CATEGORY_IDS));
    expect(issues.some((i) => i.path.endsWith('.id'))).toBe(true);
  });

  it('bắt thiếu bất kỳ mục nào trong bốn mục diễn giải (FR-03)', () => {
    const formula = makeFormula();
    const issues = errorsOnly(
      validateFormula(
        { ...formula, explanation: { ...formula.explanation, howToRead: '  ' } },
        CATEGORY_IDS,
      ),
    );
    expect(issues.some((i) => i.path.endsWith('explanation.howToRead'))).toBe(true);
  });

  it('bắt thiếu nguồn tham khảo (FR-04)', () => {
    const issues = errorsOnly(validateFormula(makeFormula({ source: [] }), CATEGORY_IDS));
    expect(issues.some((i) => i.path.endsWith('.source'))).toBe(true);
  });

  it('bắt thiếu ca kiểm thử (NFR-MNT-02)', () => {
    const issues = errorsOnly(validateFormula(makeFormula({ tests: [] }), CATEGORY_IDS));
    expect(issues.some((i) => i.path.endsWith('.tests'))).toBe(true);
  });

  it('bắt trùng key biến', () => {
    const formula = makeFormula();
    const first = formula.variables[0];
    if (first === undefined) throw new Error('fixture hỏng');
    const issues = errorsOnly(
      validateFormula({ ...formula, variables: [first, { ...first }] }, CATEGORY_IDS),
    );
    expect(issues.some((i) => i.message.includes('Trùng key biến'))).toBe(true);
  });

  it('bắt ví dụ dùng biến không có thật', () => {
    const issues = errorsOnly(
      validateFormula(
        makeFormula({ example: { title: 'x', inputs: { bogus: 1 }, expected: 1 } }),
        CATEGORY_IDS,
      ),
    );
    expect(issues.some((i) => i.message.includes("Không có biến 'bogus'"))).toBe(true);
  });
});

describe('validateRegistry()', () => {
  it('bắt trùng id công thức', () => {
    const issues = errorsOnly(validateRegistry(CATEGORIES, [makeFormula(), makeFormula()]));
    expect(issues.some((i) => i.message === 'Trùng id công thức.')).toBe(true);
  });

  it('bắt cạnh phụ thuộc trỏ vào công thức không tồn tại (FR-15)', () => {
    const formula = makeFormula({
      dependsOn: [{ formulaId: 'khong-co', variableKey: 'eps' }],
    });
    const issues = errorsOnly(validateRegistry(CATEGORIES, [formula]));
    expect(issues.some((i) => i.message.includes("thượng nguồn 'khong-co'"))).toBe(true);
  });

  it('bắt cạnh phụ thuộc trỏ vào biến không có', () => {
    const formula = makeFormula({
      id: 'pb',
      dependsOn: [{ formulaId: 'pe', variableKey: 'khong-co' }],
    });
    const issues = errorsOnly(validateRegistry(CATEGORIES, [makeFormula(), formula]));
    expect(issues.some((i) => i.message.includes("biến 'khong-co'"))).toBe(true);
  });

  it('bắt công thức tự phụ thuộc chính nó', () => {
    const formula = makeFormula({ dependsOn: [{ formulaId: 'pe', variableKey: 'eps' }] });
    const issues = errorsOnly(validateRegistry(CATEGORIES, [formula]));
    expect(issues.some((i) => i.message.includes('phụ thuộc chính nó'))).toBe(true);
  });

  it('nhóm rỗng chỉ là nhắc, không chặn phát hành', () => {
    const all = validateRegistry(CATEGORIES, []);
    expect(errorsOnly(all)).toHaveLength(0);
    expect(all.filter((i) => i.severity === 'warning').length).toBe(12);
  });
});

describe('createRegistry()', () => {
  it('dựng chỉ mục tra cứu theo id và theo nhóm', () => {
    const registry = createRegistry([makeFormula()]);
    expect(registry.byId.get('pe')?.name.vi).toContain('P/E');
    expect(registry.byCategory.get('valuation')).toHaveLength(1);
    expect(registry.byCategory.get('risk')).toHaveLength(0);
  });

  it('không ném lỗi khi Registry có sai sót — chỉ ghi vào issues', () => {
    const registry = createRegistry([makeFormula({ source: [] })]);
    expect(registry.issues.length).toBeGreaterThan(0);
    expect(() => assertRegistryValid(registry)).toThrow(/Registry có/);
  });

  it('Registry hợp lệ thì assert đi qua', () => {
    expect(() => assertRegistryValid(createRegistry([makeFormula()]))).not.toThrow();
  });

  it('đếm được số công thức từng nhóm cho dropdown lọc (WF-02)', () => {
    const counts = countByCategory(createRegistry([makeFormula()]));
    expect(counts.get('valuation')).toBe(1);
    expect(counts.get('technical')).toBe(0);
  });

  it('lọc được công thức nổi bật cho trang chủ (FR-20)', () => {
    expect(featuredFormulas(createRegistry([makeFormula()]))).toHaveLength(1);
    expect(featuredFormulas(createRegistry([makeFormula({ isFeatured: false })]))).toHaveLength(0);
  });
});

describe('bộ sinh JSON', () => {
  it('sinh ra JSON đọc lại được, có phiên bản', () => {
    const json = serializeRegistry(createRegistry([makeFormula()]));
    const parsed: unknown = JSON.parse(json);
    expect(parsed).toMatchObject({ version: 1 });
  });
});

describe('sinh giao diện từ Registry (FR-05, FR-09)', () => {
  it('bộ giá trị khởi tạo lấy thẳng từ defaultValue', () => {
    expect(defaultInputs(makeFormula())).toEqual({ price: 92_000, eps: 6_050 });
  });

  it('chế độ Cơ bản ẩn biến nâng cao, chế độ Nâng cao thấy tất', () => {
    const formula = makeFormula();
    expect(variablesForLevel(formula, 'basic')).toHaveLength(1);
    expect(variablesForLevel(formula, 'advanced')).toHaveLength(2);
  });
});
