'use client';

import type { MessageKey } from '@/application';
import { useT } from '@/application/preferences-context';

/**
 * Lá chữ theo locale, dành cho SERVER component (gói WBS 3.6.3 — luồng locale).
 *
 * Trang chủ, khung AppShell hay trang danh sách cố ý là server component để CategoryGrid và
 * nhánh `tile` của FormulaCard không lọt vào gói máy khách (NFR-PER-04) — chúng không gọi
 * hook được. Bọc ĐÚNG PHẦN CHỮ vào lá client này thì cả khối vẫn do server dựng, chỉ mỗi
 * đoạn chữ hydrate và đổi khi người dùng chuyển ngôn ngữ; context xuyên qua cây server
 * children bình thường nên lá vẫn nhận được locale.
 *
 * Chỉ dùng cho chữ đứng giữa JSX. Chữ nằm trong THUỘC TÍNH (title, aria-label, placeholder)
 * không bọc được — component chứa thuộc tính đó phải tự thành client và dùng `useT()`,
 * như `SearchLink` đã làm.
 */
export function T({ k }: { k: MessageKey }) {
  const t = useT();
  return t(k);
}
