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
        Dải mở đầu (icon + tên bộ công cụ + phụ đề) đã bị bỏ khỏi màn hình theo yêu cầu chủ dự án
        — chỉ còn lại đúng một <h1> ẩn hẳn (`visually-hidden`, không `display: none`) để bộ máy
        tìm kiếm và trình đọc màn hình vẫn thấy tên + mô tả trang. `verify-static.mjs` đếm đúng
        MỘT <h1> trong out/index.html nên không thể xoá thẻ này, chỉ ẩn toàn bộ nó đi.
      */}
      <h1 className="visually-hidden">
        <T k="home.hero.title" />
        {' — '}
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
          {/*
            Phần ĐẾM tách ra một `<span>` riêng mang màu nhấn — bản thiết kế Figma "FINBOX
            VERSION 2" vẽ đúng dòng này hai màu: tên khối màu mực, "· 111 công thức" màu xanh.

            Vì sao không tô cả `<h2>`: `section-title.test.ts` chốt mọi tiêu đề khối dùng
            `--color-ink`, và đó là kết luận của đợt rà soát phân cấp ("xanh dành cho hành động
            và cho khối Kết quả"). Con số ở đây không phải tiêu đề mà là số liệu đi kèm, nên nó
            được phép mang màu nhấn mà không đụng vào luật ấy — luật vẫn nguyên trên `.blockTitle`.
          */}
          <h2 className={styles.blockTitle} id="home-browse">
            <T k="home.browse.title" />{' '}
            <span className={styles.blockCount}>
              · <ModeCount basic={basicCountOf()} advanced={TOTAL_EXPECTED} />{' '}
              <T k="home.browse.unit" />
            </span>
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
          Dòng "Thư viện đang hoàn thiện dần — hiện có 111/111" đã BỎ ở đợt theo bản thiết kế
          Figma "FINBOX VERSION 2", nơi trang chủ kết thúc ngay sau khối cuối.

          Bản trước giữ nó với lý do "hai vế sẽ lệch lại khi `expectedCount` được nâng tiếp".
          Lý do ấy không còn đứng được: nhánh 5 đã đủ 111/111, nên suốt từ đó tới nay dòng này in
          ra một phân số luôn bằng 1 — nó không báo tiến độ nào cả, chỉ chiếm một dòng ở đáy mọi
          lượt vào trang chủ. Ngày `expectedCount` được nâng thật thì `registry.test.ts` (chốt
          cứng 98 / 13 / 111) đỏ ngay, và đó mới là chỗ báo đúng người đúng lúc.
        */}
      </HomeSearchPanel>
    </div>
  );
}
