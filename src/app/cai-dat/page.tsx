import type { Metadata } from 'next';
import Link from 'next/link';

import { ROUTES, SETTINGS_ENABLED } from '@/application';
import { DocumentTitle } from '@/ui/i18n/DocumentTitle';
import { T } from '@/ui/i18n/T';

import { PAGE_TITLES } from '../page-titles';
import styles from '../page.module.css';
import { SettingsScreen } from './SettingsScreen';

/*
 * Ẩn tạm (16/11/2026, `SETTINGS_ENABLED`): trang không còn nội dung, chỉ chuyển hướng, nên `noindex`
 * như `/` — `follow` để bộ máy tìm kiếm vẫn đi theo link sang `/cong-thuc/`.
 */
export const metadata: Metadata = SETTINGS_ENABLED
  ? {
      title: PAGE_TITLES.settings.vi,
      description: 'Chế độ hiển thị, đơn vị và biểu phí, dữ liệu cục bộ, thông tin sản phẩm.',
    }
  : { robots: { index: false, follow: true } };

/**
 * Màn WF-13 Cài đặt — gói WBS 3.6.1.
 *
 * Phần động nằm ở `SettingsScreen`: nó đọc `localStorage` để nói cỡ từng mục dữ liệu, nên
 * bắt buộc là client component. Ở đây chỉ có metadata.
 *
 * KHÔNG có `<Suspense>` vì màn không dùng `useSearchParams()` — trang vẫn giữ nguyên HTML tĩnh.
 *
 * Khi `SETTINGS_ENABLED` tắt, trang chuyển về `/cong-thuc/` y như `src/app/page.tsx` (thẻ
 * `<meta http-equiv="refresh">`, chạy không cần JS; link nhìn thấy được cho trường hợp không gì chạy).
 * Không thêm dòng vào `public/_redirects`: ẩn tạm thì bật lại chỉ cần đổi một công tắc.
 */
export default function SettingsPage() {
  if (!SETTINGS_ENABLED) {
    return (
      <div className={styles.page}>
        <meta httpEquiv="refresh" content={`0;url=${ROUTES.formulas}`} />
        <p className={styles.note}>
          <Link href={ROUTES.formulas}>
            <T k="notFound.formulas" />
          </Link>
        </p>
      </div>
    );
  }
  return (
    <>
      <DocumentTitle title={PAGE_TITLES.settings} />
      <SettingsScreen />
    </>
  );
}
