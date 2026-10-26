import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { FPT_BARS } from '../formulas/market-series-2026';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { buildChartModel } from './build';
import { dangVeCuaHinh } from './dang-ve';
import { COMPONENTS_KEY, componentPoints } from './history';
import { seriesOf } from './series';
import type { LineChart } from './types';

/**
 * Hình "các đường thành phần" (26/10/2026) — mục thêm của ô "Xem theo" cho sáu công thức khai
 * `chartType: 'candlestick'` mà không phải một mức giá: giao cắt hai đường MA, MACD, đường tín hiệu
 * MACD, động lượng, ATR, biên độ dao động lớn nhất. Mỗi hình vẽ theo từng phiên những đại lượng mà
 * kết quả là khoảng cách giữa chúng.
 *
 * Số của mọi đường lấy từ `calc` chạy trên chuỗi cắt tới từng phiên. Ở đây mỗi đường được tính LẠI
 * từ định nghĩa trên chuỗi FPT thật, không qua hàm nào của `formulas/`: một đường lệch một phiên,
 * hay gieo hạt EMA khác đi, là ca đỏ.
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };
const GIA = FPT_BARS.map((bar) => bar.close ?? 0);
const CTX_FPT: CalcContext = { ...CTX, bars: FPT_BARS, series: GIA };

const tim = (id: string): FormulaModule => {
  const formula = FORMULA_MODULES.find((module) => module.spec.id === id);
  if (formula === undefined) throw new Error(id);
  return formula;
};

function ve(formula: FormulaModule, ctx: CalcContext, sweepKey?: string, extra: CalcInputs = {}) {
  const inputs = { ...defaultInputs(formula.spec), ...extra };
  return buildChartModel({
    formula,
    inputs,
    ctx,
    output: runFormula(formula, inputs, ctx),
    level: 'advanced',
    ...(sweepKey === undefined ? {} : { sweepKey }),
  });
}

function hinhThanhPhan(id: string, extra: CalcInputs = {}): LineChart {
  const hinh = ve(tim(id), CTX_FPT, COMPONENTS_KEY, extra);
  if (hinh.kind !== 'line' || hinh.sweepKey !== COMPONENTS_KEY) {
    throw new Error(`${id}: ${hinh.kind}`);
  }
  return hinh;
}

/** Dãy số của từng đường, theo thứ tự `seriesOf()` — chuỗi chính trước. */
function cacDuong(hinh: LineChart): Array<ReadonlyArray<number | null>> {
  return seriesOf(hinh).map((series) => series.points.map((point) => point.y));
}

/* ── Định nghĩa, viết lại độc lập ─────────────────────────────────────────────────────────────── */

const tb = (xs: ReadonlyArray<number>) => xs.reduce((sum, x) => sum + x, 0) / xs.length;

/** SMA n phiên tính tới phiên i, `null` khi chưa đủ n phiên. */
const sma = (i: number, n: number) => (i + 1 < n ? null : tb(GIA.slice(i + 1 - n, i + 1)));

/** EMA n phiên của một dãy, gieo hạt bằng trung bình n giá trị đầu; phần tử k là EMA tới k. */
function ema(xs: ReadonlyArray<number>, n: number): Array<number | null> {
  const k = 2 / (n + 1);
  const out: Array<number | null> = [];
  let e = Number.NaN;
  xs.forEach((x, i) => {
    if (i + 1 < n) out.push(null);
    else if (i + 1 === n) {
      e = tb(xs.slice(0, n));
      out.push(e);
    } else {
      e = x * k + e * (1 - k);
      out.push(e);
    }
  });
  return out;
}

const gan = (a: number | null | undefined, b: number | null | undefined, noi: string) => {
  if (b === null || b === undefined) {
    expect(a ?? null, noi).toBeNull();
    return;
  }
  expect(a, noi).not.toBeNull();
  expect(a ?? Number.NaN, noi).toBeCloseTo(b, 6);
};

describe('khai báo', () => {
  it('đúng sáu công thức; mỗi đường đọc một khoá extras calc thật sự trả về', () => {
    const khai = FORMULA_MODULES.filter((formula) => formula.spec.componentLines !== undefined);
    expect(khai.map((formula) => formula.spec.id)).toEqual([
      'bien-do-dao-dong-lon-nhat',
      'macd-duong-chinh',
      'macd-duong-tin-hieu',
      'dong-luong-momentum',
      'giao-cat-hai-duong-ma',
      'atr-dao-dong-thuc',
    ]);
    for (const formula of khai) {
      const view = formula.spec.componentLines;
      if (view === undefined) continue;
      expect(view.lines.length, formula.spec.id).toBeGreaterThanOrEqual(2);
      expect(view.lines[0]?.tone, formula.spec.id).toBe('primary');
      const out = runFormula(formula, defaultInputs(formula.spec), CTX_FPT);
      expect(out.value, formula.spec.id).not.toBeNull();
      for (const line of view.lines) {
        if (line.key === undefined) continue;
        expect(Number.isFinite(out.extras?.[line.key]), `${formula.spec.id}: ${line.key}`).toBe(
          true,
        );
      }
      for (const khoa of [view.periodKey, ...view.lines.map((line) => line.periodKey)]) {
        if (khoa === undefined) continue;
        expect(
          formula.spec.variables.some((variable) => variable.key === khoa),
          `${formula.spec.id}: ô ${khoa}`,
        ).toBe(true);
      }
    }
  });

  it('chưa nạp chuỗi thì không có mục; nạp rồi thì có, ngay sau "Thời gian"', () => {
    for (const formula of FORMULA_MODULES.filter((f) => f.spec.componentLines !== undefined)) {
      const chuaNap = ve(formula, CTX);
      expect(
        (chuaNap.options ?? []).map((option) => option.key),
        formula.spec.id,
      ).not.toContain(COMPONENTS_KEY);
      const daNap = ve(formula, CTX_FPT);
      if (daNap.kind === 'unavailable') throw new Error(formula.spec.id);
      const keys = daNap.options.map((option) => option.key);
      expect(keys.indexOf(COMPONENTS_KEY), formula.spec.id).toBe(keys.indexOf('__time') + 1);
    }
  });
});

describe('mỗi đường đúng định nghĩa, ở mọi phiên', () => {
  it('giao cắt hai đường MA: SMA ngắn, SMA dài, giá đóng cửa; hiệu ở phiên cuối là kết quả', () => {
    const hinh = hinhThanhPhan('giao-cat-hai-duong-ma');
    const inputs = defaultInputs(tim('giao-cat-hai-duong-ma').spec);
    const ngan = inputs['shortPeriod'] ?? 0;
    const dai = inputs['longPeriod'] ?? 0;
    const [smaNgan, smaDai, gia] = cacDuong(hinh);
    GIA.forEach((p, i) => {
      // calc đòi đủ phiên cho SMA DÀI rồi mới tính cả hai, nên SMA ngắn cũng chỉ có từ phiên ấy.
      gan(smaNgan?.[i], i + 1 < dai ? null : sma(i, ngan), `SMA ngắn phiên ${String(i)}`);
      gan(smaDai?.[i], sma(i, dai), `SMA dài phiên ${String(i)}`);
      gan(gia?.[i], p, `giá phiên ${String(i)}`);
    });
    const cuoi = GIA.length - 1;
    const out = runFormula(tim('giao-cat-hai-duong-ma'), inputs, CTX_FPT);
    gan((sma(cuoi, ngan) ?? 0) - (sma(cuoi, dai) ?? 0), out.value, 'kết quả');
    expect(hinh.primaryLabel?.vi).toBe(`SMA ${String(ngan)} phiên`);
    expect(hinh.overlays?.map((series) => series.label.vi)).toEqual([
      `SMA ${String(dai)} phiên`,
      'Giá đóng cửa',
    ]);
  });

  it('MACD: EMA nhanh, EMA chậm, giá; đường tín hiệu: MACD và EMA của chính MACD', () => {
    const inputs = defaultInputs(tim('macd-duong-chinh').spec);
    const nhanh = inputs['fastPeriod'] ?? 0;
    const cham = inputs['slowPeriod'] ?? 0;
    const tinHieu = inputs['signalPeriod'] ?? 9;
    const emaNhanh = ema(GIA, nhanh);
    const emaCham = ema(GIA, cham);

    const [dNhanh, dCham] = cacDuong(hinhThanhPhan('macd-duong-chinh'));
    GIA.forEach((_, i) => {
      gan(dNhanh?.[i], i + 1 < cham ? null : emaNhanh[i], `EMA nhanh phiên ${String(i)}`);
      gan(dCham?.[i], emaCham[i], `EMA chậm phiên ${String(i)}`);
    });

    // MACD bắt đầu từ phiên thứ `cham`; đường tín hiệu là EMA `tinHieu` phiên của dãy MACD ấy.
    const macd = GIA.map((_, i) =>
      emaCham[i] === null ? null : (emaNhanh[i] ?? 0) - (emaCham[i] ?? 0),
    );
    const macdCo = macd.filter((x): x is number => x !== null);
    const tinHieuDay = ema(macdCo, tinHieu);
    const [dMacd, dTinHieu] = cacDuong(
      hinhThanhPhan('macd-duong-tin-hieu', { signalPeriod: tinHieu }),
    );
    GIA.forEach((_, i) => {
      const k = i - (cham - 1);
      const coTinHieu = k >= 0 && tinHieuDay[k] !== null && tinHieuDay[k] !== undefined;
      gan(dMacd?.[i], coTinHieu ? macd[i] : null, `MACD phiên ${String(i)}`);
      gan(dTinHieu?.[i], coTinHieu ? (tinHieuDay[k] ?? null) : null, `tín hiệu phiên ${String(i)}`);
    });
  });

  it('động lượng: giá đóng cửa và giá n phiên trước; hiệu ở mỗi phiên là kết quả của phiên ấy', () => {
    const hinh = hinhThanhPhan('dong-luong-momentum');
    const n = defaultInputs(tim('dong-luong-momentum').spec)['period'] ?? 0;
    const [nay, truoc] = cacDuong(hinh);
    GIA.forEach((p, i) => {
      gan(nay?.[i], i < n ? null : p, `giá nay phiên ${String(i)}`);
      gan(truoc?.[i], i < n ? null : (GIA[i - n] ?? null), `giá trước phiên ${String(i)}`);
    });
    expect(hinh.overlays?.[0]?.label.vi).toBe(`Giá ${String(n)} phiên trước`);
    expect(hinh.overlays?.[0]?.dash).toBe(true);
  });

  it('biên độ dao động: đỉnh và đáy của n phiên tính tới mỗi phiên; công thức biên độ ra kết quả', () => {
    const formula = tim('bien-do-dao-dong-lon-nhat');
    const inputs = defaultInputs(formula.spec);
    const n = Math.max(10, inputs['sessions'] ?? 0);
    const [dinh, day, gia] = cacDuong(hinhThanhPhan('bien-do-dao-dong-lon-nhat'));
    GIA.forEach((p, i) => {
      const cuaSo = i + 1 < n ? null : GIA.slice(i + 1 - n, i + 1);
      gan(dinh?.[i], cuaSo === null ? null : Math.max(...cuaSo), `đỉnh phiên ${String(i)}`);
      gan(day?.[i], cuaSo === null ? null : Math.min(...cuaSo), `đáy phiên ${String(i)}`);
      gan(gia?.[i], p, `giá phiên ${String(i)}`);
    });
    const cuoi = GIA.length - 1;
    const pMax = dinh?.[cuoi] ?? 0;
    const pMin = day?.[cuoi] ?? 1;
    gan(((pMax - pMin) / pMin) * 100, runFormula(formula, inputs, CTX_FPT).value, 'kết quả');
  });

  it('ATR: dao động thực từng phiên đúng định nghĩa; đường ATR ở phiên cuối là kết quả', () => {
    const formula = tim('atr-dao-dong-thuc');
    const inputs = defaultInputs(formula.spec);
    const n = inputs['period'] ?? 0;
    const [atr, tr] = cacDuong(hinhThanhPhan('atr-dao-dong-thuc'));
    FPT_BARS.forEach((bar, i) => {
      const truoc = FPT_BARS[i - 1];
      // TR chỉ có từ khi calc tính được, tức đủ n + 1 phiên.
      const coSo = i >= n && truoc !== undefined;
      const tinhLai = coSo
        ? Math.max(
            (bar.high ?? 0) - (bar.low ?? 0),
            Math.abs((bar.high ?? 0) - (truoc.close ?? 0)),
            Math.abs((bar.low ?? 0) - (truoc.close ?? 0)),
          )
        : null;
      gan(tr?.[i], tinhLai, `TR phiên ${String(i)}`);
    });
    gan(atr?.[GIA.length - 1], runFormula(formula, inputs, CTX_FPT).value, 'kết quả');
    expect(hinhThanhPhan('atr-dao-dong-thuc').overlays?.[0]?.width).toBe(1.25);
  });
});

describe('hình', () => {
  const CAC_ID = [
    'bien-do-dao-dong-lon-nhat',
    'macd-duong-chinh',
    'macd-duong-tin-hieu',
    'dong-luong-momentum',
    'giao-cat-hai-duong-ma',
    'atr-dao-dong-thuc',
  ];

  it('một dạng (Đường), không dải tô, ô dò in mọi đường, không dấu "giá trị hiện tại"', () => {
    for (const id of CAC_ID) {
      const hinh = hinhThanhPhan(id);
      expect(dangVeCuaHinh(hinh, tim(id).spec), id).toEqual(['line']);
      expect(hinh.primaryArea, id).toBe(false);
      expect(seriesOf(hinh)[0]?.area, id).toBe(false);
      expect(hinh.hoverAllSeries, id).toBe(true);
      expect(
        hinh.points.some((point) => point.marked === true),
        id,
      ).toBe(false);
    }
  });

  it('không NaN / Infinity / undefined; mọi đường cùng lưới phiên; bảng số một cột mỗi đường', () => {
    for (const id of CAC_ID) {
      const hinh = hinhThanhPhan(id);
      expect(JSON.stringify(hinh), id).not.toMatch(/NaN|Infinity|undefined/);
      for (const series of seriesOf(hinh)) {
        expect(series.points.length, `${id}: ${series.key}`).toBe(FPT_BARS.length);
      }
      expect(hinh.table.columns.length, id).toBe(seriesOf(hinh).length + 1);
      expect(hinh.table.columns[0].vi, id).toBe('Ngày');
    }
  });

  it('số tiền trên hình viết bằng chữ ở bậc trục, ở mọi đường', () => {
    const hinh = hinhThanhPhan('giao-cat-hai-duong-ma');
    expect(hinh.y.title.vi).toBe('Giá (nghìn ₫)');
    for (const series of seriesOf(hinh)) {
      const co = series.points.filter((point) => point.y !== null);
      expect(
        co.every((point) => point.shortValueLabel?.endsWith('nghìn ₫') === true),
        series.key,
      ).toBe(true);
    }
  });

  it('nhãn theo số đang nhập: đổi ô số phiên thì tên mục và tên đường đổi theo', () => {
    const hinh = ve(tim('dong-luong-momentum'), CTX_FPT, COMPONENTS_KEY, { period: 15 });
    if (hinh.kind !== 'line') throw new Error(hinh.kind);
    expect(hinh.options.find((option) => option.key === COMPONENTS_KEY)?.label.vi).toBe(
      'Giá nay và giá 15 phiên trước',
    );
    expect(hinh.title.vi).toBe('Động lượng (Momentum) — giá nay và giá 15 phiên trước');
  });

  it('componentPoints trả null khi chưa nạp chuỗi — không có hình thì không có đường nào', () => {
    const formula = tim('giao-cat-hai-duong-ma');
    const view = formula.spec.componentLines;
    if (view === undefined) throw new Error('view');
    expect(componentPoints(formula, defaultInputs(formula.spec), CTX, view)).toBeNull();
  });
});
