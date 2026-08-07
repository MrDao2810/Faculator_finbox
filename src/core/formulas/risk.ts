/**
 * Tầng DOMAIN — nhóm rủi ro & danh mục (một phần nhánh 5).
 *
 * Đợt này mới một công thức: cỡ lệnh theo % rủi ro. Nó có mặt trong khối "Công thức dùng
 * hằng ngày" của WF-01 và trong danh sách gợi ý của WF-09, nên không có thì hai màn đó thiếu.
 *
 * Beta, Sharpe, Max Drawdown và VaR đều cần chuỗi giá nhiều phiên, tức là cần bảng dữ liệu
 * của gói WBS 3.3.2 — để đợt sau.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

export const CO_LENH_RUI_RO: FormulaModule = {
  spec: {
    id: 'co-lenh-rui-ro',
    categoryId: 'risk',
    name: { vi: 'Cỡ lệnh theo % rủi ro', en: 'Risk-based position size' },
    description: 'Số cổ phiếu được phép mua để một lệnh thua không vượt quá mức rủi ro đã định.',
    latex: 'Q = \\frac{V \\times r}{P_{vao} - P_{cat}}',
    expression: 'Cỡ lệnh = Vốn tài khoản × Rủi ro mỗi lệnh ÷ (Giá vào lệnh − Giá cắt lỗ)',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['co lenh', 'position size', 'quan tri rui ro', 'cat lo'],
    resultUnit: 'CP',
    variables: [
      numberVar('capital', 'Vốn tài khoản', '₫', 500_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Tổng vốn đang dùng để giao dịch.',
      }),
      sliderVar('riskPercent', 'Rủi ro mỗi lệnh', '%', 2, 0.1, 10, 0.1, {
        description: 'Phần trăm vốn chấp nhận mất nếu lệnh này chạm cắt lỗ.',
      }),
      numberVar('entryPrice', 'Giá vào lệnh', '₫', 92_000, { min: 0, max: 10_000_000 }),
      numberVar('stopPrice', 'Giá cắt lỗ', '₫', 86_000, {
        min: 0,
        max: 10_000_000,
        description: 'Mức giá sẽ bán ra để dừng lỗ.',
      }),
    ],
    explanation: {
      meaning:
        'Khối lượng lớn nhất được phép mua, sao cho nếu giá chạm mức cắt lỗ thì khoản mất đúng bằng mức rủi ro đã định trước.',
      whenToUse: 'Trước mỗi lệnh mua, để khối lượng do kỷ luật quyết chứ không do cảm xúc.',
      howToRead:
        'Đặt cắt lỗ càng sát giá vào thì được mua càng nhiều, nhưng cũng càng dễ bị quét khỏi vị thế.',
      commonMistakes:
        'Mua theo số tiền chẵn rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là: chọn mức cắt lỗ trước, khối lượng suy ra sau.',
    },
    example: {
      title: 'Vốn 500 triệu ₫, rủi ro 2%, vào 92.000 ₫, cắt lỗ 86.000 ₫',
      inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 92_000, stopPrice: 86_000 },
      expected: 1_666.67,
      note: 'Thực tế làm tròn xuống bội của 100 cổ phiếu theo lô giao dịch.',
    },
    tests: [
      {
        name: 'ví dụ chuẩn',
        inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 92_000, stopPrice: 86_000 },
        expected: 1_666.67,
      },
      {
        name: 'cắt lỗ bằng giá vào thì không có cỡ lệnh nào an toàn',
        inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 92_000, stopPrice: 92_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        name: 'cắt lỗ đặt cao hơn giá vào là sai chiều lệnh mua',
        inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 92_000, stopPrice: 95_000 },
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const gap = v('entryPrice') - v('stopPrice');

    if (gap === 0) {
      return {
        value: null,
        unit: 'CP',
        warning: divideByZero(
          'cỡ lệnh',
          'Khoảng cách tới cắt lỗ',
          'Đặt giá cắt lỗ thấp hơn giá vào lệnh.',
        ),
      };
    }

    if (gap < 0) {
      return {
        value: null,
        unit: 'CP',
        warning: meaningless(
          'Giá cắt lỗ đang cao hơn giá vào lệnh, nên lệnh mua này không có phần rủi ro để tính.',
          'Đặt giá cắt lỗ thấp hơn giá vào lệnh.',
        ),
      };
    }

    return ok((v('capital') * v('riskPercent')) / 100 / gap, 'CP');
  },
};

export const RISK_FORMULAS: ReadonlyArray<FormulaModule> = [CO_LENH_RUI_RO];
