'use client';

import type { MessageKey, WarningCode } from '@/application';
import { useT } from '@/application/preferences-context';
import { InlineWarning } from '@/ui/result';

/**
 * Câu của từng mã — chép từ khối `warnings` của `guide-111.json`.
 *
 * Viết tường minh chứ dựng khoá bằng `guide.warn.${ma}`: cửa gác "khoá mồ côi" ở `i18n.test.ts`
 * tìm CHÍNH chuỗi khoá trong `src/`, nên một khoá chỉ tồn tại dưới dạng chuỗi mẫu sẽ bị báo là
 * không ai dùng. Cùng lẽ với `CHU_BIEU_DO` ở `GuideBody.tsx`.
 *
 * Đủ cả sáu mã WF-15 dù `INCOMPLETE_INPUT` không bao giờ vào bài (xem `BO_QUA` ở `bai.ts`): bảng
 * khuyết một mã là một lỗ chờ sẵn, và `WarningCode` thì bắt buộc đủ sáu.
 */
const CAU: Readonly<Record<WarningCode, MessageKey>> = {
  INCOMPLETE_INPUT: 'guide.warn.INCOMPLETE_INPUT',
  DIVIDE_BY_ZERO: 'guide.warn.DIVIDE_BY_ZERO',
  MEANINGLESS: 'guide.warn.MEANINGLESS',
  MISSING_SERIES: 'guide.warn.MISSING_SERIES',
  MODEL_VIOLATION: 'guide.warn.MODEL_VIOLATION',
  INHERITED: 'guide.warn.INHERITED',
};

/**
 * Một mã cảnh báo trong mục "Khi kết quả hiện _ _", dựng bằng đúng thẻ màn tính dùng.
 *
 * ── Vì sao phải có lá riêng này ──────────────────────────────────────────────────────────────
 *
 * `GuideBody` cố ý KHÔNG khai `'use client'`: trang đầy đủ là server component và thân bài phải
 * nằm sẵn trong HTML tĩnh. Nhưng `InlineWarning` nhận một `CalcWarning`, tức một `Bilingual` —
 * còn câu của từng mã nay nằm ở từ điển i18n, chỉ đọc được bằng `useT()`. Lá này là chỗ duy nhất
 * cần một hook, nên nó là chỗ duy nhất khai `'use client'`.
 *
 * ── Vì sao `vi` và `en` nhận CÙNG một chuỗi ──────────────────────────────────────────────────
 *
 * `useT()` đã chọn ngôn ngữ rồi — nó trả đúng một chuỗi của locale đang dùng. `InlineWarning` lại
 * `pick()` thêm một lần nữa, nên nhét chuỗi ấy vào cả hai nhánh là cách để lượt chọn thứ hai trả
 * về đúng thứ lượt chọn thứ nhất đã quyết. Không phải lười: viết `{ vi: s, en: '' }` sẽ khiến bản
 * tiếng Anh rơi ngược về tiếng Việt qua nhánh dự phòng của `pick()`.
 *
 * ── Câu ở đâu ra ─────────────────────────────────────────────────────────────────────────────
 *
 * `guide.warn.<MÃ>`, chép từ `guide-111.json` (khối `warnings`). Trước 05/10/2026 mục này in
 * nguyên câu `calc` viết kèm dòng "cách sửa" của nó. Hai nguồn cùng nói một việc là đúng thứ chủ
 * dự án bảo bỏ — nhưng phép CHẠY `calc` thì giữ, vì nó quyết định mã nào có mặt.
 */
export function GuideWarning({ ma }: { ma: WarningCode }) {
  const t = useT();
  const cau = t(CAU[ma]);

  return <InlineWarning warning={{ code: ma, message: { vi: cau, en: cau } }} />;
}
