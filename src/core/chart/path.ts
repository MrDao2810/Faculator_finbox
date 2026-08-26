/**
 * Tầng DOMAIN — dựng chuỗi `d` của `<path>`.
 *
 * Ở Domain chứ không ở component vì đây là chỗ FR-06 được giữ bằng kiểu dữ liệu: `ChartPoint.y`
 * là `number | null`, nên hàm nào đi qua nó cũng BUỘC phải quyết định làm gì với `null`.
 * Quyết định là: **ngắt đường**. Không nối vắt qua, không thay bằng 0.
 *
 * Test bám vào chuỗi `d` viết thẳng trong ca kiểm — được, vì `fixed()` ghim số chữ số nên chuỗi
 * ổn định giữa các nền tảng và đọc được bằng mắt.
 */

import type { ChartPoint } from './types';

/**
 * Số cho thuộc tính SVG: ghim 2 chữ số rồi cắt đuôi 0.
 *
 * Hai lợi ích, cả hai đều thật: chuỗi `d` ngắn hơn khoảng 30% (đi vào HTML tĩnh của 43 trang),
 * và test không giòn theo cách từng nền tảng in số dấu phẩy động.
 */
export function fixed(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '0';
  return String(Number(value.toFixed(digits)));
}

/** Điểm vẽ được: có y hữu hạn. */
function drawable(point: ChartPoint): point is ChartPoint & { y: number } {
  return point.y !== null && Number.isFinite(point.y) && Number.isFinite(point.x);
}

/**
 * Chuỗi `d` của đường nối các điểm, ngắt ở mỗi điểm không tính được.
 *
 * Một `<path>` duy nhất mang nhiều đoạn con (`M … L … M … L …`) chứ không phải nhiều thẻ: ít node
 * DOM hơn, và React không phải đối chiếu một danh sách dài đổi độ dài mỗi lần kéo thanh trượt.
 *
 * @returns chuỗi rỗng khi không có điểm nào vẽ được — nơi gọi bỏ hẳn thẻ `<path>`.
 */
export function linePath(
  points: ReadonlyArray<ChartPoint>,
  sx: (value: number) => number,
  sy: (value: number) => number,
): string {
  const parts: string[] = [];
  let open = false;

  for (const point of points) {
    if (!drawable(point)) {
      open = false;
      continue;
    }

    const x = sx(point.x);
    const y = sy(point.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      open = false;
      continue;
    }

    parts.push(`${open ? 'L' : 'M'}${fixed(x)},${fixed(y)}`);
    open = true;
  }

  return parts.join(' ');
}

/**
 * Chuỗi `d` của VÙNG dưới đường, để tô dải chuyển màu (bản thiết kế đợt 12).
 *
 * Cùng luật ngắt quãng với `linePath`, nhưng mỗi dải liền mạch phải là một đoạn con ĐÓNG KÍN
 * riêng: `M x,đáy L … L x,đáy Z`. Đây là chỗ dễ sai nhất — đem thẳng chuỗi của `linePath` ra tô
 * `fill` thì SVG tự nối điểm cuối về điểm đầu và vẽ ra một hình không có nghĩa gì, mà nhìn thoáng
 * qua vẫn "có vẻ được" ở những biểu đồ đơn điệu.
 *
 * `baselineY` là toạ độ SVG của đáy khung vẽ, không phải giá trị 0 của trục — trục Y của phần lớn
 * biểu đồ ở đây không chạm 0, nên tô xuống tới 0 sẽ tràn ra ngoài khung.
 *
 * @returns chuỗi rỗng khi không có điểm nào vẽ được — nơi gọi bỏ hẳn thẻ `<path>`.
 */
export function areaPath(
  points: ReadonlyArray<ChartPoint>,
  sx: (value: number) => number,
  sy: (value: number) => number,
  baselineY: number,
): string {
  if (!Number.isFinite(baselineY)) return '';

  const parts: string[] = [];
  /* Đoạn đang mở: nhớ x đầu để còn hạ chân về đáy đúng chỗ khi đóng lại. */
  let firstX: number | null = null;
  let lastX = 0;

  function close() {
    if (firstX === null) return;
    parts.push(
      `L${fixed(lastX)},${fixed(baselineY)}`,
      `L${fixed(firstX)},${fixed(baselineY)}`,
      'Z',
    );
    firstX = null;
  }

  for (const point of points) {
    if (!drawable(point)) {
      close();
      continue;
    }

    const x = sx(point.x);
    const y = sy(point.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      close();
      continue;
    }

    if (firstX === null) {
      parts.push(`M${fixed(x)},${fixed(y)}`);
      firstX = x;
    } else {
      parts.push(`L${fixed(x)},${fixed(y)}`);
    }
    lastX = x;
  }

  close();

  return parts.join(' ');
}

/**
 * Các khoảng trên trục X không tính được, để tô vùng gạch chéo.
 *
 * Gộp các điểm `null` liền nhau thành một khoảng, và nới sang hai điểm vẽ được kề bên — vùng tô
 * nhờ vậy trùng đúng chỗ đường bị hở, chứ không lệch nửa bước sang một phía.
 */
export function gapsOf(
  points: ReadonlyArray<ChartPoint>,
  sx: (value: number) => number,
): ReadonlyArray<{ fromX: number; toX: number }> {
  const gaps: Array<{ fromX: number; toX: number }> = [];
  let start: number | null = null;

  for (const [index, point] of points.entries()) {
    if (!drawable(point)) {
      // Mép trái: điểm vẽ được ngay trước đó, nếu có.
      if (start === null) start = points[index - 1]?.x ?? point.x;
      continue;
    }
    if (start !== null) {
      gaps.push({ fromX: sx(start), toX: sx(point.x) });
      start = null;
    }
  }

  // Chuỗi kết thúc bằng một dải không tính được — đóng khoảng ở điểm cuối.
  if (start !== null) {
    const last = points[points.length - 1];
    if (last !== undefined) gaps.push({ fromX: sx(start), toX: sx(last.x) });
  }

  return gaps.filter((gap) => Number.isFinite(gap.fromX) && Number.isFinite(gap.toX));
}
