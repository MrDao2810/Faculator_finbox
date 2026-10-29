'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  guidePath,
  nhanCoKyHieu,
  type BaiHuongDan,
  type FormulaSpec,
  type HinhDangXem,
  type MucId,
  type ONhapHuongDan,
} from '@/application';
import { usePick, usePreferences, useT } from '@/application/preferences-context';
import { GuideMuc } from '@/ui/guide/GuideBody';

import { HowToPanel } from './HowToPanel';
import type { NotationView } from './notation-types';
import { placePanel } from './place-panel';
import { useHowToPanel } from './use-how-to-panel';
import { anchorBox, usePanelPlacement, viewportBounds } from './use-panel-placement';
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

/**
 * Khung "?" tự cuộn: cuộn thì tên ô trôi theo, khung chú thích phải đặt lại. Hàm cấp module, vì
 * `usePanelPlacement` để nó trong danh sách phụ thuộc.
 */
function chinhKhung(khung: HTMLDivElement): Element {
  return khung;
}

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
  /**
   * Hình đang hiện ở khối Biểu đồ — `null` khi khối ấy chưa kịp báo (chunk biểu đồ nạp trễ).
   *
   * Chỉ mục "Đọc biểu đồ" đọc nó, để in đúng MỘT hình ở đúng dạng đang chọn thay vì mọi hình của
   * công thức (13/10/2026 — chủ dự án: *"ô hướng dẫn sử dụng đang rất dài … sau khi lựa chọn … thì
   * mới hiển thị"*). Luôn truyền, kể cả khi khung đang mở mục khác: `GuideMuc` tự bỏ qua, còn nơi
   * gọi thì khỏi phải biết mục nào cần gì.
   */
  hinh: HinhDangXem | null;
  /**
   * Bộ số đang có trong các ô của màn tính — kể cả số nạp từ mã và số chảy từ công thức khác.
   *
   * Chỉ mục "Lấy số liệu ở đâu" đọc nó, để câu minh hoạ nói đúng số người dùng đang nhìn chứ không
   * nói số mặc định (14/10/2026 — chủ dự án chụp thanh trượt ở 55 phiên bên dưới câu "60 phiên là
   * khoảng ba tháng"). Cùng nếp với `hinh`: luôn truyền, mục nào không cần thì bỏ qua.
   */
  giaTri: Readonly<Record<string, number>>;
  /** Công thức của màn: tên các ô (để cắt quanh phần ký hiệu) và bảng ký hiệu (nghĩa của từng dòng). */
  spec: FormulaSpec;
  /** Đúng `notation` của thẻ Công thức — khung chú thích dùng lại hình ký hiệu và các bước tính của nó. */
  notation: NotationView;
}

/**
 * ── Phần ký hiệu trong tên ô mở khung chú thích (28/10/2026) ─────────────────────────────────
 *
 * Chủ dự án khoanh '(TSNH)' và '(N)' trong mục "Lấy số liệu ở đâu" của `ncav-tren-co-phieu`: _"khi
 * hover vào thì cần chuyển con trỏ chuột thành bàn tay và hiện thêm popup mới chú thích chứ không
 * phải sáng phần trước"_. Bản đầu cùng ngày tô ký hiệu của ô ở thẻ Công thức khi rê vào cả hàng;
 * nay phần ký hiệu của tên ô là một nút, rê vào (hay chạm, Enter) thì mở ĐÚNG khung chú thích của
 * thẻ — "ký hiệu: nghĩa", các bước tính và liên kết sang công thức nguồn nếu dòng ấy có.
 *
 * Dùng lại chứ không chép, cùng nếp `QuizFormulaPicture`: `useHowToPanel` (rê mở sau một nhịp, rời
 * thì tắt, bấm/chạm thì ghim, Esc và chạm ra ngoài thì đóng), `usePanelPlacement` và `HowToPanel`.
 * Khác đúng một chỗ: khung chú thích `position: fixed` theo khung nhìn (`coDinh`), vì khung "?" tự
 * cuộn và cắt mọi khung `absolute` bên trong nó.
 *
 * Gốc của khung "?" là "thẻ" của `useHowToPanel` (`cardRef`): bộ nghe con trỏ gắn ở đó, và khung chú
 * thích dựng NGAY SAU nút trong `<dt>` — vẫn là con cháu của gốc, nên bấm vào khung chú thích (hay
 * liên kết trong nó) không bị khung "?" coi là bấm ra ngoài, và Tab đi từ nút thẳng vào liên kết.
 */
export function GuideHintPanel({
  bai,
  state,
  onClose,
  id,
  hinh,
  giaTri,
  spec,
  notation,
}: GuideHintPanelProps) {
  const t = useT();
  const pick = usePick();
  const { locale } = usePreferences();

  /*
   * Điểm chạm đánh số theo HÀNG của mục, không theo dòng bảng ký hiệu: trong khung này `data-sym` của
   * nút là số thứ tự hàng. Mỗi nút nhờ thế là một điều khiển riêng — hai ô trỏ cùng một dòng bảng thì
   * `aria-expanded` của nút này không bật theo nút kia, và khung mở cạnh đúng nút vừa chạm.
   */
  const oNhap = bai.rieng?.oNhap;
  const diemCham = useMemo(
    () => (oNhap ?? []).map((o) => nhanCoKyHieu(spec, o.key)),
    [oNhap, spec],
  );
  const hangCua = useMemo(() => new Map((oNhap ?? []).map((o, hang) => [o.key, hang])), [oNhap]);
  const coDiemCham = useCallback((hang: number) => (diemCham[hang] ?? null) !== null, [diemCham]);
  const howToBySym = useMemo(
    () => new Map(notation.howTo.map((howTo) => [howTo.sym, howTo])),
    [notation.howTo],
  );

  const {
    state: chuThich,
    cardRef: panelRef,
    panelRef: chuThichRef,
    anchorRef,
    pointRef,
    handlers,
  } = useHowToPanel(coDiemCham, locale);
  const choChuThich = usePanelPlacement(
    chuThich,
    { cardRef: panelRef, panelRef: chuThichRef, anchorRef, pointRef },
    chinhKhung,
    true,
  );

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
    /*
     * `hinh` nằm trong danh sách phụ thuộc dù thân effect không đọc nó: đổi hình là đổi CHỮ trong
     * khung, tức đổi chiều cao khung, nên phải đo và đặt lại. Bấm chuột vào ô chọn hay nút Đường/Cột
     * thì khung đã đóng trước (bấm ra ngoài), nhưng đi bằng bàn phím thì khung vẫn mở trong lúc hình
     * bên dưới đổi. `giaTri` cùng lẽ: đổi số trong ô là đổi độ dài câu "… phiên là khoảng …".
     */
  }, [state, onClose, hinh, giaTri, panelRef]);

  /*
   * Esc đóng, và bấm ra ngoài đóng — hai lối thoát quen thuộc của mọi khung nổi trong sản phẩm.
   *
   * Khung chú thích của một ký hiệu đang mở thì Esc chỉ đóng KHUNG ẤY (bộ nghe của `useHowToPanel`
   * lo, rồi trả tiêu điểm về nút ký hiệu); lần Esc sau mới đóng khung này. Bộ nghe ở đây gắn pha
   * BẮT (`capture`) để luôn chạy TRƯỚC bộ nghe của khung chú thích, khi khung ấy chắc chắn còn mở:
   * cả hai cùng nằm ở `document`, và ở pha nổi thì thứ tự theo lần gắn — đổi mỗi lần khung chú
   * thích mở hay đóng, vì effect này gắn lại theo `chuThich`.
   */
  useEffect(() => {
    const phim = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || chuThich !== null) return;
      onClose();
    };
    const ngoai = (e: MouseEvent) => {
      const panel = panelRef.current;
      if (panel === null) return;
      const dich = e.target;
      if (dich instanceof Node && (panel.contains(dich) || state.anchor.contains(dich))) return;
      onClose();
    };
    document.addEventListener('keydown', phim, true);
    document.addEventListener('pointerdown', ngoai);
    return () => {
      document.removeEventListener('keydown', phim, true);
      document.removeEventListener('pointerdown', ngoai);
    };
  }, [state, onClose, chuThich, panelRef]);

  /** Tên ô ở mục "Lấy số liệu ở đâu": phần ký hiệu là nút mở khung chú thích, phần còn lại chữ trơn. */
  const nhanO = (o: ONhapHuongDan): ReactNode => {
    const hang = hangCua.get(o.key) ?? -1;
    const nhan = diemCham[hang] ?? null;
    const symbol = nhan === null ? undefined : spec.symbols?.[nhan.sym];
    if (nhan === null || symbol === undefined) return pick(o.nhan);

    // Cùng luật chọn ngôn ngữ của `pick()`: tên tiếng Anh rỗng thì in tiếng Việt.
    const khuc = locale === 'en' && o.nhan.en.trim() !== '' ? nhan.en : nhan.vi;
    const mo = chuThich?.sym === hang;
    const idChuThich = `${id}-ky-hieu-${String(hang)}`;
    return (
      <>
        {/* Một khối chữ: `<dt>` là hàng flex, tách ba khúc ra ba con thì giữa chúng thành ba khe 8px. */}
        <span>
          {khuc.truoc}
          <button
            type="button"
            className={styles.kyHieu}
            data-sym={hang}
            aria-expanded={mo}
            {...(mo ? { 'aria-controls': idChuThich } : {})}
          >
            {khuc.kyHieu}
          </button>
          {khuc.sau}
        </span>
        {mo && (
          <HowToPanel
            id={idChuThich}
            // Dòng không có bước tính: khung chỉ có "ký hiệu: nghĩa", như ở thẻ Công thức.
            howTo={howToBySym.get(nhan.sym) ?? { sym: nhan.sym, kind: 'defined', steps: [] }}
            symbolHtml={notation.symbolsHtml[nhan.sym] ?? ''}
            meaning={pick(symbol.meaning)}
            placement={choChuThich}
            panelRef={chuThichRef}
            coDinh
          />
        )}
      </>
    );
  };

  return (
    <div
      ref={panelRef}
      id={id}
      className={styles.panel}
      role="dialog"
      aria-label={t('guide.howToUse')}
      onPointerOver={handlers.onPointerOver}
      onPointerOut={handlers.onPointerOut}
      onClick={handlers.onClick}
      onBlur={handlers.onBlur}
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
      <GuideMuc
        bai={bai}
        muc={state.muc}
        idPrefix="goi-y-"
        hinh={hinh}
        giaTri={giaTri}
        nhanO={nhanO}
      />

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
