'use client';

import { MARKET_CONFIG } from '@/application';
import type { FeeSchedule } from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { Select } from '@/ui/primitives';

import styles from './FeeScheduleField.module.css';

export interface FeeScheduleFieldProps {
  /** Nhãn của hàng. Mặc định là nhãn của WF-08; màn Cài đặt truyền nhãn dài hơn của nó. */
  label?: string;
  /** Dòng phụ dưới giá trị. Mặc định là dòng ghi nguồn của WF-08 (CON-10). */
  hint?: string;
  /**
   * Danh sách biểu phí. Màn thật không truyền — mặc định là `MARKET_CONFIG.schedules`.
   *
   * Cửa này dành cho ca kiểm: cấu hình thật chỉ có một biểu phí, nên nhánh "nhiều biểu phí" không
   * có cách nào khác để chạy thử. Cùng lý do `formulas.test.ts` phải tự dựng biểu phí thử.
   */
  schedules?: ReadonlyArray<FeeSchedule>;
}

/**
 * Hàng biểu phí của màn WF-08 (gói WBS 3.2.3) và của màn Cài đặt WF-13 — một component cho cả hai.
 *
 * Đặt NGAY TRÊN khối số liệu chứ không giấu trong màn cài đặt, đúng bản thiết kế hi-fi: người
 * dùng đang tính lãi ròng cần thấy mình đang tính theo biểu phí nào.
 *
 * Dòng gợi ý bên dưới là yêu cầu CON-10 chứ không phải câu trang trí: số liệu phí và thuế
 * không nằm trong thân công thức mà nằm ở `MarketConfig`, mỗi khoản mang `effectiveFrom` và
 * `legalBasis`. Nói rõ điều đó để người dùng biết con số này có nguồn, không phải app bịa.
 *
 * ── Một biểu phí thì in CHỮ, không dựng ô chọn (13/10/2026) ───────────────────────────────────
 *
 * Chủ dự án, chỉ vào ô này ở màn Cài đặt: *"chỉ có 1 lựa chọn thì không nên để select"*. Một ô có
 * khung và mũi tên mà mở ra đúng một dòng là một điều khiển chết: nó mời bấm rồi không đổi được gì.
 * Thông tin thì vẫn cần (đang tính theo biểu phí nào, nguồn ở đâu), nên bỏ cái vỏ, giữ cái chữ.
 *
 * Luật đếm theo `schedules.length` chứ không viết cứng: `MarketConfig` có biểu phí thứ hai là ô
 * chọn tự quay lại ở cả hai màn, không phải sửa gì.
 */
export function FeeScheduleField({
  label,
  hint,
  schedules = MARKET_CONFIG.schedules,
}: FeeScheduleFieldProps = {}) {
  const { feeScheduleId, setFeeScheduleId } = usePreferences();
  const t = useT();
  const pick = usePick();

  const nhan = label ?? t('fee.schedule');
  const dongPhu = hint ?? t('fee.scheduleNote');

  const duyNhat = schedules.length === 1 ? schedules[0] : undefined;

  if (duyNhat !== undefined) {
    return (
      <div className={styles.field}>
        <span className={styles.label}>{nhan}</span>
        <span className={styles.value}>{pick(duyNhat.name)}</span>
        <span className={styles.hint}>{dongPhu}</span>
      </div>
    );
  }

  return (
    <Select
      label={nhan}
      hint={dongPhu}
      value={feeScheduleId}
      onChange={(event) => {
        setFeeScheduleId(event.target.value);
      }}
    >
      {/*
        Chỉ hiện tên biểu phí. Không ghép thêm "— mặc định": tên trong MarketConfig đã là
        "Mặc định HOSE 2026", ghép nữa thì ra "Mặc định HOSE 2026 — mặc định".
      */}
      {schedules.map((schedule) => (
        <option key={schedule.id} value={schedule.id}>
          {pick(schedule.name)}
        </option>
      ))}
    </Select>
  );
}
