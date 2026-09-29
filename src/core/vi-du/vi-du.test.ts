import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES, findFormulaModule } from '../formulas/index';
import { VI_DU_GIAI } from './index';
import { viDuProblems } from './kiem';

/**
 * Cửa gác lời giải của khối Ví dụ thực tế (29/09/2026) — xem docblock `ViDuGiai`.
 *
 * Luật nằm ở MỘT chỗ, `viDuProblems()` trong `kiem.ts`, và đợt soạn đã chạy đúng hàm ấy trên từng
 * bản nháp — nên ca kiểm này và công cụ người soạn dùng không thể lệch nhau. Nó bắt: dòng "Áp vào
 * công thức" tính lại không ra đúng `calc` của ví dụ, ký hiệu không có trong hình, con số không có
 * trong ví dụ, gạch ngang dài cạnh công thức, thiếu bản tiếng Anh, link không phải https.
 *
 * Nó KHÔNG bắt được việc gán nhầm hai con số cùng đơn vị (giá vào EPS, EPS vào giá) — mỗi dòng Thay
 * số đã được đọc theo nghĩa ở vòng soát, và dòng mới cũng phải vậy.
 */

/**
 * Số ví dụ có lời giải — GHIM. Mọi công thức đều phải có: một ví dụ không có lời giải lùi về hình
 * bảng số cũ, tức trang ấy trông khác 110 trang còn lại. Công thức mới thêm vào Registry sẽ làm ca
 * này đỏ, và người thêm phải soạn lời giải cho ví dụ của nó.
 */
const SO_VI_DU_CO_LOI_GIAI = FORMULA_MODULES.length;

describe('lời giải khối Ví dụ thực tế', () => {
  it('mọi khoá là id công thức có thật', () => {
    const la = Object.keys(VI_DU_GIAI).filter((id) => findFormulaModule(id) === undefined);
    expect(la).toEqual([]);
  });

  it('mọi công thức đều có lời giải cho ví dụ của mình', () => {
    const thieu = FORMULA_MODULES.map((m) => m.spec.id).filter((id) => !(id in VI_DU_GIAI));
    expect(thieu).toEqual([]);
    expect(Object.keys(VI_DU_GIAI)).toHaveLength(SO_VI_DU_CO_LOI_GIAI);
  });

  /*
   * Ví dụ KHÔNG có link nào — GHIM từng id, chỉ được giảm. Dòng Nguồn của chúng chỉ in tên nguồn,
   * vì không trang nào mở được chứa đúng con số của ví dụ; bịa một link là tệ hơn không có.
   *
   * `vwap`: cột khối lượng của chuỗi FPT 57 phiên trong ví dụ không khớp nguồn nào — khớp lệnh
   * CafeF/VNDirect ra VWAP 71.931 ₫, khớp lệnh cộng thoả thuận ra 71.771 ₫, ví dụ ghi 71.726 ₫. Giá
   * đóng cửa thì khớp. Gắn link là để người đọc tính lại ra một số khác; chủ dự án cần quyết sửa số
   * liệu của ví dụ (xem TASK.md, 29/09/2026).
   */
  it('ví dụ không có link nào — ghim từng id', () => {
    const khongLink = Object.entries(VI_DU_GIAI)
      .filter(([, giai]) => giai.nguon.length === 0)
      .map(([id]) => id);
    expect(khongLink).toEqual(['vwap']);
  });

  it('mọi lời giải qua đủ luật của viDuProblems()', () => {
    const sai: string[] = [];
    for (const [id, giai] of Object.entries(VI_DU_GIAI)) {
      const formula = findFormulaModule(id);
      if (formula === undefined) continue;
      for (const loi of viDuProblems(formula, giai)) sai.push(`${id}: ${loi}`);
    }
    expect(sai, sai.join('\n')).toEqual([]);
  });
});
