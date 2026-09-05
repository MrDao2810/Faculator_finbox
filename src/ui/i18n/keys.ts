import type { MessageKey, UnitScaleId } from '@/application';

/**
 * Khoá i18n cho nhãn ba bậc đơn vị tiền (gói WBS 3.6.3 — luồng locale).
 *
 * Bản gốc là `UNIT_SCALES[].label` ở tầng Domain (`src/core/format.ts`, quy ước CON-05), mà
 * Domain không được đọc i18n (CON-02) — nên nhãn HIỂN THỊ phải tra lại theo locale ở tầng UI.
 * Một ca kiểm trong `i18n.test.ts` giữ bản tiếng Việt của các khoá này khớp từng chữ với
 * `UNIT_SCALES`, để hai bản không bao giờ trôi khỏi nhau.
 *
 * Để chung một chỗ vì có hai nơi dùng — thanh chuyển đơn vị (WF-16) và ghi chú bảng lịch trả
 * nợ (WF-14); trước đợt 9 cả hai in thẳng `scale.label` nên màn EN hiện
 * "Total interest … million ₫" ngay trên "Unit: triệu ₫".
 *
 * Ghi chú cũ ở đây nói tiêu đề trục biểu đồ "chưa qua đường này" vì nó do Domain ghép sẵn và còn
 * chứa cả tên công thức. **Không còn đúng**: tên công thức nay là `Bilingual`, và đơn vị đi qua
 * `unitLabel()` ở `src/core/format.ts` — một bảng tra song ngữ nằm luôn trong Domain, vì
 * `withScalePrefix()` cũng cần vế `en` mà CON-02 cấm `src/core` đọc i18n. Xem `units.ts` cạnh đây.
 */
export const UNIT_SCALE_KEYS: Readonly<Record<UnitScaleId, MessageKey>> = {
  billion: 'unit.scale.billion',
  million: 'unit.scale.million',
  dong: 'unit.scale.dong',
};
