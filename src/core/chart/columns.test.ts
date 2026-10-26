import { describe, expect, it } from 'vitest';

import { runFormula } from '../calc/run';
import type { CalcContext, CalcInputs, FormulaModule } from '../calc/types';
import { FORMULA_MODULES } from '../formulas';
import { FPT_BARS } from '../formulas/market-series-2026';
import { annuityPayment } from '../formulas/personal';
import { MARKET_CONFIG } from '../market';
import { scheduleOrDefault } from '../market/resolve';
import { defaultInputs } from '../registry/build';
import { buildChartModel } from './build';
import { COLUMNS_KEY, columnData } from './columns';
import { dangVeCuaHinh } from './dang-ve';
import type { ChartModel, ColumnChart } from './types';

/**
 * Hình CỘT THEO KỲ — mục thêm của ô "Xem theo" (23/10/2026). Chủ dự án chọn bốn kiểu hình mới và
 * thứ tự làm; đợt đầu là "Trả nợ từng năm" của ba công thức vay.
 */

const CTX: CalcContext = { asOf: '2026-09-15', schedule: scheduleOrDefault(MARKET_CONFIG) };
const CTX_FPT: CalcContext = {
  ...CTX,
  bars: FPT_BARS,
  series: FPT_BARS.map((bar) => bar.close ?? 0),
};

/** Công thức đọc chuỗi giá: hình cột chỉ có khi đã nạp chuỗi, nên các ca chung chạy trên chuỗi FPT. */
const CAN_CHUOI_GIA = new Set(['ty-le-khoi-luong']);

function congThuc(id: string): FormulaModule {
  const formula = FORMULA_MODULES.find((item) => item.spec.id === id);
  if (formula === undefined) throw new Error(`không có công thức ${id}`);
  return formula;
}

function ve(
  formula: FormulaModule,
  inputs: CalcInputs,
  sweepKey?: string,
  ctx: CalcContext = CTX,
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

function hinhCot(
  id: string,
  sua: Readonly<Record<string, number>> = {},
  ctx: CalcContext = CTX,
): ColumnChart {
  const formula = congThuc(id);
  const model = ve(formula, { ...defaultInputs(formula.spec), ...sua }, COLUMNS_KEY, ctx);
  if (model.kind !== 'columns') throw new Error(`${id}: không ra hình cột`);
  return model;
}

/** Tổng các khúc của một cột chồng. */
const cao = (group: { values: ReadonlyArray<number> }): number =>
  group.values.reduce((sum, value) => sum + value, 0);

const CO_COT = FORMULA_MODULES.filter((formula) => formula.columns !== undefined);

describe('cả Registry', () => {
  it('đúng những công thức đã duyệt khai hình cột theo kỳ — thêm công thức là một quyết định', () => {
    expect(CO_COT.map((formula) => formula.spec.id).sort()).toEqual([
      'ddm-hai-giai-doan',
      'gia-tri-hien-tai',
      'gia-tri-tuong-lai',
      'gia-von-trung-binh-dca',
      'gui-quay-vong',
      'lai-kep',
      'lich-tra-no',
      'loi-suat-trung-binh-hinh-hoc',
      'so-ky-dca',
      'tiet-kiem-muc-tieu',
      'tong-loi-suat-tai-dau-tu',
      'tra-gop-goc-deu',
      'tra-gop-nien-kim',
      'ty-le-khoi-luong',
    ]);
  });

  it.each(CO_COT.map((formula) => [formula.spec.id, formula] as const))(
    '%s: vẽ được ngay ở số mặc định, đúng khuôn, và không bao giờ là hình mở ra',
    (id, formula) => {
      const view = formula.columns;
      if (view === undefined) throw new Error('thiếu columns');
      expect(formula.spec.chartType).not.toBe('none');
      expect(view.series.length).toBeGreaterThanOrEqual(1);
      expect(view.series.length).toBeLessThanOrEqual(4);

      const ctx = CAN_CHUOI_GIA.has(id) ? CTX_FPT : CTX;
      const inputs = defaultInputs(formula.spec);
      const output = runFormula(formula, inputs, ctx);
      const data = columnData(formula, inputs, ctx, output);
      expect(data).not.toBeNull();

      const hinh = ve(formula, inputs, COLUMNS_KEY, ctx);
      expect(hinh.kind).toBe('columns');
      if (hinh.kind !== 'columns') return;
      expect(hinh.sweepKey).toBe(COLUMNS_KEY);
      expect(hinh.title).toEqual(view.title);
      expect(hinh.options.map((option) => option.key)).toContain(COLUMNS_KEY);
      expect(JSON.stringify(hinh)).not.toMatch(/NaN|Infinity|undefined/);
      // Một dạng vẽ duy nhất — ô "Loại biểu đồ" không hiện.
      expect(dangVeCuaHinh(hinh, formula.spec)).toEqual(['bar']);

      // Trục giá trị chứa 0 và ôm đỉnh mọi cột.
      expect(hinh.y.domain[0]).toBeLessThanOrEqual(0);
      for (const group of hinh.groups) {
        expect(group.values).toHaveLength(view.series.length);
        const dinh = hinh.stacked
          ? group.values.reduce((sum, value) => sum + value, 0)
          : Math.max(...group.values);
        expect(dinh).toBeLessThanOrEqual(hinh.y.domain[1] + 1e-9);
        if (hinh.stacked) for (const value of group.values) expect(value).toBeGreaterThanOrEqual(0);
      }
      // Bảng số: một dòng mỗi kỳ, đủ cột.
      expect(hinh.table.rows).toHaveLength(hinh.groups.length);
      for (const row of hinh.table.rows) expect(row).toHaveLength(hinh.table.columns.length);

      // Hình màn mở ra KHÔNG đổi.
      const moRa = ve(formula, inputs, undefined, ctx);
      expect('sweepKey' in moRa ? moRa.sweepKey : undefined).not.toBe(COLUMNS_KEY);
    },
  );
});

describe('Trả nợ từng năm — gộp từ đúng bảng trả nợ', () => {
  it.each([
    ['tra-gop-nien-kim', 1],
    ['tra-gop-goc-deu', 2],
    ['lich-tra-no', 1],
    ['lich-tra-no', 2],
  ] as const)(
    '%s (phương thức %s): cộng các năm ra đúng số tiền vay và đúng tổng lãi',
    (id, method) => {
      const formula = congThuc(id);
      const inputs: CalcInputs = { ...defaultInputs(formula.spec), method };
      const hinh = hinhCot(id, { method });

      const gocCong = hinh.groups.reduce((sum, group) => sum + (group.values[0] ?? 0), 0);
      const laiCong = hinh.groups.reduce((sum, group) => sum + (group.values[1] ?? 0), 0);
      const lich = congThuc('lich-tra-no');
      const tongLai = runFormula(
        lich,
        { ...defaultInputs(lich.spec), ...inputs, method },
        CTX,
      ).value;

      expect(gocCong).toBeCloseTo(inputs.amount ?? Number.NaN, 4);
      expect(laiCong).toBeCloseTo(tongLai ?? Number.NaN, 4);
      expect(hinh.groups).toHaveLength(inputs.years ?? 0);
      expect(hinh.stacked).toBe(true);
      expect(hinh.series.map((series) => series.label.vi)).toEqual(['Tiền gốc', 'Tiền lãi']);
    },
  );

  it('niên kim: mỗi năm trả đúng 12 kỳ, cột cao bằng nhau, phần lãi teo dần', () => {
    const formula = congThuc('tra-gop-nien-kim');
    const inputs = defaultInputs(formula.spec);
    const hinh = hinhCot('tra-gop-nien-kim');
    const emi = annuityPayment(inputs.amount ?? 0, inputs.rate ?? 0, inputs.years ?? 0) ?? 0;

    for (const group of hinh.groups) {
      expect((group.values[0] ?? 0) + (group.values[1] ?? 0)).toBeCloseTo(12 * emi, 4);
    }
    const lai = hinh.groups.map((group) => group.values[1] ?? 0);
    for (let index = 1; index < lai.length; index += 1) {
      expect(lai[index]).toBeLessThan(lai[index - 1] ?? Number.POSITIVE_INFINITY);
    }
    expect(hinh.table.columns.map((column) => column.vi)).toEqual([
      'Năm',
      'Tiền gốc (₫)',
      'Tiền lãi (₫)',
      'Cộng (₫)',
    ]);
    expect(hinh.groups[0]?.totalLabel).toBe('89.484.594,03 ₫');
  });

  it('gốc đều: năm nào cũng trả cùng một phần gốc, cột thấp dần', () => {
    const formula = congThuc('tra-gop-goc-deu');
    const inputs = defaultInputs(formula.spec);
    const hinh = hinhCot('tra-gop-goc-deu');
    for (const group of hinh.groups) {
      expect(group.values[0]).toBeCloseTo((inputs.amount ?? 0) / (inputs.years ?? 1), 4);
    }
    const cao = hinh.groups.map((group) => (group.values[0] ?? 0) + (group.values[1] ?? 0));
    expect(cao[cao.length - 1]).toBeLessThan(cao[0] ?? 0);
  });

  it('lãi suất 0 thì vẫn vẽ: mọi năm chỉ có gốc', () => {
    const hinh = hinhCot('tra-gop-nien-kim', { rate: 0 });
    for (const group of hinh.groups) expect(group.values[1]).toBe(0);
  });

  it('vay một năm thì chỉ có một cột — không có gì để so, mục vắng', () => {
    const formula = congThuc('tra-gop-nien-kim');
    const inputs = { ...defaultInputs(formula.spec), years: 1 };
    const output = runFormula(formula, inputs, CTX);
    expect(columnData(formula, inputs, CTX, output)).toBeNull();
    const model = ve(formula, inputs);
    if (model.kind === 'unavailable') throw new Error('phải vẽ được');
    expect(model.options.map((option) => option.key)).not.toContain(COLUMNS_KEY);
  });

  /*
   * Đang XEM mục cột mà số liệu đổi làm nó hết vẽ được: không rơi sang trục mặc định (23/10/2026).
   * Chủ dự án: _"select là để phân biệt dạng biểu đồ"_ — ô chọn giữ mục, câu báo nêu tên mục.
   */
  it('đang xem mục cột mà vay còn một năm: mục ở lại trong ô chọn, câu báo nêu tên mục', () => {
    const formula = congThuc('tra-gop-nien-kim');
    const inputs = { ...defaultInputs(formula.spec), years: 1 };
    const model = ve(formula, inputs, COLUMNS_KEY);
    if (model.kind !== 'unavailable')
      throw new Error('không được vẽ hình khác thay cho mục đã chọn');

    expect(model.sweepKey).toBe(COLUMNS_KEY);
    expect(model.options?.map((option) => option.key)).toContain(COLUMNS_KEY);
    expect(model.warning.message.vi).toContain('Chưa vẽ được “Trả nợ từng năm”');
    expect(model.warning.message.vi).toContain('Chưa đủ hai kỳ ra số');
  });

  /*
   * Câu báo theo ĐÚNG nguyên nhân (vòng soát 23/10/2026): mọi kỳ bằng 0 không phải "có kỳ âm", và
   * hình lợi suất từng kỳ còn cho phép cột âm.
   */
  it('đang xem Lợi suất từng kỳ mà mọi kỳ bằng 0: câu báo nói mọi kỳ bằng 0, không nói kỳ âm', () => {
    const formula = congThuc('loi-suat-trung-binh-hinh-hoc');
    const inputs = { ...defaultInputs(formula.spec), periods: 3, r1: 0, r2: 0, r3: 0 };
    const model = ve(formula, inputs, COLUMNS_KEY);
    if (model.kind !== 'unavailable') throw new Error('mọi kỳ bằng 0 thì không có cột nào để vẽ');

    expect(model.warning.message.vi).toContain('Mọi kỳ đều bằng 0');
    expect(model.warning.message.vi).not.toContain('số âm');
  });
});

describe('Số dư từng năm — cột cuối bằng đúng con số của công thức', () => {
  it('lai-kep: mỗi năm một cột, tiền gốc giữ nguyên, lãi tích luỹ lớn dần, cột cuối = số tiền cuối kỳ (A)', () => {
    const formula = congThuc('lai-kep');
    const inputs = defaultInputs(formula.spec);
    const hinh = hinhCot('lai-kep');
    const ketQua = runFormula(formula, inputs, CTX).value ?? Number.NaN;

    expect(hinh.groups).toHaveLength(inputs.years ?? 0);
    for (const group of hinh.groups) expect(group.values[0]).toBe(inputs.principal);
    const lai = hinh.groups.map((group) => group.values[1] ?? 0);
    for (let index = 1; index < lai.length; index += 1) {
      expect(lai[index]).toBeGreaterThan(lai[index - 1] ?? Number.POSITIVE_INFINITY);
    }
    expect(cao(hinh.groups.at(-1) ?? { values: [] })).toBeCloseTo(ketQua, 6);
  });

  it('gia-tri-tuong-lai: cột cuối = FV; tỷ suất âm thì mục vắng (số dư hụt dưới tiền gốc)', () => {
    const formula = congThuc('gia-tri-tuong-lai');
    const inputs = defaultInputs(formula.spec);
    const hinh = hinhCot('gia-tri-tuong-lai');
    const ketQua = runFormula(formula, inputs, CTX).value ?? Number.NaN;
    expect(cao(hinh.groups.at(-1) ?? { values: [] })).toBeCloseTo(ketQua, 6);

    const am: CalcInputs = { ...inputs, rate: -5 };
    expect(columnData(formula, am, CTX, runFormula(formula, am, CTX))).toBeNull();
  });

  it('gia-tri-hien-tai: khúc dưới mọi cột = PV (kết quả), cột cuối = số tiền tương lai đã nhập', () => {
    const formula = congThuc('gia-tri-hien-tai');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('gia-tri-hien-tai');

    expect(hinh.groups).toHaveLength(inputs.years ?? 0);
    for (const group of hinh.groups) expect(group.values[0]).toBe(output.value);
    expect(cao(hinh.groups.at(-1) ?? { values: [] })).toBeCloseTo(inputs.futureValue ?? 0, 4);
    // Năm k: PV × (1 + r)^k, tính lại độc lập.
    const r = (inputs.rate ?? 0) / 100;
    hinh.groups.forEach((group, index) => {
      expect(cao(group)).toBeCloseTo((output.value ?? 0) * Math.pow(1 + r, index + 1), 4);
    });
  });

  it('tiet-kiem-muc-tieu: cột cuối ở đúng tháng cuối và bằng mục tiêu; kỳ lẻ năm thì thêm một cột', () => {
    const formula = congThuc('tiet-kiem-muc-tieu');
    const inputs: CalcInputs = { ...defaultInputs(formula.spec), months: 66 };
    const output = runFormula(formula, inputs, CTX);
    const data = columnData(formula, inputs, CTX, output);
    if (data === null) throw new Error('phải vẽ được');

    expect(data.groups.map((group) => group.tick)).toEqual(['1', '2', '3', '4', '5', '6']);
    const cuoi = data.groups.at(-1);
    expect((cuoi?.values[0] ?? 0) + (cuoi?.values[1] ?? 0)).toBeCloseTo(inputs.target ?? 0, 2);
    // Tiền đã gửi ở cột cuối = khoản hằng tháng × 66.
    expect(cuoi?.values[0]).toBeCloseTo((output.value ?? 0) * 66, 4);
  });

  it('so-ky-dca: cột cuối = số dư lúc chạm đích (≥ mục tiêu), vạch ngang ở đúng mục tiêu', () => {
    const formula = congThuc('so-ky-dca');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('so-ky-dca');

    expect(hinh.groups).toHaveLength(Math.ceil((output.value ?? 0) / 12));
    expect(cao(hinh.groups.at(-1) ?? { values: [] })).toBeCloseTo(
      (output.extras?.totalContributed ?? 0) + (output.extras?.accumulatedReturn ?? 0),
      4,
    );
    expect(cao(hinh.groups.at(-1) ?? { values: [] })).toBeGreaterThanOrEqual(inputs.target ?? 0);
    expect(hinh.lines?.map((line) => [line.label.vi, line.value])).toEqual([
      ['Mục tiêu', inputs.target],
    ]);
    // Trục giá trị ôm cả vạch mục tiêu.
    expect(hinh.y.domain[1]).toBeGreaterThanOrEqual(inputs.target ?? 0);
  });
});

describe('Từng đợt mua / từng kỳ — vạch ngang ở đúng kết quả', () => {
  it('gia-von-trung-binh-dca: mỗi đợt một cột giá mua; vạch liền = giá vốn, vạch đứt = trung bình cộng giá', () => {
    const formula = congThuc('gia-von-trung-binh-dca');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('gia-von-trung-binh-dca');

    expect(hinh.stacked).toBe(false);
    expect(hinh.groups.map((group) => group.label.vi)).toEqual(['Đợt 1', 'Đợt 2', 'Đợt 3']);
    expect(hinh.groups.map((group) => group.values[0])).toEqual([
      inputs.price1,
      inputs.price2,
      inputs.price3,
    ]);
    const [giaVon, trungBinhCong] = hinh.lines ?? [];
    expect(giaVon?.value).toBe(output.value);
    expect(giaVon?.dash).toBeUndefined();
    expect(trungBinhCong?.dash).toBe(true);
    expect(trungBinhCong?.value).toBeCloseTo(
      ((inputs.price1 ?? 0) + (inputs.price2 ?? 0) + (inputs.price3 ?? 0)) / 3,
      9,
    );
    // Đợt giá thấp mua được nhiều cổ phiếu hơn, nên giá vốn nằm dưới trung bình cộng.
    expect(giaVon?.value ?? 0).toBeLessThan(trungBinhCong?.value ?? 0);
    // Số cổ phiếu từng đợt cộng lại đúng tổng `calc` báo; bảng số có cột tiền mua và cổ phiếu.
    const coPhieu = hinh.table.rows.map((row) => row?.[3]);
    expect(coPhieu.every((cell) => cell?.endsWith(' CP') === true)).toBe(true);
    expect(hinh.table.columns.map((column) => column.vi)).toEqual([
      'Đợt mua',
      'Giá mua (₫)',
      'Tiền mua (₫)',
      'Số cổ phiếu mua được (CP)',
    ]);
  });

  it('gia-von-trung-binh-dca: thêm đợt thứ tư thì thêm cột; đợt bỏ trống (tiền 0) không có cột', () => {
    const formula = congThuc('gia-von-trung-binh-dca');
    const them: CalcInputs = {
      ...defaultInputs(formula.spec),
      lots: 4,
      amount4: 6_000_000,
      price4: 30_000,
    };
    const data = columnData(formula, them, CTX, runFormula(formula, them, CTX));
    expect(data?.groups.map((group) => group.tick)).toEqual(['1', '2', '3', '4']);

    const boTrong: CalcInputs = { ...defaultInputs(formula.spec), amount2: 0, price2: 0 };
    const data2 = columnData(formula, boTrong, CTX, runFormula(formula, boTrong, CTX));
    expect(data2?.groups.map((group) => group.tick)).toEqual(['1', '3']);
  });

  it('loi-suat-trung-binh-hinh-hoc: kỳ lỗ đi xuống dưới 0; vạch liền = trung bình hình học, nằm dưới trung bình cộng', () => {
    const formula = congThuc('loi-suat-trung-binh-hinh-hoc');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('loi-suat-trung-binh-hinh-hoc');

    expect(hinh.groups).toHaveLength(inputs.periods ?? 0);
    expect(hinh.groups.some((group) => (group.values[0] ?? 0) < 0)).toBe(true);
    expect(hinh.y.domain[0]).toBeLessThan(0);
    const [hinhHoc, cong] = hinh.lines ?? [];
    expect(hinhHoc?.value).toBe(output.value);
    expect(hinhHoc?.value ?? 0).toBeLessThan(cong?.value ?? 0);
  });
});

describe('Đợt thứ hai (23/10/2026) — năm công thức nữa, đối chiếu độc lập', () => {
  it('ddm-hai-giai-doan: mỗi năm giai đoạn đầu một cột = D0 × (1 + g1)^t; cộng khúc dưới = phần giai đoạn đầu', () => {
    const formula = congThuc('ddm-hai-giai-doan');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('ddm-hai-giai-doan');

    const d0 = inputs.dividend ?? 0;
    const g1 = (inputs.growthStage1 ?? 0) / 100;
    const r = (inputs.requiredReturn ?? 0) / 100;
    expect(hinh.groups).toHaveLength(inputs.years ?? 0);
    let pv = 0;
    hinh.groups.forEach((group, index) => {
      const t = index + 1;
      const coTuc = d0 * Math.pow(1 + g1, t);
      expect(cao(group)).toBeCloseTo(coTuc, 6);
      expect(group.values[0]).toBeCloseTo(coTuc / Math.pow(1 + r, t), 6);
      pv += group.values[0] ?? 0;
    });
    expect(pv).toBeCloseTo(output.extras?.pvStage1 ?? Number.NaN, 6);
    // Phần còn lại của kết quả là giá trị cuối kỳ — không có cột.
    expect((output.value ?? 0) - pv).toBeCloseTo(output.extras?.pvTerminal ?? Number.NaN, 6);
    expect(hinh.series.map((series) => series.label.vi)).toEqual([
      'Giá trị hôm nay',
      'Phần mất do chiết khấu',
    ]);

    // Một năm giai đoạn đầu: một cột, mục vắng.
    const motNam: CalcInputs = { ...inputs, years: 1 };
    expect(columnData(formula, motNam, CTX, runFormula(formula, motNam, CTX))).toBeNull();
  });

  it('gui-quay-vong: mỗi vòng một cột tiền lãi ở tháng hết vòng; cột cuối trừ vạch "gửi một lần" = kết quả', () => {
    const formula = congThuc('gui-quay-vong');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('gui-quay-vong');

    const p = inputs.principal ?? 0;
    const m = inputs.shortMonths ?? 0;
    const T = inputs.totalMonths ?? 0;
    expect(hinh.stacked).toBe(false);
    expect(hinh.groups.map((group) => group.tick)).toEqual(
      Array.from({ length: T / m }, (_, k) => String((k + 1) * m)),
    );
    hinh.groups.forEach((group, index) => {
      expect(group.values[0]).toBeCloseTo(
        p * Math.pow(1 + ((inputs.shortRate ?? 0) / 100) * (m / 12), index + 1) - p,
        4,
      );
    });
    const [motLan] = hinh.lines ?? [];
    expect(motLan?.value).toBeCloseTo(p * ((inputs.longRate ?? 0) / 100) * (T / 12), 4);
    expect(motLan?.label.vi).toBe(`Gửi một lần ${String(T)} tháng`);
    expect((hinh.groups.at(-1)?.values[0] ?? 0) - (motLan?.value ?? 0)).toBeCloseTo(
      output.value ?? Number.NaN,
      4,
    );

    // Tổng thời gian không chia hết cho kỳ ngắn: công thức báo lỗi, mục vắng.
    const le: CalcInputs = { ...inputs, totalMonths: 10 };
    expect(columnData(formula, le, CTX, runFormula(formula, le, CTX))).toBeNull();
    // Chỉ một vòng: không có gì để so.
    const motVong: CalcInputs = { ...inputs, totalMonths: m };
    expect(columnData(formula, motVong, CTX, runFormula(formula, motVong, CTX))).toBeNull();
  });

  it('tong-loi-suat-tai-dau-tu: cột năm t = ((1 + g)(1 + y))^t − 1; cột cuối = kết quả; giá giảm thì mục vắng', () => {
    const formula = congThuc('tong-loi-suat-tai-dau-tu');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX);
    const hinh = hinhCot('tong-loi-suat-tai-dau-tu');

    const g = (inputs.priceGrowth ?? 0) / 100;
    const y = (inputs.dividendYield ?? 0) / 100;
    expect(hinh.groups).toHaveLength(inputs.years ?? 0);
    hinh.groups.forEach((group, index) => {
      const t = index + 1;
      expect(group.values[0]).toBeCloseTo((Math.pow(1 + g, t) - 1) * 100, 9);
      expect(cao(group)).toBeCloseTo((Math.pow((1 + g) * (1 + y), t) - 1) * 100, 9);
    });
    const cuoi = hinh.groups.at(-1);
    expect(cao(cuoi ?? { values: [] })).toBeCloseTo(output.value ?? Number.NaN, 9);
    // Hai khúc cột cuối là đúng hai múi của hình cơ cấu.
    expect(cuoi?.values[0]).toBeCloseTo(output.extras?.fromPriceGrowth ?? Number.NaN, 9);
    expect(cuoi?.values[1]).toBeCloseTo(output.extras?.fromReinvestedDividends ?? Number.NaN, 9);

    const giam: CalcInputs = { ...inputs, priceGrowth: -5 };
    expect(columnData(formula, giam, CTX, runFormula(formula, giam, CTX))).toBeNull();
  });

  it('ty-le-khoi-luong: đúng n + 1 phiên cuối của chuỗi; vạch = trung bình n phiên trước; cột cuối ÷ vạch = kết quả', () => {
    const formula = congThuc('ty-le-khoi-luong');
    const inputs = defaultInputs(formula.spec);
    const output = runFormula(formula, inputs, CTX_FPT);
    const hinh = hinhCot('ty-le-khoi-luong', {}, CTX_FPT);

    const n = inputs.period ?? 0;
    const cuaSo = FPT_BARS.slice(-(n + 1));
    expect(hinh.stacked).toBe(false);
    expect(hinh.groups.map((group) => group.values[0])).toEqual(cuaSo.map((bar) => bar.volume));
    const mocTrungBinh = cuaSo.slice(0, -1).reduce((sum, bar) => sum + (bar.volume ?? 0), 0) / n;
    const [vach] = hinh.lines ?? [];
    expect(vach?.value).toBeCloseTo(mocTrungBinh, 6);
    expect(vach?.dash).toBe(true);
    expect((hinh.groups.at(-1)?.values[0] ?? 0) / (vach?.value ?? 1)).toBeCloseTo(
      output.value ?? Number.NaN,
      9,
    );
    // Phiên cuối của chuỗi mẫu là 15/09/2026: ô dò in ngày đủ, vạch trục chỉ ngày/tháng.
    expect(hinh.groups.at(-1)?.label.vi).toBe('15/09/2026');
    expect(hinh.groups.at(-1)?.tick).toBe('15/09');
    expect(hinh.table.columns.map((column) => column.vi)).toEqual(['Phiên', 'Khối lượng (CP)']);

    // Chưa nạp chuỗi: không có số, mục vắng.
    const chuaNap = ve(formula, inputs);
    expect('options' in chuaNap ? (chuaNap.options ?? []).map((o) => o.key) : []).not.toContain(
      COLUMNS_KEY,
    );
  });
});
