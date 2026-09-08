/**
 * Tầng APPLICATION — mã nào trong 1.649 mã có số liệu cơ bản dùng được.
 *
 * ── Vì sao đứng riêng một file thay vì nằm trong barrel ─────────────────────────────────────
 *
 * Đây là **ranh giới nạp trễ**, cùng vai trò với `live-preset-loader.ts`: `TickerPickerSheet` chỉ
 * `await import()` file này khi sheet thật sự mở. Bảng mã là 5,3 kB thô / 3,3 kB gzip — không lớn,
 * nhưng nó phục vụ đúng một sheet mà phần lớn lượt mở trang không chạm tới.
 *
 * ⚠ Đừng re-export từ `src/application/index.ts`. Barrel đó được import TĨNH ở khắp nơi (kể cả
 * `PortfolioScreen`, vốn cũng import `TickerPickerSheet` tĩnh qua `@/ui/sheets`), nên một dòng
 * re-export sẽ kéo bảng mã về gói chung ngay lập tức — đúng thứ file này sinh ra để tránh. Cùng lý
 * do `draw-card` không nằm trong barrel `@/ui/sheets`.
 *
 * ── Vì sao KHÔNG hỏi API lúc chạy ───────────────────────────────────────────────────────────
 *
 * `POST /data/symbols` nặng ~6,6 kB mỗi mã, nên dò 60 dòng đang hiện là ~400 kB mỗi lần mở sheet —
 * để biết một thứ gần như không đổi giữa hai kỳ báo cáo. Sinh sẵn lúc build thì tốn 0 byte lúc
 * chạy. Cái giá là danh sách cũ đi; xem `stale` bên dưới.
 */

import {
  TICKERS_WITH_FUNDAMENTALS,
  TICKER_COVERAGE_FETCHED_AT,
} from '@/data/ticker-coverage.generated';

/** Bao lâu thì coi bảng mã là cũ. Một quý — đúng nhịp doanh nghiệp công bố báo cáo. */
const STALE_AFTER_DAYS = 100;

export interface TickerCoverage {
  /** Mã có số liệu cơ bản dùng được tại thời điểm sinh file. */
  codes: ReadonlySet<string>;
  /** Ngày ISO của lượt quét, để màn nói ra bảng này lấy lúc nào. */
  fetchedAt: string;
  /**
   * Bảng đã quá một kỳ báo cáo.
   *
   * Quan trọng vì luật ở đây là **đánh dấu, không ẩn**: một mã hôm nay thiếu quý liền nhau thì quý
   * sau công bố thêm là dùng được. Bảng cũ mà vẫn dán nhãn "không dùng được" thì màn đang nói sai
   * về một mã hoàn toàn hợp lệ — nên khi `stale`, nơi hiển thị phải hạ giọng câu chữ chứ không
   * khẳng định.
   */
  stale: boolean;
}

/**
 * Đọc bảng mã. Đồng bộ — dữ liệu nằm ngay trong module, phần "trễ" là ở lời `import()` của nơi gọi.
 *
 * @param asOf ngày ISO của màn, để tính `stale`. Domain và Application không được tự lấy đồng hồ
 * hệ thống (NFR-REL-03), nên nơi gọi truyền vào — cùng luật `pickPresetsFor()` đang chịu.
 */
export function tickerCoverage(asOf: string): TickerCoverage {
  const codes = new Set(
    TICKERS_WITH_FUNDAMENTALS.split(' ')
      .map((code) => code.trim().toUpperCase())
      .filter((code) => code !== ''),
  );

  return {
    codes,
    fetchedAt: TICKER_COVERAGE_FETCHED_AT,
    stale: daysBetween(TICKER_COVERAGE_FETCHED_AT, asOf) > STALE_AFTER_DAYS,
  };
}

/**
 * Số ngày giữa hai mốc ISO. Ngày hỏng thì trả 0 — coi như còn mới.
 *
 * Coi-như-mới là chiều an toàn: nó giữ nguyên nhãn "không dùng được" cho mã thật sự thiếu số liệu,
 * thay vì hạ giọng cả bảng chỉ vì một chuỗi ngày gõ sai.
 */
function daysBetween(from: string, to: string): number {
  const a = Date.parse(from);
  const b = Date.parse(to);
  if (Number.isNaN(a) || Number.isNaN(b)) return 0;
  return Math.abs(b - a) / 86_400_000;
}
