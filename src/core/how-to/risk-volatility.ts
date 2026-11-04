/**
 * Khung "cách tính" của nhóm `src/core/formulas/risk-volatility.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Cả sáu công thức lấy N phiên giá gần nhất qua `windowCloses()` rồi mới tính, nên số lợi suất `n`
 * là N − 1: phiên đầu cửa sổ chưa có phiên trước để so. Hai bảng ký hiệu có dòng `n` khai nó là đại
 * lượng phải tính, cùng lý lẽ với `n` = số năm × 12 của trả góp.
 *
 * Độ lệch chuẩn bán phần chia cho TỔNG số lợi suất trừ 1 (`returns.length - 1`), không phải số phiên
 * dưới ngưỡng, nên khung `n` của nó nói rõ "kể cả các phiên trên ngưỡng".
 */

import { LOI_SUAT_PHIEN, doLechChuanMau, trungBinhLoiSuat } from './recipes';
import type { FormulaHowTo } from './types';

export const HOW_TO_RISK_VOLATILITY: Readonly<Record<string, FormulaHowTo>> = {
  'do-lech-chuan-loi-suat-phien': {
    entries: [
      {
        kind: 'derived',
        symbol: 'r_t',
        phrases: { vi: ['Lợi suất từng phiên'], en: ["each session's return"] },
        steps: [LOI_SUAT_PHIEN],
        calcEvidence: ['closes.slice(-window)', 'simpleReturns(closes)'],
      },
      {
        kind: 'derived',
        symbol: '\\bar{r}',
        phrases: { vi: ['Lợi suất bình quân'], en: ['average return'] },
        steps: [trungBinhLoiSuat('\\bar{r}', { vi: 'Lợi suất bình quân', en: 'Average return' })],
        calcEvidence: ['sampleStdDev(simpleReturns(closes))'],
      },
      {
        kind: 'derived',
        symbol: 'n',
        phrases: { vi: ['Số lợi suất'], en: ['number of returns'] },
        steps: [
          {
            latex: 'n = N - 1',
            expression: {
              vi: 'Số lợi suất n = Số phiên lấy để tính N − 1',
              en: 'Number of returns n = Number of sessions used N − 1',
            },
          },
        ],
        calcEvidence: [
          'Math.max(minimum, Math.round(sessions))',
          'sampleStdDev(simpleReturns(closes))',
        ],
      },
    ],
    skipped: { s: 'ket-qua', t: 'chi-so-chay', 'n - 1': 'da-hien-trong-hinh' },
  },

  'do-bien-dong-nam-hoa': {
    entries: [
      {
        kind: 'derived',
        symbol: 's_{phien}',
        phrases: {
          vi: ['Độ lệch chuẩn lợi suất phiên'],
          en: ['per-session return standard deviation'],
        },
        steps: [
          LOI_SUAT_PHIEN,
          doLechChuanMau('s_{phien}', {
            vi: 'Độ lệch chuẩn lợi suất phiên',
            en: 'Per-session return standard deviation',
          }),
        ],
        calcEvidence: ['closes.slice(-window)', 'sampleStdDev(simpleReturns(closes))'],
        formulaId: 'do-lech-chuan-loi-suat-phien',
      },
    ],
    skipped: {
      '\\sigma_{nam}': 'ket-qua',
      D: 'nhap-tho',
      '\\sqrt{D}': 'da-hien-trong-hinh',
    },
  },

  'do-lech-chuan-ban-phan': {
    entries: [
      {
        kind: 'derived',
        symbol: 'r_t',
        phrases: { vi: ['Lợi suất'], en: ['return'] },
        steps: [LOI_SUAT_PHIEN],
        calcEvidence: ['closes.slice(-window)', 'const returns = simpleReturns(closes)'],
      },
      {
        kind: 'derived',
        symbol: 'n',
        phrases: { vi: ['Số lợi suất'], en: ['number of returns'] },
        steps: [
          {
            latex: 'n = N - 1',
            expression: {
              vi: 'Số lợi suất n = Số phiên lấy để tính N − 1, kể cả các phiên trên ngưỡng',
              en: 'Number of returns n = Number of sessions used N − 1, sessions above the threshold included',
            },
          },
        ],
        calcEvidence: ['Math.max(minimum, Math.round(sessions))', 'returns.length - 1'],
      },
    ],
    skipped: {
      DD: 'ket-qua',
      B: 'nhap-tho',
      'r_t < B': 'da-hien-trong-hinh',
      t: 'chi-so-chay',
      'n - 1': 'da-hien-trong-hinh',
    },
  },

  /*
   * Dòng `r` không đứng riêng trong hình (chỉ nằm dưới gạch của `\bar{r}`), nên không có điểm chạm;
   * lợi suất phiên đã là bước đầu của cả hai khung dưới.
   */
  'he-so-bien-thien': {
    entries: [
      {
        kind: 'derived',
        symbol: 's',
        phrases: { vi: ['Độ lệch chuẩn lợi suất'], en: ['return standard deviation'] },
        steps: [
          LOI_SUAT_PHIEN,
          doLechChuanMau('s', { vi: 'Độ lệch chuẩn lợi suất', en: 'Return standard deviation' }),
        ],
        calcEvidence: ['const returns = simpleReturns(closes)', 'sampleStdDev(returns) / average'],
        formulaId: 'do-lech-chuan-loi-suat-phien',
      },
      {
        kind: 'derived',
        symbol: '\\bar{r}',
        phrases: { vi: ['Lợi suất bình quân'], en: ['average return'] },
        steps: [
          LOI_SUAT_PHIEN,
          trungBinhLoiSuat('\\bar{r}', { vi: 'Lợi suất bình quân', en: 'Average return' }),
        ],
        calcEvidence: ['const returns = simpleReturns(closes)', 'const average = mean(returns)'],
      },
    ],
    skipped: { CV: 'ket-qua', r: 'nam-trong-ky-hieu-khac' },
  },

  'bien-do-dao-dong-lon-nhat': {
    entries: [
      {
        kind: 'derived',
        symbol: 'P_{max}',
        phrases: { vi: ['Giá đóng cửa cao nhất'], en: ['highest closing price'] },
        steps: [
          {
            latex: 'P_{max} = \\max(P_1, P_2, \\dots, P_N)',
            expression: {
              vi: 'Giá đóng cửa cao nhất = Số lớn nhất trong giá đóng cửa của N phiên trong kỳ',
              en: 'Highest closing price = Largest of the closes of the N sessions in the period',
            },
          },
        ],
        calcEvidence: ['closes.slice(-window)', 'close > best ? close : best'],
      },
      {
        kind: 'derived',
        symbol: 'P_{min}',
        phrases: { vi: ['Giá đóng cửa thấp nhất'], en: ['lowest closing price'] },
        steps: [
          {
            latex: 'P_{min} = \\min(P_1, P_2, \\dots, P_N)',
            expression: {
              vi: 'Giá đóng cửa thấp nhất = Số nhỏ nhất trong giá đóng cửa của N phiên trong kỳ',
              en: 'Lowest closing price = Smallest of the closes of the N sessions in the period',
            },
          },
        ],
        calcEvidence: ['closes.slice(-window)', 'close < best ? close : best'],
      },
    ],
    skipped: { A: 'ket-qua', '100': 'hang-so' },
  },

  'chuoi-phien-giam-dai-nhat': {
    entries: [
      {
        kind: 'derived',
        symbol: 'r_{t+1}',
        steps: [
          {
            latex: 'r_{t+1} = \\frac{P_{t+1}}{P_t} - 1',
            expression: {
              vi: 'Lợi suất phiên t + 1 = Giá đóng cửa phiên t + 1 ÷ Giá đóng cửa phiên trước − 1',
              en: 'Return of session t + 1 = Close of session t + 1 ÷ Previous close − 1',
            },
          },
        ],
        calcEvidence: ['for (const r of simpleReturns(closes))', 'if (r < 0)'],
      },
      {
        kind: 'derived',
        symbol: 'r_{t+k}',
        steps: [
          {
            latex: 'r_{t+k} = \\frac{P_{t+k}}{P_{t+k-1}} - 1',
            expression: {
              vi: 'Lợi suất phiên t + k = Giá đóng cửa phiên t + k ÷ Giá đóng cửa phiên trước − 1',
              en: 'Return of session t + k = Close of session t + k ÷ Previous close − 1',
            },
          },
        ],
        calcEvidence: ['for (const r of simpleReturns(closes))', 'if (r < 0)'],
      },
    ],
    skipped: { L: 'ket-qua', k: 'chi-so-chay', t: 'chi-so-chay' },
  },
};
