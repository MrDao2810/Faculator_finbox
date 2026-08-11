import type { MetadataRoute } from 'next';

import { absoluteUrl } from './site-url';

/**
 * `robots.txt` — sinh lúc build thay vì nằm sẵn trong `public/`.
 *
 * Đổi chỗ vì đúng một dòng: `Sitemap:` phải mang tên miền thật, mà tên miền thật chỉ biết qua
 * `NEXT_PUBLIC_SITE_URL` lúc build. File tĩnh trong `public/` không đọc được biến môi trường,
 * nên bản cũ ghi cứng `pages.dev` kèm lời dặn nhớ sửa tay — xem `site-url.ts` để biết vì sao
 * lời dặn ấy không đủ.
 *
 * Cho phép mọi bot. Trang không muốn lên chỉ mục — `/tim-kiem/` — tự khai `noindex` trong
 * metadata của chính nó; chặn ở đây thì bot không vào đọc được thẻ ấy, thành ra chặn hụt.
 */

// Bắt buộc với output: 'export' — robots.txt phải là file tĩnh, không sinh theo từng request.
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: absoluteUrl('/sitemap.xml'),
  };
}
