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

import type { ReferenceLine } from '../registry/types';
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
  /**
   * Cột đầu là trục X, các cột sau là từng chuỗi dữ liệu.
   *
   * Kiểu là tuple MỞ (`[Bilingual, ...Bilingual[]]`) chứ không phải mảng trần: nó vừa cho phép
   * thêm cột khi biểu đồ có nhiều chuỗi, vừa giữ `columns[0]` và `columns[1]` có kiểu chắc chắn —
   * nhờ đó mọi nơi đang đọc hai cột đầu không phải thêm một phép kiểm `undefined` nào.
   */
  columns: readonly [Bilingual, ...Bilingual[]];
  /**
   * `null` là dòng ngắt "…" — cùng nếp `SCHEDULE_GAP` của lịch trả nợ.
   * Cột đầu là nhãn — mang cả hai ngôn ngữ khi nó là chữ (chặng bóc tách); cột số/đơn vị vẫn
   * dùng chung một chuỗi cho cả hai vế vì chưa dịch đơn vị (xem ghi chú ở `build.ts`).
   *
   * Số ô của mỗi dòng khớp `columns.length`; biểu đồ một chuỗi vẫn ra đúng hai ô như trước.
   */
  rows: ReadonlyArray<readonly [Bilingual, ...string[]] | null>;
}

/** Một biến có thể đưa lên trục X. */
export interface SweepOption {
  key: string;
  label: Bilingual;
}

/**
 * Tông của một chuỗi dữ liệu — TÊN tông, không phải mã màu.
 *
 * Vì sao không cho khai màu tự do, dù "màu" là thứ tự nhiên nhất để nghĩ tới: `tokens.test.ts`
 * quét `*.module.css` để chặn màu cứng, và docblock đầu `chart.module.css` đã ghi rõ hậu quả —
 * màu đặt trong THUỘC TÍNH SVG thì lọt lưới kiểm. Một `color: '#0a0'` truyền từ nơi gọi vừa không
 * có cửa nào gác, vừa mù trong bảng màu tối, vì nó không biết gì về hai bảng.
 *
 * Bốn tông dưới đây đều dùng lại token đã có sẵn phép kiểm tương phản ở CẢ HAI bảng. Muốn tông thứ
 * năm thì mở token mới và thêm ca kiểm — một quyết định có người bấm, không phải một tham số.
 */
export type SeriesTone = 'primary' | 'teal' | 'violet' | 'muted';

/**
 * Một chuỗi dữ liệu trên biểu đồ đường.
 *
 * Sinh ra cho ba công thức mà một chuỗi không đủ nghĩa: SMA phải nhìn cùng đường giá, dải Bollinger
 * cần cả ba dải, MACD cần đường Signal. **SMA đã dùng thật** — nó khai `spec.priceOverlay` và nhận
 * đường giá đóng cửa dựng bởi `closePriceSeries()`; hai công thức kia còn chờ. Nghĩa là hợp đồng
 * dưới đây có người dùng đang chạy: đổi mặc định `axis`, đổi nghĩa `width` hay thêm trường bắt buộc
 * là đổi hình một trang thật, không phải sửa một khả năng chưa ai đụng.
 *
 * Chuỗi CHÍNH — giá trị đầu ra của công thức — không nằm trong danh sách này mà vẫn là
 * `LineChart.points`. Xem `LineChart.overlays` ngay dưới về lý do, và `seriesOf()` về cách hai thứ
 * được ghép lại thành một danh sách đồng nhất cho tầng vẽ.
 */
export interface ChartSeries {
  /**
   * Khoá ổn định trong một biểu đồ: `key` của React, hậu tố `id` của dải chuyển màu, và khoá cột
   * bảng số. Không được trùng nhau, và không được trùng `PRIMARY_SERIES_KEY`.
   */
  key: string;
  label: Bilingual;
  /**
   * Điểm của chuỗi này. Phải CÙNG LƯỚI X với chuỗi chính — cùng số điểm, cùng thứ tự.
   *
   * Đây là điều kiện của bảng số: nó rút gọn theo chuỗi chính rồi lấy giá trị các chuỗi khác theo
   * cùng CHỈ SỐ. `buildChartModel()` kiểm và LOẠI chuỗi lệch lưới thay vì vẽ ra một hình lệch nửa
   * bước mà nhìn thoáng qua vẫn "có vẻ được".
   */
  points: ReadonlyArray<ChartPoint>;
  /**
   * Đơn vị của chuỗi, ví dụ `'₫'` hay `'điểm'` — cùng quy ước với `FormulaSpec.resultUnit`.
   *
   * Dùng khi chuỗi này gánh trục Y phải: nó là thứ quyết định bậc đơn vị của nhãn vạch (tỷ ₫ /
   * triệu ₫) và số chữ số thập phân. Chuỗi đọc trục trái thì không cần — trục ấy đã có đơn vị của
   * công thức.
   */
  unit?: string;
  tone: SeriesTone;
  /** Nét đứt thay vì nét liền. Dấu hiệu thứ hai bên cạnh màu — NFR-USA-06. */
  dash?: boolean;
  /** Độ dày nét, đơn vị viewBox. Mặc định 2 như chuỗi chính. */
  width?: number;
  /** Tô dải chuyển màu dưới đường. */
  area?: boolean;
  /** Đọc theo trục Y nào. Mặc định `'left'` — trục của chuỗi chính. */
  axis?: 'left' | 'right';
}

/** Khoá của chuỗi chính trong danh sách `seriesOf()` trả về. */
export const PRIMARY_SERIES_KEY = '__primary';

/** Đường quét độ nhạy — FR-08. */
export interface LineChart {
  kind: 'line';
  /** Tiêu đề dạng "P/E theo EPS" — vào `<figcaption>`. */
  title: Bilingual;
  /** Một câu mô tả nội dung, cho `<figcaption>`, bản in và PNG. */
  summary: Bilingual;
  x: ChartAxis;
  y: ChartAxis;
  /**
   * Chuỗi CHÍNH — giá trị đầu ra của công thức. Đây vẫn là nguồn duy nhất cho bốn thứ:
   * dấu "giá trị hiện tại", bảng số, lối bấm-để-áp-dụng, và vùng gạch chéo miền không tính được.
   *
   * Giữ nguyên tên và nguyên chỗ khi mở đường cho nhiều chuỗi, thay vì đổi thành `series[0].points`:
   * trường này đang là hợp đồng mà hàng chục ca kiểm neo vào, và chính những ca ấy là bằng chứng
   * "không có gì đổi". Viết lại chúng để chứng minh không đổi là tự phá mất bằng chứng.
   */
  points: ReadonlyArray<ChartPoint>;
  /**
   * Nhãn chuỗi CHÍNH trong legend, khi có tên gọn hơn tên trục Y — 'SMA 20 phiên' thay vì
   * 'Trung bình động đơn giản (SMA) (₫)'. Legend chỉ hiện khi có từ hai chuỗi trở lên, nên trường
   * này chỉ có nghĩa khi `overlays` có mặt; cột bảng số của chuỗi chính vẫn lấy `y.title` vì bảng
   * gọi tên ĐẠI LƯỢNG kèm đơn vị, còn legend gọi tên ĐƯỜNG.
   *
   * **Vắng mặt hẳn** khi không dùng — `seriesOf()` rơi về `y.title`, đúng hành xử trước khi có
   * trường này. Cùng nếp `overlays` ngay dưới.
   */
  primaryLabel?: Bilingual;
  /**
   * Chuỗi PHỤ vẽ chồng lên — đường giá dưới SMA, hai dải ngoài của Bollinger, đường Signal của MACD.
   *
   * **Vắng mặt hẳn** khi không có chuỗi phụ nào, không phải mảng rỗng: bất biến "công thức một
   * chuỗi dựng ra đúng mô hình như trước" kiểm được bằng `toEqual`, mà một `overlays: []` thừa ra
   * đã đủ làm nó đỏ. Cùng nếp với `note` và `referenceLines`.
   *
   * Tầng vẽ KHÔNG đọc trường này thẳng — nó gọi `seriesOf()` để nhận một danh sách đồng nhất.
   */
  overlays?: ReadonlyArray<ChartSeries>;
  /**
   * Trục Y thứ hai, bên phải — dùng khi chuỗi phụ có thang giá trị lệch hẳn chuỗi chính (SMA tính
   * bằng nghìn đồng đứng cạnh RSI 0–100).
   *
   * Vắng mặt khi không chuỗi nào khai `axis: 'right'`, và đó cũng là điều kiện để hình học giữ
   * nguyên: lề phải chỉ nới ra cho nhãn trục khi trường này có mặt.
   */
  yRight?: ChartAxis;
  table: ChartTable;
  /** Biến đang nằm trên trục X. */
  sweepKey: string;
  /** Mọi biến đưa lên trục X được — nguồn cho dropdown đổi trục. */
  options: ReadonlyArray<SweepOption>;
  /**
   * Mốc ngang cố định trên trục Y — chỉ những mốc CÒN NẰM TRONG `y.domain`.
   *
   * Lọc xong ở Domain chứ không để renderer tự hỏi "mốc này có lọt khung không", đúng lời hứa ở
   * đầu file: tầng vẽ không tính gì. Renderer chỉ việc chiếu `value` qua thang Y rồi kẻ.
   *
   * Vắng mặt hẳn khi công thức không khai mốc nào, hoặc khai nhưng mốc nào cũng ngoài miền — nhờ
   * vậy 110 công thức còn lại dựng ra đúng cái mô hình như trước khi có trường này.
   *
   * KHÔNG có ở `WaterfallChart`: trục Y của hình bóc tách là mức tổng đang chạy qua từng chặng,
   * nên một ngưỡng kẻ ngang qua đó không nói lên điều gì về chặng nào cả.
   */
  referenceLines?: ReadonlyArray<ReferenceLine>;
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
