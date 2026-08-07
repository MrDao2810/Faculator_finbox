import type { Metadata } from 'next';

import { SettingsScreen } from './SettingsScreen';

export const metadata: Metadata = {
  title: 'Cài đặt',
  description: 'Chế độ hiển thị, đơn vị và biểu phí, dữ liệu cục bộ, thông tin sản phẩm.',
};

/**
 * Màn WF-13 Cài đặt — gói WBS 3.6.1.
 *
 * Phần động nằm ở `SettingsScreen`: nó đọc `localStorage` để nói cỡ từng mục dữ liệu, nên
 * bắt buộc là client component. Ở đây chỉ có metadata.
 *
 * KHÔNG có `<Suspense>` vì màn không dùng `useSearchParams()` — trang vẫn giữ nguyên HTML tĩnh.
 */
export default function SettingsPage() {
  return <SettingsScreen />;
}
