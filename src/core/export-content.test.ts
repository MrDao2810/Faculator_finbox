import { describe, expect, it } from 'vitest';

import { fail, ok } from './calc-output';
import {
  DISCLAIMER_VI,
  buildExportContent,
  exportFileName,
  type ExportOptions,
} from './export-content';
import type { FormulaSpec } from './registry/types';
import { divideByZero } from './warnings';

const PE: FormulaSpec = {
  id: 'pe',
  categoryId: 'fundamentals',
  name: { vi: 'Hệ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
  description: 'Trả bao nhiêu đồng cho mỗi đồng lợi nhuận.',
  latex: 'P/E = \\frac{P}{EPS}',
  chartType: 'sensitivity',
  level: 'basic',
  tags: [],
  resultUnit: 'lần',
  variables: [
    {
      key: 'price',
      label: 'Giá thị trường',
      unit: '₫',
      type: 'number',
      defaultValue: 92_000,
      level: 'basic',
      description: 'Giá đóng cửa gần nhất.',
    },
    {
      key: 'g',
      label: 'Tăng trưởng g',
      unit: '%',
      type: 'number',
      defaultValue: 4,
      level: 'advanced',
    },
  ],
  explanation: {
    meaning: 'Số năm lợi nhuận cần có để hoàn lại giá đang mua.',
    whenToUse: 'So sánh hai doanh nghiệp cùng ngành.',
    howToRead: 'Càng cao thì kỳ vọng càng lớn.',
    commonMistakes: 'So giữa hai ngành khác nhau.',
  },
  example: { title: 'x', inputs: { price: 92_000 }, expected: 15.2 },
  tests: [],
  source: [{ label: 'Giáo trình phân tích đầu tư (CFA Institute)' }],
};

const INPUTS = { price: 92_000, g: 4 };

function options(patch: Partial<ExportOptions> = {}): ExportOptions {
  return { format: 'pdf', includeChart: true, includeDetails: true, ...patch };
}

describe('FR-24 — miễn trừ không thể tắt', () => {
  it('luôn có mặt ở mọi tổ hợp tuỳ chọn', () => {
    const combos: ExportOptions[] = [
      options(),
      options({ includeChart: false }),
      options({ includeDetails: false }),
      options({ includeChart: false, includeDetails: false }),
      options({ format: 'png' }),
      options({ format: 'png', includeChart: false, includeDetails: false, mode: 'basic' }),
    ];

    for (const combo of combos) {
      const content = buildExportContent(PE, ok(15.2, 'lần'), INPUTS, combo);
      expect(content.disclaimer, JSON.stringify(combo)).toBe(DISCLAIMER_VI);
    }
  });

  it('câu miễn trừ nói đúng hai ý bắt buộc', () => {
    expect(DISCLAIMER_VI).toContain('tham khảo');
    expect(DISCLAIMER_VI).toContain('không phải khuyến nghị đầu tư');
  });

  it('vẫn đính kèm cả khi phép tính đang lỗi', () => {
    const content = buildExportContent(
      PE,
      fail('lần', divideByZero('P/E', 'EPS')),
      INPUTS,
      options(),
    );
    expect(content.disclaimer).toBe(DISCLAIMER_VI);
  });
});

describe('nội dung file xuất', () => {
  it('lấy tên và mô tả từ Registry', () => {
    const content = buildExportContent(PE, ok(15.2, 'lần'), INPUTS, options());

    expect(content.title).toBe('Hệ số giá trên lợi nhuận (P/E)');
    expect(content.subtitle).toContain('mỗi đồng lợi nhuận');
  });

  it('kết quả đã định dạng theo quy ước Việt Nam', () => {
    expect(buildExportContent(PE, ok(15.21, 'lần'), INPUTS, options()).result).toBe('15,21 lần');
  });

  it('không tính được thì ghi “— , —”, tuyệt đối không ghi 0 (FR-06)', () => {
    const content = buildExportContent(
      PE,
      fail('lần', divideByZero('P/E', 'EPS')),
      INPUTS,
      options(),
    );

    expect(content.result).toContain('— , —');
    expect(content.result).not.toContain('NaN');
  });

  it('liệt kê giá trị đầu vào kèm đơn vị', () => {
    const content = buildExportContent(PE, ok(15.2, 'lần'), INPUTS, options());

    expect(content.inputs).toEqual([
      { label: 'Giá thị trường', value: '92.000 ₫' },
      { label: 'Tăng trưởng g', value: '4 %' },
    ]);
  });

  it('ô chưa nhập thì ghi “— , —” chứ không ghi 0', () => {
    const content = buildExportContent(PE, ok(15.2, 'lần'), { price: 92_000 }, options());
    expect(content.inputs[1]?.value).toContain('— , —');
  });

  it('biến kiểu chọn xuất ra NHÃN chứ không xuất con số', () => {
    const withChoice: FormulaSpec = {
      ...PE,
      variables: [
        {
          key: 'period',
          label: 'Kỳ số liệu',
          unit: '',
          type: 'buttonGroup',
          defaultValue: 2,
          level: 'basic',
          options: [
            { value: 1, label: 'Quý' },
            { value: 2, label: 'Năm' },
            { value: 3, label: 'TTM' },
          ],
        },
      ],
    };

    const content = buildExportContent(withChoice, ok(15.2, 'lần'), { period: 2 }, options());

    // 'Kỳ số liệu: 2' thì người nhận file không hiểu gì.
    expect(content.inputs[0]?.value).toBe('Năm');
  });

  it('giá trị không khớp lựa chọn nào thì vẫn hiện số, không hiện chuỗi rỗng', () => {
    const withChoice: FormulaSpec = {
      ...PE,
      variables: [
        {
          key: 'period',
          label: 'Kỳ số liệu',
          unit: '',
          type: 'buttonGroup',
          defaultValue: 1,
          level: 'basic',
          options: [{ value: 1, label: 'Quý' }],
        },
      ],
    };

    expect(
      buildExportContent(withChoice, ok(1, 'lần'), { period: 9 }, options()).inputs[0]?.value,
    ).toBe('9');
  });

  it('chế độ Cơ bản chỉ xuất biến cơ bản (FR-09)', () => {
    const content = buildExportContent(PE, ok(15.2, 'lần'), INPUTS, options({ mode: 'basic' }));

    expect(content.inputs).toHaveLength(1);
    expect(content.inputs[0]?.label).toBe('Giá thị trường');
  });

  it('luôn ghi nguồn tham khảo (FR-04)', () => {
    expect(buildExportContent(PE, ok(15.2, 'lần'), INPUTS, options()).sources).toEqual([
      'Giáo trình phân tích đầu tư (CFA Institute)',
    ]);
  });
});

describe('tuỳ chọn kèm theo', () => {
  it('tắt bảng biến & giải thích thì bỏ hẳn hai phần đó', () => {
    const content = buildExportContent(
      PE,
      ok(15.2, 'lần'),
      INPUTS,
      options({ includeDetails: false }),
    );

    expect(content.variables).toEqual([]);
    expect(content.explanation).toEqual([]);
    // Giá trị đầu vào thì vẫn giữ — thiếu nó thì con số kết quả không kiểm chứng lại được.
    expect(content.inputs.length).toBeGreaterThan(0);
  });

  it('bật thì có đủ bốn mục diễn giải của FR-03', () => {
    const content = buildExportContent(PE, ok(15.2, 'lần'), INPUTS, options());
    expect(content.explanation).toHaveLength(4);
  });

  it('công thức không có biểu đồ thì không chừa chỗ, dù người dùng bật', () => {
    const noChart: FormulaSpec = { ...PE, chartType: 'none' };
    const content = buildExportContent(noChart, ok(15.2, 'lần'), INPUTS, options());

    expect(content.includeChart).toBe(false);
  });

  it('tắt biểu đồ thì không chừa chỗ', () => {
    const content = buildExportContent(
      PE,
      ok(15.2, 'lần'),
      INPUTS,
      options({ includeChart: false }),
    );
    expect(content.includeChart).toBe(false);
  });
});

describe('exportFileName()', () => {
  it('ghép tên theo id công thức và định dạng', () => {
    expect(exportFileName(PE, 'pdf')).toBe('falculator-pe.pdf');
    expect(exportFileName(PE, 'png')).toBe('falculator-pe.png');
  });

  it('bỏ ký tự lạ để tên file an toàn trên mọi hệ điều hành', () => {
    const odd: FormulaSpec = { ...PE, id: 'p/e ratio' };
    expect(exportFileName(odd, 'png')).toBe('falculator-p-e-ratio.png');
  });
});
