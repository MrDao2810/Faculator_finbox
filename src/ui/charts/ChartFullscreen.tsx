'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

import type { DrawableChart } from '@/application';
import { useT, usePick } from '@/application/preferences-context';

import { LineChart } from './LineChart';
import { WaterfallChart } from './WaterfallChart';
import styles from './chart.module.css';

/**
 * Xem biểu đồ toàn màn hình — phóng to và xoay ngang.
 *
 * ── Vì sao lớp phủ `<dialog>` là cơ chế CHÍNH, còn Fullscreen API chỉ là phần thêm ─────────────
 *
 * Cách hiển nhiên là gọi `element.requestFullscreen()`. Nhưng **Safari trên iPhone không hỗ trợ
 * `requestFullscreen` cho phần tử thường** — chỉ `<video>` mới vào được toàn màn hình. Nếu dựa vào
 * nó thì nút này chết hẳn trên iPhone, mà đó là phần lớn người dùng Việt Nam.
 *
 * Nên cơ chế chính là một `<dialog>` phủ kín khung nhìn (`inset: 0`), chạy ở mọi máy. Fullscreen API
 * và khoá xoay là **phần thêm best-effort**: chạy được thì ẩn luôn thanh địa chỉ và tự xoay ngang;
 * không chạy được thì lớp phủ vẫn đầy màn và người dùng nhận đúng câu nhờ xoay tay. Không nhánh nào
 * là ngõ cụt.
 *
 * `screen.orientation.lock()` cũng vậy: Chrome trên Android đòi phải đang ở fullscreen mới cho khoá,
 * còn iOS không có API này. Thứ tự trong effect là fullscreen trước, khoá xoay sau, và cả hai đều bọc
 * `catch` — một lời hứa bị từ chối ở đây không được làm sập cả biểu đồ.
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
   * Trục hiện không áp dụng được (đang xem theo thời gian) nhưng có biến khác đổi sang được — hiện
   * gợi ý ngay dưới hình. `ChartBody` tính điều kiện này một lần rồi truyền cả hai bản, để logic
   * "khi nào nói" chỉ sống ở một chỗ.
   */
  showApplyHint?: boolean;
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
  showApplyHint = false,
}: ChartFullscreenProps) {
  const t = useT();
  const pick = usePick();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `${idBase}-title`;

  /** Khoá xoay đã ăn hay chưa — quyết định có phải nhờ người dùng xoay tay không. */
  const [locked, setLocked] = useState(false);
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
   * Chưa kiểm được, cần máy Android THẬT: Chrome ăn cú Back đầu tiên để thoát fullscreen trước,
   * nên lần đầu người dùng có thể thấy thanh trạng thái quay lại mà lớp phủ vẫn nguyên. Cách bù
   * hiển nhiên là nghe `fullscreenchange` rồi đóng lớp phủ khi `fullscreenElement` thành null —
   * nhưng giả lập không tái tạo được lớp ấy, nên đó sẽ là vá mù. Để nguyên, ghi lại ở TASK.md.
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

  useEffect(() => {
    if (!open) return;

    let alive = true;

    void (async () => {
      try {
        if (typeof document.documentElement.requestFullscreen === 'function') {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // iPhone và mọi ca mất quyền từ cử chỉ người dùng rơi vào đây — lớp phủ vẫn đầy màn.
      }

      try {
        const orientation = window.screen?.orientation as
          | (ScreenOrientation & { lock?: (value: string) => Promise<void> })
          | undefined;
        if (orientation?.lock !== undefined) {
          await orientation.lock('landscape');
          if (alive) setLocked(true);
        }
      } catch {
        // Không khoá được thì nhờ người dùng xoay tay — câu nhắc ngay dưới hình.
      }
    })();

    /*
     * Dọn phải tự phòng thân: `screen.orientation`, `fullscreenElement` và `exitFullscreen` đều là
     * thứ có thể KHÔNG tồn tại — jsdom không có cái nào, iPhone không có khoá xoay. Đọc thẳng rồi gọi
     * là ném `TypeError` ngay trong hàm dọn của effect, mà lỗi ở đó React không hứng, nên cả màn
     * trắng chỉ vì một cú đóng biểu đồ.
     */
    return () => {
      alive = false;
      setLocked(false);
      try {
        window.screen?.orientation?.unlock?.();
      } catch {
        // Chưa khoá thì unlock cũng vô hại; không có gì để xử.
      }
      if (typeof document.exitFullscreen === 'function' && document.fullscreenElement !== null) {
        void document.exitFullscreen().catch(() => undefined);
      }
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

          {model.kind === 'waterfall' ? (
            <WaterfallChart model={model} idBase={idBase} fill />
          ) : (
            <LineChart model={model} idBase={idBase} fill onApplyPoint={onApplyPoint} />
          )}

          <div className={styles.fullFoot}>
            {controls}
            <p className={styles.fullSummary}>{pick(model.summary)}</p>
            {model.note !== undefined && (
              <p className={styles.note} role="note">
                {pick(model.note)}
              </p>
            )}
            {showApplyHint && <p className={styles.applyHint}>{t('chart.applyHintTimeAxis')}</p>}
            {/*
              Câu nhờ xoay chỉ hiện khi máy ĐANG dọc. Khoá xoay ăn thì trình duyệt tự xoay sang ngang,
              `portrait` thành false và câu tự biến mất — một điều kiện lo cả hai nhánh.
            */}
            {portrait === true && (
              <p className={styles.fullRotate} role="status">
                {t('chart.rotate')}
                {!locked && ` ${t('chart.rotateUnlock')}`}
              </p>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
