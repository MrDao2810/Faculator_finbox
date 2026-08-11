import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { buildChartModel } from './build';
import { gapsOf, linePath } from './path';
import { decimalsOf, extentOf, linearScale, niceAxis, niceStep } from './scale';
import { pickSweepVariable, sweepCandidates, sweepDomain, sweepPoints } from './sweep';
import { condensePoints } from './table';
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
    label: 'Giá',
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
    expect(model.title).toBe('P/E theo Giá thị trường');
    expect(model.x.title).toBe('Giá thị trường (₫)');
    expect(model.y.title).toBe('P/E (lần)');
  });

  it('câu mô tả nói đủ dải, khoảng kết quả và giá trị hiện tại — đây là lối đọc của trình đọc màn hình', () => {
    const model = modelOf('pe');
    if (model.kind !== 'line') throw new Error('phải ra đường quét');

    expect(model.summary).toContain('Quét Giá thị trường');
    expect(model.summary).toContain('giá trị hiện tại');
    expect(model.summary).toContain('Mọi mức đều tính được.');
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
    expect(model.note).toContain('không tính được');
    expect(model.table.rows.some((row) => row?.[1].includes('— , —') === true)).toBe(true);
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

    expect(model.y.title).toMatch(/\((tỷ|triệu) ₫\)/);
    for (const tick of model.y.ticks) expect(tick.label.length).toBeLessThan(10);
  });

  /*
   * Ca đắt giá nhất của cả nhánh: quét TOÀN BỘ 107 công thức qua đúng một vòng lặp.
   *
   * Bắt được mọi công thức lệch mà không phải viết 107 ca, và chạy ở tầng Domain nên nhanh gấp
   * bội so với render jsdom — cùng tinh thần `formulas.test.ts`.
   */
  it('cả 107 công thức: không ném lỗi, không NaN, không Infinity ở BẤT KỲ số nào', () => {
    for (const formula of FORMULA_MODULES) {
      const id = formula.spec.id;
      const inputs = defaultInputs(formula.spec);
      const output = runFormula(formula, inputs, CTX);

      const model = buildChartModel({ formula, inputs, ctx: CTX, output, level: 'advanced' });

      expect(['line', 'unavailable'], id).toContain(model.kind);
      if (model.kind === 'unavailable') {
        expect(model.warning.message, id).not.toBe('');
        continue;
      }

      for (const axis of [model.x, model.y]) {
        expect(Number.isFinite(axis.domain[0]), `${id}: miền`).toBe(true);
        expect(Number.isFinite(axis.domain[1]), `${id}: miền`).toBe(true);
        expect(axis.domain[0], `${id}: miền`).toBeLessThan(axis.domain[1]);

        for (const tick of axis.ticks) {
          expect(Number.isFinite(tick.value), `${id}: vạch`).toBe(true);
          expect(tick.label, `${id}: nhãn vạch`).not.toMatch(/NaN|Infinity|undefined/);
        }
      }

      for (const point of model.points) {
        expect(Number.isFinite(point.x), `${id}: x`).toBe(true);
        expect(point.y === null || Number.isFinite(point.y), `${id}: y`).toBe(true);
        expect(point.label, `${id}: nhãn x`).not.toMatch(/NaN|Infinity|undefined/);
        expect(point.valueLabel, `${id}: nhãn y`).not.toMatch(/NaN|Infinity|undefined/);
      }

      expect(model.title, id).not.toMatch(/NaN|Infinity|undefined/);
      expect(model.summary, id).not.toMatch(/NaN|Infinity|undefined/);
      for (const row of model.table.rows) {
        if (row === null) continue;
        expect(row[0] + row[1], `${id}: bảng`).not.toMatch(/NaN|Infinity|undefined/);
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
  it('chưa nạp dữ liệu: vẽ được ngay 63 công thức, 34 công thức chờ chuỗi giá', () => {
    const wanted = FORMULA_MODULES.filter((f) => f.spec.chartType !== 'none');
    const drawn = wanted.filter((f) => modelOf(f.spec.id, 'advanced').kind === 'line');
    const waiting = wanted.filter((f) => {
      const model = modelOf(f.spec.id, 'advanced');
      return model.kind === 'unavailable' && model.warning.code === 'MISSING_SERIES';
    });

    expect(wanted).toHaveLength(97);
    expect(drawn).toHaveLength(63);
    expect(waiting).toHaveLength(34);
    // Không ca nào rơi ra ngoài hai nhóm ấy — không có "không vẽ được vì lý do khác".
    expect(drawn.length + waiting.length).toBe(wanted.length);
  });

  /*
   * Mười công thức `chartType: 'none'` KHÔNG phải việc còn nợ.
   *
   * Phí giao dịch bằng giá × khối lượng × tỉ lệ: đường quét của nó là một đoạn thẳng mà người đọc
   * đoán trước được, vẽ ra chỉ thêm một hình không nói gì. Ca này chốt rằng nhãn ấy là một quyết
   * định về ý nghĩa, và giao diện tôn trọng nó bằng cách không dựng khối biểu đồ nào.
   */
  it('nhóm chartType none vẫn nằm ngoài phạm vi — đúng 10 công thức', () => {
    const none = FORMULA_MODULES.filter((f) => f.spec.chartType === 'none');

    expect(none).toHaveLength(10);
    expect(FORMULA_MODULES).toHaveLength(107);
  });
});
