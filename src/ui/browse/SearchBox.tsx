'use client';

import { useId, useRef, type RefObject } from 'react';

import { useT } from '@/application/preferences-context';

import styles from './SearchBox.module.css';

export interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  /** Phím Esc. Không truyền thì Esc không làm gì thêm ngoài hành vi mặc định của ô. */
  onCancel?: () => void;
  /** Phím Enter. */
  onSubmit?: () => void;
  /**
   * Tham chiếu tới chính thẻ `<input>`.
   *
   * Nơi gọi cần nó để TRẢ TIÊU ĐIỂM về ô sau khi bấm một nút rồi nút ấy tự tháo khỏi DOM —
   * ví dụ chip "Tìm gần đây" ở màn Công thức. Không truyền thì ô tự giữ tham chiếu riêng.
   */
  inputRef?: RefObject<HTMLInputElement | null>;
  /**
   * Nhãn ẩn của ô (cho trình đọc màn hình). Mặc định là câu của ô tìm công thức, `search.label`.
   *
   * Màn Danh mục dùng lại ô này để lọc mã và phép tính đã lưu — hai chỗ không tìm công thức trong
   * thư viện, nên nhãn "Tên công thức…" ở đó sẽ nói sai việc ô làm. Hai chữ này đi cùng nhau: đổi
   * `placeholder` mà quên `label` là người nhìn thấy một câu còn người nghe một câu khác.
   */
  label?: string;
  /** Chữ mờ trong ô khi trống. Mặc định `search.placeholder`. */
  placeholder?: string;
  /**
   * Bản GỌN: ô cao 36px và chữ nhỏ hơn, CHỈ từ khổ 1024px (xem `.compact` trong CSS).
   *
   * Dành cho ô tìm đứng cùng hàng với một tiêu đề, nơi ô 44px làm cả hàng cao hơn chữ — màn Danh mục
   * cần hàng ấy cao bằng nhãn cột trái để mép trên hai cột thẳng nhau. Dưới 1024px ô giữ nguyên 44px
   * và cỡ chữ gốc: đó là khổ chạm tay, và iOS tự phóng to trang khi ô nhập có chữ dưới 16px.
   */
  compact?: boolean;
  /**
   * Bản TRẦN: không viền, không nền, không kính lúp đầu ô, không nút xoá — nơi gọi tự vẽ khung quanh ô
   * và tự đặt nút ở cuối khung.
   *
   * Dành cho thanh trên màn Danh mục ở khổ điện thoại (14/10/2026): chủ dự án khoanh chỗ ô tìm hiện ra
   * giữa tên màn và mép phải, icon ở CUỐI ô — chính nút bật/tắt ô, lúc mở là dấu X đóng ô (đóng là xoá
   * chữ). Nút xoá × của bản thường mà để lại thì cuối khung có hai dấu X cạnh nhau làm hai việc khác nhau.
   */
  bare?: boolean;
}

/**
 * Ô tìm kiếm — gói WBS 2.2.1.
 *
 * FR-19 · NFR-USA-03: gõ không dấu vẫn ra đúng. Việc bỏ dấu do
 * `normalizeVi()` ở tầng Domain lo; ở đây chỉ là ô nhập và nút xoá.
 *
 * Từng có một dòng nhắc dưới ô ("Gõ không dấu vẫn ra đúng: …") kèm prop `showHint`. Chủ dự án gỡ
 * nó: câu ấy giải thích một tính năng mà người dùng KHÔNG cần biết để dùng được — cứ gõ là ra —
 * nên nó chỉ chiếm chỗ. Khả năng bỏ dấu không mất đi đâu, nó nằm ở `normalizeVi()`, không ở câu chữ.
 *
 * Không tự giữ state: nơi gọi quyết định giá trị đi đâu — `/tim-kiem/` đẩy lên URL qua
 * `useListParams()`, còn màn Công thức giữ trong state rồi ghi URL sau (xem `use-list-url-state.ts`).
 */
export function SearchBox({
  value,
  onChange,
  onCancel,
  onSubmit,
  inputRef,
  label,
  placeholder,
  compact = false,
  bare = false,
}: SearchBoxProps) {
  const inputId = useId();
  const ownRef = useRef<HTMLInputElement>(null);
  const ref = inputRef ?? ownRef;
  const t = useT();

  return (
    <div
      className={[styles.field, compact && styles.compact, bare && styles.bare]
        .filter(Boolean)
        .join(' ')}
    >
      <label className="visually-hidden" htmlFor={inputId}>
        {label ?? t('search.label')}
      </label>

      <div className={styles.control}>
        {!bare && (
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
        )}

        <input
          ref={ref}
          id={inputId}
          className={styles.input}
          type="search"
          inputMode="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={placeholder ?? t('search.placeholder')}
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

        {value !== '' && !bare && (
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
    </div>
  );
}
