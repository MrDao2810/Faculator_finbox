'use client';

import { useState } from 'react';

import type { CauHoiThuongGap } from '@/application';
import { useT, usePick } from '@/application/preferences-context';
import { Button } from '@/ui/primitives';

/*
 * Import thẳng file LÁ, không qua barrel `@/ui/quiz`: barrel ấy kéo theo `QuizPanel`, mà khối này nằm
 * trong First Load JS của mọi trang chi tiết có câu hỏi.
 */
import { shortUrl } from '../quiz/short-url';
import styles from './FaqBlock.module.css';

/**
 * Số câu hiện sẵn; phần còn lại nằm sau nút "Xem thêm N câu" (chủ dự án chọn, 10/11/2026). Câu bị
 * ẩn vẫn ở trong HTML tĩnh với thuộc tính `hidden`, nên lượt dựng đầu của máy khách khớp HTML.
 */
export const FAQ_HIEN_TRUOC = 5;

export interface FaqBlockProps {
  /** Đã sắp sẵn (Việt Nam trước) bởi `hoiDapFor()`. Rỗng thì khối không dựng gì. */
  items: ReadonlyArray<CauHoiThuongGap>;
  /** Dựng id của khối từ đây, không `useId()` — cùng luật với biểu đồ và bài tập (hydration). */
  formulaId: string;
  className?: string;
}

/**
 * Khối "Câu hỏi thường gặp" của màn chi tiết (10/11/2026) — xem docblock `src/core/hoi-dap/types.ts`.
 *
 * Mỗi câu là một `<details>` GẬP SẴN, cùng dáng hàng của "Giải thích cho người mới" (dấu ＋/−, vùng
 * chạm 44px). Mở ra: câu trả lời, hoặc "Chưa có trả lời" khi chủ dự án chưa quyết; rồi link tới chỗ
 * câu ấy được hỏi, để người đọc biết đây là câu người thật hỏi và tự mở ra xem.
 */
export function FaqBlock({ items, formulaId, className }: FaqBlockProps) {
  const t = useT();
  const pick = usePick();
  const [moHet, setMoHet] = useState(false);

  if (items.length === 0) return null;

  const titleId = `faq-${formulaId}-title`;
  const listId = `faq-${formulaId}-list`;
  const conLai = items.length - FAQ_HIEN_TRUOC;
  const classes = [styles.block, className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles.title}>
        {t('faq.title')}
      </h2>

      <div id={listId} className={styles.list}>
        {items.map((cau, i) => {
          // Link trả lời TRÙNG link câu hỏi (trả lời nằm ngay trong chủ đề ấy) thì không in lần hai.
          const nguonTraLoi = (cau.nguonTraLoi ?? []).filter((n) => n.url !== cau.nguon?.url);
          return (
            <details
              key={`${cau.nguon?.url ?? 'tu-soan'}#${String(i)}`}
              className={styles.item}
              hidden={!moHet && i >= FAQ_HIEN_TRUOC}
            >
              <summary className={styles.summary}>{pick(cau.hoi)}</summary>
              <div className={styles.body}>
                {cau.traLoi === undefined ? (
                  <p className={styles.noAnswer}>{t('faq.noAnswer')}</p>
                ) : (
                  <p className={styles.answer}>
                    <span className={styles.answerLabel}>{t('faq.answerLabel')}</span>{' '}
                    {pick(cau.traLoi)}
                  </p>
                )}
                {cau.nguon !== undefined && (
                  <p className={styles.source}>
                    <span className={styles.sourceLabel}>{t('faq.askedAt')}</span>{' '}
                    <a href={cau.nguon.url} target="_blank" rel="noreferrer" title={cau.nguon.ten}>
                      {shortUrl(cau.nguon.url)}
                    </a>
                  </p>
                )}
                {nguonTraLoi.length > 0 && (
                  <p className={styles.source}>
                    <span className={styles.sourceLabel}>{t('faq.answerSource')}</span>{' '}
                    {nguonTraLoi.map((n, j) => (
                      <span key={n.url}>
                        {j > 0 && ' · '}
                        <a href={n.url} target="_blank" rel="noreferrer" title={n.ten}>
                          {shortUrl(n.url)}
                        </a>
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {conLai > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className={styles.more}
          aria-expanded={moHet}
          aria-controls={listId}
          onClick={() => {
            setMoHet((dangMo) => !dangMo);
          }}
        >
          {moHet ? t('faq.less') : t('faq.more').replace('{n}', String(conLai))}
        </Button>
      )}
    </section>
  );
}
