'use client';

import Link from 'next/link';

import { ROUTES } from '@/application';
import { useT } from '@/application/preferences-context';

import styles from './SearchLink.module.css';

/**
 * Nút kính lúp ở thanh trên — lối vào màn tìm kiếm WF-09.
 *
 * Vì sao cần: từ đợt 11 ô tìm ở trang chủ lọc TẠI CHỖ chứ không điều hướng nữa, nên
 * `/tim-kiem/` mất sạch lối vào từ giao diện — chỉ gõ URL tay mới tới được. Đặt ở thanh trên
 * thì mọi màn đều với tới, kể cả màn chi tiết công thức và màn danh mục vốn không có ô tìm nào.
 *
 * Không trùng vai với ô tìm ở trang chủ: ô kia LỌC danh sách đang xem, nút này mở màn TÌM có
 * chip tìm gần đây và khối danh mục hot. Đây cũng là lý do nó là biểu tượng chứ không phải một
 * ô nhập thứ hai — hai ô nhập trên cùng một màn mới là chỗ gây nhầm.
 *
 * Nhìn cao 32px cho khớp `ModeToggle` và `LangSwitch` đứng cạnh, vùng chạm thật vẫn 44px nhờ
 * lớp phủ `::after` (NFR-USA-01).
 *
 * Là client component từ đợt 8 (luồng locale): nhãn nằm trong thuộc tính `title` nên không
 * bọc lá `<T>` được.
 */
export function SearchLink() {
  const t = useT();

  return (
    <Link href={ROUTES.search} className={styles.link} title={t('search.label')}>
      <span className="visually-hidden">{t('search.label')}</span>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="M16.5 16.5 21 21" />
      </svg>
    </Link>
  );
}
