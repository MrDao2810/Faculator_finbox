/**
 * Tầng DATA — đổi một bộ số liệu mẫu thành giá trị cho các ô nhập (FR-10).
 *
 * Trước đợt này bảng ánh xạ nằm ngay trong `FormulaDetail.tsx`, tức tầng PRESENTATION quyết định
 * "trường `sharesOutstanding` của báo cáo đi vào ô nào, theo đơn vị nào". Đó là kiến thức tài chính
 * chứ không phải việc của một component, và hệ quả đo được: bảng cũ bỏ sót số cổ phiếu, nên nạp FPT
 * cho công thức vốn hoá ra **giá FPT × số cổ phiếu mặc định 118 triệu** — sai gần 12 lần mà trên màn
 * không có gì nói là đã sai. Đưa xuống đây thì kiểm được bằng Node cho cả 111 công thức một lượt.
 *
 * FR-10 hứa "nạp xong vẫn sửa được từng ô", nên hàm này chỉ TRẢ VỀ giá trị; không khoá, không lưu.
 */

import type { CalcInputs } from '@/core/calc';
import type { FormulaSpec } from '@/core/registry';

import type { DailyBar, Fundamentals, Preset } from './types';

/**
 * Hai chân giá của một khoản đầu tư, và vì sao chúng lấy hai phiên khác nhau.
 *
 * Chân *giá vào* lấy phiên ĐẦU chuỗi, chân *giá hiện tại* lấy phiên CUỐI. Nếu cả hai cùng lấy phiên
 * cuối thì mọi công thức lãi lỗ nạp mẫu xong đều ra đúng 0% — mua và bán cùng một giá — tức bộ mẫu
 * bày ra một ca vô nghĩa. Lấy hai đầu chuỗi thì nạp mẫu thành một tình huống thật đọc được ngay:
 * "mua đầu kỳ, bán phiên gần nhất".
 *
 * Đây cũng đúng cách chia chân giá mà biểu đồ trục thời gian dùng (`src/core/chart/history.ts`),
 * nên hai chỗ không thể nói hai chuyện khác nhau về cùng một bộ số liệu.
 */
const ENTRY_LEG = ['buyPrice', 'startPrice', 'entryPrice'] as const;
const CURRENT_LEG = ['price', 'endPrice', 'sellPrice'] as const;

/** Một tỷ — đổi ₫ sang tỷ ₫. */
const BILLION = 1_000_000_000;
/** Một triệu — đổi CP sang triệu CP. */
const MILLION = 1_000_000;

/**
 * Mọi giá trị bộ mẫu suy ra được, theo khoá ô nhập.
 *
 * **Đơn vị là phần dễ sai nhất của cả file**, nên nói rõ từng dòng. Registry có HAI khoá cho số cổ
 * phiếu với hai đơn vị khác nhau: `sharesOutstanding` tính bằng **CP** (nhóm Chỉ số doanh nghiệp) và
 * `shares` tính bằng **triệu CP** (nhóm Định giá). Gán cùng một con số vào cả hai là sai một triệu
 * lần ở một trong hai chỗ. `preset-inputs.test.ts` khoá đơn vị của cả hai khoá lại, nên nếu sau này
 * ai đổi đơn vị trong spec thì test đỏ chứ không phải người dùng nhận số sai.
 */
function candidates(fundamentals: Fundamentals, bars: ReadonlyArray<DailyBar>): CalcInputs {
  const first = bars[0];
  const last = bars[bars.length - 1];

  const values: Record<string, number | undefined> = {
    // ── Chuỗi giá ────────────────────────────────────────────────────────────
    ...Object.fromEntries(ENTRY_LEG.map((key) => [key, first?.close])),
    ...Object.fromEntries(CURRENT_LEG.map((key) => [key, last?.close])),

    // ── Số trên mỗi cổ phiếu, đơn vị ₫ ───────────────────────────────────────
    eps: fundamentals.eps,
    bookValuePerShare: fundamentals.bookValuePerShare,
    dividendPerShare: fundamentals.dividendPerShare,
    dividend: fundamentals.dividendPerShare,

    // ── Khoản mục toàn doanh nghiệp, đơn vị tỷ ₫ ──────────────────────────────
    netIncome: fundamentals.netIncome,
    equity: fundamentals.equity,

    // ── Số cổ phiếu: hai khoá, hai đơn vị ────────────────────────────────────
    sharesOutstanding: fundamentals.sharesOutstanding,
    shares: fundamentals.sharesOutstanding / MILLION,
  };

  const clean: Record<string, number> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && Number.isFinite(value)) clean[key] = value;
  }
  return clean;
}

/**
 * Giá trị bộ mẫu điền được cho MỘT công thức.
 *
 * Chỉ trả về khoá mà công thức thật sự có, nên nơi gọi trộn thẳng vào state ô nhập được mà không sợ
 * đặt giá trị cho một biến không tồn tại. Công thức không liên quan tới mã nào — lãi kép, CAGR,
 * lãi lỗ phái sinh — trả về object rỗng, và đó là câu trả lời đúng chứ không phải thiếu sót: đầu
 * vào của chúng là tiền và giả định của chính người dùng, không mã nào có thay họ được.
 */
export function presetInputs(preset: Preset, spec: FormulaSpec): CalcInputs {
  const all = candidates(preset.fundamentals, preset.bars);
  const filled: Record<string, number> = {};

  for (const variable of spec.variables) {
    const value = all[variable.key];
    if (value !== undefined) filled[variable.key] = value;
  }

  return filled;
}

/** Mọi khoá mà bộ mẫu điền được — cho test và cho phần đếm phủ. */
export function presetFillableKeys(preset: Preset): ReadonlyArray<string> {
  return Object.keys(candidates(preset.fundamentals, preset.bars)).sort();
}
