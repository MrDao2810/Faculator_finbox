import { describe, expect, it } from 'vitest';

import { en } from '@/application/i18n/en';
import { vi } from '@/application/i18n/vi';
import type { VariableSpec } from '@/application';

import { cauLoiMien, cauSoAm, tenTrongCau } from './mien-nhap';

/*
 * Câu báo của ô số gọi đúng TÊN ô (16/11/2026). Chủ dự án trên ô "Số tiền vay (P)": _"Số tiền vay
 * lớn hơn 0"_ — tên của chính ô, bỏ ký hiệu; điều kiện của ô khoản vay là > 0 (`positive`).
 */
const tVi = (k: keyof typeof vi): string => vi[k];
const tEn = (k: keyof typeof en): string => en[k] ?? '';

function o(unit: string, patch: Partial<VariableSpec> = {}): VariableSpec {
  return {
    key: 'x',
    label: { vi: 'X', en: 'X' },
    unit,
    type: 'number',
    defaultValue: 10,
    min: 1,
    max: 100,
    level: 'basic',
    ...patch,
  };
}

const vay = { ten: 'Số tiền vay (P)', donVi: '₫' };
const khoanVay = o('₫', { min: 0, max: 1_000_000, positive: true });

describe('câu báo gọi đúng tên ô', () => {
  it('tên là nhãn bỏ ký hiệu trong ngoặc ở cuối', () => {
    expect(tenTrongCau('Số tiền vay (P)', tVi)).toBe('Số tiền vay');
    expect(tenTrongCau('Lãi suất / năm (r)', tVi)).toBe('Lãi suất / năm');
    expect(tenTrongCau('Kỳ hạn', tVi)).toBe('Kỳ hạn');
    expect(tenTrongCau('', tVi)).toBe('Số liệu');
  });

  it('ô khoản vay: gõ dấu trừ, gõ 0 hay số âm đều là "Số tiền vay lớn hơn 0."', () => {
    expect(cauSoAm(khoanVay, tVi, vay)).toBe('Số tiền vay lớn hơn 0.');
    expect(cauLoiMien(0, khoanVay, tVi, vay)).toBe('Số tiền vay lớn hơn 0.');
    expect(cauLoiMien(-5, khoanVay, tVi, vay)).toBe('Số tiền vay lớn hơn 0.');
    expect(cauLoiMien(0.5, khoanVay, tVi, vay)).toBeUndefined();
  });

  it('min 0 không kèm positive: "… không được âm."', () => {
    const goc = { ten: 'Số tiền gốc (P)', donVi: '₫' };
    expect(cauLoiMien(-1, o('₫', { min: 0 }), tVi, goc)).toBe('Số tiền gốc không được âm.');
    expect(cauSoAm(o('₫', { min: 0 }), tVi, goc)).toBe('Số tiền gốc không được âm.');
  });

  it('dưới min dương, vượt max, số lẻ — con số kèm đơn vị', () => {
    const phien = { ten: 'Số phiên (n)', donVi: 'phiên' };
    expect(cauLoiMien(0.5, o('phiên'), tVi, phien)).toBe('Số phiên nhỏ nhất phải là 1 phiên.');
    expect(cauLoiMien(101, o('phiên'), tVi, phien)).toBe('Số phiên không được vượt quá 100 phiên.');
    expect(cauLoiMien(20.5, o('phiên', { integer: true }), tVi, phien)).toBe(
      'Số phiên phải là số nguyên.',
    );
    expect(cauLoiMien(101, o(''), tVi, { ten: 'Hệ số', donVi: '' })).toBe(
      'Hệ số không được vượt quá 100.',
    );
  });

  it('bản tiếng Anh dùng nhãn tiếng Anh', () => {
    expect(cauLoiMien(0, khoanVay, tEn, { ten: 'Loan amount (P)', donVi: '₫' })).toBe(
      'Loan amount must be greater than 0.',
    );
  });

  it('trong miền thì không có câu nào', () => {
    expect(cauLoiMien(50, o('₫'), tVi, vay)).toBeUndefined();
  });
});
