/** @type {import('next').NextConfig} */
const nextConfig = {
  // SRS mục 2.1 + 6.1: web tĩnh, không backend. Build ra thư mục out/ toàn HTML + JS.
  output: 'export',
  // Mỗi công thức một URL riêng dạng /cong-thuc/wacc/ → hợp static hosting (FR-25).
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  /*
   * Tắt huy hiệu dev tools của Next.
   *
   * Nó mặc định nằm ở góc DƯỚI TRÁI (`devIndicators.position` mặc định 'bottom-left'), tức là
   * đè đúng lên tab "Trang chủ" của thanh điều hướng dưới — bấm vào đó trúng huy hiệu chứ
   * không trúng link, nên tab đầu tiên không chuyển được suốt lúc chạy dev. Ba tab kia không
   * sao vì huy hiệu chỉ chiếm một góc.
   *
   * Không dời sang góc khác được: thanh tab trải hết bề ngang nên hai góc dưới đều là tab, còn
   * hai góc trên là link thương hiệu và cụm nút chế độ/tìm kiếm của AppHeader. Góc nào cũng có
   * điều khiển.
   *
   * Chỉ ảnh hưởng lúc chạy dev — bản `output: 'export'` không hề chèn phần tử này. Bảng lỗi
   * toàn màn khi biên dịch hỏng vẫn hiện bình thường, đây chỉ là cái huy hiệu nhỏ.
   */
  devIndicators: false,
};

export default nextConfig;
