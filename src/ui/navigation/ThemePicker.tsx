'use client';

import type { Theme } from '@/application';
import { usePreferences, useT } from '@/application/preferences-context';

import styles from './ThemePicker.module.css';

const OPTIONS: ReadonlyArray<{ value: Theme; labelKey: 'theme.light' | 'theme.dark' }> = [
  { value: 'light', labelKey: 'theme.light' },
  { value: 'dark', labelKey: 'theme.dark' },
];

/**
 * Cụm chọn bảng màu Sáng / Tối ở màn Cài đặt (WF-13) — hai ô có CHỮ.
 *
 * Cùng khuôn `ModeToggle`, và cố ý đứng ngay dưới nó: hai hàng cạnh nhau trong cùng một khối thì
 * phải cùng hình, lệch hình là đọc thành hai loại điều khiển khác nhau. `aria-pressed` chứ không
 * phải radio, vì đây là hai nút thao tác tức thì chứ không phải một trường trong form.
 *
 * Vì sao ở đây là CHỮ chứ không phải icon như trên thanh trên (`ThemeSwitch`): màn Cài đặt là chỗ
 * người ta tới để ĐỌC xem mình đang đặt gì. Một icon đơn lẻ bắt người dùng đoán "mặt trời nghĩa là
 * đang sáng, hay bấm vào thì thành sáng?" — mơ hồ đúng chỗ không được phép mơ hồ. Trên thanh trên
 * thì ngược lại: chỗ hẹp, và nút nằm cạnh `LangSwitch` vốn cũng là một nút bấm-là-đổi.
 *
 * Hai component nhưng MỘT nguồn sự thật: cả hai đọc và ghi qua `usePreferences`, không cái nào
 * giữ state riêng. Việc áp màu do `PreferencesProvider` lo — nó ghi `data-theme` lên `<html>`.
 */
export function ThemePicker() {
  const { theme, setTheme } = usePreferences();
  const t = useT();

  return (
    <div className={styles.group} role="group" aria-label={t('theme.label')}>
      {OPTIONS.map((option) => {
        const selected = option.value === theme;
        return (
          <button
            key={option.value}
            type="button"
            className={selected ? `${styles.option} ${styles.selected}` : styles.option}
            aria-pressed={selected}
            onClick={() => {
              setTheme(option.value);
            }}
          >
            {t(option.labelKey)}
          </button>
        );
      })}
    </div>
  );
}
