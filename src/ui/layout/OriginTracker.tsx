'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import type { Origin, OriginAnchor } from '@/application';
import {
  ORIGIN_HOLD_KEY,
  ORIGIN_KEY,
  ORIGIN_PREV_KEY,
  ORIGIN_RESTORE_KEY,
  anchoredScrollY,
  matchOrigin,
  originPath,
  originToStore,
  parseOrigin,
} from '@/application';

/**
 * Ghi nhớ màn người dùng đang đứng, và cuộn về đúng chỗ ấy khi họ bấm quay lại.
 *
 * Không dựng ra gì cả, chỉ chạy effect — cùng khuôn `ServiceWorker`, và đặt cạnh nó trong
 * `AppShell` để có mặt ở mọi màn mà không màn nào phải nhớ thêm. Đó là điểm khác quan trọng nhất
 * so với bản trước: việc ghi nhớ từng nằm trong màn danh sách, nên chỉ màn ấy được nhớ, còn màn
 * tìm kiếm và danh mục thì không — xem `origin-screen.ts`.
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
 * ## Hai ô nhớ, không phải một
 *
 * Màn gốc mới nhất nằm ở `ORIGIN_KEY`, màn gốc liền trước ở `ORIGIN_PREV_KEY`. Ô thứ hai chỉ nhận
 * bản cũ khi ĐƯỜNG DẪN đổi — lý do đầy đủ nằm ở docblock của `ORIGIN_PREV_KEY`, gọn lại là:
 * `/tim-kiem/` vừa là màn gốc của trang chi tiết vừa có nút quay lại của riêng nó, nên một ô nhớ
 * thì vai này đè chết vai kia và nút ấy tự trỏ về chính trang đang mở.
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
    ghiNho(null);

    let timer: ReturnType<typeof setTimeout> | undefined;
    function onScroll(): void {
      if (timer !== undefined) clearTimeout(timer);
      timer = setTimeout(rememberQuiet, SCROLL_SETTLE_MS);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('pointerdown', rememberInput, { passive: true, capture: true });
    document.addEventListener('keydown', rememberInput, { passive: true, capture: true });

    return () => {
      if (timer !== undefined) clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('pointerdown', rememberInput, { capture: true });
      document.removeEventListener('keydown', rememberInput, { capture: true });
    };
  }, [pathname]);

  return null;
}

/**
 * Giữ màn gốc hiện tại qua một lần chuyển sang `path` mà người dùng không tự chọn — gọi NGAY TRƯỚC khi
 * điều hướng. Nút Lưu ở màn chi tiết là nơi gọi duy nhất; lý do ở docblock `ORIGIN_HOLD_KEY`.
 */
export function holdOriginThrough(path: string): void {
  try {
    // Bỏ neo `#…` (đích của nút Lưu là `/danh-muc/#phep-tinh-da-luu`) rồi chuẩn hoá như mọi đường dẫn gốc.
    window.sessionStorage.setItem(ORIGIN_HOLD_KEY, originPath(path.split('#')[0] ?? ''));
  } catch {
    // Chặn sessionStorage thì nút quay lại về Danh mục như trước — mất phần mới, không hỏng phần cũ.
  }
}

/** Cuộn ngừng bao lâu thì coi là đã dừng, tính bằng mili giây. */
const SCROLL_SETTLE_MS = 150;

/**
 * Ghi màn hiện tại vào `sessionStorage`. Xuất ra ngoài để nơi nào BIẾT mình vừa đổi trạng thái
 * URL có thể gọi thẳng — `FormulaListScreen` gọi sau mỗi lần URL thật sự đổi vì bộ lọc (qua
 * `onUrlWritten` của `useListUrlState`), vì đổi bộ lọc chỉ thay truy vấn chứ không thay `pathname`,
 * nên effect trong component này không chạy lại.
 *
 * KHÔNG được gọi lúc màn vừa gắn: effect của màn chạy TRƯỚC effect của component này (nó đứng sau
 * `<main>` trong `AppShell`), nên một lần ghi lúc gắn đè `scrollY` đang chờ khôi phục bằng số 0 của
 * trang vừa mở — nút quay lại về đúng màn mà đứng ở đỉnh trang.
 */
export function rememberOrigin(): void {
  ghiNho(null, true);
}

/**
 * Phần việc thật của `rememberOrigin()`.
 *
 * - `neo`: thẻ vừa bấm, chỉ có ở `pointerdown` / `keydown` trúng một thẻ `<a>` trong `<main>`.
 * - `doNguoiDung`: lần ghi này do người dùng chạm vào màn (bấm, gõ phím, đổi bộ lọc) chứ không do màn
 *   tự gắn hay tự cuộn. Chỉ lần ghi kiểu ấy mới gỡ được cờ `ORIGIN_HOLD_KEY` trên chính màn bị giữ.
 */
function ghiNho(neo: OriginAnchor | null, doNguoiDung = false): void {
  try {
    /*
     * Hỏi "màn này có phải màn gốc không" TRƯỚC, đọc `scrollY` SAU (21/09/2026, đợt tối ưu).
     *
     * Hàm này gắn vào `keydown` và `pointerdown` bắt buộc ở `document` của MỌI màn, nên nó chạy
     * mỗi phím người dùng gõ — kể cả khi đang gõ số ở màn chi tiết, nơi `originToStore` chắc chắn
     * trả `null`. Mà đọc `window.scrollY` là ép trình duyệt dàn trang ngay lúc ấy để trả số đúng,
     * tức gánh nốt phần layout mà lượt render của phím trước còn treo. Bản cũ đọc `scrollY` ngay
     * trong danh sách tham số nên lần ép ấy xảy ra TRƯỚC khi hàm kịp bỏ cuộc.
     */
    const url = `${window.location.pathname}${window.location.search}`;
    if (matchOrigin(url) === null) return;

    /*
     * Màn đang bị giữ (vừa được nút Lưu đưa tới): lần ghi lúc gắn và lúc cuộn bỏ qua, màn gốc cũ sống
     * tiếp. Cú chạm đầu tiên của người dùng, hoặc một màn gốc KHÁC, gỡ cờ rồi ghi như thường.
     */
    const giu = window.sessionStorage.getItem(ORIGIN_HOLD_KEY);
    if (giu !== null) {
      if (giu === originPath(url) && !doNguoiDung) return;
      window.sessionStorage.removeItem(ORIGIN_HOLD_KEY);
    }

    const next = originToStore(
      window.location.pathname,
      window.location.search,
      window.scrollY,
      neo,
    );
    if (next === null) return;

    /*
     * Đẩy bản cũ xuống ô thứ hai, nhưng CHỈ khi đường dẫn đổi. Cùng đường dẫn mà khác truy vấn là
     * vẫn đứng nguyên một màn — gõ ô tìm, đổi chip lọc, cuộn — và đẩy nó xuống là biến ô thứ hai
     * thành bản sao của ô thứ nhất, tức mất hẳn thứ vừa thêm nó vào để có.
     */
    const current = parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY));
    if (current !== null && originPath(current.url) !== originPath(next.url)) {
      window.sessionStorage.setItem(ORIGIN_PREV_KEY, JSON.stringify(current));
    }

    window.sessionStorage.setItem(ORIGIN_KEY, JSON.stringify(next));
  } catch {
    // Trình duyệt chặn sessionStorage (chế độ riêng tư) — nút quay lại tự lùi về đường dự phòng.
  }
}

/**
 * Huỷ cú cuộn-về-chỗ-cũ mà nút quay lại vừa hẹn, nếu nó chưa chạy.
 *
 * Màn Công thức gọi khi nó BỎ chuỗi tìm lúc quay về từ một kết quả tìm (`onQueryDropped` của
 * `useListUrlState`). Chỗ đã nhớ là chỗ trong danh sách KẾT QUẢ, còn màn vừa trở lại danh sách đầy
 * đủ: cuộn về con số ấy là thả người dùng vào giữa kệ, không thấy ô tìm vừa xoá. Lời gọi ấy nằm
 * trong effect của `ListUrlSync`, tức chạy TRƯỚC effect của component này (đứng sau `<main>` trong
 * `AppShell`), nên `restoreScroll()` không còn cờ để đọc.
 */
export function cancelScrollRestore(): void {
  try {
    window.sessionStorage.removeItem(ORIGIN_RESTORE_KEY);
  } catch {
    // Trình duyệt chặn sessionStorage — cờ cũng chưa từng đặt được, không có gì để huỷ.
  }
}

/** Lần ghi lúc cuộn ngừng — màn tự sinh, không phải người dùng chạm vào (xem `ghiNho`). */
function rememberQuiet(): void {
  ghiNho(null);
}

/**
 * Lần ghi ở `pointerdown` / `keydown`, kèm NEO khi cú bấm trúng một thẻ `<a>` trong nội dung màn.
 *
 * Chỉ thẻ trong `<main>`: thanh tab dưới và đầu trang cũng là `<a>`, nhưng chúng không phải "chỗ người
 * dùng đang đứng trong danh sách". `keydown` đi cùng đường vì Enter trên một thẻ đang có tiêu điểm là
 * cú bấm của người dùng bàn phím. Đọc `getBoundingClientRect()` chỉ khi màn là màn gốc — cùng lẽ tiết
 * kiệm dàn trang như `scrollY` ở `ghiNho`.
 */
function rememberInput(event: Event): void {
  let neo: OriginAnchor | null = null;
  const dich = event.target;
  if (dich instanceof Element && matchOrigin(window.location.pathname) !== null) {
    const the = dich.closest('main a[href]');
    const href = the?.getAttribute('href');
    if (the !== null && the !== undefined && typeof href === 'string') {
      neo = { href, top: the.getBoundingClientRect().top };
    }
  }
  ghiNho(neo, true);
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
 *
 * Chỗ cuộn được tìm trong CẢ HAI ô nhớ. Quay lại từ màn tìm kiếm là đúng ca ấy: `ORIGIN_KEY` lúc
 * đó giữ `/tim-kiem/`, còn con số cần tìm nằm ở `ORIGIN_PREV_KEY`. Chỉ đọc ô thứ nhất thì về đúng
 * màn nhưng đứng ở đỉnh trang — tức mất đúng thứ `Origin.scrollY` sinh ra để giữ.
 */
function restoreScroll(): void {
  let saved: Origin | undefined;

  try {
    const wanted = window.sessionStorage.getItem(ORIGIN_RESTORE_KEY);
    window.sessionStorage.removeItem(ORIGIN_RESTORE_KEY);
    if (wanted === null) return;

    const here = `${window.location.pathname}${window.location.search}`;
    if (here !== wanted) return;

    saved = [
      parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY)),
      parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY)),
    ].find((origin): origin is Origin => origin !== null && origin.url === wanted);
  } catch {
    return;
  }

  if (saved === undefined) return;
  /* Không neo mà cũng không cuộn thì đỉnh trang đã là chỗ cũ — khỏi chờ khung hình nào. */
  if (saved.anchor === undefined && saved.scrollY <= 0) return;
  const origin = saved;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const y = viTriCuon(origin);
      if (y <= 0 && window.scrollY <= 0) return;
      window.scrollTo({ top: y, behavior: 'auto' });

      /*
       * Kiểm lại một lần sau khi trang lắng (21/10/2026). Hai khung hình là đủ cho danh sách dựng xong,
       * nhưng thẻ ngoài khung nhìn mang `content-visibility: auto` nên chiều cao của chúng là ƯỚC LƯỢNG
       * cho tới khi được vẽ; vẽ xong thì thẻ neo có thể trượt vài chục px. Chỉ chỉnh khi người dùng chưa
       * tự cuộn (trang còn đứng đúng chỗ vừa đặt) — kéo giật lại một người đang cuộn là tệ hơn lệch.
       */
      if (origin.anchor === undefined) return;
      const daDat = Math.round(window.scrollY);
      setTimeout(() => {
        if (Math.abs(Math.round(window.scrollY) - daDat) > 1) return;
        const lai = viTriCuon(origin);
        if (Math.abs(lai - daDat) > 1) window.scrollTo({ top: lai, behavior: 'auto' });
      }, RESTORE_SETTLE_MS);
    });
  });
}

/** Chờ bao lâu rồi kiểm lại chỗ của thẻ neo, tính bằng mili giây. */
const RESTORE_SETTLE_MS = 250;

/**
 * Vị trí cuộn cần tới: theo thẻ đã bấm khi còn tìm thấy nó, không thì theo `scrollY` đã nhớ như trước.
 *
 * Thẻ bị ẩn (ô kệ ngoài phần xem trước mang `hidden`, thẻ Nâng cao ở chế độ Cơ bản) không có hộp nào
 * (`getClientRects()` rỗng) nên bị loại — cuộn tới một thẻ không nhìn thấy là cuộn tới hư không.
 */
function viTriCuon(origin: Origin): number {
  const neo = origin.anchor;
  if (neo === undefined) return origin.scrollY;

  const docTops: number[] = [];
  for (const the of document.querySelectorAll('main a[href]')) {
    if (the.getAttribute('href') !== neo.href || the.getClientRects().length === 0) continue;
    docTops.push(the.getBoundingClientRect().top + window.scrollY);
  }
  return anchoredScrollY(origin, docTops) ?? origin.scrollY;
}
