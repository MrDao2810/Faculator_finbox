'use client';

import { useId } from 'react';

import { t } from '@/application';

import styles from './SearchBox.module.css';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  /** Hiện dòng nhắc “gõ không dấu vẫn ra đúng”. Tắt đi khi đã có kết quả. */
  showHint?: boolean;
}

/**
 * Ô tìm kiếm — gói WBS 2.2.1.
 *
 * FR-19 · NFR-USA-03: gõ không dấu vẫn ra đúng. Việc bỏ dấu do
 * `normalizeVi()` ở tầng Domain lo; ở đây chỉ là ô nhập và nút xoá.
 *
 * Không tự giữ state: giá trị đi thẳng lên URL qua `useListParams()`, để link chia sẻ được
 * và nút Lùi của trình duyệt chạy đúng.
 */
export function SearchBox({ value, onChange, showHint = true }: SearchBoxProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;

  return (
    <div className={styles.field}>
      <label className="visually-hidden" htmlFor={inputId}>
        {t('search.label')}
      </label>

      <div className={styles.control}>
        <svg
          className={styles.icon}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>

        <input
          id={inputId}
          className={styles.input}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={t('search.placeholder')}
          aria-describedby={showHint ? hintId : undefined}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
        />

        {value !== '' && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              onChange('');
            }}
          >
            <span className="visually-hidden">{t('search.clear')}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>

      {showHint && (
        <span id={hintId} className={styles.hint}>
          {t('search.hint')}
        </span>
      )}
    </div>
  );
}
