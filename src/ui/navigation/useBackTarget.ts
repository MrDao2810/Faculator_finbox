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
 *
 * ## Vì sao đích KHÔNG phải là state
 *
 * Bản trước giữ cả đích trong `useState` khởi tạo từ tham số. Đó là "derived state", và nó hỏng
 * đúng kiểu kinh điển: giá trị khởi tạo chỉ chạy ở lần GẮN đầu tiên, còn tham số thì đổi mỗi lần
 * điều hướng.
 *
 * Lỗi thật đã báo, nguyên văn đường đi: ở `/cong-thuc/pe/` bấm "Mở bảng dữ liệu" sang
 * `/du-lieu/?from=pe`, rồi bấm quay lại thì về `/cong-thuc/` chứ không về `pe`. React thấy cùng một
 * `<BackLink>` ở cùng chỗ trong cây nên GIỮ NGUYÊN instance — state mang theo đích của màn cũ. Mà
 * màn bảng dữ liệu truyền `rememberOrigin: false`, nên effect thoát ngay ở dòng đầu và không bao
 * giờ ghi đè cái state cũ ấy. Nút vì thế đứng yên ở "Danh sách công thức" mãi mãi.
 *
 * Nay đích được TÍNH mỗi lượt render từ chính tham số, còn state chỉ giữ phần *thêm vào* — màn gốc
 * đọc được từ `sessionStorage`. Và phần thêm ấy mang theo `forFallback`, tức nó chỉ được dùng khi
 * vẫn thuộc về đúng màn đang đứng. Hai lớp chặn ấy khiến không còn đường nào cho một đích cũ sống
 * sót qua một cú điều hướng.
 */

/** Màn gốc đọc được, kèm THAM SỐ mà nó được tính cho — thiếu vế sau là mở lại đúng lỗi trên. */
interface Remembered {
  forFallback: string;
  href: string;
  labelKey: MessageKey;
}

export function useBackTarget(
  fallbackHref: string = ROUTES.formulas,
  labelKey: MessageKey = 'nav.backToList',
  rememberOrigin = true,
): BackTarget {
  const [remembered, setRemembered] = useState<Remembered | null>(null);

  useEffect(() => {
    /* Xoá chứ không chỉ `return`: bản ghi của màn TRƯỚC không được sống tiếp sang màn này. */
    if (!rememberOrigin) {
      setRemembered(null);
      return;
    }

    try {
      setRemembered({
        forFallback: fallbackHref,
        ...backTarget(
          {
            origin: parseOrigin(window.sessionStorage.getItem(ORIGIN_KEY)),
            prev: parseOrigin(window.sessionStorage.getItem(ORIGIN_PREV_KEY)),
            here: window.location.pathname,
          },
          fallbackHref,
          labelKey,
        ),
      });
    } catch {
      // Trình duyệt chặn sessionStorage (chế độ riêng tư) — giữ nguyên đường dẫn dự phòng.
      setRemembered(null);
    }
  }, [rememberOrigin, fallbackHref, labelKey]);

  /*
   * Dự phòng là mặc định, màn gốc chỉ ĐÈ LÊN — và chỉ khi nó được tính cho đúng tham số hiện tại.
   *
   * Thứ tự này quan trọng hơn vẻ ngoài của nó: lượt render đầu luôn ra đúng tham số, tức khớp HTML
   * tĩnh, nên vẫn giữ được điều mà bản cũ làm đúng (không lệch hydration). Khác là ở lượt điều
   * hướng thứ hai trở đi.
   */
  const target: { href: string; labelKey: MessageKey } =
    rememberOrigin && remembered !== null && remembered.forFallback === fallbackHref
      ? { href: remembered.href, labelKey: remembered.labelKey }
      : { href: fallbackHref, labelKey };

  function markReturning(): void {
    try {
      window.sessionStorage.setItem(ORIGIN_RESTORE_KEY, target.href);
    } catch {
      // Chặn sessionStorage thì mất phần cuộn về chỗ cũ, còn việc điều hướng vẫn chạy đủ.
    }
  }

  return { href: target.href, labelKey: target.labelKey, markReturning };
}
