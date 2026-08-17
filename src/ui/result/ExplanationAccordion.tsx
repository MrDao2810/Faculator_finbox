'use client';

import type { Explanation, MessageKey } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './ExplanationAccordion.module.css';

export interface ExplanationAccordionProps {
  explanation: Explanation;
  /**
   * Mở sẵn **cả bốn mục**. Mặc định BẬT, và màn chi tiết không truyền gì để đè lên nó.
   *
   * Hai bước đã đi qua, ghi lại để không ai vô tình cuộn về: bản đầu gập hết ở chế độ Nâng cao cho
   * gọn màn (FR-09); bản sau mở sẵn mục đầu. Cả hai đều để người đọc phải bấm mới thấy phần giải
   * thích — mà FR-03 bắt buộc bốn mục ấy có mặt chính là để đọc, nên chủ dự án chốt mở hết.
   *
   * Vẫn dùng `<details>` chứ không đổi sang thẻ thường: người đọc GẬP LẠI được từng mục khi đã hiểu,
   * và đó là chiều đúng — mặc định là thấy, thu gọn là lựa chọn.
   */
  defaultOpen?: boolean;
  className?: string;
}

/** Bốn mục bắt buộc của FR-03, đúng thứ tự wireframe. */
const SECTIONS: ReadonlyArray<{ key: keyof Explanation; labelKey: MessageKey }> = [
  { key: 'meaning', labelKey: 'explain.meaning' },
  { key: 'whenToUse', labelKey: 'explain.whenToUse' },
  { key: 'howToRead', labelKey: 'explain.howToRead' },
  { key: 'commonMistakes', labelKey: 'explain.commonMistakes' },
];

/**
 * Diễn giải bốn mục — gói WBS 2.4.4.
 *
 * FR-03 bắt buộc đủ bốn mục cho người mới (F0), và validator của Registry đã chặn công thức
 * nào thiếu. Ở đây chỉ việc vẽ theo đúng thứ tự wireframe.
 *
 * Dùng `<details>/<summary>` gốc chứ không tự dựng accordion bằng state: gập/mở được cả khi
 * JavaScript chưa tải xong, bàn phím và trình đọc màn hình xử đúng sẵn, và không tốn thêm
 * dung lượng gói — cùng lý do với thẻ `<a>` thật của FormulaCard.
 */
export function ExplanationAccordion({
  explanation,
  defaultOpen = true,
  className,
}: ExplanationAccordionProps) {
  const t = useT();
  const classes = [styles.wrap, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <h2 className={styles.title}>{t('explain.title')}</h2>

      {SECTIONS.map((section) => (
        <details key={section.key} className={styles.item} open={defaultOpen}>
          <summary className={styles.summary}>{t(section.labelKey)}</summary>
          <p className={styles.body}>{explanation[section.key]}</p>
        </details>
      ))}
    </section>
  );
}
