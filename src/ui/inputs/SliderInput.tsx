'use client';

import { useId } from 'react';

import { formatValueWithUnit, isLockedForMode, snapToStep, t } from '@/application';
import type { Level, VariableSpec } from '@/application';

import styles from './SliderInput.module.css';

export interface SliderInputProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  className?: string;
}

/**
 * Thanh trượt — gói WBS 2.3.2.
 *
 * WF-16: giá trị hiện ngay cạnh nhãn, và dưới thanh là ba mốc `min 0 · step 0,1` và `max 12`
 * đọc từ metadata chứ không viết cứng (FR-05). Validator của Registry đã bắt buộc biến kiểu
 * `slider` khai đủ min/max/step nên ở đây không phải phòng thủ thêm.
 *
 * NFR-USA-01 nói rõ "thanh trượt kéo được bằng ngón cái": vùng chạm của nút kéo đặt 28px và
 * cả hàng cao 44px, xem SliderInput.module.css.
 */
export function SliderInput({
  spec,
  value,
  onChange,
  mode = 'advanced',
  className,
}: SliderInputProps) {
  const inputId = useId();
  const marksId = `${inputId}-marks`;
  const locked = isLockedForMode(spec, mode);

  const min = spec.min ?? 0;
  const max = spec.max ?? 100;
  const step = spec.step ?? 1;

  const classes = [styles.field, locked ? styles.locked : undefined, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className={styles.head}>
        <label className={styles.label} htmlFor={inputId}>
          {spec.label}
        </label>
        {/* Con số đọc được ngay cạnh nhãn — không bắt người dùng đoán theo vị trí nút kéo. */}
        <output className={styles.value} htmlFor={inputId}>
          {formatValueWithUnit(value, spec.unit, { maxDecimals: 4 })}
        </output>
      </div>

      <input
        id={inputId}
        className={styles.slider}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={locked}
        aria-describedby={marksId}
        onChange={(event) => {
          // snapToStep kẹp về miền và làm tròn theo bước, tránh rác dấu phẩy động
          // kiểu 0,30000000000000004.
          onChange(snapToStep(Number(event.target.value), spec));
        }}
      />

      <p id={marksId} className={styles.marks}>
        <span>
          {t('input.sliderMin')} {formatValueWithUnit(min, spec.unit, { maxDecimals: 4 })}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {t('input.sliderStep')} {formatValueWithUnit(step, spec.unit, { maxDecimals: 4 })}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {t('input.sliderMax')} {formatValueWithUnit(max, spec.unit, { maxDecimals: 4 })}
        </span>
        {locked && <span className={styles.badge}>{t('input.lockedBadge')}</span>}
      </p>
    </div>
  );
}
