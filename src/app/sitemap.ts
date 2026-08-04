import type { MetadataRoute } from 'next';

import { FORMULAS, ROUTES, formulaPath } from '@/application';

/**
 * Sơ đồ trang — FR-25.
 *
 * Sinh thành `sitemap.xml` tĩnh lúc build. Mỗi công thức một dòng, lấy thẳng từ Registry,
 * nên nhánh 5 thêm công thức là sitemap tự dài ra, không phải sửa file này.
 *
 * Đặt tên miền thật ở biến môi trường `NEXT_PUBLIC_SITE_URL` trên Cloudflare Pages.
 */

// Bắt buộc với output: 'export' — sitemap phải là file tĩnh, không sinh theo từng request.
export const dynamic = 'force-static';

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://falculator-finbox.pages.dev'
).replace(/\/+$/, '');

function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absolute(ROUTES.home), priority: 1 },
    { url: absolute(ROUTES.formulas), priority: 0.9 },
    { url: absolute(ROUTES.portfolio), priority: 0.5 },
    { url: absolute(ROUTES.settings), priority: 0.3 },
  ];

  const formulaPages: MetadataRoute.Sitemap = FORMULAS.map((formula) => ({
    url: absolute(formulaPath(formula.id)),
    priority: formula.isFeatured === true ? 0.8 : 0.7,
  }));

  return [...staticPages, ...formulaPages];
}
