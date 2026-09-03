import { describe, expect, it } from 'vitest';

import { SAMPLE_DATA, createStaticProvider, hasDraftData, hasDraftMarketSeries } from './provider';
import { SAMPLE_PRESETS, VN_INDEX_BARS } from './samples';
import { PRESET_CONTRACT_VERSION } from './types';

describe('bộ số liệu mẫu', () => {
  it('có đúng bốn mã của WF-10', () => {
    expect(SAMPLE_PRESETS.map((p) => p.code)).toEqual(['FPT', 'HPG', 'VNM', 'MWG']);
  });

  it('mã nào cũng ghi rõ nguồn theo khuôn "BCTC <kỳ> · 248 phiên giá"', () => {
    // Kỳ báo cáo (`BCTC Q2/2026`...) đọc từ LIVE_FUNDAMENTALS, đổi theo lần chạy
    // `gen:live-fundamentals` gần nhất — không ghim cứng một năm.
    for (const preset of SAMPLE_PRESETS) {
      expect(preset.meta).toContain(preset.fundamentals.period);
      expect(preset.meta).toContain('248 phiên giá');
    }
  });

  it('TẤT CẢ đều đánh dấu là bản thảo — chưa ai đối chiếu báo cáo thật (R-01)', () => {
    expect(SAMPLE_PRESETS.every((p) => p.isDraft)).toBe(true);
    expect(hasDraftData()).toBe(true);
  });

  it('đủ 248 phiên, đúng con số ghi trên dòng mô tả', () => {
    for (const preset of SAMPLE_PRESETS) {
      expect(preset.bars, preset.code).toHaveLength(248);
    }
  });

  it('chuỗi giá xác định — sinh lại vẫn ra y hệt (NFR-REL-03)', async () => {
    const again = await import('./samples');
    expect(again.SAMPLE_PRESETS[0]?.bars[0]?.close).toBe(SAMPLE_PRESETS[0]?.bars[0]?.close);
    expect(again.SAMPLE_PRESETS[0]?.bars[247]?.close).toBe(SAMPLE_PRESETS[0]?.bars[247]?.close);
  });

  it('mọi phiên đều có giá dương — không tạo ca vô lý cho công thức nào (FR-06)', () => {
    for (const preset of SAMPLE_PRESETS) {
      for (const bar of preset.bars) {
        expect(bar.close, `${preset.code} ${bar.date}`).toBeGreaterThan(0);
        expect(Number.isFinite(bar.close)).toBe(true);
      }
    }
  });

  it('giá cao nhất không thấp hơn giá thấp nhất', () => {
    for (const preset of SAMPLE_PRESETS) {
      for (const bar of preset.bars) {
        expect(bar.high ?? 0, `${preset.code} ${bar.date}`).toBeGreaterThanOrEqual(bar.low ?? 0);
      }
    }
  });

  it('ngày dạng ISO, cũ nhất đứng trước, không có thứ Bảy Chủ nhật', () => {
    const bars = SAMPLE_PRESETS[0]?.bars ?? [];

    for (const bar of bars) {
      expect(bar.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const weekday = new Date(`${bar.date}T00:00:00Z`).getUTCDay();
      expect(weekday, bar.date).not.toBe(0);
      expect(weekday, bar.date).not.toBe(6);
    }

    expect(bars[0]?.date.localeCompare(bars[bars.length - 1]?.date ?? '')).toBeLessThan(0);
    expect(bars[bars.length - 1]?.date).toBe('2025-12-31');
  });

  it('số liệu cơ bản đủ trường và hợp lý', () => {
    for (const preset of SAMPLE_PRESETS) {
      const f = preset.fundamentals;
      expect(f.eps, preset.code).toBeGreaterThan(0);
      expect(f.bookValuePerShare).toBeGreaterThan(0);
      expect(f.sharesOutstanding).toBeGreaterThan(0);
      expect(f.dividendPerShare).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('DataProvider', () => {
  it('liệt kê đủ bộ mẫu', () => {
    expect(SAMPLE_DATA.list()).toHaveLength(4);
  });

  it('tra theo mã, không phân biệt hoa thường và khoảng trắng thừa', () => {
    expect(SAMPLE_DATA.byCode('fpt')?.code).toBe('FPT');
    expect(SAMPLE_DATA.byCode('  HPG  ')?.code).toBe('HPG');
  });

  it('mã không có thì trả undefined chứ không ném lỗi', () => {
    expect(SAMPLE_DATA.byCode('KHONGCO')).toBeUndefined();
    expect(SAMPLE_DATA.byCode('')).toBeUndefined();
  });

  it('tìm theo mã', () => {
    expect(SAMPLE_DATA.search('vnm').map((p) => p.code)).toEqual(['VNM']);
  });

  it('tìm theo tên và bỏ dấu được — gõ "hoa phat" ra "Tập đoàn Hoà Phát" (NFR-USA-03)', () => {
    expect(SAMPLE_DATA.search('hoa phat').map((p) => p.code)).toEqual(['HPG']);
    expect(SAMPLE_DATA.search('Hoà Phát').map((p) => p.code)).toEqual(['HPG']);
  });

  it('chuỗi rỗng thì trả toàn bộ danh sách', () => {
    expect(SAMPLE_DATA.search('')).toHaveLength(4);
    expect(SAMPLE_DATA.search('   ')).toHaveLength(4);
  });

  it('không khớp gì thì trả mảng rỗng', () => {
    expect(SAMPLE_DATA.search('bitcoin')).toEqual([]);
  });

  it('dựng được provider từ bộ giả — để test không phụ thuộc số liệu mẫu thật', () => {
    const fake = createStaticProvider([
      { ...(SAMPLE_PRESETS[0] as NonNullable<(typeof SAMPLE_PRESETS)[number]>), code: 'XYZ' },
    ]);

    expect(fake.list()).toHaveLength(1);
    expect(fake.byCode('XYZ')?.code).toBe('XYZ');
  });
});

describe('hợp đồng dữ liệu mẫu có phiên bản (SW-05, LDR-05)', () => {
  const mau = SAMPLE_PRESETS[0] as NonNullable<(typeof SAMPLE_PRESETS)[number]>;

  it('bốn bộ số liệu đang dùng đều khai đúng phiên bản đang đọc', () => {
    for (const preset of SAMPLE_PRESETS) {
      expect(preset.version, preset.code).toBe(PRESET_CONTRACT_VERSION);
    }
  });

  /*
   * NÉM chứ không lặng lẽ bỏ bộ sai phiên bản: provider dựng ở phạm vi module nên lỗi lộ ra lúc
   * build và ở CI. Lọc im lặng thì triệu chứng duy nhất là sheet "Nạp mẫu" thiếu vài mã, không
   * ai lần ra vì sao.
   */
  it('bộ số liệu sai phiên bản làm hỏng lúc dựng, kèm câu nói rõ lệch ở đâu', () => {
    expect(() => createStaticProvider([{ ...mau, version: PRESET_CONTRACT_VERSION + 1 }])).toThrow(
      /sai phiên bản hợp đồng/,
    );
  });

  it('câu lỗi gọi tên mã và cả hai con số phiên bản', () => {
    let thongDiep = '';
    try {
      createStaticProvider([{ ...mau, code: 'XYZ', version: 99 }]);
    } catch (error) {
      thongDiep = error instanceof Error ? error.message : '';
    }

    expect(thongDiep).toContain('XYZ');
    expect(thongDiep).toContain('v99');
    expect(thongDiep).toContain(`v${String(PRESET_CONTRACT_VERSION)}`);
  });
});

describe('chuỗi VN-Index tự nói ra mình là số tự dựng (FR-06)', () => {
  /*
   * Cờ này là thứ duy nhất cho người dùng biết vế THỊ TRƯỜNG của phép hồi quy Beta là số bịa.
   * Chuỗi ấy luôn nằm sẵn trong `ctx.marketSeries` nên không có thao tác nào ("Nạp mẫu"…) để họ
   * nhận ra, khác hẳn bộ mẫu bốn mã.
   */
  it('bộ đang dùng trong sản phẩm khai là bản thảo, vì VN_INDEX_BARS còn là PRNG', () => {
    expect(SAMPLE_DATA.vnIndexIsDraft()).toBe(true);
    expect(hasDraftMarketSeries()).toBe(true);
  });

  it('nguồn thật thì tắt được cờ ở đúng một chỗ, không phải sửa giao diện', () => {
    const that = createStaticProvider(SAMPLE_PRESETS, VN_INDEX_BARS, false);

    expect(that.vnIndexIsDraft()).toBe(false);
    expect(hasDraftMarketSeries(that)).toBe(false);
  });
});
