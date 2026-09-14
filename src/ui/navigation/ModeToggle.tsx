'use client';

import { usePreferences, useT } from '@/application/preferences-context';
import type { Level } from '@/application';

import styles from './ModeToggle.module.css';

/**
 * Hai lựa chọn, mỗi cái mang một lớp CSS CỐ ĐỊNH của riêng nó.
 *
 * Lớp ấy không nói "đang chọn" — nó chỉ nói "đây là nút Cơ bản" / "đây là nút Nâng cao", để
 * `ModeToggle.module.css` tự quyết cái nào sáng lên theo `data-mode` trên `<html>`. Xem docblock
 * của component ngay dưới.
 */
const OPTIONS: ReadonlyArray<{
  value: Level;
  labelKey: 'mode.basic' | 'mode.advanced';
  optionClass: 'optionBasic' | 'optionAdvanced';
}> = [
  { value: 'basic', labelKey: 'mode.basic', optionClass: 'optionBasic' },
  { value: 'advanced', labelKey: 'mode.advanced', optionClass: 'optionAdvanced' },
];

/**
 * Nút chuyển chế độ Cơ bản / Nâng cao — gói WBS 2.1.1.
 *
 * FR-09: chế độ Cơ bản ẩn biến nâng cao và ưu tiên giải thích; Nâng cao mở toàn bộ tham số.
 * Lựa chọn ghi qua usePreferences nên nhớ được sau khi tải lại trang (SW-02).
 *
 * Dùng aria-pressed chứ không phải radio, vì đây là hai nút thao tác tức thì
 * chứ không phải một trường trong form.
 *
 * ── CSS chọn nút nào đang sáng, KHÔNG phải React ────────────────────────────────────────────
 *
 * Cùng cách và cùng lý do với `ThemeSwitch` ngay cạnh. Lượt render đầu ở máy khách bắt buộc là
 * `DEFAULT_PREFERENCES`, tức `mode: 'basic'` — có thế mới khớp HTML tĩnh. Nên khi React quyết
 * nút nào sáng, người đã chọn **Nâng cao** thấy ô sáng nằm ở "Cơ bản" lúc trang vừa hiện, rồi
 * nhảy sang "Nâng cao" khi `PreferencesProvider` đọc xong `localStorage`. Đó đúng là cái nháy
 * buổi test nội bộ báo ở cụm lọc này (mục #21), và nó xảy ra ở MỌI lần tải trang của người dùng
 * Nâng cao, không phải thỉnh thoảng.
 *
 * Chữa bằng cách bỏ hẳn quyết định ấy khỏi React: hai nút luôn mang đúng một lớp cố định, còn
 * `data-mode` trên `<html>` — do `THEME_BOOT_SCRIPT` đặt TRƯỚC lượt vẽ đầu và `PreferencesProvider`
 * giữ đồng bộ sau đó — mới là thứ chọn. Nút đúng sáng ngay từ pixel đầu tiên, và đúng cả khi JS
 * hỏng hoàn toàn. Đây cũng là cơ chế mà con số công thức của từng nhóm ở trang chủ đã dùng
 * (`CategoryGrid`), nên toàn sản phẩm chỉ có một cách hiểu `data-mode`.
 *
 * `aria-pressed` thì VẪN do React quyết, nên nó còn lệch một nhịp trước hydrate — chấp nhận được
 * và giống hệt `ThemeSwitch`/`LangSwitch`: trình đọc màn hình dựng cây trợ năng sau khi trang tải
 * xong. Đổi lại, nó là chỗ duy nhất nói ra trạng thái cho bộ kiểm và cho trình đọc màn hình, nên
 * đừng gỡ.
 */
export function ModeToggle() {
  const { mode, setMode } = usePreferences();
  const t = useT();

  return (
    <div className={styles.group} role="group" aria-label={t('mode.label')}>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`${styles.option} ${styles[option.optionClass]}`}
          aria-pressed={option.value === mode}
          onClick={() => {
            setMode(option.value);
          }}
        >
          {t(option.labelKey)}
        </button>
      ))}
    </div>
  );
}
