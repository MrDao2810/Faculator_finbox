'use client';

import type { MessageKey } from '@/application';
import { useT } from '@/application/preferences-context';

/**
 * Lá chữ theo locale cho cây SERVER của màn danh sách (`DailyShelf`, `FormulaCard`). Làm đúng việc
 * của `T` (`src/ui/i18n/T.tsx`), nhưng phải là một MODULE KHÁC — không được thay bằng `T`, kể cả
 * bằng một dòng re-export.
 *
 * Vì sao (đo 28/10/2026, bản build): Next trộn client manifest của các đoạn đường dẫn theo thứ tự
 * '' → app → app/cong-thuc → app/cong-thuc/[id], và lấy bản SAU đè bản trước
 * (`flight-manifest-plugin.js`, `mergeManifest` dùng `Object.assign`). `T` vừa nằm trong cây server
 * của layout (`AppShell`) vừa nằm trong cây server của `app/cong-thuc/page`, nên ở MỌI trang chi
 * tiết, tham chiếu client của `T` mang danh sách chunk của trang danh sách: mỗi trang chi tiết tải
 * và chạy thêm chunk route danh sách, chỉ mục nhẹ và phần browse — 39,6 kB gzip, ~80 ms ở CPU 4×.
 * Một lá riêng thì manifest của trang danh sách không còn đè gì lên `T`.
 *
 * Luật chung, giữ cho mọi module `'use client'` khác: module nào được CẢ cây server của layout LẪN
 * cây server của `app/cong-thuc/page` nhập thẳng thì sẽ kéo chunk của trang danh sách lên mọi
 * trang con. `verify-static.mjs` gác: HTML trang chi tiết không được nhắc `app/cong-thuc/page-`.
 */
export function BrowseT({ k }: { k: MessageKey }) {
  const t = useT();
  return t(k);
}
