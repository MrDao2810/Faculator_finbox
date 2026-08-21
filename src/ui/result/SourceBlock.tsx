'use client';

import type { FormulaSource } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import styles from './SourceBlock.module.css';

export interface SourceBlockProps {
  sources: ReadonlyArray<FormulaSource>;
  className?: string;
}

/**
 * Dòng trích nguồn tham khảo — gói WBS 2.4.5.
 *
 * FR-04 · CON-11: mọi công thức phải ghi nguồn để người dùng kiểm chứng được, và validator
 * của Registry đã chặn công thức nào không có. WF-03 khối 9 lấy ví dụ:
 * 'Nguồn: Giáo trình phân tích đầu tư (CFA Institute); Chuẩn mực kế toán VN (VAS).'
 *
 * Nguồn có `url` thì thành liên kết mở tab mới, kèm `rel="noreferrer"` — trang tĩnh không
 * có backend nên không muốn rò referrer sang bên thứ ba (NFR-SEC-01).
 */
export function SourceBlock({ sources, className }: SourceBlockProps) {
  const t = useT();
  const pick = usePick();
  if (sources.length === 0) return null;

  const classes = [styles.block, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <h2 className={styles.title}>{t('source.title')}</h2>
      <ul className={styles.list}>
        {sources.map((source) => (
          <li key={pick(source.label)} className={styles.item}>
            {source.url === undefined ? (
              pick(source.label)
            ) : (
              <a href={source.url} target="_blank" rel="noreferrer">
                {pick(source.label)}
              </a>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
