import { describe, expect, it } from 'vitest';

import { CACH_TEN_TRUC, CHAN, HANG_CHU_GIAI, xepChuGiaiDuoi } from './chu-giai-duoi';

/*
 * Chú giải đáy hình của hình cột và hình phân tán (28/10/2026). Ba điều chủ dự án nhìn thấy: nó ở dưới
 * cùng, hàng cuối cách đáy khung một lề cố định, và mỗi hàng nằm giữa vùng vẽ như tên trục ngang.
 */
describe('xepChuGiaiDuoi — chú giải ở đáy hình', () => {
  it('không có mục nào thì không lấy chỗ: hình y như cũ', () => {
    expect(xepChuGiaiDuoi([], 40, 630, 640, 400)).toEqual({ muc: [], cao: 0 });
  });

  it('một hàng: chân chữ ở H − CHAN, canh giữa vùng vẽ, chiếm đúng khoảng cách tới tên trục', () => {
    const { muc, cao } = xepChuGiaiDuoi(
      [
        { key: 'a', text: 'Từng phiên' },
        { key: 'b', text: 'Đường hồi quy, độ dốc β = 0,08' },
      ],
      40,
      630,
      640,
      400,
    );
    expect(cao).toBe(CACH_TEN_TRUC);
    expect(muc.map((m) => m.y)).toEqual([400 - CHAN, 400 - CHAN]);
    // Hai bên khoảng trống bằng nhau quanh tâm vùng vẽ (335): mép trái mục đầu và mép phải mục cuối.
    const dau = muc[0];
    const cuoi = muc[1];
    if (dau === undefined || cuoi === undefined) throw new Error('thiếu mục');
    const mepPhai = cuoi.x + 14 + cuoi.text.length * 10 * 0.49 * 1.1;
    expect(dau.x - 40).toBeCloseTo(630 - mepPhai, 6);
    expect(dau.x).toBeLessThan(cuoi.x);
  });

  it('tràn bề ngang thì xuống hàng; hàng cuối vẫn sát đáy, các hàng trên lùi lên từng nhịp', () => {
    const items = ['Tiền gốc đã trả', 'Tiền lãi đã trả', 'Mục tiêu tiết kiệm'].map((text, i) => ({
      key: String(i),
      text,
    }));
    const { muc, cao } = xepChuGiaiDuoi(items, 30, 180, 200, 240);
    const hang = [...new Set(muc.map((m) => m.y))];
    expect(hang.length).toBeGreaterThan(1);
    expect(hang.at(-1)).toBe(240 - CHAN);
    expect(hang[0]).toBe(240 - CHAN - (hang.length - 1) * HANG_CHU_GIAI);
    expect(cao).toBe(CACH_TEN_TRUC + (hang.length - 1) * HANG_CHU_GIAI);
  });

  it('một mục dài hơn cả vùng vẽ thì không thò qua mép trái khung', () => {
    const { muc } = xepChuGiaiDuoi([{ key: 'x', text: 'x'.repeat(80) }], 40, 100, 120, 240);
    expect(muc[0]?.x).toBeGreaterThanOrEqual(2);
  });
});
