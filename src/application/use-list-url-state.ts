'use client';

/**
 * Tầng APPLICATION — trạng thái lọc/tìm của MÀN CÔNG THỨC, phản ánh lên URL (FR-19).
 *
 * ── Vì sao không dùng `useListParams()` như màn tìm WF-09 ─────────────────────────────────────
 *
 * `useListParams()` lấy URL làm nguồn sự thật và đọc nó bằng `useSearchParams()` ngay lúc render.
 * Với `output: 'export'`, component nào gọi hook đó phải nằm trong `<Suspense>`, và Next bỏ TOÀN
 * BỘ cây bên trong ranh giới ấy khỏi HTML tĩnh. Trước ngày 15/09/2026 màn `/cong-thuc/` sống được
 * với điều đó nhờ một bản danh sách tĩnh dựng riêng làm fallback.
 *
 * Nay trang chủ gộp vào đây, `/` chuyển hướng về đây, và màn này thành URL mở đầu của cả sản phẩm:
 * kệ "Công thức dùng hằng ngày" (ứng viên LCP) phải có mặt ngay trong HTML, và danh sách phải đọc
 * được bởi bộ máy tìm kiếm. Một bản fallback thứ hai cho kệ là thêm một cặp file phải giữ khớp
 * nhau từng pixel — đúng loại cặp file đã trôi khỏi nhau một lần.
 *
 * ── Cách làm: state là nguồn của MÀN, URL là bản ghi của state ────────────────────────────────
 *
 *   - State khởi tạo bằng `DEFAULT_LIST_PARAMS`, nên server và lượt hydrate dựng ra CÙNG một cây —
 *     danh sách mặc định có sẵn trong HTML tĩnh.
 *   - Đọc URL không nằm ở đây mà ở `ListUrlSync` (`list-url-sync.tsx`): một component RỖNG gọi
 *     `useSearchParams()` bên trong ranh giới `<Suspense>` của riêng nó. Ranh giới ấy vẫn bị Next
 *     loại khỏi HTML tĩnh — nhưng nó không dựng ra gì, nên không mất gì. Nó báo mọi thay đổi URL
 *     về `applySearch()`: lúc vào trang có `?category=…`, lúc bấm lại mục "Công thức" khi đang lọc,
 *     lúc Lùi/Tới.
 *   - Ghi URL bằng `history.replaceState(null, …)`. Next 15 vá hàm ấy để router cập nhật theo
 *     (`app-router.js`), nên `usePathname`/`useSearchParams` ở chỗ khác vẫn đúng. `replace` chứ
 *     không `push`: đổi bộ lọc không phải một bước điều hướng, Lùi phải rời màn — đúng hành vi cũ.
 *
 * ── Vì sao không rơi ký tự khi gõ nhanh (lỗi thật của `useListParams` hồi đợt 13) ─────────────
 *
 * Hồi ấy ô nhập lấy `value` từ URL, mà `router.replace` bất đồng bộ: gõ ký tự thứ hai trước khi
 * URL kịp đổi thì ký tự đầu bị đè. Ở đây ô nhập lấy từ STATE, cập nhật ngay; URL chỉ nhận bản ghi
 * một chiều. Bản ghi dội ngược lại qua `ListUrlSync` bị chặn bằng hai phép so trong `applySearch`
 * — xem chú thích tại chỗ.
 *
 * ── Vì sao chuỗi tìm ghi URL trễ một nhịp, còn bộ lọc thì ghi ngay ──────────────────────────────
 *
 * Safari ném `SecurityError` khi `replaceState` bị gọi quá 100 lần trong 30 giây, và mỗi lần gọi là
 * một lượt cập nhật router. Gõ từng phím mà ghi từng phím là chạm cả hai. Nên chuỗi tìm đợi
 * `URL_WRITE_DELAY_MS` ngừng gõ rồi mới ghi; bấm chip nhóm, đổi cách sắp thì ghi ngay. Lần ghi đang
 * đợi được XẢ NGAY khi người dùng bấm hay nhấn Enter ở bất cứ đâu, và khi rời trang — để cú bấm mở
 * một công thức ngay sau khi gõ vẫn để lại đúng URL cho nút quay lại (`OriginTracker` đọc URL đúng
 * ở `pointerdown`, và listener ở đây đăng ký trước nó nên chạy trước nó).
 *
 * KHÔNG ghi lúc gắn và KHÔNG ghi lúc tháo: lúc gắn chưa có gì để ghi (và bản vá `replaceState` của
 * Next còn chưa cài), lúc tháo thì URL đã là của trang kế tiếp.
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  DEFAULT_LIST_PARAMS,
  listParamsFromSearch,
  sameListParams,
  serializeListParams,
  type ListParams,
} from './url-state';

/** Ngừng gõ bao lâu thì ghi chuỗi tìm lên URL, tính bằng mili giây. */
export const URL_WRITE_DELAY_MS = 300;

export interface UseListUrlStateOptions {
  /**
   * Gọi ngay sau mỗi lần URL thật sự đổi.
   *
   * Màn truyền `rememberOrigin` vào: đổi bộ lọc chỉ thay truy vấn chứ không thay `pathname`, nên
   * `OriginTracker` không tự biết. Là tham số chứ không import thẳng vì tầng này không được chạm
   * `@/ui` (CON-03).
   */
  onUrlWritten?: () => void;
}

export interface UseListUrlStateResult {
  params: ListParams;
  /** Đổi chuỗi tìm. Màn đổi ngay; URL ghi sau `URL_WRITE_DELAY_MS`. */
  setQuery: (q: string) => void;
  /** Đổi nhóm và/hoặc cách sắp. Màn đổi ngay, URL ghi ngay. */
  setFilters: (patch: Partial<Pick<ListParams, 'categoryId' | 'sort'>>) => void;
  /** Về trạng thái sạch — nút "Xoá bộ lọc" của khối rỗng. */
  reset: () => void;
  /** Ghi ngay lần ghi đang đợi, nếu có. */
  flushUrl: () => void;
  /** Nhận chuỗi truy vấn MỚI NHẤT của URL — chỉ `ListUrlSync` gọi. */
  applySearch: (search: string) => void;
}

/**
 * Chuỗi truy vấn hiện tại của trình duyệt, ĐÃ CHUẨN HOÁ qua `URLSearchParams`.
 *
 * Không so thẳng `location.search`: link người dùng dán có thể viết `?q=p/e` hay `%20`, còn
 * `useSearchParams().toString()` trả `q=p%2Fe` hay `+` — cùng một truy vấn, hai chuỗi byte. So chuỗi
 * thô là link chia sẻ bị coi như tiếng dội và không lọc gì.
 */
function currentSearch(): string {
  return new URLSearchParams(window.location.search).toString();
}

/** Chuẩn hoá một chuỗi truy vấn về cùng dạng với `currentSearch()`. */
function normalizeSearch(search: string): string {
  return new URLSearchParams(search).toString();
}

export function useListUrlState({
  onUrlWritten,
}: UseListUrlStateOptions = {}): UseListUrlStateResult {
  const [params, setParamsState] = useState<ListParams>(DEFAULT_LIST_PARAMS);

  /* Bản mới nhất của state cho các hàm chạy ngoài lượt render (bộ hẹn giờ, listener). */
  const paramsRef = useRef<ListParams>(DEFAULT_LIST_PARAMS);
  /* Chuỗi truy vấn mà màn đã biết là của nó — vừa ghi, hoặc vừa nhận từ URL. `null` = chưa biết gì. */
  const knownSearchRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onWrittenRef = useRef(onUrlWritten);
  onWrittenRef.current = onUrlWritten;

  const cancelPending = useCallback((): void => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const write = useCallback((): void => {
    const query = serializeListParams(paramsRef.current).toString();
    knownSearchRef.current = query;
    if (query === currentSearch()) return;

    const url = `${window.location.pathname}${query === '' ? '' : `?${query}`}${window.location.hash}`;
    try {
      // `null` chứ không phải `history.state`: bản vá của Next bỏ qua mọi object mang `__NA`.
      window.history.replaceState(null, '', url);
    } catch {
      // Safari chặn vì gọi quá dày — màn vẫn đúng, chỉ URL chậm một nhịp tới lần ghi sau.
      return;
    }
    onWrittenRef.current?.();
  }, []);

  const flushUrl = useCallback((): void => {
    if (timerRef.current === null) return;
    cancelPending();
    write();
  }, [cancelPending, write]);

  const commit = useCallback(
    (next: ListParams, immediate: boolean): void => {
      paramsRef.current = next;
      setParamsState(next);
      cancelPending();
      if (immediate) {
        write();
        return;
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        write();
      }, URL_WRITE_DELAY_MS);
    },
    [cancelPending, write],
  );

  const setQuery = useCallback(
    (q: string): void => {
      commit({ ...paramsRef.current, q }, false);
    },
    [commit],
  );

  const setFilters = useCallback(
    (patch: Partial<Pick<ListParams, 'categoryId' | 'sort'>>): void => {
      commit({ ...paramsRef.current, ...patch }, true);
    },
    [commit],
  );

  const reset = useCallback((): void => {
    commit(DEFAULT_LIST_PARAMS, true);
  }, [commit]);

  const applySearch = useCallback(
    (search: string): void => {
      const incoming = normalizeSearch(search);

      /*
       * Hai phép so, chặn hai loại tiếng dội khác nhau:
       *
       * 1. Trùng thứ màn đã biết — chính lần ghi vừa rồi dội lại qua router, hoặc URL không đổi gì.
       * 2. Khác URL THẬT của trình duyệt lúc này — tiếng dội TRỄ của một lần ghi cũ, tới sau khi
       *    màn đã ghi thêm lần nữa (router cập nhật trong `startTransition`, có thể chậm hơn nhịp
       *    gõ). Áp nó là kéo ô tìm lùi về chữ cũ, tức đúng lỗi rơi ký tự. Một thay đổi URL thật —
       *    bấm link, Lùi/Tới — thì luôn đã nằm trên `window.location` khi tin tới đây.
       */
      if (incoming === knownSearchRef.current) return;
      if (incoming !== currentSearch()) return;

      knownSearchRef.current = incoming;
      cancelPending();

      const next = listParamsFromSearch(incoming);
      if (sameListParams(next, paramsRef.current)) return;
      paramsRef.current = next;
      setParamsState(next);
    },
    [cancelPending],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' || event.key === ' ') flushUrl();
    };

    document.addEventListener('pointerdown', flushUrl, { capture: true });
    document.addEventListener('keydown', onKey, { capture: true });
    window.addEventListener('pagehide', flushUrl);

    return () => {
      document.removeEventListener('pointerdown', flushUrl, { capture: true });
      document.removeEventListener('keydown', onKey, { capture: true });
      window.removeEventListener('pagehide', flushUrl);
      // Không ghi lúc tháo — xem docblock đầu file.
      cancelPending();
    };
  }, [flushUrl, cancelPending]);

  return { params, setQuery, setFilters, reset, flushUrl, applySearch };
}
