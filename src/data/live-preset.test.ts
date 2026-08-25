import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from '@/core/formulas';

import { LIVE_PRESET_FORMULAS, presetFromSnapshot } from './live-preset';
import { presetInputs } from './preset-inputs';
import type { TickerSnapshot } from './finbox/types';

const ASOF = '2026-08-24';

const SNAPSHOT: TickerSnapshot = {
  code: 'FPT',
  name: 'FPT Corp',
  priceVnd: 71_400,
  floor: 'HOSE',
  industry: 'Phần mềm & DV máy tính',
  fundamentals: {
    eps: 5867,
    bookValuePerShare: 23246,
    sharesOutstanding: 1714326422,
    dividendPerShare: 2000,
    netIncome: 9999.4,
    equity: 39851.2,
    period: 'BCTC Q2/2026',
  },
};

describe('dựng Preset từ ảnh chụp thị trường', () => {
  it('mang đúng mã, tên và số liệu cơ bản', () => {
    const preset = presetFromSnapshot(SNAPSHOT, ASOF);

    expect(preset?.code).toBe('FPT');
    expect(preset?.fundamentals.eps).toBe(5867);
    expect(preset?.meta).toContain('BCTC Q2/2026');
  });

  it('KHÔNG mang nhãn bản thảo — số ở đây là số thật', () => {
    // Ngược hẳn bốn preset của `samples.ts`, nơi chuỗi giá còn là PRNG bịa.
    expect(presetFromSnapshot(SNAPSHOT, ASOF)?.isDraft).toBe(false);
  });

  it('chuỗi giá chỉ có đúng một phiên, đúng thị giá đã chụp', () => {
    const bars = presetFromSnapshot(SNAPSHOT, ASOF)?.bars ?? [];

    expect(bars).toHaveLength(1);
    expect(bars[0]?.close).toBe(71_400);
    expect(bars[0]?.date).toBe(ASOF);
  });

  it('thiếu thị giá thì chuỗi rỗng chứ không dựng phiên giả', () => {
    expect(presetFromSnapshot({ ...SNAPSHOT, priceVnd: null }, ASOF)?.bars).toEqual([]);
  });

  it('không có số liệu cơ bản thì không dựng preset', () => {
    expect(presetFromSnapshot({ ...SNAPSHOT, fundamentals: null }, ASOF)).toBeUndefined();
  });

  it('chỉ điền chân giá hiện tại, bỏ trống chân giá vào', () => {
    const preset = presetFromSnapshot(SNAPSHOT, ASOF);
    const hpr = FORMULA_MODULES.find((m) => m.spec.id === 'hpr');
    if (preset === undefined || hpr === undefined) throw new Error('Thiếu dữ liệu cho ca kiểm.');

    const filled = presetInputs(preset, hpr.spec);
    expect(filled.endPrice).toBe(71_400);
    expect(filled.startPrice).toBeUndefined();
  });
});

describe('danh sách công thức ghim sẵn', () => {
  /*
   * Ca giữ cho `LIVE_PRESET_FORMULAS` không trôi khỏi Registry.
   *
   * `LIVE_PRESET_FORMULAS` là dữ liệu ghim vì tính nó lúc chạy sẽ kéo cả Registry vào gói của
   * trang `/danh-muc/` (đo ở màn khác: 131 kB → 217 kB, trong khi cửa kiểm là 180 kB). Cái giá
   * của việc ghim là nó có thể lệch — nên ca này tính lại từ Registry thật và so từng dòng.
   *
   * Đỏ ở đây nghĩa là: có công thức mới dùng `eps`/`price`/`equity`/… hoặc có công thức đổi số
   * biến. Chạy lại phép tính trong ca này rồi chép kết quả vào `live-preset.ts`.
   */
  const preset = presetFromSnapshot(SNAPSHOT, ASOF);
  /*
   * Bản KHÔNG có thị giá — dựng từ đúng `presetFromSnapshot` chứ không mô phỏng bằng tay, để
   * `priceFields` được đo bằng chính đường mà sản phẩm chạy. Đây là ca có thật: `finbox/map.ts`
   * đối chiếu `priceVnd` và `fundamentals` độc lập nhau, nên một mã có thể qua được phần số liệu
   * cơ bản mà vẫn không có giá.
   */
  const presetNoPrice = presetFromSnapshot({ ...SNAPSHOT, priceVnd: null }, ASOF);
  if (preset === undefined || presetNoPrice === undefined) {
    throw new Error('Không dựng được preset cho ca kiểm.');
  }

  const expected = FORMULA_MODULES.map((module) => {
    const filled = Object.keys(presetInputs(preset, module.spec)).length;
    return {
      id: module.spec.id,
      filled,
      total: module.spec.variables.length,
      priceFields: filled - Object.keys(presetInputs(presetNoPrice, module.spec)).length,
    };
  })
    .filter((row) => row.filled > 0)
    .sort((a, b) => b.filled / b.total - a.filled / a.total || a.id.localeCompare(b.id));

  it('khớp đúng Registry hiện tại, cả thứ tự lẫn số ô điền được', () => {
    expect(LIVE_PRESET_FORMULAS).toEqual(expected);
  });

  it('mọi id ghim đều có thật trong Registry', () => {
    const ids = new Set(FORMULA_MODULES.map((module) => module.spec.id));
    expect(LIVE_PRESET_FORMULAS.filter((row) => !ids.has(row.id))).toEqual([]);
  });

  it('không có dòng nào điền 0 ô — dòng như thế là rác trong danh sách chọn', () => {
    expect(LIVE_PRESET_FORMULAS.filter((row) => row.filled === 0)).toEqual([]);
    expect(LIVE_PRESET_FORMULAS.filter((row) => row.filled > row.total)).toEqual([]);
  });

  it('`priceFields` không bao giờ lớn hơn `filled`', () => {
    expect(LIVE_PRESET_FORMULAS.filter((row) => row.priceFields > row.filled)).toEqual([]);
  });

  /*
   * Ca này ghim ĐỘ LỚN của vấn đề, không chỉ ghim dữ liệu: nếu ai đó lỡ đặt `priceFields: 0` cho
   * cả 31 dòng thì ca "khớp Registry" ở trên đã đỏ, nhưng ca này nói rõ vì sao cột đó tồn tại —
   * một phần ba danh sách nói sai khi mã chưa có thị giá.
   */
  it('15 công thức phụ thuộc thị giá, 8 trong đó về 0 ô khi thiếu giá', () => {
    const phuThuoc = LIVE_PRESET_FORMULAS.filter((row) => row.priceFields > 0);
    const veKhong = LIVE_PRESET_FORMULAS.filter((row) => row.filled - row.priceFields === 0);

    expect(phuThuoc).toHaveLength(15);
    expect(veKhong).toHaveLength(8);
  });
});
