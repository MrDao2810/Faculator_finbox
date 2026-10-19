'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { isCalculated } from '@/application';
import type { CalcOutput } from '@/application';
import { usePick, useT } from '@/application/preferences-context';
import { placePanel } from '@/app/cong-thuc/[id]/place-panel';
import { anchorBox, viewportBounds } from '@/app/cong-thuc/[id]/use-panel-placement';

import styles from './SummaryGuidePanel.module.css';

/**
 * Khung hướng dẫn bật ra từ nút "?" cạnh "Beta danh mục" và "XIRR toàn DM" (19/10/2026).
 *
 * Chủ dự án hỏi hai dòng ấy hoạt động ra sao, rồi: _"thêm hướng dẫn sử dụng vào đằng sau Beta danh
 * mục và XIRR toàn DM"_. Với người mới chúng gần như luôn là `_ _`, và câu lý do dưới chúng đã bỏ từ
 * 29/09/2026 vì nó thành một đoạn cố định kể lại danh sách mã. Khung này trả lời đúng ba câu người ta
 * hỏi khi thấy `_ _`: nó là gì, vì sao đang trống, làm gì để có số — chỉ khi người ta bấm hỏi.
 *
 * ── Cùng hình với khung "?" của màn chi tiết, không cùng nội dung ────────────────────────────
 *
 * `GuideHintPanel` in một mục của bài hướng dẫn công thức (`BaiHuongDan`); hai dòng này không phải
 * công thức nên không có bài. Phép đặt khung thì dùng lại nguyên (`placePanel`, `anchorBox`,
 * `viewportBounds`), và số đo của khung chép từ `GuideHintPanel.module.css`: một sản phẩm, một kiểu
 * khung "?".
 *
 * ── Vì sao qua `createPortal` vào `<body>` ────────────────────────────────────────────────────
 *
 * Thẻ tóm tắt mang `container-type: inline-size` (cỡ chữ số lớn co theo `cqi`). Thuộc tính ấy kéo
 * theo layout containment, mà layout containment biến thẻ thành khối chứa của cả phần tử
 * `position: fixed` bên trong — khung sẽ bị đặt theo góc thẻ chứ không theo khung nhìn. Đưa ra
 * `<body>` thì không tổ tiên nào chen vào. Khung chỉ dựng sau một cú bấm, nên không có HTML tĩnh nào
 * để lệch.
 *
 * ── Lý do "đang trống" là câu cảnh báo của chính phép tính ───────────────────────────────────
 *
 * `summarisePortfolio()` đã viết sẵn câu ấy, kể đúng mã đang thiếu ("Chưa có beta của ABR, VCB…").
 * In lại `warning.message` thay vì dựng câu thứ hai thì khung không bao giờ nói khác phép tính. Phần
 * `fix` không in: mục "Cách dùng" ngay dưới đã là lời khuyên ấy, viết đủ hơn.
 */

export type SummaryGuideKind = 'beta' | 'xirr';

export interface SummaryGuideState {
  loai: SummaryGuideKind;
  anchor: Element;
  point: { x: number; y: number } | null;
}

const KHOA = {
  beta: {
    title: 'portfolio.guide.beta.title',
    what: 'portfolio.guide.beta.what',
    step: 'portfolio.guide.beta.step',
    done: 'portfolio.guide.beta.done',
    read: 'portfolio.guide.beta.read',
    note: null,
  },
  xirr: {
    title: 'portfolio.guide.xirr.title',
    what: 'portfolio.guide.xirr.what',
    step: 'portfolio.guide.xirr.step',
    done: 'portfolio.guide.xirr.done',
    read: 'portfolio.guide.xirr.read',
    note: 'portfolio.guide.xirr.note',
  },
} as const;

export interface SummaryGuidePanelProps {
  state: SummaryGuideState;
  /** Kết quả của chính dòng ấy — để in lý do khi nó đang là `_ _`. */
  output: CalcOutput;
  onClose: () => void;
  id: string;
}

export function SummaryGuidePanel({ state, output, onClose, id }: SummaryGuidePanelProps) {
  const t = useT();
  const pick = usePick();
  const panelRef = useRef<HTMLDivElement>(null);
  const [cho, setCho] = useState<{ top: number; left: number; maxHeight: number | null } | null>(
    null,
  );
  const khoa = KHOA[state.loai];

  /* Đo rồi mới đặt, như `GuideHintPanel`: lượt đầu khung ẩn để lấy kích thước thật. */
  useLayoutEffect(() => {
    const dat = () => {
      const panel = panelRef.current;
      if (panel === null || !state.anchor.isConnected) return;
      const ra = placePanel(
        anchorBox(state.anchor, state.point),
        { width: panel.offsetWidth, height: panel.scrollHeight },
        viewportBounds(),
      );
      setCho({ top: ra.top, left: ra.left, maxHeight: ra.maxHeight });
    };

    dat();
    window.addEventListener('resize', dat);
    /* Cuộn thì đóng, cùng lý do `GuideHintPanel`: nút trôi đi thì khung không còn trỏ vào đâu. */
    window.addEventListener('scroll', onClose, { passive: true });
    return () => {
      window.removeEventListener('resize', dat);
      window.removeEventListener('scroll', onClose);
    };
    /* `output` đổi (giá về, vừa sửa một mã) là đổi câu lý do, tức đổi chiều cao khung. */
  }, [state, onClose, output]);

  /* Esc đóng, bấm ra ngoài đóng. Bấm lại vào chính nút "?" thì nơi gọi lo (bật/tắt). */
  useEffect(() => {
    const phim = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const ngoai = (e: PointerEvent) => {
      const panel = panelRef.current;
      if (panel === null) return;
      const dich = e.target;
      if (dich instanceof Node && (panel.contains(dich) || state.anchor.contains(dich))) return;
      onClose();
    };
    document.addEventListener('keydown', phim);
    document.addEventListener('pointerdown', ngoai);
    return () => {
      document.removeEventListener('keydown', phim);
      document.removeEventListener('pointerdown', ngoai);
    };
  }, [state, onClose]);

  const lyDo = !isCalculated(output) && output.warning !== undefined ? output.warning : null;

  return createPortal(
    <div
      ref={panelRef}
      id={id}
      className={styles.panel}
      role="dialog"
      aria-labelledby={`${id}-tieu-de`}
      style={
        cho === null
          ? { visibility: 'hidden' }
          : {
              top: cho.top,
              left: cho.left,
              ...(cho.maxHeight === null ? {} : { maxHeight: cho.maxHeight }),
            }
      }
    >
      <h2 className={styles.title} id={`${id}-tieu-de`}>
        {t(khoa.title)}
      </h2>

      <section className={styles.muc}>
        <h3 className={styles.label}>{t('portfolio.guide.what')}</h3>
        <p className={styles.text}>{t(khoa.what)}</p>
      </section>

      {/*
        Lý do đứng TRƯỚC "Cách dùng": người bấm "?" cạnh một `_ _` cần biết thiếu gì rồi mới cần biết
        nhập ở đâu. Dòng đã ra số thì mục này không có.
      */}
      {lyDo !== null && (
        <section className={styles.muc}>
          <h3 className={styles.label}>{t('portfolio.guide.why')}</h3>
          <p className={`${styles.text} ${styles.reason}`}>{pick(lyDo.message)}</p>
        </section>
      )}

      <section className={styles.muc}>
        <h3 className={styles.label}>{t('portfolio.guide.use')}</h3>
        <ol className={styles.steps}>
          <li>{t('portfolio.guide.openEdit')}</li>
          <li>{t(khoa.step)}</li>
        </ol>
        <p className={styles.text}>{t(khoa.done)}</p>
      </section>

      <section className={styles.muc}>
        <h3 className={styles.label}>{t('portfolio.guide.read')}</h3>
        <p className={styles.text}>{t(khoa.read)}</p>
        {khoa.note !== null && <p className={styles.text}>{t(khoa.note)}</p>}
      </section>
    </div>,
    document.body,
  );
}
