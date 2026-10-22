import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { buildChartModel } from './build';
import { COMPOSITION_KEY, compositionBars } from './composition';
import { dangVeCuaHinh, vanhKhuyen } from './dang-ve';
import type { ChartModel } from './types';

/**
 * Hình CƠ CẤU — vành khuyên chia một tổng thành các phần, mục "Cơ cấu …" của ô "Xem theo"
 * (22/10/2026). Chủ dự án hỏi công thức nào vẽ được hình tròn giúp người dùng dễ hình dung, rồi bảo
 * làm; hai công thức làm thử là `no-tren-von-chu` (nợ và vốn chủ, số có sẵn khi thêm mã) và
 * `lai-kep` (gốc và lãi).
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };

function congThuc(id: string): FormulaModule {
  const formula = FORMULA_MODULES.find((item) => item.spec.id === id);
  if (formula === undefined) throw new Error(`không có công thức ${id}`);
  return formula;
}

function veCoCau(formula: FormulaModule, inputs: CalcInputs, sweepKey?: string): ChartModel {
  const output = runFormula(formula, inputs, CTX);
  return buildChartModel({
    formula,
    inputs,
    ctx: CTX,
    output,
    level: 'advanced',
    ...(sweepKey === undefined ? {} : { sweepKey }),
  });
}

const CO_CAU = FORMULA_MODULES.filter((formula) => formula.spec.composition !== undefined);

describe('cả Registry', () => {
  it('đúng hai công thức làm thử khai hình cơ cấu — thêm công thức thứ ba là một quyết định', () => {
    expect(CO_CAU.map((formula) => formula.spec.id).sort()).toEqual(['lai-kep', 'no-tren-von-chu']);
  });

  it.each(CO_CAU.map((formula) => [formula.spec.id, formula] as const))(
    '%s: khai báo hợp lệ và vẽ được ngay ở số mặc định',
    (_id, formula) => {
      const { spec } = formula;
      const view = spec.composition;
      if (view === undefined) throw new Error('thiếu composition');

      // Công thức `none` không có khối biểu đồ, nên một hình cơ cấu khai ở đó không bao giờ hiện.
      expect(spec.chartType).not.toBe('none');
      // Hai tới bốn phần: bốn là số tông màu vành khuyên đã kiểm tương phản.
      expect(view.parts.length).toBeGreaterThanOrEqual(2);
      expect(view.parts.length).toBeLessThanOrEqual(4);

      const inputs = defaultInputs(spec);
      const output = runFormula(formula, inputs, CTX);
      for (const part of view.parts) {
        const bien = spec.variables.find((variable) => variable.key === part.key);
        if (bien !== undefined) {
          // Phần lấy từ ô nhập thì đơn vị ô ấy phải là đơn vị của hình — không cộng tỷ ₫ với ₫.
          expect(bien.unit, `${spec.id}.${part.key}`).toBe(view.unit);
        } else {
          // Không phải ô nhập thì phải là một mục `extras` mà `calc` thật sự trả.
          expect(output.extras?.[part.key], `${spec.id}.${part.key}`).toBeDefined();
          expect(part.label, `${spec.id}.${part.key} cần tên riêng`).toBeDefined();
        }
      }

      const hinh = veCoCau(formula, inputs, COMPOSITION_KEY);
      expect(hinh.kind).toBe('waterfall');
      if (hinh.kind !== 'waterfall') return;
      expect(hinh.sweepKey).toBe(COMPOSITION_KEY);
      expect(hinh.title).toEqual(view.title);
      expect(hinh.options.map((option) => option.key)).toContain(COMPOSITION_KEY);
      // Mở bằng vành khuyên, thanh ngang là dạng thứ hai.
      expect(dangVeCuaHinh(hinh, spec)).toEqual(['donut', 'waterfall']);
      expect(JSON.stringify(hinh)).not.toMatch(/NaN|Infinity|undefined/);

      // Cột tổng đúng bằng tổng các phần, mang tên của tổng.
      const phan = hinh.bars.filter((bar) => bar.isTotal !== true);
      const tong = hinh.bars.find((bar) => bar.isTotal === true);
      expect(tong?.label).toEqual(view.total);
      expect(tong?.delta).toBeCloseTo(
        phan.reduce((sum, bar) => sum + bar.delta, 0),
        6,
      );

      // Hình màn mở ra KHÔNG đổi: mục cơ cấu chỉ là một mục thêm của ô chọn.
      const moRa = veCoCau(formula, inputs);
      expect('sweepKey' in moRa ? moRa.sweepKey : undefined).not.toBe(COMPOSITION_KEY);
    },
  );
});

describe('no-tren-von-chu — cơ cấu nguồn vốn', () => {
  const formula = congThuc('no-tren-von-chu');

  it('hai múi là đúng hai ô của công thức, cộng ra tổng nguồn vốn', () => {
    const inputs = { totalLiabilities: 22_500, equity: 36_456 };
    const hinh = veCoCau(formula, inputs, COMPOSITION_KEY);
    if (hinh.kind !== 'waterfall') throw new Error('phải là hình cơ cấu');

    expect(hinh.bars.map((bar) => [bar.label.vi, bar.delta])).toEqual([
      ['Tổng nợ phải trả (D)', 22_500],
      ['Vốn chủ sở hữu (E)', 36_456],
      ['Tổng nguồn vốn', 58_956],
    ]);
    expect(hinh.table.rows.at(-1)).toEqual([
      { vi: 'Tổng nguồn vốn', en: 'Total liabilities and equity' },
      '58.956 tỷ ₫',
    ]);

    const vanh = vanhKhuyen(hinh);
    expect(vanh?.parts.map((part) => part.shareLabel)).toEqual(['38,2 %', '61,8 %']);
    // Giữa vòng là tổng, viết bằng chữ như mọi số tiền từ 1.000 trở lên trên hình; số đầy đủ ở bảng số.
    expect(vanh?.totalValueLabel).toBe('59 nghìn tỷ ₫');
    expect(vanh?.parts.map((part) => part.shortValueLabel)).toEqual([
      '22,5 nghìn tỷ ₫',
      '36,5 nghìn tỷ ₫',
    ]);
  });

  it('không nợ đồng nào thì vẫn vẽ: 100 % vốn chủ, múi nợ 0,0 %', () => {
    const hinh = veCoCau(formula, { totalLiabilities: 0, equity: 1_000 }, COMPOSITION_KEY);
    if (hinh.kind !== 'waterfall') throw new Error('phải là hình cơ cấu');

    expect(vanhKhuyen(hinh)?.parts.map((part) => part.shareLabel)).toEqual(['0,0 %', '100,0 %']);
  });

  it('vốn chủ âm thì không có mục cơ cấu — một phần âm không có chỗ trên vòng tròn', () => {
    const inputs = { totalLiabilities: 500, equity: -100 };
    const output = runFormula(formula, inputs, CTX);
    expect(compositionBars(formula.spec, inputs, output)).toBeNull();

    const hinh = veCoCau(formula, inputs, COMPOSITION_KEY);
    expect('sweepKey' in hinh ? hinh.sweepKey : undefined).not.toBe(COMPOSITION_KEY);
    if (hinh.kind !== 'unavailable') {
      expect(hinh.options.map((option) => option.key)).not.toContain(COMPOSITION_KEY);
    }
  });
});

describe('lai-kep — cơ cấu số tiền cuối kỳ', () => {
  const formula = congThuc('lai-kep');

  it('gốc cộng lãi đúng bằng con số ở khối Kết quả', () => {
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = veCoCau(formula, inputs, COMPOSITION_KEY);
    if (hinh.kind !== 'waterfall' || output.value === null) throw new Error('phải vẽ được');

    const [goc, lai, tong] = hinh.bars;
    expect(goc?.delta).toBe(inputs.principal);
    expect(tong?.delta).toBeCloseTo(output.value, 6);
    expect((goc?.delta ?? 0) + (lai?.delta ?? 0)).toBeCloseTo(output.value, 6);
    expect(tong?.valueLabel).toBe('22.196.402,35 ₫');
  });

  it('lãi suất 0 thì cả vòng là tiền gốc', () => {
    const inputs = { ...defaultInputs(formula.spec), rate: 0 };
    const hinh = veCoCau(formula, inputs, COMPOSITION_KEY);
    if (hinh.kind !== 'waterfall') throw new Error('phải là hình cơ cấu');

    expect(vanhKhuyen(hinh)?.parts.map((part) => part.shareLabel)).toEqual(['100,0 %', '0,0 %']);
  });

  it('tiền gốc 0 thì không có gì để chia — mục cơ cấu vắng mặt', () => {
    const inputs = { ...defaultInputs(formula.spec), principal: 0 };
    const output = runFormula(formula, inputs, CTX);
    expect(compositionBars(formula.spec, inputs, output)).toBeNull();
  });
});
