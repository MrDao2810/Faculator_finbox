import type { Metadata } from 'next';
import { Suspense } from 'react';

import { t } from '@/application';

import { FormulaBrowser } from './FormulaBrowser';
import { StaticFormulaList } from './StaticFormulaList';

export const metadata: Metadata = {
  title: 'Công thức',
  description: 'Danh sách 107 công thức đầu tư chứng khoán và tài chính cá nhân, chia 12 nhóm.',
};

/**
 * Màn WF-02 Danh sách công thức — gói WBS 3.1.2.
 *
 * Đây là URL CHÍNH DANH của danh sách: có trong `sitemap.xml`, cho lập chỉ mục, và trạng thái
 * lọc nằm trên URL nên chia sẻ được (FR-19). Màn tìm kiếm `/tim-kiem/` là giao diện nhập truy
 * vấn, cố ý đặt `noindex` để không trùng nội dung với trang này.
 */
export default function FormulaListPage() {
  return (
    <>
      <h1>{t('page.formulas.title')}</h1>

      <div style={{ marginTop: 'var(--space-4)' }}>
        {/*
          Suspense bắt buộc với output: 'export' — bên trong có useSearchParams().
          Fallback KHÔNG được là null: nó chính là phần HTML tĩnh mà Google và người dùng
          chưa chạy xong JS nhìn thấy. Trước đợt 14 là null → trang rỗng với bộ máy tìm kiếm
          dù sitemap khai priority 0.9. `verify:static` gác chỗ này khỏi thụt lùi.
        */}
        <Suspense fallback={<StaticFormulaList />}>
          <FormulaBrowser />
        </Suspense>
      </div>
    </>
  );
}
