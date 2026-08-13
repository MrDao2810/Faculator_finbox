import Link from 'next/link';

import { ROUTES, t } from '@/application';

import styles from './AppHeader.module.css';
import { BrandMark } from './BrandMark';
import { ModeToggle } from './ModeToggle';
import { SearchLink } from './SearchLink';

/**
 * Thanh trên — gói WBS 2.1.1, dựng lại theo bản thiết kế hi-fi ở đợt 8.
 *
 * Khối hộp + tên "Faculator", nút chuyển chế độ Cơ bản / Nâng cao, nút tìm kiếm, nút ngôn ngữ.
 * Dính trên khi cuộn để mấy nút này luôn với tới được trên điện thoại.
 *
 * Tên rút còn "Faculator" chứ không phải "Faculator Finbox": ở 360px, tên đầy đủ cộng hai
 * cụm nút không đủ chỗ, và bản thiết kế cũng chỉ ghi một chữ. Tên đầy đủ vẫn là `app.name`,
 * dùng ở tiêu đề trang và metadata.
 */
export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href={ROUTES.home} className={styles.brand}>
          <BrandMark />
          <span className={styles.name}>{t('app.brand')}</span>
        </Link>

        <div className={styles.controls}>
          <ModeToggle />
          <SearchLink />
          {/*
            LangSwitch cố ý KHÔNG nằm ở đây cho tới v1.0 (quyết định của chủ dự án, đợt 14):
            `en.ts` chưa có câu nào và `t()` chưa call site nào truyền locale, nên nút bấm
            không đổi được gì trên màn — một nút chết tệ hơn không có nút. FR-21 vốn xếp ở
            v1.0; khi gói 3.6.3 thông luồng locale + có bản dịch thì lắp lại một dòng là xong.
          */}
        </div>
      </div>
    </header>
  );
}
