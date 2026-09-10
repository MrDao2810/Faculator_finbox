/**
 * Tầng DOMAIN — mô hình biểu đồ NẾN cho màn bảng chuỗi giá WF-05.
 *
 * ── Vì sao đây là một loại riêng, không phải nhánh thứ tư của `ChartModel` ──────────────────────
 *
 * `ChartModel` phục vụ 111 trang công thức: nó nhận một `FormulaSpec`, một `CalcContext`, và trả
 * về đường quét độ nhạy hoặc hình bóc tách. Biểu đồ ở đây không có công thức nào — nó vẽ chính
 * BẢNG mà người dùng đang gõ, và nó cần ba thứ mà `ChartModel` không có chỗ để mang: bốn giá của
 * một phiên trong cùng một điểm, cột khối lượng ở dải dưới, và **danh sách phiên lỗi để bỏ qua**.
 *
 * Nhập nó vào `ChartModel` là buộc `ChartBody`, `ChartFrame`, `SweepPicker` và cả `chart.test.ts`
 * phải biết tới một hình mà 111 trang công thức không bao giờ vẽ. Nên nó đứng riêng, và đổi lại
 * nó dùng chung `niceAxis()`/`linearScale()` ở `scale.ts` — phần khó và đã có test.
 *
 * File này THUẦN: không React, không DOM, không đo đạc. Toạ độ x/y do component chiếu, đúng cách
 * `build.ts` chia việc với `LineChart`.
 */

import { checkSeries, type SeriesRow } from '../price-series';
import { niceAxis, type NiceAxis } from './scale';

/**
 * Bốn khoảng thời gian của thanh chọn — bản vẽ ghi "1T · 3T · 6T · Cả chuỗi".
 *
 * Đếm theo SỐ PHIÊN chứ không cắt theo ngày thật, và đó là chủ ý. Ô ngày nhận bất cứ thứ gì người
 * dùng gõ: bảng có thể toàn ngày thiếu năm ('15/07'), hoặc toàn số thứ tự phiên như chuỗi minh
 * hoạ của trang Beta. Cắt theo ngày thì những bảng ấy rơi vào nhánh "không tính được" và thanh
 * chọn thành ba nút chết. Đếm phiên thì luôn chạy, và với một chuỗi giao dịch thật thì hai cách
 * cho ra gần như cùng một đoạn.
 *
 * 21 · 63 · 126 là số phiên giao dịch của 1 · 3 · 6 tháng theo thông lệ (≈ 21 phiên một tháng,
 * ≈ 250 một năm — cùng con số mà `MAX_SERIES_ROWS` viện dẫn).
 */
export type CandleRange = '1m' | '3m' | '6m' | 'all';

export const CANDLE_RANGE_SESSIONS: Readonly<Record<CandleRange, number | null>> = {
  '1m': 21,
  '3m': 63,
  '6m': 126,
  all: null,
};

/** Một phiên VẼ ĐƯỢC. Giá đóng cửa là bắt buộc; ba giá còn lại có thể thiếu. */
export interface CandleBar {
  /** Vị trí của phiên này trong mảng `rows` gốc — để nơi gọi nối ngược về đúng dòng bảng. */
  index: number;
  date: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number;
  volume: number | null;
  /**
   * Phiên tăng hay giảm. So với giá MỞ khi có; thiếu giá mở thì so với giá đóng phiên trước —
   * đó là cách đọc duy nhất còn lại, và nó đúng với ý "phiên này đi lên hay đi xuống".
   * Phiên đầu tiên mà thiếu giá mở thì coi là tăng: không có gì để so, và tô đỏ một phiên chỉ vì
   * nó đứng đầu chuỗi là nói sai.
   */
  up: boolean;
}

export interface CandleModel {
  bars: ReadonlyArray<CandleBar>;
  /** Trục giá, đã nới ra bội của bước — dùng chung `niceAxis()` với biểu đồ công thức. */
  priceAxis: NiceAxis;
  /** Đỉnh dải khối lượng. `0` khi cả đoạn không có cột nào — nơi gọi phải ẩn dải. */
  volumeMax: number;
  /** Giá đóng cửa của phiên CUỐI đoạn đang xem. `null` khi không vẽ được phiên nào. */
  last: number | null;
  /** Phần trăm thay đổi từ phiên đầu tới phiên cuối của đoạn. `null` khi chưa đủ hai phiên. */
  changePct: number | null;
  /** Ngày của phiên đầu và phiên cuối trong đoạn — để đầu thẻ ghi "20/01/2025 → 31/12/2025". */
  firstDate: string;
  lastDate: string;
  /** Số phiên VẼ ĐƯỢC trong đoạn. */
  drawnCount: number;
  /**
   * Số phiên trong đoạn bị BỎ vì đang có lỗi. Bản vẽ dành hẳn một mục chú thích cho con số này
   * ("2 phiên lỗi — chưa vẽ, sửa ở bảng dưới"): hình vẽ thiếu phiên mà không nói ra là đúng loại
   * im lặng FR-06 sinh ra để chặn.
   */
  skippedCount: number;
  /** Vị trí (trong `rows` gốc) của những phiên bị bỏ, theo thứ tự bảng. */
  skippedIndices: ReadonlyArray<number>;
}

/** Mô hình rỗng — dùng cho bảng trống hoặc bảng chưa có phiên nào vẽ được. */
const RONG: CandleModel = {
  bars: [],
  priceAxis: niceAxis(0, 1),
  volumeMax: 0,
  last: null,
  changePct: null,
  firstDate: '',
  lastDate: '',
  drawnCount: 0,
  skippedCount: 0,
  skippedIndices: [],
};

/**
 * Dựng mô hình từ bảng.
 *
 * `rows` phải theo thứ tự THỜI GIAN (cũ → mới) — đúng thứ tự mà `sortRowsByDate()` giữ và
 * `closesOf()` đọc. Màn hình lật lại lúc bày ra, không lật ở đây.
 *
 * Phiên có lỗi bị BỎ chứ không vẽ: một phiên có giá cao nhỏ hơn giá thấp thì cây nến của nó là
 * một hình vô nghĩa, và vẽ nó ra là để người dùng tin vào thứ chính bảng đang báo là sai. Chúng
 * được đếm và trả về ở `skippedCount` để thẻ nói ra.
 *
 * Trục giá bọc CẢ giá cao nhất và thấp nhất của mọi phiên, không chỉ giá đóng cửa: bấc nến vẽ tới
 * hai mốc ấy, nên trục hẹp hơn là bấc chạy ra ngoài vùng vẽ.
 */
export function buildCandleModel(
  rows: ReadonlyArray<SeriesRow>,
  range: CandleRange = 'all',
): CandleModel {
  if (rows.length === 0) return RONG;

  const bad = new Set(checkSeries(rows).rows.map((row) => row.index));

  /* Cắt đoạn TRƯỚC khi lọc lỗi: "1 tháng gần nhất" là 21 phiên cuối của bảng, kể cả phiên hỏng. */
  const take = CANDLE_RANGE_SESSIONS[range];
  const from = take === null ? 0 : Math.max(0, rows.length - take);

  const bars: CandleBar[] = [];
  const skippedIndices: number[] = [];
  let truoc: number | null = null;

  for (let index = from; index < rows.length; index += 1) {
    const row = rows[index];
    if (row === undefined) continue;

    if (bad.has(index)) {
      skippedIndices.push(index);
      continue;
    }
    /* `checkSeries` đã bắt thiếu giá đóng, nên nhánh này chỉ là lưới an toàn cho kiểu. */
    if (row.close === null || !Number.isFinite(row.close)) continue;

    const moc = row.open ?? truoc;
    bars.push({
      index,
      date: row.date,
      open: row.open,
      high: row.high,
      low: row.low,
      close: row.close,
      volume: row.volume,
      up: moc === null ? true : row.close >= moc,
    });
    truoc = row.close;
  }

  if (bars.length === 0) {
    return { ...RONG, skippedCount: skippedIndices.length, skippedIndices };
  }

  let lo = Number.POSITIVE_INFINITY;
  let hi = Number.NEGATIVE_INFINITY;
  let volumeMax = 0;

  for (const bar of bars) {
    for (const value of [bar.open, bar.high, bar.low, bar.close]) {
      if (value === null || !Number.isFinite(value)) continue;
      if (value < lo) lo = value;
      if (value > hi) hi = value;
    }
    if (bar.volume !== null && Number.isFinite(bar.volume) && bar.volume > volumeMax) {
      volumeMax = bar.volume;
    }
  }

  const dau = bars[0];
  const cuoi = bars[bars.length - 1];
  /* Kiểu: `bars.length > 0` đã kiểm ở trên, hai nhánh này không bao giờ chạy. */
  if (dau === undefined || cuoi === undefined) return RONG;

  /*
   * Phần trăm cả kỳ đo từ giá ĐÓNG phiên đầu tới giá đóng phiên cuối. Không lấy giá mở của phiên
   * đầu: nó có thể trống, và một mốc lúc có lúc không thì hai lần mở cùng một bảng ra hai con số.
   */
  const changePct =
    bars.length >= 2 && dau.close !== 0 ? ((cuoi.close - dau.close) / dau.close) * 100 : null;

  return {
    bars,
    /* 5 vạch: đúng con số bản vẽ đếm được ở trục phải (74.400 · 70.900 · 67.400 · 63.800 · 60.300). */
    priceAxis: niceAxis(lo, hi, 5),
    volumeMax,
    last: cuoi.close,
    changePct,
    firstDate: dau.date,
    lastDate: cuoi.date,
    drawnCount: bars.length,
    skippedCount: skippedIndices.length,
    skippedIndices,
  };
}
