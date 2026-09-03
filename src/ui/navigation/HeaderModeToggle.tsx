'use client';

import { usePathname } from 'next/navigation';

import { showsModeToggle } from '@/application';

import { ModeToggle } from './ModeToggle';

/**
 * `ModeToggle` của thanh trên, chỉ dựng ở màn nó có tác dụng nhìn thấy được — xem
 * `showsModeToggle()` trong `src/application/routes.ts`, nơi giữ lý do và số đo.
 *
 * ── Vì sao là một lớp bọc riêng, không phải một điều kiện trong `ModeToggle` ────────────────
 *
 * `ModeToggle` còn một chỗ dùng thứ hai: hàng "Chế độ hiển thị" ở màn Cài đặt, và ở đó nó phải
 * hiện ở MỌI đường dẫn — đúng hơn là ở '/cai-dat/', tức chính đường dẫn mà luật này loại. Nhét
 * điều kiện route vào trong `ModeToggle` là làm nó tự tắt ngay tại màn Cài đặt, tức xoá luôn
 * đường về chế độ Cơ bản của những màn không còn nút. Tách ra thì mỗi nơi giữ luật của mình:
 * thanh trên có điều kiện, màn Cài đặt thì không.
 *
 * ── Vì sao AppHeader không tự đọc route ───────────────────────────────────────────────────
 *
 * `AppHeader` là server component (không có `'use client'`), nên nó không gọi được
 * `usePathname()`. Bọc phần cần biết route vào một client leaf là cách `HeaderNav` đã làm với
 * `useActiveNavKey`, và cũng là cách giữ cho phần còn lại của thanh trên tiếp tục do server
 * dựng — nếu chuyển cả `AppHeader` sang client thì `BrandMark` và `HeaderNav` cũng rơi vào gói
 * máy khách của cả 111 trang.
 *
 * Trả `null` chứ không phải một thẻ rỗng: `.controls` là flex có `gap`, một thẻ rỗng vẫn ăn một
 * nhịp gap và đẩy cụm nút lệch khỏi mép phải ở 360px.
 */
export function HeaderModeToggle() {
  const pathname = usePathname();

  if (!showsModeToggle(pathname)) return null;

  return <ModeToggle />;
}
