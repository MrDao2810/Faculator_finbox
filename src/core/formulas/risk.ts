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
        vi: 'Khối lượng mà nếu giá chạm mức cắt lỗ thì khoản mất đúng bằng mức rủi ro đã định trước. Đây là trần theo RỦI RO, chưa phải trần theo số tiền đang có: khoảng cắt lỗ hẹp có thể cho ra khối lượng đắt hơn cả tài khoản.',
        en: 'The quantity for which, if the price hits the stop-loss level, the loss equals exactly the risk you set in advance. This is a ceiling set by RISK, not by the cash you hold: a narrow stop distance can produce a quantity that costs more than the whole account.',
      },
      whenToUse: {
        vi: 'Trước mỗi lệnh mua, để khối lượng do kỷ luật quyết chứ không do cảm xúc.',
        en: 'Before every buy order, so the quantity is decided by discipline rather than emotion.',
      },
      howToRead: {
        vi: 'Con số là khối lượng tối đa của riêng lệnh này: 2.272,73 CP nghĩa là cỡ lệnh dừng ở 2.200 CP sau khi làm tròn xuống bội 100 cổ phiếu. Nhân khối lượng với giá vào rồi so với vốn tài khoản trước khi đặt lệnh — cắt lỗ càng sát giá vào thì số tiền phải bỏ ra càng dễ vượt quá vốn.',
        en: 'The number is the maximum quantity for this one order: 2,272.73 shares means the order stops at 2,200 shares once rounded down to a multiple of 100. Multiply the quantity by the entry price and compare it with your account capital before placing the order — the tighter the stop sits to the entry, the more easily that amount exceeds your capital.',
      },
      commonMistakes: {
        vi: 'Mua theo số tiền chẵn rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là: chọn mức cắt lỗ trước, khối lượng suy ra sau.',
        en: 'Buying a round amount of money first and only then thinking about the stop-loss. The correct order is: choose the stop-loss level first, and let the quantity follow from it.',
      },
    },
    example: {
      title: {
        vi: 'Vốn 500 triệu ₫, rủi ro 2% mỗi lệnh, mua FPT giá phiên 11/09/2026, cắt lỗ dưới đáy tháng 8/2026',
        en: 'Capital of 500 million ₫, 2% risk per trade, buying FPT at the 2026-09-11 close with a stop below the August 2026 low',
      },
      inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 72_700, stopPrice: 68_300 },
      expected: 2_273,
      note: {
        vi: 'Mức cắt lỗ quyết định khối lượng chứ không phải ngược lại: khoảng cách tới cắt lỗ càng xa thì số cổ phiếu được phép nắm càng ít. Thực tế còn phải làm tròn xuống bội của 100 cổ phiếu theo lô giao dịch.',
        en: 'The stop-loss level decides the quantity, not the other way round: the further the stop sits from the entry, the fewer shares are allowed. In practice the figure is then rounded down to a multiple of 100 shares per trading lot.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT) phiên 11/09/2026; mức cắt lỗ lấy theo đáy phiên 14/08/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) close on 2026-09-11; the stop-loss level taken from the 2026-08-14 low.',
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
