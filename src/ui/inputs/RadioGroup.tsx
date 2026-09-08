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
  /**
   * Ô bị khoá vì một lý do NGOÀI chế độ hiển thị, kèm dòng phụ nói lý do ('AAA không có').
   *
   * Cộng vào `isLockedForMode()` chứ không thay nó: hai lý do khoá độc lập nhau, và một biến
   * nâng cao đang ở chế độ Cơ bản thì vẫn phải khoá dù mã có cấp được số hay không.
   */
  lockedNote?: string;

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
  lockedNote,
  className,
}: RadioGroupProps) {
  const groupId = useId();
  const t = useT();
  const pick = usePick();
  const options = spec.options ?? [];
  const khoaTheoChe = isLockedForMode(spec, mode);
  const locked = khoaTheoChe || (lockedNote !== undefined && lockedNote.trim() !== '');
  // Hai lý do khoá, hai câu khác nhau. "nâng cao" thắng khi cả hai cùng đúng — xem
  // `resolveInputState()`, nơi ô số giữ đúng thứ tự ấy.
  const lyDo = khoaTheoChe ? t('input.lockedBadge') : lockedNote;

  const classes = [styles.fieldset, className].filter(Boolean).join(' ');

  return (
    <fieldset className={classes} disabled={locked}>
      <legend className={styles.legend}>
        {pick(spec.label)}
        {locked && lyDo !== undefined && <Badge tone="advanced">{lyDo}</Badge>}
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
