import { describe, expect, it } from 'vitest';

import type { CalcContext } from '../calc/types';
import type { SeriesRow } from '../price-series';
import {
  lastEma,
  lastSma,
  maxDrawdown,
  mean,
  requireBars,
  requireCloses,
  sampleStdDev,
  simpleReturns,
  usableCloses,
} from './series-utils';

const CTX_BASE: CalcContext = { asOf: '2026-08-04' };

function bar(close: number | null, patch: Partial<SeriesRow> = {}): SeriesRow {
  return { date: '01/01', open: null, high: null, low: null, close, volume: null, ...patch };
}

describe('usableCloses — rút chuỗi giá dùng được từ ctx', () => {
  it('ưu tiên ctx.series, lọc bỏ giá 0 và giá âm', () => {
    const ctx = { ...CTX_BASE, series: [10, 0, -5, 12] };
    expect(usableCloses(ctx)).toEqual([10, 12]);
  });

  it('không có series thì rút cột close từ bars, bỏ ô null', () => {
    const ctx = { ...CTX_BASE, bars: [bar(10), bar(null), bar(11)] };
    expect(usableCloses(ctx)).toEqual([10, 11]);
  });

  it('ctx trống trả mảng rỗng, không ném lỗi', () => {
    expect(usableCloses(CTX_BASE)).toEqual([]);
  });
});

describe('requireCloses / requireBars — cửa MISSING_SERIES (FR-06, FR-12)', () => {
  it('đủ phiên thì trả mảng giá', () => {
    const result = requireCloses({ ...CTX_BASE, series: [1, 2, 3] }, 3);
    expect(Array.isArray(result)).toBe(true);
  });

  it('thiếu phiên thì trả cảnh báo MISSING_SERIES nói rõ cần bao nhiêu, có bao nhiêu', () => {
    const result = requireCloses({ ...CTX_BASE, series: [1, 2] }, 60);
    expect(Array.isArray(result)).toBe(false);
    if (!Array.isArray(result)) {
      expect(result.code).toBe('MISSING_SERIES');
      expect(result.message.vi).toContain('60');
      expect(result.message.vi).toContain('2');
    }
  });

  it('requireBars chỉ đếm phiên CÓ giá đóng cửa', () => {
    const ctx = { ...CTX_BASE, bars: [bar(10), bar(null), bar(12)] };
    const result = requireBars(ctx, 3);
    expect(Array.isArray(result)).toBe(false);
  });
});

describe('simpleReturns', () => {
  it('N giá cho N−1 lợi suất, đúng công thức P_t/P_{t-1} − 1', () => {
    const returns = simpleReturns([100, 110, 99]);
    expect(returns).toHaveLength(2);
    expect(returns[0]).toBeCloseTo(0.1, 12);
    expect(returns[1]).toBeCloseTo(-0.1, 12);
  });

  it('một giá hoặc rỗng thì không có lợi suất nào', () => {
    expect(simpleReturns([100])).toEqual([]);
    expect(simpleReturns([])).toEqual([]);
  });
});

describe('mean / sampleStdDev', () => {
  it('trung bình cộng thường', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });

  it('độ lệch chuẩn MẪU chia n−1 — đối chiếu tay: [2,4,4,4,5,5,7,9] → ≈2,138', () => {
    expect(sampleStdDev([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(Math.sqrt(32 / 7), 10);
  });

  it('dưới hai phần tử trả NaN chứ không trả 0 — 0 là một khẳng định sai', () => {
    expect(Number.isNaN(sampleStdDev([5]))).toBe(true);
    expect(Number.isNaN(mean([]))).toBe(true);
  });
});

describe('maxDrawdown', () => {
  it('đỉnh 120 xuống đáy 90 là 25%', () => {
    expect(maxDrawdown([100, 120, 90, 110])).toBeCloseTo(0.25, 10);
  });

  it('chuỗi tăng đều trả 0 — không phải lỗi', () => {
    expect(maxDrawdown([1, 2, 3])).toBe(0);
  });
});

describe('lastSma / lastEma', () => {
  it('SMA của 3 phiên cuối', () => {
    expect(lastSma([1, 2, 3, 4, 5], 3)).toBe(4);
  });

  it('EMA mồi bằng SMA rồi cuộn tới cuối — đối chiếu tính tay từng bước', () => {
    // period 3, k = 0,5 · mồi SMA(1,2,3) = 2 · phiên 4: 4·0,5 + 2·0,5 = 3 · phiên 5: 5·0,5 + 3·0,5 = 4
    expect(lastEma([1, 2, 3, 4, 5], 3)).toBe(4);
  });

  it('thiếu phiên trả NaN để ok() đổi thành fail, không trả số bừa', () => {
    expect(Number.isNaN(lastSma([1, 2], 3))).toBe(true);
    expect(Number.isNaN(lastEma([1, 2], 3))).toBe(true);
  });
});
