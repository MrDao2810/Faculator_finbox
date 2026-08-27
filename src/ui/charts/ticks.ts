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
