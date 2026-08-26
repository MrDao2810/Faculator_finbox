'use client';

import { usePreferences, useT } from '@/application/preferences-context';

import styles from './ThemeSwitch.module.css';

/**
 * Nút đổi giao diện trên thanh trên — MỘT icon, bấm là đổi.
 *
 * Cùng khuôn `LangSwitch` đứng ngay cạnh: một nút chứ không phải hai, icon nói **đang ở đâu**
 * (mặt trời = đang sáng), còn `aria-label` và `title` nói **bấm vào thì gì xảy ra**. Hai nút
 * bấm-là-đổi nằm sát nhau mà một cái bày trạng thái hiện tại, cái kia bày đích đến, thì người
 * dùng không có cách nào đoán đúng cả hai — nên chúng theo cùng một quy ước.
 *
 * Bản có CHỮ nằm ở màn Cài đặt (`ThemePicker`); chỗ đó cần đọc được, không cần gọn.
 *
 * **Hai icon cùng nằm trong DOM, CSS chọn cái nào hiện theo `data-theme`** — không phải React
 * chọn. Đây là điểm khác biệt có chủ đích: lượt render đầu luôn là `theme: 'light'` (phải thế thì
 * mới khớp HTML tĩnh), nên nếu để React chọn thì người đã bật Tối sẽ thấy mặt trời trên nền tối
 * cho tới khi hydrate xong. Cả cái script chặn nháy ở `layout.tsx` sinh ra là để tránh đúng loại
 * sai lệch ấy; để icon lệch lại thì hoá ra vá một nửa. Cho CSS chọn thì icon đúng ngay từ lượt vẽ
 * đầu, và đúng cả khi JS hỏng hoàn toàn.
 *
 * `aria-label` vẫn do React quyết nên nó còn lệch một nhịp trước hydrate — chấp nhận được và
 * giống hệt `LangSwitch`: trình đọc màn hình đọc sau khi trang tải xong.
 */
export function ThemeSwitch() {
  const { theme, setTheme } = usePreferences();
  const t = useT();
  const isDark = theme === 'dark';
  const label = t(isDark ? 'theme.switchToLight' : 'theme.switchToDark');

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={label}
      title={label}
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
    >
      {/* Mặt trời — hiện khi đang ở bảng sáng. */}
      <svg
        className={styles.sun}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <line x1="12" y1="1.5" x2="12" y2="3.5" />
        <line x1="12" y1="20.5" x2="12" y2="22.5" />
        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
        <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
        <line x1="1.5" y1="12" x2="3.5" y2="12" />
        <line x1="20.5" y1="12" x2="22.5" y2="12" />
        <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
      </svg>

      {/* Mặt trăng khuyết — hiện khi đang ở bảng tối. */}
      <svg
        className={styles.moon}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.5 14.3A8.5 8.5 0 1 1 9.7 3.5a6.6 6.6 0 0 0 10.8 10.8z" />
      </svg>
    </button>
  );
}
