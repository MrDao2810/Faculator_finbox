import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES } from './formulas';
import { whenToUseDuplicates, whenToUseProblems } from './when-to-use-rules';
import type { KhiNaoInput } from './when-to-use-rules';

/**
 * Mục "Khi nào dùng" của cả 111 công thức theo khuôn chủ dự án chốt 30/09/2026: MỘT câu mở đầu
 * "Dùng khi bạn …", tả một lúc người đọc tự nhận ra. Luật và lý do của từng luật nằm ở docblock
 * `when-to-use-rules.ts`; công cụ soạn dùng đúng hàm ấy, nên cửa gác và công cụ không lệch nhau.
 *
 * Luật không thấy được câu có hứa một công dụng mà `calc` không làm được hay không. Cả 111 câu đã
 * được đối chiếu với `calc` bằng mắt; câu mới thêm về sau cũng phải được đọc như vậy.
 */
describe('mục "Khi nào dùng" theo khuôn một câu "Dùng khi bạn …"', () => {
  const items: KhiNaoInput[] = FORMULA_MODULES.map(({ spec }) => ({
    id: spec.id,
    name: spec.name,
    whenToUse: spec.explanation.whenToUse,
  }));

  it('cả 111 câu đạt luật, cả bản Việt lẫn bản Anh', () => {
    expect(items).toHaveLength(111);
    expect(items.flatMap((item) => whenToUseProblems(item))).toEqual([]);
  });

  it('không hai công thức nào dùng chung một câu', () => {
    expect(whenToUseDuplicates(items)).toEqual([]);
  });

  /*
   * Luật phải bắt đúng những kiểu câu đã bị chê — chép nguyên văn hai câu cũ. Nới một luật tới mức
   * hai câu này lọt qua là mở cửa lại cho đúng thứ chủ dự án gọi là "quá khó hiểu".
   */
  it('luật vẫn bắt được hai kiểu câu cũ đã bị chê', () => {
    const tenCapm = { vi: 'CAPM — chi phí vốn chủ sở hữu', en: 'CAPM — cost of equity' };
    const capmCu = whenToUseProblems({
      id: 'capm',
      name: tenCapm,
      whenToUse: {
        vi: 'Khi cần suất chiết khấu cho các mô hình định giá (Gordon, DDM, DCF) hoặc phần vốn chủ trong WACC.',
        en: 'When you need a discount rate for valuation models (Gordon, DDM, DCF) or the equity part of WACC.',
      },
    });
    expect(capmCu.some((loi) => loi.includes('mở đầu'))).toBe(true);
    expect(capmCu.some((loi) => loi.includes('đầu vào'))).toBe(true);
    expect(capmCu.some((loi) => loi.includes('"WACC"'))).toBe(true);

    const peCu = whenToUseProblems({
      id: 'pe',
      name: { vi: 'P/E — hệ số giá trên lợi nhuận', en: 'P/E — price-to-earnings ratio' },
      whenToUse: {
        vi: 'So sánh nhanh định giá giữa các doanh nghiệp cùng ngành, cùng giai đoạn.',
        en: 'Quickly compare valuations across companies in the same industry and stage.',
      },
    });
    expect(peCu.some((loi) => loi.includes('pe.vi: phải mở đầu'))).toBe(true);
    expect(peCu.some((loi) => loi.includes('pe.en: phải mở đầu'))).toBe(true);
  });
});
