/**
 * Tầng DOMAIN — schema của Formula Registry (gói WBS 1.3.1).
 *
 * LDR-01 và LDR-02: Registry là NGUỒN DỮ LIỆU DUY NHẤT cho metadata công thức.
 * Giao diện sinh ra từ đây; thêm công thức mới chỉ khai báo thêm một FormulaSpec
 * và viết hàm tính, không phải sửa mã lõi (NFR-MNT-01).
 */

import type { Level, VariableSpec, WarningCode } from '../types';

/** Hai mảng sản phẩm của SRS mục 1.2.2. */
export type Segment = 'stock' | 'personal';

/** Một trong 12 nhóm công thức (FR-01). */
export interface Category {
  id: string;
  segment: Segment;
  /** Tên tiếng Việt hiện trên chip lọc và cây nhóm. */
  name: string;
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
  expected: number | null;
  expectedWarning?: WarningCode;
  /** Sai số cho phép; mặc định 0,01 theo NFR-MNT-03. */
  tolerance?: number;
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

/** Metadata đầy đủ của một công thức (LDR-01, LDR-02). */
export interface FormulaSpec {
  id: string;
  categoryId: string;
  name: { vi: string; en: string };
  /** Mô tả ngắn hiện trên thẻ công thức. */
  description: string;
  /** Chuỗi LaTeX để KaTeX render (UI-03). */
  latex: string;
  /** Biểu thức dạng chữ, chỉ để đối chiếu khi rà soát; không dùng để eval. */
  expression?: string;
  chartType: ChartType;
  level: Level;
  /** Đưa lên khối nổi bật của trang chủ (FR-20). */
  isFeatured?: boolean;
  /** Từ khoá cho tìm kiếm bỏ dấu (FR-19). */
  tags: ReadonlyArray<string>;
  variables: ReadonlyArray<VariableSpec>;
  /** Đơn vị của kết quả, ví dụ 'lần', '%', '₫'. */
  resultUnit: string;
  explanation: Explanation;
  example: FormulaExample;
  tests: ReadonlyArray<FormulaTestCase>;
  source: ReadonlyArray<FormulaSource>;
  note?: string;
  dependsOn?: ReadonlyArray<FormulaDependency>;
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
