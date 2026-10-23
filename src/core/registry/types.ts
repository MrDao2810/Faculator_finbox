/**
 * Tầng DOMAIN — schema của Formula Registry (gói WBS 1.3.1).
 *
 * LDR-01 và LDR-02: Registry là NGUỒN DỮ LIỆU DUY NHẤT cho metadata công thức.
 * Giao diện sinh ra từ đây; thêm công thức mới chỉ khai báo thêm một FormulaSpec
 * và viết hàm tính, không phải sửa mã lõi (NFR-MNT-01).
 */

import type { Cashflow } from '../cashflow-series';
import type { MarketConstantKey } from '../market/types';
import type { SeriesRow } from '../price-series';
import type { Bilingual, Level, VariableSpec, WarningCode } from '../types';

/** Hai mảng sản phẩm của SRS mục 1.2.2. */
export type Segment = 'stock' | 'personal';

/** Một trong 12 nhóm công thức (FR-01). */
export interface Category {
  id: string;
  segment: Segment;
  /** Tên hiện trên chip lọc và cây nhóm, cả hai ngôn ngữ. */
  name: Bilingual;
  /**
   * Tên rút gọn cho chỗ hẹp: lưới hai cột của WF-01 và nhãn nhóm trên thẻ công thức.
   * Ở 360px, "Phí & thuế thị trường VN" vỡ ra bốn dòng còn "Phí & thuế VN" thì vừa một dòng.
   * Chữ lấy đúng nguyên văn wireframe. Không dùng ở chip lọc và dropdown WF-02 — chỗ đó
   * rộng và cần tên đầy đủ để phân biệt nhóm.
   */
  shortName: Bilingual;
  description: Bilingual;
  /**
   * Số công thức dự kiến theo SRS mục 3.8.
   * Dùng để đối chiếu tiến độ, không phải để chặn — nhóm chưa làm xong vẫn hợp lệ.
   */
  expectedCount: number;
}

/**
 * Loại biểu đồ đi kèm công thức (FR-07).
 * WF-17 chốt 8 loại; 'none' dành cho công thức chỉ ra một con số.
 * Ba loại tự viết vì thư viện không có sẵn: underwater · heatmap · tornado.
 */
export type ChartType =
  | 'none'
  | 'sensitivity' // đường quét độ nhạy (FR-08)
  | 'stackedBar' // gốc vs lãi, bóc tách phí & thuế
  | 'waterfall' // FCFF → EV → giá mục tiêu
  | 'candlestick' // chuỗi giá OHLC
  | 'histogram' // phân phối lợi suất, ngưỡng VaR
  | 'underwater' // drawdown — tự viết
  | 'heatmap' // độ nhạy hai chiều — tự viết
  | 'tornado' // xếp hạng ảnh hưởng biến — tự viết
  | 'scatter'; // hồi quy Beta

/** Bốn mục diễn giải bắt buộc của FR-03. Không mục nào được để trống. */
export interface Explanation {
  /** Công thức này nói lên điều gì. */
  meaning: Bilingual;
  /** Khi nào dùng. */
  whenToUse: Bilingual;
  /** Cách đọc kết quả. */
  howToRead: Bilingual;
  /** Sai lầm thường gặp. */
  commonMistakes: Bilingual;
}

/** Nguồn tham khảo của công thức (FR-04, CON-11). */
export interface FormulaSource {
  /** Trích dẫn đầy đủ: giáo trình, chuẩn mực, hoặc văn bản pháp luật. */
  label: Bilingual;
  url?: string;
}

/**
 * Bộ dữ liệu thật đứng sau chuỗi giá của ví dụ — mang tên, mã, khoảng ngày để hiện
 * cạnh nút nạp và trên trục thời gian biểu đồ.
 */
export interface ExampleDataset {
  /** Tên ngắn, KHÔNG song ngữ, dùng trong câu mô tả biểu đồ — vd 'FPT', 'VN-Index'. */
  name: string;
  /** Nhãn song ngữ dùng trên nút và chip — vd { vi: 'số liệu FPT', en: 'FPT data' }. */
  label: Bilingual;
  /** Mã chứng khoán nếu có; VN-Index thì undefined. */
  ticker?: string;
  /**
   * Chuỗi nến đầy đủ OHLCV với ngày ISO (YYYY-MM-DD), phiên cũ trước.
   * Cột close phải trùng khớp example.series / example.bars.
   */
  rows: ReadonlyArray<SeriesRow>;
}

/** Ví dụ thực tế bằng số liệu Việt Nam, hiện trên màn chi tiết (FR-02). */
export interface FormulaExample {
  title: Bilingual;
  /** Khoá phải trùng key của biến trong `variables`. */
  inputs: Readonly<Record<string, number>>;
  /**
   * Chuỗi giá đóng cửa cho công thức đọc `ctx.series`. `formulas.test.ts` bơm nó vào ctx khi
   * đối chiếu `expected` với kết quả hàm tính — thiếu thì ví dụ của công thức chuỗi không bao
   * giờ kiểm được.
   */
  series?: ReadonlyArray<number>;
  /** Như `series` nhưng cho công thức đọc `ctx.bars` (cần OHLCV đầy đủ). */
  bars?: ReadonlyArray<SeriesRow>;
  /** Chuỗi giá VN-Index cho công thức đọc `ctx.marketSeries` — riêng cho Beta (FR-12). */
  marketSeries?: ReadonlyArray<number>;
  /** Dòng tiền cho công thức đọc `ctx.cashflows` — riêng cho XIRR. */
  cashflows?: ReadonlyArray<Cashflow>;
  /**
   * Bộ dữ liệu đứng sau `series` / `bars` — bắt buộc khai báo khi ví dụ có chuỗi giá.
   * Dùng để hiện tên nguồn trên nút, chip và trục thời gian biểu đồ.
   */
  dataset?: ExampleDataset;
  expected: number;
  note?: Bilingual;
  /**
   * Trích dẫn NGUỒN của chính ví dụ này — khác `FormulaSpec.source` ở trên, thứ trích nguồn lý
   * thuyết/pháp lý của cả công thức (giáo trình, chuẩn mực). Trường này chỉ có ở những ví dụ neo
   * vào một trường hợp có thật (một bài báo, một báo cáo phân tích, một API số liệu) — nội dung là
   * TÊN NGUỒN và mốc thời gian, KHÔNG lặp lại chữ "Nguồn:"/"Source:" vì đó là nhãn cố định
   * `example.source` trong từ điển, `ExampleBlock` tự ghép vào trước.
   *
   * Tách khỏi `note` để hai việc không lẫn vào nhau: `note` là câu MÔ TẢ (điều xảy ra, kết luận
   * gì), còn trường này là câu TRÍCH DẪN (ai nói, ở đâu, khi nào) — gộp chung từng làm một câu
   * vừa mô tả vừa trích dẫn đọc rối, chủ dự án chốt tách riêng ngày 16/09/2026.
   */
  source?: Bilingual;
}

/**
 * Ca kiểm thử đi kèm công thức — bắt buộc có ít nhất một (NFR-MNT-02).
 * expected = null nghĩa là ca này PHẢI ra cảnh báo chứ không ra số (FR-06).
 */
export interface FormulaTestCase {
  name: string;
  inputs: Readonly<Record<string, number>>;
  /** Chuỗi giá đóng cửa bơm vào `ctx.series` riêng cho ca này (công thức chuỗi — FR-12). */
  series?: ReadonlyArray<number>;
  /** Chuỗi phiên OHLCV bơm vào `ctx.bars` riêng cho ca này. */
  bars?: ReadonlyArray<SeriesRow>;
  /** Chuỗi giá VN-Index bơm vào `ctx.marketSeries` riêng cho ca này — riêng cho Beta. */
  marketSeries?: ReadonlyArray<number>;
  /** Dòng tiền bơm vào `ctx.cashflows` riêng cho ca này — riêng cho XIRR. */
  cashflows?: ReadonlyArray<Cashflow>;
  expected: number | null;
  expectedWarning?: WarningCode;
  /** Sai số cho phép; mặc định 0,01 theo NFR-MNT-03. */
  tolerance?: number;
}

/**
 * Một chặng của biểu đồ bóc tách — thác nước và cột chồng của WF-17 (FR-07).
 *
 * Vì sao khai bằng METADATA chứ không suy từ `extras` của `CalcOutput`: `extras` là một
 * `Record` không thứ tự, không dấu, không nhãn. Thác nước cần đúng ba thứ đó — chặng nào trước,
 * cộng hay trừ, và gọi là gì trong một cột rộng 40px. Suy đoán từ tên khoá là đoán mò, còn khai
 * ra thì thêm một chặng chỉ là thêm một dòng, không phải sửa renderer (NFR-MNT-01, LDR-01).
 */
export interface BreakdownStage {
  /**
   * Khoá của một BIẾN đầu vào, hoặc của một mục trong `extras` khi chặng ấy phải tính ra
   * mới có (ví dụ EBIT sau thuế của FCFF — không có ô nhập nào mang sẵn con số đó).
   */
  key: string;
  /** Cộng hay trừ vào tổng đang chạy. */
  sign: 1 | -1;
  /**
   * Nhãn cho cột hẹp. Thiếu thì lấy nhãn của biến — mà nhãn biến thường dài gấp mấy lần bề
   * ngang một cột ở màn 360px, nên chặng nào có nhãn dài đều nên khai ngắn lại ở đây.
   */
  shortLabel?: Bilingual;
}

/**
 * Một mốc ngang cố định trên trục KẾT QUẢ của biểu đồ.
 *
 * Sinh ra cho các chỉ báo dao động, nơi bản thân con số không nói hết ý: RSI 67 chỉ có nghĩa khi
 * người đọc biết 70 là ranh giới quá mua. Đoạn "Cách đọc kết quả" của `rsi-wilder` nói đúng hai
 * ngưỡng ấy bằng chữ, nhưng hình ngay trên đó lại không vẽ chúng — người đọc phải tự ước lượng
 * vị trí 30 và 70 trên trục Y.
 *
 * Vì sao là METADATA của công thức chứ không phải mã trong renderer: cùng lẽ với `BreakdownStage`
 * ngay trên. Ngưỡng là kiến thức về CHỈ BÁO, không phải về cách vẽ — Stochastic %K có mốc 20/80,
 * %B có 0/1, tỷ lệ nợ/vốn có ngưỡng cảnh báo riêng. Viết `if (id === 'rsi-wilder')` vào renderer
 * là buộc mỗi chỉ báo mới phải sửa tầng vẽ (NFR-MNT-01, LDR-01).
 *
 * Ba điều KHÔNG thuộc về khai báo này, để khỏi ai đó trông chờ nhầm:
 *
 *   - Nó **không nới trục**. Mốc nằm ngoài miền Y đang hiện thì bị bỏ đi lúc dựng mô hình, không
 *     kéo trục giãn ra ôm lấy nó. Trục Y bám theo dữ liệu thật; ép nó giãn để chứa một mốc là bóp
 *     dẹt chính đường đang cần đọc — xem `buildChartModel()`.
 *   - Nó **không đổi phép tính**. Thuần trang trí có thông tin; `calc` không nhìn tới nó.
 *   - Nó **không phải vùng tô**. Một đường mảnh nét đứt, không phải dải màu — dải màu ở khổ 320
 *     đơn vị viewBox sẽ chọi với vùng gạch chéo "không tính được" vốn đã dùng chỗ đó.
 */
export interface ReferenceLine {
  /**
   * Vị trí trên trục Y, theo ĐƠN VỊ GỐC của kết quả (`resultUnit`) — chưa chia bậc hiển thị.
   *
   * Cùng thang với `ChartAxis.domain`, vốn cũng giữ số gốc và chỉ chia lúc dựng nhãn vạch. Khai
   * theo thang đã chia (ví dụ ghi 0,03 cho mốc 30 triệu) là mốc rơi sai chỗ mỗi khi miền dữ liệu
   * đổi bậc đơn vị.
   */
  value: number;
  /** Nhãn ngắn đặt sát đường. Ngắn thật: nó nằm gọn trong bề ngang vùng vẽ ở khổ 360px. */
  label: Bilingual;
}

/**
 * Vẽ kèm đường GIÁ ĐÓNG CỬA làm chuỗi phụ trên trục thời gian.
 *
 * Sinh ra cho các chỉ báo mà ý nghĩa nằm ở TƯƠNG QUAN với giá: "Cách đọc kết quả" của SMA nói về
 * giá nằm trên/dưới đường và giá cắt đường, nhưng biểu đồ một chuỗi không cho người đọc thấy điều
 * vừa đọc. Cùng lẽ với `ReferenceLine` ngay trên: tương quan với giá là kiến thức về CHỈ BÁO,
 * không phải về cách vẽ, nên nó là metadata chứ không phải `if (id === 'sma-n-phien')` trong
 * renderer (NFR-MNT-01, LDR-01).
 *
 * Ba điều KHÔNG thuộc về khai báo này:
 *
 *   - Nó **chỉ sống trên trục thời gian**. Đổi trục X sang một biến số (ví dụ "Số phiên") thì mỗi
 *     điểm là một mức giả định, không còn là một phiên — đường giá không có nghĩa ở đó, và
 *     `buildChartModel()` chỉ dựng chuỗi phụ trong nhánh thời gian nên nó tự ẩn.
 *   - Nó **không đổi phép tính**. `calc` không nhìn tới nó; chuỗi chính vẫn là kết quả công thức.
 *   - Nó **không phải trục Y phải**. Giá và chỉ báo cùng đơn vị tiền thì đọc chung trục trái;
 *     miền trục nới ra ôm cả hai chuỗi.
 */
export interface PriceOverlaySpec {
  /**
   * Tên NGẮN của chỉ báo cho legend — 'SMA', không phải tên đầy đủ của công thức: legend chỉ hiện
   * khi có từ hai chuỗi trở lên, và ở khổ 360px hai nhãn dài là hai dòng chữ chen nhau.
   */
  shortName: Bilingual;
  /**
   * Khoá của biến SỐ PHIÊN trong `variables` — legend ghép giá trị đang nhập vào tên: 'SMA 20
   * phiên', đổi slider thì legend đổi theo. Chỉ dùng cho biến đo bằng phiên; bỏ trống thì legend
   * chỉ ghi `shortName`.
   */
  periodKey?: string;
}

/**
 * Một cạnh của đồ thị phụ thuộc: đầu ra của công thức khác chảy vào một biến ở đây (FR-15).
 * Gói 5.3.1 đọc chính các cạnh này để sắp xếp topo.
 */
export interface FormulaDependency {
  /** id công thức thượng nguồn. */
  formulaId: string;
  /** key của biến tại công thức này sẽ nhận giá trị. */
  variableKey: string;
}

/**
 * Phần metadata vừa đủ để DUYỆT và TÌM — thẻ công thức, kết quả tìm, bộ đếm nhóm.
 *
 * Tách ra khỏi `FormulaSpec` vì lý do dung lượng, không phải vì gọn mã (NFR-PER-04):
 * phần nặng của một công thức là bốn đoạn `explanation`, `example`, `tests` và `source` —
 * chữ nghĩa mà màn danh sách không bao giờ hiện. Gộp chung thì MỌI trang phải tải diễn giải
 * của cả 111 công thức chỉ để vẽ được cái thẻ có tên và một dòng mô tả.
 *
 * Bộ dữ liệu thật nằm ở `formulas/summaries.generated.ts`, sinh ra từ chính `ALL_FORMULAS`
 * nên không thể lệch — `summaries.test.ts` gác chuyện đó.
 */
export interface FormulaSummary {
  id: string;
  categoryId: string;
  name: Bilingual;
  /** Mô tả ngắn hiện trên thẻ công thức. */
  description: Bilingual;
  level: Level;
  /** Đưa lên khối nổi bật của trang chủ (FR-20). */
  isFeatured?: boolean;
  /** Từ khoá cho tìm kiếm bỏ dấu (FR-19). */
  tags: ReadonlyArray<string>;
}

/**
 * Một ký hiệu trong `latex` và nghĩa của nó — một dòng của bảng "A: là gì" đứng cạnh hình công thức.
 *
 * `latex` chép NGUYÊN VĂN một mẩu của `FormulaSpec.latex` (`'r_{t+1}'`, `'\\bar{r}'`, `'IRR'`, và cả
 * hằng số không hiển nhiên như `'365'` hay `'1 - (1 + IRR)^{-n}'`), vì màn dựng nó bằng KaTeX y như
 * hình chính. `meaning` là một CỤM ngắn, không phải câu: "lợi suất phiên t", "số kỳ nhận tiền".
 *
 * `meaning` không dùng gạch ngang (`—`, `–`): đứng cạnh dấu trừ `−` của hình, nó bị đọc thành phép
 * trừ — chủ dự án chỉ ra ở dòng α của `var-lich-su` ngày 17/09/2026. Chỗ nối viết bằng chữ và dấu
 * phẩy (", tức …", ", nên …"), khoảng số viết "từ 0 đến 100". Cửa gác ở `formulas.test.ts`.
 */
export interface SymbolNote {
  latex: string;
  meaning: Bilingual;
}

/**
 * Nhóm ô LẶP — công thức có số ô nhập do người dùng quyết (13/10/2026).
 *
 * Chủ dự án chỉ vào khối Số liệu của `gia-von-trung-binh-dca`, lúc ấy khai cứng ba đợt mua: *"người
 * dùng muốn test mà muốn nhập thêm 4 5 6 ,.... đợt nữa thì sao ? … cần thêm một button nữa dùng để
 * tạo thêm ô nhập … tương tự với các công thức tương tự"*. Đo trên Registry: đúng hai công thức có
 * ô đánh số cố định, công thức ấy và `loi-suat-trung-binh-hinh-hoc` (nút chọn "2 kỳ / 3 kỳ").
 *
 * ── `variables` vẫn khai các nhóm MẶC ĐỊNH, nhóm thêm sinh từ mẫu ────────────────────────────
 *
 * Ba đợt đầu vẫn là ba cặp `VariableSpec` viết tay trong `variables`. Nhờ vậy mọi thứ đang chốt
 * theo danh sách biến (248 trục biểu đồ, bài hướng dẫn, ví dụ, bài tập, link chia sẻ cũ) vẫn đúng
 * cho màn lúc mở ra. Nhóm thứ tư trở đi sinh từ `fields` — xem `resolveRepeatSpec()` ở `repeat.ts`.
 *
 * ── Số nhóm là một BIẾN khai trong `variables`, không phải trạng thái riêng của màn ───────────
 *
 * `countKey` trỏ vào một biến thật (`lots`, `periods`). Con số ấy vì thế đi cùng bộ số liệu qua
 * mọi kho sẵn có (bản nháp, phép tính đã lưu, link `?so=`) mà không kho nào phải biết tới nhóm lặp,
 * và `calc` đọc nó bằng `v()` như mọi ô khác. Miền của số nhóm là `min` / `max` của chính biến ấy.
 * Màn KHÔNG dựng ô cho biến này: hai nút Thêm / Bỏ ở cuối khối Số liệu là điều khiển của nó.
 */
export interface RepeatGroup {
  /** Khoá của biến giữ số nhóm đang dùng. Phải khai trong `variables`, kiểu `number`, bước 1. */
  countKey: string;
  /**
   * Mẫu ô của MỘT nhóm, đúng thứ tự bày trên màn. `key` là TIỀN TỐ (`'amount'` sinh ra `amount4`),
   * `label` và `description` mang `{n}` ở chỗ số thứ tự nhóm, `defaultValue` là con số một nhóm vừa
   * thêm mang lúc đầu.
   */
  fields: ReadonlyArray<VariableSpec>;
  /** Nhãn nút thêm một nhóm: 'Thêm đợt mua'. */
  addLabel: Bilingual;
  /** Nhãn nút bỏ nhóm cuối, `{n}` là số thứ tự nhóm sẽ bỏ: 'Bỏ đợt {n}'. */
  removeLabel: Bilingual;
}

/** Metadata đầy đủ của một công thức (LDR-01, LDR-02). */
export interface FormulaSpec extends FormulaSummary {
  /** Chuỗi LaTeX để KaTeX render (UI-03). */
  latex: string;
  /**
   * Công thức viết bằng chữ tiếng Việt, ví dụ 'P/E = Giá thị trường ÷ EPS'.
   *
   * Hai công dụng: người rà soát đối chiếu với hàm tính, và màn chi tiết HIỆN CHÍNH CHUỖI NÀY
   * trong lúc gói 2.4.3 (render LaTeX bằng KaTeX) còn hoãn. Vì vậy nó phải đọc được với người
   * dùng cuối, không được là biểu thức kiểu mã nguồn và tuyệt đối không phải LaTeX thô.
   * Không dùng để eval.
   *
   * Nó đứng NGAY DƯỚI hình, nên là hình đọc thành lời: hằng số (khác 0, 1, 2) có trong `latex` thì
   * phải có ở đây và ngược lại, cả `vi` lẫn `en` — cửa gác ở `formulas.test.ts`. Lỗi thật đã gặp:
   * hình sụt giảm không có `× 100` mà dòng chữ có.
   *
   * MỘT VẾ MỘT DÒNG: hình ngắt ở `\quad`, `\qquad` hay `\\` thì chuỗi này ngắt ở đúng bấy nhiêu ký
   * tự xuống dòng (luật 6 ở `src/core/expression-rules.ts`, 18/09/2026). 5 công thức có hai dòng,
   * 106 công thức còn lại một dòng. Đừng nối hai vế bằng ", với …" hay dấu chấm phẩy: chủ dự án đã
   * bác đúng cách nối ấy.
   */
  expression?: Bilingual;
  /**
   * Phép tính của công thức viết bằng CHỖ TRỐNG, để khối gộp thay số đang nhập vào rồi in ra một
   * dòng như `92.000 ÷ 6.050 = 15,21` (khổ PC, 01/10/2026).
   *
   * Mỗi chỗ trống là `{khoá}` của một biến trong `variables`, của một ký hiệu khai ở
   * `substitutionDerived`, hoặc (từ 13/10/2026) của một HẰNG SỐ THỊ TRƯỜNG đã khai ở
   * `usesConstants` — viết nguyên khoá có dấu chấm, `{fee.brokerage.buy}`. Phần còn lại là toán tử
   * mà `evaluateWorked()` đọc được (`+ − × ÷ ^ ( ) √ ln | | ⌊ ⌋ ⌈ ⌉`). KHÔNG viết vế trái và dấu
   * `=`: con số kết quả do màn nối vào, lấy thẳng từ `calc`.
   *
   * Vì sao viết tay chứ không sinh từ `latex`: `latex` không có đường nào trỏ về khoá biến, và
   * đoán theo nhãn thì sai ngay ở công thức đầu tiên (`EPS` trong hình, nhãn ô là
   * "EPS — lợi nhuận trên mỗi cổ phiếu"). Viết tay thì có cửa gác máy móc: `formulas.test.ts` thay
   * số của `example.inputs` vào rồi tính lại bằng `evaluateWorked()` và đối chiếu với `calc` —
   * cùng cách `worked` của bài tập và `thaySo` của ví dụ thực tế đang được gác.
   *
   * **Mọi con số viết thẳng trong mẫu phải là hằng số CỦA PHÉP TÍNH** — hệ số đơn vị (`10^9`,
   * `1000`), `100` của phần trăm, `365`, `22,5` của số Graham. TUYỆT ĐỐI không chép vào đây một
   * giá trị đến từ `usesConstants` (mức phí 0,15%, thuế 0,1%, hệ số nhân 100.000…): những số ấy
   * chảy từ `schedules.ts` và người dùng còn đổi được biểu phí, nên một bản chép sẽ nói sai ngay
   * trong lúc con số bên cạnh nó nói đúng. Cùng lý do `ConstantsNote` chỉ khai KHOÁ chứ không khai
   * giá trị.
   *
   * **Hằng số vào mẫu bằng KHOÁ, không bằng con số.** Từ 01/10 tới 13/10/2026 cách chặn lỗi trên là
   * cấm hẳn: công thức có `usesConstants` thì không được có `substitution`. Ngày 13/10/2026 chủ dự
   * án mở `roi-rong`, thấy nó thiếu dải thay số mà `cagr` có, và yêu cầu làm cho đủ. Nay mẫu viết
   * `{fee.brokerage.buy}`; lúc chạy `substitutionConstants()` tra khoá ấy qua đúng `ctx` mà `calc`
   * nhận, nên đổi biểu phí là dải đổi cùng lượt với con số kết quả. Hằng số phần trăm vào hình ở
   * dạng TỶ SỐ (0,15% → 0,0015), cùng quy ước với mọi tỷ lệ người dùng gõ (`r = {rate} ÷ 100`).
   * `formulas.test.ts` gác ba điều: khoá hằng số trong mẫu phải có ở `usesConstants`; mọi khoá của
   * `usesConstants` phải được mẫu nhắc tới; và đổi mọi mức của biểu phí thì dải tính lại vẫn ra
   * đúng số `calc` trả — ca cuối là thứ khiến một con số chép tay đỏ ngay.
   *
   * **CẢ 111 công thức có mẫu từ 16/10/2026** — chủ dự án: *"toàn bộ công thức đều có đầy đủ phần tôi
   * yêu cầu … chuẩn xác tuyệt đối cho tôi vì đây là tính toán chi tiết mà người dùng sử dụng"*. Ca
   * kiểm "MỌI công thức đều có dòng thay số" ở `formulas.test.ts` giữ danh sách ngoại lệ RỖNG. Những
   * ca từng cố ý bỏ nay đi bằng các trường bên dưới:
   *
   *   · 35 công thức ăn chuỗi giá: ký hiệu tính từ chuỗi (lợi suất bình quân một phiên, σ, EMA phiên
   *     trước…) vào mẫu bằng `{@ten}`, đọc từ `extras` của chính kết quả — `calc` trả thêm đúng các
   *     con số ấy.
   *   · Số số hạng thay đổi (DCA, trung bình hình học, DDM hai giai đoạn, CVaR, XIRR):
   *     `substitutionRepeat`.
   *   · Dò nghiệm (`irr-nien-kim`, `xirr`): `substitutionRhs`, dải in "≈ vế phải".
   *   · `lich-tra-no`: dạng đóng của tổng lãi theo cách trả, `substitutionCases`.
   *   · `chuoi-phien-giam-dai-nhat`: `max(k₁; k₂; …)`, nút `max` của cây.
   *
   * Và dải có mặt ở MỌI khuôn màn, không chỉ thẻ gộp: ngoài thẻ gộp nó đứng ngay dưới thẻ Kết quả;
   * thân riêng tự in kết quả (`loi-nhuan-rong`, `xirr`) đặt nó sau con số của mình.
   *
   * **Chuẩn xác tuyệt đối** nghĩa là hai điều, cửa gác ở `formulas.test.ts` giữ cả hai trên nhiều bộ
   * số (ví dụ, mặc định, mọi ô × 0,9 và × 1,1, từng lựa chọn): mẫu tính ở độ chính xác đầy đủ lệch
   * `calc` không quá 1e-9; và các số IN RA bấm lại ra đúng chuỗi con số khối Kết quả in —
   * `datSoThaySo` tăng chữ số lẻ tới khi khớp, không khớp thì màn không in dải.
   */
  substitution?: string;
  /**
   * Ký hiệu của hình công thức mà NGƯỜI DÙNG KHÔNG GÕ — mẫu tính ra chúng từ các ô nhập.
   *
   * Chốt ngày 05/10/2026, sau khi chủ dự án chụp màn `tra-gop-nien-kim` và nói dòng thay số
   * *"đang hiển thị quá loạn khiến tôi là người code cũng khó hiểu"*, rồi ra luật:
   * *"bên trên công thức đang biểu thị như nào thì ở chỗ này cũng cần hiển thị như vậy và chỉ là
   * thay số liệu vào thôi"*.
   *
   * Trước đó mẫu tự KHAI TRIỂN những ký hiệu ấy, nên dòng in ra không còn hình dạng của hình vẽ:
   *
   * ```text
   * hình : EMI = P·i(1+i)ⁿ ÷ ((1+i)ⁿ − 1)
   * mẫu cũ: {amount} × {rate} ÷ 100 ÷ 12 × (1 + {rate} ÷ 100 ÷ 12)^({years} × 12) ÷ (…)
   * ```
   *
   * `i` xuất hiện ba lần, mỗi lần là một cụm ba phép tính; `n` thành `20 × 12`. Đọc ra thì không
   * còn nhận ra hình nào nữa. Nay:
   *
   * ```ts
   * substitutionDerived: { i: '{rate} ÷ 100 ÷ 12', n: '{years} × 12' },
   * substitution: '{amount} × {i} × (1 + {i})^{n} ÷ ((1 + {i})^{n} − 1)',
   * ```
   *
   * Luật của trường này:
   *
   *   · KHOÁ là ký hiệu trong `latex`, viết thường không dấu (`i`, `n`, `g`). Nó không được trùng
   *     khoá của một biến trong `variables` — trùng thì giá trị tính ra sẽ đè lên ô nhập.
   *   · GIÁ TRỊ là một biểu thức cùng cú pháp `substitution`, nhắc tới ô nhập và các khoá khai
   *     TRƯỚC nó. Thứ tự khai là thứ tự tính.
   *   · Cùng cấm chép hằng số từ `usesConstants` như `substitution`, và cùng một lý do: cần mức phí
   *     thì viết khoá của nó, `{fee.brokerage.buy}`.
   *
   * 21 trên 61 mẫu cần trường này; 40 mẫu còn lại vốn đã thay thẳng ký hiệu (`{price} ÷ {eps}`).
   * (Câu này từng ghi "21 trên 48"; đếm lại ngày 13/10/2026 thì lúc ấy là 17 trên 48. Từ 16/10/2026
   * cả 111 công thức có mẫu; con số này chưa đếm lại.)
   *
   *   · KHOÁ CÓ `#` (16/10/2026) là ký hiệu theo chỉ số: `'rTl#': '{r#} ÷ 100'` cho ra `rTl1`, `rTl2`…
   *     cho từng ô `r1`, `r2`… đang có — để số hạng của `substitutionRepeat` in lợi suất từng kỳ dạng
   *     tỷ lệ như mọi tỷ lệ khác của dải.
   *
   * Cửa gác: `formulas.test.ts` tính lại cả dòng rồi đối chiếu `calc`, nên một mẫu dẫn xuất sai sẽ
   * làm lệch kết quả và đỏ ngay — không có đường nào để nó sai mà vẫn xanh.
   */
  substitutionDerived?: Readonly<Record<string, string>>;
  /**
   * Phần LẶP của mẫu — tổng (hay tích) có số số hạng do người dùng hoặc dữ liệu quyết (16/10/2026).
   *
   * Sinh ra khi chủ dự án đòi MỌI công thức có dải thay số. Bốn công thức từng cố ý không có vì số
   * số hạng không cố định: DCA (số đợt mua), lợi suất trung bình hình học (số kỳ), DDM hai giai đoạn
   * (số năm tăng trưởng) và CVaR (số phiên lỗ nặng nhất). Hình của chúng viết `Σ` hay `∏`; dải viết
   * tổng ấy ra đủ từng số hạng.
   *
   * Khoá của bản ghi là chỗ trống trong `substitution` nhường cho cả tổng: mẫu
   * `({tongTien}) ÷ ({tongCo})` với `tongTien: { count: 'lots', join: '+', term: '{amount#}' }`.
   * Trong `term`, `#` là chỉ số: `{amount#}` ở số hạng thứ 3 đọc ô `amount3`, `{#}` là chính số 3.
   * `count` là khoá mang số số hạng — ô nhập, ký hiệu dẫn xuất hay `{@…}` của `calc`.
   */
  substitutionRepeat?: Readonly<
    Record<
      string,
      {
        count: string;
        from?: number;
        /** `max` gom các số hạng vào một `max(a; b; …)` — hình `L = max{k : …}` của chuỗi phiên giảm. */
        join: '+' | '×' | 'max';
        term: string;
        /**
         * Bỏ số hạng thứ `i` khi khoá này (có `#`) bằng 0 — cho đúng những đợt `calc` cũng bỏ qua.
         * DCA coi "tiền mua đợt i = 0" là đợt không có (kể cả khi giá đợt ấy cũng 0), nên dải không
         * in một số hạng `0 ÷ 0` mà `calc` chưa bao giờ tính.
         */
        skipZero?: string;
      }
    >
  >;
  /**
   * Mẫu RIÊNG theo giá trị của một ô lựa chọn (16/10/2026) — `substitution` là mẫu mặc định, mẫu ở
   * đây thay nó khi ô `key` mang giá trị tương ứng.
   *
   * Sinh ra cho `lich-tra-no`: hình viết "Tổng lãi = Σ lãi từng kỳ" — 240 số hạng ở khoản vay 20 năm,
   * không ai đọc nổi — nên dải viết DẠNG ĐÓNG của chính tổng ấy, mà dạng đóng khác nhau theo cách
   * trả: trả góp đều thì `n × A − P`, gốc đều thì `P × i × (n + 1) ÷ 2`. Cả hai đúng bằng tổng lãi
   * về toán; cửa gác đối chiếu với `calc` tới 1e-9 ở MỌI lựa chọn.
   */
  substitutionCases?: { key: string; byValue: Readonly<Record<number, string>> };
  /**
   * Vế phải của PHƯƠNG TRÌNH mà dải vẽ, cho công thức có kết quả là một NGHIỆM (16/10/2026).
   *
   * IRR niên kim và XIRR không có biểu thức đóng: `calc` dò nghiệm. Dải của chúng vì thế không thể
   * viết "phép tính = kết quả" — nó viết lại phương trình với nghiệm đã thay vào và in "≈ vế phải":
   * `… ≈ 3.000.000.000` (số tiền vay), `… ≈ 0` (tổng dòng tiền chiết khấu). Cùng cách khối Ví dụ thực
   * tế làm với `PHUONG_TRINH_AN`. Cú pháp như `substitution`.
   */
  substitutionRhs?: string;
  /*
   * ── Mộ chí: `derivedSubstitution` (05/10/2026 → 06/10/2026) ──────────────────────────────
   *
   * Trường này mang công thức tính của từng đại lượng mà khối "Từ các ô trên, công thức tính ra"
   * bày. Khối ấy BỎ HẲN ngày 06/10/2026 nên trường đi theo — phép đo dẫn tới quyết định ấy ghi ở
   * mộ chí `detail.derivedInUse` trong `vi.ts`.
   *
   * Đừng dựng lại một mình: thiếu khối đọc nó thì đây là dữ liệu chết trong 9 spec, và cửa gác đi
   * kèm (`formulas.test.ts` tính lại từng mẫu rồi đối chiếu `extras`) là một phép kiểm cho thứ
   * không ai nhìn thấy.
   */
  /**
   * Bảng ký hiệu của hình công thức — mỗi chữ trong `latex` là gì, theo kiểu "L: chuỗi giảm dài
   * nhất · k: số phiên giảm liên tiếp · r_t: lợi suất phiên t". Màn chi tiết bày nó BÊN PHẢI hình
   * công thức (dưới hình ở khổ hẹp), chủ dự án chốt bố cục ngày 16/09/2026 sau khi chỉ vào hình
   * `L = max{k : r_{t+1} < 0, …}` và nói "không hiểu các giá trị".
   *
   * Ba luật, đều có cửa gác ở `formulas.test.ts`: mọi công thức đều có bảng; mỗi mục chép nguyên văn
   * từ `latex`; và gộp các mục lại phải PHỦ HẾT mọi chữ cái, chữ Hy Lạp, cụm `\text{…}` (cả viết tắt
   * lẫn chữ Việt như "Tài sản ngắn hạn", từ 16/10/2026) và hằng số đáng hỏi trong `latex`
   * (`latexSymbolTokens()` tách chúng ra). Hằng số 0, 1, 2 không bị đòi, nhưng
   * nên có khi không hiển nhiên — số 1 của IRR. `100` thì bị đòi từ 17/09/2026, khi chủ dự án hỏi
   * "tại sao lại nhân với 100".
   *
   * Không dùng lại `variables`: bảng biến gọi tên theo Ô NHẬP ("Giá thị trường"), còn ở đây gọi
   * tên theo CHỮ TRONG HÌNH (`P`); kết quả, chỉ số chạy (t, i, k) và hằng số không phải biến nào.
   */
  symbols?: ReadonlyArray<SymbolNote>;
  chartType: ChartType;
  variables: ReadonlyArray<VariableSpec>;
  /** Nhóm ô lặp do người dùng thêm bớt — xem `RepeatGroup`. Hai công thức khai. */
  repeat?: RepeatGroup;
  /** Đơn vị của kết quả, ví dụ 'lần', '%', '₫'. */
  resultUnit: string;
  explanation: Explanation;
  example: FormulaExample;
  tests: ReadonlyArray<FormulaTestCase>;
  source: ReadonlyArray<FormulaSource>;
  note?: Bilingual;
  /**
   * Khoá của những hằng số MarketConfig mà `calc` tra tới — KHAI BÁO KHOÁ, không phải trị số.
   *
   * Mục đích là hiển thị: màn chi tiết bày nhãn, trị số, đơn vị và ngày hiệu lực của từng hằng
   * số ngay dưới khối Số liệu, để người dùng thấy con số kết quả đang tính theo mức nào. Trước
   * gói này, `phi-giao-dich-mua` cho ra 138.000 ₫ mà mức 0,15% không xuất hiện ở bất kỳ đâu trên
   * trang — người dùng không có cách nào biết phí tính theo tỷ lệ gì.
   *
   * Chỉ khai khoá vì trị số phải tiếp tục chảy từ `schedules.ts` (LDR-03, CON-10): luật đổi thì
   * màn hình đổi theo, không mục. Chép "0,15%" hay "100.000 ₫" vào prose thì lint không bắt được
   * và nó sẽ âm thầm sai.
   *
   * Hai ca kiểm trong `constants-gate.test.ts` giữ khai báo khớp với thân hàm: một ca quét mã
   * nguồn để không lời gọi nào bị bỏ khai, một ca rút từng khoá khỏi biểu phí và bắt buộc công
   * thức phải hỏng — khai một khoá mình không dùng cũng là đỏ.
   */
  usesConstants?: ReadonlyArray<MarketConstantKey>;
  dependsOn?: ReadonlyArray<FormulaDependency>;
  /**
   * Các chặng của biểu đồ bóc tách. Chỉ có nghĩa với `chartType` là `waterfall` hoặc
   * `stackedBar`; công thức khác bỏ trống và không mất gì.
   *
   * Tổng các chặng phải ra đúng KẾT QUẢ của công thức — có ca kiểm chốt điều đó, vì một biểu đồ
   * bóc tách cộng không ra con số ở khối Kết quả là biểu đồ nói dối về chính phép tính của nó.
   */
  breakdown?: ReadonlyArray<BreakdownStage>;
  /**
   * Nhãn của CỘT TỔNG trong hình bóc tách. Thiếu thì lấy phần trước dấu gạch dài của tên công
   * thức — đúng cho `ev` ('EV — giá trị doanh nghiệp' thành 'EV'), sai cho những công thức mà
   * tên gọi tên CÔNG VIỆC chứ không gọi tên đại lượng: cột tổng của `lich-tra-no` mang giá trị
   * tổng lãi, gắn nhãn 'Lịch trả nợ vay' vào đó là đặt sai tên cho chính con số nó đang bày.
   */
  breakdownTotal?: Bilingual;
  /**
   * Các mốc ngang vẽ trên trục kết quả — xem `ReferenceLine`.
   *
   * Không khai thì biểu đồ dựng y hệt như trước: `buildChartModel()` chỉ gắn trường tương ứng vào
   * mô hình khi có ít nhất một mốc CÒN NẰM TRONG miền Y, nên 110 công thức còn lại không nhận thêm
   * một thẻ SVG nào.
   */
  referenceLines?: ReadonlyArray<ReferenceLine>;
  /**
   * Vẽ kèm đường giá đóng cửa trên trục thời gian — xem `PriceOverlaySpec`.
   *
   * Không khai thì biểu đồ dựng y hệt như trước, kể cả khi công thức vẽ được theo thời gian —
   * cùng nếp `referenceLines`.
   */
  priceOverlay?: PriceOverlaySpec;
  /**
   * Kết quả là một MỨC GIÁ của chính mã đang nạp, đi cùng thang với giá phiên (21/10/2026).
   *
   * Khai thì đường theo thời gian mời thêm dạng "Nến": nến của từng phiên vẽ dưới đường kết quả,
   * cùng một trục giá. Chỉ năm công thức khai — SMA, EMA, hai dải Bollinger và VWAP — và đây là
   * KHAI BÁO chứ không suy ra từ `resultUnit` hay `chartType`: MACD, động lượng, giao cắt hai đường
   * MA và ATR cũng tính bằng ₫ và cũng mang nhãn `'candlestick'`, nhưng là một HIỆU hay một BIÊN ĐỘ
   * giá, nằm quanh 0 hoặc vài nghìn đồng, nên đặt chúng lên trục của nến 70.000 ₫ là vẽ một đường
   * dẹt sát đáy. `dang-ve.test.ts` ghim danh sách.
   */
  priceLevel?: true;
  /**
   * Hình THEO CHUỖI GIÁ của công thức — một mục thêm vào ô "Xem theo", chỉ hiện khi đã nạp chuỗi
   * (21/10/2026). Xem `SeriesViewSpec`.
   */
  seriesView?: SeriesViewSpec;
  /**
   * Hình TRÒN chia một tổng thành các phần — một mục thêm vào ô "Xem theo" (22/10/2026). Xem
   * `CompositionSpec`.
   */
  composition?: CompositionSpec;
  /**
   * THANG ĐO nửa vòng cung với các vùng đặt tên — một mục thêm vào ô "Xem theo" (23/10/2026). Xem
   * `GaugeSpec`.
   */
  gauge?: GaugeSpec;
}

/**
 * Thang đo của một chỉ báo có thang cố định và các mốc đọc quen dùng (23/10/2026, kiểu hình mới thứ
 * tư chủ dự án chọn): RSI 0–100 với 30/70, Stochastic 0–100 với 20/80, %B với hai dải 0% và 100%.
 *
 * Kim chỉ ĐÚNG con số ở khối Kết quả, nằm trong vùng nào thì vùng ấy đậm lên. Ranh giới giữa các vùng
 * phải là đúng các `referenceLines` công thức đã khai — hình đường và thang đo nói cùng hai mốc;
 * `gauge.test.ts` gác điều đó. Số nằm ngoài thang (%B trên dải trên quá xa) thì kim nằm ở đầu thang
 * còn chữ giữa vòng vẫn in đúng số thật.
 */
export interface GaugeSpec {
  /** Hai đầu thang, theo đơn vị của kết quả (`resultUnit`). */
  min: number;
  max: number;
  /** Các vùng nối tiếp từ `min`: mỗi vùng hết ở `to`, vùng cuối hết ở đúng `max`. Hai tới ba vùng. */
  zones: ReadonlyArray<{ to: number; label: Bilingual }>;
}

/**
 * Một phần của hình cơ cấu: tra ô nhập trước, rồi tới `extras` của kết quả — cùng lối tra với
 * `BreakdownStage`, vì có phần không ô nào mang sẵn (tiền lãi của lãi kép).
 */
export interface CompositionPart {
  key: string;
  /** Tên phần trên chú giải. Thiếu thì lấy nhãn của ô nhập mang khoá ấy. */
  label?: Bilingual;
}

/**
 * Hình CƠ CẤU: một tổng chia thành các phần, vẽ thành vành khuyên (22/10/2026).
 *
 * Chủ dự án hỏi công thức nào vẽ được hình tròn để người dùng dễ hình dung, rồi bảo làm. Khác
 * `breakdown` ở một chỗ, và chỗ ấy là lý do có khai báo riêng: các phần của bóc tách phải cộng đúng
 * KẾT QUẢ của công thức (`chart.test.ts` gác), còn tổng ở đây có thể là một đại lượng KHÁC. D/E là
 * một tỷ số, nhưng thứ đáng nhìn là tổng nguồn vốn chia ra nợ và vốn chủ — hai số chính là hai ô của
 * công thức. Tổng LUÔN là tổng các phần, nên hình không thể nói sai về phép cộng của chính nó.
 *
 * Mục chỉ có mặt khi mọi phần tra ra số, không phần nào âm và tổng dương: một phần âm (vốn chủ âm)
 * không có chỗ nào trên vòng tròn. `composition.test.ts` gác cả Registry.
 */
export interface CompositionSpec {
  /** Tên hình, cũng là chữ của mục trong ô "Xem theo": 'Cơ cấu nguồn vốn'. */
  title: Bilingual;
  /** Tên của tổng, in giữa vòng và ở dòng cuối bảng số: 'Tổng nguồn vốn'. */
  total: Bilingual;
  /** Đơn vị của các phần — khác `resultUnit` khi kết quả là một tỷ số (D/E tính bằng lần). */
  unit: string;
  /** Hai tới bốn phần, theo chiều kim đồng hồ từ 12 giờ. Bốn là số tông màu đã kiểm tương phản. */
  parts: ReadonlyArray<CompositionPart>;
}

/**
 * Hình theo chuỗi giá: "Phân phối lợi suất" (histogram lợi suất phiên) hoặc "Đường sụt giảm" (mức
 * sụt so với đỉnh qua từng phiên). Mục này nằm trong ô "Xem theo", cạnh "Thời gian", và chỉ có khi
 * chuỗi đã nạp đủ phiên.
 *
 * Cửa sổ phiên khai Ở ĐÂY phải là ĐÚNG cửa sổ `calc` dùng — một hình vẽ 250 phiên dưới một con số
 * tính trên 60 phiên là hình nói về dữ liệu khác với con số. Vì thế `min` khai bằng CHÍNH hằng số
 * mà `calc` của file ấy đòi (`MIN_VAR_BARS`, `MIN_SESSIONS_STDDEV`…), không chép số; và
 * `series-view.test.ts` gác bằng phép thử nhiễu: đổi một phiên ngay TRƯỚC cửa sổ thì kết quả phải
 * đứng yên, đổi phiên ĐẦU cửa sổ thì kết quả phải đổi.
 */
export interface SeriesViewSpec {
  kind: 'distribution' | 'drawdown';
  /**
   * Ô nhập số phiên CUỐI đưa vào tính (`lookback`, `sessions`). Vắng mặt nghĩa là cả chuỗi — các tỷ
   * số Sharpe, Sortino, Calmar… đọc mọi phiên đã nạp.
   */
  lookbackKey?: string;
  /** Số phiên tối thiểu, đồng thời là sàn của ô `lookbackKey` — đúng cách `windowOf()` kẹp. */
  min: number;
  /**
   * `calc` đòi ĐỦ số phiên của ô `lookbackKey` (`windowCloses()` của risk-volatility.ts gọi
   * `requireCloses(ctx, max(min, ô))`), không kẹp ngắn lại như `windowOf()`. Có cờ này thì chuỗi ngắn
   * hơn ô là `calc` báo thiếu phiên, nên hình cũng không mời mục — không vẽ một cửa sổ `calc` từ chối.
   */
  fullWindow?: true;
  /**
   * Chỉ dạng sụt giảm: điểm mang dấu "giá trị hiện tại". `last` là phiên cuối (sụt giảm hiện tại),
   * `deepest` là phiên sụt sâu nhất, `streakEnd` là phiên kết thúc chuỗi giảm dài nhất.
   */
  mark?: 'last' | 'deepest' | 'streakEnd';
  /**
   * Chỉ dạng phân phối: kết quả là một mức LỖ trên trục lợi suất (VaR, CVaR in 1,86 % cho một phiên
   * lỗ 1,86 %), nên hình kẻ vạch tại −kết quả.
   */
  resultIsLoss?: true;
}

/**
 * Cách sắp xếp danh sách công thức ở WF-02.
 *
 * Ba giá trị đầu chỉ đọc metadata của chính công thức nên tính được ở bất kỳ đâu.
 * `recent` và `used` thì KHÔNG: điểm của chúng nằm ở lịch sử dùng trên máy người dùng
 * (`ffb.usage.v1`, tầng Application), nên tầng này chỉ nhận điểm đã tính sẵn qua
 * `SelectOptions.usageOrder` — xem docblock ở `search.ts`.
 */
export type ListSort = 'featured' | 'az' | 'za' | 'recent' | 'used' | 'basic';

/** 'all' là chip “Tất cả” đứng cạnh chip Chứng khoán và Cá nhân. */
export type SegmentFilter = Segment | 'all';

/**
 * Điều kiện lọc và tìm của màn danh sách (FR-19).
 * Định nghĩa ở tầng Domain để logic lọc test được bằng Node; tầng Application chỉ việc
 * đọc/ghi nó lên URL.
 */
export interface FormulaQuery {
  /** Chuỗi tìm kiếm thô người dùng gõ, có dấu hay không dấu đều được. */
  q: string;
  segment: SegmentFilter;
  categoryId: string | null;
  sort: ListSort;
}

/** Mức nghiêm trọng của một phát hiện khi soát Registry. */
export type IssueSeverity = 'error' | 'warning';

/**
 * Một phát hiện khi soát Registry.
 * `error` chặn build; `warning` chỉ nhắc — ví dụ nhóm chưa đủ số công thức dự kiến.
 */
export interface RegistryIssue {
  severity: IssueSeverity;
  /** Đường dẫn tới chỗ sai, ví dụ 'pe.variables[1].min'. */
  path: string;
  message: string;
}

/** Registry đã dựng xong, kèm các chỉ mục tra cứu sẵn. */
export interface Registry {
  categories: ReadonlyArray<Category>;
  formulas: ReadonlyArray<FormulaSpec>;
  /** Tra công thức theo id. */
  byId: ReadonlyMap<string, FormulaSpec>;
  /** Tra danh sách công thức theo categoryId. */
  byCategory: ReadonlyMap<string, ReadonlyArray<FormulaSpec>>;
  issues: ReadonlyArray<RegistryIssue>;
}
