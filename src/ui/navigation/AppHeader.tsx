import Link from 'next/link';

import { ROUTES } from '@/application';

import { T } from '../i18n/T';
import styles from './AppHeader.module.css';
import { BrandMark } from './BrandMark';
import { HeaderModeToggle } from './HeaderModeToggle';
import { HeaderNav } from './HeaderNav';
import { LangSwitch } from './LangSwitch';
import { SearchLink } from './SearchLink';
import { ThemeSwitch } from './ThemeSwitch';

/**
 * Thanh trên — gói WBS 2.1.1, dựng lại theo bản thiết kế hi-fi ở đợt 8.
 *
 * Khối hộp + tên "Faculator", nút chuyển chế độ Cơ bản / Nâng cao (chỉ ở màn danh sách công
 * thức), nút đổi giao diện Sáng / Tối (chỉ ở màn PC), nút tìm kiếm, nút ngôn ngữ.
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
          <span className={styles.name}>
            <T k="app.brand" />
          </span>
        </Link>

        {/* Bốn mục điều hướng — chỉ hiện ở màn PC (≥1024px). Dưới khổ đó, BottomTabBar vẫn lo
            việc này ở đáy màn, đúng như trước; xem HeaderNav.module.css. */}
        <HeaderNav />

        <div className={styles.controls}>
          {/*
            Nút chế độ Cơ bản / Nâng cao — CHỈ hiện ở màn danh sách '/cong-thuc/'. Lý do và số
            đo nằm trong `showsModeToggle()`; ngắn gọn: ở những màn khác phần lớn lần bấm không
            đổi gì trong tầm mắt, nên nút dạy người dùng rằng nó hỏng. Các màn ấy vẫn đổi theo
            chế độ, lối vào là dòng `HiddenByLevelNote` đặt ngay cạnh chỗ bị giấu.
          */}
          <HeaderModeToggle />
          {/*
            Nút đổi giao diện, chỉ hiện từ 1024px trở lên — xem `.themeControl`. Đứng ngay cạnh
            nút chế độ vì cả hai là cùng một loại việc ("trang này bày ra như thế nào"), đúng thứ
            tự chúng đứng trong khối "Chế độ hiển thị" ở màn Cài đặt.
          */}
          <span className={styles.themeControl}>
            <ThemeSwitch />
          </span>
          <SearchLink />
          {/*
            Gắn lại từ đợt 8: hai điều kiện của quyết định đợt 14 (có bản dịch + luồng locale
            thông qua useT()) đều đã đạt, nút bấm là chữ trên màn đổi thật. Chữ chưa dịch —
            nội dung công thức, câu miễn trừ — vẫn hiện tiếng Việt, đúng lời `lang.enPartial`.
          */}
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
