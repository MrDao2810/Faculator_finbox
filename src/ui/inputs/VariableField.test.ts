import { describe, expect, it } from 'vitest';

import { loneNarrowFlags } from './VariableField';

/*
 * `true` = ô chiếm trọn hàng (thanh trượt, nhóm nút, ô móc nối), `false` = ô hẹp (ô số, ô chọn).
 * Lưới dưới 1024px có đúng hai cột — điều kiện mà hàm dựa vào, xem docblock của nó.
 */
describe('loneNarrowFlags — ô hẹp đứng một mình trên hàng của lưới hai cột', () => {
  it('ô hẹp kẹp giữa hai ô rộng đứng một mình (`capm`: Rf · beta · ERP)', () => {
    expect(loneNarrowFlags([true, false, true])).toEqual([false, true, false]);
  });

  it('hai ô hẹp liền nhau ghép đủ một hàng', () => {
    expect(loneNarrowFlags([false, false])).toEqual([false, false]);
    expect(loneNarrowFlags([true, false, false, true])).toEqual([false, false, false, false]);
  });

  it('dải lẻ thì chỉ ô CUỐI dải đứng một mình', () => {
    expect(loneNarrowFlags([false, false, false])).toEqual([false, false, true]);
    expect(loneNarrowFlags([false, true, false, false, true, false])).toEqual([
      true,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  it('ô rộng chặn dải: mỗi dải tính lại từ cột 1', () => {
    expect(loneNarrowFlags([false, true])).toEqual([true, false]);
    expect(loneNarrowFlags([false, false, false, true, false, false])).toEqual([
      false,
      false,
      true,
      false,
      false,
      false,
    ]);
  });

  it('lưới chỉ một ô thì ô ấy nở hết bề ngang (`auto-fit` xoá rãnh rỗng) — không đánh dấu', () => {
    expect(loneNarrowFlags([false])).toEqual([false]);
    expect(loneNarrowFlags([true])).toEqual([false]);
    expect(loneNarrowFlags([])).toEqual([]);
  });

  it('không bao giờ đánh dấu một ô rộng', () => {
    expect(loneNarrowFlags([true, true, false, true])).toEqual([false, false, true, false]);
  });
});
