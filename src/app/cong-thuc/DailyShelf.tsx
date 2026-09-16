import { FORMULA_SUMMARIES, dailyShelfFormulas } from '@/application';
import { FormulaCard } from '@/ui/browse';
import { T } from '@/ui/i18n/T';

import styles from './DailyShelf.module.css';
import { FeaturedFormulas } from './FeaturedFormulas';

/** `id` của tiêu đề kệ — `verify-static.mjs` và `chrome-check.mjs` tìm khối qua chính chuỗi này. */
export const SHELF_TITLE_ID = 'cong-thuc-hang-ngay';

/** Dựng một lần lúc build — Registry là hằng số, không đổi giữa các lần render. */
const SHELF = dailyShelfFormulas(FORMULA_SUMMARIES);

/**
 * Khối "Công thức dùng hằng ngày" ở đầu màn Công thức — FR-20.
 *
 * Từng là khối đầu của trang chủ; ngày 15/09/2026 trang chủ gộp vào đây. Kệ có 16 ô (xem
 * `daily-shelf.ts`), bày trước 8 ô theo bản vẽ; "Xem tất cả ›" cuối hàng tiêu đề bày nốt phần còn lại
 * ngay tại chỗ.
 *
 * Cùng ngày chủ dự án bỏ hai dòng chữ phụ của khối: câu báo "đã đưa công thức hay mở lên đầu" và link
 * "Bảng dữ liệu · Nhập hoặc dán chuỗi giá OHLCV…". Từ đó Bảng dữ liệu WF-05 chỉ còn MỘT lối vào: nút
 * mang `?from=` trên màn chi tiết của các công thức dùng chuỗi giá. Màn ấy không có mục nav, không
 * nằm trong sitemap và đặt `noindex` (xem `du-lieu/page.tsx`).
 *
 * ── SERVER component, truyền vào màn client qua prop ──────────────────────────────────────────
 *
 * `FormulaListScreen` là client component (nó giữ trạng thái lọc), nhưng khối này không cần gì của
 * máy khách để HIỆN RA: tám thẻ đầu là ứng viên LCP của màn mở đầu, nên chúng phải có sẵn trong HTML
 * tĩnh và không được chờ một dòng JavaScript nào. Dựng ở đây rồi truyền node xuống qua prop `shelf`
 * — cùng lối trang chủ cũ truyền kệ vào `HomeSearchPanel` qua `children`. Import thẳng vào màn client
 * thì nhánh `tile` của `FormulaCard` rơi vào gói máy khách và thẻ chỉ hiện sau khi hydrate.
 *
 * Phần duy nhất cần máy khách là `FeaturedFormulas` (sắp lại theo lịch sử, mở/thu kệ) — một lá client
 * nhỏ, dựng ra đúng HTML tĩnh ở lượt đầu. Tiêu đề vẫn dựng ở đây và đi vào lá ấy qua `heading`, để
 * nó đứng cùng hàng với nút mà không thành chữ của máy khách.
 */
export function DailyShelf() {
  return (
    <section className={styles.shelf} aria-labelledby={SHELF_TITLE_ID}>
      <FeaturedFormulas
        heading={
          <h2 className={styles.blockTitle} id={SHELF_TITLE_ID}>
            <T k="shelf.title" />
          </h2>
        }
        pinned={SHELF.map((formula) => ({
          id: formula.id,
          card: <FormulaCard formula={formula} variant="tile" />,
        }))}
      />
    </section>
  );
}
