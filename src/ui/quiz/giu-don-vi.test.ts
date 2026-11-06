import { describe, expect, it } from 'vitest';

import { giuSoVoiDonVi, laGiaTriNgan } from './giu-don-vi';

/* Chủ dự án, 06/11/2026: "4 / năm" trong bảng số liệu câu CAGR, đơn vị rơi xuống dòng dưới số. */

const N = '\u00a0';

describe('nối số với đơn vị trong ô giá trị của bảng số liệu', () => {
  it('số rồi đơn vị không bao giờ tách', () => {
    expect(giuSoVoiDonVi('4 năm')).toBe(`4${N}năm`);
    expect(giuSoVoiDonVi('600.000.000 ₫')).toBe(`600.000.000${N}₫`);
    expect(giuSoVoiDonVi('0,57 lần')).toBe(`0,57${N}lần`);
    expect(giuSoVoiDonVi('12 tháng, 6%/năm')).toBe(`12${N}tháng, 6%/năm`);
  });

  it('đơn vị hai chữ và đơn vị tiền đứng trước số cũng liền một khối', () => {
    expect(giuSoVoiDonVi('71.150,89 tỷ đồng')).toBe(`71.150,89${N}tỷ${N}đồng`);
    expect(giuSoVoiDonVi('400 billion ₫')).toBe(`400${N}billion${N}₫`);
    expect(giuSoVoiDonVi('VND 71,150.89 billion')).toBe(`VND${N}71,150.89${N}billion`);
  });

  it('giá trị tới 24 ký tự là ngắn, dài hơn thì được xuống dòng', () => {
    expect(laGiaTriNgan('4 năm')).toBe(true);
    expect(laGiaTriNgan('x'.repeat(24))).toBe(true);
    expect(laGiaTriNgan('x'.repeat(25))).toBe(false);
  });

  it('vẫn xuống dòng được giữa các số của một dãy', () => {
    expect(giuSoVoiDonVi('19%; 12%; 23%; −5%')).toBe('19%; 12%; 23%; −5%');
    expect(giuSoVoiDonVi('19.500 · 20.000 · 22.000 ₫')).toBe(`19.500 · 20.000 · 22.000${N}₫`);
  });
});
