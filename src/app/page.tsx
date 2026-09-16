import type { Metadata } from 'next';
import Link from 'next/link';

import { ROUTES } from '@/application';
import { T } from '@/ui/i18n/T';

import styles from './page.module.css';

/*
 * `noindex` — trang này không có nội dung, chỉ chuyển hướng. `follow` để bộ máy tìm kiếm vẫn đi
 * theo link sang `/cong-thuc/`, nơi nội dung thật nằm (FR-25: một nội dung, một URL).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

/**
 * `/` — chuyển hướng về màn Công thức. Trang chủ riêng đã gộp vào `/cong-thuc/` ngày 15/09/2026.
 *
 * ── Ba lớp, mỗi lớp cho một môi trường ────────────────────────────────────────────────────────
 *
 *   1. **Bản triển khai**: `public/_redirects` trả 301 ngay ở tầng hosting — trình duyệt không bao giờ
 *      tải trang này. Đó là lớp chính, và là lớp duy nhất bộ máy tìm kiếm hiểu là "đã dời hẳn".
 *   2. **Máy chạy thử** (`next dev`, `npm run preview`, máy chủ riêng của `check:chrome`): không đọc
 *      `_redirects`, nên trang này có mặt và tự chuyển bằng `<meta http-equiv="refresh">`. React 19
 *      tự đưa thẻ `<meta>` lên `<head>` dù nó được dựng ở đây. Chạy được KHÔNG CẦN JavaScript, nên
 *      nhanh hơn một cú `location.replace` phải chờ tải gói JS.
 *   3. **Không gì chạy cả**: link nhìn thấy được, bấm tay.
 *
 * Không `<link rel="canonical">`: Google khuyên không trộn `noindex` với canonical trên cùng trang.
 *
 * PWA đã cài từ trước vẫn mở `/` — `manifest.webmanifest` giữ `"id": "/"` cho danh tính app không đổi,
 * và cú mở ấy đi qua đúng các lớp trên.
 */
export default function RootRedirect() {
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
