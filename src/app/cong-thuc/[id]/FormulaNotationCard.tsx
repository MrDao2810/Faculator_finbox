'use client';

import { Fragment, memo, useCallback, useLayoutEffect, useMemo, useState } from 'react';

import type { FormulaSpec } from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';

import { HowToPanel } from './HowToPanel';
import type { NotationView } from './notation-types';
import { placePanel } from './place-panel';
import type { Bounds } from './place-panel';
import { useHowToPanel } from './use-how-to-panel';
import detailStyles from './FormulaDetail.module.css';
import styles from './FormulaNotationCard.module.css';

export interface FormulaNotationCardProps {
  spec: FormulaSpec;
  /** Mọi thứ dựng sẵn lúc build — `buildNotationView()` ở `page.tsx`. */
  notation: NotationView;
}

/** Lề giữa khung và mép màn / mép hai thanh dính. */
const EDGE = 8;

/**
 * Vùng đặt được khung: khung nhìn trừ header dính ở trên và thanh tab dính ở dưới. Đo lúc mở khung
 * chứ không nhớ sẵn — ở PC thanh tab không có, và header có thể đã cuộn khỏi màn.
 */
function viewportBounds(): Bounds {
  let top = EDGE;
  let bottom = window.innerHeight - EDGE;

  const header = document.querySelector('header');
  if (header !== null) {
    const rect = header.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top <= 1) top = Math.max(top, rect.bottom + EDGE);
  }
  for (const nav of document.querySelectorAll('nav')) {
    const position = getComputedStyle(nav).position;
    if (position !== 'sticky' && position !== 'fixed') continue;
    const rect = nav.getBoundingClientRect();
    if (rect.top > window.innerHeight / 2 && rect.top < window.innerHeight) {
      bottom = Math.min(bottom, rect.top - EDGE);
    }
  }

  return { top, left: EDGE, right: window.innerWidth - EDGE, bottom };
}

/** Khối của điểm chạm; cụm chữ xuống dòng thì lấy đúng DÒNG đang có con trỏ. */
function anchorBox(anchor: Element, point: { x: number; y: number } | null) {
  const rects = [...anchor.getClientRects()];
  const hit =
    point === null
      ? undefined
      : rects.find(
          (r) => point.y >= r.top && point.y <= r.bottom && point.x >= r.left && point.x <= r.right,
        );
  const rect = hit ?? anchor.getBoundingClientRect();
  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

/**
 * Thẻ Công thức của màn chi tiết: hình, dòng chữ, bảng ký hiệu — và khung "cách tính" (17/09/2026).
 *
 * Tách khỏi `FormulaDetail` vì hai lẽ:
 *
 * 1. **Giữ nguyên các nút MathML qua mọi lượt render.** React 19 so `dangerouslySetInnerHTML` theo
 *    DANH TÍNH object: bản cũ viết `{{ __html: latexHtml }}` ngay trong JSX của `FormulaDetail`, nên
 *    MỖI phím gõ ở khối Số liệu dựng lại toàn bộ hình và bảng ký hiệu. Với khung cách tính thì còn
 *    tệ hơn — phần tử dưới con trỏ bị thay giữa lúc rê. Ở đây object dựng một lần (`useMemo`) và
 *    component bọc `memo`, nên gõ số không chạm tới thẻ.
 * 2. **Trạng thái khung là của riêng thẻ.** Mở/đóng khung không được dựng lại màn 2.600 dòng.
 *
 * Cấu trúc DOM giữ đúng thứ `verify-static` và `check:chrome` đang bám: thẻ có hai con, `.formula`
 * là cha của `.katex`, dòng chữ là `<p>` ngay sau nó, mỗi `<dt>` mở đầu bằng `<span class="katex">`.
 *
 * ── Điểm chạm ─────────────────────────────────────────────────────────────────────────────────
 *
 * Mỗi dòng bảng ký hiệu có khung mang số thứ tự `k` ở ba chỗ, đều qua thuộc tính `data-sym="k"`:
 * phần tử MathML trong hình (gắn lúc build, `mathml-marks.ts`), đoạn chữ ở dòng chữ, và `<dt>` +
 * nút nghĩa ở bảng. Chỉ nút ở bảng là điểm dừng của phím Tab — người dùng bàn phím mở khung từ
 * bảng ký hiệu; hình và dòng chữ là lối tắt cho chuột và ngón tay.
 *
 * Tô sáng thuần CSS: thẻ mang `data-active="k"` khi khung của `k` đang mở, và 12 selector tĩnh
 * trong `FormulaNotationCard.module.css` tô mọi `[data-sym='k']`. Không ghi gì vào DOM của MathML.
 */
export const FormulaNotationCard = memo(function FormulaNotationCard({
  spec,
  notation,
}: FormulaNotationCardProps) {
  const t = useT();
  const pick = usePick();
  const { locale } = usePreferences();

  const howToBySym = useMemo(
    () => new Map(notation.howTo.map((howTo) => [howTo.sym, howTo])),
    [notation.howTo],
  );
  const hasHowTo = useCallback((sym: number) => howToBySym.has(sym), [howToBySym]);

  const { state, cardRef, panelRef, anchorRef, pointRef, handlers } = useHowToPanel(
    hasHowTo,
    locale,
  );

  const formulaInner = useMemo(() => ({ __html: notation.latexHtml }), [notation.latexHtml]);
  const symbolInner = useMemo(
    () => notation.symbolsHtml.map((html) => ({ __html: html })),
    [notation.symbolsHtml],
  );

  const [placement, setPlacement] = useState<{
    top: number;
    left: number;
    maxHeight: number | null;
  } | null>(null);

  /*
   * Đặt khung SAU khi nó có mặt trong DOM mà TRƯỚC khi trình duyệt vẽ: lượt đầu khung ẩn
   * (`visibility: hidden`) để đo kích thước, lượt sau mới hiện đúng chỗ — không có cú nhảy nào lọt
   * ra mắt người dùng.
   */
  useLayoutEffect(() => {
    if (state === null) {
      setPlacement(null);
      return undefined;
    }

    const update = () => {
      const card = cardRef.current;
      const panel = panelRef.current;
      const anchor = anchorRef.current;
      if (card === null || panel === null || anchor === null || !anchor.isConnected) return;

      const cardRect = card.getBoundingClientRect();
      const place = placePanel(
        anchorBox(anchor, pointRef.current),
        { width: panel.offsetWidth, height: panel.scrollHeight },
        viewportBounds(),
      );
      setPlacement({
        top: place.top - cardRect.top,
        left: place.left - cardRect.left,
        maxHeight: place.maxHeight,
      });
    };

    update();
    // Hình công thức dài cuộn ngang trong khung riêng — cuộn thì điểm chạm trôi theo.
    const formula = cardRef.current?.querySelector(`.${detailStyles.formula ?? ''}`) ?? null;
    window.addEventListener('resize', update);
    formula?.addEventListener('scroll', update);
    return () => {
      window.removeEventListener('resize', update);
      formula?.removeEventListener('scroll', update);
    };
  }, [state, cardRef, panelRef, anchorRef, pointRef]);

  const symbols = spec.symbols ?? [];
  const segments =
    locale === 'en' && (spec.expression?.en ?? '').trim() !== ''
      ? notation.expression.en
      : notation.expression.vi;

  const panelId = (sym: number) => `cach-tinh-${spec.id}-${String(sym)}`;

  return (
    <div
      ref={cardRef}
      className={`${detailStyles.formulaCard} ${styles.card}`}
      data-active={state === null ? undefined : state.sym}
      onPointerOver={handlers.onPointerOver}
      onPointerOut={handlers.onPointerOut}
      onClick={handlers.onClick}
      onBlur={handlers.onBlur}
    >
      <div className={detailStyles.formulaMain}>
        {/*
          `dangerouslySetInnerHTML` an toàn và không có đường nào khác: React không dựng được cây
          MathML từ chuỗi. Đầu vào là hằng số `spec.latex` trong repo, đi qua KaTeX với
          `trust: false` rồi `markSymbols()` chỉ thêm thuộc tính `data-sym`, tất cả lúc BUILD.

          `<div>` chứ không `<p>`: MathML là nội dung khối, nhét vào `<p>` là HTML sai cấu trúc.
        */}
        <div
          className={detailStyles.formula}
          // eslint-disable-next-line react/no-danger -- xem chú thích ngay trên
          dangerouslySetInnerHTML={formulaInner}
        />
        {/*
          Bản dạng chữ GIỮ LẠI, không phải bản dự phòng: nó nói cùng công thức bằng tên đầy đủ
          tiếng Việt, thứ ký hiệu viết tắt phía trên không nói. Cụm nào là điểm chạm của một ký hiệu
          có khung thì bọc `<span data-sym>` — ghép các đoạn lại luôn ra đúng dòng chữ gốc.
        */}
        <p className={detailStyles.expression}>
          {spec.expression === undefined
            ? spec.latex
            : segments.map((segment, index) =>
                segment.sym === undefined ? (
                  <Fragment key={index}>{segment.text}</Fragment>
                ) : (
                  <span key={index} className={styles.phrase} data-sym={segment.sym}>
                    {segment.text}
                  </span>
                ),
              )}
        </p>
      </div>
      {/*
        Bảng ký hiệu — nửa phải của thẻ (dưới, ở khổ hẹp): mỗi chữ trong hình là gì, "A: là gì".
        Chủ dự án chốt bố cục 16/09/2026. Đây là DỮ LIỆU, không phải đoạn văn giải thích — hai bản
        đoạn văn/chú giải trước đó đều bị bỏ ("quê mùa"); đừng dựng lại chúng ở đây.

        Dòng có khung cách tính: nghĩa bọc trong một `<button>` trông như chữ thường (gạch chấm), và
        khung mở ra ngay trong `<dd>` ấy — thứ tự DOM đặt khung ngay sau nút, nên Tab đi thẳng vào
        liên kết trong khung.
      */}
      {symbols.length > 0 && (
        <dl className={detailStyles.symbols} aria-label={t('detail.symbols')}>
          {symbols.map((symbol, index) => {
            const howTo = howToBySym.get(index);
            const meaning = pick(symbol.meaning);
            const open = howTo !== undefined && state?.sym === index;
            return (
              <Fragment key={symbol.latex}>
                <dt
                  {...(howTo === undefined ? {} : { 'data-sym': index })}
                  // eslint-disable-next-line react/no-danger -- MathML dựng lúc build, xem trên
                  dangerouslySetInnerHTML={symbolInner[index]}
                />
                <dd>
                  {howTo === undefined ? (
                    meaning
                  ) : (
                    <button
                      type="button"
                      className={styles.meaningButton}
                      data-sym={index}
                      aria-expanded={open}
                      {...(open ? { 'aria-controls': panelId(index) } : {})}
                    >
                      {meaning}
                    </button>
                  )}
                  {open && (
                    <HowToPanel
                      id={panelId(index)}
                      howTo={howTo}
                      symbolHtml={notation.symbolsHtml[index] ?? ''}
                      meaning={meaning}
                      placement={placement}
                      panelRef={panelRef}
                    />
                  )}
                </dd>
              </Fragment>
            );
          })}
        </dl>
      )}
    </div>
  );
});
