'use client';

import { usePathname } from 'next/navigation';

import { headerHasScreenActions } from '@/application';

import styles from './AppHeader.module.css';
import { LangSwitch } from './LangSwitch';
import { ThemeSwitch } from './ThemeSwitch';

/**
 * Id của ô trống ở góc phải thanh trên, nơi một màn đặt nút của riêng nó qua `createPortal`.
 *
 * Màn đặt nút vào đây chứ không tự dựng một thanh thứ hai: thanh trên là thứ DÍNH khi cuộn, và icon
 * Tìm kiếm của màn Danh mục — cùng ô tìm nó mở ra ngay trên thanh — phải với tới được ở mọi độ cuộn,
 * đúng chỗ bản vẽ đặt chúng.
 */
export const HEADER_ACTIONS_ID = 'header-screen-actions';

/**
 * Cụm nút bên phải thanh trên: ô trống cho nút của màn, nút Sáng/Tối, nút ngôn ngữ.
 *
 * Tách khỏi `AppHeader` (server) vì phải biết đang ở màn nào. Ở màn có trong
 * `headerHasScreenActions()` (hiện chỉ `/danh-muc/`), dưới 1024px hai nút Sáng/Tối và ngôn ngữ ẨN để
 * nhường chỗ cho nút của màn — bản vẽ khổ điện thoại 14/10/2026 của chủ dự án không vẽ hai nút ấy, và
 * chủ dự án chốt người dùng đổi giao diện ở màn chính. Từ 1024px không đổi gì: màn ấy tự giấu nút của
 * nó, vì khổ PC đã có ô tìm và nút Làm mới ngay trong thân màn.
 *
 * Đọc đường dẫn bằng `usePathname()` như `HeaderIdentity`, nên HTML tĩnh của `/danh-muc/` đã mang sẵn
 * class ẩn: không có khoảnh khắc nào hai nút cũ hiện ra rồi mới biến mất sau hydrate. Nút của màn thì
 * vào SAU hydrate (cổng chỉ mở được khi đã có `document`), nên trước đó góc phải để trống — trống còn
 * hơn hiện nhầm hai nút rồi đổi.
 */
export function HeaderControls() {
  const pathname = usePathname();
  const nhuongCho = headerHasScreenActions(pathname);

  return (
    <div className={nhuongCho ? `${styles.controls} ${styles.controlsScreen}` : styles.controls}>
      <div id={HEADER_ACTIONS_ID} className={styles.screenActions} />
      {/*
        Nút đổi giao diện — đứng ở đúng chỗ nút tìm kiếm từng đứng (đợt đổi icon tìm kiếm thành icon
        đổi theme). Hiện ở MỌI khổ màn, trừ màn nhường chỗ ở khổ dưới 1024px (xem trên).
      */}
      <ThemeSwitch />
      {/*
        Gắn lại từ đợt 8: hai điều kiện của quyết định đợt 14 (có bản dịch + luồng locale thông qua
        useT()) đều đã đạt, nút bấm là chữ trên màn đổi thật. Từ điển nay đã đủ (`missingKeys('en')`
        rỗng) và nội dung công thức cũng đã dịch trọn dưới dạng `Bilingual`; mấy khối còn tiếng Việt
        là cố ý theo thiết kế — xem docblock đầu `en.ts`.
      */}
      <LangSwitch />
    </div>
  );
}
