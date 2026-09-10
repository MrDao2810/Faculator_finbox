'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  FORMULA_ORIGIN_KEY,
  ROUTES,
  backLinkFor,
  formulaPath,
  headerTitleKey,
  parseFormulaOrigin,
} from '@/application';
import type { FormulaOrigin } from '@/application';
import { useT } from '@/application/preferences-context';

import { BackLink } from './BackLink';
import { BrandMark } from './BrandMark';
import styles from './HeaderIdentity.module.css';

/**
 * Danh tính ở đầu thanh trên — BA dạng loại trừ nhau: nút QUAY LẠI, hoặc TÊN MÀN, hoặc TÊN SẢN
 * PHẨM. Không bao giờ hai cái cùng lúc.
 *
 * Chủ dự án chốt hai lượt, và lượt sau thêm hẳn một dạng:
 *
 *   · *"khi chuyển sang màn công thức thì logo và faculator sẽ được thay thế bằng Công thức. bên
 *     dưới sẽ không cần text công thức nữa"* → dạng TÊN MÀN.
 *   · *"khi từ bên ngoài vào xem chi tiết công thức… thay vì bên trên hiển thị icon và faculator
 *     thì đổi thành button back kèm chỉ dẫn về màn trước"* → dạng QUAY LẠI, cho mọi màn TRONG.
 *
 * Luật "màn nào dạng nào" nằm ở `backLinkFor()` và `headerTitleKey()` trong
 * `src/application/routes.ts`, cùng chỗ với `showsModeToggle()` và cùng lý do: đó là quyết định
 * về ĐƯỜNG DẪN, không phải về giao diện.
 *
 * Dạng QUAY LẠI KHÔNG dựng `<h1>` — màn trong tự có tiêu đề riêng trong thân (tên công thức, tên
 * bảng dữ liệu), và đó cũng là lý do việc bỏ `<BackLink>` khỏi thân màn đẩy được tiêu đề ấy lên.
 *
 * ── Vì sao là một client leaf riêng ──────────────────────────────────────────────────────────
 *
 * `AppHeader` là server component (không có `'use client'`) nên nó không gọi được
 * `usePathname()`. Đây đúng khuôn `HeaderNav` và `HeaderModeToggle` đã dựng: bọc phần cần biết
 * route vào một lá client, thanh trên giữ nguyên là server.
 *
 * ── `<h1>` chuyển CHỖ, không nhân đôi ────────────────────────────────────────────────────────
 *
 * Ở màn có tên trong bảng, `<h1>` nằm ở đây và thân màn thôi dựng tiêu đề. Để cả hai thì trang có
 * hai tiêu đề cấp một cùng nội dung, và trình đọc màn hình đọc tên màn hai lần liền nhau.
 *
 * Giá phải trả, ghi ra để người sau biết là đã cân: `<h1>` nay nằm NGOÀI `<main>`, nên người dùng
 * bấm link "Bỏ qua tới nội dung" sẽ nhảy qua nó. Chấp nhận được vì thanh trên đọc trước `<main>`
 * trong thứ tự tài liệu — họ đã nghe tên màn rồi mới nhảy.
 */
export function HeaderIdentity() {
  const t = useT();
  const pathname = usePathname();

  /*
   * Chuỗi truy vấn, đọc TRONG effect chứ không bằng `useSearchParams()`.
   *
   * Thanh trên nằm ở layout GỐC, nên `useSearchParams()` ở đây kéo `<Suspense>` vào layout và với
   * `output: 'export'` thì Next bỏ toàn bộ cây con khỏi HTML tĩnh — mất luôn MathML dựng sẵn của
   * cả 111 trang chi tiết, và `verify:static` đỏ ngay. Cùng cái bẫy `FormulaDetail` đã ghi cho
   * `?ma=`, chỉ khác là ở đây nó nổ trên mọi trang chứ không riêng một màn.
   *
   * Khởi tạo bằng chuỗi rỗng nên lượt render đầu ở máy khách khớp hệt HTML tĩnh. Hệ quả nhìn thấy
   * được, và nó chấp nhận được: mở thẳng `/du-lieu/?from=pe` thì nút hiện "Danh sách công thức"
   * một nhịp rồi mới thành "Quay lại công thức". Chính `BackLink` cũng nâng cấp `href` của nó
   * đúng theo lối này (đọc `sessionStorage` trong effect), nên đây là một nhịp chứ không phải hai.
   */
  const [search, setSearch] = useState('');

  /*
   * Tên công thức vừa mở bảng dữ liệu — CHỮ cho nút quay lại, không phải đích của nó.
   *
   * Đích đã do `?from=` quyết định; bản ghi này chỉ để nút gọi đúng tên thay vì nói trống không
   * "Quay lại công thức". Vì sao phải đi vòng qua `sessionStorage` thay vì tra thẳng Registry: xem
   * docblock `formula-origin.ts` — thanh trên nằm ở layout gốc, kéo chỉ mục 111 công thức vào đây
   * là kéo vào gói của MỌI trang.
   */
  const [fromFormula, setFromFormula] = useState<FormulaOrigin | null>(null);

  useEffect(() => {
    setSearch(window.location.search);
    try {
      setFromFormula(parseFormulaOrigin(window.sessionStorage.getItem(FORMULA_ORIGIN_KEY)));
    } catch {
      // Trình duyệt chặn sessionStorage — nút quay lại lùi về nhãn chung, đường đi không đổi.
      setFromFormula(null);
    }
  }, [pathname]);

  /*
   * Hỏi "có phải màn trong không" TRƯỚC: ba dạng danh tính loại trừ nhau, và một màn trong thì
   * không bao giờ nên bày tên sản phẩm — đường ra mới là thứ nó cần ở hàng dính trên.
   */
  const back = backLinkFor(pathname, search);
  if (back !== null) {
    /*
     * Đối chiếu bằng ĐÍCH chứ không bằng `?from=`: bản ghi chỉ được dùng khi nó gọi tên đúng nơi
     * cái link này sắp dẫn tới. Người dùng mở bảng từ `pe`, quay ra, rồi mở lại từ `roe` — bản ghi
     * cũ còn nằm đó, và phép so này là thứ chặn nó dán tên "P/E" lên đường về `roe`.
     */
    const label =
      fromFormula !== null && formulaPath(fromFormula.id) === back.fallbackHref
        ? fromFormula.name
        : undefined;

    return (
      <BackLink
        fallbackHref={back.fallbackHref}
        labelKey={back.labelKey}
        rememberOrigin={back.rememberOrigin}
        label={label}
      />
    );
  }

  const titleKey = headerTitleKey(pathname);
  if (titleKey !== null) {
    return <h1 className={styles.screenTitle}>{t(titleKey)}</h1>;
  }

  return (
    <Link href={ROUTES.home} className={styles.brand}>
      <BrandMark />
      <span className={styles.name}>{t('app.brand')}</span>
    </Link>
  );
}
