'use client';

import { usePreferences, useT } from '@/application/preferences-context';

import styles from './HiddenByLevelNote.module.css';

export interface HiddenByLevelNoteProps {
  /** Số ô số liệu đang bị chế độ Cơ bản giấu ở thẻ tóm tắt màn Danh mục. */
  count: number;
  className?: string;
}

/**
 * Dòng "N ô nâng cao đang ẩn · Bật chế độ Nâng cao" — FR-09, thẻ tóm tắt của WF-06 Danh mục.
 *
 * Từng là khối dùng chung cho cả danh sách `/cong-thuc/` và `/tim-kiem/` với câu "N công thức nâng
 * cao đang ẩn", chọn câu qua prop `labelKey`. Hai màn ấy bỏ dòng này ngày 19/10/2026 (mộ chí
 * `list.hiddenByLevel` ở `vi.ts`), nên chỉ còn câu của Danh mục và prop `labelKey` đi theo. Màn
 * Danh mục giữ dòng của nó cho tới khi chủ dự án quyết.
 *
 * Nút đặt ngay trong câu chứ không dẫn sang màn Cài đặt: người đang đọc muốn thấy đủ số liệu, không
 * muốn đi hai màn rồi quay lại.
 */
export function HiddenByLevelNote({ count, className }: HiddenByLevelNoteProps) {
  const { setMode } = usePreferences();
  const t = useT();

  // Không ẩn ô nào thì không có gì để nói — im lặng, không dựng ô trống.
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
          {count} {t('portfolio.hiddenByLevel')}
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
