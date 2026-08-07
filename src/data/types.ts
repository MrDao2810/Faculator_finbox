/**
 * Tầng DATA — hợp đồng cấp số liệu (gói WBS 2.5.1).
 *
 * FR-17: "gắn được mã cổ phiếu và chỉ số VN-Index thật qua DataProvider; bản đầu dùng dữ liệu
 * mẫu, khi có nguồn thật chỉ thay cài đặt DataProvider." Nghĩa là giao diện chỉ được biết tới
 * `DataProvider`, không được biết số liệu đến từ file tĩnh hay từ API.
 *
 * Tầng này không được import React hay Next, và không được gọi lên tầng giao diện.
 */

/** Một phiên giá. Cùng hình dạng với `PriceBar` mà bộ dán Excel sinh ra, để hai nguồn thay nhau được. */
export interface DailyBar {
  /** Ngày dạng ISO 'YYYY-MM-DD'. */
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
}

/** Số liệu cơ bản lấy từ báo cáo tài chính, đơn vị ghi rõ ở từng trường. */
export interface Fundamentals {
  /** Lợi nhuận trên mỗi cổ phiếu, đơn vị ₫. */
  eps: number;
  /** Giá trị sổ sách trên mỗi cổ phiếu, đơn vị ₫. */
  bookValuePerShare: number;
  /** Số cổ phiếu đang lưu hành, đơn vị cổ phiếu. */
  sharesOutstanding: number;
  /** Cổ tức tiền mặt mỗi cổ phiếu trong năm, đơn vị ₫. */
  dividendPerShare: number;
  /** Kỳ báo cáo, ví dụ 'BCTC 2025'. */
  period: string;
}

/** Một bộ số liệu mẫu chọn được ở sheet WF-10. */
export interface Preset {
  /** Mã cổ phiếu, ví dụ 'FPT'. */
  code: string;
  /** Tên doanh nghiệp hiện dưới mã. */
  name: string;
  /** Dòng mô tả nguồn, đúng khuôn WF-10: 'BCTC 2025 · 248 phiên giá'. */
  meta: string;
  fundamentals: Fundamentals;
  /** Chuỗi giá theo phiên, cũ nhất trước. */
  bars: ReadonlyArray<DailyBar>;
  /**
   * Số liệu này có phải bản thảo tự dựng hay không.
   * `true` nghĩa là CHƯA đối chiếu báo cáo thật — giao diện phải nói rõ cho người dùng biết
   * (giả định A1, rủi ro R-01 của SRS vẫn còn mở).
   */
  isDraft: boolean;
}

/**
 * Cổng cấp số liệu. Bản đầu đọc file tĩnh; sau này thay bằng bản gọi API mà giao diện
 * không phải sửa gì (FR-17).
 *
 * Mọi hàm đều đồng bộ vì bản tĩnh không có gì để chờ; khi có nguồn thật thì đổi sang Promise
 * là một thay đổi phá vỡ có chủ đích, làm cùng lúc với gói lấy dữ liệu.
 */
export interface DataProvider {
  /** Toàn bộ mã có số liệu mẫu. */
  list(): ReadonlyArray<Preset>;
  /** Tra một mã. Không có thì trả undefined chứ không ném lỗi. */
  byCode(code: string): Preset | undefined;
  /** Tìm theo mã hoặc tên, bỏ dấu. Chuỗi rỗng thì trả về toàn bộ danh sách. */
  search(query: string): ReadonlyArray<Preset>;
}
