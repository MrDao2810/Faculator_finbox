import { t } from '@/application';
import type { Explanation, MessageKey } from '@/application';

import styles from './ExplanationAccordion.module.css';

export interface ExplanationAccordionProps {
  explanation: Explanation;
  /** Mở sẵn mục đầu. Chế độ Cơ bản nên mở, chế độ Nâng cao thì gập cho gọn (FR-09). */
  openFirst?: boolean;
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
  openFirst = true,
  className,
}: ExplanationAccordionProps) {
  const classes = [styles.wrap, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <h2 className={styles.title}>{t('explain.title')}</h2>

      {SECTIONS.map((section, index) => (
        <details key={section.key} className={styles.item} open={openFirst && index === 0}>
          <summary className={styles.summary}>{t(section.labelKey)}</summary>
          <p className={styles.body}>{explanation[section.key]}</p>
        </details>
      ))}
    </section>
  );
}
