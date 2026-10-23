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
import { GAUGE_KEY } from './gauge';
import type { ChartModel, GaugeChart } from './types';

/**
 * THANG ĐO — mục "Thang đo" của ô "Xem theo" (23/10/2026), kiểu hình mới thứ tư chủ dự án chọn.
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };
const CTX_FPT: CalcContext = {
  ...CTX,
  bars: FPT_BARS,
  series: FPT_BARS.map((bar) => bar.close ?? 0),
};

function congThuc(id: string): FormulaModule {
  const formula = FORMULA_MODULES.find((item) => item.spec.id === id);
  if (formula === undefined) throw new Error(`không có công thức ${id}`);
  return formula;
}

function ve(
  formula: FormulaModule,
  inputs: CalcInputs,
  ctx: CalcContext,
  sweepKey?: string,
): ChartModel {
  return buildChartModel({
    formula,
    inputs,
    ctx,
    output: runFormula(formula, inputs, ctx),
    level: 'advanced',
    ...(sweepKey === undefined ? {} : { sweepKey }),
  });
}

function thangDo(id: string, ctx: CalcContext = CTX_FPT): GaugeChart {
  const formula = congThuc(id);
  const model = ve(formula, defaultInputs(formula.spec), ctx, GAUGE_KEY);
  if (model.kind !== 'gauge') throw new Error(`${id}: không ra thang đo`);
  return model;
}

const CO_THANG = FORMULA_MODULES.filter((formula) => formula.spec.gauge !== undefined);

describe('cả Registry', () => {
  it('đúng ba chỉ báo có thang cố định khai thang đo — thêm công thức là một quyết định', () => {
    expect(CO_THANG.map((formula) => formula.spec.id).sort()).toEqual([
      'phan-tram-b-bollinger',
      'rsi-wilder',
      'stochastic-k',
    ]);
  });

  it.each(CO_THANG.map((formula) => [formula.spec.id, formula] as const))(
    '%s: các vùng nối tiếp, ranh giới đúng là các mốc tham chiếu, và chỉ có khi kết quả tính được',
    (id, formula) => {
      const thang = formula.spec.gauge;
      if (thang === undefined) throw new Error('thiếu gauge');
      expect(thang.min).toBeLessThan(thang.max);
      expect(thang.zones.length).toBeGreaterThanOrEqual(2);
      expect(thang.zones.length).toBeLessThanOrEqual(3);
      expect(thang.zones.at(-1)?.to).toBe(thang.max);
      for (let index = 1; index < thang.zones.length; index += 1) {
        expect(thang.zones[index]?.to).toBeGreaterThan(thang.zones[index - 1]?.to ?? Infinity);
      }
      // Hình đường kẻ các mốc nào thì thang đo chia đúng ở các mốc ấy.
      const ranhGioi = thang.zones.slice(0, -1).map((zone) => zone.to);
      expect(ranhGioi).toEqual((formula.spec.referenceLines ?? []).map((line) => line.value));

      // Chưa nạp chuỗi: kết quả chưa tính được, mục vắng.
      const chuaNap = ve(formula, defaultInputs(formula.spec), CTX);
      expect('options' in chuaNap ? (chuaNap.options ?? []).map((o) => o.key) : []).not.toContain(
        GAUGE_KEY,
      );

      // Đã nạp chuỗi: có mục, kim chỉ đúng kết quả, không bao giờ là hình mở ra.
      const hinh = thangDo(id);
      const ketQua = runFormula(formula, defaultInputs(formula.spec), CTX_FPT).value;
      expect(hinh.value).toBe(ketQua);
      expect(hinh.options.map((option) => option.key)).toContain(GAUGE_KEY);
      expect(dangVeCuaHinh(hinh, formula.spec)).toEqual(['gauge']);
      expect(JSON.stringify(hinh)).not.toMatch(/NaN|Infinity|undefined/);
      const vung = hinh.zones[hinh.activeZone];
      const kep = Math.min(Math.max(hinh.value, hinh.min), hinh.max);
      expect(kep).toBeGreaterThanOrEqual(vung?.from ?? Infinity);
      expect(kep).toBeLessThanOrEqual(vung?.to ?? -Infinity);
      const moRa = ve(formula, defaultInputs(formula.spec), CTX_FPT);
      expect('sweepKey' in moRa ? moRa.sweepKey : undefined).not.toBe(GAUGE_KEY);
    },
  );
});

describe('rsi-wilder', () => {
  it('ba vùng 0–30 · 30–70 · 70–100, khoảng viết sẵn, bảng số có dòng giá trị hiện tại', () => {
    const hinh = thangDo('rsi-wilder');
    expect(hinh.zones.map((zone) => [zone.label.vi, zone.rangeLabel])).toEqual([
      ['Quá bán', '< 30 điểm'],
      ['Trung tính', '30 – 70 điểm'],
      ['Quá mua', '> 70 điểm'],
    ]);
    expect(hinh.table.rows.at(-1)?.[0]).toEqual({ vi: 'Giá trị hiện tại', en: 'Current value' });
    expect(hinh.table.rows.at(-1)?.[1]).toBe(hinh.valueLabel);
  });
});

describe('phan-tram-b-bollinger', () => {
  it('số vượt xa thang: kim nằm ở đầu thang, vùng là "Trên dải trên", chữ vẫn là số thật', () => {
    /* Phiên cuối vọt lên gấp rưỡi: %B vượt hẳn dải trên, xa hơn đầu thang 125%. */
    const bars = FPT_BARS.map((bar, index) =>
      index === FPT_BARS.length - 1
        ? { ...bar, close: (bar.close ?? 0) * 1.5, high: (bar.close ?? 0) * 1.5 }
        : bar,
    );
    const ctx: CalcContext = { ...CTX, bars, series: bars.map((bar) => bar.close ?? 0) };
    const hinh = thangDo('phan-tram-b-bollinger', ctx);
    expect(hinh.value).toBeGreaterThan(125);
    expect(hinh.zones[hinh.activeZone]?.label.vi).toBe('Trên dải trên');
    expect(hinh.valueLabel).toBe(
      `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }).format(hinh.value)} %`,
    );
  });
});
