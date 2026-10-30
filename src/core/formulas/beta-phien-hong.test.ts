import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { defaultInputs } from '../registry/build';
import type { SeriesRow } from '../price-series';
import { findFormulaModule } from './index';

/**
 * Beta ghép lợi suất cổ phiếu với VN-Index theo vị trí tính từ phiên cuối. Một phiên thiếu giá ở giữa
 * cửa sổ bị lọc khỏi chuỗi cổ phiếu mà không bị lọc khỏi chuỗi chỉ số, nên mọi cặp phía trước lệch một
 * phiên (đo 29/10/2026: 0,8126 thành 0,4070, không cảnh báo). Nay Beta báo thẳng.
 */
const SO_PHIEN = 90;

function bars(): SeriesRow[] {
  return Array.from({ length: SO_PHIEN }, (_, i) => {
    const close = 100 + 8 * Math.sin(i / 5) + i * 0.3;
    return {
      date: `2026-01-${String((i % 28) + 1).padStart(2, '0')}`,
      open: close,
      high: close,
      low: close,
      close,
      volume: 1000,
    };
  });
}

function ctxOf(rows: ReadonlyArray<SeriesRow>): CalcContext {
  const dung = rows.map((r) => r.close).filter((c): c is number => typeof c === 'number' && c > 0);
  return {
    asOf: '2026-09-15',
    bars: rows,
    series: dung,
    marketSeries: Array.from({ length: SO_PHIEN }, (_, i) => 1000 + 40 * Math.sin(i / 4) + i),
  } as CalcContext;
}

describe('beta — phiên thiếu giá trong cửa sổ', () => {
  const formula = findFormulaModule('beta');
  if (formula === undefined) throw new Error('Registry thiếu beta');
  const inputs = { ...defaultInputs(formula.spec), sessions: 60 };

  it('chuỗi đủ giá thì tính ra số', () => {
    const out = runFormula(formula, inputs, ctxOf(bars()));
    expect(out.value).not.toBeNull();
  });

  it('một phiên trống giá đóng cửa trong cửa sổ thì báo, không ra số lệch', () => {
    const rows = bars().map((row, i) => (i === SO_PHIEN - 3 ? { ...row, close: null } : row));
    const out = runFormula(formula, inputs, ctxOf(rows));
    expect(out.value).toBeNull();
    expect(out.warning?.code).toBe('MEANINGLESS');
    expect(out.warning?.message.vi).toContain('1 phiên');
  });

  it('phiên hỏng nằm NGOÀI cửa sổ thì không ảnh hưởng', () => {
    const rows = bars().map((row, i) => (i === 2 ? { ...row, close: null } : row));
    const out = runFormula(formula, inputs, ctxOf(rows));
    expect(out.value).not.toBeNull();
  });
});
