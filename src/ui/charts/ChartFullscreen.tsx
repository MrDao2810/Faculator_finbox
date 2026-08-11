'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';

import { t } from '@/application';
import type { LineChart as LineChartModel } from '@/application';

import { LineChart } from './LineChart';
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
  model: LineChartModel;
  /**
   * Ô chọn trục X, bày lại trong màn phóng to.
   *
   * Có mặt ở đây là cố ý: đổi trục là việc người ta muốn làm NGAY khi đang xem kỹ, và bắt thoát ra
   * rồi đổi rồi phóng to lại là ba bước cho một ý.
   */
  controls?: ReactNode;
}

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

export function ChartFullscreen({ open, onClose, model, controls }: ChartFullscreenProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  /** Khoá xoay đã ăn hay chưa — quyết định có phải nhờ người dùng xoay tay không. */
  const [locked, setLocked] = useState(false);
  const portrait = usePortrait(open);

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
              {model.title}
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

          <LineChart model={model} fill />

          <div className={styles.fullFoot}>
            {controls}
            <p className={styles.fullSummary}>{model.summary}</p>
            {model.note !== undefined && (
              <p className={styles.note} role="note">
                {model.note}
              </p>
            )}
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
