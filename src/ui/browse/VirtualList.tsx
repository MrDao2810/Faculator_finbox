'use client';

import { useCallback, useEffect, useLayoutEffect, useReducer, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import { shouldVirtualize, windowRange } from '@/application';

import styles from './VirtualList.module.css';

export interface VirtualListProps<T> {
  items: ReadonlyArray<T>;
  /** Khoá ổn định của một mục — dùng cho `key` của React và cho kho số đo. */
  itemKey: (item: T) => string;
  children: (item: T) => ReactNode;
  /**
   * Chiều cao ước lượng cho dòng CHƯA từng đo, px.
   *
   * 122 là chiều cao hay gặp nhất khi đo 107 thẻ công thức ở khổ 390px (67 / 107 thẻ). Chỉ là
   * điểm xuất phát: đo được dòng nào thì dùng số thật của dòng ấy, và dòng chưa đo lấy trung
   * bình các dòng đã đo.
   */
  estimatedRowHeight?: number;
  /** Nhãn cho trình đọc màn hình. */
  label?: string;
}

/**
 * Danh sách ảo hoá — gói WBS 3.1.2, phần "ảo hoá danh sách 107 mục".
 *
 * Ba quyết định đáng ghi:
 *
 * 1. **Cuộn theo cả trang, không tạo khung cuộn lồng.** Khung cuộn trong khung cuộn trên điện
 *    thoại rất khó dùng và đi ngược NFR-USA-02. Ở đây nghe `window.scroll` rồi tự tính phần
 *    danh sách đang lọt vào tầm nhìn.
 * 2. **Chỉ ảo hoá khi vượt ngưỡng.** Dưới 40 mục thì dựng thẳng.
 * 3. **Dòng cao bao nhiêu thì để nó cao bấy nhiêu.** Xem mục dưới — đây là chỗ hai bản trước
 *    đều sai.
 *
 * Phần toán nằm ở `windowRange()` bên tầng Domain và có test riêng; ở đây chỉ còn phần DOM.
 *
 * ## Vì sao không còn ép chiều cao dòng
 *
 * Bản đầu ép `height: 84px` cho mọi dòng, nên phép đo `offsetHeight` luôn trả về đúng 84 — đo
 * vòng tròn. Bản sau thêm một dòng DÒ dựng với chiều cao tự nhiên để đo, rồi lấy con số ấy ép
 * cho MỌI dòng. Vẫn sai, chỉ là sai kín hơn: đo 107 thẻ thật ở khổ 390px ra **sáu** chiều cao
 * khác nhau (102 · 122 · 141 · 152 · 171 · 194 px) vì tên công thức dài ngắn khác nhau. Dòng
 * dò đo trúng một thẻ 122px rồi ép cả danh sách, nên thẻ 194px bị `overflow: hidden` cắt mất
 * 72px — chữ tràn đè lên thẻ bên cạnh — và tổng chiều cao thiếu gần 5 000px nên cuộn tới
 * "đáy" mà danh sách chưa hết.
 *
 * Nay mỗi dòng giữ chiều cao tự nhiên và được ĐO RIÊNG khi nó có mặt trong DOM. Số đo giữ
 * theo khoá của mục nên còn nguyên khi người dùng đổi bộ lọc rồi quay lại. Dòng chưa từng
 * hiện thì tạm lấy trung bình các dòng đã đo — sai một chút ở hai khối đệm, và tự đúng dần
 * khi cuộn qua; sai kiểu này KHÔNG cắt chữ, khác hẳn kiểu cũ.
 *
 * ## Vì sao chỉ đặt lại state khi CỬA SỔ đổi
 *
 * Bản trước gọi `setScrollTop` ở mọi sự kiện cuộn, nên React dựng lại cả danh sách mấy chục
 * lần mỗi giây dù không dòng nào ra vào tầm nhìn. Đo ở CPU chậm 4×: khung hình trung vị khi
 * cuộn là 27,7 ms (khoảng 36 hình/giây) so với 10,0 ms khi không ảo hoá — tức ảo hoá đang làm
 * việc cuộn TỆ ĐI. Nay so cửa sổ cũ với cửa sổ mới trước, giống nhau thì trả về đúng giá trị
 * cũ để React bỏ qua lượt dựng.
 */
export function VirtualList<T>({
  items,
  itemKey,
  children,
  estimatedRowHeight = 122,
  label,
}: VirtualListProps<T>) {
  const listRef = useRef<HTMLUListElement>(null);

  /** Chiều cao thật đã đo, theo khoá mục — sống qua các lần đổi bộ lọc. */
  const measured = useRef(new Map<string, number>());
  /** Node đang gắn của các dòng đang hiện, để đo sau mỗi lượt dựng. */
  const rowNodes = useRef(new Map<string, HTMLLIElement>());
  /** Tăng lên mỗi khi có số đo mới, chỉ để bắt React dựng lại. */
  const [, remeasured] = useReducer((n: number) => n + 1, 0);

  const [scrollTop, setScrollTop] = useState(0);
  // Giá trị khởi tạo phải giống hệt giữa lúc build và lúc chạy, nếu không lệch hydration —
  // bản build là HTML tĩnh. Đọc chiều cao thật ở useEffect, không đọc lúc khởi tạo state.
  const [viewportHeight, setViewportHeight] = useState(900);

  const virtual = shouldVirtualize(items.length);

  /** Trung bình các dòng đã đo — ước lượng tốt hơn hẳn một hằng số cho dòng chưa hiện bao giờ. */
  const known = [...measured.current.values()];
  const estimate =
    known.length > 0 ? known.reduce((sum, h) => sum + h, 0) / known.length : estimatedRowHeight;

  const heights = items.map((item) => measured.current.get(itemKey(item)) ?? estimate);

  /* Ảnh chụp cho hàm nghe cuộn: nó chạy ngoài lượt dựng nên không đọc được biến của lượt này. */
  const heightsRef = useRef(heights);
  heightsRef.current = heights;
  const viewportRef = useRef(viewportHeight);
  viewportRef.current = viewportHeight;

  /*
   * Đo mọi dòng đang có mặt, sau mỗi lượt dựng. Không có mảng phụ thuộc là cố ý: dòng nào cũng
   * có thể đổi chiều cao khi chữ xuống dòng khác đi.
   *
   * Ngưỡng 0,5px chặn vòng lặp vô tận: chiều cao thật hay lệch vài phần nghìn pixel giữa hai
   * lượt đo, mà mỗi lần "đổi" là một lượt dựng nữa.
   */
  useLayoutEffect(() => {
    if (!virtual) return;

    let changed = false;
    for (const [key, node] of rowNodes.current) {
      const height = node.getBoundingClientRect().height;
      if (height <= 0) continue;
      const before = measured.current.get(key);
      if (before === undefined || Math.abs(before - height) > 0.5) {
        measured.current.set(key, height);
        changed = true;
      }
    }
    if (changed) remeasured();
  });

  const update = useCallback((): void => {
    const top = listRef.current?.getBoundingClientRect().top ?? 0;
    // top < 0 nghĩa là đỉnh danh sách đã trôi lên trên khung nhìn.
    const next = Math.max(0, -top);

    setScrollTop((current) => {
      if (current === next) return current;
      const before = windowRange({
        scrollTop: current,
        viewportHeight: viewportRef.current,
        heights: heightsRef.current,
      });
      const after = windowRange({
        scrollTop: next,
        viewportHeight: viewportRef.current,
        heights: heightsRef.current,
      });
      // Cùng một cửa sổ thì màn hình không đổi gì — trả lại giá trị cũ để React bỏ qua lượt dựng.
      return before.start === after.start && before.end === after.end ? current : next;
    });
  }, []);

  useEffect(() => {
    if (!virtual) return;

    const onResize = (): void => {
      // Đổi bề ngang là chữ xuống dòng khác đi: bỏ hết số đo cũ, đo lại từ đầu.
      measured.current.clear();
      setViewportHeight(window.innerHeight);
      remeasured();
      update();
    };

    setViewportHeight(window.innerHeight);
    update();

    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', onResize);
    };
  }, [virtual, update]);

  if (!virtual) {
    return (
      <ul className={styles.list} aria-label={label}>
        {items.map((item) => (
          <li key={itemKey(item)} className={styles.item}>
            {children(item)}
          </li>
        ))}
      </ul>
    );
  }

  const view = windowRange({ scrollTop, viewportHeight, heights });
  const visible = items.slice(view.start, view.end);

  return (
    <ul className={styles.list} ref={listRef} aria-label={label}>
      {/* Hai khối đệm giữ đúng tổng chiều cao, nên thanh cuộn không co giật khi cuộn. */}
      {view.padTop > 0 && <li className={styles.pad} style={{ height: view.padTop }} aria-hidden />}

      {visible.map((item, index) => {
        const key = itemKey(item);
        return (
          <li
            key={key}
            className={styles.row}
            ref={(node) => {
              // Gỡ khỏi kho khi dòng rời DOM, nếu không sẽ đo mãi node đã tháo.
              if (node === null) rowNodes.current.delete(key);
              else rowNodes.current.set(key, node);
            }}
            /* Cho trình đọc màn hình biết đang ở mục thứ mấy trên tổng bao nhiêu, vì phần lớn
               mục không có mặt trong DOM. */
            aria-setsize={items.length}
            aria-posinset={view.start + index + 1}
          >
            {children(item)}
          </li>
        );
      })}

      {view.padBottom > 0 && (
        <li className={styles.pad} style={{ height: view.padBottom }} aria-hidden />
      )}
    </ul>
  );
}
