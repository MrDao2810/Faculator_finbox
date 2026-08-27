'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

import styles from './BottomSheet.module.css';

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Dòng phụ dưới tiêu đề, ví dụ ghi rõ nguồn dữ liệu. */
  subtitle?: string;
  children: ReactNode;
  /** Hàng nút dưới cùng, dính đáy khi nội dung dài. */
  footer?: ReactNode;
  className?: string;
  /**
   * Hình dạng của nút thoát — `'close'` (mặc định) là dấu × ở mép phải, `'back'` là mũi tên ‹
   * ở mép TRÁI, trước tiêu đề.
   *
   * Không phải chuyện trang trí: sheet này mở đè lên một sheet khác thì đóng nó là QUAY LẠI chỗ
   * cũ, và người dùng phải đọc được điều đó trước khi bấm. Dấu × ở mép phải hứa "thoát ra màn
   * hình" — bấm xong lại thấy sheet trước hiện lên thì đó là một bất ngờ, dù là bất ngờ dễ chịu.
   * Mũi tên bên trái là quy ước ai cũng đọc được, và vị trí trái/phải tự nó đã nói hướng đi.
   */
  dismiss?: 'close' | 'back';
}

/**
 * Primitive bottom sheet — gói WBS 2.5.
 *
 * Dựng trên `<dialog>` gốc chứ không tự làm modal: trình duyệt cho sẵn bẫy tiêu điểm, phím
 * Esc, lớp nền mờ, và `inert` cho phần trang phía sau. Tự viết lại từng thứ đó vừa tốn dung
 * lượng gói (NFR-PER-04) vừa gần như chắc chắn sót một ca tiếp cận nào đó.
 *
 * Ba màn WF-10, WF-11 và WF-12 đều dùng chung cái vỏ này.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
  dismiss = 'close',
}: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog === null) return;

    // showModal() ném lỗi nếu gọi hai lần, nên phải kiểm trạng thái hiện tại.
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    // Khoá cuộn nền: không có dòng này thì cuộn trong sheet tới cuối là trang phía sau cuộn tiếp.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={[styles.sheet, className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      // Phím Esc: <dialog> tự đóng rồi mới bắn 'cancel'. Chặn hành vi mặc định để trạng thái
      // `open` ở component cha luôn là nguồn sự thật, không bị lệch với DOM.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // Bấm ra ngoài thì đóng. Sự kiện click trên chính <dialog> nghĩa là trúng lớp nền,
      // vì toàn bộ nội dung nằm trong <div> con.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <div className={styles.grabber} aria-hidden="true" />

          {/*
            Nút thoát đứng TRƯỚC tiêu đề ở dạng 'back' và SAU ở dạng 'close' — thứ tự trong DOM
            khớp thứ tự trên màn, nên bàn phím và trình đọc màn hình gặp nó đúng lúc mắt gặp.
            Ép bằng CSS `order` thì hai luồng ấy lệch nhau.
          */}
          {dismiss === 'back' && <DismissButton kind="back" onClick={onClose} />}

          <div className={styles.titles}>
            <h2 className={styles.title} id={titleId}>
              {title}
            </h2>
            {subtitle !== undefined && <p className={styles.subtitle}>{subtitle}</p>}
          </div>

          {dismiss === 'close' && <DismissButton kind="close" onClick={onClose} />}
        </header>

        <div className={styles.body}>{children}</div>

        {footer !== undefined && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
}

/**
 * Nút thoát của sheet, hai dạng.
 *
 * Nhãn cho trình đọc màn hình đổi theo dạng, không chỉ biểu tượng: "Đóng" và "Quay lại" là hai
 * lời hứa khác nhau về việc sắp xảy ra, và người không nhìn thấy mũi tên chỉ có nhãn để dựa vào.
 * Chữ nằm thẳng trong đây, cùng nếp với chuỗi "Đóng" từ trước: primitive không đọc i18n.
 */
function DismissButton({ kind, onClick }: { kind: 'close' | 'back'; onClick: () => void }) {
  const back = kind === 'back';

  return (
    <button
      type="button"
      className={back ? `${styles.close} ${styles.back}` : styles.close}
      onClick={onClick}
    >
      <span className="visually-hidden">{back ? 'Quay lại' : 'Đóng'}</span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {back ? <path d="M15 5l-7 7 7 7" /> : <path d="M6 6l12 12M18 6 6 18" />}
      </svg>
    </button>
  );
}
