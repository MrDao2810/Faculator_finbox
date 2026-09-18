/**
 * Khung "cách tính" của nhóm `src/core/formulas/technical-volatility.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Ba chỗ cần biết trước khi sửa, khung viết theo mã chứ không theo sách:
 *
 * 1. Độ lệch chuẩn của bốn công thức Bollinger là độ lệch chuẩn MẪU của chính GIÁ đóng cửa:
 *    `bollingerParts()` gọi `sampleStdDev(window)`, chia n − 1, còn Bollinger chia n. Chưa chốt (Q1
 *    ở `REVIEW-2.md`), nên mọi khung có bước độ lệch chuẩn ghi `pendingReview: 'Q1'`. Bước ấy không
 *    dùng được `doLechChuanMau()` của `recipes.ts`, vì bước đó tính trên LỢI SUẤT.
 * 2. Độ rộng dải và %B không tính riêng hai dải: mã lấy `2 * parts.deviation`, đúng bằng dải trên trừ
 *    dải dưới. Khung vẫn tả từng dải, vì dòng chữ của hai công thức gọi tên từng dải.
 * 3. Độ biến động lịch sử dùng lợi suất LOG (`Math.log(current / previous)`), không phải lợi suất đơn
 *    của `LOI_SUAT_PHIEN`, nên bước lợi suất của nó viết riêng ở đây.
 */

import type { Bilingual } from '../types';
import { smaGiaDongCua } from './recipes';
import type { FormulaHowTo, HowToStep } from './types';

/** Hai cách dòng chữ của nhóm gọi đường giữa `SMA_{n}`; bước nào nhắc tới nó thì gọi đúng tên ấy. */
const TRUNG_BINH_N_PHIEN: Bilingual = { vi: 'Trung bình n phiên', en: 'n-session average' };
const DUONG_GIUA: Bilingual = { vi: 'Đường giữa', en: 'Middle line' };

/**
 * Độ lệch chuẩn MẪU của n giá đóng cửa trong cửa sổ — `bollingerParts()`: `closes.slice(-period)`
 * rồi `sampleStdDev(window)`, chia n − 1. Q1 chốt chia n thì sửa bước này.
 */
function doLechChuanGia(giua: Bilingual): HowToStep {
  return {
    latex: '\\sigma_{n} = \\sqrt{\\frac{1}{n - 1} \\sum_{i=1}^{n} (P_i - SMA_{n})^2}',
    expression: {
      vi: `Độ lệch chuẩn mẫu của n phiên = Căn bậc hai của (Tổng bình phương (Giá đóng cửa từng phiên − ${giua.vi}) ÷ (n − 1))`,
      en: `Sample standard deviation of n sessions = Square root of (Sum of squares (Each session close − ${giua.en}) ÷ (n − 1))`,
    },
  };
}

/** Dải trên: `middle + deviation`, với `deviation = k * sampleStdDev(window)`. */
function daiTren(giua: Bilingual): HowToStep {
  return {
    latex: 'BB_{tren} = SMA_{n} + k \\cdot \\sigma_{n}',
    expression: {
      vi: `Dải trên = ${giua.vi} + Hệ số k × Độ lệch chuẩn mẫu của n phiên`,
      en: `Upper band = ${giua.en} + Multiplier k × Sample standard deviation of n sessions`,
    },
  };
}

/** Dải dưới: `middle - deviation`. */
function daiDuoi(giua: Bilingual): HowToStep {
  return {
    latex: 'BB_{duoi} = SMA_{n} - k \\cdot \\sigma_{n}',
    expression: {
      vi: `Dải dưới = ${giua.vi} − Hệ số k × Độ lệch chuẩn mẫu của n phiên`,
      en: `Lower band = ${giua.en} − Multiplier k × Sample standard deviation of n sessions`,
    },
  };
}

export const HOW_TO_TECHNICAL_VOLATILITY: Readonly<Record<string, FormulaHowTo>> = {
  'dai-bollinger-tren': {
    entries: [
      {
        kind: 'derived',
        symbol: 'SMA_{n}',
        phrases: { vi: [TRUNG_BINH_N_PHIEN.vi], en: [TRUNG_BINH_N_PHIEN.en] },
        steps: [smaGiaDongCua('SMA_{n}', TRUNG_BINH_N_PHIEN)],
        calcEvidence: ['closes.slice(-period)', 'middle: mean(window)'],
        formulaId: 'sma-n-phien',
      },
      {
        kind: 'derived',
        symbol: '\\sigma_{n}',
        phrases: {
          vi: ['Độ lệch chuẩn mẫu của n phiên đó'],
          en: ['Sample standard deviation of those n sessions'],
        },
        steps: [doLechChuanGia(TRUNG_BINH_N_PHIEN)],
        calcEvidence: ['closes.slice(-period)', 'deviation: k * sampleStdDev(window)'],
        pendingReview: 'Q1',
      },
    ],
    skipped: { 'BB_{tren}': 'ket-qua', n: 'nhap-tho', k: 'nhap-tho' },
  },

  'dai-bollinger-duoi': {
    entries: [
      {
        kind: 'derived',
        symbol: 'SMA_{n}',
        phrases: { vi: [TRUNG_BINH_N_PHIEN.vi], en: [TRUNG_BINH_N_PHIEN.en] },
        steps: [smaGiaDongCua('SMA_{n}', TRUNG_BINH_N_PHIEN)],
        calcEvidence: ['closes.slice(-period)', 'middle: mean(window)'],
        formulaId: 'sma-n-phien',
      },
      {
        kind: 'derived',
        symbol: '\\sigma_{n}',
        phrases: {
          vi: ['Độ lệch chuẩn mẫu của n phiên đó'],
          en: ['Sample standard deviation of those n sessions'],
        },
        steps: [doLechChuanGia(TRUNG_BINH_N_PHIEN)],
        calcEvidence: ['closes.slice(-period)', 'deviation: k * sampleStdDev(window)'],
        pendingReview: 'Q1',
      },
    ],
    skipped: { 'BB_{duoi}': 'ket-qua', n: 'nhap-tho', k: 'nhap-tho' },
  },

  /*
   * Mã không tính riêng hai dải mà lấy `2 * parts.deviation` — đúng bằng dải trên trừ dải dưới.
   */
  'do-rong-dai-bollinger': {
    entries: [
      {
        kind: 'derived',
        symbol: 'BB_{tren}',
        phrases: { vi: ['Dải trên'], en: ['Upper band'] },
        steps: [doLechChuanGia(DUONG_GIUA), daiTren(DUONG_GIUA)],
        calcEvidence: ['deviation: k * sampleStdDev(window)', '2 * parts.deviation'],
        formulaId: 'dai-bollinger-tren',
        pendingReview: 'Q1',
      },
      {
        kind: 'derived',
        symbol: 'BB_{duoi}',
        phrases: { vi: ['Dải dưới'], en: ['Lower band'] },
        steps: [doLechChuanGia(DUONG_GIUA), daiDuoi(DUONG_GIUA)],
        calcEvidence: ['deviation: k * sampleStdDev(window)', '2 * parts.deviation'],
        formulaId: 'dai-bollinger-duoi',
        pendingReview: 'Q1',
      },
      {
        kind: 'derived',
        symbol: 'SMA_{n}',
        phrases: { vi: [DUONG_GIUA.vi], en: [DUONG_GIUA.en] },
        steps: [smaGiaDongCua('SMA_{n}', DUONG_GIUA)],
        calcEvidence: ['closes.slice(-period)', 'middle: mean(window)'],
        formulaId: 'sma-n-phien',
      },
    ],
    skipped: { BW: 'ket-qua', n: 'nhap-tho', '100': 'hang-so' },
  },

  /*
   * Hình Wilder đã hiện trọn phép làm mượt `ATR_t`; thứ hình không nói là ATR đầu tiên lấy từ đâu.
   */
  'atr-dao-dong-thuc': {
    entries: [
      {
        kind: 'derived',
        symbol: 'ATR_{t-1}',
        /*
         * Dòng chữ gọi đúng tên đại lượng này từ 18/09/2026, khi vế hai được viết lại cho đọc ra
         * phép tính — nên khai cụm để nó thành điểm chạm ở cả ba chỗ, như `EMA phiên trước` bên
         * `ema-n-phien`.
         */
        phrases: { vi: ['ATR phiên trước'], en: ['Previous ATR'] },
        steps: [
          {
            latex: 'ATR_{dau} = \\frac{TR_1 + TR_2 + \\dots + TR_n}{n}',
            expression: {
              vi: 'ATR đầu tiên = Tổng n dao động thực đầu tiên ÷ n',
              en: 'First ATR = Sum of the first n true ranges ÷ n',
            },
          },
          {
            latex: 'ATR_{t-1} = \\frac{(n-1) ATR_{t-2} + TR_{t-1}}{n}',
            expression: {
              vi: 'ATR phiên trước = ((n − 1) × ATR của phiên trước nữa + Dao động thực phiên trước) ÷ n, lặp từ ATR đầu tiên',
              en: 'Previous ATR = ((n − 1) × ATR of the session before that + Previous true range) ÷ n, repeated from the first ATR',
            },
          },
        ],
        calcEvidence: ['mean(trueRanges.slice(0, period))', '(atr * (period - 1) + tr) / period'],
      },
    ],
    skipped: {
      ATR_t: 'ket-qua',
      TR_t: 'da-hien-trong-hinh',
      H_t: 'nhap-tho',
      L_t: 'nhap-tho',
      'C_{t-1}': 'nhap-tho',
      t: 'chi-so-chay',
      n: 'nhap-tho',
      'n-1': 'da-hien-trong-hinh',
    },
  },

  /*
   * Mã không tính dải trên: lấy bề rộng `2 * parts.deviation` làm mẫu số, dải dưới làm gốc.
   */
  'phan-tram-b-bollinger': {
    entries: [
      {
        kind: 'derived',
        symbol: 'BB_{duoi}',
        phrases: { vi: ['Dải dưới'], en: ['Lower band'] },
        steps: [doLechChuanGia(TRUNG_BINH_N_PHIEN), daiDuoi(TRUNG_BINH_N_PHIEN)],
        calcEvidence: ['deviation: k * sampleStdDev(window)', 'parts.middle - parts.deviation'],
        formulaId: 'dai-bollinger-duoi',
        pendingReview: 'Q1',
      },
      {
        kind: 'derived',
        symbol: 'BB_{tren}',
        phrases: { vi: ['Dải trên'], en: ['Upper band'] },
        steps: [doLechChuanGia(TRUNG_BINH_N_PHIEN), daiTren(TRUNG_BINH_N_PHIEN)],
        calcEvidence: ['deviation: k * sampleStdDev(window)', 'const width = 2 * parts.deviation'],
        formulaId: 'dai-bollinger-tren',
        pendingReview: 'Q1',
      },
    ],
    skipped: { '\\%B': 'ket-qua', C: 'nhap-tho', '100': 'hang-so' },
  },

  'stochastic-k': {
    entries: [
      {
        kind: 'derived',
        symbol: 'L_{n}',
        phrases: { vi: ['Giá thấp nhất n phiên'], en: ['n-session lowest price'] },
        steps: [
          {
            latex: 'L_{n} = \\min(L_t, L_{t-1}, \\dots, L_{t-n+1})',
            expression: {
              vi: 'Giá thấp nhất n phiên = Số nhỏ nhất trong giá thấp nhất từng phiên, từ phiên gần nhất t lùi lại đủ n phiên',
              en: 'n-session lowest price = Smallest of the session lows, from the latest session t back through n sessions',
            },
          },
        ],
        calcEvidence: ['bars.slice(-period)', 'Math.min(...window.map((row) => row.low))'],
      },
      {
        kind: 'derived',
        symbol: 'H_{n}',
        phrases: { vi: ['Giá cao nhất n phiên'], en: ['n-session highest price'] },
        steps: [
          {
            latex: 'H_{n} = \\max(H_t, H_{t-1}, \\dots, H_{t-n+1})',
            expression: {
              vi: 'Giá cao nhất n phiên = Số lớn nhất trong giá cao nhất từng phiên, từ phiên gần nhất t lùi lại đủ n phiên',
              en: 'n-session highest price = Largest of the session highs, from the latest session t back through n sessions',
            },
          },
        ],
        calcEvidence: ['bars.slice(-period)', 'Math.max(...window.map((row) => row.high))'],
      },
    ],
    skipped: { '\\%K': 'ket-qua', C: 'nhap-tho', n: 'nhap-tho', '100': 'hang-so' },
  },

  vwap: {
    entries: [],
    skipped: { VWAP: 'ket-qua', C_i: 'nhap-tho', V_i: 'nhap-tho', i: 'chi-so-chay' },
    whyNone:
      'Giá đóng cửa và khối lượng từng phiên đọc thẳng trên bảng giá, còn phép gộp theo khối lượng đã hiện trọn trong hình.',
  },

  'do-bien-dong-lich-su': {
    entries: [
      {
        kind: 'derived',
        symbol: '\\sigma',
        phrases: {
          vi: ['Độ lệch chuẩn mẫu của lợi suất log mỗi phiên'],
          en: ['Sample standard deviation of per-session log returns'],
        },
        steps: [
          {
            latex: 'u_t = \\ln \\frac{P_t}{P_{t-1}}',
            expression: {
              vi: 'Lợi suất log phiên t = Logarit tự nhiên của (Giá đóng cửa phiên t ÷ Giá đóng cửa phiên trước)',
              en: 'Log return of session t = Natural log of (Close of session t ÷ Previous close)',
            },
          },
          {
            latex: '\\sigma = \\sqrt{\\frac{1}{n - 1} \\sum_{t=1}^{n} (u_t - \\bar{u})^2}',
            expression: {
              vi: 'Độ lệch chuẩn mẫu của lợi suất log mỗi phiên = Căn bậc hai của (Tổng bình phương (Lợi suất log phiên t − Lợi suất log trung bình) ÷ (Số lợi suất log n − 1))',
              en: 'Sample standard deviation of per-session log returns = Square root of (Sum of squares (Log return of session t − Mean log return) ÷ (Number of log returns n − 1))',
            },
          },
        ],
        calcEvidence: [
          'closes.slice(-sample)',
          'Math.log(current / previous)',
          'sampleStdDev(logReturns)',
        ],
      },
    ],
    skipped: {
      '\\sigma_{nam}': 'ket-qua',
      '\\ln \\frac{P_t}{P_{t-1}}': 'da-hien-trong-hinh',
      P_t: 'nhap-tho',
      'P_{t-1}': 'nhap-tho',
      t: 'chi-so-chay',
      N: 'nhap-tho',
      '\\sqrt{N}': 'da-hien-trong-hinh',
      '100': 'hang-so',
    },
  },

  'ty-le-khoi-luong': {
    entries: [],
    skipped: {
      RVOL: 'ket-qua',
      V_t: 'nhap-tho',
      t: 'chi-so-chay',
      '\\frac{1}{n}\\sum_{i=1}^{n} V_{t-i}': 'da-hien-trong-hinh',
      'V_{t-i}': 'nhap-tho',
      i: 'chi-so-chay',
      n: 'nhap-tho',
    },
    whyNone:
      'Khối lượng từng phiên đọc thẳng trên bảng giá, còn trung bình n phiên liền trước đã hiện trọn trong hình.',
  },
};
