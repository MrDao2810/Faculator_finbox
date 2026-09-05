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

/**
 * Bề rộng miền nhỏ nhất còn VIẾT RA CHỮ được — khớp đúng trần 6 chữ số của `decimalsOf()`.
 *
 * Hẹp hơn ngần này thì `round()` bên dưới ép cả hai đầu miền lẫn mọi vạch về CÙNG một số: trục in
 * ra một cột toàn `0`, các đường lưới chồng lên nhau, và `pickScale()` bên `build.ts` không thấy gì
 * bất thường vì nhãn `'0'` vừa khít ngân sách 6 ký tự. Trục trông hợp lệ mà không nói gì cả — kiểu
 * hỏng cùng họ với `NaN` trong `d`, chỉ khác là nó im lặng hơn.
 */
const MIN_ABS_SPAN = 1e-6;

/**
 * Bề rộng miền nhỏ nhất so với ĐỘ LỚN của nó.
 *
 * Ràng buộc thứ hai vì `MIN_ABS_SPAN` không đủ ở đầu kia của thang: một miền rộng 0,001 quanh
 * 10^12 vượt xa ngưỡng tuyệt đối, nhưng `Math.round(value * 10^decimals)` ở đó đã chạm trần số
 * nguyên an toàn của double (2^53) và trả về những con số lệch nhau ngẫu nhiên.
 */
const MIN_REL_SPAN = 1e-9;

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

/**
 * Số chữ số thập phân cần để viết một bước ra chữ mà không mất thông tin.
 *
 * Trần 12, không phải 6. Trần 6 cũ vừa quá chặt vừa đặt sai chỗ: nó là một quyết định về ĐỘ DÀI
 * NHÃN, mà độ dài nhãn đã có `MAX_TICK_CHARS_Y`/`MAX_TICK_CHARS_X` bên `build.ts` lo — hai luật
 * cùng canh một việc thì luật chặt hơn thắng ở chỗ không ai ngờ. Đo được: bước `5e-7` cần 7 chữ
 * số, bị kẹp xuống 6 nên hai vạch `5e-7` và `1e-6` cùng in ra `'0,000001'`, `pickScale()` thấy
 * nhãn ngắn nên giữ nguyên, và trục `EV/EBITDA` hiện ba nhãn `'0'` giống hệt nhau.
 *
 * 12 là trần của phép khử nhiễu dấu phẩy động ngay dưới đây — quá số đó thì thứ hiện ra là rác
 * của kiểu `double`, không phải chữ số của dữ liệu.
 */
export function decimalsOf(step: number): number {
  if (!Number.isFinite(step) || step <= 0 || step >= 1) return 0;
  return Math.min(12, Math.ceil(-Math.log10(step)));
}

/**
 * Cắt đuôi dấu phẩy động sinh ra khi nhân chia bước — 0,30000000000000004 thành 0,3.
 *
 * Làm tròn theo CHỮ SỐ CÓ NGHĨA, không theo số chữ số thập phân, và đó là chỗ bản trước sai. Trần
 * 6 chữ số thập phân của `decimalsOf()` khi ấy cũng chặn luôn hàm này, nên với bước nhỏ hơn `1e-6`
 * phép "cắt đuôi" biến thành phép LÀM TRÒN THẬT: `round(5e-7, 6)` cho `1e-6`, tức đầu miền bị đẩy
 * LÊN CAO HƠN giá trị nhỏ nhất của dữ liệu. Quét 10.660 cặp miền bắt được 450 cặp vi phạm, và trên
 * màn thì 9/41 điểm của `ev-ebitda` rơi xuống toạ độ 189,6 trong khi đáy vùng vẽ ở 166 — đường vẽ
 * ra ngoài khung, và phần ngoài khung ấy nằm ngoài cả vùng bắt sự kiện nên không rê/bấm được.
 *
 * 12 chữ số có nghĩa: nhiễu của `double` nằm ở chữ số thứ 16–17, nên 12 khử sạch nhiễu mà không
 * chạm tới chữ số thật ở BẤT KỲ thang nào — khác hẳn một trần thập phân, thứ luôn gắn với một
 * thang cụ thể.
 */
function tidy(value: number): number {
  return value === 0 ? 0 : Number(value.toPrecision(12));
}

/**
 * Miền đã nới ra bội của bước, kèm mảng vạch chia.
 *
 * Trả cả `domain` lẫn `ticks` trong MỘT hàm có chủ đích: nếu tách thành hai hàm thì chúng phải
 * tự tính lại bước và có ngày lệch nhau, lúc đó vạch chia rơi ra ngoài khung mà không ai thấy.
 *
 * Năm lưới an toàn, theo thứ tự:
 *   1. đầu vào không hữu hạn → `[0, 1]`, không để `NaN` chạy tiếp;
 *   2. `hi < lo` → hoán vị, chứ không trả miền âm rồi chia cho số âm;
 *   3. miền HẸP tới mức không viết ra chữ được — kể cả `lo === hi` (chuỗi phẳng, rất thường gặp
 *      khi công thức không phụ thuộc biến đang quét) — → nới hai bên, nên không bao giờ chia cho 0
 *      lúc chiếu toạ độ, và hai đầu miền luôn có nhãn PHÂN BIỆT nhau;
 *   4. số vạch bị chặn ở `MAX_TICKS`;
 *   5. vạch trùng giá trị bị loại, nên "vạch tăng ngặt" là thứ hàm tự bảo đảm;
 *   6. hai mép miền được kiểm lại là có BỌC TRỌN dữ liệu không — điểm nằm ngoài miền sẽ bị chiếu
 *      ra ngoài vùng vẽ, và ở đó nó vừa không đọc được vừa không rê/bấm được.
 */
export function niceAxis(lo: number, hi: number, target = 5): NiceAxis {
  if (!Number.isFinite(lo) || !Number.isFinite(hi)) {
    return { domain: [0, 1], ticks: [0, 0.5, 1], step: 0.5, decimals: 1 };
  }

  let low = Math.min(lo, hi);
  let high = Math.max(lo, hi);

  /*
   * Nới quanh TÂM, không quanh `low`: hai mốc chỉ trùng nhau khi miền phẳng thật, và ở miền hẹp
   * mà không phẳng thì nới quanh một đầu là đẩy lệch cả hình sang một bên.
   */
  const magnitude = Math.max(Math.abs(low), Math.abs(high));
  if (high - low < Math.max(MIN_ABS_SPAN, magnitude * MIN_REL_SPAN)) {
    const center = (low + high) / 2;
    /* Mốc sàn là 1 chứ không phải `MIN_ABS_SPAN`: quanh tâm 0 thì `|center| * 0,1` bằng 0, và nới
       ra đúng một phần triệu là rơi thẳng lại vào chỗ vừa thoát ra. */
    const pad = Math.max(Math.abs(center) * 0.1, 1);
    low = center - pad;
    high = center + pad;
  }

  const step = niceStep((high - low) / Math.max(2, target));
  const decimals = decimalsOf(step);

  let start = tidy(Math.floor(low / step) * step);
  let end = tidy(Math.ceil(high / step) * step);
  /*
   * Lưới 6 — miền phải BỌC TRỌN dữ liệu, và đây là chỗ chốt lại điều đó thay vì tin vào phép chia.
   *
   * `Math.floor(low / step)` đã đúng về mặt toán, nhưng cả phép chia lẫn `tidy()` đều là số thực:
   * một sai lệch ở chữ số thứ 12 cũng đủ đẩy mép miền qua bên kia giá trị nhỏ nhất, và hậu quả
   * không hề nhỏ — điểm nằm ngoài miền bị `linearScale()` chiếu ra ngoài vùng vẽ. Lùi/tiến ĐÚNG
   * một bước giữ hai mép nằm nguyên trên lưới vạch, nên không sinh ra một vạch lẻ nào.
   */
  if (start > low) start = tidy(start - step);
  if (end < high) end = tidy(end + step);

  // Miền suy biến sau khi làm tròn (bước lớn hơn cả khoảng dữ liệu) — nới thêm một bước.
  const domain: readonly [number, number] = end > start ? [start, end] : [start, start + step];

  const ticks: number[] = [];
  for (let i = 0; i <= MAX_TICKS; i += 1) {
    const value = tidy(domain[0] + i * step);
    if (value > domain[1]) break;
    // Lưới 5: bước quá nhỏ so với mép miền thì `tidy()` nhả lại đúng vạch vừa đẩy vào.
    if (ticks[ticks.length - 1] === value) continue;
    ticks.push(value);
  }
  /*
   * Không đủ hai vạch thì lấy thẳng hai đầu miền — lưới 3 đã bảo đảm chúng khác nhau, nên đây vừa
   * là đường lui cuối vừa là chỗ bất biến "vạch tăng ngặt" được chốt lại.
   */
  if (ticks.length < 2) return { domain, ticks: [domain[0], domain[1]], step, decimals };

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
