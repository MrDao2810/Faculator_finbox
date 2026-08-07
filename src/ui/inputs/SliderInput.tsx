'use client';

import { useId, type CSSProperties } from 'react';

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

  /*
   * Phần rãnh đã tô, tính theo phần trăm để CSS vẽ bằng gradient.
   * Miền rộng bằng 0 (min trùng max) thì chia cho 0 — kẹp về 0% thay vì để `NaN%` lọt vào
   * thuộc tính CSS, chỗ đó trình duyệt bỏ qua im lặng và rãnh mất luôn phần tô.
   */
  const span = max - min;
  const fill = span > 0 ? Math.min(100, Math.max(0, ((value - min) / span) * 100)) : 0;

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
        style={{ '--fill': `${String(fill)}%` } as CSSProperties}
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

      {/*
        Hai mốc dạt về hai đầu rãnh, đúng bản thiết kế — đọc được vị trí đang ở đâu trong miền.
        Bước nhảy vẫn nằm trong đoạn này nhưng chỉ dành cho trình đọc màn hình: nó là thông tin
        thật (aria-describedby trỏ vào đây) mà bản thiết kế không dành chỗ để bày ra.
      */}
      <p id={marksId} className={styles.marks}>
        <span>
          {t('input.sliderMin')} {formatValueWithUnit(min, spec.unit, { maxDecimals: 4 })}
        </span>
        <span className="visually-hidden">
          {t('input.sliderStep')} {formatValueWithUnit(step, spec.unit, { maxDecimals: 4 })}
        </span>
        <span>
          {t('input.sliderMax')} {formatValueWithUnit(max, spec.unit, { maxDecimals: 4 })}
        </span>
        {locked && <span className={styles.badge}>{t('input.lockedBadge')}</span>}
      </p>
    </div>
  );
}
