/**
 * Tầng DOMAIN — rút gọn chuỗi điểm thành bảng số đọc được.
 *
 * 42 dòng số là quá nhiều để bày ra dưới một biểu đồ ở khổ 360px, nhưng cắt bừa thì mất đúng
 * những dòng đáng xem. Nên phép rút gọn ở đây GIỮ BẮT BUỘC bốn thứ, rồi mới lấp đều phần còn lại:
 * điểm đầu, điểm cuối, điểm "giá trị hiện tại", và **hai đầu của mỗi quãng không tính được**.
 *
 * Giữ quãng đứt là có chủ đích: đó chính là chỗ FR-06 có gì để nói. Một bảng rút gọn mà bỏ qua
 * chúng sẽ trông như đường liền mạch.
 *
 * Vì sao HAI ĐẦU quãng chứ không phải mọi điểm `null` — luật cũ của đợt trước: một quãng đứt là MỘT
 * sự việc ("từ đây tới đây không tính được"), không phải N sự việc. Đường quét 42 mức thì hai cách
 * gần như bằng nhau, nhưng đường theo thời gian phơi ngay chỗ hỏng: RSI-14 chưa đủ phiên nên 14
 * phiên đầu đúng ra là `null`, và luật cũ đẩy 14 dòng "— , —" giống hệt nhau lên đầu bảng rồi dồn
 * toàn bộ 234 phiên có số thật vào đúng một dòng cuối. Giữ hai đầu thì vẫn đọc được "trống từ phiên
 * nào tới phiên nào", mà phần có số vẫn còn chỗ.
 */

import type { ChartPoint } from './types';

/** Số dòng mong muốn. Không phải trần cứng — quãng không tính được luôn được giữ thêm. */
export const CHART_TABLE_ROWS = 9;

/** Chỉ số hai đầu của mỗi quãng `null` liên tiếp. */
function gapEdges(points: ReadonlyArray<ChartPoint>): ReadonlyArray<number> {
  const edges: number[] = [];
  let start = -1;

  for (let i = 0; i <= points.length; i += 1) {
    const isGap = i < points.length && points[i]?.y === null;

    if (isGap && start < 0) start = i;
    else if (!isGap && start >= 0) {
      edges.push(start, i - 1);
      start = -1;
    }
  }

  return edges;
}

/**
 * Chuỗi điểm rút gọn, `null` là dòng ngắt "…" — cùng nếp `SCHEDULE_GAP` của lịch trả nợ 240 kỳ.
 */
export function condensePoints(
  points: ReadonlyArray<ChartPoint>,
  max = CHART_TABLE_ROWS,
): ReadonlyArray<ChartPoint | null> {
  const total = points.length;
  if (total === 0) return [];
  if (total <= max) return [...points];

  const keep = new Set<number>([0, total - 1, ...gapEdges(points)]);
  for (const [index, point] of points.entries()) {
    if (point.marked === true) keep.add(index);
  }

  // Lấp đều cho đủ số dòng mong muốn. Nếu điểm bắt buộc đã vượt `max` thì không lấp thêm — thà
  // bảng dài hơn dự tính còn hơn giấu một mức không tính được.
  for (let k = 1; k < max - 1 && keep.size < max; k += 1) {
    keep.add(Math.round((k * (total - 1)) / (max - 1)));
  }

  const indexes = [...keep].sort((a, b) => a - b);
  const rows: Array<ChartPoint | null> = [];
  let previous = -1;

  for (const index of indexes) {
    if (previous >= 0 && index > previous + 1) rows.push(null);
    const point = points[index];
    if (point !== undefined) rows.push(point);
    previous = index;
  }

  return rows;
}
