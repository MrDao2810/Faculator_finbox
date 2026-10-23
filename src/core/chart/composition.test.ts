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
  /*
   * Hai công thức làm thử, rồi 20 công thức của đợt hai (22/10/2026, chủ dự án: "tiếp tục áp dụng").
   * Đợt hai qua một vòng rà cả thư viện có phản biện; các công thức bị bác và lý do nằm ở `TASK.md`.
   * Thêm công thức nữa là một quyết định, nên danh sách ghim cứng.
   */
  it('đúng 22 công thức khai hình cơ cấu', () => {
    expect(CO_CAU.map((formula) => formula.spec.id).sort()).toEqual([
      'bien-loi-nhuan-gop',
      'bien-loi-nhuan-rong',
      'capm',
      'co-vi-the-phai-sinh',
      'diem-hoa-von',
      'don-bay-hieu-dung',
      'don-bay-tong-hop',
      'gia-tri-hien-tai',
      'gia-tri-tuong-lai',
      'hpr',
      'lai-kep',
      'lai-tien-gui',
      'loi-nhuan-rong',
      'no-tren-von-chu',
      'so-ky-dca',
      'thanh-toan-nhanh',
      'tiet-kiem-muc-tieu',
      'tong-loi-suat-tai-dau-tu',
      'tra-gop-goc-deu',
      'tra-gop-nien-kim',
      'ty-le-chi-tra-co-tuc',
      'wacc',
    ]);
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

/*
 * Tổng của vòng phải ĐÚNG là đại lượng mà tên tổng gọi ra (22/10/2026, đợt 22 công thức). Gác chung chỉ
 * biết tổng là tổng các phần; ở đây mỗi công thức nói tổng ấy phải bằng gì, tính từ ô nhập hay từ
 * `calc` — nên một phần tính sai trong `extras` (thiếu một khoản, sai dấu) làm tổng lệch và ca đỏ.
 */
function so(vao: CalcInputs, key: string): number {
  const value = vao[key];
  if (value === undefined) throw new Error(`thiếu ô ${key}`);
  return value;
}

function phu(output: ReturnType<typeof runFormula>, key: string): number {
  const value = output.extras?.[key];
  if (value === undefined) throw new Error(`calc không trả extras.${key}`);
  return value;
}

function giaTri(output: ReturnType<typeof runFormula>): number {
  if (output.value === null) throw new Error('calc không ra số');
  return output.value;
}

/** Tổng lãi cả kỳ theo đúng bảng trả nợ từng kỳ của `lich-tra-no` (1 niên kim, 2 gốc đều). */
function tongLaiTheoLich(vao: CalcInputs, method: number): number {
  const lich = congThuc('lich-tra-no');
  return giaTri(
    runFormula(
      lich,
      { amount: so(vao, 'amount'), rate: so(vao, 'rate'), years: so(vao, 'years'), method },
      CTX,
    ),
  );
}

const TONG_PHAI_BANG: Readonly<
  Record<string, (vao: CalcInputs, output: ReturnType<typeof runFormula>) => number>
> = {
  'bien-loi-nhuan-gop': (vao) => so(vao, 'revenue'),
  'bien-loi-nhuan-rong': (vao) => so(vao, 'revenue'),
  capm: (_vao, output) => giaTri(output),
  'co-vi-the-phai-sinh': (_vao, output) => phu(output, 'riskAmount'),
  'diem-hoa-von': (_vao, output) => phu(output, 'breakEvenRevenue'),
  'don-bay-hieu-dung': (_vao, output) => phu(output, 'notionalValue'),
  'don-bay-tong-hop': (vao) => so(vao, 'revenue'),
  'gia-tri-hien-tai': (vao) => so(vao, 'futureValue'),
  'gia-tri-tuong-lai': (_vao, output) => giaTri(output),
  hpr: (vao) => so(vao, 'endPrice') - so(vao, 'startPrice') + so(vao, 'dividend'),
  'lai-kep': (_vao, output) => giaTri(output),
  'lai-tien-gui': (vao, output) => so(vao, 'principal') + giaTri(output),
  'loi-nhuan-rong': (_vao, output) => phu(output, 'grossProfit'),
  'no-tren-von-chu': (vao) => so(vao, 'totalLiabilities') + so(vao, 'equity'),
  'so-ky-dca': (vao, output) => {
    // Số dư cuối tháng n của khoản góp đều — tính lại độc lập, không đọc `extras`.
    const i = so(vao, 'rate') / 100 / 12;
    const n = giaTri(output);
    const c = so(vao, 'contribution');
    return i === 0 ? c * n : (c * (Math.pow(1 + i, n) - 1)) / i;
  },
  'thanh-toan-nhanh': (vao) => so(vao, 'currentAssets'),
  'tiet-kiem-muc-tieu': (vao) => so(vao, 'target'),
  'tong-loi-suat-tai-dau-tu': (_vao, output) => giaTri(output),
  'tra-gop-goc-deu': (vao) => so(vao, 'amount') + tongLaiTheoLich(vao, 2),
  'tra-gop-nien-kim': (vao) => so(vao, 'amount') + tongLaiTheoLich(vao, 1),
  'ty-le-chi-tra-co-tuc': (vao) => so(vao, 'eps'),
  wacc: (vao) => so(vao, 'equity') + so(vao, 'debt'),
};

describe('tổng của vòng đúng là đại lượng tên tổng gọi ra', () => {
  it('mọi công thức có hình cơ cấu đều có dòng trong bảng — công thức mới phải tự khai tổng của nó', () => {
    expect(Object.keys(TONG_PHAI_BANG).sort()).toEqual(
      CO_CAU.map((formula) => formula.spec.id).sort(),
    );
  });

  it.each(CO_CAU.map((formula) => [formula.spec.id, formula] as const))(
    '%s: ở số mặc định và ở số của ví dụ',
    (id, formula) => {
      const tongPhaiBang = TONG_PHAI_BANG[id];
      if (tongPhaiBang === undefined) throw new Error(`thiếu dòng ${id}`);
      const macDinh = defaultInputs(formula.spec);
      for (const vao of [macDinh, { ...macDinh, ...formula.spec.example.inputs }]) {
        const output = runFormula(formula, vao, CTX);
        const bars = compositionBars(formula.spec, vao, output);
        // Số của ví dụ có thể làm mục vắng đúng luật (một phần âm); số mặc định thì không.
        if (vao === macDinh) expect(bars, id).not.toBeNull();
        if (bars === null) continue;
        const tong = bars.at(-1)?.delta ?? Number.NaN;
        const ky = tongPhaiBang(vao, output);
        expect(Math.abs(tong - ky) / Math.max(1, Math.abs(ky)), id).toBeLessThan(1e-9);
      }
    },
  );
});

/* Các ca biên mà vòng phản biện chỉ ra: hạt bụi dấu phẩy động không được làm mục biến mất sai. */
describe('ca biên của đợt 22 công thức', () => {
  function cacMui(id: string, sua: Readonly<Record<string, number>>) {
    const formula = congThuc(id);
    const vao = { ...defaultInputs(formula.spec), ...sua };
    return compositionBars(formula.spec, vao, runFormula(formula, vao, CTX));
  }

  it('trả góp niên kim lãi suất 0: vẫn vẽ, múi lãi đúng 0 (không âm li ti)', () => {
    const bars = cacMui('tra-gop-nien-kim', { rate: 0, amount: 830_000_000, years: 7 });
    expect(bars?.[1]?.delta).toBe(0);
  });

  it('tiết kiệm mục tiêu một tháng: vẫn vẽ, cả vòng là tiền gửi', () => {
    const bars = cacMui('tiet-kiem-muc-tieu', { months: 1 });
    expect(bars?.[1]?.delta).toBe(0);
  });

  it('số kỳ DCA khi một tháng đã đủ: vẫn vẽ, lợi nhuận tích luỹ đúng 0', () => {
    const bars = cacMui('so-ky-dca', { target: 5_000_000, contribution: 10_000_000 });
    expect(bars?.[1]?.delta).toBe(0);
  });

  it('cỡ vị thế phái sinh chia vừa khít (ra đúng 6 hợp đồng): vẫn vẽ, phần dư đúng 0', () => {
    const bars = cacMui('co-vi-the-phai-sinh', {
      capital: 450_000_000,
      riskPercent: 1.8,
      stopPoints: 13.5,
    });
    // Tuỳ chiều sai số mà phần dư ra 0 hay một hạt bụi DƯƠNG (đo: 9,3e−10 ₫, in 0,0 %); không bao giờ âm.
    expect(bars).not.toBeNull();
    expect(bars?.[0]?.delta).toBeCloseTo(8_100_000, 2);
    expect(bars?.[1]?.delta).toBeGreaterThanOrEqual(0);
    expect(bars?.[1]?.delta).toBeCloseTo(0, 6);
  });

  it('một phần âm thì mục vắng: lỗ, giá giảm, beta âm, vốn lớn hơn giá trị danh nghĩa', () => {
    expect(cacMui('bien-loi-nhuan-rong', { netIncome: -500 })).toBeNull();
    expect(cacMui('hpr', { endPrice: 70_000 })).toBeNull();
    expect(cacMui('capm', { beta: -0.2 })).toBeNull();
    expect(cacMui('don-bay-hieu-dung', { equity: 500_000_000 })).toBeNull();
    expect(cacMui('loi-nhuan-rong', { sellPrice: 92_100 })).toBeNull();
  });
});
