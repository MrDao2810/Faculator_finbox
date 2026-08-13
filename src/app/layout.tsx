import type { Metadata, Viewport } from 'next';

import { t } from '@/application';
import { PreferencesProvider } from '@/application/preferences-context';
import { AppShell } from '@/ui/layout/AppShell';

import './globals.css';

/*
 * Tên sản phẩm lấy từ từ điển chứ không gõ lại: nó xuất hiện ba lần ngay trong khối này.
 * Cách viết đúng là "Faculator Finbox" — không có chữ `l`, khớp gói npm `faculator-finbox`.
 * Một chỗ giữ chữ thì không có chỗ nào để lệch thêm.
 */
const APP_NAME = t('app.name');

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    // Mỗi công thức một tiêu đề riêng, ghép vào khuôn này (FR-25).
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.',
  applicationName: APP_NAME,

  /*
   * PWA — gói WBS 3.6.2. Manifest và biểu tượng là file tĩnh trong `public/`, không phải
   * route sinh ra: `trailingSlash: true` biến mọi route thành thư mục có `/` ở cuối, mà
   * `/manifest.webmanifest/` thì trình duyệt không đọc được.
   */
  manifest: '/manifest.webmanifest',
  /*
   * SVG cho tab trình duyệt (nét luôn sắc ở mọi cỡ), PNG cho hệ điều hành.
   * PNG là bắt buộc chứ không phải dự phòng: Chrome từ chối biểu tượng SVG trong manifest, và
   * iOS chưa bao giờ đọc SVG cho apple-touch-icon — chỉ khai SVG thì PWA không cài được ở đâu
   * cả (lỗi tìm ra ở đợt 13, vá ở đợt 15). Sinh lại bằng `npm run gen:icons`.
   */
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/apple-touch-icon.png', type: 'image/png', sizes: '180x180' }],
  },
  appleWebApp: {
    capable: true,
    // Tên dưới biểu tượng trên màn hình chính iOS — chỗ hẹp, dùng tên gọn như thanh trên.
    title: t('app.brand'),
    statusBarStyle: 'default',
  },
};

export const viewport: Viewport = {
  // Không đặt maximum-scale: người dùng phải phóng to được (NFR-USA-06).
  width: 'device-width',
  initialScale: 1,
  // Bằng --color-paper của bảng màu xanh (đợt 8). Trước đợt này còn sót màu giấy của đợt 4.
  themeColor: '#f4f6fa',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <PreferencesProvider>
          <AppShell>{children}</AppShell>
        </PreferencesProvider>
      </body>
    </html>
  );
}
