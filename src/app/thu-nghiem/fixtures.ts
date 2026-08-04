import type { FormulaSpec } from '@/application';

/**
 * Số liệu dựng tay cho màn thử — KHÔNG phải dữ liệu sản phẩm.
 *
 * Registry còn rỗng (nhánh 5 mới đổ 107 công thức vào) nên nếu không có bộ này thì không
 * component nào của gói 2.3 và 2.4 được vẽ ra để nhìn. Đây đúng là cái nợ mà đợt 3 để lại:
 * "FormulaCard chưa có bằng chứng hiển thị".
 *
 * Con số lấy đúng ví dụ P/E của WF-03: Giá 92.000 ₫, EPS 6.050 ₫ → 15,2 lần.
 * Xoá cả thư mục này khi gói 3.2.1 dựng màn WF-03 thật bằng công thức trong Registry.
 */
export const PE_DEMO: FormulaSpec = {
  id: 'pe',
  categoryId: 'fundamentals',
  name: { vi: 'Hệ số giá trên lợi nhuận (P/E)', en: 'Price to Earnings' },
  description: 'Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng lợi nhuận của doanh nghiệp.',
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
      max: 1_000_000,
      level: 'basic',
      description: 'Giá đóng cửa gần nhất của cổ phiếu.',
    },
    {
      key: 'eps',
      label: 'EPS (lợi nhuận / CP)',
      unit: '₫',
      type: 'number',
      defaultValue: 6_050,
      min: -100_000,
      max: 1_000_000,
      level: 'basic',
      description: 'Lợi nhuận sau thuế chia cho số cổ phiếu đang lưu hành.',
    },
    {
      key: 'growth',
      label: 'Tăng trưởng g',
      unit: '%',
      type: 'slider',
      defaultValue: 4,
      min: 0,
      max: 12,
      step: 0.1,
      level: 'advanced',
      description: 'Tốc độ tăng trưởng dài hạn giả định.',
    },
    {
      key: 'period',
      label: 'Kỳ số liệu',
      unit: '',
      type: 'buttonGroup',
      defaultValue: 2,
      level: 'basic',
      description: 'Chọn kỳ lấy lợi nhuận để tính EPS.',
      options: [
        { value: 1, label: 'Quý' },
        { value: 2, label: 'Năm' },
        { value: 3, label: 'TTM' },
      ],
    },
    {
      key: 'cashflow',
      label: 'Loại dòng tiền',
      unit: '',
      type: 'radio',
      defaultValue: 1,
      level: 'advanced',
      options: [
        { value: 1, label: 'FCFF', description: 'Dòng tiền doanh nghiệp' },
        { value: 2, label: 'FCFE', description: 'Dòng tiền chủ sở hữu' },
      ],
    },
    {
      key: 'schedule',
      label: 'Biểu phí',
      unit: '',
      type: 'select',
      defaultValue: 1,
      level: 'basic',
      description: 'Hằng số phí và thuế lấy từ Market Config (CON-10).',
      options: [
        { value: 1, label: 'Mặc định HOSE 2026' },
        { value: 2, label: 'Biểu phí tự nhập' },
      ],
    },
    {
      key: 'dividendTax',
      label: 'Trừ thuế cổ tức 5%',
      unit: '',
      type: 'toggle',
      defaultValue: 0,
      level: 'basic',
      options: [
        { value: 0, label: 'Tắt' },
        { value: 1, label: 'Bật' },
      ],
    },
  ],
  explanation: {
    meaning: 'Số năm lợi nhuận cần có để hoàn lại đúng số tiền đang bỏ ra mua cổ phiếu.',
    whenToUse: 'So sánh nhanh hai doanh nghiệp cùng ngành, cùng giai đoạn phát triển.',
    howToRead: 'P/E càng cao thì kỳ vọng tăng trưởng càng lớn, và rủi ro đi kèm cũng càng lớn.',
    commonMistakes: 'So P/E giữa hai ngành khác nhau, hoặc dùng P/E khi doanh nghiệp đang lỗ.',
  },
  example: {
    title: 'FPT — giá 92.000 ₫, EPS 6.050 ₫',
    inputs: { price: 92_000, eps: 6_050 },
    expected: 15.21,
    note: 'Số liệu minh hoạ, không phải báo cáo tài chính thật.',
  },
  tests: [
    { name: 'ca thường', inputs: { price: 92_000, eps: 6_050 }, expected: 15.21 },
    { name: 'EPS bằng 0', inputs: { price: 92_000, eps: 0 }, expected: null },
  ],
  source: [
    { label: 'Giáo trình phân tích đầu tư (CFA Institute)' },
    { label: 'Chuẩn mực kế toán Việt Nam (VAS)' },
  ],
};

/** Dải luồng định giá của WF-04, cố ý khai xáo trộn để thấy thứ tự do `dependsOn` quyết. */
export const FLOW_DEMO: ReadonlyArray<FormulaSpec> = [
  demoStep('gia-muc-tieu', 'Giá mục tiêu', ['ev']),
  demoStep('wacc', 'WACC', ['capm']),
  demoStep('beta', 'Beta'),
  demoStep('bien-an-toan', 'Biên an toàn', ['gia-muc-tieu']),
  demoStep('capm', 'CAPM · Re', ['beta']),
  demoStep('ev', 'EV', ['fcff']),
  demoStep('fcff', 'FCFF · PV', ['wacc']),
];

function demoStep(id: string, vi: string, dependsOn: ReadonlyArray<string> = []): FormulaSpec {
  return {
    ...PE_DEMO,
    id,
    name: { vi, en: id },
    isFeatured: false,
    dependsOn: dependsOn.map((formulaId) => ({ formulaId, variableKey: formulaId })),
  };
}
