import { describe, expect, it } from 'vitest';

import { fail, ok } from './calc-output';
import {
  linkedInputs,
  linkedWarning,
  missingLinkedLabels,
  resolveLinked,
  startOverrideValue,
  type LinkedArgs,
  type LinkedUpstream,
} from './linked-input';
import type { VariableSpec } from './types';
import { modelViolation } from './warnings';

/** Biến WACC — đúng ca của WF-15: WACC nhận giá trị từ CAPM ở thượng nguồn. */
const wacc: VariableSpec = {
  key: 'wacc',
  label: { vi: 'WACC', en: 'WACC' },
  unit: '%',
  type: 'number',
  defaultValue: 12.1,
  min: 0,
  max: 100,
  level: 'advanced',
};

const capmOk: LinkedUpstream = {
  formulaId: 'capm',
  label: { vi: 'CAPM', en: 'CAPM' },
  output: ok(14.3, '%'),
};

const capmLoi: LinkedUpstream = {
  formulaId: 'capm',
  label: { vi: 'CAPM', en: 'CAPM' },
  output: fail(
    '%',
    modelViolation({
      vi: 'chưa đủ 60 phiên giá để tính Beta',
      en: 'not enough 60 price sessions to compute Beta',
    }),
  ),
};

describe('mode manual — không móc nối', () => {
  it('không có thượng nguồn thì là ô nhập tay, lấy giá trị mặc định', () => {
    const result = resolveLinked({ spec: wacc });
    expect(result.mode).toBe('manual');
    expect(result.value).toBe(12.1);
  });

  it('ô nhập tay không có nút Ghi đè lẫn Hoàn tác — không có gì để ghi đè', () => {
    const result = resolveLinked({ spec: wacc });
    expect(result.canOverride).toBe(false);
    expect(result.canRevert).toBe(false);
  });

  it('người dùng gõ số thì lấy đúng số đó', () => {
    expect(resolveLinked({ spec: wacc, override: 9.5 }).value).toBe(9.5);
  });
});

describe('mode linked — đang nhận giá trị tự động', () => {
  it('lấy giá trị của thượng nguồn và ghi rõ tên nguồn (FR-15)', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmOk });
    expect(result.mode).toBe('linked');
    expect(result.value).toBe(14.3);
    expect(result.sourceLabel?.vi).toBe('CAPM');
  });

  it('mở nút Ghi đè, chưa có gì để hoàn tác', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmOk });
    expect(result.canOverride).toBe(true);
    expect(result.canRevert).toBe(false);
  });

  it('không có cảnh báo khi thượng nguồn bình thường', () => {
    expect(resolveLinked({ spec: wacc, upstream: capmOk }).warning).toBeUndefined();
  });
});

describe('mode inheritedError — thượng nguồn lỗi', () => {
  it('không cho ra số, đúng bất biến FR-15', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmLoi });
    expect(result.mode).toBe('inheritedError');
    expect(result.value).toBeNull();
  });

  it('giữ nguyên cảnh báo gốc của thượng nguồn để người dùng biết hỏng ở đâu', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmLoi });
    expect(result.warning?.code).toBe('MODEL_VIOLATION');
    expect(result.warning?.message.vi).toContain('60 phiên giá');
  });

  it('thượng nguồn lỗi mà không kèm lý do thì tự dựng cảnh báo kế thừa hai lối đi', () => {
    const upstream: LinkedUpstream = {
      formulaId: 'capm',
      label: { vi: 'CAPM', en: 'CAPM' },
      // Cố tình dựng tay một CalcOutput thiếu warning, mô phỏng công thức viết ẩu.
      output: { value: null, unit: '%' },
    };
    const result = resolveLinked({ spec: wacc, upstream });

    expect(result.warning?.code).toBe('INHERITED');
    expect(result.warning?.fix?.vi).toContain('CAPM');
    expect(result.warning?.fix?.vi).toContain('WACC');
  });

  it('vẫn mở nút Ghi đè — đó là lối thoát WF-15 hứa với người dùng', () => {
    expect(resolveLinked({ spec: wacc, upstream: capmLoi }).canOverride).toBe(true);
  });
});

describe('mode overridden — đã ghi đè', () => {
  it('giá trị ghi đè thắng giá trị tự động', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmOk, override: 11 });
    expect(result.mode).toBe('overridden');
    expect(result.value).toBe(11);
  });

  it('CA THEN CHỐT — ghi đè thắng cả khi thượng nguồn đang lỗi', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmLoi, override: 11 });

    expect(result.mode).toBe('overridden');
    expect(result.value).toBe(11);
    // Đã ghi đè thì không còn kẹt ở cảnh báo kế thừa nữa.
    expect(result.warning).toBeUndefined();
  });

  it('mở nút Hoàn tác, đóng nút Ghi đè', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmOk, override: 11 });
    expect(result.canRevert).toBe(true);
    expect(result.canOverride).toBe(false);
  });

  it('vẫn ghi tên nguồn để người dùng biết đang ghi đè lên cái gì', () => {
    expect(resolveLinked({ spec: wacc, upstream: capmOk, override: 11 }).sourceLabel?.vi).toBe(
      'CAPM',
    );
  });

  it('ghi đè bằng số 0 vẫn là ghi đè, không bị nhầm thành chưa ghi đè', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmOk, override: 0 });
    expect(result.mode).toBe('overridden');
    expect(result.value).toBe(0);
  });

  it('ghi đè bằng giá trị không hữu hạn thì bỏ qua, quay về giá trị tự động (FR-06)', () => {
    const result = resolveLinked({ spec: wacc, upstream: capmOk, override: Number.NaN });
    expect(result.mode).toBe('linked');
    expect(result.value).toBe(14.3);
  });

  it('hoàn tác = bỏ override, quay lại nhận tự động', () => {
    const daGhiDe: LinkedArgs = { spec: wacc, upstream: capmOk, override: 11 };
    const sauHoanTac: LinkedArgs = { spec: wacc, upstream: capmOk };

    expect(resolveLinked(daGhiDe).mode).toBe('overridden');
    expect(resolveLinked(sauHoanTac).mode).toBe('linked');
    expect(resolveLinked(sauHoanTac).value).toBe(14.3);
  });
});

describe('startOverrideValue()', () => {
  it('bắt đầu từ giá trị đang hiện, không bắt gõ lại từ đầu', () => {
    expect(startOverrideValue({ spec: wacc, upstream: capmOk })).toBe(14.3);
  });

  it('thượng nguồn lỗi nên không có số nào để lấy thì rơi về mặc định của biến', () => {
    expect(startOverrideValue({ spec: wacc, upstream: capmLoi })).toBe(12.1);
  });
});

describe('gom nhiều ô lại', () => {
  const eps: VariableSpec = {
    ...wacc,
    key: 'eps',
    label: { vi: 'EPS', en: 'EPS' },
    defaultValue: 6_050,
  };

  it('linkedInputs trả null cho ô chưa có số dùng được, không trả 0 (FR-06)', () => {
    const inputs = linkedInputs([
      { spec: wacc, upstream: capmLoi },
      { spec: eps, override: 6_050 },
    ]);

    expect(inputs.wacc).toBeNull();
    expect(inputs.eps).toBe(6_050);
  });

  it('liệt kê đúng nhãn các ô còn thiếu để dựng thông điệp “Còn thiếu: …”', () => {
    const missing = missingLinkedLabels([
      { spec: wacc, upstream: capmLoi },
      { spec: eps, override: 6_050 },
    ]);

    expect(missing).toEqual([{ vi: 'WACC', en: 'WACC' }]);
  });

  it('mọi ô đủ số thì không còn gì thiếu', () => {
    expect(missingLinkedLabels([{ spec: wacc, upstream: capmOk }])).toEqual([]);
  });
});

describe('linkedWarning()', () => {
  it('lấy được cảnh báo mà không phải tự đọc mode', () => {
    expect(linkedWarning({ spec: wacc, upstream: capmLoi })?.code).toBe('MODEL_VIOLATION');
    expect(linkedWarning({ spec: wacc, upstream: capmOk })).toBeUndefined();
  });
});
