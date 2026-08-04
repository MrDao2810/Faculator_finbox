import type { Metadata } from 'next';

import { MARKET_CONFIG, t } from '@/application';
import { Card } from '@/ui/primitives';

export const metadata: Metadata = {
  title: 'Cài đặt',
  description: 'Chế độ hiển thị, đơn vị và biểu phí, dữ liệu cục bộ, thông tin sản phẩm.',
};

/**
 * Màn cài đặt — khung tạm.
 * Gói WBS 3.6.1 dựng màn WF-13 thật: chế độ hiển thị, đơn vị & biểu phí,
 * khối dữ liệu cục bộ kèm nút xoá, khối về sản phẩm.
 */
export default function SettingsPage() {
  return (
    <>
      <h1>{t('page.settings.title')}</h1>
      <p style={{ color: 'var(--color-muted)', marginTop: 'var(--space-1)' }}>
        {t('page.placeholder.settings')}
      </p>

      <div style={{ marginTop: 'var(--space-5)' }}>
        <Card eyebrow="Biểu phí" title="Đã nạp từ MarketConfig">
          <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', fontSize: 'var(--text-sm)' }}>
            {MARKET_CONFIG.schedules.map((schedule) => (
              <li key={schedule.id}>
                {schedule.name}
                {schedule.id === MARKET_CONFIG.defaultScheduleId && ' — mặc định'}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
