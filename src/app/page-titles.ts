import type { Bilingual } from '@/application';

/**
 * Tên của từng màn trên tab trình duyệt — MỘT nguồn cho hai nơi đọc (15/10/2026).
 *
 * `metadata.title` của mỗi `page.tsx` đọc `.vi` lúc build (HTML tĩnh, máy tìm kiếm thấy); lá
 * `DocumentTitle` đọc cả cặp lúc chạy và ghi đè tab khi người dùng đang ở EN. Viết hai lần ở hai
 * chỗ là để ngỏ đúng kiểu lệch mà bảng này tồn tại để chặn: đổi tên màn ở metadata mà quên bản
 * tiếng Anh.
 *
 * Không đặt ở từ điển i18n: `page.tsx` là server component và cửa `i18n.test.ts` không cho file
 * nào trong `src/app` import `t()` tĩnh ngoài ba chỗ đã ghi tên.
 */
export const PAGE_TITLES = {
  formulas: { vi: 'Công thức', en: 'Formulas' },
  search: { vi: 'Tìm công thức', en: 'Search formulas' },
  portfolio: { vi: 'Danh mục cá nhân', en: 'Portfolio' },
  dataTable: { vi: 'Bảng dữ liệu — chuỗi giá OHLCV', en: 'Data table: OHLCV price series' },
  settings: { vi: 'Cài đặt', en: 'Settings' },
  about: { vi: 'Về chúng tôi', en: 'About us' },
} as const satisfies Record<string, Bilingual>;

/** Tên tab của trang hướng dẫn một công thức: "Hướng dẫn: P/E — …" / "Guide: P/E …". */
export function guideTitle(name: Bilingual): Bilingual {
  return { vi: `Hướng dẫn: ${name.vi}`, en: `Guide: ${name.en}` };
}
