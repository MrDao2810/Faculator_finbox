import Link from 'next/link';

import {
  CATEGORIES,
  FORMULAS,
  FORMULA_SUMMARIES,
  ROUTES,
  categoriesOf,
  createRegistry,
  expectedCountOf,
  featuredFormulas,
  formulasForLevel,
} from '@/application';
import type { Category } from '@/application';
import { CategoryGrid, FormulaCard } from '@/ui/browse';
import { T } from '@/ui/i18n/T';

import { FeaturedFormulas } from './FeaturedFormulas';
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

/**
 * Số công thức xem được ở chế độ **Cơ bản**, theo nhóm — dựng một lần lúc build.
 *
 * Chế độ Cơ bản với tới 79 / 111 công thức, nên ở chế độ ấy mọi con số `expectedCount` trên màn
 * này đều nói quá. Cả hai con số được dựng sẵn vào HTML và CSS chọn theo `data-mode` — lý do
 * đầy đủ ở docblock `CategoryGrid`, và chính `formulasForLevel()` là hàm màn danh sách dùng để
 * cắt bộ công thức, nên hai màn không thể lệch định nghĩa "xem được".
 */
const BASIC_COUNTS: ReadonlyMap<string, number> = (() => {
  const counts = new Map<string, number>(CATEGORIES.map((c) => [c.id, 0]));
  for (const formula of formulasForLevel(FORMULA_SUMMARIES, 'basic')) {
    counts.set(formula.categoryId, (counts.get(formula.categoryId) ?? 0) + 1);
  }
  return counts;
})();

/** Tổng số xem được ở chế độ Cơ bản, cho cả thư viện hoặc một mảng. */
function basicCountOf(segment?: Category['segment']): number {
  return CATEGORIES.filter((c) => segment === undefined || c.segment === segment).reduce(
    (sum, c) => sum + (BASIC_COUNTS.get(c.id) ?? 0),
    0,
  );
}

/**
 * Cặp con số "Cơ bản / Nâng cao" đứng trong một dòng tiêu đề.
 *
 * Cùng cơ chế với hai badge trên ô nhóm, chỉ khác chỗ đặt — xem `page.module.css`.
 */
function ModeCount({ basic, advanced }: { basic: number; advanced: number }) {
  return (
    <>
      <span className={styles.countBasic}>{basic}</span>
      <span className={styles.countAdvanced}>{advanced}</span>
    </>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      {/*
        Dải mở đầu — bản thiết kế đợt 12. Đứng NGOÀI `HomeSearchPanel` có chủ đích: nó do server
        dựng (0 byte JS), và nó không biến mất khi người dùng bắt đầu gõ tìm.

        Thẻ <h1> gánh hai việc cùng lúc. Phần thấy được là tên bộ công cụ, đúng bản vẽ; phần ẩn
        là câu mô tả dài mà bộ máy tìm kiếm đọc — trang chủ là URL priority 1.0 của sitemap, và
        một <h1> chỉ có tên thương hiệu thì không nói gì về nội dung trang. `visually-hidden` chứ
        không `display: none`, để trình đọc màn hình và Google vẫn thấy.

        `verify-static.mjs` đếm đúng MỘT <h1> trong out/index.html — gộp hai vế vào một thẻ như
        đây là cách giữ cả hai mà không phá điều đó.
      */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3 21 8v8l-9 5-9-5V8l9-5Z" />
            <path d="M3 8l9 5 9-5M12 13v8" />
          </svg>
        </span>

        <span className={styles.heroText}>
          <h1 className={styles.heroTitle}>
            <T k="home.hero.title" />
            <span className="visually-hidden">
              {' — '}
              <T k="home.h1" />
            </span>
          </h1>
          <p className={styles.heroSubtitle}>
            {/* Con số đếm từ Registry lúc dựng, không nằm trong chuỗi dịch. */}
            {REGISTRY.formulas.length} <T k="home.hero.subtitle" />
          </p>
        </span>
      </header>

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

            {/*
              Thẻ vẫn do SERVER dựng ở đây rồi truyền xuống — `FeaturedFormulas` chỉ sắp lại thứ
              tự theo lịch sử trên máy. Nhờ vậy 18 link công thức không phụ thuộc một dòng mã
              máy khách nào và `out/index.html` giữ nguyên phần Google đang đọc được.
            */}
            <FeaturedFormulas
              pinned={FEATURED.map((formula) => ({
                id: formula.id,
                card: <FormulaCard formula={formula} variant="tile" />,
              }))}
            />
          </section>
        )}

        {/* ── Duyệt theo nhóm — FR-01 ──────────────────────────────────────── */}
        <section className={styles.block} aria-labelledby="home-browse">
          <h2 className={styles.blockTitle} id="home-browse">
            <T k="home.browse.title" /> ·{' '}
            <ModeCount basic={basicCountOf()} advanced={TOTAL_EXPECTED} />{' '}
            <T k="home.browse.unit" />
          </h2>

          <h3 className={styles.segment}>
            <T k="home.segment.stock" /> ·{' '}
            <ModeCount basic={basicCountOf('stock')} advanced={expectedCountOf('stock')} />
          </h3>
          <CategoryGrid categories={categoriesOf('stock')} basicCounts={BASIC_COUNTS} />

          <h3 className={styles.segment}>
            <T k="home.segment.personal" /> ·{' '}
            <ModeCount basic={basicCountOf('personal')} advanced={expectedCountOf('personal')} />
          </h3>
          <CategoryGrid categories={categoriesOf('personal')} basicCounts={BASIC_COUNTS} />
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
          Nhánh 5 nay đủ 111/111 nên hai vế trùng nhau, nhưng ĐỪNG xoá: chúng lệch lại ngay lần
          `expectedCount` được nâng tiếp — Beta của gói 3.3.2 là lần gần nhất đang chờ.
        */}
        <p className={styles.progress}>
          <T k="home.progress" /> {REGISTRY.formulas.length}/{TOTAL_EXPECTED}.
        </p>
      </HomeSearchPanel>
    </div>
  );
}
