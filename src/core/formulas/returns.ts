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
import type { Cashflow } from '../cashflow-series';
import type { CalcWarning } from '../types';
import { divideByZero, incompleteInput, meaningless } from '../warnings';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/*
 * ── 1. ROI ─────────────────────────────────────────────────────────────────────────────
 */

export const ROI: FormulaModule = {
  spec: {
    id: 'roi',
    categoryId: 'returns',
    name: { vi: 'ROI — tỷ suất lợi nhuận', en: 'Return on investment' },
    description: {
      vi: 'Phần trăm lãi hoặc lỗ so với số vốn đã bỏ ra.',
      en: 'The percentage gain or loss relative to the capital invested.',
    },
    latex: 'ROI = \\frac{V_{cuoi} - V_{dau}}{V_{dau}} \\times 100',
    expression: {
      vi: 'ROI = (Giá trị hiện tại − Vốn bỏ ra) ÷ Vốn bỏ ra × 100',
      en: 'ROI = (Current value − Capital invested) ÷ Capital invested × 100',
    },
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
      numberVar('cost', { vi: 'Vốn bỏ ra', en: 'Capital invested' }, '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Tổng số tiền đã đầu tư ban đầu.',
          en: 'The total amount originally invested.',
        },
      }),
      numberVar('current', { vi: 'Giá trị hiện tại', en: 'Current value' }, '₫', 125_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: {
          vi: 'Giá trị của khoản đầu tư tại thời điểm đánh giá.',
          en: 'The value of the investment at the time of evaluation.',
        },
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi trăm đồng bỏ ra đang sinh ra bao nhiêu đồng lãi.',
        en: 'How much profit each hundred đồng invested is generating.',
      },
      whenToUse: {
        vi: 'Khi so sánh nhanh hiệu quả giữa các khoản đầu tư có quy mô khác nhau.',
        en: 'For a quick comparison of performance between investments of different sizes.',
      },
      howToRead: {
        vi: '25% nghĩa là 100 triệu ₫ bỏ ra nay thành 125 triệu ₫ — cứ 100 đồng vốn lãi thêm 25 đồng. Số âm là đang lỗ, 0% là vừa đủ hoà vốn; muốn biết hơn kém thì so với lãi suất tiết kiệm của đúng khoảng thời gian ấy.',
        en: 'A value of 25% means 100 million ₫ put in is now 125 million ₫ — every 100 đồng of capital earned 25 đồng more. A negative figure means a loss and 0% means exactly break-even; to judge it, compare against a savings rate over the same span of time.',
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
        vi: 'ROI không có chiều thời gian: một kỳ 49 ngày và một kỳ 5 năm vẫn cho cùng con số. Muốn so sánh công bằng thì dùng CAGR hoặc lợi suất quy năm, và nhớ rằng ROI chưa trừ phí lẫn thuế.',
        en: 'ROI carries no sense of time: a 49-day holding and a five-year one produce the same figure. For a fair comparison use CAGR or an annualized return, and remember ROI leaves out fees and taxes.',
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
    name: { vi: 'HPR — lợi suất kỳ nắm giữ', en: 'Holding period return' },
    description: {
      vi: 'Lợi suất một kỳ nắm giữ, tính cả chênh lệch giá lẫn cổ tức nhận được.',
      en: 'The holding-period return, including both the price change and dividends received.',
    },
    latex: 'HPR = \\frac{P_{cuoi} - P_{dau} + D}{P_{dau}} \\times 100',
    expression: {
      vi: 'HPR = (Giá cuối kỳ − Giá đầu kỳ + Cổ tức) ÷ Giá đầu kỳ × 100',
      en: 'HPR = (Ending price − Starting price + Dividend) ÷ Starting price × 100',
    },
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
    resultUnit: '%',
    variables: [
      numberVar('startPrice', { vi: 'Giá đầu kỳ', en: 'Starting price' }, '₫', 78_000, {
        min: 0,
        max: 10_000_000,
      }),
      numberVar('endPrice', { vi: 'Giá cuối kỳ', en: 'Ending price' }, '₫', 92_000, {
        min: 0,
        max: 10_000_000,
      }),
      numberVar(
        'dividend',
        { vi: 'Cổ tức nhận trong kỳ', en: 'Dividends received during the period' },
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
        vi: 'Khi chốt lại một khoản đã bán và muốn tính trọn cả lãi giá lẫn cổ tức đã nhận trong suốt thời gian nắm giữ.',
        en: 'When closing out a position that has been sold and you want to capture the full return — price gains plus dividends received throughout the holding period.',
      },
      howToRead: {
        vi: 'Cao hơn tỷ suất tính trên giá thuần — tức (Giá cuối kỳ − Giá đầu kỳ) ÷ Giá đầu kỳ — đúng bằng phần cổ tức chia cho giá đầu kỳ: ví dụ trên màn ra 20,51%, còn bỏ cổ tức đi chỉ còn 17,95%.',
        en: 'It exceeds the price-only return — (Ending price − Starting price) ÷ Starting price — by exactly the dividend divided by the starting price: the example above gives 20.51%, while dropping the dividend leaves 17.95%.',
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
        vi: 'Cổ tức bằng 0 nên HPR trùng khít ROI — hai bên chỉ tách nhau khi trong kỳ có đợt chốt quyền. Nắm qua một đợt cổ tức 1.000 ₫/CP thì HPR lên 17,17% trong khi lợi suất chỉ theo giá vẫn giữ nguyên.',
        en: 'With a zero dividend, HPR lands exactly on ROI — the two only part ways when an ex-dividend date falls inside the period. Holding through a 1,000 ₫/share payout would lift HPR to 17.17% while the price-only return stays where it is.',
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
    return ok(((v('endPrice') - start + v('dividend')) / start) * 100, '%');
  },
};

/*
 * ── 3. CAGR ────────────────────────────────────────────────────────────────────────────
 */

export const CAGR: FormulaModule = {
  spec: {
    id: 'cagr',
    categoryId: 'returns',
    name: { vi: 'CAGR — tăng trưởng kép hằng năm', en: 'Compound annual growth rate' },
    description: {
      vi: 'Tốc độ tăng trưởng bình quân mỗi năm của một khoản đầu tư.',
      en: 'The average annual growth rate of an investment.',
    },
    latex: 'CAGR = \\left(\\frac{V_{cuoi}}{V_{dau}}\\right)^{1/t} - 1',
    expression: {
      vi: 'CAGR = (Giá trị cuối ÷ Giá trị đầu)^(1 ÷ Số năm) − 1',
      en: 'CAGR = (Ending value ÷ Starting value)^(1 ÷ Number of years) − 1',
    },
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
      numberVar('start', { vi: 'Giá trị ban đầu', en: 'Starting value' }, '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
      }),
      numberVar('end', { vi: 'Giá trị cuối kỳ', en: 'Ending value' }, '₫', 200_000_000, {
        min: 0,
        max: 100_000_000_000,
      }),
      sliderVar('years', { vi: 'Số năm', en: 'Number of years' }, 'năm', 5, 1, 50, 1),
    ],
    explanation: {
      meaning: {
        vi: 'Mức tăng trưởng đều mỗi năm mà nếu duy trì sẽ đưa giá trị đầu tới giá trị cuối.',
        en: 'The steady annual growth rate that, if sustained, would carry the starting value to the ending value.',
      },
      whenToUse: {
        vi: 'Khi so sánh các khoản đầu tư có thời gian nắm giữ khác nhau.',
        en: 'When comparing investments with different holding periods.',
      },
      howToRead: {
        vi: 'Con số là mức tăng đều mỗi năm: 14,87% nghĩa là 100 triệu ₫ tăng 14,87% mỗi năm thì sau 5 năm thành 200 triệu ₫. Số âm nghĩa là vốn co lại đều mỗi năm; đem so với lãi suất tiết kiệm cùng kỳ hạn để biết nhanh hay chậm.',
        en: 'The figure is the steady per-year rate: 14.87% means 100 million ₫ growing 14.87% a year becomes 200 million ₫ after 5 years. A negative figure means the capital shrinks every year; compare it against a savings rate of the same term to see whether it is fast or slow.',
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
        vi: 'Con số khớp mức tăng luỹ kế +239,1% in trên cùng bản báo cáo. Đây là tốc độ tăng ĐỀU giả định chứ không phải năm nào quỹ cũng lãi chừng ấy — riêng ba tháng gần nhất quỹ âm 5,9%.',
        en: 'The figure matches the +239.1% cumulative gain printed in the same report. It is an assumed STEADY growth rate, not a return earned in every single year — the latest three months were down 5.9%.',
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
      numberVar('price', { vi: 'Thị giá', en: 'Market price' }, '₫', 92_000, {
        min: 0,
        max: 10_000_000,
      }),
      numberVar('dividendPerShare', { vi: 'Cổ tức cả năm', en: 'Annual dividend' }, '₫/CP', 2_000, {
        min: 0,
        max: 1_000_000,
      }),
    ],
    explanation: {
      meaning: {
        vi: 'Mỗi trăm đồng bỏ ra mua cổ phiếu thì nhận về bao nhiêu đồng cổ tức mỗi năm.',
        en: 'How many đồng in dividends you receive each year for every hundred đồng spent buying the stock.',
      },
      whenToUse: {
        vi: 'Khi tìm cổ phiếu tạo dòng tiền đều, so với lãi suất tiết kiệm ngân hàng.',
        en: 'When looking for stocks that generate steady cash flow, comparable to a bank savings rate.',
      },
      howToRead: {
        vi: '2,17% nghĩa là bỏ ra 100.000 ₫ mua cổ phiếu thì một năm nhận về 2.170 ₫ tiền mặt, trước thuế. Tỷ suất cao bất thường thường do giá vừa giảm mạnh chứ không hẳn do doanh nghiệp hào phóng.',
        en: 'A value of 2.17% means 100,000 ₫ spent on the stock returns 2,170 ₫ in cash over a year, before tax. An unusually high yield is often the result of a sharp price drop rather than a generous company.',
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
        vi: 'Chưa bằng một nửa lãi suất tiết kiệm 12 tháng 6,8%/năm, lại còn bị khấu trừ 5% thuế cổ tức trong khi lãi tiết kiệm được miễn. Tỷ suất này còn đổi theo giá: ở mức 62.900 ₫ nó là 3,18%.',
        en: 'Less than half the 6.8%/year twelve-month savings rate, and it is docked 5% dividend tax while deposit interest is exempt. The yield also moves with the price: at 62,900 ₫ it would be 3.18%.',
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
 * ── XIRR — phần toán đã xong, chờ chỗ nhập dòng tiền ───────────────────────────────────
 */

export interface XirrOptions {
  /** Suất sinh lợi khởi điểm cho Newton-Raphson. */
  guess?: number;
  maxIterations?: number;
  /** Ngưỡng coi là đã hội tụ, tính trên giá trị hiện tại ròng. */
  tolerance?: number;
}

const DAYS_PER_YEAR = 365;

/**
 * Suất sinh lợi nội tại theo dòng tiền có ngày thực (XIRR).
 *
 * Newton-Raphson trước cho nhanh, rơi về chia đôi khi đạo hàm quá nhỏ hoặc bước nhảy văng ra
 * ngoài — WBS 5.1.3 ghi rõ phải có dự phòng, vì Newton một mình không hội tụ với dòng tiền
 * đổi dấu nhiều lần.
 *
 * Trả null khi bài toán không có nghiệm hợp lệ; nơi gọi đổi thành cảnh báo, không coi là 0.
 */
export function xirr(cashflows: ReadonlyArray<Cashflow>, options: XirrOptions = {}): number | null {
  const { guess = 0.1, maxIterations = 100, tolerance = 1e-7 } = options;

  if (cashflows.length < 2) return null;
  const hasPositive = cashflows.some((c) => c.amount > 0);
  const hasNegative = cashflows.some((c) => c.amount < 0);
  // Không đổi dấu thì không có suất sinh lợi nào làm giá trị hiện tại về 0.
  if (!hasPositive || !hasNegative) return null;

  const sorted = [...cashflows].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  if (first === undefined) return null;

  const start = Date.parse(`${first.date}T00:00:00Z`);
  if (Number.isNaN(start)) return null;

  const points: Array<{ years: number; amount: number }> = [];
  for (const flow of sorted) {
    const at = Date.parse(`${flow.date}T00:00:00Z`);
    if (Number.isNaN(at)) return null;
    points.push({ years: (at - start) / 86_400_000 / DAYS_PER_YEAR, amount: flow.amount });
  }

  const npv = (rate: number): number =>
    points.reduce((sum, p) => sum + p.amount / Math.pow(1 + rate, p.years), 0);

  // Newton-Raphson.
  let rate = guess;
  for (let i = 0; i < maxIterations; i += 1) {
    const value = npv(rate);
    if (Math.abs(value) < tolerance) return rate;

    const slope = points.reduce(
      (sum, p) => sum - (p.years * p.amount) / Math.pow(1 + rate, p.years + 1),
      0,
    );
    if (!Number.isFinite(slope) || Math.abs(slope) < 1e-12) break;

    const next = rate - value / slope;
    if (!Number.isFinite(next) || next <= -1) break;
    if (Math.abs(next - rate) < 1e-12) return next;
    rate = next;
  }

  return bisectXirr(npv);
}

/** Dự phòng: quét một khoảng rộng tìm chỗ đổi dấu rồi chia đôi. Chậm hơn nhưng chắc chắn. */
function bisectXirr(npv: (rate: number) => number): number | null {
  let low = -0.9999;
  let high = 10;

  let fLow = npv(low);
  let fHigh = npv(high);
  if (!Number.isFinite(fLow) || !Number.isFinite(fHigh)) return null;
  if (fLow * fHigh > 0) return null;

  for (let i = 0; i < 200; i += 1) {
    const mid = (low + high) / 2;
    const fMid = npv(mid);
    if (!Number.isFinite(fMid)) return null;
    if (Math.abs(fMid) < 1e-9 || high - low < 1e-12) return mid;

    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  return (low + high) / 2;
}

/** Cảnh báo dùng khi XIRR không hội tụ. */
export function xirrNotConverged(): CalcWarning {
  return meaningless(
    {
      vi: 'Không tìm được suất sinh lợi phù hợp với chuỗi dòng tiền này.',
      en: 'No rate of return could be found for this cash flow series.',
    },
    {
      /*
       * Hai nguyên nhân dẫn tới cùng một lời từ chối, và câu gợi ý phải nói cả hai: dòng tiền
       * không đổi dấu (thiếu chi hoặc thiếu thu), HOẶC nghiệm nằm ngoài khoảng `bisectXirr` quét
       * ([−99,99%; 1.000%]/năm). Ca thứ hai rất dễ gặp với quãng vài ngày — lỗ 20% trong một tuần
       * quy ra năm đã vượt trần — và câu cũ chỉ nêu nguyên nhân thứ nhất, tức bảo người dùng đi
       * kiểm thứ vốn đã đúng.
       */
      vi: 'Kiểm tra lại: cần ít nhất một khoản chi ra và một khoản thu về, kèm ngày đúng thứ tự. Nếu đã đủ cả hai thì lãi hoặc lỗ đang nằm trong quãng ngày quá ngắn để quy ra suất sinh lợi năm — với quãng vài ngày, ROI hoặc HPR đọc dễ hơn.',
      en: 'Check again: you need at least one outflow and one inflow, with dates in the correct order. If both are already there, the gain or loss sits in too short a span of days to annualize — over a few days, ROI or HPR reads more easily.',
    },
  );
}

/*
 * ── 5. XIRR ─────────────────────────────────────────────────────────────────────────────
 *
 * Công thức DUY NHẤT trong Registry đọc `ctx.cashflows` thay vì tính từ `spec.variables` —
 * dòng tiền có ngày là một BẢNG độ dài tuỳ ý, không phải thứ `VariableSpec` biểu diễn được.
 * Biến `guess` là tham số duy nhất thật sự đi qua ô nhập chuẩn; bảng dòng tiền sống trong
 * thân riêng `ui/screens/XirrBody.tsx` (xem `hasCustomBody`/`ownsResult` ở `DetailBody.tsx`).
 *
 * `chartType: 'none'` cố ý: biến duy nhất sweep được là điểm xuất phát của Newton-Raphson,
 * không phải một tham số tài chính — quét nó không nói lên điều gì về khoản đầu tư.
 */

const XIRR_GUESS_VAR = sliderVar(
  'guess',
  { vi: 'Suất sinh lợi khởi điểm', en: 'Initial rate guess' },
  '%/năm',
  10,
  -50,
  100,
  1,
  {
    level: 'advanced',
    description: {
      vi: 'Điểm xuất phát cho thuật toán tìm nghiệm. Hiếm khi cần đổi — chỉ chỉnh nếu công thức báo không tìm được suất sinh lợi.',
      en: 'The starting point for the solver algorithm. Rarely needs changing — adjust it only if the formula reports that it could not find a rate of return.',
    },
  },
);

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
          vi: 'số ngày một năm, để quy số ngày ra năm',
          en: 'days in a year, turning days into years',
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
    variables: [XIRR_GUESS_VAR],
    explanation: {
      meaning: {
        vi: 'Suất sinh lợi năm hoá của một khoản đầu tư có nhiều lần rót thêm hoặc rút bớt tiền vào những NGÀY KHÔNG ĐỀU nhau — khác IRR thường vốn giả định các kỳ cách đều nhau.',
        en: 'The annualized rate of return of an investment with multiple contributions or withdrawals on IRREGULARLY spaced DATES — unlike ordinary IRR, which assumes evenly spaced periods.',
      },
      whenToUse: {
        vi: 'Khi đầu tư định kỳ không đều (góp thêm lệch tháng, rút một phần giữa chừng), hoặc cần so một danh mục thực tế với một kênh đầu tư khác theo đúng ngày thực đã xảy ra.',
        en: "When investing on an irregular schedule (contributions that don't line up monthly, partial withdrawals along the way), or when comparing an actual portfolio against another investment channel using the real dates involved.",
      },
      howToRead: {
        vi: 'Đọc như một mức lãi suất kép mỗi năm, đem so với lãi suất tiết kiệm cùng kỳ hạn: một khoản thành gấp đôi sau đúng một năm ứng với XIRR khoảng 100%/năm. Quãng giữa các dòng tiền càng ngắn thì con số quy ra năm càng bị phóng đại — lãi 7% trong hai ngày đã thành hàng triệu %/năm.',
        en: 'Read it as a compound annual interest rate and compare it against a savings rate of the same term: an amount doubling after exactly one year corresponds to an XIRR of roughly 100%/year. The shorter the span between cash flows, the more the annualized figure is magnified — a 7% gain over two days already becomes millions of percent per year.',
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
      inputs: { guess: 10 },
      cashflows: [
        { date: '2026-07-15', amount: -6_680_000 },
        { date: '2026-07-24', amount: -6_290_000 },
        { date: '2026-08-21', amount: -7_200_000 },
        { date: '2026-09-11', amount: 21_810_000 },
      ],
      expected: 96.5541,
      note: {
        vi: 'XIRR gộp cả ba lần mua theo đúng số ngày thực của từng dòng tiền — việc mà ROI và CAGR không làm được. Kỳ nắm giữ chỉ 22–58 ngày nên con số quy năm bị phóng đại rất mạnh, đọc như một thước so sánh chứ không phải mức kỳ vọng.',
        en: 'XIRR combines all three purchases using the actual number of days behind each cash flow — something ROI and CAGR cannot do. The holding periods run only 22–58 days, so the annualized figure is heavily magnified; read it as a yardstick, not an expectation.',
      },
      source: {
        vi: 'Giá đóng cửa FPT trên Investing.com, các phiên 15/07, 24/07, 21/08 và 11/09/2026.',
        en: 'FPT closing prices on Investing.com, the 2026-07-15, 2026-07-24, 2026-08-21 and 2026-09-11 sessions.',
      },
    },
    tests: [
      {
        name: 'một khoản chi và một khoản thu sau đúng một năm — 10%/năm',
        inputs: { guess: 10 },
        cashflows: [
          { date: '2025-01-01', amount: -100_000_000 },
          { date: '2026-01-01', amount: 110_000_000 },
        ],
        expected: 10,
      },
      {
        name: 'lỗ sau một năm thì suất sinh lợi âm — -20%/năm',
        inputs: { guess: 10 },
        cashflows: [
          { date: '2025-01-01', amount: -100_000_000 },
          { date: '2026-01-01', amount: 80_000_000 },
        ],
        expected: -20,
      },
      {
        name: 'chưa đủ hai dòng tiền thì chưa tính được',
        inputs: { guess: 10 },
        cashflows: [{ date: '2025-01-01', amount: -100_000_000 }],
        expected: null,
        expectedWarning: 'INCOMPLETE_INPUT',
      },
      {
        name: 'dòng tiền toàn cùng dấu thì không có nghiệm',
        inputs: { guess: 10 },
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
     */
    if (flows.length < 2) {
      return fail(
        unit,
        incompleteInput([{ vi: 'ít nhất 2 dòng tiền', en: 'at least 2 cash flows' }]),
      );
    }

    const rate = xirr(flows, { guess: v('guess') / 100 });
    if (rate === null) return fail(unit, xirrNotConverged());

    return ok(rate * 100, unit);
  },
};

/** Năm công thức lợi nhuận đã đăng ký. */
export const RETURN_FORMULAS: ReadonlyArray<FormulaModule> = [ROI, HPR, CAGR, TY_SUAT_CO_TUC, XIRR];
