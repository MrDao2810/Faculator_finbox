'use client';

import { MARKET_CONFIG } from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { Select } from '@/ui/primitives';

/**
 * Ô chọn biểu phí của màn WF-08 — gói WBS 3.2.3.
 *
 * Đặt NGAY TRÊN khối số liệu chứ không giấu trong màn cài đặt, đúng bản thiết kế hi-fi: người
 * dùng đang tính lãi ròng cần thấy mình đang tính theo biểu phí nào, và đổi được tại chỗ.
 *
 * Dòng gợi ý bên dưới là yêu cầu CON-10 chứ không phải câu trang trí: số liệu phí và thuế
 * không nằm trong thân công thức mà nằm ở `MarketConfig`, mỗi khoản mang `effectiveFrom` và
 * `legalBasis`. Nói rõ điều đó để người dùng biết con số này có nguồn, không phải app bịa.
 *
 * Hiện `MarketConfig` mới khai một biểu phí. Danh sách vẫn dựng từ `MARKET_CONFIG.schedules`
 * chứ không viết cứng — thêm biểu phí 2027 là ô này tự có thêm lựa chọn, không phải sửa gì.
 */
export function FeeScheduleField() {
  const { feeScheduleId, setFeeScheduleId } = usePreferences();
  const t = useT();
  const pick = usePick();

  return (
    <Select
      label={t('fee.schedule')}
      hint={t('fee.scheduleNote')}
      value={feeScheduleId}
      onChange={(event) => {
        setFeeScheduleId(event.target.value);
      }}
    >
      {MARKET_CONFIG.schedules.map((schedule) => (
        <option key={schedule.id} value={schedule.id}>
          {pick(schedule.name)}
        </option>
      ))}
    </Select>
  );
}
