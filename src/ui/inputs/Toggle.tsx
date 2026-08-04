'use client';

import { useId } from 'react';

import { isLockedForMode, t } from '@/application';
import type { Level, VariableSpec } from '@/application';

import styles from './Toggle.module.css';

export interface ToggleProps {
  spec: VariableSpec;
  value: number;
  onChange: (value: number) => void;
  mode?: Level;
  /**
   * Dòng phụ ghi nguồn hằng số, ví dụ 'Market Config'.
   * WF-16 yêu cầu toggle liên quan tới thuế/phí phải nói rõ số liệu lấy từ đâu (CON-10).
   */
  sourceNote?: string;
  className?: string;
}

/**
 * Toggle bật/tắt — gói WBS 2.3.3.
 *
 * WF-16 lấy ví dụ `Trừ thuế cổ tức 5% · Market Config` và `Gộp phí lưu ký 0,27 ₫/CP/tháng`:
 * toggle nào đụng tới thuế/phí đều phải kèm dòng ghi nguồn, để người dùng biết con số ấy
 * không phải do app bịa ra (LDR-03, CON-10).
 *
 * Validator đã ép biến kiểu `toggle` có ĐÚNG hai lựa chọn, nên ở đây lấy thẳng phần tử 0 và 1.
 * Dùng `role="switch"` để trình đọc màn hình đọc là công tắc chứ không phải hộp kiểm.
 */
export function Toggle({
  spec,
  value,
  onChange,
  mode = 'advanced',
  sourceNote,
  className,
}: ToggleProps) {
  const labelId = useId();
  const noteId = `${labelId}-note`;

  const options = spec.options ?? [];
  const off = options[0];
  const on = options[1];
  const locked = isLockedForMode(spec, mode);

  // Biến khai thiếu lựa chọn thì không vẽ gì còn hơn vẽ một công tắc không bấm được.
  if (off === undefined || on === undefined) return null;

  const checked = value === on.value;
  const classes = [styles.row, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <span className={styles.text}>
        <span className={styles.label} id={labelId}>
          {spec.label}
        </span>
        {sourceNote !== undefined && (
          <span className={styles.note} id={noteId}>
            {sourceNote}
          </span>
        )}
        {locked && <span className={styles.badge}>{t('input.lockedBadge')}</span>}
      </span>

      <button
        type="button"
        role="switch"
        className={checked ? `${styles.switch} ${styles.on}` : styles.switch}
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={sourceNote === undefined ? undefined : noteId}
        disabled={locked}
        onClick={() => {
          onChange(checked ? off.value : on.value);
        }}
      >
        {/* Nhãn chữ Bật/Tắt chứ không chỉ vị trí nút gạt — NFR-USA-06. */}
        <span className={styles.state}>{checked ? on.label : off.label}</span>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.knob} />
        </span>
      </button>
    </div>
  );
}
