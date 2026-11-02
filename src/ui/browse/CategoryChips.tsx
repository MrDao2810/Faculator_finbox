'use client';

import { CATEGORIES } from '@/application';
import { usePick, useT } from '@/application/preferences-context';

import styles from './CategoryChips.module.css';

export interface CategoryChipsProps {
  /** Nhóm đang chọn — `null` là "Tất cả". */
  value: string | null;
  onChange: (categoryId: string | null) => void;
  /** Số công thức khớp của từng nhóm ở chế độ **Cơ bản** — `countByCategoryFor(bộ Cơ bản, …)`. */
  basicCounts: ReadonlyMap<string, number>;
  /** Số công thức khớp của từng nhóm trên CẢ thư viện — con số của chế độ Nâng cao. */
  allCounts: ReadonlyMap<string, number>;
}

/** `name` chung của nhóm radio. Chuỗi cứng chứ không `useId()` — cùng lý do `PANEL_ID` cũ. */
const GROUP_NAME = 'nhom-cong-thuc';

/**
 * Hàng chip nhóm — bộ lọc nhóm của màn Công thức (bản vẽ gộp trang chủ, 15/09/2026).
 *
 * Thay cho cặp "ba tab mảng + `<select>` 12 nhóm" của `CategoryFilter` cũ. Lý do cũ để giữ
 * `<select>` — *"12 mục thì không thành hàng tab được ở 360px"* — nay được gỡ bằng đúng thứ bản vẽ
 * vẽ: hàng chip CUỘN NGANG, nên 13 lựa chọn không phải chen vào một bề ngang.
 *
 * ── Radio thật, không phải `Chip` (`aria-pressed`) ────────────────────────────────────────────
 *
 * Chủ dự án từng bác `Chip` cho bộ lọc loại trừ nhau: `aria-pressed` đọc ra "nút bật/tắt", nên 13
 * chip thành 13 công tắc độc lập trong khi thật ra chọn cái này là bỏ cái kia. Radio trong một
 * `fieldset` nói đúng quan hệ ấy ("1 trên 13"), phím mũi tên chạy sẵn không cần một dòng mã roving
 * tabindex nào, và chip đang nhận tiêu điểm tự được cuộn vào tầm nhìn. Ô radio ẩn khỏi mắt nhưng vẫn
 * nhận tiêu điểm; phần nhìn thấy là thẻ `span` ngay sau nó, CSS vẽ trạng thái qua `:checked`.
 *
 * ── Con số: dựng CẢ HAI, CSS chọn theo `data-mode` ────────────────────────────────────────────
 *
 * Cùng cơ chế `ModeToggle` và lưới nhóm cũ ở trang chủ. Lượt render đầu ở máy khách buộc là chế độ
 * Cơ bản (khớp HTML tĩnh), nên để React chọn con số là người dùng Nâng cao thấy "Rủi ro · 6" nháy
 * thành "Rủi ro · 18" mỗi lần tải trang. Nhóm mà chế độ Cơ bản giấu sạch (`corporate-finance`) in
 * chữ "chỉ ở Nâng cao" thay số 0 — số 0 đọc ra là "nhóm rỗng", đúng kiểu im lặng FR-06 chặn.
 *
 * ── Từ 1024px hàng chip XUỐNG DÒNG, không còn nút ‹ › ─────────────────────────────────────────
 *
 * Trên điện thoại hàng chip vẫn vuốt ngang trong khung riêng. Trên PC từng có hai nút ‹ › cuộn từng
 * bốn phần năm khung, vì ở đó không có thanh cuộn nhìn thấy; chủ dự án bỏ cả hai (02/11/2026):
 * _"không dùng mũi tên nữa mà cho hiển thị hết ra"_. Từ 1024px khung thôi cuộn và nhóm chip xuống
 * dòng, nên cả 13 lựa chọn nằm sẵn trên màn — toàn bộ là CSS (`CategoryChips.module.css`), component
 * không còn đo bề ngang hay giữ state nào. Mộ chí hai khoá nhãn ở `vi.ts`.
 */
export function CategoryChips({ value, onChange, basicCounts, allCounts }: CategoryChipsProps) {
  const t = useT();
  const pick = usePick();

  return (
    <div className={styles.scroller}>
      <fieldset className={styles.group}>
        <legend className="visually-hidden">{t('filter.category.label')}</legend>

        <label className={styles.chip}>
          <input
            className="visually-hidden"
            type="radio"
            name={GROUP_NAME}
            value=""
            checked={value === null}
            onChange={() => {
              onChange(null);
            }}
          />
          <span className={styles.face}>{t('filter.category.all')}</span>
        </label>

        {CATEGORIES.map((category) => {
          const basic = basicCounts.get(category.id) ?? 0;
          const all = allCounts.get(category.id) ?? 0;
          /* Rỗng VÌ CHẾ ĐỘ, không phải vì chuỗi tìm: cả thư viện vẫn có kết quả cho nhóm này. */
          const basicEmpty = basic === 0 && all > 0;

          return (
            <label key={category.id} className={styles.chip}>
              <input
                className="visually-hidden"
                type="radio"
                name={GROUP_NAME}
                value={category.id}
                checked={value === category.id}
                onChange={() => {
                  onChange(category.id);
                }}
              />
              <span className={styles.face}>
                {pick(category.shortName)}
                {/* Dấu chấm giữa là phần nhìn — trình đọc màn hình đọc "Định giá 8" là đủ. */}
                <span className={styles.dot} aria-hidden="true">
                  ·
                </span>
                <span className={`${styles.count} ${styles.countBasic}`}>
                  {basicEmpty ? t('filter.category.advancedOnly') : basic}
                </span>
                <span className={`${styles.count} ${styles.countAdvanced}`}>{all}</span>
              </span>
            </label>
          );
        })}
      </fieldset>
    </div>
  );
}
