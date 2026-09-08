'use client';

import { isLockedForMode } from '@/application';
import type { Level, VariableSpec } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Badge } from '@/ui/primitives';

import styles from './ButtonGroup.module.css';

export interface ButtonGroupProps {
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
 * Nhóm nút — gói WBS 2.3.2.
 *
 * WF-16 lấy ví dụ `Quý | Năm | TTM`. Lựa chọn đọc từ `spec.options` chứ không viết cứng
 * (FR-05, LDR-02); validator đã ép biến kiểu `buttonGroup` phải có ít nhất 2 lựa chọn.
 *
 * Dùng `aria-pressed` thay vì radio, cùng khuôn với ModeToggle: đây là nhóm nút thao tác
 * tức thì, đổi một cái là kết quả tính lại ngay, chứ không phải trường chờ submit.
 */
export function ButtonGroup({
  spec,
  value,
  onChange,
  mode = 'advanced',
  lockedNote,
  className,
}: ButtonGroupProps) {
  const t = useT();
  const pick = usePick();
  const options = spec.options ?? [];
  const khoaTheoChe = isLockedForMode(spec, mode);
  const locked = khoaTheoChe || (lockedNote !== undefined && lockedNote.trim() !== '');
  // Hai lý do khoá, hai câu khác nhau. "nâng cao" thắng khi cả hai cùng đúng — xem
  // `resolveInputState()`, nơi ô số giữ đúng thứ tự ấy.
  const lyDo = khoaTheoChe ? t('input.lockedBadge') : lockedNote;

  const classes = [styles.wrap, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className={styles.head}>
        <span className={styles.label} id={`${spec.key}-label`}>
          {pick(spec.label)}
        </span>
        {locked && lyDo !== undefined && <Badge tone="advanced">{lyDo}</Badge>}
      </div>

      <div className={styles.group} role="group" aria-labelledby={`${spec.key}-label`}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              className={selected ? `${styles.option} ${styles.selected}` : styles.option}
              aria-pressed={selected}
              disabled={locked}
              onClick={() => {
                onChange(option.value);
              }}
            >
              {pick(option.label)}
            </button>
          );
        })}
      </div>

      {spec.description !== undefined && <p className={styles.hint}>{pick(spec.description)}</p>}
    </div>
  );
}
