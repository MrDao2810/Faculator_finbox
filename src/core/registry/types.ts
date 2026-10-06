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
   * Mỗi chỗ trống là `{khoá}` của một biến trong `variables`; phần còn lại là toán tử mà
   * `evaluateWorked()` đọc được (`+ − × ÷ ^ ( ) √ ln | | ⌊ ⌋ ⌈ ⌉`). KHÔNG viết vế trái và dấu `=`:
   * con số kết quả do màn nối vào, lấy thẳng từ `calc`.
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
   * giá trị. `formulas.test.ts` gác: công thức có `usesConstants` thì không được có `substitution`.
   *
   * Tuỳ chọn: công thức chưa khai thì khối gộp bỏ hẳn dòng này, không in một dòng nửa vời. Hiện
   * 48 trên 111 công thức có mẫu. Những ca cố ý BỎ, để khỏi ai viết lại:
   *
   *   · 14 công thức đọc hằng số thị trường — xem đoạn ngay trên. Muốn có dòng thay số cho chúng
   *     thì phải cho mẫu tham chiếu được KHOÁ hằng số, không phải chép giá trị.
   *   · `ddm-hai-giai-doan`, `gia-von-trung-binh-dca` — cộng dồn qua một số kỳ / số đợt do người
   *     dùng đặt, nên số hạng của phép cộng không cố định.
   *   · `loi-suat-trung-binh-hinh-hoc` — nút chọn 2 hay 3 kỳ quyết định có dùng ô thứ ba hay không.
   *   · `irr-nien-kim`, `xirr` — dò nghiệm, không có biểu thức đóng. Cùng ca với `PHUONG_TRINH_AN`
   *     của khối Ví dụ thực tế (`src/core/vi-du/kiem.ts`).
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
   *   · Cùng cấm chép hằng số từ `usesConstants` như `substitution`, và cùng một lý do.
   *
   * 21 trên 48 mẫu cần trường này; 27 mẫu còn lại vốn đã thay thẳng ký hiệu (`{price} ÷ {eps}`).
   *
   * Cửa gác: `formulas.test.ts` tính lại cả dòng rồi đối chiếu `calc`, nên một mẫu dẫn xuất sai sẽ
   * làm lệch kết quả và đỏ ngay — không có đường nào để nó sai mà vẫn xanh.
   */
  substitutionDerived?: Readonly<Record<string, string>>;
  /**
   * Công thức tính của từng đại lượng mà khối "Từ các ô trên, công thức tính ra" bày ra.
   *
   * Chốt ngày 05/10/2026. Chủ dự án nhìn khối ấy trên `tra-gop-nien-kim` và hỏi bốn câu:
   * *"Gốc kỳ đầu là gì? tại sao lại có gốc kỳ đầu? Lãi kỳ đầu là gì và tại sao lại có ở đây? nếu
   * được tính ra thì công thức để tính đâu? tại sao chưa cho vào."*
   *
   * Khối ấy (`DerivedNote`) bày NHÃN và TRỊ SỐ, không gì khác. Nó sinh ra ngày 16/09/2026 để bịt
   * đúng lỗ hổng này cho `fcfe` — một cột biểu đồ tên "Lãi vay sau thuế" cao 48 tỷ mà con số 48
   * không có ở đâu khác trên trang. Nhưng nó mới nói ĐẠI LƯỢNG ẤY TỒN TẠI, chưa nói nó tính ra sao,
   * nên lỗ hổng chỉ lùi xuống một tầng. Trường này đóng nốt tầng ấy.
   *
   * Khoá là khoá của chặng `breakdown` (tức khoá trong `extras`). Mẫu cùng cú pháp `substitution`,
   * và nhắc tới được:
   *
   *   · ô nhập trong `variables`;
   *   · ký hiệu khai ở `substitutionDerived`;
   *   · một khoá `extras` KHÁC — `calc` đã tính sẵn nên không phải sắp thứ tự;
   *   · `{__ketQua}` — chính con số khối Kết quả đang in. Khoản gốc kỳ đầu của một khoản vay niên
   *     kim đúng là "khoản trả hằng tháng trừ đi lãi kỳ đầu", và viết thế mới đọc ra được.
   *
   * 12 trên 15 đại lượng có mẫu. BA chỗ cố ý để trống, mỗi chỗ một lý do, ghi ra để khỏi ai tưởng
   * là bỏ sót:
   *
   *   · `thue-tncn-dau-tu.transferTax` và `.dividendTax` — đọc thuế suất từ `usesConstants`. Cùng
   *     lệnh cấm đã áp cho `substitution`: chép trị số hằng vào mẫu thì người đổi biểu phí ở màn
   *     Cài đặt sẽ thấy mẫu nói một đằng, con số bên cạnh nói một nẻo.
   *   · `ddm-hai-giai-doan.pvStage1` — một tổng Σ qua n kỳ do người dùng đặt, nên số hạng không cố
   *     định. Cùng ca với những công thức cố ý không có `substitution`.
   *
   * Cửa gác: `formulas.test.ts` tính lại từng mẫu rồi đối chiếu với chính `extras` mà `calc` trả
   * về. Một mẫu sai thì đỏ — không có đường nào để nó in ra một phép tính không dẫn tới con số
   * đứng ngay cạnh nó.
   */
  derivedSubstitution?: Readonly<Record<string, string>>;
  /**
   * Bảng ký hiệu của hình công thức — mỗi chữ trong `latex` là gì, theo kiểu "L: chuỗi giảm dài
   * nhất · k: số phiên giảm liên tiếp · r_t: lợi suất phiên t". Màn chi tiết bày nó BÊN PHẢI hình
   * công thức (dưới hình ở khổ hẹp), chủ dự án chốt bố cục ngày 16/09/2026 sau khi chỉ vào hình
   * `L = max{k : r_{t+1} < 0, …}` và nói "không hiểu các giá trị".
   *
   * Ba luật, đều có cửa gác ở `formulas.test.ts`: mọi công thức đều có bảng; mỗi mục chép nguyên văn
   * từ `latex`; và gộp các mục lại phải PHỦ HẾT mọi chữ cái, chữ Hy Lạp, viết tắt và hằng số đáng
   * hỏi trong `latex` (`latexSymbolTokens()` tách chúng ra). Hằng số 0, 1, 2 không bị đòi, nhưng
   * nên có khi không hiển nhiên — số 1 của IRR. `100` thì bị đòi từ 17/09/2026, khi chủ dự án hỏi
   * "tại sao lại nhân với 100".
   *
   * Không dùng lại `variables`: bảng biến gọi tên theo Ô NHẬP ("Giá thị trường"), còn ở đây gọi
   * tên theo CHỮ TRONG HÌNH (`P`); kết quả, chỉ số chạy (t, i, k) và hằng số không phải biến nào.
   */
  symbols?: ReadonlyArray<SymbolNote>;
  chartType: ChartType;
  variables: ReadonlyArray<VariableSpec>;
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
