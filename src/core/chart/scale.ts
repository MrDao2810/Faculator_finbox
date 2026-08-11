/**
 * Tầng DOMAIN — miền, vạch chia và phép chiếu của biểu đồ.
 *
 * Tự viết thay vì thêm `d3-scale`: cả file này gọn hơn 100 dòng, test được bằng Node, và không
 * đội một byte nào lên gói (NFR-PER-04) — cùng lý do `virtual-window.ts` tự viết ảo hoá.
 *
 * Việc quan trọng nhất ở đây KHÔNG phải chia vạch cho đẹp, mà là **không bao giờ nhả ra một số
 * không hữu hạn**. Chrome bỏ qua toàn bộ `<path>` nếu chuỗi `d` chứa `NaN`, nên biểu đồ sẽ biến
 * mất IM LẶNG — kiểu hỏng tệ nhất, vì không có gì trên màn nói là đã hỏng. Bốn lưới an toàn ở
 * `niceAxis()` chặn đúng chuyện đó.
 */

/** Trần cứng số vạch, cũng là chốt chặn vòng lặp không kết thúc. */
const MAX_TICKS = 12;

export interface NiceAxis {
  domain: readonly [number, number];
  ticks: number[];
  step: number;
  /** Số chữ số thập phân nên hiện ở nhãn vạch, suy từ bước. */
  decimals: number;
}

/**
 * Miền của một chuỗi giá trị, BỎ QUA mọi `null`.
 *
 * Điểm không tính được không được phép kéo trục — đó là một nửa của việc giữ FR-06 ở tầng biểu
 * đồ. Nửa còn lại là `linePath()` làm đường đứt.
 *
 * @returns `null` khi không có giá trị hữu hạn nào — nơi gọi phải xử lý, chứ không nhận `[0, 0]`
 * rồi vẽ một biểu đồ rỗng trông như thật.
 */
export function extentOf(values: ReadonlyArray<number | null>): readonly [number, number] | null {
  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;

  for (const value of values) {
    if (value === null || !Number.isFinite(value)) continue;
    if (value < lo) lo = value;
    if (value > hi) hi = value;
  }

  return Number.isFinite(lo) && Number.isFinite(hi) ? [lo, hi] : null;
}

/** Bước tròn gần `rough` nhất, thuộc {1, 2, 5} × 10^k. */
export function niceStep(rough: number): number {
  if (!Number.isFinite(rough) || rough <= 0) return 1;

  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const normalised = rough / magnitude;
  const multiplier = normalised <= 1 ? 1 : normalised <= 2 ? 2 : normalised <= 5 ? 5 : 10;

  return multiplier * magnitude;
}

/** Số chữ số thập phân cần để viết một bước ra chữ mà không mất thông tin. */
export function decimalsOf(step: number): number {
  if (!Number.isFinite(step) || step <= 0 || step >= 1) return 0;
  return Math.min(6, Math.ceil(-Math.log10(step)));
}

/** Cắt đuôi dấu phẩy động sinh ra khi nhân chia bước — 0,30000000000000004 thành 0,3. */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Miền đã nới ra bội của bước, kèm mảng vạch chia.
 *
 * Trả cả `domain` lẫn `ticks` trong MỘT hàm có chủ đích: nếu tách thành hai hàm thì chúng phải
 * tự tính lại bước và có ngày lệch nhau, lúc đó vạch chia rơi ra ngoài khung mà không ai thấy.
 *
 * Bốn lưới an toàn, theo thứ tự:
 *   1. đầu vào không hữu hạn → `[0, 1]`, không để `NaN` chạy tiếp;
 *   2. `hi < lo` → hoán vị, chứ không trả miền âm rồi chia cho số âm;
 *   3. `lo === hi` (chuỗi phẳng, rất thường gặp khi công thức không phụ thuộc biến đang quét)
 *      → nới hai bên, nên không bao giờ chia cho 0 lúc chiếu toạ độ;
 *   4. số vạch bị chặn ở `MAX_TICKS`.
 */
export function niceAxis(lo: number, hi: number, target = 5): NiceAxis {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { domain: [0, 1], ticks: [0, 0.5, 1], step: 0.5, decimals: 1 };
  }

  let low = Math.min(lo, hi);
  let high = Math.max(lo, hi);

  if (low === high) {
    const pad = Math.max(Math.abs(low) * 0.1, 1);
    low -= pad;
    high += pad;
  }

  const step = niceStep((high - low) / Math.max(2, target));
  const decimals = decimalsOf(step);

  const start = round(Math.floor(low / step) * step, decimals);
  const end = round(Math.ceil(high / step) * step, decimals);
  // Miền suy biến sau khi làm tròn (bước lớn hơn cả khoảng dữ liệu) — nới thêm một bước.
  const domain: readonly [number, number] = end > start ? [start, end] : [start, start + step];

  const ticks: number[] = [];
  for (let i = 0; i <= MAX_TICKS; i += 1) {
    const value = round(domain[0] + i * step, decimals);
    if (value > domain[1]) break;
    ticks.push(value);
  }
  // Chuỗi phẳng có thể cho đúng một vạch; hai đầu miền luôn đáng có nhãn.
  if (ticks.length < 2) ticks.push(domain[1]);

  return { domain, ticks, step, decimals };
}

/**
 * Hàm chiếu giá trị dữ liệu sang toạ độ vẽ.
 *
 * `niceAxis()` đã bảo đảm `domain[0] < domain[1]`, nhưng hàm này vẫn tự chặn miền suy biến: nó
 * nhận được miền từ nơi khác nữa (bản in, Canvas) và một phép chia cho 0 ở đây là cả biểu đồ
 * biến mất.
 */
export function linearScale(
  domain: readonly [number, number],
  range: readonly [number, number],
): (value: number) => number {
  const span = domain[1] - domain[0];
  if (!Number.isFinite(span) || span === 0) return () => range[0];

  const ratio = (range[1] - range[0]) / span;
  return (value) => range[0] + (value - domain[0]) * ratio;
}
