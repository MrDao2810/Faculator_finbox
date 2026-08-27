import type { ReactNode } from 'react';

import { T } from '../i18n/T';
import { AppHeader } from '../navigation/AppHeader';
import { BottomTabBar } from '../navigation/BottomTabBar';
import { DisclaimerBar } from '../navigation/DisclaimerBar';
import { OfflineBanner } from '../navigation/OfflineBanner';
import styles from './AppShell.module.css';
import { OriginTracker } from './OriginTracker';
import { ServiceWorker } from './ServiceWorker';

/**
 * Bộ khung ứng dụng — gói WBS 1.4.2, đổi thứ tự theo bản thiết kế hi-fi ở đợt 8.
 *
 * Thứ tự dọc cố định, không màn nào được đổi:
 *   banner ngoại tuyến → thanh trên → nội dung → dải miễn trừ → thanh điều hướng dưới.
 *
 * Dải miễn trừ **vẫn đặt ở đây** chứ không ở từng màn, chỉ đổi chỗ từ đầu màn xuống chân
 * trang: FR-24 và UI-04 không được phụ thuộc việc người viết màn có nhớ thêm hay không —
 * cùng cách nghĩ với ok() giữ bất biến FR-06. Chủ dự án chốt đưa nó xuống chân trang để
 * phần đầu màn giống bản thiết kế.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <a href="#noi-dung" className={styles.skipLink}>
        <T k="nav.skipToContent" />
      </a>

      <OfflineBanner />
      <AppHeader />

      <main id="noi-dung" className={styles.content}>
        {children}
      </main>

      <DisclaimerBar />
      <BottomTabBar />

      {/* Hai đảo dưới đây không dựng ra gì, chỉ chạy effect — đặt ở đây để phủ mọi màn. */}

      {/* Đăng ký service worker cho phần chạy ngoại tuyến (NFR-REL-02). */}
      <ServiceWorker />

      {/* Nhớ màn vừa rời đi và chỗ đang đứng, để nút quay lại về đúng chỗ đó. */}
      <OriginTracker />
    </div>
  );
}
