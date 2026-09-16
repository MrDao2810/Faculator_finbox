import styles from './AppHeader.module.css';
import { HeaderIdentity } from './HeaderIdentity';
import { HeaderNav } from './HeaderNav';
import { LangSwitch } from './LangSwitch';
import { ThemeSwitch } from './ThemeSwitch';

/**
 * Thanh trên — gói WBS 2.1.1, dựng lại theo bản thiết kế hi-fi ở đợt 8.
 *
 * Danh tính ở đầu thanh, nút đổi giao diện Sáng / Tối, nút ngôn ngữ. Dính trên khi cuộn để mấy nút
 * này luôn với tới được trên điện thoại.
 *
 * Cụm Cơ bản / Nâng cao KHÔNG còn ở đây từ 15/09/2026: nó từng chỉ hiện ở màn danh sách công thức
 * (`HeaderModeToggle` + `showsModeToggle()`), và khi trang chủ gộp vào màn ấy thì cụm nút dời xuống
 * hàng tiêu đề "Danh sách công thức", ngay cạnh con số nó làm đổi — xem `FormulaListScreen`.
 *
 * Danh tính KHÔNG cố định là tên sản phẩm nữa: ở màn có tên trong `headerTitleKey()`, khối hộp và
 * chữ "Faculator" nhường chỗ cho tên màn, và thân màn thôi dựng `<h1>` — chủ dự án chốt theo bản
 * thiết kế cũ, nơi thanh trên trả lời câu "tôi đang ở đâu" thay vì nhắc lại tên ứng dụng. Lý do
 * đầy đủ và cái giá của nó nằm ở `HeaderIdentity`.
 *
 * Tên rút còn "Faculator" chứ không phải "Faculator Finbox": ở 360px, tên đầy đủ cộng hai
 * cụm nút không đủ chỗ, và bản thiết kế cũng chỉ ghi một chữ. Tên đầy đủ vẫn là `app.name`,
 * dùng ở tiêu đề trang và metadata.
 */
export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/*
          Danh tính đầu thanh: tên sản phẩm ở phần lớn màn, TÊN MÀN ở những màn có trong bảng
          `headerTitleKey()`. Xem `HeaderIdentity` — ở đó `<h1>` chuyển hẳn lên thanh trên và thân
          màn thôi dựng tiêu đề.
        */}
        <HeaderIdentity />

        {/* Các mục điều hướng — chỉ hiện ở màn PC (≥1024px). Dưới khổ đó, BottomTabBar vẫn lo
            việc này ở đáy màn, đúng như trước; xem HeaderNav.module.css. */}
        <HeaderNav />

        <div className={styles.controls}>
          {/*
            Nút đổi giao diện — đứng ở đúng chỗ nút tìm kiếm từng đứng (đợt đổi icon tìm kiếm
            thành icon đổi theme). Nay hiện ở MỌI khổ màn: trước đây bị ẩn dưới 1024px vì thanh
            trên đã đủ ba điều khiển, nhưng bỏ nút tìm kiếm thì lại thừa đúng một chỗ trên điện
            thoại.
          */}
          <ThemeSwitch />
          {/*
            Gắn lại từ đợt 8: hai điều kiện của quyết định đợt 14 (có bản dịch + luồng locale
            thông qua useT()) đều đã đạt, nút bấm là chữ trên màn đổi thật. Từ điển nay đã đủ
            (`missingKeys('en')` rỗng) và nội dung công thức cũng đã dịch trọn dưới dạng
            `Bilingual`; mấy khối còn tiếng Việt là cố ý theo thiết kế — xem docblock đầu `en.ts`.
          */}
          <LangSwitch />
        </div>
      </div>
    </header>
  );
}
