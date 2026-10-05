'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { guidePath, type BaiHuongDan, type MucId } from '@/application';
import { useT } from '@/application/preferences-context';
import { GuideMuc } from '@/ui/guide/GuideBody';

import { placePanel } from './place-panel';
import { anchorBox, viewportBounds } from './use-panel-placement';
import styles from './GuideHintPanel.module.css';

/**
 * Khung hướng dẫn BẬT RA NGAY TẠI NÚT "?" — WF-21 đợt 4 (03/10/2026).
 *
 * ── Vì sao không còn là ngăn kéo trượt từ mép phải ───────────────────────────────────────────
 *
 * Chủ dự án: *"bấm vào '?' thì có một popup xổ ra ở chỗ trỏ chuột ấy chứ không phải là ở slide"*.
 * Đợt 2 dựng một `BottomSheet placement="right"`; nó bị bỏ, và lý do đọc được ngay trên màn: một
 * tấm 520px dán mép phải không nói được nó trả lời cho CHỖ NÀO. Người ta bấm vào dấu hỏi cạnh
 * khối Số liệu rồi phải đưa mắt sang đầu kia màn hình để tìm câu trả lời — đúng cái khoảng cách
 * mà chủ dự án đã bác một lần nữa ở khối chuỗi công thức ngày 17/09/2026 ("số liệu đứng xa ô nhận
 * nó thì đọc thành phần của khối khác").
 *
 * ── Dùng lại phép đặt khung đã có, không dựng bản thứ hai ────────────────────────────────────
 *
 * Sản phẩm đã có đúng hình này: khung "cách tính" bật ra khi rê vào một ký hiệu trong hình công
 * thức. Chủ dự án từng chỉ thẳng vào nó làm mẫu (*"hover vào ký tự thì nó ra như này. kiểu thế
 * chứ không phải là kiểu giải thích ở bên phải kia"*, 25/09/2026). Nên khung này dùng lại
 * `placePanel` + `anchorBox` + `viewportBounds` của chính cơ chế ấy — chỉ khác một điểm có lý do:
 *
 * `usePanelPlacement` trả toạ độ TƯƠNG ĐỐI so với một khối cha `position: relative`, vì khung
 * "cách tính" luôn sống trong thẻ Công thức. Nút "?" thì rải trên cả màn, và mọi khối cha của nó
 * đều có thể mang `overflow` hay `content-visibility` — hai thứ cắt mất khung (bài học đã trả giá
 * ở khối Bài tập và khối Ví dụ, cả hai phải bỏ lớp `deferred` vì `contain: paint`). Nên khung này
 * `position: fixed` theo toạ độ KHUNG NHÌN, không khối cha nào cắt được nó.
 */

/**
 * Nút "Mở toàn trang ↗" ở chân khung — ĐANG TẮT TẠM (03/10/2026, theo yêu cầu chủ dự án).
 *
 * Một hằng số có tên chứ một dấu chú thích bao quanh JSX: cách này giữ cho `Link`, `guidePath` và
 * lớp `.full` vẫn được typecheck và lint soi tới, nên bật lại là đổi đúng một chữ `false` thành
 * `true` mà không sợ bên trong đã mục ruỗng trong lúc tắt. Cùng khuôn `PHONG_TO_BAT` của
 * `ChartBody` — nút phóng to biểu đồ cũng đang tắt theo cùng một cách, vì cùng một loại lý do.
 */
const HIEN_MO_TOAN_TRANG = false;

export interface GuideHintPanelState {
  muc: MucId;
  anchor: Element;
  point: { x: number; y: number } | null;
}

export interface GuideHintPanelProps {
  bai: BaiHuongDan;
  state: GuideHintPanelState;
  onClose: () => void;
  /** `id` để nút "?" trỏ `aria-controls` vào. */
  id: string;
}

export function GuideHintPanel({ bai, state, onClose, id }: GuideHintPanelProps) {
  const t = useT();
  const panelRef = useRef<HTMLDivElement>(null);
  const [cho, setCho] = useState<{ top: number; left: number; maxHeight: number | null } | null>(
    null,
  );

  /*
   * Đo rồi mới đặt, trong `useLayoutEffect`: lượt đầu khung ẩn (`visibility: hidden` khi `cho` còn
   * `null`) để lấy kích thước thật, lượt sau mới hiện đúng chỗ. Không có cú nhảy nào lọt ra mắt —
   * cùng cách khung "cách tính" đang làm.
   */
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
    /* Cuộn thì ĐÓNG chứ không chạy theo: khung bám một nút, mà nút trôi khỏi màn thì khung treo
       giữa không trung không còn trỏ vào đâu. Rẻ hơn và đọc ra rõ hơn là đuổi theo. */
    window.addEventListener('scroll', onClose, { passive: true });
    return () => {
      window.removeEventListener('resize', dat);
      window.removeEventListener('scroll', onClose);
    };
  }, [state, onClose]);

  /* Esc đóng, và bấm ra ngoài đóng — hai lối thoát quen thuộc của mọi khung nổi trong sản phẩm. */
  useEffect(() => {
    const phim = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const ngoai = (e: MouseEvent) => {
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

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.panel}
      role="dialog"
      aria-label={t('guide.howToUse')}
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
      {/*
        `onRoiBai` ĐÃ BỎ ngày 05/10/2026, cùng mọi link trong thân bài.

        Nó đóng khung trước khi đi theo một link trỏ về chính màn này ("Xem ví dụ thực tế ↗",
        "Làm bài tập ↗", "Đổi biểu phí ở Cài đặt ↗"): thiếu nó thì Next chỉ đổi hash chứ không
        dựng lại route, khung đứng nguyên che đúng chỗ nó vừa chỉ tới, và cú bấm trông như trơ.

        Thân bài nay chỉ mang chữ của `guide-111.json`, trong đó không có lối ra nào — nên không
        còn link để đóng khung trước. Có link trở lại thì đọc mộ chí `LoiRa` ở `GuideBody.tsx`
        TRƯỚC khi viết dòng JSX đầu tiên: đó là chỗ từng làm trang hướng dẫn trả HTTP 500 suốt ba
        đợt mà không ca kiểm nào thấy.
      */}
      <GuideMuc bai={bai} muc={state.muc} idPrefix="goi-y-" />

      {/*
        ── Nút "Mở toàn trang ↗" ĐANG ẨN TẠM (03/10/2026, theo yêu cầu chủ dự án) ──────────────

        Đây là ẩn TẠM, không phải mộ chí: lối sang trang đầy đủ vẫn còn nguyên và vẫn là lối duy
        nhất để đọc cả bài từ màn tính — chính nút "?" là một `<a href>` thật trỏ tới
        `/huong-dan/cong-thuc/<id>/#<mục>`, nên Ctrl-bấm hay chuột giữa vẫn mở được trang, và
        `verify-static.mjs` vẫn đọc được lối vào ấy trong HTML tĩnh.

        Giữ `guidePath`, `Link`, `t` và lớp `.full` ở chỗ cũ để bật lại chỉ là bỏ dấu chú thích.
        Nếu quyết định bỏ hẳn thì lúc ấy mới gỡ cả bốn thứ và viết mộ chí thật.
      */}
      {HIEN_MO_TOAN_TRANG && (
        <Link className={styles.full} href={guidePath(bai.id)}>
          {t('guide.openFull')}
          <span aria-hidden="true"> ↗</span>
        </Link>
      )}
    </div>
  );
}
