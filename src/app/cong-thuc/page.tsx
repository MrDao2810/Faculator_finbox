import type { Metadata } from 'next';
import { Suspense } from 'react';

import { FORMULA_MODULES } from '@/application';

import { FormulaBrowser } from './FormulaBrowser';
import { StaticFormulaList } from './StaticFormulaList';

export const metadata: Metadata = {
  title: 'Công thức',
  description: `Danh sách ${String(FORMULA_MODULES.length)} công thức đầu tư chứng khoán và tài chính cá nhân, chia 12 nhóm.`,
};

/**
 * Màn WF-02 Danh sách công thức — gói WBS 3.1.2.
 *
 * Đây là URL CHÍNH DANH của danh sách: có trong `sitemap.xml`, cho lập chỉ mục, và trạng thái
 * lọc nằm trên URL nên chia sẻ được (FR-19). Màn tìm kiếm `/tim-kiem/` là giao diện nhập truy
 * vấn, cố ý đặt `noindex` để không trùng nội dung với trang này.
 */
export default function FormulaListPage() {
  /*
    KHÔNG có `<h1>` ở đây, và đó là cố ý.

    Tiêu đề "Công thức" nay do thanh trên dựng (`HeaderIdentity` + `headerTitleKey()`), theo bản
    thiết kế cũ mà chủ dự án chỉ vào: một hàng ở đầu màn, và hàng ấy nói tên MÀN chứ không nhắc
    lại tên ứng dụng. Trang vẫn đúng một `<h1>` — nó chỉ đổi chỗ, chứ không biến mất.

    Cũng bỏ luôn cái bọc `marginTop: --space-4`: nó sinh ra để tách phần thân khỏi `<h1>` ngay
    trên, mà nay không còn `<h1>` nào ở đây. Để lại thì thân màn tụt xuống thêm 16px không vì gì,
    cộng dồn với `padding-top: --space-5` mà `AppShell` đã cho.
  */
  return (
    /*
      Suspense bắt buộc với output: 'export' — bên trong có useSearchParams().
      Fallback KHÔNG được là null: nó chính là phần HTML tĩnh mà Google và người dùng
      chưa chạy xong JS nhìn thấy. Trước đợt 14 là null → trang rỗng với bộ máy tìm kiếm
      dù sitemap khai priority 0.9. `verify:static` gác chỗ này khỏi thụt lùi.
    */
    <Suspense fallback={<StaticFormulaList />}>
      <FormulaBrowser />
    </Suspense>
  );
}
