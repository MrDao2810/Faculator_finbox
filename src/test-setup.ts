/*
 * Chạy trước MỌI file test (`setupFiles` của vitest.config.ts). Từ 28/10/2026 từ điển tiếng Anh
 * nạp động ở trình duyệt; nạp sẵn ở đây để các ca dựng màn ở chế độ EN chạy đồng bộ như trước.
 */
import { loadLocale } from '@/application/i18n';

await loadLocale('en');
