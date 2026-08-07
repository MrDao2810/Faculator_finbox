import type { Metadata } from 'next';

import { PortfolioScreen } from './PortfolioScreen';

export const metadata: Metadata = {
  title: 'Danh mục cá nhân',
  description: 'Danh mục nắm giữ lưu ngay trên thiết bị, không cần đăng nhập.',
};

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1.
 * Phần động nằm ở `PortfolioScreen`; ở đây chỉ có metadata.
 */
export default function PortfolioPage() {
  return <PortfolioScreen />;
}
