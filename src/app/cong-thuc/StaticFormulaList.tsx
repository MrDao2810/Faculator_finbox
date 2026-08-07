import { DEFAULT_LIST_PARAMS, FORMULA_SUMMARIES, selectFormulas, t } from '@/application';
import { FormulaCard } from '@/ui/browse';

import styles from './StaticFormulaList.module.css';

/**
 * Bản TĨNH của danh sách công thức — làm fallback cho Suspense của `FormulaBrowser` (đợt 14).
 *
 * Vì sao phải có: `useSearchParams()` trong FormulaBrowser khiến Next bỏ cả cây đó khỏi HTML
 * tĩnh (bailout sang dựng ở máy khách). `fallback={null}` nghĩa là `out/cong-thuc/index.html`
 * KHÔNG có lấy một link công thức nào — trang rỗng với Google, trong khi sitemap khai nó
 * priority 0.9 và gọi nó là URL chính danh. Fallback này là thứ được dựng sẵn vào HTML:
 * bộ máy tìm kiếm và người dùng chưa chạy xong JS đều thấy đủ danh sách.
 *
 * Server component thuần, KHÔNG bọc ô tìm/chip lọc: hai thứ đó cần callback, mà hàm không
 * truyền được qua ranh giới server → client. Khi hydrate xong, FormulaBrowser (có ô tìm,
 * chip lọc, và trạng thái từ URL) thế chỗ nguyên khối. Với URL mặc định, danh sách hai bên
 * giống hệt nhau nên cú thế chỗ không nhìn thấy được.
 *
 * Thứ tự lấy đúng `DEFAULT_LIST_PARAMS` qua cùng một `selectFormulas()` — lệch thứ tự với
 * FormulaBrowser là danh sách "nhảy" ngay lúc hydrate.
 */
export function StaticFormulaList() {
  const formulas = selectFormulas(FORMULA_SUMMARIES, DEFAULT_LIST_PARAMS);

  return (
    <div className={styles.static}>
      <p className={styles.count}>
        {formulas.length} {t('list.count')}
      </p>

      <ul className={styles.list} aria-label={t('list.label')}>
        {formulas.map((formula) => (
          <li key={formula.id} className={styles.item}>
            <FormulaCard formula={formula} />
          </li>
        ))}
      </ul>
    </div>
  );
}
