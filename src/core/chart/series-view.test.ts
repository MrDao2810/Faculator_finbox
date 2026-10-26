import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { FPT_BARS } from '../formulas/market-series-2026';
import { simpleReturns } from '../formulas/series-utils';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import type { FormulaModule } from '../calc/types';
import { buildChartModel } from './build';
import { dangVeCuaHinh } from './dang-ve';
import { HISTORY_KEY } from './history';
import {
  DISTRIBUTION_KEY,
  DRAWDOWN_KEY,
  drawdownSeries,
  laHinhChuoiGia,
  seriesWindow,
} from './series-view';

/**
 * Hai hình theo chuỗi giá của ô "Xem theo" (21/10/2026): "Phân phối lợi suất" và "Đường sụt giảm".
 *
 * Điều đáng gác nhất: hình vẽ ĐÚNG cửa sổ phiên mà `calc` dùng. Cửa sổ khai ở `spec.seriesView`,
 * còn `calc` cắt bằng hàm riêng của từng file (`windowOf`, `windowCloses`, `requireCloses`), nên
 * hai bên có thể lệch mà không ai thấy. Ca "phép thử nhiễu" bên dưới bắt đúng điều ấy: đổi một
 * phiên ngay TRƯỚC cửa sổ thì kết quả phải đứng yên, đổi phiên ĐẦU cửa sổ thì kết quả phải đổi.
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };

function ctxVoi(bars: typeof FPT_BARS): CalcContext {
  return {
    ...CTX,
    bars,
    series: bars.map((bar) => bar.close ?? 0).filter((close) => close > 0),
  };
}

const CTX_FPT = ctxVoi(FPT_BARS);

const tim = (id: string): FormulaModule => {
  const formula = FORMULA_MODULES.find((module) => module.spec.id === id);
  if (formula === undefined) throw new Error(id);
  return formula;
};

function dung(formula: FormulaModule, ctx: CalcContext, sweepKey?: string) {
  const inputs = defaultInputs(formula.spec);
  const output = runFormula(formula, inputs, ctx);
  return buildChartModel({
    formula,
    inputs,
    ctx,
    output,
    level: 'advanced',
    ...(sweepKey === undefined ? {} : { sweepKey }),
  });
}

const DA_KHAI = FORMULA_MODULES.filter((formula) => formula.spec.seriesView !== undefined);

describe('khai báo', () => {
  it('đúng 15 công thức: 11 phân phối lợi suất, 4 đường sụt giảm', () => {
    const theoDang = (kind: string) =>
      DA_KHAI.filter((formula) => formula.spec.seriesView?.kind === kind).map(
        (formula) => formula.spec.id,
      );

    expect(theoDang('distribution')).toEqual([
      'var-lich-su',
      'cvar-lich-su',
      'do-lech-chuan-loi-suat-phien',
      'do-bien-dong-nam-hoa',
      'do-lech-chuan-ban-phan',
      'he-so-bien-thien',
      'ty-so-sharpe',
      'ty-so-sortino',
      'ty-so-treynor',
      'ty-so-thong-tin',
      'ty-so-thang-thua',
    ]);
    expect(theoDang('drawdown')).toEqual([
      'sut-giam-sau-nhat',
      'sut-giam-hien-tai',
      'chuoi-phien-giam-dai-nhat',
      'ty-so-calmar',
    ]);
  });

  it('ô nhập cửa sổ phải là một ô thật của công thức, và cả 15 đều vẽ được theo thời gian', () => {
    for (const formula of DA_KHAI) {
      const view = formula.spec.seriesView;
      if (view?.lookbackKey !== undefined) {
        expect(
          formula.spec.variables.some((variable) => variable.key === view.lookbackKey),
          formula.spec.id,
        ).toBe(true);
      }
      const hinh = dung(formula, CTX_FPT);
      expect(hinh.kind, formula.spec.id).toBe('line');
      if (hinh.kind === 'line') expect(hinh.sweepKey, formula.spec.id).toBe(HISTORY_KEY);
    }
  });
});

describe('mục trong ô chọn', () => {
  it('chưa nạp chuỗi thì không có; nạp rồi thì đứng ngay sau "Thời gian"', () => {
    for (const formula of DA_KHAI) {
      const khoa =
        formula.spec.seriesView?.kind === 'distribution' ? DISTRIBUTION_KEY : DRAWDOWN_KEY;

      const chuaNap = dung(formula, CTX);
      const mucChuaNap = chuaNap.kind === 'unavailable' ? [] : chuaNap.options;
      expect(
        mucChuaNap.map((option) => option.key),
        formula.spec.id,
      ).not.toContain(khoa);

      const daNap = dung(formula, CTX_FPT);
      if (daNap.kind === 'unavailable') throw new Error(formula.spec.id);
      const keys = daNap.options.map((option) => option.key);
      expect(keys.indexOf(khoa), formula.spec.id).toBe(keys.indexOf(HISTORY_KEY) + 1);
    }
  });

  it('chuỗi ngắn hơn số phiên tối thiểu của calc thì mục vắng mặt', () => {
    const varLichSu = tim('var-lich-su');
    const min = varLichSu.spec.seriesView?.min ?? 0;
    expect(min).toBeGreaterThan(5);

    const thieu = dung(varLichSu, ctxVoi(FPT_BARS.slice(-(min - 1))));
    const du = dung(varLichSu, ctxVoi(FPT_BARS.slice(-min)));
    expect(
      (thieu.kind === 'unavailable' ? [] : thieu.options).map((option) => option.key),
    ).not.toContain(DISTRIBUTION_KEY);
    expect((du.kind === 'unavailable' ? [] : du.options).map((option) => option.key)).toContain(
      DISTRIBUTION_KEY,
    );
  });

  /*
   * Cổng chung cho cả hai họ cắt cửa sổ (`windowOf` kẹp ngắn, `windowCloses` đòi đủ ô): với chuỗi dài
   * L, `calc` tính được thì hình có cửa sổ, `calc` báo thiếu phiên thì hình không có — không bao giờ
   * lệch. Các độ dài thử: sát dưới và đúng sàn `min`, và quanh ô cửa sổ mặc định.
   */
  it('hình có cửa sổ khi và chỉ khi calc tính được, ở mọi độ dài chuỗi', () => {
    for (const formula of DA_KHAI) {
      const view = formula.spec.seriesView;
      if (view === undefined) continue;
      const inputs = defaultInputs(formula.spec);
      const o = view.lookbackKey === undefined ? view.min : (inputs[view.lookbackKey] ?? view.min);
      const dodai = [view.min - 1, view.min, view.min + 5, o - 1, o, o + 1].filter(
        (n) => n >= 2 && n <= FPT_BARS.length,
      );
      for (const n of dodai) {
        const ctx = ctxVoi(FPT_BARS.slice(-n));
        const tinhDuoc = runFormula(formula, inputs, ctx).value !== null;
        const coCuaSo = seriesWindow(view, inputs, ctx) !== null;
        expect(coCuaSo, `${formula.spec.id} với ${String(n)} phiên`).toBe(tinhDuoc);
      }
    }
  });

  it('họ đòi đủ ô: 45 phiên mà ô là 60 thì cả hai hình vắng mặt', () => {
    for (const id of ['do-lech-chuan-loi-suat-phien', 'chuoi-phien-giam-dai-nhat']) {
      const hinh = dung(tim(id), ctxVoi(FPT_BARS.slice(-45)));
      expect(
        (hinh.kind === 'unavailable' ? [] : hinh.options).map((option) => option.key),
        id,
      ).not.toContain(id === 'chuoi-phien-giam-dai-nhat' ? DRAWDOWN_KEY : DISTRIBUTION_KEY);
    }
  });

  it('công thức không khai thì không có mục nào, kể cả khi đã nạp chuỗi', () => {
    for (const id of ['pe', 'sma-n-phien', 'beta', 'bien-do-dao-dong-lon-nhat']) {
      const hinh = dung(tim(id), CTX_FPT);
      const keys = (hinh.kind === 'unavailable' ? [] : hinh.options).map((option) => option.key);
      expect(
        keys.some((khoa) => laHinhChuoiGia(khoa)),
        id,
      ).toBe(false);
    }
  });
});

describe('cửa sổ phiên — đúng cửa sổ calc dùng (phép thử nhiễu)', () => {
  for (const formula of DA_KHAI) {
    it(formula.spec.id, () => {
      const view = formula.spec.seriesView;
      if (view === undefined) throw new Error(formula.spec.id);
      const inputs = defaultInputs(formula.spec);
      const cuaSo = seriesWindow(view, inputs, CTX_FPT);
      if (cuaSo === null) throw new Error(`${formula.spec.id}: không có cửa sổ`);

      const goc = runFormula(formula, inputs, CTX_FPT).value;
      expect(goc, formula.spec.id).not.toBeNull();

      const batDau = FPT_BARS.length - cuaSo.closes.length;
      const nhieu = (index: number) =>
        runFormula(
          formula,
          inputs,
          ctxVoi(
            FPT_BARS.map((bar, i) => (i === index ? { ...bar, close: (bar.close ?? 0) * 3 } : bar)),
          ),
        ).value;

      // Phiên ngay TRƯỚC cửa sổ: kết quả đứng yên. (Cửa sổ là cả chuỗi thì không có phiên ấy.)
      if (batDau > 0) expect(nhieu(batDau - 1), `${formula.spec.id}: ngoài cửa sổ`).toBe(goc);

      // Phiên ĐẦU cửa sổ: kết quả đổi — trừ chuỗi phiên giảm dài nhất, một số ĐẾM mà nhân ba một
      // giá chưa chắc đổi; với nó, số phiên giảm trong cửa sổ phải bằng tổng các chuỗi calc đếm.
      if (view.mark === 'streakEnd') {
        const out = runFormula(formula, inputs, CTX_FPT);
        const tongChuoi = Object.entries(out.extras ?? {})
          .filter(([key]) => /^k\d+$/.test(key))
          .reduce((sum, [, value]) => sum + value, 0);
        const soPhienGiam = simpleReturns(cuaSo.closes).filter((r) => r < 0).length;
        expect(tongChuoi, formula.spec.id).toBe(soPhienGiam);
      } else {
        expect(nhieu(batDau), `${formula.spec.id}: trong cửa sổ`).not.toBe(goc);
      }
    });
  }

  it('chuỗi giảm dài nhất: cửa sổ toàn phiên tăng thì không đánh dấu phiên nào', () => {
    const formula = tim('chuoi-phien-giam-dai-nhat');
    const tang = FPT_BARS.slice(-60).map((bar, i) => {
      const gia = 100 + i;
      return { ...bar, open: gia, high: gia, low: gia, close: gia };
    });
    const hinh = dung(formula, ctxVoi(tang), DRAWDOWN_KEY);
    if (hinh.kind !== 'line') throw new Error(hinh.kind);
    expect(hinh.points.some((point) => point.marked === true)).toBe(false);
    expect(hinh.summary.vi).not.toContain('Chuỗi giảm dài nhất kết thúc');
  });

  it('ô cửa sổ để trống thì không có cửa sổ — calc cũng không tính', () => {
    const view = tim('var-lich-su').spec.seriesView;
    if (view === undefined) throw new Error('var');
    expect(seriesWindow(view, { confidence: 95 }, CTX_FPT)).toBeNull();
  });

  it('ô cửa sổ dưới sàn thì kẹp lên sàn, như windowOf()', () => {
    const view = tim('var-lich-su').spec.seriesView;
    if (view === undefined) throw new Error('var');
    const cuaSo = seriesWindow(view, { lookback: 5, confidence: 95 }, CTX_FPT);
    expect(cuaSo?.closes).toHaveLength(view.min);
  });
});

describe('phân phối lợi suất', () => {
  it('mỗi lợi suất rơi vào đúng một khoảng; 0 là một mép khoảng; bảng số một dòng mỗi khoảng', () => {
    for (const id of ['var-lich-su', 'ty-so-sharpe', 'do-lech-chuan-loi-suat-phien']) {
      const formula = tim(id);
      const hinh = dung(formula, CTX_FPT, DISTRIBUTION_KEY);
      if (hinh.kind !== 'histogram') throw new Error(id);
      const view = formula.spec.seriesView;
      const cuaSo =
        view === undefined ? null : seriesWindow(view, defaultInputs(formula.spec), CTX_FPT);
      const soLoiSuat = simpleReturns(cuaSo?.closes ?? []).length;

      expect(
        hinh.bins.reduce((sum, bin) => sum + bin.count, 0),
        id,
      ).toBe(soLoiSuat);
      expect(
        hinh.bins.some((bin) => Math.abs(bin.from) < 1e-9 || Math.abs(bin.to) < 1e-9),
        id,
      ).toBe(true);
      hinh.bins.forEach((bin, index) => {
        const sau = hinh.bins[index + 1];
        if (sau !== undefined) expect(bin.to, id).toBeCloseTo(sau.from, 9);
      });
      expect(hinh.table.rows, id).toHaveLength(hinh.bins.length);
      expect(hinh.x.domain[0], id).toBe(hinh.bins[0]?.from);
      expect(hinh.y.domain[0], id).toBe(0);
      for (const tick of hinh.y.ticks) expect(Number.isInteger(tick.value), id).toBe(true);
      expect(dangVeCuaHinh(hinh, formula.spec), id).toEqual(['bar']);
    }
  });

  it('VaR: vạch bình quân và vạch tại −VaR, đúng con số khối Kết quả in', () => {
    const formula = tim('var-lich-su');
    const inputs = defaultInputs(formula.spec);
    const out = runFormula(formula, inputs, CTX_FPT);
    const hinh = dung(formula, CTX_FPT, DISTRIBUTION_KEY);
    if (hinh.kind !== 'histogram' || out.value === null) throw new Error('var');

    const tenGon = formula.spec.name.vi.split(/s[—–]s/)[0] ?? '';
    expect(hinh.markers.map((marker) => marker.label.vi)).toEqual(['Bình quân', tenGon]);
    expect(hinh.markers[1]?.value).toBeCloseTo(-out.value, 9);
    expect(hinh.markers[1]?.valueLabel).toContain('%');
    expect(hinh.summary.vi).toContain(`${tenGon}: `);
    expect(hinh.sweepKey).toBe(DISTRIBUTION_KEY);
    expect(hinh.title.vi).toBe(`${tenGon} — phân phối lợi suất phiên`);
  });

  it('Sharpe không phải mức lỗ nên chỉ có vạch bình quân; kết quả lỗi thì không có vạch kết quả', () => {
    const sharpe = dung(tim('ty-so-sharpe'), CTX_FPT, DISTRIBUTION_KEY);
    if (sharpe.kind !== 'histogram') throw new Error('sharpe');
    expect(sharpe.markers.map((marker) => marker.label.vi)).toEqual(['Bình quân']);

    // Chuỗi chỉ đi lên: VaR 95% là một mức tăng, calc từ chối — histogram vẫn vẽ, không có vạch VaR.
    const tangDeu = FPT_BARS.map((bar, i) => ({
      ...bar,
      close: 1000 + i,
      open: null,
      high: null,
      low: null,
    }));
    const varTang = dung(tim('var-lich-su'), ctxVoi(tangDeu), DISTRIBUTION_KEY);
    if (varTang.kind !== 'histogram') throw new Error('var');
    expect(varTang.markers.map((marker) => marker.label.vi)).toEqual(['Bình quân']);
  });
});

describe('đường sụt giảm', () => {
  it('mức sụt sâu nhất của đường bằng đúng kết quả của "sụt giảm sâu nhất", và điểm ấy mang dấu', () => {
    const formula = tim('sut-giam-sau-nhat');
    const out = runFormula(formula, defaultInputs(formula.spec), CTX_FPT);
    const hinh = dung(formula, CTX_FPT, DRAWDOWN_KEY);
    if (hinh.kind !== 'line' || out.value === null) throw new Error('mdd');

    const ys = hinh.points.map((point) => point.y ?? 0);
    expect(Math.max(...ys)).toBeCloseTo(out.value, 9);
    const danhDau = hinh.points.find((point) => point.marked === true);
    expect(danhDau?.y).toBeCloseTo(out.value, 9);
    expect(hinh.sweepKey).toBe(DRAWDOWN_KEY);
    expect(hinh.title.vi).toBe('Mức sụt giảm sâu nhất — đường sụt giảm');
    expect(hinh.x.title.vi).toBe('Ngày');
    expect(hinh.points[0]?.label).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
  });

  it('điểm cuối của đường bằng đúng kết quả của "sụt giảm hiện tại", và nó mang dấu', () => {
    const formula = tim('sut-giam-hien-tai');
    const out = runFormula(formula, defaultInputs(formula.spec), CTX_FPT);
    const hinh = dung(formula, CTX_FPT, DRAWDOWN_KEY);
    if (hinh.kind !== 'line' || out.value === null) throw new Error('dd');

    const cuoi = hinh.points[hinh.points.length - 1];
    expect(cuoi?.y).toBeCloseTo(out.value, 9);
    expect(cuoi?.marked).toBe(true);
    expect(hinh.points.filter((point) => point.marked === true)).toHaveLength(1);
  });

  it('Calmar: mức sâu nhất của đường bằng mức sụt giảm calc chia cho', () => {
    const formula = tim('ty-so-calmar');
    const out = runFormula(formula, defaultInputs(formula.spec), CTX_FPT);
    const hinh = dung(formula, CTX_FPT, DRAWDOWN_KEY);
    if (hinh.kind !== 'line') throw new Error('calmar');
    expect(Math.max(...hinh.points.map((point) => point.y ?? 0))).toBeCloseTo(
      out.extras?.maxDrawdown ?? Number.NaN,
      9,
    );
  });

  it('chuỗi phiên giảm dài nhất: dấu ở phiên kết thúc chuỗi ấy, và chuỗi dài đúng bằng kết quả', () => {
    const formula = tim('chuoi-phien-giam-dai-nhat');
    const inputs = defaultInputs(formula.spec);
    const out = runFormula(formula, inputs, CTX_FPT);
    const hinh = dung(formula, CTX_FPT, DRAWDOWN_KEY);
    const view = formula.spec.seriesView;
    const cuaSo = view === undefined ? null : seriesWindow(view, inputs, CTX_FPT);
    if (hinh.kind !== 'line' || out.value === null || cuaSo === null) throw new Error('streak');

    const cuoiChuoi = hinh.points.findIndex((point) => point.marked === true);
    const returns = simpleReturns(cuaSo.closes);
    let dai = 0;
    for (let j = cuoiChuoi - 1; j >= 0 && (returns[j] ?? 0) < 0; j -= 1) dai += 1;
    expect(dai).toBe(out.value);
    expect(hinh.summary.vi).toContain('Chuỗi giảm dài nhất kết thúc ở');
  });

  it('đường sụt giảm là trục rời rạc: mời Bậc thang, không mời Lãi/lỗ', () => {
    const formula = tim('sut-giam-sau-nhat');
    const hinh = dung(formula, CTX_FPT, DRAWDOWN_KEY);
    if (hinh.kind !== 'line') throw new Error('dd');
    expect(dangVeCuaHinh(hinh, formula.spec)).toEqual(['line', 'bar', 'dots', 'step']);
  });

  it('drawdownSeries: 0 ở mỗi đỉnh mới, dương khi dưới đỉnh', () => {
    expect(drawdownSeries([100, 110, 99, 121, 60.5])).toEqual([0, 0, 10, 0, 50]);
  });

  it('chuỗi không có ngày thì nhãn phiên đánh số', () => {
    const formula = tim('sut-giam-sau-nhat');
    const ctx: CalcContext = { ...CTX, series: FPT_BARS.map((bar) => bar.close ?? 0) };
    const hinh = dung(formula, ctx, DRAWDOWN_KEY);
    if (hinh.kind !== 'line') throw new Error('dd');
    expect(hinh.points[0]?.label).toBe('Phiên 1');
  });
});
