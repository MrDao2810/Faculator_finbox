/**
 * Khung "cách tính" của nhóm `src/core/formulas/risk-drawdown.ts` — kiểu dữ liệu và luật ở `types.ts`.
 *
 * Khung tả đúng ba hàm cục bộ của file công thức:
 *
 * - `windowOf()`: cửa sổ là `max(tối thiểu, round(lookback))` phiên CUỐI chuỗi, tối thiểu 30 với hai
 *   công thức sụt giảm và 60 với VaR/CVaR; chuỗi ngắn hơn thì `slice(-size)` trả cả chuỗi. Đỉnh, lợi
 *   suất và phân vị đều tính trong cửa sổ ấy, không phải trên cả chuỗi đã nạp.
 * - `percentileLinear()`: vị trí h = (n − 1) × p trên chuỗi lợi suất đã xếp tăng dần, đếm từ 0, rồi
 *   nội suy tuyến tính giữa quan sát ở phần nguyên của h và quan sát kế tiếp (cách PERCENTILE.INC).
 * - `lossTailOf()`: lợi suất đơn của cửa sổ, ngưỡng là phân vị mức 1 − độ tin cậy.
 */

import { LOI_SUAT_PHIEN } from './recipes';
import type { FormulaHowTo, HowToStep } from './types';

/**
 * Cửa sổ quan sát — `windowOf(closes, lookback, min)`. Nhận chuỗi chứ không nhận số để hằng số trong
 * dòng chữ và trong hình luôn là một.
 */
function cuaSoQuanSat(toiThieu: '30' | '60'): HowToStep {
  return {
    latex: `N = \\max(${toiThieu}, L)`,
    expression: {
      vi: `Số phiên của cửa sổ N = lớn nhất của (${toiThieu}, Số phiên gần nhất đưa vào tính L), lấy N phiên cuối chuỗi giá, chuỗi ngắn hơn thì lấy cả chuỗi`,
      en: `Window size N = larger of (${toiThieu}, Number of recent sessions to include L), taking the last N sessions of the price series, or the whole series if shorter`,
    },
  };
}

/**
 * `LOI_SUAT_PHIEN` với vế trái là `r` trần như bảng ký hiệu của VaR/CVaR — cửa gác đòi bước cuối bắt
 * đầu bằng đúng ký hiệu của dòng bảng. Vế phải và dòng chữ lấy nguyên từ công thức chung, nên
 * `simpleReturns()` vẫn chỉ được tả một cách.
 */
const LOI_SUAT_R: HowToStep = {
  latex: LOI_SUAT_PHIEN.latex.replace(/^r_t =/, 'r ='),
  expression: LOI_SUAT_PHIEN.expression,
};

/**
 * Hai bước của `percentileLinear(sorted, 1 - confidence / 100)`.
 *
 * Khác sách: cách đếm thường gặp lấy thẳng một quan sát của chuỗi đã xếp; mã nội suy giữa hai quan
 * sát liền kề, nên ngưỡng có thể không trùng lợi suất nào của mẫu. Khung viết theo mã. Độ tin cậy
 * gõ theo % nên hình viết `1 - \alpha` dạng tỷ lệ, không `÷ 100`.
 */
const PHAN_VI_NOI_SUY: ReadonlyArray<HowToStep> = [
  {
    latex: 'h = (n - 1) \\times (1 - \\alpha)',
    expression: {
      vi: 'Vị trí h = (Số lợi suất n − 1) × (1 − Độ tin cậy), vị trí 0 là lợi suất thấp nhất sau khi xếp tăng dần',
      en: 'Position h = (Number of returns n − 1) × (1 − Confidence level), position 0 being the lowest return once sorted in ascending order',
    },
  },
  {
    latex: 'Q_{1-\\alpha}(r_N) = r_{(k)} + (h - k) \\times (r_{(k+1)} - r_{(k)})',
    expression: {
      vi: 'Phân vị = Lợi suất ở vị trí k + (h − k) × (Lợi suất ở vị trí kế tiếp − Lợi suất ở vị trí k), k là phần nguyên của h',
      en: 'Percentile = Return at position k + (h − k) × (Return at the next position − Return at position k), where k is the whole part of h',
    },
  },
];

/** Mẩu mã chung của hai công thức đọc lợi suất trong cửa sổ — `lossTailOf()` và `windowOf()`. */
const MA_LOI_SUAT_CUA_SO: ReadonlyArray<string> = [
  "lossTailOf(ctx, v('lookback'), confidence)",
  'simpleReturns(windowOf(closes, lookback, MIN_VAR_BARS))',
  'const size = Math.max(min, Math.round(lookback))',
  'return closes.slice(-size)',
];

/** Mẩu mã chung của hai công thức đọc ngưỡng phân vị — `lossTailOf()` và `percentileLinear()`. */
const MA_PHAN_VI: ReadonlyArray<string> = [
  'const sorted = [...returns].sort((a, b) => a - b)',
  'percentileLinear(sorted, 1 - confidence / 100)',
  'const h = (sorted.length - 1) * ratio',
  'const lower = Math.floor(h)',
  'return a + (h - lower) * (b - a)',
];

export const HOW_TO_RISK_DRAWDOWN: Readonly<Record<string, FormulaHowTo>> = {
  /*
   * Đỉnh chạy `\max_{s \le t} P_s` hiện dấu max trong hình, nhưng hình không nói s bắt đầu từ đâu —
   * `maxDrawdown(window)` chỉ nhìn cửa sổ, không nhìn cả chuỗi. Nên dòng này có khung.
   */
  'sut-giam-sau-nhat': {
    entries: [
      {
        kind: 'derived',
        symbol: '\\max_{s \\le t} P_s',
        phrases: {
          vi: ['Đỉnh cao nhất tính tới phiên đó'],
          en: ['highest peak up to that session'],
        },
        steps: [
          cuaSoQuanSat('30'),
          {
            latex: '\\max_{s \\le t} P_s = \\max(P_1, P_2, \\dots, P_t)',
            expression: {
              vi: 'Đỉnh cao nhất tính tới phiên t = lớn nhất của các giá đóng cửa từ phiên đầu cửa sổ tới phiên t',
              en: 'Highest peak up to session t = largest of the closes from the first session of the window to session t',
            },
          },
        ],
        calcEvidence: [
          "windowOf(closes, v('lookback'), MIN_DRAWDOWN_BARS)",
          'const size = Math.max(min, Math.round(lookback))',
          'return closes.slice(-size)',
          'maxDrawdown(window)',
        ],
      },
    ],
    skipped: {
      MDD: 'ket-qua',
      '\\max_{t \\le N}': 'phep-toan',
      t: 'chi-so-chay',
      N: 'nhap-tho',
      s: 'chi-so-chay',
      P_s: 'nhap-tho',
      P_t: 'nhap-tho',
      '100': 'hang-so',
    },
  },

  'sut-giam-hien-tai': {
    entries: [
      {
        kind: 'derived',
        symbol: 'P_{max}',
        phrases: { vi: ['Đỉnh cao nhất trong cửa sổ'], en: ['highest peak in the window'] },
        steps: [
          cuaSoQuanSat('30'),
          {
            latex: 'P_{max} = \\max(P_1, P_2, \\dots, P_t)',
            expression: {
              vi: 'Đỉnh cao nhất trong cửa sổ = lớn nhất của các giá đóng cửa từ phiên đầu cửa sổ tới phiên gần nhất',
              en: 'Highest peak in the window = largest of the closes from the first session of the window to the most recent session',
            },
          },
        ],
        calcEvidence: [
          "windowOf(closes, v('lookback'), MIN_DRAWDOWN_BARS)",
          'const size = Math.max(min, Math.round(lookback))',
          'window.reduce((best, close) => Math.max(best, close), Number.NEGATIVE_INFINITY)',
        ],
      },
    ],
    skipped: {
      'DD_{t}': 'ket-qua',
      'P_{t}': 'nhap-tho',
      t: 'chi-so-chay',
      '100': 'hang-so',
    },
  },

  'var-lich-su': {
    entries: [
      {
        kind: 'derived',
        symbol: 'Q_{1-\\alpha}(r_N)',
        phrases: {
          vi: ['Phân vị mức (1 − Độ tin cậy)'],
          en: ['percentile at level (1 − confidence)'],
        },
        steps: PHAN_VI_NOI_SUY,
        calcEvidence: MA_PHAN_VI,
      },
      {
        kind: 'derived',
        symbol: 'r',
        phrases: { vi: ['chuỗi lợi suất phiên'], en: ['session returns series'] },
        steps: [cuaSoQuanSat('60'), LOI_SUAT_R],
        calcEvidence: MA_LOI_SUAT_CUA_SO,
      },
    ],
    skipped: { 'VaR_{\\alpha}': 'ket-qua', '\\alpha': 'nhap-tho', N: 'nhap-tho', '100': 'hang-so' },
  },

  /*
   * `E` có khung dù trông như một phép toán: người mới không đọc được "kỳ vọng có điều kiện", và mã
   * chỉ lấy trung bình cộng các lợi suất lọt qua phép lọc.
   *
   * Khác sách: sách thường lấy trung bình đúng (1 − α) × n quan sát tệ nhất; mã lọc MỌI lợi suất không
   * cao hơn ngưỡng đã nội suy, nên số quan sát m do phép lọc quyết định (ca 95% của `CHUOI_VAR_MAU`:
   * 60 lợi suất, m = 4 chứ không phải 3, vì hai phiên −1% cùng bằng ngưỡng).
   *
   * `Q_{1-\alpha}(r)` trỏ sang `var-lich-su`: chính bảng ký hiệu gọi nó là "ngưỡng VaR trước khi đổi
   * dấu", cùng cách tính `lossTailOf()`. VaR ra số đã đổi dấu và nhân 100, như `ty-so-sharpe` trỏ
   * σ_p sang công thức ra độ lệch chuẩn tính bằng %.
   */
  'cvar-lich-su': {
    entries: [
      {
        kind: 'derived',
        symbol: 'E',
        phrases: { vi: ['Trung bình'], en: ['average'] },
        steps: [
          {
            latex: 'E = \\frac{1}{m} \\sum_{r_N \\le Q_{1-\\alpha}(r_N)} r_N',
            expression: {
              vi: 'Trung bình phần đuôi = Tổng các lợi suất phiên không cao hơn ngưỡng VaR ÷ Số lợi suất đó m',
              en: 'Tail average = Sum of the session returns no higher than the VaR threshold ÷ Their count m',
            },
          },
        ],
        calcEvidence: [
          'const worst = tail.returns.filter((r) => r <= tail.threshold)',
          'const trungBinhDuoi = mean(worst)',
        ],
      },
      {
        kind: 'derived',
        symbol: 'r',
        phrases: { vi: ['lợi suất phiên'], en: ['session returns'] },
        steps: [cuaSoQuanSat('60'), LOI_SUAT_R],
        calcEvidence: MA_LOI_SUAT_CUA_SO,
      },
      {
        kind: 'derived',
        symbol: 'Q_{1-\\alpha}(r_N)',
        phrases: { vi: ['ngưỡng VaR'], en: ['VaR threshold'] },
        steps: PHAN_VI_NOI_SUY,
        calcEvidence: MA_PHAN_VI,
        formulaId: 'var-lich-su',
      },
    ],
    skipped: {
      'CVaR_{\\alpha}': 'ket-qua',
      '\\alpha': 'nhap-tho',
      N: 'nhap-tho',
      '\\mid': 'phep-toan',
      '100': 'hang-so',
    },
  },
};
