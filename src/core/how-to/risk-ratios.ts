/**
 * Khung "cách tính" của nhóm `src/core/formulas/risk-ratios.ts` — kiểu dữ liệu và luật ở `types.ts`.
 */

import type { Bilingual } from '../types';
import { LOI_SUAT_PHIEN, doLechChuanMau, quyVeMotPhien, trungBinhLoiSuat } from './recipes';
import type { DerivedHowTo, FormulaHowTo } from './types';

/** Tên của `\bar{r}_p` trên dòng chữ của Sortino, Treynor và tỷ số thông tin, giống hệt Sharpe. */
const TEN_BINH_QUAN_PHIEN: Bilingual = {
  vi: 'Lợi suất bình quân một phiên',
  en: 'Average per-session return',
};

/** `\bar{r}_p` của các tỷ số cùng khuôn Sharpe: `mean(simpleReturns(closes))` trên cả chuỗi giá. */
const BINH_QUAN_PHIEN: DerivedHowTo = {
  kind: 'derived',
  symbol: '\\bar{r}_p',
  phrases: { vi: [TEN_BINH_QUAN_PHIEN.vi], en: [TEN_BINH_QUAN_PHIEN.en] },
  steps: [LOI_SUAT_PHIEN, trungBinhLoiSuat('\\bar{r}_p', TEN_BINH_QUAN_PHIEN)],
  calcEvidence: ['simpleReturns(closes)', 'mean(returns)'],
};

/** `r_f` quy về một phiên: `perSessionRate(v('riskFree'), sessions)`. `ten` là tên trên dòng chữ. */
function phiRuiRoMotPhien(ten: Bilingual): DerivedHowTo {
  return {
    kind: 'derived',
    symbol: 'r_f',
    phrases: { vi: [ten.vi], en: [ten.en] },
    steps: [
      quyVeMotPhien('r_f', ten, { vi: 'Lãi suất phi rủi ro một năm', en: 'Annual risk-free rate' }),
    ],
    calcEvidence: ["perSessionRate(v('riskFree'), sessions)"],
  };
}

export const HOW_TO_RISK_RATIOS: Readonly<Record<string, FormulaHowTo>> = {
  /*
   * `calc` không chia tổng tích hay tổng bình phương cho gì cả: nó lấy thẳng Σ tích ÷ Σ bình phương,
   * vì mẫu số chung của Cov và Var triệt tiêu khi chia. Khung viết Cov và Var đủ mẫu số n − 1 (cùng
   * quy ước `sampleStdDev`) để hai đại lượng đúng nghĩa; tính tay theo khung vẫn ra đúng beta trên màn.
   */
  beta: {
    entries: [
      {
        kind: 'derived',
        symbol: '\\text{Cov}',
        phrases: { vi: ['Hiệp phương sai'], en: ['Covariance'] },
        steps: [
          {
            latex:
              '\\bar{R}_i = \\frac{1}{n} \\sum_{t=1}^{n} R_{i,t}, \\quad \\bar{R}_m = \\frac{1}{n} \\sum_{t=1}^{n} R_{m,t}',
            /* Hình của bước có `\quad`, nên chữ cũng hai dòng — luật 6, y như dòng chữ dưới hình chính. */
            expression: {
              vi: 'Lợi suất trung bình của cổ phiếu = Tổng lợi suất cổ phiếu ÷ Số lợi suất n\nLợi suất trung bình của VN-Index = Tổng lợi suất VN-Index ÷ n',
              en: 'Mean stock return = Sum of stock returns ÷ Number of returns n\nMean VN-Index return = Sum of VN-Index returns ÷ n',
            },
          },
          {
            latex:
              '\\text{Cov} = \\frac{1}{n - 1} \\sum_{t=1}^{n} (R_{i,t} - \\bar{R}_i)(R_{m,t} - \\bar{R}_m)',
            expression: {
              vi: 'Hiệp phương sai = Tổng các tích (Lợi suất cổ phiếu − Lợi suất trung bình của cổ phiếu) × (Lợi suất VN-Index − Lợi suất trung bình của VN-Index) ÷ (Số lợi suất − 1)',
              en: 'Covariance = Sum of products (Stock return − Mean stock return) × (VN-Index return − Mean VN-Index return) ÷ (Number of returns − 1)',
            },
          },
        ],
        calcEvidence: ['mean(stockReturns)', 'mean(marketReturns)', 'covariance += dm * di'],
      },
      {
        kind: 'derived',
        symbol: 'R_i',
        phrases: { vi: ['lợi suất cổ phiếu'], en: ['stock return'] },
        steps: [
          {
            latex: 'R_i = \\frac{P_t}{P_{t-1}} - 1',
            expression: {
              vi: 'Lợi suất cổ phiếu phiên t = Giá đóng cửa cổ phiếu phiên t ÷ Giá đóng cửa phiên trước − 1, chỉ lấy các phiên trong cửa sổ hồi quy',
              en: 'Stock return of session t = Stock close of session t ÷ Previous close − 1, using only the sessions in the regression window',
            },
          },
        ],
        calcEvidence: ['simpleReturns(stockCloses.slice(-sessions))'],
      },
      {
        kind: 'derived',
        symbol: 'R_m',
        phrases: { vi: ['lợi suất VN-Index'], en: ['VN-Index return'] },
        steps: [
          {
            latex: 'R_m = \\frac{M_t}{M_{t-1}} - 1',
            expression: {
              vi: 'Lợi suất VN-Index phiên t = Điểm đóng cửa VN-Index phiên t ÷ Điểm đóng cửa phiên trước − 1, chỉ lấy các phiên trong cửa sổ hồi quy',
              en: 'VN-Index return of session t = VN-Index close of session t ÷ Previous close − 1, using only the sessions in the regression window',
            },
          },
        ],
        calcEvidence: ['simpleReturns(marketCloses.slice(-sessions))'],
      },
      {
        kind: 'derived',
        symbol: '\\text{Var}',
        phrases: { vi: ['Phương sai'], en: ['Variance'] },
        steps: [
          {
            latex: '\\bar{R}_m = \\frac{1}{n} \\sum_{t=1}^{n} R_{m,t}',
            expression: {
              vi: 'Lợi suất trung bình của VN-Index = Tổng lợi suất VN-Index ÷ Số lợi suất n',
              en: 'Mean VN-Index return = Sum of VN-Index returns ÷ Number of returns n',
            },
          },
          {
            latex: '\\text{Var} = \\frac{1}{n - 1} \\sum_{t=1}^{n} (R_{m,t} - \\bar{R}_m)^2',
            expression: {
              vi: 'Phương sai = Tổng bình phương (Lợi suất VN-Index − Lợi suất trung bình của VN-Index) ÷ (Số lợi suất − 1)',
              en: 'Variance = Sum of squares (VN-Index return − Mean VN-Index return) ÷ (Number of returns − 1)',
            },
          },
        ],
        calcEvidence: ['mean(marketReturns)', 'varianceMarket += dm * dm'],
      },
    ],
    skipped: { '\\beta_i': 'ket-qua', i: 'chi-so-chay' },
  },

  /*
   * Công thức chủ dự án chỉ vào ngày 17/09/2026 — mẫu cho cả thư viện.
   */
  'ty-so-sharpe': {
    entries: [
      {
        kind: 'derived',
        symbol: '\\bar{r}_p',
        phrases: { vi: ['Lợi suất bình quân một phiên'], en: ['Average per-session return'] },
        steps: [
          LOI_SUAT_PHIEN,
          trungBinhLoiSuat('\\bar{r}_p', {
            vi: 'Lợi suất bình quân một phiên',
            en: 'Average per-session return',
          }),
        ],
        calcEvidence: ['simpleReturns(closes)', 'mean(returns)'],
      },
      {
        kind: 'derived',
        symbol: 'r_f',
        phrases: { vi: ['Lãi suất phi rủi ro một phiên'], en: ['Per-session risk-free rate'] },
        steps: [
          quyVeMotPhien(
            'r_f',
            { vi: 'Lãi suất phi rủi ro một phiên', en: 'Per-session risk-free rate' },
            { vi: 'Lãi suất phi rủi ro một năm', en: 'Annual risk-free rate' },
          ),
        ],
        calcEvidence: ["perSessionRate(v('riskFree'), sessions)"],
      },
      {
        kind: 'derived',
        symbol: '\\sigma_p',
        phrases: {
          vi: ['Độ lệch chuẩn lợi suất phiên'],
          en: ['Standard deviation of per-session returns'],
        },
        steps: [
          LOI_SUAT_PHIEN,
          doLechChuanMau(
            '\\sigma_p',
            {
              vi: 'Độ lệch chuẩn lợi suất phiên',
              en: 'Standard deviation of per-session returns',
            },
            '\\bar{r}_p',
          ),
        ],
        calcEvidence: ['sampleStdDev(returns)'],
        formulaId: 'do-lech-chuan-loi-suat-phien',
      },
    ],
    skipped: { S: 'ket-qua', '\\sqrt{m}': 'da-hien-trong-hinh', m: 'nhap-tho' },
  },

  /*
   * σ_d đã hiện trọn ở vế sau của hình, đúng `downsideDeviation()`: chia TỔNG số lợi suất n. Lợi suất
   * phiên r_t là bước đầu của khung `\bar{r}_p`.
   */
  'ty-so-sortino': {
    entries: [
      BINH_QUAN_PHIEN,
      phiRuiRoMotPhien({
        vi: 'Ngưỡng phi rủi ro một phiên',
        en: 'Per-session risk-free threshold',
      }),
    ],
    skipped: {
      Sortino: 'ket-qua',
      '\\sigma_d': 'da-hien-trong-hinh',
      '\\sqrt{m}': 'da-hien-trong-hinh',
      m: 'nhap-tho',
      n: 'chi-so-chay',
      r_t: 'nam-trong-ky-hieu-khac',
      t: 'chi-so-chay',
      '\\min(0, r_t - r_f)': 'da-hien-trong-hinh',
    },
  },

  'ty-so-treynor': {
    entries: [
      BINH_QUAN_PHIEN,
      phiRuiRoMotPhien({ vi: 'Lãi suất phi rủi ro một phiên', en: 'Per-session risk-free rate' }),
      {
        kind: 'linked',
        symbol: '\\beta_p',
        phrases: { vi: ['Hệ số beta'], en: ['Beta coefficient'] },
        formulaId: 'beta',
        variableKey: 'beta',
      },
    ],
    skipped: { T: 'ket-qua', m: 'nhap-tho' },
  },

  /*
   * Chuẩn so sánh là MỘT con số %/năm, nên `calc` trừ cùng một lượng ở mọi phiên và độ lệch chuẩn phần
   * chênh lệch chính là `sampleStdDev(returns)` của danh mục (xem `note` của spec). Khung viết đúng như
   * mã; cả hai khung dính tới chuẩn chờ Q2 ở `REVIEW-2.md`, đổi sang chuỗi VN-Index thì phải viết lại.
   */
  'ty-so-thong-tin': {
    entries: [
      BINH_QUAN_PHIEN,
      {
        kind: 'derived',
        symbol: '\\bar{r}_b',
        phrases: { vi: ['Lợi suất chuẩn một phiên'], en: ['Per-session benchmark return'] },
        steps: [
          quyVeMotPhien(
            '\\bar{r}_b',
            { vi: 'Lợi suất chuẩn một phiên', en: 'Per-session benchmark return' },
            { vi: 'Lợi suất chuẩn so sánh một năm', en: 'Annual benchmark return' },
          ),
        ],
        calcEvidence: ["perSessionRate(v('benchmarkReturn'), sessions)"],
        pendingReview: 'Q2',
      },
      {
        kind: 'derived',
        symbol: '\\sigma_{p-b}',
        phrases: {
          vi: ['Độ lệch chuẩn phần chênh lệch'],
          en: ['Standard deviation of the difference'],
        },
        steps: [
          LOI_SUAT_PHIEN,
          doLechChuanMau(
            '\\sigma_{p-b}',
            {
              vi: 'Độ lệch chuẩn phần chênh lệch',
              en: 'Standard deviation of the difference',
            },
            '\\bar{r}_p',
          ),
        ],
        calcEvidence: ['sampleStdDev(returns)'],
        formulaId: 'do-lech-chuan-loi-suat-phien',
        pendingReview: 'Q2',
      },
    ],
    skipped: { IR: 'ket-qua', '\\sqrt{m}': 'da-hien-trong-hinh', m: 'nhap-tho' },
  },

  /*
   * Hai liên kết trỏ tới công thức ra CÙNG đại lượng nhưng tính bằng %, như Sharpe trỏ σ_p tới độ lệch
   * chuẩn phiên: `r_{nam}` là CAGR với số năm t = n ÷ m, MDD là `maxDrawdown()` của sụt giảm sâu nhất
   * mà không nhân 100. Calmar giữ cả hai ở dạng thập phân.
   */
  'ty-so-calmar': {
    entries: [
      {
        kind: 'derived',
        symbol: 'r_{nam}',
        phrases: { vi: ['Lợi suất năm hoá'], en: ['Annualized return'] },
        steps: [
          {
            latex: 'r_{nam} = \\left(\\frac{P_{cuoi}}{P_{dau}}\\right)^{\\frac{m}{n}} - 1',
            expression: {
              vi: 'Lợi suất năm hoá = (Giá đóng cửa phiên cuối ÷ Giá đóng cửa phiên đầu)^(Số phiên trong một năm ÷ Số lợi suất n) − 1, n bằng số phiên giá trừ 1',
              en: 'Annualized return = (Last close ÷ First close)^(Sessions per year ÷ Number of returns n) − 1, n is the number of prices minus 1',
            },
          },
        ],
        calcEvidence: [
          'const elapsed = closes.length - 1',
          'Math.pow(last / first, sessions / elapsed) - 1',
        ],
        formulaId: 'cagr',
      },
      {
        kind: 'derived',
        symbol: 'MDD',
        phrases: { vi: ['Mức sụt giảm sâu nhất từ đỉnh'], en: ['Maximum drawdown from peak'] },
        steps: [
          {
            latex: 'MDD = \\max_{t} \\frac{\\max_{s \\le t} P_s - P_t}{\\max_{s \\le t} P_s}',
            expression: {
              vi: 'Mức sụt giảm sâu nhất từ đỉnh = Lớn nhất theo phiên t của (Đỉnh cao nhất tính tới phiên t − Giá đóng cửa phiên t) ÷ Đỉnh cao nhất tính tới phiên t, dạng thập phân',
              en: 'Maximum drawdown from peak = Largest over sessions t of (Highest peak up to session t − Close of session t) ÷ Highest peak up to session t, as a decimal',
            },
          },
        ],
        calcEvidence: ['maxDrawdown(closes)'],
        formulaId: 'sut-giam-sau-nhat',
      },
    ],
    skipped: { Calmar: 'ket-qua' },
  },

  /*
   * Ngưỡng nhập theo % nên hình viết h dạng tỷ lệ (`Math.abs(v('threshold')) / 100`). Lợi suất phiên
   * r là bước đầu của cả hai khung, nên dòng `r` không có khung riêng.
   */
  'ty-so-thang-thua': {
    entries: [
      {
        kind: 'derived',
        symbol: '\\overline{r^{+}}',
        phrases: {
          vi: ['Trung bình mức tăng của các phiên tăng'],
          en: ['Average gain of rising sessions'],
        },
        steps: [
          LOI_SUAT_PHIEN,
          {
            latex: '\\overline{r^{+}} = \\frac{1}{k} \\sum_{r_t > h} r_t',
            expression: {
              vi: 'Trung bình mức tăng của các phiên tăng = Tổng lợi suất các phiên có lợi suất lớn hơn h ÷ Số phiên đó k, h là Ngưỡng bỏ qua phiên đi ngang',
              en: 'Average gain of rising sessions = Sum of returns of sessions with a return above h ÷ Number of those sessions k, h is the Threshold to ignore flat sessions',
            },
          },
        ],
        calcEvidence: [
          'simpleReturns(closes)',
          "Math.abs(v('threshold')) / 100",
          'returns.filter((r) => r > threshold)',
          'mean(gains)',
        ],
      },
      {
        kind: 'derived',
        symbol: '\\overline{r^{-}}',
        phrases: {
          vi: ['Trung bình mức giảm của các phiên giảm'],
          en: ['Average loss of falling sessions'],
        },
        steps: [
          LOI_SUAT_PHIEN,
          {
            latex: '\\overline{r^{-}} = \\frac{1}{k} \\sum_{r_t < -h} r_t',
            expression: {
              vi: 'Trung bình mức giảm của các phiên giảm = Tổng lợi suất các phiên có lợi suất nhỏ hơn −h ÷ Số phiên đó k, h là Ngưỡng bỏ qua phiên đi ngang',
              en: 'Average loss of falling sessions = Sum of returns of sessions with a return below −h ÷ Number of those sessions k, h is the Threshold to ignore flat sessions',
            },
          },
        ],
        calcEvidence: [
          'simpleReturns(closes)',
          "Math.abs(v('threshold')) / 100",
          'returns.filter((r) => r < -threshold)',
          'mean(losses)',
        ],
      },
    ],
    skipped: {
      'W/L': 'ket-qua',
      r: 'nam-trong-ky-hieu-khac',
      '\\left| \\overline{r^{-}} \\right|': 'phep-toan',
    },
  },
};
