'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import type { CSSProperties, RefObject } from 'react';

import { formulaPath } from '@/application';
import { usePick, useT } from '@/application/preferences-context';

import type { NotationHowToView } from './notation-types';
import styles from './FormulaNotationCard.module.css';

export interface HowToPanelProps {
  id: string;
  howTo: NotationHowToView;
  /** MathML dòng của ký hiệu — cùng chuỗi bảng ký hiệu đang hiện. */
  symbolHtml: string;
  meaning: string;
  /** Toạ độ trong thẻ. `null` ở lượt dựng đầu: khung ẩn đi để đo kích thước trước khi đặt. */
  placement: { top: number; left: number; maxHeight: number | null } | null;
  panelRef: RefObject<HTMLDivElement | null>;
}

/**
 * Khung "cách tính" của một ký hiệu (17/09/2026).
 *
 * Tiêu đề là ký hiệu và nghĩa của nó (chép từ bảng ký hiệu, không viết lại), rồi các BƯỚC: mỗi bước
 * một hình KaTeX dựng sẵn lúc build và dòng chữ đọc hình ấy thành lời — cùng khuôn "hình + dòng chữ"
 * của chính thẻ Công thức, nên người dùng đọc khung như đọc một thẻ nhỏ.
 *
 * Các object `__html` dựng một lần bằng `useMemo`: React 19 so `dangerouslySetInnerHTML` theo DANH
 * TÍNH object, nên object mới ở mỗi lượt render (lượt đặt vị trí là một lượt) sẽ thay hết MathML
 * trong khung.
 */
export function HowToPanel({
  id,
  howTo,
  symbolHtml,
  meaning,
  placement,
  panelRef,
}: HowToPanelProps) {
  const t = useT();
  const pick = usePick();

  const symbolInner = useMemo(() => ({ __html: symbolHtml }), [symbolHtml]);
  const stepInner = useMemo(() => howTo.steps.map((step) => ({ __html: step.html })), [howTo]);

  const style: CSSProperties =
    placement === null
      ? { top: 0, left: 0, visibility: 'hidden' }
      : {
          top: placement.top,
          left: placement.left,
          ...(placement.maxHeight === null ? {} : { maxHeight: placement.maxHeight }),
        };

  return (
    <div
      id={id}
      ref={panelRef}
      role="group"
      aria-label={`${t('detail.howTo.label')}: ${meaning}`}
      className={styles.panel}
      style={style}
    >
      <p className={styles.panelTitle}>
        {/* eslint-disable-next-line react/no-danger -- MathML dựng lúc build, xem latex-html.ts */}
        <span className={styles.panelSymbol} dangerouslySetInnerHTML={symbolInner} />
        <span>{meaning}</span>
      </p>
      <ol className={styles.steps}>
        {howTo.steps.map((step, index) => (
          <li key={index} className={styles.step}>
            <div
              className={styles.stepMath}
              // eslint-disable-next-line react/no-danger -- MathML dựng lúc build, xem latex-html.ts
              dangerouslySetInnerHTML={stepInner[index]}
            />
            <p className={styles.stepText}>{pick(step.expression)}</p>
          </li>
        ))}
      </ol>
      {howTo.formula !== undefined && (
        <Link className={styles.panelLink} href={formulaPath(howTo.formula.id)}>
          {t('detail.howTo.open')} {pick(howTo.formula.name)}
        </Link>
      )}
    </div>
  );
}
