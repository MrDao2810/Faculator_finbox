/**
 * Tầng DOMAIN — nhóm lợi nhuận & cổ tức (một phần gói WBS 5.1.3).
 *
 * Bốn công thức tính được từ ô nhập số: ROI, HPR, CAGR, tỷ suất cổ tức. XIRR là công thức thứ
 * năm — hàm `xirr()` thuần vẫn ở đây, nay đã đăng ký thành `FormulaModule` với thân riêng
 * `ui/screens/XirrBody.tsx` quản lý bảng dòng tiền có ngày (`CalcContext.cashflows`).
 *
 * SRS nêu đích danh cặp dễ nhầm ROI / HPR: HPR tính cả cổ tức, ROI thì không.
 */

import { fail, ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import { xirr, xirrDiem, xirrNotConverged } from '../xirr';
import { divideByZero } from '../warnings';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/*
 * ── 1. ROI ─────────────────────────────────────────────────────────────────────────────
 */

export const ROI: FormulaModule = {
  spec: {
    id: 'roi',
    categoryId: 'returns',
    name: { vi: 'ROI — tỷ suất lợi nhuận', en: 'ROI — return on investment' },
    description: {
      vi: 'Phần trăm lãi hoặc lỗ so với số vốn đã bỏ ra.',
      en: 'The percentage gain or loss relative to the capital invested.',
    },
    latex: 'ROI = \\frac{V_{cuoi} - V_{dau}}{V_{dau}} \\times 100',
    expression: {
      vi: 'ROI = (Giá trị hiện tại − Vốn bỏ ra) ÷ Vốn bỏ ra × 100',
      en: 'ROI = (Current value − Capital invested) ÷ Capital invested × 100',
    },
    substitution: '({current} − {cost}) ÷ {cost} × 100',
    symbols: [
      { latex: 'ROI', meaning: { vi: 'tỷ suất lợi nhuận, %', en: 'return on investment, %' } },
      {
        latex: 'V_{cuoi}',
        meaning: {
          vi: 'giá trị hiện tại của khoản đầu tư, ₫',
          en: 'current value of the investment, ₫',
        },
      },
      {
        latex: 'V_{dau}',
        meaning: { vi: 'vốn bỏ ra ban đầu, ₫', en: 'capital originally invested, ₫' },
      },
      { latex: '100', meaning: { vi: 'đổi ra phần trăm', en: 'converts to percent' } },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['roi', 'ty suat loi nhuan', 'hieu qua dau tu'],
    resultUnit: '%',
    variables: [
      numberVar(
        'cost',
        { vi: 'Vốn bỏ ra (Vdau)', en: 'Capital invested (Vdau)' },
        '₫',
        100_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Tổng số tiền đã đầu tư ban đầu.',
            en: 'The total amount originally invested.',
          },
        },
      ),
      numberVar(
        'current',
        { vi: 'Giá trị hiện tại (Vcuoi)', en: 'Current value (Vcuoi)' },
        '₫',
        125_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Giá trị của khoản đầu tư tại thời điểm đánh giá.',
            en: 'The value of the investment at the time of evaluation.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi trăm đồng bỏ ra đang sinh ra bao nhiêu đồng lãi.',
        en: 'How much profit each hundred đồng invested is generating.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn xem tài khoản chứng khoán, thấy tổng tiền đã nạp vào và giá trị danh mục hôm nay, và muốn biết mình đang lãi hay lỗ bao nhiêu so với số vốn đó.',
        en: 'Use it when you check your brokerage account, see the total you have put in next to what it is worth today, and want to know how much you are up or down against that capital.',
      },
      howToRead: {
        vi: 'So với lãi suất tiết kiệm của đúng khoảng thời gian ấy: cao hơn nghĩa là khoản đầu tư sinh lời hơn gửi tiền, thấp hơn là kém hơn. Số âm nghĩa là đang lỗ, 0 là vừa hoà vốn.',
        en: 'Compared with the savings interest you would have earned over exactly the same stretch of time: higher means the investment beat a bank deposit, and lower means it did worse. A negative figure means you are at a loss, and 0 means you have just broken even.',
      },
      commonMistakes: {
        vi: 'Dùng ROI để so hai khoản có thời gian nắm giữ khác nhau. Muốn so thì dùng CAGR.',
        en: 'Using ROI to compare two investments with different holding periods. Use CAGR instead for that comparison.',
      },
    },
    example: {
      title: {
        vi: 'FPT — bỏ ra 62,9 triệu ₫ ngày 24/07/2026, tới 11/09/2026 giá trị 72,7 triệu ₫',
        en: 'FPT — 62.9 million ₫ invested on 2026-07-24, worth 72.7 million ₫ by 2026-09-11',
      },
      inputs: { cost: 62_900_000, current: 72_700_000 },
      expected: 15.5803,
      note: {
        vi: 'So với lãi gửi tiết kiệm trong cùng 49 ngày: dù tính theo mức 6,8%/năm của kỳ hạn 12 tháng, gửi tiền cũng chỉ được 0,91%, còn khoản FPT này lãi 15,58%, gấp 17,07 lần. Con số chưa trừ phí mua, phí bán, thuế bán và phí lưu ký, trừ hết thì còn 15,12%.',
        en: 'Compared with savings interest over the same 49 days: even at the 6.8%/year rate of a 12-month deposit, the money would earn only 0.91%, while this FPT holding gained 15.58%, 17.07 times as much. The figure leaves out the buy fee, sell fee, sell tax and custody fee, and with all of them deducted it drops to 15.12%.',
      },
      source: {
        vi: 'Giá đóng cửa FPT trên Investing.com, phiên 24/07/2026 và 11/09/2026.',
        en: 'FPT closing prices on Investing.com, the 2026-07-24 and 2026-09-11 sessions.',
      },
    },
    tests: [
      { name: 'lãi 25%', inputs: { cost: 100_000_000, current: 125_000_000 }, expected: 25 },
      { name: 'lỗ 20%', inputs: { cost: 100_000_000, current: 80_000_000 }, expected: -20 },
      {
        name: 'chưa bỏ vốn thì không có tỷ suất',
        inputs: { cost: 0, current: 125_000_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const cost = v('cost');
    if (cost === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'ROI', en: 'ROI' },
          { vi: 'Vốn bỏ ra', en: 'capital invested' },
          { vi: 'Nhập số vốn lớn hơn 0.', en: 'Enter a capital amount greater than 0.' },
        ),
      };
    }
    return ok(((v('current') - cost) / cost) * 100, '%');
  },
};

/*
 * ── 2. HPR ─────────────────────────────────────────────────────────────────────────────
 */

export const HPR: FormulaModule = {
  spec: {
    id: 'hpr',
    categoryId: 'returns',
    name: { vi: 'HPR — lợi suất kỳ nắm giữ', en: 'HPR — holding period return' },
    description: {
      vi: 'Lợi suất một kỳ nắm giữ, tính cả chênh lệch giá lẫn cổ tức nhận được.',
      en: 'The holding-period return, including both the price change and dividends received.',
    },
    latex: 'HPR = \\frac{P_{cuoi} - P_{dau} + D}{P_{dau}} \\times 100',
    expression: {
      vi: 'HPR = (Giá cuối kỳ − Giá đầu kỳ + Cổ tức) ÷ Giá đầu kỳ × 100',
      en: 'HPR = (Ending price − Starting price + Dividend) ÷ Starting price × 100',
    },
    substitution: '({endPrice} − {startPrice} + {dividend}) ÷ {startPrice} × 100',
    symbols: [
      { latex: 'HPR', meaning: { vi: 'lợi suất kỳ nắm giữ, %', en: 'holding period return, %' } },
      { latex: 'P_{cuoi}', meaning: { vi: 'giá cuối kỳ, ₫', en: 'ending price, ₫' } },
      { latex: 'P_{dau}', meaning: { vi: 'giá đầu kỳ, ₫', en: 'starting price, ₫' } },
      {
        latex: 'D',
        meaning: {
          vi: 'cổ tức nhận trong kỳ, ₫ mỗi cổ phiếu',
          en: 'dividends received during the period, ₫ per share',
        },
      },
      { latex: '100', meaning: { vi: 'đổi ra phần trăm', en: 'converts to percent' } },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['hpr', 'loi suat', 'ky nam giu', 'co tuc'],
    /*
     * Hình tròn của tử số: tiền lời mỗi cổ phiếu đến từ chênh giá bao nhiêu, từ cổ tức bao nhiêu
     * (22/10/2026). Giá giảm thì múi chênh giá âm, mục vắng — kể cả khi cổ tức kéo HPR lên dương.
     */
    composition: {
      title: { vi: 'Cơ cấu tiền lời mỗi cổ phiếu', en: 'Gain per share breakdown' },
      /*
       * Nhãn ngắn 26/10/2026: dài hơn 19 ký tự là bị cắt trên hình thanh ngang. Múi cổ tức có nhãn
       * riêng thay cho nhãn ô nhập "Cổ tức nhận trong kỳ (D)".
       */
      total: { vi: 'Tổng lời mỗi CP', en: 'Total gain/share' },
      unit: '₫/CP',
      parts: [
        { key: 'priceGain', label: { vi: 'Lời từ chênh giá', en: 'Price gain' } },
        { key: 'dividend', label: { vi: 'Cổ tức (D)', en: 'Dividend (D)' } },
      ],
    },
    resultUnit: '%',
    variables: [
      numberVar(
        'startPrice',
        { vi: 'Giá đầu kỳ (Pdau)', en: 'Starting price (Pdau)' },
        '₫',
        78_000,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Giá một cổ phiếu ở đầu kỳ nắm giữ, thường là giá mua vào. Phải lớn hơn 0.',
            en: 'The share price at the start of the holding period, usually the purchase price. Must be greater than 0.',
          },
        },
      ),
      numberVar(
        'endPrice',
        { vi: 'Giá cuối kỳ (Pcuoi)', en: 'Ending price (Pcuoi)' },
        '₫',
        92_000,
        {
          min: 0,
          max: 10_000_000,
          description: {
            vi: 'Giá một cổ phiếu ở cuối kỳ nắm giữ: giá bán ra, hoặc thị giá hiện tại nếu vẫn đang giữ.',
            en: 'The share price at the end of the holding period: the sale price, or the current market price if you still hold it.',
          },
        },
      ),
      numberVar(
        'dividend',
        { vi: 'Cổ tức nhận trong kỳ (D)', en: 'Dividends received during the period (D)' },
        '₫/CP',
        2_000,
        {
          min: 0,
          max: 1_000_000,
          description: {
            vi: 'Tổng cổ tức tiền mặt trên mỗi cổ phiếu trong kỳ nắm giữ.',
            en: 'Total cash dividends per share received during the holding period.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Trong kỳ nắm giữ, mỗi trăm đồng bỏ ra mua cổ phiếu mang lại bao nhiêu đồng — tính cả phần giá lên xuống lẫn cổ tức đã nhận.',
        en: 'Over the holding period, how many đồng each hundred đồng spent on the stock returns — counting both the price move and the dividends received.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn vừa bán một cổ phiếu đã giữ qua đợt chia cổ tức tiền mặt và muốn biết tính cả tiền chênh giá lẫn cổ tức thì mình lời được bao nhiêu so với giá mua.',
        en: 'Use it when you have just sold a stock you held through a cash dividend and want to know how much you made against your purchase price, counting both the price gain and the dividends.',
      },
      howToRead: {
        vi: 'So với tiền lãi gửi tiết kiệm cùng số vốn trong đúng thời gian nắm giữ, tính ra phần trăm: cao hơn nghĩa là giữ cổ phiếu, tính cả cổ tức, lời hơn gửi tiền, thấp hơn là kém hơn. Số âm nghĩa là cổ tức nhận được chưa bù nổi phần giá đã giảm.',
        en: 'Compared with the savings interest the same money would have earned over exactly the holding period, as a percentage: higher means holding the stock, dividends included, paid better than a deposit, and lower means worse. A negative figure means the dividends received did not make up for the fall in price.',
      },
      commonMistakes: {
        vi: 'Nhầm HPR với ROI. ROI chỉ nhìn chênh lệch giá trị; HPR cộng thêm dòng tiền cổ tức.',
        en: 'Confusing HPR with ROI. ROI only looks at the change in value; HPR also adds in the dividend cash flow.',
      },
    },
    example: {
      title: {
        vi: 'FPT — giá 62.900 ₫ ngày 24/07/2026 lên 72.700 ₫ ngày 11/09/2026, trong kỳ không có cổ tức',
        en: 'FPT — 62,900 ₫ on 2026-07-24 rising to 72,700 ₫ on 2026-09-11, with no dividend in the period',
      },
      inputs: { startPrice: 62_900, endPrice: 72_700, dividend: 0 },
      expected: 15.5803,
      note: {
        vi: 'So với giá mua 62.900 ₫ một cổ phiếu FPT: sau 49 ngày mỗi cổ phiếu lời 9.800 ₫, tức 15,58% tiền bỏ ra, và toàn bộ phần lời ấy đến từ giá vì trong kỳ không có cổ tức. Đây là mức lời của riêng 49 ngày, chưa trừ phí mua bán và thuế, không phải mức lời một năm.',
        en: 'Compared with the 62,900 ₫ paid for one FPT share: after 49 days each share had gained 9,800 ₫, or 15.58% of the money put in, and all of that gain came from the price because no dividend was paid in the period. This is the gain for those 49 days alone, before trading fees and taxes, not a yearly gain.',
      },
      source: {
        vi: 'Giá đóng cửa FPT trên Investing.com, phiên 24/07/2026 và 11/09/2026; đợt chốt quyền cổ tức gần nhất 02/12/2025.',
        en: 'FPT closing prices on Investing.com, the 2026-07-24 and 2026-09-11 sessions; the most recent ex-dividend date was 2025-12-02.',
      },
    },
    tests: [
      {
        name: 'có cổ tức',
        inputs: { startPrice: 78_000, endPrice: 92_000, dividend: 2_000 },
        expected: 20.51,
      },
      {
        name: 'không cổ tức thì trùng với lợi suất giá thuần',
        inputs: { startPrice: 78_000, endPrice: 92_000, dividend: 0 },
        expected: 17.95,
      },
      {
        name: 'giá đầu kỳ bằng 0 thì không tính được',
        inputs: { startPrice: 0, endPrice: 92_000, dividend: 0 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const start = v('startPrice');
    if (start === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'HPR', en: 'HPR' },
          { vi: 'Giá đầu kỳ', en: 'starting price' },
          { vi: 'Nhập giá đầu kỳ lớn hơn 0.', en: 'Enter a starting price greater than 0.' },
        ),
      };
    }
    /* Múi thứ nhất của hình "Cơ cấu tiền lời mỗi cổ phiếu"; thứ tự phép tính giữ như cũ. */
    const priceGain = v('endPrice') - start;
    return ok(((priceGain + v('dividend')) / start) * 100, '%', { extras: { priceGain } });
  },
};

/*
 * ── 3. CAGR ────────────────────────────────────────────────────────────────────────────
 */

export const CAGR: FormulaModule = {
  spec: {
    id: 'cagr',
    categoryId: 'returns',
    name: { vi: 'CAGR — tăng trưởng kép hằng năm', en: 'CAGR — compound annual growth rate' },
    description: {
      vi: 'Tốc độ tăng trưởng bình quân mỗi năm của một khoản đầu tư.',
      en: 'The average annual growth rate of an investment.',
    },
    latex: 'CAGR = \\left(\\frac{V_{cuoi}}{V_{dau}}\\right)^{1/t} - 1',
    expression: {
      vi: 'CAGR = (Giá trị cuối ÷ Giá trị đầu)^(1 ÷ Số năm) − 1',
      en: 'CAGR = (Ending value ÷ Starting value)^(1 ÷ Number of years) − 1',
    },
    substitution: '(({end} ÷ {start})^(1 ÷ {years}) − 1) × 100',
    symbols: [
      {
        latex: 'CAGR',
        meaning: {
          vi: 'tăng trưởng kép bình quân mỗi năm, %/năm',
          en: 'compound annual growth rate, %/year',
        },
      },
      { latex: 'V_{cuoi}', meaning: { vi: 'giá trị cuối kỳ, ₫', en: 'ending value, ₫' } },
      { latex: 'V_{dau}', meaning: { vi: 'giá trị đầu kỳ, ₫', en: 'starting value, ₫' } },
      { latex: 't', meaning: { vi: 'số năm nắm giữ', en: 'number of years held' } },
      {
        latex: '1/t',
        meaning: {
          vi: 'lấy căn bậc t để chia đều mức tăng cho từng năm',
          en: 'the t-th root, which spreads the growth evenly over each year',
        },
      },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['cagr', 'tang truong kep', 'binh quan nam'],
    resultUnit: '%',
    variables: [
      numberVar(
        'start',
        { vi: 'Giá trị ban đầu (Vdau)', en: 'Starting value (Vdau)' },
        '₫',
        100_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Khoản đầu tư đáng giá bao nhiêu ở đầu chặng tính. Phải lớn hơn 0.',
            en: 'What the investment was worth at the start of the period measured. Must be greater than 0.',
          },
        },
      ),
      numberVar(
        'end',
        { vi: 'Giá trị cuối kỳ (Vcuoi)', en: 'Ending value (Vcuoi)' },
        '₫',
        200_000_000,
        {
          min: 0,
          max: 100_000_000_000,
          description: {
            vi: 'Cũng khoản đầu tư ấy đáng giá bao nhiêu ở cuối chặng tính.',
            en: 'What the same investment is worth at the end of the period measured.',
          },
        },
      ),
      sliderVar('years', { vi: 'Số năm (t)', en: 'Number of years (t)' }, 'năm', 5, 1, 50, 1, {
        description: {
          vi: 'Độ dài chặng tính, đếm bằng năm, từ mốc giá trị ban đầu tới mốc giá trị cuối kỳ.',
          en: 'The length of the period measured, in years, from the starting value to the ending value.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Mức tăng trưởng đều mỗi năm mà nếu duy trì sẽ đưa giá trị đầu tới giá trị cuối.',
        en: 'The steady annual growth rate that, if sustained, would carry the starting value to the ending value.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đọc báo cáo quỹ hay xem lại khoản bỏ vào một lần đã giữ nhiều năm, chỉ biết giá trị lúc đầu và bây giờ, và muốn biết bình quân mỗi năm nó tăng bao nhiêu.',
        en: 'Use it when you are reading a fund report or reviewing money you put in once and held for several years, know only its starting and current value, and want its average growth per year.',
      },
      howToRead: {
        vi: 'So với lãi suất tiết kiệm kỳ hạn một năm: cao hơn nghĩa là khoản tiền lớn lên bình quân mỗi năm nhanh hơn gửi ngân hàng, thấp hơn là chậm hơn. Số âm nghĩa là giá trị cuối thấp hơn lúc đầu, bình quân mỗi năm hụt đi chừng ấy phần trăm.',
        en: 'Compared with the one-year savings deposit rate: higher means the money grew faster each year on average than it would in a bank, and lower means slower. A negative figure means the ending value is below the starting value, shrinking by roughly that percentage each year on average.',
      },
      commonMistakes: {
        vi: 'Coi CAGR như lợi suất chắc chắn của năm tới. Nó là số liệu quá khứ đã được làm mượt.',
        en: 'Treating CAGR as a guaranteed return for the coming year. It is a smoothed historical figure.',
      },
    },
    example: {
      title: {
        vi: 'Quỹ VESAF — NAV/CCQ từ 10.000 ₫ lên 33.913 ₫ sau 9,12 năm',
        en: 'The VESAF fund — NAV per unit from 10,000 ₫ to 33,913 ₫ over 9.12 years',
      },
      inputs: { start: 10_000, end: 33_913, years: 9.12 },
      expected: 14.3284,
      note: {
        vi: 'So với NAV 10.000 ₫ mỗi chứng chỉ quỹ lúc VESAF ra đời: sau 9,12 năm NAV lên 33.913 ₫, gấp 3,39 lần, tương đương mỗi năm tăng đều 14,33%. Mức này là của người mua đúng ngày quỹ ra đời và giữ tới 31/05/2026, không có nghĩa năm nào quỹ cũng tăng đúng chừng ấy.',
        en: 'Compared with the 10,000 ₫ NAV per fund unit when VESAF launched: after 9.12 years the NAV stood at 33,913 ₫, 3.39 times as much, which equals a steady rise of 14.33% a year. That rate belongs to someone who bought on the launch day and held until 2026-05-31, and it does not mean the fund rose by exactly that much every year.',
      },
      source: {
        vi: 'Báo cáo tháng 5/2026 của quỹ VESAF (VinaCapital), NAV/CCQ ngày 31/05/2026, quỹ thành lập 18/04/2017.',
        en: 'The VESAF fund (VinaCapital) May 2026 report, NAV per unit as of 2026-05-31; the fund launched on 2017-04-18.',
      },
    },
    tests: [
      {
        name: 'gấp đôi sau 5 năm',
        inputs: { start: 100_000_000, end: 200_000_000, years: 5 },
        expected: 14.87,
      },
      {
        name: 'giảm giá trị thì CAGR âm',
        inputs: { start: 100_000_000, end: 80_000_000, years: 5 },
        expected: -4.36,
      },
      {
        name: 'giá trị ban đầu bằng 0 thì không có tốc độ tăng trưởng',
        inputs: { start: 0, end: 200_000_000, years: 5 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
      {
        // Từ số âm hoặc về số âm thì căn bậc t cho ra số phức — chặn trước khi ra NaN.
        name: 'giá trị cuối âm thì mô hình không dùng được',
        inputs: { start: 100_000_000, end: -20_000_000, years: 5 },
        expected: null,
        expectedWarning: 'MODEL_VIOLATION',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const start = v('start');
    const end = v('end');
    const years = v('years');

    if (start === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'CAGR', en: 'CAGR' },
          { vi: 'Giá trị ban đầu', en: 'starting value' },
          { vi: 'Nhập giá trị ban đầu lớn hơn 0.', en: 'Enter a starting value greater than 0.' },
        ),
      };
    }
    if (years <= 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'CAGR', en: 'CAGR' },
          { vi: 'Số năm', en: 'number of years' },
          { vi: 'Nhập ít nhất 1 năm.', en: 'Enter at least 1 year.' },
        ),
      };
    }
    if (start < 0 || end < 0) {
      return {
        value: null,
        unit: '%',
        warning: {
          code: 'MODEL_VIOLATION',
          message: {
            vi: 'Mô hình không dùng được khi giá trị đầu hoặc cuối là số âm.',
            en: 'The model does not apply when the starting or ending value is negative.',
          },
          fix: {
            vi: 'CAGR chỉ có nghĩa với giá trị dương. Dùng ROI nếu khoản đầu tư đã mất hết vốn.',
            en: 'CAGR is only meaningful for positive values. Use ROI if the investment has lost all its capital.',
          },
        },
      };
    }

    return ok((Math.pow(end / start, 1 / years) - 1) * 100, '%');
  },
};

/*
 * ── 4. Tỷ suất cổ tức ──────────────────────────────────────────────────────────────────
 */

export const TY_SUAT_CO_TUC: FormulaModule = {
  spec: {
    id: 'ty-suat-co-tuc',
    categoryId: 'returns',
    name: { vi: 'Tỷ suất cổ tức', en: 'Dividend yield' },
    description: {
      vi: 'Cổ tức tiền mặt một năm so với thị giá hiện tại của cổ phiếu.',
      en: "Annual cash dividends relative to the stock's current market price.",
    },
    latex: 'DY = \\frac{D}{P} \\times 100',
    expression: {
      vi: 'Tỷ suất cổ tức = Cổ tức cả năm ÷ Thị giá × 100',
      en: 'Dividend yield = Annual dividend ÷ Market price × 100',
    },
    substitution: '{dividendPerShare} ÷ {price} × 100',
    symbols: [
      { latex: 'DY', meaning: { vi: 'tỷ suất cổ tức, %', en: 'dividend yield, %' } },
      {
        latex: 'D',
        meaning: {
          vi: 'cổ tức tiền mặt cả năm, ₫ mỗi cổ phiếu',
          en: 'annual cash dividend, ₫ per share',
        },
      },
      { latex: 'P', meaning: { vi: 'thị giá hiện tại, ₫', en: 'current market price, ₫' } },
      { latex: '100', meaning: { vi: 'đổi ra phần trăm', en: 'converts to percent' } },
    ],
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['ty suat co tuc', 'dividend yield', 'co tuc'],
    resultUnit: '%',
    variables: [
      numberVar('price', { vi: 'Thị giá (P)', en: 'Market price (P)' }, '₫', 92_000, {
        min: 0,
        max: 10_000_000,
        description: {
          vi: 'Giá đóng cửa gần nhất của một cổ phiếu.',
          en: 'The most recent closing price of one share.',
        },
      }),
      numberVar(
        'dividendPerShare',
        { vi: 'Cổ tức cả năm (D)', en: 'Annual dividend (D)' },
        '₫/CP',
        2_000,
        {
          min: 0,
          max: 1_000_000,
          description: {
            vi: 'Tổng cổ tức tiền mặt một cổ phiếu nhận trong năm, tính bằng đồng, cộng mọi đợt, trước thuế. Nghị quyết thường ghi theo tỷ lệ trên mệnh giá 10.000 ₫, nên cổ tức 15% là 1.500 ₫.',
            en: 'Total cash dividend one share receives during the year, in dong, adding up every payment, before tax. Resolutions usually state it as a percentage of the 10.000 ₫ par value, so a 15% dividend is 1.500 ₫.',
          },
        },
      ),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi trăm đồng bỏ ra mua cổ phiếu thì nhận về bao nhiêu đồng cổ tức mỗi năm.',
        en: 'How many đồng in dividends you receive each year for every hundred đồng spent buying the stock.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đang tìm cổ phiếu để giữ lâu nhận cổ tức và muốn biết nếu mua ở giá trên bảng hôm nay thì mỗi năm công ty trả cổ tức được bao nhiêu so với số tiền bỏ ra.',
        en: "Use it when you are looking for a stock to hold for its dividends and want to know, if you buy at today's quoted price, how much the company pays in dividends each year relative to the money you put in.",
      },
      howToRead: {
        vi: 'So với lãi suất tiết kiệm kỳ hạn một năm: cao hơn nghĩa là chỉ riêng tiền cổ tức mỗi năm đã nhiều hơn tiền lãi gửi ngân hàng, thấp hơn là giá cổ phiếu còn phải tăng thêm mới bằng gửi tiền. Kết quả 0 nghĩa là công ty không trả cổ tức tiền mặt.',
        en: 'Compared with the one-year savings deposit rate: higher means the cash dividend alone pays more each year than bank interest, and lower means the share price must also rise to match a deposit. A result of 0 means the company pays no cash dividend.',
      },
      commonMistakes: {
        vi: 'Lấy mức cổ tức công bố mà quên thuế cổ tức bị khấu trừ, nên số thực nhận thấp hơn.',
        en: 'Using the announced dividend amount while forgetting the dividend tax withheld, so the actual amount received is lower.',
      },
    },
    example: {
      title: {
        vi: 'FPT — cổ tức tiền mặt 2.000 ₫/CP/năm trên thị giá 72.700 ₫ ngày 11/09/2026',
        en: 'FPT — a 2,000 ₫/share/year cash dividend against the 72,700 ₫ price on 2026-09-11',
      },
      inputs: { price: 72_700, dividendPerShare: 2_000 },
      expected: 2.751,
      note: {
        vi: 'So với thị giá 72.700 ₫ của FPT: mỗi cổ phiếu được chia 2.000 ₫ cổ tức tiền mặt một năm, tức cứ 100 ₫ bỏ ra mua cổ phiếu thì nhận về 2,75 ₫ cổ tức. Đó là mức trước thuế, trừ 5% thuế cổ tức thì tiền thực nhận còn 1.900 ₫ mỗi cổ phiếu, bằng 2,61% thị giá.',
        en: "Compared with FPT's 72,700 ₫ share price: each share receives a 2,000 ₫ cash dividend a year, so every 100 ₫ spent on the stock brings back 2.75 ₫ in dividends. That is before tax, and after the 5% dividend tax the cash actually received is 1,900 ₫ a share, 2.61% of the price.",
      },
      source: {
        vi: 'Lịch sử cổ tức FPT trên cotuc.vn (mức 20% mệnh giá duy trì từ 2018) và giá đóng cửa phiên 11/09/2026.',
        en: 'FPT dividend history on cotuc.vn (20% of par, held steady since 2018) and the closing price of the 2026-09-11 session.',
      },
    },
    tests: [
      {
        name: 'cổ tức 2.000 trên thị giá 92.000',
        inputs: { price: 92_000, dividendPerShare: 2_000 },
        expected: 2.17,
      },
      {
        name: 'không chia cổ tức thì tỷ suất bằng 0',
        inputs: { price: 92_000, dividendPerShare: 0 },
        expected: 0,
      },
      {
        name: 'thị giá bằng 0 thì không tính được',
        inputs: { price: 0, dividendPerShare: 2_000 },
        expected: null,
        expectedWarning: 'DIVIDE_BY_ZERO',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v) => {
    const price = v('price');
    if (price === 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero(
          { vi: 'tỷ suất cổ tức', en: 'dividend yield' },
          { vi: 'Thị giá', en: 'market price' },
          { vi: 'Nhập thị giá lớn hơn 0.', en: 'Enter a market price greater than 0.' },
        ),
      };
    }
    return ok((v('dividendPerShare') / price) * 100, '%');
  },
};

/*
 * Phần toán thuần của XIRR nằm ở `../xirr.ts` từ 28/10/2026 (Danh mục cần nó mà không cần spec của
 * cả nhóm). Xuất tiếp ở đây để mọi chỗ nhập cũ giữ nguyên.
 */
export type { XirrOptions } from '../xirr';
export { xirr, xirrDiem, xirrNotConverged } from '../xirr';

/*
 * ── 5. XIRR ─────────────────────────────────────────────────────────────────────────────
 *
 * Công thức DUY NHẤT trong Registry đọc `ctx.cashflows` thay vì tính từ `spec.variables` —
 * dòng tiền có ngày là một BẢNG độ dài tuỳ ý, không phải thứ `VariableSpec` biểu diễn được.
 * Bảng ấy sống trong thân riêng `ui/screens/XirrBody.tsx` (xem `hasCustomBody`/`ownsResult` ở
 * `DetailBody.tsx`), nên đây là công thức duy nhất khai `variables: []`.
 *
 * `chartType: 'none'` cố ý: không có tham số tài chính nào để quét — mọi thứ quyết định con số
 * đều nằm trong bảng dòng tiền.
 *
 * ## Ô "Suất sinh lợi khởi điểm" đã BỎ (06/10/2026) — một điều khiển không đổi được gì
 *
 * Trang từng có một thanh trượt `guess` (−50…100 %/năm, mức nâng cao) làm điểm xuất phát cho
 * Newton-Raphson. Chủ dự án kéo nó và hỏi *"sao kéo thả thông số thấy % thay đổi mà chả có gì
 * thay đổi ở xung quanh vậy?"*. Đo lại: **151 điểm xuất phát trên cả dải, bốn bộ dòng tiền khác
 * nhau (gồm cả bộ đổi dấu nhiều lần, tức nhiều nghiệm) — luôn ra đúng MỘT kết quả.**
 *
 * Nguyên do nằm ngay trong `xirr()`: hỏng vòng Newton-Raphson thì nó rơi xuống `bisectXirr`, quét
 * chia đôi cả khoảng −0,9999…10. Khoảng ấy rộng hơn cả dải thanh trượt, nên điểm xuất phát chỉ
 * đổi được SỐ VÒNG LẶP, không đổi được đáp số. Mô tả cũ của ô — *"chỉ chỉnh nếu công thức báo
 * không tìm được suất sinh lợi"* — vì thế là một lời hứa suông: bisection không tìm ra thì không
 * điểm xuất phát nào tìm ra.
 *
 * Nên hạt giống thành hằng số trong `calc`. Giữ đúng 0,1 mà `xirr()` vẫn mặc định, nên không con
 * số nào trên màn đổi theo lượt sửa này.
 */

/**
 * Điểm xuất phát của Newton-Raphson. Hằng số, không phải ô nhập — xem docblock ngay trên.
 *
 * Bằng đúng mặc định của `xirr()`, để hai chỗ không thể nói hai con số khác nhau.
 */
const XIRR_DIEM_XUAT_PHAT = 0.1;

export const XIRR: FormulaModule = {
  spec: {
    id: 'xirr',
    categoryId: 'returns',
    name: { vi: 'XIRR — suất sinh lợi nội tại theo ngày thực', en: 'XIRR' },
    description: {
      vi: 'Suất sinh lợi năm hoá từ một chuỗi dòng tiền vào ra không đều kỳ, tính đúng theo ngày thực.',
      en: 'The annualized rate of return from a series of irregularly timed cash inflows and outflows, computed on actual dates.',
    },
    latex: '\\sum_{i} \\frac{CF_i}{(1+XIRR)^{d_i / 365}} = 0',
    expression: {
      vi: 'Tổng các [Dòng tiền ÷ (1 + XIRR)^(Số ngày kể từ dòng tiền đầu tiên ÷ 365)] = 0',
      en: 'Sum of [Cash flow ÷ (1 + XIRR)^(Days since the first cash flow ÷ 365)] = 0',
    },
    substitutionRepeat: {
      tong: { count: '@n', join: '+', term: '{@cf#} ÷ (1 + {@x})^({@d#} ÷ 365)' },
    },
    substitution: '{tong}',
    substitutionRhs: '0',
    symbols: [
      {
        latex: 'XIRR',
        meaning: {
          vi: 'ẩn số cần tìm, là suất sinh lợi năm hoá làm tổng về 0, %/năm',
          en: 'the unknown, the annualized rate that brings the sum to 0, %/year',
        },
      },
      {
        latex: 'CF_i',
        meaning: {
          vi: 'dòng tiền thứ i: chi ra mang dấu âm, thu về mang dấu dương, ₫',
          en: 'cash flow number i: outflows negative, inflows positive, ₫',
        },
      },
      {
        latex: 'i',
        meaning: {
          vi: 'số thứ tự dòng tiền trong bảng',
          en: 'index of the cash flow in the table',
        },
      },
      {
        latex: 'd_i',
        meaning: {
          vi: 'số ngày từ dòng tiền đầu tiên tới dòng tiền i',
          en: 'days from the first cash flow to cash flow i',
        },
      },
      {
        latex: '365',
        meaning: {
          vi: 'số ngày một năm',
          en: 'days in a year',
        },
      },
    ],
    chartType: 'none',
    level: 'advanced',
    /*
     * FR-20 liệt kê đích danh chín thứ phải lên trang chủ — "phí & thuế giao dịch, giá hoà vốn,
     * ROI, CAGR, XIRR, P/E, P/B, tỷ suất cổ tức, cỡ lệnh" — và tám thứ kia đều đã có đại diện
     * ghim, chỉ XIRR trống. Khối FR-20 cố ý KHÔNG lọc theo chế độ (xem `rankFeaturedIds`), nên
     * `level: 'advanced'` không cản; `ev-ebitda` đã là tiền lệ của đúng cặp này.
     */
    isFeatured: true,
    tags: ['xirr', 'suat sinh loi noi tai', 'dong tien khong deu', 'irr thuc te'],
    resultUnit: '%/năm',
    variables: [],
    explanation: {
      meaning: {
        vi: 'Suất sinh lợi năm hoá của một khoản đầu tư có nhiều lần rót thêm hoặc rút bớt tiền vào những NGÀY KHÔNG ĐỀU nhau — khác IRR thường vốn giả định các kỳ cách đều nhau.',
        en: 'The annualized rate of return of an investment with multiple contributions or withdrawals on IRREGULARLY spaced DATES — unlike ordinary IRR, which assumes evenly spaced periods.',
      },
      whenToUse: {
        vi: 'Dùng khi bạn đã nạp thêm hay rút bớt tiền nhiều lần vào những ngày lệch nhau và muốn biết cả khoản đầu tư đó bình quân mỗi năm lãi bao nhiêu, tính đúng theo ngày.',
        en: 'Use it when you have added or withdrawn money several times on irregular dates and want to know the average yearly return of the whole investment, counted by the actual days.',
      },
      howToRead: {
        vi: 'So với lãi suất tiết kiệm kỳ hạn một năm: cao hơn nghĩa là tính bình quân mỗi năm, cả khoản đầu tư sinh lời hơn gửi ngân hàng, thấp hơn là kém hơn. Số âm nghĩa là gộp mọi lần nạp và rút lại, khoản đầu tư đang lỗ.',
        en: 'Compared with the one-year savings deposit rate: higher means the investment as a whole earned more per year than a bank deposit, and lower means less. A negative figure means that, with every deposit and withdrawal counted, the investment is at a loss.',
      },
      commonMistakes: {
        vi: 'Quên rằng dòng tiền cuối cùng phải là GIÁ TRỊ HIỆN TẠI của khoản đầu tư (một khoản thu về GIẢ ĐỊNH nếu bán hết hôm nay), không phải chỉ tính tới lần rót tiền gần nhất.',
        en: 'Forgetting that the final cash flow must be the CURRENT VALUE of the investment (a HYPOTHETICAL amount received if everything were sold today), not just the most recent contribution.',
      },
    },
    example: {
      title: {
        vi: 'FPT — ba lần mua trong tháng 7 và 8/2026, bán hết 300 CP ngày 11/09/2026',
        en: 'FPT — three purchases across July and August 2026, all 300 shares sold on 2026-09-11',
      },
      inputs: {},
      cashflows: [
        { date: '2026-07-15', amount: -6_680_000 },
        { date: '2026-07-24', amount: -6_290_000 },
        { date: '2026-08-21', amount: -7_200_000 },
        { date: '2026-09-11', amount: 21_810_000 },
      ],
      expected: 96.5541,
      note: {
        vi: 'So với 20.170.000 ₫ bỏ ra qua ba lần mua: bán hết thu về 21.810.000 ₫, lời 1.640.000 ₫, bằng 8,13% số vốn, nhưng mỗi khoản chỉ nằm trong cổ phiếu từ 21 tới 58 ngày nên tính theo năm thành 96,55%/năm. Đó là nhịp lời nếu giữ được tốc độ ấy suốt một năm, không phải phần đã lời thật.',
        en: 'Compared with the 20,170,000 ₫ put in across three purchases: selling everything brought back 21,810,000 ₫, a gain of 1,640,000 ₫ or 8.13% of the money, but each sum stayed in the stock only 21 to 58 days, so on a yearly basis it comes to 96.55%/year. That is the pace of gain if it could be kept up for a full year, not the gain actually made.',
      },
      source: {
        vi: 'Giá đóng cửa FPT trên Investing.com, các phiên 15/07, 24/07, 21/08 và 11/09/2026.',
        en: 'FPT closing prices on Investing.com, the 2026-07-15, 2026-07-24, 2026-08-21 and 2026-09-11 sessions.',
      },
    },
    tests: [
      {
        name: 'một khoản chi và một khoản thu sau đúng một năm — 10%/năm',
        inputs: {},
        cashflows: [
          { date: '2025-01-01', amount: -100_000_000 },
          { date: '2026-01-01', amount: 110_000_000 },
        ],
        expected: 10,
      },
      {
        name: 'lỗ sau một năm thì suất sinh lợi âm — -20%/năm',
        inputs: {},
        cashflows: [
          { date: '2025-01-01', amount: -100_000_000 },
          { date: '2026-01-01', amount: 80_000_000 },
        ],
        expected: -20,
      },
      {
        name: 'chưa đủ hai dòng tiền thì chưa tính được',
        inputs: {},
        cashflows: [{ date: '2025-01-01', amount: -100_000_000 }],
        expected: null,
        expectedWarning: 'INCOMPLETE_INPUT',
      },
      {
        name: 'dòng tiền toàn cùng dấu thì không có nghiệm',
        inputs: {},
        cashflows: [
          { date: '2025-01-01', amount: 100_000 },
          { date: '2026-01-01', amount: 200_000 },
        ],
        expected: null,
        expectedWarning: 'MEANINGLESS',
      },
    ],
    source: [SOURCE_CFA],
  },
  calc: (v, ctx) => {
    const unit = '%/năm';
    const flows = ctx.cashflows ?? [];

    /*
     * `INCOMPLETE_INPUT`, không phải `MISSING_SERIES`: XIRR không đọc `ctx.series`/`ctx.bars`
     * nên không được rơi vào nhóm "cần chuỗi giá" mà `needsPriceSeries()` dò bằng chính mã cảnh
     * báo này — dò trúng sẽ bật nhầm nút "Dán chuỗi giá" (dành cho `ctx.series`) trên trang.
     *
     * Câu viết thẳng, không qua `incompleteInput()` (26/10/2026). Hàm ấy dựng "Còn thiếu: <nhãn ô>.",
     * và "ít nhất 2 dòng tiền" không phải nhãn ô nào: thẻ lỗi in ra "Còn thiếu: ít nhất 2 dòng
     * tiền.", chủ dự án chụp lại và bảo _"chỉ cần text 'Cần tối thiểu 2 dòng tiền'"_.
     */
    if (flows.length < 2) {
      return fail(unit, {
        code: 'INCOMPLETE_INPUT',
        message: { vi: 'Cần tối thiểu 2 dòng tiền', en: 'At least 2 cash flows are needed' },
      });
    }

    const rate = xirr(flows, { guess: XIRR_DIEM_XUAT_PHAT });
    if (rate === null) return fail(unit, xirrNotConverged());

    /*
     * Cho dải thay số (16/10/2026): nghiệm dạng tỷ lệ (`x`), số dòng (`n`), và từng dòng theo ĐÚNG
     * thứ tự bộ giải — tiền `cfᵢ`, số ngày `dᵢ` kể từ dòng đầu. Dải in lại phương trình với nghiệm
     * thay vào và "≈ 0".
     */
    const extras: Record<string, number> = { x: rate };
    const diem = xirrDiem(flows) ?? [];
    extras['n'] = diem.length;
    diem.forEach((d, i) => {
      extras[`cf${i + 1}`] = d.amount;
      extras[`d${i + 1}`] = d.days;
    });
    return ok(rate * 100, unit, { extras });
  },
};

/** Năm công thức lợi nhuận đã đăng ký. */
export const RETURN_FORMULAS: ReadonlyArray<FormulaModule> = [ROI, HPR, CAGR, TY_SUAT_CO_TUC, XIRR];
