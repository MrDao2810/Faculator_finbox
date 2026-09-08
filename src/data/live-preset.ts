/**
 * Tầng DATA — đổi một ảnh chụp thị trường thành `Preset` để nạp vào ô nhập công thức.
 *
 * Đây là mảnh nối giữa hai cổng: `MarketFeed` cấp `TickerSnapshot` (mã bất kỳ trong 1.649 mã),
 * còn màn chi tiết công thức chỉ biết `Preset` và `presetInputs()`. Nhờ mảnh này, "nạp số liệu
 * của FPT vào ô của P/E" chạy y hệt nhau dù mã đến từ bộ mẫu WF-10 hay từ API.
 *
 * ⚠ File này KHÔNG được import Registry. `LIVE_PRESET_FORMULAS` dưới đây cố tình là dữ liệu
 * ghim sẵn chứ không phải phép tính chạy lúc chạy — xem docblock của nó.
 */

import type { TickerSnapshot } from './finbox/types';
import { PRESET_CONTRACT_VERSION } from './types';
import type { DailyBar, Preset } from './types';

/**
 * Dựng `Preset` từ ảnh chụp một mã.
 *
 * `undefined` khi số liệu cơ bản không qua được đối chiếu (`map.ts`) — không có gì để nạp thì
 * nói thẳng, đừng dựng một preset rỗng rồi để người dùng bấm "Nạp" mà không ô nào đổi.
 *
 * `isDraft: false` — khác hẳn bốn preset của `samples.ts`. Số ở đây đọc thẳng từ báo cáo thật
 * qua API, cả thị giá lẫn số liệu cơ bản, nên không có gì để cảnh báo là bản thảo.
 *
 * ── `history` là THAM SỐ TUỲ CHỌN, và đó là một quyết định chứ không phải tiện tay ──────────
 *
 * Không truyền thì `bars` có đúng MỘT phiên, y hệt trước đợt này. Đó là hợp đồng mà
 * `LIVE_PRESET_FORMULAS` được tính trên: bảng ấy hứa với tab Danh mục rằng "mã này điền được N ô",
 * và tab Danh mục KHÔNG gọi `priceHistory()` (một lời gọi cho mỗi mã trong danh mục thì quá đắt —
 * xem `MarketFeed.priceHistory`). Nếu chuỗi 10 phiên chảy vào bảng ghim thì bảng sẽ hứa thêm một
 * ô mà màn nhận về không chắc điền được — đúng loại "nói quá" mà cột `priceFields` đã sinh ra để
 * chặn một lần rồi.
 *
 * Truyền vào thì `bars` thành 10 phiên thật, và hai thứ đổi theo, cả hai đều đúng hơn:
 *
 *   · Biểu đồ chuyển sang trục thời gian — "P/E của HPG qua 10 phiên" bằng giá thật, thay cho
 *     đường quét giả định ±50%. Trước đợt này chỉ bộ mẫu BỊA (248 phiên PRNG) mới được vẽ đường
 *     ấy, còn mã thật thì không: hình vẽ giàu hơn cho số bịa, nghèo hơn cho số thật.
 *   · Chân "giá vào" được điền (`presetInputs()` chỉ bỏ trống nó khi chuỗi ngắn hơn hai phiên),
 *     và nó là giá đóng cửa THẬT của phiên cũ nhất trong mười phiên — không phải một phiên PRNG
 *     như chân giá vào của bộ mẫu bản thảo, nên KHÔNG mang cờ `synthetic`.
 */
export function presetFromSnapshot(
  snapshot: TickerSnapshot,
  asOf: string,
  history: ReadonlyArray<DailyBar> = [],
): Preset | undefined {
  const { fundamentals } = snapshot;
  if (fundamentals === null) return undefined;

  /*
   * Ngày của PHIÊN, không phải ngày mở máy. Mở app chiều thứ Bảy thì `asOf` là thứ Bảy trong khi
   * con số đang cầm là giá thứ Sáu — ghi ngày mở máy vào chuỗi giá là gán cho một phiên không hề
   * tồn tại. `asOf` chỉ còn là phương án dự phòng cho ca API không trả `date`.
   */
  const sessionDate = snapshot.asOfDate ?? asOf;

  const bars = buildBars(snapshot.priceVnd, sessionDate, history);

  return {
    version: PRESET_CONTRACT_VERSION,
    code: snapshot.code,
    name: snapshot.name,
    industry: snapshot.industry ?? undefined,
    // Cùng khuôn dòng mô tả nguồn của WF-10: kỳ báo cáo trước, phạm vi chuỗi giá sau.
    meta: `${fundamentals.period} · thị giá phiên gần nhất`,
    fundamentals,
    bars,
    isDraft: false,
    fundamentalsAsOf: sessionDate,
  };
}

/**
 * Chuỗi phiên của preset: mười phiên lịch sử, gộp với phiên mà thị giá đang thuộc về.
 *
 * Gộp theo NGÀY rồi sắp lại, chứ không nối vào cuối. Hai con số đến từ hai endpoint khác nhau
 * (`/data/symbols` cho `priceVnd`, `/v1/getTickerDetail` cho `history`), nên chúng có thể lệch
 * nhau một phiên theo cả hai chiều — endpoint nào cập nhật trước thì endpoint ấy mới hơn. Gộp
 * theo ngày là cách duy nhất đúng ở cả hai chiều mà không phải đoán bên nào đang chạy trước.
 *
 * Trùng ngày thì `priceVnd` thắng: nó là con số đang chạy trong ô nhập, và khối Kết quả tính trên
 * nó — để chuỗi mang một giá khác cho cùng phiên ấy là hình và số nói hai chuyện.
 */
function buildBars(
  priceVnd: number | null,
  sessionDate: string,
  history: ReadonlyArray<DailyBar>,
): DailyBar[] {
  const byDate = new Map(history.map((bar) => [bar.date, bar]));

  if (priceVnd !== null) {
    byDate.set(sessionDate, {
      date: sessionDate,
      open: null,
      high: null,
      low: null,
      close: priceVnd,
      volume: null,
    });
  }

  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
}

/** Một công thức mà số liệu của mã điền được, kèm mức độ điền. */
export interface LivePresetFormula {
  id: string;
  /** Số ô mà preset điền được, KHI mã có thị giá. */
  filled: number;
  /** Tổng số biến của công thức. */
  total: number;
  /**
   * Trong `filled`, bao nhiêu ô do THỊ GIÁ điền.
   *
   * Có cột này vì `priceVnd` có thể là `null` mà `fundamentals` vẫn hợp lệ — hai thứ được đối
   * chiếu độc lập trong `finbox/map.ts`, và mã không tra được giá vẫn nằm trong danh mục người
   * dùng. Khi đó `presetFromSnapshot()` cho `bars: []`, `presetInputs()` không điền `price`/
   * `endPrice`/`sellPrice`, và `filled` ở trên nói QUÁ.
   *
   * Đo được: 15 trên 31 công thức lệch, trong đó 8 công thức tụt hẳn về 0 ô. Nơi hiển thị phải
   * trừ cột này ra khi mã chưa có giá, nếu không màn hứa "2/2 ô điền sẵn" cho một trang mở ra sẽ
   * trống một nửa.
   */
  priceFields: number;
}

/**
 * 34 công thức mà một mã lấy từ API điền được ô, xếp theo tỷ lệ điền giảm dần.
 *
 * **14 trong số đó nạp TRỌN** — mở màn ra là có ngay kết quả tính trên số thật của mã, không phải
 * gõ ô nào: `bien-loi-nhuan-rong`, `bvps`, `no-tren-von-chu`, `pb`, `pe`, `ps`, `roa`, `roe`,
 * `so-graham`, `ty-le-chi-tra-co-tuc`, `ty-suat-co-tuc`, `ty-suat-loi-nhuan-tren-gia`,
 * `von-hoa-thi-truong`, `vong-quay-tong-tai-san`. Trước đợt mở rộng `Fundamentals` chỉ có 8.
 *
 * 20 dòng còn lại điền được một phần; màn chi tiết gọi tên những ô chưa phải số của mã thay vì để
 * chúng lẫn vào số mặc định.
 *
 * ── Vì sao GHIM SẴN thay vì tính lúc chạy ───────────────────────────────────────────────────
 *
 * Tính đúng danh sách này cần `spec.variables` của cả 111 công thức, tức phải import
 * `FORMULA_MODULES` — và kéo cả Registry (111 hàm tính, diễn giải, ví dụ, ca kiểm) vào gói của
 * trang `/danh-muc/`. `DataTableScreen.tsx` đã đo đúng cái giá đó ở màn khác: 131 kB → 217 kB.
 * Với cửa kiểm First Load JS 180 kB thì không có chỗ.
 *
 * Ghim được là vì danh sách này **giống nhau với mọi mã**: `presetInputs()` điền theo KHOÁ biến,
 * mà mọi ảnh chụp qua được `toFundamentals()` đều mang đúng một bộ khoá như nhau. Không có mã
 * nào điền được nhiều hay ít hơn mã khác.
 *
 * Chống trôi bằng `live-preset.test.ts`: nó tính lại danh sách từ Registry thật rồi so từng dòng.
 * Thêm một công thức mới có biến `eps`/`price`/… là test đỏ ngay, không âm thầm thiếu.
 *
 * Cùng cách nghĩ với việc `chart.test.ts` ghim danh sách id có `breakdown`, và với
 * `summaries.generated.ts` — chỉ mục nhẹ tách khỏi Registry nặng.
 */
export const LIVE_PRESET_FORMULAS: ReadonlyArray<LivePresetFormula> = [
  { id: 'bien-loi-nhuan-rong', filled: 2, total: 2, priceFields: 0 },
  { id: 'bvps', filled: 2, total: 2, priceFields: 0 },
  { id: 'no-tren-von-chu', filled: 2, total: 2, priceFields: 0 },
  { id: 'pb', filled: 2, total: 2, priceFields: 1 },
  { id: 'pe', filled: 2, total: 2, priceFields: 1 },
  { id: 'ps', filled: 2, total: 2, priceFields: 1 },
  { id: 'roa', filled: 2, total: 2, priceFields: 0 },
  { id: 'roe', filled: 2, total: 2, priceFields: 0 },
  { id: 'so-graham', filled: 2, total: 2, priceFields: 0 },
  { id: 'ty-le-chi-tra-co-tuc', filled: 2, total: 2, priceFields: 0 },
  { id: 'ty-suat-co-tuc', filled: 2, total: 2, priceFields: 1 },
  { id: 'ty-suat-loi-nhuan-tren-gia', filled: 2, total: 2, priceFields: 1 },
  { id: 'von-hoa-thi-truong', filled: 2, total: 2, priceFields: 1 },
  { id: 'vong-quay-tong-tai-san', filled: 2, total: 2, priceFields: 0 },
  { id: 'eps-co-ban', filled: 2, total: 3, priceFields: 0 },
  { id: 'hpr', filled: 2, total: 3, priceFields: 1 },
  { id: 'ncav-tren-co-phieu', filled: 2, total: 3, priceFields: 0 },
  { id: 'thue-tncn-dau-tu', filled: 2, total: 3, priceFields: 1 },
  { id: 'bien-an-toan', filled: 1, total: 2, priceFields: 1 },
  { id: 'bien-loi-nhuan-gop', filled: 1, total: 2, priceFields: 0 },
  { id: 'ev-sales', filled: 1, total: 2, priceFields: 0 },
  { id: 'gia-muc-tieu', filled: 1, total: 2, priceFields: 0 },
  { id: 'peg', filled: 1, total: 2, priceFields: 0 },
  { id: 'phi-giao-dich-ban', filled: 1, total: 2, priceFields: 1 },
  { id: 'thue-chuyen-nhuong', filled: 1, total: 2, priceFields: 1 },
  { id: 'thue-co-tuc', filled: 1, total: 2, priceFields: 0 },
  { id: 'ev', filled: 1, total: 3, priceFields: 0 },
  { id: 'loi-suat-quy-nam-theo-ngay', filled: 1, total: 3, priceFields: 1 },
  { id: 'mo-hinh-gordon', filled: 1, total: 3, priceFields: 0 },
  { id: 'loi-nhuan-rong', filled: 1, total: 4, priceFields: 1 },
  { id: 'roi-rong', filled: 1, total: 4, priceFields: 1 },
  { id: 'ddm-hai-giai-doan', filled: 1, total: 5, priceFields: 0 },
  { id: 'gia-tri-noi-tai-fcff', filled: 1, total: 5, priceFields: 0 },
  { id: 'wacc', filled: 1, total: 5, priceFields: 0 },
];
