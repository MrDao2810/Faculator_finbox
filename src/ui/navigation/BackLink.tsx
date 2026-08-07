'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LAST_LIST_URL_KEY, ROUTES, backToListHref, t } from '@/application';
import type { MessageKey } from '@/application';

import styles from './BackLink.module.css';

export interface BackLinkProps {
  /**
   * Nơi quay về khi chưa nhớ được màn danh sách nào. Mặc định là `/cong-thuc/`.
   * Màn nào không thuộc luồng công thức thì truyền đường dẫn của mình vào.
   */
  fallbackHref?: string;
  /** Nhãn nói RÕ sẽ về đâu. Mặc định "Danh sách công thức". */
  labelKey?: MessageKey;
  /**
   * Có đọc màn danh sách đã nhớ trong `sessionStorage` không.
   * Tắt ở màn không thuộc luồng công thức, ví dụ WF-05 bảng dữ liệu.
   */
  rememberList?: boolean;
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
 * ## Ba quyết định
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
 * 3. **Nhớ bộ lọc.** `href` khởi tạo là `/cong-thuc/` để HTML tĩnh có sẵn một link đúng; sau
 *    khi gắn vào DOM thì nâng cấp thành màn danh sách vừa rời đi (xem `last-list-url.ts`).
 *    Đọc trong `useEffect` chứ không lúc khởi tạo state: bản build là HTML tĩnh, đọc
 *    `sessionStorage` lúc render đầu là lệch hydration (bài học đợt 2).
 */
export function BackLink({
  fallbackHref = ROUTES.formulas,
  labelKey = 'nav.backToList',
  rememberList = true,
}: BackLinkProps) {
  const [href, setHref] = useState(fallbackHref);

  useEffect(() => {
    if (!rememberList) return;
    try {
      const remembered = window.sessionStorage.getItem(LAST_LIST_URL_KEY);
      setHref(backToListHref(remembered));
    } catch {
      // Trình duyệt chặn sessionStorage (chế độ riêng tư) — giữ nguyên đường dẫn dự phòng.
    }
  }, [rememberList]);

  return (
    <Link className={styles.back} href={href}>
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
      <span>{t(labelKey)}</span>
    </Link>
  );
}
