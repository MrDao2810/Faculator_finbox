import { describe, expect, it } from 'vitest';

import { resolveRepeat, runFormula } from '../calc/run';
import type { CalcContext } from '../calc/types';
import { sweepCandidates } from '../chart/sweep';
import { FORMULA_MODULES, findFormulaModule } from '../formulas';
import { defaultInputs } from './build';
import {
  addRepeatGroup,
  clampRepeatCount,
  fillRepeat,
  removeRepeatGroup,
  repeatControls,
  repeatCount,
  repeatLimits,
  repeatSlotOf,
  resolveRepeatSpec,
} from './repeat';
import type { FormulaSpec } from './types';
import { validateFormula } from './validate';

/**
 * Nhóm ô lặp (13/10/2026) — công thức có số ô nhập do người dùng thêm bớt.
 *
 * Chủ dự án chỉ vào ba đợt mua khai cứng của `gia-von-trung-binh-dca` và hỏi người muốn thử bốn,
 * năm, sáu đợt thì làm sao. Các ca dưới giữ ba lời hứa của lời giải: màn mở ra y như cũ, thêm bớt
 * nhóm thì MỌI nơi đọc danh sách ô thấy cùng một danh sách, và không đường nào để một nhóm thiếu
 * số lọt vào phép tính thành số 0 (FR-06).
 */

const CTX: CalcContext = { asOf: '2026-08-04' };

function module(id: string) {
  const found = findFormulaModule(id);
  if (found === undefined) throw new Error(`không có công thức ${id}`);
  return found;
}

const DCA = module('gia-von-trung-binh-dca');
const GEO = module('loi-suat-trung-binh-hinh-hoc');

const khoaCua = (spec: FormulaSpec): string[] => spec.variables.map((bien) => bien.key);

describe('công thức nào có nhóm ô lặp', () => {
  /*
   * GHIM DANH SÁCH. Khai `repeat` cho một công thức là đổi cách màn của nó dựng ô nhập, và kéo theo
   * chữ "Đọc biểu đồ" cho ô mẫu — không phải việc làm tiện tay. `xirr` cố ý không có: bảng dòng
   * tiền của nó là thân riêng (`XirrBody`), không phải ô của `spec.variables`.
   */
  it('đúng hai công thức: giá vốn DCA và lợi suất trung bình hình học', () => {
    const co = FORMULA_MODULES.filter((formula) => formula.spec.repeat !== undefined).map(
      (formula) => formula.spec.id,
    );
    expect(co.sort()).toEqual(['gia-von-trung-binh-dca', 'loi-suat-trung-binh-hinh-hoc']);
  });

  it('miền của số nhóm lấy từ chính biến đếm', () => {
    expect(repeatLimits(DCA.spec)).toEqual({ min: 1, max: 12, declared: 3 });
    expect(repeatLimits(GEO.spec)).toEqual({ min: 2, max: 12, declared: 3 });
    expect(repeatLimits(module('pe').spec)).toBeNull();
  });
});

describe('màn mở ra y như trước', () => {
  it('bộ số mặc định cho đúng spec gốc, không dựng object mới', () => {
    for (const formula of [DCA, GEO]) {
      const inputs = defaultInputs(formula.spec);
      expect(resolveRepeatSpec(formula.spec, inputs)).toBe(formula.spec);
      expect(resolveRepeat(formula, inputs)).toBe(formula);
    }
  });

  it('công thức không khai nhóm lặp nhận lại đúng chính nó với mọi bộ số', () => {
    const pe = module('pe');
    expect(resolveRepeatSpec(pe.spec, { price: 1, eps: 2, lots: 9 })).toBe(pe.spec);
    expect(resolveRepeat(pe, {})).toBe(pe);
    expect(repeatCount(pe.spec, {})).toBe(0);
    expect(repeatControls(pe.spec, {})).toBeNull();
    expect(addRepeatGroup(pe.spec, {})).toBeNull();
    expect(removeRepeatGroup(pe.spec, {})).toBeNull();
  });

  it('biến đếm không đứng được trên trục biểu đồ', () => {
    expect(sweepCandidates(DCA.spec, 'advanced').map((v) => v.key)).not.toContain('lots');
    expect(sweepCandidates(GEO.spec, 'advanced').map((v) => v.key)).not.toContain('periods');
  });
});

describe('thêm một nhóm', () => {
  const batDau = defaultInputs(DCA.spec);
  const bon = addRepeatGroup(DCA.spec, batDau);

  it('biến đếm tăng một và ô của nhóm mới mang số 0', () => {
    expect(bon).toMatchObject({ lots: 4, amount4: 0, price4: 0 });
    // Bộ số gốc không bị sửa tại chỗ: màn giữ nó trong state.
    expect(batDau).not.toHaveProperty('amount4');
    expect(batDau.lots).toBe(3);
  });

  it('spec dựng lại có thêm đúng hai ô, đứng ngay sau đợt ba, nhãn đã điền số', () => {
    const spec = resolveRepeatSpec(DCA.spec, bon ?? {});
    expect(khoaCua(spec)).toEqual([
      'lots',
      'amount1',
      'price1',
      'amount2',
      'price2',
      'amount3',
      'price3',
      'amount4',
      'price4',
    ]);

    const tien = spec.variables.find((v) => v.key === 'amount4');
    expect(tien?.label).toEqual({ vi: 'Tiền mua đợt 4', en: 'Amount invested, round 4' });
    expect(tien?.unit).toBe('₫');
    expect(tien?.defaultValue).toBe(0);
    // Ba đợt đầu giữ nguyên bản viết tay — cùng một object, không phải bản sinh từ mẫu.
    expect(spec.variables.find((v) => v.key === 'price3')).toBe(
      DCA.spec.variables.find((v) => v.key === 'price3'),
    );
  });

  it('cùng một số nhóm luôn ra cùng một object', () => {
    const a = resolveRepeatSpec(DCA.spec, bon ?? {});
    const b = resolveRepeatSpec(DCA.spec, { ...bon, amount4: 5_000_000 });
    expect(a).toBe(b);
    expect(resolveRepeat(DCA, bon ?? {})).toBe(resolveRepeat(DCA, { ...bon, price4: 1 }));
    // Đưa chính bản đã dựng vào lại cũng ra bản ấy: phép dựng luôn đi từ spec gốc.
    expect(resolveRepeatSpec(a, bon ?? {})).toBe(a);
    expect(resolveRepeatSpec(a, batDau)).toBe(DCA.spec);
  });

  it('ô sót lại từ một bộ số cũ bị ghi đè khi thêm nhóm', () => {
    const cu = { ...batDau, amount4: 77, price4: 88 };
    expect(addRepeatGroup(DCA.spec, cu)).toMatchObject({ lots: 4, amount4: 0, price4: 0 });
  });

  it('chạm trần thì không thêm được nữa', () => {
    let inputs: Record<string, number> = batDau;
    for (let i = 0; i < 9; i += 1) inputs = addRepeatGroup(DCA.spec, inputs) ?? inputs;

    expect(inputs.lots).toBe(12);
    expect(repeatControls(DCA.spec, inputs)).toMatchObject({ count: 12, canAdd: false });
    expect(addRepeatGroup(DCA.spec, inputs)).toBeNull();
    expect(resolveRepeatSpec(DCA.spec, inputs).variables).toHaveLength(1 + 12 * 2);
  });
});

describe('bỏ nhóm cuối', () => {
  it('biến đếm giảm một và khoá của nhóm ấy rời hẳn bộ số', () => {
    const bon = addRepeatGroup(GEO.spec, defaultInputs(GEO.spec)) ?? {};
    const ba = removeRepeatGroup(GEO.spec, { ...bon, r4: 15 });
    expect(ba).toMatchObject({ periods: 3 });
    expect(ba).not.toHaveProperty('r4');
  });

  it('bỏ xuống dưới số nhóm khai sẵn thì ô khai sẵn cũng rời danh sách', () => {
    const hai = removeRepeatGroup(GEO.spec, defaultInputs(GEO.spec)) ?? {};
    expect(hai.periods).toBe(2);
    expect(khoaCua(resolveRepeatSpec(GEO.spec, hai))).toEqual(['periods', 'r1', 'r2']);
  });

  it('không bỏ được dưới mức tối thiểu, và nhãn nút gọi đúng nhóm sẽ bỏ', () => {
    const hai = removeRepeatGroup(GEO.spec, defaultInputs(GEO.spec)) ?? {};
    expect(removeRepeatGroup(GEO.spec, hai)).toBeNull();
    expect(repeatControls(GEO.spec, hai)).toMatchObject({ count: 2, canRemove: false });

    const dieuKhien = repeatControls(DCA.spec, defaultInputs(DCA.spec));
    expect(dieuKhien?.removeLabel).toEqual({ vi: 'Bỏ đợt 3', en: 'Remove round 3' });
    expect(dieuKhien?.addLabel.vi).toBe('Thêm đợt mua');
  });
});

describe('số nhóm đọc từ bộ số liệu', () => {
  it('làm tròn và kẹp về miền của biến đếm', () => {
    expect(repeatCount(DCA.spec, { lots: 4.4 })).toBe(4);
    expect(repeatCount(DCA.spec, { lots: 0 })).toBe(1);
    expect(repeatCount(DCA.spec, { lots: 99 })).toBe(12);
    expect(repeatCount(GEO.spec, { periods: 1 })).toBe(2);
  });

  it('biến đếm vắng hoặc không hữu hạn thì lấy số nhóm khai sẵn', () => {
    expect(repeatCount(DCA.spec, {})).toBe(3);
    expect(repeatCount(DCA.spec, { lots: Number.NaN })).toBe(3);
    expect(clampRepeatCount(Number.POSITIVE_INFINITY, 1, 12)).toBe(1);
  });

  it('nhận ra ô của nhóm lặp theo tiền tố và số thứ tự', () => {
    const { repeat } = DCA.spec;
    if (repeat === undefined) throw new Error('thiếu repeat');
    expect(repeatSlotOf(repeat, 'amount12')).toEqual({ prefix: 'amount', n: 12 });
    expect(repeatSlotOf(repeat, 'price4')).toEqual({ prefix: 'price', n: 4 });
    expect(repeatSlotOf(repeat, 'lots')).toBeNull();
    expect(repeatSlotOf(repeat, 'amount')).toBeNull();
    expect(repeatSlotOf(repeat, 'amount04')).toBeNull();
    expect(repeatSlotOf(repeat, 'amount0')).toBeNull();
  });

  it('điền số thứ tự vào cả hai tiếng', () => {
    expect(fillRepeat({ vi: 'Bỏ đợt {n}', en: 'Remove round {n}' }, 7)).toEqual({
      vi: 'Bỏ đợt 7',
      en: 'Remove round 7',
    });
  });
});

describe('phép tính đi theo đúng số nhóm (FR-06)', () => {
  it('đợt vừa thêm còn 0 thì giá vốn chưa đổi; gõ đủ tiền và giá thì đổi', () => {
    const goc = defaultInputs(DCA.spec);
    const truoc = runFormula(DCA, goc, CTX).value;
    const bon = addRepeatGroup(DCA.spec, goc) ?? {};

    expect(runFormula(DCA, bon, CTX).value).toBe(truoc);

    const sau = runFormula(DCA, { ...bon, amount4: 10_000_000, price4: 20_000 }, CTX);
    expect(sau.value).toBeCloseTo(29_629.63, 1);
  });

  it('nhóm được đếm mà thiếu số thì báo chưa nhập đủ, gọi đúng tên ô, không tính thành 0', () => {
    const thieu = runFormula(
      DCA,
      { ...defaultInputs(DCA.spec), lots: 5, amount4: 1, price4: 1 },
      CTX,
    );
    expect(thieu.value).toBeNull();
    expect(thieu.warning?.code).toBe('INCOMPLETE_INPUT');
    expect(thieu.warning?.message.vi).toContain('Tiền mua đợt 5');
    expect(thieu.warning?.message.vi).toContain('Giá mua đợt 5');
  });

  it('gọi qua bản đã dựng hay bản gốc đều ra cùng kết quả', () => {
    const bon = { ...(addRepeatGroup(GEO.spec, defaultInputs(GEO.spec)) ?? {}), r4: 5 };
    const quaGoc = runFormula(GEO, bon, CTX);
    const quaBanDung = runFormula(resolveRepeat(GEO, bon), bon, CTX);
    expect(quaBanDung).toEqual(quaGoc);
    expect(quaGoc.value).toBeCloseTo(7.1203, 3);
  });

  it('bỏ một kỳ thì kỳ ấy thôi được tính dù số của nó còn trong bộ số', () => {
    const hai = { ...defaultInputs(GEO.spec), periods: 2, r3: 999 };
    expect(runFormula(GEO, hai, CTX).value).toBeCloseTo(2.2252, 3);
  });
});

describe('validator giữ khai báo nhóm lặp cho thẳng', () => {
  const NHOM = new Set(['investing', 'returns']);
  const loi = (spec: FormulaSpec): string[] =>
    validateFormula(spec, NHOM)
      .filter((issue) => issue.severity === 'error')
      .map((issue) => issue.path);

  it('hai khai báo thật không có lỗi nào', () => {
    expect(loi(DCA.spec)).toEqual([]);
    expect(loi(GEO.spec)).toEqual([]);
  });

  it('biến đếm không có thật, hoặc không phải ô số nguyên có miền, là lỗi', () => {
    const { repeat } = DCA.spec;
    if (repeat === undefined) throw new Error('thiếu repeat');

    expect(loi({ ...DCA.spec, repeat: { ...repeat, countKey: 'khongCo' } })).toContain(
      'gia-von-trung-binh-dca.repeat.countKey',
    );

    const khongBuoc = DCA.spec.variables.map((bien) =>
      bien.key === 'lots' ? { ...bien, step: undefined } : bien,
    );
    expect(loi({ ...DCA.spec, variables: khongBuoc })).toContain(
      'gia-von-trung-binh-dca.repeat.countKey',
    );
  });

  it('số nhóm khai sẵn phải bằng giá trị mặc định của biến đếm', () => {
    const lech = DCA.spec.variables.map((bien) =>
      bien.key === 'lots' ? { ...bien, defaultValue: 2 } : bien,
    );
    expect(loi({ ...DCA.spec, variables: lech })).toContain(
      'gia-von-trung-binh-dca.repeat.countKey',
    );
  });

  it('nhóm khai sẵn thiếu ô hoặc đứng sai thứ tự là lỗi', () => {
    const thieu = DCA.spec.variables.filter((bien) => bien.key !== 'price2');
    expect(loi({ ...DCA.spec, variables: thieu })).toContain(
      'gia-von-trung-binh-dca.repeat.fields',
    );

    const dao = [...DCA.spec.variables];
    const [a, b] = [dao[1], dao[2]];
    if (a === undefined || b === undefined) throw new Error('thiếu ô');
    dao[1] = b;
    dao[2] = a;
    expect(loi({ ...DCA.spec, variables: dao })).toContain('gia-von-trung-binh-dca.repeat.fields');
  });

  it('nhãn ô mẫu và nhãn nút bỏ phải mang {n}', () => {
    const { repeat } = GEO.spec;
    if (repeat === undefined) throw new Error('thiếu repeat');
    const mau = repeat.fields[0];
    if (mau === undefined) throw new Error('thiếu ô mẫu');

    expect(
      loi({
        ...GEO.spec,
        repeat: { ...repeat, fields: [{ ...mau, label: { vi: 'Lợi suất kỳ', en: 'Return' } }] },
      }),
    ).toContain('loi-suat-trung-binh-hinh-hoc.repeat.fields.r.label');

    expect(
      loi({ ...GEO.spec, repeat: { ...repeat, removeLabel: { vi: 'Bỏ kỳ', en: 'Remove' } } }),
    ).toContain('loi-suat-trung-binh-hinh-hoc.repeat.removeLabel');
  });

  it('ca kiểm thử được mang ô của nhóm thêm, nhưng không được mang khoá lạ', () => {
    const caLa = {
      ...DCA.spec,
      tests: [
        { name: 'khoá lạ', inputs: { lots: 3, amount12: 1, amount13: 1, khac: 2 }, expected: 1 },
      ],
    };
    const duongLoi = loi(caLa);
    expect(duongLoi).toContain('gia-von-trung-binh-dca.tests[0].inputs.amount13');
    expect(duongLoi).toContain('gia-von-trung-binh-dca.tests[0].inputs.khac');
    expect(duongLoi).not.toContain('gia-von-trung-binh-dca.tests[0].inputs.amount12');
  });
});
