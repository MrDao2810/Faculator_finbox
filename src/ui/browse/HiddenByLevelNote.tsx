'use client';

import { usePreferences, useT } from '@/application/preferences-context';

import styles from './HiddenByLevelNote.module.css';

export interface HiddenByLevelNoteProps {
  /** Số thứ đang bị chế độ Cơ bản giấu — `countHiddenByLevel()` ở màn danh sách. */
  count: number;
  /**
   * Chữ đứng sau con số. Mặc định là "công thức nâng cao đang ẩn".
   *
   * Có mặt vì màn Danh mục ẩn **ô số liệu** chứ không ẩn công thức, mà ba câu ấy phải khác
   * nhau — xem chú thích của `list.hiddenByLevel` trong `vi.ts`. Union chứ không phải
   * `MessageKey` trần: chỉ hai câu này hợp nghĩa ở đây, mở rộng ra là mời người sau ghép bừa
   * một khoá bất kỳ vào giữa con số và cái nút.
   */
  labelKey?: 'list.hiddenByLevel' | 'portfolio.hiddenByLevel';
  className?: string;
}

/**
 * Dòng "N công thức nâng cao đang ẩn · Bật chế độ Nâng cao" — FR-09.
 *
 * Một component dùng chung cho ba màn có danh sách (WF-01 trang chủ, WF-02 danh sách, WF-09
 * tìm kiếm) và, từ đợt nối FR-09 vế 3, cho cả khối số liệu của WF-06 Danh mục — thay vì chép
 * bốn lần: đây là chỗ DUY NHẤT giải thích vì sao màn ngắn đi, nên bốn màn lệch chữ nhau là bốn
 * câu trả lời khác nhau cho cùng một câu hỏi.
 *
 * Nút đặt ngay trong câu chứ không dẫn sang màn Cài đặt: người đang đọc danh sách muốn thấy
 * đủ danh sách, không muốn đi hai màn rồi quay lại.
 */
export function HiddenByLevelNote({
  count,
  labelKey = 'list.hiddenByLevel',
  className,
}: HiddenByLevelNoteProps) {
  const { setMode } = usePreferences();
  const t = useT();

  // Không ẩn công thức nào thì không có gì để nói — im lặng, không dựng ô trống.
  if (count <= 0) return null;

  return (
    <p className={[styles.note, className].filter(Boolean).join(' ')}>
      {/*
        Ổ khoá — cùng hình với khối "Dữ liệu trên máy" ở màn Cài đặt, và cùng nghĩa: có thứ đang
        bị giữ lại. Vẽ tay, `aria-hidden`, không chữ bên trong: câu ngay cạnh đã nói đủ.
      */}
      <span className={styles.icon} aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5v-9Z" />
        </svg>
      </span>

      {/*
        Hai dòng chứ không một — bản thiết kế mobile đợt 13: ở khổ 360px câu và nút xuống dòng
        lộn xộn giữa chừng, đọc thành một câu đứt quãng.

        Con số và chữ phải nằm TRONG CÙNG một phần tử: ca kiểm dò `getByText(/…đang ẩn/)` rồi đòi
        `textContent` của chính phần tử ấy chứa con số — tách ra là ca đó đỏ, và đúng ra là đỏ,
        vì "29" đứng rời khỏi câu thì trình đọc màn hình cũng đọc thành hai mẩu.
      */}
      <span className={styles.text}>
        <span className={styles.count}>
          {count} {t(labelKey)}
        </span>
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            setMode('advanced');
          }}
        >
          {t('list.showAdvanced')}
        </button>
      </span>
    </p>
  );
}
