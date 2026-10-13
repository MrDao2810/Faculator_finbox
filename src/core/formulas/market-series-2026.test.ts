import { describe, it, expect } from 'vitest';
import {
  FPT_57_PHIEN,
  FPT_57_BARS,
  VNINDEX_71_BARS,
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

/*
 * Bốn cột Mở · Cao · Thấp · Khối lượng của VN-Index thêm ngày 13/10/2026, sau khi chủ dự án báo
 * nạp ví dụ xong thì "một số cột không thấy số liệu trên table". Chúng đến từ một nguồn KHÁC với
 * chuỗi giá đóng cửa (VNDirect, còn chuỗi đóng cửa do chủ dự án cung cấp), nên điều phải ghim là
 * hai nguồn khớp nhau từng phiên: một dòng chép lệch ngày là giá đóng cửa rơi ra ngoài khoảng
 * Thấp–Cao của chính phiên đó, và ca dưới đây đỏ.
 */
describe('VNINDEX_71_BARS', () => {
  it('có đúng 71 nến, giá đóng cửa là chính VNINDEX_71_PHIEN', () => {
    expect(VNINDEX_71_BARS).toHaveLength(71);
    expect(VNINDEX_71_BARS.map((r) => r.close)).toEqual([...VNINDEX_71_PHIEN]);
  });

  it('không phiên nào còn cột trống', () => {
    for (const row of VNINDEX_71_BARS) {
      for (const value of [row.open, row.high, row.low, row.close, row.volume]) {
        expect(value, row.date).not.toBeNull();
      }
    }
  });

  it('mọi phiên thoả Thấp ≤ Mở ≤ Cao và Thấp ≤ Đóng ≤ Cao', () => {
    for (const row of VNINDEX_71_BARS) {
      const { open, high, low, close } = row;
      if (open === null || high === null || low === null || close === null) continue;
      expect(low, row.date).toBeLessThanOrEqual(Math.min(open, close));
      expect(high, row.date).toBeGreaterThanOrEqual(Math.max(open, close));
    }
  });

  it('khối lượng là số nguyên dương ở mọi phiên', () => {
    for (const row of VNINDEX_71_BARS) {
      expect(Number.isInteger(row.volume), row.date).toBe(true);
      expect(row.volume ?? 0, row.date).toBeGreaterThan(0);
    }
  });

  it('không có ngày thứ Bảy hoặc Chủ nhật', () => {
    for (const row of VNINDEX_71_BARS) {
      expect(WEEKEND_DAYS.has(new Date(row.date).getDay()), row.date).toBe(false);
    }
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

  it('trỏ tới VNINDEX_71_BARS — bộ đủ OHLCV, không phải bản chỉ có giá đóng cửa', () => {
    expect(VNINDEX_2026.rows).toBe(VNINDEX_71_BARS);
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
