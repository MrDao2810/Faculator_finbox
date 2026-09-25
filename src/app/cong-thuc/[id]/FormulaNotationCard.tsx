'use client';

import { Fragment, memo, useCallback, useMemo, useState } from 'react';

import type { FormulaSpec } from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { Button } from '@/ui/primitives';

import { HowToPanel } from './HowToPanel';
import type { NotationView } from './notation-types';
import { useHowToPanel } from './use-how-to-panel';
import { usePanelPlacement } from './use-panel-placement';
import detailStyles from './FormulaDetail.module.css';
import styles from './FormulaNotationCard.module.css';

export interface FormulaNotationCardProps {
  spec: FormulaSpec;
  /** Mọi thứ dựng sẵn lúc build — `buildNotationView()` ở `page.tsx`. */
  notation: NotationView;
}

/** Khung cuộn ngang của hình — cuộn thì điểm chạm trôi theo, khung phải đặt lại. */
function formulaScroller(card: HTMLDivElement): Element | null {
  return card.querySelector(`.${detailStyles.formula ?? ''}`);
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
 *
 * ── Nút "Chú thích" ẩn/hiện bảng ký hiệu — CHỈ khổ điện thoại (17/09/2026) ───────────────────
 *
 * Chủ dự án khoanh bảng ký hiệu của `fcfe` trên điện thoại: ở một cột, bảng xếp DƯỚI hình và dài
 * tám dòng, đẩy khối Số liệu xuống xa. Nút nhỏ góc dưới bên phải thẻ ẩn/hiện bảng. Ở PC bảng đứng
 * CẠNH hình nên không chiếm thêm chiều dọc — nút ẩn bằng CSS, và bảng luôn hiện dù trạng thái ra sao.
 *
 * Chữ nút KHÔNG đổi theo trạng thái: bản đầu ghi "Ẩn ký hiệu"/"Hiện ký hiệu", chủ dự án đổi thành
 * một chữ "Chú thích" ("không cần thêm Ẩn hay Hiện"). Trạng thái đọc ở mũi tên (lật ngược khi bảng
 * ẩn) và `aria-expanded` — đúng mẫu nút mở/đóng, trình đọc màn hình tự nói "đã mở"/"đã đóng".
 *
 * Mặc định là HIỆN (người mới cần bảng), và trạng thái không nhớ qua trang: mỗi công thức mở ra lại
 * có bảng. HTML tĩnh vì thế dựng đúng như lượt render đầu, không có cú nhảy bố cục lúc hydrate.
 *
 * Bảng đang ẩn mà người dùng chạm một ký hiệu trong hình thì khung cách tính phải dựng NGOÀI bảng:
 * dựng trong `<dd>` như lúc bảng hiện là dựng vào một khối `display: none`.
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

  const { state, cardRef, panelRef, anchorRef, pointRef, close, handlers } = useHowToPanel(
    hasHowTo,
    locale,
  );

  /** Bảng ký hiệu đang ẩn — chỉ có tác dụng ở khổ điện thoại, xem docblock. */
  const [legendHidden, setLegendHidden] = useState(false);

  const formulaInner = useMemo(() => ({ __html: notation.latexHtml }), [notation.latexHtml]);
  const symbolInner = useMemo(
    () => notation.symbolsHtml.map((html) => ({ __html: html })),
    [notation.symbolsHtml],
  );

  const placement = usePanelPlacement(
    state,
    { cardRef, panelRef, anchorRef, pointRef },
    formulaScroller,
  );

  const symbols = spec.symbols ?? [];
  const segments =
    locale === 'en' && (spec.expression?.en ?? '').trim() !== ''
      ? notation.expression.en
      : notation.expression.vi;

  const panelId = (sym: number) => `cach-tinh-${spec.id}-${String(sym)}`;
  const legendId = `ky-hieu-${spec.id}`;

  const panelFor = (sym: number) => {
    const howTo = howToBySym.get(sym);
    const symbol = symbols[sym];
    if (howTo === undefined || symbol === undefined) return null;
    return (
      <HowToPanel
        id={panelId(sym)}
        howTo={howTo}
        symbolHtml={notation.symbolsHtml[sym] ?? ''}
        meaning={pick(symbol.meaning)}
        placement={placement}
        panelRef={panelRef}
      />
    );
  };

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
        <p className={detailStyles.expression} data-lines={segments.length}>
          {spec.expression === undefined
            ? spec.latex
            : segments.map((line, li) => (
                <Fragment key={li}>
                  {/*
                    Ký tự xuống dòng THẬT giữa hai vế, không chỉ hai khối CSS: `p.textContent` nhờ
                    thế vẫn đúng từng chữ bằng `spec.expression.vi` (ca kiểm so nguyên văn dựa vào
                    đó), và người dùng bôi đen chép ra ngoài cũng được hai dòng. Nút chữ toàn khoảng
                    trắng giữa hai grid item không sinh ô nào, nên nó vô hình — với điều kiện
                    `.expression` không bao giờ mang `white-space: pre-line` hay `pre-wrap`.
                  */}
                  {li > 0 && '\n'}
                  <span className={detailStyles.expressionLine} data-eq={li}>
                    {line.map((segment, index) =>
                      segment.sym === undefined ? (
                        <Fragment key={index}>{segment.text}</Fragment>
                      ) : (
                        <span key={index} className={styles.phrase} data-sym={segment.sym}>
                          {segment.text}
                        </span>
                      ),
                    )}
                  </span>
                </Fragment>
              ))}
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
        <div className={styles.legend}>
          <dl
            id={legendId}
            className={
              legendHidden ? `${detailStyles.symbols} ${styles.legendHidden}` : detailStyles.symbols
            }
            aria-label={t('detail.symbols')}
          >
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
                    {open && !legendHidden && panelFor(index)}
                  </dd>
                </Fragment>
              );
            })}
          </dl>
          <Button
            variant="ghost"
            size="sm"
            className={styles.legendToggle}
            aria-expanded={!legendHidden}
            aria-controls={legendId}
            onClick={() => {
              close();
              setLegendHidden((hidden) => !hidden);
            }}
          >
            {t('detail.symbols.toggle')}
            <svg
              className={styles.legendToggleIcon}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 15l6-6 6 6" />
            </svg>
          </Button>
        </div>
      )}
      {/* Bảng đang ẩn: khung dựng ở đây, ngoài bảng — xem docblock. */}
      {legendHidden && state !== null && panelFor(state.sym)}
    </div>
  );
});
