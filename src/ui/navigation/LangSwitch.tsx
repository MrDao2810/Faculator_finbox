'use client';

import { usePreferences, useT } from '@/application/preferences-context';

import styles from './LangSwitch.module.css';

/**
 * Nút chuyển ngôn ngữ — gói WBS 2.1.1, đổi thành công tắc hai chiều ở đợt 8.
 *
 * Một nút chứ không phải hai: bản thiết kế chỉ vẽ một ô, và chủ dự án chốt bấm vào là đổi
 * qua lại VI ↔ EN. Chữ trên nút là ngôn ngữ **đang dùng**, còn `aria-label` nói rõ hành động
 * sẽ xảy ra, để trình đọc màn hình không phải đoán.
 *
 * ── Vì sao KHÔNG còn `title` cảnh báo "bản EN đang dịch dở" ─────────────────────────────────
 *
 * Nút này từng mang `title={t('lang.enPartial')}`, hiện ra khi rê chuột: "Bản tiếng Anh đang dịch
 * dở — câu chưa dịch vẫn hiện tiếng Việt". Câu ấy nay **sai**: `missingKeys('en')` đã rỗng, và
 * nội dung công thức cũng đã dịch trọn dưới dạng `Bilingual` ở Domain — xem docblock đầu `en.ts`.
 * Mấy khối còn tiếng Việt (metadata SEO build-time, `StaticFormulaList`, file PDF/PNG xuất ra)
 * là **cố ý theo thiết kế**, không phải nợ dịch, nên gọi chúng là "dịch dở" là nói sai về chính
 * sản phẩm — đúng loại sai mà FR-06 tồn tại để chặn, chỉ khác là ở tầng câu chữ.
 *
 * Gỡ luôn khoá `lang.enPartial` khỏi cả hai từ điển chứ không chỉ bỏ thuộc tính: cửa khoá mồ côi
 * ở `i18n.test.ts` đỏ ngay nếu để lại một khoá không nơi nào đọc.
 */
export function LangSwitch() {
  const { locale, setLocale } = usePreferences();
  const t = useT();
  const isVi = locale === 'vi';

  return (
    <button
      type="button"
      className={styles.button}
      aria-label={t(isVi ? 'lang.switchToEn' : 'lang.switchToVi')}
      onClick={() => {
        setLocale(isVi ? 'en' : 'vi');
      }}
    >
      {t(isVi ? 'lang.vi' : 'lang.en')}
    </button>
  );
}
