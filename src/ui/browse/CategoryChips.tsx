'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { CATEGORIES } from '@/application';
import { usePick, useT } from '@/application/preferences-context';

import styles from './CategoryChips.module.css';

export interface CategoryChipsProps {
  /** Nhóm đang chọn — `null` là "Tất cả nhóm". */
  value: string | null;
  onChange: (categoryId: string | null) => void;
  /** Số công thức khớp của từng nhóm ở chế độ **Cơ bản** — `countByCategoryFor(bộ Cơ bản, …)`. */
  basicCounts: ReadonlyMap<string, number>;
  /** Số công thức khớp của từng nhóm trên CẢ thư viện — con số của chế độ Nâng cao. */
  allCounts: ReadonlyMap<string, number>;
}

/** `name` chung của nhóm radio. Chuỗi cứng chứ không `useId()` — cùng lý do `PANEL_ID` cũ. */
const GROUP_NAME = 'nhom-cong-thuc';

/** Chiều người dùng chọn giảm chuyển động thì cuộn nhảy thẳng, không trượt. */
function prefersReducedMotion(): boolean {
  return (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Hàng chip nhóm cuộn ngang — bộ lọc nhóm của màn Công thức (bản vẽ gộp trang chủ, 15/09/2026).
 *
 * Thay cho cặp "ba tab mảng + `<select>` 12 nhóm" của `CategoryFilter` cũ. Lý do cũ để giữ
 * `<select>` — *"12 mục thì không thành hàng tab được ở 360px"* — nay được gỡ bằng đúng thứ bản vẽ
 * vẽ: hàng chip CUỘN NGANG, nên 13 lựa chọn không phải chen vào một bề ngang.
 *
 * ── Radio thật, không phải `Chip` (`aria-pressed`) ────────────────────────────────────────────
 *
 * Chủ dự án từng bác `Chip` cho bộ lọc loại trừ nhau: `aria-pressed` đọc ra "nút bật/tắt", nên 13
 * chip thành 13 công tắc độc lập trong khi thật ra chọn cái này là bỏ cái kia. Radio trong một
 * `fieldset` nói đúng quan hệ ấy ("1 trên 13"), phím mũi tên chạy sẵn không cần một dòng mã roving
 * tabindex nào, và chip đang nhận tiêu điểm tự được cuộn vào tầm nhìn. Ô radio ẩn khỏi mắt nhưng vẫn
 * nhận tiêu điểm; phần nhìn thấy là thẻ `span` ngay sau nó, CSS vẽ trạng thái qua `:checked`.
 *
 * ── Con số: dựng CẢ HAI, CSS chọn theo `data-mode` ────────────────────────────────────────────
 *
 * Cùng cơ chế `ModeToggle` và lưới nhóm cũ ở trang chủ. Lượt render đầu ở máy khách buộc là chế độ
 * Cơ bản (khớp HTML tĩnh), nên để React chọn con số là người dùng Nâng cao thấy "Rủi ro · 6" nháy
 * thành "Rủi ro · 18" mỗi lần tải trang. Nhóm mà chế độ Cơ bản giấu sạch (`corporate-finance`) in
 * chữ "chỉ ở Nâng cao" thay số 0 — số 0 đọc ra là "nhóm rỗng", đúng kiểu im lặng FR-06 chặn.
 *
 * ── Hai nút ‹ › chỉ cho chuột, và chỉ ở khổ PC ────────────────────────────────────────────────
 *
 * Trên điện thoại hàng chip vuốt được; trên PC không có thanh cuộn nhìn thấy nên cần nút. Nút mang
 * `aria-hidden` và `tabIndex={-1}`: người dùng bàn phím đi bằng phím mũi tên trong nhóm radio, còn
 * trình đọc màn hình đọc đủ 13 lựa chọn — với họ hai nút này chỉ là tiếng ồn.
 */
export function CategoryChips({ value, onChange, basicCounts, allCounts }: CategoryChipsProps) {
  const t = useT();
  const pick = usePick();
  const scrollerRef = useRef<HTMLDivElement>(null);

  /*
   * Hằng số lúc khởi tạo — lượt render đầu ở máy khách phải khớp HTML tĩnh. Chỉ đo sau khi gắn.
   * "Đang ở đầu hàng, chưa ở cuối" là giả định đúng cho gần như mọi khổ màn lúc mới tải.
   */
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });

  const measure = useCallback((): void => {
    const node = scrollerRef.current;
    if (node === null) return;
    // Lệch 1px cho sai số làm tròn của trình duyệt khi phóng to trang.
    const atStart = node.scrollLeft <= 1;
    const atEnd = node.scrollLeft + node.clientWidth >= node.scrollWidth - 1;
    setEdges((current) =>
      current.atStart === atStart && current.atEnd === atEnd ? current : { atStart, atEnd },
    );
  }, []);

  useEffect(() => {
    const node = scrollerRef.current;
    if (node === null) return;

    measure();
    node.addEventListener('scroll', measure, { passive: true });

    // Đổi bề ngang cửa sổ, hay chữ đổi độ dài khi đổi ngôn ngữ, đều làm hàng chip đổi độ rộng.
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null;
    if (observer !== null) observer.observe(node);
    else window.addEventListener('resize', measure);

    return () => {
      node.removeEventListener('scroll', measure);
      observer?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  function scrollByPage(direction: 1 | -1): void {
    const node = scrollerRef.current;
    if (node === null) return;
    // Bốn phần năm khung — chip cuối trang cũ còn lấp ló đầu trang mới, mắt không mất chỗ.
    const left = direction * Math.max(120, node.clientWidth * 0.8);
    if (typeof node.scrollBy === 'function') {
      node.scrollBy({ left, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } else {
      node.scrollLeft += left;
    }
  }

  return (
    <div className={styles.wrap}>
      <div ref={scrollerRef} className={styles.scroller}>
        <fieldset className={styles.group}>
          <legend className="visually-hidden">{t('filter.category.label')}</legend>

          <label className={styles.chip}>
            <input
              className="visually-hidden"
              type="radio"
              name={GROUP_NAME}
              value=""
              checked={value === null}
              onChange={() => {
                onChange(null);
              }}
            />
            <span className={styles.face}>{t('filter.category.all')}</span>
          </label>

          {CATEGORIES.map((category) => {
            const basic = basicCounts.get(category.id) ?? 0;
            const all = allCounts.get(category.id) ?? 0;
            /* Rỗng VÌ CHẾ ĐỘ, không phải vì chuỗi tìm: cả thư viện vẫn có kết quả cho nhóm này. */
            const basicEmpty = basic === 0 && all > 0;

            return (
              <label key={category.id} className={styles.chip}>
                <input
                  className="visually-hidden"
                  type="radio"
                  name={GROUP_NAME}
                  value={category.id}
                  checked={value === category.id}
                  onChange={() => {
                    onChange(category.id);
                  }}
                />
                <span className={styles.face}>
                  {pick(category.shortName)}
                  {/* Dấu chấm giữa là phần nhìn — trình đọc màn hình đọc "Định giá 8" là đủ. */}
                  <span className={styles.dot} aria-hidden="true">
                    ·
                  </span>
                  <span className={`${styles.count} ${styles.countBasic}`}>
                    {basicEmpty ? t('filter.category.advancedOnly') : basic}
                  </span>
                  <span className={`${styles.count} ${styles.countAdvanced}`}>{all}</span>
                </span>
              </label>
            );
          })}
        </fieldset>
      </div>

      <button
        type="button"
        className={styles.arrow}
        aria-hidden="true"
        tabIndex={-1}
        title={t('filter.category.scrollPrev')}
        disabled={edges.atStart}
        onClick={() => {
          scrollByPage(-1);
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.arrow}
        aria-hidden="true"
        tabIndex={-1}
        title={t('filter.category.scrollNext')}
        disabled={edges.atEnd}
        onClick={() => {
          scrollByPage(1);
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
