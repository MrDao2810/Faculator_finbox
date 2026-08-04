import type { Metadata } from 'next';
import { Suspense } from 'react';

import { t } from '@/application';

import { FormulaBrowser } from './FormulaBrowser';

export const metadata: Metadata = {
  title: 'Công thức',
  description: 'Danh sách 107 công thức đầu tư chứng khoán và tài chính cá nhân, chia 12 nhóm.',
};

/**
 * Màn danh sách công thức — WF-02.
 * Gói WBS 2.2 lắp ô tìm kiếm, bộ lọc và thẻ công thức; gói 3.1.2 dựng nốt phần còn lại
 * (đếm kết quả theo nhóm, ảo hoá danh sách 107 mục).
 */
export default function FormulaListPage() {
  return (
    <>
      <h1>{t('page.formulas.title')}</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
        {t('page.placeholder.formulas')}
      </p>

      <div style={{ marginTop: 'var(--space-5)' }}>
        {/* Bắt buộc với output: 'export' — bên trong có useSearchParams(). */}
        <Suspense fallback={null}>
          <FormulaBrowser />
        </Suspense>
      </div>
    </>
  );
}
