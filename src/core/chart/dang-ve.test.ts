import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { FPT_BARS } from '../formulas/market-series-2026';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import type { FormulaSpec } from '../registry/types';
import { buildChartModel } from './build';
import { COMPOSITION_KEY } from './composition';
import { coDoiDau, dangVeCuaHinh, dangVeHieuLuc, laTrucRoiRac, vanhKhuyen } from './dang-ve';
import type { DangVe } from './dang-ve';
import { CLOSE_PRICE_KEY, HISTORY_KEY, historyPlan, sessionCandles } from './history';
import { stepPath } from './path';
import type { ChartPoint, DrawableChart, LineChart, WaterfallChart } from './types';

/**
 * Các DẠNG VẼ một hình mời (21/10/2026) — luật của ô chọn "Loại biểu đồ".
 *
 * Chủ dự án: mỗi dạng chỉ hiện ở hình hợp với nó. Ca dưới gác hai nửa của lời ấy: dạng hợp thì có
 * mặt, và dạng sẽ vẽ ra một hình nói sai thì vắng mặt — bậc thang trên một trục liên tục, vùng
 * âm/dương khi kết quả không đổi dấu, vành khuyên khi có một phần TRỪ.
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };
const CTX_FPT: CalcContext = {
  ...CTX,
  bars: FPT_BARS,
  series: FPT_BARS.map((bar) => bar.close ?? 0),
};

/** Một điểm dựng tay. */
function diem(x: number, y: number | null): ChartPoint {
  return { x, y, label: String(x), valueLabel: y === null ? '_ _' : String(y) };
}

const TRUC = { title: { vi: 'X', en: 'X' }, domain: [0, 10] as const, ticks: [] };

/** Một hình đường dựng tay, đủ trường cho các luật ở đây đọc. */
function hinhDuong(points: ReadonlyArray<ChartPoint>, them: Partial<LineChart> = {}): LineChart {
  return {
    kind: 'line',
    title: { vi: 'T', en: 'T' },
    summary: { vi: 'S', en: 'S' },
    x: TRUC,
    y: TRUC,
    points,
    table: { columns: [{ vi: 'X', en: 'X' }], rows: [] },
    sweepKey: 'price',
    options: [],
    ...them,
  };
}

/** Một công thức giả chỉ mang đúng ô nằm trên trục, để luật bậc thang đọc đơn vị và bước. */
function specVoi(key: string, unit: string, step?: number): FormulaSpec {
  return {
    variables: [
      {
        key,
        label: { vi: key, en: key },
        unit,
        type: 'number',
        defaultValue: 1,
        level: 'basic',
        ...(step === undefined ? {} : { step }),
      },
    ],
  } as unknown as FormulaSpec;
}

const SPEC_GIA = specVoi('price', '₫', 100);

function hinhBocTach(deltas: ReadonlyArray<number>): WaterfallChart {
  const tong = deltas.reduce((sum, value) => sum + value, 0);
  return {
    kind: 'waterfall',
    title: { vi: 'Bóc tách', en: 'Breakdown' },
    summary: { vi: 'S', en: 'S' },
    y: TRUC,
    bars: [
      ...deltas.map((delta, index) => ({
        label: { vi: `Phần ${String(index + 1)}`, en: `Part ${String(index + 1)}` },
        delta,
        cumulative: 0,
        valueLabel: `${String(delta)} ₫`,
      })),
      {
        label: { vi: 'Tổng', en: 'Total' },
        delta: tong,
        cumulative: tong,
        valueLabel: `${String(tong)} ₫`,
        isTotal: true,
      },
    ],
    table: { columns: [{ vi: 'X', en: 'X' }], rows: [] },
    options: [],
    sweepKey: '__breakdown',
  };
}

describe('luật mời từng dạng', () => {
  it('hình đường một chuỗi trên trục liên tục: Đường, Cột, Điểm — không bậc thang, không vùng âm/dương', () => {
    const hinh = hinhDuong([
      diem(1, 2),
      diem(2, 4),
      diem(3, 5),
      diem(4, 7),
      diem(5, 9),
      diem(6, 10),
    ]);
    expect(dangVeCuaHinh(hinh, SPEC_GIA)).toEqual(['line', 'bar', 'dots']);
  });

  it('hình nhiều chuỗi: không Cột, không Lãi/lỗ — mảng tô của chuỗi chính che đường phụ', () => {
    const hinh = hinhDuong([diem(1, -2), diem(2, 4)], {
      overlays: [
        {
          key: 'gia',
          label: { vi: 'Giá', en: 'Price' },
          points: [diem(1, 1), diem(2, 1)],
          tone: 'muted',
        },
      ],
    });
    expect(dangVeCuaHinh(hinh, SPEC_GIA)).toEqual(['line', 'dots']);
  });

  it('kết quả đổi dấu thì mời Lãi/lỗ; chạm 0 mà không sang phía kia thì không', () => {
    expect(coDoiDau([diem(1, -1), diem(2, 0), diem(3, 2)])).toBe(true);
    expect(coDoiDau([diem(1, 0), diem(2, 3), diem(3, null)])).toBe(false);
    expect(dangVeCuaHinh(hinhDuong([diem(1, -1), diem(2, 3)]), SPEC_GIA)).toContain('signArea');
  });

  it('trục thời gian luôn là trục rời rạc', () => {
    const hinh = hinhDuong([diem(0, 1), diem(1, 2)], { sweepKey: HISTORY_KEY });
    expect(laTrucRoiRac(hinh, SPEC_GIA)).toBe(true);
  });

  it('ô đếm kỳ phủ kín lưới bước thì rời rạc; phủ thưa hay trục giá toàn số nguyên thì không', () => {
    const nam = specVoi('years', 'năm', 1);
    const namKin = hinhDuong(
      [5, 6, 7, 8, 9].map((x) => diem(x, x * 2)),
      { sweepKey: 'years' },
    );
    const namThua = hinhDuong(
      [5, 7, 9, 11].map((x) => diem(x, x * 2)),
      { sweepKey: 'years' },
    );
    const giaNguyen = hinhDuong(
      [46_000, 48_300, 50_600, 52_900].map((x) => diem(x, x / 1000)),
      { sweepKey: 'price' },
    );

    expect(laTrucRoiRac(namKin, nam)).toBe(true);
    expect(laTrucRoiRac(namThua, nam)).toBe(false);
    expect(laTrucRoiRac(giaNguyen, SPEC_GIA)).toBe(false);
  });

  it('kết quả tự đi thành bậc thì rời rạc; đường phẳng một mức thì không', () => {
    const bac = hinhDuong([1, 2, 3, 4, 5, 6, 7, 8].map((x) => diem(x, Math.floor(x / 3))));
    const phang = hinhDuong([1, 2, 3, 4, 5, 6].map((x) => diem(x, 4)));

    expect(laTrucRoiRac(bac, SPEC_GIA)).toBe(true);
    expect(laTrucRoiRac(phang, SPEC_GIA)).toBe(false);
  });

  it('bóc tách mọi phần dương thì mời Vành khuyên; có một phần trừ thì không', () => {
    expect(dangVeCuaHinh(hinhBocTach([60, 40]), SPEC_GIA)).toEqual(['waterfall', 'donut']);
    expect(dangVeCuaHinh(hinhBocTach([60, -10]), SPEC_GIA)).toEqual(['waterfall']);
    expect(dangVeCuaHinh(hinhBocTach([10, 10, 10, 10, 10]), SPEC_GIA)).toEqual(['waterfall']);
  });

  it('dạng không còn được mời thì vẽ dạng mặc định, không vẽ bừa', () => {
    const lienTuc = hinhDuong([diem(1, 2), diem(2, 3)]);
    expect(dangVeHieuLuc(lienTuc, 'step', SPEC_GIA)).toBe('line');
    expect(dangVeHieuLuc(hinhBocTach([60, -10]), 'donut', SPEC_GIA)).toBe('waterfall');
    expect(dangVeHieuLuc(lienTuc, 'dots', SPEC_GIA)).toBe('dots');
  });
});

describe('vành khuyên', () => {
  it('phần trăm cộng lại đúng 100,0 % kể cả khi làm tròn từng phần thì ra 100,1 %', () => {
    const vanh = vanhKhuyen(hinhBocTach([64.35, 35.65]));
    const tong = (vanh?.parts ?? []).reduce(
      (sum, part) => sum + Number(part.shareLabel.replace(' %', '').replace(',', '.')),
      0,
    );

    expect(vanh?.parts).toHaveLength(2);
    expect(tong).toBeCloseTo(100, 9);
    for (const part of vanh?.parts ?? []) {
      expect(part.shareLabel).toMatch(/^\d{1,3},\d %$/);
    }
  });

  it('giữa vòng là tên và giá trị của cột tổng; tông màu theo thứ tự phần', () => {
    const vanh = vanhKhuyen(hinhBocTach([3, 1]));

    expect(vanh?.totalLabel).toEqual({ vi: 'Tổng', en: 'Total' });
    expect(vanh?.totalValueLabel).toBe('4 ₫');
    expect(vanh?.parts.map((part) => part.tone)).toEqual(['primary', 'teal']);
    expect(vanh?.parts.map((part) => part.share)).toEqual([0.75, 0.25]);
  });

  it('hình không mời Vành khuyên thì không dựng gì', () => {
    expect(vanhKhuyen(hinhBocTach([5, -1]))).toBeNull();
  });
});

describe('đường bậc thang', () => {
  it('giữ mức theo chiều ngang rồi mới nhảy, và đứt ở điểm không tính được', () => {
    const d = stepPath(
      [diem(0, 1), diem(1, 2), diem(2, null), diem(3, 4), diem(4, 3)],
      (x) => x * 10,
      (y) => y,
    );
    expect(d).toBe('M0,1 H10 V2 M30,4 H40 V3');
  });

  it('không có điểm nào vẽ được thì chuỗi rỗng', () => {
    expect(
      stepPath(
        [diem(0, null)],
        (x) => x,
        (y) => y,
      ),
    ).toBe('');
  });
});

/**
 * Cả Registry, ở trạng thái màn mở ra (số mặc định, chưa nạp chuỗi giá), mọi mục của ô "Xem theo"
 * ở chế độ Nâng cao. Con số ghim là dây báo: một công thức đổi hình là nó đỏ, và người đổi phải
 * xem dạng nào vừa xuất hiện hay biến mất ở đâu.
 */
function quetRegistry(ctx: CalcContext) {
  const dem = new Map<DangVe, number>();
  const theoDang = new Map<DangVe, string[]>();
  const hinhs: Array<{ id: string; spec: FormulaSpec; hinh: DrawableChart }> = [];

  for (const formula of FORMULA_MODULES) {
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, ctx);
    const goc = buildChartModel({ formula, inputs, ctx, output, level: 'advanced' });
    if (goc.kind === 'unavailable') continue;

    for (const option of goc.options) {
      const hinh = buildChartModel({
        formula,
        inputs,
        ctx,
        output,
        level: 'advanced',
        sweepKey: option.key,
      });
      if (hinh.kind === 'unavailable' || hinh.sweepKey !== option.key) continue;

      hinhs.push({ id: `${formula.spec.id}:${option.key}`, spec: formula.spec, hinh });
      for (const dang of dangVeCuaHinh(hinh, formula.spec)) {
        dem.set(dang, (dem.get(dang) ?? 0) + 1);
        theoDang.set(dang, [...(theoDang.get(dang) ?? []), `${formula.spec.id}:${option.key}`]);
      }
    }
  }

  return { dem: Object.fromEntries(dem), theoDang, hinhs };
}

describe('cả Registry', () => {
  const macDinh = quetRegistry(CTX);
  const coChuoi = quetRegistry(CTX_FPT);

  it('chưa nạp chuỗi giá: số hình mời từng dạng', () => {
    expect(macDinh.hinhs).toHaveLength(224);
    expect(macDinh.dem).toEqual({
      line: 211,
      bar: 211,
      dots: 211,
      step: 23,
      signArea: 27,
      waterfall: 13,
      donut: 7,
    });
  });

  it('dạng đầu tiên luôn là dạng như trước ngày có ô chọn — mở màn ra không hình nào đổi', () => {
    for (const { id, spec, hinh } of [...macDinh.hinhs, ...coChuoi.hinhs]) {
      /* Riêng mục "Cơ cấu …" (22/10/2026) sinh ra để vẽ vành khuyên, nên mở bằng vành khuyên. */
      const dauTien =
        hinh.sweepKey === COMPOSITION_KEY
          ? 'donut'
          : hinh.kind === 'waterfall'
            ? 'waterfall'
            : hinh.kind === 'histogram'
              ? 'bar'
              : 'line';
      expect(dangVeCuaHinh(hinh, spec)[0], id).toBe(dauTien);
    }
  });

  it('histogram "Phân phối lợi suất" chỉ có một dạng, nên không có ô chọn — 11 hình khi đã nạp chuỗi', () => {
    const histogram = coChuoi.hinhs.filter(({ hinh }) => hinh.kind === 'histogram');
    expect(histogram).toHaveLength(11);
    for (const { id, spec, hinh } of histogram) {
      expect(dangVeCuaHinh(hinh, spec), id).toEqual(['bar']);
    }
  });

  it('đã nạp chuỗi 250 phiên: số hình mời từng dạng', () => {
    expect(coChuoi.hinhs).toHaveLength(337);
    expect(coChuoi.dem).toEqual({
      line: 313,
      bar: 323,
      dots: 313,
      step: 102,
      signArea: 46,
      waterfall: 13,
      donut: 7,
      candle: 5,
    });
  });

  it('11 histogram: không con số nào là NaN / Infinity / undefined trong mô hình (FR-06)', () => {
    const histogram = coChuoi.hinhs.filter(({ hinh }) => hinh.kind === 'histogram');
    for (const { id, hinh } of histogram) {
      if (hinh.kind !== 'histogram') continue;
      expect(JSON.stringify(hinh), id).not.toMatch(/NaN|Infinity|undefined/);
      for (const bin of hinh.bins) {
        expect(Number.isFinite(bin.from) && Number.isFinite(bin.to), id).toBe(true);
        expect(Number.isInteger(bin.count), id).toBe(true);
      }
      for (const marker of hinh.markers) expect(Number.isFinite(marker.value), id).toBe(true);
    }
  });

  it('Vành khuyên đúng ở năm hình bóc tách mà mọi phần đều cộng vào, và ở hai hình cơ cấu', () => {
    expect(macDinh.theoDang.get('donut')).toEqual([
      'no-tren-von-chu:__composition',
      'ddm-hai-giai-doan:__breakdown',
      'wacc:__breakdown',
      'tra-gop-nien-kim:__breakdown',
      'tra-gop-goc-deu:__breakdown',
      'lai-kep:__composition',
      'thue-tncn-dau-tu:__breakdown',
    ]);
  });

  it('Nến đúng ở đường theo thời gian của năm công thức có kết quả là một mức giá', () => {
    expect(macDinh.theoDang.get('candle')).toBeUndefined();
    expect(coChuoi.theoDang.get('candle')).toEqual([
      'sma-n-phien:__time',
      'ema-n-phien:__time',
      'dai-bollinger-tren:__time',
      'dai-bollinger-duoi:__time',
      'vwap:__time',
    ]);
  });

  it('Lãi/lỗ chỉ ở hình một chuỗi mà kết quả có cả số dương lẫn số âm', () => {
    for (const { id, spec, hinh } of [...macDinh.hinhs, ...coChuoi.hinhs]) {
      if (hinh.kind !== 'line') continue;
      const motChuoi = hinh.overlays === undefined || hinh.overlays.length === 0;
      expect(dangVeCuaHinh(hinh, spec).includes('signArea'), id).toBe(
        motChuoi && coDoiDau(hinh.points),
      );
    }
  });

  it('nạp chuỗi giá rồi thì mọi đường theo thời gian đều mời Bậc thang', () => {
    const theoThoiGian = coChuoi.hinhs.filter(({ hinh }) => hinh.sweepKey === HISTORY_KEY);
    expect(theoThoiGian.length).toBeGreaterThan(40);
    for (const { id, spec, hinh } of theoThoiGian) {
      expect(dangVeCuaHinh(hinh, spec), id).toContain('step');
    }
  });

  it('Bậc thang không bao giờ được mời trên trục tiền hay trục giá', () => {
    for (const { id, spec, hinh } of [...macDinh.hinhs, ...coChuoi.hinhs]) {
      if (hinh.kind !== 'line' || !dangVeCuaHinh(hinh, spec).includes('step')) continue;
      const bien = spec.variables.find((variable) => variable.key === hinh.sweepKey);
      const lamTron = ['so-hop-dong-toi-da', 'co-vi-the-phai-sinh', 'so-ky-dca'].some((goc) =>
        id.startsWith(`${goc}:`),
      );
      if (bien === undefined || lamTron) continue;
      expect(['năm', 'tháng', 'kỳ', 'phiên', 'ngày'], id).toContain(bien.unit);
    }
  });
});

/**
 * Dạng NẾN (21/10/2026) — nến của từng phiên dưới đường kết quả.
 *
 * Ba điều kiện, mỗi điều một ca: công thức khai kết quả là một mức giá, trục đang là thời gian, và
 * mọi phiên đủ bốn giá khớp nhau. Thiếu một là dạng Nến vắng mặt khỏi ô chọn.
 */
describe('dạng Nến', () => {
  const tim = (id: string) => {
    const formula = FORMULA_MODULES.find((module) => module.spec.id === id);
    if (formula === undefined) throw new Error(id);
    return formula;
  };

  function dung(
    id: string,
    ctx: CalcContext,
    them: { candleRange?: boolean; sweepKey?: string } = {},
  ) {
    const formula = tim(id);
    const inputs = defaultInputs(formula.spec);
    return buildChartModel({
      formula,
      inputs,
      ctx,
      output: runFormula(formula, inputs, ctx),
      level: 'advanced',
      ...them,
    });
  }

  it('đúng năm công thức khai priceLevel, mọi công thức ấy ra ₫ và vẽ được theo thời gian', () => {
    const daKhai = FORMULA_MODULES.filter((formula) => formula.spec.priceLevel === true);
    expect(daKhai.map((formula) => formula.spec.id)).toEqual([
      'sma-n-phien',
      'ema-n-phien',
      'dai-bollinger-tren',
      'dai-bollinger-duoi',
      'vwap',
    ]);
    for (const formula of daKhai) {
      expect(formula.spec.resultUnit, formula.spec.id).toBe('₫');
      expect(historyPlan(formula, CTX.asOf), formula.spec.id).not.toBeNull();
    }
  });

  it('kết quả nằm trong dải giá của phiên: đường kết quả đứng cùng thang với nến', () => {
    for (const id of [
      'sma-n-phien',
      'ema-n-phien',
      'dai-bollinger-tren',
      'dai-bollinger-duoi',
      'vwap',
    ]) {
      const hinh = dung(id, CTX_FPT);
      if (hinh.kind !== 'line') throw new Error(id);
      const thap = Math.min(...FPT_BARS.map((bar) => bar.low ?? Infinity));
      const cao = Math.max(...FPT_BARS.map((bar) => bar.high ?? -Infinity));
      for (const point of hinh.points) {
        if (point.y === null) continue;
        // Dải Bollinger được phép ra ngoài dải giá một chút — trong một nửa biên độ cả năm.
        expect(point.y, id).toBeGreaterThan(thap - (cao - thap) / 2);
        expect(point.y, id).toBeLessThan(cao + (cao - thap) / 2);
      }
    }
  });

  it('chuỗi chỉ có giá đóng cửa (Finbox, bảng dán một cột) thì không có Nến', () => {
    const chiDong = FPT_BARS.map((bar) => ({ ...bar, open: null, high: null, low: null }));
    const ctx: CalcContext = { ...CTX_FPT, bars: chiDong };

    expect(sessionCandles(ctx)).toBeNull();
    const hinh = dung('ema-n-phien', ctx);
    expect(hinh.kind).toBe('line');
    if (hinh.kind !== 'line') return;
    expect(hinh.candles).toBeUndefined();
    expect(dangVeCuaHinh(hinh, tim('ema-n-phien').spec)).not.toContain('candle');
  });

  it('một phiên có giá cao dưới giá đóng là cả chuỗi không có Nến — không vẽ chuỗi thủng một lỗ', () => {
    const hong = FPT_BARS.map((bar, index) =>
      index === 100 ? { ...bar, high: (bar.close ?? 0) - 100 } : bar,
    );
    expect(sessionCandles({ ...CTX_FPT, bars: hong })).toBeNull();
    expect(sessionCandles(CTX_FPT)).toHaveLength(FPT_BARS.length);
  });

  it('trục quét thì không có Nến, kể cả khi đã nạp chuỗi đủ bốn giá', () => {
    const hinh = dung('sma-n-phien', CTX_FPT, { sweepKey: 'period' });
    expect(hinh.kind).toBe('line');
    if (hinh.kind !== 'line') return;
    expect(hinh.sweepKey).toBe('period');
    expect(hinh.candles).toBeUndefined();
  });

  it('công thức tính bằng ₫ mà không phải một mức giá (MACD, ATR) thì không có Nến', () => {
    for (const id of ['macd-duong-chinh', 'atr-dao-dong-thuc', 'dong-luong-momentum']) {
      const hinh = dung(id, CTX_FPT);
      if (hinh.kind !== 'line') continue;
      expect(hinh.candles, id).toBeUndefined();
    }
  });

  it('xem Nến thì trục ôm giá cao và thấp của mọi phiên; xem Đường thì trục giữ như cũ', () => {
    const duong = dung('dai-bollinger-tren', CTX_FPT);
    const nen = dung('dai-bollinger-tren', CTX_FPT, { candleRange: true });
    if (duong.kind !== 'line' || nen.kind !== 'line') throw new Error('bb');

    const thap = Math.min(...FPT_BARS.map((bar) => bar.low ?? Infinity));
    const cao = Math.max(...FPT_BARS.map((bar) => bar.high ?? -Infinity));
    expect(nen.y.domain[0]).toBeLessThanOrEqual(thap);
    expect(nen.y.domain[1]).toBeGreaterThanOrEqual(cao);
    // Dải trên không xuống tới giá thấp nhất của một phiên, nên dạng Đường có trục hẹp hơn.
    expect(duong.y.domain[0]).toBeGreaterThan(nen.y.domain[0]);

    // Cờ không đổi dữ liệu: cùng điểm, cùng bảng số, cùng nến.
    expect(nen.points.map((point) => point.y)).toEqual(duong.points.map((point) => point.y));
    expect(nen.table).toEqual(duong.table);
    expect(nen.candles).toEqual(duong.candles);
  });

  it('hình dạng Nến có tên gọn cho legend và nói ra lớp nến bằng chữ', () => {
    const nen = dung('dai-bollinger-tren', CTX_FPT, { candleRange: true });
    const duong = dung('dai-bollinger-tren', CTX_FPT);
    if (nen.kind !== 'line' || duong.kind !== 'line') throw new Error('bb');

    expect(nen.primaryLabel).toEqual({ vi: 'Dải Bollinger trên', en: 'Upper Bollinger band' });
    expect(duong.primaryLabel).toBeUndefined();
    expect(nen.summary.vi).toMatch(
      /Vẽ kèm nến của từng phiên, giá thấp nhất .+ ₫, cao nhất .+ ₫\./,
    );
    expect(nen.summary.en).toMatch(/a candle for each session/);
    expect(duong.summary.vi).not.toMatch(/nến/);
  });

  it('SMA ở dạng Nến giữ nhãn có số phiên và giữ chuỗi giá đóng cửa trong mô hình', () => {
    const nen = dung('sma-n-phien', CTX_FPT, { candleRange: true });
    if (nen.kind !== 'line') throw new Error('sma');

    expect(nen.primaryLabel?.vi).toMatch(/^SMA \d+ phiên$/);
    expect(nen.overlays?.map((series) => series.key)).toEqual([CLOSE_PRICE_KEY]);
    // Ô chọn đọc cùng một danh sách dù màn đang vẽ Đường hay Nến.
    const duong = dung('sma-n-phien', CTX_FPT);
    if (duong.kind !== 'line') throw new Error('sma');
    expect(dangVeCuaHinh(nen, tim('sma-n-phien').spec)).toEqual(
      dangVeCuaHinh(duong, tim('sma-n-phien').spec),
    );
  });
});

describe('zeroBaseline chỉ nới trục khi hình thật sự vẽ được cột', () => {
  const sma = FORMULA_MODULES.find((m) => m.spec.id === 'sma-n-phien');
  if (sma === undefined) throw new Error('sma-n-phien');

  function mien(zeroBaseline: boolean, sweepKey: string) {
    const inputs = defaultInputs(sma!.spec);
    const hinh = buildChartModel({
      formula: sma!,
      inputs,
      ctx: CTX_FPT,
      output: runFormula(sma!, inputs, CTX_FPT),
      level: 'advanced',
      sweepKey,
      zeroBaseline,
    });
    if (hinh.kind !== 'line') throw new Error(hinh.kind);
    return hinh;
  }

  it('trục thời gian có đường giá kèm: xin mốc 0 cũng không kéo trục về 0 (màn vẽ đường)', () => {
    const khong = mien(false, HISTORY_KEY);
    const co = mien(true, HISTORY_KEY);
    expect(co.overlays?.length ?? 0).toBeGreaterThan(0);
    expect(co.y.domain).toEqual(khong.y.domain);
    expect(co.y.domain[0]).toBeGreaterThan(0);
  });

  it('trục một chuỗi (Cột được mời): xin mốc 0 vẫn nới trục tới 0', () => {
    const co = mien(true, 'period');
    expect(co.y.domain[0]).toBeLessThanOrEqual(0);
  });
});
