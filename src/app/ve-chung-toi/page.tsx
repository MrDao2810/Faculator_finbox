import type { Metadata } from 'next';

import { AboutScreen } from './AboutScreen';

/**
 * Màn "Về chúng tôi" — trang giới thiệu sản phẩm.
 *
 * KHÔNG đặt `robots: noindex`, khác hẳn '/tim-kiem/' và '/du-lieu/': đây là nội dung thật để
 * đọc, không trùng với màn nào khác, nên nó có mặt trong `sitemap.xml`.
 *
 * Không bọc <Suspense>: màn này không đọc `useSearchParams()`, và nó là server component nên
 * toàn bộ chữ nằm sẵn trong HTML tĩnh.
 */
export const metadata: Metadata = {
  title: 'Về chúng tôi',
  description:
    'Faculator Finbox là gì, làm được gì, kiến trúc client-only không máy chủ, và những việc sản phẩm không làm.',
};

export default function AboutPage() {
  return <AboutScreen />;
}
