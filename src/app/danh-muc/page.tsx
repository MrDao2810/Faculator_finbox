import type { Metadata } from 'next';

import { t } from '@/application';
import { Card } from '@/ui/primitives';

export const metadata: Metadata = {
  title: 'Danh mục cá nhân',
  description: 'Danh mục nắm giữ lưu ngay trên thiết bị, không cần đăng nhập.',
};

/**
 * Màn danh mục cá nhân — khung tạm.
 * Gói WBS 3.4.1 dựng màn WF-06 thật: bốn thẻ chỉ số, danh sách nắm giữ kèm tỷ trọng.
 */
export default function PortfolioPage() {
  return (
    <>
      <h1>{t('page.portfolio.title')}</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
        {t('page.placeholder.portfolio')}
      </p>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Card eyebrow="Riêng tư">
          <p style={{ margin: 0, color: 'var(--color-muted)', fontSize: 'var(--text-sm)' }}>
            Dữ liệu danh mục chỉ nằm trên thiết bị của bạn, không gửi đi đâu (NFR-SEC-01, COM-03).
          </p>
        </Card>
      </div>
    </>
  );
}
