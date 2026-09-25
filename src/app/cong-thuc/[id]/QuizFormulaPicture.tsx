'use client';

import { memo, useCallback, useMemo } from 'react';

import type { FormulaSpec } from '@/application';
import { usePick, usePreferences } from '@/application/preferences-context';

import { HowToPanel } from './HowToPanel';
import type { NotationHowToView, NotationView } from './notation-types';
import { useHowToPanel } from './use-how-to-panel';
import { usePanelPlacement } from './use-panel-placement';
import styles from './FormulaNotationCard.module.css';

export interface QuizFormulaPictureProps {
  spec: FormulaSpec;
  /** Nên có `latexHtmlAllSymbols` — `page.tsx` chỉ dựng nó cho trang có câu cần hình này. */
  notation: NotationView;
}

/** Khung cuộn ngang của hình — cuộn thì điểm chạm trôi theo, khung phải đặt lại. */
function pictureScroller(card: HTMLDivElement): Element | null {
  return card.querySelector(`.${styles.quizPictureMath ?? ''}`);
}

/**
 * Hình công thức trên dòng "Công thức" của khối lời giải trong Bài tập (25/09/2026).
 *
 * Chủ dự án chụp khung "cách tính" của thẻ Công thức (rê vào `V` của Biên an toàn thì hiện nghĩa,
 * bước tính và liên kết sang Mô hình Gordon) rồi nói: "hover vào ký tự thì nó ra như này. kiểu thế
 * chứ không phải là kiểu giải thích ở bên phải kia". Hai bản trước đó đều bị bác — bảng nghĩa trơn
 * hiện khi rê chuột lên cả dòng chữ, rồi bảng ký hiệu cố định bên phải.
 *
 * Nên đây là ĐÚNG cơ chế của thẻ Công thức, dùng lại chứ không chép: `useHowToPanel` (rê chuột mở,
 * bấm/chạm ghim, Esc và chạm ra ngoài đóng), `usePanelPlacement`, `HowToPanel`, và lớp `.card` của
 * `FormulaNotationCard.module.css` cho con trỏ bàn tay, vệt sáng trên ký hiệu và khung nổi.
 *
 * Khác thẻ Công thức ở MỘT chỗ: mọi ký hiệu đều mở khung, không chỉ ký hiệu có bước tính. Thẻ có
 * bảng ký hiệu cố định bên cạnh hình, nên ký hiệu không có khung vẫn đọc được nghĩa ở đó; khối lời
 * giải không có bảng ấy. Ký hiệu không có bước tính mở một khung chỉ có dòng tiêu đề — đúng dòng
 * "ký hiệu: nghĩa" của bảng. Vì thế hình dùng `latexHtmlAllSymbols`, bản gắn dấu mọi ký hiệu.
 *
 * Không có điểm dừng Tab trong MathML — cùng quyết định với thẻ Công thức, nơi người dùng bàn phím
 * mở khung từ các nút ở bảng ký hiệu. Khối lời giải không có bảng ấy, nên bàn phím chưa mở được
 * khung ở đây; ghi ra để không ai tưởng là sót.
 *
 * `memo` + `useMemo` cho `{ __html }`, cùng lý do với thẻ: React 19 so `dangerouslySetInnerHTML` theo
 * danh tính object, dựng lại là thay phần tử MathML ngay dưới con trỏ giữa lúc rê.
 */
export const QuizFormulaPicture = memo(function QuizFormulaPicture({
  spec,
  notation,
}: QuizFormulaPictureProps) {
  const pick = usePick();
  const { locale } = usePreferences();

  const symbols = useMemo(() => spec.symbols ?? [], [spec.symbols]);
  const howToBySym = useMemo(
    () => new Map(notation.howTo.map((howTo) => [howTo.sym, howTo])),
    [notation.howTo],
  );
  const isSymbol = useCallback((sym: number) => sym >= 0 && sym < symbols.length, [symbols.length]);

  const { state, cardRef, panelRef, anchorRef, pointRef, handlers } = useHowToPanel(
    isSymbol,
    locale,
  );
  const placement = usePanelPlacement(
    state,
    { cardRef, panelRef, anchorRef, pointRef },
    pictureScroller,
  );

  const pictureInner = useMemo(
    () => ({ __html: notation.latexHtmlAllSymbols ?? notation.latexHtml }),
    [notation.latexHtmlAllSymbols, notation.latexHtml],
  );

  const symbol = state === null ? undefined : symbols[state.sym];
  /*
   * Ký hiệu không có bước tính: khung chỉ có tiêu đề. `kind` ở đây không ai đọc — `HowToPanel`
   * dựng theo `steps` và `formula` — nhưng kiểu bắt buộc phải có một giá trị.
   */
  const howTo: NotationHowToView | undefined =
    state === null
      ? undefined
      : (howToBySym.get(state.sym) ?? { sym: state.sym, kind: 'defined', steps: [] });

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${styles.quizPicture}`}
      data-active={state === null ? undefined : state.sym}
      onPointerOver={handlers.onPointerOver}
      onPointerOut={handlers.onPointerOut}
      onClick={handlers.onClick}
      onBlur={handlers.onBlur}
    >
      <div
        className={styles.quizPictureMath}
        // eslint-disable-next-line react/no-danger -- MathML dựng lúc build từ `spec.latex`, xem notation-view.ts
        dangerouslySetInnerHTML={pictureInner}
      />
      {state !== null && symbol !== undefined && howTo !== undefined && (
        <HowToPanel
          id={`bai-tap-${spec.id}-${String(state.sym)}`}
          howTo={howTo}
          symbolHtml={notation.symbolsHtml[state.sym] ?? ''}
          meaning={pick(symbol.meaning)}
          placement={placement}
          panelRef={panelRef}
        />
      )}
    </div>
  );
});
