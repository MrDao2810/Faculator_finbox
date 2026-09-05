import type { ChartTick } from '@/application';

/**
 * Hai phép xử lý nhãn vạch mà CẢ HAI renderer cần — `LineChart` và `WaterfallChart`.
 *
 * Ở riêng một file chứ không nằm trong `LineChart.tsx` như trước, vì thác nước thiếu đúng cả hai và
 * thiếu thì hỏng thật: nó in toàn bộ nhãn vạch (chồng nhau), và nó canh giữa nhãn vạch cuối tại
 * `x = 308` trên khung 320 nên nhãn `15.000` của `ev` chạy tới 322,6 — ĐO ĐƯỢC bằng `getBBox()`
 * trong Chrome thật, không phải ước lượng.
 *
 * Cả hai đều thuần số học trên mảng và trên hằng số `viewBox`, không đọc DOM — nên an toàn ở cả hai
 * phía ranh giới `next/dynamic`, nơi mọi phép đo lúc dựng là một đường lệch hydration.
 *
 * KHÔNG xuất ra `index.ts`: barrel ấy chỉ mở `FormulaChart`/`hasChart`, và mở thêm là kéo cả thư mục
 * charts ra khỏi chunk nạp trễ.
 */

/**
 * Giữ lại chừng `keep` nhãn vạch, bỏ bớt phần còn lại.
 *
 * Vạch chia thì vẽ hết cho mắt bám, nhưng nhãn CHỮ thì không: 12 nhãn `120.000` cạnh nhau trên 268
 * đơn vị bề ngang là chồng lên nhau thành vệt đen. Luôn giữ vạch đầu và vạch cuối.
 */
export function thin(ticks: ReadonlyArray<ChartTick>, keep: number): ReadonlyArray<ChartTick> {
  if (ticks.length <= keep) return ticks;
  const stride = Math.ceil((ticks.length - 1) / (keep - 1));
  return ticks.filter((_, index) => index % stride === 0 || index === ticks.length - 1);
}

/**
 * Nửa bề ngang dự phòng của một nhãn vạch, tính bằng đơn vị viewBox.
 *
 * Đo trên Chrome thật ở khổ 360px: nhãn `15.000` (6 ký tự, cỡ chữ 10px) rộng 29,2 đơn vị, tức ~4,9
 * đơn vị mỗi ký tự. Ngân sách nhãn vạch dài nhất là 10 ký tự (`MAX_TICK_CHARS_X` bên
 * `chart/build.ts`) → chừng 49 đơn vị, nửa là 25.
 */
const HALF_LABEL = 25;

/**
 * Cách canh một nhãn vạch nằm ngang, theo khoảng cách tới mép `viewBox`.
 *
 * Kẹp theo mép **viewBox**, KHÔNG theo mép vùng vẽ — đó là chỗ dễ nhầm và bản đầu tiên của hàm này
 * đã nhầm đúng như vậy. Thứ cắt cụt chữ là `<svg>` (mặc định `overflow: hidden` ở gốc), không phải
 * hai đường trục; nhãn tại `plot.x0 = 46` canh giữa chạy từ 21 tới 71, nằm gọn trong khung nên
 * KHÔNG có gì phải sửa, còn nhãn tại `plotRight = 308` thì chạy tới 333 và mất đuôi. Kẹp nhầm mốc
 * thì vừa bỏ sót chỗ hỏng thật, vừa xê dịch những nhãn vốn không sao.
 */
export function tickAnchor(x: number, viewWidth: number): 'start' | 'middle' | 'end' {
  if (x < HALF_LABEL) return 'start';
  if (viewWidth - x < HALF_LABEL) return 'end';
  return 'middle';
}

/**
 * Bề ngang ƯỚC LƯỢNG của một chuỗi, tính bằng đơn vị viewBox.
 *
 * Suy thẳng từ phép đo đứng sau `HALF_LABEL`: 4,9 đơn vị mỗi ký tự ở cỡ chữ 10px, tức 0,49 đơn vị
 * cho mỗi px cỡ chữ. Ước lượng chứ không đo thật, và đó là điều kiện chứ không phải hạn chế — cả
 * file này chạy ở hai phía ranh giới `next/dynamic`, nơi một phép đo DOM lúc dựng là một đường
 * lệch hydration. Mốc cố tình rộng tay: một nhãn bị đẩy vào trong sớm hơn cần thiết thì không ai
 * nhận ra, một nhãn bị cắt cụt thì mất chữ thật.
 */
export function textWidth(text: string, fontSize: number): number {
  return text.length * fontSize * 0.49;
}

/** Khoảng hở giữa nhãn và vạch nó bám theo — cùng con số ở cả hai nơi gọi. */
const LABEL_GAP = 6;

/** Nhãn nằm trọn trong khung chưa? */
function vuaKhung(x: number, anchor: 'start' | 'end', width: number, viewWidth: number): boolean {
  const left = anchor === 'end' ? x - width : x;
  return left >= 0 && left + width <= viewWidth;
}

/**
 * Chỗ đứng của một nhãn BÁM THEO một vạch dọc — vạch dò và dấu "giá trị hiện tại" của `LineChart`.
 *
 * `tickAnchor()` ở trên không dùng được cho hai nhãn ấy: nó kẹp theo một nửa bề ngang DỰ PHÒNG cố
 * định, hợp với nhãn vạch (độ dài có ngân sách, do `build.ts` ép xuống 6/10 ký tự), còn nhãn vạch
 * dò ghép HAI chuỗi đã kèm đơn vị nên là chữ dài nhất trên cả hình và không có trần nào cả.
 *
 * Ba nước, theo thứ tự:
 *   1. bên `prefer` — nơi gọi tự chọn, và nó giữ nguyên luật cũ (trái của vạch khi vạch ở nửa phải
 *      VÙNG VẼ), nên nhãn nào vốn đã vừa thì không xê dịch một đơn vị nào;
 *   2. không vừa thì LẬT sang bên kia — nhãn vẫn dính vạch, chỉ đổi phía;
 *   3. cả hai bên đều không đủ chỗ thì dán vào mép trái và giữ ĐẦU chuỗi. Mất đuôi còn đọc được;
 *      mất đầu thì `'16.000 tỷ ₫ · 0 lần'` chỉ còn đúng một mẩu `'ần'` — chính là chỗ hỏng đã báo.
 */
export function floatingLabel(
  anchorX: number,
  prefer: 'start' | 'end',
  text: string,
  fontSize: number,
  viewWidth: number,
): { x: number; anchor: 'start' | 'end' } {
  const width = textWidth(text, fontSize);
  const uuTien = { x: anchorX + (prefer === 'end' ? -LABEL_GAP : LABEL_GAP), anchor: prefer };
  if (vuaKhung(uuTien.x, uuTien.anchor, width, viewWidth)) return uuTien;

  const benKia: 'start' | 'end' = prefer === 'end' ? 'start' : 'end';
  const lat = { x: anchorX + (benKia === 'end' ? -LABEL_GAP : LABEL_GAP), anchor: benKia };
  if (vuaKhung(lat.x, lat.anchor, width, viewWidth)) return lat;

  return { x: 0, anchor: 'start' };
}
