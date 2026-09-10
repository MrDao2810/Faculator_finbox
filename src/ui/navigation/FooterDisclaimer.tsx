'use client';

import { usePathname } from 'next/navigation';

import { showsFooterDisclaimer } from '@/application';

import { DisclaimerBar } from './DisclaimerBar';

/**
 * Dải miễn trừ ở chân trang — cùng một bản `DisclaimerBar variant="footer"`, chỉ thêm một câu hỏi
 * về ĐƯỜNG DẪN trước khi dựng.
 *
 * ── Vì sao lọc ở đây chứ không ở `AppShell` ──────────────────────────────────────────────────
 *
 * `AppShell` là server component nên nó không gọi được `usePathname()`. Đây đúng khuôn
 * `HeaderIdentity`, `HeaderNav` và `HeaderModeToggle` đã dựng: bọc phần cần biết route vào một lá
 * client, phần khung giữ nguyên là server. Luật "màn nào" thì nằm ở `showsFooterDisclaimer()` bên
 * `routes.ts`, cùng chỗ với `showsModeToggle()` và cùng lý do — đó là quyết định về đường dẫn.
 *
 * ── Vì sao KHÔNG bỏ hẳn lời gọi ở `AppShell` ─────────────────────────────────────────────────
 *
 * Cách làm hiển nhiên hơn là để mỗi màn tự dựng dải của mình. Đã bác: FR-24 · UI-04 không được
 * phụ thuộc việc người viết màn có nhớ hay không — cùng cách nghĩ với `ok()` giữ bất biến FR-06.
 * Khung vẫn dựng cho MỌI màn; chỗ này chỉ trừ ra đúng những màn đã tự nói câu ấy ở chỗ tốt hơn,
 * và danh sách trừ nằm trong một hàm thuần có ca kiểm riêng.
 *
 * `usePathname()` chạy được ở lượt dựng tĩnh, nên trang chi tiết KHÔNG có dải này ngay trong HTML
 * xuất ra — không phải dựng rồi giấu bằng JavaScript sau khi hydrate.
 */
export function FooterDisclaimer() {
  const pathname = usePathname();

  if (!showsFooterDisclaimer(pathname)) return null;

  return <DisclaimerBar />;
}
