import type { Metadata, Viewport } from 'next';

import { PREFERENCES_STORAGE_KEY, t } from '@/application';
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
  /*
   * Bằng --color-paper của bảng màu xanh (đợt 8). Trước đợt này còn sót màu giấy của đợt 4.
   *
   * Đây là giá trị của BẢNG SÁNG, tức mặc định. Người đã chọn Tối được `PreferencesProvider`
   * vá lại thẻ này lúc chạy, đọc thẳng token đang áp — xem effect bảng màu ở đó. Metadata của
   * Next dựng lúc build nên không có cách nào biết lựa chọn nằm trong máy người dùng.
   */
  themeColor: '#f4f6fa',
};

/*
 * Đặt bảng màu TRƯỚC lượt vẽ đầu tiên.
 *
 * Không có nó thì `data-theme` chỉ được đặt sau khi hydrate xong, và người đã chọn Tối phải nhìn
 * một nháy trắng nguyên trang mỗi lần tải cứng — trên nền tối thì cái nháy ấy chói mắt thật sự.
 *
 * Đây là script inline đầu tiên của dự án. Hai điều đi kèm:
 *   · CSP đã cho phép sẵn — `public/_headers` có `script-src 'self' 'unsafe-inline'`, vốn phải
 *     có vì bản export tĩnh của Next tự bootstrap bằng script inline. Không nới thêm gì.
 *   · `<html>` cần `suppressHydrationWarning`, vì DOM sẽ mang một thuộc tính mà HTML tĩnh không
 *     có. Cờ đó chỉ chặn cảnh báo trên ĐÚNG thẻ `<html>`, không lan xuống cây con — và
 *     `chrome-check.mjs` có 5 ca đòi console sạch tuyệt đối để canh chuyện đó.
 *
 * Chỉ đọc, chỉ đặt một thuộc tính, và nuốt mọi lỗi: trình duyệt chặn localStorage (chế độ riêng
 * tư của Safari) thì trang vẫn chạy bằng bảng sáng chứ không gãy ngay từ thẻ `<head>`.
 */
const THEME_BOOT_SCRIPT =
  `try{var p=JSON.parse(localStorage.getItem('${PREFERENCES_STORAGE_KEY}')||'{}');` +
  `if(p.theme==='dark'){document.documentElement.dataset.theme='dark'}}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <PreferencesProvider>
          <AppShell>{children}</AppShell>
        </PreferencesProvider>
      </body>
    </html>
  );
}
