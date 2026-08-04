import type { ReactNode } from 'react';

import { t } from '@/application';

import { AppHeader } from '../navigation/AppHeader';
import { BottomTabBar } from '../navigation/BottomTabBar';
import { DisclaimerBar } from '../navigation/DisclaimerBar';
import { OfflineBanner } from '../navigation/OfflineBanner';
import styles from './AppShell.module.css';

/**
 * Bộ khung ứng dụng — gói WBS 1.4.2.
 *
 * Thứ tự dọc cố định, không màn nào được đổi:
 *   thanh trên → banner ngoại tuyến → dải miễn trừ → nội dung → thanh điều hướng dưới.
 *
 * Dải miễn trừ đặt ở đây chứ không ở từng màn, để FR-24 và UI-04 không phụ thuộc việc
 * người viết màn có nhớ thêm hay không — cùng cách nghĩ với ok() giữ bất biến FR-06.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#noi-dung" className={styles.skipLink}>
        {t('nav.skipToContent')}
      </a>

      <AppHeader />
      <OfflineBanner />
      <DisclaimerBar />

      <main id="noi-dung" className={styles.content}>
        {children}
      </main>

      <BottomTabBar />
    </div>
  );
}
