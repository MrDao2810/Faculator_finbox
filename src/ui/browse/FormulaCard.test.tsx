// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import type { FormulaSpec } from '@/application';

import { FormulaCard } from './FormulaCard';

afterEach(cleanup);

/**
 * Thẻ công thức — gói WBS 2.2.3, thêm biến thể ô ở đợt 8.
 *
 * Hai biến thể dùng ở hai màn khác nhau nên phải kiểm cả hai: đổi biến thể `tile` cho trang chủ
 * mà vô tình đổi luôn `row` thì danh sách WF-02 và WF-09 hỏng hình mà không ai biết.
 */

const PE: FormulaSpec = {
  id: 'pe',
  categoryId: 'fundamentals',
  name: { vi: 'P/E — hệ số giá trên lợi nhuận', en: 'Price to earnings ratio' },
  description: {
    vi: 'Nhà đầu tư trả bao nhiêu đồng cho mỗi đồng lợi nhuận của doanh nghiệp.',
    en: 'How much an investor pays for each dong of the company’s profit.',
  },
  latex: 'P/E = \\frac{P}{EPS}',
  expression: { vi: 'P/E = Giá thị trường ÷ EPS', en: 'P/E = Market price ÷ EPS' },
  chartType: 'sensitivity',
  level: 'basic',
  isFeatured: true,
  tags: ['pe'],
  resultUnit: 'lần',
  variables: [
    {
      key: 'price',
      label: { vi: 'Giá thị trường', en: 'Market price' },
      unit: '₫',
      type: 'number',
      defaultValue: 92_000,
      min: 0,
      level: 'basic',
    },
  ],
  explanation: {
    meaning: {
      vi: 'Số năm lợi nhuận cần có để hoàn lại giá đang mua.',
      en: 'The number of years of profit needed to recoup the purchase price.',
    },
    whenToUse: {
      vi: 'So sánh nhanh hai doanh nghiệp cùng ngành.',
      en: 'Quickly compare two companies in the same industry.',
    },
    howToRead: {
      vi: 'P/E càng cao thì kỳ vọng tăng trưởng càng lớn.',
      en: 'The higher the P/E, the greater the growth expectation.',
    },
    commonMistakes: {
      vi: 'So P/E giữa hai ngành khác nhau.',
      en: 'Comparing P/E across two different industries.',
    },
  },
  example: {
    title: {
      vi: 'Cổ phiếu giá 92.000 ₫, EPS 6.050 ₫',
      en: 'Stock price 92,000 VND, EPS 6,050 VND',
    },
    inputs: { price: 92_000 },
    expected: 15.21,
  },
  tests: [{ name: 'ví dụ WF-03', inputs: { price: 92_000 }, expected: 15.21, tolerance: 0.01 }],
  source: [{ label: { vi: 'Giáo trình phân tích tài chính', en: 'Financial analysis textbook' } }],
};

describe('biến thể row — danh sách WF-02 và WF-09', () => {
  it('là mặc định và có đủ badge cấp độ lẫn mũi tên', () => {
    const { container } = render(<FormulaCard formula={PE} />);

    expect(screen.getByText('Cơ bản')).not.toBeNull();
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('hiện tên nhóm đầy đủ', () => {
    render(<FormulaCard formula={PE} />);
    expect(screen.getByText('Chỉ số doanh nghiệp')).not.toBeNull();
  });
});

describe('biến thể tile — lưới trang chủ WF-01', () => {
  it('bỏ badge cấp độ và mũi tên để nhường chỗ cho phần chữ', () => {
    const { container } = render(<FormulaCard formula={PE} variant="tile" />);

    expect(screen.queryByText('Cơ bản')).toBeNull();
    expect(container.querySelector('svg')).toBeNull();
  });

  it('giữ đủ ba dòng của bản thiết kế: tên · mô tả · nhóm rút gọn', () => {
    render(<FormulaCard formula={PE} variant="tile" />);

    expect(screen.getByText(PE.name.vi)).not.toBeNull();
    expect(screen.getByText(PE.description.vi)).not.toBeNull();
    expect(screen.getByText('Chỉ số DN')).not.toBeNull();
    expect(screen.queryByText('Chỉ số doanh nghiệp')).toBeNull();
  });

  it('vẫn là một liên kết thật trỏ tới trang công thức', () => {
    render(<FormulaCard formula={PE} variant="tile" />);
    expect(screen.getByRole('link').getAttribute('href')).toContain('/cong-thuc/pe');
  });

  it('showCategory=false thì bỏ hẳn dòng nhóm', () => {
    render(<FormulaCard formula={PE} variant="tile" showCategory={false} />);
    expect(screen.queryByText('Chỉ số DN')).toBeNull();
  });
});
