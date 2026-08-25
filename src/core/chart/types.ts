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

import type { Bilingual, CalcWarning, WarningCode } from '../types';

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
  /** Nhãn trục, ví dụ 'EPS (₫)' hoặc 'Vốn hoá (tỷ ₫)'. Cả hai ngôn ngữ. */
  title: Bilingual;
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
  columns: readonly [Bilingual, Bilingual];
  /**
   * `null` là dòng ngắt "…" — cùng nếp `SCHEDULE_GAP` của lịch trả nợ.
   * Cột đầu là nhãn — mang cả hai ngôn ngữ khi nó là chữ (chặng bóc tách); cột số/đơn vị vẫn
   * dùng chung một chuỗi cho cả hai vế vì chưa dịch đơn vị (xem ghi chú ở `build.ts`).
   */
  rows: ReadonlyArray<readonly [Bilingual, string] | null>;
}

/** Một biến có thể đưa lên trục X. */
export interface SweepOption {
  key: string;
  label: Bilingual;
}

/** Đường quét độ nhạy — FR-08. */
export interface LineChart {
  kind: 'line';
  /** Tiêu đề dạng "P/E theo EPS" — vào `<figcaption>`. */
  title: Bilingual;
  /** Một câu mô tả nội dung, cho `<figcaption>`, bản in và PNG. */
  summary: Bilingual;
  x: ChartAxis;
  y: ChartAxis;
  points: ReadonlyArray<ChartPoint>;
  table: ChartTable;
  /** Biến đang nằm trên trục X. */
  sweepKey: string;
  /** Mọi biến đưa lên trục X được — nguồn cho dropdown đổi trục. */
  options: ReadonlyArray<SweepOption>;
  /** Ghi chú khi có điểm không tính được hoặc miền bị cắt. */
  note?: Bilingual;
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
  title: Bilingual;
  warning: CalcWarning;
  /**
   * Các trục KHÁC vẫn chọn được, để giao diện giữ lại ô chọn trục thay vì bỏ trống cả khối.
   *
   * Vì sao trạng thái "không vẽ được" vẫn phải mang danh sách này: ô chọn trục nằm TRONG khung
   * biểu đồ, nên bỏ hình đi là bỏ luôn chỗ bấm duy nhất để đổi sang một trục vẫn vẽ được — người
   * dùng kẹt lại, phải rời màn rồi vào lại. Ca thật: chuỗi 61 phiên với SMA 75 phiên thì trục thời
   * gian không còn điểm nào, nhưng trục "Số phiên" vẫn vẽ tốt phần N ≤ 61.
   *
   * Bỏ trống khi chỗ dựng chưa kịp biết có những trục nào (các lối thoát sớm của `buildChartModel`).
   */
  options?: ReadonlyArray<SweepOption>;
  /** Mục đang chọn trong ô ấy — để ô chọn hiện đúng trục người dùng đang đứng. */
  sweepKey?: string;
}

/** Một cột của biểu đồ bóc tách. */
export interface BreakdownBar {
  /** Nhãn dưới cột, đã rút gọn sẵn ở Domain. */
  label: Bilingual;
  /** Phần đóng góp, đã mang dấu: âm nghĩa là cột đi xuống. */
  delta: number;
  /** Mức tổng đang chạy SAU cột này — đáy và đỉnh cột suy ra từ đây. */
  cumulative: number;
  /** Giá trị đã định dạng kèm đơn vị, cho bảng số và nhãn trên cột. */
  valueLabel: string;
  /** Cột tổng đứng cuối, vẽ từ 0 lên chứ không nối tiếp cột trước. */
  isTotal?: boolean;
}

/**
 * Biểu đồ bóc tách — thác nước của WF-17 (FR-07).
 *
 * Dùng cho công thức mà câu hỏi đáng hỏi KHÔNG phải "đổi một biến thì kết quả đổi ra sao" mà là
 * "con số này ghép từ những phần nào". EV chẳng hạn: đường quét của nó là một đường thẳng hệ số
 * góc đúng bằng 1 — người đọc biết trước khi mở trang, đúng thứ luật `chartType: 'none'` sinh ra
 * để loại. Hình bậc thang thì nói được điều đường thẳng kia không nói.
 */
export interface WaterfallChart {
  kind: 'waterfall';
  title: Bilingual;
  summary: Bilingual;
  /** Trục giá trị. Bất biến riêng của loại này: miền LUÔN chứa số 0 — chân cột phải có chỗ đứng. */
  y: ChartAxis;
  bars: ReadonlyArray<BreakdownBar>;
  table: ChartTable;
  /** Cùng danh sách với `LineChart.options` — bóc tách là MỘT MỤC trong ô chọn trục, không phải màn khác. */
  options: ReadonlyArray<SweepOption>;
  /** Mục đang chọn trong ô ấy. */
  sweepKey: string;
  note?: Bilingual;
}

/**
 * Mô hình VẼ ĐƯỢC — mọi nhánh trừ `unavailable`.
 *
 * `ChartFrame` và màn phóng to nhận kiểu này: chúng chỉ đụng `title`, `summary`, `table`, `note`
 * — bốn thứ mọi loại biểu đồ đều có. Nhờ vậy thêm loại thứ tư sau này không phải sửa hai file ấy,
 * chỉ phải thêm một nhánh ở `ChartBody`.
 */
export type DrawableChart = LineChart | WaterfallChart;

export type ChartModel = DrawableChart | UnavailableChart;

export type ChartKind = ChartModel['kind'];
