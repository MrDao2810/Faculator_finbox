import { describe, expect, it } from 'vitest';

import { FORMULAS } from '@/application';

import { tenNgan } from './PresetSheet';

/*
 * Dòng mã của sheet "Nạp bộ số liệu mẫu" in nhãn ô rút gọn ("EPS 5.867 ₫"). Phép cắt được sửa bằng máy
 * trong lượt đổi gạch dài thành gạch nối (02/11/2026) mà không ca nào giữ.
 */
describe('tenNgan() — nhãn ô rút về phần tên ở dòng mã của sheet nạp mẫu', () => {
  it('cắt ở gạch nối có cách hai bên', () => {
    expect(tenNgan('EPS - lợi nhuận trên mỗi cổ phiếu')).toBe('EPS');
  });

  it('vẫn nhận gạch dài và gạch vừa của nhãn cũ', () => {
    expect(tenNgan('EPS — lợi nhuận trên mỗi cổ phiếu')).toBe('EPS');
    expect(tenNgan('EPS – lợi nhuận trên mỗi cổ phiếu')).toBe('EPS');
  });

  it('gạch nối dính chữ là một phần của tên, không cắt', () => {
    expect(tenNgan('Hệ số beta so với VN-Index')).toBe('Hệ số beta so với VN-Index');
  });

  it('mọi nhãn ô có gạch nối cách hai bên đều rút về đúng phần trước gạch', () => {
    const nhan = FORMULAS.flatMap((spec) =>
      spec.variables.flatMap((variable) => [variable.label.vi, variable.label.en]),
    ).filter((label) => label.includes(' - '));
    expect(nhan.length).toBeGreaterThan(0);
    for (const label of nhan) {
      const ten = tenNgan(label);
      expect(ten.includes(' - '), label).toBe(false);
      expect(label.startsWith(`${ten} - `), label).toBe(true);
    }
  });
});
