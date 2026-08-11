/**
 * Tầng DOMAIN — hợp đồng dữ liệu của biểu đồ (FR-07, FR-08).
 *
 * Mục đích của file này: tầng giao diện KHÔNG được tính toán gì. Mọi thứ khó — chọn biến quét,
 * chia vạch trục, định dạng nhãn, đánh dấu điểm không tính được, dựng bảng số, viết câu mô tả —
 * đã xong ở `build.ts`. `ChartBody` chỉ còn một `switch`.
 *
 * Nhờ vậy có ba người tiêu thụ CÙNG một mô hình mà không ai phải tính lại: SVG trên màn, bản in
 * PDF, và tấm PNG vẽ bằng Canvas.
 */

import type { CalcWarning, WarningCode } from '../types';

/**
 * Một điểm trên biểu đồ.
 *
 * `y === null` nghĩa là KHÔNG tính được tại x này — FR-06 đi thẳng vào kiểu dữ liệu thay vì
 * trông chờ người vẽ nhớ kiểm tra. Đường PHẢI đứt ở đây; tuyệt đối không thay bằng 0, không nội
 * suy vắt qua. `linePath()` buộc phải xử lý vì TypeScript không cho lách.
 */
export interface ChartPoint {
  x: number;
  y: number | null;
  /** Nhãn x đã định dạng SẴN ở Domain, kèm đơn vị. Renderer không tự gọi `formatNumber`. */
  label: string;
  /** Nhãn y đã định dạng, hoặc `NO_VALUE` khi `y === null`. */
  valueLabel: string;
  /** Đúng MỘT điểm trong chuỗi mang cờ này: giá trị người dùng đang nhập (FR-08). */
  marked?: boolean;
  /** Vì sao không tính được — để bảng số và câu mô tả nêu đúng nguyên nhân. */
  reason?: WarningCode;
}

export interface ChartTick {
  /** Vị trí theo đơn vị dữ liệu — dùng để chiếu sang toạ độ. */
  value: number;
  /** Chữ hiện trên trục, đã chia theo `unitLabel` của trục. */
  label: string;
}

export interface ChartAxis {
  /** Nhãn trục, ví dụ 'EPS (₫)' hoặc 'Vốn hoá (tỷ ₫)'. */
  title: string;
  /**
   * Miền ĐÃ làm đẹp, theo đơn vị dữ liệu gốc (chưa chia).
   * Bất biến: cả hai số hữu hạn và `domain[0] < domain[1]` — `niceAxis()` bảo đảm.
   */
  domain: readonly [number, number];
  ticks: ReadonlyArray<ChartTick>;
}

/**
 * Bảng số liệu tương đương — luôn có, không phải phần thêm cho vui.
 *
 * Nó vừa là lối đọc duy nhất cho trình đọc màn hình (SVG bị `aria-hidden`), vừa là chỗ người
 * sáng mắt tra con số chính xác, vừa là hợp đồng để test bám vào thay vì bám vào chuỗi `d`.
 */
export interface ChartTable {
  columns: readonly [string, string];
  /** `null` là dòng ngắt "…" — cùng nếp `SCHEDULE_GAP` của lịch trả nợ. */
  rows: ReadonlyArray<readonly [string, string] | null>;
}

/** Một biến có thể đưa lên trục X. */
export interface SweepOption {
  key: string;
  label: string;
}

/** Đường quét độ nhạy — FR-08. */
export interface LineChart {
  kind: 'line';
  /** Tiêu đề dạng "P/E theo EPS" — vào `<figcaption>`. */
  title: string;
  /** Một câu tiếng Việt mô tả nội dung, cho `<figcaption>`, bản in và PNG. */
  summary: string;
  x: ChartAxis;
  y: ChartAxis;
  points: ReadonlyArray<ChartPoint>;
  table: ChartTable;
  /** Biến đang nằm trên trục X. */
  sweepKey: string;
  /** Mọi biến đưa lên trục X được — nguồn cho dropdown đổi trục. */
  options: ReadonlyArray<SweepOption>;
  /** Ghi chú khi có điểm không tính được hoặc miền bị cắt. */
  note?: string;
}

/**
 * Không vẽ được. KHÔNG phải lỗi lập trình — là trạng thái hợp lệ và thường gặp: 34 công thức
 * chờ chuỗi giá, hoặc người dùng để trống một ô.
 *
 * Mang thẳng `CalcWarning` để giao diện dùng lại `InlineWarning`, nhờ đó biểu đồ nói ĐÚNG câu mà
 * khối kết quả đang nói, kèm đúng câu chỉ đường (NFR-USA-04).
 */
export interface UnavailableChart {
  kind: 'unavailable';
  title: string;
  warning: CalcWarning;
}

export type ChartModel = LineChart | UnavailableChart;

export type ChartKind = ChartModel['kind'];
