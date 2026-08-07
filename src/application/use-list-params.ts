'use client';

/**
 * Tầng APPLICATION — nối trạng thái lọc/tìm với URL (gói WBS 1.4.1, FR-19).
 *
 * URL là nguồn sự thật: không giữ bản sao trong state, mỗi lần đổi là ghi lại URL rồi
 * đọc ngược ra. Nhờ vậy nút Lùi của trình duyệt và link chia sẻ đều đúng.
 *
 * LƯU Ý cho người dùng hook này: với `output: 'export'`, component gọi hook này PHẢI nằm
 * trong một <Suspense> — bên trong có useSearchParams(). Quên là `npm run build` hỏng.
 *
 * LƯU Ý thứ hai: **đừng nối thẳng `setParams({ q })` vào `onChange` của một ô nhập.**
 * `router.replace()` là bất đồng bộ nên gõ nhanh sẽ rơi ký tự — cho ô nhập đi qua
 * `useQueryDraft()` (use-query-draft.ts), ở đó có giải thích đầy đủ.
 */

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { listParamsToQuery, parseListParams, type ListParams } from './url-state';

export interface UseListParamsResult {
  params: ListParams;
  /** Ghi đè một phần trạng thái; phần còn lại giữ nguyên. */
  setParams: (patch: Partial<ListParams>) => void;
  /** Về trạng thái sạch — nút “Xoá bộ lọc”. */
  reset: () => void;
}

export function useListParams(): UseListParamsResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const params = useMemo(
    () => parseListParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const push = useCallback(
    (next: ListParams) => {
      // scroll: false — đổi bộ lọc không nên kéo người dùng về đầu trang.
      router.replace(`${pathname}${listParamsToQuery(next)}`, { scroll: false });
    },
    [router, pathname],
  );

  const setParams = useCallback(
    (patch: Partial<ListParams>) => {
      push({ ...params, ...patch });
    },
    [params, push],
  );

  const reset = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { params, setParams, reset };
}
