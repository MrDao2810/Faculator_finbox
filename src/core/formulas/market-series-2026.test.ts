import { describe, it, expect } from 'vitest';
import {
  FPT_57_PHIEN,
  FPT_57_BARS,
  VNINDEX_71_PHIEN,
  FPT_2026,
  VNINDEX_2026,
} from './market-series-2026';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const WEEKEND_DAYS = new Set([0, 6]); // Chủ nhật = 0, Thứ bảy = 6

describe('FPT_57_BARS', () => {
  it('có đúng 57 nến', () => {
    expect(FPT_57_BARS).toHaveLength(57);
  });

  it('tất cả ngày viết theo ISO YYYY-MM-DD', () => {
    for (const row of FPT_57_BARS) {
      expect(row.date).toMatch(ISO_DATE);
    }
  });

  it('ngày tăng dần (phiên cũ trước)', () => {
    for (let i = 1; i < FPT_57_BARS.length; i++) {
      expect(FPT_57_BARS[i]!.date > FPT_57_BARS[i - 1]!.date).toBe(true);
    }
  });

  it('không có ngày thứ Bảy hoặc Chủ nhật', () => {
    for (const row of FPT_57_BARS) {
      const d = new Date(row.date);
      expect(WEEKEND_DAYS.has(d.getDay())).toBe(false);
    }
  });

  it('chuỗi giá đóng cửa trùng khớp FPT_57_PHIEN', () => {
    expect(FPT_57_BARS.map((r) => r.close)).toEqual([...FPT_57_PHIEN]);
  });
});

describe('FPT_57_PHIEN', () => {
  it('có đúng 57 giá', () => {
    expect(FPT_57_PHIEN).toHaveLength(57);
  });
});

describe('VNINDEX_71_PHIEN', () => {
  it('có đúng 71 điểm', () => {
    expect(VNINDEX_71_PHIEN).toHaveLength(71);
  });
});

describe('FPT_2026', () => {
  it('trỏ tới FPT_57_BARS', () => {
    expect(FPT_2026.rows).toBe(FPT_57_BARS);
  });

  it('có ticker FPT', () => {
    expect(FPT_2026.ticker).toBe('FPT');
  });
});

describe('VNINDEX_2026', () => {
  it('có đúng 71 hàng', () => {
    expect(VNINDEX_2026.rows).toHaveLength(71);
  });

  it('không có ticker', () => {
    expect(VNINDEX_2026.ticker).toBeUndefined();
  });

  it('57 ngày cuối trùng ngày FPT_57_BARS', () => {
    const vnRows = [...VNINDEX_2026.rows].slice(14);
    const fptDates = FPT_57_BARS.map((r) => r.date);
    expect(vnRows.map((r) => r.date)).toEqual(fptDates);
  });

  it('57 giá đóng cửa cuối trùng VNINDEX_71_PHIEN[14..70]', () => {
    const vnRows = [...VNINDEX_2026.rows].slice(14);
    expect(vnRows.map((r) => r.close)).toEqual([...VNINDEX_71_PHIEN].slice(14));
  });

  it('tất cả ngày viết theo ISO YYYY-MM-DD', () => {
    for (const row of VNINDEX_2026.rows) {
      expect(row.date).toMatch(ISO_DATE);
    }
  });

  it('ngày tăng dần', () => {
    const rows = VNINDEX_2026.rows;
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i]!.date > rows[i - 1]!.date).toBe(true);
    }
  });
});
