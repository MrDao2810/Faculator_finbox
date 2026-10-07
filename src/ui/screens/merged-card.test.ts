import { describe, expect, it } from 'vitest';

import { FORMULA_MODULES, chainFor, needsPriceSeries } from '@/application';

import { hasConfigBlock, hasCustomBody, hasMergedCard } from './DetailBody';

/**
 * Danh sách `hasMergedCard()` phải khớp ĐÚNG lý do sinh ra nó.
 *
 * Danh sách ấy viết tay, có chủ ý (xem docblock của nó): khuôn gộp đổi hẳn hình dạng đầu trang
 * nên một công thức chỉ vào danh sách sau khi có người mở ra nhìn ở khổ 1280. Nhưng viết tay thì
 * trôi — ai đó thêm một id mà không đọc bốn phép trừ, hoặc đợt sau dựng xong khuôn cho nhóm
 * chuỗi mà quên mở danh sách ra.
 *
 * Nên ca kiểm này không chép lại danh sách; nó TÍNH LẠI tập hợp từ chính bốn tiêu chí đã chốt
 * rồi so hai bên. Thêm công thức thứ 112 vào Registry là ca này đỏ — đúng điều mong muốn: có
 * người phải đọc lý do rồi mới quyết, thay vì công thức mới tự nhảy vào một khuôn chưa ai soi.
 */

const ALL_SPECS = FORMULA_MODULES.map((module) => module.spec);

/**
 * Ngày tra hằng số cho `needsPriceSeries()`. Giá trị nào cũng được — công thức ăn chuỗi giá không
 * đọc hằng số nào — nhưng `CalcContext` đòi nó, và Domain không được tự lấy ngày hệ thống
 * (NFR-REL-03).
 */
const AS_OF = '2026-10-01';

/** Công thức nhận số từ công thức khác (FR-15) — `chainFor()` rỗng nghĩa là không nhận của ai. */
function nhanSoTuCongThucKhac(id: string): boolean {
  return chainFor(ALL_SPECS, id).length > 0;
}

describe('hasMergedCard() — khuôn gộp ở khổ PC', () => {
  it('khớp đúng bốn phép trừ đã chốt, không thừa không thiếu id nào', () => {
    const nenCo = FORMULA_MODULES.filter(
      (module) =>
        !needsPriceSeries(module, AS_OF) &&
        !hasCustomBody(module.spec.id) &&
        !hasConfigBlock(module.spec.id) &&
        !nhanSoTuCongThucKhac(module.spec.id) &&
        module.spec.chartType !== 'waterfall',
    ).map((module) => module.spec.id);

    const dangCo = ALL_SPECS.map((spec) => spec.id).filter(hasMergedCard);

    expect([...dangCo].sort()).toEqual([...nenCo].sort());
  });

  /*
   * Con số 65 ghim riêng, không suy từ ca trên: nó là PHẠM VI chủ dự án đã duyệt. Đổi được, nhưng
   * phải đổi có ý thức — một công thức rơi ra khỏi khuôn vì sửa `chartType` hay thêm `dependsOn`
   * cũng làm ca này đỏ, và đó đúng là lúc cần người đọc lại.
   */
  it('đúng 64 công thức, tức 111 trừ 47', () => {
    expect(ALL_SPECS.filter((spec) => hasMergedCard(spec.id))).toHaveLength(64);
  });

  it('không id nào trong danh sách là id lạ', () => {
    const idThat = new Set(ALL_SPECS.map((spec) => spec.id));
    for (const spec of ALL_SPECS) {
      if (hasMergedCard(spec.id)) expect(idThat.has(spec.id)).toBe(true);
    }
  });
});
