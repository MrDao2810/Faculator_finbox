'use client';

/**
 * Tầng APPLICATION — bản nháp cho ô nhập được URL điều khiển (gói WBS 1.4.1, FR-19).
 *
 * ## Lỗi mà hook này sinh ra để sửa
 *
 * `useListParams()` lấy URL làm nguồn sự thật: gõ một ký tự thì gọi `router.replace()` rồi
 * chờ đọc ngược ra. Chuyện đó đúng về mặt kiến trúc nhưng **làm rơi ký tự khi gõ nhanh**:
 *
 * 1. `router.replace()` của App Router là bất đồng bộ. Gõ ký tự thứ hai trước khi lần ghi đầu
 *    kịp về, Next đánh dấu lần điều hướng trước là bị bỏ — giá trị nó mang theo mất luôn.
 * 2. Trong lúc chờ, `<input>` là ô có kiểm soát mà `value` vẫn là chuỗi CŨ. React ghi lại giá
 *    trị cũ đó xuống DOM, xoá mất ký tự người dùng vừa gõ.
 *
 * Gõ tay chậm thì không thấy; gõ nhanh (hoặc bộ gõ tiếng Việt bắn liền mấy ký tự) là mất chữ.
 *
 * ## Cách chữa
 *
 * Giữ một bản nháp cục bộ để ô nhập luôn hiện đúng thứ vừa gõ, và **hoãn** việc ghi URL tới
 * khi người dùng ngừng gõ. URL vẫn là nguồn sự thật cho nút Lùi và cho link chia sẻ — chỉ là
 * nó không còn nằm trên đường đi của từng phím nữa. Danh sách kết quả thì lọc theo bản nháp,
 * nên gõ tới đâu thấy tới đó, không phải chờ hết thời gian hoãn.
 *
 * Phân biệt "URL đổi vì mình vừa ghi" với "URL đổi vì bên ngoài" (nút Lùi, mở link có sẵn
 * `?q=`) bằng `sentRef`: chỉ trường hợp sau mới được ghi đè bản nháp, nếu không thì chính lần
 * ghi của mình sẽ dội lại và xoá những ký tự gõ thêm sau đó.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Thời gian chờ mặc định, tính bằng mili giây.
 *
 * 250ms là khoảng nghỉ giữa hai phím của người gõ nhanh: thấp hơn thì vẫn còn ghi URL giữa
 * chừng, cao hơn thì mỗi lần bấm Lùi nhảy quá xa, khó dùng.
 */
const DEFAULT_DELAY_MS = 250;

export interface UseQueryDraftResult {
  /** Giá trị để đưa vào `value` của ô nhập — luôn là thứ người dùng vừa gõ. */
  draft: string;
  /** Gọi từ `onChange` của ô nhập: hiện ngay, ghi URL sau khi ngừng gõ. */
  setDraft: (next: string) => void;
  /**
   * Đặt giá trị và ghi URL NGAY, huỷ lần ghi đang treo.
   *
   * Dùng cho những chỗ người dùng chọn cả cụm từ chứ không gõ từng ký tự — chip "tìm gần
   * đây", phím Enter — hoặc khi họ sắp rời màn, lúc ấy chờ thêm 250ms là mất từ khoá.
   */
  commitDraft: (next: string) => void;
  /**
   * Xoá bản nháp và huỷ lần ghi đang treo, KHÔNG tự ghi URL.
   *
   * Dành cho nút "Xoá bộ lọc": nơi gọi tự dọn URL bằng `reset()` của `useListParams()`. Không
   * huỷ ở đây thì lần ghi đang treo sẽ nổ sau khi URL đã sạch và dựng lại từ khoá vừa xoá.
   */
  resetDraft: () => void;
}

/**
 * @param value  Giá trị hiện tại đọc từ URL.
 * @param commit Hàm ghi giá trị mới lên URL — thường là `setParams({ q })`.
 */
export function useQueryDraft(
  value: string,
  commit: (next: string) => void,
  delayMs: number = DEFAULT_DELAY_MS,
): UseQueryDraftResult {
  const [draft, setDraftState] = useState(value);

  /** Giá trị mới nhất đã gửi đi — mốc để nhận ra thay đổi đến từ bên ngoài. */
  const sentRef = useRef(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /*
   * `commit` đổi định danh mỗi lần URL đổi (nó đóng gói `params` hiện tại). Đưa nó vào mảng
   * phụ thuộc của `setDraft` thì mỗi lần ghi xong lại dựng lại hàm — không sai, nhưng bộ đếm
   * giờ nằm trong ref nên chẳng cần. Đọc qua ref để lúc hết giờ luôn gọi bản mới nhất.
   */
  const commitRef = useRef(commit);
  useEffect(() => {
    commitRef.current = commit;
  });

  const cancel = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const send = useCallback(
    (next: string) => {
      cancel();
      sentRef.current = next;
      commitRef.current(next);
    },
    [cancel],
  );

  useEffect(() => {
    // URL đổi đúng bằng thứ mình vừa ghi → không phải tin mới, bỏ qua. Đây là nhánh giữ cho
    // những ký tự gõ thêm trong lúc chờ khỏi bị dội ngược.
    if (value === sentRef.current) return;

    sentRef.current = value;
    cancel();
    setDraftState(value);
  }, [value, cancel]);

  const setDraft = useCallback(
    (next: string) => {
      setDraftState(next);
      cancel();
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        send(next);
      }, delayMs);
    },
    [cancel, delayMs, send],
  );

  const commitDraft = useCallback(
    (next: string) => {
      setDraftState(next);
      send(next);
    },
    [send],
  );

  const resetDraft = useCallback(() => {
    cancel();
    setDraftState('');
  }, [cancel]);

  // Rời màn thì huỷ, KHÔNG ghi nốt: ghi URL của một trang vừa rời là đè lên trang mới.
  useEffect(() => cancel, [cancel]);

  return { draft, setDraft, commitDraft, resetDraft };
}
