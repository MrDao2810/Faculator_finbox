'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ORIGIN_KEY, ORIGIN_RESTORE_KEY, originToStore, parseOrigin } from '@/application';

/**
 * Ghi nhớ màn người dùng đang đứng, và cuộn về đúng chỗ ấy khi họ bấm quay lại.
 *
 * Không dựng ra gì cả, chỉ chạy effect — cùng khuôn `ServiceWorker`, và đặt cạnh nó trong
 * `AppShell` để có mặt ở mọi màn mà không màn nào phải nhớ thêm. Đó là điểm khác quan trọng nhất
 * so với bản trước: việc ghi nhớ từng nằm trong `FormulaBrowser`, nên chỉ màn danh sách được nhớ,
 * còn trang chủ, màn tìm kiếm và danh mục thì không — xem `origin-screen.ts`.
 *
 * ## Bốn thời điểm ghi, và vì sao cần cả bốn
 *
 * 1. **Lúc gắn / đổi đường dẫn.** Ghi ngay URL, `scrollY` lúc này là 0 (hoặc là chỗ vừa khôi
 *    phục). Thiếu nó thì một màn mở ra rồi bấm luôn vào công thức sẽ không được nhớ.
 * 2. **Khi ngừng cuộn.** Dội lại 150ms rồi mới ghi, nên cả một lượt cuộn dài chỉ tốn một lần ghi
 *    chứ không phải mỗi khung hình.
 * 3. **`pointerdown`.** Cú bấm mở công thức bắt đầu bằng chính sự kiện này, lúc URL và `scrollY`
 *    còn là của màn gốc. Đây cũng là chỗ bắt được bộ lọc vừa đổi: đổi chip lọc chỉ thay TRUY VẤN
 *    chứ không thay `pathname`, nên effect ở (1) không chạy lại.
 * 4. **`keydown`.** Cùng lý do (3) cho người dùng bàn phím, những người không bao giờ sinh ra một
 *    `pointerdown` nào.
 *
 * Cả bốn đều đi qua `originToStore()`, và hàm ấy trả `null` ở màn không phải gốc — trang chi tiết
 * công thức chẳng hạn. Lúc đó KHÔNG ghi và cũng không xoá bản ghi cũ: xoá là chính nút quay lại
 * của trang đang đứng mất đích.
 *
 * ## Vì sao đọc `window.location` chứ không `useSearchParams()`
 *
 * Với `output: 'export'`, `useSearchParams()` ép cả cây con vào `<Suspense>` và Next bỏ nó khỏi
 * HTML tĩnh. Component này nằm trong `AppShell`, tức bao quanh MỌI màn — dùng hook ấy ở đây là
 * xoá nội dung tĩnh của cả sản phẩm. Cùng lý do `FormulaDetail` đọc `?ma=` từ
 * `window.location.search` trong effect.
 */
export function OriginTracker() {
  const pathname = usePathname();

  useEffect(() => {
    /*
     * Khôi phục TRƯỚC khi bắt đầu ghi. Ngược lại thì lần ghi lúc gắn (thời điểm 1) đè `scrollY`
     * đang nhớ bằng số 0 của trang vừa mở, và cú cuộn ngay sau đó không còn chỗ nào để tới.
     */
    restoreScroll();
    remember();

    let timer: ReturnType<typeof setTimeout> | undefined;
    function onScroll(): void {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(remember, SCROLL_SETTLE_MS);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerdown', remember, { passive: true, capture: true });
    document.addEventListener('keydown', remember, { passive: true, capture: true });

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerdown', remember, { capture: true });
      document.removeEventListener('keydown', remember, { capture: true });
    };
  }, [pathname]);

  return null;
}

/** Cuộn ngừng bao lâu thì coi là đã dừng, tính bằng mili giây. */
const SCROLL_SETTLE_MS = 150;

/**
 * Ghi màn hiện tại vào `sessionStorage`. Xuất ra ngoài để nơi nào BIẾT mình vừa đổi trạng thái
 * URL có thể gọi thẳng — `FormulaBrowser` gọi sau mỗi lần bộ lọc đổi, vì đổi bộ lọc chỉ thay truy
 * vấn chứ không thay `pathname`, nên effect trong component này không chạy lại.
 */
export function rememberOrigin(): void {
  try {
    const origin = originToStore(window.location.pathname, window.location.search, window.scrollY);
    if (origin !== null) window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(origin));
  } catch {
    // Trình duyệt chặn sessionStorage (chế độ riêng tư) — nút quay lại tự lùi về đường dự phòng.
  }
}

/** Tên hàm riêng để `addEventListener` và `removeEventListener` nhận cùng một tham chiếu. */
function remember(): void {
  rememberOrigin();
}

/**
 * Cuộn về chỗ đã nhớ, nhưng CHỈ khi lượt điều hướng này là một cú quay lại thật.
 *
 * Cờ do `BackLink` đặt ngay trước khi điều hướng, và nó mang theo URL đích — hai lớp kiểm, vì
 * chỉ so URL thôi là chưa đủ: mọi lần mở trang chủ đều khớp bản ghi, nên bấm mục "Trang chủ" ở
 * thanh dưới cũng sẽ nhảy cuộn. Cờ xoá NGAY sau khi đọc, kể cả khi không dùng tới, để nó không
 * còn hiệu lực ở lượt điều hướng sau.
 *
 * Cuộn trong `requestAnimationFrame` lồng hai lớp: khung đầu để trình duyệt bố trí xong nội dung
 * (trang chủ mang `content-visibility` và kệ thẻ tự sắp lại sau khi hydrate), khung sau mới cuộn
 * — cuộn trước lúc trang đủ cao thì trình duyệt tự kẹp về đáy hiện có và trượt mất chỗ.
 */
function restoreScroll(): void {
  let target: number | null = null;

  try {
    const wanted = window.sessionStorage.getItem(ORIGIN_RESTORE_KEY);
    window.sessionStorage.removeItem(ORIGIN_RESTORE_KEY);
    if (wanted === null) return;

    const origin = parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY));
    if (origin === null) return;

    const here = `${window.location.pathname}${window.location.search}`;
    if (wanted !== origin.url || here !== origin.url) return;

    target = origin.scrollY;
  } catch {
    return;
  }

  if (target === null || target <= 0) return;
  const y = target;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  });
}
