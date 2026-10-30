// @vitest-environment jsdom

import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  MARKET_CONFIG,
  buildChartModel,
  defaultInputs,
  findFormulaModule,
  runFormula,
  scheduleOrDefault,
} from '@/application';
import type { CalcContext, CalcInputs, LineChart as LineModel } from '@/application';

import { LineChart } from './LineChart';

/**
 * Dạng Cột của biểu đồ đường khoá mỗi `<rect>` bằng nhãn x (29/10/2026). Nhãn in ít chữ số nên trùng nhau:
 * trên trục "Lãi suất không kỳ hạn" của `rut-truoc-han` 41 mức quét chỉ có 11 nhãn khác nhau. Khoá trùng
 * làm React không gỡ được cột cũ, nên mỗi lần người dùng gõ đổi số, số cột trên hình lại phình ra (41 →
 * 71 → 98) và cột cũ đè lên hình mới.
 */
afterEach(cleanup);

const CTX: CalcContext = {
  asOf: '2026-09-15',
  schedule: scheduleOrDefault(MARKET_CONFIG),
  cashflows: [],
};

function moHinh(inputs: CalcInputs): LineModel {
  const formula = findFormulaModule('rut-truoc-han');
  if (formula === undefined) throw new Error('Registry thiếu rut-truoc-han');
  const model = buildChartModel({
    formula,
    inputs,
    ctx: CTX,
    output: runFormula(formula, inputs, CTX),
    level: 'advanced',
    sweepKey: 'demandRate',
    zeroBaseline: true,
  });
  if (model.kind !== 'line') throw new Error(`hình ${model.kind}, cần line`);
  return model;
}

describe('LineChart dạng Cột — nhãn x trùng nhau', () => {
  it('đổi số đang gõ thì số cột trên hình luôn bằng số mức tính được', () => {
    const formula = findFormulaModule('rut-truoc-han');
    if (formula === undefined) throw new Error('Registry thiếu rut-truoc-han');
    const goc = defaultInputs(formula.spec);
    const lanDau = moHinh(goc);

    // Điều kiện của lỗi: có nhãn trùng nhau.
    const nhan = lanDau.points.map((point) => point.label);
    expect(new Set(nhan).size).toBeLessThan(nhan.length);

    const { container, rerender } = render(
      <LineChart model={lanDau} idBase="chart-rut-truoc-han" variant="bar" size="compact" />,
    );
    const demCot = (): number => container.querySelectorAll('svg rect[class*="bar"]').length;
    const tinhDuoc = (model: LineModel): number =>
      model.points.filter((point) => point.y !== null).length;
    expect(demCot()).toBe(tinhDuoc(lanDau));

    for (const heSo of [1.3, 0.7]) {
      const model = moHinh({ ...goc, demandRate: (goc.demandRate ?? 0.1) * heSo });
      rerender(
        <LineChart model={model} idBase="chart-rut-truoc-han" variant="bar" size="compact" />,
      );
      expect(demCot()).toBe(tinhDuoc(model));
    }
  });
});
