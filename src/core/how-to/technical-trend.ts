/**
 * Khung "cách tính" của nhóm `src/core/formulas/technical-trend.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Khung tả đúng ba hàm cục bộ của file công thức, không tả theo sách:
 *
 * - `emaSeries()` (cùng thuật toán với `lastEma()` của `series-utils.ts`): hệ số k = 2 ÷ (n + 1),
 *   mồi bằng trung bình đơn của n giá trị ĐẦU chuỗi, rồi mỗi giá trị sau trộn với EMA cũ.
 * - `macdSeries()`: MACD từng phiên = EMA nhanh − EMA chậm dóng theo cùng phiên, có từ phiên thứ
 *   `slow` trở đi. Đường tín hiệu là `lastEma()` trên chính chuỗi ấy, nên nó mồi bằng trung bình n
 *   giá trị MACD đầu chứ không phải n giá đóng cửa đầu.
 * - `wilderAverages()`: mức tăng, mức giảm là CHÊNH LỆCH GIÁ (₫), không phải lợi suất. Mồi bằng
 *   trung bình đơn của n chênh lệch ĐẦU chuỗi rồi làm mượt `(cũ × (n − 1) + mới) ÷ n` qua toàn bộ
 *   phần còn lại. Sách hay tả RSI là "n phiên gần nhất"; mã mang theo cả chuỗi đã nạp, nên khung
 *   nói "đầu chuỗi" và "lặp tới phiên cuối".
 */

import { emaGiaDongCua, smaGiaDongCua } from './recipes';
import type { FormulaHowTo, HowToStep } from './types';

/*
 * `EMA_{t-1}` của `ema-n-phien`. Hình đã có hệ số k, nên khung chỉ nói EMA phiên trước từ đâu ra:
 * mồi, rồi lặp đúng công thức ấy. Không dùng được `emaGiaDongCua()`: vế phải bước cuối của nó chứa
 * `EMA_{t-1}`, đặt vế trái cũng là `EMA_{t-1}` thì bước tự trỏ vào chính mình.
 */
const EMA_PHIEN_TRUOC: ReadonlyArray<HowToStep> = [
  {
    latex: 'EMA_n = \\frac{P_1 + P_2 + \\dots + P_n}{n}',
    expression: {
      vi: 'EMA đầu tiên = Tổng giá đóng cửa của n phiên đầu chuỗi ÷ n',
      en: 'First EMA = Sum of the closes of the first n sessions in the series ÷ n',
    },
  },
  {
    latex: 'EMA_{t-1} = P_{t-1} \\times k + EMA_{t-2} \\times (1 - k)',
    expression: {
      vi: 'EMA phiên trước = Giá đóng cửa phiên trước × k + EMA hai phiên trước × (1 − k), tính lần lượt từ EMA đầu tiên',
      en: "Previous period's EMA = Previous close × k + EMA two sessions back × (1 − k), worked forward from the first EMA",
    },
  },
];

/*
 * Chuỗi MACD mà đường tín hiệu làm mượt — `macdSeries()`: hai chuỗi `emaSeries()` dóng theo phiên
 * rồi trừ nhau. Hai bước EMA lấy từ công thức chung vì `emaSeries()` cùng thuật toán với `lastEma()`.
 */
const CHUOI_MACD: ReadonlyArray<HowToStep> = [
  ...emaGiaDongCua('EMA_t', { vi: 'EMA phiên t', en: 'EMA of session t' }),
  {
    latex: 'MACD = EMA_{nhanh} - EMA_{cham}',
    expression: {
      vi: 'MACD mỗi phiên = EMA chu kỳ nhanh − EMA chu kỳ chậm tại cùng phiên, có từ phiên thứ Chu kỳ EMA chậm trở đi',
      en: 'MACD of each session = Fast-period EMA − Slow-period EMA at that session, starting once the series reaches Slow EMA period sessions',
    },
  },
];

/*
 * `EMA_{tin hieu}` — `lastEma(macdLine, signal)`. Cùng thuật toán EMA, nhưng thứ được làm mượt là
 * GIÁ TRỊ MACD chứ không phải giá đóng cửa, nên không dùng được `emaGiaDongCua()` (dòng chữ của nó
 * nói "Giá đóng cửa").
 */
const EMA_TIN_HIEU: ReadonlyArray<HowToStep> = [
  {
    latex: 'k = \\frac{2}{n + 1}',
    expression: {
      vi: 'Hệ số làm mượt k = 2 ÷ (Chu kỳ đường tín hiệu n + 1)',
      en: 'Smoothing factor k = 2 ÷ (Signal line period n + 1)',
    },
  },
  {
    latex: 'EMA_{tin hieu} = MACD_t \\times k + EMA_{t-1} \\times (1 - k)',
    expression: {
      vi: 'EMA chu kỳ tín hiệu = MACD phiên t × k + EMA phiên trước × (1 − k), EMA đầu tiên là trung bình n giá trị MACD đầu',
      en: 'EMA of the signal period = MACD of session t × k + Previous EMA × (1 − k), the first EMA is the average of the first n MACD values',
    },
  },
];

/* Ba bước của trung bình tăng Wilder — `wilderAverages()`, nhánh `gains` / `avgGain`. */
const TRUNG_BINH_TANG: ReadonlyArray<HowToStep> = [
  {
    latex: 'G_t = \\max(P_t - P_{t-1}, 0)',
    expression: {
      vi: 'Mức tăng phiên t = lớn nhất của (Giá đóng cửa phiên t − Giá đóng cửa phiên trước, 0)',
      en: 'Gain of session t = larger of (Close of session t − Previous close, 0)',
    },
  },
  {
    latex: '\\overline{Gain}_n = \\frac{G_1 + G_2 + \\dots + G_n}{n}',
    expression: {
      vi: 'Trung bình tăng đầu tiên = Tổng n mức tăng đầu tiên của chuỗi ÷ Số phiên n',
      en: 'First average gain = Sum of the first n gains in the series ÷ Number of periods n',
    },
  },
  {
    latex: '\\overline{Gain} = \\frac{\\overline{Gain}_{t-1} \\times (n - 1) + G_t}{n}',
    expression: {
      vi: 'Trung bình tăng = (Trung bình tăng phiên trước × (n − 1) + Mức tăng phiên t) ÷ n, lặp tới phiên cuối chuỗi',
      en: 'Average gain = (Previous average gain × (n − 1) + Gain of session t) ÷ n, repeated up to the last session',
    },
  },
];

/* Ba bước của trung bình giảm Wilder — `wilderAverages()`, nhánh `losses` / `avgLoss`. */
const TRUNG_BINH_GIAM: ReadonlyArray<HowToStep> = [
  {
    latex: 'L_t = \\max(P_{t-1} - P_t, 0)',
    expression: {
      vi: 'Mức giảm phiên t = lớn nhất của (Giá đóng cửa phiên trước − Giá đóng cửa phiên t, 0)',
      en: 'Loss of session t = larger of (Previous close − Close of session t, 0)',
    },
  },
  {
    latex: '\\overline{Loss}_n = \\frac{L_1 + L_2 + \\dots + L_n}{n}',
    expression: {
      vi: 'Trung bình giảm đầu tiên = Tổng n mức giảm đầu tiên của chuỗi ÷ Số phiên n',
      en: 'First average loss = Sum of the first n losses in the series ÷ Number of periods n',
    },
  },
  {
    latex: '\\overline{Loss} = \\frac{\\overline{Loss}_{t-1} \\times (n - 1) + L_t}{n}',
    expression: {
      vi: 'Trung bình giảm = (Trung bình giảm phiên trước × (n − 1) + Mức giảm phiên t) ÷ n, lặp tới phiên cuối chuỗi',
      en: 'Average loss = (Previous average loss × (n − 1) + Loss of session t) ÷ n, repeated up to the last session',
    },
  },
];

export const HOW_TO_TECHNICAL_TREND: Readonly<Record<string, FormulaHowTo>> = {
  'sma-n-phien': {
    entries: [],
    skipped: {
      'SMA_{n}': 'ket-qua',
      n: 'nhap-tho',
      i: 'chi-so-chay',
      'P_{t-i}': 'nhap-tho',
      t: 'chi-so-chay',
    },
    whyNone:
      'Hình đã là trọn phép tính: cộng n giá đóng cửa đọc thẳng từ chuỗi giá rồi chia cho n ở ô Số phiên, không có đại lượng trung gian nào phải tính trước.',
  },

  'ema-n-phien': {
    entries: [
      {
        kind: 'derived',
        symbol: 'EMA_{t-1}',
        phrases: { vi: ['EMA phiên trước'], en: ["Previous period's EMA"] },
        steps: EMA_PHIEN_TRUOC,
        calcEvidence: ['lastEma(closes, period)'],
      },
    ],
    skipped: {
      EMA_t: 'ket-qua',
      t: 'chi-so-chay',
      P_t: 'nhap-tho',
      k: 'da-hien-trong-hinh',
      n: 'nhap-tho',
    },
  },

  'macd-duong-chinh': {
    entries: [
      {
        kind: 'derived',
        symbol: 'EMA_{nhanh}',
        phrases: { vi: ['EMA chu kỳ nhanh'], en: ['Fast-period EMA'] },
        steps: emaGiaDongCua('EMA_{nhanh}', { vi: 'EMA chu kỳ nhanh', en: 'Fast-period EMA' }),
        calcEvidence: ['lastEma(closes, fast)'],
        formulaId: 'ema-n-phien',
      },
      {
        kind: 'derived',
        symbol: 'EMA_{cham}',
        phrases: { vi: ['EMA chu kỳ chậm'], en: ['Slow-period EMA'] },
        steps: emaGiaDongCua('EMA_{cham}', { vi: 'EMA chu kỳ chậm', en: 'Slow-period EMA' }),
        calcEvidence: ['lastEma(closes, slow)'],
        formulaId: 'ema-n-phien',
      },
    ],
    skipped: { MACD: 'ket-qua' },
  },

  /*
   * `EMA_{tin hieu}` không phải kết quả (vế trái là `Signal`) và không phải phép toán ai cũng biết
   * như `\max`: đây là chỗ duy nhất trên thẻ nói đường tín hiệu được làm mượt thế nào.
   */
  'macd-duong-tin-hieu': {
    entries: [
      {
        kind: 'derived',
        symbol: 'EMA_{tin hieu}',
        phrases: { vi: ['EMA chu kỳ tín hiệu'], en: ['EMA of the signal period'] },
        steps: EMA_TIN_HIEU,
        calcEvidence: ['lastEma(macdLine, signal)'],
      },
      {
        kind: 'derived',
        symbol: 'MACD',
        phrases: { vi: ['chuỗi giá trị MACD'], en: ['series of MACD values'] },
        steps: CHUOI_MACD,
        calcEvidence: [
          'macdSeries(closes, fast, slow)',
          'out.push(nhanh - cham)',
          'const k = 2 / (period + 1)',
          'let ema = mean(closes.slice(0, period))',
          'ema = close * k + ema * (1 - k)',
        ],
        formulaId: 'macd-duong-chinh',
      },
    ],
    skipped: { Signal: 'ket-qua' },
  },

  'rsi-wilder': {
    entries: [
      {
        kind: 'derived',
        symbol: '\\overline{Gain}',
        phrases: { vi: ['Trung bình tăng'], en: ['Average gain'] },
        steps: TRUNG_BINH_TANG,
        calcEvidence: [
          'wilderAverages(closes, period)',
          'gains.push(chenh > 0 ? chenh : 0)',
          'let avgGain = mean(gains.slice(0, period))',
          'avgGain = (avgGain * (period - 1) + gain) / period',
        ],
      },
      {
        kind: 'derived',
        symbol: '\\overline{Loss}',
        phrases: { vi: ['Trung bình giảm'], en: ['Average loss'] },
        steps: TRUNG_BINH_GIAM,
        calcEvidence: [
          'wilderAverages(closes, period)',
          'losses.push(chenh < 0 ? -chenh : 0)',
          'let avgLoss = mean(losses.slice(0, period))',
          'avgLoss = (avgLoss * (period - 1) + loss) / period',
        ],
      },
    ],
    skipped: { RSI: 'ket-qua', '100': 'hang-so', RS: 'da-hien-trong-hinh' },
  },

  'roc-toc-do-thay-doi': {
    entries: [],
    skipped: {
      ROC: 'ket-qua',
      P_t: 'nhap-tho',
      t: 'chi-so-chay',
      'P_{t-n}': 'nhap-tho',
      n: 'nhap-tho',
      '100': 'hang-so',
    },
    whyNone:
      'Hai giá đóng cửa đọc thẳng từ chuỗi giá, n là ô Số phiên nhìn lại, còn phép chia, trừ 1 và nhân 100 đã hiện trọn trong hình.',
  },

  'dong-luong-momentum': {
    entries: [],
    skipped: {
      M: 'ket-qua',
      P_t: 'nhap-tho',
      t: 'chi-so-chay',
      'P_{t-n}': 'nhap-tho',
      n: 'nhap-tho',
    },
    whyNone:
      'Hai giá đóng cửa đọc thẳng từ chuỗi giá, n là ô Số phiên nhìn lại, còn phép trừ đã hiện trọn trong hình.',
  },

  'khoang-cach-gia-so-sma': {
    entries: [
      {
        kind: 'derived',
        symbol: 'SMA_n',
        phrases: { vi: ['SMA N phiên'], en: ['N-period SMA'] },
        steps: [smaGiaDongCua('SMA_n', { vi: 'SMA n phiên', en: 'n-period SMA' })],
        calcEvidence: ['lastSma(closes, period)'],
        formulaId: 'sma-n-phien',
      },
    ],
    skipped: {
      D: 'ket-qua',
      P_t: 'nhap-tho',
      t: 'chi-so-chay',
      n: 'nhap-tho',
      '100': 'hang-so',
    },
  },

  'giao-cat-hai-duong-ma': {
    entries: [
      {
        kind: 'derived',
        symbol: 'SMA_{ngan}',
        phrases: { vi: ['SMA chu kỳ ngắn'], en: ['Short-period SMA'] },
        steps: [smaGiaDongCua('SMA_{ngan}', { vi: 'SMA chu kỳ ngắn', en: 'Short-period SMA' })],
        calcEvidence: ['lastSma(closes, short)'],
        formulaId: 'sma-n-phien',
      },
      {
        kind: 'derived',
        symbol: 'SMA_{dai}',
        phrases: { vi: ['SMA chu kỳ dài'], en: ['Long-period SMA'] },
        steps: [smaGiaDongCua('SMA_{dai}', { vi: 'SMA chu kỳ dài', en: 'Long-period SMA' })],
        calcEvidence: ['lastSma(closes, long)'],
        formulaId: 'sma-n-phien',
      },
    ],
    skipped: { C: 'ket-qua' },
  },
};
