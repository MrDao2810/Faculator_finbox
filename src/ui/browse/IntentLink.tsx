'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type {
  AnchorHTMLAttributes,
  FocusEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
  TouchEvent,
} from 'react';

/**
 * Link của một thẻ trong DANH SÁCH công thức: chỉ tải trước trang đích khi người dùng TỎ Ý — rê
 * chuột vào, chạm vào, hay đưa tiêu điểm tới — chứ không tải khi thẻ lọt vào khung nhìn (28/10/2026).
 *
 * Vì sao: `<Link>` mặc định của Next tải trước payload RSC của MỌI thẻ vừa lọt vào khung nhìn. Màn
 * danh sách có 111 thẻ, nên lướt hết là ~1 MB tải ngầm (71–83 payload, mỗi cái ~13 kB gzip) và
 * 0,3–0,7 s luồng chính ở CPU 4× chỉ để xử lý chúng; `/tim-kiem/` còn tải 42 payload khi gõ. Chủ dự
 * án chọn phương án này khi được hỏi. 16 ô của kệ "Công thức dùng hằng ngày" vẫn dùng `<Link>` mặc
 * định — chúng nằm đầu màn và là chỗ người ta bấm nhiều nhất.
 *
 * `prefetch={false}` tắt CẢ tải theo khung nhìn LẪN tải khi rê của Next (`app-dir/link.js`), nên
 * lá này tự gọi `router.prefetch()` ở ba sự kiện tỏ ý. Router tự gộp các lần gọi trùng (bộ nhớ đệm
 * prefetch), nên không cần cờ "đã tải". Chạm trên điện thoại cho trước được ~100 ms trước cú bấm;
 * máy tính rê chuột thì sớm hơn nhiều.
 */
export interface IntentLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
}

export function IntentLink({
  href,
  onMouseEnter,
  onTouchStart,
  onFocus,
  children,
  ...rest
}: IntentLinkProps) {
  const router = useRouter();
  const taiTruoc = (): void => {
    router.prefetch(href);
  };
  return (
    <Link
      {...rest}
      href={href}
      prefetch={false}
      onMouseEnter={(event: ReactMouseEvent<HTMLAnchorElement>) => {
        onMouseEnter?.(event);
        taiTruoc();
      }}
      onTouchStart={(event: TouchEvent<HTMLAnchorElement>) => {
        onTouchStart?.(event);
        taiTruoc();
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        taiTruoc();
      }}
    >
      {children}
    </Link>
  );
}
