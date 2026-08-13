/**
 * Tên miền thật của bản đã phát hành — MỘT nguồn sự thật cho `sitemap.xml` và `robots.txt`.
 *
 * Trước đây tên miền nằm ở hai chỗ: `sitemap.ts` đọc biến môi trường, còn `public/robots.txt`
 * ghi cứng chuỗi `pages.dev` kèm một dòng chú thích dặn "nhớ đổi cùng lúc". Một lời dặn không
 * phải là một cơ chế: quên đổi thì `robots.txt` chỉ bot sang sitemap ở tên miền cũ, và không
 * phép kiểm nào đỏ vì cả hai file đều hợp lệ. Nay `robots.txt` được SINH ra từ đúng hằng số
 * này, nên chỉ còn một chỗ để quên, và quên thì cả hai cùng sai theo cùng một cách — thấy ngay.
 *
 * Đặt `NEXT_PUBLIC_SITE_URL` ở Environment variables của Cloudflare Pages (FR-25). Không đặt
 * thì rơi về tên miền `*.pages.dev` mặc định, vẫn chạy được — bản xem thử của mỗi Pull Request
 * đứng ở đó.
 *
 * Cắt dấu `/` thừa ở cuối: `https://x.vn/` cộng `/cong-thuc/` sẽ ra `//cong-thuc/`.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://faculator-finbox.pages.dev'
).replace(/\/+$/, '');

/** Ghép đường dẫn nội bộ thành URL tuyệt đối. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
