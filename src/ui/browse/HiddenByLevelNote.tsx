'use client';

import { usePreferences, useT } from '@/application/preferences-context';

import styles from './HiddenByLevelNote.module.css';

export interface HiddenByLevelNoteProps {
  /** Số công thức khớp bộ lọc nhưng đang bị chế độ Cơ bản giấu — `countHiddenByLevel()`. */
  count: number;
  className?: string;
}

/**
 * Dòng "N công thức nâng cao đang ẩn · Bật chế độ Nâng cao" — FR-09.
 *
 * Một component dùng chung cho cả ba chỗ có danh sách (WF-01 trang chủ, WF-02 danh sách,
 * WF-09 tìm kiếm), thay vì chép ba lần: đây là chỗ DUY NHẤT giải thích vì sao danh sách ngắn
 * đi, nên ba màn lệch chữ nhau là ba câu trả lời khác nhau cho cùng một câu hỏi.
 *
 * Nút đặt ngay trong câu chứ không dẫn sang màn Cài đặt: người đang đọc danh sách muốn thấy
 * đủ danh sách, không muốn đi hai màn rồi quay lại.
 */
export function HiddenByLevelNote({ count, className }: HiddenByLevelNoteProps) {
  const { setMode } = usePreferences();
  const t = useT();

  // Không ẩn công thức nào thì không có gì để nói — im lặng, không dựng ô trống.
  if (count <= 0) return null;

  return (
    <p className={[styles.note, className].filter(Boolean).join(' ')}>
      <span>
        {count} {t('list.hiddenByLevel')}
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
    </p>
  );
}
