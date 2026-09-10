'use client';

import { useT } from '@/application/preferences-context';

import styles from './chart.module.css';

/**
 * Dòng gợi ý dưới biểu đồ, nay chỉ còn MỘT câu: trục X đang là thời gian nên bấm không ghi được
 * gì vào ô Số liệu — đổi sang một trục biến số thì bấm áp dụng được.
 *
 * ── Câu KHẲNG ĐỊNH ("Bấm vào biểu đồ để áp dụng…") đã bỏ ─────────────────────────────────────
 *
 * Nó từng là vế thứ hai ở đây, thêm vào vì lối bấm-áp-dụng chỉ tự nhắc tới mình đúng lúc nó KHÔNG
 * chạy. Chủ dự án chốt bỏ: *"không cần đoạn chú thích 'Bấm vào biểu đồ để áp dụng giá trị đó vào
 * ô nhập.'"*.
 *
 * Ghi lại cái giá, vì nó không hiện ra ở đâu khác: trên máy CẢM ỨNG câu ấy là dấu hiệu duy nhất
 * của tính năng — con trỏ bàn tay và vạch dò đều cần chuột. Nên từ nay lối bấm-áp-dụng là thứ
 * người dùng điện thoại tự phát hiện khi chạm, không phải thứ màn hình mời. Tính năng KHÔNG bị gỡ:
 * `canApplyPoint`, con trỏ và vạch dò trong `ChartBody` giữ nguyên.
 *
 * ── Hai điều còn phải giữ ────────────────────────────────────────────────────────────────────
 *
 * 1. **Không bọc trong `@media (hover: hover)`.** Đây là dòng CHỮ, không phải hiệu ứng rê chuột:
 *    máy cảm ứng không có hover nhưng vẫn chạm được, và câu này là lời giải thích cho một cú chạm
 *    vừa không làm gì.
 * 2. **`role="status"`.** Nó là câu trả lời cho một thao tác vừa xảy ra, nên cần đọc lên.
 */
export function ApplyHint() {
  const t = useT();

  return (
    <p className={styles.applyHint} role="status">
      {t('chart.applyHintTimeAxis')}
    </p>
  );
}
