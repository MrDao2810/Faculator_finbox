import Link from 'next/link';

import {
  CATEGORIES,
  FORMULAS,
  ROUTES,
  categoriesOf,
  createRegistry,
  expectedCountOf,
  featuredFormulas,
} from '@/application';
import { CategoryGrid, FormulaCard } from '@/ui/browse';
import { T } from '@/ui/i18n/T';

import { HomeSearchPanel } from './HomeSearchPanel';
import styles from './page.module.css';

/**
 * Màn WF-01 Trang chủ — gói WBS 3.1.1, dựng lại theo bản thiết kế hi-fi ở đợt 8.
 *
 * File này vẫn là **server component**: không hook, không state. Phần cần gõ được nằm trong
 * đúng một client island là `HomeSearchPanel`, còn ba khối bên dưới truyền vào nó qua
 * `children` nên vẫn do server dựng và không lọt vào gói JS của máy khách (NFR-PER-04).
 *
 * Trước đợt này ô tìm là một thẻ `<a>` trông giống ô nhập, bấm vào là nhảy sang `/tim-kiem/`.
 * Nay gõ được tại chỗ. Vì sao trạng thái tìm KHÔNG lên URL: xem docblock của `HomeSearchPanel`,
 * ở đó có cả số đo chứng minh.
 *
 * Dải miễn trừ FR-24 không nằm ở file này mà ở `AppShell`, để nó có mặt ở mọi màn chứ không
 * phụ thuộc việc người viết màn có nhớ thêm hay không.
 */

/** Dựng một lần lúc build — Registry là hằng số, không đổi giữa các lần render. */
const REGISTRY = createRegistry(FORMULAS);
const FEATURED = featuredFormulas(REGISTRY);

const TOTAL_EXPECTED = CATEGORIES.reduce((sum, c) => sum + c.expectedCount, 0);

export default function Home() {
  return (
    <div className={styles.page}>
      {/*
        Tiêu đề cấp một. Bản thiết kế không vẽ nó nên nó ẩn khỏi mắt — nhưng phải TỒN TẠI:
        trang chủ là URL priority 1.0 của sitemap mà trước đợt này cả tài liệu không có lấy
        một <h1> nào. Dùng `visually-hidden` chứ không `display: none`, để trình đọc màn hình
        và bộ máy tìm kiếm vẫn thấy.
      */}
      <h1 className="visually-hidden">
        <T k="home.h1" />
      </h1>

      {/*
        Ba khối dưới đây là NỘI DUNG LÚC CHƯA TÌM GÌ. Truyền qua children nên chúng vẫn do
        server dựng: CategoryGrid và nhánh `tile` của FormulaCard không lọt vào gói máy khách.
        Bắt đầu gõ là panel thay chỗ chúng bằng kết quả.
      */}
      <HomeSearchPanel>
        {/* ── Công thức dùng hằng ngày — FR-20 ─────────────────────────────── */}
        {FEATURED.length > 0 && (
          <section className={styles.block} aria-labelledby="home-featured">
            <h2 className={styles.blockTitle} id="home-featured">
              <T k="home.featured.title" />
            </h2>

            <ul className={styles.cards}>
              {FEATURED.map((formula) => (
                <li key={formula.id}>
                  <FormulaCard formula={formula} variant="tile" />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── Duyệt theo nhóm — FR-01 ──────────────────────────────────────── */}
        <section className={styles.block} aria-labelledby="home-browse">
          <h2 className={styles.blockTitle} id="home-browse">
            <T k="home.browse.title" /> · {TOTAL_EXPECTED} <T k="home.browse.unit" />
          </h2>

          <h3 className={styles.segment}>
            <T k="home.segment.stock" /> · {expectedCountOf('stock')}
          </h3>
          <CategoryGrid categories={categoriesOf('stock')} />

          <h3 className={styles.segment}>
            <T k="home.segment.personal" /> · {expectedCountOf('personal')}
          </h3>
          <CategoryGrid categories={categoriesOf('personal')} />
        </section>

        {/* ── Công cụ — lối vào những màn không có mục ở thanh dưới ─────────── */}
        {/*
          Thanh dưới chốt đúng bốn mục (WF-18), nên bảng dữ liệu WF-05 không có chỗ ở đó.
          Trước đợt này nó không có LẤY MỘT LINK NÀO trong cả giao diện — chỉ gõ URL tay mới
          tới được, dù màn đã dựng xong từ đợt 9.
        */}
        <section className={styles.block} aria-labelledby="home-tools">
          <h2 className={styles.blockTitle} id="home-tools">
            <T k="home.tools.title" />
          </h2>

          <ul className={styles.tools}>
            <li>
              <Link className={styles.tool} href={ROUTES.data}>
                <span className={styles.toolName}>
                  <T k="home.tools.data" />
                </span>
                <span className={styles.toolHint}>
                  <T k="home.tools.dataHint" />
                </span>
              </Link>
            </li>
          </ul>
        </section>

        {/*
          Số trên ô nhóm là số công thức DỰ KIẾN của SRS 3.8, không phải số đang bấm vào được.
          Từ đợt 8 lưới không còn nhãn "sắp có" nên đây là chỗ duy nhất còn nói thật tiến độ.
          Nhánh 5 nay đủ 108/108 nên hai vế trùng nhau, nhưng ĐỪNG xoá: chúng lệch lại ngay lần
          `expectedCount` được nâng tiếp — Beta của gói 3.3.2 là lần gần nhất đang chờ.
        */}
        <p className={styles.progress}>
          <T k="home.progress" /> {REGISTRY.formulas.length}/{TOTAL_EXPECTED}.
        </p>
      </HomeSearchPanel>
    </div>
  );
}
