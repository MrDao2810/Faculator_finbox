/**
 * Tầng DOMAIN — các BƯỚC dùng chung của khung "cách tính".
 *
 * Lợi suất phiên, trung bình, độ lệch chuẩn mẫu, lãi quy về một phiên… lặp lại ở hàng chục công
 * thức chuỗi giá. Viết một lần ở đây để hai công thức cùng dùng `sampleStdDev()` không thể tả nó
 * theo hai cách. Mỗi bước ghi rõ hàm nó tả; đổi hàm ấy thì phải đọc lại bước này.
 *
 * Bước nào có vế trái là ký hiệu RIÊNG của công thức (σ_p, σ, \bar{r}_p…) thì là một hàm nhận ký
 * hiệu và tên gọi, vì cửa gác đòi bước cuối bắt đầu bằng đúng ký hiệu của dòng bảng.
 */

import type { Bilingual } from '../types';
import type { HowToStep } from './types';

/** Lợi suất đơn giữa hai phiên liền nhau — `simpleReturns()` ở `series-utils.ts`. */
export const LOI_SUAT_PHIEN: HowToStep = {
  latex: 'r_t = \\frac{P_t}{P_{t-1}} - 1',
  expression: {
    vi: 'Lợi suất phiên t = Giá đóng cửa phiên t ÷ Giá đóng cửa phiên trước − 1',
    en: 'Return of session t = Close of session t ÷ Previous close − 1',
  },
};

/**
 * Trung bình cộng của chuỗi lợi suất — `mean(simpleReturns(closes))`.
 *
 * N giá cho N − 1 lợi suất, nên `n` ở đây là số LỢI SUẤT, không phải số phiên giá.
 */
export function trungBinhLoiSuat(symbol: string, ten: Bilingual): HowToStep {
  return {
    latex: `${symbol} = \\frac{1}{n} \\sum_{t=1}^{n} r_t`,
    expression: {
      vi: `${ten.vi} = Tổng lợi suất các phiên ÷ Số lợi suất n`,
      en: `${ten.en} = Sum of session returns ÷ Number of returns n`,
    },
  };
}

/**
 * Độ lệch chuẩn MẪU của chuỗi lợi suất — `sampleStdDev()` ở `series-utils.ts`, chia n − 1.
 *
 * `trungBinh` là ký hiệu trung bình mà bước dùng (thường `\\bar{r}`); nó phải được gọi tên ngay
 * trong dòng chữ, nên dòng chữ nói "trung bình" thay vì để ký hiệu trần.
 */
export function doLechChuanMau(symbol: string, ten: Bilingual, trungBinh = '\\bar{r}'): HowToStep {
  return {
    latex: `${symbol} = \\sqrt{\\frac{1}{n - 1} \\sum_{t=1}^{n} (r_t - ${trungBinh})^2}`,
    expression: {
      vi: `${ten.vi} = Căn bậc hai của (Tổng bình phương chênh lệch giữa từng lợi suất và lợi suất trung bình ÷ (Số lợi suất − 1))`,
      en: `${ten.en} = Square root of (Sum of squared gaps between each return and the mean return ÷ (Number of returns − 1))`,
    },
  };
}

/**
 * Lãi suất %/năm quy về MỘT PHIÊN theo lãi kép — `perSessionRate()` ở `risk-ratios.ts`:
 * `(1 + năm ÷ 100)^(1 ÷ m) − 1`.
 *
 * Hình viết lãi năm dạng tỷ lệ, không `÷ 100` — cùng quy ước với mọi hình công thức (ô gõ theo %
 * thì hình viết `1 + r`). `nam` là ký hiệu của lãi năm trong bước này.
 */
export function quyVeMotPhien(
  symbol: string,
  ten: Bilingual,
  tenNam: Bilingual,
  nam = 'r_{nam}',
): HowToStep {
  return {
    latex: `${symbol} = (1 + ${nam})^{\\frac{1}{m}} - 1`,
    expression: {
      vi: `${ten.vi} = (1 + ${tenNam.vi})^(1 ÷ Số phiên trong một năm) − 1`,
      en: `${ten.en} = (1 + ${tenNam.en})^(1 ÷ Sessions per year) − 1`,
    },
  };
}

/** Trung bình động đơn giản của n giá đóng cửa gần nhất — `lastSma()` ở `series-utils.ts`. */
export function smaGiaDongCua(symbol: string, ten: Bilingual): HowToStep {
  return {
    latex: `${symbol} = \\frac{P_t + P_{t-1} + \\dots + P_{t-n+1}}{n}`,
    expression: {
      vi: `${ten.vi} = Tổng giá đóng cửa của n phiên gần nhất ÷ n`,
      en: `${ten.en} = Sum of the closes of the last n sessions ÷ n`,
    },
  };
}

/**
 * Hai bước của EMA — `lastEma()` ở `series-utils.ts` và `emaSeries()` ở `technical-trend.ts`:
 * hệ số k = 2 ÷ (n + 1), mồi bằng SMA của n phiên đầu, rồi mỗi phiên trộn giá mới với EMA cũ.
 */
export function emaGiaDongCua(symbol: string, ten: Bilingual): ReadonlyArray<HowToStep> {
  return [
    {
      latex: 'k = \\frac{2}{n + 1}',
      expression: {
        vi: 'Hệ số làm mượt k = 2 ÷ (Số phiên n + 1)',
        en: 'Smoothing factor k = 2 ÷ (Number of sessions n + 1)',
      },
    },
    {
      latex: `${symbol} = P_t \\times k + EMA_{t-1} \\times (1 - k)`,
      expression: {
        vi: `${ten.vi} = Giá đóng cửa phiên t × k + EMA phiên trước × (1 − k), EMA đầu tiên là trung bình n phiên đầu`,
        en: `${ten.en} = Close of session t × k + Previous EMA × (1 − k), the first EMA is the average of the first n sessions`,
      },
    },
  ];
}
