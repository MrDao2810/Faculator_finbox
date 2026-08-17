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
 * CÒN MỘT CHỖ NỮA CHƯA QUA ĐƯỜNG NÀY: tiêu đề trục biểu đồ (`src/core/chart/build.ts`) ghép
 * `${tên} (${scale.label})` ngay trong `ChartModel`. Đó là chuỗi do Domain dựng, và nó còn chứa
 * cả TÊN CÔNG THỨC — thứ chỉ dịch được sau khi duyệt nội dung — nên để nguyên tới lượt dịch
 * nội dung, không vá nửa vời ở đây.
 */
export const UNIT_SCALE_KEYS: Readonly<Record<UnitScaleId, MessageKey>> = {
  billion: 'unit.scale.billion',
  million: 'unit.scale.million',
  dong: 'unit.scale.dong',
};
