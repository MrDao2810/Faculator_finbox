/** @type {import('next').NextConfig} */
const nextConfig = {
  // SRS mục 2.1 + 6.1: web tĩnh, không backend. Build ra thư mục out/ toàn HTML + JS.
  output: 'export',
  // Mỗi công thức một URL riêng dạng /cong-thuc/wacc/ → hợp static hosting (FR-25).
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
