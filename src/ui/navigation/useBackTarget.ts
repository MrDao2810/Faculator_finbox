'use client';

import { useEffect, useState } from 'react';

import {
  ORIGIN_KEY,
  ORIGIN_PREV_KEY,
  ORIGIN_RESTORE_KEY,
  ROUTES,
  backTarget,
  parseOrigin,
} from '@/application';
import type { MessageKey } from '@/application';

export interface BackTarget {
  /** Đường dẫn của màn sẽ quay về. */
  href: string;
  /** Khoá nhãn ĐI THEO đích — xem quyết định (3) ở docblock `BackLink`. */
  labelKey: MessageKey;
  /**
   * Đặt cờ "lượt điều hướng này là một cú quay lại", gọi NGAY TRƯỚC khi đi.
   * `OriginTracker` bên màn đích đọc cờ rồi cuộn về đúng chỗ cũ.
   */
  markReturning: () => void;
}

/**
 * Nơi một màn TRONG quay về, và cờ cuộn-về-chỗ-cũ đi kèm — tách ra từ `BackLink` ở đợt thêm nút
 * "Huỷ" cuối màn chi tiết.
 *
 * Tách chứ không chép, vì phần này có hai cái bẫy đã trả giá một lần và ghi lại trong docblock
 * của `BackLink`: nhãn phải đi theo đích (nút ghi "Danh sách công thức" mà bấm ra trang chủ thì
 * còn tệ hơn mũi tên trơn), và đích KHÔNG bao giờ được trỏ về chính màn đang đứng (màn tìm kiếm
 * vừa là màn gốc vừa mang nút này, nên có lúc bấm vào không đi đâu cả). Chép ra bản thứ hai là
 * hai bản ấy lệch nhau lúc nào không ai biết.
 *
 * Đọc `sessionStorage` trong `useEffect` chứ không lúc khởi tạo state: bản build là HTML tĩnh,
 * đọc lúc render đầu là lệch hydration (bài học đợt 2).
 */
export function useBackTarget(
  fallbackHref: string = ROUTES.formulas,
  labelKey: MessageKey = 'nav.backToList',
  rememberOrigin = true,
): BackTarget {
  const [target, setTarget] = useState<{ href: string; labelKey: MessageKey }>({
    href: fallbackHref,
    labelKey,
  });

  useEffect(() => {
    if (!rememberOrigin) return;
    try {
      setTarget(
        backTarget(
          {
            origin: parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY)),
            prev: parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY)),
            here: window.location.pathname,
          },
          fallbackHref,
          labelKey,
        ),
      );
    } catch {
      // Trình duyệt chặn sessionStorage (chế độ riêng tư) — giữ nguyên đường dẫn dự phòng.
    }
  }, [rememberOrigin, fallbackHref, labelKey]);

  function markReturning(): void {
    try {
      window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, target.href);
    } catch {
      // Chặn sessionStorage thì mất phần cuộn về chỗ cũ, còn việc điều hướng vẫn chạy đủ.
    }
  }

  return { href: target.href, labelKey: target.labelKey, markReturning };
}
