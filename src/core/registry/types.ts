/**
 * Tầng DOMAIN — schema của Formula Registry (gói WBS 1.3.1).
 *
 * LDR-01 và LDR-02: Registry là NGUỒN DỮ LIỆU DUY NHẤT cho metadata công thức.
 * Giao diện sinh ra từ đây; thêm công thức mới chỉ khai báo thêm một FormulaSpec
 * và viết hàm tính, không phải sửa mã lõi (NFR-MNT-01).
 */

import type { SeriesRow } from '../price-series';
import type { Level, VariableSpec, WarningCode } from '../types';

/** Hai mảng sản phẩm của SRS mục 1.2.2. */
export type Segment = 'stock' | 'personal';

/** Một trong 12 nhóm công thức (FR-01). */
export interface Category {
  id: string;
  segment: Segment;
  /** Tên tiếng Việt hiện trên chip lọc và cây nhóm. */
  name: string;
  /**
   * Tên rút gọn cho chỗ hẹp: lưới hai cột của WF-01 và nhãn nhóm trên thẻ công thức.
   * Ở 360px, "Phí & thuế thị trường VN" vỡ ra bốn dòng còn "Phí & thuế VN" thì vừa một dòng.
   * Chữ lấy đúng nguyên văn wireframe. Không dùng ở chip lọc và dropdown WF-02 — chỗ đó
   * rộng và cần tên đầy đủ để phân biệt nhóm.
   */
  shortName: string;
  nameEn: string;
  description: string;
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
  meaning: string;
  /** Khi nào dùng. */
  whenToUse: string;
  /** Cách đọc kết quả. */
  howToRead: string;
  /** Sai lầm thường gặp. */
  commonMistakes: string;
}

/** Nguồn tham khảo của công thức (FR-04, CON-11). */
export interface FormulaSource {
  /** Trích dẫn đầy đủ: giáo trình, chuẩn mực, hoặc văn bản pháp luật. */
  label: string;
  url?: string;
}

/** Ví dụ thực tế bằng số liệu Việt Nam, hiện trên màn chi tiết (FR-02). */
export interface FormulaExample {
  title: string;
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
  expected: number;
  note?: string;
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
  shortLabel?: string;
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
 * của cả 108 công thức chỉ để vẽ được cái thẻ có tên và một dòng mô tả.
 *
 * Bộ dữ liệu thật nằm ở `formulas/summaries.generated.ts`, sinh ra từ chính `ALL_FORMULAS`
 * nên không thể lệch — `summaries.test.ts` gác chuyện đó.
 */
export interface FormulaSummary {
  id: string;
  categoryId: string;
  name: { vi: string; en: string };
  /** Mô tả ngắn hiện trên thẻ công thức. */
  description: string;
  level: Level;
  /** Đưa lên khối nổi bật của trang chủ (FR-20). */
  isFeatured?: boolean;
  /** Từ khoá cho tìm kiếm bỏ dấu (FR-19). */
  tags: ReadonlyArray<string>;
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
   */
  expression?: string;
  chartType: ChartType;
  variables: ReadonlyArray<VariableSpec>;
  /** Đơn vị của kết quả, ví dụ 'lần', '%', '₫'. */
  resultUnit: string;
  explanation: Explanation;
  example: FormulaExample;
  tests: ReadonlyArray<FormulaTestCase>;
  source: ReadonlyArray<FormulaSource>;
  note?: string;
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
  breakdownTotal?: string;
}

/** Cách sắp xếp danh sách công thức ở WF-02. */
export type ListSort = 'featured' | 'az' | 'za';

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
