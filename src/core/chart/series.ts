/**
 * Tầng DOMAIN — ghép chuỗi chính với chuỗi phụ thành MỘT danh sách đồng nhất.
 *
 * ── Vì sao có file này ───────────────────────────────────────────────────────────────────────
 *
 * Mô hình `LineChart` giữ hai trường rời nhau: `points` (chuỗi chính, giá trị đầu ra của công
 * thức) và `overlays` (chuỗi phụ vẽ chồng). Cách chia ấy là có lý ở tầng MÔ HÌNH — chuỗi chính
 * mang bốn ràng buộc mà chuỗi phụ không có (dấu "giá trị hiện tại", bảng số, lối bấm-để-áp-dụng,
 * vùng gạch chéo), nên gộp chúng thành một mảng phẳng là mất chỗ ghi điều đó.
 *
 * Nhưng tầng VẼ thì ngược lại: nó chỉ muốn "cho tôi danh sách đường cần kẻ". Bắt nó tự nhớ ghép
 * `[points, ...overlays]` là rải cùng một mẩu logic ra mọi chỗ lặp — và chỗ nào quên là chỗ ấy
 * lặng lẽ bỏ mất chuỗi chính.
 *
 * `seriesOf()` là chỗ DUY NHẤT biết cách ghép. Tầng vẽ gọi nó rồi lặp, không bao giờ đọc hai
 * trường kia rời nhau.
 *
 * ── Bất biến ─────────────────────────────────────────────────────────────────────────────────
 *
 * Phần tử đầu LUÔN là chuỗi chính, và luôn mang `key === PRIMARY_SERIES_KEY`. Nhờ vậy tầng vẽ
 * phân biệt được "đường này có dấu giá trị hiện tại" mà không cần thêm cờ nào.
 */

import { PRIMARY_SERIES_KEY } from './types';
import type { ChartSeries, LineChart } from './types';

/**
 * Mọi chuỗi của một biểu đồ đường, chuỗi chính đứng đầu.
 *
 * Chuỗi chính lấy nhãn từ `y.title` — đó chính là tên đại lượng kèm đơn vị mà trục Y đang mang
 * ('P/E (lần)', 'RSI 14 phiên (Wilder) (điểm)'), nên legend và cột bảng nói đúng thứ hình đang vẽ
 * mà không phải bịa thêm một chuỗi chữ thứ hai có thể lệch với trục. Khi mô hình mang
 * `primaryLabel` — tên gọn hơn do `buildChartModel()` đặt, ví dụ 'SMA 20 phiên' — thì lấy nó;
 * trường ấy vắng mặt ở mọi biểu đồ một chuỗi nên hành xử cũ không đổi.
 *
 * `area: true` cho chuỗi chính vì đó đúng là hình hiện nay: dải chuyển màu dưới đường quét có từ
 * đợt 12. Đổi mặc định này là đổi hình của cả 100 biểu đồ.
 */
export function seriesOf(model: LineChart): ReadonlyArray<ChartSeries> {
  const primary: ChartSeries = {
    key: PRIMARY_SERIES_KEY,
    label: model.primaryLabel ?? model.y.title,
    points: model.points,
    tone: 'primary',
    area: true,
    axis: 'left',
  };

  return model.overlays === undefined ? [primary] : [primary, ...model.overlays];
}

/**
 * Chuỗi phụ khai đúng, đã loại những chuỗi KHÔNG dùng được.
 *
 * Ba luật loại, tất cả đều theo cùng một lẽ với FR-06: thà bỏ hẳn một đường còn hơn vẽ ra một
 * đường nói sai.
 *
 *   1. **Lệch lưới x với chuỗi chính.** Bảng số rút gọn theo chuỗi chính rồi lấy giá trị các chuỗi
 *      khác theo cùng CHỈ SỐ, nên chuỗi lệch số điểm sẽ ghép cột sai hàng — mà nhìn trên hình thì
 *      vẫn "có vẻ được". Kiểm bằng số điểm VÀ bằng chính giá trị x, không chỉ bằng độ dài.
 *   2. **Trùng khoá.** Khoá đi vào `id` của dải chuyển màu; hai chuỗi trùng khoá là bản sau trỏ
 *      nhầm vào dải của bản trước — đúng lỗi mà `<pattern>` đã mắc một lần và nay có ca kiểm gác.
 *   3. **Lấy khoá của chuỗi chính.** `seriesOf()` đặt chuỗi chính ở khoá ấy; một overlay trùng nó
 *      làm hai phần tử trong cùng danh sách không phân biệt được nữa.
 *
 * @returns mảng đã lọc; rỗng nghĩa là không overlay nào dùng được.
 */
export function usableOverlays(
  overlays: ReadonlyArray<ChartSeries>,
  primaryPoints: ReadonlyArray<{ x: number }>,
): ReadonlyArray<ChartSeries> {
  const seen = new Set<string>([PRIMARY_SERIES_KEY]);
  const ok: ChartSeries[] = [];

  for (const series of overlays) {
    if (seen.has(series.key)) continue;
    if (series.points.length !== primaryPoints.length) continue;
    if (series.points.some((point, index) => point.x !== primaryPoints[index]?.x)) continue;

    seen.add(series.key);
    ok.push(series);
  }

  return ok;
}
