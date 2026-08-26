import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { BREAKDOWN_KEY } from './breakdown';
import { buildChartModel } from './build';
import { HISTORY_KEY, closePriceSeries, historyPlan } from './history';
import { areaPath, gapsOf, linePath } from './path';
import { nearestPointByX, pointerToViewBox } from './pointer';
import { seriesOf } from './series';
import { decimalsOf, extentOf, linearScale, niceAxis, niceStep } from './scale';
import { pickSweepVariable, sweepCandidates, sweepDomain, sweepPoints } from './sweep';
import { condensePoints } from './table';
import { PRIMARY_SERIES_KEY } from './types';
import type { ChartPoint } from './types';

/*
 * Cùng ctx với `formulas.test.ts`: có BIỂU PHÍ. Thiếu nó thì 3 công thức phí & thuế cùng 4 công
 * thức phái sinh không tra được hằng số nên mọi mức quét đều lỗi, và biểu đồ báo "chưa vẽ được"
 * vì lý do của môi trường test chứ không phải của sản phẩm — màn thật luôn truyền `schedule`.
 */
const CTX: CalcContext = { asOf: '2026-08-04', schedule: scheduleOrDefault(MARKET_CONFIG) };

function moduleOf(id: string) {
  const found = FORMULA_MODULES.find((m) => m.spec.id === id);
  if (found === undefined) throw new Error(`Registry thiếu công thức '${id}'.`);
  return found;
}

function point(x: number, y: number | null): ChartPoint {
  return { x, y, label: String(x), valueLabel: y === null ? '— , —' : String(y) };
}

/* ── scale.ts ────────────────────────────────────────────────────────────── */

describe('extentOf()', () => {
  it('bỏ qua null — điểm không tính được KHÔNG được kéo trục (FR-06)', () => {
    expect(extentOf([3, null, 7, null])).toEqual([3, 7]);
  });

  it('không có giá trị hữu hạn nào thì trả null, chứ không trả [0, 0]', () => {
    expect(extentOf([])).toBeNull();
    expect(extentOf([null, null])).toBeNull();
    expect(extentOf([Number.NaN, Number.POSITIVE_INFINITY])).toBeNull();
  });
});

describe('niceStep()', () => {
  it('luôn thuộc {1, 2, 5} × 10^k', () => {
    for (const rough of [0.0003, 0.017, 0.4, 1.1, 3, 7, 23, 460, 9_000, 1.3e9]) {
      const step = niceStep(rough);
      const normalised = step / 10 ** Math.round(Math.log10(step));
      expect([0.1, 0.2, 0.5, 1, 2, 5, 10], String(rough)).toContain(
        Number(normalised.toPrecision(3)),
      );
    }
  });

  it('đầu vào vô nghĩa thì trả 1 chứ không trả NaN', () => {
    expect(niceStep(0)).toBe(1);
    expect(niceStep(-5)).toBe(1);
    expect(niceStep(Number.NaN)).toBe(1);
  });
});

describe('decimalsOf()', () => {
  it('bước từ 1 trở lên không cần chữ số thập phân', () => {
    expect(decimalsOf(1)).toBe(0);
    expect(decimalsOf(20_000)).toBe(0);
  });

  it('bước nhỏ hơn 1 thì đủ chữ số để viết ra không mất thông tin', () => {
    expect(decimalsOf(0.5)).toBe(1);
    expect(decimalsOf(0.2)).toBe(1);
    expect(decimalsOf(0.05)).toBe(2);
    expect(decimalsOf(0.002)).toBe(3);
  });
});

describe('niceAxis() — bốn lưới an toàn', () => {
  const DOMAINS: ReadonlyArray<readonly [number, number]> = [
    [0, 1],
    [0, 100],
    [-3, 7],
    [0.0001, 0.0009],
    [1e9, 3e9],
    [55_200, 128_800],
    [0.667, 2],
    [-120, -30],
  ];

  it('giữ đủ tính chất trên mọi miền thường gặp', () => {
    for (const [lo, hi] of DOMAINS) {
      const axis = niceAxis(lo, hi);
      const label = `[${String(lo)}, ${String(hi)}]`;

      expect(Number.isFinite(axis.domain[0]), label).toBe(true);
      expect(Number.isFinite(axis.domain[1]), label).toBe(true);
      expect(axis.domain[0], label).toBeLessThan(axis.domain[1]);

      // Miền đã nới phải BỌC dữ liệu, không cắt mất đầu nào.
      expect(axis.domain[0], label).toBeLessThanOrEqual(lo);
      expect(axis.domain[1], label).toBeGreaterThanOrEqual(hi);

      expect(axis.ticks.length, label).toBeGreaterThanOrEqual(2);
      expect(axis.ticks.length, label).toBeLessThanOrEqual(12);

      for (const [index, tick] of axis.ticks.entries()) {
        expect(Number.isFinite(tick), `${label} vạch ${String(index)}`).toBe(true);
        expect(tick, label).toBeGreaterThanOrEqual(axis.domain[0]);
        expect(tick, label).toBeLessThanOrEqual(axis.domain[1]);
        if (index > 0) expect(tick, label).toBeGreaterThan(axis.ticks[index - 1] ?? 0);
      }
    }
  });

  it('chuỗi phẳng (lo === hi) vẫn cho miền rộng — không bao giờ chia cho 0 lúc chiếu', () => {
    const axis = niceAxis(15.21, 15.21);

    expect(axis.domain[0]).toBeLessThan(15.21);
    expect(axis.domain[1]).toBeGreaterThan(15.21);
    expect(axis.ticks.length).toBeGreaterThanOrEqual(2);
  });

  it('hi < lo thì hoán vị chứ không trả miền âm', () => {
    expect(niceAxis(9, 2).domain[0]).toBeLessThan(niceAxis(9, 2).domain[1]);
  });

  it('đầu vào không hữu hạn thì rơi về [0, 1] — KHÔNG để NaN chạy tiếp vào thuộc tính SVG', () => {
    for (const bad of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const axis = niceAxis(0, bad);
      expect(Number.isFinite(axis.domain[0])).toBe(true);
      expect(Number.isFinite(axis.domain[1])).toBe(true);
      expect(axis.ticks.every((tick) => Number.isFinite(tick))).toBe(true);
    }
  });
});

describe('linearScale()', () => {
  it('chiếu hai đầu miền vào hai đầu khung', () => {
    const scale = linearScale([0, 10], [0, 100]);

    expect(scale(0)).toBe(0);
    expect(scale(5)).toBe(50);
    expect(scale(10)).toBe(100);
  });

  it('trục Y lật chiều được — SVG có y đi xuống', () => {
    expect(linearScale([0, 10], [200, 0])(10)).toBe(0);
  });

  it('miền suy biến KHÔNG chia cho 0, trả mép khung', () => {
    expect(linearScale([5, 5], [0, 100])(5)).toBe(0);
    expect(Number.isFinite(linearScale([5, 5], [0, 100])(9))).toBe(true);
  });
});

/* ── path.ts ─────────────────────────────────────────────────────────────── */

describe('linePath()', () => {
  const sx = (v: number) => v * 10;
  const sy = (v: number) => 100 - v * 10;

  it('chuỗi liền cho đúng một đoạn', () => {
    expect(linePath([point(0, 0), point(1, 2), point(2, 4)], sx, sy)).toBe('M0,100 L10,80 L20,60');
  });

  it('điểm null NGẮT đường thành hai đoạn — không nối vắt qua, không vẽ y = 0 (FR-06)', () => {
    const d = linePath([point(0, 1), point(1, null), point(2, 3)], sx, sy);

    expect(d).toBe('M0,90 M20,70');
    expect(d.split('M')).toHaveLength(3);
  });

  it('toàn null thì trả chuỗi rỗng, nơi gọi bỏ hẳn thẻ path', () => {
    expect(linePath([point(0, null), point(1, null)], sx, sy)).toBe('');
  });

  it('một điểm thì có M mà không có L', () => {
    const d = linePath([point(0, 1)], sx, sy);

    expect(d).toContain('M');
    expect(d).not.toContain('L');
  });

  it('không bao giờ nhả NaN vào chuỗi d — Chrome bỏ qua cả path và biểu đồ biến mất im lặng', () => {
    const d = linePath([point(0, 1), point(Number.NaN, 2), point(2, 3)], sx, () => Number.NaN);

    expect(d).not.toContain('NaN');
  });
});

describe('areaPath()', () => {
  const sx = (v: number) => v * 10;
  const sy = (v: number) => 100 - v * 10;
  /** Đáy khung vẽ, không phải giá trị 0 của trục — xem docblock của hàm. */
  const DAY = 100;

  it('chuỗi liền cho một hình đóng kín, hai chân hạ xuống đáy', () => {
    const d = areaPath([point(0, 0), point(1, 2), point(2, 4)], sx, sy, DAY);

    expect(d).toBe('M0,100 L10,80 L20,60 L20,100 L0,100 Z');
  });

  /*
   * Đây là chỗ khác `linePath` nhiều nhất, và là chỗ dễ sai nhất: mỗi dải liền mạch phải TỰ đóng.
   * Nối chung một hình thì vùng tô vắt ngang qua đúng khoảng mà đường đã cố ý bỏ trống (FR-06).
   */
  it('điểm null cắt vùng tô thành hai hình đóng RIÊNG, không vắt qua chỗ hở', () => {
    const d = areaPath([point(0, 1), point(1, null), point(2, 3), point(3, 4)], sx, sy, DAY);

    expect(d).toBe('M0,90 L0,100 L0,100 Z M20,70 L30,60 L30,100 L20,100 Z');
    expect(d.split('Z')).toHaveLength(3);
  });

  it('toàn null thì trả chuỗi rỗng, nơi gọi bỏ hẳn thẻ path', () => {
    expect(areaPath([point(0, null), point(1, null)], sx, sy, DAY)).toBe('');
    expect(areaPath([], sx, sy, DAY)).toBe('');
  });

  it('đáy không hữu hạn thì không vẽ gì — thà thiếu vùng tô còn hơn tô sai chỗ', () => {
    expect(areaPath([point(0, 1), point(1, 2)], sx, sy, Number.NaN)).toBe('');
  });

  it('không bao giờ nhả NaN vào chuỗi d', () => {
    const d = areaPath([point(0, 1), point(Number.NaN, 2), point(2, 3)], sx, () => Number.NaN, DAY);

    expect(d).not.toContain('NaN');
  });
});

describe('gapsOf()', () => {
  it('gộp các mức không tính được liền nhau thành một khoảng', () => {
    const gaps = gapsOf([point(0, 1), point(1, null), point(2, null), point(3, 4)], (v) => v * 10);

    expect(gaps).toHaveLength(1);
    expect(gaps[0]).toEqual({ fromX: 0, toX: 30 });
  });

  it('không có mức nào lỗi thì không có khoảng nào', () => {
    expect(gapsOf([point(0, 1), point(1, 2)], (v) => v)).toHaveLength(0);
  });
});

describe('pointerToViewBox()', () => {
  it('khung khớp đúng tỉ lệ viewBox thì chỉ còn chia theo hệ số phóng', () => {
    // Khung 320×200 thật, viewBox 320×200 — hệ số phóng đúng bằng 1, không lệch offset nào.
    const rect = { left: 0, top: 0, width: 320, height: 200 };
    expect(pointerToViewBox(rect, 160, 100, 320, 200)).toEqual({ x: 160, y: 100 });
  });

  it('khung rộng hơn tỉ lệ viewBox — trừ đúng dải trắng hai bên trước khi chia', () => {
    // Khung 400×200 (tỉ lệ 2) rộng hơn viewBox 320×200 (tỉ lệ 1.6) — hệ số phóng theo chiều CAO
    // (200/200 = 1), dải trắng mỗi bên (400 - 320×1)/2 = 40px.
    const rect = { left: 0, top: 0, width: 400, height: 200 };
    expect(pointerToViewBox(rect, 40, 0, 320, 200)).toEqual({ x: 0, y: 0 });
    expect(pointerToViewBox(rect, 200, 100, 320, 200)).toEqual({ x: 160, y: 100 });
  });

  it('khung cao hơn tỉ lệ viewBox — trừ đúng dải trắng trên/dưới trước khi chia', () => {
    // Khung 320×400 (tỉ lệ 0.8) cao hơn viewBox 320×200 (tỉ lệ 1.6) — hệ số phóng theo chiều
    // RỘNG (320/320 = 1), dải trắng mỗi bên (400 - 200×1)/2 = 100px.
    const rect = { left: 0, top: 0, width: 320, height: 400 };
    expect(pointerToViewBox(rect, 0, 100, 320, 200)).toEqual({ x: 0, y: 0 });
  });

  it('trừ đúng left/top của khung trước khi quy đổi', () => {
    const rect = { left: 50, top: 20, width: 320, height: 200 };
    expect(pointerToViewBox(rect, 210, 120, 320, 200)).toEqual({ x: 160, y: 100 });
  });

  it('khung chưa có kích thước (chưa dựng xong hoặc display:none) trả về null', () => {
    expect(pointerToViewBox({ left: 0, top: 0, width: 0, height: 0 }, 0, 0, 320, 200)).toBeNull();
  });
});

describe('nearestPointByX()', () => {
  const sx = (v: number) => v * 10;

  it('chọn đúng điểm gần con trỏ nhất', () => {
    const points = [point(0, 0), point(1, 2), point(2, 4)];
    expect(nearestPointByX(points, 11, sx)).toEqual(point(1, 2));
  });

  it('đúng biên giữa hai điểm — nghiêng về điểm gặp trước (khoảng cách bằng nhau)', () => {
    const points = [point(0, 0), point(1, 2)];
    expect(nearestPointByX(points, 5, sx)).toEqual(point(0, 0));
  });

  it('mảng rỗng trả về undefined, không ném lỗi', () => {
    expect(nearestPointByX([], 0, sx)).toBeUndefined();
  });

  it('SNAP đúng điểm gần nhất kể cả khi điểm đó không tính được (y === null) — không bịa nội suy', () => {
    const points = [point(0, 1), point(1, null), point(2, 3)];
    expect(nearestPointByX(points, 10, sx)).toEqual(point(1, null));
  });
});

/* ── table.ts ────────────────────────────────────────────────────────────── */

describe('condensePoints()', () => {
  const many = Array.from({ length: 42 }, (_, i) => point(i, i));

  it('ít dòng hơn ngưỡng thì giữ nguyên, không chèn dòng ngắt', () => {
    expect(condensePoints([point(0, 0), point(1, 1)])).toHaveLength(2);
  });

  it('giữ BẮT BUỘC điểm đầu, điểm cuối và điểm đang nhập', () => {
    const withMark = many.map((p, i) => (i === 17 ? { ...p, marked: true } : p));
    const rows = condensePoints(withMark).filter((row) => row !== null);

    expect(rows[0]?.x).toBe(0);
    expect(rows[rows.length - 1]?.x).toBe(41);
    expect(rows.some((row) => row.marked === true)).toBe(true);
  });

  it('giữ MỌI mức không tính được — bảng rút gọn không được giấu chỗ FR-06 có gì để nói', () => {
    const withNulls = many.map((p, i) => (i === 5 || i === 6 || i === 30 ? point(i, null) : p));
    const rows = condensePoints(withNulls).filter((row) => row !== null);

    expect(rows.filter((row) => row.y === null)).toHaveLength(3);
  });

  it('chèn dòng ngắt ở chỗ nhảy số', () => {
    expect(condensePoints(many).some((row) => row === null)).toBe(true);
  });
});

/* ── sweep.ts ────────────────────────────────────────────────────────────── */

describe('sweepDomain()', () => {
  const price = {
    key: 'price',
    label: { vi: 'Giá', en: 'Price' },
    unit: '₫',
    type: 'number' as const,
    defaultValue: 92_000,
    min: 0,
    max: 10_000_000,
    level: 'basic' as const,
  };

  it('quét QUANH giá trị hiện tại, không quét cả [min, max]', () => {
    const domain = sweepDomain(price, 92_000);

    // max khai 10 triệu nhưng dải phải là ±50% quanh 92.000 — nếu không thì điểm hiện tại
    // nằm ở pixel đầu tiên bên trái và 40 điểm còn lại vô nghĩa.
    expect(domain).toEqual({ lo: 46_000, hi: 138_000, count: 41 });
  });

  it('kẹp vào miền hợp lệ đã khai', () => {
    expect(sweepDomain(price, 10_000_000)?.hi).toBe(10_000_000);
    expect(sweepDomain({ ...price, min: 80_000 }, 92_000)?.lo).toBe(80_000);
  });

  it('giá trị 0 thì lấy hai mươi bước sang mỗi bên', () => {
    const domain = sweepDomain({ ...price, type: 'slider', step: 0.5, min: -100, max: 100 }, 0);

    expect(domain).toEqual({ lo: -10, hi: 10, count: 41 });
  });

  it('bước thô hơn dải thì giảm số điểm, kẻo nhiều x trùng nhau', () => {
    const domain = sweepDomain(
      { ...price, type: 'slider', step: 1, min: 1, max: 30, defaultValue: 14 },
      14,
    );

    expect(domain?.count).toBeLessThan(41);
    expect(domain?.count).toBeGreaterThan(1);
  });

  it('bước thô thì hai đầu dải BÁM lưới bước — không còn "4,5 năm" trên trục số nguyên', () => {
    // Đúng ca đã gặp ngoài màn: biến years của DDM hai giai đoạn, bước 1, mặc định 5.
    // ±50% cho dải 2,5 → 7,5; bản cũ chia đều thành 2,5 · 3,5 · 4,5… trong khi hàm tính
    // Math.round về năm nguyên — sáu trên bảy điểm là bậc thang mang nhãn sai.
    const years = { ...price, type: 'slider' as const, step: 1, min: 1, max: 20, defaultValue: 5 };
    const domain = sweepDomain(years, 5);

    expect(domain).toEqual({ lo: 3, hi: 7, count: 5 });
  });

  it('bám bước giữ đúng gốc min như snapToStep — bước lẻ cũng không rác dấu phẩy động', () => {
    const rate = {
      ...price,
      type: 'slider' as const,
      step: 0.5,
      min: 0.25,
      max: 30,
      defaultValue: 3,
    };
    const domain = sweepDomain(rate, 3);

    // ±50% quanh 3 là 1,5 → 4,5; lưới bước tính từ min 0,25 là 0,25 · 0,75 · 1,25 · 1,75…
    // nên hai đầu bám vào 1,75 và 4,25 — không phải 1,5 và 4,5 của lưới tính từ 0.
    expect(domain).toEqual({ lo: 1.75, hi: 4.25, count: 6 });
  });

  it('dải hẹp hơn một bước thì giữ hành vi cũ thay vì trả null làm mất cả biểu đồ', () => {
    const coarse = {
      ...price,
      type: 'slider' as const,
      step: 10,
      min: 0,
      max: 100,
      defaultValue: 7,
    };
    const domain = sweepDomain(coarse, 7);

    // ±50% quanh 7 là 3,5 → 10,5 — chỉ chứa đúng một mốc lưới (10), không dựng dải bám bước được.
    expect(domain).not.toBeNull();
    expect(domain?.count).toBe(2);
  });

  it('miền suy biến thì trả null chứ không vẽ một cột đứng', () => {
    expect(sweepDomain({ ...price, min: 5, max: 5 }, 5)).toBeNull();
    expect(sweepDomain(price, Number.NaN)).not.toBeNull(); // rơi về defaultValue
  });
});

describe('sweepCandidates()', () => {
  it('loại biến rời rạc — danh sách chọn không quét thành đường được', () => {
    const loan = moduleOf('lich-tra-no');
    const keys = sweepCandidates(loan.spec, 'advanced').map((v) => v.key);
    const discrete = loan.spec.variables.filter((v) =>
      ['select', 'radio', 'toggle', 'buttonGroup'].includes(v.type),
    );

    expect(discrete.length).toBeGreaterThan(0);
    for (const variable of discrete) expect(keys).not.toContain(variable.key);
  });

  it('chế độ Cơ bản không đề nghị biến nâng cao — người dùng không thấy ô đó trên màn', () => {
    for (const formula of FORMULA_MODULES) {
      for (const variable of sweepCandidates(formula.spec, 'basic')) {
        expect(variable.level, `${formula.spec.id}/${variable.key}`).toBe('basic');
      }
    }
  });
});

describe('sweepPoints()', () => {
  const pe = moduleOf('pe');

  it('sinh đúng số điểm và đánh dấu ĐÚNG MỘT điểm là giá trị hiện tại', () => {
    const points = sweepPoints(pe, defaultInputs(pe.spec), CTX, 'price');

    expect(points).toHaveLength(41);
    expect(points.filter((p) => p.marked === true)).toHaveLength(1);
  });

  it('dấu "giá trị hiện tại" nằm ĐÚNG con số khối Kết quả đang hiện, không phải điểm gần nhất', () => {
    const inputs = { ...defaultInputs(pe.spec), price: 92_777 };
    const marked = sweepPoints(pe, inputs, CTX, 'price').find((p) => p.marked === true);
    const shown = runFormula(pe, inputs, CTX);

    expect(marked?.x).toBe(92_777);
    expect(marked?.y).toBe(shown.value);
  });

  /*
   * Ca vàng của cả nhánh biểu đồ: quét EPS đi qua 0.
   *
   * P/E chia cho EPS, nên giữa dải sẽ có mức chia cho 0 và cả một nửa dải EPS âm là vô nghĩa.
   * Đây là chỗ FR-06 dễ thủng nhất — một cái `?? 0` ở bất kỳ đâu trên đường vẽ là biểu đồ nói
   * "P/E bằng 0" ở chỗ đúng ra phải bỏ trống.
   */
  it('quét EPS qua 0: có mức null, TUYỆT ĐỐI không mức nào ra 0', () => {
    const points = sweepPoints(pe, { price: 92_000, eps: 0 }, CTX, 'eps');

    expect(points.length).toBeGreaterThan(0);
    expect(points.some((p) => p.y === null)).toBe(true);
    expect(points.filter((p) => p.y === 0)).toHaveLength(0);
    expect(points.every((p) => p.y === null || Number.isFinite(p.y))).toBe(true);

    const nulls = points.filter((p) => p.y === null);
    expect(nulls.every((p) => p.valueLabel.includes('— , —'))).toBe(true);
    expect(nulls.some((p) => p.reason === 'DIVIDE_BY_ZERO' || p.reason === 'MEANINGLESS')).toBe(
      true,
    );
  });

  it('gọi calc đúng một lần cho mỗi mức — đếm được thì không cần đo mili giây trên CI', () => {
    let calls = 0;
    const counted = {
      spec: pe.spec,
      calc: (...args: Parameters<typeof pe.calc>) => {
        calls += 1;
        return pe.calc(...args);
      },
    };

    sweepPoints(counted, defaultInputs(pe.spec), CTX, 'price');

    expect(calls).toBe(41);
  });
});

describe('pickSweepVariable()', () => {
  it('xác định: gọi hai lần cho cùng một biến', () => {
    for (const id of ['pe', 'roe', 'cagr', 'lai-kep']) {
      const formula = moduleOf(id);
      const first = pickSweepVariable(formula, CTX, 'basic');
      const second = pickSweepVariable(formula, CTX, 'basic');

      expect(first?.key, id).toBe(second?.key);
    }
  });

  /*
   * Bất biến quan trọng nhất của hàm này. Nếu xếp hạng theo giá trị người dùng đang gõ thì biến
   * được quét nhảy sang biến khác GIỮA LÚC kéo thanh trượt — trục X đổi tên, biểu đồ nhảy, không
   * ai đọc được. Chốt bằng `defaultInputs` nên nó là hàm thuần của spec.
   */
  it('KHÔNG đổi khi người dùng sửa ô nhập — trục X không được nhảy giữa lúc kéo', () => {
    const pe = moduleOf('pe');
    const before = pickSweepVariable(pe, CTX, 'basic');

    // Hàm không nhận inputs; ca này chốt lại đúng điều đó bằng chữ ký, và chốt kết quả ổn định.
    expect(pickSweepVariable(pe, CTX, 'basic')?.key).toBe(before?.key);
    expect(before?.key).toBe('price');
  });
});

/* ── build.ts — cổng duy nhất ─────────────────────────────────────────────── */

describe('buildChartModel()', () => {
  const pe = moduleOf('pe');

  function modelOf(id: string, level: 'basic' | 'advanced' = 'basic', ctx: CalcContext = CTX) {
    const formula = moduleOf(id);
    const inputs = defaultInputs(formula.spec);
    return buildChartModel({
      formula,
      inputs,
      ctx,
      output: runFormula(formula, inputs, ctx),
      level,
    });
  }

  it('P/E ra đường quét, tiêu đề đọc được thành câu', () => {
    const model = modelOf('pe');

    expect(model.kind).toBe('line');
    if (model.kind !== 'line') return;
    expect(model.title.vi).toBe('P/E theo Giá thị trường');
    expect(model.x.title.vi).toBe('Giá thị trường (₫)');
    expect(model.y.title.vi).toBe('P/E (lần)');
  });

  it('câu mô tả nói đủ dải, khoảng kết quả và giá trị hiện tại — đây là lối đọc của trình đọc màn hình', () => {
    const model = modelOf('pe');
    if (model.kind !== 'line') throw new Error('phải ra đường quét');

    expect(model.summary.vi).toContain('Quét Giá thị trường');
    expect(model.summary.vi).toContain('giá trị hiện tại');
    expect(model.summary.vi).toContain('Mọi mức đều tính được.');
  });

  it('công thức chờ chuỗi giá thì nói ĐÚNG câu khối kết quả đang nói, không vẽ khung rỗng', () => {
    const model = modelOf('ty-so-sharpe', 'advanced');

    expect(model.kind).toBe('unavailable');
    if (model.kind !== 'unavailable') return;
    expect(model.warning.code).toBe('MISSING_SERIES');
    expect(model.warning.fix).toBeDefined();
  });

  /*
   * Kết quả hiện tại đang lỗi KHÔNG phải lý do bỏ vẽ. Người dùng gõ EPS = 0 thì khối Kết quả báo
   * chia cho 0, nhưng đường quét vẫn cho thấy đúng chỗ công thức sụp — minh hoạ FR-06 rõ nhất
   * trên toàn ứng dụng.
   */
  it('kết quả hiện tại lỗi vẫn VẼ, và đường có chỗ ngắt kèm ghi chú nói rõ vì sao', () => {
    const inputs = { price: 92_000, eps: 0 };
    const model = buildChartModel({
      formula: pe,
      inputs,
      ctx: CTX,
      output: runFormula(pe, inputs, CTX),
      level: 'basic',
      sweepKey: 'eps',
    });

    expect(model.kind).toBe('line');
    if (model.kind !== 'line') return;
    expect(model.points.some((p) => p.y === null)).toBe(true);
    expect(model.note).toBeDefined();
    expect(model.note?.vi).toContain('không tính được');
    // `?.` thứ hai là hệ quả của việc `rows` nay là tuple mở (nhiều chuỗi): ô số có kiểu
    // `string | undefined`. Ý nghĩa của ca kiểm không đổi.
    expect(model.table.rows.some((row) => row?.[1]?.includes('— , —') === true)).toBe(true);
  });

  /*
   * NGÕ CỤT chủ dự án báo, nay chặn lại bằng ca kiểm.
   *
   * Đường quét theo số phiên vẽ CẢ vùng vượt quá chuỗi đang có (các điểm `y === null`, hiện thành
   * vệt gạch chéo). Nhả tay trong vùng ấy ghi ngược một N quá lớn vào ô Số liệu, nên kết quả rơi
   * vào `MISSING_SERIES`. Bản trước bỏ vẽ ngay lúc đó, mà ô chọn trục nằm TRONG khung biểu đồ —
   * mất hình là mất luôn mọi chỗ bấm, phải rời màn rồi vào lại mới chọn lại được.
   *
   * Điều kiện đủ để thoát ngõ cụt: hình vẫn còn, tức phải có ít nhất một mức N vẫn ra số thật để
   * người dùng bấm sang. Đó chính là hai `expect` cuối.
   */
  it('chuỗi đã nạp nhưng hụt so với N đang chọn: VẪN vẽ, để bấm lại được ngay tại chỗ', () => {
    const sma = moduleOf('sma-n-phien');
    const ctx: CalcContext = { ...CTX, series: Array.from({ length: 61 }, (_, i) => 20_000 + i) };
    const inputs = { period: 75 };
    const output = runFormula(sma, inputs, ctx);

    // Tiền đề của ca kiểm: đây đúng là trạng thái ngay sau cú bấm hụt, không phải ca dựng khống.
    expect(output.warning?.code).toBe('MISSING_SERIES');

    const model = buildChartModel({
      formula: sma,
      inputs,
      ctx,
      output,
      level: 'basic',
      sweepKey: 'period',
    });

    expect(model.kind).toBe('line');
    if (model.kind !== 'line') return;
    expect(model.points.some((p) => p.y === null)).toBe(true);
    expect(model.points.some((p) => p.y !== null)).toBe(true);
  });

  /*
   * ── Mốc tham chiếu ─────────────────────────────────────────────────────────
   *
   * Hợp đồng gồm bốn vế, và vế khó nhất là vế thứ ba:
   *   1. Công thức KHÔNG khai thì mô hình không mọc thêm trường nào.
   *   2. Khai và mốc lọt khung thì mốc có mặt, kèm câu mô tả bằng chữ.
   *   3. Mốc ngoài miền Y bị BỎ, và trục KHÔNG giãn ra ôm lấy nó.
   *   4. Không mốc nào lọt thì trường vắng mặt hẳn, không phải mảng rỗng.
   */
  describe('mốc tham chiếu trên trục kết quả', () => {
    /** Chuỗi giá đủ dao động để RSI chạy rộng qua cả 30 lẫn 70 — dựng bằng công thức, không chép. */
    const GIA_DAO_DONG = Array.from(
      { length: 120 },
      (_, i) => 20_000 + Math.round(2_600 * Math.sin(i / 5)),
    );
    /* Có `bars` mới mở được trục thời gian — `canDrawHistory()` đòi đúng nó, không phải `series`. */
    const CTX_RSI: CalcContext = {
      ...CTX,
      series: GIA_DAO_DONG,
      bars: GIA_DAO_DONG.map((close, i) => ({
        date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
        open: close,
        high: close,
        low: close,
        close,
        volume: 1_000,
      })),
    };

    /** Bản sao RSI với danh sách mốc thay bằng bộ khác — để chọc đúng phần lọc. */
    function rsiVoiMoc(lines: ReadonlyArray<{ value: number; label: { vi: string; en: string } }>) {
      const goc = moduleOf('rsi-wilder');
      return { ...goc, spec: { ...goc.spec, referenceLines: lines } };
    }

    function veRsi(
      formula = moduleOf('rsi-wilder'),
      sweepKey?: string,
      ctx: CalcContext = CTX_RSI,
    ) {
      const inputs = defaultInputs(formula.spec);
      return buildChartModel({
        formula,
        inputs,
        ctx,
        output: runFormula(formula, inputs, ctx),
        level: 'basic',
        ...(sweepKey === undefined ? {} : { sweepKey }),
      });
    }

    it('RSI khai đúng hai ngưỡng Wilder, đúng thang điểm gốc của kết quả', () => {
      expect(moduleOf('rsi-wilder').spec.referenceLines).toEqual([
        { value: 30, label: { vi: 'Quá bán', en: 'Oversold' } },
        { value: 70, label: { vi: 'Quá mua', en: 'Overbought' } },
      ]);
    });

    it('trục thời gian: RSI chạy rộng nên cả hai ngưỡng đều có mặt', () => {
      const model = veRsi(moduleOf('rsi-wilder'), HISTORY_KEY);
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      // Tiền đề: miền Y của chuỗi này thật sự chứa cả hai ngưỡng, không phải ca dựng khống.
      expect(model.y.domain[0]).toBeLessThanOrEqual(30);
      expect(model.y.domain[1]).toBeGreaterThanOrEqual(70);

      expect(model.referenceLines?.map((line) => line.value)).toEqual([30, 70]);
    });

    /*
     * Đúng ca chủ dự án nêu để nghiệm thu, chạy trên dữ liệu THẬT chứ không phải mốc dựng khống:
     * đổi "Xem kết quả đổi theo" sang "Số phiên" thì trục Y thu về một dải hẹp quanh giá trị hiện
     * tại, và ngưỡng nào rơi ra ngoài dải ấy phải tự biến mất.
     */
    it('đổi sang trục Số phiên: trục Y hẹp lại, ngưỡng ngoài dải tự ẩn', () => {
      const model = veRsi(moduleOf('rsi-wilder'), 'period');
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      // Tiền đề: dải này thật sự hẹp hơn và không còn với tới 70.
      expect(model.y.domain[1]).toBeLessThan(70);

      const con = model.referenceLines?.map((line) => line.value) ?? [];
      expect(con).not.toContain(70);
      // 30 vẫn lọt dải nên vẫn phải vẽ — ẩn hết cả hai là ẩn quá tay.
      expect(con).toEqual([30]);
    });

    /*
     * Vế quan trọng nhất: mốc ngoài khung BỊ BỎ, và trục giữ nguyên miền của dữ liệu.
     *
     * `expect` thứ hai mới là ca kiểm thật — bỏ mốc đi thì dễ, cái dễ hỏng là ai đó "sửa cho tiện"
     * bằng cách nới `y.domain` ra tới mốc. Lúc đó `referenceLines` vẫn đủ, ca một vẫn xanh, nhưng
     * đường dữ liệu bị dẹt xuống còn một vạch — đúng thứ hỏng mà không ai nhìn thấy trong test.
     */
    it('mốc ngoài miền Y bị bỏ, và trục KHÔNG giãn ra ôm lấy nó', () => {
      const khongMoc = veRsi();
      if (khongMoc.kind !== 'line') throw new Error('RSI phải ra đường quét');

      const model = veRsi(
        rsiVoiMoc([{ value: 100_000, label: { vi: 'Ngoài khung', en: 'Off chart' } }]),
      );
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      expect(model.referenceLines).toBeUndefined();
      expect(model.y.domain).toEqual(khongMoc.y.domain);
    });

    it('mốc trong và ngoài lẫn lộn thì chỉ giữ phần lọt khung', () => {
      const model = veRsi(
        rsiVoiMoc([
          { value: 30, label: { vi: 'Quá bán', en: 'Oversold' } },
          { value: 5_000, label: { vi: 'Ngoài khung', en: 'Off chart' } },
        ]),
      );
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      expect(model.referenceLines?.map((line) => line.value)).toEqual([30]);
    });

    it('giá trị vô nghĩa không bao giờ lọt xuống renderer — FR-06', () => {
      const model = veRsi(
        rsiVoiMoc([
          { value: Number.NaN, label: { vi: 'Rác', en: 'Junk' } },
          { value: Number.POSITIVE_INFINITY, label: { vi: 'Rác', en: 'Junk' } },
        ]),
      );
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      expect(model.referenceLines).toBeUndefined();
    });

    /*
     * `<svg>` mang `aria-hidden`, nên hai đường kẻ không tồn tại với trình đọc màn hình. Câu mô tả
     * là chỗ duy nhất họ đọc được, và nó cũng là thứ đi vào bản in PDF lẫn tấm PNG.
     */
    it('câu mô tả gọi tên từng mốc kèm trị số, ở cả hai ngôn ngữ', () => {
      const model = veRsi(moduleOf('rsi-wilder'), HISTORY_KEY);
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      expect(model.summary.vi).toContain('Mốc tham chiếu: Quá bán 30');
      expect(model.summary.vi).toContain('Quá mua 70');
      expect(model.summary.en).toContain('Reference levels: Oversold 30');
      expect(model.summary.en).toContain('Overbought 70');
    });

    it('không mốc nào lọt thì câu mô tả cũng không nhắc tới mốc', () => {
      const model = veRsi(
        rsiVoiMoc([{ value: 100_000, label: { vi: 'Ngoài khung', en: 'Off chart' } }]),
      );
      if (model.kind !== 'line') throw new Error('RSI phải ra đường quét');

      expect(model.summary.vi).not.toContain('Mốc tham chiếu');
      expect(model.summary.en).not.toContain('Reference levels');
    });

    /*
     * Bất biến của cả Registry, không riêng RSI: mô hình không bao giờ nhả ra một mốc nằm ngoài
     * miền Y của chính nó. Quét mọi công thức, mọi trục X chọn được — đây là ca duy nhất phủ được
     * đường "đổi trục làm trục Y hẹp lại", vì trục nào hẹp tới đâu là chuyện của dữ liệu.
     */
    it('không công thức nào, không trục nào, nhả ra mốc nằm ngoài miền Y', () => {
      for (const formula of FORMULA_MODULES) {
        if (formula.spec.referenceLines === undefined) continue;

        const inputs = defaultInputs(formula.spec);
        const base = { formula, inputs, ctx: CTX_RSI, level: 'basic' as const };
        const output = runFormula(formula, inputs, CTX_RSI);
        const truc = buildChartModel({ ...base, output });
        const keys = truc.kind === 'unavailable' ? [] : truc.options.map((o) => o.key);

        for (const key of keys) {
          const model = buildChartModel({ ...base, output, sweepKey: key });
          if (model.kind !== 'line') continue;

          for (const line of model.referenceLines ?? []) {
            expect(line.value, `${formula.spec.id} · ${key}`).toBeGreaterThanOrEqual(
              model.y.domain[0],
            );
            expect(line.value, `${formula.spec.id} · ${key}`).toBeLessThanOrEqual(
              model.y.domain[1],
            );
          }
        }
      }
    });

    it('công thức không khai mốc thì mô hình không mọc thêm trường nào', () => {
      const model = modelOf('pe');
      if (model.kind !== 'line') throw new Error('P/E phải ra đường quét');

      expect('referenceLines' in model).toBe(false);
    });

    /* Nhãn rỗng đọc ra là một đường kẻ không ai giải thích — bắt ngay lúc khai, không đợi lên màn. */
    it('mọi mốc đã khai đều có nhãn ở cả hai ngôn ngữ', () => {
      for (const formula of FORMULA_MODULES) {
        for (const line of formula.spec.referenceLines ?? []) {
          expect(Number.isFinite(line.value), formula.spec.id).toBe(true);
          expect(line.label.vi.trim(), formula.spec.id).not.toBe('');
          expect(line.label.en.trim(), formula.spec.id).not.toBe('');
        }
      }
    });
  });

  /*
   * ── Chuỗi phụ ──────────────────────────────────────────────────────────────
   *
   * Bước mở đường cho SMA / Bollinger / MACD. Chưa công thức nào truyền chuỗi phụ, nên ca kiểm tự
   * dựng lấy — và đó cũng là chỗ duy nhất chứng minh phần LỌC chạy đúng.
   */
  describe('chuỗi phụ vẽ chồng', () => {
    const pe = moduleOf('pe');

    function veVoiOverlay(overlays: Parameters<typeof buildChartModel>[0]['overlays']) {
      const inputs = defaultInputs(pe.spec);
      return buildChartModel({
        formula: pe,
        inputs,
        ctx: CTX,
        output: runFormula(pe, inputs, CTX),
        level: 'basic',
        sweepKey: 'price',
        ...(overlays === undefined ? {} : { overlays }),
      });
    }

    /** Chuỗi phụ ăn theo đúng lưới x của chuỗi chính — điều kiện để nó được nhận. */
    function bam(goc: ReadonlyArray<ChartPoint>, heSo: number): ReadonlyArray<ChartPoint> {
      return goc.map((p) => ({
        x: p.x,
        y: p.y === null ? null : p.y * heSo,
        label: p.label,
        valueLabel: `${String(p.y === null ? 0 : p.y * heSo)}`,
      }));
    }

    it('không truyền gì thì mô hình KHÔNG mọc thêm trường nào', () => {
      const model = veVoiOverlay(undefined);
      if (model.kind !== 'line') throw new Error('phải ra đường quét');

      expect('overlays' in model).toBe(false);
      expect('yRight' in model).toBe(false);
      expect(model.table.columns).toHaveLength(2);
    });

    it('chuỗi cùng lưới x thì được nhận, và thêm đúng một cột vào bảng', () => {
      const goc = veVoiOverlay(undefined);
      if (goc.kind !== 'line') throw new Error('phải ra đường quét');

      const model = veVoiOverlay([
        {
          key: 'gap-doi',
          label: { vi: 'Gấp đôi', en: 'Doubled' },
          points: bam(goc.points, 2),
          tone: 'teal',
        },
      ]);
      if (model.kind !== 'line') throw new Error('phải ra đường quét');

      expect(model.overlays).toHaveLength(1);
      expect(model.table.columns).toHaveLength(3);
      expect(model.table.columns[2]?.vi).toBe('Gấp đôi');
      // Số ô mỗi dòng khớp số cột — dòng ngắt "…" thì không có ô nào.
      for (const row of model.table.rows) {
        if (row !== null) expect(row).toHaveLength(3);
      }
    });

    /*
     * Vế QUAN TRỌNG NHẤT của phần lọc. Bảng số rút gọn theo chuỗi chính rồi lấy giá trị chuỗi phụ
     * theo cùng CHỈ SỐ, nên một chuỗi lệch lưới sẽ ghép cột sai hàng — mà trên hình thì vẫn "có vẻ
     * được". Thà bỏ hẳn còn hơn vẽ ra một đường nói sai (cùng lẽ với FR-06).
     */
    it('chuỗi lệch lưới x bị LOẠI, không vẽ lệch nửa bước', () => {
      const goc = veVoiOverlay(undefined);
      if (goc.kind !== 'line') throw new Error('phải ra đường quét');

      const thieuMotDiem = veVoiOverlay([
        {
          key: 'hut',
          label: { vi: 'Hụt', en: 'Short' },
          points: bam(goc.points, 2).slice(0, -1),
          tone: 'teal',
        },
      ]);
      const lechX = veVoiOverlay([
        {
          key: 'lech',
          label: { vi: 'Lệch', en: 'Shifted' },
          points: bam(goc.points, 2).map((p) => ({ ...p, x: p.x + 1 })),
          tone: 'teal',
        },
      ]);

      for (const model of [thieuMotDiem, lechX]) {
        if (model.kind !== 'line') throw new Error('phải ra đường quét');
        expect('overlays' in model).toBe(false);
        expect(model.table.columns).toHaveLength(2);
      }
    });

    it('chuỗi trùng khoá nhau chỉ giữ cái đầu — khoá đi vào id của dải chuyển màu', () => {
      const goc = veVoiOverlay(undefined);
      if (goc.kind !== 'line') throw new Error('phải ra đường quét');

      const model = veVoiOverlay([
        { key: 'a', label: { vi: 'A', en: 'A' }, points: bam(goc.points, 2), tone: 'teal' },
        {
          key: 'a',
          label: { vi: 'A lần hai', en: 'A again' },
          points: bam(goc.points, 3),
          tone: 'violet',
        },
      ]);
      if (model.kind !== 'line') throw new Error('phải ra đường quét');

      expect(model.overlays?.map((s) => s.label.vi)).toEqual(['A']);
    });

    it('xin trục phải thì dựng trục phải, miền bám dữ liệu của CHÍNH nó', () => {
      const goc = veVoiOverlay(undefined);
      if (goc.kind !== 'line') throw new Error('phải ra đường quét');

      const model = veVoiOverlay([
        {
          key: 'to',
          label: { vi: 'Thang khác', en: 'Other scale' },
          points: bam(goc.points, 1000),
          unit: 'điểm',
          tone: 'violet',
          axis: 'right',
        },
      ]);
      if (model.kind !== 'line') throw new Error('phải ra đường quét');

      expect(model.yRight).toBeDefined();
      expect(model.yRight?.title.vi).toContain('Thang khác');
      // Trục TRÁI không được kéo theo chuỗi phụ — đó là toàn bộ lý do có trục thứ hai.
      expect(model.y.domain).toEqual(goc.y.domain);
      // Và trục phải phải với tới thang gấp nghìn lần ấy.
      expect(model.yRight?.domain[1]).toBeGreaterThan(model.y.domain[1] * 100);
    });

    it('chuỗi phụ đọc trục trái thì KHÔNG đẻ ra trục phải', () => {
      const goc = veVoiOverlay(undefined);
      if (goc.kind !== 'line') throw new Error('phải ra đường quét');

      const model = veVoiOverlay([
        { key: 'b', label: { vi: 'B', en: 'B' }, points: bam(goc.points, 1.1), tone: 'muted' },
      ]);
      if (model.kind !== 'line') throw new Error('phải ra đường quét');

      expect('yRight' in model).toBe(false);
    });

    /* `seriesOf()` là chỗ DUY NHẤT ghép chuỗi chính với chuỗi phụ — tầng vẽ lặp trên kết quả của nó. */
    it('seriesOf() luôn đặt chuỗi chính ở đầu, kể cả khi không có chuỗi phụ', () => {
      const motChuoi = veVoiOverlay(undefined);
      if (motChuoi.kind !== 'line') throw new Error('phải ra đường quét');

      expect(seriesOf(motChuoi)).toHaveLength(1);
      expect(seriesOf(motChuoi)[0]?.key).toBe(PRIMARY_SERIES_KEY);
      expect(seriesOf(motChuoi)[0]?.points).toBe(motChuoi.points);

      const goc = veVoiOverlay(undefined);
      if (goc.kind !== 'line') throw new Error('phải ra đường quét');
      const haiChuoi = veVoiOverlay([
        { key: 'c', label: { vi: 'C', en: 'C' }, points: bam(goc.points, 2), tone: 'teal' },
      ]);
      if (haiChuoi.kind !== 'line') throw new Error('phải ra đường quét');

      expect(seriesOf(haiChuoi).map((s) => s.key)).toEqual([PRIMARY_SERIES_KEY, 'c']);
    });
  });

  /*
   * ── Đường giá vẽ kèm — `spec.priceOverlay` ─────────────────────────────────
   *
   * Công thức ĐẦU TIÊN dùng đường chuỗi phụ vừa mở: SMA vẽ kèm giá đóng cửa trên trục thời gian,
   * vì "Cách đọc kết quả" của nó nói về giá nằm trên/dưới đường và giá cắt đường — điều một mình
   * đường SMA không cho thấy. Hợp đồng bốn vế, cùng dạng với mốc tham chiếu:
   *   1. Trục thời gian + có khai: đường giá là chuỗi phụ, miền trục trái ôm CẢ HAI chuỗi.
   *   2. Đổi trục sang một biến số: đường giá tự ẩn, mô hình y hệt hình một chuỗi.
   *   3. Không khai (EMA…) thì không mọc gì, dù cùng chạy qua đúng một pipeline.
   *   4. Danh sách công thức khai bị GHIM — cái mới thêm phải qua một lần nhìn có chủ đích.
   */
  describe('đường giá vẽ kèm — spec.priceOverlay', () => {
    const sma = moduleOf('sma-n-phien');

    /* Sin đủ rộng để giá thô dao động VƯỢT hẳn dải của chính đường SMA làm mượt nó. */
    const GIA_SIN = Array.from(
      { length: 90 },
      (_, i) => 20_000 + Math.round(3_000 * Math.sin(i / 4)),
    );
    const CTX_SMA: CalcContext = {
      ...CTX,
      series: GIA_SIN,
      bars: GIA_SIN.map((close, i) => ({
        date: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
        open: close,
        high: close,
        low: close,
        close,
        volume: 1_000,
      })),
    };

    function veSma(inputs = defaultInputs(sma.spec), sweepKey: string = HISTORY_KEY) {
      return buildChartModel({
        formula: sma,
        inputs,
        ctx: CTX_SMA,
        output: runFormula(sma, inputs, CTX_SMA),
        level: 'basic',
        sweepKey,
      });
    }

    it('trục thời gian: đường giá là chuỗi phụ tông trung tính, không tô vùng, đọc trục trái', () => {
      const model = veSma();
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect(model.overlays).toHaveLength(1);
      const gia = model.overlays?.[0];
      expect(gia?.key).toBe('gia-dong-cua');
      expect(gia?.label).toEqual({ vi: 'Giá đóng cửa', en: 'Closing price' });
      expect(gia?.tone).toBe('muted');
      // Mảnh hơn chuỗi chính (2) — giá là bối cảnh, chỉ báo mới là đầu ra của công thức.
      expect(gia?.width).toBeLessThan(2);
      expect(gia?.area).not.toBe(true);
      expect(gia?.axis).toBe('left');
      // Dấu "giá trị hiện tại" là của riêng chuỗi chính.
      expect(gia?.points.every((p) => p.marked === undefined)).toBe(true);

      // Cùng đơn vị tiền thì đọc chung trục trái — không đẻ trục phải.
      expect('yRight' in model).toBe(false);
    });

    /*
     * Vế dễ hỏng nhất: renderer chiếu toạ độ tuyến tính và KHÔNG cắt hình ngoài khung, nên miền
     * trục trái phải ôm cả chuỗi giá — thứ chắc chắn dao động rộng hơn chính đường làm mượt nó.
     */
    it('miền trục trái ôm CẢ đường giá, không để giá vẽ tràn ra ngoài khung', () => {
      const model = veSma();
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      const giaY = (model.overlays?.[0]?.points ?? [])
        .map((p) => p.y)
        .filter((y): y is number => y !== null);

      // Tiền đề: chuỗi giá thật sự vượt dải SMA — không phải ca dựng khống.
      const smaY = model.points.map((p) => p.y).filter((y): y is number => y !== null);
      expect(Math.max(...giaY)).toBeGreaterThan(Math.max(...smaY));

      expect(model.y.domain[0]).toBeLessThanOrEqual(Math.min(...giaY));
      expect(model.y.domain[1]).toBeGreaterThanOrEqual(Math.max(...giaY));
    });

    it('legend ghi "SMA 20 phiên" theo số phiên đang nhập; bảng thêm cột Giá đóng cửa', () => {
      const model = veSma();
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect(model.primaryLabel).toEqual({ vi: 'SMA 20 phiên', en: '20-period SMA' });
      // `seriesOf()` đưa nhãn ấy cho chuỗi chính — đường dẫn thật mà legend sẽ đọc.
      expect(seriesOf(model)[0]?.label.vi).toBe('SMA 20 phiên');

      // Cột chuỗi chính vẫn gọi tên ĐẠI LƯỢNG kèm đơn vị như cũ; cột mới gọi tên đường.
      expect(model.table.columns).toHaveLength(3);
      expect(model.table.columns[1]?.vi).toContain('(₫)');
      expect(model.table.columns[2]?.vi).toBe('Giá đóng cửa');

      // Câu mô tả nhắc cả hai chuỗi — SVG ẩn với trình đọc màn hình, chữ là lối đọc duy nhất.
      expect(model.summary.vi).toContain('Vẽ kèm: Giá đóng cửa');
      expect(model.summary.en).toContain('Also drawn: Closing price');
    });

    /* Đúng ca nghiệm thu của chủ dự án: kéo slider thì SMA đổi còn đường giá đứng yên. */
    it('đổi số phiên: chuỗi SMA đổi, đường giá đứng yên, legend đổi theo', () => {
      const truoc = veSma({ period: 20 });
      const sau = veSma({ period: 50 });
      if (truoc.kind !== 'line' || sau.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect(sau.points).not.toEqual(truoc.points);
      expect(sau.overlays?.[0]?.points).toEqual(truoc.overlays?.[0]?.points);
      expect(sau.primaryLabel?.vi).toBe('SMA 50 phiên');
    });

    it('đổi trục sang Số phiên: đường giá tự ẩn, mô hình y hệt hình một chuỗi', () => {
      const model = veSma(defaultInputs(sma.spec), 'period');
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect('overlays' in model).toBe(false);
      expect('primaryLabel' in model).toBe(false);
      expect(model.table.columns).toHaveLength(2);
      expect(model.summary.vi).not.toContain('Vẽ kèm');
    });

    it('EMA không khai thì không vẽ kèm, dù cùng chạy qua đúng một pipeline', () => {
      const ema = moduleOf('ema-n-phien');
      const inputs = defaultInputs(ema.spec);
      const model = buildChartModel({
        formula: ema,
        inputs,
        ctx: CTX_SMA,
        output: runFormula(ema, inputs, CTX_SMA),
        level: 'basic',
        sweepKey: HISTORY_KEY,
      });
      if (model.kind !== 'line') throw new Error('EMA phải ra đường quét');

      expect('overlays' in model).toBe(false);
      expect('primaryLabel' in model).toBe(false);
    });

    it('phiên thiếu giá thành y null — đường đứt, không nội suy vắt qua (FR-06)', () => {
      const bars = CTX_SMA.bars ?? [];
      const thung = bars.map((bar, i) => (i === 40 ? { ...bar, close: null } : bar));
      const series = closePriceSeries({ ...CTX_SMA, bars: thung });

      expect(series?.points[40]?.y).toBeNull();
      expect(series?.points[40]?.valueLabel).not.toMatch(/NaN|null/);
      expect(series?.points[39]?.y).not.toBeNull();
    });

    /*
     * Giá 0 hoặc âm KHÔNG phải "giá bằng 0" mà là "không có giá" — `isBadPrice()` bên
     * `price-series.ts` đã chốt vậy, và bảng WF-05 chỉ CẢNH BÁO dòng như thế chứ vẫn lưu nó.
     *
     * Đây là ca đắt nhất trong nhóm này vì nó bắt một lỗi có thể nhìn rất giống dữ liệu thật: chuỗi
     * vào `calc` được lọc `> 0`, nên nếu đường giá không lọc thì hai đường trên CÙNG một hình nói
     * khác nhau về cùng một phiên — SMA đã bỏ phiên ấy, còn đường giá vẽ một cú sập sàn về 0. Miền
     * trục trái ôm cả chuỗi phụ nên cú sập ấy còn kéo dẹt cả hai đường.
     */
    it('giá 0 hoặc âm là KHÔNG CÓ GIÁ, không phải giá bằng 0 — và không kéo trục về 0', () => {
      const bars = CTX_SMA.bars ?? [];
      const hong = bars.map((bar, i) =>
        i === 30 ? { ...bar, close: 0 } : i === 31 ? { ...bar, close: -26_700 } : bar,
      );

      const series = closePriceSeries({ ...CTX_SMA, bars: hong });
      expect(series?.points[30]?.y).toBeNull();
      expect(series?.points[31]?.y).toBeNull();
      expect(series?.points[29]?.y).not.toBeNull();

      // Và đi hết đường tới mô hình: trục trái vẫn bám dải giá thật, không tụt xuống 0 hay âm.
      const model = buildChartModel({
        formula: sma,
        inputs: defaultInputs(sma.spec),
        ctx: { ...CTX_SMA, bars: hong },
        output: runFormula(sma, defaultInputs(sma.spec), { ...CTX_SMA, bars: hong }),
        level: 'basic',
        sweepKey: HISTORY_KEY,
      });
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect(model.y.domain[0]).toBeGreaterThan(0);
      expect(Number.isFinite(model.y.domain[0])).toBe(true);
    });

    /*
     * Chuỗi phụ THỦNG đi hết đường tới mô hình, không dừng ở `closePriceSeries()`.
     *
     * Chỗ dễ hỏng là `extentOf` trên mảng có `null` (miền trục trái) và hai đầu mút của câu "Vẽ
     * kèm": thay `extentOf` bằng `Math.min/Math.max` thô là `null` bị ép thành 0, trục sập xuống 0
     * và cả hai đường dẹt thành một vạch — mà ca miền-trục ở trên dùng dữ liệu sin liền mạch nên
     * không đỏ.
     */
    it('chuỗi giá thủng giữa chừng: trục và câu mô tả vẫn hữu hạn, không ai bị ép về 0', () => {
      const bars = CTX_SMA.bars ?? [];
      const thung = bars.map((bar, i) => (i === 40 ? { ...bar, close: null } : bar));
      const ctx: CalcContext = { ...CTX_SMA, bars: thung };
      const inputs = defaultInputs(sma.spec);

      const model = buildChartModel({
        formula: sma,
        inputs,
        ctx,
        output: runFormula(sma, inputs, ctx),
        level: 'basic',
        sweepKey: HISTORY_KEY,
      });
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect(model.overlays?.[0]?.points[40]?.y).toBeNull();
      expect(model.y.domain[0]).toBeGreaterThan(0);
      expect(model.summary.vi).toContain('Vẽ kèm: Giá đóng cửa');
      expect(model.summary.vi).not.toMatch(/NaN|Infinity|undefined/);
      expect(model.summary.en).not.toMatch(/NaN|Infinity|undefined/);
    });

    /*
     * Bảng ghép cột overlay theo CHỈ SỐ của điểm đã giữ (`points.indexOf(point)` trên kết quả
     * `condensePoints`), và phép ấy chạy được CHỈ vì `condensePoints()` trả về đúng tham chiếu
     * phần tử gốc. Ca này đối chiếu ĐỘC LẬP — tự rút gọn lại rồi tra chỉ số gốc — nên nó bắt được
     * cả hai kiểu hỏng: `indexOf` trả -1 (mọi ô thành '—' mà bảng vẫn đủ 3 cột), và ghép theo vị
     * trí DÒNG thay vì chỉ số gốc (dòng mang giá của phiên khác — số sai trông như đúng).
     */
    it('cột giá ghép ĐÚNG PHIÊN, không chỉ đủ số ô', () => {
      const model = veSma();
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      const giaPoints = model.overlays?.[0]?.points ?? [];
      const rutGon = condensePoints(model.points);

      // Tiền đề: chuỗi 90 phiên đủ dài để bảng phải rút gọn, tức có dòng ngắt thật.
      expect(rutGon).toContain(null);
      expect(model.table.rows).toContain(null);

      let daDoi = 0;
      for (const [i, row] of model.table.rows.entries()) {
        const point = rutGon[i];
        if (row === null || point === undefined || point === null) {
          expect(row).toBeNull();
          expect(point ?? null).toBeNull();
          continue;
        }
        const goc = model.points.indexOf(point);
        expect(row[2]).toBe(giaPoints[goc]?.valueLabel);
        // Và ô ấy là một con số thật, không phải '—' của nhánh không tìm thấy chỉ số.
        expect(row[2]).not.toBe('—');
        daDoi += 1;
      }
      expect(daDoi).toBeGreaterThan(3);
    });

    /*
     * Nhánh rơi-về-tên-ngắn của `overlayPrimaryLabel()` — lưới FR-06 áp cho CHỮ.
     *
     * Qua cổng công khai thì khó chạm tới: ô số phiên trống làm mọi phiên `null` nên mô hình rơi về
     * `unavailable` trước khi tới nhãn. Nên gọi qua một spec KHÔNG khai `periodKey`, đó cũng chính
     * là hình dạng mà một công thức tương lai không đo bằng phiên sẽ dùng.
     */
    it('khai priceOverlay không có periodKey thì legend lấy tên ngắn trần, không ghép NaN', () => {
      const khongKyHan = {
        ...sma,
        spec: { ...sma.spec, priceOverlay: { shortName: { vi: 'Đường nền', en: 'Baseline' } } },
      };
      const inputs = defaultInputs(sma.spec);
      const model = buildChartModel({
        formula: khongKyHan,
        inputs,
        ctx: CTX_SMA,
        output: runFormula(khongKyHan, inputs, CTX_SMA),
        level: 'basic',
        sweepKey: HISTORY_KEY,
      });
      if (model.kind !== 'line') throw new Error('SMA phải ra đường quét');

      expect(model.primaryLabel).toEqual({ vi: 'Đường nền', en: 'Baseline' });
      expect(model.primaryLabel?.vi).not.toMatch(/NaN|undefined|phiên/);
    });

    /*
     * GHIM danh sách công thức khai, cùng lẽ với danh sách bóc tách: khai báo mới phải qua một
     * lần nhìn có chủ đích — nó đổi hình của một trang đang chạy. Đồng thời khoá hai điều kiện
     * sống của khai báo: công thức phải vẽ được theo thời gian (không thì khai báo chết), và
     * `periodKey` phải là một biến thật (không thì legend im lặng rơi về tên ngắn mãi mãi).
     */
    it('chỉ SMA khai priceOverlay, và khai báo nào cũng phải sống được', () => {
      const daKhai = FORMULA_MODULES.filter((f) => f.spec.priceOverlay !== undefined);
      expect(daKhai.map((f) => f.spec.id)).toEqual(['sma-n-phien']);

      for (const formula of daKhai) {
        expect(historyPlan(formula, CTX.asOf), formula.spec.id).not.toBeNull();
        const periodKey = formula.spec.priceOverlay?.periodKey;
        if (periodKey !== undefined) {
          expect(
            formula.spec.variables.map((v) => v.key),
            formula.spec.id,
          ).toContain(periodKey);
        }
      }
    });
  });

  it('tôn trọng biến người dùng chọn, và bỏ qua key rác', () => {
    const inputs = defaultInputs(pe.spec);
    const args = {
      formula: pe,
      inputs,
      ctx: CTX,
      output: runFormula(pe, inputs, CTX),
      level: 'basic' as const,
    };

    const chosen = buildChartModel({ ...args, sweepKey: 'eps' });
    const garbage = buildChartModel({ ...args, sweepKey: 'khong-co-bien-nay' });

    expect(chosen.kind === 'line' && chosen.sweepKey).toBe('eps');
    expect(garbage.kind === 'line' && garbage.sweepKey).toBe('price');
  });

  it('nhãn trục tiền lớn chia bậc tỷ / triệu thay vì in 13 chữ số ở khổ 360px', () => {
    const model = modelOf('von-hoa-thi-truong');
    if (model.kind !== 'line') throw new Error('phải ra đường quét');

    expect(model.y.title.vi).toMatch(/\((tỷ|triệu) ₫\)/);
    for (const tick of model.y.ticks) expect(tick.label.length).toBeLessThan(10);
  });

  /*
   * Ca đắt giá nhất của cả nhánh: quét TOÀN BỘ 111 công thức qua đúng một vòng lặp.
   *
   * Bắt được mọi công thức lệch mà không phải viết 111 ca, và chạy ở tầng Domain nên nhanh gấp
   * bội so với render jsdom — cùng tinh thần `formulas.test.ts`.
   */
  it('cả 111 công thức: không ném lỗi, không NaN, không Infinity ở BẤT KỲ số nào', () => {
    for (const formula of FORMULA_MODULES) {
      const id = formula.spec.id;
      const inputs = defaultInputs(formula.spec);
      const output = runFormula(formula, inputs, CTX);

      const model = buildChartModel({ formula, inputs, ctx: CTX, output, level: 'advanced' });

      expect(['line', 'waterfall', 'unavailable'], id).toContain(model.kind);
      if (model.kind === 'unavailable') {
        expect(model.warning.message.vi, id).not.toBe('');
        continue;
      }

      // Thác nước không có trục X kiểu số — trục ngang của nó là các CHẶNG, không phải đại lượng.
      for (const axis of model.kind === 'waterfall' ? [model.y] : [model.x, model.y]) {
        expect(Number.isFinite(axis.domain[0]), `${id}: miền`).toBe(true);
        expect(Number.isFinite(axis.domain[1]), `${id}: miền`).toBe(true);
        expect(axis.domain[0], `${id}: miền`).toBeLessThan(axis.domain[1]);

        for (const tick of axis.ticks) {
          expect(Number.isFinite(tick.value), `${id}: vạch`).toBe(true);
          expect(tick.label, `${id}: nhãn vạch`).not.toMatch(/NaN|Infinity|undefined/);
        }
      }

      if (model.kind === 'waterfall') {
        for (const bar of model.bars) {
          expect(Number.isFinite(bar.delta), `${id}: phần đóng góp`).toBe(true);
          expect(Number.isFinite(bar.cumulative), `${id}: mức cộng dồn`).toBe(true);
          expect(bar.label.vi, `${id}: nhãn cột`).not.toMatch(/NaN|Infinity|undefined/);
          expect(bar.valueLabel, `${id}: nhãn giá trị`).not.toMatch(/NaN|Infinity|undefined/);
        }
        // Chân cột phải có chỗ đứng: miền trục LUÔN chứa số 0.
        expect(model.y.domain[0], `${id}: miền phải chứa 0`).toBeLessThanOrEqual(0);
        expect(model.y.domain[1], `${id}: miền phải chứa 0`).toBeGreaterThanOrEqual(0);
      } else {
        for (const point of model.points) {
          expect(Number.isFinite(point.x), `${id}: x`).toBe(true);
          expect(point.y === null || Number.isFinite(point.y), `${id}: y`).toBe(true);
          expect(point.label, `${id}: nhãn x`).not.toMatch(/NaN|Infinity|undefined/);
          expect(point.valueLabel, `${id}: nhãn y`).not.toMatch(/NaN|Infinity|undefined/);
        }
      }

      expect(model.title.vi, id).not.toMatch(/NaN|Infinity|undefined/);
      expect(model.summary.vi, id).not.toMatch(/NaN|Infinity|undefined/);
      for (const row of model.table.rows) {
        if (row === null) continue;
        expect(row[0].vi + row[1], `${id}: bảng`).not.toMatch(/NaN|Infinity|undefined/);
      }
    }
  });

  it('dựng hai lần cho kết quả GIỐNG HỆT — trang tĩnh prerender phải khớp lúc hydrate', () => {
    for (const id of ['pe', 'roe', 'lai-kep', 'bien-an-toan']) {
      const first = JSON.stringify(modelOf(id));
      const second = JSON.stringify(modelOf(id));

      expect(first, id).toBe(second);
    }
  });

  /*
   * Phủ khi CHƯA nạp dữ liệu — trạng thái người dùng gặp lúc mới mở màn.
   *
   * 63 công thức vẽ được ngay bằng đường quét độ nhạy; 34 công thức còn lại ăn chuỗi giá nên đứng ở
   * câu "chưa có phiên giá" kèm câu chỉ đường, và đó là trạng thái ĐÚNG chứ không phải thiếu sót.
   * Chốt cả hai con số: nếu một công thức tuột khỏi nhóm vẽ được vì lý do khác thì ca này đỏ.
   */
  it('chưa nạp dữ liệu: 61 đường quét + 4 bóc tách, 35 công thức chờ chuỗi giá', () => {
    const wanted = FORMULA_MODULES.filter((f) => f.spec.chartType !== 'none');
    const drawn = wanted.filter((f) => modelOf(f.spec.id, 'advanced').kind === 'line');
    const bocTach = wanted.filter((f) => modelOf(f.spec.id, 'advanced').kind === 'waterfall');
    const waiting = wanted.filter((f) => {
      const model = modelOf(f.spec.id, 'advanced');
      return model.kind === 'unavailable' && model.warning.code === 'MISSING_SERIES';
    });

    expect(wanted).toHaveLength(100);
    expect(drawn).toHaveLength(61);
    /*
     * BỐN công thức bày thác nước NGAY khi mở màn — đúng bốn cái khai `chartType: 'waterfall'`:
     * `ev`, `fcff`, `fcfe`, `ncav-tren-co-phieu`. Điểm chung của chúng không phải là tình cờ:
     * đường quét của cả bốn đều là ĐƯỜNG THẲNG (FCFF theo EBIT có hệ số góc 1 − t, FCFE theo FCFF
     * hệ số góc 1, NCAV theo tài sản ngắn hạn hệ số góc 1.000/N), tức đúng loại hình mà luật
     * `chartType: 'none'` sinh ra để loại.
     *
     * Sáu công thức khai `breakdown` còn lại mang `stackedBar` nên vẫn nằm trong nhóm `drawn`:
     * bóc tách của chúng nằm trong ô chọn trục, không đè lên đường quét vốn nói được điều riêng.
     */
    expect(bocTach).toHaveLength(4);
    expect(waiting).toHaveLength(35);
    // Không ca nào rơi ra ngoài ba nhóm ấy — không có "không vẽ được vì lý do khác".
    expect(drawn.length + bocTach.length + waiting.length).toBe(wanted.length);
  });

  /*
   * Mười công thức `chartType: 'none'` KHÔNG phải việc còn nợ.
   *
   * Phí giao dịch bằng giá × khối lượng × tỉ lệ: đường quét của nó là một đoạn thẳng mà người đọc
   * đoán trước được, vẽ ra chỉ thêm một hình không nói gì. Ca này chốt rằng nhãn ấy là một quyết
   * định về ý nghĩa, và giao diện tôn trọng nó bằng cách không dựng khối biểu đồ nào.
   */
  it('nhóm chartType none — nay 11 công thức, thêm xirr', () => {
    const none = FORMULA_MODULES.filter((f) => f.spec.chartType === 'none');

    expect(none).toHaveLength(11);
    expect(FORMULA_MODULES).toHaveLength(111);
  });
});

/*
 * ── Biểu đồ bóc tách — thác nước WF-17 (gói 5.2.3) ──────────────────────────────────────────
 *
 * Công thức đầu tiên đi lối này là `ev`: EV = vốn hoá + nợ vay − tiền mặt. Đường quét của nó là
 * một đường thẳng hệ số góc đúng bằng 1 — người đọc đoán trước được, đúng loại hình mà chính dự
 * án viết luật `chartType: 'none'` để loại. Hình bậc thang nói được điều đường thẳng kia không nói.
 */
describe('bóc tách — thác nước', () => {
  const ev = moduleOf('ev');
  const inputsEv = defaultInputs(ev.spec);

  function waterfallOf() {
    const model = buildChartModel({
      formula: ev,
      inputs: inputsEv,
      ctx: CTX,
      output: runFormula(ev, inputsEv, CTX),
      level: 'advanced',
    });
    if (model.kind !== 'waterfall')
      throw new Error(`ev phải ra thác nước, đang ra '${model.kind}'`);
    return model;
  }

  it('mặc định bày bóc tách, không phải đường quét', () => {
    expect(waterfallOf().kind).toBe('waterfall');
  });

  it('dựng đủ các chặng cộng một cột tổng', () => {
    const bars = waterfallOf().bars;

    expect(bars.map((bar) => bar.label.vi)).toEqual(['Vốn hoá', 'Nợ vay', 'Tiền mặt', 'EV']);
    expect(bars.filter((bar) => bar.isTotal === true)).toHaveLength(1);
    expect(bars[bars.length - 1]?.isTotal).toBe(true);
  });

  /*
   * Bất biến quan trọng nhất của cả loại biểu đồ này. Một hình bóc tách mà cộng các phần lại
   * không ra con số ở khối Kết quả là hình nói dối về chính phép tính nó đang minh hoạ — và
   * không ca kiểm nào khác bắt được, vì mỗi cột riêng lẻ đều là số hợp lệ.
   */
  it('TỔNG các chặng đúng bằng kết quả công thức', () => {
    const bars = waterfallOf().bars;
    const stages = bars.filter((bar) => bar.isTotal !== true);
    const total = bars[bars.length - 1];

    const cong = stages.reduce((sum, bar) => sum + bar.delta, 0);
    const ketQua = runFormula(ev, inputsEv, CTX).value;

    expect(ketQua).not.toBeNull();
    expect(cong).toBeCloseTo(ketQua ?? 0, 6);
    expect(total?.delta).toBeCloseTo(ketQua ?? 0, 6);
  });

  it('dấu của từng chặng theo đúng metadata: tiền mặt TRỪ ra', () => {
    const bars = waterfallOf().bars;

    expect(bars[0]?.delta).toBe(9_200); // vốn hoá cộng vào
    expect(bars[1]?.delta).toBe(3_500); // nợ vay cộng vào
    expect(bars[2]?.delta).toBe(-1_200); // tiền mặt trừ ra
  });

  it('mức cộng dồn chạy đúng, để chân cột sau nối đỉnh cột trước', () => {
    expect(waterfallOf().bars.map((bar) => bar.cumulative)).toEqual([
      9_200, 12_700, 11_500, 11_500,
    ]);
  });

  it('miền trục LUÔN chứa số 0 — chân cột phải có chỗ đứng', () => {
    const y = waterfallOf().y;

    expect(y.domain[0]).toBeLessThanOrEqual(0);
    expect(y.domain[1]).toBeGreaterThanOrEqual(11_500);
  });

  it('bảng số bày đúng các chặng, cho cả trình đọc màn hình lẫn người tra số', () => {
    const table = waterfallOf().table;

    expect(table.rows).toHaveLength(4);
    expect(table.rows[2]?.[0]?.vi).toBe('Tiền mặt');
    expect(table.columns[0].vi).toBe('Thành phần');
  });

  it('bóc tách là MỘT MỤC trong ô chọn trục, không phải màn riêng', () => {
    const model = waterfallOf();

    expect(model.options.some((option) => option.label.vi === 'Bóc tách')).toBe(true);
    expect(model.sweepKey).toBe(model.options[0]?.key);
    // Và người dùng vẫn đổi sang đường quét được.
    expect(model.options.length).toBeGreaterThan(1);
  });

  it('chọn một biến ở ô ấy thì quay về đường quét bình thường', () => {
    const model = buildChartModel({
      formula: ev,
      inputs: inputsEv,
      ctx: CTX,
      output: runFormula(ev, inputsEv, CTX),
      level: 'advanced',
      sweepKey: 'marketCap',
    });

    expect(model.kind).toBe('line');
  });

  it('công thức không khai breakdown thì không có mục bóc tách nào', () => {
    const pe = moduleOf('pe');
    const inputs = defaultInputs(pe.spec);
    const model = buildChartModel({
      formula: pe,
      inputs,
      ctx: CTX,
      output: runFormula(pe, inputs, CTX),
      level: 'advanced',
    });

    expect(model.kind).toBe('line');
    if (model.kind !== 'line') return;
    expect(model.options.some((option) => option.label.vi === 'Bóc tách')).toBe(false);
  });

  it('kết quả đang lỗi thì không bóc tách — không có tổng nào để bày', () => {
    const broken = { ...inputsEv, marketCap: 0 };
    const model = buildChartModel({
      formula: ev,
      inputs: broken,
      ctx: CTX,
      output: runFormula(ev, broken, CTX),
      level: 'advanced',
    });

    expect(model.kind).not.toBe('waterfall');
  });

  /*
   * Cửa gác của CẢ LOẠI biểu đồ, không của riêng công thức nào.
   *
   * Ca `ev` phía trên chốt bất biến "tổng các chặng bằng kết quả" cho đúng một công thức; ca này
   * bắt nó phải đúng với MỌI công thức khai `breakdown`, kể cả những cái thêm sau. Đây là chỗ
   * duy nhất chặn được lỗi khai chặng lệch — mỗi cột riêng lẻ vẫn là số hợp lệ, không ca nào
   * khác nhìn ra.
   */
  it('MỌI công thức khai breakdown đều cộng đúng về kết quả của chính nó', () => {
    const declared = FORMULA_MODULES.filter((f) => f.spec.breakdown !== undefined);

    // Chốt cả số lượng: thêm một công thức khai breakdown mà quên nghĩ tới ca này thì đỏ ở đây.
    expect(declared.map((f) => f.spec.id).sort()).toEqual([
      'ddm-hai-giai-doan',
      'ev',
      'fcfe',
      'fcff',
      'lich-tra-no',
      'ncav-tren-co-phieu',
      'thue-tncn-dau-tu',
      'tra-gop-goc-deu',
      'tra-gop-nien-kim',
      'wacc',
    ]);

    for (const formula of declared) {
      const inputs = defaultInputs(formula.spec);
      const output = runFormula(formula, inputs, CTX);
      const model = buildChartModel({
        formula,
        inputs,
        ctx: CTX,
        output,
        level: 'advanced',
        sweepKey: BREAKDOWN_KEY,
      });

      expect(model.kind, formula.spec.id).toBe('waterfall');
      if (model.kind !== 'waterfall') continue;

      const stages = model.bars.filter((bar) => bar.isTotal !== true);
      const cong = stages.reduce((sum, bar) => sum + bar.delta, 0);

      expect(stages.length, formula.spec.id).toBeGreaterThanOrEqual(2);
      expect(output.value, formula.spec.id).not.toBeNull();
      /*
       * Sai số tương đối: các con số ở đây chạy từ 11.500 (tỷ ₫) tới 1,79 tỷ (₫), không so
       * tuyệt đối được. Mẫu số lấy theo cột LỚN NHẤT chứ không theo `output.value`: kết quả
       * bằng 0 là chuyện có thật (tổng lãi của khoản vay lãi suất 0%), mà chia cho 0 thì biểu
       * thức ra Infinity và phép kiểm đỏ oan — hoặc tệ hơn, `?? 1` biến nó thành so tuyệt đối
       * với ngưỡng 1e-9 trên những con số hàng trăm triệu.
       */
      const thang = Math.max(Math.abs(output.value ?? 0), ...stages.map((b) => Math.abs(b.delta)));
      expect(Math.abs(cong - (output.value ?? 0)) / (thang === 0 ? 1 : thang)).toBeLessThan(1e-9);
    }
  });
});

/*
 * ── Bóc tách của ba công thức vay (đợt 3) ────────────────────────────────────────────────────
 *
 * Khác `ev` ở đúng một điểm, và điểm ấy là cả thiết kế: ba công thức này khai `stackedBar` chứ
 * không phải `waterfall`, nên bóc tách là MỘT MỤC trong ô chọn trục, không phải hình mặc định.
 * Đường quét của chúng nói được điều riêng — tổng lãi theo kỳ hạn là một đường cong lồi, đúng
 * điều `commonMistakes` của `lich-tra-no` cảnh báo — nên không có lý do gì đè lên nó.
 */
describe('bóc tách — ba công thức vay', () => {
  const VAY = ['tra-gop-nien-kim', 'tra-gop-goc-deu', 'lich-tra-no'] as const;

  function chartOf(id: string, sweepKey?: string) {
    const formula = moduleOf(id);
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const model = buildChartModel({
      formula,
      inputs,
      ctx: CTX,
      output,
      level: 'advanced',
      ...(sweepKey === undefined ? {} : { sweepKey }),
    });
    return { model, ketQua: output.value };
  }

  it('mặc định VẪN là đường quét — bóc tách chỉ đứng sẵn trong ô chọn', () => {
    for (const id of VAY) {
      const { model } = chartOf(id);

      expect(model.kind, id).toBe('line');
      if (model.kind !== 'line') continue;
      expect(
        model.options.some((option) => option.label.vi === 'Bóc tách'),
        id,
      ).toBe(true);
    }
  });

  it('chọn mục ấy thì ra thác nước, mỗi công thức đủ hai chặng và một cột tổng', () => {
    for (const id of VAY) {
      const { model } = chartOf(id, BREAKDOWN_KEY);

      expect(model.kind, id).toBe('waterfall');
      if (model.kind !== 'waterfall') continue;
      expect(model.bars, id).toHaveLength(3);
      expect(model.bars[2]?.isTotal, id).toBe(true);
    }
  });

  /*
   * Cạm bẫy đã ghi từ đợt 2, nay có ca kiểm chốt cách né: cột chồng "gốc + lãi" cộng ra TỔNG PHẢI
   * TRẢ, trong khi kết quả của công thức chỉ là phần lãi. Đảo chiều phép tính thì hai vế khớp.
   */
  it('lich-tra-no: tổng phải trả TRỪ gốc vay ra đúng tổng lãi', () => {
    const { model, ketQua } = chartOf('lich-tra-no', BREAKDOWN_KEY);
    if (model.kind !== 'waterfall') throw new Error('phải ra thác nước');

    expect(model.bars.map((bar) => bar.label.vi)).toEqual([
      'Tổng phải trả',
      'Trừ gốc vay',
      'Tổng lãi',
    ]);
    expect(model.bars[0]?.delta).toBeCloseTo(1_789_691_880.64, 0);
    expect(model.bars[1]?.delta).toBe(-800_000_000);
    expect(ketQua).toBeCloseTo(989_691_880.64, 0);
    expect(model.bars[2]?.delta).toBeCloseTo(ketQua ?? 0, 6);
  });

  /*
   * Lãi suất 0% — ca hỏng thật, tìm ra ở đợt 9 và tái hiện được bằng số.
   *
   * Hai chỗ cùng vỡ ở đây, và cả hai đều im lặng. `totalPaid` từng cộng dồn 240 kỳ trong khi
   * chặng thứ hai trừ đi `amount` lấy nguyên từ ô nhập, nên hai đường tích luỹ lệch nhau
   * −1,19e−7 thay vì triệt tiêu về 0; `Math.floor` trong `niceAxis` nới hạt bụi ấy thành trọn
   * một bước, ra trục [−200 triệu, 800 triệu] với vạch "−200" dưới một hình không có cột nào âm.
   * Bộ mặc định của WF-14 nằm trong số 1.214 bộ dính, nên chỉ cần kéo thanh lãi suất về đầu trái.
   *
   * Không dùng `defaultInputs` được — bẫy chỉ lộ khi rate = 0 — nên ca này tự dựng inputs.
   */
  it('lich-tra-no ở lãi suất 0%: trục không có vạch âm nào, tổng lãi đúng bằng 0', () => {
    const formula = moduleOf('lich-tra-no');
    const inputs = { ...defaultInputs(formula.spec), rate: 0 };
    const output = runFormula(formula, inputs, CTX);
    const model = buildChartModel({
      formula,
      inputs,
      ctx: CTX,
      output,
      level: 'advanced',
      sweepKey: BREAKDOWN_KEY,
    });
    if (model.kind !== 'waterfall') throw new Error('phải ra thác nước');

    expect(output.value).toBe(0);
    // Vá tại gốc: hai vế triệt tiêu đúng bằng 0, không còn bụi.
    expect((model.bars[0]?.delta ?? 0) + (model.bars[1]?.delta ?? 0)).toBe(0);
    expect(model.y.domain[0]).toBe(0);
    expect(model.y.ticks.every((tick) => tick.value >= 0)).toBe(true);
  });

  /*
   * Cột tổng phải mang tên ĐẠI LƯỢNG, không mang tên công việc. Không có `breakdownTotal` thì nhãn
   * suy từ tên công thức và ra 'Lịch trả nợ vay' — đặt sai tên cho chính con số cột ấy đang bày.
   */
  it('cột tổng lấy nhãn từ breakdownTotal chứ không từ tên công thức', () => {
    const { model } = chartOf('lich-tra-no', BREAKDOWN_KEY);
    if (model.kind !== 'waterfall') throw new Error('phải ra thác nước');

    expect(model.bars[2]?.label.vi).toBe('Tổng lãi');
    expect(model.bars[2]?.label.vi).not.toBe('Lịch trả nợ vay');
  });

  /*
   * Điều duy nhất hình này tồn tại để nói, và cũng là câu `howToRead` của chính công thức:
   * "những năm đầu phần lớn tiền trả là lãi". Ở kỳ 1 của bộ số WF-14, lãi gấp hơn năm lần gốc.
   */
  it('tra-gop-nien-kim: kỳ đầu phần lãi lớn hơn hẳn phần gốc', () => {
    const { model, ketQua } = chartOf('tra-gop-nien-kim', BREAKDOWN_KEY);
    if (model.kind !== 'waterfall') throw new Error('phải ra thác nước');

    const goc = model.bars[0];
    const lai = model.bars[1];

    expect(goc?.label.vi).toBe('Gốc kỳ đầu');
    expect(lai?.label.vi).toBe('Lãi kỳ đầu');
    expect(lai?.delta).toBeCloseTo(6_333_333.33, 1);
    expect(lai?.delta ?? 0).toBeGreaterThan((goc?.delta ?? 0) * 5);
    expect((goc?.delta ?? 0) + (lai?.delta ?? 0)).toBeCloseTo(ketQua ?? 0, 6);
  });

  it('tra-gop-goc-deu: gốc mỗi kỳ cộng lãi kỳ đầu ra đúng khoản trả kỳ đầu', () => {
    const { model, ketQua } = chartOf('tra-gop-goc-deu', BREAKDOWN_KEY);
    if (model.kind !== 'waterfall') throw new Error('phải ra thác nước');

    expect(model.bars[0]?.delta).toBeCloseTo(800_000_000 / 240, 6);
    expect(model.bars[1]?.delta).toBeCloseTo(6_333_333.33, 1);
    expect(ketQua).toBeCloseTo(9_666_666.67, 1);
  });

  /*
   * Bẫy đơn vị của `ncav-tren-co-phieu`, ca duy nhất trong 10 công thức có phép CHIA sau phép trừ.
   *
   * Khai thẳng hai ô nhập thì hai cột mang đơn vị `tỷ ₫` (4.800 và 2.600) trong khi kết quả mang
   * `₫/CP` (18.644) — lệch bốn chữ số. Ca này khoá lại rằng chặng đã chia sẵn cho số cổ phiếu:
   * 4.800 tỷ ÷ 118 triệu CP × 1.000 = 40.678 ₫/CP.
   */
  it('ncav: chặng là số TRÊN MỖI CỔ PHIẾU, không phải tài sản và nợ thô', () => {
    const formula = moduleOf('ncav-tren-co-phieu');
    const inputs = defaultInputs(formula.spec);
    const model = buildChartModel({
      formula,
      inputs,
      ctx: CTX,
      output: runFormula(formula, inputs, CTX),
      level: 'advanced',
      sweepKey: BREAKDOWN_KEY,
    });
    if (model.kind !== 'waterfall') throw new Error('ncav phải ra thác nước');

    expect(model.bars[0]?.delta).toBeCloseTo(40_677.97, 1);
    expect(model.bars[1]?.delta).toBeCloseTo(-22_033.9, 1);
    expect(model.bars[2]?.label.vi).toBe('NCAV');
    // Và tuyệt đối KHÔNG phải con số thô của ô nhập.
    expect(model.bars[0]?.delta).not.toBeCloseTo(4_800, 0);
  });

  /*
   * Điều mô hình DDM hai giai đoạn tồn tại để nói, và cũng là chỗ người định giá hay tự lừa mình:
   * phần lớn giá trị nằm ở GIÁ TRỊ CUỐI KỲ — tức ở giả định tăng trưởng dài hạn — chứ không nằm ở
   * mấy năm tăng nhanh vừa ngồi ước lượng kỹ. Đo ở bộ số mặc định: **73,3%**, tức gần ba phần tư
   * định giá đến từ một con số g2 duy nhất.
   */
  it('ddm: giá trị cuối kỳ chiếm phần lớn định giá', () => {
    const formula = moduleOf('ddm-hai-giai-doan');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const model = buildChartModel({
      formula,
      inputs,
      ctx: CTX,
      output,
      level: 'advanced',
      sweepKey: BREAKDOWN_KEY,
    });
    if (model.kind !== 'waterfall') throw new Error('ddm phải ra thác nước');

    const [giaiDoanDau, cuoiKy] = model.bars;

    expect(giaiDoanDau?.label.vi).toBe('Cổ tức giai đoạn đầu');
    expect(cuoiKy?.label.vi).toBe('Giá trị cuối kỳ');
    expect(model.bars[2]?.label.vi).toBe('Giá trị cổ phiếu');

    const tyTrongCuoiKy = (cuoiKy?.delta ?? 0) / (output.value ?? 1);
    expect(tyTrongCuoiKy).toBeGreaterThan(0.7);
    expect(tyTrongCuoiKy).toBeCloseTo(0.733, 2);
  });

  /*
   * `fcff` là công thức nhiều chặng nhất — bốn, trong đó hai chặng trừ ra. Ca này chốt rằng dấu
   * đi đúng từ metadata sang cột, chứ không phải chỉ tổng khớp một cách tình cờ.
   */
  it('fcff: bốn chặng, hai cộng hai trừ, và mặc định bày luôn bóc tách', () => {
    const formula = moduleOf('fcff');
    const inputs = defaultInputs(formula.spec);
    const model = buildChartModel({
      formula,
      inputs,
      ctx: CTX,
      output: runFormula(formula, inputs, CTX),
      level: 'advanced',
    });

    // Không truyền `sweepKey`: `chartType: 'waterfall'` nên bóc tách là hình mặc định.
    expect(model.kind).toBe('waterfall');
    if (model.kind !== 'waterfall') return;

    const stages = model.bars.filter((bar) => bar.isTotal !== true);
    expect(stages).toHaveLength(4);
    expect(stages.filter((bar) => bar.delta < 0)).toHaveLength(2);
    expect(stages[0]?.label.vi).toBe('EBIT sau thuế');
  });

  /*
   * Kỳ hạn 0 làm công thức lỗi, và lúc đó KHÔNG được bày bóc tách: `extras` không có, mà một cột
   * mang nhãn nhưng rỗng ruột còn tệ hơn không vẽ gì.
   */
  it('kỳ hạn 0 thì không có mục bóc tách nào', () => {
    const formula = moduleOf('lich-tra-no');
    const inputs = { ...defaultInputs(formula.spec), years: 0 };
    const model = buildChartModel({
      formula,
      inputs,
      ctx: CTX,
      output: runFormula(formula, inputs, CTX),
      level: 'advanced',
      sweepKey: BREAKDOWN_KEY,
    });

    expect(model.kind).not.toBe('waterfall');
  });
});
