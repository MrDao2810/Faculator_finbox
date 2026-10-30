import type { Cashflow } from './cashflow-series';
import type { CalcWarning } from './types';
import { meaningless } from './warnings';

/**
 * Phần toán thuần của XIRR, tách khỏi `formulas/returns.ts` ngày 28/10/2026.
 *
 * Vì sao tách: màn Danh mục gọi `xirr()` cho hàng XIRR của thẻ tổng hợp (`portfolio.ts`). Nhập từ
 * file nhóm `returns.ts` là chở theo spec của cả nhóm (diễn giải, ví dụ, ca kiểm của 8 công thức) —
 * 9,7 kB gzip trên `/danh-muc/`, vì các object spec gọi hàm (`sliderVar`, `withSymbol`…) nên
 * không bị tree-shake. `returns.ts` nhập lại từ đây và xuất tiếp, nên mọi chỗ nhập cũ không đổi.
 */

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
 * Dòng tiền của XIRR ĐÚNG THEO THỨ TỰ bộ giải dùng: xếp theo ngày, mỗi dòng mang số ngày tính từ
 * dòng đầu tiên. Tách khỏi `xirr()` ngày 16/10/2026 để `calc` trả đúng những con số này cho dải thay
 * số — dải in lại phương trình `Σ CFᵢ ÷ (1 + XIRR)^(dᵢ ÷ 365) ≈ 0`, nên thứ tự và số ngày phải là
 * của bộ giải, không phải của bảng người dùng gõ (bảng có thể chưa xếp theo ngày).
 */
export function xirrDiem(
  cashflows: ReadonlyArray<Cashflow>,
): Array<{ days: number; amount: number }> | null {
  const sorted = [...cashflows].sort((a, b) => a.date.localeCompare(b.date));
  const first = sorted[0];
  if (first === undefined) return null;

  const start = Date.parse(`${first.date}T00:00:00Z`);
  if (Number.isNaN(start)) return null;

  const diem: Array<{ days: number; amount: number }> = [];
  for (const flow of sorted) {
    const at = Date.parse(`${flow.date}T00:00:00Z`);
    if (Number.isNaN(at)) return null;
    diem.push({ days: (at - start) / 86_400_000, amount: flow.amount });
  }
  return diem;
}

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

  const diem = xirrDiem(cashflows);
  if (diem === null) return null;
  // Mọi dòng tiền cùng một ngày: giá trị hiện tại luôn bằng tổng tiền với MỌI suất, nên không có
  // suất nào "đúng". Không có dòng này, vòng Newton đầu thấy |npv| < tolerance và trả luôn giá trị
  // đoán khởi điểm (danh mục mua hôm nay đúng bằng thị giá in "10 %/năm").
  if (diem.every((d) => d.days === 0)) return null;
  const points = diem.map((d) => ({ years: d.days / DAYS_PER_YEAR, amount: d.amount }));

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
      vi: 'Kiểm tra lại: cần ít nhất một khoản chi ra và một khoản thu về, kèm ngày của từng khoản. Nếu đã đủ cả hai thì lãi hoặc lỗ đang nằm trong quãng ngày quá ngắn để quy ra suất sinh lợi năm — với quãng vài ngày, ROI hoặc HPR đọc dễ hơn.',
      en: 'Check again: you need at least one outflow and one inflow, each with its date. If both are already there, the gain or loss sits in too short a span of days to annualize — over a few days, ROI or HPR reads more easily.',
    },
  );
}
