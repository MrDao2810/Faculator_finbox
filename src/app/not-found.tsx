'use client';

import Link from 'next/link';

import { ROUTES } from '@/application';
import { useT } from '@/application/preferences-context';
import { EmptyState } from '@/ui/browse';

import styles from './not-found.module.css';

/**
 * Trang 404 — đợt 14.
 *
 * Trước đợt này Next tự dựng bản mặc định: chữ tiếng Anh "This page could not be found",
 * nằm NGOÀI AppShell nên không thanh trên, không thanh dưới, không dải miễn trừ — người dùng
 * lạc vào là cụt đường. File này đặt ở `src/app/` nên được `layout.tsx` bọc như mọi màn khác;
 * bản build tĩnh phát ra `404.html`, đúng file mà hosting tĩnh (Cloudflare Pages) trả về
 * cho URL lạ.
 *
 * Hai lối ra thay vì một: URL sai hay gặp nhất ở đây là link công thức cũ, nên "Tìm công thức"
 * hữu ích hơn "Về danh sách công thức" — nhưng vẫn giữ cả hai cho người chỉ muốn thoát. Lối thứ hai
 * từng là "Về trang chủ"; từ khi trang chủ gộp vào màn Công thức (15/09/2026) nó dẫn thẳng tới đó.
 *
 * Không còn dòng giải thích nào dưới tiêu đề, ở mọi bề ngang (20/10/2026, chủ dự án khoanh hai câu
 * "Đường dẫn có thể nhập sai…" và "Thử tìm công thức theo tên…" rồi bảo xoá): tiêu đề cộng hai nút
 * đã đủ nói chuyện gì xảy ra và đi đâu tiếp. Mộ chí của hai khoá ở `vi.ts`.
 *
 * Là client component từ đợt 8 (luồng locale): chữ ở đây đi qua props string của `EmptyState`
 * nên không bọc lá `<T>` được, mà trang 404 cũng chẳng có gì đáng giữ ngoài gói máy khách.
 */
export default function NotFound() {
  const t = useT();

  return (
    <div className={styles.page}>
      <EmptyState
        title={t('notFound.title')}
        lines={[]}
        action={
          <span className={styles.actions}>
            <Link className={styles.primary} href={ROUTES.search}>
              {t('notFound.search')}
            </Link>
            <Link className={styles.secondary} href={ROUTES.formulas}>
              {t('notFound.formulas')}
            </Link>
          </span>
        }
      />
    </div>
  );
}
