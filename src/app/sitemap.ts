import type { MetadataRoute } from 'next';

import { FORMULA_SUMMARIES, ROUTES, formulaPath } from '@/application';

import { absoluteUrl } from './site-url';

/**
 * Sơ đồ trang — FR-25.
 *
 * Sinh thành `sitemap.xml` tĩnh lúc build. Mỗi công thức một dòng, lấy thẳng từ Registry,
 * nên nhánh 5 thêm công thức là sitemap tự dài ra, không phải sửa file này.
 *
 * Tên miền lấy từ `site-url.ts`, dùng chung với `robots.ts`.
 */

// Bắt buộc với output: 'export' — sitemap phải là file tĩnh, không sinh theo từng request.
export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl(ROUTES.home), priority: 1 },
    { url: absoluteUrl(ROUTES.formulas), priority: 0.9 },
    { url: absoluteUrl(ROUTES.portfolio), priority: 0.5 },
    { url: absoluteUrl(ROUTES.settings), priority: 0.3 },
  ];

  const formulaPages: MetadataRoute.Sitemap = FORMULA_SUMMARIES.map((formula) => ({
    url: absoluteUrl(formulaPath(formula.id)),
    priority: formula.isFeatured === true ? 0.8 : 0.7,
  }));

  return [...staticPages, ...formulaPages];
}
