'use client';

import Link from 'next/link';

import { ROUTES } from '@/application';
import type { MessageKey } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './BackLink.module.css';
import { useBackTarget } from './useBackTarget';

export interface BackLinkProps {
  /**
   * Nơi quay về khi chưa nhớ được màn gốc nào. Mặc định là `/cong-thuc/`.
   * Màn nào không thuộc luồng công thức thì truyền đường dẫn của mình vào.
   */
  fallbackHref?: string;
  /**
   * Nhãn dùng khi rơi về `fallbackHref`. Mặc định "Danh sách công thức".
   *
   * Nhớ được màn gốc thì nhãn KHÔNG lấy từ đây mà lấy theo chính màn ấy — xem `backTarget()`.
   */
  labelKey?: MessageKey;
  /**
   * Có đọc màn gốc đã nhớ trong `sessionStorage` không.
   * Tắt ở màn có đường ra riêng, ví dụ bảng dữ liệu WF-05 mở từ một trang công thức.
   */
  rememberOrigin?: boolean;
  /**
   * Nhãn dạng CHỮ SẴN, thay cho `labelKey` — dùng khi tên của đích không phải một khoá i18n mà là
   * dữ liệu, ví dụ tên công thức vừa mở bảng dữ liệu ("‹ P/E — hệ số giá trên lợi nhuận").
   *
   * Chỉ có hiệu lực khi đích ĐÚNG LÀ `fallbackHref`. Nhớ được một màn gốc khác thì nhãn phải đi
   * theo màn ấy, không thì nút gọi tên một nơi rồi dẫn tới nơi khác — đúng thứ quyết định (3)
   * trong docblock dưới đây cấm. Nơi gọi vẫn phải truyền `labelKey`, vì nó là đường lui khi chuỗi
   * này vắng mặt.
   */
  label?: string;
}

/**
 * Nút quay lại của các màn TRONG — gói WBS 2.1.x, bổ sung sau khi chủ dự án báo thiếu.
 *
 * ## Vì sao phải có
 *
 * Wireframe vẽ hàng đầu của mọi màn trong là `‹  tiêu đề`: WF-03 chi tiết, WF-04 nâng cao,
 * WF-05 bảng dữ liệu, WF-08 phí & thuế, WF-09 tìm kiếm, WF-14 lịch trả nợ. Bản dựng bỏ sót
 * dấu `‹` ấy ở cả ba màn, nên vào một công thức rồi là **không có đường ra** ngoài việc bấm
 * tab "Công thức" ở thanh dưới — mà tab đó không đọc ra là "quay lại", và nó ném người dùng
 * về danh sách trắng trơn, mất sạch bộ lọc vừa đặt.
 *
 * ## Năm quyết định
 *
 * 1. **Thẻ `<a>` thật, không phải `history.back()`.** Trang chi tiết được Google lập chỉ mục
 *    (FR-25) nên vào thẳng từ ngoài là đường vào thường xuyên; lúc đó lịch sử không có mục nào
 *    của site và `back()` ném người dùng ra khỏi sản phẩm. Link thật thì luôn tới một chỗ có
 *    thật, chạy được cả khi JavaScript chưa tải xong, và mở tab mới được.
 *
 * 2. **Có chữ chứ không chỉ mỗi mũi tên.** Wireframe vẽ `‹` trơn, nhưng đúng cái mũi tên trơn
 *    ấy là thứ chủ dự án tìm không ra. Thêm một chữ ngắn nói rõ sẽ về đâu — vừa dễ thấy, vừa
 *    cho trình đọc màn hình một cái tên tử tế mà không phải bịa `aria-label`.
 *
 * 3. **Nhãn ĐI THEO đích, không cố định.** Hệ quả bắt buộc của (2) từ khi nút này về được cả
 *    trang chủ, màn tìm kiếm và danh mục: một nút ghi "Danh sách công thức" mà bấm vào ra trang
 *    chủ thì còn tệ hơn mũi tên trơn, vì nó nói sai chứ không phải không nói. `backTarget()` trả
 *    `href` và `labelKey` cùng lúc chính vì hai thứ ấy không được rời nhau.
 *
 * 4. **Nhớ chỗ đang đứng.** `href` khởi tạo là đường dự phòng để HTML tĩnh có sẵn một link đúng;
 *    sau khi gắn vào DOM thì nâng cấp thành màn gốc vừa rời đi (xem `origin-screen.ts`).
 *    Đọc trong `useEffect` chứ không lúc khởi tạo state: bản build là HTML tĩnh, đọc
 *    `sessionStorage` lúc render đầu là lệch hydration (bài học đợt 2).
 *
 * 5. **Không bao giờ trỏ về chính màn đang đứng.** Màn tìm kiếm vừa là màn gốc của trang chi tiết
 *    vừa mang nút này, nên chỗ đã nhớ có lúc CHÍNH LÀ nó — lúc ấy nút hiện nhãn "Tìm công thức"
 *    và bấm vào không đi đâu cả (chủ dự án báo, đường đi: Danh mục → kính lúp → quay lại). Nên
 *    đọc cả hai ô nhớ và để `backTarget()` bỏ qua bản trùng màn hiện tại; `here` phải truyền vào
 *    vì phần thuần không được đọc `window`.
 */
export function BackLink({
  fallbackHref = ROUTES.formulas,
  labelKey = 'nav.backToList',
  rememberOrigin = true,
  label,
}: BackLinkProps) {
  const t = useT();
  /*
   * Cả phần "về đâu" lẫn cờ cuộn-về-chỗ-cũ nay nằm ở `useBackTarget()`, dùng chung với nút "Huỷ"
   * cuối màn chi tiết — đọc docblock ở đó để biết vì sao tách chứ không chép.
   *
   * `markReturning` gọi trong `onClick` chứ không trong effect: chỉ CÚ BẤM này mới là quay lại,
   * còn việc component có mặt trên màn thì không nói lên điều gì.
   */
  const target = useBackTarget(fallbackHref, labelKey, rememberOrigin);

  /*
   * Chữ sẵn chỉ thắng khi đích vẫn là `fallbackHref`. Đọc được một màn gốc khác thì `target` đã
   * đổi cả `href` lẫn `labelKey` cùng lúc, và một cái tên công thức dán lên đường về trang chủ là
   * đúng kiểu "nói sai chứ không phải không nói" mà quyết định (3) dưới đây tồn tại để chặn.
   */
  const text = label !== undefined && target.href === fallbackHref ? label : t(target.labelKey);

  return (
    <Link className={styles.back} href={target.href} onClick={target.markReturning}>
      {/* Mũi tên chỉ là phần nhìn; chữ bên cạnh mới là tên của link. */}
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 5 8 12l7 7" />
      </svg>
      <span className={styles.text}>{text}</span>
    </Link>
  );
}
