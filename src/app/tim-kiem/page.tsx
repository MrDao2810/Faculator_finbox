import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DocumentTitle } from '@/ui/i18n/DocumentTitle';

import { PAGE_TITLES } from '../page-titles';
import { SearchScreen } from './SearchScreen';

export const metadata: Metadata = {
  title: PAGE_TITLES.search.vi,
  description: 'Tìm nhanh trong thư viện công thức tài chính, gõ không dấu vẫn ra đúng.',
  /*
   * KHÔNG cho lập chỉ mục, và cũng không có trong `sitemap.ts`.
   *
   * Màn này ra cùng một danh sách với `/cong-thuc/`, chỉ khác cách trình bày. Để Google
   * lập chỉ mục cả hai là tự tạo trùng nội dung, đúng thứ FR-25 muốn tránh. `/cong-thuc/`
   * mới là URL chính danh; trang kết quả tìm kiếm vốn không nên nằm trong chỉ mục.
   */
  robots: { index: false, follow: true },
};

/**
 * Màn WF-09 Tìm kiếm — gói WBS 3.1.3.
 * Phần động nằm ở `SearchScreen`; ở đây chỉ có metadata và ranh giới Suspense.
 */
export default function SearchPage() {
  return (
    <>
      <DocumentTitle title={PAGE_TITLES.search} />
      {/* Bắt buộc với output: 'export' — bên trong có useSearchParams(). */}
      <Suspense fallback={null}>
        <SearchScreen />
      </Suspense>
    </>
  );
}
