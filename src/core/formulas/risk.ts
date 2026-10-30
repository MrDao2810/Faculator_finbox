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
    substitutionDerived: { r: '{riskPercent} ÷ 100' },
    substitution: '{capital} × {r} ÷ ({entryPrice} − {stopPrice})',
    symbols: [
      {
        latex: 'Q',
        meaning: {
          vi: 'cỡ lệnh, tức số cổ phiếu tối đa cho lệnh này, CP',
          en: 'position size, the maximum number of shares for this order, shares',
        },
      },
      { latex: 'V', meaning: { vi: 'vốn tài khoản, ₫', en: 'account capital, ₫' } },
      {
        latex: 'r',
        meaning: {
          vi: 'rủi ro mỗi lệnh, tức phần vốn chấp nhận mất nếu chạm cắt lỗ, dạng thập phân, 2% là 0,02',
          en: 'risk per trade, the capital share you accept losing at the stop, as a decimal, 2% is 0.02',
        },
      },
      {
        latex: 'V \\times r',
        meaning: {
          vi: 'số tiền tối đa chấp nhận mất ở lệnh này, ₫',
          en: 'maximum amount you accept losing on this order, ₫',
        },
      },
      { latex: 'P_{vao}', meaning: { vi: 'giá vào lệnh, ₫', en: 'entry price, ₫' } },
      { latex: 'P_{cat}', meaning: { vi: 'giá cắt lỗ, ₫', en: 'stop-loss price, ₫' } },
      {
        latex: 'P_{vao} - P_{cat}',
        meaning: {
          vi: 'khoản lỗ trên mỗi cổ phiếu nếu giá chạm mức cắt lỗ, ₫',
          en: 'loss per share if the price hits the stop-loss level, ₫',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['co lenh', 'position size', 'quan tri rui ro', 'cat lo'],
    resultUnit: 'CP',
    variables: [
      numberVar(
        'capital',
        { vi: 'Vốn tài khoản (V)', en: 'Account capital (V)' },
        '₫',
        500_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Tổng vốn đang dùng để giao dịch.',
            en: 'Total capital used for trading.',
          },
        },
      ),
      sliderVar(
        'riskPercent',
        { vi: 'Rủi ro mỗi lệnh (r)', en: 'Risk per trade (r)' },
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
      numberVar(
        'entryPrice',
        { vi: 'Giá vào lệnh (Pvao)', en: 'Entry price (Pvao)' },
        '₫',
        92_000,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Giá một cổ phiếu lúc vào lệnh mua. Phải cao hơn giá cắt lỗ.',
            en: 'The share price when the buy order is entered. It must be above the stop-loss price.',
          },
        },
      ),
      numberVar(
        'stopPrice',
        { vi: 'Giá cắt lỗ (Pcat)', en: 'Stop-loss price (Pcat)' },
        '₫',
        86_000,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Mức giá sẽ bán ra để dừng lỗ.',
            en: 'The price at which you will sell to stop the loss.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Khối lượng mà nếu giá chạm mức cắt lỗ thì khoản mất đúng bằng mức rủi ro đã định trước. Đây là trần theo RỦI RO, chưa phải trần theo số tiền đang có: khoảng cắt lỗ hẹp có thể cho ra khối lượng đắt hơn cả tài khoản.',
        en: 'The quantity for which, if the price hits the stop-loss level, the loss equals exactly the risk you set in advance. This is a ceiling set by RISK, not by the cash you hold: a narrow stop distance can produce a quantity that costs more than the whole account.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn sắp đặt lệnh mua một cổ phiếu, đã chọn giá mua và giá cắt lỗ, và muốn biết được mua bao nhiêu cổ phiếu để lỡ thua cũng chỉ mất đúng số tiền mình chấp nhận.',
        en: 'Use it when you are about to place a buy order for a stock, have picked your entry and stop-loss prices, and want to know how many shares to buy so a losing trade costs only the amount you accept.',
      },
      howToRead: {
        vi: 'So với số cổ phiếu bạn định mua: định mua nhiều hơn con số này thì lỡ chạm cắt lỗ sẽ mất quá mức rủi ro đã đặt, ít hơn hoặc bằng thì khoản mất nằm trong mức ấy. Kết quả có thể lẻ vì chưa làm tròn, số mua thật phải làm tròn xuống.',
        en: 'Compared with the number of shares you plan to buy: buying more than this figure means hitting the stop-loss would cost more than the risk you set, while this many or fewer keeps the loss within it. The result can be fractional because it is not rounded, so the shares you actually buy must be rounded down.',
      },
      commonMistakes: {
        vi: 'Mua theo số tiền chẵn rồi mới nghĩ tới cắt lỗ. Thứ tự đúng là: chọn mức cắt lỗ trước, khối lượng suy ra sau.',
        en: 'Buying a round amount of money first and only then thinking about the stop-loss. The correct order is: choose the stop-loss level first, and let the quantity follow from it.',
      },
    },
    example: {
      title: {
        vi: 'Vốn 500 triệu ₫, rủi ro 2% mỗi lệnh, mua FPT giá phiên 11/09/2026, cắt lỗ ở giá đóng cửa thấp nhất tháng 8/2026',
        en: 'Capital of 500 million ₫, 2% risk per trade, buying FPT at the 2026-09-11 close with a stop at the lowest close of August 2026',
      },
      inputs: { capital: 500_000_000, riskPercent: 2, entryPrice: 72_700, stopPrice: 68_300 },
      expected: 2_272.73,
      note: {
        vi: 'So với 10 triệu ₫ bạn chấp nhận mất, tức 2% vốn 500 triệu ₫: giá rơi từ 72.700 ₫ xuống mức cắt lỗ 68.300 ₫ thì mỗi cổ phiếu lỗ 4.400 ₫, nên lệnh này tính ra 2.272,73 cổ phiếu FPT. Số mua thật phải làm tròn xuống 2.272, vì đủ 2.273 cổ phiếu thì chạm cắt lỗ sẽ mất 10.001.200 ₫, quá mức đã đặt.',
        en: 'Compared with the 10 million ₫ you accept losing, which is 2% of the 500 million ₫ capital: a drop from 72,700 ₫ to the 68,300 ₫ stop costs 4,400 ₫ per share, so this order works out to 2,272.73 FPT shares. The real order must round down to 2,272, because a full 2,273 shares would lose 10,001,200 ₫ at the stop, more than the limit set.',
      },
      source: {
        vi: 'investing.com, giá đóng cửa CTCP FPT (mã FPT) phiên 11/09/2026; mức cắt lỗ lấy theo giá đóng cửa phiên 14/08/2026, mức đóng cửa thấp nhất tháng 8/2026.',
        en: 'investing.com, FPT Corp’s (ticker FPT) close on 2026-09-11; the stop-loss level taken from the 2026-08-14 close, the lowest close of August 2026.',
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
