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
      <span>
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
    </p>
  );
}
