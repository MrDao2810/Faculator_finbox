/**
 * Tầng APPLICATION — lối vào bài "Hướng dẫn sử dụng" của từng công thức, CHỈ dành cho lúc build
 * (WF-21, 02/10/2026).
 *
 * Cố ý KHÔNG xuất qua barrel `@/application`, cùng lý do `how-to.ts` và `vi-du.ts`: barrel ấy đi
 * vào gói JS của mọi trang. Ở đây lý do còn nặng hơn hai cửa kia — dựng một bài phải CHẠY `calc`
 * một lượt cho mỗi ca kiểm có cảnh báo, nên nó kéo theo cả Registry lẫn hàm tính của 111 công thức.
 *
 * Nơi được import file này: `src/app/huong-dan/cong-thuc/[id]/page.tsx`.
 * `build-only-imports.test.ts` gác danh sách đó.
 *
 * Cửa này còn gom đúng MỘT mảnh Domain không tự với tới: biểu phí mặc định, để ca kiểm của nhóm
 * phí & thuế chạy đúng như `formulas.test.ts` chạy. Ba mảnh kia (`LIVE_PRESET_FORMULAS`, khung
 * "cách tính" loại `linked`, cờ `presetHelps`) đã đi ngày 05/10/2026 cùng những câu dùng chung mà
 * chúng bật tắt — xem mộ chí `TuyChonBai` ở `src/core/huong-dan/bai.ts`.
 */

import { findFormulaModule } from '@/core/formulas';
import type { BaiHuongDan } from '@/core/huong-dan';
import { baiHuongDan } from '@/core/huong-dan';
import { MARKET_CONFIG } from '@/core/market';
import { scheduleOrDefault } from '@/core/market/resolve';

export type { BaiHuongDan, BaiRiengDaChuan, MucId, ONhapHuongDan } from '@/core/huong-dan';
export { THU_TU_MUC } from '@/core/huong-dan';

/**
 * Bài hướng dẫn của một công thức; `undefined` khi id không có trong Registry.
 *
 * @param asOf ngày tra hằng số — `page.tsx` đọc một lần lúc build, đúng như màn chi tiết làm.
 *             Domain không được tự lấy ngày hệ thống (NFR-REL-03).
 */
export function baiHuongDanFor(id: string, asOf: string): BaiHuongDan | undefined {
  const formula = findFormulaModule(id);
  if (formula === undefined) return undefined;

  return baiHuongDan(formula, { asOf, schedule: scheduleOrDefault(MARKET_CONFIG) });
}
