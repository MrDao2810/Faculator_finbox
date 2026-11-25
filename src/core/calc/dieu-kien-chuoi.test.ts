import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from '../formulas';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { dieuKienChuoiThieu } from './dieu-kien-chuoi';
import { needsPriceSeries } from './run';
import type { CalcContext, FormulaModule } from './types';

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };

function congThuc(id: string): FormulaModule {
  const formula = FORMULA_MODULES.find((item) => item.spec.id === id);
  if (formula === undefined) throw new Error(`không có công thức ${id}`);
  return formula;
}

describe('dieuKienChuoiThieu — điều kiện chuỗi giá mà mã thị trường (10 phiên) chưa đạt', () => {
  it('công thức không cần chuỗi giá thì không có điều kiện', () => {
    const pe = congThuc('pe');
    expect(dieuKienChuoiThieu(pe, defaultInputs(pe.spec), CTX)).toBeNull();
  });

  it('VaR với số mặc định cần ít nhất 60 phiên giá, nói cả hai ngôn ngữ', () => {
    const varLs = congThuc('var-lich-su');
    expect(dieuKienChuoiThieu(varLs, defaultInputs(varLs.spec), CTX)).toEqual({
      vi: 'ít nhất 60 phiên giá',
      en: 'at least 60 price sessions',
    });
  });

  it('hạ số phiên của công thức xuống vừa 10 phiên thì điều kiện biến mất', () => {
    const sma = congThuc('sma-n-phien');
    const inputs = defaultInputs(sma.spec);
    expect(dieuKienChuoiThieu(sma, inputs, CTX)).not.toBeNull();
    const kyKhoa = sma.spec.variables[0]?.key ?? '';
    expect(dieuKienChuoiThieu(sma, { ...inputs, [kyKhoa]: 5 }, CTX)).toBeNull();
  });

  it('mọi công thức chuỗi giá với số mặc định đều có điều kiện (đo 25/11/2026: 35 công thức)', () => {
    const chuoi = FORMULA_MODULES.filter((f) => needsPriceSeries(f, CTX.asOf));
    expect(chuoi).toHaveLength(35);
    for (const f of chuoi) {
      const dk = dieuKienChuoiThieu(f, defaultInputs(f.spec), CTX);
      expect(dk, f.spec.id).not.toBeNull();
      expect(dk?.vi, f.spec.id).toMatch(/^ít nhất \d+ /);
    }
  });
});
