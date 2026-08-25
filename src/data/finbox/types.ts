/**
 * Tầng DATA — hợp đồng cấp số liệu THỊ TRƯỜNG lúc chạy (gói "Danh mục dùng số liệu thật").
 *
 * ── Vì sao đây là cổng THỨ HAI, không phải `DataProvider` đổi sang bất đồng bộ ───────────────
 *
 * `DataProvider` (`../types.ts`) cấp `Preset`, mà một `Preset` bắt buộc có **chuỗi giá** và
 * **số liệu cơ bản** đầy đủ — nó mô tả "một bộ số liệu mẫu chọn được ở WF-10". Thứ cổng này cấp
 * lại là hai mảnh nhỏ và rời nhau: danh sách ~1.650 mã (chỉ mã + tên, không có gì khác) và ảnh
 * chụp một phiên của vài mã. Nhét chúng vào `Preset` thì mọi trường còn lại phải bịa ra.
 *
 * Nên `DataProvider` giữ nguyên đồng bộ như docblock của nó đã hứa, còn phần cần mạng nằm trọn
 * ở đây. Không màn nào phải chọn giữa hai cổng: màn nào cần bộ mẫu WF-10 thì gọi `SAMPLE_DATA`,
 * màn nào cần số thị trường thì gọi `MARKET_FEED`.
 *
 * ⚠ Cổng này ĐI RA NGOÀI MÁY NGƯỜI DÙNG. Trước gói này sản phẩm không gọi máy chủ nào, và
 * `public/_headers` khoá `connect-src 'self'` để bảo đảm điều đó. Nay CSP mở đúng một origin
 * `https://dcs.finbox.vn`. Thứ rời khỏi máy chỉ là MÃ cổ phiếu — số lượng nắm giữ và giá vốn
 * không bao giờ được đưa vào tham số của bất kỳ lời gọi nào ở đây.
 */

import type { Fundamentals } from '../types';

/** Một mã trong danh sách chọn: chỉ đủ để hiện và tìm. */
export interface TickerRef {
  /** Mã viết hoa, ví dụ 'FPT'. */
  code: string;
  /** Tên doanh nghiệp, ví dụ 'FPT Corp'. */
  name: string;
}

/**
 * Ảnh chụp một mã tại phiên gần nhất.
 *
 * `fundamentals` tách rời `priceVnd` có chủ đích: số liệu cơ bản phải qua được phép đối chiếu
 * P/E · P/B · TTM (xem `map.ts`) mới được dùng, còn thị giá thì không phụ thuộc phép nào cả.
 * Gộp hai thứ làm một thì một bản báo cáo lệch sẽ kéo theo mất luôn giá — mà giá mới là thứ
 * màn Danh mục cần.
 */
export interface TickerSnapshot {
  code: string;
  name: string;
  /** Thị giá phiên gần nhất, đơn vị **₫** (API trả nghìn ₫, đã nhân 1000). `null` khi thiếu. */
  priceVnd: number | null;
  /** Sàn niêm yết, ví dụ 'HOSE'. `null` khi API không trả. */
  floor: string | null;
  /** Ngành, ví dụ 'Bán lẻ'. `null` khi API không trả. */
  industry: string | null;
  /** `null` khi bản ghi không qua được đối chiếu — thị giá ở trên vẫn dùng được bình thường. */
  fundamentals: Fundamentals | null;
}

/** Vì sao một lời gọi hỏng. Màn hình đọc cái này để nói đúng nguyên nhân (FR-06, NFR-USA-04). */
export type FeedFailureKind =
  /** Không ra khỏi máy được: mất mạng, quá hạn chờ, hoặc CSP chặn. */
  | 'network'
  /** Máy chủ trả về mã lỗi. */
  | 'http'
  /** Gọi được, nhưng thân phản hồi không đúng hình dạng đã thoả thuận. */
  | 'malformed';

/**
 * Lỗi của cổng số liệu thị trường.
 *
 * Có kiểu riêng chứ không ném `Error` trần: màn Danh mục phải phân biệt "mất mạng, thử lại đi"
 * với "máy chủ đổi hình dạng dữ liệu, thử lại vô ích".
 */
export class MarketFeedError extends Error {
  readonly kind: FeedFailureKind;

  constructor(kind: FeedFailureKind, message: string) {
    super(message);
    this.name = 'MarketFeedError';
    this.kind = kind;
  }
}

/** Huỷ giữa chừng là bắt buộc: người dùng đóng sheet hay đổi danh mục thì lời gọi cũ vô nghĩa. */
export interface MarketFeed {
  /** Toàn bộ mã giao dịch được. Không gồm chỉ số (VNINDEX, HNX…) và tên ngành. */
  listTickers(signal?: AbortSignal): Promise<ReadonlyArray<TickerRef>>;

  /**
   * Ảnh chụp của một nhóm mã, **một lời gọi cho cả nhóm**.
   *
   * Mã không tra được thì vắng mặt trong Map chứ không có mục giá trị `null` — nơi gọi phân biệt
   * "không có mã này" bằng `Map.has()`, và `summarisePortfolio()` đã sẵn nhánh cho ca thiếu giá.
   */
  snapshots(
    codes: ReadonlyArray<string>,
    signal?: AbortSignal,
  ): Promise<ReadonlyMap<string, TickerSnapshot>>;
}
