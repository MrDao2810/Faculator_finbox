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
    description: {
      vi: 'Số cổ phiếu được phép mua để một lệnh thua không vượt quá mức rủi ro đã định.',
      en: 'The number of shares you may buy so that, if the trade loses, the loss does not exceed the risk you set.',
    },
    latex: 'Q = \\frac{V \\times r}{P_{vao} - P_{cat}}',
    expression: {
      vi: 'Cỡ lệnh = Vốn tài khoản × Rủi ro mỗi lệnh ÷ (Giá vào lệnh − Giá cắt lỗ)',
      en: 'Position size = Account capital × Risk per trade ÷ (Entry price − Stop-loss price)',
    },
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['co lenh', 'position size', 'quan tri rui ro', 'cat lo'],
    resultUnit: 'CP',
    variables: [
      numberVar('capital', { vi: 'Vốn tài khoản', en: 'Account capital' }, '₫', 500_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Tổng vốn đang dùng để giao dịch.',
          en: 'Total capital used for trading.',
        },
      }),
      sliderVar(
        'riskPercent',
        { vi: 'Rủi ro mỗi lệnh', en: 'Risk per trade' },
        '%',
        2,
        0.1,
        10,
        0.1,
        {
          description: {
            vi: 'Phần trăm vốn chấp nhận mất nếu lệnh này chạm cắt lỗ.',
            en: 'Percentage of capital you accept losing if this trade hits its stop-loss.',
          },
        },
      ),
      numberVar('entryPrice', { vi: 'Giá vào lệnh', en: 'Entry price' }, '₫', 92_000, {
        min: 0,
        max: 10_000_000,
      }),
      numberVar('stopPrice', { vi: 'Giá cắt lỗ', en: 'Stop-loss price' }, '₫', 86_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Mức giá sẽ bán ra để dừng lỗ.',
          en: 'The price at which you will sell to stop the loss.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Khối lượng lớn nhất được phép mua, sao cho nếu giá chạm mức cắt lỗ thì khoản mất đúng bằng mức rủi ro đã định trước.',
        en: 'The largest quantity you may buy such that, if the price hits the stop-loss level, the loss equals exactly the risk you set in advance.',
      },
      whenToUse: {
        vi: 'Trước mỗi lệnh mua, để khối lượng do kỷ luật quyết chứ không do cảm xúc.',
        en: 'Before every buy order, so the quantity is decided by discipline rather than emotion.',
      },
      howToRead: {
        vi: 'Đặt cắt lỗ càng sát giá vào thì được mua càng nhiều, nhưng cũng càng dễ bị quét khỏi vị thế.',
        en: 'The closer the stop-loss is to the entry price, the more you may buy — but the easier it is to get stopped out of the position.',
      },
      commonMistakes: {
        vi: 'Mua theo số tiền chẵn rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là: chọn mức cắt lỗ trước, khối lượng suy ra sau.',
        en: 'Buying a round amount of money first and only then thinking about the stop-loss. The correct order is: choose the stop-loss level first, and let the quantity follow from it.',
      },
    },
    example: {
      title: {
        vi: 'Vốn 500 triệu ₫, rủi ro 2%, vào 92.000 ₫, cắt lỗ 86.000 ₫',
        en: 'Capital 500 million ₫, risk 2%, entry 92,000 ₫, stop-loss 86,000 ₫',
      },
      inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 92_000, stopPrice: 86_000 },
      expected: 1_666.67,
      note: {
        vi: 'Thực tế làm tròn xuống bội của 100 cổ phiếu theo lô giao dịch.',
        en: 'In practice, round down to a multiple of 100 shares per trading lot.',
      },
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
          { vi: 'cỡ lệnh', en: 'position size' },
          { vi: 'Khoảng cách tới cắt lỗ', en: 'Distance to stop-loss' },
          {
            vi: 'Đặt giá cắt lỗ thấp hơn giá vào lệnh.',
            en: 'Set a stop-loss price lower than the entry price.',
          },
        ),
      };
    }

    if (gap < 0) {
      return {
        value: null,
        unit: 'CP',
        warning: meaningless(
          {
            vi: 'Giá cắt lỗ đang cao hơn giá vào lệnh, nên lệnh mua này không có phần rủi ro để tính.',
            en: 'The stop-loss price is higher than the entry price, so this buy order has no risk portion to calculate.',
          },
          {
            vi: 'Đặt giá cắt lỗ thấp hơn giá vào lệnh.',
            en: 'Set a stop-loss price lower than the entry price.',
          },
        ),
      };
    }

    return ok((v('capital') * v('riskPercent')) / 100 / gap, 'CP');
  },
};

export const RISK_FORMULAS: ReadonlyArray<FormulaModule> = [CO_LENH_RUI_RO];
