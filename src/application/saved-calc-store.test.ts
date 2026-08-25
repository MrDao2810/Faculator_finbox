import { describe, expect, it } from 'vitest';

import {
  MAX_SAVED_CALCS,
  addSavedCalc,
  parseSavedCalcs,
  removeSavedCalc,
  renameSavedCalc,
  savedCalcId,
  serializeSavedCalcs,
  type SavedCalc,
} from './saved-calc-store';

const SAVED_AT = 1_756_000_000_000;

function calc(patch: Partial<SavedCalc> = {}): SavedCalc {
  return {
    id: savedCalcId('pe', SAVED_AT),
    formulaId: 'pe',
    name: 'HPG · P/E',
    code: 'HPG',
    inputs: { price: 25_000, eps: 2_000 },
    resultValue: 12.5,
    resultUnit: 'lần',
    savedAt: SAVED_AT,
    needsSeries: false,
    ...patch,
  };
}

describe('savedCalcId', () => {
  it('ghép id công thức với mốc lưu', () => {
    expect(savedCalcId('pe', SAVED_AT)).toBe(`pe-${SAVED_AT}`);
  });
});

describe('parseSavedCalcs', () => {
  it('trả mảng rỗng khi chưa có gì hoặc chuỗi hỏng', () => {
    expect(parseSavedCalcs(null)).toEqual([]);
    expect(parseSavedCalcs(undefined)).toEqual([]);
    expect(parseSavedCalcs('   ')).toEqual([]);
    expect(parseSavedCalcs('{[')).toEqual([]);
    expect(parseSavedCalcs('{"a":1}')).toEqual([]);
  });

  it('đọc lại đúng thứ đã ghi', () => {
    const list = [calc()];
    expect(parseSavedCalcs(serializeSavedCalcs(list))).toEqual(list);
  });

  it('bỏ hẳn mục thiếu id, id công thức, tên hay mốc lưu', () => {
    const raw = JSON.stringify([
      { ...calc(), id: '' },
      { ...calc(), formulaId: '' },
      { ...calc(), name: '   ' },
      { ...calc(), savedAt: 0 },
      { ...calc(), savedAt: 'hôm qua' },
      calc({ id: 'pe-2', name: 'Giữ lại' }),
    ]);

    const list = parseSavedCalcs(raw);
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('Giữ lại');
  });

  it('bỏ mục thứ hai khi hai mục cùng id', () => {
    const raw = JSON.stringify([calc({ name: 'Bản đầu' }), calc({ name: 'Bản sau' })]);
    const list = parseSavedCalcs(raw);

    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe('Bản đầu');
  });

  it('bỏ ô nhập không phải số hữu hạn thay vì điền 0', () => {
    const raw = JSON.stringify([
      calc({ inputs: { price: 25_000, eps: Number.NaN, other: 'nhiều' } as never }),
    ]);

    const list = parseSavedCalcs(raw);
    expect(list[0]?.inputs).toEqual({ price: 25_000 });
    expect(list[0]?.inputs.eps).toBeUndefined();
  });

  it('kết quả không phải số hữu hạn thành null, không thành 0', () => {
    const raw = JSON.stringify([calc({ resultValue: 'lỗi' as never })]);
    expect(parseSavedCalcs(raw)[0]?.resultValue).toBeNull();
  });

  it('viết hoa mã và bỏ hẳn trường khi không có mã', () => {
    const withCode = parseSavedCalcs(JSON.stringify([calc({ code: ' hpg ' })]));
    expect(withCode[0]?.code).toBe('HPG');

    const noCode = parseSavedCalcs(JSON.stringify([{ ...calc(), code: '  ' }]));
    expect(noCode[0]).not.toHaveProperty('code');
  });

  it('cắt ở trần khi bản lưu dài hơn trần', () => {
    const raw = JSON.stringify(
      Array.from({ length: MAX_SAVED_CALCS + 5 }, (_, index) =>
        calc({ id: `pe-${index}`, savedAt: SAVED_AT + index }),
      ),
    );

    expect(parseSavedCalcs(raw)).toHaveLength(MAX_SAVED_CALCS);
  });

  it('cắt luôn khi ghi, không chỉ khi đọc', () => {
    const list = Array.from({ length: MAX_SAVED_CALCS + 5 }, (_, index) =>
      calc({ id: `pe-${index}`, savedAt: SAVED_AT + index }),
    );

    expect(JSON.parse(serializeSavedCalcs(list))).toHaveLength(MAX_SAVED_CALCS);
  });
});

describe('addSavedCalc', () => {
  it('thêm mục mới lên đầu và không sửa mảng gốc', () => {
    const list = [calc({ id: 'pe-1' })];
    const next = addSavedCalc(list, calc({ id: 'roe-2', formulaId: 'roe', name: 'ROE' }));

    expect(next.map((item) => item.id)).toEqual(['roe-2', 'pe-1']);
    expect(list).toHaveLength(1);
  });

  it('trùng id thì thay thế tại chỗ, không tạo mục thứ hai', () => {
    const list = [calc({ name: 'Bản đầu' }), calc({ id: 'roe-1', formulaId: 'roe' })];
    const next = addSavedCalc(list, calc({ name: 'Bản sau' }));

    expect(next).toHaveLength(2);
    expect(next[0]?.name).toBe('Bản sau');
  });

  it('đầy trần thì trả nguyên danh sách — màn tự chặn để nói được lý do', () => {
    const list = Array.from({ length: MAX_SAVED_CALCS }, (_, index) =>
      calc({ id: `pe-${index}`, savedAt: SAVED_AT + index }),
    );

    const next = addSavedCalc(list, calc({ id: 'moi', formulaId: 'roe' }));
    expect(next).toHaveLength(MAX_SAVED_CALCS);
    expect(next.some((item) => item.id === 'moi')).toBe(false);
  });

  it('từ chối mục thiếu id hoặc thiếu tên', () => {
    const list = [calc()];
    expect(addSavedCalc(list, calc({ id: '  ', name: 'X' }))).toHaveLength(1);
    expect(addSavedCalc(list, calc({ id: 'x', name: '  ' }))).toHaveLength(1);
  });
});

describe('renameSavedCalc', () => {
  it('đổi đúng mục, không sửa mảng gốc', () => {
    const list = [calc(), calc({ id: 'roe-1', name: 'ROE' })];
    const next = renameSavedCalc(list, 'roe-1', '  ROE quý 3  ');

    expect(next[1]?.name).toBe('ROE quý 3');
    expect(list[1]?.name).toBe('ROE');
  });

  it('tên rỗng thì giữ nguyên — không cho phép một mục vô danh', () => {
    const list = [calc()];
    expect(renameSavedCalc(list, list[0]?.id ?? '', '   ')[0]?.name).toBe('HPG · P/E');
  });

  it('id lạ thì không đổi gì', () => {
    const list = [calc()];
    expect(renameSavedCalc(list, 'khong-co', 'Tên mới')).toEqual(list);
  });
});

describe('removeSavedCalc', () => {
  it('bỏ đúng mục, không sửa mảng gốc', () => {
    const list = [calc({ id: 'pe-1' }), calc({ id: 'roe-1' })];
    const next = removeSavedCalc(list, 'pe-1');

    expect(next.map((item) => item.id)).toEqual(['roe-1']);
    expect(list).toHaveLength(2);
  });
});
