import type { Metadata } from 'next';
import { Suspense } from 'react';

import { DataTableScreen } from './DataTableScreen';

export const metadata: Metadata = {
  title: 'Bảng dữ liệu — chuỗi giá OHLCV',
  description: 'Nhập và sửa chuỗi giá theo phiên để tính Beta, Sharpe và VaR ngay trên máy bạn.',
  /*
   * KHÔNG cho lập chỉ mục, và cũng không có trong `sitemap.ts`.
   * Đây là chỗ nhập liệu của người dùng chứ không phải nội dung — không có gì để Google đọc,
   * và bảng luôn rỗng với người mới vào (FR-25).
   */
  robots: { index: false, follow: true },
};

/**
 * Màn WF-05 Bảng dữ liệu — gói WBS 3.3.1.
 * Phần động nằm ở `DataTableScreen`; ở đây chỉ có metadata và ranh giới Suspense.
 */
export default function DataPage() {
  return (
    // Bắt buộc với output: 'export' — bên trong có useSearchParams().
    <Suspense fallback={null}>
      <DataTableScreen />
    </Suspense>
  );
}
