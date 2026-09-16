import { describe, expect, it } from 'vitest';

import { FORMULA_SUMMARIES } from '@/core/registry';

import { DAILY_SHELF_IDS, DAILY_SHELF_PREVIEW, dailyShelfFormulas } from './daily-shelf';
import { PERSONAL_SLOTS } from './formula-usage';

/**
 * Mười sáu ô của khối "Công thức dùng hằng ngày" — xem docblock `daily-shelf.ts`.
 *
 * Dùng Registry THẬT: một id gõ sai ở đây thì kệ âm thầm thiếu một ô trên màn thật, và bộ id giả
 * không bao giờ bắt được chuyện ấy.
 */
describe('DAILY_SHELF_IDS', () => {
  it('đúng mười sáu ô, tám ô đầu đúng thứ tự bản vẽ — đổi thứ tự phải là việc cố ý', () => {
    expect([...DAILY_SHELF_IDS]).toEqual([
      'loi-nhuan-rong',
      'gia-hoa-von',
      'roi',
      'cagr',
      'xirr',
      'pe',
      'pb',
      'ty-suat-co-tuc',
      'von-hoa-thi-truong',
      'bien-an-toan',
      'co-lenh-rui-ro',
      'rsi-wilder',
      'lai-lo-vi-the-long',
      'tra-gop-nien-kim',
      'lai-kep',
      'gia-von-trung-binh-dca',
    ]);
  });

  it('không id nào lặp', () => {
    expect(new Set(DAILY_SHELF_IDS).size).toBe(DAILY_SHELF_IDS.length);
  });

  it('mọi id đều có thật trong Registry', () => {
    const known = new Set(FORMULA_SUMMARIES.map((formula) => formula.id));
    for (const id of DAILY_SHELF_IDS) {
      expect(known.has(id), id).toBe(true);
    }
  });

  /*
   * Kệ là lát cắt của bộ ghim tay, không phải bộ thứ hai: một ô không mang cờ `isFeatured` sẽ đứng
   * trên kệ mà lại xếp sau cả chục công thức khác ở cách sắp "Thiết thực trước" ngay bên dưới.
   */
  it('mọi ô đều là công thức ghim tay (isFeatured)', () => {
    for (const id of DAILY_SHELF_IDS) {
      const formula = FORMULA_SUMMARIES.find((summary) => summary.id === id);
      expect(formula?.isFeatured, id).toBe(true);
    }
  });
});

describe('DAILY_SHELF_PREVIEW', () => {
  it('bày trước ít ô hơn cả kệ — không thì nút "Xem tất cả" chẳng mở thêm gì', () => {
    expect(DAILY_SHELF_PREVIEW).toBeGreaterThan(0);
    expect(DAILY_SHELF_PREVIEW).toBeLessThan(DAILY_SHELF_IDS.length);
  });

  it('phần bày trước luôn còn ô ghim tay dù lịch sử lấy hết suất cá nhân hoá', () => {
    expect(PERSONAL_SLOTS).toBeLessThan(DAILY_SHELF_PREVIEW);
  });
});

describe('dailyShelfFormulas()', () => {
  it('trả đúng thứ tự kệ, và đúng CHÍNH các object đã truyền vào', () => {
    const shelf = dailyShelfFormulas(FORMULA_SUMMARIES);

    expect(shelf.map((formula) => formula.id)).toEqual([...DAILY_SHELF_IDS]);
    for (const formula of shelf) {
      // Danh tính object — chỉ mục từ khoá của phép tìm là WeakMap khoá theo nó.
      expect(FORMULA_SUMMARIES.includes(formula), formula.id).toBe(true);
    }
  });

  it('id không tra ra thì bỏ qua, không ném lỗi', () => {
    const chiCoHai = FORMULA_SUMMARIES.filter((f) => f.id === 'pe' || f.id === 'roi');
    expect(dailyShelfFormulas(chiCoHai).map((formula) => formula.id)).toEqual(['roi', 'pe']);
  });
});
