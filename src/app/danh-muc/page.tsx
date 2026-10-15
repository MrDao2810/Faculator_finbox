import type { Metadata } from 'next';

import { DocumentTitle } from '@/ui/i18n/DocumentTitle';

import { PAGE_TITLES } from '../page-titles';
import { PortfolioScreen } from './PortfolioScreen';

export const metadata: Metadata = {
  title: PAGE_TITLES.portfolio.vi,
  description: 'Danh mục nắm giữ lưu ngay trên thiết bị, không cần đăng nhập.',
};

/**
 * Màn WF-06 Danh mục cá nhân — gói WBS 3.4.1.
 * Phần động nằm ở `PortfolioScreen`; ở đây chỉ có metadata.
 */
export default function PortfolioPage() {
  return (
    <>
      <DocumentTitle title={PAGE_TITLES.portfolio} />
      <PortfolioScreen />
    </>
  );
}
