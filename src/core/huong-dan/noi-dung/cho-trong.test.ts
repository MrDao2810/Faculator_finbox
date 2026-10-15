import { describe, expect, it } from 'vitest';

import { choTrongCua, dienCau, soCoPhieuTrieu, thoiGianPhien } from './cho-trong';

/*
 * Phép điền chỗ trống của câu hướng dẫn — xem docblock `./cho-trong.ts`.
 *
 * Con số ở đây là thứ người dùng đọc NGAY DƯỚI ô họ vừa kéo, nên sai một nấc là đúng lỗi chủ dự án
 * vừa chụp (thanh trượt 55 phiên, khung ghi 60). Mọi mốc ghim bằng tay, không tính lại bằng chính
 * công thức của hàm.
 */

describe('thoiGianPhien — số phiên ra thời gian lịch', () => {
  it.each([
    [5, '1 tuần'],
    [10, '2 tuần'],
    [15, '3 tuần'],
    [20, '1 tháng'],
    [30, '1,5 tháng'],
    [55, '2,5 tháng'],
    [60, '3 tháng'],
    [120, '6 tháng'],
    [240, '11,5 tháng'],
    [250, '1 năm'],
    [375, '1,5 năm'],
    [500, '2 năm'],
  ])('%i phiên → %s', (phien, ra) => {
    expect(thoiGianPhien(phien)).toBe(ra);
  });

  /*
   * Ba câu gốc của chủ dự án phải ra lại đúng nghĩa cũ ở số mặc định — nếu không, đổi gốc quy đổi
   * là đã sửa luôn điều câu ấy khẳng định chứ không chỉ cho nó chạy theo ô.
   */
  it('ở số mặc định, ra đúng nghĩa ba câu gốc: 60 → ba tháng, 250 → một năm, 20 → một tháng', () => {
    expect(thoiGianPhien(60)).toBe('3 tháng');
    expect(thoiGianPhien(250)).toBe('1 năm');
    expect(thoiGianPhien(20)).toBe('1 tháng');
  });
});

/*
 * Bản tiếng Anh (15/10/2026): chỉ chữ đơn vị đổi, con số vẫn kiểu Việt — cùng quyết định cho cả
 * giao diện EN, để số trong câu khớp số trong ô ngay cạnh. Tiếng Anh chia số nhiều theo đúng 1.
 */
describe('thoiGianPhien / soCoPhieuTrieu — bản tiếng Anh', () => {
  it.each([
    [5, '1 week'],
    [10, '2 weeks'],
    [20, '1 month'],
    [55, '2,5 months'],
    [60, '3 months'],
    [250, '1 year'],
    [375, '1,5 years'],
  ])('%i phiên → %s', (phien, ra) => {
    expect(thoiGianPhien(phien, 'en')).toBe(ra);
  });

  it.each([
    [118, '118 million'],
    [1470, '1,47 billion'],
  ])('%d triệu → %s', (trieu, ra) => {
    expect(soCoPhieuTrieu(trieu, 'en')).toBe(ra);
  });

  it('dienCau điền đơn vị tiếng Anh khi được bảo, mặc định vẫn tiếng Việt', () => {
    const thongSo = { sessions: { macDinh: 60 } };
    expect(
      dienCau('{sessions} sessions is about {sessions|thoiGian}.', thongSo, undefined, 'en'),
    ).toBe('60 sessions is about 3 months.');
    expect(dienCau('{sessions|thoiGian}', thongSo)).toBe('3 tháng');
  });
});

describe('soCoPhieuTrieu — số cổ phiếu (triệu) ra cách người ta nói', () => {
  it.each([
    [118, '118 triệu'],
    [999, '999 triệu'],
    [1000, '1 tỷ'],
    [1470, '1,47 tỷ'],
    [6396.5, '6,397 tỷ'],
  ])('%d triệu → %s', (trieu, ra) => {
    expect(soCoPhieuTrieu(trieu)).toBe(ra);
  });
});

describe('dienCau', () => {
  const THONG_SO = {
    sessions: { macDinh: 60, min: 12, max: 500 },
    shares: { macDinh: 118 },
  };

  it('không có bộ số (trang đầy đủ) thì điền bằng mặc định', () => {
    expect(dienCau('{sessions} phiên là khoảng {sessions|thoiGian}.', THONG_SO)).toBe(
      '60 phiên là khoảng 3 tháng.',
    );
  });

  it('có bộ số (khung "?") thì điền số đang có trong ô', () => {
    expect(
      dienCau('{sessions} phiên là khoảng {sessions|thoiGian}.', THONG_SO, { sessions: 55 }),
    ).toBe('55 phiên là khoảng 2,5 tháng.');
    expect(
      dienCau('Nếu có {shares|coPhieu} cổ phiếu thì nhập {shares}.', THONG_SO, { shares: 1470 }),
    ).toBe('Nếu có 1,47 tỷ cổ phiếu thì nhập 1.470.');
  });

  /* "0 phiên là khoảng 0 tuần" hay "nhập 0" không dạy được gì — rơi về mặc định. */
  it.each([[0], [Number.NaN], [null], [undefined], [-5]])(
    'ô mang %s thì rơi về số mặc định',
    (giaTri) => {
      expect(dienCau('{sessions} phiên', THONG_SO, { sessions: giaTri })).toBe('60 phiên');
    },
  );

  it('cận dưới, cận trên đọc từ thông số của ô, không đọc số đang nhập', () => {
    expect(dienCau('Từ {sessions|min} tới {sessions|max}.', THONG_SO, { sessions: 55 })).toBe(
      'Từ 12 tới 500.',
    );
  });

  /*
   * Chỗ trống hỏng thì để nguyên chứ không bịa số: người đọc thấy ngay có chỗ sai, còn
   * `noi-dung.test.ts` thì đỏ trước khi nó kịp lên màn.
   */
  it('khoá lạ, kiểu lạ, hay cận không khai thì để NGUYÊN chỗ trống', () => {
    expect(dienCau('{gia} đồng', THONG_SO)).toBe('{gia} đồng');
    expect(dienCau('{sessions|tien}', THONG_SO)).toBe('{sessions|tien}');
    expect(dienCau('{shares|min}', THONG_SO)).toBe('{shares|min}');
  });

  it('câu không có chỗ trống thì ra y nguyên', () => {
    const cau = 'Việt Nam khoảng 250 phiên. Không dùng 365 ngày.';
    expect(dienCau(cau, THONG_SO, { sessions: 55 })).toBe(cau);
  });
});

describe('choTrongCua', () => {
  it('liệt kê mọi chỗ trống theo thứ tự, kiểu mặc định là "so"', () => {
    expect(choTrongCua('{a} và {b|thoiGian}, rồi {a|min}')).toEqual([
      { khoa: 'a', kieu: 'so' },
      { khoa: 'b', kieu: 'thoiGian' },
      { khoa: 'a', kieu: 'min' },
    ]);
  });
});
