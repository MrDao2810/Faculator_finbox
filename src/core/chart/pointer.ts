/**
 * Tầng DOMAIN — quy đổi toạ độ con trỏ sang đơn vị `viewBox`, cho tương tác "dò điểm" trên
 * đường quét (rê chuột/chạm-kéo).
 *
 * Đặt ở Domain vì đây là TOÁN thuần, test được bằng Node — renderer chỉ gọi, không tự tính.
 * `pointerToViewBox()` không đụng DOM: nơi gọi (`LineChart`) tự đọc `getBoundingClientRect()`
 * trong pointer handler rồi truyền số vào đây, giữ file này thuần và dễ kiểm.
 */

/** Hình chữ nhật của khung SVG trên màn hình, tính bằng px thật — đủ trường của `DOMRect`. */
export interface ViewBoxRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Quy đổi toạ độ con trỏ (px thật, `event.clientX/clientY`) sang đơn vị `viewBox`.
 *
 * Phải tính đúng phần letterbox mà `preserveAspectRatio="xMidYMid meet"` sinh ra khi tỉ lệ khung
 * ngoài (`rect.width/rect.height`) khác tỉ lệ `viewBox` (`viewW/viewH`) — xảy ra ở CẢ bản trên
 * trang (khung có thể hẹp/rộng hơn tỉ lệ gốc tuỳ breakpoint) lẫn bản `fill` trong màn phóng to
 * (khung luôn khác tỉ lệ, vì nó chiếm trọn chỗ chữ nhật của màn hình). Không tính phần này thì
 * vạch dò lệch khỏi đúng vị trí con trỏ mỗi khi có dải trắng hai bên hoặc trên dưới.
 *
 * @returns `null` khi khung không có kích thước thật (chưa dựng xong, hoặc bị `display:none`) —
 * nơi gọi bỏ qua sự kiện đó, không cố suy ra một toạ độ vô nghĩa.
 */
export function pointerToViewBox(
  rect: ViewBoxRect,
  clientX: number,
  clientY: number,
  viewW: number,
  viewH: number,
): { x: number; y: number } | null {
  if (rect.width <= 0 || rect.height <= 0 || viewW <= 0 || viewH <= 0) return null;

  const boxAspect = rect.width / rect.height;
  const viewAspect = viewW / viewH;

  let scale: number;
  let offsetX = 0;
  let offsetY = 0;

  if (boxAspect > viewAspect) {
    // Khung rộng hơn tỉ lệ viewBox — dải trắng nằm hai bên trái/phải.
    scale = rect.height / viewH;
    offsetX = (rect.width - viewW * scale) / 2;
  } else {
    // Khung cao hơn tỉ lệ viewBox — dải trắng nằm trên/dưới.
    scale = rect.width / viewW;
    offsetY = (rect.height - viewH * scale) / 2;
  }

  if (!Number.isFinite(scale) || scale <= 0) return null;

  return {
    x: (clientX - rect.left - offsetX) / scale,
    y: (clientY - rect.top - offsetY) / scale,
  };
}

/**
 * Điểm dữ liệu gần nhất theo trục X — chỉ SNAP vào điểm có sẵn, không nội suy giá trị mới.
 *
 * Dò điểm không được tự bịa ra một con số giữa hai điểm dữ liệu — đúng tinh thần FR-06: mọi con
 * số hiện ra phải là con số Domain đã tính, không phải suy diễn của tầng vẽ.
 *
 * @returns `undefined` khi `points` rỗng — nơi gọi coi như không có gì để dò.
 */
export function nearestPointByX<T extends { x: number }>(
  points: ReadonlyArray<T>,
  targetX: number,
  sx: (value: number) => number,
): T | undefined {
  let best: T | undefined;
  let bestDist = Number.POSITIVE_INFINITY;

  for (const point of points) {
    const dist = Math.abs(sx(point.x) - targetX);
    if (dist < bestDist) {
      bestDist = dist;
      best = point;
    }
  }

  return best;
}
