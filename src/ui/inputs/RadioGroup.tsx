'use client';

import { useId } from 'react';

import { isLockedForMode } from '@/application';
import type { Level, VariableSpec } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Badge } from '@/ui/primitives';

import styles from './RadioGroup.module.css';

export interface RadioGroupProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  className?: string;
}

/**
 * Radio nhiều dòng — gói WBS 2.3.2.
 *
 * WF-16 lấy ví dụ `FCFF — dòng tiền doanh nghiệp` / `FCFE — dòng tiền chủ sở hữu`: mỗi lựa
 * chọn có nhãn chính và một dòng mô tả phụ, lấy từ `VariableOption.description` (LDR-02).
 *
 * Khác ButtonGroup ở chỗ dùng radio thật trong `<fieldset>`: khi mỗi lựa chọn cần giải thích
 * thêm một dòng thì đây là thứ trình đọc màn hình và phím mũi tên xử đúng sẵn.
 */
export function RadioGroup({
  spec,
  value,
  onChange,
  mode = 'advanced',
  className,
}: RadioGroupProps) {
  const groupId = useId();
  const t = useT();
  const pick = usePick();
  const options = spec.options ?? [];
  const locked = isLockedForMode(spec, mode);

  const classes = [styles.fieldset, className].filter(Boolean).join(' ');

  return (
    <fieldset className={classes} disabled={locked}>
      <legend className={styles.legend}>
        {pick(spec.label)}
        {locked && <Badge tone="advanced">{t('input.lockedBadge')}</Badge>}
      </legend>

      {options.map((option) => {
        const optionId = `${groupId}-${option.value}`;
        const selected = option.value === value;

        return (
          <label
            key={option.value}
            className={selected ? `${styles.option} ${styles.selected}` : styles.option}
            htmlFor={optionId}
          >
            <input
              id={optionId}
              className={styles.radio}
              type="radio"
              name={groupId}
              checked={selected}
              disabled={locked}
              onChange={() => {
                onChange(option.value);
              }}
            />
            <span className={styles.text}>
              <span className={styles.optionLabel}>{pick(option.label)}</span>
              {option.description !== undefined && (
                <span className={styles.description}>{pick(option.description)}</span>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
