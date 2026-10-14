'use client';

import { UNIT_SCALES } from '@/application';
import type { UnitScaleId } from '@/application';
import { useT } from '@/application/preferences-context';

import { UNIT_SCALE_KEYS } from '../i18n/keys';
import styles from './UnitSwitcher.module.css';

export interface UnitSwitcherProps {
  value: UnitScaleId;
  onChange: (value: UnitScaleId) => void;
  className?: string;
  /**
   * Bản GỌN cho hàng cài đặt trên điện thoại — chỉ có hiệu lực dưới 560px: nút thấp 28px như hai
   * cụm Chế độ, Sáng/Tối đứng cùng màn, vùng chạm 44px chuyển sang lớp phủ. Xem `.compact` ở
   * `UnitSwitcher.module.css`.
   */
  compact?: boolean;
}

/**
 * Bộ chuyển đơn vị tiền — gói WBS 2.3.3.
 *
 * WF-16: `tỷ ₫ | triệu ₫ | ₫` theo quy ước Việt Nam (CON-05). Đây là bộ chuyển cách HIỂN THỊ,
 * không đổi giá trị thật: công thức luôn nhận số đơn vị đồng, việc quy đổi do `scaleToUnit()`
 * và `scaleToDong()` ở tầng Domain lo.
 *
 * Ba bậc là cố định của quy ước tiền tệ nên đọc từ `UNIT_SCALES` chứ không từ VariableSpec —
 * khác với các điều khiển còn lại của 2.3.
 */
export function UnitSwitcher({ value, onChange, className, compact = false }: UnitSwitcherProps) {
  const t = useT();
  const classes = [styles.group, compact ? styles.compact : undefined, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} role="group" aria-label={t('input.unitLabel')}>
      {UNIT_SCALES.map((scale) => {
        const selected = scale.id === value;
        return (
          <button
            key={scale.id}
            type="button"
            className={selected ? `${styles.option} ${styles.selected}` : styles.option}
            aria-pressed={selected}
            onClick={() => {
              onChange(scale.id);
            }}
          >
            {t(UNIT_SCALE_KEYS[scale.id])}
          </button>
        );
      })}
    </div>
  );
}
