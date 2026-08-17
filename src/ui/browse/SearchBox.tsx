'use client';

import { useId, useRef, type RefObject } from 'react';

import { useT } from '@/application/preferences-context';

import styles from './SearchBox.module.css';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  /** Hiện dòng nhắc “gõ không dấu vẫn ra đúng”. Tắt đi khi đã có kết quả. */
  showHint?: boolean;
  /** Phím Esc. Không truyền thì Esc không làm gì thêm ngoài hành vi mặc định của ô. */
  onCancel?: () => void;
  /** Phím Enter. */
  onSubmit?: () => void;
  /**
   * Tham chiếu tới chính thẻ `<input>`.
   *
   * Nơi gọi cần nó để TRẢ TIÊU ĐIỂM về ô sau khi bấm một nút rồi nút ấy tự tháo khỏi DOM —
   * ví dụ "Xoá bộ lọc" ở trang chủ. Không truyền thì ô tự giữ tham chiếu riêng.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
}

/**
 * Ô tìm kiếm — gói WBS 2.2.1.
 *
 * FR-19 · NFR-USA-03: gõ không dấu vẫn ra đúng. Việc bỏ dấu do
 * `normalizeVi()` ở tầng Domain lo; ở đây chỉ là ô nhập và nút xoá.
 *
 * Không tự giữ state: nơi gọi quyết định giá trị đi đâu — `/cong-thuc/` và `/tim-kiem/` đẩy
 * lên URL qua `useListParams()`, còn trang chủ giữ trong state cục bộ (xem HomeSearchPanel).
 */
export function SearchBox({
  value,
  onChange,
  showHint = true,
  onCancel,
  onSubmit,
  inputRef,
}: SearchBoxProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  const t = useT();

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
          ref={ref}
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
          /*
           * Bắt phím trên CHÍNH ô nhập, không đặt ở thẻ bọc ngoài: nút × tự tháo mình khi ô
           * rỗng, và nếu lúc đó tiêu điểm đang ở nút thì nó rơi về <body> — phím bấm tiếp sau
           * không còn nổi bọt qua thẻ bọc nữa.
           */
          onKeyDown={(event) => {
            if (event.key === 'Escape' && onCancel !== undefined) {
              event.preventDefault();
              onCancel();
            }
            if (event.key === 'Enter' && onSubmit !== undefined) {
              event.preventDefault();
              onSubmit();
            }
          }}
        />

        {value !== '' && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              onChange('');
              // Nút này biến mất ngay sau cú bấm. Không trả tiêu điểm thì nó rơi về <body>,
              // và người dùng bàn phím phải Tab lại từ đầu tài liệu.
              ref.current?.focus();
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
