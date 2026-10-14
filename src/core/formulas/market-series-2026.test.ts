import { describe, it, expect } from 'vitest';

import type { SeriesRow } from '../price-series';
import {
  FPT_2026,
  FPT_BARS,
  FPT_PHIEN,
  STB_2026,
  STB_BARS,
  STB_PHIEN,
  VNINDEX_2026,
  VNINDEX_BARS,
  VNINDEX_PHIEN,
} from './market-series-2026';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKEND_DAYS = new Set([0, 6]); // Chủ nhật = 0, Thứ bảy = 6

/*
 * Hai chuỗi giá đóng cửa chủ dự án cung cấp ngày 16/09/2026 (bảng "Ví dụ thực tế cho 111 công
 * thức"), chép NGUYÊN ở đây làm mốc. Từ 14/10/2026 chuỗi trong `market-series-2026.ts` dài 250 phiên
 * và lấy từ VNDirect; điều phải ghim là phần nối thêm ở ĐẦU chuỗi, còn đuôi chuỗi vẫn đúng từng số
 * của bảng cũ. Lệch một phiên thì mọi ví dụ chỉ đọc N phiên cuối đổi số mà không ai biết vì sao.
 */
const FPT_57_CU: ReadonlyArray<number> = [
  70_800, 71_000, 70_800, 70_400, 70_200, 72_900, 72_500, 72_300, 73_000, 73_200, 72_100, 72_100,
  70_600, 70_500, 70_300, 66_800, 68_000, 67_000, 67_100, 64_800, 64_600, 64_700, 62_900, 62_200,
  63_000, 65_100, 67_000, 67_100, 71_700, 71_500, 70_300, 70_700, 70_800, 71_800, 71_200, 70_800,
  69_200, 68_300, 68_800, 69_000, 68_900, 69_800, 72_000, 71_400, 70_700, 72_600, 72_200, 73_200,
  72_200, 72_800, 72_400, 72_200, 72_400, 74_500, 72_700, 72_400, 72_700,
];

const VNINDEX_71_CU: ReadonlyArray<number> = [
  1831.55, 1838.9, 1790.53, 1793.05, 1803.71, 1798.61, 1791.65, 1799.31, 1807.94, 1806.2, 1830.47,
  1824.53, 1857.91, 1869.04, 1878.02, 1863.07, 1871.91, 1854.97, 1860.01, 1867.21, 1866.35, 1862.08,
  1843.5, 1848.25, 1853.7, 1840.7, 1828.34, 1800.54, 1806.63, 1782.12, 1804.24, 1787.45, 1743.51,
  1730.56, 1668.53, 1699.38, 1686.11, 1669.01, 1680.62, 1704.68, 1744.66, 1735.78, 1762.84, 1777.23,
  1776.46, 1764.78, 1768.06, 1776.77, 1773.41, 1793.18, 1765.63, 1729.08, 1727.46, 1732.02, 1726.69,
  1734.24, 1768.12, 1788.78, 1791.41, 1821.32, 1831.56, 1832.12, 1827.72, 1853.08, 1821.64, 1830.44,
  1827.12, 1829.23, 1795.21, 1788.23, 1811.15,
];

const BO: ReadonlyArray<readonly [string, ReadonlyArray<SeriesRow>, ReadonlyArray<number>]> = [
  ['FPT', FPT_BARS, FPT_PHIEN],
  ['VN-Index', VNINDEX_BARS, VNINDEX_PHIEN],
  ['STB', STB_BARS, STB_PHIEN],
];

describe.each(BO)('chuỗi %s', (_ten, bars, closes) => {
  it('có đúng 250 phiên, từ 12/09/2025 tới 15/09/2026', () => {
    expect(bars).toHaveLength(250);
    expect(bars[0]?.date).toBe('2025-09-12');
    expect(bars[bars.length - 1]?.date).toBe('2026-09-15');
  });

  it('ngày viết theo ISO, tăng dần, không rơi vào thứ Bảy hay Chủ nhật', () => {
    for (const [i, row] of bars.entries()) {
      expect(row.date).toMatch(ISO_DATE);
      expect(WEEKEND_DAYS.has(new Date(row.date).getDay()), row.date).toBe(false);
      if (i > 0) expect(row.date > (bars[i - 1]?.date ?? ''), row.date).toBe(true);
    }
  });

  it('giá đóng cửa của chuỗi là chính cột đóng cửa của bảng nến', () => {
    expect(bars.map((r) => r.close)).toEqual([...closes]);
  });

  it('không phiên nào còn cột trống, và mọi phiên thoả Thấp ≤ Mở, Đóng ≤ Cao', () => {
    for (const row of bars) {
      const { open, high, low, close } = row;
      if (open === null || high === null || low === null || close === null) {
        throw new Error(`${row.date} có cột trống`);
      }
      expect(low, row.date).toBeLessThanOrEqual(Math.min(open, close));
      expect(high, row.date).toBeGreaterThanOrEqual(Math.max(open, close));
    }
  });

  it('khối lượng là số nguyên dương ở mọi phiên', () => {
    for (const row of bars) {
      expect(Number.isInteger(row.volume), row.date).toBe(true);
      expect(row.volume ?? 0, row.date).toBeGreaterThan(0);
    }
  });
});

describe('ba chuỗi đi cùng nhịp', () => {
  // Beta hồi quy cổ phiếu theo chỉ số theo VỊ TRÍ phiên, nên ngày phải trùng từng phiên.
  it('cùng đúng 250 ngày giao dịch', () => {
    const ngay = FPT_BARS.map((r) => r.date);
    expect(VNINDEX_BARS.map((r) => r.date)).toEqual(ngay);
    expect(STB_BARS.map((r) => r.date)).toEqual(ngay);
  });
});

describe('đuôi chuỗi vẫn đúng bảng chủ dự án cung cấp 16/09/2026', () => {
  it('57 giá đóng cửa cuối của FPT', () => {
    expect(FPT_PHIEN.slice(-57)).toEqual([...FPT_57_CU]);
    expect(FPT_BARS[FPT_BARS.length - 57]?.date).toBe('2026-06-24');
  });

  it('71 giá đóng cửa cuối của VN-Index', () => {
    expect(VNINDEX_PHIEN.slice(-71)).toEqual([...VNINDEX_71_CU]);
    expect(VNINDEX_BARS[VNINDEX_BARS.length - 71]?.date).toBe('2026-06-04');
  });
});

describe('bộ dữ liệu cho nút ví dụ', () => {
  it('mỗi bộ trỏ thẳng tới bảng nến đủ OHLCV của nó', () => {
    expect(FPT_2026.rows).toBe(FPT_BARS);
    expect(VNINDEX_2026.rows).toBe(VNINDEX_BARS);
    expect(STB_2026.rows).toBe(STB_BARS);
  });

  it('cổ phiếu có mã, chỉ số thì không', () => {
    expect(FPT_2026.ticker).toBe('FPT');
    expect(STB_2026.ticker).toBe('STB');
    expect(VNINDEX_2026.ticker).toBeUndefined();
  });
});
