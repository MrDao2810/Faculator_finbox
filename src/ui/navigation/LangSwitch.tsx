'use client';

import { t } from '@/application';
import { usePreferences } from '@/application/preferences-context';

import styles from './LangSwitch.module.css';

/**
 * Nút chuyển ngôn ngữ — gói WBS 2.1.1, đổi thành công tắc hai chiều ở đợt 8.
 *
 * Một nút chứ không phải hai: bản thiết kế chỉ vẽ một ô, và chủ dự án chốt bấm vào là đổi
 * qua lại VI ↔ EN. Chữ trên nút là ngôn ngữ **đang dùng**, còn `aria-label` nói rõ hành động
 * sẽ xảy ra, để trình đọc màn hình không phải đoán.
 *
 * Bản dịch tiếng Anh (gói WBS 3.6.3) chưa có câu nào; `t()` tự rơi về tiếng Việt nên bấm sang
 * EN thì giao diện vẫn đọc được chứ không ra key trần. `title` nói trước điều đó.
 */
export function LangSwitch() {
  const { locale, setLocale } = usePreferences();
  const isVi = locale === 'vi';

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={t(isVi ? 'lang.switchToEn' : 'lang.switchToVi')}
      title={isVi ? t('lang.enPartial') : undefined}
      onClick={() => {
        setLocale(isVi ? 'en' : 'vi');
      }}
    >
      {t(isVi ? 'lang.vi' : 'lang.en')}
    </button>
  );
}
