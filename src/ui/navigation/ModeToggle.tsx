'use client';

import { t } from '@/application';
import { usePreferences } from '@/application/preferences-context';
import type { Level } from '@/application';

import styles from './ModeToggle.module.css';

const OPTIONS: ReadonlyArray<{ value: Level; labelKey: 'mode.basic' | 'mode.advanced' }> = [
  { value: 'basic', labelKey: 'mode.basic' },
  { value: 'advanced', labelKey: 'mode.advanced' },
];

/**
 * Nút chuyển chế độ Cơ bản / Nâng cao — gói WBS 2.1.1.
 *
 * FR-09: chế độ Cơ bản ẩn biến nâng cao và ưu tiên giải thích; Nâng cao mở toàn bộ tham số.
 * Lựa chọn ghi qua usePreferences nên nhớ được sau khi tải lại trang (SW-02).
 *
 * Dùng aria-pressed chứ không phải radio, vì đây là hai nút thao tác tức thì
 * chứ không phải một trường trong form.
 */
export function ModeToggle() {
  const { mode, setMode } = usePreferences();

  return (
    <div className={styles.group} role="group" aria-label={t('mode.label')}>
      {OPTIONS.map((option) => {
        const selected = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            className={selected ? `${styles.option} ${styles.selected}` : styles.option}
            aria-pressed={selected}
            onClick={() => {
              setMode(option.value);
            }}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
