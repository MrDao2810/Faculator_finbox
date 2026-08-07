/**
 * Tầng DOMAIN — nhóm lợi nhuận & cổ tức (một phần gói WBS 5.1.3).
 *
 * Bốn công thức tính được từ ô nhập số: ROI, HPR, CAGR, tỷ suất cổ tức.
 *
 * XIRR nằm cuối file dưới dạng HÀM THUẦN đã kiểm thử, nhưng **chưa đăng ký thành công thức**:
 * nó cần một bảng dòng tiền có ngày, mà bảng đó là gói WBS 3.3.1 (WF-05) chưa làm. Đăng ký sớm
 * thì màn chi tiết của XIRR lúc nào cũng báo thiếu dữ liệu — thà để phần toán sẵn sàng và nối
 * vào khi có chỗ nhập.
 *
 * SRS nêu đích danh cặp dễ nhầm ROI / HPR: HPR tính cả cổ tức, ROI thì không.
 */

import { ok } from '../calc-output';
import type { FormulaModule } from '../calc/types';
import type { CalcWarning } from '../types';
import { divideByZero, meaningless } from '../warnings';
import { SOURCE_CFA, numberVar, sliderVar } from './shared';

/*
 * ── 1. ROI ─────────────────────────────────────────────────────────────────────────────
 */

export const ROI: FormulaModule = {
  spec: {
    id: 'roi',
    categoryId: 'returns',
    name: { vi: 'ROI — tỷ suất lợi nhuận', en: 'Return on investment' },
    description: 'Phần trăm lãi hoặc lỗ so với số vốn đã bỏ ra.',
    latex: 'ROI = \\frac{V_{cuoi} - V_{dau}}{V_{dau}} \\times 100',
    expression: 'ROI = (Giá trị hiện tại − Vốn bỏ ra) ÷ Vốn bỏ ra × 100',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['roi', 'ty suat loi nhuan', 'hieu qua dau tu'],
    resultUnit: '%',
    variables: [
      numberVar('cost', 'Vốn bỏ ra', '₫', 100_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Tổng số tiền đã đầu tư ban đầu.',
      }),
      numberVar('current', 'Giá trị hiện tại', '₫', 125_000_000, {
        min: 0,
        max: 100_000_000_000,
        description: 'Giá trị của khoản đầu tư tại thời điểm đánh giá.',
      }),
    ],
    explanation: {
      meaning: 'Mỗi trăm đồng bỏ ra đang sinh ra bao nhiêu đồng lãi.',
      whenToUse: 'Khi so sánh nhanh hiệu quả giữa các khoản đầu tư có quy mô khác nhau.',
      howToRead:
        'ROI không tính tới thời gian: 25% trong một năm và 25% trong năm năm là hai chuyện rất khác nhau.',
      commonMistakes:
        'Dùng ROI để so hai khoản có thời gian nắm giữ khác nhau. Muốn so thì dùng CAGR.',
    },
    example: {
      title: 'Bỏ ra 100 triệu ₫, nay còn 125 triệu ₫',
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
        warning: divideByZero('ROI', 'Vốn bỏ ra', 'Nhập số vốn lớn hơn 0.'),
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
    description: 'Lợi suất một kỳ nắm giữ, tính cả chênh lệch giá lẫn cổ tức nhận được.',
    latex: 'HPR = \\frac{P_{cuoi} - P_{dau} + D}{P_{dau}} \\times 100',
    expression: 'HPR = (Giá cuối kỳ − Giá đầu kỳ + Cổ tức) ÷ Giá đầu kỳ × 100',
    chartType: 'sensitivity',
    level: 'basic',
    tags: ['hpr', 'loi suat', 'ky nam giu', 'co tuc'],
    resultUnit: '%',
    variables: [
      numberVar('startPrice', 'Giá đầu kỳ', '₫', 78_000, { min: 0, max: 10_000_000 }),
      numberVar('endPrice', 'Giá cuối kỳ', '₫', 92_000, { min: 0, max: 10_000_000 }),
      numberVar('dividend', 'Cổ tức nhận trong kỳ', '₫/CP', 2_000, {
        min: 0,
        max: 1_000_000,
        description: 'Tổng cổ tức tiền mặt trên mỗi cổ phiếu trong kỳ nắm giữ.',
      }),
    ],
    explanation: {
      meaning: 'Tổng lợi ích thu được trên một cổ phiếu trong kỳ, gồm cả lãi giá lẫn cổ tức.',
      whenToUse: 'Khi đánh giá một cổ phiếu có trả cổ tức đều.',
      howToRead:
        'Cao hơn tỷ suất tính theo giá thuần đúng bằng phần cổ tức, nên cổ phiếu cổ tức cao nhìn khác hẳn.',
      commonMistakes:
        'Nhầm HPR với ROI. ROI chỉ nhìn chênh lệch giá trị; HPR cộng thêm dòng tiền cổ tức.',
    },
    example: {
      title: 'Mua 78.000 ₫, bán 92.000 ₫, nhận cổ tức 2.000 ₫',
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
        warning: divideByZero('HPR', 'Giá đầu kỳ', 'Nhập giá đầu kỳ lớn hơn 0.'),
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
    description: 'Tốc độ tăng trưởng bình quân mỗi năm của một khoản đầu tư.',
    latex: 'CAGR = \\left(\\frac{V_{cuoi}}{V_{dau}}\\right)^{1/t} - 1',
    expression: 'CAGR = (Giá trị cuối ÷ Giá trị đầu)^(1 ÷ Số năm) − 1',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['cagr', 'tang truong kep', 'binh quan nam'],
    resultUnit: '%',
    variables: [
      numberVar('start', 'Giá trị ban đầu', '₫', 100_000_000, { min: 0, max: 100_000_000_000 }),
      numberVar('end', 'Giá trị cuối kỳ', '₫', 200_000_000, { min: 0, max: 100_000_000_000 }),
      sliderVar('years', 'Số năm', 'năm', 5, 1, 50, 1),
    ],
    explanation: {
      meaning: 'Mức tăng trưởng đều mỗi năm mà nếu duy trì sẽ đưa giá trị đầu tới giá trị cuối.',
      whenToUse: 'Khi so sánh các khoản đầu tư có thời gian nắm giữ khác nhau.',
      howToRead:
        'Là con số đã san phẳng: thực tế từng năm có thể lên xuống mạnh quanh mức bình quân này.',
      commonMistakes:
        'Coi CAGR như lợi suất chắc chắn của năm tới. Nó là số liệu quá khứ đã được làm mượt.',
    },
    example: {
      title: 'Từ 100 triệu ₫ lên 200 triệu ₫ sau 5 năm',
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
        warning: divideByZero('CAGR', 'Giá trị ban đầu', 'Nhập giá trị ban đầu lớn hơn 0.'),
      };
    }
    if (years <= 0) {
      return {
        value: null,
        unit: '%',
        warning: divideByZero('CAGR', 'Số năm', 'Nhập ít nhất 1 năm.'),
      };
    }
    if (start < 0 || end < 0) {
      return {
        value: null,
        unit: '%',
        warning: {
          code: 'MODEL_VIOLATION',
          message: 'Mô hình không dùng được khi giá trị đầu hoặc cuối là số âm.',
          fix: 'CAGR chỉ có nghĩa với giá trị dương. Dùng ROI nếu khoản đầu tư đã mất hết vốn.',
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
    description: 'Cổ tức tiền mặt một năm so với thị giá hiện tại của cổ phiếu.',
    latex: 'DY = \\frac{D}{P} \\times 100',
    expression: 'Tỷ suất cổ tức = Cổ tức cả năm ÷ Thị giá × 100',
    chartType: 'sensitivity',
    level: 'basic',
    isFeatured: true,
    tags: ['ty suat co tuc', 'dividend yield', 'co tuc'],
    resultUnit: '%',
    variables: [
      numberVar('price', 'Thị giá', '₫', 92_000, { min: 0, max: 10_000_000 }),
      numberVar('dividendPerShare', 'Cổ tức cả năm', '₫/CP', 2_000, { min: 0, max: 1_000_000 }),
    ],
    explanation: {
      meaning: 'Mỗi trăm đồng bỏ ra mua cổ phiếu thì nhận về bao nhiêu đồng cổ tức mỗi năm.',
      whenToUse: 'Khi tìm cổ phiếu tạo dòng tiền đều, so với lãi suất tiết kiệm ngân hàng.',
      howToRead:
        'Tỷ suất cao bất thường thường do giá vừa giảm mạnh, chứ không hẳn do doanh nghiệp hào phóng.',
      commonMistakes:
        'Lấy mức cổ tức công bố mà quên thuế cổ tức bị khấu trừ, nên số thực nhận thấp hơn.',
    },
    example: {
      title: 'Thị giá 92.000 ₫, cổ tức 2.000 ₫/CP/năm',
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
        warning: divideByZero('tỷ suất cổ tức', 'Thị giá', 'Nhập thị giá lớn hơn 0.'),
      };
    }
    return ok((v('dividendPerShare') / price) * 100, '%');
  },
};

/*
 * ── XIRR — phần toán đã xong, chờ chỗ nhập dòng tiền ───────────────────────────────────
 */

/** Một dòng tiền có ngày. Số âm là tiền chi ra, số dương là tiền thu về. */
export interface Cashflow {
  /** Ngày dạng ISO 'YYYY-MM-DD'. */
  date: string;
  amount: number;
}

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

/** Cảnh báo dùng khi XIRR không hội tụ — để sẵn cho lúc gói 3.3.1 nối bảng dòng tiền vào. */
export function xirrNotConverged(): CalcWarning {
  return meaningless(
    'Không tìm được suất sinh lợi phù hợp với chuỗi dòng tiền này.',
    'Kiểm tra lại: cần ít nhất một khoản chi ra và một khoản thu về, kèm ngày đúng thứ tự.',
  );
}

/** Bốn công thức lợi nhuận đã đăng ký. XIRR chưa có mặt — xem ghi chú đầu file. */
export const RETURN_FORMULAS: ReadonlyArray<FormulaModule> = [ROI, HPR, CAGR, TY_SUAT_CO_TUC];
