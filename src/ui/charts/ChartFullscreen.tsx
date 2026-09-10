'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import type { DrawableChart } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import { ApplyHint } from './ApplyHint';
import { LineChart } from './LineChart';
import { WaterfallChart } from './WaterfallChart';
import styles from './chart.module.css';

/**
 * Xem biểu đồ toàn màn hình.
 *
 * ── Lớp phủ `<dialog>` là cơ chế DUY NHẤT. Fullscreen API đã bị gỡ ─────────────────────────────
 *
 * Bản trước gọi thêm `document.documentElement.requestFullscreen()` rồi `orientation.lock()` như
 * "phần thêm best-effort". Nó hỏng thật, và tính năng đã phải TẮT sau buổi tự thử của chủ dự án:
 * trên điện thoại, bấm nút thì máy xoay ngang mà lớp phủ không nổi lên — bấm xong không thấy gì
 * xảy ra.
 *
 * Nguyên nhân: `<dialog>` modal và phần tử fullscreen dùng CHUNG lớp trên cùng (top layer) của
 * trình duyệt. Xin fullscreen cho `<html>` là đẩy chính tổ tiên của dialog lên trên nó, và dialog
 * biến mất khỏi tầm nhìn dù vẫn đang mở. Đó không phải một "phần thêm hỏng thì thôi" — nó phá đúng
 * cơ chế chính.
 *
 * Nên nay chỉ còn `<dialog>` phủ kín khung nhìn (`inset: 0`), chạy ở mọi máy, kể cả Safari iPhone —
 * nơi `requestFullscreen` vốn không dùng được cho phần tử thường. Không xin fullscreen, không khoá
 * xoay: câu nhờ người dùng tự xoay ngang vẫn còn, và nay nó luôn đúng chứ không phải chỉ đúng khi
 * khoá xoay thất bại.
 *
 * Dùng `<dialog>` gốc thay vì tự dựng modal, đúng lý do đã ghi ở `BottomSheet`: có sẵn bẫy tiêu
 * điểm, phím Esc, `inert` cho phần trang phía sau, và không tốn thêm dung lượng gói.
 */

export interface ChartFullscreenProps {
  open: boolean;
  onClose: () => void;
  model: DrawableChart;
  /**
   * Gốc để ghép `id` của tiêu đề và của `<pattern>` bên trong hình.
   *
   * Phải KHÁC gốc của bản trên trang: hai bản cùng nằm trong DOM khi lớp phủ đang mở. `ChartBody`
   * là chỗ gắn hậu tố phân biệt.
   */
  idBase: string;
  /**
   * Ô chọn trục X, bày lại trong màn phóng to.
   *
   * Có mặt ở đây là cố ý: đổi trục là việc người ta muốn làm NGAY khi đang xem kỹ, và bắt thoát ra
   * rồi đổi rồi phóng to lại là ba bước cho một ý.
   */
  controls?: ReactNode;
  /**
   * Chuyển thẳng xuống `LineChart` — nhả tay tại một điểm đang dò ghi giá trị đó vào ô Số liệu.
   *
   * `<LineChart>` ở đây là instance THỨ HAI, độc lập với bản trên trang (`ChartBody` dựng bản
   * trên trang riêng, không đi qua component này) — thiếu prop này thì tính năng chỉ hoạt động ở
   * biểu đồ nhỏ, câm lặng ở màn phóng to.
   */
  onApplyPoint?: (key: string, value: number) => void;
  /**
   * Có dựng dòng "trục đang là thời gian nên bấm không ghi được gì" không.
   *
   * `ChartBody` tính một lần rồi truyền cả hai bản, để logic "khi nào nói" chỉ sống ở một chỗ —
   * bản phóng to và bản trên trang nói khác nhau là người dùng đọc ra hai sự thật về cùng một hình.
   */
  axisHint?: boolean;
  /**
   * Lối vẽ chuỗi chính, chuyển thẳng xuống `LineChart`.
   *
   * `ChartBody` giữ state và truyền cho cả hai bản: bản trên trang đang là cột mà bản phóng to ra
   * đường thì người dùng bấm phóng to xong thấy một hình khác hẳn hình họ vừa xem.
   */
  variant?: 'line' | 'bar';
}

/**
 * Khoá đánh dấu mục lịch sử do lớp phủ này đẩy vào.
 *
 * Đặt tên có tiền tố sản phẩm vì `history.state` là không gian tên DÙNG CHUNG với App Router của
 * Next: một khoá trơn kiểu `zoom` có ngày đụng thứ khác đang ở đó.
 */
const HISTORY_MARKER = 'ffbChartZoom';

/** Máy có đang để dọc hay không. `null` là chưa biết — chưa mở nên chưa hỏi. */
function usePortrait(active: boolean): boolean | null {
  const [portrait, setPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    if (!active) {
      setPortrait(null);
      return;
    }
    /*
     * Hỏi trong effect chứ không lúc render: `matchMedia` không tồn tại lúc dựng HTML tĩnh, và đọc
     * nó trong thân component là một đường lệch hydration — cùng bài học đã ghi ở `PreferencesProvider`.
     */
    if (typeof window.matchMedia !== 'function') {
      setPortrait(false);
      return;
    }

    const query = window.matchMedia('(orientation: portrait)');
    setPortrait(query.matches);

    const onChange = (event: MediaQueryListEvent) => {
      setPortrait(event.matches);
    };
    query.addEventListener('change', onChange);
    return () => {
      query.removeEventListener('change', onChange);
    };
  }, [active]);

  return portrait;
}

export function ChartFullscreen({
  open,
  onClose,
  model,
  idBase,
  controls,
  onApplyPoint,
  axisHint = false,
  variant = 'line',
}: ChartFullscreenProps) {
  const t = useT();
  const pick = usePick();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${idBase}-title`;

  const portrait = usePortrait(open);

  /*
   * `onClose` là arrow dựng mới mỗi lượt render ở `ChartBody`. Đưa thẳng vào deps của effect lịch
   * sử bên dưới là effect chạy lại mỗi lượt render — tức đẩy THÊM MỘT mục lịch sử mỗi lượt render.
   * Ref giữ tham chiếu mới nhất mà không kéo theo phụ thuộc.
   *
   * Cố ý KHÔNG bắt `ChartBody` bọc `useCallback`: làm thế là đẩy bất biến sang mọi người gọi sau
   * này. Component tự phòng thân, đúng nếp đã dùng ở `usePortrait` phía trên.
   */
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;

    // showModal() ném lỗi nếu gọi khi đang mở, nên phải kiểm trạng thái hiện tại.
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Khoá cuộn nền: thiếu dòng này thì cuộn hết lớp phủ là trang phía sau cuộn tiếp.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /*
   * ── Nút Back của hệ thống phải ĐÓNG LỚP PHỦ, không phải rời trang ────────────────────────────
   *
   * `<dialog>` không có liên kết nào với lịch sử duyệt. Trên Android, khi đang phóng to mà bấm
   * Back thì trình duyệt đi thẳng bước điều hướng: người dùng rời `/cong-thuc/pe/` về
   * `/cong-thuc/` và MẤT HẾT số vừa gõ. Đo được trên giả lập Pixel 7: gõ 77777 vào ô nhập, phóng
   * to, bấm Back — về danh sách, ô nhập trống. Lớp phủ "đóng" chỉ vì cả trang bị tháo.
   *
   * Cách vá: mở lớp phủ thì đẩy một mục lịch sử, nghe `popstate` để đóng, và khi đóng bằng nút X
   * hay phím Esc thì tự gỡ mục ấy đi để không để rác lại.
   *
   * Ghi chú cũ ở đây nói cú Back đầu tiên bị Chrome ăn mất để thoát fullscreen, nên lớp phủ không
   * đóng ngay. Điều đó KHÔNG còn đúng từ khi bỏ hẳn lời gọi fullscreen: nay chỉ còn một mục lịch sử
   * do chính effect này đẩy vào, và cú Back đầu tiên rơi thẳng vào `popstate` bên dưới.
   */
  useEffect(() => {
    if (!open) return;

    /*
     * Biến cục bộ của effect, KHÔNG phải ref: vòng đời của nó đúng bằng vòng đời MỘT lần mở, nên
     * giá trị cũ không thể rò sang lần mở sau. Ref thì rò.
     */
    let mine = true;

    /*
     * Trộn state cũ vào chứ không đẩy object trơn: App Router của Next vá `pushState` và giữ cây
     * route trong `history.state`. Ghi đè nó là lúc Back về router dựng lại sai nhánh.
     *
     * KHÔNG truyền tham số url thứ ba. Cùng URL thì `popstate` là điều hướng same-route, trang
     * không dựng lại, và số người dùng vừa gõ còn nguyên — đó là toàn bộ mục đích của bản vá này.
     */
    window.history.pushState({ ...window.history.state, [HISTORY_MARKER]: true }, '');

    const onPopState = () => {
      // Mục của ta vừa bị gỡ khỏi lịch sử — tuyệt đối không gọi `history.back()` ở hàm dọn nữa,
      // gọi là lùi thêm một bước THẬT và người dùng rời trang đúng thứ bản vá này đang chặn.
      mine = false;
      closeRef.current();
    };
    window.addEventListener('popstate', onPopState);

    return () => {
      window.removeEventListener('popstate', onPopState);
      const state: unknown = window.history.state;
      /*
       * Đóng bằng nút X hoặc phím Esc: mục đẩy vào vẫn còn, tự gỡ đi.
       *
       * Đọc lại `history.state` khiến hàm dọn AN TOÀN KHI CHẠY HAI LẦN — `reactStrictMode` đang
       * bật (`next.config.mjs`) nên ở chế độ dev React gọi effect → dọn → effect, mà
       * `history.back()` là bất đồng bộ; thiếu phép kiểm này thì lượt dọn thứ hai lùi thêm một
       * bước không phải của mình.
       */
      const marked =
        typeof state === 'object' &&
        state !== null &&
        (state as Record<string, unknown>)[HISTORY_MARKER] === true;
      if (mine && marked) window.history.back();
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={styles.full}
      aria-labelledby={titleId}
      // Phím Esc: <dialog> tự đóng rồi mới bắn 'cancel'. Chặn mặc định để `open` ở component cha
      // luôn là nguồn sự thật, không lệch với DOM.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      {/*
        Chỉ dựng nội dung khi đang mở. Biểu đồ phóng to là bản thứ HAI của cùng một hình, nên để nó
        nằm sẵn trong DOM là nhân đôi số thẻ SVG của mọi trang chi tiết mà không ai xem.
      */}
      {open && (
        <div className={styles.fullPanel}>
          <header className={styles.fullHeader}>
            <h2 className={styles.fullTitle} id={titleId}>
              {pick(model.title)}
            </h2>
            <button type="button" className={styles.fullClose} onClick={onClose}>
              <span className="visually-hidden">{t('chart.exit')}</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </header>

          {/*
            `size="wide"` ép khổ khung rộng, KHÔNG để hook tự đo: lớp phủ chiếm trọn màn ở mọi bề
            ngang, kể cả điện thoại đang xoay ngang — nơi hook vẫn trả `'compact'` vì mốc 768px tính
            cho biểu đồ nằm trong dòng chảy trang, không cho một lớp phủ toàn màn.
          */}
          {model.kind === 'waterfall' ? (
            <WaterfallChart model={model} idBase={idBase} fill size="wide" />
          ) : (
            <LineChart
              model={model}
              idBase={idBase}
              fill
              size="wide"
              variant={variant}
              onApplyPoint={onApplyPoint}
            />
          )}

          <div className={styles.fullFoot}>
            {controls}
            <p className={styles.fullSummary}>{pick(model.summary)}</p>
            {model.note !== undefined && (
              <p className={styles.note} role="note">
                {pick(model.note)}
              </p>
            )}
            {axisHint && <ApplyHint />}
            {/*
              Câu nhờ xoay chỉ hiện khi máy ĐANG dọc; người dùng xoay thật thì `portrait` thành
              false và câu tự biến mất.

              Nay in CẢ hai vế, không còn nhánh `locked`. Từ khi bỏ `orientation.lock()`, sản phẩm
              không bao giờ tự xoay được máy nữa — nên lời nhắc "máy đang khoá xoay thì bật lại"
              luôn đúng, chứ không chỉ đúng ở nhánh khoá thất bại.
            */}
            {portrait === true && (
              <p className={styles.fullRotate} role="status">
                {t('chart.rotate')} {t('chart.rotateUnlock')}
              </p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
