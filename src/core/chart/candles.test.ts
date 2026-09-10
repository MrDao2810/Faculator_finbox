import { describe, expect, it } from 'vitest';

import type { SeriesRow } from '../price-series';
import { CANDLE_RANGE_SESSIONS, buildCandleModel } from './candles';

/**
 * Mô hình biểu đồ nến của màn bảng chuỗi giá WF-05 — bản vẽ 10/09/2026.
 *
 * Ca quan trọng nhất ở đây là ca PHIÊN LỖI KHÔNG ĐƯỢC VẼ. Vẽ một phiên mà chính bảng đang báo là
 * mâu thuẫn (giá cao nhỏ hơn giá thấp) là mời người dùng tin vào một hình dựng từ số sai — đúng
 * loại im lặng FR-06 sinh ra để chặn. Và vì đã bỏ thì phải ĐẾM, để thẻ nói ra con số ấy.
 */

function bar(patch: Partial<SeriesRow> = {}): SeriesRow {
  return {
    date: '2025-01-02',
    open: 100,
    high: 105,
    low: 98,
    close: 103,
    volume: 1_000,
    ...patch,
  };
}

/** `n` phiên hợp lệ, ngày tăng dần, giá đóng cửa tăng dần — chuỗi cũ → mới. */
function chuoi(n: number): SeriesRow[] {
  return Array.from({ length: n }, (_, i) =>
    bar({
      date: `2025-01-${String(i + 1).padStart(2, '0')}`,
      open: 100 + i,
      high: 106 + i,
      low: 97 + i,
      close: 103 + i,
      volume: 1_000 + i,
    }),
  );
}

describe('buildCandleModel — chọn phiên vẽ được', () => {
  it('bảng rỗng cho mô hình rỗng, không ném lỗi', () => {
    const model = buildCandleModel([]);

    expect(model.bars).toEqual([]);
    expect(model.last).toBeNull();
    expect(model.changePct).toBeNull();
    expect(model.drawnCount).toBe(0);
  });

  it('phiên ĐANG LỖI thì không vẽ, và được đếm để thẻ nói ra', () => {
    const model = buildCandleModel([
      bar({ date: '2025-01-01' }),
      // Giá cao nhỏ hơn giá thấp — `checkSeries` bắt, nên cây nến của nó là một hình vô nghĩa.
      bar({ date: '2025-01-02', high: 90, low: 110 }),
      bar({ date: '2025-01-03' }),
    ]);

    expect(model.drawnCount).toBe(2);
    expect(model.skippedCount).toBe(1);
    expect(model.skippedIndices).toEqual([1]);
    expect(model.bars.map((b) => b.date)).toEqual(['2025-01-01', '2025-01-03']);
  });

  it('mọi phiên đều lỗi thì không vẽ gì, nhưng vẫn báo số phiên đã bỏ', () => {
    const model = buildCandleModel([bar({ close: null }), bar({ date: '' })]);

    expect(model.bars).toEqual([]);
    expect(model.skippedCount).toBe(2);
  });

  it('giữ vị trí trong bảng gốc, để nơi gọi nối ngược về đúng dòng', () => {
    const model = buildCandleModel([
      bar({ date: '2025-01-01', high: 90, low: 110 }),
      bar({ date: '2025-01-02' }),
    ]);

    expect(model.bars[0]?.index).toBe(1);
  });
});

describe('buildCandleModel — chiều của phiên', () => {
  it('so với giá MỞ khi có', () => {
    const model = buildCandleModel([
      bar({ date: '2025-01-01', open: 100, close: 103 }),
      bar({ date: '2025-01-02', open: 103, close: 99, low: 98, high: 104 }),
    ]);

    expect(model.bars.map((b) => b.up)).toEqual([true, false]);
  });

  it('thiếu giá mở thì so với giá ĐÓNG phiên trước — cách đọc duy nhất còn lại', () => {
    const model = buildCandleModel([
      bar({ date: '2025-01-01', open: null, high: null, low: null, close: 100 }),
      bar({ date: '2025-01-02', open: null, high: null, low: null, close: 90 }),
      bar({ date: '2025-01-03', open: null, high: null, low: null, close: 95 }),
    ]);

    // Phiên đầu không có gì để so — coi là tăng chứ không tô đỏ chỉ vì nó đứng đầu chuỗi.
    expect(model.bars.map((b) => b.up)).toEqual([true, false, true]);
  });
});

describe('buildCandleModel — trục giá và các con số ở đầu thẻ', () => {
  it('trục bọc trọn giá cao nhất và thấp nhất, không chỉ giá đóng cửa', () => {
    const model = buildCandleModel([bar({ date: '2025-01-01', low: 50, high: 200 })]);
    const [lo, hi] = model.priceAxis.domain;

    // Bấc nến vẽ tới hai mốc ấy; trục hẹp hơn là bấc chạy ra ngoài vùng vẽ.
    expect(lo).toBeLessThanOrEqual(50);
    expect(hi).toBeGreaterThanOrEqual(200);
  });

  it('phần trăm cả kỳ đo từ giá ĐÓNG phiên đầu tới giá đóng phiên cuối', () => {
    const model = buildCandleModel([
      bar({ date: '2025-01-01', open: 90, close: 100, low: 89, high: 101 }),
      bar({ date: '2025-01-02', open: 100, close: 110, low: 99, high: 111 }),
    ]);

    expect(model.last).toBe(110);
    expect(model.changePct).toBeCloseTo(10, 6);
    expect(model.firstDate).toBe('2025-01-01');
    expect(model.lastDate).toBe('2025-01-02');
  });

  it('một phiên thì chưa có gì để so — phần trăm là null, không phải 0', () => {
    // 0 đọc ra là "đi ngang", mà sự thật là "chưa đủ dữ liệu" — hai chuyện khác hẳn (FR-06).
    expect(buildCandleModel([bar()]).changePct).toBeNull();
  });

  it('đỉnh dải khối lượng bỏ qua ô chưa nhập', () => {
    const model = buildCandleModel([
      bar({ date: '2025-01-01', volume: null }),
      bar({ date: '2025-01-02', volume: 500 }),
    ]);

    expect(model.volumeMax).toBe(500);
  });

  it('không phiên nào có khối lượng thì đỉnh dải là 0 — nơi gọi phải ẩn dải', () => {
    expect(buildCandleModel([bar({ volume: null })]).volumeMax).toBe(0);
  });
});

describe('buildCandleModel — bốn khoảng của thanh chọn', () => {
  it('cắt đúng số phiên GẦN NHẤT, không phải số phiên đầu', () => {
    const rows = chuoi(100);
    const model = buildCandleModel(rows, '1m');

    expect(model.drawnCount).toBe(CANDLE_RANGE_SESSIONS['1m']);
    expect(model.lastDate).toBe(rows[rows.length - 1]?.date);
  });

  it('"Cả chuỗi" lấy hết', () => {
    expect(buildCandleModel(chuoi(100), 'all').drawnCount).toBe(100);
  });

  it('chuỗi ngắn hơn khoảng đã chọn thì lấy hết, không vỡ', () => {
    expect(buildCandleModel(chuoi(5), '6m').drawnCount).toBe(5);
  });

  /*
   * Cắt đoạn TRƯỚC khi lọc lỗi. Nếu lọc trước rồi mới cắt thì "21 phiên gần nhất" của một bảng có
   * phiên hỏng sẽ với ngược lên những phiên cũ hơn, tức đoạn đang xem lặng lẽ dài ra.
   */
  it('phiên lỗi nằm trong đoạn vẫn tính vào đoạn — nó bị bỏ, không bị thay bằng phiên cũ hơn', () => {
    const rows = chuoi(30);
    rows[29] = bar({ date: '2025-01-30', high: 1, low: 9 });

    const model = buildCandleModel(rows, '1m');

    expect(model.skippedCount).toBe(1);
    expect(model.drawnCount).toBe((CANDLE_RANGE_SESSIONS['1m'] ?? 0) - 1);
  });
});
