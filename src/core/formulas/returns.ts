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
        vi: 'ROI không tính tới thời gian: 25% trong một năm và 25% trong năm năm là hai chuyện rất khác nhau.',
        en: 'ROI does not account for time: a 25% return in one year and a 25% return over five years are very different things.',
      },
      commonMistakes: {
        vi: 'Dùng ROI để so hai khoản có thời gian nắm giữ khác nhau. Muốn so thì dùng CAGR.',
        en: 'Using ROI to compare two investments with different holding periods. Use CAGR instead for that comparison.',
      },
    },
    example: {
      title: {
        vi: 'Bỏ ra 100 triệu ₫, nay còn 125 triệu ₫',
        en: 'Invested 100 million ₫, now worth 125 million ₫',
      },
      inputs: { cost: 100_000_000, current: 125_000_000 },
      expected: 25,
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
        vi: 'Tổng lợi ích thu được trên một cổ phiếu trong kỳ, gồm cả lãi giá lẫn cổ tức.',
        en: 'The total benefit earned per share over the period, including both price gains and dividends.',
      },
      whenToUse: {
        vi: 'Khi chốt lại một khoản đã bán và muốn tính trọn cả lãi giá lẫn cổ tức đã nhận trong suốt thời gian nắm giữ.',
        en: 'When closing out a position that has been sold and you want to capture the full return — price gains plus dividends received throughout the holding period.',
      },
      howToRead: {
        vi: 'Cao hơn tỷ suất tính theo giá thuần đúng bằng phần cổ tức, nên cổ phiếu cổ tức cao nhìn khác hẳn.',
        en: 'It exceeds the return based on price alone by exactly the dividend portion, so high-dividend stocks look quite different under HPR.',
      },
      commonMistakes: {
        vi: 'Nhầm HPR với ROI. ROI chỉ nhìn chênh lệch giá trị; HPR cộng thêm dòng tiền cổ tức.',
        en: 'Confusing HPR with ROI. ROI only looks at the change in value; HPR also adds in the dividend cash flow.',
      },
    },
    example: {
      title: {
        vi: 'Mua 78.000 ₫, bán 92.000 ₫, nhận cổ tức 2.000 ₫',
        en: 'Bought at 78,000 ₫, sold at 92,000 ₫, received 2,000 ₫ in dividends',
      },
      inputs: { startPrice: 78_000, endPrice: 92_000, dividend: 2_000 },
      expected: 20.51,
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
        vi: 'Là con số đã san phẳng: thực tế từng năm có thể lên xuống mạnh quanh mức bình quân này.',
        en: 'It is a smoothed figure: actual year-by-year results can swing widely around this average.',
      },
      commonMistakes: {
        vi: 'Coi CAGR như lợi suất chắc chắn của năm tới. Nó là số liệu quá khứ đã được làm mượt.',
        en: 'Treating CAGR as a guaranteed return for the coming year. It is a smoothed historical figure.',
      },
    },
    example: {
      title: {
        vi: 'Từ 100 triệu ₫ lên 200 triệu ₫ sau 5 năm',
        en: 'From 100 million ₫ to 200 million ₫ over 5 years',
      },
      inputs: { start: 100_000_000, end: 200_000_000, years: 5 },
      expected: 14.87,
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
        vi: 'Tỷ suất cao bất thường thường do giá vừa giảm mạnh, chứ không hẳn do doanh nghiệp hào phóng.',
        en: 'An unusually high yield is often the result of a sharp price drop, not necessarily generous dividends from the company.',
      },
      commonMistakes: {
        vi: 'Lấy mức cổ tức công bố mà quên thuế cổ tức bị khấu trừ, nên số thực nhận thấp hơn.',
        en: 'Using the announced dividend amount while forgetting the dividend tax withheld, so the actual amount received is lower.',
      },
    },
    example: {
      title: {
        vi: 'Thị giá 92.000 ₫, cổ tức 2.000 ₫/CP/năm',
        en: 'Market price 92,000 ₫, dividend 2,000 ₫/share/year',
      },
      inputs: { price: 92_000, dividendPerShare: 2_000 },
      expected: 2.17,
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
      vi: 'Kiểm tra lại: cần ít nhất một khoản chi ra và một khoản thu về, kèm ngày đúng thứ tự.',
      en: 'Check again: you need at least one outflow and one inflow, with dates in the correct order.',
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
      vi: 'Tổng các dòng tiền, mỗi cái chiết khấu theo XIRR và đúng số ngày thực kể từ dòng đầu tiên = 0',
      en: 'The sum of all cash flows, each discounted at XIRR over the actual number of days since the first cash flow, equals 0',
    },
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
        vi: 'Đọc như một mức lãi suất kép mỗi năm. Cao hơn lãi suất tiết kiệm là khoản đầu tư đang thắng; khác IRR thường, XIRR không đòi các kỳ cách đều.',
        en: 'Read it as a compound annual interest rate. Higher than the savings rate means the investment is winning; unlike ordinary IRR, XIRR does not require evenly spaced periods.',
      },
      commonMistakes: {
        vi: 'Quên rằng dòng tiền cuối cùng phải là GIÁ TRỊ HIỆN TẠI của khoản đầu tư (một khoản thu về GIẢ ĐỊNH nếu bán hết hôm nay), không phải chỉ tính tới lần rót tiền gần nhất.',
        en: 'Forgetting that the final cash flow must be the CURRENT VALUE of the investment (a HYPOTHETICAL amount received if everything were sold today), not just the most recent contribution.',
      },
    },
    example: {
      title: {
        vi: 'Đầu tư 100 triệu ₫, sau đúng một năm giá trị thành 110 triệu ₫',
        en: 'Invested 100 million ₫; after exactly one year the value became 110 million ₫',
      },
      inputs: { guess: 10 },
      cashflows: [
        { date: '2025-01-01', amount: -100_000_000 },
        { date: '2026-01-01', amount: 110_000_000 },
      ],
      expected: 10,
      note: {
        vi: 'Chỉ một khoản đầu, một khoản thu sau đúng một năm — XIRR trùng với lãi suất kép thông thường.',
        en: 'Just one investment and one payout exactly one year later — XIRR coincides with an ordinary compound interest rate.',
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
