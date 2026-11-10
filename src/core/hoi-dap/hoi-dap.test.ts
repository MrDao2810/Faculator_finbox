import { describe, expect, it } from 'vitest';

import { findFormulaModule } from '../formulas/index';
import { HOI_DAP, hoiDapFor } from './index';
import { chuanHoaHoi, hoiDapProblems } from './kiem';
import type { CauHoiThuongGap } from './types';

/**
 * Cửa gác khối "Câu hỏi thường gặp" (10/11/2026) — xem docblock `types.ts`.
 *
 * Máy bắt được nửa hình thức (link https, đủ hai thứ tiếng, dấu "?", gạch dài, trùng câu, lời khuyên
 * mua/bán). Nửa còn lại — câu hỏi có thật ở link ấy, đúng công thức, câu trả lời đúng `calc` — đã được
 * kiểm bằng cách mở lại từng link ở lượt phản biện khi soạn; câu mới phải được kiểm y như vậy.
 */

/**
 * Dây báo — GHIM. Chỉ được đổi khi thêm (hoặc bỏ) câu hỏi CÓ NGUỒN đã mở lại kiểm, không bao giờ để hợp
 * với một con số. `DA_TRA_LOI` tăng khi chủ dự án quyết câu trả lời cho câu đang để trống.
 */
const TONG_SO_CAU = 303;
const DA_TRA_LOI = 225;
const SO_CONG_THUC_CO_CAU = 111;

const tatCa = (): Array<[string, ReadonlyArray<CauHoiThuongGap>]> => Object.entries(HOI_DAP);

describe('câu hỏi thường gặp', () => {
  it('mọi khoá là id công thức có thật', () => {
    const la = Object.keys(HOI_DAP).filter((id) => findFormulaModule(id) === undefined);
    expect(la).toEqual([]);
  });

  it('mọi câu đạt luật của kiem.ts', () => {
    const loi = tatCa().flatMap(([id, items]) => hoiDapProblems(id, items));
    expect(loi).toEqual([]);
  });

  it('không công thức nào khai một mảng rỗng (rỗng thì bỏ hẳn khoá)', () => {
    expect(
      tatCa()
        .filter(([, items]) => items.length === 0)
        .map(([id]) => id),
    ).toEqual([]);
  });

  it('dây báo: tổng số câu, số câu đã trả lời, số công thức có câu', () => {
    const items = tatCa().flatMap(([, list]) => list);
    expect({
      tong: items.length,
      daTraLoi: items.filter((c) => c.traLoi !== undefined).length,
      congThuc: tatCa().length,
    }).toEqual({ tong: TONG_SO_CAU, daTraLoi: DA_TRA_LOI, congThuc: SO_CONG_THUC_CO_CAU });
  });

  it('hoiDapFor chỉ trả câu đã có trả lời; câu chưa có thì ẩn nhưng vẫn nằm trong dữ liệu', () => {
    let an = 0;
    for (const [id, items] of tatCa()) {
      const ra = hoiDapFor(id);
      expect(ra.every((c) => c.traLoi !== undefined)).toBe(true);
      expect(ra).toHaveLength(items.filter((c) => c.traLoi !== undefined).length);
      an += items.length - ra.length;
    }
    expect(an).toBe(TONG_SO_CAU - DA_TRA_LOI);
  });

  it('hoiDapFor xếp câu Việt Nam lên trước, giữ thứ tự trong mỗi phần', () => {
    for (const [id, items0] of tatCa()) {
      const items = items0.filter((c) => c.traLoi !== undefined);
      const ra = hoiDapFor(id);
      expect(ra).toHaveLength(items.length);
      const dauNgoai = ra.findIndex((c) => c.nguon?.vietnam !== true);
      if (dauNgoai !== -1)
        expect(ra.slice(dauNgoai).every((c) => c.nguon?.vietnam !== true)).toBe(true);
      // câu tự soạn (không nguồn) luôn đứng sau mọi câu thật
      const dauTuSoan = ra.findIndex((c) => c.nguon === undefined);
      if (dauTuSoan !== -1)
        expect(ra.slice(dauTuSoan).every((c) => c.nguon === undefined)).toBe(true);
      expect(ra.filter((c) => c.nguon?.vietnam === true)).toEqual(
        items.filter((c) => c.nguon?.vietnam === true),
      );
    }
  });

  it('công thức không có câu thì trả mảng rỗng', () => {
    expect(hoiDapFor('khong-co-cong-thuc-nay')).toEqual([]);
  });
});

describe('luật kiem.ts bắt đúng lỗi', () => {
  const nguonTot = {
    url: 'https://example.com/threads/pe-am.1',
    ten: 'F319',
    noi: 'dien-dan' as const,
    vietnam: true,
  };
  const tot: CauHoiThuongGap = {
    hoi: { vi: 'P/E âm có ý nghĩa gì không?', en: 'Does a negative P/E mean anything?' },
    nguyenVan: 'cho em hỏi P/E âm nghĩa là sao',
    nguon: nguonTot,
  };

  it('một câu đúng khuôn thì không có lỗi', () => {
    expect(hoiDapProblems('pe', [tot])).toEqual([]);
  });

  it.each<[string, CauHoiThuongGap, RegExp]>([
    ['thiếu dấu hỏi', { ...tot, hoi: { vi: 'P/E âm', en: 'Negative P/E?' } }, /kết thúc bằng "\?"/],
    ['link http', { ...tot, nguon: { ...nguonTot, url: 'http://example.com/a' } }, /https/],
    [
      'link trang chủ',
      { ...tot, nguon: { ...nguonTot, url: 'https://example.com/' } },
      /trang chủ/,
    ],
    ['gạch dài', { ...tot, hoi: { ...tot.hoi, vi: 'P/E âm — nghĩa là sao?' } }, /gạch dài/],
    ['EN còn dấu', { ...tot, hoi: { ...tot.hoi, en: 'P/E âm?' } }, /tiếng Việt có dấu/],
    [
      'khuyên mua',
      { ...tot, traLoi: { vi: 'Bạn nên mua ngay khi P/E thấp.', en: 'Low P/E.' } },
      /mua\/bán/,
    ],
    [
      'nguồn trả lời không có trả lời',
      { ...tot, nguonTraLoi: [{ url: nguonTot.url, ten: 'F319' }] },
      /nguonTraLoi/,
    ],
    ['nguyên văn rỗng', { ...tot, nguyenVan: ' ' }, /nguyenVan/],
    ['câu thật thiếu nguồn', { hoi: tot.hoi, nguyenVan: 'x' }, /câu thật phải có nguon/],
    ['câu tự soạn thiếu trả lời', { hoi: tot.hoi, tuSoan: true }, /bắt buộc có traLoi/],
    [
      'câu tự soạn có nguồn',
      { hoi: tot.hoi, tuSoan: true, nguon: nguonTot, traLoi: { vi: 'Có.', en: 'Yes.' } },
      /không có nguon/,
    ],
  ])('bắt: %s', (_ten, cau, mau) => {
    expect(hoiDapProblems('pe', [cau]).join('\n')).toMatch(mau);
  });

  it('câu tự soạn đúng khuôn (không nguồn, có trả lời) thì không có lỗi', () => {
    const tuSoan: CauHoiThuongGap = {
      hoi: tot.hoi,
      tuSoan: true,
      traLoi: { vi: 'Công thức báo không có ý nghĩa.', en: 'The formula reports no meaning.' },
    };
    expect(hoiDapProblems('pe', [tuSoan])).toEqual([]);
  });

  it('bắt hai câu cùng ý (khác hoa thường, dấu câu)', () => {
    const hai = {
      ...tot,
      hoi: { vi: 'p/e âm có ý nghĩa gì không ?', en: 'x?' },
      nguyenVan: 'khác',
    };
    expect(hoiDapProblems('pe', [tot, hai]).join('\n')).toMatch(/trùng câu #1/);
    expect(chuanHoaHoi(tot.hoi.vi)).toBe(chuanHoaHoi(hai.hoi.vi));
  });
});
