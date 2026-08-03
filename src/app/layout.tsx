import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Falculator Finbox',
  description:
    'Thư viện công thức tài chính và chứng khoán Việt Nam — tra cứu, tính toán, giải thích.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
