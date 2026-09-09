'use client';

import { useRef } from 'react';
import type { ReactNode } from 'react';

import styles from './TabBar.module.css';

export interface TabBarItem<T extends string> {
  value: T;
  label: string;
  /** Số đếm hiện sau nhãn — để người dùng biết tab kia có gì mà không phải bấm sang xem. */
  count?: number;
  /** Icon dựng sẵn, luôn `aria-hidden` ở đây nên tên khả truy cập vẫn là nhãn chữ. */
  icon?: ReactNode;
}

export interface TabBarProps<T extends string> {
  items: ReadonlyArray<TabBarItem<T>>;
  value: T;
  onChange: (value: T) => void;
  /** Tên của cả cụm cho trình đọc màn hình, ví dụ 'Mảng'. */
  label: string;
  /**
   * Tiền tố id — mỗi tab thành `${idBase}-tab-${value}`.
   *
   * Truyền vào chứ KHÔNG gọi `useId()`: vùng nội dung mà cụm này điều khiển nằm ở component
   * khác (nó cần `aria-labelledby` trỏ ngược lại đúng tab đang chọn), nên id phải đoán được từ
   * bên ngoài. Đây cũng là nếp `SweepPicker` đã theo với `Select`.
   */
  idBase: string;
  /** id của vùng nội dung cụm này điều khiển, nếu có. */
  panelId?: string;
  className?: string;
}

/** id của một tab — nơi gọi dựng `aria-labelledby` cho vùng nội dung cũng dùng hàm này. */
export function tabId(idBase: string, value: string): string {
  return `${idBase}-tab-${value}`;
}

/**
 * Primitive thanh tab — một cụm nút chọn MỘT trong nhiều, mỗi lựa chọn đổi cả vùng nội dung dưới nó.
 *
 * ── Vì sao là primitive, không phải hàng chip ─────────────────────────────────────────────────
 *
 * Bộ lọc mảng của WF-02 (Tất cả · Chứng khoán · Cá nhân) trước đây là ba `Chip` rời. Chip là
 * đúng khuôn cho bộ lọc CỘNG DỒN — bấm thêm cái nữa thì lọc chặt hơn — còn ba mảng này loại trừ
 * nhau và mỗi lần bấm là thay hẳn danh sách bên dưới. Đó là tab, và `aria-pressed` của chip nói
 * sai điều đó với trình đọc màn hình: nó đọc ra "nút bật/tắt", không đọc ra "1 trong 3".
 *
 * ── Vì sao dựng primitive thay vì chép cụm tab của màn Danh mục ───────────────────────────────
 *
 * `PortfolioScreen` đã tự dựng một `role="tablist"` bằng tay, và docblock ở đó ghi lý do: *"sản
 * phẩm chưa có primitive tab nào, và đây là chỗ duy nhất cần nó"*. Nay có chỗ thứ hai, nên lý do
 * ấy hết hiệu lực — chép lần nữa là đúng thứ bản rà soát phân cấp gọi tên: *"Tab… lặp lại nhưng
 * chưa đồng nhất giữa các màn"*.
 *
 * Dấu hiệu "đang chọn" lấy nguyên của màn Danh mục (nền `--gradient-highlight`, chữ đảo màu, in
 * đậm) để hai màn nói cùng một thứ tiếng. Riêng CÁCH XẾP thì khác hẳn và cố ý khác: viền bo bốn
 * cạnh của cả cụm, bên trong không kẻ ngăn, nút đang chọn thụt vào bốn phía thành một viên bo
 * góc riêng — chủ dự án chốt từng điều một. Xem docblock của `TabBar.module.css`.
 *
 * Màn Danh mục ĐÃ chuyển sang primitive này (việc kế tiếp mà đoạn trên từng hẹn). Hai thứ khiến
 * nó bị hoãn lại một đợt đều giải quyết được ở phía NƠI GỌI, không phải ở đây: `scrollIntoView`
 * neo vào một `<div>` bọc ngoài, còn hai vùng nội dung riêng thì gộp về một id chung — chúng vốn
 * dựng có điều kiện nên chỉ một cái nằm trong DOM tại một thời điểm, và bản cũ luôn có một tab trỏ
 * `aria-controls` vào id không tồn tại.
 *
 * ── Bàn phím ─────────────────────────────────────────────────────────────────────────────────
 *
 * Roving tabindex đúng khuôn WAI-ARIA: cả cụm chỉ chiếm MỘT nấc Tab, rồi ←/→/Home/End chạy giữa
 * các tab. Đây là thứ hàng chip cũ không có và cụm tab dựng tay ở màn Danh mục cũng chưa có —
 * ở đó mỗi tab là một nấc Tab riêng.
 */
export function TabBar<T extends string>({
  items,
  value,
  onChange,
  label,
  idBase,
  panelId,
  className,
}: TabBarProps<T>) {
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const classes = [styles.tabs, className].filter(Boolean).join(' ');

  function moveTo(index: number) {
    const item = items[index];
    if (item === undefined) return;
    onChange(item.value);
    // Chọn tới đâu thì tiêu điểm theo tới đó — nếu không, phím mũi tên tiếp theo lại tính từ tab cũ.
    buttons.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const here = items.findIndex((item) => item.value === value);
    if (here < 0 || items.length === 0) return;

    const next =
      event.key === 'ArrowRight'
        ? (here + 1) % items.length
        : event.key === 'ArrowLeft'
          ? (here - 1 + items.length) % items.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? items.length - 1
              : null;

    if (next === null) return;
    // Chặn mặc định: ←/→ trong vùng cuộn ngang, Home/End nhảy đầu/cuối trang.
    event.preventDefault();
    moveTo(next);
  }

  return (
    <div className={classes} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            id={tabId(idBase, item.value)}
            aria-selected={selected}
            aria-controls={panelId}
            /* Roving tabindex: chỉ tab đang chọn nhận được Tab từ bàn phím. */
            tabIndex={selected ? 0 : -1}
            ref={(node) => {
              buttons.current[index] = node;
            }}
            className={selected ? `${styles.tab} ${styles.active}` : styles.tab}
            onClick={() => {
              onChange(item.value);
            }}
          >
            {item.icon !== undefined && (
              <span className={styles.icon} aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span>{item.label}</span>
            {/*
              `{' '}` là BẮT BUỘC, không phải thói quen định dạng: khoảng cách nhìn thấy do
              `gap` của flex dựng, mà `gap` không sinh ký tự nào. Thiếu nó thì tên khả truy cập
              dính liền thành 'Tất cả111' — một ca kiểm ở đây canh đúng chuyện này.
            */}
            {item.count !== undefined && (
              <>
                {' '}
                <span className={styles.count}>{item.count}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
