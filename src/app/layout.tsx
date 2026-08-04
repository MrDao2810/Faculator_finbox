import type { Metadata, Viewport } from 'next';

import { PreferencesProvider } from '@/application/preferences-context';
import { AppShell } from '@/ui/layout/AppShell';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Falculator Finbox',
    // Mỗi công thức một tiêu đề riêng, ghép vào khuôn này (FR-25).
    template: '%s · Falculator Finbox',
  },
  description:
    'Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.',
  applicationName: 'Falculator Finbox',
};

export const viewport: Viewport = {
  // Không đặt maximum-scale: người dùng phải phóng to được (NFR-USA-06).
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ecebe6',
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
