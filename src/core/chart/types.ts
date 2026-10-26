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
  /**
   * `label` viết ở BẬC HIỂN THỊ CỦA TRỤC X — `'1,79 tỷ ₫'` thay cho `'1.789.700.000 ₫'`.
   *
   * Chỉ dành cho chữ VẼ TRÊN HÌNH (vạch dò, dấu "giá trị hiện tại"), nơi bề ngang tính bằng đơn vị
   * viewBox và một nhãn 15 ký tự tràn ra ngoài khung. Bảng số ẩn và câu mô tả (cho trình đọc màn hình) vẫn đọc
   * `label`/`valueLabel` đầy đủ.
   *
   * **Có hay không là chuyện của cả TRỤC, không của từng điểm**: trục chia bậc thì mọi điểm đều có,
   * trục không chia thì không điểm nào có. Luật cũ hỏi "bản rút gọn có ngắn hơn không" theo từng
   * điểm, và cho ra hai đơn vị trên cùng một hình — xem `labelAtAxisScale()` bên `build.ts`.
   *
   * **Vắng mặt** thì renderer rơi về `label`/`valueLabel`. Vắng hẳn chứ không mang lại chính chuỗi
   * cũ: bất biến "công thức một chuỗi dựng ra đúng mô hình như trước" kiểm bằng `toEqual`, mà một
   * trường thừa mang giá trị trùng cũng đủ làm nó đỏ. Cùng nếp `overlays` / `referenceLines` / `note`.
   */
  shortLabel?: string;
  /** `valueLabel` ở bậc hiển thị của trục Y. Cùng luật với `shortLabel` ngay trên. */
  shortValueLabel?: string;
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

/**
 * Bốn giá của MỘT phiên, cho dạng Nến của đường theo thời gian (21/10/2026).
 *
 * Đủ cả bốn giá hoặc không có cây nến nào: `sessionCandles()` chỉ dựng khi MỌI phiên có giá mở,
 * cao, thấp, đóng dương và khớp nhau. Không có "nến thiếu giá mở thì so với phiên trước" như màn
 * bảng chuỗi giá: ở đó cái hình LÀ bảng đang gõ, còn ở đây nến chỉ là bối cảnh cho đường kết quả,
 * và một cây nến dựng từ giá đoán là bối cảnh sai.
 */
export interface ChartCandle {
  open: number;
  high: number;
  low: number;
  close: number;
  /** Phiên tăng (đóng ≥ mở) hay giảm — chọn màu. */
  up: boolean;
}

/** Đường quét độ nhạy — FR-08. */
export interface LineChart {
  kind: 'line';
  /** Tiêu đề dạng "P/E theo EPS" — vào `<figcaption>`. */
  title: Bilingual;
  /**
   * Câu mô tả nội dung hình bằng chữ, cho TRÌNH ĐỌC MÀN HÌNH: `<svg>` mang `aria-hidden` nên đây
   * (cùng bảng số) là toàn bộ biểu đồ với người không nhìn được hình. Từ 14/10/2026 nó không còn
   * hiện trên màn — `ChartFrame` đặt nó trong `<figcaption>` dưới lớp `visually-hidden`.
   */
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
   *
   * Từ 21/10/2026 có thêm một chỗ dùng: hình dựng cho dạng NẾN (`ChartArgs.candleRange`) luôn có
   * legend — đường kết quả cạnh hai mẫu nến tăng và giảm — nên nó mang tên gọn của công thức cả khi
   * không có chuỗi phụ nào.
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
   * `false` thì chuỗi chính KHÔNG có dải tô dưới đường (26/10/2026) — hình các đường thành phần, nơi
   * không đường nào là "kết quả" để được tô nổi hơn đường kia. Vắng mặt nghĩa là có dải, như trước.
   */
  primaryArea?: false;
  /**
   * Ô dò in số của MỌI chuỗi ở mức đang dò, mỗi chuỗi một dòng (26/10/2026) — cho hình các đường
   * thành phần, nơi thứ cần đọc là khoảng cách giữa các đường. Vắng mặt thì ô dò in riêng chuỗi
   * chính, như trước.
   */
  hoverAllSeries?: true;
  /**
   * Trục Y thứ hai, bên phải — dùng khi chuỗi phụ có thang giá trị lệch hẳn chuỗi chính (SMA tính
   * bằng nghìn đồng đứng cạnh RSI 0–100).
   *
   * Vắng mặt khi không chuỗi nào khai `axis: 'right'`, và đó cũng là điều kiện để hình học giữ
   * nguyên: lề phải chỉ nới ra cho nhãn trục khi trường này có mặt.
   */
  yRight?: ChartAxis;
  /**
   * Nến của từng phiên, cùng lưới x với `points` (phần tử thứ i là phiên x = i) — có thì ô "Loại
   * biểu đồ" mời dạng Nến (21/10/2026).
   *
   * Chỉ có trên trục THỜI GIAN của công thức khai `spec.priceLevel`, và chỉ khi mọi phiên đủ bốn
   * giá — xem `sessionCandles()`. Vắng mặt hẳn ở mọi hình khác, cùng nếp `overlays`.
   *
   * Có mặt cả khi màn đang vẽ Đường: ô chọn phải biết dạng Nến có hay không trước khi người dùng
   * chọn. Trục giá trị chỉ nới ra ôm giá cao nhất và thấp nhất khi màn THẬT SỰ vẽ nến
   * (`ChartArgs.candleRange`), nên dạng Đường giữ đúng trục cũ.
   */
  candles?: ReadonlyArray<ChartCandle>;
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
 *
 * **Hai trạng thái, hai cách hiện** (23/10/2026, hai lượt cùng ngày của chủ dự án):
 *
 * - Hình MẶC ĐỊNH (người dùng chưa chọn mục nào) không vẽ được — mã Finbox 10 phiên trên
 *   `phan-tram-b-bollinger`: không có `options`, giao diện chỉ in câu cảnh báo. _"khi nào biểu đồ
 *   có đủ thông số để hiển thị thì phần select mới hiển thị"_.
 * - Mục người dùng ĐÃ TỰ CHỌN hết vẽ được vì số liệu đổi, mà còn mục khác vẽ được (đang xem Thang
 *   đo rồi kéo Chu kỳ quá số phiên đang có): có `options` (những mục vẽ được, cộng mục đang chọn) và
 *   `sweepKey` (mục đang chọn), và câu cảnh báo nêu tên mục ấy. Ô chọn giữ nguyên lựa chọn, không tự
 *   nhảy sang mục khác: _"select là để phân biệt dạng biểu đồ"_. Còn ô chọn là để họ tự đổi sang mục
 *   vẽ được; bỏ nó đi là bắt họ rời màn rồi vào lại, đúng ngõ cụt đã vá ở đợt "bấm biểu đồ xong mất
 *   luôn biểu đồ".
 */
export interface UnavailableChart {
  kind: 'unavailable';
  title: Bilingual;
  warning: CalcWarning;
  /** Những mục vẽ được, cộng mục đang chọn. Vắng mặt khi không mục nào vẽ được. */
  options?: ReadonlyArray<SweepOption>;
  /** Mục đang chọn — đúng mục chưa vẽ được. Có mặt cùng lúc với `options`. */
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
  /** Giá trị đã định dạng kèm đơn vị, cho BẢNG SỐ — luôn đầy đủ, không rút gọn. */
  valueLabel: string;
  /**
   * Nhãn VẼ TRÊN CỘT, ở bậc hiển thị của trục giá trị — cùng luật với `ChartPoint.shortValueLabel`,
   * kể cả việc vắng mặt hẳn khi trục không chia bậc.
   *
   * Riêng ở thác nước còn một lý do thứ hai bên cạnh chuyện tràn khung: nhãn nằm ĐÈ LÊN cột, ngay
   * phía trên chính cái trục đã ghi bậc của mình, nên hai chỗ nói hai thang là bắt người đọc tự quy
   * đổi giữa chúng trên cùng một hình.
   */
  shortValueLabel?: string;
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
  /** Như `LineChart.summary`: chỉ cho trình đọc màn hình, không hiện trên màn. */
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

/** Một khoảng lợi suất của histogram, `[from, to)` theo %, khoảng cuối đóng cả hai đầu. */
export interface HistogramBin {
  from: number;
  to: number;
  /** Số phiên có lợi suất rơi vào khoảng này. */
  count: number;
  /** Khoảng viết sẵn, ví dụ 'từ −3 % tới −2 %', cả hai ngôn ngữ. */
  label: Bilingual;
  /** Số phiên viết sẵn kèm đơn vị, ví dụ '12 phiên'. */
  countLabel: string;
}

/** Một vạch dọc đánh dấu trên trục lợi suất của histogram: bình quân, ngưỡng VaR… */
export interface HistogramMarker {
  value: number;
  label: Bilingual;
  /** Giá trị viết sẵn kèm đơn vị, ví dụ '−1,86 %'. */
  valueLabel: string;
}

/**
 * Histogram lợi suất phiên — mục "Phân phối lợi suất" của ô "Xem theo" (21/10/2026, loại thứ tư).
 *
 * Trục X là lợi suất một phiên theo %, chia thành các khoảng đều; trục Y là số phiên. Chỉ có một
 * dạng vẽ (cột), nên ô "Loại biểu đồ" không hiện với nó. Cửa sổ phiên là đúng cửa sổ `calc` của
 * công thức dùng — xem `SeriesViewSpec` ở `registry/types.ts`.
 */
export interface HistogramChart {
  kind: 'histogram';
  title: Bilingual;
  /** Như `LineChart.summary`: chỉ cho trình đọc màn hình. */
  summary: Bilingual;
  x: ChartAxis;
  y: ChartAxis;
  bins: ReadonlyArray<HistogramBin>;
  markers: ReadonlyArray<HistogramMarker>;
  table: ChartTable;
  options: ReadonlyArray<SweepOption>;
  sweepKey: string;
  note?: Bilingual;
}

/** Một phiên của hình phân tán: lợi suất của thị trường (x) và của cổ phiếu (y), theo %. */
export interface ScatterPoint {
  x: number;
  y: number;
  /** Nhãn phiên: ngày thật khi chuỗi có ngày, không thì 'Phiên 12'. */
  label: string;
  /** Hai lợi suất viết sẵn kèm dấu và đơn vị, ví dụ '+1,25 %'. */
  xLabel: string;
  yLabel: string;
}

/**
 * Đường hồi quy kẻ qua đám chấm: `y = intercept + slope × x`, cùng thang % với hai trục.
 *
 * `slope` CHÍNH LÀ kết quả của công thức (Beta), không tính lại ở đây: đường trên hình và con số ở
 * khối Kết quả là một số.
 */
export interface ScatterFit {
  slope: number;
  intercept: number;
  /** Tên đường trong chú giải, ví dụ 'Đường hồi quy, độ dốc β = 0,81'. */
  label: Bilingual;
}

/**
 * Hình phân tán lợi suất — mục "Phân tán lợi suất" của ô "Xem theo" (26/10/2026, loại thứ bảy).
 *
 * Mỗi phiên của cửa sổ `calc` dùng là một chấm: lợi suất VN-Index theo trục ngang, lợi suất cổ
 * phiếu theo trục đứng. Đường hồi quy dốc đúng bằng Beta. Hai trục luôn chứa 0 để hai vạch 0 chia
 * bốn góc (cùng tăng, cùng giảm, ngược chiều). Một dạng vẽ (Điểm), nên không có ô "Loại biểu đồ".
 */
export interface ScatterChart {
  kind: 'scatter';
  title: Bilingual;
  /** Như `LineChart.summary`: chỉ cho trình đọc màn hình. */
  summary: Bilingual;
  x: ChartAxis;
  y: ChartAxis;
  points: ReadonlyArray<ScatterPoint>;
  /** Vắng khi kết quả không tính được (VN-Index đứng yên cả cửa sổ): không có độ dốc thì không kẻ. */
  fit?: ScatterFit;
  /** Tên chấm trong chú giải: 'Từng phiên'. */
  pointLabel: Bilingual;
  table: ChartTable;
  options: ReadonlyArray<SweepOption>;
  sweepKey: string;
  note?: Bilingual;
}

/** Một chuỗi của hình cột theo kỳ: phần gốc, phần lãi, giá mua… */
export interface ColumnSeries {
  key: string;
  label: Bilingual;
  tone: SeriesTone;
}

/** Một nhóm cột — một năm, một đợt mua, một kỳ. */
export interface ColumnGroup {
  /** Tên đầy đủ, cho bảng số và vạch dò: 'Năm 3', 'Đợt 2'. */
  label: Bilingual;
  /** Chữ ngắn dưới trục ngang: '3'. */
  tick: string;
  /** Một giá trị mỗi chuỗi, cùng thứ tự `ColumnChart.series`. */
  values: ReadonlyArray<number>;
  /** Giá trị đã viết sẵn kèm đơn vị, đầy đủ — cho bảng số. */
  valueLabels: ReadonlyArray<string>;
  /** Giá trị ở bậc của trục giá trị — cho vạch dò; vắng khi trục không chia bậc. */
  shortValueLabels?: ReadonlyArray<string>;
  /** Tổng nhóm khi các chuỗi CHỒNG lên nhau, đầy đủ và ở bậc của trục. Vắng khi một chuỗi. */
  totalLabel?: string;
  shortTotalLabel?: string;
  /** Số của các cột phụ (`ColumnChart.extraColumns`), đầy đủ kèm đơn vị — cho bảng số. */
  extraLabels?: ReadonlyArray<string>;
  /**
   * Cùng số ấy viết theo luật CHỮ của hình — từ 1.000 trở lên là 'nghìn', 'triệu'… (xem `pickScale()`)
   * — cho ô dò, để ô dò không đặt '50 nghìn ₫' cạnh '10.000.000 ₫'. Mỗi cột phụ chọn bậc riêng.
   */
  shortExtraLabels?: ReadonlyArray<string>;
}

/** Một vạch ngang trên hình cột: giá vốn trung bình, lợi suất bình quân… */
export interface ColumnLine {
  value: number;
  label: Bilingual;
  /** Đầy đủ kèm đơn vị, và ở bậc của trục (vắng khi trục không chia bậc). */
  valueLabel: string;
  shortValueLabel?: string;
  /** Nét đứt — vạch thứ hai trên cùng hình, để hai vạch không lẫn khi ảnh chuyển xám. */
  dash?: boolean;
}

/**
 * Hình CỘT THEO KỲ — mục thứ năm của ô "Xem theo" (23/10/2026, chủ dự án chọn bốn kiểu hình mới).
 *
 * Trục ngang là các kỳ RỜI RẠC đã đặt tên (năm 1, năm 2…; đợt 1, đợt 2…), trục đứng là một số tiền
 * hay một tỷ lệ. Nhiều chuỗi thì CHỒNG lên nhau (gốc + lãi trong năm): chiều cao cả cột là tổng, mỗi
 * khúc là một phần — nên mọi giá trị phải không âm. Một chuỗi thì giá trị âm được, cột đi xuống từ 0
 * (lợi suất từng kỳ). Trục giá trị luôn chứa 0, cùng bất biến với mọi hình cột khác.
 *
 * Khác thác nước ở chỗ các cột là CÙNG MỘT đại lượng qua các kỳ, không phải các phần của một tổng;
 * khác histogram ở chỗ trục ngang là kỳ đã đặt tên, không phải khoảng giá trị.
 */
export interface ColumnChart {
  kind: 'columns';
  title: Bilingual;
  /** Như `LineChart.summary`: chỉ cho trình đọc màn hình, không hiện trên màn. */
  summary: Bilingual;
  /** Tên trục ngang: 'Năm', 'Đợt mua'. */
  xTitle: Bilingual;
  /** Trục giá trị. Miền luôn chứa 0. */
  y: ChartAxis;
  series: ReadonlyArray<ColumnSeries>;
  groups: ReadonlyArray<ColumnGroup>;
  /** Các chuỗi chồng lên nhau (từ hai chuỗi trở lên). */
  stacked: boolean;
  /** Vạch ngang, chỉ những vạch nằm trong miền trục. Vắng mặt hẳn khi không có. */
  lines?: ReadonlyArray<ColumnLine>;
  /** Tên các cột phụ (không kèm đơn vị) — số của chúng ở `ColumnGroup.extraLabels`. Vắng khi không có. */
  extraColumns?: ReadonlyArray<Bilingual>;
  table: ChartTable;
  options: ReadonlyArray<SweepOption>;
  sweepKey: string;
  note?: Bilingual;
}

/** Một vùng của thang đo: từ `from` tới `to`, theo đơn vị của kết quả. */
export interface GaugeZone {
  from: number;
  to: number;
  label: Bilingual;
  tone: SeriesTone;
  /** Khoảng viết sẵn kèm đơn vị, không chữ để hai ngôn ngữ dùng chung: '< 30 điểm', '30 – 70 điểm'. */
  rangeLabel: string;
  /** Mốc cuối vùng, viết sẵn không đơn vị ('30') — nhãn tại ranh giới trên vòng cung. */
  toLabel: string;
}

/**
 * THANG ĐO — nửa vòng cung chia vùng, kim chỉ kết quả (23/10/2026). Mục "Thang đo" của ô "Xem theo"
 * cho các chỉ báo khai `spec.gauge` (RSI, Stochastic %K, %B), chỉ khi kết quả đã tính được.
 */
export interface GaugeChart {
  kind: 'gauge';
  title: Bilingual;
  /** Như `LineChart.summary`: chỉ cho trình đọc màn hình. */
  summary: Bilingual;
  min: number;
  max: number;
  /** Hai đầu thang viết sẵn ('0', '100'). */
  minLabel: string;
  maxLabel: string;
  /** Kết quả THẬT, chưa kẹp — kim kẹp vào thang, chữ thì không. */
  value: number;
  valueLabel: string;
  zones: ReadonlyArray<GaugeZone>;
  /** Vùng chứa kết quả (đã kẹp vào thang). */
  activeZone: number;
  table: ChartTable;
  options: ReadonlyArray<SweepOption>;
  sweepKey: string;
  note?: Bilingual;
}

/**
 * Mô hình VẼ ĐƯỢC — mọi nhánh trừ `unavailable`.
 *
 * `ChartFrame` và màn phóng to nhận kiểu này: chúng chỉ đụng `title`, `summary`, `table`, `note`
 * — bốn thứ mọi loại biểu đồ đều có. Nhờ vậy loại thứ tư (`histogram`, 21/10/2026) và thứ năm
 * (`columns`, 23/10/2026) không phải sửa `ChartFrame`, chỉ thêm một nhánh ở `ChartBody` và màn phóng to.
 * Hình phân tán (`scatter`, 26/10/2026) cũng thế.
 */
export type DrawableChart =
  | LineChart
  | WaterfallChart
  | HistogramChart
  | ColumnChart
  | GaugeChart
  | ScatterChart;

export type ChartModel = DrawableChart | UnavailableChart;

export type ChartKind = ChartModel['kind'];
