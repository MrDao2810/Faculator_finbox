import { describe, expect, it } from 'vitest';

import { FORMULA_VISIT_KEY, parseFormulaVisit, visitContinuesAt } from './formula-visit';

describe('parseFormulaVisit — đọc dấu lượt xem', () => {
  it('nhận một slug công thức', () => {
    expect(parseFormulaVisit('pe')).toBe('pe');
    expect(parseFormulaVisit('gia-tri-noi-tai-fcff')).toBe('gia-tri-noi-tai-fcff');
  });

  it('chưa có dấu thì là null', () => {
    expect(parseFormulaVisit(null)).toBeNull();
    expect(parseFormulaVisit(undefined)).toBeNull();
    expect(parseFormulaVisit('')).toBeNull();
  });

  /* Kho là thứ người dùng sửa được, và giá trị này được ghép vào đường dẫn để so. */
  it('chuỗi không phải slug thì rớt, không đi tiếp', () => {
    for (const rac of ['../danh-muc', 'PE', 'pe/', 'pe?ma=FPT', '{"id":"pe"}', 'a'.repeat(41)]) {
      expect(parseFormulaVisit(rac), rac).toBeNull();
    }
  });

  it('khoá mang phiên bản, để đổi cấu trúc thì đổi khoá', () => {
    expect(FORMULA_VISIT_KEY).toBe('ffb.visit.v1');
  });
});

describe('visitContinuesAt — lượt xem còn tiếp diễn ở màn nào', () => {
  it('chính màn chi tiết của công thức ấy', () => {
    expect(visitContinuesAt('pe', '/cong-thuc/pe/')).toBe(true);
  });

  /* Hai chỗ rẽ thuộc về lượt xem: rời sang đó rồi quay lại thì số liệu phải còn. */
  it('bảng dữ liệu và bài hướng dẫn của chính nó', () => {
    expect(visitContinuesAt('pe', '/du-lieu/')).toBe(true);
    expect(visitContinuesAt('pe', '/huong-dan/cong-thuc/pe/')).toBe(true);
  });

  it('thiếu dấu / cuối vẫn là cùng một màn', () => {
    expect(visitContinuesAt('pe', '/cong-thuc/pe')).toBe(true);
    expect(visitContinuesAt('pe', '/du-lieu')).toBe(true);
  });

  /*
   * Đây là vế chữa lỗi được báo: về danh sách hay màn tìm kiếm rồi mở lại công thức là một lượt
   * MỚI. `/cong-thuc/` trơn là tiền tố của `/cong-thuc/pe/`, nên so tiền tố là sai ngay ở đây.
   */
  it('danh sách, tìm kiếm, Danh mục, Cài đặt đều là hết lượt', () => {
    for (const path of ['/cong-thuc/', '/tim-kiem/', '/danh-muc/', '/cai-dat/', '/ve-chung-toi/']) {
      expect(visitContinuesAt('pe', path), path).toBe(false);
    }
  });

  it('công thức khác và bài hướng dẫn của công thức khác cũng là hết lượt', () => {
    expect(visitContinuesAt('pe', '/cong-thuc/pb/')).toBe(false);
    expect(visitContinuesAt('pe', '/huong-dan/cong-thuc/pb/')).toBe(false);
    // `peg` bắt đầu bằng `pe` — so tiền tố là nhận nhầm.
    expect(visitContinuesAt('pe', '/cong-thuc/peg/')).toBe(false);
  });

  it('id rác thì không lượt xem nào tiếp diễn', () => {
    expect(visitContinuesAt('../du-lieu', '/du-lieu/')).toBe(false);
    expect(visitContinuesAt('', '/du-lieu/')).toBe(false);
  });
});
