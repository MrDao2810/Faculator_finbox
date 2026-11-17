import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from './index';

/*
 * Miền của ô số theo điều kiện của công thức (16/11/2026).
 *
 * Chủ dự án đổi mọi thanh trượt thành ô số, rồi chụp ô "Số tiền vay" báo "Số liệu nhỏ nhất là
 * 1.000.000." — một mức tự đặt, không phải điều kiện của công thức: _"tại sao lại phải cố định nhỏ nhất
 * là 1 triệu ?"_, rồi _"cần điều chỉnh lại toàn bộ công thức theo hướng này để không gặp phải lỗi"_.
 * Hai ca dưới gác phần máy thấy được; việc một min/max có phải điều kiện thật hay không thì phải đọc
 * `calc` (bảng rà ở TASK.md).
 */

/** Đơn vị đếm: số phiên, số kỳ, số ngày, số cổ phiếu, số hợp đồng, số tháng. */
const DON_VI_DEM = new Set(['phiên', 'kỳ', 'ngày', 'CP', 'HĐ', 'tháng']);

/**
 * Ô đếm cố ý nhận số lẻ, mỗi ô một lý do. Ô mới có đơn vị đếm mà không khai `integer` thì phải vào
 * đây, tức là phải tự quyết.
 */
const DUOC_SO_LE: Readonly<Record<string, string>> = {
  'phi-luu-ky.months': 'phí lưu ký tính theo ngày thực giữ, nên 1,5 tháng là hợp lệ',
  'gia-hoa-von.months': 'cùng phí lưu ký của phi-luu-ky',
  'loi-nhuan-rong.months': 'cùng phí lưu ký của phi-luu-ky',
  'roi-rong.months': 'cùng phí lưu ký của phi-luu-ky',
};

const moiO = FORMULA_MODULES.flatMap((m) =>
  [...m.spec.variables, ...(m.spec.repeat?.fields ?? [])]
    .filter((v) => v.type === 'number')
    .map((v) => ({ ten: `${m.spec.id}.${v.key}`, v })),
);

describe('miền của ô số theo điều kiện của công thức', () => {
  it('ô có đơn vị đếm chỉ nhận số nguyên, trừ ngoại lệ có lý do', () => {
    const thieu = moiO
      .filter(({ v }) => DON_VI_DEM.has(v.unit) && v.integer !== true)
      .map(({ ten }) => ten)
      .filter((ten) => DUOC_SO_LE[ten] === undefined);
    expect(thieu).toEqual([]);
  });

  it('danh sách ngoại lệ không còn ô nào đã khai integer hay đã biến mất', () => {
    const conTen = new Set(moiO.filter(({ v }) => v.integer !== true).map(({ ten }) => ten));
    expect(Object.keys(DUOC_SO_LE).filter((ten) => !conTen.has(ten))).toEqual([]);
  });

  it('mọi ô số khai cả min lẫn max, và giá trị mặc định nằm trong miền, đúng luật số nguyên', () => {
    const sai = moiO
      .filter(
        ({ v }) =>
          v.min === undefined ||
          v.max === undefined ||
          v.defaultValue < v.min ||
          v.defaultValue > v.max ||
          (v.integer === true && !Number.isInteger(v.defaultValue)),
      )
      .map(({ ten }) => ten);
    expect(sai).toEqual([]);
  });
});
